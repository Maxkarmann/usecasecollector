import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-mountains.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-start overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-20">
        <div className="max-w-3xl">
          {/* Tag */}
          <p 
            className="text-primary font-medium tracking-widest uppercase text-sm mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Building Digital Leaders
          </p>
          
          {/* Headline */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-foreground leading-tight mb-8 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Your <span className="text-primary">end-to-end</span>{" "}
            <span className="font-bold">consulting partner</span>: From strategy to AI-powered value creation
          </h1>
          
          {/* CTA */}
          <div 
            className="animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Button variant="hero" size="xl">
              Get In Touch
            </Button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 right-12 hidden lg:flex items-center gap-3">
        {[1, 2, 3, 4].map((num, index) => (
          <div key={num} className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">/</span>
            <span
              className={`text-sm font-medium ${
                index === 0 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              0{num}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
