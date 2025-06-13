// app/api/transactions/stats/route.js
import { db } from '@/app/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const transactionsRef = collection(db, 'transactions');
    let q;

    if (userId) {
      // Query for specific user's orders
      q = query(
        transactionsRef,
        where('customerInfo.userId', '==', userId),
        orderBy('orderDate', 'desc')
      );
    } else {
      // Admin query - get all orders
      q = query(transactionsRef, orderBy('orderDate', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      orderDate: doc.data().orderDate?.toDate?.() || 
                doc.data().createdAt?.toDate?.() || 
                new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to fetch transactions'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const transactionData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending',
      adminProcessed: false,
      adminProcessedAt: null,
      adminNotes: ''
    };

    const docRef = await addDoc(collection(db, 'transactions'), transactionData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Order created successfully',
      orderNumber: transactionData.orderNumber,
      orderId: docRef.id
    }), { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to create order'
    }), { status: 500 });
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