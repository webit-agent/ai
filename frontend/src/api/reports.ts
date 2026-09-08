import apiClient from './client';

/**
 * Downloads the weekly PDF report as a Blob and triggers a browser download.
 */
export async function downloadWeeklyReport(): Promise<void> {
  const response = await apiClient.get('/reports/weekly.pdf', {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `competitor-report-${new Date().toISOString().split('T')[0]}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
