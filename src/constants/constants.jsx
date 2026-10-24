import spinachoLogo from "../assets/images/spinacho.png";
import revoltronxLogo from "../assets/images/revoltronx.png";
import liberdatLogo from "../assets/images/liberdat.jpeg";

export const METADATA = {
  author: "Rohtash Poonia",
  title: "Rohtash Poonia | Full Stack Developer",
  description:
    "Full Stack Developer building responsive interfaces, backend services, REST APIs, and database-driven applications.",
  siteUrl: "https://portfolio-omega-seven-l7y6bvxpew.vercel.app/",
  twitterHandle: "",
  keywords: [
    "Rohtash Poonia",
    "Full Stack Developer",
    "React Developer",
    "Full Stack Developer",
    "Software Engineer",
    "Portfolio",
  ].join(", "),
  image: new URL("../assets/images/optimized/logo-160.webp", import.meta.url).href,
  language: "English",
  themeColor: "#000000",
};

export const MENULINKS = [
  {
    name: "Home",
    ref: "home",
  },
  {
    name: "About",
    ref: "about",
  },
  {
    name: "Skills",
    ref: "skills",
  },
  {
    name: "Projects",
    ref: "projects",
  },
  {
    name: "Work",
    ref: "work",
  },
  {
    name: "Contact",
    ref: "contact",
  },
];

// ... (TYPED_STRINGS, SOCIAL_LINKS, SKILLS, PROJECTS stay similar but references might need fixing)

export const WORK_CONTENTS = {
  SPINACHO: [
    {
      title: "Spinacho",
      description:
        "Frontend Developer · Internship · jun 2025 - aug 2025. Worked on building responsive web interfaces and integrating APIs.",
      content: (
        <div className="h-full w-full flex items-center justify-center text-white px-4">
          <img src={spinachoLogo} alt="Spinacho" className="w-28 h-28 object-contain rounded-xl drop-shadow-lg" />
        </div>
      ),
    },
    // ... update other spinacho entries
  ],
  REVOLTRONEX: [
    {
      title: "RevoltroneX",
      description:
        "React Developer Intern · Internship · Aug 2024 - Dec 2024. Developed interactive UI components and optimized web performance.",
      content: (
        <div className="h-full w-full flex items-center justify-center text-white px-4">
          <img src={revoltronxLogo} alt="RevoltroneX" className="w-28 h-28 object-contain rounded-xl drop-shadow-lg" />
        </div>
      ),
    },
  ],
  LIBERDAT: [
    {
      title: "Liberdat",
      description:
        "Frontend Developer · Internship · Dec 2024 - Jan 2025. Built real-time dashboards and data visualization tools.",
      content: (
        <div className="h-full w-full flex items-center justify-center text-white px-4">
          <img src={liberdatLogo} alt="Liberdat" className="w-28 h-28 object-contain rounded-xl drop-shadow-lg" />
        </div>
      ),
    },
  ],
};

export const GTAG = "";
