import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AlertsBell from './AlertsBell';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';

export default function Navbar() {
  const { logout, user } = useAuthStore();
  
  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-indigo-600">CompTracker</Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/comparison" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                Comparison
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/add-competitor" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
              Add Competitor
            </Link>
            <AlertsBell />
            <Link to="/settings" className="text-gray-400 hover:text-gray-500">
              <SettingsIcon className="h-5 w-5" />
            </Link>
            <div className="text-sm text-gray-500">{user?.email}</div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-gray-500">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
