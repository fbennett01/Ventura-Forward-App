import type { Meeting } from "@/types";

const daysFromNow = (days: number, hour: number, minute: number) => {
  const value = new Date();
  value.setDate(value.getDate() + days);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
};

export const mockMeetings: Meeting[] = [
  {
    id: "meeting-1",
    title: "Neighborhood Safety Roundtable",
    datetime: daysFromNow(3, 18, 30),
    location: "Ventura City Hall, Community Room A",
    pillar: "Safety",
    agendaHighlight: "Crosswalk upgrades around schools and e-bike enforcement zones.",
  },
  {
    id: "meeting-2",
    title: "Public Works Budget Workshop",
    datetime: daysFromNow(7, 17, 0),
    location: "Public Works Annex, Main Hall",
    pillar: "Public",
    agendaHighlight: "Storm drain maintenance priorities and sidewalk repair schedule.",
  },
  {
    id: "meeting-3",
    title: "Land Use and Housing Update",
    datetime: daysFromNow(11, 19, 0),
    location: "Downtown Library Meeting Center",
    pillar: "Land",
    agendaHighlight: "Review of mixed-use zoning proposals near transit corridors.",
  },
  {
    id: "meeting-4",
    title: "Beautify Ventura Volunteer Planning",
    datetime: daysFromNow(15, 18, 0),
    location: "Mission Park Pavilion",
    pillar: "Beautify",
    agendaHighlight: "Spring mural touch-ups and corridor litter pickup assignments.",
  },
  {
    id: "meeting-5",
    title: "Recreation Access Forum",
    datetime: daysFromNow(21, 17, 30),
    location: "Westpark Recreation Center",
    pillar: "Recreation",
    agendaHighlight: "Expanded youth sports scholarships and weekend facility hours.",
  },
  {
    id: "meeting-6",
    title: "Main Street Moves Follow-up Session",
    datetime: daysFromNow(27, 18, 30),
    location: "Main Street Promenade, Tent Stage",
    pillar: "Public",
    agendaHighlight: "Pilot metrics, vendor feedback, and traffic circulation changes.",
  },
];