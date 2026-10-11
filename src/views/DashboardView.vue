<template>
  <div class="dashboard" dir="rtl">

    <!-- ===== PAGE HEADER ===== -->
    <div class="dash-header">
      <div>
        <h1 class="dash-title">لوحة القيادة</h1>
        <p class="dash-subtitle">نظرة عامة على أداء المتجر - {{ formattedDate }}</p>
      </div>
    </div>

    <!-- ===== LOADING STATE ===== -->
    <div v-if="loading" class="dashboard-loading">
      <div class="spinner"></div>
      <p>جاري تحميل البيانات...</p>
    </div>

    <!-- ===== ERROR STATE ===== -->
    <div v-else-if="error" class="error-alert">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
      <button @click="fetchAll" class="retry-btn">إعادة المحاولة</button>
    </div>

    <!-- ===== MAIN CONTENT ===== -->
    <template v-else>

      <!-- ===== ROW 1: STAT CARDS (5) ===== -->
      <div class="stats-grid">
        <div v-for="card in statCards" :key="card.key" class="stat-card">
          <div class="stat-top">
            <div class="stat-icon" :style="{ background: card.iconBg }">
              <span v-html="card.icon"></span>
            </div>
            <div class="stat-trend" :class="card.trendUp ? 'trend-up' : 'trend-down'">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline :points="card.trendUp ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
              </svg>
              {{ card.trend }}
            </div>
          </div>
          <div class="stat-bottom">
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </div>
      </div>

      <!-- ===== ROW 2: CHARTS ===== -->
      <div class="charts-row">

        <!-- Donut: Order Distribution -->
        <div class="chart-card donut-card">
          <div class="chart-header">
            <h3 class="chart-title">توزيع الطلبات</h3>
          </div>
          <div class="donut-body">
            <div class="donut-canvas-wrap">
              <canvas ref="donutCanvas" width="160" height="160"></canvas>
              <div class="donut-center-text">
                <span class="donut-total-num">{{ totalOrdersCount }}</span>
                <span class="donut-total-lbl">طلب</span>
              </div>
            </div>
            <div class="donut-legend-grid">
              <div v-for="item in orderStatusData" :key="item.key" class="legend-row">
                <div class="legend-left-part">
                  <span class="legend-dot" :style="{ background: item.color }"></span>
                  <span class="legend-lbl">{{ item.label }}</span>
                </div>
                <span class="legend-count">{{ Number.isFinite(item.count) ? item.count : 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Line: Sales Chart -->
        <div class="chart-card line-card">
          <div class="chart-header">
            <h3 class="chart-title">مخطط المبيعات</h3>
            <div class="period-toggle">
              <button
                class="toggle-btn"
                :class="{ active: salesPeriod === 'monthly' }"
                @click="setSalesPeriod('monthly')"
              >شهري</button>
              <button
                class="toggle-btn"
                :class="{ active: salesPeriod === 'daily' }"
                @click="setSalesPeriod('daily')"
              >يومي</button>
            </div>
          </div>
          <div class="line-wrapper">
            <canvas ref="lineCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- ===== ROW 3: ORDERS TABLE + BEST SELLERS ===== -->
      <div class="tables-row">

        <!-- Recent Orders -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#873260" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span class="section-title">أحدث الطلبات</span>
            </div>
            <router-link to="/admin/orders" class="view-all-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              عرض الكل
            </router-link>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>الحالة</th>
                  <th>المبلغ</th>
                  <th>العميل</th>
                  <th>رقم الطلب</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id">
                  <td><span class="status-badge" :class="order.statusClass">{{ order.status }}</span></td>
                  <td class="td-amount">{{ order.amount }}</td>
                  <td>{{ order.customer }}</td>
                  <td class="td-order-id">{{ formatOrderNum(order.orderNumber || order.id) }}</td>
                </tr>
                <tr v-if="!recentOrders.length">
                  <td colspan="4" class="td-empty">لا توجد طلبات</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Best Selling Products -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span class="section-title">أفضل المنتجات مبيعاً</span>
            </div>
            <router-link to="/admin/products" class="view-all-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              عرض الكل
            </router-link>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>الإيرادات</th>
                  <th>المبيعات</th>
                  <th>المنتج</th>
                  <th>#</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="bestSellersLoading">
                  <td colspan="4" class="td-loading">جاري التحميل...</td>
                </tr>
                <tr v-else-if="bestSellersError">
                  <td colspan="4" class="td-error">
                    <span>{{ bestSellersError }}</span>
                    <button @click="fetchBestSellers(abortController?.signal)" class="section-retry-btn">إعادة المحاولة</button>
                  </td>
                </tr>
                <template v-else>
                  <tr v-for="(prod, idx) in bestSellers" :key="prod.id || idx">
                    <td class="td-amount">{{ formatAmount(prod.revenue ?? prod.total_revenue ?? 0) }}</td>
                    <td class="td-num">{{ prod.sales ?? prod.total_sold ?? 0 }}</td>
                    <td class="td-product-name">{{ prod.name ?? prod.product_name ?? '-' }}</td>
                    <td><span class="rank-num" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</span></td>
                  </tr>
                  <tr v-if="!bestSellers.length">
                    <td colspan="4" class="td-empty">لا توجد بيانات</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== ROW 4: RETURNS + INVENTORY ALERTS ===== -->
      <div class="bottom-row">

        <!-- Returns -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 0 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 0-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              <span class="section-title">طلبات مرتجعة</span>
              <span v-if="pendingReturnsCount > 0" class="badge-pending">{{ pendingReturnsCount }} بانتظار</span>
            </div>
            <router-link to="/admin/returns" class="view-all-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              عرض الكل
            </router-link>
          </div>
          <div class="returns-list">
            <div v-if="returnsLoading" class="section-loading">جاري التحميل...</div>
            <div v-else-if="returnsError" class="section-error">
              <span>{{ returnsError }}</span>
              <button @click="fetchReturns(abortController?.signal)" class="section-retry-btn">إعادة المحاولة</button>
            </div>
            <template v-else>
              <div v-for="ret in recentReturns" :key="ret.id" class="return-item">
                <div class="return-left">
                  <span class="return-status" :class="'rs-' + ret.status">{{ returnStatusLabel(ret.status) }}</span>
                  <div class="return-meta">
                    <span class="return-order-ref">#{{ ret.order_id || ret.id }} - {{ ret.customer_name }}</span>
                    <span class="return-product-txt">{{ ret.product_name }}</span>
                  </div>
                </div>
                <span class="return-amt">{{ formatAmount(ret.refund_amount ?? 0) }}</span>
              </div>
              <div v-if="!recentReturns.length" class="empty-section">لا توجد طلبات إرجاع</div>
            </template>
          </div>
        </div>

        <!-- Inventory Alerts -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span class="section-title">تنبيهات المخزون</span>
            </div>
            <router-link to="/admin/products" class="view-all-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              إدارة المخزون
            </router-link>
          </div>
          <div class="inventory-list">
            <div v-if="lowStockLoading" class="section-loading">جاري التحميل...</div>
            <div v-else-if="lowStockError" class="section-error">
              <span>{{ lowStockError }}</span>
              <button @click="fetchLowStock(abortController?.signal)" class="section-retry-btn">إعادة المحاولة</button>
            </div>
            <template v-else>
              <div v-for="(item, idx) in lowStockItems" :key="item.id || idx" class="inv-item">
                <div class="inv-icon-box" :style="{ background: INV_COLORS[idx % INV_COLORS.length] }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                  </svg>
                </div>
                <div class="inv-info">
                  <span class="inv-sku">{{ item.sku ?? item.barcode ?? '-' }}</span>
                  <span class="inv-name">{{ item.name ?? item.product_name ?? '-' }}</span>
                </div>
                <span class="inv-stock-badge" :class="(item.stock ?? item.quantity ?? 0) <= 0 ? 'out-stock' : 'low-stock-badge'">
                  {{ (item.stock ?? item.quantity ?? 0) <= 0 ? 'نفذ المخزون' : (item.stock ?? item.quantity) + ' متبقي' }}
                </span>
              </div>
              <div v-if="!lowStockItems.length" class="empty-section">لا توجد تنبيهات مخزون</div>
            </template>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import api from '../config/axios';
import { useTheme } from '../composables/useTheme';

Chart.register(...registerables);

const { isDark } = useTheme();

// ─── Canvas refs ───────────────────────────────────────────────────────────────
const donutCanvas = ref(null);
const lineCanvas  = ref(null);
let donutChartInstance = null;
let lineChartInstance  = null;
let abortController = null;
let isDisposed = false;

// ─── State ─────────────────────────────────────────────────────────────────────
const loading        = ref(true);
const error          = ref(null);
const salesPeriod    = ref('monthly');
const monthlyData    = ref([]);
const dailyData      = ref([]);
const recentOrders   = ref([]);
const bestSellers    = ref([]);
const recentReturns  = ref([]);
const lowStockItems  = ref([]);

const returnsLoading     = ref(false);
const returnsError       = ref(null);
const bestSellersLoading = ref(false);
const bestSellersError   = ref(null);
const lowStockLoading    = ref(false);
const lowStockError      = ref(null);

const serverTotalOrders  = ref(null);
const hasStatusBreakdown = ref(false);

const orderStatusData = ref([
  { key: 'completed',  label: 'مكتمل',        count: 0, color: '#10B981' },
  { key: 'pending',    label: 'قيد الانتظار', count: 0, color: '#F59E0B' },
  { key: 'processing', label: 'قيد المعالجة', count: 0, color: '#3B82F6' },
  { key: 'shipped',    label: 'قيد الشحن',    count: 0, color: '#F97316' },
  { key: 'cancelled',  label: 'ملغي',         count: 0, color: '#8B5CF6' },
  { key: 'returned',   label: 'مرتجع',        count: 0, color: '#EF4444' },
]);

const statCards = ref([
  {
    key: 'products',
    label: 'المنتجات',
    value: '0',
    trend: '0%',
    trendUp: true,
    iconBg: '#FFF3E0',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  },
  {
    key: 'customers',
    label: 'العملاء',
    value: '0',
    trend: '0%',
    trendUp: true,
    iconBg: '#E0F7FA',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0891B2" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    key: 'today_orders',
    label: 'طلبات اليوم',
    value: '0',
    trend: '0%',
    trendUp: true,
    iconBg: '#EFF6FF',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  },
  {
    key: 'monthly_sales',
    label: 'مبيعات الشهر',
    value: '0 د.أ',
    trend: '0%',
    trendUp: true,
    iconBg: '#ECFDF5',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  },
  {
    key: 'today_sales',
    label: 'مبيعات اليوم',
    value: '0 د.أ',
    trend: '0%',
    trendUp: true,
    iconBg: '#F5F3FF',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
]);

const INV_COLORS = ['#F97316', '#0891B2', '#3B82F6', '#10B981', '#7C3AED'];

// ─── Computed ──────────────────────────────────────────────────────────────────
const formattedDate = computed(() => {
  const d = new Date();
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
});

const totalOrdersCount = computed(() => {
  const statusSum = orderStatusData.value.reduce((s, i) => s + (Number.isFinite(i.count) && i.count > 0 ? i.count : 0), 0);
  if (hasStatusBreakdown.value && statusSum > 0) {
    return statusSum;
  }
  if (serverTotalOrders.value !== null && Number.isFinite(serverTotalOrders.value) && serverTotalOrders.value >= 0) {
    return serverTotalOrders.value;
  }
  return statusSum;
});

const pendingReturnsCount = computed(() =>
  recentReturns.value.filter(r => r.status === 'pending').length
);

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseNonNegativeInt(val, fallback = 0) {
  if (val === null || val === undefined || val === '' || typeof val === 'object' || typeof val === 'boolean') return fallback;
  const n = Number(val);
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) {
    return fallback;
  }
  return n;
}

function extractList(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
  return null;
}

const fmt = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString('en-US') : '-';
};

const formatAmount = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString('en-US') + ' د.أ' : '-';
};

