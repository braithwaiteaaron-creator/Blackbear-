"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingBag,
  Plus,
  Package,
  QrCode,
  Printer,
  AlertTriangle,
  ShoppingCart,
  Box,
  Shirt,
  Utensils,
  Zap,
} from "lucide-react"
import Image from "next/image"

interface MerchItem {
  id: number
  name: string
  category: "apparel" | "accessories" | "marketing" | "custom-orders"
  price: number
  cost: number
  stock: number
  minStock: number
  image: string
  realImage?: string
  hasQR: boolean
  customizable?: boolean
  description?: string
}

const mockMerch: MerchItem[] = [
  {
    id: 1,
    name: "Black Bear Paw Print Mug",
    category: "accessories",
    price: 22,
    cost: 8,
    stock: 48,
    minStock: 20,
    image: "mug",
    realImage: "/images/branded-mug.jpg",
    hasQR: false,
  },
  {
    id: 2,
    name: "Black Bear Hoodie",
    category: "apparel",
    price: 65,
    cost: 28,
    stock: 24,
    minStock: 10,
    image: "hoodie",
    hasQR: false,
  },
  {
    id: 3,
    name: "Black Bear Cap",
    category: "apparel",
    price: 32,
    cost: 12,
    stock: 35,
    minStock: 15,
    image: "cap",
    hasQR: false,
  },
  {
    id: 4,
    name: "Black Bear Tracksuit",
    category: "apparel",
    price: 110,
    cost: 45,
    stock: 12,
    minStock: 8,
    image: "tracksuit",
    hasQR: false,
  },
  {
    id: 5,
    name: "Business Cards (250) - QR Code",
    category: "marketing",
    price: 0,
    cost: 45,
    stock: 3,
    minStock: 5,
    image: "cards",
    hasQR: true,
  },
  {
    id: 6,
    name: "Lawn Signs (Pack of 10)",
    category: "marketing",
    price: 0,
    cost: 75,
    stock: 2,
    minStock: 5,
    image: "signs",
    hasQR: true,
  },
  {
    id: 7,
    name: "Logo Stickers (100) - QR Code",
    category: "marketing",
    price: 0,
    cost: 28,
    stock: 15,
    minStock: 5,
    image: "stickers",
    hasQR: true,
  },
  {
    id: 8,
    name: "Vehicle Magnets (Pair)",
    category: "marketing",
    price: 0,
    cost: 95,
    stock: 4,
    minStock: 2,
    image: "magnets",
    hasQR: true,
  },
  {
    id: 9,
    name: "Work Boots - Branded",
    category: "apparel",
    price: 185,
    cost: 95,
    stock: 6,
    minStock: 3,
    image: "boots",
    hasQR: false,
  },
  {
    id: 10,
    name: "Custom Logo Cutting Boards (Small)",
    category: "custom-orders",
    price: 32,
    cost: 14,
    stock: 18,
    minStock: 10,
    image: "cutting-board",
    hasQR: false,
    customizable: true,
    description: "7x10 inch custom cutting board - Black Bear logo on back",
  },
  {
    id: 11,
    name: "Custom Logo Cutting Boards (Large)",
    category: "custom-orders",
    price: 48,
    cost: 22,
    stock: 12,
    minStock: 8,
    image: "cutting-board",
    hasQR: false,
    customizable: true,
    description: "10x14 inch custom cutting board - Black Bear logo on back",
  },
  {
    id: 12,
    name: "Custom Orders - In Production",
    category: "custom-orders",
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    image: "custom",
    hasQR: false,
    customizable: true,
    description: "Customer custom orders awaiting production and logo customization",
  },
]

const inventoryStats = {
  totalItems: 149,
  lowStock: 2,
  merchSales: 1250,
  marketingCost: 420,
}

