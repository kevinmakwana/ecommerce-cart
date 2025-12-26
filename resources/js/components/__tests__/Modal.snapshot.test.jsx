import React from 'react';
import { render } from '@testing-library/react';
import Modal from '../Modal';

// Mock Headless UI
jest.mock('@headlessui/react', () => ({
    Dialog: ({ open, onClose, children }) => (
        open ? <div role="dialog" onClick={onClose}>{children}</div> : null
    ),
    DialogPanel: ({ children }) => <div>{children}</div>,
    Transition: ({ show, children }) => (show ? <div>{children}</div> : null),
    TransitionChild: ({ children }) => <div>{children}</div>
}));

describe('Modal Snapshot Tests', () => {
    test('matches snapshot when closed', () => {
        const { container } = render(
            <Modal show={false} onClose={jest.fn()}>
                <div>Modal Content</div>
            </Modal>
        );
        expect(container).toMatchSnapshot();
    });

    test('matches snapshot when open', () => {
        const { container } = render(
            <Modal show={true} onClose={jest.fn()}>
                <div>Modal Content</div>
            </Modal>
        );
        expect(container).toMatchSnapshot();
    });

    test('matches snapshot with different max widths', () => {
        const maxWidths = ['sm', 'md', 'lg', 'xl', '2xl'];
        
        maxWidths.forEach(maxWidth => {
            const { container } = render(
                <Modal show={true} onClose={jest.fn()} maxWidth={maxWidth}>
                    <div>Modal Content</div>
                </Modal>
            );
            expect(container).toMatchSnapshot(`maxWidth-${maxWidth}`);
        });
    });

    test('matches snapshot with complex content', () => {
        const { container } = render(
            <Modal show={true} onClose={jest.fn()}>
                <div>
                    <h2>Title</h2>
                    <p>Description</p>
                    <button>Action</button>
                </div>
            </Modal>
        );
        expect(container).toMatchSnapshot();
    });

    test('matches snapshot with closeable=false', () => {
        const { container } = render(
            <Modal show={true} onClose={jest.fn()} closeable={false}>
                <div>Modal Content</div>
            </Modal>
        );
        expect(container).toMatchSnapshot();
    });
});
