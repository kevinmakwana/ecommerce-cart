import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrimaryButton from '../PrimaryButton';

describe('PrimaryButton Component', () => {
    it('renders button with children text', () => {
        render(<PrimaryButton>Click Me</PrimaryButton>);
        
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    it('applies disabled styles when disabled prop is true', () => {
        render(<PrimaryButton disabled>Disabled Button</PrimaryButton>);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('opacity-25');
    });

    it('does not apply disabled styles when disabled prop is false', () => {
        render(<PrimaryButton disabled={false}>Enabled Button</PrimaryButton>);
        
        const button = screen.getByRole('button');
        expect(button).not.toBeDisabled();
        expect(button).not.toHaveClass('opacity-25');
    });

    it('passes additional className prop', () => {
        render(<PrimaryButton className="extra-class">Button</PrimaryButton>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('extra-class');
    });
});
