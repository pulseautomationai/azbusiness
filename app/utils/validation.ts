import { z } from "zod";

// Phone number validation for US/Arizona format
const phoneRegex = /^(\+1|1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

// Common validation schemas
export const emailSchema = z.string().email("Please enter a valid email address");

export const phoneSchema = z.string()
  .optional()
  .or(z.string().regex(phoneRegex, "Please enter a valid phone number (e.g., (555) 123-4567)"));

export const requiredStringSchema = (fieldName: string, minLength = 1) =>
  z.string()
    .min(minLength, `${fieldName} is required`)
    .trim();

export const urlSchema = z.string()
  .optional()
  .or(z.string().url("Please enter a valid URL (e.g., https://example.com)"));

// Contact form validation
export const contactFormSchema = z.object({
  name: requiredStringSchema("Name", 2),
  email: emailSchema,
  phone: phoneSchema,
  service: z.string().optional(),
  message: requiredStringSchema("Message", 10),
});

// Business validation schemas
export const businessBasicInfoSchema = z.object({
  name: requiredStringSchema("Business name", 2),
  description: requiredStringSchema("Business description", 20),
  shortDescription: requiredStringSchema("Short description", 10).max(150, "Short description must be less than 150 characters"),
  categoryId: requiredStringSchema("Category"),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone number"),
  email: emailSchema,
  website: urlSchema,
});

export const businessLocationSchema = z.object({
  address: requiredStringSchema("Address", 5),
  city: requiredStringSchema("City", 2),
  state: z.literal("Arizona").or(z.literal("AZ")),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code (e.g., 85001 or 85001-1234)"),
});

export const businessHoursSchema = z.object({
  monday: z.string().optional(),
  tuesday: z.string().optional(),
  wednesday: z.string().optional(),
  thursday: z.string().optional(),
  friday: z.string().optional(),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
});

export const businessSocialLinksSchema = z.object({
  facebook: urlSchema,
  instagram: urlSchema,
  twitter: urlSchema,
  linkedin: urlSchema,
});

export const businessCompleteSchema = z.object({
  ...businessBasicInfoSchema.shape,
  ...businessLocationSchema.shape,
  services: z.array(z.string()).min(1, "Please select at least one service"),
  hours: businessHoursSchema,
  socialLinks: businessSocialLinksSchema.optional(),
});

// Review validation
export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be between 1 and 5"),
  comment: requiredStringSchema("Review comment", 10).max(1000, "Review must be less than 1000 characters"),
  userName: requiredStringSchema("Name", 2),
});

// Lead form validation
export const leadFormSchema = z.object({
  name: requiredStringSchema("Name", 2),
  email: emailSchema,
  phone: phoneSchema,
  message: requiredStringSchema("Message", 10),
  service: z.string().optional(),
});

// Form validation helper types
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type BusinessBasicInfo = z.infer<typeof businessBasicInfoSchema>;
export type BusinessLocation = z.infer<typeof businessLocationSchema>;
export type BusinessHours = z.infer<typeof businessHoursSchema>;
export type BusinessComplete = z.infer<typeof businessCompleteSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type LeadFormData = z.infer<typeof leadFormSchema>;

// Validation helper function
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: Record<string, string[]>; 
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Validation failed'] } };
  }
}

// Field-specific validation helpers
export function validateEmail(email: string): string | null {
  const result = emailSchema.safeParse(email);
  return result.success ? null : result.error.issues[0].message;
}

export function validatePhone(phone: string): string | null {
  const result = phoneSchema.safeParse(phone);
  return result.success ? null : result.error.issues[0].message;
}

export function validateRequired(value: string, fieldName: string, minLength = 1): string | null {
  const result = requiredStringSchema(fieldName, minLength).safeParse(value);
  return result.success ? null : result.error.issues[0].message;
}

export function validateUrl(url: string): string | null {
  if (!url || url.trim() === '') return null; // Optional fields
  const result = urlSchema.safeParse(url);
  return result.success ? null : result.error.issues[0].message;
}