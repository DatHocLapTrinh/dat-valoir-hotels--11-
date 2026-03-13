
import { Slide } from './types';
import React from 'react'; // Needed if we were using JSX in constants, but we'll stick to strings/data

export const SLIDES: Slide[] = [
  // SLIDES 1-3: Link to ROOMS (Specific Location)
  {
    id: 1,
    name: "Dat Valoir Hanoi",
    location: "Hanoi Capital",
    description: "Located in the heart of the Old Quarter. A sanctuary of Indochine elegance where 5-star luxury meets the thousand-year-old soul of the capital. Experience our signature Suites overlooking the Opera House.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
    action: { view: 'ROOMS', payload: 'hanoi' }
  },
  {
    id: 2,
    name: "Ocean Villas Danang",
    location: "Da Nang Coast",
    description: "A private hideaway on My Khe Beach. Indulge in absolute silence with our oceanfront villas, featuring private infinity pools and the renowned 'Invisible Service' of Central Vietnam.",
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop",
    action: { view: 'ROOMS', payload: 'danang' }
  },
  {
    id: 3,
    name: "Saigon Sky Riverside",
    location: "Ho Chi Minh City",
    description: "Rising above the Saigon River, this is the new icon of District 1. Modern futurism blends with heritage art, offering the most exclusive Penthouse views in the city.",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2070&auto=format&fit=crop",
    action: { view: 'ROOMS', payload: 'hcmc' }
  },
  
  // SLIDES 4-6: Link to EXPERIENCES (Specific Experience)
  {
    id: 4,
    name: "Heritage Journey",
    location: "Hanoi - Experience",
    description: "Curated for the history connoisseur. A private historian tour of the Temple of Literature followed by a vintage Vespa street-food adventure and Royal Cuisine dining.",
    image: "https://images.unsplash.com/photo-1599831764654-e0c606cb7473?q=80&w=2070&auto=format&fit=crop",
    action: { view: 'EXPERIENCES', payload: 'hanoi' }
  },
  {
    id: 5,
    name: "Yacht & Ocean Escape",
    location: "Da Nang - Experience",
    description: "Set sail on Dat Valoir's private catamaran. Snorkel in Cham Islands coral reefs and enjoy a champagne sunset BBQ prepared by your personal chef on deck.",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=2074&auto=format&fit=crop",
    action: { view: 'EXPERIENCES', payload: 'danang' }
  },
  {
    id: 6,
    name: "Skyline Rooftop VIP",
    location: "HCMC - Experience",
    description: "The ultimate urban rush. Begin with a VIP helicopter tour over the river at dusk, concluding with a mixology masterclass at our exclusive 68th-floor Sky Bar.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2271&auto=format&fit=crop",
    action: { view: 'EXPERIENCES', payload: 'hcmc' }
  }
];

export const LOCATIONS = [
  { id: 'hanoi', label: 'Hanoi', tagline: 'The Capital Heritage' },
  { id: 'danang', label: 'Da Nang', tagline: 'Coastal Sanctuary' },
  { id: 'hcmc', label: 'Ho Chi Minh City', tagline: 'Urban Masterpiece' },
];

