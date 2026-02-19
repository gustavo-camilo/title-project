"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  initializeChecklist,
  updateChecklistItem,
  submitForReview,
} from "@/actions/researcher";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Send, CheckCircle, AlertCircle, MinusCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  category: string;
  item_name: string;
  status: string;
  notes: string | null;
  source_url: string | null;
  sort_order: number;
}

interface Props {
  orderId: string;
  orderStatus: string;
  items: ChecklistItem[];
  hasChecklist: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  property_verification: "Property Verification",
  mortgages: "Mortgages",
  tax_liens: "Tax Liens",
  hoa: "HOA / COA",
  mechanics_liens: "Mechanic's Liens",
  judgments: "Judgments",
  lis_pendens: "Lis Pendens",
  code_violations: "Code Violations",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", icon: MinusCircle },
  { value: "clear", label: "Clear", icon: CheckCircle },
  { value: "found", label: "Found", icon: AlertCircle },
  { value: "not_applicable", label: "N/A", icon: MinusCircle },
] as const;

export function ResearcherChecklist({
  orderId,
  orderStatus,
  items,
  hasChecklist,
}: Props) {
  const t = useTranslations("researcher");
  const tAdmin = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());
  const router = useRouter();

  async function handleInitialize() {
    setLoading(true);
    const result = await initializeChecklist(orderId);
    if (result?.error) alert(result.error);
    else router.refresh();
    setLoading(false);
  }

  async function handleItemUpdate(
    itemId: string,
    status: "pending" | "found" | "clear" | "not_applicable",
    notes?: string,
    sourceUrl?: string
  ) {
    setSavingItems((prev) => new Set(prev).add(itemId));
    await updateChecklistItem(itemId, { status, notes, sourceUrl });
    setSavingItems((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  }

  async function handleSubmitForReview() {
    setLoading(true);
    const result = await submitForReview(orderId);
    if (result?.error) alert(result.error);
    else router.refresh();
    setLoading(false);
  }

  if (!hasChecklist) {
    return (
      <Card className="border-border/40">
        <CardContent className="py-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            {t("noChecklist")}
          </p>
          <Button
            className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleInitialize}
            disabled={loading}
          >
            {loading ? "..." : t("initChecklist")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group items by category
  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.status !== "pending").length;
  const canSubmit =
    (orderStatus === "in_progress" || orderStatus === "revision_requested") &&
    completedItems > 0;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("progress")}</span>
            <span className="text-sm text-muted-foreground">
              {completedItems}/{totalItems}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist categories */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <Card key={category} className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base">
              {CATEGORY_LABELS[category] || category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-border/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium">{item.item_name}</p>
                  <div className="flex gap-1">
                    {STATUS_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant={item.status === opt.value ? "default" : "ghost"}
                        className={
                          item.status === opt.value
                            ? opt.value === "found"
                              ? "bg-destructive text-destructive-foreground"
                              : opt.value === "clear"
                                ? "bg-green-600 text-white"
                                : "bg-primary text-primary-foreground"
                            : "text-muted-foreground"
                        }
                        onClick={() =>
                          handleItemUpdate(
                            item.id,
                            opt.value,
                            item.notes ?? undefined,
                            item.source_url ?? undefined
                          )
                        }
                        disabled={savingItems.has(item.id)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Input
                    placeholder={t("notesPlaceholder")}
                    defaultValue={item.notes ?? ""}
                    onBlur={(e) =>
                      handleItemUpdate(
                        item.id,
                        item.status as "pending" | "found" | "clear" | "not_applicable",
                        e.target.value,
                        item.source_url ?? undefined
                      )
                    }
                  />
                  <Input
                    placeholder={t("sourceUrlPlaceholder")}
                    defaultValue={item.source_url ?? ""}
                    onBlur={(e) =>
                      handleItemUpdate(
                        item.id,
                        item.status as "pending" | "found" | "clear" | "not_applicable",
                        item.notes ?? undefined,
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Submit for review */}
      {canSubmit && (
        <Button
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSubmitForReview}
          disabled={loading}
        >
          <Send className="mr-2 h-4 w-4" />
          {loading ? "..." : tAdmin("submitForReview")}
        </Button>
      )}
    </div>
  );
}
