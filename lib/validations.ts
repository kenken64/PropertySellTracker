import { z } from "zod"

type Translator = (key: string) => string

const defaultValidationMessages = {
  propertyNameRequired: "Property name is required",
  addressRequired: "Address is required",
  propertyTypeRequired: "Property type is required",
  propertyTypeInvalid: "Invalid property type",
  purchasePricePositive: "Purchase price must be positive",
  invalidDateFormat: "Invalid date format (YYYY-MM-DD)",
  nameRequired: "Name is required",
  invalidEmail: "Invalid email address",
  passwordMin: "Password must be at least 8 characters",
  passwordRequired: "Password is required",
  invalidId: "Invalid ID",
  refinanceLoanPositive: "Loan amount must be positive",
} as const

const defaultTranslator: Translator = (key) => defaultValidationMessages[key as keyof typeof defaultValidationMessages] ?? key

// Property types
export const propertyTypeSchema = z.enum(["HDB", "Condo", "Landed"])

const createPropertyTypeSchema = (t: Translator) =>
  z
    .string()
    .min(1, t("propertyTypeRequired"))
    .refine((value) => propertyTypeSchema.safeParse(value).success, t("propertyTypeInvalid"))

// Create property schema
export const getCreatePropertySchema = (t: Translator = defaultTranslator) =>
  z.object({
    name: z.string().min(1, t("propertyNameRequired")).max(200),
    address: z.string().min(1, t("addressRequired")).max(500),
    unit_no: z.string().max(20).optional().default(""),
    type: createPropertyTypeSchema(t),
    purchase_price: z.number().positive(t("purchasePricePositive")).max(100000000),
    purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t("invalidDateFormat")),
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

export const createPropertySchema = getCreatePropertySchema()

// Update property - same as create but all fields present
export const updatePropertySchema = createPropertySchema

// Register user
export const getRegisterSchema = (t: Translator = defaultTranslator) =>
  z.object({
    name: z.string().min(1, t("nameRequired")).max(100),
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(8, t("passwordMin")).max(128),
  })

export const registerSchema = getRegisterSchema()

// Login
export const getLoginSchema = (t: Translator = defaultTranslator) =>
  z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(1, t("passwordRequired")),
  })

export const loginSchema = getLoginSchema()

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
export const getIdParamSchema = (t: Translator = defaultTranslator) =>
  z.object({
    id: z.string().regex(/^\d+$/, t("invalidId")),
  })

export const idParamSchema = getIdParamSchema()

// Refinance record
export const getRefinanceSchema = (t: Translator = defaultTranslator) =>
  z.object({
    refinance_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t("invalidDateFormat")),
    loan_amount: z.number().positive(t("refinanceLoanPositive")).max(100000000),
    interest_rate: z.number().min(0).max(30),
    tenure: z.number().int().min(1).max(35),
    description: z.string().max(200).optional().default(""),
  })

export const refinanceSchema = getRefinanceSchema()
