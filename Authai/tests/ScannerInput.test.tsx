import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ScannerInput from '../components/ScannerInput';
import { ContentType } from '../types';

describe('ScannerInput Component', () => {
    it('renders the scanner input correctly', () => {
        render(<ScannerInput onAnalyze={vi.fn()} isScanning={false} />);
        expect(screen.getByText('Verify Authenticity')).toBeInTheDocument();
        expect(screen.getByText('INITIATE SCAN')).toBeInTheDocument();
    });

    it('allows switching tabs', () => {
        render(<ScannerInput onAnalyze={vi.fn()} isScanning={false} />);
        const videoBtn = screen.getByText('VID');
        fireEvent.click(videoBtn);
        // After clicking VIDEO, text area should be gone, replaced by upload area
        expect(screen.queryByPlaceholderText('> Paste content sequence here...')).not.toBeInTheDocument();
        expect(screen.getByText('DRAG & DROP ARTIFACT')).toBeInTheDocument();
        expect(screen.getByText('MP4, MOV')).toBeInTheDocument();
    });

    it('calls onAnalyze when button is clicked with text', () => {
        const mockAnalyze = vi.fn();
        render(<ScannerInput onAnalyze={mockAnalyze} isScanning={false} />);

        const textArea = screen.getByPlaceholderText('> Paste content sequence here for forensic analysis...');
        fireEvent.change(textArea, { target: { value: 'Suspicious AI text' } });

        const scanBtn = screen.getByText('INITIATE SCAN');
        expect(scanBtn).not.toBeDisabled();

        fireEvent.click(scanBtn);
        expect(mockAnalyze).toHaveBeenCalledWith('Suspicious AI text', ContentType.TEXT);
    });

    it('disables button when scanning', () => {
        render(<ScannerInput onAnalyze={vi.fn()} isScanning={true} />);
        const scanBtn = screen.getByText('SCANNING...');
        expect(scanBtn).toBeDisabled();
    });
});
