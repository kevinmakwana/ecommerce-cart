import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRef } from 'react';
import TextInput from '../TextInput';

describe('TextInput', () => {
    it('renders with default type="text"', () => {
        render(<TextInput />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('type', 'text');
    });

    it('accepts custom type prop', () => {
        render(<TextInput type="email" />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('type', 'email');
    });

    it('renders with placeholder', () => {
        render(<TextInput placeholder="Enter your name" />);
        expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('renders with value', () => {
        render(<TextInput value="test value" onChange={() => {}} />);
        expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });

    it('handles onChange event', async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();
        
        render(<TextInput value="" onChange={handleChange} />);
        const input = screen.getByRole('textbox');
        
        await user.type(input, 'hello');
        
        expect(handleChange).toHaveBeenCalled();
    });

    it('applies custom className', () => {
        render(<TextInput className="custom-input" />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('custom-input');
    });

    it('has default styling classes', () => {
        render(<TextInput />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('rounded-md', 'border-gray-300', 'shadow-sm');
    });

    it('focuses when isFocused is true', () => {
        const { rerender } = render(<TextInput isFocused={false} />);
        const input = screen.getByRole('textbox');
        
        expect(input).not.toHaveFocus();
        
        rerender(<TextInput isFocused={true} />);
        expect(input).toHaveFocus();
    });

    it('passes additional props to input element', () => {
        render(<TextInput data-testid="test-input" name="username" />);
        const input = screen.getByTestId('test-input');
        expect(input).toHaveAttribute('name', 'username');
    });

    it('exposes focus method via ref', () => {
        const TestComponent = () => {
            const inputRef = useRef(null);
            
            return (
                <div>
                    <TextInput ref={inputRef} />
                    <button onClick={() => inputRef.current?.focus()}>
                        Focus Input
                    </button>
                </div>
            );
        };
        
        render(<TestComponent />);
        const button = screen.getByRole('button');
        const input = screen.getByRole('textbox');
        
        expect(input).not.toHaveFocus();
        
        button.click();
        
        expect(input).toHaveFocus();
    });

    it('accepts disabled attribute', () => {
        render(<TextInput disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('accepts required attribute', () => {
        render(<TextInput required />);
        expect(screen.getByRole('textbox')).toBeRequired();
    });
});
