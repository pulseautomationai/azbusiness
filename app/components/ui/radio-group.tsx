import * as React from "react"

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface RadioGroupItemProps {
  value: string
  id?: string
  children?: React.ReactNode
  className?: string
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

export function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={className} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export function RadioGroupItem({ value, id, className }: RadioGroupItemProps) {
  const { value: groupValue, onValueChange } = React.useContext(RadioGroupContext)
  const isChecked = groupValue === value

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={isChecked}
      onChange={() => onValueChange?.(value)}
      className={className}
    />
  )
}