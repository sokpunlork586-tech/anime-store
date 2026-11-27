import { useState, useEffect } from 'react';
import { Save, Truck } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Button from '@/components/common/Button';

export default function ShippingSettings() {
  const { settings, updateSettings } = useApp();

  const [shippingForm, setShippingForm] = useState({
    freeShippingThreshold: (settings.shipping?.freeShippingThreshold ?? 50).toString(),
    standardRate: (settings.shipping?.standardRate ?? 5.99).toString(),
    expressRate: (settings.shipping?.expressRate ?? 12.99).toString(),
    currency: settings.currency || 'USD',
    currencySymbol: settings.currencySymbol || '$',
    taxRate: (settings.taxRate ?? 9).toString(),
  });

  useEffect(() => {
    setShippingForm({
      freeShippingThreshold: (settings.shipping?.freeShippingThreshold ?? 50).toString(),
      standardRate: (settings.shipping?.standardRate ?? 5.99).toString(),
      expressRate: (settings.shipping?.expressRate ?? 12.99).toString(),
      currency: settings.currency || 'USD',
      currencySymbol: settings.currencySymbol || '$',
      taxRate: (settings.taxRate ?? 9).toString(),
    });
  }, [settings]);

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shipping: {
        freeShippingThreshold: parseFloat(shippingForm.freeShippingThreshold) || 0,
        standardRate: parseFloat(shippingForm.standardRate) || 0,
        expressRate: parseFloat(shippingForm.expressRate) || 0,
        estimatedDays: settings.shipping?.estimatedDays || { standard: '5-7 business days', express: '1-3 business days' },
      },
      currency: shippingForm.currency,
      currencySymbol: shippingForm.currencySymbol,
      taxRate: parseFloat(shippingForm.taxRate) || 0,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2.5">
            <span>🚚</span> Shipping & Currency Policies
          </h1>
          {/* <p className="text-base text-text-secondary mt-1.5 font-medium">
            Configure shipping thresholds, rates, currency codes, and sales tax.
          </p> */}
        </div>
      </div>

      <form onSubmit={handleSaveShipping} className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-border-light shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border-light pb-3">
            <Truck size={20} className="text-primary" />
            <h3 className="text-[18px] font-semibold text-text-primary">Shipping Policies & Currency</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Free Shipping Over ($)</label>
              <input
                type="number"
                value={shippingForm.freeShippingThreshold}
                onChange={(e) => setShippingForm({ ...shippingForm, freeShippingThreshold: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Standard Shipping ($)</label>
              <input
                type="number"
                step="0.01"
                value={shippingForm.standardRate}
                onChange={(e) => setShippingForm({ ...shippingForm, standardRate: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Express Shipping ($)</label>
              <input
                type="number"
                step="0.01"
                value={shippingForm.expressRate}
                onChange={(e) => setShippingForm({ ...shippingForm, expressRate: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Currency Code</label>
              <input
                type="text"
                value={shippingForm.currency}
                onChange={(e) => setShippingForm({ ...shippingForm, currency: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Currency Symbol</label>
              <input
                type="text"
                value={shippingForm.currencySymbol}
                onChange={(e) => setShippingForm({ ...shippingForm, currencySymbol: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Tax Rate (%)</label>
              <input
                type="number"
                value={shippingForm.taxRate}
                onChange={(e) => setShippingForm({ ...shippingForm, taxRate: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={<Save size={18} />}>
            Save Shipping & Currency
          </Button>
        </div>
      </form>
    </div>
  );
}
