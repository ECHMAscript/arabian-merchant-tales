import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/40" />
      
      {/* Arabesque Pattern Overlay */}
      <div className="absolute inset-0 pattern-arabesque opacity-30" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-fade-in">
          <span className="inline-block px-4 py-2 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-gold/30">
            ✦ New Collection 2024
          </span>
          <h1 className="font-hero text-4xl md:text-5xl lg:text-6xl font-bold text-card leading-tight mb-6">
            Discover the Elegance of 
            <span className="text-gold-light"> Arabian</span> Craftsmanship
          </h1>
          <p className="font-body text-card/90 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
            Explore our curated collection of handcrafted treasures, where ancient traditions meet modern luxury.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="lg" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Shop Collection
            </Button>
            <Button variant="outline" size="lg" className="text-card border-card/50 hover:bg-card/10 hover:text-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              Explore More
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold">
          <path 
            d="M0 100 L0 50 Q25 50 25 25 Q25 0 50 0 L100 0 L100 100 Z" 
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