export const ROOMS_DATA: Record<string, any[]> = {
  hanoi: [
    {
      id: 'hn-1',
      name: "Classic Standard Room",
      location: "Hanoi",
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070&auto=format&fit=crop",
      gallery: [
         "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2074&auto=format&fit=crop"
      ],
      price: "$250",
      size: "40m²",
      view: "City View",
      desc: "A cozy and elegant space capturing the nostalgic soul of ancient Hanoi.",
      longDescription: "Designed for the modern traveler, the Classic Standard Room offers a sanctuary of peace in the heart of the Old Quarter. Dark mahogany woods contrast with cream linens, creating an atmosphere of masculine elegance and timeless comfort.",
      features: ["King Bed", "Rain Shower", "Espresso Machine", "Soundproof"],
      amenities: ["Dyson Hairdryer", "Pillow Menu", "Turndown Service", "Complimentary Minibar"]
    },
    {
      id: 'hn-2',
      name: "Indochine Deluxe Room",
      location: "Hanoi",
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070&auto=format&fit=crop",
      gallery: [
         "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2064&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop"
      ],
      price: "$450",
      size: "65m²",
      view: "Old Quarter Courtyard",
      desc: "A symphony of dark ironwood and eggshell lacquer with spacious living areas.",
      longDescription: "The Indochine Deluxe Room blurs the line between indoor luxury and outdoor beauty. Featuring an expanded seating area and a deep soaking tub, it is perfect for unwinding after a day of exploring the capital.",
      features: ["Deep Soaking Tub", "Lounge Area", "Bose Sound System", "VIP Lounge Access"],
      amenities: ["Private Balcony", "Yoga Kit", "High Tea Access", "Premium Toiletries"]
    },
    {
      id: 'hn-3',
      name: "L'Amour Presidential Suite",
      location: "Hanoi",
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop"
      ],
      price: "$1,200",
      size: "120m²",
      view: "Opera House View",
      desc: "The crown jewel of Dat Valoir Hanoi. Adorned with handcrafted velvet drapery and French colonial artifacts.",
      longDescription: "Step into a world where history whispers from the walls. The L'Amour Presidential Suite is not merely a room; it is a meticulously curated residence that pays homage to the Indochine era. Featuring a private wraparound terrace that offers an unobstructed view of the historic Opera House, this suite is designed for those who command the best.",
      features: ["Private Terrace", "Jacuzzi", "Personal Butler", "Steinway Piano"],
      amenities: ["24/7 Butler Service", "Private Chef on Request", "Hermès Toiletries", "Champagne Breakfast", "VIP Airport Transfer"]
    }
  ],
  danang: [
    {
      id: 'dn-1',
      name: "Ocean View Standard",
      location: "Da Nang",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
      gallery: [
         "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070&auto=format&fit=crop"
      ],
      price: "$300",
      size: "45m²",
      view: "Partial Ocean View",
      desc: "Immerse yourself in a tropical paradise with refreshing sea breezes.",
      longDescription: "A serene coastal retreat. The Ocean View Standard is grounded in nature, featuring a private balcony that lets in the fresh sea breeze. The highlight is the modern bathroom, featuring a rain shower and organic amenities.",
      features: ["Private Balcony", "Rain Shower", "Yoga Mat", "Organic Minibar"],
      amenities: ["Botanical Bath Kit", "Hammock", "Beach Towels", "Welcome Drink"]
    },
    {
      id: 'dn-2',
      name: "Tropical Deluxe Room",
      location: "Da Nang",
      image: "https://images.unsplash.com/photo-1571896349842-6e53ce41be03?q=80&w=2070&auto=format&fit=crop",
      gallery: [
         "https://images.unsplash.com/photo-1571896349842-6e53ce41be03?q=80&w=2070&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=2074&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop"
      ],
      price: "$600",
      size: "85m²",
      view: "Panoramic Bay View",
      desc: "Perched on the lush hills with breathtaking bird's-eye views of the East Sea.",
      longDescription: "For those who seek perspective. Perched high on the Son Tra Peninsula, the Tropical Deluxe Room offers a bird's eye view of the entire bay. Surrounded by protected jungle, it is a haven for nature lovers and those seeking absolute privacy. The design utilizes glass and stone to blend seamlessly into the mountain.",
      features: ["Wrap-around Balcony", "Meditation Corner", "Spa Inclusive", "Buggy Service"],
      amenities: ["Telescope", "Nature Walk Map", "Spa Treatments", "Infinity Tub"]
    },
    {
      id: 'dn-3',
      name: "Royal Oceanfront Suite",
      location: "Da Nang",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1974&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1540541338287-41700206dee6?q=80&w=2070&auto=format&fit=crop"
      ],
      price: "$1,500",
      size: "200m²",
      view: "Direct Ocean Access",
      desc: "Absolute privacy on the pristine sands of My Khe. Features a private infinity pool and chef's kitchen.",
      longDescription: "The epitome of coastal living. This expansive suite opens directly onto the white sands of My Khe Beach. Designed with an open-plan architecture, the ocean breeze flows freely through the living spaces. A private chef is on standby to prepare seafood BBQs by your personal infinity pool.",
      features: ["Private Infinity Pool", "2 Bedrooms", "Private Chef", "Beach Cabana"],
      amenities: ["Private Pool", "Direct Beach Access", "BBQ Facility", "Butler Pantry", "Floating Breakfast"]
    }
  ],
  hcmc: [
    {
      id: 'sg-1',
      name: "City View Standard",
      location: "HCMC",
      image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop",
      gallery: [
         "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1505691938895-1cd5874c1516?q=80&w=2070&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1534349762913-961f749a4dce?q=80&w=2070&auto=format&fit=crop"
      ],
      price: "$280",
      size: "42m²",
      view: "City Cathedral",
      desc: "A unique blend of industrial chic and luxury. High ceilings, exposed brick, and velvet furnishings.",
      longDescription: "A tribute to the youthful energy of Saigon. The City View Standard combines the raw texture of exposed brick and steel with the softness of velvet and silk. Double-height ceilings create a sense of boundless space, while the smart glass windows allow you to switch between city views and total privacy instantly.",
      features: ["Double Height Ceiling", "Smart Glass", "City Views", "Rain Shower"],
      amenities: ["Smart Home System", "Vinyl Player", "Espresso Bar", "City Guide"]
    },
    {
      id: 'sg-2',
      name: "Skyline Deluxe Room",
      location: "HCMC",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
      gallery: [
         "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
         "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop"
      ],
      price: "$550",
      size: "70m²",
      view: "Saigon River",
      desc: "A favorite of visiting dignitaries. Combines modern Italian design with Vietnamese art.",
      longDescription: "Where power meets style. The Skyline Deluxe Room is designed for business leaders and dignitaries. It features a secure meeting area, soundproof glass for privacy, and a refined Italian aesthetic. The view of the winding Saigon River provides a calming backdrop to important decisions.",
      features: ["Meeting Area", "Soundproof Glass", "Secure Access", "Art Collection"],
      amenities: ["Secure Line", "Private Office", "Executive Lounge", "Pressing Service"]
    },
    {
      id: 'sg-3',
      name: "The Valoir Penthouse Suite",
      location: "HCMC",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop"
      ],
      price: "$2,000",
      size: "250m²",
      view: "360° Skyline & River",
      desc: "The pinnacle of high-rise luxury on the 68th floor. Features a private cinema and grand piano.",
      longDescription: "Floating above the clouds, The Valoir Penthouse Suite is the ultimate expression of urban luxury. Occupying the entire 68th floor, it offers 360-degree views of the dynamic Saigon skyline. The interior is a gallery of contemporary art, featuring a Steinway grand piano, a private screening room, and a wine cellar stocked with rare vintages.",
      features: ["Private Cinema", "Grand Piano", "Wine Cellar", "Helipad Access"],
      amenities: ["Private Elevator", "Security Detail", "Sommelier Service", "In-suite Massage"]
    }
  ]
};

