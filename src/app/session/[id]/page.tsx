import { ServicesProvider } from "@/contexts/services-context";
import { SessionView } from "@/components/session/session-view";

export default async function SessionPage({ params }: PageProps<"/session/[id]">) {
  const { id } = await params;

  return (
    <ServicesProvider>
      <SessionView trackId={id} />
    </ServicesProvider>
  );
}
