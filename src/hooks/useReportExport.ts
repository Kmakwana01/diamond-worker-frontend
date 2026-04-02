// src/hooks/useReportExport.ts
import { useState } from "react";
import { Share, Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { ReportStatistics } from "../types/report";

export const useReportExport = () => {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  /**
   * TEXT EXPORT
   */
  const formatReportText = (
    statistics: ReportStatistics,
    dateRange: any
  ): string => {
    const category = statistics.workTypeBreakdown?.[0];
    const detailed = statistics.detailedCategorySummary;

    const totalEntries = statistics.totalEntries ?? 0;
    const totalEarnings = statistics.totalEarnings ?? 0;
    const totalPaid = statistics.totalPaid ?? 0;
    const remainingBalance = statistics.pendingBalance ?? 0;
    const paymentCount = statistics.paymentCount ?? 0;

    let avgEarningPerEntry = 0;
    if (detailed?.overview?.avgEarningPerEntry != null) {
      avgEarningPerEntry = detailed.overview.avgEarningPerEntry;
    } else if (totalEntries > 0) {
      avgEarningPerEntry = totalEarnings / totalEntries;
    }

    let report = "";

    // HEADER
    report += `📊 ${t("reports.export.workReport").toUpperCase()} - ${
      category?.categoryName || "N/A"
    }\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `${t("reports.export.generated")}: ${new Date().toLocaleString(
      "en-IN"
    )}\n`;
    report += `${t("reports.export.period")}: ${dateRange.startDate} ${t(
      "reports.export.to"
    )} ${dateRange.endDate}\n`;
    report += `${t("reports.export.category")}: ${
      category?.categoryName || "N/A"
    }\n\n`;

    // SUMMARY
    report += `📈 ${t("reports.export.summary").toUpperCase()}\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `${t("reports.statistics.totalEntries")}: ${totalEntries}\n`;
    report += `${t(
      "reports.financial.totalEarnings"
    )}: ₹${totalEarnings.toLocaleString("en-IN")}\n`;
    report += `${t("reports.export.totalPaid")}: ₹${totalPaid.toLocaleString(
      "en-IN"
    )}\n`;
    report += `${t(
      "reports.export.remainingBalance"
    )}: ₹${remainingBalance.toLocaleString("en-IN")}\n`;
    report += `${t(
      "reports.export.avgPerEntry"
    )}: ₹${avgEarningPerEntry.toFixed(2)}\n\n`;

    // CATEGORY DETAILS
    if (category) {
      report += `💼 ${t("reports.export.categoryDetails").toUpperCase()}\n`;
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      report += `${category.icon || ""} ${category.categoryName}\n`;
      report += `${t("reports.statistics.totalEntries")}: ${
        category.entryCount
      }\n`;
      report += `${t(
        "reports.financial.totalEarnings"
      )}: ₹${category.totalEarnings.toLocaleString("en-IN")}\n\n`;

      if (category.totals) {
        Object.entries(category.totals).forEach(([key, value]) => {
          const label = key.replace(/([A-Z])/g, " $1").trim();
          const capitalizedLabel =
            label.charAt(0).toUpperCase() + label.slice(1);
          report += `${capitalizedLabel}: ${
            typeof value === "number" ? value.toFixed(2) : value
          }\n`;
        });
        report += `\n`;
      }
    }

    // WORK TYPE BREAKDOWN
    if (detailed?.workTypeBreakdown?.length) {
      report += `🔧 ${t("reports.export.workTypeBreakdown").toUpperCase()}\n`;
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      detailed.workTypeBreakdown.forEach((workType: any, index: number) => {
        report += `${index + 1}. ${workType._id}\n`;
        report += `   ${t("reports.statistics.entries")}: ${
          workType.entryCount
        }\n`;
        report += `   ${t(
          "reports.financial.totalEarnings"
        )}: ₹${workType.totalEarnings.toLocaleString("en-IN")}\n\n`;
      });
    }

    // FIELD INSIGHTS
    if (detailed?.fieldInsights) {
      const fi = detailed.fieldInsights;
      report += `📊 ${t("reports.export.fieldInsights").toUpperCase()}\n`;
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      if (fi.totalPieces > 0) {
        report += `${t("reports.export.totalPieces")}: ${fi.totalPieces}\n`;
      }
      if (fi.totalHours > 0) {
        report += `${t("reports.export.totalHours")}: ${fi.totalHours.toFixed(
          2
        )}\n`;
      }
      if (fi.totalMaterialCost > 0) {
        report += `${t(
          "reports.export.materialCost"
        )}: ₹${fi.totalMaterialCost.toLocaleString("en-IN")}\n`;
      }
      report += `${t(
        "reports.export.netProfit"
      )}: ₹${fi.netProfit.toLocaleString("en-IN")}\n\n`;
    }

    // PAYMENT INFO
    report += `💰 ${t("reports.export.paymentInformation").toUpperCase()}\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `${t("reports.export.totalPayments")}: ${paymentCount}\n`;
    report += `${t("reports.export.totalPaid")}: ₹${totalPaid.toLocaleString(
      "en-IN"
    )}\n`;

    if (statistics.lastPayment) {
      const lp = statistics.lastPayment;
      report += `\n${t("reports.export.lastPaymentDetails")}:\n`;
      report += `  ${t("payment.amount")}: ₹${lp.amount.toLocaleString(
        "en-IN"
      )}\n`;
      report += `  ${t("common.date")}: ${new Date(
        lp.paymentDate
      ).toLocaleDateString("en-IN")}\n`;
      report += `  ${t("payment.paymentMethod")}: ${lp.paymentMethod}\n`;
      report += `  ${t("reports.export.type")}: ${lp.paymentType}\n`;
      report += `  ${t("payment.paidBy")}: ${lp.paidBy}\n`;
      if (lp.note) report += `  ${t("payment.note")}: ${lp.note}\n`;
    } else {
      report += `${t("reports.export.noPaymentRecords")}\n`;
    }

    report += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `${t("reports.export.generatedBy")}\n`;

    return report;
  };

  /**
   * HTML / PDF EXPORT
   */
  const formatReportHTML = (
    statistics: ReportStatistics,
    dateRange: any
  ): string => {
    const category = statistics.workTypeBreakdown?.[0];
    const detailed = statistics.detailedCategorySummary;

    const totalEntries = statistics.totalEntries ?? 0;
    const totalEarnings = statistics.totalEarnings ?? 0;
    const totalPaid = statistics.totalPaid ?? 0;
    const remainingBalance = statistics.pendingBalance ?? 0;
    const paymentCount = statistics.paymentCount ?? 0;

    let avgEarningPerEntry = 0;
    if (detailed?.overview?.avgEarningPerEntry != null) {
      avgEarningPerEntry = detailed.overview.avgEarningPerEntry;
    } else if (totalEntries > 0) {
      avgEarningPerEntry = totalEarnings / totalEntries;
    }

    // CATEGORY DETAILS HTML
    let categoryDetailsHTML = "";
    if (category) {
      let totalsHTML = "";
      if (category.totals) {
        Object.entries(category.totals).forEach(([key, value]) => {
          const label = key.replace(/([A-Z])/g, " $1").trim();
          const capitalizedLabel =
            label.charAt(0).toUpperCase() + label.slice(1);
          totalsHTML += `<p><strong>${capitalizedLabel}:</strong> ${
            typeof value === "number" ? value.toFixed(2) : value
          }</p>`;
        });
      }

      categoryDetailsHTML = `
        <div class="section">
          <div class="section-title">💼 ${t(
            "reports.export.categoryDetails"
          )}</div>
          <div class="category-card">
            <h3>${category.icon || ""} ${category.categoryName}</h3>
            <div class="category-stats">
              <p><strong>${t("reports.statistics.totalEntries")}:</strong> ${
        category.entryCount
      }</p>
              <p><strong>${t(
                "reports.financial.totalEarnings"
              )}:</strong> ₹${category.totalEarnings.toLocaleString(
        "en-IN"
      )}</p>
              ${totalsHTML}
            </div>
          </div>
        </div>
      `;
    }

    // WORK TYPE BREAKDOWN HTML
    let workTypeHTML = "";
    if (detailed?.workTypeBreakdown?.length) {
      const workTypeRows = detailed.workTypeBreakdown
        .map(
          (wt: any) => `
        <tr>
          <td>${wt._id}</td>
          <td>${wt.entryCount}</td>
          <td>₹${wt.totalEarnings.toLocaleString("en-IN")}</td>
        </tr>
      `
        )
        .join("");

      workTypeHTML = `
        <div class="section">
          <div class="section-title">🔧 ${t(
            "reports.export.workTypeBreakdown"
          )}</div>
          <table class="work-table">
            <thead>
              <tr>
                <th>${t("work.workType")}</th>
                <th>${t("reports.statistics.entries")}</th>
                <th>${t("reports.financial.totalEarnings")}</th>
              </tr>
            </thead>
            <tbody>${workTypeRows}</tbody>
          </table>
        </div>
      `;
    }

    // FIELD INSIGHTS HTML
    let fieldInsightsHTML = "";
    if (detailed?.fieldInsights) {
      const fi = detailed.fieldInsights;
      fieldInsightsHTML = `
        <div class="section">
          <div class="section-title">📊 ${t(
            "reports.export.fieldInsights"
          )}</div>
          <div class="insights-grid">
            ${
              fi.totalPieces > 0
                ? `<div class="insight-card"><span class="label">${t(
                    "reports.export.totalPieces"
                  )}</span><span class="value">${fi.totalPieces}</span></div>`
                : ""
            }
            ${
              fi.totalHours > 0
                ? `<div class="insight-card"><span class="label">${t(
                    "reports.export.totalHours"
                  )}</span><span class="value">${fi.totalHours.toFixed(
                    2
                  )}</span></div>`
                : ""
            }
            ${
              fi.totalMaterialCost > 0
                ? `<div class="insight-card"><span class="label">${t(
                    "reports.export.materialCost"
                  )}</span><span class="value">₹${fi.totalMaterialCost.toLocaleString(
                    "en-IN"
                  )}</span></div>`
                : ""
            }
            <div class="insight-card"><span class="label">${t(
              "reports.export.netProfit"
            )}</span><span class="value">₹${fi.netProfit.toLocaleString(
        "en-IN"
      )}</span></div>
          </div>
        </div>
      `;
    }

    // PAYMENT INFO HTML
    const lastPaymentHTML = statistics.lastPayment
      ? `
      <div class="payment-details">
        <h4 style="margin-bottom: 15px; color: #2d3748;">${t(
          "reports.export.lastPaymentDetails"
        )}</h4>
        <p><strong>${t(
          "payment.amount"
        )}:</strong> ₹${statistics.lastPayment.amount.toLocaleString(
          "en-IN"
        )}</p>
        <p><strong>${t("common.date")}:</strong> ${new Date(
          statistics.lastPayment.paymentDate
        ).toLocaleDateString("en-IN")}</p>
        <p><strong>${t("payment.paymentMethod")}:</strong> ${
          statistics.lastPayment.paymentMethod
        }</p>
        <p><strong>${t("reports.export.type")}:</strong> ${
          statistics.lastPayment.paymentType
        }</p>
        <p><strong>${t("payment.paidBy")}:</strong> ${
          statistics.lastPayment.paidBy
        }</p>
        ${
          statistics.lastPayment.note
            ? `<p><strong>${t("payment.note")}:</strong> ${
                statistics.lastPayment.note
              }</p>`
            : ""
        }
      </div>
    `
      : `<p style="color: #a0aec0; font-style: italic;">${t(
          "reports.export.noPaymentRecords"
        )}</p>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t("reports.export.workReport")} - ${
      category?.categoryName || "N/A"
    }</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; background: #f8f9fa; color: #333; }
          .header { text-align: center; margin-bottom: 40px; padding: 25px; background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%); border-radius: 15px; color: white; }
          .header h1 { font-size: 32px; margin-bottom: 10px; }
          .header .meta { font-size: 14px; opacity: 0.9; margin-top: 10px; }
          .section { background: white; margin-bottom: 25px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .section-title { background: #6C5CE7; color: white; padding: 15px 20px; font-size: 20px; font-weight: bold; }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 25px; }
          .summary-card { background: linear-gradient(135deg, #f5f7fa 0%, #e3e9f0 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #6C5CE7; }
          .summary-card .label { font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 600; }
          .summary-card .value { font-size: 26px; font-weight: bold; color: #2d3748; }
          .category-card { padding: 25px; }
          .category-card h3 { font-size: 24px; margin-bottom: 20px; color: #2d3748; }
          .category-stats p { margin: 10px 0; font-size: 15px; }
          .category-stats strong { color: #6C5CE7; display: inline-block; min-width: 150px; }
          .work-table { width: 100%; border-collapse: collapse; }
          .work-table th { background: #6C5CE7; color: white; padding: 15px; text-align: left; font-size: 15px; }
          .work-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .work-table tr:nth-child(even) { background: #f7fafc; }
          .work-table tr:hover { background: #edf2f7; }
          .insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; padding: 25px; }
          .insight-card { background: linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%); padding: 20px; border-radius: 10px; text-align: center; border-top: 3px solid #6C5CE7; }
          .insight-card .label { display: block; font-size: 12px; color: #718096; margin-bottom: 10px; font-weight: 600; }
          .insight-card .value { display: block; font-size: 22px; font-weight: bold; color: #2d3748; }
          .payment-info { padding: 25px; }
          .payment-info p { margin: 12px 0; font-size: 15px; }
          .payment-info strong { color: #6C5CE7; display: inline-block; min-width: 150px; }
          .payment-details { background: #f7fafc; padding: 20px; border-radius: 10px; margin-top: 15px; border-left: 4px solid #00D9A3; }
          .footer { margin-top: 50px; text-align: center; color: #a0aec0; font-size: 13px; padding-top: 25px; border-top: 2px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 ${t("reports.export.workReport")}</h1>
          <div class="meta">
            <div><strong>${category?.categoryName || "N/A"}</strong></div>
            <div>${t("reports.export.period")}: ${dateRange.startDate} ${t(
      "reports.export.to"
    )} ${dateRange.endDate}</div>
            <div>${t("reports.export.generated")}: ${new Date().toLocaleString(
      "en-IN"
    )}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📈 ${t("reports.export.summary")}</div>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="label">${t("reports.statistics.totalEntries")}</div>
              <div class="value">${totalEntries}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("reports.financial.totalEarnings")}</div>
              <div class="value">₹${totalEarnings.toLocaleString("en-IN")}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("reports.export.totalPaid")}</div>
              <div class="value">₹${totalPaid.toLocaleString("en-IN")}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("reports.export.remainingBalance")}</div>
              <div class="value">₹${remainingBalance.toLocaleString(
                "en-IN"
              )}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("reports.export.avgPerEntry")}</div>
              <div class="value">₹${avgEarningPerEntry.toFixed(2)}</div>
            </div>
          </div>
        </div>

        ${categoryDetailsHTML}
        ${workTypeHTML}
        ${fieldInsightsHTML}

        <div class="section">
          <div class="section-title">💰 ${t(
            "reports.export.paymentInformation"
          )}</div>
          <div class="payment-info">
            <p><strong>${t(
              "reports.export.totalPayments"
            )}:</strong> ${paymentCount}</p>
            <p><strong>${t(
              "reports.export.totalPaid"
            )}:</strong> ₹${totalPaid.toLocaleString("en-IN")}</p>
            ${lastPaymentHTML}
          </div>
        </div>

        <div class="footer">
          <p>${t(
            "reports.export.generatedBy"
          )} • ${new Date().toLocaleDateString("en-IN")}</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleShare = async (statistics: ReportStatistics, dateRange: any) => {
    try {
      const reportText = formatReportText(statistics, dateRange);
      const result = await Share.share({
        message: reportText,
        title: t("reports.export.workReportTitle"),
      });

      if (result.action === Share.sharedAction) {
        Toast.show({
          type: "success",
          text1: t("reports.export.sharedSuccess"),
          text2: t("reports.export.reportShared"),
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      throw new Error(t("reports.export.shareFailed"));
    }
  };

  const handleCopy = async (statistics: ReportStatistics, dateRange: any) => {
    try {
      const reportText = formatReportText(statistics, dateRange);
      await Clipboard.setStringAsync(reportText);

      Toast.show({
        type: "success",
        text1: t("reports.export.copiedToClipboard"),
        text2: t("reports.export.pasteAnywhere"),
        visibilityTime: 2000,
      });
    } catch (error: any) {
      throw new Error(t("reports.export.copyFailed"));
    }
  };

  const handlePDF = async (statistics: ReportStatistics, dateRange: any) => {
    try {
      const htmlContent = formatReportHTML(statistics, dateRange);
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // 🍎 iOS – unchanged
      if (Platform.OS === "ios") {
        await Sharing.shareAsync(uri);
        Toast.show({
          type: "success",
          text1: t("reports.export.pdfShared"),
          visibilityTime: 2000,
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: t("reports.export.pdfSaved"),
        text2: t("reports.export.savedToGallery"),
        visibilityTime: 3000,
      });

      setTimeout(() => {
        Alert.alert(
          t("reports.export.pdfSavedTitle"),
          t("reports.export.shareQuestion"),
          [
            { text: t("common.no"), style: "cancel" },
            {
              text: t("reports.export.yesShare"),
              onPress: async () => {
                await Sharing.shareAsync(uri, {
                  mimeType: "application/pdf",
                  dialogTitle: t("reports.export.shareWorkReport"),
                });
              },
            },
          ]
        );
      }, 500);
    } catch (error: any) {
      console.error("PDF error:", error);
      throw new Error(t("reports.export.pdfFailed"));
    }
  };

  const handleExport = async (
    statistics: ReportStatistics,
    dateRange: any,
    exportType: any = "share"
  ) => {
    setExporting(true);

    try {
      switch (exportType) {
        case "share":
          await handleShare(statistics, dateRange);
          break;
        case "copy":
          await handleCopy(statistics, dateRange);
          break;
        case "pdf":
          await handlePDF(statistics, dateRange);
          break;
        default:
          await handleShare(statistics, dateRange);
      }
    } catch (error: any) {
      console.error("Export error:", error);
      Toast.show({
        type: "error",
        text1: t("reports.export.exportFailed"),
        text2: error?.message || t("reports.export.unableToExport"),
        visibilityTime: 3000,
      });
    } finally {
      setExporting(false);
    }
  };

  return { exporting, handleExport };
};
