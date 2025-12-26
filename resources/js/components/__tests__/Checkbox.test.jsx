import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Checkbox from '../Checkbox';

describe('Checkbox', () => {
    it('renders checkbox input', () => {
        render(<Checkbox />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('is unchecked by default', () => {
        render(<Checkbox />);
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('can be checked', () => {
        render(<Checkbox checked onChange={() => {}} />);
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('handles onChange event', async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();
        
        render(<Checkbox onChange={handleChange} />);
        const checkbox = screen.getByRole('checkbox');
        
        await user.click(checkbox);
        
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
        render(<Checkbox className="custom-checkbox" />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveClass('custom-checkbox');
    });

    it('has default styling classes', () => {
        render(<Checkbox />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveClass('rounded', 'border-gray-300', 'text-indigo-600');
    });

    it('can be disabled', () => {
        render(<Checkbox disabled />);
        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('passes additional props to input element', () => {
        render(<Checkbox name="terms" data-testid="terms-checkbox" />);
        const checkbox = screen.getByTestId('terms-checkbox');
        expect(checkbox).toHaveAttribute('name', 'terms');
    });

    it('can have a value attribute', () => {
        render(<Checkbox value="agreed" />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveAttribute('value', 'agreed');
    });

    it('toggles checked state on user interaction', async () => {
        const user = userEvent.setup();
        const TestComponent = () => {
            const [checked, setChecked] = React.useState(false);
            return <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />;
        };
        
        const React = require('react');
        render(<TestComponent />);
        
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
        
        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        
        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
    });
});
