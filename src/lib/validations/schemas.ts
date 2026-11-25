import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  organizationName: z.string().min(2, "Organization name is required").optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid reset token"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Your name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().optional().default(""),
  subject: z.string().min(2, "Subject is required"),
  service: z.string().optional().default(""),
  message: z.string().min(10, "Please share at least 10 characters about your project"),
});

export const leadSchema = z.object({
  name: z.string().min(2, "Lead name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  serviceInterest: z.string().optional().nullable(),
  sourceName: z.string().optional().nullable(),
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "CONVERTED", "LOST"])
    .default("NEW"),
  score: z.coerce.number().int().min(0).max(100).default(60),
  estimatedValue: z.coerce.number().min(0).optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

export const dealSchema = z.object({
  title: z.string().min(2, "Deal title is required"),
  amount: z.coerce.number().min(0, "Deal amount must be non-negative"),
  probability: z.coerce.number().int().min(0).max(100).default(25),
  stageId: z.string().min(1, "Pipeline stage is required"),
  pipelineId: z.string().optional(),
  expectedCloseDate: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});
