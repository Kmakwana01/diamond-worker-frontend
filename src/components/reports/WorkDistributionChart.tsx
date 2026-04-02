// src/components/reports/WorkDistributionChart.tsx
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/workTheme';
import { formatCurrency } from '../../utils/workHelpers';

const { width } = Dimensions.get('window');

interface WorkTypeItem {
  _id: string;
  entryCount: number;
  totalEarnings: number;
}

interface WorkDistributionChartProps {
  workTypeBreakdown: WorkTypeItem[];
}

// Color palette for different work types
const WORK_TYPE_COLORS = [
  '#6C5CE7', // Purple
  '#00D9A3', // Green
  '#FFB800', // Yellow
  '#FF6B6B', // Red
  '#74B9FF', // Blue
  '#A29BFE', // Light Purple
  '#FD79A8', // Pink
  '#FDCB6E', // Orange
];

// Icons for work types
const WORK_TYPE_ICONS: Record<string, string> = {
  'Cutting': '✂️',
  'Polishing': '💎',
  'Repair': '🔧',
  'Assembly': '🔨',
  'Custom': '⚙️',
  'Furniture': '🪑',
  'Maintenance': '🛠️',
  'Emergency': '🚨',
  'Other': '📦',
};

const CHART_CONFIG = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: theme.colors.surface,
  backgroundGradientTo: theme.colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
  style: {
    borderRadius: theme.radii.lg,
  },
};

const WorkDistributionChart: React.FC<WorkDistributionChartProps> = ({ workTypeBreakdown }) => {
  const { t } = useTranslation();

  if (!workTypeBreakdown || workTypeBreakdown.length === 0) {
    return null;
  }

  // Transform work type data for chart
  const chartData = workTypeBreakdown.map((item, index) => ({
    name: item._id,
    population: item.totalEarnings,
    color: WORK_TYPE_COLORS[index % WORK_TYPE_COLORS.length],
    legendFontColor: theme.colors.text,
    legendFontSize: 12,
  }));

  // Calculate total earnings for percentage
  const totalEarnings = workTypeBreakdown.reduce((sum, item) => sum + item.totalEarnings, 0);

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>📊 {t('reports.workDistribution.title', 'Work Type Distribution')}</Text>
          <Text style={styles.chartSubtitle}>{t('reports.workDistribution.subtitle', 'Breakdown by work type')}</Text>
        </View>
        <TouchableOpacity style={styles.chartInfoButton}>
          <Icon name="information-outline" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <PieChart
        data={chartData}
        width={width - 60}
        height={220}
        chartConfig={CHART_CONFIG}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={styles.chart}
      />

      {/* Legend */}
      <View style={styles.legendContainer}>
        {workTypeBreakdown.map((item, index) => {
          const percentage = ((item.totalEarnings / totalEarnings) * 100).toFixed(1);
          const icon = WORK_TYPE_ICONS[item._id] || '📋';
          const color = WORK_TYPE_COLORS[index % WORK_TYPE_COLORS.length];

          return (
            <View key={item._id} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: color },
                  ]}
                />
                <View style={styles.legendTextContainer}>
                  <Text style={styles.legendText}>
                    {icon} {item._id}
                  </Text>
                  <Text style={styles.legendSubText}>
                    {item.entryCount} {item.entryCount === 1 ? t('reports.workDistribution.entry', 'entry') : t('reports.workDistribution.entries', 'entries')} • {percentage}%
                  </Text>
                </View>
              </View>
              <Text style={styles.legendValue}>{formatCurrency(item.totalEarnings)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  chartInfoButton: {
    padding: theme.spacing.xs,
  },
  chart: {
    borderRadius: theme.radii.md,
    marginVertical: theme.spacing.sm,
  },
  legendContainer: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  legendSubText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '700',
  },
});

export default memo(WorkDistributionChart);
