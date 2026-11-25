import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  isClient: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

export const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  website: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const activitySchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "NOTE", "FOLLOW_UP"]),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).default("COMPLETED"),
  subject: z.string().min(2, "Subject is required"),
  description: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
});

export const taskSchema = z.object({
  title: z.string().min(2, "Task title is required"),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).default("TODO"),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export const meetingSchema = z.object({
  title: z.string().min(2, "Meeting title is required"),
  description: z.string().optional().nullable(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().optional().nullable(),
  meetingUrl: z.string().optional().nullable(),
  participants: z.array(z.string()).optional().default([]),
  leadId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  code: z.string().min(2, "Project code is required"),
  description: z.string().optional().nullable(),
  status: z
    .enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .default("PLANNING"),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  budget: z.coerce.number().min(0).optional().nullable(),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
});

export const employeeSchema = z.object({
  employeeCode: z.string().min(2, "Employee code is required"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().nullable(),
  designation: z.string().min(2, "Designation is required"),
  departmentId: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  skills: z.array(z.string()).optional().default([]),
  experienceYears: z.coerce.number().int().min(0).default(1),
  salary: z.coerce.number().min(0).optional().nullable(),
  status: z
    .enum(["ACTIVE", "ON_LEAVE", "PROBATION", "TERMINATED"])
    .default("ACTIVE"),
  isPublicProfile: z.boolean().default(false),
});

export const jobListingSchema = z.object({
  title: z.string().min(2, "Job title is required"),
  department: z.string().min(2, "Department is required"),
  location: z.string().min(2, "Location is required"),
  employmentType: z.string().default("Full-Time"),
  salaryRange: z.string().optional().nullable(),
  description: z.string().min(10, "Description is required"),
  requirements: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export const jobApplicationSchema = z.object({
  jobListingId: z.string().min(1, "Job listing is required"),
  applicantName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().nullable(),
  portfolioUrl: z.string().optional().nullable(),
  resumeUrl: z.string().optional().nullable(),
  coverLetter: z.string().optional().nullable(),
});

export const invoiceSchema = z.object({
  companyId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional().nullable(),
  status: z
    .enum(["DRAFT", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"])
    .default("DRAFT"),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Item description is required"),
        quantity: z.coerce.number().positive(),
        unitPrice: z.coerce.number().min(0),
      })
    )
    .min(1, "At least one invoice item is required"),
});

export const expenseSchema = z.object({
  title: z.string().min(2, "Expense title is required"),
  category: z.string().min(2, "Category is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  expenseDate: z.string().optional(),
  vendor: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const blogPostSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().min(10, "Excerpt is required"),
  content: z.string().min(20, "Content is required"),
  categoryId: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

export const serviceSchema = z.object({
  title: z.string().min(2, "Service title is required"),
  slug: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  shortDescription: z.string().min(10, "Short description is required"),
  description: z.string().min(20, "Description is required"),
  featuredImage: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  benefits: z.array(z.string()).optional().default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export const portfolioSchema = z.object({
  title: z.string().min(2, "Project title is required"),
  slug: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  clientName: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  summary: z.string().min(10, "Summary is required"),
  challenge: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  results: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional().default([]),
  featuredImage: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});
