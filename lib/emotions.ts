export const EMOTIONS = [
  { id: 'joy',       az: 'Sevinc',       en: 'Joy',       color: '#F1C40F' },
  { id: 'grief',     az: 'Kədər',        en: 'Grief',     color: '#2C3E50' },
  { id: 'fear',      az: 'Qorxu',        en: 'Fear',      color: '#8E44AD' },
  { id: 'anger',     az: 'Qəzəb',        en: 'Anger',     color: '#C0392B' },
  { id: 'love',      az: 'Sevgi',        en: 'Love',      color: '#E91E8C' },
  { id: 'hate',      az: 'Nifrət',       en: 'Hate',      color: '#922B21' },
  { id: 'hope',      az: 'Ümid',         en: 'Hope',      color: '#27AE60' },
  { id: 'despair',   az: 'Ümidsizlik',   en: 'Despair',   color: '#1B4F72' },
  { id: 'tension',   az: 'Gərginlik',    en: 'Tension',   color: '#D35400' },
  { id: 'relief',    az: 'Rahatlama',    en: 'Relief',    color: '#1ABC9C' },
  { id: 'shame',     az: 'Utanc',        en: 'Shame',     color: '#616161' },
  { id: 'pride',     az: 'Qürur',        en: 'Pride',     color: '#2D2B6B' },
  { id: 'doubt',     az: 'Şübhə',        en: 'Doubt',     color: '#795548' },
  { id: 'resolve',   az: 'Qərarlılıq',   en: 'Resolve',   color: '#138D75' },
] as const;

export type EmotionId = typeof EMOTIONS[number]['id'];
