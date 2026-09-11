import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { register } from '../api/auth';
import { Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const loginAction = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await register({ email, password });
      loginAction(data.user, data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-xl shadow-indigo-600/25">C</div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create your workspace</h2>
          <p className="mt-2 text-sm text-gray-500">Start seeing competitor moves before they matter.</p>
        </div>
        <form className="space-y-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl shadow-slate-200/40 dark:shadow-black/20 sm:p-8" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                     className="input-field rounded-t-lg" placeholder="Email address" />
            </div>
            <div>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                     className="input-field rounded-b-lg" placeholder="Password" />
            </div>
          </div>
          <div>
            <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500">
              Register
            </button>
          </div>
          <div className="text-center text-sm">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
