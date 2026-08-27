import { AppointmentManager } from "@/components/admin/AppointmentManager";
import { DocumentManager } from "@/components/admin/DocumentManager";

export default function DocumentePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <DocumentManager />
      <AppointmentManager />
    </div>
  );
}
