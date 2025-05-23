
import * as React from "react"
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Info, 
  X 
} from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const notificationVariants = cva(
  "relative flex w-full items-center justify-between rounded-lg border p-4 shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-l-4 border-l-purple-500",
        success: "bg-background text-foreground border-l-4 border-l-green-500",
        warning: "bg-background text-foreground border-l-4 border-l-yellow-500",
        destructive: "bg-background text-foreground border-l-4 border-l-red-500",
        info: "bg-background text-foreground border-l-4 border-l-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconMap = {
  default: Bell,
  success: CheckCircle,
  warning: AlertTriangle,
  destructive: X,
  info: Info,
}

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string
  description?: string
  onClose?: () => void
  autoShow?: boolean // Adicionado para compatibilidade com o sistema de toast
}

export function Notification({
  className,
  variant = "default",
  title,
  description,
  onClose,
  autoShow = false, // Por padrão, não mostra automaticamente
  ...props
}: NotificationProps) {
  const IconComponent = iconMap[variant || "default"]
  
  return (
    <div
      className={cn(notificationVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 items-center justify-center">
          <IconComponent className={cn(
            "h-5 w-5", 
            variant === "success" && "text-green-500",
            variant === "warning" && "text-yellow-500",
            variant === "destructive" && "text-red-500",
            variant === "info" && "text-blue-500",
            variant === "default" && "text-purple-500",
          )} />
        </div>
        <div className="flex-1 space-y-1">
          {title && <h5 className="font-medium tracking-tight">{title}</h5>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 rounded-full p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
