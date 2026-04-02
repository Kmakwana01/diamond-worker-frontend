import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { ReportStatistics } from "../types/report";

export const exportReportToCSV = async (
  statistics: ReportStatistics,
  dateRange: { startDate: string; endDate: string }
): Promise<void> => {
  try {
    let csvContent = "Diamond Worker Report\n";
    csvContent += `Period: ${dateRange.startDate} to ${dateRange.endDate}\n\n`;
    csvContent += "Summary\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Entries,${statistics.totalEntries}\n`;
    csvContent += `Total Pieces,${statistics.totalPieces}\n`;
    csvContent += `Total Earnings,₹${statistics.totalEarnings}\n`;
    csvContent += `Pending Balance,₹${statistics.pendingBalance}\n`;
    csvContent += `Total Paid,₹${statistics.totalPaid}\n\n`;

    if (statistics.workTypeBreakdown && statistics.workTypeBreakdown.length > 0) {
      csvContent += "Work Type Breakdown\n";
      csvContent += "Work Type,Pieces,Entries,Earnings\n";
      statistics.workTypeBreakdown.forEach((item) => {
        csvContent += `${item._id},${item.pieces},${item.count},₹${item.earnings}\n`;
      });
    }

    const fileName = `report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error: any) {
    console.error("Export to CSV error:", error);
    throw new Error(error.message || "Failed to export CSV");
  }
};

export const exportReportToJSON = async (
  statistics: ReportStatistics,
  dateRange: { startDate: string; endDate: string }
): Promise<void> => {
  try {
    const reportData = {
      period: dateRange,
      generatedAt: new Date().toISOString(),
      statistics,
    };

    const jsonContent = JSON.stringify(reportData, null, 2);
    const fileName = `report_${dateRange.startDate}_to_${dateRange.endDate}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error: any) {
    console.error("Export to JSON error:", error);
    throw new Error(error.message || "Failed to export JSON");
  }
};
