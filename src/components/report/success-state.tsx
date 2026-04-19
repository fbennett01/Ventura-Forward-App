// TODO: design polish
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SuccessState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report submitted</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Thanks for helping keep Ventura clean. Redirecting...</p>
      </CardContent>
    </Card>
  );
}