"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Camera, CheckCircle2, XCircle } from "lucide-react";
import type { Partner } from "@/types";

const CODE_KEY = "vf_rewards_vendor_code";
const VENDOR_KEY = "vf_rewards_vendor_id";
const POINTS_KEY = "vf_rewards_vendor_points";

const ERROR_COPY: Record<string, string> = {
  unauthorized: "Wrong access code.",
  expired: "That code expired — ask them to refresh it.",
  already_scanned: "This code was already scanned.",
  bad_signature: "Invalid code.",
  malformed: "Invalid code.",
  vendor_not_found: "Select a valid business.",
  member_not_found: "Member not found.",
};

type Status = { kind: "idle" | "success" | "error"; message: string };

export default function VendorScanPage() {
  const [vendors, setVendors] = useState<Partner[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [points, setPoints] = useState(5);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    setAccessCode(localStorage.getItem(CODE_KEY) ?? "");
    setVendorId(localStorage.getItem(VENDOR_KEY) ?? "");
    const savedPts = Number(localStorage.getItem(POINTS_KEY));
    if (savedPts > 0) setPoints(savedPts);

    fetch("/api/rewards/vendors")
      .then((r) => (r.ok ? r.json() : { partners: [] }))
      .then((d: { partners: Partner[] }) => setVendors(d.partners ?? []))
      .catch(() => setVendors([]));
  }, []);

  const stop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const award = useCallback(
    async (token: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      stop();
      try {
        const res = await fetch("/api/rewards/award", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, vendor_id: vendorId, points, access_code: accessCode }),
        });
        const data = (await res.json()) as {
          balance?: number;
          vendor?: string;
          points?: number;
          error?: string;
        };
        if (res.ok) {
          setStatus({
            kind: "success",
            message: `Awarded ${data.points} pts at ${data.vendor}. New balance: ${data.balance}.`,
          });
        } else {
          setStatus({
            kind: "error",
            message: ERROR_COPY[data.error ?? ""] ?? "Couldn't award points.",
          });
        }
      } catch {
        setStatus({ kind: "error", message: "Network error. Try again." });
      } finally {
        setTimeout(() => {
          busyRef.current = false;
        }, 800);
      }
    },
    [vendorId, points, accessCode, stop]
  );

  const start = useCallback(async () => {
    setStatus({ kind: "idle", message: "" });
    if (!vendorId) {
      setStatus({ kind: "error", message: "Select your business first." });
      return;
    }
    if (!accessCode) {
      setStatus({ kind: "error", message: "Enter the vendor access code." });
      return;
    }
    localStorage.setItem(CODE_KEY, accessCode);
    localStorage.setItem(VENDOR_KEY, vendorId);
    localStorage.setItem(POINTS_KEY, String(points));

    setScanning(true);
    try {
      let deviceId: string | undefined;
      try {
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        const back = devices.find((d) => /back|rear|environment/i.test(d.label));
        deviceId = (back ?? devices[devices.length - 1])?.deviceId;
      } catch {
        deviceId = undefined;
      }

      const reader = new BrowserQRCodeReader();
      controlsRef.current = await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current ?? undefined,
        (result) => {
          if (result) void award(result.getText());
        }
      );
    } catch {
      setScanning(false);
      setStatus({ kind: "error", message: "Couldn't start the camera. Check permissions." });
    }
  }, [vendorId, accessCode, points, award]);

  return (
    <main className="min-h-screen px-5 py-8 pb-[env(safe-area-inset-bottom)] max-w-md mx-auto flex flex-col gap-5">
      <header>
        <h1 className="font-display font-extrabold text-2xl text-vf-sand">Vendor — Award Points</h1>
        <p className="text-sm text-vf-sand/50 mt-1">
          Pick your business, set the points, then scan the member&apos;s code.
        </p>
      </header>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-widest text-vf-sand/40 font-semibold">Business</span>
        <select
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          className="rounded-xl bg-vf-navy-100 border border-white/10 px-4 py-3 text-vf-sand"
        >
          <option value="">Select…</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <label className="flex flex-col gap-1.5 flex-1">
          <span className="text-xs uppercase tracking-widest text-vf-sand/40 font-semibold">Points</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={points}
            onChange={(e) => setPoints(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
            className="rounded-xl bg-vf-navy-100 border border-white/10 px-4 py-3 text-vf-sand"
          />
        </label>
        <label className="flex flex-col gap-1.5 flex-1">
          <span className="text-xs uppercase tracking-widest text-vf-sand/40 font-semibold">Access code</span>
          <input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="••••••"
            className="rounded-xl bg-vf-navy-100 border border-white/10 px-4 py-3 text-vf-sand"
          />
        </label>
      </div>

      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black border border-white/10">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-vf-sand/40">
            <Camera className="size-10" />
            <span className="text-sm">Camera off</span>
          </div>
        )}
      </div>

      {status.kind !== "idle" && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            status.kind === "success"
              ? "bg-green-500/15 text-green-300"
              : "bg-red-500/15 text-red-300"
          }`}
        >
          {status.kind === "success" ? (
            <CheckCircle2 className="size-5 flex-shrink-0" />
          ) : (
            <XCircle className="size-5 flex-shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {scanning ? (
        <button
          onClick={stop}
          className="rounded-full bg-white/10 text-vf-sand font-bold py-3 active:scale-95 transition-all"
        >
          Stop
        </button>
      ) : (
        <button
          onClick={() => void start()}
          className="btn-ripple vf-gradient text-vf-navy font-bold rounded-full py-3 active:scale-95 transition-all shadow-md shadow-vf-accent/30"
        >
          {status.kind === "idle" ? "Start scanning" : "Scan next"}
        </button>
      )}

      <p className="text-xs text-vf-sand/30 text-center">
        Beta tool. The production dashboard uses Supabase Auth.
      </p>
    </main>
  );
}
