import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../lib/store/authStore';

interface Props {
  onClose: () => void;
}

const PRESET_AMOUNTS = [
  { certificates: 5, price: 95 },
  { certificates: 10, price: 180 },
  { certificates: 25, price: 425 },
  { certificates: 50, price: 800 },
];

export default function PaymentModal({ onClose }: Props) {
  const [selectedAmount, setSelectedAmount] = useState<number>(95);
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const { user, setAuth } = useAuthStore();

  const handlePayment = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const amount = customAmount ? parseInt(customAmount) * 100 : selectedAmount * 100;

      // Create Razorpay order
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/wallet/create-order`,
        { amount: amount / 100 }, // Send Rupee amount
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key',
        amount: amount,
        currency: 'INR',
        name: 'AuthAI',
        description: 'Wallet Top Up',
        order_id: data.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/wallet/verify-payment`,
              {
                razorpay_order_id: data.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amountAdded: amount / 100,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            // Refresh user balance
            const userResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/profile`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            setAuth(token, userResponse.data.user);
            alert('✅ Payment successful! Your wallet has been topped up.');
            onClose();
          } catch (error) {
            alert('Payment verified but failed to update wallet. Please contact support.');
          }
        },
        prefill: {
          email: user.email,
          contact: '9999999999',
        },
        theme: {
          color: '#2563eb',
        },
      };

      const Razorpay = (window as any).Razorpay;
      new Razorpay(options).open();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">💳 Top Up Wallet</h2>
          <button onClick={onClose} className="text-2xl font-bold hover:opacity-80">
            ×
          </button>
        </div>

        {/* Preset Options */}
        <div className="p-6">
          <p className="text-sm font-semibold text-gray-600 mb-4">Select Plan</p>
          <div className="space-y-3 mb-6">
            {PRESET_AMOUNTS.map((plan) => (
              <button
                key={plan.price}
                onClick={() => {
                  setSelectedAmount(plan.price);
                  setCustomAmount('');
                }}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  selectedAmount === plan.price && !customAmount
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <p className="font-bold text-lg">
                  {plan.certificates} Certificates
                </p>
                <p className="text-gray-600">₹{plan.price}</p>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-2">Or Enter Custom Amount</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  if (e.target.value) setSelectedAmount(0);
                }}
                placeholder="Enter amount in ₹"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                min="0"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount</span>
              <span className="font-bold">₹{customAmount || selectedAmount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Certificates</span>
              <span className="font-bold">
                {Math.floor((customAmount ? parseInt(customAmount) : selectedAmount) / 19)}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg text-blue-600">₹{customAmount || selectedAmount}</span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-900 mb-6">
            ✓ Secure payment via Razorpay
            <br />✓ GST applicable (18%)
            <br />✓ Instant credit to wallet
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading || (!customAmount && selectedAmount === 0)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? '⏳ Processing...' : '💳 Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
