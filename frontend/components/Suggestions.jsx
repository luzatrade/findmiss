'use client';
import Link from 'next/link';
import { MapPin, Star, Heart } from 'lucide-react';

export default function Suggestions() {
  const suggestions = [
    {
      id: 2,
      name: 'Giulia',
      age: 23,
      city: 'Roma',
      price: 120,
      image: 'https://picsum.photos/150x200?random=20',
      verified: true,
      vip: false,
      rating: 4.6,
      online: true
    },
    {
      id: 3,
      name: 'Alessia',
      age: 27,
      city: 'Milano',
      price: 180,
      image: 'https://picsum.photos/150x200?random=21',
      verified: true,
      vip: true,
      rating: 4.9,
      online: false
    },
    {
      id: 4,
      name: 'Chiara',
      age: 25,
      city: 'Torino',
      price: 140,
      image: 'https://picsum.photos/150x200?random=22',
      verified: false,
      vip: false,
      rating: 4.3,
      online: true
    },
    {
      id: 5,
      name: 'Martina',
      age: 22,
      city: 'Bologna',
      price: 100,
      image: 'https://picsum.photos/150x200?random=23',
      verified: true,
      vip: false,
      rating: 4.7,
      online: false
    }
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 hidden lg:block">
      <h3 className="font-bold text-lg mb-4">Suggerimenti</h3>
      <div className="space-y-4">
        {suggestions.map((girl) => (
          <Link key={girl.id} href={`/profile/${girl.id}`} className="block hover:bg-gray-50 rounded-lg p-2 transition">
            <div className="flex space-x-3">
              <div className="relative flex-shrink-0">
                <img 
                  src={girl.image} 
                  alt={girl.name}
                  className="w-16 h-20 rounded object-cover"
                />
                {girl.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h4 className="font-semibold text-sm truncate">{girl.name}, {girl.age}</h4>
                  {girl.verified && (
                    <Star size={12} className="text-blue-500 ml-1" />
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  <MapPin size={10} className="mr-1" />
                  <span className="truncate">{girl.city}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-pink-500 font-bold text-sm">{girl.price}€</span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Star size={10} className="text-yellow-500 fill-yellow-500 mr-1" />
                    {girl.rating}
                  </div>
                </div>
                {girl.vip && (
                  <div className="inline-block bg-yellow-500 text-black text-xs px-1 rounded font-bold mt-1">
                    VIP
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
