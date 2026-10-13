<template>
  <div class="app-layout" :dir="currentLang === 'ar' ? 'rtl' : 'ltr'">
    <!-- Mobile Backdrop -->
    <div
      v-if="mobileSidebarOpen"
      class="sidebar-backdrop"
      @click="mobileSidebarOpen = false"
      aria-hidden="true"
    ></div>

    <!-- ===== SIDEBAR ===== -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'mobile-open': mobileSidebarOpen }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <img src="/brand/mastergas-logo-white.png" alt="Mastergas" class="logo-img" />
        </div>
        <button
          class="mobile-close-btn"
          @click="mobileSidebarOpen = false"
          aria-label="إغلاق القائمة"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <template v-for="item in menuItems" :key="item.route || item.label">
          <!-- Single Link -->
          <router-link
            v-if="!item.children"
            :to="item.route"
            class="nav-item"
            :class="{ active: route.path === item.route || route.path.startsWith(item.route + '/') }"
            @click="mobileSidebarOpen = false"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-label" v-show="!sidebarCollapsed">{{ item.label }}</span>
            <span v-if="item.route === '/admin/orders' && !sidebarCollapsed && ordersCount > 0" class="nav-badge">{{ ordersCount }}</span>
          </router-link>

          <!-- Dropdown Group -->
          <div v-else class="nav-group" :class="{ expanded: expandedGroup === item.label, active: isGroupActive(item) }">
            <button class="nav-group-header" @click="toggleGroup(item.label)">
              <span class="nav-icon" v-html="item.icon"></span>
              <span class="nav-label" v-show="!sidebarCollapsed">{{ item.label }}</span>
              <svg
                v-show="!sidebarCollapsed"
                class="nav-chevron"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div v-show="expandedGroup === item.label && !sidebarCollapsed" class="nav-group-children">
              <router-link
                v-for="child in item.children"
                :key="child.route"
                :to="child.route"
                class="nav-sub-item"
                :class="{ active: route.path === child.route || route.path.startsWith(child.route + '/') }"
                @click="mobileSidebarOpen = false"
              >
                <span class="nav-label">{{ child.label }}</span>
              </router-link>
            </div>
          </div>
        </template>
      </nav>
    </aside>

    <!-- ===== MAIN AREA ===== -->
    <div class="main-area">
      <!-- Topbar -->
      <header class="topbar">
        <!-- Left: user -->
        <div class="topbar-left">
          <button
            class="mobile-toggle-btn"
            @click="mobileSidebarOpen = !mobileSidebarOpen"
            :aria-expanded="mobileSidebarOpen"
            aria-label="قائمة التنقل"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <nav class="breadcrumb">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="rotate-180">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span class="breadcrumb-item home">لوحة التحكم الرئيسية</span>
          </nav>
        </div>

        <!-- Right: breadcrumb -->
        <div class="topbar-right">
            <!-- Notification -->
          <button class="notification-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="notification-badge"></span>
          </button>

          <!-- User Menu -->
          <div class="user-menu" @click="userMenuOpen = !userMenuOpen">
            <div class="user-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span class="user-name">{{ adminName }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>

            <!-- Dropdown -->
            <div v-if="userMenuOpen" class="user-dropdown" @click.stop>
              <!-- Header -->
              <div class="dropdown-header">
                <div class="user-info">
                  <span class="user-role">{{ adminName }}</span>
                  <span class="user-email">{{ adminEmail }}</span>
                  <span class="user-badge">{{ adminRole }}</span>
                </div>
                <div class="user-avatar-large">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
              
              <div class="dropdown-divider"></div>

              <!-- Language & Dark Mode commented out as requested:
              <div class="dropdown-item split-item" @click="toggleLanguage">
                <span class="lang-text">{{ currentLang === 'ar' ? 'ع' : 'En' }}</span>
                <div class="lang-switch-container">
                  <span class="en-text">{{ currentLang === 'ar' ? 'English' : 'العربية' }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M4 5h16M4 12h16M4 19h16"/>
                  </svg>
                </div>
              </div>

              <div class="dropdown-item split-item" @click="toggleTheme">
                <label class="toggle-switch" @click.stop>
                  <input type="checkbox" v-model="isDark" />
                  <span class="slider"></span>
                </label>
                <div class="theme-switch-container">
                  <span>الوضع الليلي</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                </div>
              </div>
              -->

              <div class="dropdown-divider"></div>

              <!-- Logout -->
              <button @click="handleLogout" class="dropdown-item logout-item justify-end">
                <span>تسجيل الخروج</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../config/axios';
import adminOrderService from '../application/adminOrderService';
import { useTheme } from '../composables/useTheme';

const { isDark, toggleTheme } = useTheme();

const router = useRouter();
const route = useRoute();
const adminName = ref('المسؤول');
const adminEmail = ref('admin@store.com');
const adminRole = ref('مدير النظام');
const sidebarCollapsed = ref(false);
const mobileSidebarOpen = ref(false);
const userMenuOpen = ref(false);
const ordersCount = ref(0);
const expandedGroup = ref('');
// The deployed Admin is backed by the Tijara v1 API. The old `/dashboard/*`
// endpoints are only useful for the local legacy snapshot and must never be
// called by a production build, even if a stale Vercel environment variable
// is still present.
const legacyDashboardEnabled = import.meta.env.DEV && import.meta.env.VITE_ADMIN_LEGACY_DASHBOARD === 'true';

const toggleGroup = (label) => {
  expandedGroup.value = expandedGroup.value === label ? '' : label;
};

const isGroupActive = (item) => {
  if (!item.children) return false;
  return item.children.some(child =>
    route.path === child.route || route.path.startsWith(child.route + '/')
  );
};

const { locale } = useI18n();
const currentLang = computed(() => locale.value);

const adminInitial = computed(() => adminName.value?.charAt(0)?.toUpperCase() || 'A');

let lastOrdersFetchTime = 0;
const ORDERS_CACHE_TTL = 30000; // 30 seconds

const fetchOrdersCount = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastOrdersFetchTime < ORDERS_CACHE_TTL) {
        return;
    }
    try {
        lastOrdersFetchTime = now;
        ordersCount.value = await adminOrderService.countOrders();
    } catch (err) {
        console.error('Failed to fetch orders count', err);
    }
};

