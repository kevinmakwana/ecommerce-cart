import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputLabel from '../InputLabel';

describe('InputLabel Component', () => {
    it('renders label with correct text', () => {
        render(<InputLabel value="Email Address" />);
        
        const label = screen.getByText('Email Address');
        expect(label).toBeInTheDocument();
    });

    it('renders label with children instead of value prop', () => {
        render(<InputLabel>Username</InputLabel>);
        
        const label = screen.getByText('Username');
        expect(label).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(<InputLabel value="Test" className="custom-class" />);
        
        const label = screen.getByText('Test');
        expect(label).toHaveClass('custom-class');
    });

    it('applies default styling classes', () => {
        render(<InputLabel value="Test Label" />);
        
        const label = screen.getByText('Test Label');
        expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700');
    });
});
