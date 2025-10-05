import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ExternalLink, Tablet, BookOpen, Camera, ShoppingCart, Store, Globe, Monitor, ChevronDown } from 'lucide-react';

interface ResourceItem {
  name: string;
  description: string;
  category?: string;
  price?: string;
  platform?: string;
  paymentModel?: string;
}

interface ResourceStore {
  name: string;
  description: string;
  url?: string;
  icon: React.ReactNode;
}

export function ResourcesPage() {
  const [activeTab, setActiveTab] = useState('tablets');

  const tabs = [
    { id: 'tablets', label: 'Drawing Tablets', icon: <Tablet className="h-4 w-4" /> },
    { id: 'sketchbooks', label: 'Sketchbooks', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'cameras', label: 'Cameras', icon: <Camera className="h-4 w-4" /> },
    { id: 'software', label: 'Software', icon: <Monitor className="h-4 w-4" /> },
  ];

  const tablets: ResourceItem[] = [
    {
      name: 'Wacom Intuos',
      description: 'Entry-level drawing tablet perfect for beginners',
      category: 'Entry Level',
      price: '$60-80'
    },
    {
      name: 'Wacom Cintiq',
      description: 'Professional display tablet with direct drawing on screen',
      category: 'Professional',
      price: '$600-2000+'
    },
    {
      name: 'XP-Pen Deco Series',
      description: 'Affordable and reliable drawing tablets with great pressure sensitivity',
      category: 'Mid-Range',
      price: '$40-120'
    },
    {
      name: 'XP-Pen Artist Series',
      description: 'Display tablets offering screen drawing at competitive prices',
      category: 'Display Tablet',
      price: '$200-800'
    },
    {
      name: 'Huion H610 Pro',
      description: 'Budget-friendly tablet with large drawing area',
      category: 'Budget',
      price: '$60-90'
    },
    {
      name: 'Huion Kamvas',
      description: 'Pen display tablets with excellent color accuracy',
      category: 'Display Tablet',
      price: '$250-600'
    },
    {
      name: 'iPad Pro + Apple Pencil',
      description: 'Versatile tablet perfect for digital art and portability',
      category: 'Mobile',
      price: '$800-1200+'
    },
    {
      name: 'Microsoft Surface Pro',
      description: 'Full computer with drawing capabilities using Surface Pen',
      category: 'Mobile',
      price: '$600-1500+'
    }
  ];

  const tabletStores: ResourceStore[] = [
    {
      name: 'Amazon',
      description: 'Wide selection with customer reviews and fast shipping',
      icon: <ShoppingCart className="h-4 w-4" />
    },
    {
      name: 'XP-Pen Official Store',
      description: 'Direct from manufacturer with warranties and support',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Wacom Store',
      description: 'Official Wacom products with full warranty coverage',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Best Buy',
      description: 'Physical and online store with tech support options',
      icon: <Globe className="h-4 w-4" />
    },
    {
      name: 'B&H Photo',
      description: 'Professional equipment retailer with expert advice',
      icon: <Globe className="h-4 w-4" />
    },
    {
      name: 'Newegg',
      description: 'Tech-focused retailer with competitive pricing',
      icon: <Globe className="h-4 w-4" />
    }
  ];

  const sketchbooks: ResourceItem[] = [
    {
      name: 'Moleskine Art Collection',
      description: 'Premium hardcover sketchbooks with quality paper',
      category: 'Premium',
      price: '$15-25'
    },
    {
      name: 'Strathmore Drawing Paper',
      description: 'Professional-grade paper perfect for various mediums',
      category: 'Professional',
      price: '$8-20'
    },
    {
      name: 'Canson XL Series',
      description: 'Affordable sketchbooks with good paper quality',
      category: 'Budget Friendly',
      price: '$5-15'
    },
    {
      name: 'Rhodia Sketch Pads',
      description: 'French-made pads with smooth, high-quality paper',
      category: 'Premium',
      price: '$10-18'
    },
    {
      name: 'Arteza Sketch Books',
      description: 'Value packs with thick, bleed-resistant paper',
      category: 'Value Pack',
      price: '$12-25'
    },
    {
      name: 'Pentalic Nature Sketch',
      description: 'Spiral-bound books perfect for outdoor sketching',
      category: 'Outdoor',
      price: '$6-12'
    },
    {
      name: 'Stillman & Birn Alpha',
      description: 'Mixed media paper suitable for multiple techniques',
      category: 'Mixed Media',
      price: '$15-30'
    },
    {
      name: 'Pocket-sized Sketch Pads',
      description: 'Small format books for quick sketches on-the-go',
      category: 'Portable',
      price: '$3-8'
    }
  ];

  const sketchbookStores: ResourceStore[] = [
    {
      name: 'Amazon',
      description: 'Huge selection with customer reviews and bulk options',
      icon: <ShoppingCart className="h-4 w-4" />
    },
    {
      name: 'Michaels',
      description: 'Craft store with frequent sales and coupons',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Hobby Lobby',
      description: 'Art supplies store with weekly 40% off coupons',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Walmart',
      description: 'Basic art supplies at everyday low prices',
      icon: <Globe className="h-4 w-4" />
    },
    {
      name: 'Blick Art Materials',
      description: 'Professional art supply store with expert knowledge',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Jerry\'s Artarama',
      description: 'Discount art supplies with frequent sales',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Local Art Stores',
      description: 'Support local businesses and get personalized advice',
      icon: <Globe className="h-4 w-4" />
    }
  ];

  const cameras: ResourceItem[] = [
    {
      name: 'Canon EOS R5',
      description: 'High-resolution mirrorless camera for professional photography',
      category: 'Professional Mirrorless',
      price: '$3500-4000'
    },
    {
      name: 'Sony A7 IV',
      description: 'Versatile full-frame camera with excellent image quality',
      category: 'Professional Mirrorless',
      price: '$2500-3000'
    },
    {
      name: 'Nikon D850',
      description: 'High-resolution DSLR with exceptional detail capture',
      category: 'Professional DSLR',
      price: '$2500-3000'
    },
    {
      name: 'Canon EOS R10',
      description: 'Entry-level mirrorless with great features for beginners',
      category: 'Entry Mirrorless',
      price: '$700-900'
    },
    {
      name: 'Sony A6400',
      description: 'Compact APS-C camera with fast autofocus',
      category: 'Mid-Range Mirrorless',
      price: '$800-1000'
    },
    {
      name: 'Fujifilm X-T4',
      description: 'Retro-styled camera with excellent color science',
      category: 'Mid-Range Mirrorless',
      price: '$1400-1800'
    },
    {
      name: 'Canon EOS Rebel T7i',
      description: 'Beginner-friendly DSLR with guided modes',
      category: 'Entry DSLR',
      price: '$500-700'
    },
    {
      name: 'iPhone 15 Pro',
      description: 'Smartphone with professional-grade camera system',
      category: 'Mobile Photography',
      price: '$1000-1200'
    },
    {
      name: 'Google Pixel 8 Pro',
      description: 'Android phone with computational photography features',
      category: 'Mobile Photography',
      price: '$900-1000'
    }
  ];

  const cameraStores: ResourceStore[] = [
    {
      name: 'B&H Photo',
      description: 'Professional camera retailer with expert staff and reviews',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Amazon',
      description: 'Wide selection with competitive prices and fast shipping',
      icon: <ShoppingCart className="h-4 w-4" />
    },
    {
      name: 'Adorama',
      description: 'Photography specialist with educational resources',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Best Buy',
      description: 'Electronics retailer with hands-on testing opportunities',
      icon: <Globe className="h-4 w-4" />
    },
    {
      name: 'KEH Camera',
      description: 'Used camera specialist with quality guarantees',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Local Camera Shops',
      description: 'Professional advice and hands-on experience',
      icon: <Globe className="h-4 w-4" />
    },
    {
      name: 'Manufacturer Stores',
      description: 'Canon, Sony, Nikon official stores with warranties',
      icon: <Store className="h-4 w-4" />
    }
  ];

  const software: ResourceItem[] = [
    {
      name: 'Krita',
      description: 'Completely free and open-source painting program with professional features',
      category: 'Free',
      price: 'Free',
      platform: 'Windows, Mac, Linux',
      paymentModel: 'Free Forever'
    },
    {
      name: 'Clip Studio Paint',
      description: 'Industry-standard software for manga, comics, and illustration',
      category: 'Professional',
      price: '$50 (Pro) / $4.49/month',
      platform: 'Windows, Mac, iPad, iPhone, Android',
      paymentModel: 'One-time Purchase or Subscription'
    },
    {
      name: 'Adobe Photoshop',
      description: 'Industry-leading image editing and digital painting software',
      category: 'Professional',
      price: '$22.99/month',
      platform: 'Windows, Mac, iPad',
      paymentModel: 'Subscription Only'
    },
    {
      name: 'Procreate',
      description: 'Intuitive digital painting app designed specifically for iPad',
      category: 'Mobile',
      price: '$12.99',
      platform: 'iPad Only',
      paymentModel: 'One-time Purchase'
    },
    {
      name: 'Paint Tool SAI',
      description: 'Lightweight and user-friendly painting software popular among anime artists',
      category: 'Mid-Range',
      price: '$50',
      platform: 'Windows Only',
      paymentModel: 'One-time Purchase'
    },
    {
      name: 'Medibang Paint',
      description: 'Free drawing and painting software with cloud storage features',
      category: 'Free',
      price: 'Free',
      platform: 'Windows, Mac, iPad, iPhone, Android',
      paymentModel: 'Free with Optional Premium ($2.99/month)'
    },
    {
      name: 'Adobe Illustrator',
      description: 'Vector graphics software perfect for logos, illustrations, and graphic design',
      category: 'Professional',
      price: '$22.99/month',
      platform: 'Windows, Mac, iPad',
      paymentModel: 'Subscription Only'
    },
    {
      name: 'Affinity Designer',
      description: 'Professional vector design software with no subscription fees',
      category: 'Professional',
      price: '$69.99',
      platform: 'Windows, Mac, iPad',
      paymentModel: 'One-time Purchase'
    },
    {
      name: 'Corel Painter',
      description: 'Digital art software that mimics traditional painting techniques',
      category: 'Professional',
      price: '$429 / $199/year',
      platform: 'Windows, Mac',
      paymentModel: 'One-time Purchase or Subscription'
    },
    {
      name: 'GIMP',
      description: 'Free and open-source image editor with extensive customization options',
      category: 'Free',
      price: 'Free',
      platform: 'Windows, Mac, Linux',
      paymentModel: 'Free Forever'
    },
    {
      name: 'FireAlpaca',
      description: 'Simple and lightweight free painting software',
      category: 'Free',
      price: 'Free',
      platform: 'Windows, Mac',
      paymentModel: 'Free Forever'
    },
    {
      name: 'Autodesk Sketchbook',
      description: 'User-friendly sketching and drawing application',
      category: 'Free',
      price: 'Free',
      platform: 'Windows, Mac, iPad, iPhone, Android',
      paymentModel: 'Free Forever'
    }
  ];

  const softwareStores: ResourceStore[] = [
    {
      name: 'Official Websites',
      description: 'Download directly from software developers for best support',
      icon: <Globe className="h-4 w-4" />
    },
    {
      name: 'Steam',
      description: 'Gaming platform that also sells creative software',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'App Store (iOS)',
      description: 'Official Apple store for iPad and iPhone apps',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Google Play Store',
      description: 'Official Android app store for mobile drawing apps',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Adobe Creative Cloud',
      description: 'Adobe\'s subscription platform for their creative suite',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Microsoft Store',
      description: 'Windows app store with various creative applications',
      icon: <Store className="h-4 w-4" />
    },
    {
      name: 'Mac App Store',
      description: 'Official Apple store for macOS applications',
      icon: <Store className="h-4 w-4" />
    }
  ];

  const ResourceSection = ({
                             title,
                             description,
                             items,
                             stores,
                             icon
                           }: {
    title: string;
    description: string;
    items: ResourceItem[];
    stores: ResourceStore[];
    icon: React.ReactNode;
  }) => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Products */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Popular Options
            </h4>
            <div className="grid gap-3">
              {items.map((item, index) => (
                  <div key={index} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h5 className="font-medium">{item.name}</h5>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {item.platform && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Platform:</span> {item.platform}
                            </p>
                        )}
                        {item.paymentModel && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Payment:</span> {item.paymentModel}
                            </p>
                        )}
                      </div>
                      {item.price && (
                          <Badge variant="outline" className="text-xs">
                            {item.price}
                          </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {item.category && (
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                      )}
                    </div>
                  </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Stores */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Where to Buy
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {stores.map((store, index) => (
                  <div key={index} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {store.icon}
                      <h5 className="font-medium">{store.name}</h5>
                    </div>
                    <p className="text-sm text-muted-foreground">{store.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
  );

  return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-medium text-foreground flex items-center justify-center gap-2">
            <ExternalLink className="h-8 w-8 text-primary" />
            Art Resources
          </h1>
          <p className="text-muted-foreground">
            Essential tools and supplies for digital and traditional artists
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-4">
              {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  {tabs.find(tab => tab.id === activeTab)?.icon}
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {tabs.map((tab) => (
                    <DropdownMenuItem
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="gap-2"
                    >
                      {tab.icon}
                      {tab.label}
                    </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tab Content */}
          <TabsContent value="tablets" className="mt-6">
            <ResourceSection
                title="Drawing Tablets"
                description="Digital drawing tablets and pen displays for digital art creation"
                items={tablets}
                stores={tabletStores}
                icon={<Tablet className="h-5 w-5 text-primary" />}
            />
          </TabsContent>

          <TabsContent value="sketchbooks" className="mt-6">
            <ResourceSection
                title="Sketchbooks"
                description="Traditional sketchbooks and drawing pads for analog art"
                items={sketchbooks}
                stores={sketchbookStores}
                icon={<BookOpen className="h-5 w-5 text-primary" />}
            />
          </TabsContent>

          <TabsContent value="cameras" className="mt-6">
            <ResourceSection
                title="Cameras"
                description="Cameras for photography, reference shooting, and documentation"
                items={cameras}
                stores={cameraStores}
                icon={<Camera className="h-5 w-5 text-primary" />}
            />
          </TabsContent>

          <TabsContent value="software" className="mt-6">
            <ResourceSection
                title="Software"
                description="Digital art and design software for creating illustrations and graphics"
                items={software}
                stores={softwareStores}
                icon={<Monitor className="h-5 w-5 text-primary" />}
            />
          </TabsContent>
        </Tabs>

        {/* Additional Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Shopping Tips</CardTitle>
            <CardDescription>
              Make informed decisions when purchasing art supplies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Research First</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Read reviews from other artists</li>
                  <li>• Watch comparison videos on YouTube</li>
                  <li>• Check compatibility with your software</li>
                  <li>• Consider your skill level and needs</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Budget Wisely</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Start with free software like Krita or GIMP</li>
                  <li>• Look for student discounts on paid software</li>
                  <li>• Consider one-time purchases over subscriptions</li>
                  <li>• Try free trials before committing to paid software</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Support Options</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Check warranty coverage</li>
                  <li>• Verify customer support availability</li>
                  <li>• Look for local service centers</li>
                  <li>• Read return policies carefully</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}