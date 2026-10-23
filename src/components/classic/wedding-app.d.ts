// Types for the one-page home's props (the components are plain JSX).
import type { ComponentType } from "react";

export type HomeData = {
  couple: string[];
  dateText: { month: string; day: string; year: string };
  venueShort: string;
  dateLine: string;
  ceremonyStart: string;
  venue: { name: string; street: string; city: string; mapsQuery: string; mapsUrl: string; calendarUrl: string };
  schedule: { time: string; title: string }[];
  hotels: {
    name: string;
    url: string | null;
    address: string | null;
    distance: string | null;
    blockCode: string | null;
    bookBy: string | null;
  }[];
  airports: { code: string; name: string; drive: string }[];
  parking: string;
  driving: string;
  registry: { title: string; url: string; blurb: string | null }[];
  faqs: { question: string; answer: string }[];
  dressCode: { name: string; summary: string; tips: string[]; colors: { name: string; hex: string }[] };
  photos: { src: string; caption: string }[];
  deadlineLabel: string | null;
  dayOf: boolean;
};

declare const WeddingApp: ComponentType<{ data: HomeData }>;
export default WeddingApp;
