import { InfoPage } from "@/components/info-page";

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      intro="If you need help, have feedback, or want to discuss LifeOS, this page gives users a clear place to reach out."
      sections={[
        {
          title: "Support",
          body: "For product questions, account issues, or feature suggestions, use your preferred support channel and include enough detail for the team to help quickly."
        },
        {
          title: "Partnerships and feedback",
          body: "LifeOS welcomes product feedback, collaboration ideas, and implementation discussions. Clear examples, screenshots, and context help speed things up."
        }
      ]}
      title="Contact us"
    />
  );
}
