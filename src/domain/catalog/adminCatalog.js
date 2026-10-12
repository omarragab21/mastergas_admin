const firstText = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? '';

const localized = (translations, key, fallback = '') => firstText(
  translations?.ar?.[key],
  translations?.en?.[key],
  fallback,
);

// The API returns long-text fields either as arrays of lines or as plain strings.
export const toLines = (value) => (Array.isArray(value) ? value : String(value ?? '').split('\n')).map((line) => String(line));

// A product's `category` is a mapped object after toProduct(); views need a display name.
export const categoryName = (category) => (category && typeof category === 'object' ? (category.name_i18n?.ar || category.name) : category);

const unwrap = (payload) => payload?.data ?? payload;

export const toCategory = (raw = {}) => {
  const item = { ...raw };
  const translations = raw.translations || {};
  const nameAr = firstText(translations.ar?.name, raw.name_ar, raw.name);
  const nameEn = firstText(translations.en?.name, raw.name_en, raw.name);
  const descriptionAr = firstText(translations.ar?.description, raw.description_ar, raw.description);
  const descriptionEn = firstText(translations.en?.description, raw.description_en, raw.description);
  const parent = raw.parent ? toCategory(raw.parent) : null;

  return {
    ...item,
    name: firstText(raw.name, nameAr, nameEn),
    name_i18n: { ar: nameAr, en: nameEn },
    description_i18n: { ar: descriptionAr, en: descriptionEn },
    image: firstText(raw.image_url, raw.image),
    products_count: Number(raw.products_count ?? raw.productsCount ?? 0),
    is_active: raw.is_active !== false && raw.is_active !== 0,
    parent,
    sub_categories: Array.isArray(raw.sub_categories) ? raw.sub_categories.map(toCategory) : [],
  };
};

export const toProduct = (raw = {}) => {
  const translations = raw.translations || {};
  const category = raw.category && typeof raw.category === 'object'
    ? toCategory(raw.category)
    : raw.category;
  const nameAr = firstText(translations.ar?.name, raw.name_ar, raw.name);
  const nameEn = firstText(translations.en?.name, raw.name_en, raw.name);
  const descriptionAr = localized(translations, 'product_description', raw.description_ar ?? raw.description);
  const descriptionEn = firstText(translations.en?.product_description, raw.description_en, raw.description);
  const featuresAr = firstText(translations.ar?.key_features, raw.features_ar, raw.features);
  const featuresEn = firstText(translations.en?.key_features, raw.features_en, raw.features);
  const tipsAr = firstText(translations.ar?.tips, raw.tips_ar, raw.tips);
  const tipsEn = firstText(translations.en?.tips, raw.tips_en, raw.tips);
  const shippingAr = firstText(translations.ar?.shipping_info, raw.shipping_info_ar, raw.shipping_info);
  const shippingEn = firstText(translations.en?.shipping_info, raw.shipping_info_en, raw.shipping_info);

  return {
    ...raw,
    name: firstText(raw.name, nameAr, nameEn),
    name_i18n: { ar: nameAr, en: nameEn },
    description_i18n: { ar: descriptionAr, en: descriptionEn },
    features_i18n: { ar: featuresAr, en: featuresEn },
    tips_i18n: { ar: tipsAr, en: tipsEn },
    shipping_info_i18n: { ar: shippingAr, en: shippingEn },
    category,
    category_id: raw.category_id ?? category?.id,
    stock: raw.number ?? raw.quantity ?? raw.stock,
    quantity: raw.number ?? raw.quantity ?? raw.stock,
    status: raw.is_active === false || raw.is_active === 0 ? 'inactive' : 'active',
    discount: raw.discount_percentage ?? raw.discount ?? 0,
    images: Array.isArray(raw.images)
      ? raw.images.map((image) => typeof image === 'string' ? image : (image.image_url || image.url || image.image)).filter(Boolean)
      : [],
  };
};

export const toAttribute = (raw = {}) => {
  const translations = raw.translations || {};
  const name = firstText(raw.name, translations.en?.name, translations.ar?.name);
  const label = firstText(raw.label, translations.ar?.name, translations.en?.name, name);
  // An explicit backend type always wins; the name heuristic only applies to legacy payloads without a type.
  const isColor = raw.type === 'color' || raw.type === 'color_swatch'
    || (!raw.type && /color|لون|ألوان|الوان/i.test(`${name} ${label}`));
  const options = Array.isArray(raw.options)
    ? raw.options
    : (Array.isArray(raw.values) ? raw.values : (Array.isArray(raw.values_list) ? raw.values_list : []));

  return {
    ...raw,
    name,
    label,
    type: isColor ? 'color' : (raw.type || 'select'),
    is_active: raw.is_active !== false && raw.is_active !== 0,
    values: options.map((option, index) => {
      const optionTranslations = option?.translations || {};
      const optionName = typeof option === 'string'
        ? option.split('|')[0].trim()
        : firstText(option.name, option.label, optionTranslations.ar?.name, optionTranslations.en?.name);
      const valueCode = typeof option === 'string' ? option.split('|')[1] : option?.value_code;
      return {
        ...(typeof option === 'object' ? option : {}),
        id: option?.id ?? `${optionName}-${index}`,
        label: optionName,
        name: optionName,
        color: valueCode || option?.color || option?.hex || null,
        is_active: option?.is_active !== false && option?.is_active !== 0,
      };
    }).filter((option) => option.label),
  };
};

