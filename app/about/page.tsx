import { InfoPage } from "@/components/info-page";

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About LifeOS"
      intro="LifeOS is a personal operating system for planning, focus, notes, and time awareness in one calm workspace."
      sections={[
        {
          title: "What LifeOS does",
          body: "LifeOS brings together task planning, note capture, focus workflows, budget tracking, and world time tools so your day stays organized without spreading work across too many apps."
        },
        {
          title: "How we design",
          body: "We aim for interfaces that are clean, readable, and fast to act on. The goal is to reduce friction so your dashboard feels like a control center instead of a cluttered workspace."
        }
      ]}
      title="About"
    />
  );
}
