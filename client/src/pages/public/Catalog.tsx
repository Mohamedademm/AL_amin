import { useState, useEffect } from 'react';
import api from '../../services/axios';
import Navbar from '../../components/layout/Navbar';
import { ShoppingCart, Search } from 'lucide-react';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Product Catalog</h1>
          
          <div className="relative w-80">
            <div className="absolute left-4 top-3 text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="h-56 bg-gray-100 flex items-center justify-center relative">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl text-gray-300">📦</div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-medium">
                    {product.stock_quantity} in stock
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-sm text-blue-600 font-medium mb-1">{product.category}</div>
                  <h3 className="font-semibold text-xl mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      {product.price} MAD
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium">
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;