const formatOrderNum = (val) => {
  if (!val) return '-';
  const cleaned = String(val).replace(/^ORD-/i, '');
  return '#' + cleaned;
};

const sortByStock = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const aStock = Number(a.stock ?? a.quantity ?? 0);
    const bStock = Number(b.stock ?? b.quantity ?? 0);
    return (Number.isFinite(aStock) ? aStock : 0) - (Number.isFinite(bStock) ? bStock : 0);
  });
};

const sortBySales = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const aSales = Number(a.sales ?? a.total_sold ?? 0);
    const bSales = Number(b.sales ?? b.total_sold ?? 0);
    return (Number.isFinite(bSales) ? bSales : 0) - (Number.isFinite(aSales) ? aSales : 0);
  });
};

const returnStatusLabel = (s) => ({
  pending:  'انتظار المراجعة',
  approved: 'تمت الموافقة',
  rejected: 'مرفوض',
}[s] || s);

const trend = (val) => {
  const v = parseFloat(val);
  if (!Number.isFinite(v)) return '0%';
  return (v > 0 ? '+' : '') + v + '%';
};

// ─── Section Fetchers ──────────────────────────────────────────────────────────
const fetchReturns = async (signal) => {
  returnsLoading.value = true;
  returnsError.value = null;
  try {
    const res = await api.get('/dashboard/returns?per_page=4', { signal });
    const list = extractList(res.data);
    if (!list) {
      throw new Error('بنية بيانات المرتجعات غير مدعومة');
    }
    recentReturns.value = list.slice(0, 4);
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    returnsError.value = err.response?.data?.message || 'فشل في تحميل طلبات الإرجاع';
  } finally {
    returnsLoading.value = false;
  }
};

