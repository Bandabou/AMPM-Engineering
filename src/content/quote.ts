// Client copy for the quote form: do not reword.
export const quote = {
  title: "Request a Quote",
  intro: "Tell us what you need, and our engineers will get back to you within one working day.",
  need: {
    heading: "What do you need?",
    placeholder: "Select an option",
    options: [
      "3D Printing",
      "Engineering & Design",
      "3D Scanning & Reverse Engineering",
      "Series Production",
      "Other / Not Sure",
    ],
  },
  files: {
    heading: "Upload your files",
    prompt: "Upload your 3D models, drawings, photos, or sketches.",
    formats: "Accepted formats: STEP, STP, STL, PDF, JPG, PNG (max. 50 MB per file).",
    extensions: ["step", "stp", "stl", "pdf", "jpg", "jpeg", "png"],
    maxBytes: 50 * 1024 * 1024,
    nda: "I need an NDA before sharing files.",
  },
  project: {
    heading: "Project details",
    materials: ["Not sure — advise me", "PAHT-CF", "TPU", "ASA Aero", "PLA / PETG", "Other"],
    detailsLabel: "Tell us about your project",
    detailsPlaceholder: "What do you need? Any specific requirements or deadlines?",
  },
  contact: { heading: "Contact details" },
  submit: "Request a Quote",
  notes: [
    "Our engineers will review your request and respond within one working day.",
    "Your information and files will remain confidential.",
  ],
};
