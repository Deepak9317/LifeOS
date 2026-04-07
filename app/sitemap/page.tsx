import { InfoPage } from "@/components/info-page";

export default function SitemapPage() {
  return (
    <InfoPage
      eyebrow="Sitemap"
      intro="A quick overview of the main pages available in LifeOS."
      sections={[
        {
          title: "Workspace pages",
          body: "Dashboard, Tasks, Notes, Time, Budget, Focus Mode, and Profile are the main product pages used inside the authenticated workspace."
        },
        {
          title: "Company pages",
          body: "About, Privacy, Terms and conditions, Contact us, and Sitemap provide the supporting product and policy information available from the top navigation."
        }
      ]}
      title="Sitemap"
    />
  );
}
