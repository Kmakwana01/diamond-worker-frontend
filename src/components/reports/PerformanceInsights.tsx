import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/workTheme';
import { formatCurrency, formatDate } from '../../utils/workHelpers';
import { LastPayment } from '../../types/report';


interface PerformanceInsightsProps {
  bestWorkType: string;
  bestWorkPieces: number;
  totalPaid: number;
  pendingBalance: number;
  lastPayment: LastPayment | null;
  paymentCount: number;
}


interface InsightItemProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  note?: string;
}


const InsightItem: React.FC<InsightItemProps> = ({ icon, iconColor, label, value, note }) => (
  <View style={styles.insightItem}>
    <View style={styles.insightIconContainer}>
      <Icon name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.insightContent}>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={styles.insightValue}>{value}</Text>
      {note && <Text style={styles.insightNote}>{note}</Text>}
    </View>
  </View>
);


const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({
  bestWorkType,
  bestWorkPieces,
  totalPaid,
  pendingBalance,
  lastPayment,
  paymentCount,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.insightsCard}>
      <Text style={styles.insightsTitle}>{t('reports.performance.title')}</Text>


      <InsightItem
        icon="trending-up"
        iconColor={theme.colors.success}
        label={t('reports.performance.bestWorkLabel')}
        value={`${bestWorkType} - ${bestWorkPieces} ${t('reports.performance.pieces')}`}
      />


      <InsightItem
        icon="cash-multiple"
        iconColor={theme.colors.warning}
        label={t('reports.performance.totalPaidLabel')}
        value={formatCurrency(totalPaid)}
      />


      <InsightItem
        icon="wallet-outline"
        iconColor={theme.colors.info}
        label={t('reports.performance.pendingBalanceLabel')}
        value={formatCurrency(pendingBalance)}
      />


      {lastPayment && (
        <InsightItem
          icon="clock-outline"
          iconColor={theme.colors.primary}
          label={t('reports.performance.lastPaymentLabel')}
          value={`${formatCurrency(lastPayment.amount)} • ${formatDate(lastPayment.paymentDate)}`}
          note={lastPayment.note}
        />
      )}


      <InsightItem
        icon="receipt"
        iconColor={theme.colors.secondary}
        label={t('reports.performance.totalTransactionsLabel')}
        value={`${paymentCount} ${t('reports.performance.payments')}`}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  insightsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  insightIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '700',
  },
  insightNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
});


export default memo(PerformanceInsights);
