import { ServicesProvider } from "@/contexts/services-context";
import { ControlRoomProvider } from "@/contexts/control-room-context";
import { NewSourceForm } from "@/components/sources/new-source-form";

export default function NewSourcePage() {
  return (
    <ServicesProvider>
      <ControlRoomProvider>
        <NewSourceForm />
      </ControlRoomProvider>
    </ServicesProvider>
  );
}
