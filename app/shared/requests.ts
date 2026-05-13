export type BuyerRequest = {
  id: string;
  title: string;
  product: string;
  category: string;
  status: string;
  priority: string;
  quantity: string;
  destination: string;
  packing: string;
  timeline: string;
  nextAction: string;
  summary: string;
  messages: Array<{
    author: string;
    body: string;
    tone: "admin" | "buyer";
  }>;
  attachments: string[];
};

export const buyerRequests: BuyerRequest[] = [
  {
    id: "req-1024",
    title: "Bamboo fence retail",
    product: "Bamboo Fence",
    category: "Bamboo Products",
    status: "Need more info",
    priority: "High",
    quantity: "1 x 40HQ",
    destination: "Hamburg, Germany",
    packing: "Retail label + pallet",
    timeline: "Pending buyer confirmation",
    nextAction: "Confirm roll height and retail label artwork.",
    summary:
      "Buyer is preparing a retail garden distribution order and needs bamboo fence rolls with export packing.",
    messages: [
      {
        author: "Admin",
        body: "Please confirm roll height and retail label artwork before quotation.",
        tone: "admin"
      },
      {
        author: "Buyer",
        body: "Roll height is 1.8m. Artwork will be attached after internal approval.",
        tone: "buyer"
      }
    ],
    attachments: ["label-reference.pdf", "garden-display.jpg"]
  },
  {
    id: "req-1025",
    title: "BBQ charcoal private label",
    product: "BBQ Charcoal",
    category: "Charcoal & Biomass",
    status: "Quote preparing",
    priority: "Medium",
    quantity: "20 ft trial container",
    destination: "Jebel Ali, UAE",
    packing: "Private label retail bag",
    timeline: "Quotation needed this month",
    nextAction: "Admin preparing quotation draft.",
    summary:
      "Buyer asks for BBQ charcoal retail bag program. Lab data and private label packing must be verified.",
    messages: [
      {
        author: "Admin",
        body: "We are checking bag packing options and verified lab data before preparing the quote.",
        tone: "admin"
      }
    ],
    attachments: ["bag-layout-reference.png"]
  },
  {
    id: "req-1026",
    title: "Stretch film monthly supply",
    product: "Stretch Film",
    category: "Packaging Materials",
    status: "Admin review",
    priority: "Medium",
    quantity: "Monthly supply",
    destination: "Yokohama, Japan",
    packing: "Carton + pallet",
    timeline: "Recurring supply discussion",
    nextAction: "Admin reviewing thickness, roll size, and monthly quantity.",
    summary:
      "Buyer is exploring recurring stretch film supply for pallet wrapping and logistics operations.",
    messages: [],
    attachments: []
  }
];

export function getBuyerRequest(id: string) {
  return buyerRequests.find((request) => request.id === id);
}
