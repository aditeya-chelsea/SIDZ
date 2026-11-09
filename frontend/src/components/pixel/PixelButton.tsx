import React from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'pink' | 'purple' | 'cyan' | 'green' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'yellow',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  let colorStyle = 'bg-[#fef08a] text-pixel-dark';
  if (variant === 'pink') colorStyle = 'bg-[#f472b6] text-pixel-dark';
  if (variant === 'purple') colorStyle = 'bg-[#d8b4fe] text-pixel-dark';
  if (variant === 'cyan') colorStyle = 'bg-[#7dd3fc] text-pixel-dark';
  if (variant === 'green') colorStyle = 'bg-[#86efac] text-pixel-dark';
  if (variant === 'white') colorStyle = 'bg-white text-pixel-dark';
  if (variant === 'dark') colorStyle = 'bg-pixel-dark text-white';

  let sizeStyle = 'px-3 py-1.5 text-xs';
  if (size === 'sm') sizeStyle = 'px-2 py-1 text-[10px]';
  if (size === 'lg') sizeStyle = 'px-5 py-2.5 text-sm';

  return (
    <button
      disabled={disabled}
      className={`pixel-btn font-pixel uppercase tracking-wider font-bold inline-flex items-center justify-center gap-1.5 ${colorStyle} ${sizeStyle} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

