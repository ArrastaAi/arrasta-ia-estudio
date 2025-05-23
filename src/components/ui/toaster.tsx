
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            variant={variant}
            className={`border-l-4 animate-slide-in-from-left-3 data-[state=closed]:animate-slide-out-to-left-3 ${
              variant === "warning" ? "border-l-yellow-500" :
              variant === "success" ? "border-l-green-500" :
              variant === "info" ? "border-l-blue-500" :
              variant === "destructive" ? "border-l-red-500" :
              "border-l-purple-500"
            }`}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
