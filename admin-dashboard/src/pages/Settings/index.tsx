import { useSearchParams } from 'react-router-dom';
import AdminProfile from './AdminProfile';
import DashboardBranding from './DashboardBranding';
import StoreInformation from './StoreInformation';
import ShippingSettings from './ShippingSettings';

export { AdminProfile, DashboardBranding, StoreInformation, ShippingSettings };

export default function SettingsIndex() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';

  if (tab === 'branding') return <DashboardBranding />;
  if (tab === 'store') return <StoreInformation />;
  if (tab === 'shipping') return <ShippingSettings />;
  return <AdminProfile />;
}
