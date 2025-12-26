import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SecondaryButton from '../SecondaryButton';

describe('SecondaryButton', () => {
    it('renders with children text', () => {
        render(<SecondaryButton>Click Me</SecondaryButton>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('has default type="button"', () => {
        render(<SecondaryButton>Save</SecondaryButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'button');
    });

    it('accepts custom type prop', () => {
        render(<SecondaryButton type="submit">Submit</SecondaryButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('handles click events', async () => {
        const user = userEvent.setup();
        const handleClick = jest.fn();
        
        render(<SecondaryButton onClick={handleClick}>Click</SecondaryButton>);
        
        await user.click(screen.getByRole('button'));
        
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
        render(<SecondaryButton className="custom-class">Button</SecondaryButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
    });

    it('applies disabled state', () => {
        render(<SecondaryButton disabled>Disabled</SecondaryButton>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('opacity-25');
    });

    it('does not trigger onClick when disabled', async () => {
        const user = userEvent.setup();
        const handleClick = jest.fn();
        
        render(<SecondaryButton disabled onClick={handleClick}>Disabled</SecondaryButton>);
        
        await user.click(screen.getByRole('button'));
        
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('passes additional props to button element', () => {
        render(<SecondaryButton data-testid="custom-button">Test</SecondaryButton>);
        expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('has correct styling classes', () => {
        render(<SecondaryButton>Styled</SecondaryButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('inline-flex', 'items-center', 'rounded-md', 'border');
    });
});
