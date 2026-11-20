import { publicAssets } from "./public-assets";

export const testimonials = [
  { id: "01", name: "Alison", role: "Business Consultant", image: publicAssets.alison,
    quote: "Big fan. I run my consultancy and Bonsai cuts down on my admin time and makes me look slick and professional. I've tried other competitive platforms - Bonsai is the best." },
  { id: "02", name: "Laura", role: "Coach at Ebb, Flow & Grow", image: publicAssets.laura,
    quote: "Bonsai is a great hub for my business. It’s super simple to use. I would really recommend it for anyone who is after an easy-to-use CRM system without the hassle of complicated setups." },
  { id: "03", name: "Alexandre", role: "Business Consultant", image: publicAssets.alexandre,
    quote: "Contracting, invoicing, and even banking are all things Bonsai fixes in a simple, beautiful way. They're constantly adding new features and their support is super helpful." },
];
export const financePanels = [
  { title: "Invoicing", text: "Customize and send great looking invoices in seconds. Get paid faster with simple payment options for your clients and automatic reminders.", path: "/invoicing", image: publicAssets.invoice },
  { title: "Banking", text: "Open your dedicated account and card for all business expenses. FDIC-insured up to $250,000.", path: "/banking", image: publicAssets.banking },
  { title: "Accounting", text: "Automatically track expenses and income. Estimate and set aside for taxes.", path: "/bookkeeping", image: publicAssets.accounting },
];
export const experiencePanels = [
  { title: "Client CRM", text: "Manage your client journey from just one place. From lead to payment.", image: publicAssets.client },
  { title: "Doc templates", text: "Send professional-looking proposals, contracts, forms and invoices in seconds.", image: publicAssets.documents },
  { title: "White labelled", text: "Stand out and impress with a fully custom and branded experience.", image: publicAssets.branding },
];
export const shortReviews = [
  { before: "", emphasis: "My best friend", after: " in scaling my business" },
  { before: "Like putting my ", emphasis: "finances on auto-pilot", after: "" },
  { before: "Bonsai does ", emphasis: "the hard work", after: "" },
  { before: "Everything is ", emphasis: "streamlined", after: "" },
  { before: "Huge ", emphasis: "timesaver", after: "" },
  { before: "It’s been ", emphasis: "the most stress-free year of my life!", after: "" },
  { before: "I feel ", emphasis: "more confident", after: "" },
  { before: "Backbone ", emphasis: "of my business", after: "" },
  { before: "", emphasis: "So simple", after: "" },
  { before: "", emphasis: "Clients love", after: " how easy my systems are" },
  { before: "A ", emphasis: "must-have!", after: "" },
  { before: "", emphasis: "I do less admin", after: " and do more of what I love" },
  { before: "", emphasis: "Worry-free", after: " contracts and invoices" },
  { before: "", emphasis: "It pays for itself", after: "" },
  { before: "Great ", emphasis: "customer service!", after: "" },
  { before: "A ", emphasis: "life-saver!", after: "" },
  { before: "", emphasis: "Clients take me more seriously", after: "" },
  { before: "", emphasis: "I upped my rates", after: " and won more clients" },
];
