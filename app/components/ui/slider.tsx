import * as React from "react"
import { cn } from "~/lib/utils"

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, max = 100, step = 1, disabled = false, ...props }, ref) => (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div 
          className="absolute h-full bg-primary" 
          style={{ width: `${(value[0] / max) * 100}%` }}
        />
      </div>
      <input
        ref={ref}
        type="range"
        min={0}
        max={max}
        step={step}
        value={value[0]}
        disabled={disabled}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        className="absolute w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        {...props}
      />
      <div 
        className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 absolute"
        style={{ left: `calc(${(value[0] / max) * 100}% - 10px)` }}
      />
    </div>
  )
)
Slider.displayName = "Slider"

export { Slider }