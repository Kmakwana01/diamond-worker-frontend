// src/components/reports/EarningsTrendChart.tsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/workTheme';

const { width } = Dimensions.get('window');

interface DailyTimelineItem {
  _id: string;
  totalEarnings: number;
  entryCount: number;
}

interface EarningsTrendChartProps {
  data: DailyTimelineItem[];
  dateRange: { startDate: string; endDate: string };
}

const EarningsTrendChart: React.FC<EarningsTrendChartProps> = ({ data, dateRange }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) return null;

  // Sort by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a._id).getTime() - new Date(b._id).getTime()
  );

  // Prepare chart data
  const labels = sortedData.map(item => {
    const date = new Date(item._id);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const earnings = sortedData.map(item => item.totalEarnings);

  const chartData = {
    labels: labels.length > 7 
      ? labels.filter((_, i) => i % Math.ceil(labels.length / 7) === 0)
      : labels,
    datasets: [
      {
        data: earnings,
        color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: theme.radii.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#6C5CE7',
    },
  };

  // Calculate trend
  const firstHalf = earnings.slice(0, Math.floor(earnings.length / 2));
  const secondHalf = earnings.slice(Math.floor(earnings.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trend = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'stable';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('reports.earningsTrend.title')}</Text>
          <Text style={styles.subtitle}>{t('reports.earningsTrend.subtitle')}</Text>
        </View>
        <View style={[styles.trendBadge, { 
          backgroundColor: trend === 'up' ? 'rgba(0, 217, 163, 0.15)' : 
                          trend === 'down' ? 'rgba(255, 107, 107, 0.15)' : 
                          'rgba(158, 158, 158, 0.15)' 
        }]}>
          <Icon 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'minus'} 
            size={16} 
            color={trend === 'up' ? '#00D9A3' : trend === 'down' ? '#FF6B6B' : '#9E9E9E'} 
          />
          <Text style={[styles.trendText, { 
            color: trend === 'up' ? '#00D9A3' : trend === 'down' ? '#FF6B6B' : '#9E9E9E' 
          }]}>
            {trend === 'up' ? t('reports.earningsTrend.growing') : trend === 'down' ? t('reports.earningsTrend.declining') : t('reports.earningsTrend.stable')}
          </Text>
        </View>
      </View>

      <LineChart
        data={chartData}
        width={width - 60}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        withDots={true}
        withShadow={false}
        fromZero
      />

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('reports.earningsTrend.highest')}</Text>
          <Text style={styles.statValue}>
            ₹{Math.max(...earnings).toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('reports.earningsTrend.average')}</Text>
          <Text style={styles.statValue}>
            ₹{(earnings.reduce((a, b) => a + b, 0) / earnings.length).toFixed(0)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('reports.earningsTrend.lowest')}</Text>
          <Text style={styles.statValue}>
            ₹{Math.min(...earnings).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chart: {
    borderRadius: theme.radii.md,
    marginVertical: theme.spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});

export default memo(EarningsTrendChart);
