import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DangerButton from '../DangerButton';

describe('DangerButton', () => {
    it('renders with children text', () => {
        render(<DangerButton>Delete</DangerButton>);
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('handles click events', async () => {
        const user = userEvent.setup();
        const handleClick = jest.fn();
        
        render(<DangerButton onClick={handleClick}>Click</DangerButton>);
        
        await user.click(screen.getByRole('button'));
        
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
        render(<DangerButton className="extra-class">Button</DangerButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('extra-class');
    });

    it('applies disabled state', () => {
        render(<DangerButton disabled>Disabled</DangerButton>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('opacity-25');
    });

    it('does not trigger onClick when disabled', async () => {
        const user = userEvent.setup();
        const handleClick = jest.fn();
        
        render(<DangerButton disabled onClick={handleClick}>Disabled</DangerButton>);
        
        await user.click(screen.getByRole('button'));
        
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('has danger styling classes', () => {
        render(<DangerButton>Delete</DangerButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-500');
    });

    it('passes additional props to button element', () => {
        render(<DangerButton data-testid="danger-btn" aria-label="Delete item">Remove</DangerButton>);
        const button = screen.getByTestId('danger-btn');
        expect(button).toHaveAttribute('aria-label', 'Delete item');
    });

    it('has correct default styling', () => {
        render(<DangerButton>Remove</DangerButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('inline-flex', 'items-center', 'rounded-md');
    });
});
