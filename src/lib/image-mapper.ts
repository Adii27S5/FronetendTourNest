import { API_BASE_URL } from '@/config/api';

// Dynamically load ALL assets safely to avoid Vite memory overhead
const globalAssets = import.meta.glob<{ default: string }>('@/assets/**/*.{png,jpg,jpeg}', { eager: true });

// Specific map for dynamic overrides & explicit mappings
const imageMap: Record<string, string> = {
  // Premium Remote Fallbacks for missing assets
  'delhi-haveli.png': 'https://images.unsplash.com/photo-1585129631248-1e43445cd867?auto=format&fit=crop&q=80&w=800',
  'agra-homestay.png': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800',
  'agra-stay.png': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800',
  'darjeeling-villa.png': 'https://images.unsplash.com/photo-1517330357046-3ab5a5dd42b1?auto=format&fit=crop&q=80&w=800',
  'jaipur-heritage.png': 'https://images.unsplash.com/photo-1599661559905-2423165b4c48?auto=format&fit=crop&q=80&w=800',
  'jaipur-haveli-stay.png': 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=800',
  'bhopal-boat.png': 'https://images.unsplash.com/photo-1582650047587-f82737604d53?auto=format&fit=crop&q=80&w=800',
  'poha-jalebi.png': 'https://images.unsplash.com/photo-1544985390-31d04b6847ba?auto=format&fit=crop&q=80&w=800',
  'bhopal-food.png': 'https://images.unsplash.com/photo-1544985390-31d04b6847ba?auto=format&fit=crop&q=80&w=800',
  'bhopal-hotel.png': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800',
  'munnar-resort.png': '/munnar_tea_resort.png',
  'kerala-paratha.png': 'https://images.unsplash.com/photo-1626500155551-5ee42cb6f007?auto=format&fit=crop&q=80&w=800',
  'ladakh-bikers.jpg': 'https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&q=80&w=800',
  'amritsar-stay.png': 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800',
  'bedai-jalebi.png': 'https://images.unsplash.com/photo-1544985390-31d04b6847ba?auto=format&fit=crop&q=80&w=800',
  'nihari.png': 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&q=80&w=800',
  'darjeeling-momos.png': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=800',
  'darjeeling-train.png': 'https://images.unsplash.com/photo-1582255280963-305888cd26e6?auto=format&fit=crop&q=80&w=800',
  'dal-baati-churma.png': 'https://images.unsplash.com/photo-1544985390-31d04b6847ba?auto=format&fit=crop&q=80&w=800',
  'agra-petha.png': 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&q=80&w=800',
  'kashmiri-rogan-josh.png': 'https://images.unsplash.com/photo-1544985390-31d04b6847ba?auto=format&fit=crop&q=80&w=800',
  'appam-stew.png': 'https://images.unsplash.com/photo-1626500155551-5ee42cb6f007?auto=format&fit=crop&q=80&w=800',
  'amritsar-kulcha.png': 'https://images.unsplash.com/photo-1544985390-31d04b6847ba?auto=format&fit=crop&q=80&w=800',
  'varanasi_chat.png': 'https://images.unsplash.com/photo-1544985390-31d04b6847ba?auto=format&fit=crop&q=80&w=800',
  'malaiyyo-dessert.png': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=800',
  'banarasi-paan.png': 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&q=80&w=800',
  'andaman-beach.jpg': 'https://images.unsplash.com/photo-1589394815804-964ed9be2eb3?auto=format&fit=crop&q=80&w=800'
};

// Iterate over loaded assets and match the filename automatically!
for (const [path, moduleConfig] of Object.entries(globalAssets)) {
  const filename = path.split('/').pop()!;
  
  // Register exactly by exact name
  imageMap[filename] = moduleConfig.default || (moduleConfig as any);
  
  // Map overrides mapped previously via aliases (e.g. hotel fallbacks)
  if (filename === 'varanasi-ghats.jpg') imageMap['varanasi-riverside.png'] = imageMap[filename];
  if (filename === 'qutub-minar.png') imageMap['delhi-lodge.png'] = imageMap[filename];
  if (filename === 'manali-snow.jpg') imageMap['manali-snow.jpg_hotel'] = imageMap[filename];
  if (filename === 'munnar-cottage.png') imageMap['munnar-mist.png'] = imageMap[filename];
  if (filename === 'varanasi-boutique.png') imageMap['varanasi-ghat-stay.png'] = imageMap[filename];
  if (filename === 'bhopal-boat.png') imageMap['bhopal-stay.png'] = imageMap[filename];
  if (filename === 'agra-food.png') imageMap['bedai-jalebi.png'] = imageMap[filename];
  if (filename === 'chole-bhature.png') imageMap['amritsar-kulcha.png'] = imageMap[filename];
}

export const resolveImage = (src: string) => {
  if (!src || typeof src !== 'string') return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';
  
  const cleanSrc = src.trim();
  
  // If it's already a full URL or relative path
  if (cleanSrc.startsWith('http') || cleanSrc.startsWith('data:') || cleanSrc.startsWith('/') || cleanSrc.startsWith('./')) {
    return cleanSrc;
  }
  
  // Try case-insensitive static mapping
  const mapped = imageMap[cleanSrc] || imageMap[cleanSrc.toLowerCase()];
  if (mapped) return mapped;

  // Fallback for dynamic uploads from backend
  if (cleanSrc.includes('.')) {
    return `${API_BASE_URL}/api/uploads/${cleanSrc}`;
  }
  
  // Global Default Fallback (Taj Mahal)
  return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';
};
