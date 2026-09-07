declare global {
  namespace PrismaJson {
    type StringList = string[];
    type CardList = { title: string; description: string }[];

    type IndustryStats = {
      value: string;
      suffix?: string;
      label: string;
    }[];

    type IndustryWhyChoose = {
      title: string;
      highlight: string;
      cards: { title: string; description: string }[];
    };

    type FooterLink = { label: string; href: string };

    type MegaMenuSubItem = { label: string; description: string; href: string };
    type MegaMenuCategory = {
      label: string;
      items: MegaMenuSubItem[];
      viewAllLabel?: string;
      viewAllHref?: string;
    };
    type CategorySwitcherMenu = {
      type: "category-switcher";
      categories: MegaMenuCategory[];
      cta: { text: string; href: string };
    };

    type FlatItem = { label: string; href: string };
    type FlatGroup = {
      heading: string;
      href?: string;
      description?: string;
      image?: string;
      items?: FlatItem[];
      itemColumns?: FlatItem[][];
    };
    type FlatColumn = { groups: FlatGroup[]; className?: string };
    type FlatMenu = {
      type: "flat";
      columns: FlatColumn[];
      image?: string;
      imageCaption?: string;
      cta?: { text: string; href: string };
      /* Admin-picked blog slug (Resource type "blogs"). Resolved into image/imageCaption/imageHref at read time. */
      featuredBlogSlug?: string;
      /* Resolved server-side from featuredBlogSlug — not admin-edited directly. */
      imageHref?: string;
    };

    type MegaMenuConfig = CategorySwitcherMenu | FlatMenu;

    type MegaMenuSource = {
      type: "industries" | "products";
      selectedIds: string[];
      cta?: { text: string; href: string };
      image?: string;
      imageCaption?: string;
    };

    type NavItem = {
      id: string;
      label: string;
      href: string;
      enabled: boolean;
      megaMenu?: MegaMenuConfig | null;
      megaMenuSource?: MegaMenuSource | null;
    };

    type FooterColumnSource = { type: "industries"; selectedIds: string[] };
    type FooterColumn = {
      id: string;
      heading: string;
      enabled: boolean;
      links: FooterLink[];
      source?: FooterColumnSource | null;
    };

    type GlobalConfigData = {
      logo: { src: string; alt: string; href: string };
      header: { nav: NavItem[]; cta: { label: string; href: string } };
      footer: {
        tagline: string;
        columns: FooterColumn[];
        social: { id: string; platform: string; href: string }[];
        legal: { copyright: string; links: FooterLink[] };
        contact: { email: string; phone: string; address: string };
      };
      /* Gate for /join/partner-sales-tools. Read server-side only. */
      partnerTools?: { password: string };
    };

    type AdminConfigData = {
      sidebarLogoLight: string;
      sidebarLogoDark: string;
    };

    type HomeSeoData = {
      title: string;
      description: string;
      og_image: { src: string; alt: string };
      canonical: string;
    };

    type SpecList = { key: string; value: string }[];
    type DownloadList = {
      title: string;
      description: string;
      url: string;
      tab?: string;
      showOnDownloadsPage?: boolean;
    }[];

    type JobPerks = { icon: string; label: string }[];

    type PartnerTool = { icon: string; title: string; description: string; link: string };
  }
}

export {};
