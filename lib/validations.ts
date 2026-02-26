import { z } from "zod"

// Property types
export const propertyTypeSchema = z.enum(["HDB", "Condo", "Landed"])

// Create property schema
export const createPropertySchema = z.object({
  name: z.string().min(1, "Property name is required").max(200),
  address: z.string().min(1, "Address is required").max(500),
  type: propertyTypeSchema,
  purchase_price: z.number().positive("Purchase price must be positive").max(100000000),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  stamp_duty: z.number().min(0).optional().default(0),
  renovation_cost: z.number().min(0).optional().default(0),
  agent_fees: z.number().min(0).optional().default(0),
  current_value: z.number().min(0).optional().default(0),
  cpf_amount: z.number().min(0).optional().default(0),
  mortgage_amount: z.number().min(0).optional().default(0),
  mortgage_interest_rate: z.number().min(0).max(30).optional().default(0),
  mortgage_tenure: z.number().int().min(0).max(35).optional().default(0),
  monthly_rental: z.number().min(0).optional().default(0),
  target_profit_percentage: z.number().min(0).max(1000).optional().default(0),
})

// Update property - same as create but all fields present
export const updatePropertySchema = createPropertySchema

// Register user
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
})

// Login
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Telegram settings
export const telegramSettingsSchema = z.object({
  telegram_bot_token: z.string().max(200).optional().default(""),
  telegram_chat_id: z.string().max(100).optional().default(""),
  alerts_enabled: z.boolean().optional().default(true),
})

// HDB resale search params
export const hdbSearchSchema = z.object({
  town: z.string().optional(),
  flat_type: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
})

// Property ID param
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid ID"),
})
