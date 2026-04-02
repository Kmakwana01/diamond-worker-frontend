import API_CONFIG from "@/config/api.config";
import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from "@react-native-google-signin/google-signin";

interface GoogleAuthResponse {
  idToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    photo: string | null;
  };
}

class GoogleAuthService {
  private isConfigured = false;
  private configPromise: Promise<void> | null = null;

  constructor() {
    // Configure immediately on instantiation
    this.configPromise = this.configure();
  }

  private async configure(): Promise<void> {
    if (this.isConfigured) return;

    try {
      GoogleSignin.configure({
        webClientId: API_CONFIG.GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
        forceCodeForRefreshToken: true, // REQUIRED for idToken
      });
      this.isConfigured = true;
      console.log("✅ Google Sign-In configured");
    } catch (error) {
      console.error("❌ Google config error:", error);
      throw error;
    }
  }

  async signIn(): Promise<GoogleAuthResponse> {
    try {
      // Ensure configuration is complete
      await this.configPromise;

      // Fast Play Services check (no dialog for speed)
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: false,
      });

      // Sign in - this is the main bottleneck
      const result = await GoogleSignin.signIn();

      if (result.type !== "success") {
        throw new Error("Sign-in not successful");
      }

      const { data } = result;

      // Fast validation
      if (!data.idToken || !data.user?.email) {
        throw new Error("Missing required data from Google");
      }

      return {
        idToken: data.idToken,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name || data.user.email.split("@")[0],
          photo: data.user.photo || null,
        },
      };
    } catch (error: any) {
      // Fast error handling
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error("Sign-in cancelled");
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Sign-in in progress");
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Play Services unavailable");
      }
      throw new Error(error.message || "Sign-in failed");
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error("❌ Sign-out error:", error);
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      return await GoogleSignin.isSignedIn();
    } catch {
      return false;
    }
  }
}

export default new GoogleAuthService();
