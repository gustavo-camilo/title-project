"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { updateProfile } from "@/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<{
    email: string;
    full_name: string;
    phone: string;
    preferred_locale: string;
    credit_balance: number;
    role: string;
    created_at: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("email, full_name, phone, preferred_locale, credit_balance, role, created_at")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    }
    loadProfile();
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const result = await updateProfile(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">{tCommon("loading")}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile info card */}
        <Card className="border-border/40 lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">
              {profile.full_name || profile.email}
            </h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <Badge className="mt-2" variant="secondary">
              {profile.role}
            </Badge>
            <div className="mt-4 w-full border-t border-border/40 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("creditBalance")}</span>
                <span className="font-semibold">{profile.credit_balance}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">{t("memberSince")}</span>
                <span>{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="border-border/40 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("editProfile")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
                  {t("updateSuccess")}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">{t("fullName")}</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile.full_name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={profile.email}
                  disabled
                  className="opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  {t("emailCannotChange")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile.phone || ""}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredLocale">{t("preferredLanguage")}</Label>
                <select
                  id="preferredLocale"
                  name="preferredLocale"
                  defaultValue={profile.preferred_locale}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="en">{tCommon("english")}</option>
                  <option value="pt">{tCommon("portuguese")}</option>
                </select>
              </div>

              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "..." : tCommon("save")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
