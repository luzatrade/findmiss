'use client';

import { Home, MapPin, Play, SlidersHorizontal, Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MapPin, label: 'Città', path: '/citta' },
    { icon: Play, label: 'Reel', path: '/reels' },
    { icon: SlidersHorizontal, label: 'Filtri', path: '/filtri' },
    { icon: Menu, label: 'Menu', path: '/menu' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-pink-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}