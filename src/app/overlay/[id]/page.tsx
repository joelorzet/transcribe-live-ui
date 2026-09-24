import { Suspense } from "react";
import { ServicesProvider } from "@/contexts/services-context";
import { OverlayView } from "@/components/overlay/overlay-view";

export default async function OverlayPage({ params }: PageProps<"/overlay/[id]">) {
  const { id } = await params;

  return (
    <ServicesProvider>
      <Suspense fallback={null}>
        <OverlayView trackId={id} />
      </Suspense>
    </ServicesProvider>
  );
}
