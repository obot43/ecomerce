"use client";
import { 
  ShoppingBagIcon, TagIcon, TruckIcon, ShieldCheckIcon, CreditCardIcon,
  UserGroupIcon, SparklesIcon, FireIcon, BoltIcon, StarIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: "Belanja Mudah",
      description: "Temukan berbagai produk dengan mudah dan cepat.",
      icon: ShoppingBagIcon,
    },
    {
      title: "Harga Terbaik",
      description: "Dapatkan harga kompetitif dan penawaran menarik setiap hari.",
      icon: TagIcon,
    },
    {
      title: "Pengiriman Express",
      description: "Pengiriman cepat ke seluruh Indonesia.",
      icon: TruckIcon,
    },
  ];

  const stats = [
    { number: "1M+", label: "Pelanggan Aktif" },
    { number: "100K+", label: "Produk Tersedia" },
    { number: "4.9/5", label: "Rating Pelanggan" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Modern Design */}
      <div className="relative bg-gradient-to-br from-teal-50 to-cyan-50 overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Belanja Online Jadi
                <span className="text-teal-600"> Lebih Mudah</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                Platform belanja online terpercaya dengan ribuan produk dan penawaran menarik setiap hari.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center px-8 py-3 rounded-full bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
                >
                  Mulai Belanja
                  <ShoppingBagIcon className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center px-8 py-3 rounded-full border-2 border-gray-200 text-gray-600 font-medium hover:border-teal-600 hover:text-teal-600 transition-colors"
                >
                  Lihat Kategori
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square relative">
                <Image
                  src="/shoping.jpg"
                  alt="Shopping Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Fresh Design */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kenapa JualanOnline?</h2>
            <p className="text-lg text-gray-600">Platform belanja online terpercaya pilihan masyarakat Indonesia</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-teal-100 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section with Modern Look */}
      <div className="bg-teal-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-white shadow-sm">
                <div className="text-4xl font-bold text-teal-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}