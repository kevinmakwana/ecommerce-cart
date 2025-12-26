import React from 'react';
import { render } from '@testing-library/react';
import DataTable from '../DataTable';

// Mock Inertia router
jest.mock('@inertiajs/react', () => ({
    router: {
        get: jest.fn()
    }
}));

describe('DataTable Snapshot Tests', () => {
    const mockData = [
        { id: 1, name: 'Product 1', price: 19.99, stock: 50 },
        { id: 2, name: 'Product 2', price: 29.99, stock: 30 },
        { id: 3, name: 'Product 3', price: 39.99, stock: 20 }
    ];

    const mockColumns = [
        {
            key: 'name',
            label: 'Product Name',
            sortable: true
        },
        {
            key: 'price',
            label: 'Price',
            sortable: true,
            render: (item) => `$${item.price}`
        },
        {
            key: 'stock',
            label: 'Stock',
            sortable: true
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('matches snapshot with data', () => {
        const { container } = render(
            <DataTable
                data={mockData}
                columns={mockColumns}
                searchable={true}
                sortable={true}
            />
        );
        expect(container).toMatchSnapshot();
    });

    test('matches snapshot with empty data', () => {
        const { container } = render(
            <DataTable
                data={[]}
                columns={mockColumns}
                searchable={true}
            />
        );
        expect(container).toMatchSnapshot();
    });

    test('matches snapshot with pagination', () => {
        const { container } = render(
            <DataTable
                data={mockData}
                columns={mockColumns}
                searchable={true}
                paginated={true}
                perPage={2}
            />
        );
        expect(container).toMatchSnapshot();
    });

    test('matches snapshot without search', () => {
        const { container } = render(
            <DataTable
                data={mockData}
                columns={mockColumns}
                searchable={false}
            />
        );
        expect(container).toMatchSnapshot();
    });

    test('matches snapshot with custom empty message', () => {
        const { container } = render(
            <DataTable
                data={[]}
                columns={mockColumns}
                emptyMessage="No products found"
            />
        );
        expect(container).toMatchSnapshot();
    });
});
