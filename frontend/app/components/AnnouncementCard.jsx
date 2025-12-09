'use client';

import { MapPin, CheckCircle, Play, Star, Heart, Sparkles, Users, Video } from 'lucide-react';

const CATEGORY_BADGES = {
  miss: { label: 'Miss', class: 'badge-miss' },
  mr: { label: 'Mr.', class: 'badge-mr' },
  tmiss: { label: 'T-Miss', class: 'badge-tmiss' },
  virtual: { label: 'Virtual', class: 'badge-virtual' },
}

export default function AnnouncementCard({ announcement, onClick }) {
  const primaryMedia = announcement.media?.[0];
  const category = announcement.category?.slug || 'miss';
  const badge = CATEGORY_BADGES[category] || CATEGORY_BADGES.miss;
  
  const getPremiumBadge = () => {
    if (announcement.premium_level === 'vip') {
      return (
        <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold px-2.5 py-1 rounded-full shadow">
          VIP
        </span>
      );
    }
    if (announcement.premium_level === 'premium') {
      return (
        <span className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
          PREMIUM
        </span>
      );
    }
    return null;
  };

  return (
    <div 
      onClick={onClick} 
      className="bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/5]">
        <img 
          src={primaryMedia?.url || 'https://picsum.photos/400/500'} 
          alt={announcement.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Category badge */}
        <span className={`absolute top-2 left-2 ${badge.class} text-white text-xs font-medium px-2.5 py-1 rounded-full shadow`}>
          {badge.label}
        </span>
        
        {getPremiumBadge()}
        
        {announcement.has_video && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
            <Play size={14} className="text-white fill-white" />
          </div>
        )}
        
        {announcement.is_verified && (
          <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1.5 shadow">
            <CheckCircle size={12} className="text-white" />
          </div>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate flex-1">
            {announcement.stage_name || announcement.title}
          </h3>
          {announcement.age && (
            <span className="text-gray-500 text-sm ml-2">{announcement.age} anni</span>
          )}
        </div>
        
        <div className="flex items-center text-gray-500 text-sm">
          <MapPin size={14} className="mr-1.5 text-pink-500" />
          <span>{announcement.city?.name || 'Italia'}</span>
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <span className="text-pink-500 font-bold text-lg">
            €{announcement.price_1hour || '---'}/h
          </span>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span className="flex items-center gap-1">
              <Heart size={12} className="text-pink-400" />
              {announcement.likes_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Star size={12} className="text-amber-400" />
              {announcement.views_count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
