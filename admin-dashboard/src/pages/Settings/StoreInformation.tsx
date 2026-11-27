import { useState, useEffect } from 'react';
import { Save, Store, Globe } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Button from '@/components/common/Button';

export default function StoreInformation() {
  const { settings, updateSettings } = useApp();

  const [storeForm, setStoreForm] = useState({
    storeDescription: settings.storeDescription || '',
    email: settings.email || '',
    phone: settings.phone || '',
    address: settings.address || '',
    city: settings.city || '',
    country: settings.country || '',
    facebook: settings.socialMedia?.facebook || '',
    instagram: settings.socialMedia?.instagram || '',
    twitter: settings.socialMedia?.twitter || '',
    youtube: settings.socialMedia?.youtube || '',
  });

  useEffect(() => {
    setStoreForm({
      storeDescription: settings.storeDescription || '',
      email: settings.email || '',
      phone: settings.phone || '',
      address: settings.address || '',
      city: settings.city || '',
      country: settings.country || '',
      facebook: settings.socialMedia?.facebook || '',
      instagram: settings.socialMedia?.instagram || '',
      twitter: settings.socialMedia?.twitter || '',
      youtube: settings.socialMedia?.youtube || '',
    });
  }, [settings]);

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeDescription: storeForm.storeDescription,
      email: storeForm.email,
      phone: storeForm.phone,
      address: storeForm.address,
      city: storeForm.city,
      country: storeForm.country,
      socialMedia: {
        facebook: storeForm.facebook,
        instagram: storeForm.instagram,
        twitter: storeForm.twitter,
        youtube: storeForm.youtube,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2.5">
            <span>🏪</span> Store Information Settings
          </h1>
          {/* <p className="text-base text-text-secondary mt-1.5 font-medium">
            Manage your store contact details, physical address, and social links.
          </p> */}
        </div>
      </div>

      <form onSubmit={handleSaveStore} className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border-light shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border-light pb-3">
            <Store size={20} className="text-primary" />
            <h3 className="text-[18px] font-semibold text-text-primary">Store Contact & Location</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-base font-semibold text-text-primary mb-1.5">Store Description</label>
              <textarea
                rows={2}
                value={storeForm.storeDescription}
                onChange={(e) => setStoreForm({ ...storeForm, storeDescription: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Contact Email</label>
              <input
                type="email"
                value={storeForm.email}
                onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Support Phone</label>
              <input
                type="text"
                value={storeForm.phone}
                onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Address</label>
              <input
                type="text"
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">City & State</label>
              <input
                type="text"
                value={storeForm.city}
                onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border-light shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border-light pb-3">
            <Globe size={20} className="text-primary" />
            <h3 className="text-[18px] font-semibold text-text-primary">Social Media Links</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Facebook URL</label>
              <input
                type="text"
                value={storeForm.facebook}
                onChange={(e) => setStoreForm({ ...storeForm, facebook: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Instagram URL</label>
              <input
                type="text"
                value={storeForm.instagram}
                onChange={(e) => setStoreForm({ ...storeForm, instagram: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Twitter / X URL</label>
              <input
                type="text"
                value={storeForm.twitter}
                onChange={(e) => setStoreForm({ ...storeForm, twitter: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">YouTube URL</label>
              <input
                type="text"
                value={storeForm.youtube}
                onChange={(e) => setStoreForm({ ...storeForm, youtube: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={<Save size={18} />}>
            Save Store Information
          </Button>
        </div>
      </form>
    </div>
  );
}
