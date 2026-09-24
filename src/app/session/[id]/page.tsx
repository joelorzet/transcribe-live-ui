import { ServicesProvider } from "@/contexts/services-context";
import { SessionView } from "@/components/session/session-view";
import type { Language } from "@/models/language.model";

export default async function SessionPage({ params, searchParams }: PageProps<"/session/[id]">) {
  const { id } = await params;
  const { lang } = await searchParams;
  const initialLanguage = typeof lang === "string" ? (lang as Language) : undefined;

  return (
    <ServicesProvider>
      <SessionView trackId={id} initialLanguage={initialLanguage} />
    </ServicesProvider>
  );
}
