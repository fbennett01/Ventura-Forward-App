'use client'
import Image from 'next/image'
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
  latitude: number | null
  longitude: number | null
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
    <div className="flex flex-col min-h-screen bg-vf-navy/70 backdrop-blur-md">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] border-b border-border/5 flex items-center justify-center px-5">
        <span className="font-poppins font-black text-sm tracking-widest text-white uppercase drop-shadow-sm">
          Review Report
        </span>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Photo */}
        <div className="mx-5 mt-5 rounded-3xl overflow-hidden shadow-vf-medium border border-white/5 relative h-[42vh] max-h-[42vh]">
          <Image
            src={imageUrl}
            alt="Report preview"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Location row */}
        <div className="mx-5 mt-4">
          {!locationUnavailable ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-vf-navy-100/50 border border-white/5 w-max">
              <MapPin className="size-4 text-vf-sea drop-shadow-sm" />
              <span className="text-xs font-semibold text-white tracking-wide">Location Added</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-vf-navy-100/30 border border-white/5 max-w-sm">
              <MapPinOff className="size-4 text-vf-sand/40" />
              <span className="text-[11px] font-medium text-vf-sand/60 leading-tight">Location unavailable — you can still submit.</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mx-5 mt-5">
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
                        className="bg-vf-navy-100/50 border-white/10 resize-none text-white placeholder:text-vf-sand/40 rounded-2xl p-4 focus-visible:ring-vf-accent/50 transition-all font-body shadow-inner"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-right text-[10px] font-semibold text-vf-sand/40 mt-1">{descriptionLength}/500</p>

              {submitError && (
                <div className="text-sm font-medium text-red-300 drop-shadow-sm bg-red-950/30 border border-red-500/20 px-4 py-3 rounded-xl">
                  {submitError}
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-vf-navy/95 via-vf-navy/80 to-transparent backdrop-blur-sm">
        <button
          onClick={() => form.handleSubmit(onSubmit)()}
          disabled={isSubmitting}
          className="btn-ripple relative overflow-hidden w-full h-14 rounded-full bg-gradient-to-r from-vf-accent to-blue-400 font-poppins font-bold text-vf-navy text-lg flex items-center justify-center gap-2 hover:from-blue-300 hover:to-blue-500 disabled:opacity-50 transition-all shadow-vf-medium hover:shadow-vf-premium"
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

        <div className="flex gap-4 mt-4 justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRetake}
            disabled={isSubmitting}
            className="text-xs font-semibold text-vf-sand/60 hover:text-white hover:bg-vf-navy-100/50 rounded-full px-4"
          >
            Retake Photo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onChangeCategory}
            disabled={isSubmitting}
            className="text-xs font-semibold text-vf-sand/60 hover:text-white hover:bg-vf-navy-100/50 rounded-full px-4"
          >
            Change Category
          </Button>
        </div>
      </div>
    </div>
  )
}