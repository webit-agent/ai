import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAlerts } from '../api/alerts';
import { Link } from 'react-router-dom';

export default function AlertsBell() {
  const { data: alerts } = useQuery({
    queryKey: ['alerts', 'unread'],
    queryFn: () => getAlerts(true),
    refetchInterval: 30000
  });

  const count = alerts?.length || 0;

  return (
    <Link to="/alerts" className="relative p-2 text-gray-400 hover:text-gray-500">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
