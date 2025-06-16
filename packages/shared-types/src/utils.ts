import { z } from 'zod';
import { 
  ApiResponseSchema, 
  PaginationQuerySchema,
  UserSchema 
} from '@medsim-ai/shared-types';

/**
 * Utility functions demonstrating Zod usage patterns
 */

// 1. Safe parsing with error handling
export function safeParseApiResponse<T>(data: unknown): T | null {
  try {
    const result = ApiResponseSchema.parse(data);
    return result.success ? (result.data as T) : null;
  } catch (error) {
    console.error('Failed to parse API response:', error);
    return null;
  }
}

// 2. Transform and validate query parameters
export function parseQueryParams(searchParams: URLSearchParams) {
  const params = Object.fromEntries(searchParams);
  
  try {
    return PaginationQuerySchema.parse(params);
  } catch (error) {
    console.warn('Invalid query parameters, using defaults:', error);
    return PaginationQuerySchema.parse({});
  }
}

// 3. Validate user session data
export function validateUserSession(sessionData: unknown) {
  const result = UserSchema.safeParse(sessionData);
  
  if (result.success) {
    return {
      isValid: true,
      user: result.data,
      errors: null,
    };
  }
  
  return {
    isValid: false,
    user: null,
    errors: result.error.errors,
  };
}

// 4. Custom validation schemas for frontend-specific needs
export const LoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginForm = z.infer<typeof LoginFormSchema>;

// 5. Environment variable validation (for backend)
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DYNAMODB_TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  AWS_REGION: z.string().min(1),
  API_BASE_URL: z.string().url(),
});

export function validateEnv(env: Record<string, string | undefined>) {
  try {
    return EnvSchema.parse(env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
}

// 6. Runtime type guards using Zod
export function isMedicalCaseArray(data: unknown): data is unknown[] {
  return z.array(z.unknown()).safeParse(data).success;
}

// 7. Partial validation for updates
export const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// 8. Conditional validation
export const ConditionalSchema = z.object({
  type: z.enum(['student', 'doctor']),
  specialization: z.string().optional(),
}).refine((data) => {
  // If type is 'doctor', specialization is required
  if (data.type === 'doctor') {
    return data.specialization && data.specialization.length > 0;
  }
  return true;
}, {
  message: "Specialization is required for doctors",
  path: ["specialization"],
});

// 9. Transform data while validating
export const DateStringSchema = z.string().transform((str) => new Date(str));

// 10. Nested validation with custom error messages
export const ComplexFormSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    age: z.number().min(18, "Must be at least 18 years old").max(120, "Invalid age"),
  }),
  preferences: z.object({
    newsletter: z.boolean(),
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
    }),
  }),
}).strict(); // Reject unknown properties
