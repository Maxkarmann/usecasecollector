import { ArrowRight, BarChart3, Brain, Code, Layers, Zap, Shield } from "lucide-react";

const useCases = [
  {
    icon: Brain,
    title: "AI Integration",
    description: "Leverage cutting-edge AI models to transform your business processes and unlock new value streams.",
    category: "Artificial Intelligence",
  },
  {
    icon: BarChart3,
    title: "Data Analytics",
    description: "Turn raw data into actionable insights with advanced analytics and visualization solutions.",
    category: "Analytics",
  },
  {
    icon: Code,
    title: "Digital Transformation",
    description: "Modernize legacy systems and embrace cloud-native architectures for scalable growth.",
    category: "Technology",
  },
  {
    icon: Layers,
    title: "Platform Strategy",
    description: "Build robust digital platforms that create network effects and competitive advantages.",
    category: "Strategy",
  },
  {
    icon: Zap,
    title: "Process Automation",
    description: "Streamline operations with intelligent automation that reduces costs and improves efficiency.",
    category: "Operations",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Protect your digital assets with comprehensive security strategies and implementations.",
    category: "Security",
  },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-primary font-medium tracking-widest uppercase text-xs mb-4">
            What We Do
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Transformative <span className="text-primary">Use Cases</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Explore our comprehensive suite of solutions designed to accelerate your digital journey and deliver measurable business impact.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.title}
              className="group glass-card rounded-xl p-8 hover-lift cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <useCase.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Category */}
              <p className="text-xs font-medium tracking-wide uppercase text-primary mb-3">
                {useCase.category}
              </p>

              {/* Title */}
              <h3 className="text-xl font-display font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                {useCase.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {useCase.description}
              </p>

              {/* Link */}
              <div className="flex items-center gap-2 text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Learn More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
