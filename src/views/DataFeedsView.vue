<template>
  <div class="data-feeds-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-titles">
        <h2 class="page-title">تغذية الكتالوج والإعلانات (Product Data Feeds)</h2>
        <p class="page-subtitle">ربط منتجات المتجر تلقائياً أو تنزيل ملفات الكتالوج لـ Meta (Facebook) و Google Shopping و TikTok Ads</p>
      </div>
    </div>

    <!-- Explanatory Banner -->
    <div class="banner-card">
      <div class="banner-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </div>
      <div class="banner-content">
        <h4 class="banner-title">طريقتان لتغذية الإعلانات بالمنتجات (Catalog Campaigns):</h4>
        <div class="banner-methods">
          <div class="method-item">
            <span class="method-badge">1. رابط التغذية المباشر (Live Feed Link)</span>
            <p>تضع الرابط في منصة الإعلانات (Meta Commerce Manager / Google Merchant) ويتم سحب وتحديث المنتجات تلقائياً يومياً بدون تدخل يدوي.</p>
          </div>
          <div class="method-item">
            <span class="method-badge">2. تنزيل الملف ورفعه يدوياً (Direct File Upload)</span>
            <p>يمكنك تحميل ملف الـ CSV أو XML مباشرة على جهازك ثم رفعه يدويًا فوراً في منصة الإعلانات.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration & Filters -->
    <div class="config-card">
      <h3 class="section-title">إعدادات وتصفية الكتالوج</h3>
      <div class="config-grid">
        <div class="form-group">
          <label class="form-label">رابط الموقع الإلكتروني (Store Domain URL)</label>
          <input type="text" v-model="storeUrl" placeholder="https://yourstore.com" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">العملة (Currency)</label>
          <select v-model="currency" class="form-select">
            <option value="JOD">JOD (دينار أردني)</option>
            <option value="USD">USD (دولار أمريكي)</option>
            <option value="SAR">SAR (ريال سعودي)</option>
            <option value="AED">AED (درهم إماراتي)</option>
            <option value="EGP">EGP (جنيه مصري)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">تصفية حسب القسم (Category)</label>
          <select v-model="selectedCategory" class="form-select">
            <option value="">جميع الأقسام</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">حالة التوفر (Stock Filter)</label>
          <select v-model="stockFilter" class="form-select">
            <option value="all">جميع المنتجات</option>
            <option value="in_stock">المنتجات المتوفرة فقط (In Stock)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Feeds Cards Grid -->
    <div class="feeds-grid">
      <!-- Meta / Facebook Catalog Card -->
      <div class="feed-card meta-card">
        <div class="feed-header">
          <div class="platform-brand">
            <span class="platform-icon meta-icon">f</span>
            <div>
              <h4 class="platform-title">Meta / Facebook Catalog Feed</h4>
              <span class="platform-subtitle">صيغة CSV القياسية لإعلانات فيسبوك وانستغرام</span>
            </div>
          </div>
          <span class="format-badge">CSV</span>
        </div>
        <p class="feed-desc">مناسب لـ Meta Commerce Manager و Instagram Shopping وإعلانات Dynamic Product Ads.</p>
        <div class="feed-url-box">
          <input type="text" readonly :value="metaFeedUrl" class="feed-url-input" />
          <button class="copy-btn" @click="copyToClipboard(metaFeedUrl, 'meta')">
            {{ copiedFeed === 'meta' ? 'تم النسخ ✓' : 'نسخ الرابط' }}
          </button>
        </div>
        <div class="feed-actions">
          <button class="download-btn meta-btn" @click="downloadMetaFeed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تحميل ملف Meta CSV
          </button>
        </div>
      </div>

      <!-- Google Shopping Card -->
      <div class="feed-card google-card">
        <div class="feed-header">
          <div class="platform-brand">
            <span class="platform-icon google-icon">G</span>
            <div>
              <h4 class="platform-title">Google Merchant Center Feed</h4>
              <span class="platform-subtitle">صيغة XML RSS 2.0 القياسية لـ Google Shopping</span>
            </div>
          </div>
          <span class="format-badge xml">XML</span>
        </div>
        <p class="feed-desc">مناسب لـ Google Merchant Center و Performance Max Campaigns وإعلانات شبكة البحث.</p>
        <div class="feed-url-box">
          <input type="text" readonly :value="googleFeedUrl" class="feed-url-input" />
          <button class="copy-btn" @click="copyToClipboard(googleFeedUrl, 'google')">
            {{ copiedFeed === 'google' ? 'تم النسخ ✓' : 'نسخ الرابط' }}
          </button>
        </div>
        <div class="feed-actions">
          <button class="download-btn google-btn" @click="downloadGoogleFeed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تحميل ملف Google XML
          </button>
        </div>
      </div>

      <!-- JSON Feed Card -->
      <div class="feed-card json-card">
        <div class="feed-header">
          <div class="platform-brand">
            <span class="platform-icon json-icon">{}</span>
            <div>
              <h4 class="platform-title">JSON Product Feed</h4>
              <span class="platform-subtitle">تغذية برمجية المطورين و TikTok Catalog</span>
            </div>
          </div>
          <span class="format-badge json">JSON</span>
        </div>
        <p class="feed-desc">مناسب لربط الأنظمة الخارجية، تطبيقات الهاتف، وحملات TikTok Catalog.</p>
        <div class="feed-url-box">
          <input type="text" readonly :value="jsonFeedUrl" class="feed-url-input" />
          <button class="copy-btn" @click="copyToClipboard(jsonFeedUrl, 'json')">
            {{ copiedFeed === 'json' ? 'تم النسخ ✓' : 'نسخ الرابط' }}
          </button>
        </div>
        <div class="feed-actions">
          <button class="download-btn json-btn" @click="downloadJsonFeed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تحميل ملف JSON Feed
          </button>
        </div>
      </div>
    </div>

    <!-- Health Check Stats -->
    <div class="stats-section">
      <div class="stat-box">
        <span class="stat-title">إجمالي منتجات التغذية</span>
        <span class="stat-number">{{ filteredProducts.length }}</span>
      </div>
      <div class="stat-box active-box">
        <span class="stat-title">المنتجات المتوفرة (In Stock)</span>
        <span class="stat-number">{{ inStockCount }}</span>
      </div>
      <div class="stat-box warning-box">
        <span class="stat-title">منتجات بدون صور رئيسية</span>
        <span class="stat-number">{{ missingImagesCount }}</span>
      </div>
      <div class="stat-box info-box">
        <span class="stat-title">جاهزية التغذية</span>
        <span class="stat-number">{{ feedReadinessScore }}%</span>
      </div>
    </div>

    <!-- Preview Table -->
    <div class="table-card">
      <div class="table-header">
        <h3 class="table-title">معاينة المنتجات في الـ Catalog Feed</h3>
        <span class="table-count">عرض {{ filteredProducts.slice(0, 10).length }} من {{ filteredProducts.length }} منتج</span>
      </div>
      <div v-if="loading" class="loading-state">جاري تحميل بيانات المنتجات...</div>
      <div v-else-if="filteredProducts.length === 0" class="empty-state">لا توجد منتجات مطابقة لشروط التصفية.</div>
      <div v-else class="table-responsive">
        <table class="feed-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>المنتج</th>
              <th>السعر</th>
              <th>الحالة (Availability)</th>
              <th>الصورة</th>
              <th>رابط المنتج</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredProducts.slice(0, 15)" :key="item.id">
              <td><code>#{{ item.id }}</code></td>
              <td class="font-medium">{{ item.name_ar || item.name_en || item.name }}</td>
              <td>{{ parseFloat(item.price || 0).toFixed(2) }} {{ currency }}</td>
              <td>
                <span class="status-pill" :class="item.quantity > 0 || item.is_active ? 'in-stock' : 'out-of-stock'">
                  {{ (item.quantity > 0 || item.is_active) ? 'In Stock' : 'Out of Stock' }}
                </span>
              </td>
              <td>
                <img v-if="getProductImage(item)" :src="getProductImage(item)" alt="product" class="preview-thumb" />
                <span v-else class="no-img">بدون صورة</span>
              </td>
              <td class="link-cell">
                <a :href="`${storeUrl}/product/${item.id}`" target="_blank" class="prod-link">
                  {{ storeUrl }}/product/{{ item.id }}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../config/axios';
