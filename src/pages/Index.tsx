import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Rooh Al Andalus - Authentic Arabian Luxury Crafts & Artisan Products</title>
        <meta 
          name="description" 
          content="Discover handcrafted Arabian luxury goods. Shop authentic textiles, jewelry, pottery, and home décor from skilled artisans. Free shipping on orders over $100." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />
        
        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <ProductGrid />
        </main>

        {/* Footer */}
        <footer className="bg-foreground text-card py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                    <span className="font-display text-primary-foreground text-lg font-bold">R</span>
                  </div>
                  <span className="font-display text-xl font-semibold text-card">
                    Rooh Al<span className="text-gold-light"> Andalus</span>
                  </span>
                </div>
                <p className="font-body text-card/70 text-sm leading-relaxed">
                  Curating the finest Arabian craftsmanship since 2020. Each piece tells a story of tradition and excellence.
                </p>
              </div>
              
              <div>
                <h4 className="font-display font-semibold text-card mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="font-body text-card/70 hover:text-gold-light transition-colors text-sm">Shop All</a></li>
                  <li><a href="#" className="font-body text-card/70 hover:text-gold-light transition-colors text-sm">New Arrivals</a></li>
                  <li><a href="#" className="font-body text-card/70 hover:text-gold-light transition-colors text-sm">Best Sellers</a></li>
                  <li><a href="#" className="font-body text-card/70 hover:text-gold-light transition-colors text-sm">Sale</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-display font-semibold text-card mb-4">Customer Care</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="font-body text-card/70 hover:text-gold-light transition-colors text-sm">Contact Us</a></li>
                  <li><a href="#" className="font-body text-card/70 hover:text-gold-light transition-colors text-sm">Shipping Info</a></li>
                  <li><a href="#" className="font-body text-card/70 hover:text-gold-light transition-colors text-sm">Returns</a></li>
                  <li><a href="#" className="font-body text-card/70 hover:text-gold-light transition-colors text-sm">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-display font-semibold text-card mb-4">Newsletter</h4>
                <p className="font-body text-card/70 text-sm mb-4">Subscribe for exclusive offers and artisan stories.</p>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Your email"
                    className="flex-1 px-4 py-2 bg-card/10 border border-card/20 rounded-lg text-card placeholder:text-card/50 font-body text-sm focus:ring-2 focus:ring-gold focus:border-gold outline-none"
                  />
                  <button className="px-4 py-2 bg-gold text-foreground font-body font-medium rounded-lg hover:bg-gold-light transition-colors text-sm">
                    Join
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-card/20 mt-10 pt-6 text-center">
              <p className="font-body text-card/50 text-sm">
                © 2024 Rooh Al Andalus. All rights reserved. Crafted with ♥ for artisan traditions.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
