import React, { useRef, useState } from 'react';
import { Palette, Upload, Check, RefreshCw, X, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import authCleanBg from '@/assets/auth-clean-bg.jpg';
import bgSunsetFuji from '@/assets/bg-sunset-fuji.jpg';
import bgStarryNight from '@/assets/bg-starry-night.jpg';

export interface BgPreset {
  id: string;
  name: string;
  thumbnail: string;
  image: string;
}

export const defaultPresets: BgPreset[] = [
  {
    id: 'default',
    name: 'Naruto & Sakura Pagoda',
    thumbnail: authCleanBg,
    image: authCleanBg,
  },
  {
    id: 'sunset-fuji',
    name: 'Mount Fuji Sunset',
    thumbnail: bgSunsetFuji,
    image: bgSunsetFuji,
  },
  {
    id: 'starry-night',
    name: 'Anime Starry Night',
    thumbnail: bgStarryNight,
    image: bgStarryNight,
  },
];

export default function BackgroundSwitcher() {
  const { authBackground, setAuthBackground } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setAuthBackground(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3.5 py-2 bg-white/90 hover:bg-white text-text-primary text-xs font-semibold rounded-xl shadow-md border border-[#F0D9C4] backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
        title="Change Background"
      >
        <Palette size={16} className="text-primary" />
        <span className="hidden sm:inline">Change Background</span>
      </button>

      {/* Background Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-border animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-primary" />
                <h3 className="font-bold font-heading text-text-primary text-base">
                  Choose Background (ផ្លាស់ប្ដូរ Background)
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary/50 text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Presets List */}
            <div className="py-4 space-y-3">
              <p className="text-xs text-text-secondary font-medium">Select an Anime Theme Preset:</p>

              <div className="grid grid-cols-3 gap-2.5">
                {defaultPresets.map((preset) => {
                  const isSelected = authBackground === preset.id || (!authBackground && preset.id === 'default');
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAuthBackground(preset.id)}
                      className={`relative group rounded-xl overflow-hidden border-2 transition-all p-0.5 text-left cursor-pointer ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 scale-102'
                          : 'border-border-light hover:border-primary/50'
                      }`}
                    >
                      <div className="h-20 w-full rounded-lg overflow-hidden relative">
                        <img
                          src={preset.thumbnail}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-md">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-text-primary truncate px-1 pt-1.5 pb-0.5 text-center">
                        {preset.name}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Upload Custom Wallpaper */}
              <div className="pt-2">
                <p className="text-xs text-text-secondary font-medium mb-2">Or Upload Your Own Wallpaper:</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-border hover:border-primary bg-secondary/15 hover:bg-secondary/30 text-text-secondary hover:text-primary transition-all cursor-pointer text-xs font-semibold"
                >
                  <Upload size={16} />
                  <span>Upload from Device (JPG, PNG, WebP)</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Reset to Default */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthBackground('default')}
                  className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary cursor-pointer font-medium"
                >
                  <RefreshCw size={12} /> Reset to Default
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
