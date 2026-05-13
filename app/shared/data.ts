export type ProductCategory = {
  slug: string;
  name: string;
  description: string;
  image?: string;
};

export type ProductGroup = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  tags: string[];
  specs: string[];
  applications: string[];
  packingOptions: string[];
  requestFields: string[];
  documents: string[];
  moq: string;
  leadTime: string;
  relatedSlugs: string[];
  image?: string;
};

export const productCategories: ProductCategory[] = [
  {
    slug: "bamboo-products",
    name: "Bamboo Products",
    description: "Bamboo sticks and fencing for garden, agriculture, retail, and project buyers.",
    image: "/images/bamboo_forest.png"
  },
  {
    slug: "packaging-materials",
    name: "Packaging Materials",
    description: "Stretch film and packaging tape for logistics, pallet wrapping, and carton sealing.",
    image: "/images/stretch_film.jpg"
  },
  {
    slug: "charcoal-biomass",
    name: "Charcoal & Biomass",
    description: "BBQ charcoal and biochar pages separated by buyer use case and document needs.",
    image: "/images/charcoal_biochar.png"
  },
  {
    slug: "natural-furniture",
    name: "Natural Furniture",
    description: "Rattan and bamboo furniture sourcing for hospitality, retail, and project orders.",
    image: "/images/rattan_furniture.jpg"
  }
];

