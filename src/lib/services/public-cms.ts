import { prisma } from "@/lib/db/prisma";

export interface PublicSiteData {
  organizationId: string | null;
  siteName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  services: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    shortDescription: string;
    description: string;
    featuredImage: string | null;
    iconName: string | null;
    benefits: string[];
    processSteps: unknown;
    faqs: unknown;
    seoTitle: string | null;
    seoDescription: string | null;
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    clientName: string | null;
    industry: string | null;
    summary: string;
    challenge: string | null;
    solution: string | null;
    results: string | null;
    technologies: string[];
    featuredImage: string | null;
    galleryImages: string[];
    liveUrl: string | null;
    isFeatured: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
  }>;
  team: Array<{
    id: string;
    fullName: string;
    slug: string;
    designation: string;
    departmentName: string;
    bio: string | null;
    avatarUrl: string | null;
    skills: string[];
    experienceYears: number;
    socialLinks: Record<string, string> | null;
  }>;
  testimonials: Array<{
    id: string;
    authorName: string;
    authorRole: string;
    companyName: string | null;
    avatarUrl: string | null;
    quote: string;
    rating: number;
  }>;
  blogPosts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string | null;
    readingTime: number;
    isFeatured: boolean;
    publishedAt: Date | null;
    categoryName: string;
    categorySlug: string;
    authorName: string;
    tags: Array<{ name: string; slug: string }>;
    seoTitle: string | null;
    seoDescription: string | null;
  }>;
  faqs: Array<{
    id: string;
    category: string;
    question: string;
    answer: string;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    slug: string;
    department: string;
    location: string;
    employmentType: string;
    salaryRange: string | null;
    description: string;
    requirements: string[];
    benefits: string[];
  }>;
}

