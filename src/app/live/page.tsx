import type { Metadata } from "next";
import { ServicesProvider } from "@/contexts/services-context";
import { AudienceIndex } from "@/components/audience/audience-index";

export const metadata: Metadata = {
  title: "Live subtitles",
  description: "Pick a talk and the language you want to read it in.",
};

export default function AudiencePage() {
  return (
    <ServicesProvider>
      <AudienceIndex />
    </ServicesProvider>
  );
}
