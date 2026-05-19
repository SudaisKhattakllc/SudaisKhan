import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import PortalTransition from "@/components/sections/PortalTransition";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import Cursor from "@/components/ui/Cursor";

export default function Home() {
  return (
    <>
      <Cursor />
      <Navbar />
      <main className="flex flex-col w-full min-h-screen">
        <HeroSection />
        <PortalTransition />
        <ProjectsSection />
        <AboutSection />
        <ContactSection />
      </main>
    </>
  );
}