const FALLBACK_PUBLIC_DATA: PublicSiteData = {
  organizationId: null,
  siteName: "Nexora",
  tagline: "Your Ultimate Digital Agency",
  phone: "+1 (415) 890-4320",
  email: "hello@nexora.agency",
  address: "548 Market Street, Suite 420, San Francisco, CA 94104",
  services: [
    {
      id: "srv-1",
      title: "Brand Identity",
      slug: "brand-identity",
      category: "Branding & Strategy",
      shortDescription:
        "Distinctive visual systems, brand architecture, and messaging frameworks engineered to command category authority.",
      description:
        "We partner with ambitious founders and enterprise marketing leaders to craft memorable brand identities that bridge strategic positioning with expressive visual design.",
      featuredImage:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
      iconName: "Palette",
      benefits: [
        "Comprehensive brand guidelines & design tokens",
        "Market positioning and competitor differentiation",
        "Conversion-ready typography and visual hierarchy",
        "Cross-channel creative rollout assets",
      ],
      processSteps: [
        { step: "01", title: "Discovery & Audit", detail: "Stakeholder workshops and competitive visual audit." },
        { step: "02", title: "Identity System", detail: "Logo architecture, palette, typography, and grid rules." },
        { step: "03", title: "Launch Kit", detail: "Production brand guidelines and digital templates." },
      ],
      faqs: [
        {
          q: "How long does a complete brand identity sprint take?",
          a: "Most brand identity engagements take 4 to 6 weeks from kickoff workshop to final guidelines.",
        },
      ],
      seoTitle: "Brand Identity & Strategy Services",
      seoDescription: "Strategic brand identity systems and visual guidelines by Nexora.",
    },
    {
      id: "srv-2",
      title: "UX / UI Design",
      slug: "ux-ui-design",
      category: "Product Design",
      shortDescription:
        "Research-backed user experiences, interactive prototypes, and scalable design systems built for high conversion.",
      description:
        "From user journey mapping to pixel-accurate component libraries, our UX/UI studio turns complex product workflows into effortless digital experiences.",
      featuredImage:
        "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80",
      iconName: "Layout",
      benefits: [
        "Interactive Figma prototypes tested with real users",
        "WCAG AA accessible component design systems",
        "Light and dark theme token architecture",
        "Measurable uplift in funnel conversion rates",
      ],
      processSteps: [
        { step: "01", title: "UX Research", detail: "User interviews, analytics review, and task flows." },
        { step: "02", title: "Wireframes & UI", detail: "High-fidelity screens and interactive states." },
        { step: "03", title: "Design Handoff", detail: "Tokenized specs and developer pairing." },
      ],
      faqs: [
        {
          q: "Do you deliver reusable Figma design systems?",
          a: "Yes, every engagement includes documented components, variants, and design tokens.",
        },
      ],
      seoTitle: "UX / UI Design Studio",
      seoDescription: "Conversion-focused UX research and UI design systems by Nexora.",
    },
    {
      id: "srv-3",
      title: "App Agency",
      slug: "app-agency",
      category: "Software Engineering",
      shortDescription:
        "Full-stack web and mobile platforms engineered with Next.js, TypeScript, cloud-native APIs, and rock-solid security.",
      description:
        "Our engineering squads build resilient SaaS platforms, customer portals, and mobile applications designed for speed, security, and long-term scale.",
      featuredImage:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      iconName: "Code2",
      benefits: [
        "Modern Next.js & TypeScript full-stack architecture",
        "Automated testing and CI/CD release pipelines",
        "SOC-2 aligned security, RBAC, and audit logging",
        "Sub-second page performance and Core Web Vitals",
      ],
      processSteps: [
        { step: "01", title: "Architecture", detail: "Domain modeling, database design, and API contracts." },
        { step: "02", title: "Agile Sprints", detail: "Two-week delivery cycles with live staging previews." },
        { step: "03", title: "QA & Launch", detail: "Load testing, E2E verification, and cloud rollout." },
      ],
      faqs: [
        {
          q: "What stack do you specialize in for web platforms?",
          a: "We specialize in Next.js, React, TypeScript, PostgreSQL, Prisma, and cloud-native deployments.",
        },
      ],
      seoTitle: "Full-Stack Web & App Engineering",
      seoDescription: "Custom web and mobile application engineering by Nexora.",
    },
    {
      id: "srv-4",
      title: "Digital Marketing",
      slug: "digital-marketing",
      category: "Growth & SEO",
      shortDescription:
        "Full-funnel acquisition, technical SEO, paid media optimization, and CRM-connected revenue attribution.",
      description:
        "We connect creative storytelling with performance analytics to drive qualified pipeline, lower customer acquisition cost, and accelerate recurring revenue.",
      featuredImage:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      iconName: "TrendingUp",
      benefits: [
        "Technical SEO and structured schema markup",
        "Multi-touch attribution linked to CRM deals",
        "Conversion rate optimization (CRO) experiments",
        "Weekly executive pipeline & ROI reporting",
      ],
      processSteps: [
        { step: "01", title: "Funnel Audit", detail: "Channel attribution and landing page diagnostics." },
        { step: "02", title: "Campaign Engine", detail: "Search, content, and paid creative execution." },
        { step: "03", title: "Scale & Optimize", detail: "Continuous A/B testing and pipeline tuning." },
      ],
      faqs: [
        {
          q: "How do you measure marketing ROI?",
          a: "We tie every campaign directly to qualified leads, pipeline value, and closed-won revenue.",
        },
      ],
      seoTitle: "Digital Marketing & Growth Agency",
      seoDescription: "SEO, paid acquisition, and conversion optimization by Nexora.",
    },
  ],
  portfolio: [
    {
      id: "port-1",
      title: "Future Management Platform",
      slug: "future-management-platform",
      category: "Development",
      clientName: "BrightLabs Inc.",
      industry: "Enterprise SaaS",
      summary: "Unified analytics and revenue workspace built for high-velocity B2B sales teams.",
      challenge: "Fragmented spreadsheets and slow legacy reporting blocked executive visibility.",
      solution: "Engineered a multi-tenant Next.js + PostgreSQL platform with live pipeline analytics.",
      results: "42% faster deal velocity and 3.1x adoption across 18 regional teams.",
      technologies: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
      featuredImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [],
      liveUrl: "https://nexora.agency",
      isFeatured: true,
      seoTitle: "Future Management Platform Case Study",
      seoDescription: "Enterprise SaaS platform built by Nexora for BrightLabs.",
    },
    {
      id: "port-2",
      title: "Creative Commerce Experience",
      slug: "creative-commerce-experience",
      category: "Design",
      clientName: "Velo Studio",
      industry: "Retail & D2C",
      summary: "High-converting omnichannel storefront and design system overhaul.",
      challenge: "High mobile checkout drop-off and inconsistent brand presentation.",
      solution: "Redesigned mobile-first buyer journeys with streamlined one-page checkout.",
      results: "+68% mobile conversion rate within 90 days of launch.",
      technologies: ["React", "Figma", "Tailwind CSS", "Stripe"],
      featuredImage:
        "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [],
      liveUrl: "https://nexora.agency",
      isFeatured: true,
      seoTitle: "Creative Commerce Experience Case Study",
      seoDescription: "Omnichannel storefront redesign for Velo Studio.",
    },
    {
      id: "port-3",
      title: "Agency Growth Engine",
      slug: "agency-growth-engine",
      category: "Digital Marketing",
      clientName: "InnovateTech",
      industry: "B2B Technology",
      summary: "Full-funnel demand generation and organic search dominance program.",
      challenge: "Over-reliance on outbound cold outreach with rising acquisition costs.",
      solution: "Launched technical SEO hub, interactive ROI tools, and CRM lead scoring.",
      results: "210% organic pipeline growth in two quarters.",
      technologies: ["SEO", "HubSpot", "Next.js", "Analytics"],
      featuredImage:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [],
      liveUrl: "https://nexora.agency",
      isFeatured: true,
      seoTitle: "Agency Growth Engine Case Study",
      seoDescription: "Demand generation and SEO growth for InnovateTech.",
    },
    {
      id: "port-4",
      title: "FinTech Security Portal",
      slug: "fintech-security-portal",
      category: "Technology",
      clientName: "VaultPay",
      industry: "FinTech",
      summary: "Zero-trust client onboarding and real-time compliance monitoring portal.",
      challenge: "Manual KYC review slowed enterprise merchant onboarding to 11 days.",
      solution: "Built automated verification workflows with granular RBAC and audit trails.",
      results: "Reduced merchant onboarding time from 11 days to 14 hours.",
      technologies: ["Next.js", "Prisma", "PostgreSQL", "Node.js"],
      featuredImage:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [],
      liveUrl: "https://nexora.agency",
      isFeatured: false,
      seoTitle: "FinTech Security Portal Case Study",
      seoDescription: "Compliance and onboarding portal for VaultPay.",
    },
    {
      id: "port-5",
      title: "Website Conversion Accelerator",
      slug: "website-conversion-accelerator",
      category: "Digital Marketing",
      clientName: "GreenTech Solutions",
      industry: "Clean Energy",
      summary: "Interactive lead capture architecture and brand refresh for clean-tech enterprise.",
      challenge: "Low demo request rate despite strong paid search traffic.",
      solution: "Rebuilt value proposition hierarchy, interactive calculators, and CRM routing.",
      results: "86% increase in qualified enterprise demo bookings.",
      technologies: ["Next.js", "CRO", "Recharts", "Prisma"],
      featuredImage:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [],
      liveUrl: "https://nexora.agency",
      isFeatured: false,
      seoTitle: "Website Conversion Accelerator Case Study",
      seoDescription: "Lead generation architecture for GreenTech Solutions.",
    },
    {
      id: "port-6",
      title: "Cloud Operations Command",
      slug: "cloud-operations-command",
      category: "Development",
      clientName: "FutureTech Systems",
      industry: "Cloud Infrastructure",
      summary: "Real-time telemetry dashboard and incident collaboration platform.",
      challenge: "Engineers lacked a unified view across multi-region cloud deployments.",
      solution: "Delivered a streaming telemetry UI with sub-second alert triage.",
      results: "54% reduction in mean time to resolution across 40+ services.",
      technologies: ["React", "TypeScript", "GraphQL", "PostgreSQL"],
      featuredImage:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [],
      liveUrl: "https://nexora.agency",
      isFeatured: false,
      seoTitle: "Cloud Operations Command Case Study",
      seoDescription: "Telemetry and incident response suite for FutureTech.",
    },
  ],
  team: [
    {
      id: "team-1",
      fullName: "Wade Warren",
      slug: "wade-warren",
      designation: "Principal UX Designer & Research Lead",
      departmentName: "Design Studio",
      bio: "Wade leads product discovery and human-centered design systems for SaaS and enterprise platforms.",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      skills: ["Product Strategy", "Design Systems", "UX Research", "Figma"],
      experienceYears: 9,
      socialLinks: { linkedin: "https://linkedin.com", twitter: "https://x.com" },
    },
    {
      id: "team-2",
      fullName: "Leslie Alexander",
      slug: "leslie-alexander",
      designation: "VP of Engineering & Architecture",
      departmentName: "Engineering",
      bio: "Leslie architects resilient Next.js, PostgreSQL, and multi-tenant cloud systems built for scale.",
      avatarUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      skills: ["Next.js", "PostgreSQL", "System Architecture", "Security"],
      experienceYears: 11,
      socialLinks: { linkedin: "https://linkedin.com", github: "https://github.com" },
    },
    {
      id: "team-3",
      fullName: "Jenny Wilson",
      slug: "jenny-wilson",
      designation: "Head of Digital Growth & Brand",
      departmentName: "Growth & Marketing",
      bio: "Jenny blends creative brand storytelling with quantitative growth loops and conversion science.",
      avatarUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
      skills: ["Brand Strategy", "Technical SEO", "CRO", "Demand Gen"],
      experienceYears: 8,
      socialLinks: { linkedin: "https://linkedin.com", instagram: "https://instagram.com" },
    },
  ],
  testimonials: [
    {
      id: "test-1",
      authorName: "Cameron Williamson",
      authorRole: "Chief Executive Officer",
      companyName: "BrightLabs Inc.",
      avatarUrl:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
      quote:
        "Nexora rebuilt our flagship web presence and connected it straight into our sales pipeline. Qualified inbound leads rose 68% in the very first quarter.",
      rating: 5,
    },
    {
      id: "test-2",
      authorName: "Elena Rostova",
      authorRole: "VP of Marketing",
      companyName: "InnovateTech",
      avatarUrl:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80",
      quote:
        "Their blend of bold agency craft and disciplined full-stack execution is rare. Every sprint shipped on schedule with measurable revenue impact.",
      rating: 5,
    },
    {
      id: "test-3",
      authorName: "Marcus Vance",
      authorRole: "Founder",
      companyName: "VaultPay",
      avatarUrl:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
      quote:
        "From brand positioning to our enterprise portal, Nexora operated as true strategic partners who cared deeply about our conversion metrics.",
      rating: 5,
    },
  ],
  blogPosts: [
    {
      id: "post-1",
      title: "The Power of Storytelling in Digital Branding",
      slug: "power-of-storytelling-in-digital-branding",
      excerpt:
        "How high-growth digital agencies craft cohesive brand narratives that convert skeptical enterprise buyers into long-term advocates.",
      content:
        "Great digital products begin with a clear story. When typography, motion, and product messaging reinforce a single strategic promise, conversion rates follow naturally.\n\nAt Nexora, every brand engagement starts by mapping the customer's inflection point—the exact moment they realize spreadsheets and fragmented tools are holding back growth.\n\nBy pairing crisp visual hierarchy with verifiable social proof and friction-free lead capture, modern agencies turn static websites into predictable pipeline engines.",
      featuredImage:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
      readingTime: 5,
      isFeatured: true,
      publishedAt: new Date("2026-10-21"),
      categoryName: "Development",
      categorySlug: "development",
      authorName: "Wade Warren",
      tags: [
        { name: "Branding", slug: "branding" },
        { name: "Strategy", slug: "strategy" },
      ],
      seoTitle: "The Power of Storytelling in Digital Branding",
      seoDescription: "Strategic storytelling insights for digital agencies and SaaS brands.",
    },
    {
      id: "post-2",
      title: "Why Your Brand Needs a Unified Digital Agency & CRM",
      slug: "why-brand-needs-unified-digital-agency-crm",
      excerpt:
        "Connecting your public marketing funnel directly to CRM workflows eliminates lead leakage and speeds up sales response time.",
      content:
        "Most organizations treat their marketing website and their CRM as separate worlds. Leads fill out a form, an email sits unread, and revenue slips away.\n\nWhen your public agency platform shares one normalized database with your CRM, HR, and project delivery teams, every contact submission immediately routes to the right account executive with complete attribution context.\n\nThat operational clarity is what transforms digital presence into measurable business velocity.",
      featuredImage:
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1000&q=80",
      readingTime: 4,
      isFeatured: false,
      publishedAt: new Date("2026-11-04"),
      categoryName: "UX/UI",
      categorySlug: "ux-ui",
      authorName: "Jenny Wilson",
      tags: [
        { name: "CRM", slug: "crm" },
        { name: "Growth", slug: "growth" },
      ],
      seoTitle: "Why Your Brand Needs a Unified Digital Agency & CRM",
      seoDescription: "Unifying public marketing funnels with CRM workflows.",
    },
    {
      id: "post-3",
      title: "Designing Dark & Light Modes Without Losing Brand Identity",
      slug: "designing-dark-light-modes-without-losing-identity",
      excerpt:
        "Practical token strategies for maintaining contrast, warmth, and typographic authority across both light and dark interfaces.",
      content:
        "Supporting both light and dark themes goes far beyond inverting white and black. True multi-theme engineering requires semantic surface tokens, calibrated border contrast, and accessible accent colors.\n\nIn this breakdown, our design studio shares how we preserve vibrant agency character in dark mode while keeping data-dense CRM dashboards crisp and legible.",
      featuredImage:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",
      readingTime: 6,
      isFeatured: false,
      publishedAt: new Date("2026-11-14"),
      categoryName: "Design",
      categorySlug: "design",
      authorName: "Leslie Alexander",
      tags: [
        { name: "UI Design", slug: "ui-design" },
        { name: "Architecture", slug: "architecture" },
      ],
      seoTitle: "Designing Dark & Light Modes Without Losing Brand Identity",
      seoDescription: "Semantic design tokens for light and dark UI systems.",
    },
  ],
  faqs: [
    {
      id: "faq-1",
      category: "Agency Services",
      question: "How does Nexora approach a new digital transformation project?",
      answer:
        "We begin with a focused discovery and funnel audit, followed by interactive design prototypes, iterative engineering sprints, and full QA verification before launch.",
    },
    {
      id: "faq-2",
      category: "Agency Services",
      question: "Can we manage our website content and CRM leads in one place?",
      answer:
        "Yes! Nexora unifies your public CMS (services, portfolio, team, blog, careers, FAQs) directly with your CRM leads, sales pipeline, projects, and invoicing.",
    },
    {
      id: "faq-3",
      category: "Pricing & Timelines",
      question: "What is the typical timeline for an agency website and CRM launch?",
      answer:
        "Brand and marketing websites typically launch in 4–6 weeks, while custom full-stack SaaS and enterprise CRM integrations run 8–12 weeks.",
    },
    {
      id: "faq-4",
      category: "Technical & Security",
      question: "How do you ensure multi-tenant data isolation and security?",
      answer:
        "Every query is scoped by authenticated organization context on the server, backed by role-based permissions, bcrypt password hashing, HTTP-only cookies, and audit logging.",
    },
  ],
  jobs: [
    {
      id: "job-1",
      title: "Senior Full-Stack Next.js Engineer",
      slug: "senior-full-stack-nextjs-engineer",
      department: "Engineering",
      location: "San Francisco / Remote",
      employmentType: "Full-Time",
      salaryRange: "$145,000 – $180,000",
      description:
        "Join our core product engineering team building high-performance Next.js, TypeScript, and PostgreSQL applications for global clients.",
      requirements: [
        "5+ years with React, TypeScript, and Next.js App Router",
        "Deep expertise with PostgreSQL, Prisma ORM, and API security",
        "Strong eye for responsive UI and accessible component design",
      ],
      benefits: [
        "Flexible remote-first schedule",
        "Comprehensive health & wellness coverage",
        "Annual learning & hardware stipend",
      ],
    },
    {
      id: "job-2",
      title: "Senior Product UI/UX Designer",
      slug: "senior-product-ui-ux-designer",
      department: "Design Studio",
      location: "New York / Remote",
      employmentType: "Full-Time",
      salaryRange: "$125,000 – $155,000",
      description:
        "Shape conversion-driven agency experiences and enterprise SaaS dashboards with refined typography, systems thinking, and visual craft.",
      requirements: [
        "4+ years designing SaaS dashboards and high-converting marketing sites",
        "Mastery of Figma variables, auto-layout, and design tokens",
        "Portfolio showcasing shipped web products",
      ],
      benefits: [
        "Flexible remote-first schedule",
        "401(k) matching and performance bonuses",
        "Annual design conference pass",
      ],
    },
  ],
};

