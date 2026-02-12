import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaChevronRight } from 'react-icons/fa';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';

export const PhoneAuthModal: React.FC = () => {
  const { sendPhoneOtp, verifyPhoneOtp, isLoading, error, user } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [message, setMessage] = useState<string | null>(null);

  const uiActive = useUIStore((s) => s.activeModal);
  if (user || uiActive !== 'phoneAuth') return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage(null);
      await sendPhoneOtp(phone);
      setStep('code');
      setMessage('OTP sent. Check your phone.');
    } catch (err: any) {
      setMessage(err.message || 'Failed to send OTP');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyPhoneOtp(code);
      useUIStore.getState().closeModal();
    } catch (err: any) {
      setMessage(err.message || 'Failed to verify OTP');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-auto">
        <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><FaPhone /></div>
            <div>
              <h3 className="text-lg font-semibold">Вход по телефону</h3>
              <p className="text-sm text-gray-500">Введите номер телефона, получите SMS с кодом</p>
            </div>
          </div>

          {step === 'phone' && (
            <form onSubmit={handleSend} className="space-y-3">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 555 5555" className="w-full p-3 border rounded" />
              <div id="recaptcha-container" />
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-emerald-600 text-white rounded">Send OTP</button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerify} className="space-y-3">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="w-full p-3 border rounded text-center text-lg" />
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-emerald-600 text-white rounded">Confirm Code</button>
            </form>
          )}

          {message && <div className="mt-3 text-sm text-red-500">{message}</div>}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
