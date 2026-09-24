import { ServicesProvider } from "@/contexts/services-context";
import { ControlRoomProvider } from "@/contexts/control-room-context";
import { SourceDetailView } from "@/components/sources/source-detail-view";

export default async function SourceDetailPage({ params }: PageProps<"/sources/[id]">) {
  const { id } = await params;

  return (
    <ServicesProvider>
      <ControlRoomProvider>
        <SourceDetailView trackId={id} />
      </ControlRoomProvider>
    </ServicesProvider>
  );
}
