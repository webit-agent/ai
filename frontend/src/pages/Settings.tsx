import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings, NotificationSettings } from '../api/settings';
import { getTelegramLinkUrl } from '../api/telegram';
import apiClient from '../api/client';

export default function Settings() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);
  const [telegramSuccess, setTelegramSuccess] = useState('');

  const { data: userMe } = useQuery({
    queryKey: ['userMe'],
    queryFn: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    }
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const [formData, setFormData] = useState<NotificationSettings>({
    email_alerts: false,
    telegram_alerts: false,
    alert_threshold_percent: 0,
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      setToast({ message: 'Settings saved successfully', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: () => {
      setToast({ message: 'Failed to save settings', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  });

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleLinkTelegram = async () => {
    setIsLinkingTelegram(true);
    setTelegramSuccess('');
    try {
      const data = await getTelegramLinkUrl();
      window.open(data.botUrl, '_blank');
      setTelegramSuccess('A link has opened. Follow the instructions in Telegram to complete linking. The link expires in 15 minutes.');
    } catch (err) {
      setToast({ message: 'Failed to request Telegram link', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsLinkingTelegram(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} z-50`}>
          {toast.message}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
          <p className="mt-1 text-sm text-gray-500">Decide how and when you want to be notified of competitor changes.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="email_alerts"
                name="email_alerts"
                type="checkbox"
                checked={formData.email_alerts}
                onChange={(e) => setFormData({ ...formData, email_alerts: e.target.checked })}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="email_alerts" className="font-medium text-gray-700">Email Alerts</label>
              <p className="text-gray-500">Receive alerts via email.</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="telegram_alerts"
                name="telegram_alerts"
                type="checkbox"
                checked={formData.telegram_alerts}
                onChange={(e) => setFormData({ ...formData, telegram_alerts: e.target.checked })}
                disabled={!userMe?.telegram_chat_id}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded disabled:opacity-50"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="telegram_alerts" className={`font-medium ${userMe?.telegram_chat_id ? 'text-gray-700' : 'text-gray-400'}`}>Telegram Alerts</label>
              <p className="text-gray-500">
                {userMe?.telegram_chat_id ? 'Receive alerts via Telegram bot.' : 'Link Telegram first to enable alerts.'}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="alert_threshold" className="block text-sm font-medium text-gray-700">Alert Threshold %</label>
            <div className="mt-1 flex rounded-md shadow-sm w-32">
              <input
                type="number"
                name="alert_threshold"
                id="alert_threshold"
                min="0"
                step="0.1"
                value={formData.alert_threshold_percent}
                onChange={(e) => setFormData({ ...formData, alert_threshold_percent: parseFloat(e.target.value) || 0 })}
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 px-3 py-2 border"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                %
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500" id="threshold-description">Only notify me if the price changes by more than {formData.alert_threshold_percent}%.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Telegram Integration</h3>
          <div className="mt-4">
            {userMe?.telegram_chat_id ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ Telegram linked
              </span>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleLinkTelegram}
                  disabled={isLinkingTelegram}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLinkingTelegram ? 'Generating Link...' : 'Link Telegram'}
                </button>
                {telegramSuccess && <p className="mt-2 text-sm text-green-600 font-medium">{telegramSuccess}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
