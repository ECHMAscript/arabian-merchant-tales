import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { ChevronRight, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import AddArticleModal from "@/components/admin/AddArticleModal";
import AddTopicModal from "@/components/admin/AddTopicModal";
import { useDbTopics, useDbArticles } from "@/hooks/useDbArticles";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import { useDeleteItem } from "@/hooks/useDeleteItem";

interface FAQSection {
  id: string;
  title: string;
  links: {
    id: string;
    title: string;
    content: string;
  }[];
}

// Static FAQ sections as fallback
const staticFaqSections: FAQSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    links: [
      {
        id: "about-roohalandalus",
        title: "About Rooh Al Andalus",
        content: `
          <h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">About Rooh Al Andalus</h2>
          <p class="text-muted-foreground mb-4">
            Rooh Al Andalus is your premier destination for authentic Arabian-inspired fashion and home décor. 
            Founded in 2020, we bridge the gap between traditional Middle Eastern craftsmanship and 
            contemporary style, bringing you curated collections that celebrate the rich heritage of 
            Arabian artistry.
          </p>
          <p class="text-muted-foreground mb-4">
            Our name, "Rooh Al Andalus" (روح الأندلس), meaning "Soul of Andalusia," pays homage to the rich cultural 
            heritage of Islamic Spain. Combined with our commitment to quality, we represent elegance in every piece we offer.
          </p>
          <h3 class="font-display text-xl text-foreground mt-8 mb-4">Our Mission</h3>
          <p class="text-muted-foreground mb-4">
            To preserve and promote traditional Arabian craftsmanship while making it accessible to 
            a global audience. We work directly with artisans across the Middle East and North Africa 
            to ensure fair trade practices and authentic quality.
          </p>
        `,
      },
      {
        id: "our-story",
        title: "Our Story",
        content: `
          <h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">Our Story</h2>
          <p class="text-muted-foreground mb-4">
            Rooh Al Andalus began as a passion project by our founder, who traveled extensively through 
            Morocco, Egypt, and the Arabian Peninsula. Captivated by the intricate patterns, rich 
            fabrics, and timeless designs found in traditional souks, she dreamed of sharing these 
            treasures with the world.
          </p>
          <p class="text-muted-foreground mb-4">
            What started as a small collection of handpicked items has grown into a curated marketplace 
            featuring hundreds of products from dozens of artisans. Each piece tells a story of 
            heritage, skill, and cultural significance.
          </p>
          <h3 class="font-display text-xl text-foreground mt-8 mb-4">Our Journey</h3>
          <ul class="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li><strong>2020:</strong> Rooh Al Andalus launches with 50 handpicked products</li>
            <li><strong>2021:</strong> Partnership with 20+ artisan communities established</li>
            <li><strong>2022:</strong> Expanded to include tailoring and custom services</li>
            <li><strong>2023:</strong> Launched our sustainable packaging initiative</li>
            <li><strong>2024:</strong> Serving customers in over 30 countries</li>
          </ul>
        `,
      },
      {
        id: "how-to-shop",
        title: "How to Shop",
        content: `
          <h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">How to Shop</h2>
          <p class="text-muted-foreground mb-4">
            Shopping at Rooh Al Andalus is designed to be a seamless and enjoyable experience. Here's how 
            to get started:
          </p>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">1. Browse Our Collections</h3>
          <p class="text-muted-foreground mb-4">
            Explore our curated categories including Men's and Women's fashion, home décor, pottery, 
            and handcrafted lamps. Use our filters to narrow down by price, color, and size.
          </p>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">2. Add to Cart</h3>
          <p class="text-muted-foreground mb-4">
            Found something you love? Click "Add to Cart" to save it. You can continue browsing and 
            add multiple items before checking out.
          </p>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">3. Save Your Favorites</h3>
          <p class="text-muted-foreground mb-4">
            Click the heart icon on any product to save it to your favorites for later. Access your 
            saved items anytime from the Favorites page.
          </p>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">4. Checkout Securely</h3>
          <p class="text-muted-foreground mb-4">
            When you're ready, proceed to checkout. We accept all major credit cards and offer 
            secure payment processing.
          </p>
        `,
      },
    ],
  },
  {
    id: "orders-shipping",
    title: "Orders & Shipping",
    links: [
      {
        id: "shipping-info",
        title: "Shipping Information",
        content: `
          <h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">Shipping Information</h2>
          <p class="text-muted-foreground mb-4">
            We ship worldwide from our distribution centers in Dubai and Marrakech. Shipping times 
            and costs vary depending on your location.
          </p>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">Domestic Shipping (UAE)</h3>
          <ul class="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>Standard Delivery: 2-3 business days (Free over 200 AED)</li>
            <li>Express Delivery: Next business day (25 AED)</li>
          </ul>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">International Shipping</h3>
          <ul class="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>GCC Countries: 3-5 business days</li>
            <li>Europe & USA: 7-10 business days</li>
            <li>Rest of World: 10-15 business days</li>
          </ul>
          <p class="text-muted-foreground mt-4">
            All orders include tracking information sent via email upon dispatch.
          </p>
        `,
      },
      {
        id: "order-tracking",
        title: "Order Tracking",
        content: `
          <h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">Order Tracking</h2>
          <p class="text-muted-foreground mb-4">
            Stay informed about your order every step of the way. Once your order ships, you'll 
            receive an email with your tracking number.
          </p>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">How to Track Your Order</h3>
          <ol class="list-decimal list-inside text-muted-foreground space-y-2 mb-4">
            <li>Check your email for the shipping confirmation</li>
            <li>Click the tracking link provided</li>
            <li>Or visit our Order Tracking page and enter your order number</li>
          </ol>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">Order Statuses</h3>
          <ul class="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li><strong>Processing:</strong> Your order is being prepared</li>
            <li><strong>Shipped:</strong> Your package is on its way</li>
            <li><strong>In Transit:</strong> Your package is with the carrier</li>
            <li><strong>Delivered:</strong> Your package has arrived</li>
          </ul>
        `,
      },
      {
        id: "returns-exchanges",
        title: "Returns & Exchanges",
        content: `
          <h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">Returns & Exchanges</h2>
          <p class="text-muted-foreground mb-4">
            We want you to love your purchase. If something isn't right, we're here to help.
          </p>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">Return Policy</h3>
          <ul class="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>30-day return window for unworn, tagged items</li>
            <li>Original packaging required</li>
            <li>Custom/tailored items are final sale</li>
            <li>Home décor items must be unused and in original packaging</li>
          </ul>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">How to Return</h3>
          <ol class="list-decimal list-inside text-muted-foreground space-y-2 mb-4">
            <li>Contact our support team to initiate a return</li>
            <li>Receive your prepaid return label</li>
            <li>Pack items securely with all original tags</li>
            <li>Drop off at your nearest shipping location</li>
            <li>Refund processed within 5-7 business days of receipt</li>
          </ol>
        `,
      },
    ],
  },
  {
    id: "tailoring-services",
    title: "Tailoring Services",
    links: [
      {
        id: "custom-tailoring",
        title: "Custom Tailoring",
        content: `
          <h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">Custom Tailoring</h2>
          <p class="text-muted-foreground mb-4">
            Experience the luxury of made-to-measure garments with our bespoke tailoring service. 
            Each piece is crafted to your exact specifications by master tailors with decades of 
            experience.
          </p>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">What We Offer</h3>
          <ul class="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>Traditional thobes and dishdashas</li>
            <li>Abayas and modest fashion wear</li>
            <li>Kaftans and evening wear</li>
            <li>Custom suits with Arabian-inspired details</li>
          </ul>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">The Process</h3>
          <ol class="list-decimal list-inside text-muted-foreground space-y-2 mb-4">
            <li>Consultation: Discuss your vision and requirements</li>
            <li>Measurements: Provide your measurements or visit our studio</li>
            <li>Fabric Selection: Choose from our premium fabric collection</li>
            <li>Creation: Your garment is handcrafted over 2-3 weeks</li>
            <li>Delivery: Receive your custom piece, beautifully packaged</li>
          </ol>
        `,
      },
      {
        id: "measurement-guide",
        title: "Measurement Guide",
        content: `
          <h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">Measurement Guide</h2>
          <p class="text-muted-foreground mb-4">
            Accurate measurements are key to a perfect fit. Follow our guide to measure yourself 
            at home, or visit our studio for professional measuring.
          </p>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">Essential Measurements</h3>
          <ul class="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li><strong>Chest:</strong> Measure around the fullest part of your chest</li>
            <li><strong>Waist:</strong> Measure around your natural waistline</li>
            <li><strong>Hips:</strong> Measure around the fullest part of your hips</li>
            <li><strong>Shoulder:</strong> Measure from shoulder point to shoulder point</li>
            <li><strong>Sleeve:</strong> Measure from shoulder to wrist with arm slightly bent</li>
            <li><strong>Length:</strong> Measure from shoulder to desired hem length</li>
          </ul>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">Tips for Accurate Measurements</h3>
          <ul class="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>Use a soft measuring tape</li>
            <li>Wear fitted clothing or undergarments</li>
            <li>Stand naturally with arms at sides</li>
            <li>Have someone help for best accuracy</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: "contact-support",
    title: "Contact & Support",
    links: [
      {
        id: "contact-us",
        title: "Contact Us",
        content: `
          <h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">Contact Us</h2>
          <p class="text-muted-foreground mb-4">
            We'd love to hear from you! Our customer service team is available to assist with 
            any questions or concerns.
          </p>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">Customer Service</h3>
          <ul class="text-muted-foreground space-y-2 mb-4">
            <li><strong>Email:</strong> support@roohalandalus.com</li>
            <li><strong>Phone:</strong> +971 4 123 4567</li>
            <li><strong>WhatsApp:</strong> +971 50 123 4567</li>
            <li><strong>Hours:</strong> Sunday - Thursday, 9am - 6pm GST</li>
          </ul>
          <h3 class="font-display text-xl text-foreground mt-6 mb-4">Visit Our Studio</h3>
          <p class="text-muted-foreground mb-4">
            Rooh Al Andalus Showroom<br />
            Dubai Design District<br />
            Building 7, Ground Floor<br />
            Dubai, UAE
          </p>
          <p class="text-muted-foreground">
            <strong>Studio Hours:</strong> Saturday - Thursday, 10am - 8pm
          </p>
        `,
      },
      {
        id: "faq",
        title: "Frequently Asked Questions",
        content: `
          <h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">Frequently Asked Questions</h2>
          
          <div class="space-y-6">
            <div>
              <h3 class="font-display text-lg text-foreground mb-2">Do you ship internationally?</h3>
              <p class="text-muted-foreground">
                Yes! We ship to over 30 countries worldwide. Shipping times and costs vary by location.
              </p>
            </div>
            
            <div>
              <h3 class="font-display text-lg text-foreground mb-2">Are your products authentic?</h3>
              <p class="text-muted-foreground">
                Absolutely. We work directly with artisans and master craftspeople to ensure every 
                piece is authentically made using traditional techniques.
              </p>
            </div>
            
            <div>
              <h3 class="font-display text-lg text-foreground mb-2">How long does custom tailoring take?</h3>
              <p class="text-muted-foreground">
                Custom pieces typically take 2-3 weeks to complete, depending on the complexity 
                of the design and current demand.
              </p>
            </div>
            
            <div>
              <h3 class="font-display text-lg text-foreground mb-2">Can I modify an existing design?</h3>
              <p class="text-muted-foreground">
                Yes! Our tailoring service allows for modifications and customizations. Contact us 
                to discuss your specific requirements.
              </p>
            </div>
            
            <div>
              <h3 class="font-display text-lg text-foreground mb-2">What payment methods do you accept?</h3>
              <p class="text-muted-foreground">
                We accept Visa, Mastercard, American Express, Apple Pay, and bank transfers for 
                larger orders.
              </p>
            </div>
          </div>
        `,
      },
    ],
  },
];

const About = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicMode, setTopicMode] = useState<"section" | "subtopic">("section");
  const { isAdmin } = useAdmin();

  // Fetch dynamic topics and articles from database
  const { topics: dbTopics, refetch: refetchTopics } = useDbTopics();
  const { articles: dbArticles, refetch: refetchArticles } = useDbArticles();
  const { deleteItem } = useDeleteItem();

  // Check if a section/topic is from database (UUID format)
  const isDbItem = (id: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  };

  const handleDeleteTopic = (id: string, title: string) => {
    deleteItem("topics", id, title, () => {
      refetchTopics();
      refetchArticles();
      // Reset view if deleted topic was active
      if (activeSection === id || activeLinkId === id) {
        setActiveSection(null);
        setActiveLinkId(null);
      }
    });
  };

  const handleDeleteArticle = (id: string, title: string) => {
    deleteItem("articles", id, title, () => {
      refetchArticles();
      if (activeLinkId === id) {
        setActiveLinkId(null);
      }
    });
  };

  // Combine static and dynamic sections
  const faqSections = useMemo(() => {
    // Get parent topics (sections) from database
    const dbSections = dbTopics
      .filter((t) => !t.parent_id)
      .map((section) => {
        // Get subtopics for this section
        const subtopics = dbTopics.filter((t) => t.parent_id === section.id);
        
        // Get articles for subtopics
        const links = subtopics.map((subtopic) => {
          const article = dbArticles.find((a) => a.topic_id === subtopic.id);
          return {
            id: subtopic.id,
            title: subtopic.title,
            content: article?.content || `<h2 class="font-display text-2xl md:text-3xl text-foreground mb-6">${subtopic.title}</h2><p class="text-muted-foreground">Content coming soon...</p>`,
          };
        });

        // Also check for articles directly under the section
        const sectionArticles = dbArticles.filter((a) => a.topic_id === section.id);
        sectionArticles.forEach((article) => {
          if (!links.find((l) => l.id === article.id)) {
            links.push({
              id: article.id,
              title: article.title,
              content: article.content,
            });
          }
        });

        return {
          id: section.id,
          title: section.title,
          links,
        };
      });

    // Combine static with dynamic, putting dynamic first
    return [...dbSections, ...staticFaqSections];
  }, [dbTopics, dbArticles]);

  // Initialize expanded sections when faqSections change
  useMemo(() => {
    if (expandedSections.length === 0 && faqSections.length > 0) {
      setExpandedSections(faqSections.map((s) => s.id));
    }
  }, [faqSections, expandedSections.length]);

  const activeLink = activeSection
    ? faqSections
        .find((s) => s.id === activeSection)
        ?.links.find((l) => l.id === activeLinkId)
    : null;

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLinkClick = (sectionId: string, linkId: string) => {
    setActiveSection(sectionId);
    setActiveLinkId(linkId);
  };

  const handleBackToFAQ = () => {
    setActiveSection(null);
    setActiveLinkId(null);
  };

  const handleAddSection = () => {
    setTopicMode("section");
    setIsTopicModalOpen(true);
  };

  const handleAddSubtopic = () => {
    setTopicMode("subtopic");
    setIsTopicModalOpen(true);
  };

  const handleTopicAdded = () => {
    refetchTopics();
  };

  const handleArticleAdded = () => {
    refetchArticles();
    refetchTopics();
  };

  // Build sections list for modals (combining static + dynamic)
  const allSections = useMemo(() => {
    return faqSections.map((s) => ({ id: s.id, title: s.title }));
  }, [faqSections]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {activeLink ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    className="cursor-pointer"
                    onClick={handleBackToFAQ}
                  >
                    About
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeLink.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>About</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
            {activeLink ? activeLink.title : "Help & Information"}
          </h1>
          <p className="text-muted-foreground">
            {activeLink 
              ? "Browse our help center for answers" 
              : "Find answers to your questions about Rooh Al Andalus"}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* FAQ Navigation Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-4 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-foreground">Topics</h2>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddSection} title="Add section">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddSubtopic} title="Add subtopic">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <nav className="space-y-2">
                {faqSections.map((section) => (
                  <div key={section.id}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex-1 flex items-center justify-between py-2 px-3 text-left font-medium text-foreground hover:bg-muted/50 rounded-md transition-colors"
                      >
                        {section.title}
                        <ChevronRight
                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                            expandedSections.includes(section.id) ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                      {isDbItem(section.id) && (
                        <AdminDeleteButton
                          onDelete={() => handleDeleteTopic(section.id, section.title)}
                          itemName={section.title}
                          className="ml-1"
                        />
                      )}
                    </div>
                    {expandedSections.includes(section.id) && (
                      <div className="ml-3 border-l border-border pl-3 mt-1 space-y-1">
                        {section.links.map((link) => (
                          <div key={link.id} className="flex items-center justify-between group">
                            <button
                              onClick={() => handleLinkClick(section.id, link.id)}
                              className={`flex-1 text-left py-1.5 px-2 text-sm rounded-md transition-colors ${
                                activeLinkId === link.id
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                              }`}
                            >
                              {link.title}
                            </button>
                            {isDbItem(link.id) && (
                              <AdminDeleteButton
                                onDelete={() => handleDeleteArticle(link.id, link.title)}
                                itemName={link.title}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              
              {/* Admin Post Article Button */}
              {isAdmin && (
                <Button className="w-full mt-4 gap-2" onClick={() => setIsArticleModalOpen(true)}>
                  <FileText className="h-4 w-4" />
                  Post Article
                </Button>
              )}
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            {activeLink ? (
              /* Content View */
              <div className="bg-card rounded-lg border border-border p-6 md:p-8">
                <div
                  className="prose prose-gold max-w-none"
                  dangerouslySetInnerHTML={{ __html: activeLink.content }}
                />
                <button
                  onClick={handleBackToFAQ}
                  className="mt-8 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  ← Back to all topics
                </button>
              </div>
            ) : (
              /* Links Overview */
              <div className="grid gap-6 sm:grid-cols-2">
                {faqSections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-card rounded-lg border border-border p-6 hover:shadow-soft transition-shadow"
                  >
                    <h3 className="font-display text-xl text-foreground mb-4">
                      {section.title}
                    </h3>
                    <ul className="space-y-2">
                      {section.links.map((link) => (
                        <li key={link.id}>
                          <button
                            onClick={() => handleLinkClick(section.id, link.id)}
                            className="text-primary hover:text-primary/80 hover:underline text-left transition-colors"
                          >
                            {link.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Admin Modals */}
      <AddArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        existingSections={allSections}
        onArticleAdded={handleArticleAdded}
      />
      <AddTopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        existingSections={allSections}
        mode={topicMode}
        onTopicAdded={handleTopicAdded}
      />
    </div>
  );
};

export default About;
