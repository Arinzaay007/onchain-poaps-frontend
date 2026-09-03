import { KioskClient } from "./KioskClient";

export default function KioskPage({ params }: { params: { id: string } }) {
  return <KioskClient id={params.id} />;
}
