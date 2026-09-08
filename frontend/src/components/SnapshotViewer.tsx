import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSnapshots, getLatestScreenshotUrl, ContentSnapshot } from '../api/snapshots';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SnapshotViewerProps {
  competitorId: string;
  competitorName: string;
}

export default function SnapshotViewer({ competitorId, competitorName }: SnapshotViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: snapshots, isLoading } = useQuery({
    queryKey: ['snapshots', competitorId],
    queryFn: () => getSnapshots(competitorId)
  });

  if (isLoading) return <div className="p-4 text-gray-500">Loading snapshots...</div>;

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        No screenshots taken yet. Content monitoring runs daily at 2am.
      </div>
    );
  }

  const latestUrl = getLatestScreenshotUrl(competitorId);
  const displayedSnapshots = expanded ? snapshots : snapshots.slice(0, 3);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Latest Screenshot - {competitorName}</h3>
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <img src={latestUrl} alt={`Latest screenshot of ${competitorName}`} className="w-full h-full object-cover" />
        </div>
      </div>
      
      <div className="p-4">
        <div 
          className="flex justify-between items-center cursor-pointer mb-4"
          onClick={() => setExpanded(!expanded)}
        >
          <h4 className="text-md font-medium text-gray-900">Screenshot History</h4>
          <button className="text-gray-500 hover:text-gray-700">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        <ul className="space-y-3">
          {displayedSnapshots.map((snap: ContentSnapshot) => (
            <li key={snap.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                {new Date(snap.taken_at).toLocaleString()}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400" title="Page Hash">
                  {snap.page_hash.substring(0, 8)}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  snap.change_detected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {snap.change_detected ? '🔴 Changed' : '✅ Same'}
                </span>
              </div>
            </li>
          ))}
        </ul>
        
        {!expanded && snapshots.length > 3 && (
          <div className="mt-4 text-center">
            <button 
              onClick={() => setExpanded(true)}
              className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
            >
              View all {snapshots.length} snapshots
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
