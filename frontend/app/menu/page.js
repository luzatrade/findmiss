'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Settings, CreditCard, HelpCircle, LogOut, ChevronRight, 
  Heart, FileText, Crown, MessageCircle, Bell, Shield,
  ArrowLeft, Loader2, LayoutDashboard
} from 'lucide-react';

export default function MenuPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const menuItems = user ? [
    { icon: FileText, label: 'I miei annunci', href: '/my-announcements', color: 'text-pink-500' },
    { icon: Heart, label: 'Preferiti', href: '/saved', color: 'text-red-500' },
    { icon: MessageCircle, label: 'Messaggi', href: '/chat', color: 'text-blue-500' },
    { icon: CreditCard, label: 'Abbonamenti', href: '/payments', color: 'text-amber-500' },
    { icon: Bell, label: 'Notifiche', href: '/settings', color: 'text-green-500' },
    { icon: Settings, label: 'Impostazioni', href: '/settings', color: 'text-gray-500' },
    { icon: LayoutDashboard, label: 'Admin Panel', href: '/admin', color: 'text-indigo-500' },
  ] : [
    { icon: Heart, label: 'Preferiti', href: '/saved', color: 'text-red-500' },
    { icon: HelpCircle, label: 'Assistenza', href: '/policy', color: 'text-blue-500' },
    { icon: Shield, label: 'Privacy', href: '/policy', color: 'text-gray-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} className="text-gray-700" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Menu</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* User Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.nickname?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 text-lg">{user.nickname || 'Utente'}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {user.role === 'advertiser' && (
                    <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">
                      Inserzionista
                    </span>
                  )}
                  {user.is_verified && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      Verificato
                    </span>
                  )}
                </div>
              </div>
              <Link
                href="/profile/edit"
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Settings size={20} className="text-gray-400" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <User size={32} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-500 mb-2">Non hai effettuato l'accesso</p>
                <Link 
                  href="/auth"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition"
                >
                  Accedi / Registrati
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* VIP Banner */}
        {user && user.role !== 'vip' && (
          <Link
            href="/payments"
            className="block bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 text-black shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8" />
                <div>
                  <h3 className="font-bold">Diventa VIP</h3>
                  <p className="text-sm opacity-80">Ottieni massima visibilità</p>
                </div>
              </div>
              <ChevronRight size={24} />
            </div>
          </Link>
        )}

        {/* Menu Items */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100`}>
                    <Icon size={20} className={item.color} />
                  </div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </Link>
            );
          })}
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <Link
            href="/policy"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                <HelpCircle size={20} className="text-gray-500" />
              </div>
              <span className="font-medium text-gray-900">Assistenza</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
          <Link
            href="/policy"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                <Shield size={20} className="text-gray-500" />
              </div>
              <span className="font-medium text-gray-900">Privacy e Termini</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
        </div>

        {/* Logout */}
        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 text-red-500 bg-red-50 rounded-2xl hover:bg-red-100 transition font-medium"
          >
            <LogOut size={20} />
            <span>Esci dall'account</span>
          </button>
        )}

        {/* App Info */}
        <div className="text-center text-gray-400 text-sm py-4">
          <p>FindMiss v1.0</p>
          <p className="text-xs mt-1">© 2024 Tutti i diritti riservati</p>
        </div>
      </main>
    </div>
  );
}
