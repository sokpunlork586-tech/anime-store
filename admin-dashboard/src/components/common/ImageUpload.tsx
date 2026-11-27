import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link2 } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

const PRESET_PRODUCT_IMAGES = [
  { label: 'Goku / Warrior', url: '/images/products/prod_warrior_figure_1795162308415.jpg' },
  { label: 'Nezuko / Kimono', url: '/images/products/prod_kimono_figure_1795162305963.jpg' },
  { label: 'Naruto / Ninja', url: '/images/products/prod_ninja_figure_1795162308489.jpg' },
  { label: 'Luffy / Captain', url: '/images/products/prod_captain_figure_1795162307219.jpg' },
  { label: 'Swordsman Figure', url: '/images/products/prod_figure_swordsman_1795178548045.jpg' },
  { label: 'Manga Box Set', url: '/images/products/prod_manga_collection_1795162321332.jpg' },
  { label: 'Wall Scroll', url: '/images/products/prod_wall_scroll_1795162312280.jpg' },
  { label: 'Accessories Pack', url: '/images/products/prod_accessories_pack_1795162343404.jpg' },
  { label: 'Keychain Charms', url: '/images/products/prod_keychain_charm_1795178526696.jpg' },
  { label: 'Streetwear Hoodie', url: '/images/products/prod_hoodie_streetwear_1795178529403.jpg' },
  { label: 'Cloud Haori', url: '/images/products/prod_cloud_haori_1795162308256.jpg' },
  { label: 'Enamel Pins', url: '/images/products/prod_enamel_pins_1795178526698.jpg' },
  { label: 'Forest Plush', url: '/images/products/prod_forest_plush_1795162309765.jpg' },
  { label: 'Cat Plush', url: '/images/products/prod_plush_cat_1795178554650.jpg' },
  { label: 'Collectible Lamp', url: '/images/products/prod_collectible_lamp_1795178524570.jpg' },
];

export default function ImageUpload({ images, onChange, maxImages = 5, label = 'Product Images' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = maxImages - images.length;
    const newFiles = Array.from(files).slice(0, remaining);
    if (newFiles.length === 0) return;

    const results = await Promise.all(
      newFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve((e.target?.result as string) || '');
            reader.readAsDataURL(file);
          })
      )
    );
    const valid = results.filter(Boolean);
    if (valid.length > 0) {
      onChange([...images, ...valid]);
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed || images.length >= maxImages) return;
    if (!images.includes(trimmed)) {
      onChange([...images, trimmed]);
    }
    setUrlInput('');
  };

  const handleTogglePreset = (url: string) => {
    if (images.includes(url)) {
      onChange(images.filter((img) => img !== url));
    } else if (images.length < maxImages) {
      onChange([...images, url]);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-base font-semibold text-text-primary mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border-light bg-secondary/20">
            <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
              ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/20'}`}
          >
            {dragOver ? <ImageIcon size={20} className="text-primary" /> : <Upload size={20} className="text-text-muted" />}
            <span className="text-xs text-text-muted mt-1">Upload</span>
          </div>
        )}
      </div>

      {/* Add image by URL */}
      {images.length < maxImages && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              placeholder="Or paste an image URL..."
              className="w-full pl-8 pr-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 text-text-primary text-[14px] font-medium transition cursor-pointer"
          >
            Add URL
          </button>
        </div>
      )}

      {/* Quick Preset Product Images */}
      <div>
        <p className="text-xs font-medium text-text-muted mb-2">Or select from store product gallery:</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_PRODUCT_IMAGES.map((preset) => {
            const active = images.includes(preset.url);
            return (
              <button
                key={preset.url}
                type="button"
                onClick={() => handleTogglePreset(preset.url)}
                title={preset.label}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                  active ? 'border-primary ring-2 ring-primary/25' : 'border-border-light hover:border-primary/50'
                }`}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
