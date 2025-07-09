import { useState, useCallback } from 'react';
import { z, type ZodObject, type ZodRawShape } from 'zod';
import { validateForm } from '~/utils/validation';

interface UseFormValidationProps<T extends Record<string, any>> {
  schema: ZodObject<any>;
  initialData?: Partial<T>;
  onSubmit?: (data: T) => void | Promise<void>;
}

interface ValidationErrors {
  [key: string]: string[];
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialData = {},
  onSubmit
}: UseFormValidationProps<T>) {
  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update a single field
  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  // Mark field as touched
  const touchField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field as string]: true }));
  }, []);

  // Validate a single field
  const validateField = useCallback((field: keyof T, value: any) => {
    try {
      // For single field validation, we'll just check if the value is valid
      // by attempting to parse the entire form with this field updated
      const testData = { ...data, [field]: value };
      const result = validateForm(schema, testData);
      
      if (result.success || !result.errors?.[field as string]) {
        // Clear error if validation passes for this field
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        return null;
      } else {
        // Set error for this field
        const fieldError = result.errors[field as string][0] || 'Invalid value';
        setErrors(prev => ({
          ...prev,
          [field as string]: [fieldError]
        }));
        return fieldError;
      }
    } catch (error) {
      return 'Validation failed';
    }
  }, [schema, data]);

  // Validate entire form
  const validateAll = useCallback(() => {
    const result = validateForm(schema, data);
    
    if (!result.success && result.errors) {
      setErrors(result.errors);
      return false;
    }
    
    setErrors({});
    return true;
  }, [schema, data]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allFields = Object.keys(data);
    setTouched(
      allFields.reduce((acc, field) => ({
        ...acc,
        [field]: true
      }), {})
    );

    const result = validateForm(schema, data);
    
    if (!result.success) {
      setErrors(result.errors || {});
      setIsSubmitting(false);
      return false;
    }

    try {
      if (onSubmit && result.data) {
        await onSubmit(result.data as T);
      }
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ general: ['Failed to submit form. Please try again.'] });
      setIsSubmitting(false);
      return false;
    }
  }, [schema, data, onSubmit]);

  // Get error for a specific field
  const getFieldError = useCallback((field: keyof T) => {
    const fieldErrors = errors[field as string];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
  }, [errors]);

  // Check if field has error
  const hasFieldError = useCallback((field: keyof T) => {
    return !!(errors[field as string] && errors[field as string].length > 0);
  }, [errors]);

  // Check if field is touched
  const isFieldTouched = useCallback((field: keyof T) => {
    return touched[field as string] || false;
  }, [touched]);

  // Get field value
  const getFieldValue = useCallback((field: keyof T) => {
    return data[field];
  }, [data]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Check if form has any data
  const hasData = Object.keys(data).some(key => {
    const value = data[key as keyof T];
    return value !== undefined && value !== null && value !== '';
  });

  return {
    // Data
    data,
    setData,
    
    // Field operations
    updateField,
    touchField,
    getFieldValue,
    
    // Validation
    validateField,
    validateAll,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    
    // State
    errors,
    touched,
    isSubmitting,
    isValid,
    hasData,
    
    // Submission
    handleSubmit,
  };
}