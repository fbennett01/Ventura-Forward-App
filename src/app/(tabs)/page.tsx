// TODO: full design pass — user will rebuild
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockFeed } from "@/data/mock-feed";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Ventura Forward</h1>
      <ul className="space-y-3">
        {mockFeed.map((item) => (
          <li key={item.id}>
            <Card>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>
                  {new Date(item.date).toLocaleDateString()} • {item.type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{item.excerpt}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}