
interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 'h-8 w-16',
  md: 'h-12 w-24',
  lg: 'h-16 w-32',
  xl: 'h-24 w-48',
};

export function PulseLoader({ size = 'md', text, fullScreen = false }: PulseLoaderProps) {
  const dimension = sizeMap[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* SVG EKG Heartbeat Animation */}
      <div className={`relative flex items-center justify-center ${dimension}`}>
        <svg 
          viewBox="0 0 100 50" 
          className="w-full h-full stroke-brand-600 dark:stroke-brand-400 fill-transparent overflow-visible"
          style={{ strokeWidth: '4', strokeLinecap: 'round', strokeLinejoin: 'round' }}
        >
          {/* Faded background track */}
          <path 
            d="M 0 25 L 20 25 L 30 10 L 40 45 L 50 5 L 60 40 L 70 25 L 100 25" 
            className="stroke-brand-200 dark:stroke-brand-900"
          />
          {/* Animated drawing line */}
          <path 
            d="M 0 25 L 20 25 L 30 10 L 40 45 L 50 5 L 60 40 L 70 25 L 100 25" 
            className="animate-[dash_2s_linear_infinite]"
            style={{
              strokeDasharray: '100 100', // adjust dash length to match path length roughly
            }}
          />
        </svg>

        {/* Global style for the dash animation */}
        <style>{`
          @keyframes dash {
            0% { stroke-dashoffset: 200; }
            100% { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>
      
      {text && (
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[100px]">
      {content}
    </div>
  );
}
