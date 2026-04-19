// TODO: design polish
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportCategory } from "@/types";

const categories: Array<{ value: ReportCategory; label: string }> = [
  { value: "trash", label: "Trash" },
  { value: "graffiti", label: "Graffiti" },
  { value: "pothole", label: "Pothole" },
  { value: "abandoned", label: "Abandoned" },
  { value: "hazard", label: "Hazard" },
  { value: "other", label: "Other" },
];

interface CategoryGridProps {
  onSelect: (category: ReportCategory) => void;
}

export function CategoryGrid({ onSelect }: CategoryGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a category</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {categories.map((category) => (
          <Button key={category.value} type="button" variant="outline" onClick={() => onSelect(category.value)}>
            {category.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}