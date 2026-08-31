import * as React from "react"
import { ToggleGroup as BaseToggleGroup, Toggle as BaseToggle } from "@base-ui/react"
import { toggleVariants } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
})

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}) {
  return (
    <BaseToggleGroup
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </BaseToggleGroup>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value,
  ...props
}) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <BaseToggle
      value={value}
      className={cn(
        toggleVariants({
          variant: variant || context.variant,
          size: size || context.size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </BaseToggle>
  )
}

export { ToggleGroup, ToggleGroupItem }
