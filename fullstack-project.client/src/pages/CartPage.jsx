import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../api/services';
import { EmptyState } from '../components/UI';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, removeItem, clearCart, updateQuantity, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    if (!address) { toast.error('Please enter delivery address'); return; }
    setLoading(true);
    try {
      const productItems = cart.items.filter(i => i.productId).map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.price
      }));

      const serviceItems = cart.items.filter(i => i.serviceId);

      let orderId = null;

      if (productItems.length > 0) {
        const res = await ordersApi.create({
          orderType: 'Product',
          address,
          notes,
          items: productItems
        });
        orderId = res.data.id;
      }

      for (const si of serviceItems) {
        const res = await ordersApi.create({
          orderType: 'Service',
          address,
          notes,
          serviceId: si.serviceId,
          items: []
        });
        orderId = res.data.id;
      }

      await clearCart();
      toast.success('Order placed! Proceeding to payment...');
      navigate(`/checkout/${orderId}`);
    } catch {
      toast.error('Failed to place order');
    } finally { setLoading(false); }
  };

  if (!cart.items?.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          message="Add services or products to get started"
          action={<Link to="/services" className="btn-primary">Browse Services</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="card flex gap-4">
              <img src={item.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'}
                alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-blue-600 font-bold mt-1">${item.price}</p>
                <div className="flex items-center gap-4 mt-2">
                  {item.productId && (
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-50">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <button onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">${item.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">Clear cart</button>
        </div>

        {/* Order Summary */}
        <div className="card h-fit sticky top-20">
          <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal ({cart.items.length} items)</span>
              <span>${cart.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Service fee</span>
              <span>$0.00</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
              <span>Total</span>
              <span className="text-blue-600">${cart.total?.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
              <textarea rows={2} className="input-field resize-none" placeholder="Enter your address"
                value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input className="input-field" placeholder="Any special instructions"
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <button onClick={handleCheckout} disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? 'Placing Order...' : (<>Place Order <ArrowRight className="w-4 h-4" /></>)}
          </button>
        </div>
      </div>
    </div>
  );
}
