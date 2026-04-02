import API_CONFIG from "@/config/api.config";
import client from "./client";

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: Record<string, FieldConfig>;
  calculation: {
    formula: string;
    fields: string[];
  };
}

export interface FieldConfig {
  type: "number" | "decimal" | "select" | "text";
  required: boolean;
  labelKey: string; // Changed from 'label' to 'labelKey'
  min?: number;
  max?: number;
  default?: any;
  options?: string[];
  usedInCalculation: boolean;
}

export interface CategoryStats {
  totalWorkEntries: number;
  totalEarnings: number;
  totalPaid: number;
  pendingBalance: number;
  lastWorkDate?: string;
  avgEarningsPerEntry: number;
}

// HARDCODED CATEGORIES - Updated with translation keys
const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: "DIAMOND",
    name: "Diamond Worker",
    description: "Diamond cutting and processing",
    icon: "diamond-stone",
    color: "#3B82F6",
    fields: {
      workType: {
        type: "select",
        required: true,
        labelKey: "work.fields.workType",
        options: ["Cutting", "Polishing", "Other"],
        usedInCalculation: false,
      },
      pieceCount: {
        type: "number",
        required: true,
        labelKey: "work.fields.pieces",
        min: 1,
        max: 10000,
        usedInCalculation: true,
      },
      ratePerPiece: {
        type: "decimal",
        required: true,
        labelKey: "work.fields.ratePerPiece",
        min: 0.01,
        max: 100000,
        usedInCalculation: true,
      },
    },
    calculation: {
      formula: "pieceCount * ratePerPiece",
      fields: ["pieceCount", "ratePerPiece"],
    },
  },
  {
    id: "PLUMBER",
    name: "Plumber",
    description: "Plumbing services",
    icon: "pipe-wrench",
    color: "#10B981",
    fields: {
      serviceType: {
        type: "select",
        required: true,
        labelKey: "work.fields.serviceType",
        options: ["Repair", "Maintenance", "Emergency", "Installation"],
        usedInCalculation: false,
      },
      ratePerJob: {
        type: "decimal",
        required: true,
        labelKey: "work.fields.ratePerJob",
        min: 0.01,
        max: 100000,
        usedInCalculation: true,
      },
      materialCost: {
        type: "decimal",
        required: false,
        labelKey: "work.fields.materialCost",
        min: 0,
        max: 50000,
        default: 0,
        usedInCalculation: true,
      },
    },
    calculation: {
      formula: "ratePerJob - materialCost",
      fields: ["ratePerJob", "materialCost"],
    },
  },
  {
    id: "CARPENTER",
    name: "Carpenter",
    description: "Carpentry work",
    icon: "hammer-screwdriver",
    color: "#F59E0B",
    fields: {
      workType: {
        type: "select",
        required: true,
        labelKey: "work.fields.workType",
        options: ["Furniture", "Repair", "Custom", "Assembly"],
        usedInCalculation: false,
      },
      itemsProduced: {
        type: "number",
        required: true,
        labelKey: "work.fields.itemsProduced",
        min: 1,
        max: 1000,
        usedInCalculation: true,
      },
      ratePerItem: {
        type: "decimal",
        required: true,
        labelKey: "work.fields.ratePerItem",
        min: 0.01,
        max: 100000,
        usedInCalculation: true,
      },
    },
    calculation: {
      formula: "itemsProduced * ratePerItem",
      fields: ["itemsProduced", "ratePerItem"],
    },
  },
  {
    id: "MASON",
    name: "Mason Worker",
    description: "Construction and masonry work",
    icon: "wall",
    color: "#EF4444",
    fields: {
      workType: {
        type: "select",
        required: true,
        labelKey: "work.fields.workType",
        options: ["Mason", "Helper", "Contractor"],
        usedInCalculation: false,
      },
      dayWage: {
        type: "decimal",
        required: true,
        labelKey: "work.fields.dayWage",
        min: 50,
        max: 10000,
        usedInCalculation: true,
      },
      materialCost: {
        type: "decimal",
        required: false,
        labelKey: "work.fields.materialCost",
        min: 0,
        max: 5000,
        default: 0,
        usedInCalculation: true,
      },
    },
    calculation: {
      formula: "dayWage - materialCost",
      fields: ["dayWage", "materialCost"],
    },
  },
];

