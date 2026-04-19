import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMeetings } from "@/data/mock-meetings";

export default function RadarPage() {
  return (
    <div className="space-y-4">
      {/* TODO: full design pass — user will rebuild */}
      <h1 className="text-2xl font-semibold">Civic Radar</h1>
      <ul className="space-y-3">
        {mockMeetings.map((meeting) => (
          <li key={meeting.id}>
            <Card>
              <CardHeader>
                <CardTitle>{meeting.title}</CardTitle>
                <CardDescription>
                  {new Date(meeting.datetime).toLocaleString()} • {meeting.pillar}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{meeting.location}</p>
                <p>{meeting.agendaHighlight}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}