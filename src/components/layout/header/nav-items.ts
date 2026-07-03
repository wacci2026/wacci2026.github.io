export const navItems = [
  {
    type: 'link',
    href: '/',
    label: 'Home',
  },
  {
    type: 'link',
    label: 'About',
    href: '/about',
  },
  {
    type: 'link',
    label: 'Speakers',
    href: '/speakers',
  },
  {
    type: 'link',
    label: 'Program',
    href: '/program',
  },
  {
    type: 'link',
    label: 'Submission',
    href: '/submission',
  },
  {
    type: 'link',
    label: 'Registration',
    href: '/registration',
  },
] satisfies NavItem[];

type NavItem = Record<string, string | unknown> &
  (
    | {
        type: 'link';
        href: string;
      }
    | {
        type: 'dropdown';
      }
  );
