import { API_BASE_URL } from '@/config/api';

// Explicit static imports to guarantee bundling and trigger HMR
import auliCabinImg from '@/assets/auli-cabin.png';
import shimlaHeritageImg from '@/assets/shimla-heritage.png';
import varkalaCliffImg from '@/assets/varkala-cliff.png';
import palolemBeachImg from '@/assets/palolem-beach.png';
import jaipurFoodImg from '@/assets/jaipur-food.png';
import kolkataFoodImg from '@/assets/kolkata-food.png';
import amritsarFoodImg from '@/assets/amritsar-food.png';
import theyyamImg from '@/assets/theyyam.png';
import sufiMusicImg from '@/assets/sufi-music.png';
import baulSingersImg from '@/assets/baul-singers.png';

// Static URL map — no glob, no eager loading, zero startup cost
const imageMap: Record<string, string> = {
  // Unsplash remote fallbacks
  'delhi-haveli.png': 'https://images.unsplash.com/photo-1585129631248-1e43445cd867?auto=format&fit=crop&q=80&w=800',
  'agra-homestay.png': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800',
  'agra-stay.png': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800',
  'darjeeling-villa.png': 'https://images.unsplash.com/photo-1517330357046-3ab5a5dd42b1?auto=format&fit=crop&q=80&w=800',
  'jaipur-heritage.png': '/src/assets/jaipur-heritage.png',
  'jaipur-haveli-stay.png': '/src/assets/jaipur-heritage.png',
  'bhopal-boat.png': '/src/assets/bhopal-lake.png',
  'bhopal-stay.png': '/src/assets/bhopal-lake.png',
  'poha-jalebi.png': '/src/assets/bhopal-food.png',
  'bhopal-food.png': '/src/assets/bhopal-food.png',
  'bhopal-hotel.png': 'https://images.unsplash.com/photo-1599661559905-2423165b4c48?auto=format&fit=crop&q=80&w=800',
  'munnar-resort.png': '/src/assets/munnar-cottage.png',
  'kerala-paratha.png': '/src/assets/banarasi-paan.png',
  'ladakh-bikers.jpg': '/src/assets/ladakh-bikers.png',
  'amritsar-stay.png': '/src/assets/golden-temple.png',
  'bedai-jalebi.png': '/src/assets/chole-bhature.png',
  'nihari.png': '/src/assets/kashmiri-rogan-josh.png',
  'darjeeling-momos.png': '/src/assets/kolkata-food.png',
  'darjeeling-train.png': '/src/assets/munnar-tea.jpg',
  'dal-baati-churma.png': '/src/assets/dal-baati-churma.png',
  'agra-petha.png': '/src/assets/kolkata-food.png',
  'kashmiri-rogan-josh.png': '/src/assets/kashmiri-rogan-josh.png',
  'appam-stew.png': '/src/assets/kolkata-food.png',
  'amritsar-kulcha.png': '/src/assets/chole-bhature.png',
  'varanasi_chat.png': '/src/assets/chole-bhature.png',
  'malaiyyo-dessert.png': '/src/assets/kolkata-food.png',
  'banarasi-paan.png': '/src/assets/banarasi-paan.png',
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
  'delhi-lodge.png': '/src/assets/delhi-lodge-new.png',
  'munnar-cottage.png': '/src/assets/munnar-cottage.png',
  'munnar-mist.png': '/src/assets/munnar-mist-premium.png',
  'munnar-valley.png': '/src/assets/munnar-valley-premium.png',
  'tea-safari.png': '/src/assets/tea-safari.png',
  'dal-lake.png': '/src/assets/dal-lake.png',
  'ganges-aarti.png': '/src/assets/ganges-aarti.png',
  'taj-mahal-sunrise.png': '/src/assets/taj-mahal-sunrise.png',
  'golden-temple.png': '/src/assets/golden-temple.png',
  'mahabalipuram.png': '/src/assets/mahabalipuram.png',
  'chole-bhature.png': '/src/assets/chole-bhature.png',
  'udaipur-lake.png': '/src/assets/udaipur-lake.png',
  'shimla-snow.png': '/src/assets/shimla-snow.png',
  'havelock-eco.png': '/src/assets/havelock-eco-new.png',
  'manali-snow-stay.png': '/src/assets/manali-snow-stay.png',
  'gulmarg-ski-resort.png': '/src/assets/gulmarg-new.png',
  'oberoi-amarvilas.png': '/src/assets/oberoi-amarvilas.png',
  'leela-palace.png': '/src/assets/leela-palace.png',
  'udaipur-floating-palace.png': '/src/assets/udaipur-floating-palace.png',
  'glenburn-tea.png': '/src/assets/glenburn-tea.png',
  'itc-grand-chola.png': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
  'rishikesh-yoga.png': '/src/assets/rishikesh-yoga.png',
  'tirupati-balaji.png': '/src/assets/tirupati-balaji.png',
  'kathakali-dance.png': '/src/assets/kathakali-dance.png',
  'rajputana-walk.png': '/src/assets/rajputana-walk.png',
  'victoria-memorial.png': '/src/assets/victoria-memorial.png',
  'manali-paragliding.png': '/src/assets/manali-paragliding.png',
  'havelock-scuba.png': '/src/assets/havelock-scuba.png',
  
  // New unique images
  'auli-cabin.png': auliCabinImg,
  'shimla-heritage.png': shimlaHeritageImg,
  'varkala-cliff.png': varkalaCliffImg,
  'palolem-beach.png': palolemBeachImg,
  'jaipur-food.png': jaipurFoodImg,
  'kolkata-food.png': kolkataFoodImg,
  'amritsar-food.png': amritsarFoodImg,
  'theyyam.png': theyyamImg,
  'sufi-music.png': sufiMusicImg,
  'baul-singers.png': baulSingersImg
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
