export const navItems = [
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
] satisfies NavItem[];

type NavItem = Record<string, string | unknown> &
  (
    | {
        type: "link";
        href: string;
      }
    | {
        type: "dropdown";
      }
  );
