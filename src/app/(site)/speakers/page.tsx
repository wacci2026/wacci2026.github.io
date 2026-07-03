import { SpeakersSection } from "@/components/sections/core-features";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speakers",
};

export default function SpeakersPage() {
  return <SpeakersSection />;
}
