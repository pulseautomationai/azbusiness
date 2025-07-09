import { forwardRef, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import { cn } from "~/lib/utils";

interface BaseFormFieldProps {
  label: string;
  error?: string | null;
  touched?: boolean;
  required?: boolean;
  className?: string;
  children?: ReactNode;
}

interface InputFormFieldProps extends BaseFormFieldProps {
  type: "input";
  inputType?: "text" | "email" | "tel" | "url" | "password";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

interface TextareaFormFieldProps extends BaseFormFieldProps {
  type: "textarea";
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

interface SelectFormFieldProps extends BaseFormFieldProps {
  type: "select";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  children: ReactNode;
}

interface CustomFormFieldProps extends BaseFormFieldProps {
  type: "custom";
  children: ReactNode;
}

type FormFieldProps = 
  | InputFormFieldProps 
  | TextareaFormFieldProps 
  | SelectFormFieldProps 
  | CustomFormFieldProps;

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, touched, required, className, type, children, ...props }, ref) => {
    const hasError = touched && error;
    const fieldId = label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        <Label htmlFor={fieldId} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        
        {type === "input" && (
          <Input
            id={fieldId}
            type={(props as InputFormFieldProps).inputType || "text"}
            value={(props as InputFormFieldProps).value}
            onChange={(e) => (props as InputFormFieldProps).onChange(e.target.value)}
            onBlur={(props as InputFormFieldProps).onBlur}
            placeholder={(props as InputFormFieldProps).placeholder}
            className={hasError ? "border-destructive" : ""}
          />
        )}
        
        {type === "textarea" && (
          <Textarea
            id={fieldId}
            value={(props as TextareaFormFieldProps).value}
            onChange={(e) => (props as TextareaFormFieldProps).onChange(e.target.value)}
            onBlur={(props as TextareaFormFieldProps).onBlur}
            placeholder={(props as TextareaFormFieldProps).placeholder}
            rows={(props as TextareaFormFieldProps).rows}
            className={hasError ? "border-destructive" : ""}
          />
        )}
        
        {type === "select" && (
          <Select
            value={(props as SelectFormFieldProps).value}
            onValueChange={(props as SelectFormFieldProps).onChange}
          >
            {children}
          </Select>
        )}
        
        {type === "custom" && children}
        
        {hasError && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";