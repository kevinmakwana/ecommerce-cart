import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Inertia router completely
jest.mock('@inertiajs/react', () => ({
    router: {
        visit: jest.fn(),
    },
    usePage: () => ({
        props: {
            auth: {
                user: {
                    name: 'Test User',
                    email: 'test@example.com',
                    roles: [{ name: 'user' }],
                },
                isAdmin: false,
            },
        },
    }),
    Link: ({ href, children, ...props }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    Head: ({ children }) => <>{children}</>,
}));

describe('React Testing Setup', () => {
    it('verifies Jest and React Testing Library are configured correctly', () => {
        const TestComponent = () => <div>Testing Setup</div>;
        
        render(<TestComponent />);
        
        expect(screen.getByText('Testing Setup')).toBeInTheDocument();
    });

    it('can test Inertia components with mocked usePage', () => {
        const { usePage } = require('@inertiajs/react');
        const pageProps = usePage();
        
        expect(pageProps.props.auth.user.name).toBe('Test User');
        expect(pageProps.props.auth.isAdmin).toBe(false);
    });

    it('can test components with route helper', () => {
        const url = route('dashboard');
        
        expect(url).toBe('/dashboard');
    });
});
