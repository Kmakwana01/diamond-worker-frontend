// src/hooks/useProfileData.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { profileApi } from "../api/profileApi";
import Toast from "react-native-toast-message";

export interface ProfileStats {
  totalWorkEntries: number;
  totalEarnings: number;
  pendingBalance: number;
}

export interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  age?: number;
  avatar?: string;
}

export const useProfileData = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();

      if (!mountedRef.current) return;

      const userData = response.data?.data?.user || response.data?.user;
      const statsData = response.data?.data?.stats || response.data?.stats;

      setProfile(userData);
      setStats(statsData);
    } catch (err: any) {
      console.log("Profile fetch failed:", err);
      Toast.show({
        type: "error",
        text1: t("profile.loadFailed"),
        text2: err?.response?.data?.message || t("common.tryAgain"),
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [t]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
  }, [fetchAll]);

  return { profile, stats, loading, refreshing, refresh };
};
