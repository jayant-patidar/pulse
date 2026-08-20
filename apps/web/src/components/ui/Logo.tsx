import Image from 'next/image';

interface LogoProps {
  className?: string;
  forceDark?: boolean;
}

export function Logo({ className = '', forceDark = false }: LogoProps) {
  if (forceDark) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image 
          src="/logo-dark-new.png" 
          alt="Pulse Logo" 
          width={150} 
          height={150} 
          className="max-h-12 w-auto object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Light mode logo (hidden in dark mode) */}
      <Image 
        src="/logo-light-new.png" 
        alt="Pulse Logo" 
        width={150} 
        height={150} 
        className="block dark:hidden max-h-12 w-auto object-contain"
        priority
      />
      {/* Dark mode logo (hidden in light mode) */}
      <Image 
        src="/logo-dark-new.png" 
        alt="Pulse Logo" 
        width={150} 
        height={150} 
        className="hidden dark:block max-h-12 w-auto object-contain"
        priority
      />
    </div>
  );
}
