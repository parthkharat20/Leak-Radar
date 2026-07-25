import { SiNetflix, SiSpotify, SiApple, SiYoutube } from 'react-icons/si';
import {
  TbBrandAmazon,
  TbBrandAdobe,
  TbBrandDisney,
  TbBrandGoogleOne,
} from 'react-icons/tb';

// Simple Icons (si) omits some trademark-restricted marks; Tabler brand icons fill those gaps.
const BRANDS = [
  { match: ['netflix'], Icon: SiNetflix, color: '#E50914' },
  { match: ['spotify'], Icon: SiSpotify, color: '#1DB954' },
  { match: ['amazon prime', 'prime video'], Icon: TbBrandAmazon, color: '#00A8E1' },
  { match: ['amazon'], Icon: TbBrandAmazon, color: '#00A8E1' },
  { match: ['adobe'], Icon: TbBrandAdobe, color: '#DA1F26' },
  { match: ['apple'], Icon: SiApple, color: '#F5F5F7' },
  { match: ['disney', 'hotstar'], Icon: TbBrandDisney, color: '#113CCF' },
  { match: ['youtube'], Icon: SiYoutube, color: '#FF0000' },
  { match: ['google one'], Icon: TbBrandGoogleOne, color: '#4285F4' },
];

export function getBrandIcon(serviceName) {
  const name = (serviceName || '').toLowerCase();
  for (const brand of BRANDS) {
    if (brand.match.some((token) => name.includes(token))) {
      return { Icon: brand.Icon, color: brand.color };
    }
  }
  return null;
}

export function getServiceInitials(serviceName) {
  if (!serviceName) return '?';
  const words = serviceName.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return serviceName.slice(0, 2).toUpperCase();
}

export function getPrimaryActionKey(recommendation) {
  const value = (recommendation || '').toLowerCase();
  if (value.includes('cancel')) return 'cancel';
  if (value.includes('negotiate')) return 'negotiate';
  if (
    value.includes('downgrade') ||
    value.includes('consolidate') ||
    value.includes('review') ||
    value.includes('switch to annual') ||
    value.includes('storage provider')
  ) {
    return 'downgrade';
  }
  return null;
}

export function getRecommendationBorderClass(recommendation) {
  const primary = getPrimaryActionKey(recommendation);
  if (primary === 'cancel') return 'border-l-rose-500';
  if (primary === 'downgrade') return 'border-l-amber-500';
  if (primary === 'negotiate') return 'border-l-indigo-500';
  return 'border-l-zinc-700';
}
