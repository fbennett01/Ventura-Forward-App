"use client";

import { useCallback, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { CategoryGrid } from "@/components/report/category-grid";
import { PhotoCapture } from "@/components/report/photo-capture";
import { PreviewSubmit, type ReportPreviewValues } from "@/components/report/preview-submit";
import { SuccessState } from "@/components/report/success-state";
import { getDeviceId } from "@/lib/device-id";
import { getBrowserClient } from "@/lib/supabase/client";
import type { ReportCategory } from "@/types";

const previewSchema = z.object({
  description: z.string().max(500, "Description must be 500 characters or less."),
});

type ReportStep = "category" | "capture" | "preview" | "success";

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState<ReportStep>("category");
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraCheckNonce, setCameraCheckNonce] = useState(0);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationUnavailable, setLocationUnavailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ReportPreviewValues>({
    resolver: zodResolver(previewSchema),
    defaultValues: {
      description: "",
    },
  });

  const clearPreviewState = useCallback(() => {
    setPhotoFile(null);
    setLatitude(null);
    setLongitude(null);
    setLocationUnavailable(false);
    setSubmitError(null);
    form.reset({ description: "" });
    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });
  }, [form]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (step !== "capture") {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      return;
    }

    let stream: MediaStream | null = null;

    const checkCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        setCameraError(null);
      } catch {
        setCameraError("Camera's blocked. Check your browser settings.");
      } finally {
        stream?.getTracks().forEach((track) => track.stop());
      }
    };

    void checkCameraPermission();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraCheckNonce, step]);

  useEffect(() => {
    if (step !== "preview") {
      return;
    }

    if (!navigator.geolocation) {
      setLocationUnavailable(true);
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) {
          return;
        }

        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationUnavailable(false);
      },
      () => {
        if (cancelled) {
          return;
        }

        setLatitude(null);
        setLongitude(null);
        setLocationUnavailable(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, [step]);

  useEffect(() => {
    if (step !== "success") {
      return;
    }

    const timer = setTimeout(() => {
      router.push("/");
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [router, step]);

  const handleCategorySelect = (category: ReportCategory) => {
    clearPreviewState();
    setCameraError(null);
    setSelectedCategory(category);
    setStep("capture");
  };

  const handlePhotoSelected = async (file: File) => {
    setSubmitError(null);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        initialQuality: 0.85,
        useWebWorker: true,
        fileType: "image/jpeg",
      });

      const url = URL.createObjectURL(compressed);
      setPhotoFile(compressed);
      setPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        return url;
      });
      setStep("preview");
    } catch {
      setSubmitError("Unable to process this image. Please retake the photo.");
    }
  };

  const uploadPhotoWithRetry = async (file: File, objectPath: string) => {
    const supabase = getBrowserClient();
    let attempts = 0;
    let lastError: string | null = null;

    while (attempts < 2) {
      const { error } = await supabase.storage.from("report-photos").upload(objectPath, file, {
        contentType: "image/jpeg",
        upsert: false,
      });

      if (!error) {
        return;
      }

      lastError = error.message;
      attempts += 1;
    }

    throw new Error(lastError ?? "Couldn't upload the photo. Want to try again?");
  };

  const handleSubmit = async ({ description }: ReportPreviewValues) => {
    if (!selectedCategory || !photoFile) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const objectPath = `reports/${uuidv4()}-${Date.now()}.jpg`;
      await uploadPhotoWithRetry(photoFile, objectPath);

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory,
          description: description.trim() ? description.trim() : null,
          photo_path: objectPath,
          latitude,
          longitude,
          reporter_device_id: getDeviceId(),
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to submit report");
      }

      setStep("success");
      clearPreviewState();
      setSelectedCategory(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    clearPreviewState();
    setStep("capture");
  };

  const handleChangeCategory = () => {
    clearPreviewState();
    setCameraError(null);
    setSelectedCategory(null);
    setStep("category");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Report It</h1>

      {step === "category" ? <CategoryGrid onSelect={handleCategorySelect} /> : null}

      {step === "capture" && selectedCategory ? (
        <PhotoCapture
          cameraError={cameraError}
          onRetry={() => {
            setCameraError(null);
            setCameraCheckNonce((current) => current + 1);
          }}
          onFileSelected={(file) => {
            void handlePhotoSelected(file);
          }}
        />
      ) : null}

      {step === "preview" && previewUrl ? (
        <div className="space-y-4">
          <PreviewSubmit
            form={form}
            imageUrl={previewUrl}
            latitude={latitude}
            longitude={longitude}
            onSubmit={handleSubmit}
            onRetake={handleRetake}
            onChangeCategory={handleChangeCategory}
            isSubmitting={isSubmitting}
            submitError={submitError}
            locationUnavailable={locationUnavailable}
          />
        </div>
      ) : null}

      {step === "success" ? <SuccessState /> : null}
    </div>
  );
}