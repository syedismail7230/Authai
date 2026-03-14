import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CertificateView from '../components/CertificateView';
import { CertificateData, ContentType } from '../types';

describe('CertificateView Component', () => {
    it('renders certificate details correctly', () => {
        const mockCert: CertificateData = {
            id: 'AUTH-TEST-123',
            issueDate: '2024-01-01T12:00:00Z',
            contentHash: 'SHA256-TEST-HASH',
            owner: 'Test User',
            verdict: 'HUMAN',
            contentType: ContentType.TEXT,
            contentPreview: 'This is a test preview.'
        };

        render(
            <CertificateView
                certificate={mockCert}
                onClose={() => { }}
            />
        );

        expect(screen.getByText('AUTH-TEST-123')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('HUMAN')).toBeInTheDocument();
    });
});
