export const formatCurrency = (amount: number): string => {
  return `₹${amount?.toLocaleString('en-IN') || 0}`;
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

export const getWorkTypeColor = (type: string): [string, string] => {
  const colors: Record<string, [string, string]> = {
    cutting: ['#FF6B6B', '#EE5A6F'],
    polishing: ['#6C5CE7', '#A29BFE'],
    default: ['#A29BFE', '#6C5CE7'],
  };
  return colors[type.toLowerCase()] || colors.default;
};

export const getWorkTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    cutting: 'content-cut',
    polishing: 'diamond-stone',
    default: 'briefcase',
  };
  return icons[type.toLowerCase()] || icons.default;
};
