export const agents = [
  { id: "tajamal-hussain", name: "Tajamal Hussain", role: "Chief Executive Officer", phone: "+92 323 84 88 195", whatsapp: "+92 323 84 88 195", email: "estatebrothers786@gmail.com" },
  { id: "abdul-rehman", name: "Abdul Rehman", role: "Branch Manager", phone: "+92 325 22 22 334", whatsapp: "+92 325 22 22 334", email: "estatebrothers786@gmail.com" },
  { id: "faizan-hamid", name: "Faizan Hamid", role: "Director Sales", phone: "+92 325 22 22 331", whatsapp: "+92 325 22 22 331", email: "estatebrothers786@gmail.com" },
  { id: "ahmad-raza", name: "Ahmad Raza", role: "Managing Director", phone: "+92 325 22 22 330", whatsapp: "+92 325 22 22 330", email: "estatebrothers786@gmail.com" },
];

export const plotListings = [
  { id: "plot-001", slug: "dha-phase-6-1-kanal-possession-plot", type: "plot", phase: "DHA Phase 6", project: "Main Boulevard", size: "1 Kanal", price: "PKR 5.85 Cr", status: "Possession", contactPersonId: "abdul-rehman", city: "Lahore", block: "C Block", notes: "Prime possession plot near main access with clear approach.", updatedAt: "2026-05-15" },
  { id: "plot-002", slug: "dha-phase-8-10-marla-commercial-file", type: "plot", phase: "DHA Phase 8", project: "Commercial Broadway", size: "10 Marla", price: "On Call", status: "File", contactPersonId: "faizan-hamid", city: "Lahore", block: "Broadway", notes: "Commercial opportunity suitable for investors comparing DHA Phase 8 options.", updatedAt: "2026-05-14" },
  { id: "plot-003", slug: "dha-phase-9-town-5-marla-residential-plot", type: "plot", phase: "DHA Phase 9 Town", project: "Residential Sector", size: "5 Marla", price: "PKR 1.45 Cr", status: "Available", contactPersonId: "ahmad-raza", city: "Lahore", block: "D Block", notes: "Compact residential plot for end-user construction or long-term holding.", updatedAt: "2026-05-13" },
  { id: "plot-004", slug: "dha-phase-7-2-kanal-corner-plot", type: "plot", phase: "DHA Phase 7", project: "Corner Residential", size: "2 Kanal", price: "PKR 11.25 Cr", status: "Available", contactPersonId: "tajamal-hussain", city: "Lahore", block: "Y Block", notes: "Large corner residential plot for premium construction planning.", updatedAt: "2026-05-12" },
];

export const houseListings = [
  {
    id: "house-64197", slug: "superb-5-marla-modern-house-dha-lahore", type: "house",
    title: "Superb 5 Marla Modern House in DHA Lahore", status: "For Sale", price: "On Call",
    phase: "DHA Phase 9 Town", city: "Lahore", size: "5 Marla", bedrooms: 3, bathrooms: 5,
    contactPersonId: "faizan-hamid",
    thumbnail: "/images/properties/khayaban-e-amir-bungalow.webp",
    gallery: ["/images/properties/khayaban-e-amir-bungalow.webp", "/images/properties/margalla-vista-residence.webp", "/images/properties/rawal-view-farmhouse.webp"],
    location: { address: "DHA Lahore Phase 9 Town", neighborhood: "Phase 9 Town", city: "Lahore", state: "Punjab", postalCode: "54000", country: "Pakistan" },
    specs: { garageCapacity: 1, garageSize: 1 },
    features: {
      interior: ["Drawing room", "Dining room", "Family lounge with skylight", "Ultra-modern kitchen", "Built-in appliances", "Jacuzzi", "Shower cabins", "Imported sanitary fittings"],
      exterior: ["Contemporary glass facade", "Car porch", "Lush green lawn", "Rooftop garden", "BBQ area", "Sitting area"],
      tags: ["Super Hot"],
    },
    media: { videoTour: "" }, updatedAt: "2026-05-15",
  },
  {
    id: "house-002", slug: "1-kanal-possession-ready-house-dha-phase-6-lahore", type: "house",
    title: "1 Kanal Possession Ready House in DHA Phase 6", status: "For Sale", price: "PKR 12.8 Cr",
    phase: "DHA Phase 6", city: "Lahore", size: "1 Kanal", bedrooms: 5, bathrooms: 6,
    contactPersonId: "abdul-rehman",
    thumbnail: "/images/properties/margalla-vista-residence.webp",
    gallery: ["/images/properties/margalla-vista-residence.webp", "/images/properties/khayaban-e-shaheen-penthouse.webp"],
    location: { address: "DHA Phase 6, Lahore", neighborhood: "Phase 6", city: "Lahore", state: "Punjab", postalCode: "54000", country: "Pakistan" },
    specs: { garageCapacity: 2, garageSize: 2 },
    features: {
      interior: ["Drawing room", "Dining room", "Double kitchen", "Basement", "Imported fittings"],
      exterior: ["Car porch", "Terrace", "Servant quarter", "Near main road"],
      tags: ["Possession Ready"],
    },
    media: { videoTour: "" }, updatedAt: "2026-05-13",
  },
  {
    id: "house-003", slug: "2-kanal-luxury-bungalow-dha-phase-7-lahore", type: "house",
    title: "2 Kanal Luxury Bungalow in DHA Phase 7", status: "For Sale", price: "PKR 24 Cr",
    phase: "DHA Phase 7", city: "Lahore", size: "2 Kanal", bedrooms: 6, bathrooms: 7,
    contactPersonId: "tajamal-hussain",
    thumbnail: "/images/properties/rawal-view-farmhouse.webp",
    gallery: ["/images/properties/rawal-view-farmhouse.webp", "/images/properties/khayaban-e-amir-bungalow.webp"],
    location: { address: "DHA Phase 7, Lahore", neighborhood: "Phase 7", city: "Lahore", state: "Punjab", postalCode: "54000", country: "Pakistan" },
    specs: { garageCapacity: 3, garageSize: 3 },
    features: {
      interior: ["Formal lounge", "Family lounge", "Designer kitchen", "Home office", "Basement"],
      exterior: ["Wide frontage", "Lawn", "Car porch", "Terrace", "Servant quarter"],
      tags: ["Premium"],
    },
    media: { videoTour: "" }, updatedAt: "2026-05-12",
  },
];

export const inventoryFilters = {
  phases: ["All", "DHA Phase 6", "DHA Phase 7", "DHA Phase 8", "DHA Phase 9 Town"],
  sizes: ["All", "5 Marla", "10 Marla", "1 Kanal", "2 Kanal"],
  statuses: ["All", "Available", "Possession", "File", "For Sale"],
};
