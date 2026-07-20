import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Plus, Minus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const Checkout = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    email: "",
  });

  const subtotal = cartTotal;
  const shipping = subtotal >= 150 ? 0 : 15;
  const total = subtotal + shipping;

  const canProceed =
    cartItems.length > 0 &&
    (shippingForm.email || user?.email) &&
    shippingForm.firstName &&
    shippingForm.address &&
    shippingForm.city;

  const startCheckout = () => {
    if (!canProceed) {
      toast({
        title: "Missing details",
        description: "Please fill in your name, email, and shipping address.",
        variant: "destructive",
      });
      return;
    }
    setShowCheckout(true);
  };

  const customerName = `${shippingForm.firstName} ${shippingForm.lastName}`.trim();
  const customerEmail = shippingForm.email || user?.email || undefined;
  const returnUrl = `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />

      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-body hidden sm:inline">Continue Shopping</span>
            </Link>
            <div className="flex-1 flex justify-center">
              <span className="font-display text-lg sm:text-xl font-semibold">
                Souk<span className="text-primary">Luxe</span> Checkout
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Your cart is empty</h2>
            <p className="font-body text-muted-foreground mb-6">Add some items to your cart to proceed with checkout.</p>
            <Button asChild variant="gold">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : showCheckout ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-foreground">Complete your payment</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCheckout(false)}>
                  Back
                </Button>
              </div>
              <StripeEmbeddedCheckout
                items={cartItems}
                shippingAddress={{
                  address: shippingForm.address,
                  city: shippingForm.city,
                  state: shippingForm.state,
                  zip: shippingForm.zip,
                }}
                customerEmail={customerEmail}
                customerName={customerName || undefined}
                returnUrl={returnUrl}
              />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-6">
                  Shopping Cart ({cartItems.length} items)
                </h2>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color}`}
                      className="flex flex-col sm:flex-row gap-4 p-4 bg-background rounded-lg border border-border"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-body font-semibold text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.category}
                              {item.size && ` | Size: ${item.size}`}
                              {item.color && ` | Color: ${item.color}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            {item.originalPrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                ${(item.originalPrice * item.quantity).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft">
                <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-6">
                  Shipping Address
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="mt-1"
                        value={shippingForm.firstName}
                        onChange={(e) => setShippingForm((p) => ({ ...p, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="mt-1"
                        value={shippingForm.lastName}
                        onChange={(e) => setShippingForm((p) => ({ ...p, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="mt-1"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      className="mt-1"
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm((p) => ({ ...p, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        className="mt-1"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm((p) => ({ ...p, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        className="mt-1"
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm((p) => ({ ...p, state: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        placeholder="10001"
                        className="mt-1"
                        value={shippingForm.zip}
                        onChange={(e) => setShippingForm((p) => ({ ...p, zip: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft sticky top-24">
                <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-6">Order Summary</h2>

                <div className="flex gap-2 mb-6">
                  <Input placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                  <Button variant="outline">Apply</Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? <span className="text-green-600">FREE</span> : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add ${(150 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Any applicable tax will be calculated at payment.
                  </p>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-semibold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="gold"
                  className="w-full mt-6 h-12 text-lg font-semibold"
                  onClick={startCheckout}
                  disabled={!canProceed}
                >
                  Proceed to Payment
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;
