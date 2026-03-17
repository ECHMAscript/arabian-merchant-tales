import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Plus, Minus, CreditCard, Wallet, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [placing, setPlacing] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    firstName: "", lastName: "", address: "", city: "", state: "", zip: "", email: "",
  });

  const subtotal = cartTotal;
  const shipping = subtotal > 150 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    setPlacing(true);
    try {
      const userId = user?.id;
      if (!userId) {
        toast({ title: "Error", description: "Please sign in to place an order", variant: "destructive" });
        setPlacing(false);
        return;
      }

      const orderItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category || '',
        size: item.size || null,
        color: item.color || null,
      }));

      const { error } = await supabase.from("orders").insert({
        user_id: userId,
        items: orderItems as any,
        total,
        status: "pending",
        order_type: "standard",
        customer_name: `${shippingForm.firstName} ${shippingForm.lastName}`.trim() || user?.email || 'Customer',
        customer_email: shippingForm.email || user?.email || null,
        is_guest: false,
        shipping_address: {
          address: shippingForm.address,
          city: shippingForm.city,
          state: shippingForm.state,
          zip: shippingForm.zip,
        } as any,
      });

      if (error) throw error;

      clearCart();
      toast({ title: "Order Placed!", description: "Your order has been submitted successfully." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to place order", variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Your cart is empty
            </h2>
            <p className="font-body text-muted-foreground mb-6">
              Add some items to your cart to proceed with checkout.
            </p>
            <Button asChild variant="gold">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Cart Items & Checkout Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-6">
                  Shopping Cart ({cartItems.length} items)
                </h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex flex-col sm:flex-row gap-4 p-4 bg-background rounded-lg border border-border">
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
                            <p className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
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

              {/* Payment Method */}
              <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft">
                <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-6">
                  Payment Method
                </h2>
                
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Credit / Debit Card</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, AMEX</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">PayPal</p>
                        <p className="text-sm text-muted-foreground">Pay with your PayPal account</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Bank Transfer</p>
                        <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'card' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input id="cardName" placeholder="John Doe" className="mt-1" />
                    </div>
                  </div>
                )}
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
                      <Input id="firstName" placeholder="John" className="mt-1" value={shippingForm.firstName} onChange={(e) => setShippingForm(p => ({...p, firstName: e.target.value}))} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" className="mt-1" value={shippingForm.lastName} onChange={(e) => setShippingForm(p => ({...p, lastName: e.target.value}))} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="mt-1" value={shippingForm.email} onChange={(e) => setShippingForm(p => ({...p, email: e.target.value}))} />
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="123 Main Street" className="mt-1" value={shippingForm.address} onChange={(e) => setShippingForm(p => ({...p, address: e.target.value}))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="New York" className="mt-1" value={shippingForm.city} onChange={(e) => setShippingForm(p => ({...p, city: e.target.value}))} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="NY" className="mt-1" value={shippingForm.state} onChange={(e) => setShippingForm(p => ({...p, state: e.target.value}))} />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" placeholder="10001" className="mt-1" value={shippingForm.zip} onChange={(e) => setShippingForm(p => ({...p, zip: e.target.value}))} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft sticky top-24">
                <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-6">
                  Order Summary
                </h2>

                {/* Promo Code */}
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button variant="outline">Apply</Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  {shipping > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add ${(150 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-semibold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  variant="gold" 
                  className="w-full mt-6 h-12 text-lg font-semibold"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure checkout powered by SSL</span>
                </div>

                {/* Order Items Preview */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-medium text-foreground mb-3">Items in Order</h3>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={`preview-${item.id}`} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 text-sm">
                          <p className="text-foreground truncate">{item.name}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
