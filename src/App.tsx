import { useState } from 'react';
import Dashboard from './Dashboard';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { user, isLoading, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('E-posta ve şifre gereklidir');
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    try {
      await login(email, password);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Giriş yapılamadı';
      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Token doğrulanırken kısa yükleme ekranı (refresh'te login formu flash etmesin)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Yükleniyor...</div>
      </div>
    );
  }

  if (user) {
    return <Dashboard currentUser={user} onLogout={logout} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 space-y-6 text-center">
        <img
          src="https://esca-food.com/image/cache/catalog/4c37f4a2-f31a-4f30-bf47-ada4e7fdaddd-700x800.png"
          alt="Esca Web Kasa"
          className="h-72 w-full max-w-xs sm:max-w-sm mx-auto object-contain"
        />
        <div className="text-2xl font-semibold">Giriş Yap</div>
        <div className="space-y-4 text-left">
          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
              {loginError}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email">E-posta</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              placeholder="ornek@esca-food.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              placeholder="••••••"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
            />
          </div>
          <button
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            onClick={handleLogin}
            disabled={!email || !password || isSubmitting}
          >
            {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </div>
      </div>
    </div>
  );
}
