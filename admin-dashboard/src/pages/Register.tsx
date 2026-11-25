import RegisterForm from '@/components/auth/RegisterForm';
import AnimeStoreLogo from '@/components/auth/AnimeStoreLogo';
import authBg from '@/assets/auth-clean-bg.jpg';

export default function Register() {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-[#FFF8EF]">
      {/* Background Anime Illustration */}
      <div className="absolute inset-0 z-0">
        <img
          src={authBg}
          alt="Anime Store Background"
          className="w-full h-full object-cover object-left"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFF8EF]/10 to-[#FFF8EF]/40 pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-end min-h-[85vh] py-4">

        {/* Right Side Card */}
        <div className="w-full sm:w-[390px] md:w-[400px] bg-white/95 backdrop-blur-md rounded-[24px] p-5 sm:p-6 shadow-[0_15px_45px_rgba(61,22,15,0.16)] border border-[#F0D9C4]/80 flex flex-col items-center animate-scale-in">
          {/* Logo */}
          <div className="mb-2.5">
            <AnimeStoreLogo size="sm" />
          </div>

          {/* Heading */}
          <h2 className="text-[24px] font-semibold text-text-primary mb-3 text-center">
            Create Your Account
          </h2>

          {/* Register Form */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
