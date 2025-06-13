'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

// Status badge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch orders from API endpoint
        const response = await fetch(`/api/transactions?userId=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch orders');
        }

        if (data.success && data.transactions) {
          // Transform and validate the data
          const processedOrders = data.transactions.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber || `ORD-${order.id.slice(-6)}`,
            orderDate: order.orderDate || order.createdAt,
            orderStatus: order.orderStatus || 'pending',
            items: (order.items || []).map(item => ({
              name: item.name || item.nama,
              price: parseFloat(item.price || item.harga || 0),
              quantity: parseInt(item.quantity || 1),
              subtotal: parseFloat(item.subtotal || (item.price * item.quantity) || 0)
            })),
            totalAmount: parseFloat(order.totalAmount || order.total || 0),
            paymentMethod: order.paymentMethod || 'tunai',
            paymentStatus: order.paymentStatus || 'pending',
            customerInfo: order.customerInfo || {
              userId: user.id,
              name: user.fullName || user.username,
              email: user.email
            }
          }));

          setOrders(processedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Gagal mengambil data pesanan. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow">
            <p className="font-semibold">Terjadi kesalahan</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pesanan Saya</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <StatusBadge status={order.orderStatus} />
                  </div>

                  <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                    <ul className="divide-y divide-gray-200">
                      {order.items.map((item, index) => (
                        <li key={index} className="py-3 flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.quantity}x @ Rp {item.price.toLocaleString('id-ID')}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            Rp {item.subtotal.toLocaleString('id-ID')}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Metode Pembayaran</p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.paymentMethod === 'tunai' ? 'Tunai' : 'QRIS'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Pembayaran</p>
                        <p className="text-lg font-semibold text-gray-900">
                          Rp {order.totalAmount.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}