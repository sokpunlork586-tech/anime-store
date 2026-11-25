import LoginForm from '@/components/auth/LoginForm';
import AnimeStoreLogo from '@/components/auth/AnimeStoreLogo';
import BackgroundSwitcher from '@/components/auth/BackgroundSwitcher';
import { useApp } from '@/contexts/AppContext';
import authCleanBg from '@/assets/auth-clean-bg.jpg';
import bgSunsetFuji from '@/assets/bg-sunset-fuji.jpg';
import bgStarryNight from '@/assets/bg-starry-night.jpg';

export default function Login() {
  const { authBackground } = useApp();

  const getActiveBackground = () => {
    if (authBackground === 'sunset-fuji') return bgSunsetFuji;
    if (authBackground === 'starry-night') return bgStarryNight;
    if (authBackground && authBackground.startsWith('data:')) return authBackground;
    if (authBackground && authBackground !== 'default') return authBackground;
    return authCleanBg;
  };

  const bgImage = getActiveBackground();

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-[#FFF8EF]">
      {/* Background Anime Illustration covering the entire viewport */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Anime Store Background"
          className="w-full h-full object-cover object-left md:object-center transition-all duration-500"
        />
        {/* Subtle warm glow to enhance card separation on ultra-wide screens */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFF8EF]/10 to-[#FFF8EF]/40 pointer-events-none" />
      </div>

      {/* Floating Background Switcher */}
      <BackgroundSwitcher />

      {/* Main Content Container matching reference layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-end min-h-[85vh] py-3">
        {/* Floating Rounded White Card - made slightly smaller and more compact */}
        <div className="w-full sm:w-[390px] md:w-[400px] bg-white/95 backdrop-blur-md rounded-[24px] p-5 sm:p-6 shadow-[0_15px_45px_rgba(61,22,15,0.16)] border border-[#F0D9C4]/90 flex flex-col items-center animate-scale-in">
          {/* Brand Logo & Tagline */}
          <div className="mb-3">
            <AnimeStoreLogo size="sm" />
          </div>

          {/* Heading */}
          <h2 className="text-[24px] font-semibold text-text-primary mb-3 text-center">
            Login to Your Account
          </h2>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
