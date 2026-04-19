"use client";

// TODO: design polish
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export interface ReportPreviewValues {
  description: string;
}

interface PreviewSubmitProps {
  form: UseFormReturn<ReportPreviewValues>;
  imageUrl: string;
  onSubmit: (values: ReportPreviewValues) => Promise<void>;
  onRetake: () => void;
  onChangeCategory: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  locationUnavailable: boolean;
}

export function PreviewSubmit({
  form,
  imageUrl,
  onSubmit,
  onRetake,
  onChangeCategory,
  isSubmitting,
  submitError,
  locationUnavailable,
}: PreviewSubmitProps) {
  const descriptionLength = form.watch("description")?.length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview & submit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <img src={imageUrl} alt="Report preview" className="h-52 w-full rounded-md object-cover" />

        {locationUnavailable ? <p className="text-sm text-muted-foreground">Location unavailable</p> : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Optional description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Add context (max 500 chars)"
                      maxLength={500}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{descriptionLength}/500</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onRetake} disabled={isSubmitting}>
            Retake
          </Button>
          <Button type="button" variant="ghost" onClick={onChangeCategory} disabled={isSubmitting}>
            Change category
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}