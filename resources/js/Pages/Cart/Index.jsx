import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import PrimaryButton from '@/components/PrimaryButton';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Index({ auth, cartItems, total }) {
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [showNotification, setShowNotification] = useState(false);
    const { flash = {} } = usePage().props;

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        
        setUpdatingItems(prev => new Set(prev).add(itemId));
        
        router.patch(`/cart/${itemId}`, {
            quantity: newQuantity
        }, {
            preserveScroll: true,
            onFinish: () => {
                setUpdatingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(itemId);
                    return newSet;
                });
            },
        });
    };

    const removeItem = async (itemId) => {
        const result = await Swal.fire({
            title: 'Remove Item?',
            text: "This item will be removed from your cart",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, remove it',
            cancelButtonText: 'Cancel'
        });
        
        if (result.isConfirmed) {
            router.delete(`/cart/${itemId}`, {
                preserveScroll: true,
            });
        }
    };

    const checkout = () => {
        router.post('/cart/checkout', {}, {
            preserveScroll: false,
        });
    };

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowNotification(true);
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
    const shipping = 0; // Free shipping
    const finalTotal = subtotal + shipping;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Shopping Cart</h2>}
        >
            <Head title="Cart" />

            {/* Flash Messages */}
            {showNotification && (flash?.success || flash?.error) && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
                    <div className={`rounded-lg px-6 py-4 shadow-lg ${
                        flash?.success ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">
                                {flash?.success ? '✓' : '✗'}
                            </span>
                            <span className="font-medium">
                                {flash?.success || flash?.error}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6 flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            <li>
                                <Link href="/products" className="text-gray-500 hover:text-gray-700">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="ml-4 text-gray-500">Shopping Cart</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    {cartItems.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center">
                                <svg
                                    className="mx-auto h-24 w-24 text-gray-300 mb-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                                    />
                                </svg>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                                <p className="text-gray-600 mb-8">Looks like you haven't added any items yet.</p>
                                <Link href="/products">
                                    <PrimaryButton type="button" className="inline-flex items-center">
                                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Start Shopping
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Cart Items */}
                            <div className="lg:col-span-2">
                                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                                    <div className="border-b px-6 py-4">
                                        <h1 className="text-xl font-semibold text-gray-800">
                                            Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                                        </h1>
                                    </div>
                                    <div className="divide-y">
                                        {cartItems.map((item) => {
                                            const isUpdating = updatingItems.has(item.id);
                                            return (
                                                <div key={item.id} className="p-6">
                                                    <div className="flex gap-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-800">
                                                                        {item.product.name}
                                                                    </h3>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {item.product.description}
                                                                    </p>
                                                                    <div className="mt-2 text-lg font-semibold text-indigo-600">
                                                                        ${parseFloat(item.product.price).toFixed(2)}
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Available: {item.product.stock_quantity} units
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                        disabled={isUpdating || item.quantity <= 1}
                                                                        className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                                        </svg>
                                                                    </button>
                                                                    <span className="w-12 text-center text-gray-800 font-medium">
                                                                        {item.quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                        disabled={isUpdating || item.quantity >= item.product.stock_quantity}
                                                                        className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-lg font-semibold text-gray-800">
                                                                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => removeItem(item.id)}
                                                                        disabled={isUpdating}
                                                                        className="mt-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                                                                    >
                                                                        <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping</span>
                                            <span className="font-medium text-green-600">Free</span>
                                        </div>
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between">
                                                <span className="text-lg font-semibold text-gray-800">Total</span>
                                                <span className="text-lg font-semibold text-gray-800">${finalTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={checkout}
                                        className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-3 text-white font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        Proceed to Checkout
                                    </button>
                                    <Link
                                        href="/products"
                                        className="mt-3 block w-full text-center rounded-md border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
