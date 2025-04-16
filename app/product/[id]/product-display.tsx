import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Heart, Share2, Truck, RotateCcw, Shield } from "lucide-react";
import { useState } from "react";
import Ofert from "@/components/oferta/page";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  vendor?: string;
  productType?: string;
  status?: boolean;
  category?: string;
  tags?: string;
  sku?: string;
  barcode?: string;
  quantity?: number;
  trackInventory?: boolean;
  images: string[];
  sizes?: string[];
  sizeRange?: { min: number; max: number };
  colors?: string[];
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const getRandomRating = () => parseFloat((Math.random() * (5 - 3.8) + 3.8).toFixed(1));
const getRandomReviews = () => Math.floor(Math.random() * (107 - 23 + 1)) + 23;

export default function ProductDisplay({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSizeRange, setSelectedSizeRange] = useState<number | null>(null);

  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const rating = getRandomRating();
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
      sizeRange: selectedSizeRange,
    });
  };

  if (!product || !product.title || !product.images || product.price === undefined) {
    return <div>Loading...</div>; // or some fallback UI
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleSizeRangeChange = (sizeRange: number) => {
    setSelectedSizeRange(sizeRange);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-sm text-muted-foreground mb-6">
        <span className="hover:underline cursor-pointer">Home</span> /
        <span className="hover:underline cursor-pointer mx-2">{product.category || "Products"}</span> /
        <span className="font-medium text-foreground">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          {product.images?.length > 0 ? (
            <>
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-background">
                <Image
                  loader={customLoader}
                  src={product.images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-contain"
                  priority
                />
                {discountPercentage > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                    Save {discountPercentage}%
                  </Badge>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square overflow-hidden rounded-md border bg-background cursor-pointer ${
                        selectedImage === index ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        loader={customLoader}
                        src={image}
                        alt={`${product.title} - Image ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-background">
              <Image
                loader={customLoader}
                src="/placeholder.svg"
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <Ofert />
        </div>

        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            {product.vendor && (
              <div className="text-sm text-muted-foreground">
                <span className="hover:underline cursor-pointer">{product.vendor}</span>
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(fullStars)].map((_, index) => (
                  <svg key={index} className="w-4 h-4 fill-current text-yellow-500" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}

                {hasHalfStar && (
                  <svg className="w-4 h-4 fill-current text-yellow-500" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="half-star">
                        <stop offset="50%" stopColor="currentColor" />
                        <stop offset="50%" stopColor="gray" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#half-star)" d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                )}

                {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, index) => (
                  <svg key={`empty-${index}`} className="w-4 h-4 fill-current text-gray-300" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="hover:underline cursor-pointer">{getRandomReviews()} reviews</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <p className="text-2xl font-semibold text-primary">
                ${product.price ? product.price.toFixed(2) : 'N/A'}
              </p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="text-lg text-muted-foreground line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {product.status ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  In stock
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Out of stock
                </Badge>
              )}

              {product.quantity && product.quantity > 0 && (
                <span className="text-sm text-muted-foreground">{product.quantity} units available</span>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {product.sku && (
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">SKU:</span>
                <span>{product.sku}</span>
              </div>
            )}

            <div className="space-y-4 mt-6">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={decreaseQuantity}>
                  <Minus className="h-3 w-3" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={increaseQuantity}>
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>

              {product.sizes && product.sizes.length > 0 && product.category !== 'zapatos' && (
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-base">
                    Size
                  </Label>
                  <RadioGroup onValueChange={handleSizeChange} value={selectedSize || ''} className="flex flex-wrap items-center gap-2">
                    {product.sizes.map((size) => (
                      <Label
                        key={size}
                        htmlFor={`size-${size}`}
                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-muted"
                      >
                        <RadioGroupItem value={size} id={`size-${size}`} />
                        {size}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {product.sizeRange && product.category !== 'Moda' && (() => {
                const { min, max } = product.sizeRange;
                return (
                  <div className="space-y-2">
                    <Label htmlFor="sizeRange" className="text-base">Size Range</Label>
                    <RadioGroup
                      value={selectedSizeRange?.toString() || ''}
                      onValueChange={(value) => handleSizeRangeChange(Number(value))}
                      className="flex flex-wrap items-center gap-2"
                    >
                      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((size) => (
                        <Label
                          key={size}
                          htmlFor={`size-range-${size}`}
                          className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-muted"
                        >
                          <RadioGroupItem value={size.toString()} id={`size-range-${size}`} />
                          {size}
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                );
              })()}

              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-base">
                    Color
                  </Label>
                  <RadioGroup value={selectedColor || ''} onValueChange={handleColorChange} className="flex flex-wrap items-center gap-2">
                    {product.colors.map((color) => (
                      <Label
                        key={color}
                        htmlFor={`color-${color}`}
                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-muted"
                      >
                        <RadioGroupItem value={color} id={`color-${color}`} />
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                          {color}
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button size="lg" className="w-full" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="secondary" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>Free shipping over $50</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <span>30-day returns</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>2-year warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <span className="hover:underline cursor-pointer">Share</span>
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="pt-4">
              <p>{product.description}</p>
            </TabsContent>

            <TabsContent value="details" className="pt-4">
              <ul className="space-y-2">
                <li className="flex justify-between py-1 border-b">
                  <span className="font-medium">Product ID</span>
                  <span>{product.id}</span>
                </li>
                <li className="flex justify-between py-1 border-b">
                  <span className="font-medium">Category</span>
                  <span>{product.category || "N/A"}</span>
                </li>
                <li className="flex justify-between py-1 border-b">
                  <span className="font-medium">Vendor</span>
                  <span>{product.vendor || "N/A"}</span>
                </li>
                <li className="flex justify-between py-1 border-b">
                  <span className="font-medium">Type</span>
                  <span>{product.productType || "N/A"}</span>
                </li>
                <li className="flex justify-between py-1 border-b">
                  <span className="font-medium">SKU</span>
                  <span>{product.sku || "N/A"}</span>
                </li>
                <li className="flex justify-between py-1 border-b">
                  <span className="font-medium">Barcode</span>
                  <span>{product.barcode || "N/A"}</span>
                </li>
                {product.tags && typeof product.tags === 'string' && (
                  <li className="flex justify-between py-1 border-b">
                    <span className="font-medium">Tags</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {product.tags.split(",").map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
            </TabsContent>

            <TabsContent value="shipping" className="pt-4">
              <div className="space-y-4">
                <p>Free shipping on orders over $50. Standard delivery 3-5 business days.</p>
                <p>Express delivery available at checkout.</p>
                <p>International shipping available to select countries.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
