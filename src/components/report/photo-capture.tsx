import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PhotoCaptureProps {
  cameraError: string | null;
  onRetry: () => void;
  onFileSelected: (file: File) => void;
}

export function PhotoCapture({ cameraError, onRetry, onFileSelected }: PhotoCaptureProps) {
  const inputId = useId();

  return (
    <Card>
      <CardHeader>
        {/* TODO: design polish */}
        <CardTitle>Capture photo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cameraError ? (
          <div className="space-y-2">
            <p className="text-sm text-destructive">{cameraError}</p>
            <Button type="button" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : null}

        <label htmlFor={inputId} className="block text-sm text-muted-foreground">
          Use your camera to capture an issue photo.
        </label>
        <Input
          id={inputId}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onFileSelected(file);
              event.target.value = "";
            }
          }}
        />
      </CardContent>
    </Card>
  );
}