export default function StatusBadge({ status }: { status: string }) {
  let color = 'bg-gray-100 text-gray-800';
  if (status === 'ok') color = 'bg-green-100 text-green-800';
  else if (status.startsWith('error') || status === 'broken') color = 'bg-red-100 text-red-800';
  else if (status === 'pending') color = 'bg-yellow-100 text-yellow-800';

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {status}
    </span>
  );
}
