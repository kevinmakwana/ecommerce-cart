import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveNavLink from '../ResponsiveNavLink';

// Mock Inertia Link component
jest.mock('@inertiajs/react', () => ({
    Link: ({ children, className, ...props }) => (
        <a className={className} {...props}>
            {children}
        </a>
    ),
}));

describe('ResponsiveNavLink', () => {
    it('renders children text', () => {
        render(<ResponsiveNavLink href="/dashboard">Dashboard</ResponsiveNavLink>);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders as a link with href', () => {
        render(<ResponsiveNavLink href="/products">Products</ResponsiveNavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/products');
    });

    it('applies active styling when active is true', () => {
        render(<ResponsiveNavLink href="/home" active={true}>Home</ResponsiveNavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('border-indigo-400', 'bg-indigo-50', 'text-indigo-700');
    });

    it('applies inactive styling when active is false', () => {
        render(<ResponsiveNavLink href="/about" active={false}>About</ResponsiveNavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('border-transparent', 'text-gray-600');
    });

    it('applies inactive styling by default', () => {
        render(<ResponsiveNavLink href="/contact">Contact</ResponsiveNavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('border-transparent', 'text-gray-600');
    });

    it('applies custom className', () => {
        render(<ResponsiveNavLink href="/test" className="custom-responsive">Test</ResponsiveNavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('custom-responsive');
    });

    it('has responsive navigation styling', () => {
        render(<ResponsiveNavLink href="/link">Link</ResponsiveNavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('flex', 'w-full', 'items-start', 'border-l-4');
    });

    it('passes additional props to Link component', () => {
        render(<ResponsiveNavLink href="/test" data-testid="responsive-link">Test</ResponsiveNavLink>);
        expect(screen.getByTestId('responsive-link')).toBeInTheDocument();
    });

    it('renders icon and text together', () => {
        render(
            <ResponsiveNavLink href="/settings">
                <span>⚙️</span>
                <span>Settings</span>
            </ResponsiveNavLink>
        );
        expect(screen.getByText('⚙️')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('has proper font and transition classes', () => {
        render(<ResponsiveNavLink href="/test">Test</ResponsiveNavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('text-base', 'font-medium', 'transition');
    });

    it('handles long text content', () => {
        const longText = 'This is a very long navigation link text';
        render(<ResponsiveNavLink href="/long">{longText}</ResponsiveNavLink>);
        expect(screen.getByText(longText)).toBeInTheDocument();
    });
});
