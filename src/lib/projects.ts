export interface Project {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tech: string;
  tags: string[];
  image: string;
  url: string | null;
}

export const PROJECTS: Project[] = [
  {
    id: "resume-forge",
    number: "01",
    title: "AI ResumeForge",
    subtitle: "AI-Powered Resume Builder",
    tech: "Next.js · React · Supabase · AI",
    tags: ["SaaS", "AI", "Web"],
    image: "/assests/Resume2.PNG",
    url: "https://ai-resume-forge.vercel.app/",
  },
  {
    id: "ecommerce",
    number: "02",
    title: "E-Commerce Platform",
    subtitle: "Full-Stack Shopping App",
    tech: "React · Firebase · Tailwind CSS",
    tags: ["Web", "E-Commerce"],
    image: "/assests/Ecommerce.PNG",
    url: "https://ecommerce-website-c403c.web.app/",
  },
  {
    id: "medical",
    number: "03",
    title: "Medical Platform",
    subtitle: "Healthcare Web System",
    tech: "React · Node.js · MongoDB",
    tags: ["Web", "Healthcare"],
    image: "/assests/Medical.PNG",
    url: null,
  },
  {
    id: "gotit",
    number: "04",
    title: "GotIt — Mobile App",
    subtitle: "Task Management App",
    tech: "React Native · Expo · Firebase",
    tags: ["Mobile", "App"],
    image: "/assests/mobileApp_preview.PNG",
    url: null,
  },
];
