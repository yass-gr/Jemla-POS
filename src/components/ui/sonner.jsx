import { Toaster as Sonner } from "sonner"

const Toaster = (props) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface-container-lowest group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant/30 group-[.toaster]:shadow-xl dark:group-[.toaster]:bg-card dark:group-[.toaster]:text-foreground dark:group-[.toaster]:border-border",
          description: "group-[.toast]:text-on-surface-variant dark:group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-on-primary",
          cancelButton:
            "group-[.toast]:bg-surface-container group-[.toast]:text-on-surface-variant dark:group-[.toast]:bg-muted dark:group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:!border-s-4 group-[.toast]:!border-s-primary",
          error: "group-[.toast]:!border-s-4 group-[.toast]:!border-s-error",
        },
      }}
      {...props}
    />
  );
}

export { Toaster }
