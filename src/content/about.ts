// From the client's About Us notes: add no facts they haven't confirmed.
export const about = {
  title: "About Us | AMPM Engineering",
  description:
    "AMPM is a small team of aeronautical engineers in Delft who believe the best manufacturing partner is one customers can speak with directly.",
  eyebrow: "3D printing in Delft",
  headlineLines: ["About Us"],
  statement: {
    lead: "We are a small team of aeronautical engineers who believe the best manufacturing partner is one you can ",
    highlight: "speak with directly",
    rest: ".",
  },
  photos: {
    team: {
      src: "/about/team.jpg",
      width: 876,
      height: 634,
      alt: "The three founders of AMPM Engineering standing together and smiling",
    },
    workshop: {
      src: "/about/workshop.jpg",
      width: 2560,
      height: 1920,
      alt: "The AMPM workshop, with rows of 3D printers on shelving beside a small desk and photo box",
    },
  },
  story: {
    eyebrow: "Our story",
    statement: {
      lead: "At AMPM Engineering, we bring together a precision-engineering practice and a dedicated 3D printing operation, focused on ",
      highlight: "engineering-grade additive manufacturing.",
    },
    body: "All three founders are aeronautical engineers who studied Management of Technology at TU Delft, combining technical engineering expertise with business and project management knowledge.",
  },
  team: {
    title: { lead: "Meet the ", highlight: "Team" },
    eyebrow: "Founders",
    intro: "Three aeronautical engineers who believe the best manufacturing partner is one you can speak with directly.",
    // PLACEHOLDER PORTRAITS: initials stand in until individual photos are supplied.
    members: [
      {
        name: "Joeri Verheul",
        initials: "JV",
        role: "COO / CFO",
        bio: "Aeronautical engineer responsible for operations, quality management, financial oversight, and project delivery.",
      },
      {
        name: "Prakasit Hankijjanurug",
        initials: "PH",
        role: "CTO",
        bio: "Aeronautical engineer leading technological development, manufacturing processes, materials research, and new production capabilities.",
      },
      {
        name: "Philippe Trimon",
        initials: "PT",
        role: "CCO",
        bio: "Aeronautical engineer responsible for client relationships, business development, and initiating engineering projects. Often the first point of contact for customers.",
      },
    ],
  },
};
