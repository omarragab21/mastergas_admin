import { computed } from 'vue';

export function useCartSummary({ items, getItemPrice, getSetting, discountAmount, translate }) {
  const readNumericSetting = (key, fallback) => {
    const value = getSetting(key);
    return value !== null && value !== undefined && value !== ''
      ? (parseFloat(value) || 0)
      : fallback;
  };

  const taxRate = computed(() => readNumericSetting('tax_rate', 15));
  const shippingCost = computed(() => readNumericSetting('shipping_cost', 0));
  const freeDeliveryThreshold = computed(() => readNumericSetting('free_delivery_threshold', 0));

  const subtotalWithDiscount = computed(() => (
    items.reduce((sum, item) => sum + getItemPrice(item), 0)
  ));

  const shippingAmount = computed(() => {
    if (subtotalWithDiscount.value <= 0) return 0;
    if (freeDeliveryThreshold.value > 0 && subtotalWithDiscount.value >= freeDeliveryThreshold.value) return 0;
    return shippingCost.value;
  });

  const taxAmount = computed(() => {
    const taxableBase = Math.max(0, subtotalWithDiscount.value - discountAmount.value);
    return Math.round(taxableBase * (taxRate.value / 100) * 100) / 100;
  });

  const grandTotal = computed(() => {
    const base = Math.max(0, subtotalWithDiscount.value - discountAmount.value);
    return Math.round((base + taxAmount.value + shippingAmount.value) * 100) / 100;
  });

  const vatLabelText = computed(() => {
    if (taxRate.value > 0) {
      return translate(
        'checkout.vat_label',
        `ضريبة القيمة المضافة (${taxRate.value}٪)`,
        { rate: taxRate.value },
      );
    }
    return translate('checkout.vat_title', 'ضريبة القيمة المضافة');
  });

  return {
    taxRate,
    shippingCost,
    freeDeliveryThreshold,
    subtotalWithDiscount,
    shippingAmount,
    taxAmount,
    grandTotal,
    vatLabelText,
  };
}
