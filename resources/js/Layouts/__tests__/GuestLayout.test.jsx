import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Inertia before importing GuestLayout
jest.mock('@inertiajs/react', () => ({
    Link: ({ href, children }) => <a href={href}>{children}</a>
}));

// Mock ApplicationLogo
jest.mock('@/components/ApplicationLogo', () => {
    return function ApplicationLogo() {
        return <svg data-testid="logo">Logo</svg>;
    };
});

import GuestLayout from '@/Layouts/GuestLayout';

describe('GuestLayout', () => {
    test('renders children content', () => {
        render(
            <GuestLayout>
                <div>Test Content</div>
            </GuestLayout>
        );
        
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('renders ApplicationLogo', () => {
        render(
            <GuestLayout>
                <div>Content</div>
            </GuestLayout>
        );
        
        expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    test('applies correct layout structure classes', () => {
        const { container } = render(
            <GuestLayout>
                <div>Content</div>
            </GuestLayout>
        );
        
        const wrapper = container.querySelector('.flex');
        expect(wrapper).toBeInTheDocument();
    });

    test('renders multiple children', () => {
        render(
            <GuestLayout>
                <div>Child 1</div>
                <div>Child 2</div>
            </GuestLayout>
        );
        
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    test('centers content on page', () => {
        const { container } = render(
            <GuestLayout>
                <div>Content</div>
            </GuestLayout>
        );
        
        const wrapper = container.querySelector('.flex');
        expect(wrapper).toHaveClass('flex', 'min-h-screen', 'flex-col', 'items-center');
    });
});
