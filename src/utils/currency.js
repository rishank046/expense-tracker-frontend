export const CURRENCY_SYMBOL = '₹';

export const formatCurrency = (amount, options = {}) => {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  });
  return `${CURRENCY_SYMBOL}${formatted}`;
};
