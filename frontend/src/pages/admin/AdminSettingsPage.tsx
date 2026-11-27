import React, { useState, useEffect } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  const handleReset = () => {
    setForm(settings);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F]">
          Website Settings
        </h2>
        <p className="mt-1 text-sm text-[#724A3E]">
          Changes saved here update the live storefront announcement bar, banners, shipping rules, and footer immediately.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 sm:p-8 space-y-6 shadow-2xs"
      >
        {/* Brand & Announcement */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#3D160F] pb-2 border-b border-[#F2E5D6]">
            Store Identity & Promotions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Footer Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
              Top Announcement Sale Message
            </label>
            <input
              type="text"
              value={form.announcementText}
              onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Promotional Banner Heading
              </label>
              <input
                type="text"
                value={form.promoBannerTitle}
                onChange={(e) => setForm({ ...form, promoBannerTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Promotional Banner Subtitle
              </label>
              <input
                type="text"
                value={form.promoBannerSubtitle}
                onChange={(e) => setForm({ ...form, promoBannerSubtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#3D160F] pb-2 border-b border-[#F2E5D6]">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Support Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
              Store Location Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
            />
          </div>
        </div>

        {/* Shipping & Pricing Rules */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#3D160F] pb-2 border-b border-[#F2E5D6]">
            Shipping & Membership Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Free Shipping Over ($)
              </label>
              <input
                type="number"
                min={0}
                value={form.freeShippingThreshold}
                onChange={(e) =>
                  setForm({ ...form, freeShippingThreshold: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Standard Shipping ($)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={form.standardShippingFee}
                onChange={(e) =>
                  setForm({ ...form, standardShippingFee: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Anime Club Discount (%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={form.clubDiscountPercent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    clubDiscountPercent: Math.min(50, Math.max(0, Number(e.target.value))),
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#EFE0CE] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DFC5AA] text-xs font-semibold text-[#5E3224] hover:bg-[#F7DCC3]/40 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
