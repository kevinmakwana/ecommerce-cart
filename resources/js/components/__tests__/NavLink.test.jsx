import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavLink from '../NavLink';

// Mock Inertia Link component
jest.mock('@inertiajs/react', () => ({
    Link: ({ children, className, ...props }) => (
        <a className={className} {...props}>
            {children}
        </a>
    ),
}));

describe('NavLink', () => {
    it('renders children text', () => {
        render(<NavLink href="/dashboard">Dashboard</NavLink>);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders as a link with href', () => {
        render(<NavLink href="/products">Products</NavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/products');
    });

    it('applies active styling when active is true', () => {
        render(<NavLink href="/home" active={true}>Home</NavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('border-indigo-400', 'text-gray-900');
    });

    it('applies inactive styling when active is false', () => {
        render(<NavLink href="/about" active={false}>About</NavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('border-transparent', 'text-gray-500');
    });

    it('applies inactive styling by default', () => {
        render(<NavLink href="/contact">Contact</NavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('border-transparent', 'text-gray-500');
    });

    it('applies custom className', () => {
        render(<NavLink href="/test" className="extra-class">Test</NavLink>);
        const link = screen.getByRole('link');
        expect(link.className).toContain('extra-class');
    });

    it('has default navigation styling', () => {
        render(<NavLink href="/link">Link</NavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('inline-flex', 'items-center', 'border-b-2');
    });

    it('passes additional props to Link component', () => {
        render(<NavLink href="/test" data-testid="nav-link" aria-label="Navigation">Test</NavLink>);
        const link = screen.getByTestId('nav-link');
        expect(link).toHaveAttribute('aria-label', 'Navigation');
    });

    it('renders icon and text together', () => {
        render(
            <NavLink href="/home">
                <span>🏠</span>
                <span>Home</span>
            </NavLink>
        );
        expect(screen.getByText('🏠')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('maintains consistent styling classes', () => {
        render(<NavLink href="/test">Test</NavLink>);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('text-sm', 'font-medium', 'leading-5');
    });
});
