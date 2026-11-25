import type { Metadata } from "next";
import { Providers } from "@/components/shared/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nexora — Digital Agency & Integrated Business CRM Platform",
    template: "%s | Nexora",
  },
  description:
    "Nexora combines a high-converting digital agency presence with a unified multi-tenant CRM, CMS, project delivery, HR, recruitment, and finance workspace.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Nexora — Digital Agency & Integrated CRM Platform",
    description:
      "Full-stack digital agency website, CRM sales pipeline, CMS, HR, and finance platform.",
    type: "website",
    siteName: "Nexora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexora — Digital Agency & CRM Platform",
    description:
      "Full-stack digital agency website, CRM sales pipeline, CMS, HR, and finance platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts — loaded via <link> so builds never fail in offline environments */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@300;400;500;600;700;800&family=Mulish:wght@300;400;500;600;700&family=Rubik:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
