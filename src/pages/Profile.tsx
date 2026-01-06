import { useState } from "react";
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
import BookModal from "@/components/BookModal";
import ProductModal from "@/components/ProductModal";
import { BookProduct } from "@/data/books";

const Profile = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [profile, setProfile] = useState({
    firstName: "Ahmed",
    lastName: "Al-Rashid",
    email: "ahmed.rashid@email.com",
    phone: "+971 50 123 4567",
    bio: "Lover of traditional Arabian craftsmanship and modern luxury.",
    address: "123 Palm Jumeirah",
    city: "Dubai",
    country: "UAE",
    postalCode: "12345",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [ordersDisplayCount, setOrdersDisplayCount] = useState(10);
  const [wishlistDisplayCount, setWishlistDisplayCount] = useState(10);

  // Modal state
  const [selectedBook, setSelectedBook] = useState<BookProduct | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  // Extended mock order history (15 orders for pagination demo)
  const orderHistory = [
    { id: "ORD-001", date: "Dec 28, 2025", status: "Delivered", total: 289.00, items: 3 },
    { id: "ORD-002", date: "Dec 15, 2025", status: "Shipped", total: 156.00, items: 2 },
    { id: "ORD-003", date: "Nov 30, 2025", status: "Delivered", total: 432.00, items: 5 },
    { id: "ORD-004", date: "Nov 20, 2025", status: "Delivered", total: 89.00, items: 1 },
    { id: "ORD-005", date: "Nov 10, 2025", status: "Delivered", total: 245.00, items: 3 },
    { id: "ORD-006", date: "Oct 28, 2025", status: "Delivered", total: 178.00, items: 2 },
    { id: "ORD-007", date: "Oct 15, 2025", status: "Delivered", total: 520.00, items: 4 },
    { id: "ORD-008", date: "Oct 01, 2025", status: "Delivered", total: 67.00, items: 1 },
    { id: "ORD-009", date: "Sep 22, 2025", status: "Delivered", total: 340.00, items: 3 },
    { id: "ORD-010", date: "Sep 10, 2025", status: "Delivered", total: 199.00, items: 2 },
    { id: "ORD-011", date: "Aug 28, 2025", status: "Delivered", total: 455.00, items: 5 },
    { id: "ORD-012", date: "Aug 15, 2025", status: "Delivered", total: 123.00, items: 1 },
    { id: "ORD-013", date: "Aug 01, 2025", status: "Delivered", total: 278.00, items: 3 },
    { id: "ORD-014", date: "Jul 20, 2025", status: "Delivered", total: 89.00, items: 1 },
    { id: "ORD-015", date: "Jul 05, 2025", status: "Delivered", total: 512.00, items: 4 },
  ];

  const displayedOrders = orderHistory.slice(0, ordersDisplayCount);
  const hasMoreOrders = ordersDisplayCount < orderHistory.length;

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
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-soft text-center">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto border-4 border-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <h2 className="font-display text-xl font-semibold text-foreground mt-4">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">{profile.email}</p>
              
              <Separator className="my-6" />
              
              <nav className="space-y-2">
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"} 
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-4 w-4" />
                  Account
                </Button>
                <Button 
                  variant={activeTab === "orders" ? "default" : "ghost"} 
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab("orders")}
                >
                  <Package className="h-4 w-4" />
                  Orders
                </Button>
                <Button 
                  variant={activeTab === "wishlist" ? "default" : "ghost"} 
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab("wishlist")}
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Button>
                <Separator className="my-4" />
                <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </nav>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-card p-1">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Personal Information
                    </h2>
                    {!isEditing ? (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button variant="gold" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Address
                    </h3>

                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profile.city}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={profile.country}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={profile.postalCode}
                          onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                    Order History
                  </h2>
                  
                  {orderHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="font-body text-muted-foreground text-lg mb-2">
                        No orders yet
                      </p>
                      <p className="font-body text-muted-foreground text-sm mb-6">
                        Start shopping to see your order history here
                      </p>
                      <Button variant="gold" onClick={() => navigate("/")}>
                        Browse the Store
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {displayedOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                            <div>
                              <p className="font-semibold text-foreground">{order.id}</p>
                              <p className="text-sm text-muted-foreground">{order.date} • {order.items} items</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">${order.total.toFixed(2)}</p>
                              <span className={`text-sm px-2 py-1 rounded-full ${
                                order.status === 'Delivered' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {hasMoreOrders && (
                        <div className="mt-6 text-center">
                          <Button
                            variant="outline"
                            onClick={() => setOrdersDisplayCount((prev) => prev + 10)}
                          >
                            Load More Orders
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist">
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                    My Wishlist
                  </h2>
                  
                  {wishlist.length === 0 ? (
                    <div className="text-center py-16">
                      <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="font-body text-muted-foreground text-lg mb-2">
                        Your wishlist is empty
                      </p>
                      <p className="font-body text-muted-foreground text-sm mb-6">
                        Start adding items you love to your wishlist
                      </p>
                      <Button variant="gold" onClick={() => navigate("/")}>
                        Browse the Store
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-3 gap-4">
                        {displayedWishlist.map((item) => (
                          <div 
                            key={item.id} 
                            className="bg-background rounded-lg border border-border p-4 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleItemClick(item)}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                            <h3 className="font-medium text-foreground">{item.name}</h3>
                            <p className="text-primary font-semibold">${item.price}</p>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                variant="gold" 
                                size="sm" 
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(item);
                                }}
                              >
                                Add to Cart
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromWishlist(item.id);
                                  toast({
                                    title: "Removed",
                                    description: "Item removed from wishlist",
                                  });
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {hasMoreWishlist && (
                        <div className="mt-6 text-center">
                          <Button
                            variant="outline"
                            onClick={() => setWishlistDisplayCount((prev) => prev + 10)}
                          >
                            Load More
                          </Button>
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

      {/* Modals */}
      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        book={selectedBook}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default Profile;