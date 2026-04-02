import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/* ───────────────────────────────────────────── */
/* Types */
/* ───────────────────────────────────────────── */

export interface RemoteConfigValues {
  apiBaseUrl: string;
  googleWebClientId: string;
}

/* ───────────────────────────────────────────── */
/* Firebase Configuration */
/* ───────────────────────────────────────────── */

const FIREBASE_CONFIG = {
  projectId: "wokerapp-766c6",
  apiKey: "AIzaSyCNv6G-X0lat6-VUqsBKySnHNw_PGieSdY",
  appId: "1:689727330976:web:d84f7a20e110c7fdf9c7c5",
};

const CACHE_KEY = "remoteConfig";
const CACHE_TIMESTAMP_KEY = "remoteConfigTimestamp";
const INSTANCE_ID_KEY = "firebaseInstanceId";
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

/* ───────────────────────────────────────────── */
/* Default Config (Fallback) */
/* ───────────────────────────────────────────── */

const getDefaultHost = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return '10.0.2.2';
    } else if (Platform.OS === 'ios') {
      return 'localhost';
    }
  }
  return '192.168.1.34';
};

const DEFAULT_CONFIG: RemoteConfigValues = {
  apiBaseUrl: `http://${getDefaultHost()}:8085/api/v1/`,
  googleWebClientId:
    "689727330976-k88f12dluq5k6q0kdjgvk0pelacnrsp1.apps.googleusercontent.com",
};

/* ───────────────────────────────────────────── */
/* Get or Create Installation ID */
/* ───────────────────────────────────────────── */

const getInstallationId = async (): Promise<string> => {
  try {
    let id = await AsyncStorage.getItem(INSTANCE_ID_KEY);
    if (!id) {
      id = `fid-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
      await AsyncStorage.setItem(INSTANCE_ID_KEY, id);
    }
    return id;
  } catch {
    return `fid-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
  }
};

/* ───────────────────────────────────────────── */
/* Fetch from Firebase Remote Config */
/* ───────────────────────────────────────────── */

const fetchFirebaseConfig = async (): Promise<RemoteConfigValues | null> => {
  try {
    const installationId = await getInstallationId();
    
    // Use the public REST API endpoint
    const url = `https://firebaseremoteconfig.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/namespaces/firebase:fetch`;
    
    const payload = {
      app_id: FIREBASE_CONFIG.appId,
      app_instance_id: installationId,
      app_instance_id_token: "",
      country_code: "US",
      language_code: "en",
      platform_version: Platform.OS === 'android' ? '33' : '16.0',
      time_zone: "UTC",
    };

    console.log("🔄 Fetching from Firebase Remote Config...");

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': FIREBASE_CONFIG.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firebase API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Parse the response
    const entries = data.entries || {};
    
    const config: RemoteConfigValues = {
      apiBaseUrl: entries.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl,
      googleWebClientId: entries.googleWebClientId || DEFAULT_CONFIG.googleWebClientId,
    };

    console.log("🔥 Firebase Remote Config fetched:", {
      apiBaseUrl: config.apiBaseUrl,
      googleWebClientId: config.googleWebClientId.slice(0, 20) + "...",
    });

    return config;
  } catch (error: any) {
    console.error("❌ Firebase fetch failed:", error?.message || error);
    return null;
  }
};

/* ───────────────────────────────────────────── */
/* Check if cache is valid */
/* ───────────────────────────────────────────── */

const isCacheValid = async (): Promise<boolean> => {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const age = Date.now() - parseInt(timestamp, 10);
    return age < CACHE_DURATION;
  } catch {
    return false;
  }
};

/* ───────────────────────────────────────────── */
/* Initialize Remote Config */
/* ───────────────────────────────────────────── */

export const initializeRemoteConfig = async (): Promise<RemoteConfigValues> => {
  try {
    // 1. Load cached config first
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: RemoteConfigValues = JSON.parse(cached);
      applyConfig(parsed);
      console.log("💾 Loaded cached Remote Config");
      
      // If cache is valid, use it and update in background
      if (await isCacheValid()) {
        console.log("✅ Cache is valid");
        
        // Update in background (don't await)
        fetchAndUpdate().catch(err => 
          console.log("⚠️ Background update failed:", err.message)
        );
        
        return parsed;
      }
    }

    // 2. Fetch fresh config
    const freshConfig = await fetchFirebaseConfig();

    if (freshConfig) {
      applyConfig(freshConfig);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(freshConfig));
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      return freshConfig;
    }

    // 3. Fallback to cache if fetch failed
    if (cached) {
      console.log("⚠️ Using stale cache");
      return JSON.parse(cached);
    }

    // 4. Use defaults
    console.log("⚠️ Using default config");
    applyConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;

  } catch (error) {
    console.error("❌ Config initialization failed:", error);
    applyConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
};

/* ───────────────────────────────────────────── */
/* Background update */
/* ───────────────────────────────────────────── */

const fetchAndUpdate = async () => {
  const config = await fetchFirebaseConfig();
  if (config) {
    applyConfig(config);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(config));
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  }
};

/* ───────────────────────────────────────────── */
/* Apply config globally */
/* ───────────────────────────────────────────── */

const applyConfig = (config: RemoteConfigValues) => {
  import("@/config/api.config").then((module) => {
    module.API_CONFIG.BASE_URL = config.apiBaseUrl;
    module.API_CONFIG.GOOGLE_WEB_CLIENT_ID = config.googleWebClientId;
  }).catch((err) => {
    console.error("❌ Failed to apply config:", err);
  });
};

/* ───────────────────────────────────────────── */
/* Manual refresh */
/* ───────────────────────────────────────────── */

export const refreshRemoteConfig = async (): Promise<RemoteConfigValues> => {
  await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
  return initializeRemoteConfig();
};