'use client';

import { MapPin, CheckCircle, Play, Star, Heart } from 'lucide-react';
import PropTypes from 'prop-types';

const CATEGORY_BADGES = {
  miss: { label: 'Miss', class: 'badge-miss' },
  mr: { label: 'Mr.', class: 'badge-mr' },
  tmiss: { label: 'T-Miss', class: 'badge-tmiss' },
  virtual: { label: 'Virtual', class: 'badge-virtual' },
}

/**
 * AnnouncementCard component
 * Displays a card for an announcement with image, badges, and details
 * @param {Object} props - Component props
 * @param {Object} props.announcement - Announcement object
 * @param {string} props.announcement.id - Announcement ID
 * @param {string} props.announcement.title - Announcement title
 * @param {string} [props.announcement.stage_name] - Stage name
 * @param {number} [props.announcement.age] - Age
 * @param {number} [props.announcement.price_1hour] - Price per hour
 * @param {boolean} [props.announcement.is_verified] - Verification status
 * @param {boolean} [props.announcement.has_video] - Has video
 * @param {string} [props.announcement.premium_level] - Premium level (vip|premium)
 * @param {number} [props.announcement.likes_count] - Number of likes
 * @param {number} [props.announcement.views_count] - Number of views
 * @param {Array} [props.announcement.media] - Media array
 * @param {Object} [props.announcement.city] - City object
 * @param {string} [props.announcement.city.name] - City name
 * @param {Object} [props.announcement.category] - Category object
 * @param {string} [props.announcement.category.slug] - Category slug
 * @param {Function} props.onClick - Click handler function
 */
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

AnnouncementCard.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    stage_name: PropTypes.string,
    age: PropTypes.number,
    price_1hour: PropTypes.number,
    is_verified: PropTypes.bool,
    has_video: PropTypes.bool,
    premium_level: PropTypes.oneOf(['vip', 'premium', null]),
    likes_count: PropTypes.number,
    views_count: PropTypes.number,
    media: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string
    })),
    city: PropTypes.shape({
      name: PropTypes.string
    }),
    category: PropTypes.shape({
      slug: PropTypes.string
    })
  }).isRequired,
  onClick: PropTypes.func.isRequired
}
