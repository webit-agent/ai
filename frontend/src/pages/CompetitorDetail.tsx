import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCompetitor } from '../api/competitors';
import SnapshotViewer from '../components/SnapshotViewer';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft } from 'lucide-react';

export default function CompetitorDetail() {
  const { id } = useParams();
  
  const { data: competitor, isLoading } = useQuery({
    queryKey: ['competitor', id],
    queryFn: () => getCompetitor(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  if (!competitor) return <div className="p-8">Competitor not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-1">{competitor.name}</h3>
            <a href={competitor.website_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:text-indigo-900">
              {competitor.website_url}
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Tracked Products</h4>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {competitor.products?.length === 0 ? (
                <li className="p-4 text-gray-500">No products tracked yet.</li>
              ) : (
                competitor.products?.map((prod: any) => (
                  <li key={prod.id}>
                    <Link to={`/product/${prod.id}`} className="block hover:bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">{prod.name}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <StatusBadge status={prod.last_status} />
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {prod.lastPrice !== undefined && prod.lastPrice !== null 
                                ? `${prod.currency || '$'}${prod.lastPrice}`
                                : '—'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div>
          <SnapshotViewer competitorId={competitor.id} competitorName={competitor.name} />
        </div>
      </div>
    </div>
  );
}
