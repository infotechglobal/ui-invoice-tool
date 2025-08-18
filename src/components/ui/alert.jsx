import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "fixed top-6 right-6 z-50 min-w-[320px] max-w-[420px] w-auto rounded-xl shadow-2xl border-2 backdrop-blur-md transition-all duration-300 ease-in-out transform translate-x-0 opacity-100 animate-slideIn p-5",
  {
    variants: {
      variant: {
        default: "bg-white/95 text-neutral-800 border-neutral-300 shadow-neutral-200/50",
        Error: "bg-red-50/95 text-red-900 border-red-300 shadow-red-200/50",
        Success: "bg-emerald-50/95 text-emerald-900 border-emerald-300 shadow-emerald-200/50",
        Warning: "bg-amber-50/95 text-amber-900 border-amber-300 shadow-amber-200/50",
        Info: "bg-blue-50/95 text-blue-900 border-blue-300 shadow-blue-200/50"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, children, onClose, autoClose = false, autoCloseDelay = 5000, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isLeaving, setIsLeaving] = React.useState(false);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertVariants({ variant }), 
        isLeaving && "opacity-0 translate-x-full",
        className
      )}
      {...props}
    >
      <div className="flex items-start space-x-4 pr-8">
        {/* Icon container with proper sizing and colors */}
        <div className={cn(
          "flex-shrink-0 mt-0.5",
          variant === "Success" && "text-emerald-600",
          variant === "Error" && "text-red-600", 
          variant === "Warning" && "text-amber-600",
          variant === "Info" && "text-blue-600",
          !variant && "text-neutral-600"
        )}>
          {React.Children.toArray(children).find(child => 
            React.isValidElement(child) && 
            (child.type === 'svg' || (child.props && typeof child.props.size === 'number'))
          )}
        </div>
        
        {/* Content container */}
        <div className="flex-1 min-w-0">
          {React.Children.toArray(children).filter(child => 
            !(React.isValidElement(child) && 
              (child.type === 'svg' || (child.props && typeof child.props.size === 'number')))
          )}
        </div>
      </div>
      
      {onClose && (
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/10 transition-colors duration-200 group"
          aria-label="Close alert"
        >
          <svg
            className="w-5 h-5 text-current opacity-60 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});

Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("text-lg font-bold leading-tight tracking-tight mb-2", className)}
    {...props} 
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-medium leading-relaxed break-words whitespace-pre-wrap [&_p]:leading-relaxed", className)}
    {...props} 
  />
))
AlertDescription.displayName = "AlertDescription"

// Alert Container for managing multiple alerts
const AlertContainer = ({ children }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
    {children}
  </div>
);

// CSS for slide-in animation (add to your global CSS)
const alertStyles = `
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}
`;

export { Alert, AlertTitle, AlertDescription, AlertContainer, alertStyles }