export const productGroups: ProductGroup[] = [
  {
    slug: "bamboo-sticks",
    name: "Bamboo Sticks",
    category: "bamboo-products",
    summary: "Export-ready bamboo sticks for garden, agriculture, and retail packing.",
    description:
      "Natural bamboo sticks prepared for B2B export buyers who need clear size, packing, MOQ, and documentation discussion before quotation.",
    tags: ["Size", "Bundle packing", "Export marks"],
    specs: ["Length and diameter by request", "Natural or treated finish", "Straightness tolerance by agreement"],
    applications: ["Garden stakes", "Agriculture support", "Retail garden packs"],
    packingOptions: ["Bundle packing", "Carton packing", "Pallet packing with export marks"],
    requestFields: ["Length and diameter", "Target quantity", "Destination port", "Bundle or carton packing", "Timeline"],
    documents: ["Commercial invoice", "Packing list", "Certificate of Origin support if applicable"],
    moq: "Contact for details by size and packing.",
    leadTime: "Subject to confirmed size, quantity, season, and packing plan.",
    relatedSlugs: ["bamboo-fence", "rattan-furniture"],
    image: "/images/bamboo_poles.jpg"
  },
  {
    slug: "bamboo-fence",
    name: "Bamboo Fence",
    category: "bamboo-products",
    summary: "Rolled or panel bamboo fencing for garden, resort, landscaping, and DIY retail channels.",
    description:
      "Bamboo fence requests should clarify roll height, roll length, finish, label needs, destination port, and target quantity before quotation.",
    tags: ["Garden", "Retail label", "Pallet"],
    specs: ["Roll or panel format", "Natural or treated finish", "Retail label available by project"],
    applications: ["Garden retail", "Resort landscaping", "DIY outdoor privacy screens"],
    packingOptions: ["Bundle packing", "Carton packing", "Pallet packing with loading plan"],
    requestFields: ["Roll height", "Roll length", "Quantity", "Destination port", "Retail label or artwork"],
    documents: ["Commercial invoice", "Packing list", "Fumigation or phytosanitary support if applicable"],
    moq: "Contact for details. MOQ depends on roll size, finish, and packing.",
    leadTime: "Subject to order quantity and confirmed specification.",
    relatedSlugs: ["bamboo-sticks", "rattan-furniture"],
    image: "/images/bamboo_fences.jpg"
  },
  {
    slug: "packaging-tape",
    name: "Packaging Tape",
    category: "packaging-materials",
    summary: "Carton sealing tape for packing, warehouse, and logistics operations.",
    description:
      "Packaging tape requests should capture width, length, thickness, color, core size, monthly quantity, and carton packing needs.",
    tags: ["Width", "Length", "Monthly supply"],
    specs: ["Clear or tinted options", "Hand and machine use", "Carton sealing application"],
    applications: ["Carton sealing", "Warehouse packing", "Export logistics supply"],
    packingOptions: ["Shrink pack", "Carton packing", "Pallet packing"],
    requestFields: ["Width", "Length", "Thickness", "Color", "Monthly quantity"],
    documents: ["Commercial invoice", "Packing list", "Specification sheet if required"],
    moq: "Contact for details by tape size and order program.",
    leadTime: "Subject to size, color, adhesive requirement, and production plan.",
    relatedSlugs: ["stretch-film"],
    image: "/images/packaging_tape.png"
  },
  {
    slug: "stretch-film",
    name: "Stretch Film",
    category: "packaging-materials",
    summary: "Industrial stretch film for pallet wrapping and export logistics.",
    description:
      "Stretch film sourcing needs clear thickness, width, roll weight, hand or machine roll type, color, and delivery destination.",
    tags: ["Hand roll", "Machine roll", "Pallet"],
    specs: ["Hand roll or machine roll", "Clear or tinted film", "Thickness by request"],
    applications: ["Pallet wrapping", "Warehouse operations", "Export container loading"],
    packingOptions: ["Carton packing", "Pallet packing", "Private label by project"],
    requestFields: ["Thickness", "Width", "Roll weight or length", "Hand or machine roll", "Monthly quantity"],
    documents: ["Commercial invoice", "Packing list", "Specification sheet if required"],
    moq: "Contact for details by roll type and packing.",
    leadTime: "Subject to order quantity, film specification, and production plan.",
    relatedSlugs: ["packaging-tape"],
    image: "/images/stretch_film.jpg"
  },
  {
    slug: "bbq-charcoal",
    name: "BBQ Charcoal",
    category: "charcoal-biomass",
    summary: "BBQ charcoal sourcing for retail, food service, and private label programs.",
    description:
      "BBQ charcoal pages must avoid unsupported claims and should verify moisture, ash, bag packing, and lab data before publishing or quotation.",
    tags: ["Bag packing", "Private label", "QC"],
    specs: ["Lump or briquette discussion", "Moisture target by agreement", "Ash target by agreement"],
    applications: ["BBQ retail", "Food service", "Private label charcoal programs"],
    packingOptions: ["Retail bag", "Master carton", "Pallet packing"],
    requestFields: ["Charcoal type", "Bag weight", "Target quantity", "Destination port", "Lab report requirement"],
    documents: ["Commercial invoice", "Packing list", "Lab report only if verified"],
    moq: "Contact for details by charcoal type and packing.",
    leadTime: "Subject to packing, verified specification, and available production plan.",
    relatedSlugs: ["biochar"],
    image: "/images/charcoal_biochar.png"
  },
  {
    slug: "biochar",
    name: "Biochar",
    category: "charcoal-biomass",
    summary: "Biochar sourcing for agriculture and soil amendment buyers.",
    description:
      "Biochar requests should separate agricultural application needs from BBQ charcoal requirements and verify lab data before claims.",
    tags: ["Particle size", "Bulk bag", "Lab data"],
    specs: ["Particle size by request", "Bulk bag option", "Application-focused positioning"],
    applications: ["Soil amendment", "Agriculture projects", "Bulk material programs"],
    packingOptions: ["Bulk bag", "Small bag by project", "Pallet packing"],
    requestFields: ["Application", "Particle size", "Target quantity", "Packing", "Lab data requirement"],
    documents: ["Commercial invoice", "Packing list", "Lab report only if verified"],
    moq: "Contact for details by packing and application.",
    leadTime: "Subject to verified specification, quantity, and packing plan.",
    relatedSlugs: ["bbq-charcoal"],
    image: "/images/charcoal_biochar.png"
  },
  {
    slug: "rattan-furniture",
    name: "Rattan Furniture",
    category: "natural-furniture",
    summary: "Natural rattan and bamboo furniture for hospitality, retail, and project buyers.",
    description:
      "Furniture sourcing should collect design reference, material, finish, cushion needs, packing, and sample discussion before quotation.",
    tags: ["Design", "Sample", "Packing"],
    specs: ["Natural rattan and bamboo options", "Custom finish discussion", "Project or retail packing"],
    applications: ["Hospitality projects", "Retail furniture programs", "Interior and outdoor collections"],
    packingOptions: ["Carton packing", "Protective wrap", "Loading plan by item type"],
    requestFields: ["Reference design", "Material and finish", "Quantity", "Cushion needs", "Sample requirement"],
    documents: ["Commercial invoice", "Packing list", "Catalogue or spec sheet if available"],
    moq: "Contact for details by item type and project scope.",
    leadTime: "Subject to sample approval, material, quantity, and packing plan.",
    relatedSlugs: ["bamboo-fence", "bamboo-sticks"],
    image: "/images/rattan_furniture.jpg"
  }
];

export const workflowSteps = [
  {
    title: "Inquiry",
    description: "Buyer starts with a public RFQ or structured sourcing request."
  },
  {
    title: "Spec Review",
    description: "Admin checks missing fields, product details, packing, and destination."
  },
  {
    title: "Quotation",
    description: "Admin prepares an approved quotation after requirement review."
  },
  {
    title: "Production",
    description: "Production or sourcing starts only after commercial confirmation."
  },
  {
    title: "QC",
    description: "Quality, packing, and loading review are tracked before shipment."
  },
  {
    title: "Shipment",
    description: "Documents and shipment follow-up complete the export workflow."
  }
];

export function getCategoryName(slug: string) {
  return productCategories.find((category) => category.slug === slug)?.name ?? "Product";
}

export function getCategoryBySlug(slug: string) {
  return productCategories.find((category) => category.slug === slug);
}

export function getProductBySlug(slug: string) {
  return productGroups.find((product) => product.slug === slug);
}
