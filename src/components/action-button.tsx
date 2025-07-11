import { cn } from '../utils/misc';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export default function ActionButton({
  className,
  children,
  variant = 'primary',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'cursor-pointer min-w-24 font-bold py-2 px-4 rounded disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-gray-500 hover:bg-gray-600 text-white ',
    secondary: 'bg-gray-200 hover:bg-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
}
