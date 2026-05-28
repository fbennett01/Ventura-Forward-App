"use client";

import { useEffect, useState } from "react";
import { Check, Gift, Leaf } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { RedeemResult } from "@/lib/rewards/use-rewards";
import type { Partner } from "@/types";

const buttonClass =
  "btn-ripple relative vf-gradient text-vf-navy font-bold rounded-full px-8 mt-2 active:scale-95 transition-all shadow-md hover:shadow-lg shadow-vf-accent/30 disabled:opacity-40 disabled:pointer-events-none";

export function RedeemSheet({
  partner,
  balance,
  redeem,
  onOpenChange,
}: {
  partner: Partner | null;
  balance: number;
  redeem: (partner: Partner) => Promise<RedeemResult>;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    setCode(null);
    setSubmitting(false);
  }, [partner]);

  const open = partner != null;
  const affordable = partner ? balance >= partner.pointsCost : false;

  const handleRedeem = async () => {
    if (!partner) return;
    setSubmitting(true);
    const res = await redeem(partner);
    setSubmitting(false);

    if (res.ok) {
      toast.success(`Redeemed: ${partner.perk}`);
      if (res.code) {
        setCode(res.code);
      } else {
        onOpenChange(false);
      }
      return;
    }

    const msg =
      res.error === "insufficient_points"
        ? "Not enough points yet."
        : res.error === "unavailable"
          ? "This perk isn't available yet."
          : "Couldn't redeem. Try again.";
    toast.error(msg);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-vf-navy border-t border-white/10 rounded-t-3xl pb-10"
      >
        {partner && (
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="w-12 h-1 rounded-full bg-white/20" />

            {code ? (
              <>
                <div className="w-12 h-12 rounded-full bg-vf-sea/15 flex items-center justify-center">
                  <Check className="size-6 text-vf-sea" />
                </div>
                <h3 className="font-display font-bold text-xl text-vf-sand">Show this code</h3>
                <p className="text-vf-sand/60 text-sm text-center px-6">
                  {partner.perk} at {partner.name}
                </p>
                <div className="text-3xl font-display font-extrabold tracking-widest text-vf-accent bg-vf-navy-100 rounded-xl px-6 py-3 border border-white/10">
                  {code}
                </div>
                <Button onClick={() => onOpenChange(false)} className={buttonClass}>
                  Done
                </Button>
              </>
            ) : (
              <>
                <Gift className="size-12 text-vf-accent" />
                <h3 className="font-display font-bold text-xl text-vf-sand text-center px-6">
                  {partner.perk}
                </h3>
                <p className="text-vf-sand/60 text-sm">{partner.name}</p>
                <div className="flex items-center gap-1 text-vf-accent text-sm font-bold">
                  <Leaf className="size-4" />
                  {partner.pointsCost} pts
                </div>
                <p className="text-xs text-vf-sand/40">Your balance: {balance} pts</p>
                <Button
                  onClick={() => void handleRedeem()}
                  disabled={!affordable || submitting}
                  className={buttonClass}
                >
                  {submitting
                    ? "Redeeming…"
                    : affordable
                      ? `Redeem for ${partner.pointsCost} pts`
                      : `Need ${partner.pointsCost - balance} more pts`}
                </Button>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
