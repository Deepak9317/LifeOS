import { InfoPage } from "@/components/info-page";

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms and conditions"
      intro="These terms describe how LifeOS is intended to be used and the baseline expectations around access, responsible use, and service changes."
      sections={[
        {
          title: "Using the service",
          body: "You may use LifeOS for lawful personal or business productivity workflows. You are responsible for your account activity and for keeping your login credentials secure."
        },
        {
          title: "Service updates",
          body: "LifeOS may evolve over time through interface updates, feature changes, and reliability improvements. We aim to keep the experience stable while continuing to improve the product."
        }
      ]}
      title="Terms and conditions"
    />
  );
}
