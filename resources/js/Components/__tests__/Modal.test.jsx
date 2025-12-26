import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Modal from '../Modal';

// Mock Headless UI components
jest.mock('@headlessui/react', () => ({
    Dialog: ({ children, onClose, ...props }) => (
        <div data-testid="dialog" onClick={onClose} {...props}>
            {children}
        </div>
    ),
    DialogPanel: ({ children, ...props }) => (
        <div data-testid="dialog-panel" {...props}>
            {children}
        </div>
    ),
    Transition: ({ children, show }) => (show ? <div data-testid="transition">{children}</div> : null),
    TransitionChild: ({ children }) => <div data-testid="transition-child">{children}</div>,
}));

describe('Modal', () => {
    it('renders children when show is true', () => {
        render(
            <Modal show={true}>
                <div>Modal Content</div>
            </Modal>
        );
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('does not render when show is false', () => {
        render(
            <Modal show={false}>
                <div>Modal Content</div>
            </Modal>
        );
        expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('calls onClose when closeable is true', async () => {
        const user = userEvent.setup();
        const handleClose = jest.fn();
        
        render(
            <Modal show={true} closeable={true} onClose={handleClose}>
                <div>Content</div>
            </Modal>
        );
        
        const dialog = screen.getByTestId('dialog');
        await user.click(dialog);
        
        expect(handleClose).toHaveBeenCalled();
    });

    it('does not call onClose when closeable is false', async () => {
        const user = userEvent.setup();
        const handleClose = jest.fn();
        
        render(
            <Modal show={true} closeable={false} onClose={handleClose}>
                <div>Content</div>
            </Modal>
        );
        
        const dialog = screen.getByTestId('dialog');
        await user.click(dialog);
        
        expect(handleClose).not.toHaveBeenCalled();
    });

    it('is closeable by default', async () => {
        const user = userEvent.setup();
        const handleClose = jest.fn();
        
        render(
            <Modal show={true} onClose={handleClose}>
                <div>Content</div>
            </Modal>
        );
        
        const dialog = screen.getByTestId('dialog');
        await user.click(dialog);
        
        expect(handleClose).toHaveBeenCalled();
    });

    it('accepts maxWidth prop', () => {
        const { rerender } = render(
            <Modal show={true} maxWidth="sm">
                <div>Content</div>
            </Modal>
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
        
        rerender(
            <Modal show={true} maxWidth="lg">
                <div>Content</div>
            </Modal>
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('uses 2xl as default maxWidth', () => {
        render(
            <Modal show={true}>
                <div>Content</div>
            </Modal>
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders dialog panel within modal', () => {
        render(
            <Modal show={true}>
                <div>Content</div>
            </Modal>
        );
        expect(screen.getByTestId('dialog-panel')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
        render(
            <Modal show={true}>
                <h2>Title</h2>
                <p>Description</p>
                <button>Action</button>
            </Modal>
        );
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('handles show prop changes', () => {
        const { rerender } = render(
            <Modal show={false}>
                <div>Content</div>
            </Modal>
        );
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
        
        rerender(
            <Modal show={true}>
                <div>Content</div>
            </Modal>
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
    });
});
