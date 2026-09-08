import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCompetitor } from '../api/competitors';
import { addProduct } from '../api/products';
import { Plus, Trash2 } from 'lucide-react';

export default function AddCompetitor() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Step 1
  const [compName, setCompName] = useState('');
  const [compUrl, setCompUrl] = useState('');
  
  // Step 2
  const [products, setProducts] = useState([{ name: '', url: '' }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) {
      setError('Competitor name is required');
      return;
    }
    if (!compUrl.startsWith('http')) {
      setError('Website URL must start with http or https');
      return;
    }
    setError('');
    setStep(2);
  };

  const addProductRow = () => {
    setProducts([...products, { name: '', url: '' }]);
  };

  const removeProductRow = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: 'name' | 'url', value: string) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate products
    const validProducts = products.filter(p => p.name.trim() && p.url.trim());
    for (const p of validProducts) {
      if (!p.url.startsWith('http')) {
        setError(`URL for product "${p.name}" must start with http or https`);
        setLoading(false);
        return;
      }
    }

    try {
      const comp = await createCompetitor({ name: compName, websiteUrl: compUrl });
      
      // Initial scrape / adding products might take a while
      if (validProducts.length > 0) {
        await Promise.all(validProducts.map(p => 
          addProduct({ competitorId: comp.id, name: p.name, url: p.url })
        ));
      }
      
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add competitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Add New Competitor</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <span className={`px-2 py-1 rounded-full border ${step === 1 ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'bg-gray-100 text-gray-400'}`}>1. Competitor Info</span>
          <span className="mx-2 text-gray-300">→</span>
          <span className={`px-2 py-1 rounded-full border ${step === 2 ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'bg-gray-100 text-gray-400'}`}>2. Track Products</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input 
                required 
                type="text" 
                value={compName} 
                onChange={e => setCompName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website URL</label>
              <input 
                required 
                type="url" 
                value={compUrl} 
                onChange={e => setCompUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium text-sm">
              Next Step
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <p className="text-gray-600 mb-4 text-sm">Add specific product pages you want to track for {compName}. You can add more later.</p>
          
          <div className="space-y-6">
            {products.map((prod, index) => (
              <div key={index} className="flex gap-4 items-start pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Product Name</label>
                    <input 
                      type="text" 
                      value={prod.name} 
                      onChange={e => updateProduct(index, 'name', e.target.value)}
                      placeholder="e.g. Basic Plan / Widget Pro"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Product URL</label>
                    <input 
                      type="url" 
                      value={prod.url} 
                      onChange={e => updateProduct(index, 'url', e.target.value)}
                      placeholder="https://example.com/pricing"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    />
                  </div>
                </div>
                {products.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeProductRow(index)}
                    className="mt-6 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Remove product"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={addProductRow}
            className="mt-6 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add another product
          </button>

          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2"
            >
              Back
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Running initial scrape...' : 'Save & Track'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
