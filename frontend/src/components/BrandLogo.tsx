import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  layout?: 'stacked' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  tagline?: string;
  to?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  layout = 'stacked',
  size = 'md',
  tagline,
  to = '/',
}) => {
  const iconDims =
    size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-16 h-16' : 'w-14 h-14';
  const titleSize =
    size === 'sm'
      ? 'text-base leading-[1.05]'
      : size === 'lg'
        ? 'text-2xl leading-[1.02]'
        : 'text-[22px] leading-[1.02]';

  const content = (
    <div
      className={
        layout === 'horizontal'
          ? 'inline-flex items-center gap-2.5 group'
          : 'inline-flex flex-col items-center text-center group'
      }
    >
      {/* Cute Anime Cat Mascot matching the reference storefront */}
      <svg
        viewBox="0 0 80 72"
        className={`${iconDims} shrink-0 transition-transform duration-200 group-hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Left Ear */}
        <path
          d="M17 31L13 11C12.5 8.5 15.2 6.8 17.4 8.2L33 18"
          fill="#FFF8EF"
          stroke="#6A2B18"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M18 25L16.5 13.5L26.5 19.5" fill="#F0A576" />
        {/* Right Ear */}
        <path
          d="M63 31L67 11C67.5 8.5 64.8 6.8 62.6 8.2L47 18"
          fill="#FFF8EF"
          stroke="#6A2B18"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M62 25L63.5 13.5L53.5 19.5" fill="#F0A576" />
        {/* Head */}
        <ellipse
          cx="40"
          cy="41"
          rx="27"
          ry="23"
          fill="#FFF6EA"
          stroke="#6A2B18"
          strokeWidth="3.5"
        />
        {/* Forehead Stripes */}
        <path
          d="M40 19V27M34 20.5L35.5 26M46 20.5L44.5 26"
          stroke="#D96532"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Eyes */}
        <circle cx="29" cy="39" r="3.6" fill="#3D160F" />
        <circle cx="27.8" cy="37.7" r="1.2" fill="#FFFFFF" />
        <circle cx="51" cy="39" r="3.6" fill="#3D160F" />
        <circle cx="49.8" cy="37.7" r="1.2" fill="#FFFFFF" />
        {/* Rosy Cheeks */}
        <ellipse cx="22.5" cy="45.5" rx="4" ry="2.4" fill="#F29B72" opacity="0.65" />
        <ellipse cx="57.5" cy="45.5" rx="4" ry="2.4" fill="#F29B72" opacity="0.65" />
        {/* Nose & Cat Mouth */}
        <path d="M38 44.5H42L40 47Z" fill="#D96532" />
        <path
          d="M34.5 49.5C36 52 38.5 51.5 40 49C41.5 51.5 44 52 45.5 49.5"
          stroke="#6A2B18"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Whiskers */}
        <path
          d="M7 39H15M8 45L15 44M65 39H73M65 44L72 45"
          stroke="#6A2B18"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>

      <div className={layout === 'horizontal' ? 'text-left' : 'mt-1'}>
        <div
          className={`font-display font-extrabold tracking-tight text-[#5E2314] ${titleSize} whitespace-nowrap`}
        >
          {layout === 'horizontal' ? (
            <span>ANIME STORE</span>
          ) : (
            <>
              <span className="block">ANIME</span>
              <span className="block">STORE</span>
            </>
          )}
        </div>
        {tagline && (
          <p className="mt-1 text-xs font-medium tracking-wide text-[#6F4334] whitespace-nowrap">
            {tagline}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Link to={to} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96532] rounded-xl">
      {content}
    </Link>
  );
};
