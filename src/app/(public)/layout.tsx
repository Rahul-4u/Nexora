import { getPublicSiteData } from "@/lib/services/public-cms";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooterSwitch } from "@/components/public/public-footer-switch";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteData = await getPublicSiteData();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--webtec-surface)] text-[var(--webtec-body)]">
      <PublicHeader
        siteName={siteData.siteName}
        phone={siteData.phone}
        services={siteData.services.map((s) => ({
          title: s.title,
          slug: s.slug,
        }))}
        projects={siteData.portfolio.map((p) => ({
          title: p.title,
          slug: p.slug,
        }))}
        posts={siteData.blogPosts.map((b) => ({
          title: b.title,
          slug: b.slug,
        }))}
      />
      <main className="flex-1">{children}</main>
      <PublicFooterSwitch
        siteName={siteData.siteName}
        phone={siteData.phone}
        email={siteData.email}
        address={siteData.address}
      />
    </div>
  );
}
