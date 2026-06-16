import Navbar from '../../components/layout/Navbar';
import { ShoppingBag, Trash2 } from 'lucide-react';

const Cart = () => {
  // Mock cart for now
  const cartItems = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag size={32} />
          <h1 className="text-4xl font-bold">Your Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <div className="text-6xl mb-6">🛒</div>
            <h3 className="text-2xl font-medium mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
            <a href="/catalog" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700">
              Start Shopping
            </a>
          </div>
        ) : (
          <div>Cart items will go here...</div>
        )}
      </div>
    </div>
  );
};

export default Cart;