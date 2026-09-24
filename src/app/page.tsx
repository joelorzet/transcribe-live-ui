import { ServicesProvider } from "@/contexts/services-context";
import { ControlRoomProvider } from "@/contexts/control-room-context";
import { ControlRoomView } from "@/components/control-room/control-room-view";

export default function ControlRoomPage() {
  return (
    <ServicesProvider>
      <ControlRoomProvider>
        <ControlRoomView />
      </ControlRoomProvider>
    </ServicesProvider>
  );
}
