import React, { useState, useRef } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateModalProps {
  verificationId: string;
  onClose: () => void;
}

export default function CertificateModal({ verificationId, onClose }: CertificateModalProps) {
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchCertificate();
  }, [verificationId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `/api/certificate/${verificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCertificateData(response.data);
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${verificationId}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p>Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Authenticity Certificate</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">
            ×
          </button>
        </div>

        <div ref={certificateRef} className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          {certificateData && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-900 mb-2">Certificate of Authenticity</h1>
                <p className="text-gray-600">AI Content Verification</p>
              </div>

              <div className="border-2 border-blue-900 rounded-lg p-8 mb-8 bg-white">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-sm text-gray-600">Certificate ID</p>
                    <p className="text-lg font-bold">{certificateData.certificateNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issued Date</p>
                    <p className="text-lg font-bold">
                      {new Date(certificateData.verifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">AI Probability</p>
                    <p className="text-lg font-bold text-blue-600">{certificateData.aiScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Classification</p>
                    <p className="text-lg font-bold">{certificateData.classification}</p>
                  </div>
                </div>

                {certificateData.txHash && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Blockchain Transaction (Polygon)</p>
                    <a
                      href={`https://polygonscan.com/tx/${certificateData.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all font-mono"
                    >
                      {certificateData.txHash}
                    </a>
                  </div>
                )}

                <div className="flex justify-center mb-8">
                  <QRCode
                    value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${verificationId}` : ''}
                    size={150}
                  />
                </div>

                <p className="text-center text-sm text-gray-500">
                  Scan QR code to verify authenticity
                </p>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-50 border-t p-4 flex gap-3">
          <button
            onClick={downloadPDF}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          >
            📥 Download PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
