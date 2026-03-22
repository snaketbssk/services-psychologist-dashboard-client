import { SOCIAL_URLS } from "@/lib/constants";
import { Facebook, Linkedin, Youtube } from "lucide-react";

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm4.406 14.457c-.194.546-1.138 1.044-1.566 1.108-.407.06-.921.085-1.486-.093-.342-.107-.781-.25-1.342-.488-2.353-1.015-3.888-3.374-4.007-3.53-.12-.157-.975-1.296-.975-2.473s.617-1.756.836-1.995c.22-.24.48-.3.639-.3l.46.009c.148.006.346-.056.542.414.2.48.679 1.657.738 1.778.06.12.1.261.02.42-.08.16-.12.26-.238.4-.12.14-.252.313-.36.42-.12.12-.244.25-.105.49.14.24.621 1.024 1.333 1.658.916.816 1.689 1.07 1.929 1.19.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.397.66 1.637.78.24.12.4.18.46.28.06.1.06.58-.134 1.124z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.04 9.613c-.15.674-.546.838-1.107.52l-3.067-2.26-1.48 1.424c-.163.163-.3.3-.616.3l.22-3.107 5.647-5.1c.246-.218-.053-.34-.38-.12L7.32 14.4l-2.99-.934c-.65-.204-.663-.65.135-.962l11.67-4.5c.54-.197 1.015.132.427.244z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return <Facebook width={15} height={15} />;
}

function LinkedinIcon() {
  return <Linkedin width={15} height={15} />;
}

function YoutubeIcon() {
  return <Youtube width={15} height={15} />;
}

export const SOCIAL_LINKS = [
  { icon: WhatsAppIcon, href: SOCIAL_URLS.whatsapp, label: "WhatsApp" },
  { icon: InstagramIcon, href: SOCIAL_URLS.instagram, label: "Instagram" },
  { icon: TelegramIcon, href: SOCIAL_URLS.telegram, label: "Telegram" },
  { icon: FacebookIcon, href: SOCIAL_URLS.facebook, label: "Facebook" },
  { icon: LinkedinIcon, href: SOCIAL_URLS.linkedin, label: "LinkedIn" },
  { icon: XIcon, href: SOCIAL_URLS.twitter, label: "X (Twitter)" },
  { icon: YoutubeIcon, href: SOCIAL_URLS.youtube, label: "YouTube" },
];