const statusForDiscount = (raw) => {
  if (raw.is_active === false || raw.is_active === 0) return 'paused';
  const now = Date.now();
  const start = raw.start_date ? Date.parse(raw.start_date) : NaN;
  const end = raw.end_date ? Date.parse(raw.end_date) : NaN;
  if (Number.isFinite(start) && now < start) return 'scheduled';
  if (Number.isFinite(end) && now > end) return 'expired';
  return 'active';
};

export const toDiscountCode = (raw = {}) => {
  const translations = raw.translations || {};
  return {
    ...raw,
    name_i18n: {
      ar: firstText(translations.ar?.name, raw.name_ar, raw.name),
      en: firstText(translations.en?.name, raw.name_en, raw.name),
    },
    description_i18n: {
      ar: firstText(translations.ar?.description, raw.description_ar, raw.description),
      en: firstText(translations.en?.description, raw.description_en, raw.description),
    },
    status: statusForDiscount(raw),
    total_uses: Number(raw.total_uses ?? 0),
    max_uses: raw.max_uses ?? null,
    usage_percentage: Number(raw.usage_percentage ?? 0),
    is_active: raw.is_active !== false && raw.is_active !== 0,
    selected_categories: raw.selected_categories || [],
    selected_products: raw.selected_products || [],
  };
};

export const listFromResponse = (payload) => {
  const body = unwrap(payload);
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
};

export const dataFromResponse = (payload) => unwrap(payload);

export const toCategoryPayload = (form) => ({
  name_en: String(form.name_en || '').trim(),
  name_ar: String(form.name_ar || '').trim(),
  description_en: String(form.description_en || '').trim(),
  description_ar: String(form.description_ar || '').trim(),
  parent_id: form.parent_id || undefined,
  is_active: form.is_active === false ? 0 : 1,
  sort_order: Number(form.sort_order || 0),
});

export const toProductPayload = (form) => ({
  name_en: String(form.name_en || '').trim(),
  name_ar: String(form.name_ar || '').trim(),
  category_id: form.subcategory_id || form.category_id || '',
  price: form.price,
  number: form.quantity,
  is_active: form.is_active === false ? 0 : 1,
  discount_percentage: form.discount === '' || form.discount === null || form.discount === undefined ? 1 : form.discount,
  product_description_en: String(form.description_en || '').split('\n').filter(Boolean),
  product_description_ar: String(form.description_ar || '').split('\n').filter(Boolean),
  key_features_en: String(form.features_en || '').split('\n').filter(Boolean),
  key_features_ar: String(form.features_ar || '').split('\n').filter(Boolean),
  tips_en: String(form.tips_en || '').split('\n').filter(Boolean),
  tips_ar: String(form.tips_ar || '').split('\n').filter(Boolean),
  shipping_info_en: String(form.shipping_info_en || '').split('\n').filter(Boolean),
  shipping_info_ar: String(form.shipping_info_ar || '').split('\n').filter(Boolean),
});

// Blank / missing optional numbers must reach the API as null, never NaN.
const optionalNumber = (value) => (value === '' || value === null || value === undefined || Number.isNaN(Number(value)) ? null : Number(value));

export const toDiscountPayload = (form) => ({
  code: String(form.code || '').trim(),
  type: form.type || 'percentage',
  value: Number(form.value || 0),
  minimum_amount: optionalNumber(form.min_order_value ?? form.minimum_amount),
  max_discount: optionalNumber(form.max_discount),
  start_date: form.start_date ? `${form.start_date} 00:00:00` : null,
  end_date: form.no_end_date || !form.end_date ? null : `${form.end_date} 23:59:59`,
  is_active: Boolean(form.is_active),
  is_public: true,
  name_en: String(form.name_en || '').trim(),
  name_ar: String(form.name_ar || '').trim(),
  description_en: String(form.description_en || '').trim(),
  description_ar: String(form.description_ar || '').trim(),
});

export const toAttributePayload = (form) => ({
  type: form.type === 'color' ? 'color_swatch' : (form.type || 'select'),
  name_en: String(form.name_en || '').trim(),
  name_ar: String(form.name_ar || '').trim(),
  options: String(form.values_list || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      const [name, valueCode] = value.split('|', 2);
      return { name_en: name.trim(), name_ar: name.trim(), value_code: valueCode?.trim() || null };
    }),
});

// Editing an attribute renames it / changes its type; its options are managed separately (never replaced here).
export const toAttributeUpdatePayload = (form) => {
  const { options, ...rest } = toAttributePayload(form);
  return rest;
};

export const toAttributeOptionPayload = (form) => ({
  name_en: String(form.label || '').trim(),
  name_ar: String(form.label || '').trim(),
  value_code: form.color || null,
});
