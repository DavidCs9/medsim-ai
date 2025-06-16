import { z } from "zod";

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["admin", "doctor", "student"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Medical Case schema
export const MedicalCaseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  tags: z.array(z.string()),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isPublished: z.boolean().default(false),
});

export type MedicalCase = z.infer<typeof MedicalCaseSchema>;

// API Response schemas
export const ApiSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
});

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
});

export const ApiResponseSchema = z.union([
  ApiSuccessResponseSchema,
  ApiErrorResponseSchema,
]);

export type ApiSuccessResponse<T = unknown> = Omit<
  z.infer<typeof ApiSuccessResponseSchema>,
  "data"
> & {
  data: T;
};

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Request/Response schemas for specific endpoints
export const CreateMedicalCaseRequestSchema = MedicalCaseSchema.pick({
  title: true,
  description: true,
  difficulty: true,
  tags: true,
}).extend({
  isPublished: z.boolean().optional(),
});

export type CreateMedicalCaseRequest = z.infer<
  typeof CreateMedicalCaseRequestSchema
>;

export const UpdateMedicalCaseRequestSchema =
  CreateMedicalCaseRequestSchema.partial();
export type UpdateMedicalCaseRequest = z.infer<
  typeof UpdateMedicalCaseRequestSchema
>;

// Pagination schemas
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const PaginatedResponseSchema = z.object({
  items: z.array(z.unknown()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedResponse<T = unknown> = Omit<
  z.infer<typeof PaginatedResponseSchema>,
  "items"
> & {
  items: T[];
};

/**
 *  PasswordPolicy:
          MinimumLength: 8
          RequireUppercase: true
          RequireLowercase: true
          RequireNumbers: true
          RequireSymbols: false
 */
export const SignUpRequestSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/^[^\s]*$/, "Password cannot contain spaces"),
  name: z.string().min(1).max(100),
});

export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;

// Re-export utilities
export * from "./utils";
