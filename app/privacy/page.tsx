import { InfoPage } from "@/components/info-page";

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      intro="LifeOS is designed to keep your workspace personal and straightforward. We only use the information needed to provide the product experience."
      sections={[
        {
          title: "Account data",
          body: "LifeOS stores the basic account details required to authenticate you and personalize your workspace. Your tasks, notes, and settings stay scoped to your account."
        },
        {
          title: "Product behavior",
          body: "If location-aware features are used, LifeOS limits that to light metadata such as timezone or country context for a better experience rather than storing raw network information."
        }
      ]}
      title="Privacy"
    />
  );
}
