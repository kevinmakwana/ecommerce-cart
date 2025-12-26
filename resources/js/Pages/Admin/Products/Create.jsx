import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import InputError from '@/components/InputError';
import PrimaryButton from '@/components/PrimaryButton';
import { useEffect, useState } from 'react';

export default function Create() {
    const { flash = {} } = usePage().props;
    const [showNotification, setShowNotification] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'));
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
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Product
                </h2>
            }
        >
            <Head title="Create Product" />

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
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* Name */}
                            <div>
                                <InputLabel htmlFor="name" value="Product Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Description */}
                            <div>
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="4"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Price */}
                            <div>
                                <InputLabel htmlFor="price" value="Price" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    value={data.price}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('price', e.target.value)}
                                />
                                <InputError message={errors.price} className="mt-2" />
                            </div>

                            {/* Stock Quantity */}
                            <div>
                                <InputLabel htmlFor="stock_quantity" value="Stock Quantity" />
                                <TextInput
                                    id="stock_quantity"
                                    type="number"
                                    name="stock_quantity"
                                    value={data.stock_quantity}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('stock_quantity', e.target.value)}
                                />
                                <InputError message={errors.stock_quantity} className="mt-2" />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('admin.products.index')}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Create Product
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
