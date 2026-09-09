"use client";

import { UserCheck, Calendar, ArrowRight, ShieldAlert } from "lucide-react";

interface HumanEscalationCardProps {
  expertName: string;
  expertTitle: string;
  consultationFeeKes?: number;
  calendlyUrl?: string;
  criticalDefectsCount: number;
}

export default function HumanEscalationCard({
  expertName = "Dr. Aris Thorne",
  expertTitle = "Faculty of Graduate Studies",
  consultationFeeKes = 2000,
  calendlyUrl = "https://calendly.com/dr-thorne/15min",
  criticalDefectsCount = 2,
}: HumanEscalationCardProps) {
  return (
    <div className="card-monad bg-white border-2 border-lake-blue/40 p-8 font-mono text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="tag-pill bg-coral/20 text-off-black font-bold">
              {criticalDefectsCount} CRITICAL DEFICIENCIES DETECTED
            </span>
            <span className="tag-pill bg-periwinkle-mist/40 text-lake-blue">
              HIRE THE EXPERT
            </span>
          </div>

          <h3 className="font-serif text-2xl text-off-black mb-2">
            Want {expertName}'s Personal Review?
          </h3>
          <p className="text-graphite leading-relaxed">
            The AI diagnostic flagged structural risks that could jeopardize your defense or contract execution. Upgrade to a 15-minute live triage consultation with {expertName} ({expertTitle}).
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-start md:items-end justify-center">
          <div className="font-serif text-3xl text-off-black mb-1">
            {consultationFeeKes} KES
          </div>
          <div className="text-[11px] text-smoke mb-4">15-Min Live Session</div>

          <a
            href={calendlyUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-pill btn-accent text-xs py-3 px-6 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Live Consultation</span>
          </a>
        </div>
      </div>
    </div>
  );
}
