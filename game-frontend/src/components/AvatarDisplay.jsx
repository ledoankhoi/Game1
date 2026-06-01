import React, { useState, useEffect, useMemo } from 'react';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

let cachedItems = null;
let cachedPromise = null;
function getShopItems() {
  if (cachedItems) return Promise.resolve(cachedItems);
  if (cachedPromise) return cachedPromise;
  cachedPromise = fetch('/api/shop/items')
    .then(r => r.json())
    .then(data => {
      cachedItems = data.items || data.data || [];
      return cachedItems;
    })
    .catch(() => { cachedItems = []; return cachedItems; });
  return cachedPromise;
}

const getFrameStyle = (frameId) => {
  if (frameId === 'frame_gold') return "border-2 border-yellow-400 shadow-[0_0_10px_#facc15]";
  if (frameId === 'frame_neon') return "border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee]";
  if (frameId === 'frame_fire') return "border-2 border-red-500 shadow-[0_0_10px_#ef4444]";
  return "border-2 border-primary shadow-sm";
};

const getBadgeIcon = (badgeId) => {
  switch(badgeId) {
    case 'rookie': return { icon: 'verified', color: 'text-orange-500' };
    case 'firstBlood': return { icon: 'sports_esports', color: 'text-blue-500' };
    case 'richMan': return { icon: 'monetization_on', color: 'text-yellow-500' };
    case 'streak7': return { icon: 'local_fire_department', color: 'text-red-500' };
    default: return { icon: 'stars', color: 'text-yellow-500' };
  }
};

const CATEGORY_STYLES = {
  hair:   'absolute top-0 left-1/2 -translate-x-1/2 z-20 w-[120%] max-w-none',
  face:   'absolute top-0 left-1/2 -translate-x-1/2 z-20 w-full h-full',
  shirt:  'absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-full',
  wings:  'absolute -top-1/4 left-1/2 -translate-x-1/2 z-0 scale-150 opacity-70',
  accessory: 'absolute top-1/4 right-0 z-20 w-1/2',
  shoes:  'absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 w-2/3',
  pants:  'absolute bottom-1/4 left-1/2 -translate-x-1/2 z-10 w-3/4',
  skin:   'absolute inset-0 z-5',
};

function AvatarDisplay({ user, items: propItems = [], size = 'md', showBadge = true, showFrame = true }) {
  const [fetchedItems, setFetchedItems] = useState([]);
  const allItems = propItems.length > 0 ? propItems : fetchedItems;

  useEffect(() => {
    if (propItems.length > 0) return;
    getShopItems().then(setFetchedItems);
  }, [propItems]);

  const equippedItems = useMemo(() => {
    if (!user?.equipped) return [];
    const equipped = user.equipped;
    const overlaySlots = ['hair', 'face', 'shirt', 'wings', 'accessory', 'shoes', 'pants'];
    return overlaySlots
      .map(slot => {
        const itemId = equipped[slot];
        if (!itemId || itemId === 'none') return null;
        const itemData = allItems.find(i => i.itemId === itemId);
        return { slot, itemId, itemData };
      })
      .filter(Boolean);
  }, [user?.equipped, allItems]);

  const sizeClasses = size === 'lg'
    ? 'w-[120px] h-[120px]'
    : size === 'sm'
    ? 'w-8 h-8'
    : 'w-10 h-10';

  const frameClass = showFrame && user?.equipped?.frame
    ? getFrameStyle(user.equipped.frame)
    : 'border-2 border-primary shadow-sm';

  const badge = user?.equipped?.badge && user?.equipped?.badge !== 'none' && showBadge
    ? getBadgeIcon(user.equipped.badge)
    : null;

  const avatarSrc = user?.avatarUrl || DEFAULT_AVATAR;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses}`}>
      <div className={`relative w-full h-full rounded-full overflow-hidden bg-white ${frameClass}`}>
        <img
          src={avatarSrc}
          className="w-full h-full object-cover"
          alt="Avatar"
          draggable={false}
        />
        {equippedItems.map(({ slot, itemData }) => {
          const overlayUrl = itemData?.assetUrl;
          if (!overlayUrl) return null;
          return (
            <img
              key={slot}
              src={overlayUrl}
              alt=""
              className={CATEGORY_STYLES[slot] || 'absolute inset-0 z-10'}
              draggable={false}
            />
          );
        })}
      </div>
      {badge && (
        <div className="absolute -top-1 -right-1 z-30 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-md transform rotate-12">
          <span className={`material-symbols-outlined text-[10px] md:text-[12px] ${badge.color}`}>
            {badge.icon}
          </span>
        </div>
      )}
    </div>
  );
}

export default AvatarDisplay;
