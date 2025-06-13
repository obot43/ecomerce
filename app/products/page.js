'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  MagnifyingGlassIcon, 
  ShoppingBagIcon, 
  PlusIcon, 
  MinusIcon, 
  XMarkIcon,
  QrCodeIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

export default function ProductsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('semua');

    // Payment states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cashAmount, setCashAmount] = useState('');
    const [change, setChange] = useState(0);
    const [qrisImage, setQrisImage] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Updated categories with modern icons
    const categories = [
        { id: 'semua', name: 'Semua', icon: '🛍️', color: 'from-blue-500 to-indigo-500' },
        { id: 'elektronik', name: 'Elektronik', icon: '📱', color: 'from-purple-500 to-pink-500' },
        { id: 'fashion', name: 'Fashion', icon: '👕', color: 'from-rose-500 to-red-500' },
        { id: 'aksesoris', name: 'Aksesoris', icon: '⌚', color: 'from-amber-500 to-orange-500' },
        { id: 'rumah', name: 'Rumah', icon: '🏠', color: 'from-emerald-500 to-teal-500' }
    ];

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    // Handle search and category filtering
    useEffect(() => {
        let filtered = products;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.nama.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== 'semua') {
            filtered = filtered.filter(product => {
                const productCategory = product.kategori ? product.kategori.toLowerCase() : '';
                return productCategory.includes(selectedCategory);
            });
        }

        setFilteredProducts(filtered);
    }, [searchTerm, products, selectedCategory]);

    // Add to cart
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    // Update quantity in cart
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity === 0) {
            removeFromCart(productId);
            return;
        }

        setCart(cart.map(item =>
            item.id === productId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    // Update total whenever cart changes
    useEffect(() => {
        const sum = cart.reduce((acc, item) => acc + (item.harga * item.quantity), 0);
        setTotal(sum);
    }, [cart]);

    // Remove from cart
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    // Clear cart
    const clearCart = () => {
        setCart([]);
    };

    // Get product count by category
    const getProductCountByCategory = (categoryId) => {
        if (categoryId === 'semua') return products.length;
        return products.filter(product => {
            const productCategory = product.kategori ? product.kategori.toLowerCase() : '';
            return productCategory.includes(categoryId);
        }).length;
    };

    // Generate QRIS image (simulated)
    const generateQRIS = async (amount) => {
        // Simulasi generate QRIS - dalam implementasi nyata, ini akan memanggil API QRIS
        // Untuk demo, kita gunakan placeholder atau gambar QRIS dummy
        const qrisData = `00020101021226660014ID.CO.QRIS.WWW0215ID2022040800000330303UME51440014ID.CO.TELKOM.WWW021801234567890123456789520454995303360540${amount}5802ID5909TOKO DEMO6007JAKARTA61051234062070703A0163040C79`;

        // Simulasi delay untuk generate QRIS
        return new Promise((resolve) => {
            setTimeout(() => {
                // Dalam implementasi nyata, ini akan return URL gambar QRIS yang sudah di-generate
                resolve(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrisData)}`);
            }, 1000);
        });
    };

    // Save transaction to database/local storage
    // Save transaction to database
    const saveTransactionToReport = async (orderData) => {
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...orderData,
                    status: 'pending', // Order needs admin confirmation
                    orderDate: new Date().toISOString(),
                    orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    customerInfo: {
                        userId: user?.id,
                        name: user?.fullName || user?.username,
                        email: user?.email,
                        address: user?.address
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error saving order:', error);
            throw error;
        }
    };

    // Example: Fetch transactions for reports
    const fetchTransactions = async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add filters
            if (filters.kasir) queryParams.append('kasir', filters.kasir);
            if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.pageSize) queryParams.append('pageSize', filters.pageSize);

            const response = await fetch(`/api/transactions?${queryParams}`);

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error fetching transactions:', error);

            // Fallback: get from localStorage
            try {
                const localTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                return {
                    success: true,
                    transactions: localTransactions,
                    pagination: {
                        currentPage: 1,
                        pageSize: localTransactions.length,
                        totalCount: localTransactions.length,
                        totalPages: 1,
                        hasNext: false,
                        hasPrev: false
                    }
                };
            } catch (localError) {
                console.error('Error fetching from localStorage:', localError);
                throw error;
            }
        }
    };

    // Example: Fetch statistics
    const fetchTransactionStats = async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);
            if (filters.kasir) queryParams.append('kasir', filters.kasir);
            if (filters.period) queryParams.append('period', filters.period);

            const response = await fetch(`/api/transactions/stats?${queryParams}`);

            if (!response.ok) {
                throw new Error('Failed to fetch statistics');
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    };

    // Handle payment method selection
    const handlePayment = async (method) => {
        setPaymentMethod(method);
        setIsProcessingPayment(true);

        if (method === 'qris') {
            try {
                // Generate QRIS image
                const qrisImageUrl = await generateQRIS(total);
                setQrisImage(qrisImageUrl);
            } catch (error) {
                console.error('Error generating QRIS:', error);
                alert('Gagal membuat QRIS. Silakan coba lagi.');
                setPaymentMethod('');
            }
        } else {
            // For cash, we need to input amount
            setCashAmount('');
            setChange(0);
        }

        setIsProcessingPayment(false);
    };

    // Calculate change when cash amount changes
    useEffect(() => {
        if (paymentMethod === 'tunai' && cashAmount) {
            const cash = parseInt(cashAmount) || 0;
            const changeAmount = cash - total;
            setChange(changeAmount);
        }
    }, [cashAmount, total, paymentMethod]);

    // Process payment
    const processPayment = async () => {
        try {
            const orderData = {
                items: cart.map(item => ({
                    id: item.id,
                    name: item.nama,
                    price: item.harga,
                    quantity: item.quantity,
                    subtotal: item.harga * item.quantity
                })),
                totalAmount: total,
                paymentMethod: paymentMethod,
                paymentStatus: 'pending',
                orderStatus: 'pending',
                paymentDetails: paymentMethod === 'tunai' ? {
                    cashAmount: parseInt(cashAmount),
                    changeAmount: change
                } : {
                    qrisReference: Date.now().toString()
                }
            };

            const result = await saveTransactionToReport(orderData);
            
            alert(`
                Pesanan berhasil dibuat!
                Nomor Order: ${result.orderNumber}
                Total: Rp ${total.toLocaleString('id-ID')}
                Status: Menunggu konfirmasi admin
                
                Silakan pantau status pesanan Anda di halaman Pesanan Saya.
            `);

            // Reset cart and payment state
            resetPaymentState();
            router.push('/orders'); // Using the new router
        } catch (error) {
            console.error('Error processing order:', error);
            alert('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.');
        }
    };

    // Reset payment state
    const resetPaymentState = () => {
        setCart([]);
        setShowPaymentModal(false);
        setPaymentMethod('');
        setCashAmount('');
        setChange(0);
        setQrisImage('');
        setIsProcessingPayment(false);
    };

    // Handle cash payment submit
    const handleCashPayment = () => {
        const cash = parseInt(cashAmount) || 0;
        if (cash < total) {
            alert('Jumlah uang tidak mencukupi!');
            return;
        }
        processPayment();
    };

    // Handle cancel payment
    const handleCancelPayment = () => {
        setPaymentMethod('');
        setCashAmount('');
        setChange(0);
        setQrisImage('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Products Section */}
                    <div className="lg:col-span-8">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari produk..."
                                    className="w-full px-6 py-4 pl-14 rounded-2xl border-none bg-white shadow-lg focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 absolute left-4 top-4" />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-8 overflow-x-auto">
                            <div className="flex space-x-4 pb-2">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200
                                            ${selectedCategory === category.id
                                                ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                                                : 'bg-white text-gray-700 hover:shadow-md'
                                            }`}
                                    >
                                        <span className="text-xl">{category.icon}</span>
                                        <span className="font-medium whitespace-nowrap">{category.name}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs
                                            ${selectedCategory === category.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {getProductCountByCategory(category.id)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                                        onClick={() => addToCart(product)}
                                    >
                                        <div className="relative aspect-square">
                                            <Image
                                                src={product.gambar || '/placeholder-product.png'}
                                                alt={product.nama}
                                                fill
                                                className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <p className="text-sm font-medium truncate">{product.nama}</p>
                                                <p className="text-lg font-bold">
                                                    Rp {parseInt(product.harga).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full">
                                                {product.kategori || 'Umum'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16">
                                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                                    <p className="text-gray-600 text-xl font-medium">Tidak ada produk ditemukan</p>
                                    <p className="text-gray-400">Coba ubah kata kunci pencarian atau kategori</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Section */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Keranjang</h2>
                                {cart.length > 0 && (
                                    <button
                                        onClick={clearCart}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        Hapus Semua
                                    </button>
                                )}
                            </div>

                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-300 text-4xl mb-2">🛒</div>
                                    <p className="text-gray-500">Keranjang masih kosong</p>
                                    <p className="text-gray-400 text-sm">Pilih produk untuk mulai berbelanja</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-sm text-gray-800">{item.nama}</h3>
                                                    <p className="text-xs text-gray-600">
                                                        Rp {parseInt(item.harga).toLocaleString('id-ID')} / item
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-6 h-6 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-6 h-6 rounded-full bg-green-500 text-white text-xs hover:bg-green-600 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-500 hover:text-red-700 ml-2"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-lg font-bold text-gray-800">Total:</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                Rp {total.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <button
                                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium shadow-md"
                                            onClick={() => setShowPaymentModal(true)}
                                        >
                                            Checkout ({cart.length} item)
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal with updated styling */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Pilih Metode Pembayaran</h2>

                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold mb-2">Ringkasan Pesanan:</h3>
                            <div className="space-y-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span>{item.nama} x{item.quantity}</span>
                                        <span>Rp {(item.harga * item.quantity).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                                <span>Total:</span>
                                <span className="text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        {!paymentMethod ? (
                            // Payment Method Selection
                            <div className="space-y-4">
                                <button
                                    onClick={() => handlePayment('qris')}
                                    disabled={isProcessingPayment}
                                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50"
                                >
                                    <div className="text-2xl">📱</div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">QRIS</div>
                                        <div className="text-sm text-gray-600">Bayar dengan scan QR Code</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handlePayment('tunai')}
                                    disabled={isProcessingPayment}
                                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50"
                                >
                                    <div className="text-2xl">💵</div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">Tunai</div>
                                        <div className="text-sm text-gray-600">Bayar dengan uang tunai</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="w-full mt-4 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        ) : paymentMethod === 'qris' ? (
                            // QRIS Payment
                            <div className="text-center">
                                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                                    <div className="text-lg font-semibold mb-4">Scan QR Code untuk Pembayaran</div>

                                    {isProcessingPayment ? (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                            <div className="text-sm text-gray-600">Membuat QR Code...</div>
                                        </div>
                                    ) : qrisImage ? (
                                        <div className="flex flex-col items-center">
                                            <img
                                                src={qrisImage}
                                                alt="QRIS Payment Code"
                                                className="w-48 h-48 border-2 border-gray-300 rounded-lg mb-4"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div className="hidden text-4xl mb-2">⬜</div>
                                            <div className="text-sm text-gray-600 mb-4">
                                                Gunakan aplikasi mobile banking atau e-wallet untuk scan
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                                            <div className="text-4xl mb-2">⬜</div>
                                            <div className="text-xs text-gray-500">Gagal memuat QR Code</div>
                                        </div>
                                    )}

                                    <div className="text-lg font-bold text-blue-600">
                                        Rp {total.toLocaleString('id-ID')}
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCancelPayment}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        onClick={processPayment}
                                        disabled={!qrisImage}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${qrisImage
                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Konfirmasi Bayar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Cash Payment
                            <div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jumlah Uang Diterima
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-gray-500">Rp</span>
                                        <input
                                            type="number"
                                            value={cashAmount}
                                            onChange={(e) => setCashAmount(e.target.value)}
                                            placeholder="0"
                                            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Quick Amount Buttons */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[total, 50000, 100000, 150000, 200000, 500000].map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setCashAmount(amount.toString())}
                                            className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        >
                                            {amount.toLocaleString()}
                                        </button>
                                    ))}
                                </div>

                                {/* Change Display */}
                                {cashAmount && (
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Total Belanja:</span>
                                            <span>Rp {total.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Uang Diterima:</span>
                                            <span>Rp {parseInt(cashAmount || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className={`flex justify-between font-bold text-lg ${change >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            <span>Kembalian:</span>
                                            <span>{change >= 0 ? 'Rp ' : '-Rp '}{Math.abs(change).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCancelPayment}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        onClick={handleCashPayment}
                                        disabled={!cashAmount || change < 0}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${cashAmount && change >= 0
                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Proses Bayar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}