import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Clients from "@/components/Clients";
import UseCases from "@/components/UseCases";
import About from "@/components/About";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Clients />
      <UseCases />
      <About />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
