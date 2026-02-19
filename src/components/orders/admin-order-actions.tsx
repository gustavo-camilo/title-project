"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assignResearcher, updateOrderStatus } from "@/actions/admin";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

interface AdminOrderActionsProps {
  orderId: string;
  currentStatus: string;
  currentResearcherId: string | null;
  researchers: Array<{ id: string; full_name: string; email: string }>;
}

export function AdminOrderActions({
  orderId,
  currentStatus,
  currentResearcherId,
  researchers,
}: AdminOrderActionsProps) {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [selectedResearcher, setSelectedResearcher] = useState(
    currentResearcherId ?? ""
  );
  const router = useRouter();

  async function handleAssign() {
    if (!selectedResearcher) return;
    setLoading(true);
    const result = await assignResearcher(orderId, selectedResearcher);
    if (result?.error) alert(result.error);
    else router.refresh();
    setLoading(false);
  }

  async function handleStatusChange(status: string) {
    setLoading(true);
    const result = await updateOrderStatus(orderId, status);
    if (result?.error) alert(result.error);
    else router.refresh();
    setLoading(false);
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4 text-primary" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Researcher assignment */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("assignResearcher")}
          </label>
          <select
            value={selectedResearcher}
            onChange={(e) => setSelectedResearcher(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select researcher</option>
            {researchers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.full_name || r.email}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={
              loading || !selectedResearcher || selectedResearcher === currentResearcherId
            }
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t("assignResearcher")}
          </Button>
        </div>

        {/* Status controls */}
        <div className="space-y-2 border-t border-border/40 pt-4">
          <label className="text-sm font-medium">Change Status</label>
          <div className="flex flex-col gap-2">
            {currentStatus === "in_review" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("completed")}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t("approve")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("revision_requested")}
                  disabled={loading}
                  className="w-full"
                >
                  {t("requestRevision")}
                </Button>
              </>
            )}
            {(currentStatus === "submitted" || currentStatus === "assigned") && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatusChange("cancelled")}
                disabled={loading}
                className="w-full"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
