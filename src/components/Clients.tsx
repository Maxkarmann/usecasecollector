const clients = [
  "Microsoft",
  "Google",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Spotify",
  "Salesforce",
];

const Clients = () => {
  return (
    <section className="py-16 border-y border-border/30">
      <div className="container mx-auto px-6 lg:px-12">
        <p className="text-primary font-medium tracking-widest uppercase text-xs text-center mb-12">
          Our Clients
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {clients.map((client) => (
            <div
              key={client}
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-300 text-xl font-display font-semibold tracking-tight"
            >
              {client}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;
