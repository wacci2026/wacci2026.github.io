type NavSubItem = {
  label: string;
  href: string;
  icon?: unknown;
};

type NavItem =
  | {
      type: "link";
      label: string;
      href: string;
    }
  | {
      type: "dropdown";
      label: string;
      items: NavSubItem[];
    };

export const navItems: NavItem[] = [
  {
    type: "link",
    label: "Home",
    href: "/home",
  },
  {
    type: "link",
    label: "About",
    href: "/about",
  },
  {
    type: "link",
    label: "Program",
    href: "/program",
  },
  {
    type: "link",
    label: "Speakers",
    href: "/speakers",
  },
  {
    type: "link",
    label: "Venue",
    href: "/venue",
  },
  {
    type: "link",
    label: "Travel",
    href: "/travel",
  },
  {
    type: "link",
    label: "Abstract Submission",
    href: "/submission",
  },
  {
    type: "link",
    label: "Registration",
    href: "/registration",
  },
  {
    type: "link",
    label: "Contact",
    href: "/contact",
  },
];
