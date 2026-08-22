import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyClient } from "./VerifyClient";

export const metadata: Metadata = {
  title: "Verify attendance",
  description:
    "Check whether any wallet holds a given onchain POAP — with the mint receipt to prove it.",
};

export default function Page() {
  return (
    <Suspense>
      <VerifyClient />
    </Suspense>
  );
}
