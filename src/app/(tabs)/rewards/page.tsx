// TODO: full design pass — user will rebuild
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPartners } from "@/data/mock-partners";

export default function RewardsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Rewards</h1>
      <ul className="space-y-3">
        {mockPartners.map((partner) => (
          <li key={partner.id}>
            <Card>
              <CardHeader>
                <CardTitle>{partner.name}</CardTitle>
                <CardDescription>
                  {partner.category} • {partner.pointsCost} points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{partner.address}</p>
                <p>{partner.perk}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}