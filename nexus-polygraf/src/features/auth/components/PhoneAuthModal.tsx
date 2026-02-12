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
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380 63 515 6990" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center text-lg" />
              <button type="submit" disabled={isLoading || !phone.trim()} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium disabled:opacity-50">{isLoading ? 'Отправка...' : 'Отправить код'}</button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerify} className="space-y-3">
              <p className="text-sm text-gray-500">Код отправлен на {phone}</p>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center text-2xl tracking-[0.5em] font-mono" maxLength={6} autoFocus />
              <button type="submit" disabled={isLoading || code.length < 6} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium disabled:opacity-50">{isLoading ? 'Проверка...' : 'Подтвердить'}</button>
              <button type="button" onClick={() => { setStep('phone'); setCode(''); setMessage(null); }} className="w-full text-sm text-gray-500 hover:text-gray-700">← Другой номер</button>
            </form>
          )}

          {message && <div className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">{message}</div>}

          <button type="button" onClick={() => { useUIStore.getState().openModal('keyAuth'); }} className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600">← Назад к входу по ключу</button>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
