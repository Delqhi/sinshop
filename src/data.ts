/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'SIN Neon X ANC Headphones',
    description: 'Ultra-luxurious active noise cancelling wireless headphones. Handcrafted leather ear cushions, custom-tuned high-fidelity audio drivers, and up to 45 hours of immersive battery life. Ideal for travel, production, and focused work sessions.',
    price: 349.00,
    originalPrice: 399.00,
    rating: 4.8,
    ratingCount: 2,
    category: 'Tech & Gadgets',
    subcategory: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    imageGallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1572569432755-9ea24d26b52c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 12,
    isFeatured: true,
    colors: ['#000000', '#ffffff', '#e3a857'],
    sizes: ['S', 'M', 'L'],
    features: ['Active Noise Cancelling (ANC)', '45 hours battery life', 'Bluetooth 5.3', 'High-fidelity audio drivers'],
    specifications: {
      'Gewicht': '250g',
      'Material': 'Aluminium, Proteinleder',
      'Ladeanschluss': 'USB-C',
      'Ladezeit': '1.5 Stunden'
    },
    reviews: [
      {
        id: 'rev-1-1',
        userName: 'Maximilian K.',
        rating: 5,
        comment: 'Hervorragende Klangqualität und ein exzellentes, geräuschloses ANC! Der Tragekomfort ist erstklassig, auch nach Stunden keine Druckstellen. Die Verarbeitung ist extrem edel.',
        date: '20.05.2026',
        isRegistered: true
      },
      {
        id: 'rev-1-2',
        userName: 'Sophia L.',
        rating: 4,
        comment: 'Sehr schönes Design und facettenreicher Sound. Einziger kleiner Kritikpunkt ist das Gewicht bei schnellen sportlichen Bewegungen, aber für Arbeit und Büro absolut perfekt!',
        date: '14.04.2026',
        isRegistered: true
      }
    ]
  },
  {
    id: 'prod-2',
    title: 'Minimalist Mechanical Keyboard',
    description: 'A masterpiece of tactile responsiveness. Outfitted with premium hotswappable brown switches, dye-sublimated PBT keycaps with high-contrast glyphs, and a sandblasted CNC aluminium chassis. Connecting seamlessly via Bluetooth 5.1 or USB-C.',
    price: 189.00,
    rating: 5.0,
    ratingCount: 1,
    category: 'Tech & Gadgets',
    subcategory: 'Tastaturen',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    imageGallery: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 8,
    isFeatured: true,
    colors: ['#1e293b', '#f1f5f9', '#fca5a5'],
    features: ['Hotswappable MX Switches', 'PBT Keycaps', 'Bluetooth 5.1 & USB-C', 'RGB Backlighting'],
    specifications: {
      'Layout': '75% (84 Tasten)',
      'Material': 'CNC Aluminium',
      'Akku': '4000mAh',
      'Kompatibilität': 'Windows, Mac, Linux'
    },
    reviews: [
      {
        id: 'rev-2-1',
        userName: 'Lukas B.',
        rating: 5,
        comment: 'Ein haptischer Traum! Die braunen Switches klicken angenehm leise, geben aber fantastisches Feedback. Das schwere CNC-Alu Gehäuse steht bombenfest und rutscht keinen Millimeter.',
        date: '18.05.2026',
        isRegistered: true
      }
    ]
  },
  {
    id: 'prod-3',
    title: 'Slate Leather Carry-All',
    description: 'Meticulously crafted from full-grain vegetable-tanned Italian leather. Featuring dual-access brass zippers, a dedicated reinforced 16-inch laptop pocket, and an adjustable memory-foam-filled shoulder strap. Weatherproof and built to last a lifetime.',
    price: 260.00,
    originalPrice: 295.00,
    rating: 5.0,
    ratingCount: 1,
    category: 'Lifestyle & Accessories',
    subcategory: 'Taschen',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    imageGallery: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590845947698-8924d7409b56?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 5,
    isFeatured: true,
    colors: ['#2e2e2e', '#8b5a2b', '#1e3a8a'],
    sizes: ['13 Zoll', '16 Zoll'],
    features: ['Wetterfestes Echtleder', 'Verstärktes Laptop-Fach', 'Memory-Foam Schultergurt', 'Messing-Reißverschlüsse'],
    specifications: {
      'Material': 'Vollnarbiges Rindsleder',
      'Innenfutter': 'Mikrofaser',
      'Gewicht': '1.2kg',
      'Volumen': '18 Liter'
    },
    reviews: [
      {
        id: 'rev-3-1',
        userName: 'Elena M.',
        rating: 5,
        comment: 'Unglaublich hochwertiges Leder! Der Geruch ist herrlich holzig und die Festigkeit der Reißverschlüsse überragend. Das Fach für mein 16-Zoll MacBook ist ideal weich gepolstert.',
        date: '02.05.2026',
        isRegistered: true
      }
    ]
  },
  {
    id: 'prod-4',
    title: 'Chronos Hybrid Smartwatch',
    description: 'The elegant fusion of classic luxury horology and modern performance tracking. Pure sapphire glass face housing a discreet organic LED screen for real-time notifications, heart rate monitoring, and automatic activity sleep tracking.',
    price: 299.00,
    rating: 4.5,
    ratingCount: 2,
    category: 'Tech & Gadgets',
    subcategory: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    imageGallery: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 15,
    colors: ['#000000', '#d4af37', '#c0c0c0'],
    sizes: ['40mm', '44mm'],
    features: ['Saphirglas', 'OLED Display', 'Herzfrequenzmessung', 'Schlaftracking'],
    specifications: {
      'Wasserdicht': '5 ATM',
      'Akkulaufzeit': 'Bis zu 14 Tage',
      'Gehäuse': 'Edelstahl 316L',
      'Armband': 'Echtleder / Milanaise'
    },
    reviews: [
      {
        id: 'rev-4-1',
        userName: 'Dr. Frank S.',
        rating: 5,
        comment: 'Endlich eine Smartwatch, die wie eine echte Schweizer Uhr aussieht. Das Ziffernblatt ist elegant, das kleine OLED-Feld liest sich am Tag erstaunlich scharf ab.',
        date: '10.05.2026',
        isRegistered: true
      },
      {
        id: 'rev-4-2',
        userName: 'Daniela H.',
        rating: 4,
        comment: 'Schöne Kombination aus Analog-Optik und Fitness-Tracker. Die Akkulaufzeit hält wie versprochen gut 2 Wochen durch.',
        date: '27.04.2026',
        isRegistered: true
      }
    ]
  },
  {
    id: 'prod-5',
    title: 'Nordic Oak Bedside Lamp',
    description: 'An elegant sculptural lighting piece carved from sustainably harvested FSC certified white oak. Tap-sensitive warm glowing light with three step dimming levels and an integrated 15W Qi wireless fast charger built into the solid base.',
    price: 125.00,
    rating: 4.0,
    ratingCount: 1,
    category: 'Home & Living',
    subcategory: 'Beleuchtung',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    imageGallery: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 20,
    reviews: [
      {
        id: 'rev-5-1',
        userName: 'Sebastian W.',
        rating: 4,
        comment: 'Wunderschönes Eichenholz und das kabellose Laden funktioniert einwandfrei mit meinem iPhone. Das warmweiße Licht ist perfekt abgestimmt für das Schlafzimmer.',
        date: '01.05.2026',
        isRegistered: true
      }
    ]
  },
  {
    id: 'prod-6',
    title: 'Double-Walled Horizon Bottle',
    description: 'Stunning double-layered titanium water bottle engineered to keep hot beverages steaming or cold liquids chilled for 24+ hours. Absolutely leakproof ergonomic cap with a solid brushed metal finish and convenient lanyard interface.',
    price: 49.00,
    originalPrice: 59.00,
    rating: 5.0,
    ratingCount: 1,
    category: 'Lifestyle & Accessories',
    subcategory: 'Trinkflaschen',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    imageGallery: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544464147-3bd05b736b04?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596541571217-1f91754020c6?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 34,
    reviews: [
      {
        id: 'rev-6-1',
        userName: 'Klaus P.',
        rating: 5,
        comment: 'Extrem leichte Titanflasche, dicht und geschmacksneutral! Hat Tee stundenlang heiß gehalten auf meiner Wanderung im Schwarzwald.',
        date: '11.05.2026',
        isRegistered: true
      }
    ]
  },
  {
    id: 'prod-7',
    title: 'Aura Desktop Air Purifier',
    description: 'Compact yet powerful medical-grade HEPA H13 air purifier that filters 99.97% of ultra-fine particulates and pet dander. Features a near-silent night whisper mode, essential oil diffuser chamber, and ambient air quality feedback indicator ring.',
    price: 159.00,
    rating: 4.0,
    ratingCount: 1,
    category: 'Home & Living',
    subcategory: 'Raumklima',
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
    imageGallery: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584820927699-2917eab02e0b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 11,
    reviews: [
      {
        id: 'rev-7-1',
        userName: 'Anna-Maria G.',
        rating: 4,
        comment: 'Ideal für meinen Schreibtisch im Homeoffice. Der Luftzug ist spürbar frischer und der Flüster-Modus stört bei Zoom-Calls absolut gar nicht.',
        date: '05.05.2026',
        isRegistered: true
      }
    ]
  },
  {
    id: 'prod-8',
    title: 'Brushed Brass Desk Organizer',
    description: 'Elevate your workspace with this exquisite desktop organizer modular set. Heavy solid brushed brass slots for folders, mobile stands, and fine pens. Lined with black premium micro-suede linings to prevent scratching your devices.',
    price: 85.00,
    rating: 5.0,
    ratingCount: 1,
    category: 'Home & Living',
    subcategory: 'Schreibtisch-Zubehör',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    imageGallery: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 7,
    reviews: [
      {
        id: 'rev-8-1',
        userName: 'Oliver D.',
        rating: 5,
        comment: 'Sehr schwere, feine Qualität. Die Unterseite ist weich bezogen, so dass der edle Mahagoni-Schreibtisch geschützt wird. Bringt sofort Ordnung und Noblesse auf die Tischfläche.',
        date: '25.04.2026',
        isRegistered: true
      }
    ]
  }
];

export const CATEGORIES = [
  'All Products',
  'Tech & Gadgets',
  'Lifestyle & Accessories',
  'Home & Living'
];