import { generateMetaCSV, generateGoogleXML, generateJSONFeed, downloadFile } from '../utils/dataFeedExporter';

const storeUrl = ref('https://mastergas.sa');
const currency = ref('JOD');
const selectedCategory = ref('');
const stockFilter = ref('all');

const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const copiedFeed = ref('');

// Computed Feeds URLs
const metaFeedUrl = computed(() => `${storeUrl.value.replace(/\/$/, '')}/api/feeds/products.csv`);
const googleFeedUrl = computed(() => `${storeUrl.value.replace(/\/$/, '')}/api/feeds/products.xml`);
const jsonFeedUrl = computed(() => `${storeUrl.value.replace(/\/$/, '')}/api/feeds/products.json`);

// Fetch Products & Categories
const fetchData = async () => {
  loading.value = true;
  try {
    const [prodRes, catRes] = await Promise.all([
      api.get('/dashboard/products').catch(() => ({ data: { data: [] } })),
      api.get('/dashboard/categories').catch(() => ({ data: { data: [] } }))
    ]);
    
    products.value = Array.isArray(prodRes.data?.data) ? prodRes.data.data : [];
    categories.value = Array.isArray(catRes.data?.data) ? catRes.data.data : [];
    
    // Set window location domain as default store url if available on production domain
    if (window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
      storeUrl.value = window.location.origin;
    } else {
      storeUrl.value = 'https://mastergas.sa';
    }
  } catch (err) {
    console.error('Error loading catalog data', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Filtered Products List
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    if (selectedCategory.value && String(p.category_id) !== String(selectedCategory.value)) {
      return false;
    }
    if (stockFilter.value === 'in_stock') {
      const isAvail = p.is_active !== false && p.is_active !== 0 && (p.quantity === undefined || p.quantity > 0);
      if (!isAvail) return false;
    }
    return true;
  });
});

