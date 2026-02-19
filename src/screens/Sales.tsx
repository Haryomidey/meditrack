
import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { useStore } from '../store/useStore';
import { HiOutlineShoppingCart, HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineMinus, HiOutlineCheckCircle } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

export const Sales: React.FC = () => {
  const { inventory, addSale } = useStore();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'POS' | 'Transfer'>('Cash');
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredInventory = inventory.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) && d.quantity > 0
  );

  const addToCart = (drug: any) => {
    const existing = cart.find(item => item.drugId === drug.id);
    if (existing) {
      if (existing.quantity < drug.quantity) {
        setCart(cart.map(item => item.drugId === drug.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
    } else {
      setCart([...cart, { drugId: drug.id, name: drug.name, quantity: 1, price: drug.sellingPrice }]);
    }
  };

  const removeFromCart = (id: string) => {
    const item = cart.find(i => i.drugId === id);
    if (item && item.quantity > 1) {
      setCart(cart.map(i => i.drugId === id ? { ...i, quantity: i.quantity - 1 } : i));
    } else {
      setCart(cart.filter(i => i.drugId !== id));
    }
  };

  const total = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    await addSale({ id: crypto.randomUUID(), items: cart, total, paymentMethod, timestamp: Date.now(), synced: false });
    setShowSuccess(true);
    setCart([]);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto space-y-6 pb-20 no-scrollbar">
        <div className="space-y-4">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Add drug to cart..." className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl shadow-sm border border-gray-100 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
            {filteredInventory.slice(0, 5).map((drug) => (
              <button key={drug.id} onClick={() => addToCart(drug)} className="flex-shrink-0 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-left active:scale-95 transition-all w-32">
                <p className="font-bold text-xs truncate mb-1">{drug.name}</p>
                <p className="text-emerald-600 font-black text-sm">${drug.sellingPrice.toFixed(2)}</p>
                <p className="text-[9px] text-gray-400 mt-2">{drug.quantity} left</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Cart ({cart.length})</h3>
          <div className="space-y-3">
            {cart.map((item) => (
              <Card key={item.drugId} className="flex items-center justify-between p-3">
                <div className="flex-1"><p className="font-bold text-sm text-gray-900">{item.name}</p><p className="text-[10px] text-gray-400">${item.price.toFixed(2)} each</p></div>
                <div className="flex items-center gap-3">
                  <button onClick={() => removeFromCart(item.drugId)} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><HiOutlineMinus size={14} /></button>
                  <span className="font-bold text-sm min-w-[1.5rem] text-center">{item.quantity}</span>
                  <button onClick={() => addToCart(inventory.find(d => d.id === item.drugId))} className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><HiOutlinePlus size={14} /></button>
                </div>
                <div className="ml-4 text-right min-w-[4rem]"><p className="font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</p></div>
              </Card>
            ))}
          </div>
        </div>
        {cart.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Payment</h3>
            <div className="flex gap-3">
              {(['Cash', 'POS', 'Transfer'] as const).map((m) => (
                <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-xs ${paymentMethod === m ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-400'}`}>{m}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      {cart.length > 0 && (
        <div className="fixed bottom-28 left-5 right-5 z-40">
           <Button fullWidth className="py-5 rounded-3xl" onClick={handleCheckout}>
              <div className="flex items-center justify-between w-full"><span className="font-bold">COMPLETE SALE</span><span className="text-xl font-black">${total.toFixed(2)}</span></div>
           </Button>
        </div>
      )}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-emerald-600/90 backdrop-blur-md">
            <div className="text-center text-white">
              <HiOutlineCheckCircle size={100} className="mx-auto mb-6 text-emerald-200" />
              <h2 className="text-3xl font-black mb-2">Sale Complete!</h2>
              <p className="font-medium text-emerald-100">Inventory updated successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
