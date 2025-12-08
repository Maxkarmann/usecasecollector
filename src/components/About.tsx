import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <p className="text-primary font-medium tracking-widest uppercase text-xs mb-4">
              About Us
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Pioneering the <span className="text-primary">Future</span> of Digital Excellence
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              We are a team of strategists, technologists, and innovators dedicated to helping organizations navigate the complexities of digital transformation.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              With deep expertise across industries and technologies, we deliver end-to-end solutions that create lasting value. From strategy to implementation, we partner with you every step of the way.
            </p>
            <Button variant="outline" size="lg" className="group">
              Discover Our Story
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: "500+", label: "Projects Delivered" },
              { value: "98%", label: "Client Satisfaction" },
              { value: "50+", label: "Industry Experts" },
              { value: "15+", label: "Years Experience" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="glass-card rounded-xl p-8 text-center hover-lift"
              >
                <div className="text-4xl lg:text-5xl font-display font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