export async function getPublicSiteData(): Promise<PublicSiteData> {
  try {
    const org = await prisma.organization.findFirst({
      where: { isDefault: true, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });

    if (!org) return FALLBACK_PUBLIC_DATA;

    const [services, portfolio, employees, testimonials, blogPosts, faqs, jobs, settings] =
      await Promise.all([
        prisma.service.findMany({
          where: { organizationId: org.id, status: "PUBLISHED" },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.portfolioProject.findMany({
          where: { organizationId: org.id, status: "PUBLISHED" },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        }),
        prisma.employee.findMany({
          where: {
            organizationId: org.id,
            isPublicProfile: true,
            deletedAt: null,
          },
          include: { department: true },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.testimonial.findMany({
          where: { organizationId: org.id, status: "PUBLISHED" },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.blogPost.findMany({
          where: { organizationId: org.id, status: "PUBLISHED" },
          include: {
            category: true,
            author: true,
            tags: { include: { tag: true } },
          },
          orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        }),
        prisma.faq.findMany({
          where: { organizationId: org.id, status: "PUBLISHED" },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.jobListing.findMany({
          where: { organizationId: org.id, status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
        }),
        prisma.siteSetting.findMany({
          where: { organizationId: org.id },
        }),
      ]);

    const settingsMap = Object.fromEntries(
      settings.map((s) => [s.key, s.value as Record<string, unknown>])
    );
    const general = settingsMap.general ?? {};

    return {
      organizationId: org.id,
      siteName: String(general.siteName ?? org.name ?? FALLBACK_PUBLIC_DATA.siteName),
      tagline: String(general.tagline ?? FALLBACK_PUBLIC_DATA.tagline),
      phone: String(general.phone ?? FALLBACK_PUBLIC_DATA.phone),
      email: String(general.email ?? FALLBACK_PUBLIC_DATA.email),
      address: String(general.address ?? FALLBACK_PUBLIC_DATA.address),
      services:
        services.length > 0 ? services : FALLBACK_PUBLIC_DATA.services,
      portfolio:
        portfolio.length > 0 ? portfolio : FALLBACK_PUBLIC_DATA.portfolio,
      team:
        employees.length > 0
          ? employees.map((e) => ({
              id: e.id,
              fullName: e.fullName,
              slug: e.slug,
              designation: e.designation,
              departmentName: e.department?.name ?? "Agency Team",
              bio: e.bio,
              avatarUrl: e.avatarUrl,
              skills: e.skills,
              experienceYears: e.experienceYears,
              socialLinks: (e.socialLinks as Record<string, string>) ?? null,
            }))
          : FALLBACK_PUBLIC_DATA.team,
      testimonials:
        testimonials.length > 0
          ? testimonials
          : FALLBACK_PUBLIC_DATA.testimonials,
      blogPosts:
        blogPosts.length > 0
          ? blogPosts.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt,
              content: p.content,
              featuredImage: p.featuredImage,
              readingTime: p.readingTime,
              isFeatured: p.isFeatured,
              publishedAt: p.publishedAt,
              categoryName: p.category?.name ?? "Insights",
              categorySlug: p.category?.slug ?? "insights",
              authorName: p.author?.name ?? "Nexora Editorial",
              tags: p.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
              seoTitle: p.seoTitle,
              seoDescription: p.seoDescription,
            }))
          : FALLBACK_PUBLIC_DATA.blogPosts,
      faqs: faqs.length > 0 ? faqs : FALLBACK_PUBLIC_DATA.faqs,
      jobs: jobs.length > 0 ? jobs : FALLBACK_PUBLIC_DATA.jobs,
    };
  } catch {
    return FALLBACK_PUBLIC_DATA;
  }
}
