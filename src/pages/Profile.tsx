import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Package, Heart, LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BookModal from "@/components/BookModal";
import ProductModal from "@/components/ProductModal";
import { BookProduct } from "@/data/books";

const Profile = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user, signOut } = useAuthContext();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    username: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ordersDisplayCount, setOrdersDisplayCount] = useState(10);
  const [wishlistDisplayCount, setWishlistDisplayCount] = useState(10);
  const [orders, setOrders] = useState<any[]>([]);

  // Modal state
  const [selectedBook, setSelectedBook] = useState<BookProduct | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Load profile from DB
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          firstName: (data as any).first_name || "",
          lastName: (data as any).last_name || "",
          email: user.email || "",
          phone: (data as any).phone || "",
          bio: (data as any).bio || "",
          address: (data as any).address || "",
          city: (data as any).city || "",
          country: (data as any).country || "",
          postalCode: (data as any).postal_code || "",
          username: data.username || "",
        });
      } else {
        setProfile(prev => ({ ...prev, email: user.email || "" }));
      }
      setLoading(false);
    };

    const loadOrders = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setOrders(data);
    };

    loadProfile();
    loadOrders();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
        bio: profile.bio,
        address: profile.address,
        city: profile.city,
        country: profile.country,
        postal_code: profile.postalCode,
        username: profile.username || profile.firstName,
      } as any)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    } else {
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch {
      toast({ title: "Error", description: "Failed to sign out", variant: "destructive" });
    }
  };

  const displayedOrders = orders.slice(0, ordersDisplayCount);
  const hasMoreOrders = ordersDisplayCount < orders.length;

  const displayedWishlist = wishlist.slice(0, wishlistDisplayCount);
  const hasMoreWishlist = wishlistDisplayCount < wishlist.length;

  const handleItemClick = (item: any) => {
    if (item.category === "books" || item.category === "school-supplies") {
      setSelectedBook(item as BookProduct);
      setIsBookModalOpen(true);
    } else {
      setSelectedProduct(item);
      setIsProductModalOpen(true);
    }
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      rating: item.rating || 5,
      reviewCount: item.reviewCount || 0,
      image: item.image,
      category: item.category || item.subcategory,
    });
    toast({ title: "Added to Cart", description: `${item.name} has been added to your cart.` });
  };

  const initials = (profile.firstName?.[0] || "") + (profile.lastName?.[0] || profile.username?.[0] || "U");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-body">Back to Shop</span>
            </Link>
            <div className="flex-1 flex justify-center">
              <span className="font-display text-xl font-semibold">
                My <span className="text-primary">Profile</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-soft text-center">
              <Avatar className="w-24 h-24 mx-auto border-4 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {initials.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-display text-xl font-semibold text-foreground mt-4">
                {profile.firstName || profile.username || "User"} {profile.lastName}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">{profile.email}</p>
              <Separator className="my-6" />
              <nav className="space-y-2">
                <Button variant={activeTab === "profile" ? "default" : "ghost"} className="w-full justify-start gap-3" onClick={() => setActiveTab("profile")}>
                  <User className="h-4 w-4" /> Account
                </Button>
                <Button variant={activeTab === "orders" ? "default" : "ghost"} className="w-full justify-start gap-3" onClick={() => setActiveTab("orders")}>
                  <Package className="h-4 w-4" /> Orders
                </Button>
                <Button variant={activeTab === "wishlist" ? "default" : "ghost"} className="w-full justify-start gap-3" onClick={() => setActiveTab("wishlist")}>
                  <Heart className="h-4 w-4" /> Wishlist
                </Button>
                <Separator className="my-4" />
                <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </nav>
            </div>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-card p-1">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold text-foreground">Personal Information</h2>
                    {!isEditing ? (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button variant="gold" onClick={handleSave} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} disabled={!isEditing} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} disabled={!isEditing} className="mt-1" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</Label>
                        <Input id="email" type="email" value={profile.email} disabled className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</Label>
                        <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditing} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} disabled={!isEditing} className="mt-1" rows={3} />
                    </div>
                    <Separator />
                    <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="h-5 w-5" /> Address
                    </h3>
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input id="address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} disabled={!isEditing} className="mt-1" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} disabled={!isEditing} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} disabled={!isEditing} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input id="postalCode" value={profile.postalCode} onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })} disabled={!isEditing} className="mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="font-body text-muted-foreground text-lg mb-2">No orders yet</p>
                      <p className="font-body text-muted-foreground text-sm mb-6">Start shopping to see your order history here</p>
                      <Button variant="gold" onClick={() => navigate("/")}>Browse the Store</Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {displayedOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                            <div>
                              <p className="font-semibold text-foreground">{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()} • {Array.isArray(order.items) ? order.items.length : 0} items
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">${Number(order.total).toFixed(2)}</p>
                              <span className={`text-sm px-2 py-1 rounded-full ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700'
                                  : order.status === 'cancelled' ? 'bg-destructive/10 text-destructive'
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {hasMoreOrders && (
                        <div className="mt-6 text-center">
                          <Button variant="outline" onClick={() => setOrdersDisplayCount(prev => prev + 10)}>Load More Orders</Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="wishlist">
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">My Wishlist</h2>
                  {wishlist.length === 0 ? (
                    <div className="text-center py-16">
                      <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="font-body text-muted-foreground text-lg mb-2">Your wishlist is empty</p>
                      <p className="font-body text-muted-foreground text-sm mb-6">Start adding items you love to your wishlist</p>
                      <Button variant="gold" onClick={() => navigate("/")}>Browse the Store</Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-3 gap-4">
                        {displayedWishlist.map((item) => (
                          <div key={item.id} className="bg-background rounded-lg border border-border p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleItemClick(item)}>
                            <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                            <h3 className="font-medium text-foreground">{item.name}</h3>
                            <p className="text-primary font-semibold">${item.price}</p>
                            <div className="flex gap-2 mt-3">
                              <Button variant="gold" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}>
                                Add to Cart
                              </Button>
                              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id); toast({ title: "Removed", description: "Item removed from wishlist" }); }}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {hasMoreWishlist && (
                        <div className="mt-6 text-center">
                          <Button variant="outline" onClick={() => setWishlistDisplayCount(prev => prev + 10)}>Load More</Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <BookModal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} book={selectedBook} />
      <ProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} product={selectedProduct} />
    </div>
  );
};

export default Profile;
