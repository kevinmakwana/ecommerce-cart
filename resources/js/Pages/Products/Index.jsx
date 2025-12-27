import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import InputLabel from '@/components/InputLabel';
import { useState, useEffect } from 'react';

export default function Index({ auth, products, isAdmin, filters }) {
    const [quantities, setQuantities] = useState({});
    const [submittingProducts, setSubmittingProducts] = useState({});
    const [showNotification, setShowNotification] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const { flash = {} } = usePage().props;

    const handleFilterChange = (filterValue) => {
        router.get('/products', { 
            filter: filterValue,
            search: searchTerm 
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/products', { 
            search: searchTerm,
            filter: filters?.filter 
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        if (value === '') {
            router.get('/products', { 
                filter: filters?.filter 
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleQuantityChange = (productId, value) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, parseInt(value) || 1)
        }));
    };

    const addToCart = (productId) => {
        setSubmittingProducts(prev => ({ ...prev, [productId]: true }));
        router.post('/cart', {
            product_id: productId,
            quantity: quantities[productId] || 1
        }, {
            preserveScroll: true,
            onFinish: () => {
                setSubmittingProducts(prev => {
                    const newState = { ...prev };
                    delete newState[productId];
                    return newState;
                });
            },
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Products</h2>}
        >
            <Head title="Products" />

            {/* Flash Messages */}
            {(flash?.success || flash?.error) && (
                <div className="fixed top-4 right-4 z-50">
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
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Shop Our Products</h1>
                        
                        <div className="flex items-center gap-4">
                            {!isAdmin && (
                                <Link href="/cart">
                                    <PrimaryButton type="button">
                                        🛒 View Cart
                                    </PrimaryButton>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="flex gap-2">
                                    <TextInput
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder="Search products by name..."
                                        className="flex-1"
                                    />
                                    <PrimaryButton type="submit">
                                        🔍 Search
                                    </PrimaryButton>
                                </div>
                            </form>

                            {/* Filter Dropdown */}
                            <div className="flex items-center gap-2">
                                <InputLabel value="Filter:" className="whitespace-nowrap" />
                                <select
                                    value={filters?.filter || ''}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Products</option>
                                    <option value="low_stock">Low Stock Only</option>
                                </select>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(filters?.search || filters?.filter) && (
                            <div className="mt-4 flex flex-wrap gap-2 items-center">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {filters?.search && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                        Search: "{filters.search}"
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                router.get('/products', { filter: filters?.filter }, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }}
                                            className="ml-1 hover:text-indigo-900"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {filters?.filter === 'low_stock' && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                        Low Stock
                                        <button
                                            onClick={() => handleFilterChange('')}
                                            className="ml-1 hover:text-orange-900"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        router.get('/products', {}, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {products.data.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <p className="text-center text-gray-500">No products available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products.data.map((product) => (
                                <div key={product.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                                        <p className="text-gray-600 mb-4">{product.description}</p>
                                        
                                        <div className="mb-4">
                                            <p className="text-2xl font-bold text-indigo-600">
                                                ${parseFloat(product.price).toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {product.stock_quantity > 0 ? (
                                                    <>
                                                        <span className="font-semibold">In Stock:</span> {product.stock_quantity} units
                                                        {product.stock_quantity <= 10 && (
                                                            <span className="ml-2 text-orange-600 font-medium">
                                                                (Low Stock!)
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-red-600 font-semibold">Out of Stock</span>
                                                )}
                                            </p>
                                        </div>
                                        
                                        {!isAdmin && product.stock_quantity > 0 && (
                                            <div className="mb-4">
                                                <InputLabel htmlFor={`quantity-${product.id}`} value="Quantity" />
                                                <TextInput
                                                    id={`quantity-${product.id}`}
                                                    type="number"
                                                    min="1"
                                                    max={product.stock_quantity}
                                                    value={quantities[product.id] || 1}
                                                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                    className="mt-1 block w-full"
                                                />
                                            </div>
                                        )}
                                        
                                        {!isAdmin && (
                                            <PrimaryButton
                                                onClick={() => addToCart(product.id)}
                                                disabled={product.stock_quantity === 0 || submittingProducts[product.id]}
                                                className="w-full justify-center"
                                            >
                                                {submittingProducts[product.id] ? 'Adding...' : product.stock_quantity === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                                            </PrimaryButton>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {products.data.length > 0 && (products.prev_page_url || products.next_page_url) && (
                        <div className="mt-8 flex justify-center">
                            <nav className="flex items-center gap-2">
                                {products.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
