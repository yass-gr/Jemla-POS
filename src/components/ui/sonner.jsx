import { Toaster as Sonner } from "sonner"

const Toaster = (props) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface-container-lowest group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant/30 group-[.toaster]:shadow-xl",
          description: "group-[.toast]:text-on-surface-variant",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-on-primary",
          cancelButton:
            "group-[.toast]:bg-surface-container group-[.toast]:text-on-surface-variant",
          success: "group-[.toast]:!border-l-4 group-[.toast]:!border-l-primary",
          error: "group-[.toast]:!border-l-4 group-[.toast]:!border-l-error",
        },
      }}
      {...props}
    />
  );
}

export { Toaster }
