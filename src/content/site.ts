// Facts that rarely change. Schedule, hotels, registry and FAQ are edited in /admin.

export const site = {
  couple: ["Jaden", "Wyat"] as const,
  // Local wedding day, Eastern time.
  date: "2027-05-22",
  dateLabel: "Saturday, May 22, 2027",
  ceremonyStart: "2027-05-22T16:30:00-04:00",
  receptionEnd: "2027-05-22T23:00:00-04:00",
  venue: {
    name: "Little Flower Barn",
    street: "565 N. Coldwater Road",
    city: "Lake Isabella, MI 48893",
    mapsQuery: "Little Flower Barn, 565 N. Coldwater Road, Lake Isabella, MI 48893",
    parking:
      "Free parking on site in the gravel lot past the barn, with overflow on the back field.",
  },
  dressCode: {
    name: "Garden formal",
    summary:
      "The ceremony is on the lawn and dinner is under the barn rafters. Think long dresses, suits or sport coats, and summery linen.",
    tips: [
      "Block heels or flats. Stilettos sink into grass.",
      "Earthy tones and florals are welcome. Please skip bright white.",
      "May evenings in Michigan cool off fast. Bring a layer.",
    ],
    colors: [
      { name: "Fern", hex: "#4D7A48" },
      { name: "Sage", hex: "#9DB38A" },
      { name: "Foxglove", hex: "#D9839B" },
      { name: "Buttercup", hex: "#E9C35A" },
      { name: "Moss", hex: "#1E3626" },
    ],
  },
  airports: [
    { code: "MBS", name: "MBS International", drive: "about 1 hr 5 min" },
    { code: "GRR", name: "Gerald R. Ford International", drive: "about 1 hr 45 min" },
    { code: "DTW", name: "Detroit Metro", drive: "about 2 hr 35 min" },
  ],
  driving:
    "Lake Isabella is rural and rideshares are scarce late at night. Plan your ride home before the party starts.",
} as const;

export const coupleNames = `${site.couple[0]} & ${site.couple[1]}`;

export function mapsUrl() {
  return `https://maps.google.com/?q=${encodeURIComponent(site.venue.mapsQuery)}`;
}

export function appleMapsUrl() {
  return `https://maps.apple.com/?q=${encodeURIComponent(site.venue.mapsQuery)}`;
}

// "Add to calendar" downloads an .ics file (see src/app/calendar.ics/route.ts).
export const calendarUrl = "/calendar.ics";
