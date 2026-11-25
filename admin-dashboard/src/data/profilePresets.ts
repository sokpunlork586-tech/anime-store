// High-quality SVG preset avatars & logos designed for Anime Store Admin

export interface AvatarPreset {
  id: string;
  name: string;
  tag: string;
  svgDataUri: string;
}

export interface LogoPreset {
  id: string;
  name: string;
  tag: string;
  svgDataUri: string;
}

// 1. Anime Admin Avatar Presets
export const avatarPresets: AvatarPreset[] = [
  {
    id: 'hero-admin',
    name: 'Anime Hero (Reference)',
    tag: 'Protagonist',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23F7DCC3"/><path d="M18 52 Q15 16 50 10 Q85 16 82 52 Z" fill="%23241512"/><path d="M26 44 Q50 82 74 44 Z" fill="%23FFE3CD"/><path d="M22 36 Q38 18 50 32 Q62 18 78 36 Q68 46 50 40 Q32 46 22 36 Z" fill="%23381E19"/><ellipse cx="39" cy="46" rx="4.5" ry="5.5" fill="%233D160F"/><ellipse cx="61" cy="46" rx="4.5" ry="5.5" fill="%233D160F"/><circle cx="38" cy="44" r="1.5" fill="%23FFF"/><circle cx="60" cy="44" r="1.5" fill="%23FFF"/><path d="M44 56 Q50 61 56 56" stroke="%23D96532" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M20 86 L36 68 L50 78 L64 68 L80 86 L74 100 L26 100 Z" fill="%23D96532"/><polygon points="46,78 50,72 54,78 50,84" fill="%23FFF"/></svg>`,
  },
  {
    id: 'sakura-heroine',
    name: 'Sakura Mage',
    tag: 'Heroine',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23FDE2E4"/><path d="M16 55 Q12 14 50 8 Q88 14 84 55 Z" fill="%23E07A9A"/><path d="M26 44 Q50 82 74 44 Z" fill="%23FFF0E6"/><path d="M20 38 Q36 22 50 36 Q64 22 80 38 Q68 48 50 44 Q32 48 20 38 Z" fill="%23F28DA8"/><ellipse cx="38" cy="47" rx="4.5" ry="5.5" fill="%235C2B47"/><ellipse cx="62" cy="47" rx="4.5" ry="5.5" fill="%235C2B47"/><circle cx="37" cy="45" r="1.5" fill="%23FFF"/><circle cx="61" cy="45" r="1.5" fill="%23FFF"/><path d="M44 57 Q50 62 56 57" stroke="%23E07A9A" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="76" cy="32" r="5" fill="%23FFF" stroke="%23E07A9A" stroke-width="2"/><path d="M22 86 L38 70 L50 80 L62 70 L78 86 L72 100 L28 100 Z" fill="%23E07A9A"/></svg>`,
  },
  {
    id: 'shinobi-ninja',
    name: 'Konoha Shinobi',
    tag: 'Ninja',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23FFF1D6"/><path d="M14 42 L22 14 L42 26 L50 8 L58 26 L78 14 L86 42 Z" fill="%23F59E0B"/><path d="M26 44 Q50 82 74 44 Z" fill="%23FFE3CD"/><rect x="24" y="28" width="52" height="12" rx="3" fill="%23374151"/><rect x="36" y="30" width="28" height="8" rx="2" fill="%239CA3AF"/><ellipse cx="39" cy="48" rx="4" ry="5" fill="%230284C7"/><ellipse cx="61" cy="48" rx="4" ry="5" fill="%230284C7"/><circle cx="38" cy="46" r="1.5" fill="%23FFF"/><circle cx="60" cy="46" r="1.5" fill="%23FFF"/><line x1="28" y1="52" x2="35" y2="52" stroke="%23D97706" stroke-width="2"/><line x1="65" y1="52" x2="72" y2="52" stroke="%23D97706" stroke-width="2"/><path d="M44 58 Q50 64 56 58" stroke="%23D97706" stroke-width="2.5" fill="none"/><path d="M22 86 L50 72 L78 86 L70 100 L30 100 Z" fill="%23EA580C"/></svg>`,
  },
  {
    id: 'samurai-master',
    name: 'Silver Samurai',
    tag: 'Ronin',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23E0E7FF"/><path d="M18 50 Q16 12 50 10 Q84 12 82 50 Z" fill="%2394A3B8"/><path d="M26 44 Q50 82 74 44 Z" fill="%23FFE8D6"/><path d="M22 36 Q38 18 50 34 Q62 18 78 36 Z" fill="%23CBD5E1"/><ellipse cx="39" cy="46" rx="4" ry="5" fill="%231E293B"/><ellipse cx="61" cy="46" rx="4" ry="5" fill="%231E293B"/><circle cx="38" cy="44" r="1.5" fill="%23FFF"/><circle cx="60" cy="44" r="1.5" fill="%23FFF"/><path d="M44 56 Q50 60 56 56" stroke="%23475569" stroke-width="2.5" fill="none"/><path d="M20 86 L36 68 L50 76 L64 68 L80 86 L72 100 L28 100 Z" fill="%231E3A8A"/></svg>`,
  },
  {
    id: 'chibi-neko',
    name: 'Otaku Neko',
    tag: 'Mascot',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23FFF8EF"/><path d="M24 45 L14 15 L44 28 Z" fill="%23FFF" stroke="%23D96532" stroke-width="4"/><path d="M76 45 L86 15 L56 28 Z" fill="%23FFF" stroke="%23D96532" stroke-width="4"/><ellipse cx="50" cy="55" rx="36" ry="28" fill="%23FFF" stroke="%23D96532" stroke-width="4"/><ellipse cx="38" cy="52" rx="4" ry="5" fill="%233D160F"/><ellipse cx="62" cy="52" rx="4" ry="5" fill="%233D160F"/><circle cx="37" cy="50" r="1.5" fill="%23FFF"/><circle cx="61" cy="50" r="1.5" fill="%23FFF"/><ellipse cx="50" cy="58" rx="2" ry="1.5" fill="%23D96532"/><path d="M45 61 Q47.5 64 50 61 Q52.5 64 55 61" stroke="%23D96532" stroke-width="2.5" fill="none"/></svg>`,
  },
  {
    id: 'cyber-otaku',
    name: 'Mecha Pilot',
    tag: 'Sci-Fi',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23E0F2FE"/><path d="M18 50 Q16 14 50 10 Q84 14 82 50 Z" fill="%230284C7"/><path d="M26 44 Q50 82 74 44 Z" fill="%23FFE8D6"/><rect x="18" y="42" width="64" height="8" rx="4" fill="%2306B6D4" opacity="0.9"/><ellipse cx="39" cy="46" rx="4" ry="5" fill="%230369A1"/><ellipse cx="61" cy="46" rx="4" ry="5" fill="%230369A1"/><path d="M44 56 Q50 60 56 56" stroke="%230284C7" stroke-width="2.5" fill="none"/><path d="M20 86 L50 72 L80 86 L74 100 L26 100 Z" fill="%230F172A"/></svg>`,
  },
];

