export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "The Wild Oasis",
  description: "Welcome to paradise. Escape to luxury in the heart of nature at The Wild Oasis.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Cabins",
      href: "/cabins",
    },
    {
      label: "Experiences",
      href: "/experiences",
    },
    {
      label: "Dining",
      href: "/dining",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],
  navMenuItems: [
    {
      label: "My Bookings",
      href: "/bookings",
    },
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Preferences",
      href: "/preferences",
    },
    {
      label: "Help & Support",
      href: "/help",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    reservations: "tel:+1-800-WILD-OASIS",
    email: "mailto:hello@thewildoasis.com",
    instagram: "https://instagram.com/#",
    facebook: "https://facebook.com/#",
  },
};
