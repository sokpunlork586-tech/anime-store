import { useState, useRef } from 'react';
import {
  Save, User, Upload, Trash2, Shield, Sparkles, Phone, Mail,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Button from '@/components/common/Button';
import { avatarPresets } from '@/data/profilePresets';
import { getInitials } from '@/utils/formatters';

export default function AdminProfile() {
  const { adminProfile, updateAdminProfile, addToast } = useApp();

  const [profileForm, setProfileForm] = useState({
    name: adminProfile.name || 'Admin',
    email: adminProfile.email || 'admin@animestore.com',
    role: adminProfile.role || 'Administrator',
    avatar: adminProfile.avatar || '',
    phone: adminProfile.phone || '+1 (555) 123-9876',
    bio: adminProfile.bio || 'Lead Administrator & Anime Merchandise Curator',
  });
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Handle Avatar File Upload (via FileReader)
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, SVG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setProfileForm((prev) => ({ ...prev, avatar: dataUri }));
      addToast('Avatar uploaded! Click "Save Profile Changes" to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile({
      name: profileForm.name.trim() || 'Admin',
      email: profileForm.email.trim(),
      role: profileForm.role.trim() || 'Administrator',
      avatar: profileForm.avatar,
      phone: profileForm.phone.trim(),
      bio: profileForm.bio.trim(),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2.5">
            <span>👤</span> Admin Profile Settings
          </h1>
          {/* <p className="text-base text-text-secondary mt-1.5 font-medium">
            Update your administrator name, email, role, avatar, and personal bio.
          </p> */}
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6 animate-fade-in">
        {/* Avatar & Hero Profile Preview Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border-light shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border-light pb-4">
            <div>
              <h3 className="text-[18px] font-semibold text-text-primary flex items-center gap-2">
                <User size={20} className="text-primary" /> Admin Avatar & Identity
              </h3>
              {/* <p className="text-sm text-text-muted mt-1">
                This avatar and name appear across the dashboard, top navigation, and sidebar.
              </p> */}
            </div>
            {/* <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1.5">
              <Shield size={14} /> Active Admin
            </span> */}
          </div>

          {/* Profile Avatar Live Preview & Controls */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Preview Box */}
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-secondary/50 border-4 border-white shadow-md flex items-center justify-center overflow-hidden text-2xl font-bold text-primary">
                {profileForm.avatar ? (
                  <img
                    src={profileForm.avatar}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(profileForm.name)
                )}
              </div>
              {profileForm.avatar && (
                <button
                  type="button"
                  onClick={() => setProfileForm((prev) => ({ ...prev, avatar: '' }))}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center shadow hover:bg-danger-dark transition cursor-pointer"
                  title="Remove avatar and use initials"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Upload Controls & URL input */}
            <div className="flex-1 space-y-3.5 w-full">
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                  icon={<Upload size={16} />}
                >
                  Upload Custom
                </Button>

                {/* <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setProfileForm((prev) => ({ ...prev, avatar: avatarPresets[0].svgDataUri }))}
                  icon={<Sparkles size={16} className="text-primary" />}
                >
                  Use Reference Anime Avatar
                </Button> */}
              </div>

              {/* Direct Image URL input */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  placeholder="Or paste external avatar image URL..."
                  className="flex-1 px-4 py-2.5 text-sm bg-background/50 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    if (avatarUrlInput.trim()) {
                      setProfileForm((prev) => ({ ...prev, avatar: avatarUrlInput.trim() }));
                      setAvatarUrlInput('');
                      addToast('Avatar URL loaded! Click "Save Changes" to apply.', 'info');
                    }
                  }}
                >
                  Apply URL
                </Button>
              </div>

              
            </div>
          </div>

          {/* Preset Anime Avatars Section */}
          <div className="space-y-3 pt-3 border-t border-border-light">
            <label className="block text-base font-semibold text-text-primary">
              Choose from Anime
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
              {avatarPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setProfileForm((prev) => ({ ...prev, avatar: preset.svgDataUri }))}
                  className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-2.5 ${
                    profileForm.avatar === preset.svgDataUri
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                      : 'border-border-light hover:border-secondary hover:bg-secondary/20'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary/30 border border-border-light flex items-center justify-center">
                    <img src={preset.svgDataUri} alt={preset.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary truncate max-w-[105px]">{preset.name}</p>
                    <span className="text-xs text-primary font-semibold">{preset.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border-light shadow-sm space-y-5">
          <h3 className="text-[18px] font-semibold text-text-primary border-b border-border-light pb-3">
            Administrator Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Admin Display Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="e.g. Admin / Naruto"
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Admin Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="admin@animestore.com"
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Role / Job Title</label>
              <input
                type="text"
                value={profileForm.role}
                onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                placeholder="e.g. Administrator / Super Admin"
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+1 (555) 123-9876"
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-base font-semibold text-text-primary mb-1.5">Bio / Notes</label>
              <textarea
                rows={2}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Brief administrator description..."
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={<Save size={18} />}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
