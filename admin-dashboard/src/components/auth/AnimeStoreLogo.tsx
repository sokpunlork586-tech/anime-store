export default function AnimeStoreLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <div className="flex flex-col items-center select-none text-center">
      {/* Cute Anime Cat Head Icon */}
      <div className="relative mb-2">
        <svg
          width={isLarge ? "84" : isSmall ? "56" : "68"}
          height={isLarge ? "70" : isSmall ? "46" : "56"}
          viewBox="0 0 100 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Left Cat Ear */}
          <path
            d="M 22 42 L 14 10 L 42 24 Z"
            fill="#FFF"
            stroke="#D96532"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M 22 36 L 18 17 L 35 26 Z"
            fill="#F7DCC3"
          />

          {/* Right Cat Ear */}
          <path
            d="M 78 42 L 86 10 L 58 24 Z"
            fill="#FFF"
            stroke="#D96532"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M 78 36 L 82 17 L 65 26 Z"
            fill="#F7DCC3"
          />

          {/* Head Shape */}
          <ellipse
            cx="50"
            cy="48"
            rx="36"
            ry="28"
            fill="#FFF"
            stroke="#D96532"
            strokeWidth="5"
          />

          {/* Eyes (Cute anime dots) */}
          <ellipse cx="38" cy="46" rx="4" ry="4.5" fill="#3D160F" />
          <ellipse cx="62" cy="46" rx="4" ry="4.5" fill="#3D160F" />
          {/* Eye shines */}
          <circle cx="36.5" cy="44.5" r="1.5" fill="#FFF" />
          <circle cx="60.5" cy="44.5" r="1.5" fill="#FFF" />

          {/* Cute Nose and W-shaped Mouth */}
          <ellipse cx="50" cy="52" rx="2" ry="1.5" fill="#D96532" />
          <path
            d="M 45 54 Q 47.5 58 50 54 Q 52.5 58 55 54"
            stroke="#D96532"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cute Whiskers */}
          <line x1="16" y1="46" x2="28" y2="47" stroke="#D96532" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="15" y1="52" x2="27" y2="51" stroke="#D96532" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="84" y1="46" x2="72" y2="47" stroke="#D96532" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="85" y1="52" x2="73" y2="51" stroke="#D96532" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Title */}
      <h2
        className={`font-black font-heading tracking-wider text-text-primary ${
          isLarge ? "text-2xl" : isSmall ? "text-lg" : "text-xl"
        }`}
      >
        ANIME STORE
      </h2>

      {/* Tagline with elegant horizontal dividers */}
      <div className="flex items-center gap-2 mt-1">
        <span className="w-6 h-[1px] bg-border" />
        <p className="text-xs font-medium text-text-secondary tracking-widest">
          Dream • Collect • Enjoy
        </p>
        <span className="w-6 h-[1px] bg-border" />
      </div>
    </div>
  );
}
