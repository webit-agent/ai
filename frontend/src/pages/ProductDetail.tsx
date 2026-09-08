import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, getProductHistory, triggerCheck } from '../api/products';
import { getProductInsight, getProductPatterns } from '../api/insights';
import PriceChart from '../components/PriceChart';
import StatusBadge from '../components/StatusBadge';

export default function ProductDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: product } = useQuery({ queryKey: ['product', id], queryFn: () => getProduct(id!) });
  const { data: history } = useQuery({ queryKey: ['productHistory', id], queryFn: () => getProductHistory(id!) });
  const { data: insight } = useQuery({ queryKey: ['productInsight', id], queryFn: () => getProductInsight(id!) });
  const { data: patterns, isLoading: patternsLoading, error: patternsError } = useQuery({ 
    queryKey: ['productPatterns', id], 
    queryFn: () => getProductPatterns(id!),
    retry: false
  });

  const checkMutation = useMutation({
    mutationFn: () => triggerCheck(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['productHistory', id] });
      queryClient.invalidateQueries({ queryKey: ['productInsight', id] });
    }
  });

  if (!product) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{product.name}</h3>
            <a href={product.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:text-indigo-900">View Source Product Page</a>
          </div>
          <div className="flex items-center space-x-4">
            <StatusBadge status={product.last_status} />
            <button 
              onClick={() => checkMutation.mutate()} 
              disabled={checkMutation.isPending}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {checkMutation.isPending ? 'Checking...' : 'Check Now'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Price History</h4>
            {history && history.length > 0 ? (
              <PriceChart data={history} />
            ) : (
              <p className="text-gray-500">No price history available yet.</p>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history?.map((h: any) => (
                  <tr key={h.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(h.scraped_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{h.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow rounded-lg p-6">
            <h4 className="text-md font-bold text-indigo-900 mb-4 flex items-center">
              <span className="mr-2">✨</span> AI Insights
            </h4>
            {insight ? (
              <p className="text-sm text-indigo-800 whitespace-pre-wrap">{insight.summary}</p>
            ) : (
              <p className="text-sm text-gray-500">Loading insights...</p>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-indigo-500">
            <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📈</span> Pricing Patterns
            </h4>
            {patternsLoading ? (
              <p className="text-sm text-gray-500">Analyzing patterns...</p>
            ) : patternsError ? (
              <p className="text-sm text-gray-500">Patterns not yet available.</p>
            ) : patterns ? (
              <div className="space-y-4">
                <ul className="space-y-2">
                  {patterns.patterns?.map((p: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">🔮</span> {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Confidence</span>
                    <span>{patterns.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${patterns.confidence}%` }}></div>
                  </div>
                </div>
                {patterns.nextExpectedChange && (
                  <p className="text-xs text-indigo-600 font-medium mt-2">
                    Next change expected: {new Date(patterns.nextExpectedChange).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
