export const categories = [
  {
    id: 51,
    name: 'أفران غاز مدمجة',
    name_ar: 'أفران غاز مدمجة',
    name_en: 'Built-in Gas Ovens',
    slug: 'built-in-ovens',
    image: '/catalog_images/cat_51.jpg',
    is_active: 1,
    products_count: 0,
  },
  {
    id: 52,
    name: 'مسطحات غاز بلت-إن',
    name_ar: 'مسطحات غاز بلت-إن',
    name_en: 'Built-in Gas Hobs',
    slug: 'gas-hobs',
    image: '/catalog_images/cat_52.jpg',
    is_active: 1,
    products_count: 0,
  },
  {
    id: 53,
    name: 'شفاطات مطابخ إيطالية',
    name_ar: 'شفاطات مطابخ إيطالية',
    name_en: 'Kitchen Cooker Hoods',
    slug: 'kitchen-hoods',
    image: '/catalog_images/cat_53.jpg',
    is_active: 1,
    products_count: 0,
  },
  {
    id: 54,
    name: 'سخانات غاز فورية ذكية',
    name_ar: 'سخانات غاز فورية ذكية',
    name_en: 'Smart Gas Water Heaters',
    slug: 'gas-water-heaters',
    image: '/catalog_images/cat_54.jpg',
    is_active: 1,
    products_count: 0,
  },
  {
    id: 55,
    name: 'شوايات غاز فاخرة',
    name_ar: 'شوايات غاز فاخرة',
    name_en: 'Luxury BBQ Gas Grills',
    slug: 'gas-grills',
    image: '/catalog_images/cat_55.jpg',
    is_active: 1,
    products_count: 0,
  },
];

export const offers = [
  {
    id: 2,
    name: 'باقة الطهي الإيطالي المتكامل - خصم 20%',
    name_ar: 'باقة الطهي الإيطالي المتكامل - خصم 20%',
    name_en: 'Master Chef Complete Italian Deal - 20% OFF',
    type: 'percentage',
    value: 20,
    applies_to: 'products',
    selected_products: [7, 8, 9],
    applied_ids: [7, 8, 9],
    image: 'https://backend-mastergas.be-kite.com/public/storage/offers/1789988153_23KOtgZuUw.jpg',
    badge_text_ar: 'خصم 20%',
    badge_text_en: '20% OFF',
    status: 'active',
    is_active: 1,
    start_date: '2026-09-01',
    end_date: '2027-12-31',
  },
  {
    id: 3,
    name: 'منظومة الأمان والسلامة الذكية - خصم 15%',
    name_ar: 'منظومة الأمان والسلامة الذكية - خصم 15%',
    name_en: 'Smart Gas Safety & Protection Pack - 15% OFF',
    type: 'percentage',
    value: 15,
    applies_to: 'products',
    selected_products: [12, 13],
    applied_ids: [12, 13],
    image: 'https://backend-mastergas.be-kite.com/public/storage/offers/1789988154_WhoXLcZxMZ.jpg',
    badge_text_ar: 'أمان متكامل',
    badge_text_en: 'Full Safety',
    status: 'active',
    is_active: 1,
    start_date: '2026-09-01',
    end_date: '2027-12-31',
  },
  {
    id: 4,
    name: 'سخانات المياه الفورية الذكية - خصم 10%',
    name_ar: 'سخانات المياه الفورية الذكية - خصم 10%',
    name_en: 'Smart Instant Water Heaters - 10% OFF',
    type: 'percentage',
    value: 10,
    applies_to: 'products',
    selected_products: [10],
    applied_ids: [10],
    image: 'https://backend-mastergas.be-kite.com/public/storage/offers/1789988154_xzdxKih38h.jpg',
    badge_text_ar: 'توفير طاقة',
    badge_text_en: 'Eco Smart',
    status: 'active',
    is_active: 1,
    start_date: '2026-09-01',
    end_date: '2027-12-31',
  },
  {
    id: 5,
    name: 'عروض شوايات الحدائق والمزارع - خصم 25%',
    name_ar: 'عروض شوايات الحدائق والمزارع - خصم 25%',
    name_en: 'Luxury Outdoor BBQ & Patio Grills - 25% OFF',
    type: 'percentage',
    value: 25,
    applies_to: 'products',
    selected_products: [11, 14],
    applied_ids: [11, 14],
    image: 'https://backend-mastergas.be-kite.com/public/storage/offers/1789988155_48bLR9OHwN.jpg',
    badge_text_ar: 'خصم 25%',
    badge_text_en: '25% OFF',
    status: 'active',
    is_active: 1,
    start_date: '2026-09-01',
    end_date: '2027-12-31',
  },
];

