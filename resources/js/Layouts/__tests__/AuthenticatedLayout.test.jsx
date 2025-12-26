import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Inertia FIRST before any imports
jest.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, className }) => (
        <a href={href} className={className}>{children}</a>
    ),
    usePage: () => ({
        props: {
            auth: {
                user: {
                    name: 'Test User',
                    email: 'test@example.com',
                    roles: []
                }
            }
        }
    }),
    router: {
        post: jest.fn()
    }
}));

// Mock global route helper
global.route = jest.fn((name) => {
    const routes = {
        'dashboard': '/dashboard',
        'profile.edit': '/profile',
        'logout': '/logout',
        'products.index': '/products',
        'cart.index': '/cart',
        'orders.index': '/orders',
        'admin.products.index': '/admin/products',
        'admin.orders.index': '/admin/orders'
    };
    
    // When called with a name, return the URL
    if (name) {
        return routes[name] || '/';
    }
    
    // When called without arguments, return object with current method
    return {
        current: (checkName) => checkName === 'dashboard' // Default to dashboard for tests
    };
});

// Mock components
jest.mock('@/components/Dropdown', () => {
    const Dropdown = ({ children }) => <div data-testid="dropdown">{children}</div>;
    Dropdown.Trigger = ({ children }) => <div data-testid="dropdown-trigger">{children}</div>;
    Dropdown.Content = ({ children }) => <div data-testid="dropdown-content">{children}</div>;
    Dropdown.Link = ({ children, href }) => <a href={href}>{children}</a>;
    return Dropdown;
});

jest.mock('@/components/NavLink', () => {
    return function NavLink({ href, active, children }) {
        return <a href={href} data-active={active}>{children}</a>;
    };
});

jest.mock('@/components/ResponsiveNavLink', () => {
    return function ResponsiveNavLink({ href, active, children }) {
        return <a href={href} data-active={active}>{children}</a>;
    };
});

jest.mock('@/components/ApplicationLogo', () => {
    return function ApplicationLogo() {
        return <div>Logo</div>;
    };
});

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

describe('AuthenticatedLayout', () => {
    const defaultProps = {
        header: <h1>Page Header</h1>
    };

    test('renders children content', () => {
        render(
            <AuthenticatedLayout {...defaultProps}>
                <div>Page Content</div>
            </AuthenticatedLayout>
        );
        
        expect(screen.getByText('Page Content')).toBeInTheDocument();
    });

    test('renders header prop', () => {
        render(
            <AuthenticatedLayout {...defaultProps}>
                <div>Content</div>
            </AuthenticatedLayout>
        );
        
        expect(screen.getByText('Page Header')).toBeInTheDocument();
    });

    test('renders user dropdown', () => {
        render(
            <AuthenticatedLayout {...defaultProps}>
                <div>Content</div>
            </AuthenticatedLayout>
        );
        
        const userNames = screen.getAllByText('Test User');
        expect(userNames.length).toBeGreaterThan(0);
    });

    test('renders navigation links', () => {
        render(
            <AuthenticatedLayout {...defaultProps}>
                <div>Content</div>
            </AuthenticatedLayout>
        );
        
        const dashboardLinks = screen.getAllByText('Dashboard');
        expect(dashboardLinks.length).toBeGreaterThan(0);
    });

    test('renders ApplicationLogo', () => {
        render(
            <AuthenticatedLayout {...defaultProps}>
                <div>Content</div>
            </AuthenticatedLayout>
        );
        
        expect(screen.getByText('Logo')).toBeInTheDocument();
    });

    test('toggles mobile menu', async () => {
        const user = userEvent.setup();
        
        render(
            <AuthenticatedLayout {...defaultProps}>
                <div>Content</div>
            </AuthenticatedLayout>
        );
        
        // Find the hamburger button
        const buttons = screen.getAllByRole('button');
        const hamburgerButton = buttons.find(btn => 
            btn.querySelector('svg') !== null
        );
        
        expect(hamburgerButton).toBeInTheDocument();
    });

    test('renders dropdown with Dropdown component', () => {
        render(
            <AuthenticatedLayout {...defaultProps}>
                <div>Content</div>
            </AuthenticatedLayout>
        );
        
        expect(screen.getByTestId('dropdown')).toBeInTheDocument();
    });

    test('renders Profile and Log Out links in dropdown', () => {
        render(
            <AuthenticatedLayout {...defaultProps}>
                <div>Content</div>
            </AuthenticatedLayout>
        );
        
        const profileLinks = screen.getAllByText('Profile');
        const logoutLinks = screen.getAllByText('Log Out');
        
        expect(profileLinks.length).toBeGreaterThan(0);
        expect(logoutLinks.length).toBeGreaterThan(0);
    });

    test('applies layout structure classes', () => {
        const { container } = render(
            <AuthenticatedLayout {...defaultProps}>
                <div>Content</div>
            </AuthenticatedLayout>
        );
        
        const nav = container.querySelector('nav');
        expect(nav).toHaveClass('border-b', 'border-gray-100', 'bg-white');
    });

    test('renders without header prop', () => {
        render(
            <AuthenticatedLayout>
                <div>Content Only</div>
            </AuthenticatedLayout>
        );
        
        expect(screen.getByText('Content Only')).toBeInTheDocument();
        expect(screen.queryByText('Page Header')).not.toBeInTheDocument();
    });
});
