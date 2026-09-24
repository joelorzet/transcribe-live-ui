import type { Metadata } from "next";
import { ServicesProvider } from "@/contexts/services-context";
import { AudienceIndex } from "@/components/audience/audience-index";

export const metadata: Metadata = {
  title: "Subtítulos en vivo",
  description: "Elegí la charla y el idioma de los subtítulos.",
};

export default function AudiencePage() {
  return (
    <ServicesProvider>
      <AudienceIndex />
    </ServicesProvider>
  );
}