const fetchBestSellers = async (signal) => {
  bestSellersLoading.value = true;
  bestSellersError.value = null;
  try {
    const res = await api.get('/dashboard/products?per_page=7&sort_by=total_sold&sort_dir=desc', { signal });
    const list = extractList(res.data);
    if (!list) {
      throw new Error('بنية بيانات المنتجات غير مدعومة');
    }
    bestSellers.value = sortBySales(list).slice(0, 7);
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    bestSellersError.value = err.response?.data?.message || 'فشل في تحميل أفضل المنتجات';
  } finally {
    bestSellersLoading.value = false;
  }
};

const fetchLowStock = async (signal) => {
  lowStockLoading.value = true;
  lowStockError.value = null;
  try {
    const res = await api.get('/dashboard/products?low_stock=1&per_page=5', { signal });
    const list = extractList(res.data);
    if (!list) {
      throw new Error('بنية بيانات المخزون غير مدعومة');
    }
    lowStockItems.value = sortByStock(list).slice(0, 5);
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    lowStockError.value = err.response?.data?.message || 'فشل في تحميل تنبيهات المخزون';
  } finally {
    lowStockLoading.value = false;
  }
};

// ─── Fetch All ─────────────────────────────────────────────────────────────────
const fetchAll = async () => {
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();
  const signal = abortController.signal;

  loading.value = true;
  error.value   = null;

  try {
    const [statsRes, returnsRes] = await Promise.allSettled([
      api.get('/dashboard/statistics', { signal }),
      api.get('/dashboard/returns?per_page=4', { signal }),
    ]);

    if (isDisposed) return;

    // ── Statistics ──
    if (statsRes.status === 'fulfilled') {
      const data = statsRes.value.data?.data || {};
      const s    = data.summary || {};

      // Stat cards: strict check against undefined / null before displaying
      const prodVal = s.total_products ?? s.products_count;
      statCards.value[0].value   = (prodVal !== undefined && prodVal !== null && Number.isFinite(Number(prodVal))) ? fmt(prodVal) : '-';
      statCards.value[0].trend   = trend(s.products_change ?? 0);
      statCards.value[0].trendUp = parseFloat(s.products_change ?? 0) >= 0;

      const custVal = s.total_customers ?? s.customers_count;
      statCards.value[1].value   = (custVal !== undefined && custVal !== null && Number.isFinite(Number(custVal))) ? fmt(custVal) : '-';
      statCards.value[1].trend   = trend(s.customers_change ?? 0);
      statCards.value[1].trendUp = parseFloat(s.customers_change ?? 0) >= 0;

      const todayOrd = s.today_orders;
      statCards.value[2].value   = (todayOrd !== undefined && todayOrd !== null && Number.isFinite(Number(todayOrd))) ? fmt(todayOrd) : '-';
      statCards.value[2].trend   = trend(s.today_orders_change ?? 0);
      statCards.value[2].trendUp = parseFloat(s.today_orders_change ?? 0) >= 0;

      const monthSales = s.monthly_sales;
      statCards.value[3].value   = (monthSales !== undefined && monthSales !== null && Number.isFinite(Number(monthSales))) ? formatAmount(monthSales) : '-';
      statCards.value[3].trend   = trend(s.monthly_sales_change ?? 0);
      statCards.value[3].trendUp = parseFloat(s.monthly_sales_change ?? 0) >= 0;

      const todaySales = s.today_sales;
      statCards.value[4].value   = (todaySales !== undefined && todaySales !== null && Number.isFinite(Number(todaySales))) ? formatAmount(todaySales) : '-';
      statCards.value[4].trend   = trend(s.today_sales_change ?? 0);
      statCards.value[4].trendUp = parseFloat(s.today_sales_change ?? 0) >= 0;

      // Order status distribution for donut
      serverTotalOrders.value = parseNonNegativeInt(s.total_orders, null);
      const obs = data.orders_by_status;
      if (obs && typeof obs === 'object') {
        hasStatusBreakdown.value = true;
        const compVal = obs.completed ?? obs.delivered ?? s.completed_orders;
        orderStatusData.value.find(d => d.key === 'completed').count = parseNonNegativeInt(compVal, 0);

        const pendVal = obs.pending ?? obs.awaiting ?? s.pending_orders;
        orderStatusData.value.find(d => d.key === 'pending').count = parseNonNegativeInt(pendVal, 0);

        const procVal = obs.processing ?? s.processing_orders;
        orderStatusData.value.find(d => d.key === 'processing').count = parseNonNegativeInt(procVal, 0);

        const shipVal = obs.shipped ?? s.shipped_orders;
        orderStatusData.value.find(d => d.key === 'shipped').count = parseNonNegativeInt(shipVal, 0);

        const cancVal = obs.cancelled ?? obs.canceled ?? s.cancelled_orders ?? s.canceled_orders;
        orderStatusData.value.find(d => d.key === 'cancelled').count = parseNonNegativeInt(cancVal, 0);

        const retVal = obs.returned ?? s.returned_orders;
        orderStatusData.value.find(d => d.key === 'returned').count = parseNonNegativeInt(retVal, 0);
      } else {
        hasStatusBreakdown.value = false;
        orderStatusData.value.forEach(d => { d.count = 0; });
      }

      // Monthly data
      monthlyData.value = Array.isArray(data.monthly_data) ? data.monthly_data : [];

      // Daily data
      dailyData.value = Array.isArray(data.daily_data) ? data.daily_data : [];

      // Recent orders
      recentOrders.value = Array.isArray(data.recent_orders) ? data.recent_orders.slice(0, 5) : [];

      // Best sellers
      if (data.best_selling_products !== undefined && data.best_selling_products !== null) {
        const list = extractList(data.best_selling_products) || (Array.isArray(data.best_selling_products) ? data.best_selling_products : null);
        if (list !== null) {
          bestSellers.value = sortBySales(list).slice(0, 7);
          bestSellersError.value = null;
        } else {
          bestSellersError.value = 'بنية بيانات أفضل المنتجات غير مدعومة';
        }
      } else {
        await fetchBestSellers(signal);
      }

      // Low stock items
      if (data.low_stock_products !== undefined && data.low_stock_products !== null) {
        const list = extractList(data.low_stock_products) || (Array.isArray(data.low_stock_products) ? data.low_stock_products : null);
        if (list !== null) {
          lowStockItems.value = sortByStock(list).slice(0, 5);
          lowStockError.value = null;
        } else {
          lowStockError.value = 'بنية بيانات المخزون غير مدعومة';
        }
      } else {
        await fetchLowStock(signal);
      }
    } else {
      throw statsRes.reason;
    }

    // ── Returns ──
    if (returnsRes.status === 'fulfilled') {
      const list = extractList(returnsRes.value.data);
      if (list !== null) {
        recentReturns.value = list.slice(0, 4);
        returnsError.value = null;
      } else {
        returnsError.value = 'بنية بيانات المرتجعات غير مدعومة';
      }
    } else {
      returnsError.value = 'فشل في تحميل طلبات الإرجاع';
    }

    if (isDisposed) return;
    loading.value = false;
    await nextTick();
    if (isDisposed) return;
    initDonutChart();
    initLineChart();
  } catch (err) {
    if (isDisposed) return;
    loading.value = false;
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    if (err.response?.status === 401) {
      return;
    }
    if (err.response) {
      error.value = `خطأ من السيرفر (${err.response.status}): ${err.response.data?.message || 'فشل في تحميل البيانات'}`;
    } else if (err.request) {
      error.value = 'لا يوجد استجابة من السيرفر. تأكد من تشغيل Laravel (php artisan serve)';
    } else {
      error.value = 'خطأ: ' + err.message;
    }
  }
};

