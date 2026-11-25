import { getPublicSiteData } from "@/lib/services/public-cms";
import { HeroSection } from "@/components/public/home/hero-section";
import { AboutSection } from "@/components/public/home/about-section";
import { ServicesAndProcessSection } from "@/components/public/home/services-process-section";
import { WhyChooseUsSection } from "@/components/public/home/why-choose-us-section";
import { PortfolioPreviewSection } from "@/components/public/home/portfolio-preview-section";
import { TeamPreviewSection } from "@/components/public/home/team-preview-section";
import { TestimonialsSection } from "@/components/public/home/testimonials-section";
import { PartnerLogosSection } from "@/components/public/home/partner-logos-section";
import { HomeContactSection } from "@/components/public/home/home-contact-section";
import { BlogPreviewSection } from "@/components/public/home/blog-preview-section";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getPublicSiteData();

  return (
    <>
      <HeroSection tagline={data.tagline} />
      <AboutSection />
      <ServicesAndProcessSection services={data.services} />
      <WhyChooseUsSection />
      <PortfolioPreviewSection projects={data.portfolio} />
      <TeamPreviewSection team={data.team} />
      <TestimonialsSection testimonials={data.testimonials} />
      <PartnerLogosSection />
      <HomeContactSection
        services={data.services.map((s) => ({ title: s.title, slug: s.slug }))}
      />
      <BlogPreviewSection posts={data.blogPosts} />
    </>
  );
}
