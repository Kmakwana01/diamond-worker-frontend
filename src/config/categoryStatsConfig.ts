export const CATEGORY_STATS_CONFIG = {
  DIAMOND: {
    quantityField: 'pieceCount',
    quantityLabel: 'Pieces',
    rateField: 'ratePerPiece',
    rateLabel: 'Rate/Piece',
    icon: 'diamond-stone',
    color: '#3B82F6',
    fields: {
      workType: {
        type: 'select',
        labelKey: 'work.fields.workType',
        shortPlaceholderKey: 'work.short.type',
        options: ['Cutting', 'Polishing', 'Other'],
        required: true,
      },
      pieceCount: {
        type: 'number',
        labelKey: 'work.fields.pieces',
        placeholderKey: 'work.placeholders.pieces',
        shortPlaceholderKey: 'work.short.pieces',
        required: true,
      },
      ratePerPiece: {
        type: 'decimal',
        labelKey: 'work.fields.ratePerPiece',
        placeholderKey: 'work.placeholders.rate',
        shortPlaceholderKey: 'work.short.rate',
        required: true,
      },
    },
  },

  CARPENTER: {
    quantityField: 'itemsProduced',
    quantityLabel: 'Items',
    rateField: 'ratePerItem',
    rateLabel: 'Rate/Item',
    icon: 'hammer-screwdriver',
    color: '#F59E0B',
    fields: {
      workType: {
        type: 'select',
        labelKey: 'work.fields.workType',
        shortPlaceholderKey: 'work.short.type',
        options: ['Furniture', 'Repair', 'Custom', 'Assembly'],
        required: true,
      },
      itemsProduced: {
        type: 'number',
        labelKey: 'work.fields.itemsProduced',
        placeholderKey: 'work.placeholders.items',
        shortPlaceholderKey: 'work.short.items',
        required: true,
      },
      ratePerItem: {
        type: 'decimal',
        labelKey: 'work.fields.ratePerItem',
        placeholderKey: 'work.placeholders.rate',
        shortPlaceholderKey: 'work.short.rate',
        required: true,
      },
    },
  },

  PLUMBER: {
    quantityField: 'ratePerJob',
    quantityLabel: 'Total Earnings',
    rateField: 'ratePerJob',
    rateLabel: 'Rate/Job',
    icon: 'pipe-wrench',
    color: '#10B981',
    fields: {
      serviceType: {
        type: 'select',
        labelKey: 'work.fields.serviceType',
        shortPlaceholderKey: 'work.short.service',
        options: [
          'Repair',
          'Maintenance',
          'Emergency',
          'PipelineWork',
          'BathroomFitting',
          'MotorWork',
        ],
        required: true,
      },
      ratePerJob: {
        type: 'decimal',
        labelKey: 'work.fields.ratePerJob',
        placeholderKey: 'work.placeholders.rate',
        shortPlaceholderKey: 'work.short.rate',
        required: true,
      },
      materialCost: {
        type: 'decimal',
        labelKey: 'work.fields.materialCost',
        placeholderKey: 'work.placeholders.material',
        shortPlaceholderKey: 'work.short.material',
        required: false,
        default: 0,
      },
    },
  },

  MASON: {
    quantityField: 'materialCost',
    quantityLabel: 'Material Cost',
    rateField: 'dayWage',
    rateLabel: 'Day Wage',
    icon: 'wall',
    color: '#EF4444',
    fields: {
      workType: {
        type: 'select',
        labelKey: 'work.fields.workType',
        shortPlaceholderKey: 'work.short.type',
        options: ['Mason', 'Helper', 'Contractor'],
        required: true,
      },
      dayWage: {
        type: 'decimal',
        labelKey: 'work.fields.dayWage',
        placeholderKey: 'work.placeholders.wage',
        shortPlaceholderKey: 'work.short.wage',
        required: true,
      },
      materialCost: {
        type: 'decimal',
        labelKey: 'work.fields.materialCost',
        placeholderKey: 'work.placeholders.material',
        shortPlaceholderKey: 'work.short.material',
        required: false,
        default: 0,
      },
    },
  },
} as const;



export type CategoryId = keyof typeof CATEGORY_STATS_CONFIG;

export const getCategoryStatsConfig = (categoryId: string | null | undefined) => {
  if (!categoryId) {
    console.warn('No category ID provided, using DIAMOND as default');
    return CATEGORY_STATS_CONFIG.DIAMOND;
  }

  const upperCaseId = categoryId.toUpperCase() as CategoryId;
  const config = CATEGORY_STATS_CONFIG[upperCaseId];

  if (!config) {
    console.warn(`Unknown category ${categoryId}, using DIAMOND as default`);
    return CATEGORY_STATS_CONFIG.DIAMOND;
  }

  return config;
};
