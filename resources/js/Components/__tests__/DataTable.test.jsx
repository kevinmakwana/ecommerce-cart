import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DataTable from '../DataTable';

// Mock Inertia router
jest.mock('@inertiajs/react', () => ({
    router: {
        visit: jest.fn(),
    },
}));

describe('DataTable', () => {
    const mockColumns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'status', label: 'Status', sortable: false },
    ];

    const mockData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
    ];

    it('renders table with data', () => {
        render(<DataTable data={mockData} columns={mockColumns} />);
        
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('renders column headers', () => {
        render(<DataTable data={mockData} columns={mockColumns} />);
        
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
        render(<DataTable data={[]} columns={mockColumns} />);
        
        expect(screen.getByText(/no data found/i)).toBeInTheDocument();
    });

    it('filters data based on search input', async () => {
        const user = userEvent.setup();
        render(<DataTable data={mockData} columns={mockColumns} searchable={true} />);
        
        const searchInput = screen.getByPlaceholderText(/search/i);
        await user.type(searchInput, 'Jane');
        
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('shows search input when searchable is true', () => {
        render(<DataTable data={mockData} columns={mockColumns} searchable={true} />);
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('hides search input when searchable is false', () => {
        render(<DataTable data={mockData} columns={mockColumns} searchable={false} />);
        expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    });

    it('sorts data when column header is clicked', async () => {
        const user = userEvent.setup();
        render(<DataTable data={mockData} columns={mockColumns} sortable={true} />);
        
        const nameHeader = screen.getByText('Name');
        await user.click(nameHeader);
        
        // After first click, should be ascending order
        const rows = screen.getAllByRole('row');
        expect(within(rows[1]).getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('displays items per page options', () => {
        render(<DataTable data={mockData} columns={mockColumns} perPageOptions={[10, 25, 50]} />);
        
        const select = screen.getByRole('combobox');
        expect(within(select).getByText('10')).toBeInTheDocument();
        expect(within(select).getByText('25')).toBeInTheDocument();
        expect(within(select).getByText('50')).toBeInTheDocument();
    });

    it('changes items per page', async () => {
        const user = userEvent.setup();
        const largeData = Array.from({ length: 30 }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            status: 'active',
        }));
        
        render(<DataTable data={largeData} columns={mockColumns} perPageOptions={[10, 25]} />);
        
        const select = screen.getByRole('combobox');
        await user.selectOptions(select, '25');
        
        // Should show more items now
        expect(select).toHaveValue('25');
    });

    it('displays pagination controls', () => {
        const largeData = Array.from({ length: 30 }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            status: 'active',
        }));
        
        render(<DataTable data={largeData} columns={mockColumns} />);
        
        expect(screen.getByText(/previous/i)).toBeInTheDocument();
        expect(screen.getByText(/next/i)).toBeInTheDocument();
    });

    it('handles empty columns array', () => {
        render(<DataTable data={mockData} columns={[]} />);
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('uses default perPageOptions when not provided', () => {
        render(<DataTable data={mockData} columns={mockColumns} />);
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
    });

    it('renders custom cell content', () => {
        const customColumns = [
            { 
                key: 'id', 
                label: 'ID',
                render: (item) => <span data-testid="custom-id">{item.id}</span>
            },
        ];
        
        render(<DataTable data={[mockData[0]]} columns={customColumns} />);
        expect(screen.getByTestId('custom-id')).toBeInTheDocument();
    });

    it('applies sortable styling to sortable columns', () => {
        render(<DataTable data={mockData} columns={mockColumns} sortable={true} />);
        
        const nameHeader = screen.getByText('Name');
        expect(nameHeader.closest('th')).toHaveClass('cursor-pointer');
    });
});
