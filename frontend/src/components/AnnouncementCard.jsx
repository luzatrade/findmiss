'use client';

import { MapPin, CheckCircle, Play, Star } from 'lucide-react';

export default function AnnouncementCard({ announcement, onClick }) {
  const primaryMedia = announcement.media?.[0];
  
  const getPremiumBadge = () => {
    if (announcement.premium_level === 'vip') {
      return <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">VIP</span>;
    }
    if (announcement.premium_level === 'premium') {
      return <span className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">PREMIUM</span>;
    }
    return null;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-gray-900 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors"
    >
      <div className="relative aspect-[4/5]">
        <img
          src={primaryMedia?.url || 'https://picsum.photos/400/500'}
          alt={announcement.title}
          className="w-full h-full object-cover"
        />
        
        {getPremiumBadge()}
        
        {announcement.has_video && (
          <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
            <Play size={16} className="text-white fill-white" />
          </div>
        )}
        
        {announcement.is_verified && (
          <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1">
            <CheckCircle size={14} className="text-white" />
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-white truncate">
            {announcement.stage_name || announcement.title}
          </h3>
          {announcement.age && (
            <span className="text-gray-400 text-sm">{announcement.age} anni</span>
          )}
        </div>

        <div className="flex items-center text-gray-400 text-sm mb-2">
          <MapPin size={14} className="mr-1" />
          <span>{announcement.city?.name || 'Italia'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-pink-500 font-bold">
            €{announcement.price_1hour || '---'}/h
          </span>
          
          <div className="flex items-center text-gray-500 text-xs">
            <Star size={12} className="mr-1" />
            <span>{announcement.views_count} views</span>
          </div>
        </div>
      </div>
    </div>
  );
}