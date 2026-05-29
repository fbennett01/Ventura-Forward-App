"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { SignUpInput, SignUpResult } from "@/lib/rewards/types";

// Live-mode enrollment card shown on the Rewards tab until the device has a
// member wallet. Mirrors the dashboard's named/email member model.
export function JoinRewards({
  onJoin,
}: {
  onJoin: (input: SignUpInput) => Promise<SignUpResult>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Enter your name and email.");
      return;
    }
    setSubmitting(true);
    const res = await onJoin({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Welcome to Ventura Rewards!");
    } else {
      toast.error(res.error === "invalid_email" ? "Enter a valid email." : "Couldn't enroll. Try again.");
    }
  };

  const inputClass =
    "rounded-xl bg-vf-navy-100 border border-white/10 px-4 py-3 text-vf-sand placeholder:text-vf-sand/30 focus:border-vf-accent/50 focus:outline-none transition-colors";

  return (
    <div className="mx-5 mt-5 rounded-3xl p-6 relative overflow-hidden bg-vf-navy-100/50 backdrop-blur-xl border border-white/5 shadow-vf-medium">
      <div className="absolute -bottom-4 -right-4 opacity-10 pointer-events-none">
        <Leaf className="size-32 text-white rotate-[-20deg]" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Leaf className="size-5 text-vf-accent" />
          <h2 className="font-display font-extrabold text-2xl text-white">Join Ventura Rewards</h2>
        </div>
        <p className="text-vf-sand/60 text-sm mb-5 leading-relaxed">
          Earn Forward Points at local Ventura partners and redeem them for perks. Free to join.
        </p>
        <div className="flex flex-col gap-3">
          <input
            className={inputClass}
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            aria-label="Full name"
          />
          <input
            className={inputClass}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-label="Email"
          />
          <input
            className={inputClass}
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            aria-label="Phone (optional)"
          />
          <Button
            onClick={() => void submit()}
            disabled={submitting}
            className="btn-ripple relative vf-gradient text-vf-navy font-bold rounded-full px-8 mt-1 active:scale-95 transition-all shadow-md hover:shadow-lg shadow-vf-accent/30 disabled:opacity-40 disabled:pointer-events-none"
          >
            {submitting ? "Joining…" : "Join now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
