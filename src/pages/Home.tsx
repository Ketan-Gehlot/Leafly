import Footer from "../components/Footer";

import Hero from "../sections/Hero";
import BrandValues from "../sections/BrandValues";
import FeaturedTeaCollections from "../sections/FeaturedTeaCollections";
import Gifting from "../sections/Gifting";
import TeaRitual from "../sections/TeaRitual";

export default function Home() {
  return (
    <div className="leafly-app">

      <main>

        <Hero />

        <BrandValues />

        <FeaturedTeaCollections />

        <Gifting />

        <TeaRitual />

      </main>

      <Footer />

    </div>
  );
}