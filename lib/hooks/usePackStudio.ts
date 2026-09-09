import { useState, useCallback } from "react";
import { toast } from "sonner";
import { CreatePackResponse } from "@/lib/api/types";
import { apiClient, ApiError } from "@/lib/api/client";

export interface RuleDraft {
  title: string;
  category: string;
  criterion: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  penaltyScore: number;
  penaltyRationale: string;
  badExample: string;
  goodExample: string;
}

const INITIAL_RULE: RuleDraft = {
  title: "Uncapped Indemnification Clause",
  category: "LIABILITY",
  criterion: "Contracts must never include uncapped liability or open-ended indemnification of indirect damages.",
  severity: "CRITICAL",
  penaltyScore: 25,
  penaltyRationale: "Exposes client to catastrophic enterprise balance sheet risk without an aggregate liability ceiling.",
  badExample: "Tenant shall indemnify, defend, and hold harmless Landlord against all claims, losses, and damages arising out of this agreement.",
  goodExample: "Tenant's aggregate liability under this section shall be capped at 12 months' base rent, excluding gross negligence.",
};

export function usePackStudio() {
  const [title, setTitle] = useState("Corporate Commercial Lease & Tenancy Diagnostic");
  const [tagline, setTagline] = useState("High Court advocate diagnostic heuristics for commercial lease agreements.");
  const [description, setDescription] = useState(
    "Automated legal evaluation of commercial tenancy contracts in Kenya. Identifies uncapped indemnification, ambiguous service charge escalation clauses, and defective dispute resolution mechanics."
  );
  const [priceKes, setPriceKes] = useState(1500);
  const [expertName, setExpertName] = useState("Advocate Brian Wafula");
  const [expertTitle, setExpertTitle] = useState("Partner, Commercial & Property Law");
  const [institution, setInstitution] = useState("High Court of Kenya Advocate Practice");

  const [rules, setRules] = useState<RuleDraft[]>([INITIAL_RULE]);

  const [privateLink, setPrivateLink] = useState(true);
  const [marketplace, setMarketplace] = useState(true);
  const [embedWidget, setEmbedWidget] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<CreatePackResponse | null>(null);

  const addRule = useCallback(() => {
    setRules((prev) => [
      ...prev,
      {
        title: "New Rule Criteria",
        category: "GENERAL",
        criterion: "State the deterministic condition required in the document draft.",
        severity: "HIGH",
        penaltyScore: 15,
        penaltyRationale: "Explain why this defect causes harm or evaluation penalties.",
        badExample: "Draft text showing what violates this rule.",
        goodExample: "Exemplar gold-standard phrasing that passes.",
      },
    ]);
  }, []);

  const removeRule = useCallback((idx: number) => {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateRule = useCallback(<K extends keyof RuleDraft>(idx: number, field: K, value: RuleDraft[K]) => {
    setRules((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  }, []);

  const publishPack = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const data = await apiClient.packs.create({
        title,
        tagline,
        description,
        priceKes,
        expertName,
        expertTitle,
        institution,
        rules,
        accessModes: {
          privateLink: { enabled: privateLink },
          marketplace: { enabled: marketplace, category: "LEGAL", tags: ["Commercial", "Law"] },
          embedWidget: { enabled: embedWidget },
        },
      });

      setSuccessResult(data);
      toast.success("Expert Pack published with immutable version lock.");
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to publish pack.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title,
    tagline,
    description,
    priceKes,
    expertName,
    expertTitle,
    institution,
    rules,
    privateLink,
    marketplace,
    embedWidget,
  ]);

  return {
    title,
    setTitle,
    tagline,
    setTagline,
    description,
    setDescription,
    priceKes,
    setPriceKes,
    expertName,
    setExpertName,
    expertTitle,
    setExpertTitle,
    institution,
    setInstitution,
    rules,
    addRule,
    removeRule,
    updateRule,
    privateLink,
    setPrivateLink,
    marketplace,
    setMarketplace,
    embedWidget,
    setEmbedWidget,
    isSubmitting,
    successResult,
    publishPack,
  };
}