// Stats
const inStockCount = computed(() => {
  return filteredProducts.value.filter(p => p.is_active !== false && (p.quantity === undefined || p.quantity > 0)).length;
});

const missingImagesCount = computed(() => {
  return filteredProducts.value.filter(p => !getProductImage(p)).length;
});

const feedReadinessScore = computed(() => {
  if (filteredProducts.value.length === 0) return 0;
  const validProducts = filteredProducts.value.filter(p => getProductImage(p) && p.price > 0).length;
  return Math.round((validProducts / filteredProducts.value.length) * 100);
});

function getProductImage(item) {
  return item.image_url || item.image || (Array.isArray(item.images) && item.images[0]) || '';
}

// Copy URL
const copyToClipboard = (text, feedType) => {
  navigator.clipboard.writeText(text);
  copiedFeed.value = feedType;
  setTimeout(() => {
    copiedFeed.value = '';
  }, 2500);
};

// Downloads
const downloadMetaFeed = () => {
  const csvContent = generateMetaCSV(filteredProducts.value, storeUrl.value, currency.value);
  downloadFile(csvContent, 'meta-facebook-catalog-feed.csv', 'text/csv;charset=utf-8;');
};

const downloadGoogleFeed = () => {
  const xmlContent = generateGoogleXML(filteredProducts.value, storeUrl.value, currency.value);
  downloadFile(xmlContent, 'google-merchant-catalog-feed.xml', 'application/xml;charset=utf-8;');
};

const downloadJsonFeed = () => {
  const jsonContent = generateJSONFeed(filteredProducts.value, storeUrl.value, currency.value);
  downloadFile(jsonContent, 'products-catalog-feed.json', 'application/json;charset=utf-8;');
};
</script>

<style scoped>
.data-feeds-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

/* Banner */
.banner-card {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
}

.banner-icon {
  color: #0284c7;
  flex-shrink: 0;
}

.banner-title {
  font-size: 16px;
  font-weight: 700;
  color: #0369a1;
  margin-bottom: 8px;
}

.banner-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 10px;
}

.method-badge {
  display: inline-block;
  font-weight: 700;
  font-size: 13px;
  color: #0284c7;
  margin-bottom: 4px;
}

.method-item p {
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
}

/* Config Card */
.config-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.form-input, .form-select {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
}

.form-input:focus, .form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Feeds Grid */
.feeds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 20px;
}

.feed-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  transition: all 0.2s ease;
}

.feed-card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.platform-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 20px;
  color: #fff;
}

.meta-icon { background: #1877f2; }
.google-icon { background: #ea4335; }
.json-icon { background: #8b5cf6; font-size: 16px; }

.platform-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.platform-subtitle {
  font-size: 12px;
  color: #64748b;
}

.format-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: #eff6ff;
  color: #2563eb;
}

.format-badge.xml { background: #fef2f2; color: #dc2626; }
.format-badge.json { background: #f5f3ff; color: #7c3aed; }

.feed-desc {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

.feed-url-box {
  display: flex;
  gap: 8px;
}

.feed-url-input {
  flex: 1;
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 12px;
  background: #f8fafc;
  direction: ltr;
}

.copy-btn {
  padding: 0 14px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  white-space: nowrap;
}

.copy-btn:hover { background: #f1f5f9; }

.download-btn {
  width: 100%;
  height: 42px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s ease;
}

.meta-btn { background: #1877f2; }
.meta-btn:hover { background: #166fe5; }
.google-btn { background: #ea4335; }
.google-btn:hover { background: #d93829; }
.json-btn { background: #8b5cf6; }
.json-btn:hover { background: #7c3aed; }

/* Stats */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-box {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.stat-number {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.active-box .stat-number { color: #16a34a; }
.warning-box .stat-number { color: #ea580c; }
.info-box .stat-number { color: #2563eb; }

/* Table */
.table-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.table-count {
  font-size: 13px;
  color: #64748b;
}

.table-responsive {
  overflow-x: auto;
}

.feed-table {
  width: 100%;
  border-collapse: collapse;
  text-align: right;
}

.feed-table th, .feed-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
}

.feed-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
}

.preview-thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.no-img {
  font-size: 11px;
  color: #94a3b8;
}

.status-pill {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.status-pill.in-stock { background: #dcfce7; color: #15803d; }
.status-pill.out-of-stock { background: #fee2e2; color: #b91c1c; }

.link-cell { direction: ltr; text-align: left; }
.prod-link { color: #2563eb; font-size: 12px; text-decoration: none; }
.prod-link:hover { text-decoration: underline; }

.loading-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 14px;
}
</style>
