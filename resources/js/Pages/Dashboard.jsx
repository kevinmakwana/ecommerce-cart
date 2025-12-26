import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/components/PrimaryButton';

export default function Dashboard({ 
    isAdmin, 
    todayOrders = [], 
    totalSalesToday = 0, 
    totalOrdersToday = 0, 
    lowStockProducts = [], 
    totalProducts = 0,
    productSales = [],
    recentOrders = []
}) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {isAdmin ? (
                        <>
                            {/* Admin Dashboard */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Today's Sales</h3>
                                    <p className="text-3xl font-bold text-green-600">
                                        ${parseFloat(totalSalesToday).toFixed(2)}
                                    </p>
                                </div>
                                
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Today's Orders</h3>
                                    <p className="text-3xl font-bold text-indigo-600">
                                        {totalOrdersToday}
                                    </p>
                                </div>

                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Low Stock Items</h3>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {lowStockProducts.length}
                                    </p>
                                </div>

                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Products</h3>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {totalProducts}
                                    </p>
                                </div>
                            </div>

                            {/* Today's Product Sales */}
                            {productSales.length > 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Best Sellers</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {productSales.slice(0, 5).map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {item.product.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {item.quantity} units
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                            ${parseFloat(item.revenue).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <Link href={route('admin.sales.index')}>
                                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                                View Full Sales Report →
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Recent Orders */}
                            {todayOrders.length > 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">Today's Recent Orders</h3>
                                        <Link href={route('admin.orders.index')}>
                                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                                View All Orders →
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {todayOrders.slice(0, 5).map((order) => (
                                            <div key={order.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Order #{order.id}</p>
                                                        <p className="text-sm text-gray-600">Customer: {order.user.name}</p>
                                                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                                                    </div>
                                                    <p className="text-lg font-bold text-green-600">
                                                        ${parseFloat(order.total_amount).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {todayOrders.length === 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <p className="text-center text-gray-500 py-8">No sales today yet</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* User Dashboard */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Welcome back!</h3>
                                <p className="text-gray-600 mb-6">Start shopping or check your orders.</p>
                                
                                <div className="flex gap-4">
                                    <Link href="/products">
                                        <PrimaryButton>
                                            🛍️ Browse Products
                                        </PrimaryButton>
                                    </Link>
                                    <Link href="/orders">
                                        <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                            📦 My Orders
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            {recentOrders.length > 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">Your Recent Orders</h3>
                                        <Link href="/orders">
                                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                                View All →
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {recentOrders.map((order) => (
                                            <div key={order.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Order #{order.id}</p>
                                                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {order.order_items.length} item(s)
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-green-600">
                                                            ${parseFloat(order.total_amount).toFixed(2)}
                                                        </p>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                            order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