export const categoryApi = {
  getCategories: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: { success: true, data: CATEGORY_CONFIGS } };
  },

  getUserCategories: async () => {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      // const categories = await AsyncStorage.getItem("userCategories");
      // const primary = await AsyncStorage.getItem("selectedCategory");

      await AsyncStorage.setItem("selectedCategory", "DIAMOND");
      await AsyncStorage.setItem("userCategories", JSON.stringify(["DIAMOND"]));

      const categories = await AsyncStorage.getItem("userCategories");
      const primary = await AsyncStorage.getItem("selectedCategory");
      return {
        data: {
          success: true,
          data: {
            categories: categories ? JSON.parse(categories) : [],
            primary: primary || "DIAMOND",
          },
        },
      };
    } catch (error) {
      console.error("getUserCategories error:", error);
      return {
        data: {
          success: true,
          data: {
            categories: ["DIAMOND"], // ← FALLBACK TO DIAMOND
            primary: "DIAMOND",
          },
        },
      };
    }
  },

  addCategory: async (categoryId: string) => {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      const existing = await AsyncStorage.getItem("userCategories");
      const categories = existing ? JSON.parse(existing) : [];
      if (!categories.includes(categoryId)) {
        categories.push(categoryId);
      }
      await AsyncStorage.setItem("userCategories", JSON.stringify(categories));
      console.log("Category added to localStorage:", categoryId);
      return { data: { success: true, message: "Category added" } };
    } catch (error) {
      console.error("addCategory error:", error);
      throw new Error("Failed to add category");
    }
  },

  setPrimaryCategory: async (categoryId: string) => {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem("selectedCategory", categoryId);
      console.log("Primary category set in localStorage:", categoryId);
      return { data: { success: true, message: "Primary category set" } };
    } catch (error) {
      console.error("setPrimaryCategory error:", error);
      throw new Error("Failed to set primary category");
    }
  },

  getCategoryStats: async (categoryId: string) => {
    try {

      // ✅ FIX 1: Add null checks for each API call
      let workResponse;
      let balanceResponse;

      try {
        workResponse = await client.get(API_CONFIG.ENDPOINTS.WORK, {
          params: { category: categoryId, limit: 1000 },
        });
        console.log("✅ Work response:", workResponse?.status);
      } catch (workError) {
        console.error("❌ Work API error:", workError);
        workResponse = null;
      }

      try {
        balanceResponse = await client.get(
          API_CONFIG.ENDPOINTS.PAYMENT_BALANCE,
          { params: { category: categoryId } }
        );
        console.log("✅ Balance response:", balanceResponse?.status);
      } catch (balanceError) {
        console.error("❌ Balance API error:", balanceError);
        balanceResponse = null;
      }

      // ✅ FIX 2: Safely extract data with fallbacks
      const workEntries = workResponse?.data?.data?.workEntries || [];
      const balance = balanceResponse?.data?.data || {};

      // ✅ FIX 3: Calculate stats safely
      const totalEarnings = Number(balance.totalEarnings) || 0;
      const totalPaid = Number(balance.totalPaid) || 0;
      const pendingBalance = Number(balance.pendingBalance) || 0;
      const avgEarningsPerEntry =
        workEntries.length > 0 ? totalEarnings / workEntries.length : 0;

      console.log("✅ Stats calculated:", {
        totalWorkEntries: workEntries.length,
        totalEarnings,
        totalPaid,
        pendingBalance,
      });

      return {
        data: {
          success: true,
          data: {
            totalWorkEntries: workEntries.length,
            totalEarnings,
            totalPaid,
            pendingBalance,
            lastWorkDate: workEntries[0]?.workDate || null,
            avgEarningsPerEntry,
          } as CategoryStats,
        },
      };
    } catch (error) {
      console.error("❌ getCategoryStats error:", error);

      // ✅ FIX 4: Always return valid structure
      return {
        data: {
          success: true,
          data: {
            totalWorkEntries: 0,
            totalEarnings: 0,
            totalPaid: 0,
            pendingBalance: 0,
            avgEarningsPerEntry: 0,
            lastWorkDate: undefined,
          } as CategoryStats,
        },
      };
    }
  },

  getCategoryConfig: async (categoryId: string) => {
    const config = CATEGORY_CONFIGS.find((c) => c.id === categoryId);
    if (!config) {
      throw new Error("Category not found");
    }
    console.log("Category config returned for:", categoryId);
    return { data: { success: true, data: config } };
  },

  removeCategory: async (categoryId: string) => {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      const existing = await AsyncStorage.getItem("userCategories");
      const categories = existing ? JSON.parse(existing) : [];
      const filtered = categories.filter((c: string) => c !== categoryId);
      await AsyncStorage.setItem("userCategories", JSON.stringify(filtered));
      console.log("Category removed from localStorage:", categoryId);
      return { data: { success: true, message: "Category removed" } };
    } catch (error) {
      console.error("removeCategory error:", error);
      throw new Error("Failed to remove category");
    }
  },
};

export default categoryApi;
