// pages/api/transactions/stats.js
import { db } from '@/app/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    startDate, 
    endDate, 
    kasir,
    period = 'daily' // daily, weekly, monthly, yearly
  } = req.query;

  try {
    const transactionsRef = collection(db, 'transactions');
    let q = query(transactionsRef, orderBy('timestamp', 'desc'));

    // Apply date filter
    if (startDate) {
      const startTimestamp = Timestamp.fromDate(new Date(startDate));
      q = query(q, where('timestamp', '>=', startTimestamp));
    }
    if (endDate) {
      const endTimestamp = Timestamp.fromDate(new Date(endDate + 'T23:59:59'));
      q = query(q, where('timestamp', '<=', endTimestamp));
    }
    if (kasir) {
      q = query(q, where('kasir', '==', kasir));
    }

    const querySnapshot = await getDocs(q);
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp)
      });
    });

    // Calculate statistics
    const stats = calculateTransactionStats(transactions, period);

    res.status(200).json({
      success: true,
      stats,
      totalTransactions: transactions.length,
      period,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });

  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
}

function calculateTransactionStats(transactions, period) {
  if (transactions.length === 0) {
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      averageTransactionValue: 0,
      totalItems: 0,
      paymentMethodBreakdown: {},
      topProducts: [],
      dailyRevenue: [],
      hourlyDistribution: [],
      kasirPerformance: []
    };
  }

  // Basic statistics
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalTransactions = transactions.length;
  const averageTransactionValue = totalRevenue / totalTransactions;
  const totalItems = transactions.reduce((sum, t) => sum + (t.totalItems || 0), 0);

  // Payment method breakdown
  const paymentMethodBreakdown = {};
  transactions.forEach(t => {
    const method = t.paymentMethod || 'unknown';
    paymentMethodBreakdown[method] = (paymentMethodBreakdown[method] || 0) + 1;
  });

  // Top products
  const productStats = {};
  transactions.forEach(t => {
    if (t.items && Array.isArray(t.items)) {
      t.items.forEach(item => {
        const productKey = item.nama || item.name || 'Unknown Product';
        if (!productStats[productKey]) {
          productStats[productKey] = {
            name: productKey,
            totalQuantity: 0,
            totalRevenue: 0,
            transactionCount: 0
          };
        }
        productStats[productKey].totalQuantity += item.quantity || 0;
        productStats[productKey].totalRevenue += item.subtotal || (item.harga * item.quantity) || 0;
        productStats[productKey].transactionCount += 1;
      });
    }
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  // Time-based analytics
  const timeStats = calculateTimeBasedStats(transactions, period);

  // Kasir performance
  const kasirStats = {};
  transactions.forEach(t => {
    const kasir = t.kasir || 'Unknown';
    if (!kasirStats[kasir]) {
      kasirStats[kasir] = {
        name: kasir,
        totalTransactions: 0,
        totalRevenue: 0,
        totalItems: 0
      };
    }
    kasirStats[kasir].totalTransactions += 1;
    kasirStats[kasir].totalRevenue += t.total || 0;
    kasirStats[kasir].totalItems += t.totalItems || 0;
  });

  const kasirPerformance = Object.values(kasirStats)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    totalRevenue,
    totalTransactions,
    averageTransactionValue,
    totalItems,
    paymentMethodBreakdown,
    topProducts,
    kasirPerformance,
    ...timeStats
  };
}

function calculateTimeBasedStats(transactions, period) {
  const dailyRevenue = {};
  const hourlyDistribution = Array(24).fill(0);
  const weeklyRevenue = {};
  const monthlyRevenue = {};

  transactions.forEach(t => {
    const date = new Date(t.timestamp);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const hour = date.getHours();
    const weekKey = getWeekKey(date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Daily revenue
    dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + (t.total || 0);

    // Hourly distribution
    hourlyDistribution[hour] += 1;

    // Weekly revenue
    weeklyRevenue[weekKey] = (weeklyRevenue[weekKey] || 0) + (t.total || 0);

    // Monthly revenue
    monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (t.total || 0);
  });

  // Convert to arrays and sort
  const dailyRevenueArray = Object.entries(dailyRevenue)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const weeklyRevenueArray = Object.entries(weeklyRevenue)
    .map(([week, revenue]) => ({ week, revenue }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const monthlyRevenueArray = Object.entries(monthlyRevenue)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const hourlyDistributionArray = hourlyDistribution.map((count, hour) => ({
    hour: `${hour}:00`,
    count
  }));

  return {
    dailyRevenue: dailyRevenueArray,
    weeklyRevenue: weeklyRevenueArray,
    monthlyRevenue: monthlyRevenueArray,
    hourlyDistribution: hourlyDistributionArray
  };
}

function getWeekKey(date) {
  const year = date.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const weekNumber = Math.ceil((((date - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}