// Static last-known catalog used only when the public API is unavailable. These
// are real catalog records (also exported to the product feed), not placeholder
// cards, and the API response always takes precedence when it is reachable.
export const products = [
  { id: 7, name: 'Mastergas Royal 90cm Italian Built-in Gas Oven', name_ar: 'فرن غاز ماسترجاز رويال 90 سم', name_en: 'Mastergas Royal 90cm Italian Built-in Gas Oven', category_id: 51, price: 3499, stock: 8, origin: 'Italy', is_new: true, image: 'https://backend-mastergas.be-kite.com/public/storage/products/1789986682_Jjr333mDun.jpg' },
  { id: 8, name: 'Mastergas 90cm 5-Burner Built-in Gas Hob', name_ar: 'مسطح غاز بلت إن 90 سم بخمس شعلات', name_en: 'Mastergas 90cm 5-Burner Built-in Gas Hob', category_id: 52, price: 2199, stock: 12, origin: 'Italy', is_new: true, image: 'https://backend-mastergas.be-kite.com/public/storage/products/1789987076_hfQU3CdP7g.jpg' },
  { id: 9, name: 'Mastergas Luxury 90cm Pyramid Chimney Hood', name_ar: 'شفاط هرمي فاخر 90 سم', name_en: 'Mastergas Luxury 90cm Pyramid Chimney Hood', category_id: 53, price: 1650, stock: 6, origin: 'Italy', is_new: true, image: 'https://backend-mastergas.be-kite.com/public/storage/products/1789987078_yPA8v1S6cs.jpg' },
  { id: 10, name: 'Mastergas Smart 12L Digital Instant Gas Water Heater', name_ar: 'سخان مياه غاز فوري ذكي 12 لتر', name_en: 'Mastergas Smart 12L Digital Instant Gas Water Heater', category_id: 54, price: 1280, stock: 10, origin: 'Italy', is_new: true, image: 'https://backend-mastergas.be-kite.com/public/storage/products/1789987080_VwMS2HmODZ.jpg' },
  { id: 11, name: 'Mastergas Professional 4-Burner Outdoor Gas BBQ Grill', name_ar: 'شواية غاز خارجية احترافية بأربع شعلات', name_en: 'Mastergas Professional 4-Burner Outdoor Gas BBQ Grill', category_id: 55, price: 4250, stock: 4, origin: 'Italy', is_new: true, image: 'https://backend-mastergas.be-kite.com/public/storage/products/1789987082_ez2JKBtkfU.jpg' },
  { id: 12, name: 'Mastergas Smart Gas Leak Detector with Auto Shutoff', name_ar: 'كاشف تسرب غاز ذكي مع صمام إغلاق تلقائي', name_en: 'Mastergas Smart Gas Leak Detector with Auto Shutoff', category_id: 54, price: 385, stock: 15, origin: 'Italy', is_new: true, image: 'https://backend-mastergas.be-kite.com/public/storage/products/1789987083_cyPLbgYvbI.jpg' },
  { id: 13, name: 'Mastergas Certified Italian Gas Regulator', name_ar: 'منظم غاز إيطالي معتمد بمقياس ضغط', name_en: 'Mastergas Certified Italian Gas Regulator', category_id: 54, price: 185, stock: 20, origin: 'Italy', is_new: true, image: 'https://backend-mastergas.be-kite.com/public/storage/products/1789987084_Z3oUpzEDcP.jpg' },
  { id: 14, name: 'Mastergas Ultra-Light Composite LPG Gas Cylinder', name_ar: 'أسطوانة غاز مركبة خفيفة 24.5 لتر', name_en: 'Mastergas Ultra-Light Composite LPG Gas Cylinder', category_id: 55, price: 449, stock: 9, origin: 'Italy', is_new: true, image: 'https://backend-mastergas.be-kite.com/public/storage/products/1789987086_ihhAa9wvXu.jpg' },
];

export function getProductById(id) {
  const numericId = Number(id);
  return products.find(p => p.id === numericId) || null;
}

export function getProductsByCategory(categoryId) {
  const numericId = Number(categoryId);
  return products.filter(p => p.category_id === numericId);
}

export function getCategories() {
  return categories;
}

export function getOffers() {
  return offers;
}
