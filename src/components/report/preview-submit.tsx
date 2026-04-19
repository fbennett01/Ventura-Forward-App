'use client'
import type { UseFormReturn } from 'react-hook-form'
import { MapPin, MapPinOff, ArrowUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

export interface ReportPreviewValues {
  description: string
}

interface PreviewSubmitProps {
  form: UseFormReturn<ReportPreviewValues>
  imageUrl: string
  onSubmit: (values: ReportPreviewValues) => Promise<void>
  onRetake: () => void
  onChangeCategory: () => void
  isSubmitting: boolean
  submitError: string | null
  locationUnavailable: boolean
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
  const descriptionLength = form.watch('description')?.length ?? 0

  return (
    <div className="min-h-screen bg-vf-navy flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Photo */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden">
          <img
            src={imageUrl}
            alt="Report preview"
            className="w-full h-full object-cover"
            style={{ maxHeight: '42vh' }}
          />
        </div>

        {/* Location row */}
        <div className="mx-4 mt-3">
          {!locationUnavailable ? (
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-vf-sea" />
              <span className="text-xs text-vf-sea">Located</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MapPinOff className="size-4 text-vf-sand/30" />
              <span className="text-xs text-vf-sand/40">Location's off — you can still submit without it.</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mx-4 mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder="Add context (optional)"
                        maxLength={500}
                        className="bg-vf-navy-100 border-white/5 resize-none text-vf-sand placeholder:text-vf-sand/30 rounded-xl"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-right text-xs text-vf-sand/30 mt-1">{descriptionLength}/500</p>

              {submitError && (
                <div className="text-sm text-vf-orange">{submitError}</div>
              )}
            </form>
          </Form>
        </div>
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-vf-navy via-vf-navy to-transparent">
        <button
          onClick={() => form.handleSubmit(onSubmit)()}
          disabled={isSubmitting}
          className="w-full h-14 rounded-full bg-gradient-to-r from-vf-orange to-vf-orange/80 font-display font-bold text-white text-base flex items-center justify-center gap-2 hover:from-vf-orange/90 hover:to-vf-orange/70 disabled:opacity-50 transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <ArrowUp className="size-5" />
              Submit Report
            </>
          )}
        </button>

        <div className="flex gap-3 mt-2 justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRetake}
            disabled={isSubmitting}
            className="text-xs text-vf-sand/50 hover:text-vf-sand hover:bg-vf-navy-100"
          >
            Retake Photo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onChangeCategory}
            disabled={isSubmitting}
            className="text-xs text-vf-sand/50 hover:text-vf-sand hover:bg-vf-navy-100"
          >
            Change Category
          </Button>
        </div>
      </div>
    </div>
  )
}