export const EXPERIENCES_DATA = [
  {
    id: 'hanoi',
    location: "Hanoi Capital",
    title: "Heritage & Culinary Journey",
    shortDesc: "A private historian tour of the Temple of Literature followed by a vintage Vespa street-food adventure.",
    longDesc: "Peel back the layers of Hanoi's thousand-year history. This immersive journey goes beyond the guidebooks, connecting you with the living soul of the capital. From the scholarly silence of the Temple of Literature to the chaotic symphony of street food alleys, and finally, the refined elegance of royal cuisine.",
    image: "https://images.unsplash.com/photo-1599831764654-e0c606cb7473?q=80&w=2070&auto=format&fit=crop",
    gallery: [
        "https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504457047772-27faf1c00561?q=80&w=2147&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop"
    ],
    tags: ["History", "Gastronomy", "Culture"],
    color: "from-red-900/80 to-black/80",
    price: "$150",
    details: {
        duration: "6 Hours",
        groupSize: "Private (Max 4)",
        startTime: "15:00 PM",
        inclusions: ["Private Historian Guide", "Vintage Vespa & Driver", "All Food & Drinks", "Royal Dinner Set Menu"]
    },
    itinerary: [
        { time: "15:00", activity: "Private Pick-up by Vintage Citroën", desc: "Your personal concierge awaits with a restored 1950s Citroën Traction Avant to whisk you away to the Temple of Literature." },
        { time: "15:30", activity: "Scholar's Talk at Temple of Literature", desc: "Avoid the crowds with VIP access. Sit down for tea with Dr. Nguyen, a renowned historian, to discuss Confucianism and Hanoian intellect." },
        { time: "17:00", activity: "The Vespa Adventure", desc: "Switch gears as we hop on vintage Vespas. We weave through the labyrinth of the Old Quarter, stopping at 3 hidden family-run eateries known only to locals." },
        { time: "19:30", activity: "Royal Hue Dining", desc: "The journey concludes at a restored French Villa. Enjoy a 'Royal Court' menu, recreating the dishes served to the Nguyen Dynasty Emperors." }
    ]
  },
  {
    id: 'danang',
    location: "Da Nang Coast",
    title: "Ocean & Yacht Escape",
    shortDesc: "Set sail on a private catamaran. Snorkel in coral reefs and enjoy a champagne sunset BBQ.",
    longDesc: "Escape the mainland and surrender to the rhythm of the ocean. This exclusive charter takes you to the pristine biosphere of the Cham Islands. Whether you seek the thrill of deep-sea fishing or the serenity of a sunset cocktail on the deck, the crew is dedicated to your absolute freedom.",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=2074&auto=format&fit=crop",
    gallery: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516815231560-8f41ec531527?q=80&w=2067&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop"
    ],
    tags: ["Nature", "Luxury", "Adventure"],
    color: "from-blue-900/80 to-black/80",
    price: "$450",
    details: {
        duration: "5 Hours",
        groupSize: "Private (Max 8)",
        startTime: "14:00 PM",
        inclusions: ["60ft Catamaran Charter", "Private Chef & Crew", "Snorkeling Gear", "Champagne & Seafood BBQ"]
    },
    itinerary: [
        { time: "14:00", activity: "Welcome Aboard", desc: "Board the 'Dat Valoir 1' from our private jetty. A welcome glass of Dom Pérignon sets the tone as we set sail towards the horizon." },
        { time: "15:00", activity: "Cham Islands Discovery", desc: "Drop anchor at a secluded cove in the Cham Islands Marine Park. Guided snorkeling tour to see the vibrant coral reefs." },
        { time: "17:00", activity: "Sunset on Deck", desc: "As the sun begins to dip, the music softens. The crew prepares fresh sashimi from the day's catch." },
        { time: "18:00", activity: "Ocean BBQ Dinner", desc: "Under the stars, enjoy a grilled seafood feast prepared by your private chef, right on the open deck." }
    ]
  },
  {
    id: 'hcmc',
    location: "Ho Chi Minh City",
    title: "Skyline Rooftop VIP",
    shortDesc: "VIP helicopter tour followed by a mixology masterclass at our exclusive 68th-floor Sky Bar.",
    longDesc: "See Saigon from a perspective reserved for the few. This high-octane experience captures the electric energy of Vietnam's economic powerhouse. From the roar of the helicopter blades to the clink of crystal glasses at the city's highest bar, this is urban luxury redefined.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2271&auto=format&fit=crop",
    gallery: [
        "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1570125909232-eb2be79a1c74?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"
    ],
    tags: ["Urban", "Nightlife", "Exclusive"],
    color: "from-purple-900/80 to-black/80",
    price: "$350",
    details: {
        duration: "4 Hours",
        groupSize: "Private (Max 2)",
        startTime: "17:30 PM",
        inclusions: ["Private Helicopter Tour", "Limousine Transfer", "Mixology Class", "Reserved VIP Table"]
    },
    itinerary: [
        { time: "17:30", activity: "Limousine Transfer", desc: "Pickup from the hotel lobby in a Mercedes-Maybach S650 to the private helipad." },
        { time: "18:00", activity: "Sunset Helicopter Tour", desc: "A 20-minute flight over the meandering Saigon River and the glittering skyscrapers of District 1 as the city lights up." },
        { time: "19:00", activity: "Arrival at Sky Bar 68", desc: "Land and be escorted via private elevator to the Penthouse Sky Bar. Your reserved table offers the best view in the house." },
        { time: "19:30", activity: "Mixology Masterclass", desc: "Our Head Mixologist guides you in crafting your own signature cocktail using rare Vietnamese herbs and premium spirits." }
    ]
  }
];
