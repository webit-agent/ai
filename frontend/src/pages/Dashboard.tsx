import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCompetitors } from '../api/competitors';
import { downloadWeeklyReport } from '../api/reports';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Download, Package, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { data: competitors, isLoading, isFetching } = useQuery({
    queryKey: ['competitors'],
    queryFn: getCompetitors
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadWeeklyReport();
    } catch (error) {
      console.error('Failed to download report', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['competitors'] });
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  let totalProducts = 0;
  let brokenLinks = 0;
  let priceChanges24h = 0;

  competitors?.forEach((comp: any) => {
    if (comp.products) {
      totalProducts += comp.products.length;
      comp.products.forEach((prod: any) => {
        if (prod.last_status === 'error' || prod.last_status === 'not_found') {
          brokenLinks++;
        }
        if (prod.lastPrice !== undefined && prod.previousPrice !== undefined && prod.lastPrice !== prod.previousPrice) {
           priceChanges24h++;
        }
      });
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex gap-4">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 hover:shadow disabled:opacity-50 transition-shadow"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            {isDownloading ? 'Downloading...' : 'Download Weekly Report'}
          </button>
          <button 
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 hover:shadow disabled:opacity-50 transition-shadow"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh All
          </button>
          <Link to="/add-competitor" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow hover:shadow-md transition-shadow">
            + Add Competitor
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-500">Total Products Tracked</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-500">Price Changes (24h)</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{priceChanges24h}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-500">Broken Links</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{brokenLinks}</p>
        </div>
      </div>
      
      {competitors?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow border border-gray-200">
          <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitors Tracked</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">You aren't tracking any competitors yet. Start by adding a competitor and their products to monitor price changes automatically.</p>
          <Link to="/add-competitor" className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium">
            Add Your First Competitor
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {competitors?.map((comp: any) => (
            <div key={comp.id} className="bg-white shadow overflow-x-auto sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <Link to={`/competitor/${comp.id}`} className="text-lg leading-6 font-medium text-indigo-600 hover:text-indigo-900">{comp.name}</Link>
                  <div className="mt-1">
                    <a href={comp.website_url} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-gray-700">{comp.website_url}</a>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                      <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comp.products?.map((prod: any) => {
                      let trendIcon = <span title="No trend data"><Minus className="w-4 h-4 text-gray-400" /></span>;
                      if (prod.lastPrice !== undefined && prod.previousPrice !== undefined && prod.previousPrice !== null) {
                        if (prod.lastPrice > prod.previousPrice) {
                          trendIcon = <span title="Price increased"><TrendingUp className="w-4 h-4 text-red-500" /></span>;
                        } else if (prod.lastPrice < prod.previousPrice) {
                          trendIcon = <span title="Price decreased"><TrendingDown className="w-4 h-4 text-green-500" /></span>;
                        }
                      }

                      return (
                        <tr key={prod.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prod.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {prod.lastPrice !== undefined && prod.lastPrice !== null 
                              ? `${prod.currency || '$'}${prod.lastPrice}`
                              : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {trendIcon}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={prod.last_status} /></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {prod.last_checked_at ? new Date(prod.last_checked_at).toLocaleString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/product/${prod.id}`} className="text-indigo-600 hover:text-indigo-900">Details</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
