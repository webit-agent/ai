import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts, markAlertRead, markAllRead } from '../api/alerts';
import { Link } from 'react-router-dom';

function timeSince(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export default function Alerts() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Price Changes' | 'Broken Links' | 'Page Changes'>('All');

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', 'all'],
    queryFn: () => getAlerts(false)
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => markAlertRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });

  const readAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  const filteredAlerts = alerts?.filter((alert: any) => {
    if (filter === 'Unread') return !alert.read_at;
    if (filter === 'Price Changes') return alert.alert_type === 'price_change';
    if (filter === 'Broken Links') return alert.alert_type === 'broken_link';
    if (filter === 'Page Changes') return alert.alert_type === 'content_change';
    return true;
  }) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Alerts</h1>
        <button 
          onClick={() => readAllMutation.mutate()} 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-900 border border-indigo-600 rounded px-4 py-2 hover:bg-indigo-50"
        >
          Mark all as read
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['All', 'Unread', 'Price Changes', 'Broken Links', 'Page Changes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${filter === tab 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAlerts.length === 0 ? (
            <li className="p-8 text-center text-gray-500">
              No alerts found for this filter.
            </li>
          ) : filteredAlerts.map((alert: any) => (
            <li key={alert.id} className={`p-4 ${!alert.read_at ? 'bg-indigo-50' : 'bg-white'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alert.alert_type === 'price_change' 
                        ? 'bg-green-100 text-green-800' 
                        : alert.alert_type === 'content_change'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {alert.alert_type === 'price_change' 
                        ? 'Price Change' 
                        : alert.alert_type === 'content_change' 
                        ? 'Page Change' 
                        : 'Broken Link'}
                    </span>
                    {alert.competitor_name && (
                      <span className="text-xs font-medium text-gray-500">
                        [{alert.competitor_name}]
                      </span>
                    )}
                    {alert.product && (
                      <Link to={`/product/${alert.product.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                        {alert.product.name}
                      </Link>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mt-2">
                    {alert.alert_type === 'price_change' ? (
                      <span className="flex items-center gap-2">
                        <span className="line-through text-gray-500">{alert.old_value}</span>
                        <span>→</span>
                        <span className="font-bold">{alert.new_value}</span>
                      </span>
                    ) : alert.alert_type === 'content_change' ? (
                      <span>Competitor homepage change detected (hash: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{alert.old_value}</code> → <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{alert.new_value}</code>)</span>
                    ) : (
                      'We could not reach the product page. The link might be broken.'
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{timeSince(alert.sent_at)}</p>
                </div>
                {!alert.read_at && (
                  <button onClick={() => readMutation.mutate(alert.id)} className="ml-4 text-xs bg-white border border-gray-300 rounded px-3 py-1.5 text-gray-700 hover:bg-gray-50 font-medium">
                    Mark Read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
