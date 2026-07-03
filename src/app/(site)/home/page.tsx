import HeroSection from '@/components/sections/hero-section';
import { SpeakersSection } from '@/components/sections/core-features';
import SectionDivider from '@/components/sections/section-divider';
import WorkshopChairs from '@/components/sections/workshop-chairs';

export default async function Home() {
  return (
    <>
      <HeroSection />
      <SectionDivider />
      <SpeakersSection />
      <SectionDivider />
      <WorkshopChairs />
    </>
  );
}
