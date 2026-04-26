import { API_BASE_URL } from '@/config/api';

// Eagerly load all assets from the relative assets directory
const allAssets: Record<string, any> = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,svg}', { eager: true });

// Build a flat map of filename -> hashedUrl
const assetMap: Record<string, string> = {};
Object.entries(allAssets).forEach(([path, module]) => {
  const fileName = path.split('/').pop() || '';
  if (fileName) assetMap[fileName] = module.default;
});

// Explicit Unsplash fallbacks or local aliases for missing assets
const manualAliasMap: Record<string, string> = {
  // Unsplash Premium Fallbacks
  'agra-stay.png': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800',
  'agra-homestay.png': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800',
  'delhi-haveli.png': 'https://images.unsplash.com/photo-1585129631248-1e43445cd867?auto=format&fit=crop&q=80&w=800',
  'darjeeling-villa.png': 'https://images.unsplash.com/photo-1517330357046-3ab5a5dd42b1?auto=format&fit=crop&q=80&w=800',
  'bhopal-hotel.png': 'https://images.unsplash.com/photo-1599661559905-2423165b4c48?auto=format&fit=crop&q=80&w=800',
  'itc-grand-chola.png': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
  'andaman-beach.jpg': 'https://images.unsplash.com/photo-1589394815804-964ed9be2eb3?auto=format&fit=crop&q=80&w=800',
  
  // Local Aliases (Mapping missing names to existing assets)
  'bhopal-boat.png': 'bhopal-lake.png',
  'bhopal-stay.png': 'bhopal-lake.png',
  'delhi-lodge.png': 'delhi-lodge-new.png',
  'varanasi-ghat-stay.png': 'varanasi-boutique.png',
  'varanasi-riverside.png': 'varanasi-ghats.jpg',
  'munnar-resort.png': 'munnar-cottage.png',
  'munnar-mist.png': 'munnar-mist-premium.png',
  'munnar-valley.png': 'munnar-valley-premium.png',
  'jaipur-haveli-stay.png': 'jaipur-haveli.jpg',
  'amritsar-stay.png': 'golden-temple.png',
  'gulmarg-ski-resort.png': 'gulmarg-new.png',
  'havelock-eco.png': 'havelock-eco-new.png',
  'ladakh-lodge.png': 'ladakh-bikers.png',
  'ladakh-bikers.jpg': 'ladakh-bikers.png',
  'manali-snow-stay.png': 'manali-cloud-9.png',
  'poha-jalebi.png': 'bhopal-food.png',
  'bedai-jalebi.png': 'chole-bhature.png',
  'nihari.png': 'kashmiri-rogan-josh.png',
  'darjeeling-momos.png': 'kolkata-food.png',
  'agra-petha.png': 'kolkata-food.png',
  'appam-stew.png': 'kolkata-food.png',
  'amritsar-kulcha.png': 'chole-bhature.png',
  'varanasi_chat.png': 'chole-bhature.png',
  'malaiyyo-dessert.png': 'kolkata-food.png',
  'andaman-scuba.png': 'havelock-scuba.png',
};

export const resolveImage = (src: string) => {
  if (!src || typeof src !== 'string') return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';

  const cleanSrc = src.trim();

  // 1. Full URLs or Data URIs
  if (cleanSrc.startsWith('http') || cleanSrc.startsWith('data:')) {
    return cleanSrc;
  }

  // 2. Manual Alias Map (Recursive resolve)
  const baseName = cleanSrc.split('/').pop() || '';
  const alias = manualAliasMap[baseName] || manualAliasMap[baseName.toLowerCase()];
  
  // If alias is a full URL, return it
  if (alias && alias.startsWith('http')) return alias;
  
  // 3. Local Asset Map (Check alias first, then original)
  const targetName = alias || baseName;
  const resolvedLocal = assetMap[targetName] || assetMap[targetName.toLowerCase()];
  if (resolvedLocal) return resolvedLocal;

  // 4. Smart Fallback (Keywords in filename)
  const lower = baseName.toLowerCase();
  if (lower.includes('beach')) return assetMap['goa-beach.jpg'];
  if (lower.includes('snow') || lower.includes('ski')) return assetMap['manali-snow.jpg'];
  if (lower.includes('heritage') || lower.includes('palace')) return assetMap['jaipur-haveli.jpg'];
  if (lower.includes('tea') || lower.includes('mist') || lower.includes('valley')) return assetMap['munnar-tea.jpg'];
  if (lower.includes('food') || lower.includes('jalebi') || lower.includes('paan')) return assetMap['kolkata-food.png'];
  if (lower.includes('spiritual') || lower.includes('temple')) return assetMap['varanasi-ghats.jpg'];
  if (lower.includes('boat') || lower.includes('lake') || lower.includes('water')) return assetMap['kerala-houseboat.jpg'];

  // 5. Dynamic Uploads
  if (cleanSrc.includes('.') && !cleanSrc.startsWith('/')) {
    return `${API_BASE_URL}/api/uploads/${cleanSrc}`;
  }

  // 6. Global Default (High quality Indian landscape)
  return 'https://images.unsplash.com/photo-1524492707947-2f85a514d735?auto=format&fit=crop&q=80&w=1200';
};
