import { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import { AppUser } from './models/user';

const emailOptions = [
  { value: '', label: 'Seçiniz' },
  { value: 'onur@esca-food.com', label: 'onur@esca-food.com' },
  { value: 'hayrullah@esca-food.com', label: 'hayrullah@esca-food.com' },
];

const userMap: Record<string, AppUser> = {
  'onur@esca-food.com': {
    id: 'onur',
    email: 'onur@esca-food.com',
    ad: 'Onur Öztürkler',
    aktifMi: true,
  },
  'hayrullah@esca-food.com': {
    id: 'hayrullah',
    email: 'hayrullah@esca-food.com',
    ad: 'Hayrullah',
    aktifMi: true,
  },
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('esca-webkasa-user');
    if (saved) {
      const user = userMap[saved];
      if (user) setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (rememberMe && currentUser) {
      localStorage.setItem('esca-webkasa-user', currentUser.email);
    } else if (!currentUser) {
      localStorage.removeItem('esca-webkasa-user');
    }
  }, [rememberMe, currentUser]);

  const handleLogin = () => {
    const user = userMap[selectedEmail];
    if (!user) return;
    setCurrentUser(user);
  };

  if (currentUser) {
    return <Dashboard currentUser={currentUser} onLogout={() => setCurrentUser(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 space-y-6 text-center">
        <img
          src="https://esca-food.com/image/cache/catalog/4c37f4a2-f31a-4f30-bf47-ada4e7fdaddd-700x800.png"
          alt="Esca Web Kasa"
          className="h-36 mx-auto object-contain"
        />
        <div className="text-2xl font-semibold">Giriş Yap</div>
        <div className="space-y-4 text-left">
          <div className="space-y-2">
            <label htmlFor="email">E-posta</label>
            <select
              id="email"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="w-full"
            >
              {emailOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="password">Şifre</label>
            <input id="password" type="password" className="w-full" placeholder="••••••" />
          </div>
          <label className="inline-flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded"
            />
            <span>Beni hatırla</span>
          </label>
          <button
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            onClick={handleLogin}
            disabled={!selectedEmail}
          >
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}
