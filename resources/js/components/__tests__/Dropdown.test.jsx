import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Inertia before importing Dropdown
jest.mock('@inertiajs/react', () => ({
    Link: ({ href, children, method, as: Component = 'a', ...props }) => {
        if (Component === 'button') {
            return <button type="button" {...props}>{children}</button>;
        }
        return <a href={href} {...props}>{children}</a>;
    }
}));

import Dropdown from '../Dropdown';

describe('Dropdown Component', () => {
    test('renders trigger button', () => {
        render(
            <Dropdown>
                <Dropdown.Trigger>
                    <button type="button">Open Menu</button>
                </Dropdown.Trigger>
                <Dropdown.Content>
                    <div>Menu Content</div>
                </Dropdown.Content>
            </Dropdown>
        );
        
        expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });

    test('does not show content initially', () => {
        render(
            <Dropdown>
                <Dropdown.Trigger>
                    <button type="button">Open Menu</button>
                </Dropdown.Trigger>
                <Dropdown.Content>
                    <div>Menu Content</div>
                </Dropdown.Content>
            </Dropdown>
        );
        
        expect(screen.queryByText('Menu Content')).not.toBeInTheDocument();
    });

    test('shows content when trigger is clicked', async () => {
        const user = userEvent.setup();
        
        render(
            <Dropdown>
                <Dropdown.Trigger>
                    <button type="button">Open Menu</button>
                </Dropdown.Trigger>
                <Dropdown.Content>
                    <div>Menu Content</div>
                </Dropdown.Content>
            </Dropdown>
        );
        
        const trigger = screen.getByRole('button', { name: /open menu/i });
        await user.click(trigger);
        
        await waitFor(() => {
            expect(screen.getByText('Menu Content')).toBeInTheDocument();
        });
    });

    test('hides content when trigger is clicked again', async () => {
        const user = userEvent.setup();
        
        render(
            <Dropdown>
                <Dropdown.Trigger>
                    <button type="button">Open Menu</button>
                </Dropdown.Trigger>
                <Dropdown.Content>
                    <div>Menu Content</div>
                </Dropdown.Content>
            </Dropdown>
        );
        
        const trigger = screen.getByRole('button', { name: /open menu/i });
        
        // Open
        await user.click(trigger);
        await waitFor(() => {
            expect(screen.getByText('Menu Content')).toBeInTheDocument();
        });
        
        // Close
        await user.click(trigger);
        await waitFor(() => {
            expect(screen.queryByText('Menu Content')).not.toBeInTheDocument();
        });
    });

    test('renders DropdownLink with correct props', async () => {
        const user = userEvent.setup();
        
        render(
            <Dropdown>
                <Dropdown.Trigger>
                    <button type="button">Open Menu</button>
                </Dropdown.Trigger>
                <Dropdown.Content>
                    <Dropdown.Link href="/profile">
                        Profile
                    </Dropdown.Link>
                    <Dropdown.Link href="/settings">
                        Settings
                    </Dropdown.Link>
                </Dropdown.Content>
            </Dropdown>
        );
        
        const trigger = screen.getByRole('button', { name: /open menu/i });
        await user.click(trigger);
        
        await waitFor(() => {
            expect(screen.getByText('Profile')).toBeInTheDocument();
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });
    });

    test('Dropdown opens and closes on trigger click', async () => {
        const user = userEvent.setup();
        
        render(
            <Dropdown>
                <Dropdown.Trigger>
                    <button type="button">Toggle</button>
                </Dropdown.Trigger>
                <Dropdown.Content>
                    <div>Menu Items</div>
                </Dropdown.Content>
            </Dropdown>
        );
        
        const trigger = screen.getByRole('button', { name: /toggle/i });
        
        // Initially closed
        expect(screen.queryByText('Menu Items')).not.toBeInTheDocument();
        
        // Open
        await user.click(trigger);
        await waitFor(() => {
            expect(screen.getByText('Menu Items')).toBeInTheDocument();
        });
        
        // Close
        await user.click(trigger);
        await waitFor(() => {
            expect(screen.queryByText('Menu Items')).not.toBeInTheDocument();
        });
    });

    test('Dropdown renders with custom content', async () => {
        const user = userEvent.setup();
        
        render(
            <Dropdown>
                <Dropdown.Trigger>
                    <button type="button">Menu</button>
                </Dropdown.Trigger>
                <Dropdown.Content>
                    <div>Custom Content Here</div>
                </Dropdown.Content>
            </Dropdown>
        );
        
        await user.click(screen.getByRole('button'));
        await waitFor(() => {
            expect(screen.getByText('Custom Content Here')).toBeInTheDocument();
        });
    });

    test('DropdownLink renders as button when method is provided', async () => {
        const user = userEvent.setup();
        
        render(
            <Dropdown>
                <Dropdown.Trigger>
                    <button type="button">Open Menu</button>
                </Dropdown.Trigger>
                <Dropdown.Content>
                    <Dropdown.Link href="/logout" method="post" as="button">
                        Logout
                    </Dropdown.Link>
                </Dropdown.Content>
            </Dropdown>
        );
        
        const trigger = screen.getByRole('button', { name: /open menu/i });
        await user.click(trigger);
        
        await waitFor(() => {
            const logoutButton = screen.getByText('Logout');
            expect(logoutButton.tagName).toBe('BUTTON');
        });
    });

    test('multiple dropdown instances work independently', async () => {
        const user = userEvent.setup();
        
        render(
            <div>
                <Dropdown>
                    <Dropdown.Trigger>
                        <button type="button">Menu 1</button>
                    </Dropdown.Trigger>
                    <Dropdown.Content>
                        <div>Content 1</div>
                    </Dropdown.Content>
                </Dropdown>
                
                <Dropdown>
                    <Dropdown.Trigger>
                        <button type="button">Menu 2</button>
                    </Dropdown.Trigger>
                    <Dropdown.Content>
                        <div>Content 2</div>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        );
        
        const menu1 = screen.getByRole('button', { name: /menu 1/i });
        await user.click(menu1);
        
        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
            expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
        });
    });
});
