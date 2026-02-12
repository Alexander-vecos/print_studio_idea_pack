import React, { useState } from 'react';
import { firestoreAdapter } from '../../firebase/firestoreAdapter';
import { useAuthStore } from '../../stores/authStore';
import { useReferenceData } from '../../hooks/useReferenceData';

export const AddOrderForm: React.FC<{ onCreated?: (id: string) => void }> = ({ onCreated }) => {
  const user = useAuthStore((s) => s.user);
  const { items: priorities } = useReferenceData('PRIORITIES');

  const [client, setClient] = useState('');
  const [product, setProduct] = useState('');
  const [type, setType] = useState('');
  const [colors, setColors] = useState('');
  const [priority, setPriority] = useState(priorities[0]?.code || 'default');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !product) {
      setMsg('Please fill client and product');
      return;
    }

    setLoading(true);
    try {
      const order = {
        orderNumber: `O-${Date.now().toString().slice(-6)}`,
        client,
        product,
        details: { type, colors },
        priority,
        status: 'new',
        createdBy: user?.uid || 'anon',
      };

      const id = await firestoreAdapter.addOrder(order);
      setMsg('Order created');
      setClient(''); setProduct(''); setType(''); setColors('');
      if (onCreated) onCreated(id);
    } catch (err: any) {
      setMsg(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Order</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" className="w-full p-3 border rounded" />
        <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Product" className="w-full p-3 border rounded" />
        <div className="grid grid-cols-2 gap-2">
          <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Type (e.g., Digital)" className="p-3 border rounded" />
          <input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Colors (e.g., 4+4)" className="p-3 border rounded" />
        </div>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-3 border rounded">
          {priorities.map((p) => (
            <option key={p.code} value={p.code}>{p.label}</option>
          ))}
        </select>

        <button className="w-full py-3 bg-emerald-600 text-white rounded" disabled={loading} type="submit">Create Order</button>
      </form>
      {msg && <div className="mt-3 text-sm text-gray-500">{msg}</div>}
    </div>
  );
};