// ─── Charts ────────────────────────────────────────────────────────────────────
function initDonutChart() {
  if (!donutCanvas.value || isDisposed) return;
  if (donutChartInstance) donutChartInstance.destroy();

  const active = orderStatusData.value.filter(d => Number.isFinite(d.count) && d.count > 0);
  const chartData = active.length
    ? active
    : [{ label: 'لا توجد بيانات', count: 1, color: '#e5e7eb' }];

  donutChartInstance = new Chart(donutCanvas.value, {
    type: 'doughnut',
    data: {
      labels: chartData.map(d => d.label),
      datasets: [{
        data: chartData.map(d => d.count),
        backgroundColor: chartData.map(d => d.color),
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` },
        },
      },
    },
  });
}

function initLineChart() {
  if (!lineCanvas.value || isDisposed) return;
  if (lineChartInstance) lineChartInstance.destroy();

  const src    = salesPeriod.value === 'daily' ? dailyData.value : monthlyData.value;
  const labels = Array.isArray(src) ? src.map(i => i.day_ar ?? i.month_ar ?? i.label ?? '') : [];
  const values = Array.isArray(src) ? src.map(i => {
    const v = parseFloat(i.sales ?? i.total ?? 0);
    return Number.isFinite(v) ? v : 0;
  }) : [];

  lineChartInstance = new Chart(lineCanvas.value, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['لا توجد بيانات'],
      datasets: [{
        label: 'المبيعات',
        data: values.length ? values : [0],
        borderColor: '#873260',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(135, 50, 96, 0.18)');
          gradient.addColorStop(1, 'rgba(135, 50, 96, 0)');
          return gradient;
        },
        borderWidth: 2.5,
        fill: true,
        tension: 0.45,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#873260',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: { label: ctx => ` ${Number(ctx.parsed.y || 0).toLocaleString('en-US')} د.أ` },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'IBM Plex Sans Arabic', size: 11 }, color: isDark.value ? '#94a3b8' : '#9ca3af' },
        },
        y: {
          position: 'right',
          grid: { color: isDark.value ? '#334155' : '#f3f4f6' },
          ticks: {
            font: { family: 'IBM Plex Sans Arabic', size: 11 },
            color: isDark.value ? '#94a3b8' : '#9ca3af',
            callback: v => Number(v || 0).toLocaleString('en-US'),
          },
        },
      },
    },
  });
}

function setSalesPeriod(period) {
  salesPeriod.value = period;
  if (!isDisposed) {
    initLineChart();
  }
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  isDisposed = false;
  localStorage.setItem('lang', 'ar');
  fetchAll();
});

onUnmounted(() => {
  isDisposed = true;
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  if (donutChartInstance) {
    donutChartInstance.destroy();
    donutChartInstance = null;
  }
  if (lineChartInstance) {
    lineChartInstance.destroy();
    lineChartInstance = null;
  }
});

watch(isDark, () => {
  if (!loading.value && !isDisposed) {
    initDonutChart();
    initLineChart();
  }
});
</script>

<style scoped>
/* ─── Base ─────────────────────────────────────────────────────────────────── */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  direction: rtl;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

/* ─── Page Header ──────────────────────────────────────────────────────────── */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 0.25rem;
}
.dash-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.2rem 0;
  text-align: right;
}
.dash-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  text-align: right;
}

/* ─── Stat Cards ───────────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.9rem;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem 1.1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
}
.stat-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon span {
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.18rem 0.45rem;
  border-radius: 6px;
}
.trend-up   { color: #059669; background: #d1fae5; }
.trend-down { color: #dc2626; background: #fee2e2; }

.stat-bottom { text-align: right; }
.stat-value {
  font-size: 1.55rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
  display: block;
}
.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.1rem;
  display: block;
}

/* ─── Charts Row ───────────────────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0.9rem;
}
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.1rem 1.2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  border: 1px solid #f0f0f0;
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
}
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.chart-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Donut */
.donut-card { display: flex; flex-direction: column; }
.donut-body {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex: 1;
}
.donut-canvas-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}
.donut-canvas-wrap canvas {
  display: block;
}
.donut-center-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.donut-total-num {
  font-size: 1.4rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}
.donut-total-lbl {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 2px;
}
.donut-legend-grid {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  flex: 1;
}
.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
}
.legend-left-part {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-lbl { color: #374151; }
.legend-count { font-weight: 700; color: #111827; }

/* Line chart */
.line-card { display: flex; flex-direction: column; }
.period-toggle {
  display: flex;
  gap: 0.3rem;
  background: #f3f4f6;
  padding: 3px;
  border-radius: 8px;
}
.toggle-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  color: #6b7280;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: #fff;
  color: #873260;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.line-wrapper {
  height: 200px;
  position: relative;
  flex: 1;
}

/* ─── Tables Row ───────────────────────────────────────────────────────────── */
.tables-row,
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}
.section-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}
.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1f2937;
}
.view-all-link {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.73rem;
  font-weight: 600;
  color: #873260;
  text-decoration: none;
  transition: opacity 0.2s;
}
.view-all-link:hover { opacity: 0.7; }
.table-wrap { overflow-x: auto; }
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}
.data-table th {
  text-align: right;
  padding: 0.55rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #6b7280;
  background: #fafafa;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
}
.data-table td {
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid #f9f9f9;
  color: #374151;
  text-align: right;
  white-space: nowrap;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafafa; }
.td-order-id { font-weight: 700; color: #873260; }
.td-amount   { font-weight: 700; color: #111827; }
.td-num      { font-weight: 600; color: #374151; }
.td-product-name { color: #374151; max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
.td-empty    { text-align: center; color: #9ca3af; padding: 1.5rem; }

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
}
.status-completed, .status-done, .status-delivered { background: #d1fae5; color: #065f46; }
.status-processing { background: #dbeafe; color: #1e40af; }
.status-shipped    { background: #ffedd5; color: #9a3412; }
.status-pending    { background: #fef3c7; color: #92400e; }
.status-cancelled  { background: #fee2e2; color: #991b1b; }
.status-returned   { background: #f3e8ff; color: #6b21a8; }

/* Rank numbers */
.rank-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  background: #f3f4f6;
  color: #374151;
}
.rank-1 { background: #fef3c7; color: #92400e; }
.rank-2 { background: #f3f4f6; color: #374151; }
.rank-3 { background: #ffedd5; color: #9a3412; }

/* ─── Returns Section ──────────────────────────────────────────────────────── */
.badge-pending {
  font-size: 0.65rem;
  font-weight: 700;
  background: #fef3c7;
  color: #92400e;
  padding: 0.15rem 0.45rem;
  border-radius: 20px;
}
.returns-list {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0;
}
.return-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.1rem;
  border-bottom: 1px solid #f9f9f9;
  gap: 0.75rem;
}
.return-item:last-child { border-bottom: none; }
.return-left {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
}
.return-status {
  display: inline-block;
  padding: 0.18rem 0.5rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.rs-pending  { background: #fef3c7; color: #92400e; }
.rs-approved { background: #d1fae5; color: #065f46; }
.rs-rejected { background: #fee2e2; color: #991b1b; }
.return-meta { min-width: 0; }
.return-order-ref {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.return-product-txt {
  display: block;
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.return-amt {
  font-weight: 700;
  font-size: 0.78rem;
  color: #111827;
  flex-shrink: 0;
}

/* ─── Inventory Section ────────────────────────────────────────────────────── */
.inventory-list {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0;
}
.inv-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.1rem;
  border-bottom: 1px solid #f9f9f9;
}
.inv-item:last-child { border-bottom: none; }
.inv-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.inv-info {
  flex: 1;
  min-width: 0;
}
.inv-sku {
  display: block;
  font-size: 0.67rem;
  color: #9ca3af;
  font-weight: 500;
}
.inv-name {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inv-stock-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.18rem 0.5rem;
  border-radius: 20px;
  flex-shrink: 0;
}
.out-stock       { background: #fee2e2; color: #991b1b; }
.low-stock-badge { background: #fef3c7; color: #92400e; }

.empty-section {
  text-align: center;
  color: #9ca3af;
  font-size: 0.78rem;
  padding: 1.5rem;
}

/* ─── Loading / Error ──────────────────────────────────────────────────────── */
.dashboard-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
  color: #6b7280;
}
.spinner {
  width: 38px;
  height: 38px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #873260;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-alert {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #b91c1c;
}
.retry-btn {
  background: #873260;
  color: #fff;
  border: none;
  padding: 0.55rem 1.5rem;
  border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 600;
  cursor: pointer;
}

/* ─── Section States ───────────────────────────────────────────────────────── */
.section-loading {
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.85rem;
}
.section-error {
  padding: 1.25rem 1rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
}
.section-retry-btn {
  background: #873260;
  color: #fff;
  border: none;
  padding: 0.35rem 1rem;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.section-retry-btn:hover {
  opacity: 0.9;
}
.td-loading,
.td-error {
  padding: 1.5rem !important;
  text-align: center;
}
.td-error {
  color: #b91c1c;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* ─── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 1280px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .stats-grid    { grid-template-columns: repeat(2, 1fr); }
  .charts-row    { grid-template-columns: 1fr; }
  .tables-row,
  .bottom-row    { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
  .stat-card {
    padding: 0.85rem 0.75rem;
    min-width: 0;
  }
  .chart-card {
    padding: 1rem 0.85rem;
    min-width: 0;
  }
  .donut-body {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .donut-legend-grid {
    width: 100%;
  }
  .dash-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
@media (max-width: 360px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
