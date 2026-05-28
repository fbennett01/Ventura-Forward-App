"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { RefreshCw } from "lucide-react";
import { getDeviceId } from "@/lib/device-id";
import { Button } from "@/components/ui/button";

// Renders the member's signed token as a QR code for a vendor to scan.
export function MemberQr() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const deviceId = getDeviceId();
      const res = await fetch("/api/rewards/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId }),
      });
      if (!res.ok) {
        setError("Couldn't generate your code. Try again.");
        return;
      }
      const { token, expiresAt: exp } = (await res.json()) as {
        token: string;
        expiresAt: number;
      };
      const url = await QRCode.toDataURL(token, {
        width: 240,
        margin: 1,
        color: { dark: "#0C1A2E", light: "#F5E9D7" },
      });
      setDataUrl(url);
      setExpiresAt(exp);
    } catch {
      setError("Couldn't generate your code. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const expired = expiresAt != null && secondsLeft <= 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-[240px] rounded-2xl bg-vf-sand flex items-center justify-center overflow-hidden">
        {dataUrl && !expired ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Your rewards code" width={240} height={240} />
        ) : (
          <div className="text-vf-navy/60 text-sm font-medium px-6 text-center">
            {loading ? "Generating…" : expired ? "Code expired" : (error ?? "")}
          </div>
        )}
      </div>

      {error && !loading ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : expired ? (
        <p className="text-sm text-vf-sand/60">Refresh to get a new code.</p>
      ) : (
        <p className="text-sm text-vf-sand/60">
          Show this to the partner · expires in {secondsLeft}s
        </p>
      )}

      <Button
        onClick={() => void load()}
        disabled={loading}
        className="btn-ripple relative vf-gradient text-vf-navy font-bold rounded-full px-6 active:scale-95 transition-all shadow-md hover:shadow-lg shadow-vf-accent/30"
      >
        <RefreshCw className={`size-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
        {expired ? "New code" : "Refresh"}
      </Button>
    </div>
  );
}
