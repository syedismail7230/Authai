import React, { useState } from 'react';
import { useAuthStore } from '../lib/store/authStore';
import PaymentModal from './PaymentModal';

interface WalletInfoProps {
  onAddCredits?: () => void;
}

export default function WalletInfo({ onAddCredits }: WalletInfoProps) {
  const { user } = useAuthStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const certificatesAvailable = Math.floor((user?.wallet || 0) / 19);

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border border-blue-200">
        <div className="mb-4">
          <p className="text-gray-600 text-sm font-semibold">Wallet Balance</p>
          <p className="text-3xl font-bold text-blue-600">₹{user?.wallet || 0}</p>
        </div>
        
        <div className="bg-white rounded p-3 mb-4">
          <p className="text-xs text-gray-600">Certificates Available</p>
          <p className="text-2xl font-bold text-indigo-600">{certificatesAvailable}</p>
          <p className="text-xs text-gray-500 mt-1">@ ₹19 per certificate</p>
        </div>

        <button
          onClick={() => setShowPaymentModal(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition"
        >
          💳 Top Up Wallet
        </button>

        <div className="mt-3 text-xs text-gray-600">
          <p className="font-semibold mb-1">💡 Ways to earn free certificates:</p>
          <ul className="space-y-1">
            <li>✓ 5 free on signup</li>
            <li>✓ 1 per referral</li>
          </ul>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} />
      )}
    </>
  );
}
