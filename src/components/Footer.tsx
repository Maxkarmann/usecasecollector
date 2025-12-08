import { Linkedin, Twitter, Github, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-display font-bold tracking-tight text-foreground">
                USE<span className="text-primary">CASE</span>
              </span>
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Your end-to-end consulting partner for digital transformation and AI-powered value creation.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Linkedin, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Mail, href: "#" },
              ].map(({ icon: Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Services",
              links: ["AI Integration", "Data Analytics", "Digital Transformation", "Platform Strategy"],
            },
            {
              title: "Company",
              links: ["About Us", "Careers", "News", "Contact"],
            },
            {
              title: "Resources",
              links: ["Case Studies", "Blog", "Documentation", "Support"],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-display font-semibold text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 UseCase. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