const handleOrdersUpdated = () => {
    fetchOrdersCount(true);
};

const toggleLanguage = () => {
  const newLang = locale.value === 'ar' ? 'en' : 'ar';
  locale.value = newLang;
  localStorage.setItem('lang', newLang);
  document.documentElement.lang = newLang;
  document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
};

const updateFaviconFromSettings = async () => {
    if (!legacyDashboardEnabled) {
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = '/brand/mastergas-icon.png';
        return;
    }
    try {
        const isIrisAsset = (val) => {
            if (!val) return false;
            const str = String(val).toLowerCase();
            return str.includes('iris') || str.includes('t3jcwn2n2rvkxvcva') || str.includes('dobvpg934hatbpm5') || str.includes('yugdc4mk4vmsf6el');
        };
        const res = await api.get('/dashboard/settings');
        const logoEntry = res.data.data.find(s => s.key === 'logo');
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        if (logoEntry && logoEntry.value && logoEntry.value !== '[]' && !isIrisAsset(logoEntry.value)) {
            link.href = logoEntry.value;
        } else {
            link.href = '/brand/mastergas-icon.png';
        }
    } catch (err) {
        console.error('Failed to update favicon', err);
    }
};

const handleKeydown = (e) => {
  if (e.key === 'Escape' && mobileSidebarOpen.value) {
    mobileSidebarOpen.value = false;
  }
};

watch(() => route.path, () => {
  mobileSidebarOpen.value = false;
  fetchOrdersCount();
});

onMounted(() => {
  const adminInner = JSON.parse(localStorage.getItem('admin') || '{}');
  if (adminInner?.name) adminName.value = adminInner.name;
  if (adminInner?.email) adminEmail.value = adminInner.email;
  if (adminInner?.is_super_admin) adminRole.value = 'مدير النظام (سوبر)';
  else if (adminInner?.role) adminRole.value = adminInner.role;
  else if (adminInner?.id) adminRole.value = 'المدير';

  document.addEventListener('click', closeUserMenu);
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('orders-updated', handleOrdersUpdated);
  fetchOrdersCount();
  updateFaviconFromSettings();
});

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('orders-updated', handleOrdersUpdated);
});

