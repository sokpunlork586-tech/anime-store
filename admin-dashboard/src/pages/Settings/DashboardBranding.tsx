import { useState, useRef } from 'react';
import {
  Save, Palette, Upload, RefreshCw,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Button from '@/components/common/Button';
import { logoPresets } from '@/data/profilePresets';

export default function DashboardBranding() {
  const { settings, updateSettings, addToast } = useApp();

  const [brandingForm, setBrandingForm] = useState({
    storeName: settings.storeName || 'Anime Store',
    storeTagline: settings.storeTagline || 'Dream • Collect • Enjoy',
    storeLogo: settings.storeLogo || '',
  });
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (SVG, PNG, JPG)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setBrandingForm((prev) => ({ ...prev, storeLogo: dataUri }));
      addToast('Dashboard logo uploaded! Click "Save Branding & Logo" to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: brandingForm.storeName.trim() || 'Anime Store',
      storeTagline: brandingForm.storeTagline.trim(),
      storeLogo: brandingForm.storeLogo,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2.5">
            <span>🎨</span> Dashboard & Logo Branding
          </h1>
          {/* <p className="text-base text-text-secondary mt-1.5 font-medium">
            Customize the store name, brand tagline, and dashboard logo icon.
          </p> */}
        </div>
      </div>

      <form onSubmit={handleSaveBranding} className="space-y-6 animate-fade-in">
        {/* Logo Upload & Live Preview Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border-light shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border-light pb-4">
            <div>
              <h3 className="text-[18px] font-semibold text-text-primary flex items-center gap-2">
                <Palette size={20} className="text-primary" /> Dashboard Store Logo
              </h3>
              {/* <p className="text-sm text-text-muted mt-1">
                Update the main store logo displayed at the top of the sidebar and authentication screens.
              </p> */}
            </div>
          </div>

          {/* Logo Preview Comparison (Sidebar scale vs Full scale) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Scale 1: Sidebar Appearance Preview */}
            <div className="p-5 bg-background/60 rounded-2xl border border-border-light space-y-3">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Sidebar Live Scale Preview
              </span>
              <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-border-light shadow-xs max-w-sm">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
                  {brandingForm.storeLogo ? (
                    <img src={brandingForm.storeLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-2xl">🏪</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold font-heading text-primary leading-tight truncate">
                    {brandingForm.storeName || 'ANIME STORE'}
                  </h4>
                  <p className="text-xs text-text-muted truncate tracking-wider mt-0.5">
                    {brandingForm.storeTagline || 'Dream • Collect • Enjoy'}
                  </p>
                </div>
              </div>
            </div>

            {/* Scale 2: Large Icon Preview */}
            <div className="p-5 bg-background/60 rounded-2xl border border-border-light space-y-3 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Store Logo High-Res
              </span>
              <div className="w-20 h-20 rounded-2xl bg-white border border-border-light shadow-sm flex items-center justify-center p-2.5 overflow-hidden">
                {brandingForm.storeLogo ? (
                  <img src={brandingForm.storeLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-3xl">🏪</span>
                )}
              </div>
            </div>
          </div>

          {/* Upload Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              icon={<Upload size={16} />}
            >
              Upload Logo File (SVG / PNG)
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setBrandingForm((prev) => ({ ...prev, storeLogo: logoPresets[0].svgDataUri }))}
              icon={<RefreshCw size={16} />}
            >
              Reset to Reference Anime Cat
            </Button>
          </div>

          {/* Direct Image URL input */}
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={logoUrlInput}
              onChange={(e) => setLogoUrlInput(e.target.value)}
              placeholder="Or paste external logo image URL..."
              className="flex-1 px-4 py-2.5 text-sm bg-background/50 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                if (logoUrlInput.trim()) {
                  setBrandingForm((prev) => ({ ...prev, storeLogo: logoUrlInput.trim() }));
                  setLogoUrlInput('');
                  addToast('Logo URL applied! Click "Save Branding" to persist.', 'info');
                }
              }}
            >
              Apply URL
            </Button>
          </div>

          {/* Preset Logo Selection */}
          <div className="space-y-3 pt-3 border-t border-border-light">
            <label className="text-sm font-bold text-text-primary uppercase tracking-wider block">
              Choose from Japanese Anime Logo Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {logoPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setBrandingForm((prev) => ({ ...prev, storeLogo: preset.svgDataUri }))}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-2.5 ${
                    brandingForm.storeLogo === preset.svgDataUri
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                      : 'border-border-light hover:border-secondary hover:bg-secondary/20'
                  }`}
                >
                  <div className="w-16 h-12 bg-white rounded-xl border border-border-light p-1.5 flex items-center justify-center">
                    <img src={preset.svgDataUri} alt={preset.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{preset.name}</p>
                    <span className="text-xs text-primary font-semibold">{preset.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Store Name & Tagline Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border-light shadow-sm space-y-5">
          <h3 className="text-[18px] font-semibold text-text-primary border-b border-border-light pb-3">
            Store Brand Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Store / Dashboard Name</label>
              <input
                type="text"
                value={brandingForm.storeName}
                onChange={(e) => setBrandingForm({ ...brandingForm, storeName: e.target.value })}
                placeholder="e.g. Anime Store"
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Brand Tagline</label>
              <input
                type="text"
                value={brandingForm.storeTagline}
                onChange={(e) => setBrandingForm({ ...brandingForm, storeTagline: e.target.value })}
                placeholder="e.g. Dream • Collect • Enjoy"
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={<Save size={18} />}>
            Save Branding & Logo
          </Button>
        </div>
      </form>
    </div>
  );
}
