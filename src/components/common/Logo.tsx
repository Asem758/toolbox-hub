import React from 'react';
import transparentLogo from '../../assets/images/toolbox_hub_logo_tight.png';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  withHoverEffect?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  withHoverEffect = true,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div
        className={`relative shrink-0 flex items-center justify-center bg-transparent ${
          withHoverEffect ? 'group-hover:scale-105' : ''
        } transition-transform duration-200 ${sizeClasses[size]}`}
      >
        <img
          src={transparentLogo}
          alt="ToolBox Hub Logo"
          className="w-full h-full object-contain select-none drop-shadow-sm"
        />
      </div>
      {showText && (
        <span
          className={`font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 ${textClasses[size]}`}
        >
          <span>ToolBox</span>
          <span className="text-indigo-600 dark:text-indigo-400">Hub</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
