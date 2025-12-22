import React, { useState } from 'react';
import { X, CreditCard, Shield, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    setProcessing(true);
    // Simulate Razorpay Delay
    setTimeout(() => {
        setProcessing(false);
        onSuccess(10); // Add 10 credits
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neo-black/80 backdrop-blur-sm p-4">
      <div className="bg-white border-4 border-neo-black shadow-neo w-full max-w-md relative animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-neo-black text-white p-4 flex justify-between items-center">
            <h3 className="font-bold font-mono text-lg flex items-center gap-2">
                <CreditCard size={20} /> TOP_UP CREDITS
            </h3>
            <button onClick={onClose} disabled={processing} className="hover:bg-neo-red p-1 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-8">
            <div className="text-center mb-8">
                <p className="font-mono text-sm text-gray-500 mb-2">CURRENT BALANCE: LOW</p>
                <h2 className="text-4xl font-black mb-2">10 CREDITS</h2>
                <p className="text-2xl font-bold text-neo-green">₹199.00</p>
                <p className="text-xs text-gray-400 mt-2 font-mono">Includes 18% GST • Secure by Razorpay</p>
            </div>

            <div className="bg-neo-grey border-2 border-neo-black p-4 mb-8 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold">
                    <Check size={16} className="text-neo-green" />
                    <span>Industrial Grade Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                    <Check size={16} className="text-neo-green" />
                    <span>Blockchain Certificate Minting</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                    <Check size={16} className="text-neo-green" />
                    <span>Priority Queue Access</span>
                </div>
            </div>

            <button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-neo-black text-white py-4 font-black uppercase text-lg shadow-neo hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {processing ? (
                    <span className="animate-pulse">PROCESSING...</span>
                ) : (
                    <>PAY NOW <Shield size={18} /></>
                )}
            </button>
            
            <p className="text-center mt-4 text-[10px] font-mono text-gray-400">
                AUTH_AI.PRO • TERMS OF SERVICE • NO REFUNDS
            </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;