
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  subItems?: NavItem[] | undefined;
  permission?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NavbarProps {
  onMenuClick: () => void;
}