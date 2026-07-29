"use client";

import { useEffect, useState } from "react";
import type { UserHealthProfile } from "@/types/health-profile";
import { defaultHealthProfile } from "@/types/health-profile";

export function useHealthProfile() {
  const [profile, setProfile] = useState<UserHealthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/health-profile")
      .then((response) => response.json())
      .then((data) => {
        if (data.profile) {
          setProfile({ userId: data.profile.userId, ...defaultHealthProfile, ...data.profile });
        } else {
          setProfile(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { profile, loading };
}
