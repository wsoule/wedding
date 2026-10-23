// Field definitions for the editable content lists in /admin/content.

export type ContentKind = "schedule" | "hotels" | "registry" | "faqs" | "story" | "party";

type Field = { name: string; label: string; required?: boolean; long?: boolean; type?: "url" | "text" | "photo" | "side" };

export const contentConfig: Record<ContentKind, { title: string; itemLabel: string; fields: Field[] }> = {
  schedule: {
    title: "Schedule",
    itemLabel: "event",
    fields: [
      { name: "time", label: "Time", required: true },
      { name: "title", label: "What", required: true },
      { name: "details", label: "Details", long: true },
    ],
  },
  hotels: {
    title: "Hotels",
    itemLabel: "hotel",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "url", label: "Booking link", type: "url" },
      { name: "address", label: "Address" },
      { name: "distance", label: "Distance (e.g. 20 min drive)" },
      { name: "blockCode", label: "Group code" },
      { name: "bookBy", label: "Book by (e.g. April 1)" },
      { name: "notes", label: "Notes", long: true },
    ],
  },
  registry: {
    title: "Registry",
    itemLabel: "registry link",
    fields: [
      { name: "title", label: "Name", required: true },
      { name: "url", label: "Link", required: true, type: "url" },
      { name: "blurb", label: "Short description" },
    ],
  },
  story: {
    title: "Our story",
    itemLabel: "moment",
    fields: [
      { name: "when", label: "When (e.g. Fall 2019)", required: true },
      { name: "title", label: "Title", required: true },
      { name: "body", label: "The story", long: true },
      { name: "photoId", label: "Photo", type: "photo" },
    ],
  },
  party: {
    title: "Wedding party",
    itemLabel: "person",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "role", label: "Role (e.g. Bridesmaid)", required: true },
      { name: "side", label: "Standing with", type: "side" },
      { name: "blurb", label: "How you know them", long: true },
      { name: "photoId", label: "Photo", type: "photo" },
    ],
  },
  faqs: {
    title: "FAQ",
    itemLabel: "question",
    fields: [
      { name: "question", label: "Question", required: true },
      { name: "answer", label: "Answer", required: true, long: true },
    ],
  },
};

export const contentKinds = Object.keys(contentConfig) as ContentKind[];
