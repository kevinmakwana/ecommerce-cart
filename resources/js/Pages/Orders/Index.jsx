import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import PrimaryButton from '@/components/PrimaryButton';

export default function Index({ auth, orders, isAdmin }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">
                {isAdmin ? 'All Orders' : 'My Orders'}
            </h2>}
        >
            <Head title="Orders" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isAdmin ? 'All Orders' : 'Your Orders'}
                        </h1>
                        {!isAdmin && (
                            <Link href="/products">
                                <PrimaryButton type="button">
                                    🛍️ Continue Shopping
                                </PrimaryButton>
                            </Link>
                        )}
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">
                                    {isAdmin ? 'No orders have been placed yet.' : 'You haven\'t placed any orders yet.'}
                                </p>
                                {!isAdmin && (
                                    <Link href="/products">
                                        <PrimaryButton type="button">
                                            🛍️ Start Shopping
                                        </PrimaryButton>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Order #{order.id}
                                                </h3>
                                                {isAdmin && (
                                                    <p className="text-sm text-gray-600">
                                                        Customer: {order.user.name} ({order.user.email})
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-indigo-600">
                                                    ${parseFloat(order.total_amount).toFixed(2)}
                                                </p>
                                                <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold text-gray-700 mb-3">Order Items:</h4>
                                            <div className="space-y-2">
                                                {order.order_items.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {item.product.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <p className="font-semibold text-gray-900">
                                                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
