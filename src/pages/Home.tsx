import { Hero } from "../sections/Hero";
import { Projects } from "../sections/Projects";
import { Focus } from "../sections/Focus";
import { Research } from "../sections/Research";
import { About } from "../sections/About";
import { Contact } from "../sections/Contact";
import { Gallery } from "../sections/Gallery";

export function Home() {
  return (
    <>
      <Hero />
      <Projects />
      <Focus />
      <Research />
      <About />
      <Gallery />
      <Contact />
    </>
  );
}
