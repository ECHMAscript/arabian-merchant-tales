import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Scissors } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface GarmentType {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  image: string;
  measurements: { id: string; label: string; placeholder: string; unit: string }[];
}

const garmentTypes: GarmentType[] = [
  {
    id: "hijab",
    name: "Hijab / Headscarf",
    arabicName: "حجاب",
    description: "Traditional modest headscarf worn by Muslim women",
    image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400&h=500&fit=crop",
    measurements: [
      { id: "headCircumference", label: "Head Circumference", placeholder: "e.g., 56", unit: "cm" },
      { id: "lengthFront", label: "Length (Front)", placeholder: "e.g., 70", unit: "cm" },
      { id: "lengthBack", label: "Length (Back)", placeholder: "e.g., 80", unit: "cm" },
      { id: "width", label: "Width", placeholder: "e.g., 65", unit: "cm" },
    ],
  },
  {
    id: "abaya",
    name: "Abaya",
    arabicName: "عباية",
    description: "Elegant flowing outer garment worn by Muslim women",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop",
    measurements: [
      { id: "height", label: "Full Length (Shoulder to Floor)", placeholder: "e.g., 145", unit: "cm" },
      { id: "shoulder", label: "Shoulder Width", placeholder: "e.g., 42", unit: "cm" },
      { id: "bust", label: "Bust Circumference", placeholder: "e.g., 96", unit: "cm" },
      { id: "waist", label: "Waist Circumference", placeholder: "e.g., 80", unit: "cm" },
      { id: "hips", label: "Hip Circumference", placeholder: "e.g., 102", unit: "cm" },
      { id: "sleeveLength", label: "Sleeve Length", placeholder: "e.g., 60", unit: "cm" },
      { id: "sleeveWidth", label: "Sleeve Width", placeholder: "e.g., 38", unit: "cm" },
    ],
  },
  {
    id: "thobe",
    name: "Thobe / Kandura",
    arabicName: "ثوب",
    description: "Traditional ankle-length white robe worn by Arabian men",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop",
    measurements: [
      { id: "height", label: "Full Length (Shoulder to Ankle)", placeholder: "e.g., 150", unit: "cm" },
      { id: "shoulder", label: "Shoulder Width", placeholder: "e.g., 48", unit: "cm" },
      { id: "chest", label: "Chest Circumference", placeholder: "e.g., 104", unit: "cm" },
      { id: "neck", label: "Neck Circumference", placeholder: "e.g., 40", unit: "cm" },
      { id: "sleeveLength", label: "Sleeve Length", placeholder: "e.g., 65", unit: "cm" },
      { id: "wrist", label: "Wrist Circumference", placeholder: "e.g., 18", unit: "cm" },
    ],
  },
  {
    id: "bisht",
    name: "Bisht / Cloak",
    arabicName: "بشت",
    description: "Formal men's cloak worn over the thobe for special occasions",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
    measurements: [
      { id: "height", label: "Full Length", placeholder: "e.g., 155", unit: "cm" },
      { id: "shoulder", label: "Shoulder Width", placeholder: "e.g., 52", unit: "cm" },
      { id: "chest", label: "Chest Circumference", placeholder: "e.g., 110", unit: "cm" },
      { id: "armOpening", label: "Arm Opening Width", placeholder: "e.g., 45", unit: "cm" },
    ],
  },
];

const Tailoring = () => {
  const [selectedGarment, setSelectedGarment] = useState<GarmentType | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleMeasurementChange = (id: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to place a tailoring order.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!selectedGarment) return;
    setSubmitting(true);

    const notesEl = document.getElementById("notes") as HTMLTextAreaElement | null;

    const { error } = await supabase.from("tailoring_orders").insert({
      user_id: user.id,
      customer_name: user.user_metadata?.username || user.email?.split("@")[0] || "Customer",
      customer_email: user.email,
      garment_type: selectedGarment.id,
      garment_name: selectedGarment.name,
      measurements,
      special_notes: notesEl?.value || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Failed to submit order. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Order Submitted!", description: `Your custom ${selectedGarment.name} order has been received. We'll contact you soon.` });
      setMeasurements({});
      setSelectedGarment(null);
    }
  };

  const handleBack = () => {
    setSelectedGarment(null);
    setMeasurements({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <Scissors className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gold" />
          <h1 className="font-heading text-3xl md:text-5xl text-foreground mb-4">
            Custom Tailoring
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Experience the art of bespoke Arabian fashion. Select your garment and provide your measurements for a perfect fit.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-12">
        {!selectedGarment ? (
          /* Garment Selection Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {garmentTypes.map((garment) => (
              <Card
                key={garment.id}
                className="group cursor-pointer overflow-hidden border-2 border-transparent hover:border-gold/50 transition-all duration-300 hover:shadow-gold"
                onClick={() => setSelectedGarment(garment)}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={garment.image}
                    alt={garment.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-4 md:p-6 text-center bg-card">
                  <p className="text-gold font-arabic text-xl md:text-2xl mb-1">{garment.arabicName}</p>
                  <h3 className="font-heading text-lg md:text-xl text-foreground mb-2">{garment.name}</h3>
                  <p className="text-muted-foreground text-sm">{garment.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Wardrobe Style Measurement Form */
          <div className="animate-fade-in">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Selection
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left: Garment Display */}
              <div className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-xl z-10" />
                  <img
                    src={selectedGarment.image}
                    alt={selectedGarment.name}
                    className="w-full aspect-[3/4] object-cover rounded-xl shadow-elegant"
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-20 text-center">
                    <p className="text-gold font-arabic text-2xl md:text-3xl mb-1">
                      {selectedGarment.arabicName}
                    </p>
                    <h2 className="font-heading text-xl md:text-2xl text-foreground">
                      {selectedGarment.name}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Right: Measurement Form */}
              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                <h3 className="font-heading text-xl md:text-2xl text-foreground mb-2">
                  Your Measurements
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Please provide accurate measurements for the perfect fit.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedGarment.measurements.map((measurement) => (
                      <div key={measurement.id} className="space-y-2">
                        <Label htmlFor={measurement.id} className="text-foreground">
                          {measurement.label}
                        </Label>
                        <div className="relative">
                          <Input
                            id={measurement.id}
                            type="number"
                            placeholder={measurement.placeholder}
                            value={measurements[measurement.id] || ""}
                            onChange={(e) => handleMeasurementChange(measurement.id, e.target.value)}
                            className="pr-12"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {measurement.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="notes" className="text-foreground">
                      Special Requests (Optional)
                    </Label>
                    <textarea
                      id="notes"
                      placeholder="Any specific design preferences, fabric choices, or additional notes..."
                      className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>

                  <Button type="submit" variant="gold" size="lg" className="w-full mt-6" disabled={submitting}>
                    <Scissors className="w-5 h-5 mr-2" />
                    {submitting ? "Submitting..." : "Submit Custom Order"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Tailoring;