// 2. Dashboard Logo Presets
export const logoPresets: LogoPreset[] = [
  {
    id: 'cat-brand',
    name: 'Anime Cat (Reference)',
    tag: 'Signature',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><path d="M22 42 L14 10 L42 24 Z" fill="%23FFF" stroke="%23D96532" stroke-width="5" stroke-linejoin="round"/><path d="M22 36 L18 17 L35 26 Z" fill="%23F7DCC3"/><path d="M78 42 L86 10 L58 24 Z" fill="%23FFF" stroke="%23D96532" stroke-width="5" stroke-linejoin="round"/><path d="M78 36 L82 17 L65 26 Z" fill="%23F7DCC3"/><ellipse cx="50" cy="48" rx="36" ry="28" fill="%23FFF" stroke="%23D96532" stroke-width="5"/><ellipse cx="38" cy="46" rx="4" ry="4.5" fill="%233D160F"/><ellipse cx="62" cy="46" rx="4" ry="4.5" fill="%233D160F"/><circle cx="36.5" cy="44.5" r="1.5" fill="%23FFF"/><circle cx="60.5" cy="44.5" r="1.5" fill="%23FFF"/><ellipse cx="50" cy="52" rx="2" ry="1.5" fill="%23D96532"/><path d="M45 54 Q47.5 58 50 54 Q52.5 58 55 54" stroke="%23D96532" stroke-width="3" stroke-linecap="round" fill="none"/><line x1="16" y1="46" x2="28" y2="47" stroke="%23D96532" stroke-width="2.5" stroke-linecap="round"/><line x1="15" y1="52" x2="27" y2="51" stroke="%23D96532" stroke-width="2.5" stroke-linecap="round"/><line x1="84" y1="46" x2="72" y2="47" stroke="%23D96532" stroke-width="2.5" stroke-linecap="round"/><line x1="85" y1="52" x2="73" y2="51" stroke="%23D96532" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'torii-shrine',
    name: 'Torii Shrine Gate',
    tag: 'Traditional',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><path d="M12 18 Q50 14 88 18 L86 24 Q50 20 14 24 Z" fill="%23D96532"/><rect x="18" y="27" width="64" height="6" fill="%23D96532"/><rect x="28" y="24" width="8" height="52" fill="%23D96532"/><rect x="64" y="24" width="8" height="52" fill="%23D96532"/><rect x="47" y="24" width="6" height="18" fill="%233D160F"/><circle cx="50" cy="50" r="14" fill="%23D96532" opacity="0.2"/></svg>`,
  },
  {
    id: 'ramen-shop',
    name: 'Anime Ramen',
    tag: 'Foodie',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><path d="M18 36 Q50 32 82 36 Q80 72 50 72 Q20 72 18 36 Z" fill="%23D96532"/><ellipse cx="50" cy="36" rx="32" ry="8" fill="%23F7DCC3"/><path d="M30 24 Q34 16 30 10 M50 24 Q54 16 50 10 M70 24 Q74 16 70 10" stroke="%23D96532" stroke-width="3" stroke-linecap="round" fill="none"/><line x1="26" y1="20" x2="84" y2="8" stroke="%233D160F" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'sakura-crest',
    name: 'Sakura Crest',
    tag: 'Elegant',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><circle cx="50" cy="40" r="34" fill="%23F7DCC3" stroke="%23D96532" stroke-width="3"/><path d="M50 20 Q56 32 50 40 Q44 32 50 20 Z" fill="%23D96532"/><path d="M68 34 Q58 38 50 40 Q58 46 68 34 Z" fill="%23D96532"/><path d="M62 58 Q54 50 50 40 Q48 52 62 58 Z" fill="%23D96532"/><path d="M38 58 Q42 52 50 40 Q46 50 38 58 Z" fill="%23D96532"/><path d="M32 34 Q42 38 50 40 Q42 46 32 34 Z" fill="%23D96532"/><circle cx="50" cy="40" r="4" fill="%23FFF"/></svg>`,
  },
];