const closeUserMenu = (e) => {
  if (!e.target.closest('.user-menu')) userMenuOpen.value = false;
};

const handleLogout = async () => {
  try {
    await api.post('/v1/logout');
  } catch (err) {
    console.error(err);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    router.push('/admin/login');
  }
};

const menuItems = [
  {
    route: '/admin/dashboard',
    label: 'لوحة القيادة',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  },
  {
    route: '/admin/categories',
    label: 'أقسام المنتجات',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  },
  {
    route: '/admin/products',
    label: 'المنتجات',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  },
  {
    route: '/admin/attributes',
    label: 'خصائص المنتجات',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  },
  {
    route: '/admin/data-feeds',
    label: 'تغذية المنتجات (Feeds)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 11a9 9 0 0 1 9-9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`,
  },
  {
    route: '/admin/orders',
    label: 'الطلبات',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,
  },
  {
    route: '/admin/returns',
    label: 'المرتجعات',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 0 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 0-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>`,
  },
  // {
  //   route: '/admin/dynamic-pages',
  //   label: 'الصفحات الديناميكية',
  //   icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  // },
  {
    route: '/admin/reviews',
    label: 'تقييمات المنتجات',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z"/><path d="M12 7l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5z"/></svg>`,
  },
  {
    route: '/admin/customers',
    label: 'العملاء',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    route: '/admin/discounts',
    label: 'أكواد الخصم',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  },
  {
    route: '/admin/offers',
    label: 'العروض والخصومات',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/><path d="M16 8l-5 8"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/></svg>`,
  },
  {
    route: '/admin/sliders',
    label: 'إعلانات السلايدر',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  },
  {
    route: '/admin/payments',
    label: 'بوابات الدفع',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  },
  /*
  {
    label: 'إدارة مناطق التوصيل',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    children: [
      {
        route: '/admin/countries',
        label: 'الدول',
      },
      {
        route: '/admin/cities',
        label: 'المدن',
      },
      {
        route: '/admin/city-shipping-rates',
        label: 'أسعار الشحن',
      },
      {
        route: '/admin/collector',
        label: 'مجموعات المناطق',
      },
    ],
  },
  */
  {
    route: '/admin/messages',
    label: 'رسائل العملاء',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  },
  {
    route: '/admin/topics',
    label: 'صفحات الموقع',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  },
  // {
  //   route: '/admin/accounts',
  //   label: 'التقارير المالية',
  //   icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  // },
  // {
  //   route: '/admin/activity-log',
  //   label: 'سجل النشاطات',
  //   icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/></svg>`,
  // },
  {
    route: '/admin/settings',
    label: 'الإعدادات',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  },
];
</script>

<style scoped>
/* ===== Layout ===== */
.app-layout {
  display: flex;
  flex-direction: row;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: var(--bg-main);
  color: var(--text-main);
  position: relative;
  width: 100%;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mobile-toggle-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.mobile-toggle-btn:hover {
  background: var(--bg-main);
}

.mobile-close-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-inline-start: auto;
  transition: background 0.2s, color 0.2s;
}
.mobile-close-btn:hover {
  background: var(--bg-main);
  color: var(--text-main);
}

.sidebar-backdrop {
  display: none;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 260px;
  min-width: 260px;
  background: var(--bg-sidebar);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.25s ease, min-width 0.25s ease, transform 0.25s ease;
  scrollbar-width: none;
  box-shadow: -2px 0 8px rgba(0,0,0,0.02);
  z-index: 40;
}
.sidebar::-webkit-scrollbar { display: none; }

.sidebar-collapsed {
  width: 64px;
  min-width: 64px;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.logo-img {
  width: 140px;
  height: auto;
  object-fit: contain;
}
.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  align-items: center;
}
.logo-ar {
  font-size: 1.1rem;
  font-weight: 800;
  color: #000000;
}
.logo-en {
  font-size: 0.75rem;
  color: #000000;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Nav Items */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 1rem 0.8rem;
  gap: 0.25rem;
  flex: 1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 1rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border-radius: 8px;
  white-space: nowrap;
}
.nav-item:hover {
  background: var(--bg-main);
  color: var(--text-main);
}
.nav-item.active {
  background: #000000;
  color: #fff;
  box-shadow: 0 4px 10px rgba(0,0,0, 0.2);
}
.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.nav-icon svg {
  width: 18px;
  height: 18px;
}
.nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-badge {
  background: #fff;
  color: #000000;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 50px;
  min-width: 24px;
  text-align: center;
}
.nav-item:not(.active) .nav-badge {
  background: #f3f4f6;
}

/* Nav Group Dropdown */
.nav-group {
  display: flex;
  flex-direction: column;
}
.nav-group-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 1rem;
  color: #6b7280;
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.nav-group-header:hover {
  background: var(--bg-main);
  color: var(--text-main);
}
.nav-group.active .nav-group-header {
  background: rgba(0,0,0, 0.08);
  color: #000000;
}
.nav-chevron {
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.nav-group.expanded .nav-chevron {
  transform: rotate(180deg);
}
.nav-group-children {
  display: flex;
  flex-direction: column;
  padding-inline-start: 2.35rem;
  gap: 0.15rem;
}
.nav-sub-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.nav-sub-item:hover {
  background: var(--bg-main);
  color: var(--text-main);
}
.nav-sub-item.active {
  background: rgba(0,0,0, 0.08);
  color: #000000;
  font-weight: 600;
}

/* ===== TOPBAR ===== */
.topbar {
  height: 56px;
  background: var(--bg-topbar);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}
.topbar-right {
  display: flex;
  align-items: center;
}
.topbar-left {
  display: flex;
  align-items: center;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: #6b7280;
}
.breadcrumb-item {
  color: var(--text-main);
  font-weight: 500;
}
.breadcrumb svg {
  color: #9ca3af;
  transform: rotate(180deg); /* RTL arrow */
}

/* Notification */
.notification-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  transition: all 0.2s;
  margin-left: 0.5rem;
}
.notification-btn:hover {
  background: var(--bg-main);
  color: var(--text-main);
}
.notification-badge {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  border: 2px solid var(--bg-topbar);
}

/* User Menu */
.user-menu {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  position: relative;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  transition: background 0.2s;
}
.user-menu:hover { background: var(--bg-main); }
.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-main);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-avatar-large {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--bg-main);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}
.user-menu > svg { color: #9ca3af; }

/* Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  min-width: 240px;
  z-index: 100;
  padding: 0.5rem;
  cursor: default;
}
.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-align: right;
}
.user-role {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
}
.user-email {
  font-size: 0.7rem;
  color: #6b7280;
}
.user-badge {
  font-size: 0.65rem;
  color: #000000;
  font-weight: 600;
  margin-top: 0.1rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.25rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.65rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}
.dropdown-item:hover {
  background: var(--bg-main);
  color: var(--text-main);
}

.split-item {
  justify-content: space-between;
}

.lang-text {
  color: #6b7280;
  font-weight: 600;
}

.lang-switch-container {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-main);
}

.theme-switch-container {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-main);
}

.justify-end {
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--border-color);
  transition: .3s;
  border-radius: 34px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #000000;
}
input:checked + .slider:before {
  transform: translateX(14px);
}

.logout-item { color: #dc2626; }
.logout-item:hover { background: #fef2f2; color: #dc2626; }

/* ===== PAGE CONTENT ===== */
.page-content {
  flex: 1;
  min-height: 0;
  min-width: 0;
  padding: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 1024px) {
  .mobile-toggle-btn {
    display: inline-flex;
  }
  .mobile-close-btn {
    display: inline-flex;
  }
  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    z-index: 999;
  }
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    height: 100vh;
    height: 100dvh;
    z-index: 1000;
    transform: translateX(100%);
    box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  }
  [dir="ltr"] .sidebar {
    right: auto;
    left: 0;
    transform: translateX(-100%);
    box-shadow: 4px 0 20px rgba(0,0,0,0.15);
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  .main-area {
    width: 100%;
    min-width: 0;
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
  .page-content {
    padding: 1rem 0.75rem;
  }
}
</style>
