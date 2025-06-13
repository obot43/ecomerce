'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function LaporanPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    kasir: '',
    period: 'daily',
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await axios.get(`/api/transactions?${params.toString()}`);
      setStats(res.data);
    } catch (err) {
      console.error('Gagal ambil data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStats();
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 print:px-0 print:py-0">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 print:hidden">📊 Laporan Transaksi</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:hidden">
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleInputChange}
          className="border px-3 py-2 rounded-md w-full"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleInputChange}
          className="border px-3 py-2 rounded-md w-full"
        />
        <input
          type="text"
          name="kasir"
          value={filters.kasir}
          onChange={handleInputChange}
          placeholder="Nama kasir"
          className="border px-3 py-2 rounded-md w-full"
        />
        <select
          name="period"
          value={filters.period}
          onChange={handleInputChange}
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="daily">Harian</option>
          <option value="weekly">Mingguan</option>
          <option value="monthly">Bulanan</option>
        </select>
        <button
          type="submit"
          className="col-span-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Tampilkan Laporan
        </button>
      </form>

      {loading && <p className="text-center text-gray-500">Memuat data...</p>}

      {stats?.success ? (
        <div id="laporan" className="bg-white shadow rounded-lg p-6 space-y-6 text-sm text-gray-800 print:text-black print:shadow-none print:bg-white">

          <div className="flex justify-between">
            <div>
              <p><strong>Periode:</strong> {filters.startDate || '-'} s.d. {filters.endDate || '-'}</p>
              <p><strong>Kasir:</strong> {filters.kasir || 'Semua'}</p>
              <p><strong>Periode Tipe:</strong> {filters.period}</p>
            </div>
            <div className="text-right">
              <p><strong>Dicetak:</strong> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <hr className="my-2 border-gray-300" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-md shadow-sm print:shadow-none">
              <p className="text-gray-500">Total Transaksi</p>
              <p className="text-lg font-semibold">{stats.totalTransactions}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md shadow-sm print:shadow-none">
              <p className="text-gray-500">Pendapatan</p>
              <p className="text-lg font-semibold">Rp {stats.stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md shadow-sm print:shadow-none">
              <p className="text-gray-500">Barang Terjual</p>
              <p className="text-lg font-semibold">{stats.stats.totalItems}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md shadow-sm print:shadow-none">
              <p className="text-gray-500">Rata-rata Transaksi</p>
              <p className="text-lg font-semibold">Rp {stats.stats.averageTransactionValue.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-base mt-4 mb-2">Metode Pembayaran</h2>
            <ul className="list-disc pl-6">
              {Object.entries(stats.stats.paymentMethodBreakdown).map(([method, count]) => (
                <li key={method}>{method === 'cash' ? 'Tunai' : method.toUpperCase()}: {count} transaksi</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base mt-4 mb-2">Produk Terlaris</h2>
            <table className="w-full border text-left">
              <thead className="bg-gray-100 print:bg-gray-200">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Nama Produk</th>
                  <th className="p-2 border">Jumlah Terjual</th>
                  <th className="p-2 border">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.stats.topProducts.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{p.name}</td>
                    <td className="p-2 border">{p.totalQuantity}</td>
                    <td className="p-2 border">Rp {p.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        !loading && <p className="text-center text-gray-500">Tidak ada data untuk ditampilkan.</p>
      )}

      {stats?.success && (
        <div className="print:hidden mt-6 flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition"
          >
            Cetak Laporan
          </button>
        </div>
      )}
    </div>
  );
}
