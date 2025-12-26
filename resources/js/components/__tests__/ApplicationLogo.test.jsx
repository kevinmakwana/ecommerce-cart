import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApplicationLogo from '../ApplicationLogo';

describe('ApplicationLogo Component', () => {
    test('renders SVG logo', () => {
        const { container } = render(<ApplicationLogo />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    test('applies custom className', () => {
        const { container } = render(<ApplicationLogo className="custom-class" />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('custom-class');
    });

    test('renders with default viewBox', () => {
        const { container } = render(<ApplicationLogo />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 316 316');
    });

    test('SVG has correct xmlns attribute', () => {
        const { container } = render(<ApplicationLogo />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });

    test('renders path element inside SVG', () => {
        const { container } = render(<ApplicationLogo />);
        const path = container.querySelector('svg path');
        expect(path).toBeInTheDocument();
    });

    test('applies multiple custom classes', () => {
        const { container } = render(<ApplicationLogo className="class1 class2" />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('class1');
        expect(svg).toHaveClass('class2');
    });
});
