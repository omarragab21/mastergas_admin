<template>
  <div class="customers-page">
    <!-- View Mode: List -->
    <div v-if="viewMode === 'list'" class="list-view-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-titles">
          <div class="title-with-icon">
            <h2 class="page-title">إدارة العملاء</h2>
            <div class="count-badge">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
               </svg>
            </div>
          </div>
          <p class="page-subtitle">إدارة حسابات العملاء والمعلومات</p>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="filters-row">
        <div class="filter-select">
          <select v-model="statusFilter" class="form-select">
            <option value="">جميع الحالات</option>
            <option value="1">نشط</option>
            <option value="0">غير نشط</option>
          </select>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="select-icon" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="search-icon">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" v-model="searchQuery" placeholder="البحث عن عميل..." class="search-input" />
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-name text-right">الاسم</th>
              <th class="col-email">البريد الإلكتروني</th>
              <th class="col-phone">رقم الجوال</th>
              <th class="col-city">المدينة</th>
              <th class="col-orders">الطلبات</th>
              <th class="col-spent">إجمالي الإنفاق</th>
              <th class="col-status">الحالة</th>
              <th class="col-actions">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="state-row"><td colspan="8">جاري التحميل...</td></tr>
            <tr v-else-if="filteredCustomers.length === 0" class="state-row"><td colspan="8">لا يوجد عملاء مطابقين</td></tr>
            <template v-else>
              <tr v-for="customer in filteredCustomers" :key="customer.id" class="data-row">
                <td class="col-name text-right">
                  <span class="customer-name">{{ customer.name }}</span>
                </td>
                <td class="col-email">
                  <span class="customer-email">{{ customer.email }}</span>
                </td>
                <td class="col-phone ltr-text">
                  {{ customer.phone || '-' }}
                </td>
                <td class="col-city">
                  {{ customer.city || '-' }}
                </td>
                <td class="col-orders">
                  {{ customer.orders_count || 0 }}
                </td>
                <td class="col-spent">
                  {{ formatPrice(customer.total_spent || 0) }} د.أ
                </td>
                <td class="col-status">
                  <span :class="['status-badge-table', customer.is_active ? 'active' : 'inactive']">
                    {{ customer.is_active ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="col-actions">
                  <div class="actions-group">
                     <button class="action-btn delete-btn" @click="confirmDelete(customer)" title="حذف">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                    <button class="action-btn view-btn" @click="openDetail(customer)" title="عرض">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- View Mode: Detail (Figma Exact) -->
    <div v-if="viewMode === 'detail'" class="detail-view-container">
      <!-- Detail Header -->
      <div class="detail-header">
        <div class="header-left">
          <div class="block-toggle-group">
            <span class="toggle-label" :class="{ 'blocked': !selectedCustomer?.is_active }">{{ !selectedCustomer?.is_active ? 'محظور' : 'حظر' }}</span>
            <div class="block-toggle" :class="{ 'active': !selectedCustomer?.is_active }" @click="toggleCustomerStatus">
              <div class="toggle-circle"></div>
            </div>
            <svg class="block-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
        </div>

        <div class="header-right">
          <div class="customer-info-group">
            <div class="customer-text">
              <div class="name-row">
                <span class="status-tag active" v-if="selectedCustomer?.is_active">نشط</span>
                <h2 class="detail-name">{{ selectedCustomer?.name }}</h2>
              </div>
              <p class="detail-contact">
                <span dir="ltr">{{ selectedCustomer?.phone }}</span> | <span>{{ selectedCustomer?.email }}</span>
              </p>
            </div>
            <div class="customer-avatar-large">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <button class="back-btn" @click="viewMode = 'list'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">إجمالي الطلبات</p>
          <p class="stat-value">{{ selectedCustomer?.orders_count || 0 }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">إجمالي الإنفاق</p>
          <p class="stat-value highlighted">{{ formatPrice(selectedCustomer?.total_spent || 0) }} د.أ</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">رصيد المحفظة</p>
          <p class="stat-value wallet">{{ formatPrice(selectedCustomer?.balance || 0) }} د.أ</p>
        </div>
        <!-- Disabled temporarily - loyalty points feature -->
        <!-- <div class="stat-card">
          <p class="stat-label">نقاط الولاء</p>
          <p class="stat-value points">{{ selectedCustomer?.points || 0 }}</p>
        </div> -->
        <div class="stat-card">
          <p class="stat-label">المدينة</p>
          <p class="stat-value">{{ selectedCustomer?.city || 'عمان' }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">تاريخ الانضمام</p>
          <p class="stat-value date">{{ formatDate(selectedCustomer?.created_at) }}</p>
        </div>
      </div>

      <!-- Tabs Section -->
      <div class="detail-tabs">
        <div class="tabs-list">
          <button class="detail-tab-btn" :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            <span>سجل الطلبات</span>
            <span class="tab-count">{{ selectedCustomer?.orders?.length || 0 }}</span>
          </button>
          <button class="detail-tab-btn" :class="{ active: activeTab === 'wishlist' }" @click="activeTab = 'wishlist'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>المفضلة</span>
            <span class="tab-count">{{ selectedCustomer?.wishlists?.length || 0 }}</span>
          </button>
          <button class="detail-tab-btn" :class="{ active: activeTab === 'addresses' }" @click="activeTab = 'addresses'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>عناوين الشحن</span>
            <span class="tab-count">{{ selectedCustomer?.addresses?.length || 0 }}</span>
          </button>
          <button class="detail-tab-btn" :class="{ active: activeTab === 'reviews' }" @click="activeTab = 'reviews'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>التقييمات</span>
            <span class="tab-count">{{ selectedCustomer?.reviews?.length || 0 }}</span>
          </button>
        </div>
      </div>

      <!-- Tab Content: Orders -->
      <div v-if="activeTab === 'orders'" class="tab-content-area">
        <div class="detail-table-container">
          <table class="detail-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>التاريخ</th>
                <th>المنتجات</th>
                <th>المبلغ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in selectedCustomer?.orders" :key="order.id">
                <td class="order-id">#{{ order.order_number || order.id }}</td>
                <td class="order-date">{{ formatDate(order.date || order.created_at) }}</td>
                <td class="order-items-count">{{ order.products?.length || 1 }} منتجات</td>
                <td class="order-amount">{{ formatPrice(order.total || order.total_amount) }} د.أ</td>
                <td class="order-status">
                  <span :class="['status-badge-detail', getStatusClass(order.status)]">{{ getStatusLabel(order.status) }}</span>
                </td>
              </tr>
              <tr v-if="!selectedCustomer?.orders?.length">
                <td colspan="5" style="text-align: center; padding: 3rem; color: #9ca3af;">لا يوجد طلبات لهذا العميل</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Content: Wishlist -->
      <div v-else-if="activeTab === 'wishlist'" class="tab-content-area">
        <div class="wishlist-grid" v-if="selectedCustomer?.wishlists?.length">
            <div v-for="item in selectedCustomer.wishlists" :key="item.id" class="wishlist-item-card">
                <img :src="getImageUrl(item.product?.image)" class="wishlist-img" />
                <div class="wishlist-info">
                    <h4>{{ item.product?.name }}</h4>
                    <p>{{ formatPrice(item.product?.price) }} د.أ</p>
                </div>
            </div>
        </div>
        <div v-else class="empty-placeholder">
            <p>لا توجد منتجات في المفضلة</p>
        </div>
      </div>

      <!-- Tab Content: Addresses -->
      <div v-else-if="activeTab === 'addresses'" class="tab-content-area">
        <div class="addresses-grid" v-if="selectedCustomer?.addresses?.length">
            <div v-for="addr in selectedCustomer.addresses" :key="addr.id" class="address-card">
                <div class="addr-header">
                    <span class="addr-tag">{{ addr.name }}</span>
                    <span v-if="addr.is_default" class="default-badge">افتراضي</span>
                </div>
                <h4 class="addr-name">{{ addr.full_name }}</h4>
                <p class="addr-text">{{ addr.address }}, {{ addr.city }}</p>
                <p class="addr-phone">{{ addr.phone }}</p>
            </div>
        </div>
        <div v-else class="empty-placeholder">
            <p>لا توجد عناوين مسجلة</p>
        </div>
      </div>

      <!-- Tab Content: Reviews -->
      <div v-else-if="activeTab === 'reviews'" class="tab-content-area">
        <div class="reviews-list" v-if="selectedCustomer?.reviews?.length">
            <div v-for="review in selectedCustomer.reviews" :key="review.id" class="review-item-detail">
                <div class="review-header-row">
                    <div class="review-stars">
                        <i v-for="i in 5" :key="i" class="fas fa-star" :class="{ 'active': i <= review.rating }"></i>
                    </div>
                    <span class="review-date">{{ formatDate(review.created_at) }}</span>
                </div>
                <p class="review-comment">{{ review.comment }}</p>
            </div>
        </div>
        <div v-else class="empty-placeholder">
            <p>لا توجد تقييمات من هذا العميل</p>
        </div>
      </div>
      
    </div>

    <!-- Alert Message -->
    <div class="alert-toast" :class="[alertType, { show: showAlert }]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
        <path v-if="alertType === 'success'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline v-if="alertType === 'success'" points="22 4 12 14.01 9 11.01"/>
        <circle v-if="alertType === 'error'" cx="12" cy="12" r="10"/><line v-if="alertType === 'error'" x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ alertMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../config/axios';

// States
const customers = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');

// View Mode
const viewMode = ref('list'); // 'list' or 'detail'
const selectedCustomer = ref(null);
const activeTab = ref('orders');

const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('success');

// Utils
const formatPrice = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '-';

const getImageUrl = (path) => {
  if (!path) return '/placeholder-product.png';
  if (path.startsWith('http')) return path;
  const baseUrl = api.defaults.baseURL;
  return `${baseUrl.replace('/api', '')}/storage/${path}`;
};

const triggerAlert = (msg, type = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  showAlert.value = true;
  setTimeout(() => { showAlert.value = false; }, 3000);
};

// Fetch Data
const fetchCustomers = async () => {
  loading.value = true;
  try {
    const res = await api.get('/dashboard/customers');
    const payload = res.data?.data ?? res.data;
    customers.value = Array.isArray(payload) ? payload : (payload?.data || payload?.items || []);
  } catch (err) {
    triggerAlert('فشل تحميل بيانات العملاء', 'error');
  } finally {
    loading.value = false;
  }
};

const openDetail = async (customer) => {
  loading.value = true;
  try {
    const res = await api.get(`/dashboard/customers/${customer.id}`);
    selectedCustomer.value = res.data.data || res.data;
    console.log('Customer detail data:', selectedCustomer.value);
    console.log('Orders count:', selectedCustomer.value?.orders?.length);
    console.log('Addresses count:', selectedCustomer.value?.addresses?.length);
    console.log('Wishlists count:', selectedCustomer.value?.wishlists?.length);
    console.log('Reviews count:', selectedCustomer.value?.reviews?.length);
    viewMode.value = 'detail';
    activeTab.value = 'orders';
  } catch (err) {
    console.error('Failed to load customer detail:', err);
    triggerAlert('فشل تحميل تفاصيل العميل', 'error');
  } finally {
    loading.value = false;
  }
};

const toggleCustomerStatus = async () => {
  if (!selectedCustomer.value) return;
  const newStatus = !selectedCustomer.value.is_active;
  try {
    await api.put(`/dashboard/customers/${selectedCustomer.value.id}`, {
      is_active: newStatus
    });
    selectedCustomer.value.is_active = newStatus;
    triggerAlert(newStatus ? 'تم تنشيط العميل' : 'تم حظر العميل');
  } catch (err) {
    triggerAlert('فشل تحديث حالة العميل', 'error');
  }
};

const confirmDelete = async (customer) => {
  if (confirm(`هل أنت متأكد من حذف العميل "${customer.name}"؟`)) {
    try {
      await api.delete(`/dashboard/customers/${customer.id}`);
      // Remove the row immediately, then reconcile with the server response.
      customers.value = customers.value.filter((item) => Number(item.id) !== Number(customer.id));
      await fetchCustomers();
      const stillExists = customers.value.some((item) => Number(item.id) === Number(customer.id));
      if (stillExists) {
        triggerAlert('تم تنفيذ الحذف لكن ما زال العميل ظاهرًا من السيرفر', 'error');
        return;
      }
      triggerAlert('تم حذف العميل بنجاح');
    } catch (err) {
      // Restore the row when the delete request or reconciliation fails.
      await fetchCustomers();
      triggerAlert(err.response?.data?.message || 'فشل حذف العميل', 'error');
    }
  }
};

const getStatusLabel = (status) => {
    const labels = {
        'pending': 'قيد الانتظار',
        'processing': 'جاري التحضير',
        'shipped': 'تم الشحن',
        'delivered': 'تم التوصيل',
        'completed': 'مكتمل',
        'cancelled': 'ملغي'
    };
    return labels[status] || status;
};

const getStatusClass = (status) => {
    if (status === 'delivered' || status === 'completed') return 'delivered';
    if (status === 'cancelled') return 'cancelled';
    return 'pending';
};

onMounted(() => {
  fetchCustomers();
});

// Filtering
const filteredCustomers = computed(() => {
  if (!Array.isArray(customers.value)) return [];
  return customers.value.filter(c => {
    const nameMatch = c.name?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const emailMatch = c.email?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const phoneMatch = c.phone?.includes(searchQuery.value) || false;
    
    const queryMatch = nameMatch || emailMatch || phoneMatch;
    const statusMatch = statusFilter.value === '' ? true : (c.is_active ? '1' : '0') === statusFilter.value;
    
    return queryMatch && statusMatch;
  });
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap');

.customers-page {
  display: flex; flex-direction: column; gap: 1.5rem; direction: rtl; 
  font-family: 'IBM Plex Sans Arabic', sans-serif; padding-bottom: 2rem;
}

/* --- List View Styles --- */
.page-header { display: flex; align-items: center; justify-content: space-between; }
.title-with-icon { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.2rem; }
.page-title { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 0; }
.count-badge { background: #fdf2f8; color: #db2777; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.page-subtitle { font-size: 0.85rem; color: #6b7280; margin: 0; }

.filters-row { display: flex; gap: 1rem; align-items: center; }
.search-box { flex: 1; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; right: 1rem; color: #9ca3af; }
.search-input { width: 100%; padding: 0.7rem 2.8rem 0.7rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; outline: none; background: #fff; transition: border-color 0.2s; }
.search-input:focus { border-color: #873260; }

.filter-select { position: relative; display: flex; align-items: center; min-width: 180px; }
.form-select { width: 100%; padding: 0.7rem 1rem 0.7rem 2.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #374151; appearance: none; outline: none; cursor: pointer; }
.filter-select .select-icon { position: absolute; left: 1rem; color: #9ca3af; pointer-events: none; }

.table-container { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1.1rem 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; text-align: center; }
.data-table th { background: #f9fafb; font-size: 0.75rem; font-weight: 700; color: #6b7280; white-space: nowrap; }
.data-table td { font-size: 0.85rem; color: #374151; }
.data-row:hover td { background: #fdfafb; }
.state-row td { text-align: center; color: #6b7280; padding: 2.5rem; }

.text-right { text-align: right !important; }
.ltr-text { direction: ltr; }

.customer-name { font-weight: 700; color: #111827; }
.customer-email { color: #6b7280; font-size: 0.8rem; }

.status-badge-table { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }
.status-badge-table.active { background: #ecfdf5; color: #059669; }
.status-badge-table.inactive { background: #f3f4f6; color: #6b7280; }

.actions-group { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.action-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; }
.view-btn { background: #fdf2f8; color: #db2777; }
.view-btn:hover { background: #fce7f3; }
.delete-btn { background: #fef2f2; color: #dc2626; }
.delete-btn:hover { background: #fee2e2; }

/* --- Detail View Styles (Figma Match) --- */
.detail-view-container {
  display: flex; flex-direction: column; gap: 2rem;
}

.detail-header {
  display: flex; justify-content: space-between; align-items: center; padding: 1rem 0;
}

.block-toggle-group {
  display: flex; align-items: center; gap: 1rem; color: #ef4444; font-weight: 700;
}

.block-toggle {
  width: 48px; height: 24px; background: #e5e7eb; border-radius: 50px; position: relative; cursor: pointer; transition: 0.3s;
}

.toggle-circle {
  width: 18px; height: 18px; background: #fff; border-radius: 50%; position: absolute; top: 3px; right: 3px; transition: 0.3s;
}

.block-toggle.active { background: #ef4444; }
.block-toggle.active .toggle-circle { transform: translateX(-24px); }

.customer-info-group {
  display: flex; align-items: center; gap: 1.5rem;
}

.customer-text { text-align: right; }
.name-row { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; }
.detail-name { font-size: 1.6rem; font-weight: 800; color: #111827; margin: 0; }
.status-tag { padding: 0.2rem 0.8rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
.status-tag.active { background: #dcfce7; color: #16a34a; }

.detail-contact { color: #6b7280; font-size: 0.9rem; margin-top: 0.25rem; }

.customer-avatar-large {
  width: 56px; height: 56px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9ca3af;
}

.back-btn {
  width: 40px; height: 40px; background: #fff; border: 1px solid #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; transition: 0.2s;
}
.back-btn:hover { background: #f9fafb; color: #111827; }

/* Stats Grid */
.stats-grid {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem;
}

.stat-card {
  background: #fff; border: 1px solid #f3f4f6; border-radius: 12px; padding: 1.5rem; text-align: center;
}

.stat-label { font-size: 0.85rem; color: #9ca3af; font-weight: 600; margin-bottom: 0.75rem; }
.stat-value { font-size: 1.5rem; font-weight: 800; color: #111827; margin: 0; }
.stat-value.highlighted { color: #111827; }
.stat-value.wallet { color: #10b981; }
.stat-value.points { color: #f59e0b; }
.stat-value.date { font-size: 1.1rem; }

/* Tabs */
.detail-tabs {
  border-bottom: 2px solid #f3f4f6; margin-top: 1rem;
}

.tabs-list { display: flex; gap: 2rem; }

.detail-tab-btn {
  display: flex; align-items: center; gap: 0.5rem; padding: 1rem 0; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer; color: #9ca3af; font-weight: 700; transition: 0.2s; position: relative; bottom: -2px;
}

.detail-tab-btn span { font-size: 0.95rem; }
.tab-count { background: #f3f4f6; padding: 0.1rem 0.5rem; border-radius: 50px; font-size: 0.75rem; }

.detail-tab-btn.active { color: #873260; border-bottom-color: #873260; }
.detail-tab-btn.active .tab-count { background: #fce7f3; color: #873260; }

/* Detail Table */
.tab-content-area { background: #fff; border-radius: 12px; padding: 0; border: 1px solid #f3f4f6; overflow: hidden; min-height: 200px; }
.detail-table { width: 100%; border-collapse: collapse; }
.detail-table th { background: #f9fafb; padding: 1.25rem; text-align: right; font-size: 0.8rem; color: #6b7280; font-weight: 700; }
.detail-table td { padding: 1.25rem; text-align: right; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; color: #374151; font-weight: 500; }
.detail-table tr:last-child td { border-bottom: none; }

.order-id { font-weight: 700; color: #873260; }
.order-amount { font-weight: 700; }

.status-badge-detail { padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
.status-badge-detail.delivered { background: #dcfce7; color: #16a34a; }
.status-badge-detail.pending { background: #fff7ed; color: #ea580c; }
.status-badge-detail.cancelled { background: #fef2f2; color: #dc2626; }

/* Wishlist Grid */
.wishlist-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; padding: 1.5rem; }
.wishlist-item-card { border: 1px solid #f3f4f6; border-radius: 12px; overflow: hidden; }
.wishlist-img { width: 100%; height: 150px; object-fit: cover; }
.wishlist-info { padding: 1rem; text-align: center; }
.wishlist-info h4 { font-size: 0.9rem; margin-bottom: 0.5rem; }
.wishlist-info p { font-weight: 800; color: #873260; }

/* Addresses Grid */
.addresses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; padding: 1.5rem; }
.address-card { background: #f9fafb; border-radius: 12px; padding: 1.5rem; border: 1px solid #f3f4f6; }
.addr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.addr-tag { background: #fff; padding: 0.2rem 0.8rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; border: 1px solid #e5e7eb; }
.default-badge { font-size: 0.7rem; color: #16a34a; font-weight: 700; }
.addr-name { margin-bottom: 0.5rem; font-weight: 700; }
.addr-text { color: #6b7280; font-size: 0.85rem; margin-bottom: 0.5rem; }
.addr-phone { font-size: 0.85rem; font-weight: 600; direction: ltr; text-align: right; }

/* Reviews List */
.reviews-list { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
.review-item-detail { border-bottom: 1px solid #f3f4f6; padding-bottom: 1.5rem; }
.review-item-detail:last-child { border-bottom: none; }
.review-header-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
.review-stars { color: #e5e7eb; font-size: 0.8rem; }
.review-stars i.active { color: #f59e0b; }
.review-date { font-size: 0.8rem; color: #9ca3af; }
.review-comment { font-size: 0.95rem; color: #374151; }

.empty-placeholder { padding: 4rem; text-align: center; color: #9ca3af; font-size: 1.1rem; }

/* Alerts */
.alert-toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: 12px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 0.75rem; transform: translateY(150%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 2000; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; font-size: 0.9rem; }
.alert-toast.show { transform: translateY(0); }
.alert-toast.success { border-right: 4px solid #059669; color: #065f46; }
.alert-toast.error { border-right: 4px solid #dc2626; color: #991b1b; }

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .detail-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .header-right { width: 100%; justify-content: space-between; }
  .tabs-list { overflow-x: auto; padding-bottom: 1rem; }
  .wishlist-grid, .addresses-grid { grid-template-columns: 1fr; }
}
</style>
