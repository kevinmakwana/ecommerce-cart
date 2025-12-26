import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputError from '../InputError';

describe('InputError', () => {
    it('renders error message when provided', () => {
        render(<InputError message="This field is required" />);
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('does not render when message is empty', () => {
        const { container } = render(<InputError message="" />);
        expect(container.firstChild).toBeNull();
    });

    it('does not render when message is null', () => {
        const { container } = render(<InputError message={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('does not render when message is undefined', () => {
        const { container } = render(<InputError />);
        expect(container.firstChild).toBeNull();
    });

    it('applies default error styling', () => {
        render(<InputError message="Error text" />);
        const error = screen.getByText('Error text');
        expect(error).toHaveClass('text-sm', 'text-red-600');
    });

    it('applies custom className', () => {
        render(<InputError message="Error" className="custom-error" />);
        const error = screen.getByText('Error');
        expect(error).toHaveClass('custom-error');
    });

    it('renders as a paragraph element', () => {
        render(<InputError message="Error message" />);
        const error = screen.getByText('Error message');
        expect(error.tagName).toBe('P');
    });

    it('passes additional props to paragraph element', () => {
        render(<InputError message="Error" data-testid="error-message" role="alert" />);
        const error = screen.getByTestId('error-message');
        expect(error).toHaveAttribute('role', 'alert');
    });

    it('handles long error messages', () => {
        const longMessage = 'This is a very long error message that explains in detail what went wrong with the form submission and how the user can fix it.';
        render(<InputError message={longMessage} />);
        expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('renders multiple error instances independently', () => {
        render(
            <div>
                <InputError message="Error 1" />
                <InputError message="Error 2" />
                <InputError message="" />
            </div>
        );
        
        expect(screen.getByText('Error 1')).toBeInTheDocument();
        expect(screen.getByText('Error 2')).toBeInTheDocument();
        // Verify only 2 paragraphs are rendered (not 3)
        const errors = screen.queryAllByRole('paragraph');
        // InputError renders as <p> but may not have ARIA role, check by tag
        const paragraphs = document.querySelectorAll('p');
        expect(paragraphs.length).toBe(2);
    });
});
