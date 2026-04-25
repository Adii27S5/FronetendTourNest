import { API_BASE_URL } from '@/config/api';

// Static URL map — no glob, no eager loading, zero startup cost
const imageMap: Record<string, string> = {
  // Unsplash remote fallbacks
  'delhi-haveli.png': 'https://images.unsplash.com/photo-1585129631248-1e43445cd867?auto=format&fit=crop&q=80&w=800',
  'agra-homestay.png': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800',
  'agra-stay.png': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800',
  'darjeeling-villa.png': 'https://images.unsplash.com/photo-1517330357046-3ab5a5dd42b1?auto=format&fit=crop&q=80&w=800',
  'jaipur-heritage.png': 'https://images.unsplash.com/photo-1599661559905-2423165b4c48?auto=format&fit=crop&q=80&w=800',
  'jaipur-haveli-stay.png': 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=800',
  'bhopal-boat.png': 'https://images.unsplash.com/photo-1582650047587-f82737604d53?auto=format&fit=crop&q=80&w=800',
  'bhopal-stay.png': 'https://images.unsplash.com/photo-1582650047587-f82737604d53?auto=format&fit=crop&q=80&w=800',
  'poha-jalebi.png': 'https://images.unsplash.com/photo-1544985390-31d04b6847ba?auto=format&fit=crop&q=80&w=800',
  'bhopal-food.png': 'https://images.unsplash.com/photo-1544985390-31d04b6847ba?auto=format&fit=crop&q=80&w=800',
  'bhopal-hotel.png': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800',
  'munnar-resort.png': 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=800',
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
  'andaman-beach.jpg': 'https://images.unsplash.com/photo-1589394815804-964ed9be2eb3?auto=format&fit=crop&q=80&w=800',
  // Local asset paths (Vite hashed at build)
  'varanasi-ghats.jpg': '/src/assets/varanasi-ghats.jpg',
  'varanasi-riverside.png': '/src/assets/varanasi-ghats.jpg',
  'varanasi-ghat-stay.png': '/src/assets/varanasi-boutique.png',
  'varanasi-boutique.png': '/src/assets/varanasi-boutique.png',
  'jaipur-haveli.jpg': '/src/assets/jaipur-haveli.jpg',
  'manali-snow.jpg': '/src/assets/manali-snow.jpg',
  'kerala-houseboat.jpg': '/src/assets/kerala-houseboat.jpg',
  'goa-beach.jpg': '/src/assets/goa-beach.jpg',
  'munnar-tea.jpg': '/src/assets/munnar-tea.jpg',
  'qutub-minar.png': '/src/assets/qutub-minar.png',
  'delhi-lodge.png': '/src/assets/qutub-minar.png',
  'munnar-cottage.png': '/src/assets/munnar-cottage.png',
  'munnar-mist.png': '/src/assets/munnar-mist-premium.png',
  'munnar-valley.png': '/src/assets/munnar-valley-premium.png',
  'tea-safari.png': '/src/assets/tea-safari.png',
  'dal-lake.png': '/src/assets/dal-lake.png',
  'ganges-aarti.png': '/src/assets/ganges-aarti.png',
  'taj-mahal-sunrise.png': '/src/assets/taj-mahal-sunrise.png',
  'golden-temple.png': '/src/assets/golden-temple.png',
  'mahabalipuram.png': '/src/assets/mahabalipuram.png',
  'kolkata-food.png': '/src/assets/kolkata-food.png',
  'chole-bhature.png': '/src/assets/chole-bhature.png',
  'udaipur-lake.png': '/src/assets/udaipur-lake.png',
  'shimla-snow.png': '/src/assets/shimla-snow.png',
  'dal-lake.png': '/src/assets/dal-lake.png',
  'havelock-eco.png': '/src/assets/havelock-eco.png',
};

export const resolveImage = (src: string) => {
  if (!src || typeof src !== 'string') return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';

  const cleanSrc = src.trim();

  // Already a full URL, data URI or absolute/relative path — return as-is
  if (cleanSrc.startsWith('http') || cleanSrc.startsWith('data:') || cleanSrc.startsWith('/') || cleanSrc.startsWith('./')) {
    return cleanSrc;
  }

  // Try static map (case-insensitive)
  const mapped = imageMap[cleanSrc] || imageMap[cleanSrc.toLowerCase()];
  if (mapped) return mapped;

  // Dynamic uploads from backend
  if (cleanSrc.includes('.')) {
    return `${API_BASE_URL}/api/uploads/${cleanSrc}`;
  }

  // Global default
  return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';
};