export function MerchPanel() {
  const [merch] = useState<MerchItem[]>(mockMerch)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMerch = merch.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockItems = merch.filter((item) => item.stock <= item.minStock)

  const getCategoryIcon = (category: MerchItem["category"]) => {
    switch (category) {
      case "apparel":
        return <Shirt className="h-5 w-5" />
      case "accessories":
        return <ShoppingBag className="h-5 w-5" />
      case "marketing":
        return <QrCode className="h-5 w-5" />
      case "custom-orders":
        return <Utensils className="h-5 w-5 text-accent" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Merchandise & Marketing</h1>
          <p className="text-muted-foreground">Manage inventory, apparel, and marketing materials</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print QR Codes
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-accent bg-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium">Low Stock Alert</p>
                <p className="text-sm text-muted-foreground">
                  {lowStockItems.length} items need reordering:{" "}
                  {lowStockItems.map((i) => i.name).join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Box className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inventory</p>
                <p className="text-xl font-bold">{inventoryStats.totalItems} items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <AlertTriangle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-xl font-bold">{inventoryStats.lowStock} items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                <ShoppingCart className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Merch Sales MTD</p>
                <p className="text-xl font-bold">${inventoryStats.merchSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-5/10">
                <QrCode className="h-5 w-5 text-chart-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marketing Cost MTD</p>
                <p className="text-xl font-bold">${inventoryStats.marketingCost}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Input
        placeholder="Search merchandise..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="apparel">Apparel</TabsTrigger>
          <TabsTrigger value="custom-orders" className="gap-2">
            <Utensils className="h-4 w-4" />
            Custom Cutting Boards
          </TabsTrigger>
          <TabsTrigger value="marketing">Marketing Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMerch.map((item) => (
              <Card key={item.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary overflow-hidden">
                      {item.realImage ? (
                        <Image
                          src={item.realImage}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getCategoryIcon(item.category)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {item.category}
                          </Badge>
                        </div>
                        {item.hasQR && (
                          <QrCode className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          {item.price > 0 ? (
                            <p className="text-lg font-bold text-accent">${item.price}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Internal use</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-medium ${
                              item.stock <= item.minStock
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.stock} in stock
                          </p>
                          {item.stock <= item.minStock && (
                            <Badge variant="destructive" className="mt-1 text-[10px]">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apparel" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMerch
              .filter((i) => i.category === "apparel" || i.category === "accessories")
              .map((item) => (
                <Card key={item.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Shirt className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-lg font-bold text-accent mt-2">${item.price}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Cost: ${item.cost}
                          </span>
                          <span className="text-sm font-medium text-primary">
                            Profit: ${item.price - item.cost}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.stock} in stock
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="mt-4">
          <Card className="bg-card border-border mb-4">
            <CardHeader>
              <CardTitle>Marketing Materials</CardTitle>
              <CardDescription>
                All marketing materials include QR codes linking to your website and contact info
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMerch
              .filter((i) => i.category === "marketing")
              .map((item) => (
                <Card
                  key={item.id}
                  className={`bg-card ${
                    item.stock <= item.minStock ? "border-destructive" : "border-border"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <QrCode className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <Badge variant="secondary">QR Enabled</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Cost per order: ${item.cost}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className={`font-medium ${
                              item.stock <= item.minStock
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.stock} remaining
                          </span>
                          <Button size="sm" variant={item.stock <= item.minStock ? "destructive" : "outline"}>
                            {item.stock <= item.minStock ? "Reorder Now" : "Order More"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="custom-orders" className="mt-4">
          <div className="grid gap-4 mb-6">
            <Card className="bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border-accent/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-accent" />
                  <div>
                    <CardTitle>Custom Cutting Boards</CardTitle>
                    <CardDescription className="mt-1">
                      Premium cutting boards with Black Bear logo on back. Perfect for gifting, reselling, or brand promotion. 
                      Plastic-free, eco-friendly production.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMerch
              .filter((i) => i.category === "custom-orders")
              .map((item) => (
                <Card key={item.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.customizable && (
                            <Badge variant="default" className="mt-2 gap-1 text-[10px]">
                              <Zap className="h-3 w-3" />
                              Customizable
                            </Badge>
                          )}
                        </div>
                        <Utensils className="h-5 w-5 text-accent" />
                      </div>

                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}

                      {item.price > 0 && (
                        <div>
                          <p className="text-2xl font-bold text-accent">${item.price}</p>
                          <p className="text-xs text-muted-foreground">Cost: ${item.cost} | Profit: ${item.price - item.cost}</p>
                        </div>
                      )}

                      {item.stock > 0 && (
                        <p className="text-sm font-medium">
                          {item.stock} {item.stock === 1 ? "unit" : "units"} in stock
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Plus className="h-3 w-3 mr-1" />
                          Order
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Customize
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
