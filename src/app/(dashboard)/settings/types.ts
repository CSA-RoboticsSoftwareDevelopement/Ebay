import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';


// ✅ Define a type for settings tabs
interface SettingsTab {
    id: string;
    label: string;
  }
  
  // ✅ Define the eBay profile type
  interface EbayProfile {
    username: string;
    email: string;
    isConnected: boolean;
    accessToken?: string; // Optional eBay auth token
  }
  
  // ✅ Define the props for the Settings Page
  interface SettingsPageProps {
    activeTab: string;
    ebayProfile: EbayProfile | null;
    isLoading: boolean;
    error: string | null;
    handleConnectEbay: () => void;
    handleDisconnectEbay: () => void;
    setActiveTab: (tab: string) => void;
  }
  
  // ✅ Correct JSX Module Declaration
  declare global {
    namespace JSX {
      interface IntrinsicElements {
        div: HTMLAttributes<HTMLDivElement>;
        button: ButtonHTMLAttributes<HTMLButtonElement>;
        nav: HTMLAttributes<HTMLElement>;
        h1: HTMLAttributes<HTMLHeadingElement>;
        h2: HTMLAttributes<HTMLHeadingElement>;
        p: HTMLAttributes<HTMLParagraphElement>;
        strong: HTMLAttributes<HTMLElement>;
      }
    }
  }
  