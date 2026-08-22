import type { Metadata } from "next";
import { ManageClient } from "./ManageClient";

export const metadata: Metadata = { title: "Manage POAP" };

export default function Page({ params }: { params: { id: string } }) {
  return <ManageClient id={params.id} />;
}
