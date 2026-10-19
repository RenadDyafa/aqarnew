import { notFound } from "next/navigation";
import { dirOf, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SceneLayer } from "@/components/three/SceneLayer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Dive } from "@/components/sections/Dive";
import { Assets } from "@/components/sections/Assets";
import { PropertyMap } from "@/components/sections/PropertyMap";
import { Approach } from "@/components/sections/Approach";
import { Why } from "@/components/sections/Why";
import { Vision } from "@/components/sections/Vision";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { Contact } from "@/components/sections/Contact";

/*
  Page rhythm: transparent sections are windows onto the fixed 3D layer,
  opaque sections are rooms built over it.

  Hero (3D) → About → Services → Dive (3D → photograph) → Assets → Property map
  → Approach → Why AQAR → Vision 2030 → Ecosystem → Contact (3D) → Footer
*/
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const dir = dirOf(lang);

  return (
    <>
      <SceneLayer dir={dir} />
      <main id="main" tabIndex={-1} className="relative outline-none">
        <Hero t={t} />
        <About t={t} />
        <Services t={t} />
        <Dive t={t} />
        <Assets t={t} dir={dir} />
        <PropertyMap t={t} />
        <Approach t={t} />
        <Why t={t} />
        <Vision t={t} />
        <Ecosystem t={t} />
        <Contact t={t} />
      </main>
    </>
  );
}
