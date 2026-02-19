"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cancelOrder } from "@/actions/orders";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const t = useTranslations("orderDetail");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    const result = await cancelOrder(orderId);
    if (result?.error) {
      alert(result.error);
      setLoading(false);
      setConfirming(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div>
      {confirming && (
        <p className="mb-2 text-sm text-muted-foreground">
          {t("cancelConfirm")}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          {loading
            ? "..."
            : confirming
              ? t("confirmCancel")
              : t("cancelOrder")}
        </Button>
        {confirming && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
          >
            {t("keepOrder")}
          </Button>
        )}
      </div>
    </div>
  );
}
