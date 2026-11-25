import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  align = 'center',
}) => {
  if (align === 'left') {
    return (
      <div className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3D160F] tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 text-sm md:text-base text-[#724A3E]">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className="mb-6 text-center">
      <div className="flex items-center justify-center gap-4">
        <span className="h-px flex-1 max-w-[140px] sm:max-w-[240px] bg-gradient-to-r from-transparent to-[#DFC5AA]" />
        <h2 className="font-display text-2xl md:text-[30px] font-bold text-[#3D160F] tracking-tight whitespace-nowrap">
          {title}
        </h2>
        <span className="h-px flex-1 max-w-[140px] sm:max-w-[240px] bg-gradient-to-l from-transparent to-[#DFC5AA]" />
      </div>
      {subtitle && <p className="mt-1.5 text-sm text-[#724A3E] max-w-xl mx-auto">{subtitle}</p>}
    </div>
  );
};
