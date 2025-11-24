import * as React from "react"
import { cn } from "../../lib/utils"

const Slider = React.forwardRef(({ className, min = 0, max = 100, step = 1, value, onChange, ...props }, ref) => {
  return (
    <div className="relative flex items-center w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className={cn(
          "w-full h-2 bg-input rounded-lg appearance-none cursor-pointer",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:h-4",
          "[&::-webkit-slider-thumb]:w-4",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-primary",
          "[&::-webkit-slider-thumb]:cursor-pointer",
          "[&::-webkit-slider-thumb]:border-2",
          "[&::-webkit-slider-thumb]:border-background",
          "[&::-webkit-slider-thumb]:shadow-md",
          "[&::-webkit-slider-thumb]:hover:bg-primary/90",
          "[&::-webkit-slider-thumb]:focus:ring-2",
          "[&::-webkit-slider-thumb]:focus:ring-ring",
          "[&::-webkit-slider-thumb]:focus:ring-offset-2",
          "[&::-moz-range-thumb]:h-4",
          "[&::-moz-range-thumb]:w-4",
          "[&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:bg-primary",
          "[&::-moz-range-thumb]:cursor-pointer",
          "[&::-moz-range-thumb]:border-2",
          "[&::-moz-range-thumb]:border-background",
          "[&::-moz-range-thumb]:shadow-md",
          "[&::-moz-range-thumb]:hover:bg-primary/90",
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  )
})

Slider.displayName = "Slider"

export { Slider }
