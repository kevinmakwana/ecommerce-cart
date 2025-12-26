import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ order }) {
    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Order Details - {order.order_number}
                    </h2>
                    <Link
                        href={route('admin.orders.index')}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Back to Orders
                    </Link>
                </div>
            }
        >
            <Head title={`Order ${order.order_number}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Order Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Header */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                Order {order.order_number}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                                                {new Date(order.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                                    <div className="space-y-4">
                                        {order.order_items && order.order_items.length > 0 ? (
                                            order.order_items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                                                        <p className="text-sm text-gray-600">
                                                            Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">
                                                            ${parseFloat(item.total_price).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No items found</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold text-lg">
                                            <span>Total:</span>
                                            <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Customer Information */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Name:</span>
                                            <p className="text-gray-900">{order.user.name}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Email:</span>
                                            <p className="text-gray-900">{order.user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
