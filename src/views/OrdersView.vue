<template>
  <div class="orders-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-titles">
        <h2 class="page-title">إدارة الطلبات</h2>
        <p class="page-subtitle">متابعة وإدارة جميع الطلبات</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card total-orders">
        <div class="stat-content">
          <span class="stat-value">{{ totalOrders }}</span>
          <span class="stat-label">إجمالي الطلبات</span>
        </div>
        <div class="stat-icon-wrapper total-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
      </div>
      <div class="stat-card stat-pending">
        <div class="stat-content">
          <span class="stat-value">{{ pendingOrders }}</span>
          <span class="stat-label">قيد الانتظار</span>
        </div>
        <div class="stat-icon-wrapper pending-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
      </div>
      <div class="stat-card stat-processing">
        <div class="stat-content">
          <span class="stat-value">{{ processingOrders }}</span>
          <span class="stat-label">قيد المعالجة</span>
        </div>
        <div class="stat-icon-wrapper processing-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
      </div>
      <div class="stat-card stat-delivered">
        <div class="stat-content">
          <span class="stat-value">{{ deliveredOrders }}</span>
          <span class="stat-label">تم التوصيل</span>
        </div>
        <div class="stat-icon-wrapper success-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="filters-row">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="search-icon">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" v-model="searchQuery" placeholder="بحث برقم الطلب أو اسم العميل..." class="search-input" />
      </div>
      <div class="filter-group">
        <div class="date-filter">
          <input type="date" v-model="dateFrom" class="form-control" />
          <span class="date-separator">-</span>
          <input type="date" v-model="dateTo" class="form-control" />
        </div>
        <div class="filter-select">
          <select v-model="statusFilter" class="form-select">
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="processing">قيد المعالجة</option>
            <option value="shipped">قيد الشحن</option>
            <option value="delivered">تم التوصيل</option>
            <option value="cancelled">ملغي</option>
          </select>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="select-icon" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-order-num">رقم الطلب</th>
            <th class="col-customer">العميل</th>
            <th class="col-products">المنتجات</th>
            <th class="col-total">المبلغ</th>
            <th class="col-status">الحالة</th>
            <th class="col-date">التاريخ</th>
            <th class="col-actions">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="state-row"><td colspan="7">جاري التحميل...</td></tr>
          <tr v-else-if="filteredOrders.length === 0" class="state-row"><td colspan="7">لا توجد طلبات مطابقة</td></tr>
          <template v-else>
            <tr v-for="order in filteredOrders" :key="order.id" class="data-row">
              <td class="col-order-num">
                <span class="order-number">#{{ order.orderNumber }}</span>
                <i v-if="order.isGift" class="fas fa-gift gift-badge-icon" title="طلب هدية"></i>
              </td>
              <td class="col-customer">
                <div class="customer-cell">
                  <span class="font-bold">{{ order.customerName || 'عميل محذوف' }}</span>
                </div>
              </td>
              <td class="col-products">
                <div class="products-cell">
                  <div class="products-imgs-group" v-if="order.products?.length">
                    <!-- Display up to 3 products -->
                    <div class="product-img-circle" v-for="(prod, idx) in order.products.slice(0, 3)" :key="idx" :style="{ zIndex: 10 - idx }">
                      <img v-if="prod.image" :src="prod.image" />
                      <div v-else class="img-placeholder"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></div>
                    </div>
                    <!-- If more than 3, show +X -->
                    <div v-if="order.products.length > 3" class="more-images-circle" :style="{ zIndex: 0 }">
                      +{{ order.products.length - 3 }}
                    </div>
                  </div>
                  <span class="products-count">{{ order.products?.length || 0 }} منتج</span>
                </div>
              </td>
              <td class="col-total">
                <span class="total-amount">{{ formatPrice(order.total) }} د.أ</span>
              </td>
              <td class="col-status">
                <span class="status-badge" :class="order.status">
                  {{ statusText(order.status) }}
                </span>
              </td>
              <td class="col-date">
                <span class="date-text">{{ order.date }}</span>
              </td>
              <td class="col-actions">
                <div class="actions-group">
                  <button class="action-btn delete-btn" @click="confirmDelete(order)" title="حذف">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                  <button class="action-btn view-btn" @click="openViewModal(order)" title="عرض التفاصيل">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- View Modal Details -->
    <div class="modal-overlay" v-if="showViewModal" @click.self="showViewModal = false;">
      <div class="modal-content view-content-large">
        <div class="view-header-bar">
          <div class="right-col">
            <h3 class="view-title">تفاصيل الطلب #{{ viewOrder?.orderNumber }}</h3>
            <span class="view-time">{{ viewOrder?.date }} - {{ viewOrder?.time }}</span>
            <span class="status-badge" :class="viewOrder?.status">{{ statusText(viewOrder?.status) }}</span>
          </div>
          <div class="left-col">
            <button class="btn-outline" @click="openStatusModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67-2.36"/></svg>
              تحديث الحالة
            </button>
            <button class="modal-close" @click="showViewModal = false;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div class="view-body-wrapper">
          <!-- Stepper -->
          <div class="order-stepper">
            <div class="step" :class="getStepClass('pending')">
              <div class="step-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span>استلام الطلب</span>
            </div>
            <div class="step-line" :class="getLineClass('processing')"></div>
            <div class="step" :class="getStepClass('processing')">
              <div class="step-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span>قيد التحضير</span>
            </div>
            <div class="step-line" :class="getLineClass('shipped')"></div>
            <div class="step" :class="getStepClass('shipped')">
              <div class="step-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span>قيد الشحن</span>
            </div>
            <div class="step-line" :class="getLineClass('delivered')"></div>
            <div class="step" :class="getStepClass('delivered')">
              <div class="step-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span>تم التسليم</span>
            </div>
          </div>

          <div class="order-layout">
            <!-- Right side (Products & Customer) -->
            <div class="content-main">
              <div class="card-section">
                <h4 class="section-heading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  منتجات الطلب
                </h4>
                <table class="products-table">
                  <thead>
                    <tr>
                      <th class="text-right">المنتج</th>
                      <th>الكمية</th>
                      <th>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="prod in viewOrder?.products" :key="prod.id">
                      <td>
                        <div class="p-info">
                          <img v-if="prod.image" :src="prod.image" :alt="prod.name" />
                          <div v-else class="img-placeholder"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></div>
                          <div class="p-texts">
                            <span class="p-name">{{ prod.name }}</span>
                            <div class="p-attrs-v2" v-if="prod.attributes">
                              <span v-for="(val, label) in prod.attributes" :key="label" class="attr-tag-v2">
                                {{ label }}: {{ val }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="text-center font-bold">{{ prod.quantity }}</td>
                      <td class="text-center">{{ formatPrice(prod.price * prod.quantity) }} د.أ</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="card-section">
                <h4 class="section-heading">معلومات العميل</h4>
                <div class="customer-info-grid">
                  <div class="info-item">
                    <span class="info-label">الاسم</span>
                    <span class="info-val font-bold">{{ viewOrder?.customerName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">الهاتف</span>
                    <span class="info-val ltr flex-end" style="direction:ltr; text-align:right; width: 100%">{{ viewOrder?.customerPhone }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">البريد الإلكتروني</span>
                    <span class="info-val">{{ viewOrder?.customerEmail || 'لا يوجد' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">العنوان</span>
                    <span class="info-val">{{ viewOrder?.customerAddress || 'لا يوجد' }}</span>
                  </div>
                </div>
              </div>

              <div class="card-section" v-if="viewOrder?.activityLog && viewOrder.activityLog.length">
                <h4 class="section-heading">سجل النشاط</h4>
                <div class="activity-timeline">
                  <div class="timeline-item" v-for="(log, idx) in viewOrder.activityLog" :key="idx">
                    <div class="ti-date">{{ log.date }}<br>{{ log.time }}</div>
                    <div class="ti-bullet"></div>
                    <div class="ti-content">
                      <p class="ti-msg">{{ log.message }}</p>
                      <span class="ti-status" :class="log.status" v-if="log.status">{{ statusText(log.status) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Left side (Summary) -->
            <div class="content-side">
              <div class="card-section">
                <h4 class="section-heading">ملخص الطلب</h4>
                <div class="summary-rows">
                  <div class="s-row">
                    <span>المجموع الفرعي</span>
                    <span>{{ formatPrice(viewOrder?.subtotal) }} د.أ</span>
                  </div>
                  <div class="s-row">
                    <span>الشحن</span>
                    <span>{{ formatPrice(viewOrder?.shipping) }} د.أ</span>
                  </div>
                  <div class="s-row" v-if="viewOrder?.discount > 0">
                    <span>الخصم</span>
                    <span class="green-text">-{{ formatPrice(viewOrder?.discount) }} د.أ</span>
                  </div>
                  <div class="s-row total">
                    <span>الإجمالي</span>
                    <span>{{ formatPrice(viewOrder?.total) }} د.أ</span>
                  </div>
                  <div class="s-row flex-start mt-1">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <span class="text-gray">{{ getPaymentMethodText(viewOrder) }}</span>
                  </div>
                </div>
              </div>

              <!-- Gift Info Section in Details -->
              <div class="card-section gift-admin-section" v-if="viewOrder?.isGift">
                <h4 class="section-heading">
                  <i class="fas fa-gift"></i>
                  طلب هدية
                </h4>
                <div class="gift-msg-admin">
                  <span class="info-label">رسالة الإهداء:</span>
                  <p class="gift-text-admin">{{ viewOrder?.giftMessage || 'بدون رسالة' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div class="modal-overlay" v-if="showStatusModal" @click.self="showStatusModal = false;">
      <div class="modal-content status-content">
        <button class="modal-close" @click="showStatusModal = false;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="status-header">
          <div class="icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67-2.36"/></svg>
          </div>
          <h3 class="modal-title">تحديث حالة الطلب</h3>
          <p class="modal-subtitle">اختر الحالة الجديدة للطلب رقم #{{ viewOrder?.orderNumber }}</p>
        </div>

        <form @submit.prevent="submitStatusUpdate" class="status-form">
          <div class="form-group">
            <label class="form-label">الحالة الحالية: <span class="status-badge" :class="viewOrder?.status">{{ statusText(viewOrder?.status) }}</span></label>
          </div>
          <div class="form-group">
            <label class="form-label">الحالة الجديدة <span class="req">*</span></label>
            <div class="select-wrapper">
              <select v-model="statusForm.status" class="form-control" required>
                <option value="pending">قيد الانتظار</option>
                <option value="processing">قيد المعالجة</option>
                <option value="shipped">قيد الشحن</option>
                <option value="delivered">تم التوصيل</option>
                <option value="cancelled">ملغي</option>
              </select>
              <svg class="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">ملاحظة إضافية للمستخدم (اختياري)</label>
            <textarea v-model="statusForm.note" class="form-control text-area" placeholder="أضف ملاحظة توضح سبب التحديث..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="showStatusModal = false;">إلغاء</button>
            <button type="submit" class="btn-submit" :disabled="isSubmittingStatus">
              {{ isSubmittingStatus ? 'جاري التحديث...' : 'تحديث الحالة' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Alert Message -->
    <div class="alert-toast" :class="[alertType, { show: showAlert }]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
        <path v-if="alertType === 'success'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline v-if="alertType === 'success'" points="22 4 12 14.01 9 11.01"/>
        <circle v-if="alertType === 'error'" cx="12" cy="12" r="10"/><line v-if="alertType === 'error'" x1="12" y1="8" x2="12" y2="12"/><line v-if="alertType === 'error'" x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ alertMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../config/axios';

const orders = ref([]);
const loading = ref(false);

const searchQuery = ref('');
const statusFilter = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const showViewModal = ref(false);
const showStatusModal = ref(false);
const viewOrder = ref(null);

const isSubmittingStatus = ref(false);
const statusForm = ref({ status: '', note: '' });

// Dictionary
const statuses = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  shipped: 'قيد الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي'
};
const paymentMethods = {
  cod: 'دفع عند الاستلام (COD)',
  cash: 'دفع عند الاستلام',
  card: 'بطاقة ائتمان (Paytabs)',
  paytabs: 'بطاقة ائتمان (Paytabs)',
  credit_card: 'بطاقة ائتمان',
  wallet: 'المحفظة الإلكترونية',
  bank_transfer: 'تحويل بنكي'
};

const getPaymentMethodText = (order) => {
  if (!order) return 'غير محدد';
  const method = order.paymentMethod || order.payment_method || order.payment_type;
  if (!method) return 'دفع عند الاستلام';
  const key = method.toString().toLowerCase().trim();
  return paymentMethods[key] || method;
};

const statusText = (status) => statuses[status] || status;

// Stats
const totalOrders = computed(() => orders.value.length);
const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending').length);
const processingOrders = computed(() => orders.value.filter(o => o.status === 'processing').length);
const deliveredOrders = computed(() => orders.value.filter(o => o.status === 'delivered').length);

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    const matchQ = (o.orderNumber?.includes(searchQuery.value) || o.customerName?.includes(searchQuery.value));
    const matchS = statusFilter.value ? o.status === statusFilter.value : true;
    let matchD = true;
    if (dateFrom.value && o.date) {
      matchD = matchD && o.date >= dateFrom.value;
    }
    if (dateTo.value && o.date) {
      matchD = matchD && o.date <= dateTo.value;
    }
    return matchQ && matchS && matchD;
  });
});

// Alerts
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('success');
const triggerAlert = (msg, type = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  showAlert.value = true;
  setTimeout(() => { showAlert.value = false; }, 3000);
};

const formatPrice = (p) => Number(p || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await api.get('/dashboard/orders');
    orders.value = res.data.data;
  } catch (err) {
    triggerAlert('فشل استيراد الطلبات', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrders();
});

const openViewModal = (order) => {
  viewOrder.value = order;
  showViewModal.value = true;
};

const openStatusModal = () => {
  statusForm.value = { status: viewOrder.value.status, note: '' };
  showStatusModal.value = true;
};

// Stepper Logic
const orderSteps = ['pending', 'processing', 'shipped', 'delivered'];
const getStepClass = (step) => {
  if (!viewOrder.value) return '';
  const cIdx = orderSteps.indexOf(viewOrder.value.status);
  const sIdx = orderSteps.indexOf(step);
  if (viewOrder.value.status === 'cancelled') return 'disabled';
  if (sIdx < cIdx) return 'completed';
  if (sIdx === cIdx) return 'active';
  return 'disabled';
};
const getLineClass = (stepTo) => {
  if (!viewOrder.value) return '';
  const cIdx = orderSteps.indexOf(viewOrder.value.status);
  const sIdx = orderSteps.indexOf(stepTo);
  if (viewOrder.value.status === 'cancelled') return 'disabled';
  if (sIdx <= cIdx) return 'completed';
  return 'disabled';
};

const submitStatusUpdate = async () => {
  isSubmittingStatus.value = true;
  try {
    const res = await api.patch(`/dashboard/orders/${viewOrder.value.id}/status`, statusForm.value);
    triggerAlert('تم تحديث حالة الطلب بنجاح');
    showStatusModal.value = false;
    viewOrder.value = res.data.data; // update local view
    // Update in array
    const idx = orders.value.findIndex(o => o.id === viewOrder.value.id);
    if (idx !== -1) orders.value[idx] = res.data.data;
    window.dispatchEvent(new CustomEvent('orders-updated'));
  } catch (err) {
    triggerAlert(err.response?.data?.message || 'فشل التحديث', 'error');
  } finally {
    isSubmittingStatus.value = false;
  }
};

const confirmDelete = async (order) => {
  if (confirm(`تأكيد حذف الطلب #${order.orderNumber}؟ لا يمكن التراجع.`)) {
    try {
      await api.delete(`/dashboard/orders/${order.id}`);
      triggerAlert('تم الحذف بنجاح');
      fetchOrders();
      window.dispatchEvent(new CustomEvent('orders-updated'));
    } catch (err) {
      triggerAlert('فشل عملية الحذف', 'error');
    }
  }
};

</script>

<style scoped>
.orders-page {
  display: flex; flex-direction: column; gap: 1.5rem; direction: rtl; font-family: 'IBM Plex Sans Arabic', sans-serif; padding-bottom: 2rem;
}

/* Page Header */
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 1.4rem; font-weight: 800; color: #111827; margin-bottom: 0.2rem; }
.page-subtitle { font-size: 0.85rem; color: #6b7280; }

/* Stats Cards */
.stats-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.stat-content { display: flex; flex-direction: column; align-items: flex-start; }
.stat-value { font-size: 1.6rem; font-weight: 800; color: #111827; margin-bottom: 0.2rem; line-height: 1.2; }
.stat-label { font-size: 0.8rem; font-weight: 700; color: #6b7280; }
.stat-icon-wrapper { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.total-icon { background: #fdf2f8; color: #db2777; }
.pending-icon { background: #fffbeb; color: #d97706; }
.processing-icon { background: #eff6ff; color: #3b82f6; }
.success-icon { background: #ecfdf5; color: #059669; }

/* Filters */
.filters-row { display: flex; gap: 1rem; align-items: center; justify-content: space-between; flex-wrap: wrap;}
.search-box { flex: 1; min-width: 250px; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; right: 1rem; color: #9ca3af; }
.search-input { width: 100%; padding: 0.7rem 2.8rem 0.7rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; outline: none; background: #fff; transition: border-color 0.2s; }
.search-input:focus { border-color: #873260; }

.filter-group { display: flex; gap: 0.8rem; align-items: center; }
.date-filter { display: flex; align-items: center; gap: 0.5rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.3rem 0.5rem; }
.date-filter .form-control { border: none; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.8rem; color: #374151; outline: none; padding: 0.3rem; background: transparent; cursor: pointer; }
.date-separator { color: #9ca3af; font-weight: bold; }
.filter-select { position: relative; display: flex; align-items: center; min-width: 150px; }
.form-select { width: 100%; padding: 0.7rem 1rem 0.7rem 2.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #374151; appearance: none; outline: none; cursor: pointer; }
.filter-select .select-icon { position: absolute; left: 1rem; color: #9ca3af; pointer-events: none; }

/* Table */
.table-container { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.data-table th { background: #f9fafb; font-size: 0.75rem; font-weight: 700; color: #6b7280; white-space: nowrap; }
.data-table td { font-size: 0.85rem; color: #374151; }
.data-table tr:last-child td { border-bottom: none; }
.data-row:hover td { background: #fdfafb; }
.state-row td { text-align: center; color: #6b7280; padding: 2.5rem; }

/* Columns */
.col-order-num { text-align: right; width: 12%; }
.col-customer { text-align: right; width: 22%; }
.col-products { text-align: right; width: 18%; }
.col-total { text-align: center; width: 13%; }
.col-status { text-align: center; width: 12%; }
.col-date { text-align: center; width: 13%; }
.col-actions { text-align: left; width: 10%; padding-left: 1.5rem !important; }

.data-table th.col-actions, .data-table th.col-status, .data-table th.col-total, .data-table th.col-date { text-align: center; }
.data-table th.col-actions { text-align: left; padding-left: 1.5rem !important; }

.order-number { font-weight: 800; color: #db2777; font-size: 0.85rem; background: #fdf2f8; padding: 0.2rem 0.6rem; border-radius: 6px; }
.gift-badge-icon { color: #db2777; margin-right: 8px; font-size: 14px; animation: gift-bounce 2s infinite; }
@keyframes gift-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
.customer-cell { display: flex; align-items: center; gap: 0.8rem; }
.font-bold { font-weight: 700; color: #111827; }
.products-cell { display: flex; align-items: center; gap: 0.8rem; }
.products-imgs-group { display: flex; align-items: center; }
.product-img-circle { width: 34px; height: 34px; border-radius: 6px; overflow: hidden; border: 2px solid #fff; background: #f3f4f6; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.product-img-circle img { width: 100%; height: 100%; object-fit: cover; }
.more-images-circle { width: 34px; height: 34px; border-radius: 6px; border: 2px solid #fff; background: #fdf2f8; color: #873260; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.products-imgs-group > div:not(:last-child) { margin-left: -12px; }
.img-placeholder { color: #9ca3af; }
.products-count { font-weight: 600; color: #4b5563; font-size: 0.8rem; }
.total-amount { font-weight: 800; color: #111827; }
.date-text { color: #6b7280; font-size: 0.8rem; font-weight: 600; }

.status-badge { display: inline-block; padding: 0.3rem 0.7rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; white-space: nowrap; }
.status-badge.pending { background: #fffbeb; color: #d97706; }
.status-badge.processing { background: #eff6ff; color: #3b82f6; }
.status-badge.shipped { background: #f3e8ff; color: #7e22ce; }
.status-badge.delivered { background: #ecfdf5; color: #059669; }
.status-badge.cancelled { background: #fef2f2; color: #dc2626; }

.actions-group { display: flex; align-items: center; justify-content: flex-end; gap: 0.4rem; }
.action-btn { width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #9ca3af; transition: all 0.2s; }
.action-btn:hover { background: #f3f4f6; }
.delete-btn:hover { color: #dc2626; background: #fef2f2; }
.view-btn:hover { color: #873260; background: #fdf2f8; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; overflow-y: auto; }
.modal-content { background: #f9fafb; border-radius: 12px; width: 100%; position: relative; margin: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
.view-content-large { max-width: 1200px; padding: 0; overflow: hidden; }

/* Large View Header */
.view-header-bar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; background: #fff; border-bottom: 1px solid #f3f4f6; }
.right-col { display: flex; align-items: center; gap: 1rem; }
.view-title { font-size: 1.25rem; font-weight: 800; color: #111827; margin: 0; }
.view-time { font-size: 0.85rem; color: #6b7280; font-weight: 600; }
.left-col { display: flex; align-items: center; gap: 1rem; }
.btn-outline { background: #fff; border: 1px solid #e5e7eb; color: #374151; padding: 0.5rem 1rem; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
.btn-outline:hover { background: #f9fafb; border-color: #d1d5db; }
.modal-close { background: #f3f4f6; border: none; color: #6b7280; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.modal-close:hover { background: #e5e7eb; color: #111827; }

/* Stepper */
.view-body-wrapper { padding: 2rem; }
.order-stepper { display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 1.5rem 2rem; border-radius: 12px; border: 1px solid #f3f4f6; margin-bottom: 1.5rem; }
.step { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; z-index: 2; position: relative; }
.step-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #fff; border: 2px solid #e5e7eb; color: #d1d5db; font-weight: bold; transition: all 0.3s; }
.step span { font-size: 0.8rem; font-weight: 700; color: #9ca3af; transition: color 0.3s; }
.step-line { flex: 1; height: 2px; background: #e5e7eb; margin: 0 1rem; margin-top: -1.2rem; transition: background 0.3s; }
/* active / completed */
.step.completed .step-icon { background: #873260; border-color: #873260; color: #fff; }
.step.completed span { color: #873260; }
.step-line.completed { background: #873260; }
.step.active .step-icon { border-color: #873260; color: #873260; box-shadow: 0 0 0 4px #fdf2f8; }
.step.active span { color: #111827; }

/* Grid layout for details */
.order-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: start; }
.content-main { display: flex; flex-direction: column; gap: 1.5rem; }
.content-side { display: flex; flex-direction: column; gap: 1.5rem; }

.card-section { background: #fff; border-radius: 12px; border: 1px solid #f3f4f6; padding: 1.5rem; box-shadow: 0 1px 2px rgba(0,0,0,0.01); }
.section-heading { font-size: 0.95rem; font-weight: 800; color: #111827; margin: 0 0 1.25rem 0; display: flex; align-items: center; gap: 0.5rem; }
.section-heading svg { color: #873260; }

/* Table inside modal */
.products-table { width: 100%; border-collapse: collapse; }
.products-table th { text-align: right; font-size: 0.8rem; color: #6b7280; font-weight: 700; padding-bottom: 1rem; border-bottom: 1px solid #f3f4f6; }
.products-table td { padding: 1rem 0; border-bottom: 1px solid #f9fafb; font-size: 0.85rem; color: #374151; vertical-align: middle; }
.products-table tr:last-child td { border-bottom: none; }
.p-info { display: flex; align-items: center; gap: 0.8rem; }
.p-info img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid #e5e7eb; }
.p-texts { display: flex; flex-direction: column; gap: 2px; }
.p-name { font-weight: 700; color: #111827; }
.p-attrs-v2 { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
.attr-tag-v2 { font-size: 10px; background: #fdf2f8; color: #873260; padding: 1px 6px; border-radius: 4px; font-weight: 700; border: 1px solid #fce7f3; }
.text-center { text-align: center !important; }
.text-right { text-align: right !important; }

/* Info Grid */
.customer-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
.info-item { display: flex; flex-direction: column; gap: 0.3rem; }
.info-label { font-size: 0.75rem; font-weight: 700; color: #9ca3af; }
.info-val { font-size: 0.85rem; font-weight: 600; color: #374151; }
.flex-end { align-self: flex-end; }
.ltr { direction: ltr; }

/* Timeline */
.activity-timeline { display: flex; flex-direction: column; padding-top: 0.5rem; }
.timeline-item { display: flex; gap: 1.5rem; position: relative; padding-bottom: 1.5rem; }
.timeline-item:last-child { padding-bottom: 0; }
.ti-date { font-size: 0.75rem; color: #9ca3af; font-weight: 600; line-height: 1.4; width: 60px; text-align: left; }
.ti-bullet { width: 12px; height: 12px; background: #e5e7eb; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px #e5e7eb; position: relative; margin-top: 4px; z-index: 2;}
.timeline-item:not(:last-child)::before { content: ''; position: absolute; right: 88px; top: 16px; bottom: 0; width: 1px; background: #e5e7eb; }
.ti-content { flex: 1; margin-top: 2px; }
.ti-msg { margin: 0; font-size: 0.85rem; font-weight: 700; color: #374151; margin-bottom: 0.4rem;  }
.ti-status { font-size: 0.7rem; padding: 0.1rem 0.5rem; border-radius: 4px; display: inline-block; }

/* Summary */
.summary-rows { display: flex; flex-direction: column; gap: 1rem; }
.s-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 600; color: #4b5563; border-bottom: 1px dashed #f3f4f6; padding-bottom: 0.5rem; }
.s-row:last-child { border-bottom: none; padding-bottom: 0; }
.s-row.total { font-size: 1.1rem; font-weight: 800; color: #111827; border-top: 1px solid #e5e7eb; padding-top: 1rem; border-bottom: none; }
.green-text { color: #059669; }
.text-gray { color: #6b7280; font-size: 0.8rem; }
.flex-start { justify-content: flex-start; gap: 0.5rem; border: none; padding: 0; margin-top: 0.5rem; }

/* Shipping Block */
.shipping-info { display: flex; flex-direction: column; gap: 1.25rem; }
.shi-row { display: flex; align-items: flex-start; gap: 0.8rem; }
.shi-row div { display: flex; flex-direction: column; }
.shi-label { font-size: 0.75rem; font-weight: 700; color: #9ca3af; margin-bottom: 0.2rem; }
.shi-val { font-size: 0.85rem; font-weight: 800; color: #1f2937; }

/* Status Modal */
.status-content { max-width: 450px; padding: 2rem; background: #fff; }
.status-header { text-align: center; margin-bottom: 1.5rem; }
.icon-circle { width: 50px; height: 50px; background: #fdf2f8; color: #db2777; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
.modal-title { font-size: 1.25rem; font-weight: 800; color: #111827; margin: 0 0 0.5rem 0; }
.modal-subtitle { font-size: 0.85rem; font-weight: 600; color: #6b7280; margin: 0; }

.form-group { margin-bottom: 1.25rem; }
.form-label { display: block; font-size: 0.85rem; font-weight: 700; color: #374151; margin-bottom: 0.5rem; }
.req { color: #dc2626; }
.form-control { width: 100%; padding: 0.8rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #1f2937; outline: none; transition: border-color 0.2s; }
.form-control:focus { border-color: #873260; }
.text-area { resize: vertical; min-height: 80px; }

.select-wrapper { position: relative; }
.select-wrapper select { appearance: none; padding-left: 2.5rem; cursor: pointer; }
.select-wrapper .select-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }

.form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.form-actions button { flex: 1; padding: 0.8rem; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; outline: none; }
.btn-cancel { background: #f3f4f6; color: #374151; border: none; }
.btn-cancel:hover { background: #e5e7eb; color: #111827; }
.btn-submit { background: #873260; color: #fff; border: none; }
.btn-submit:hover:not(:disabled) { background: #6E1A41; }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

/* Alert */
.alert-toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%) translateY(100px); padding: 0.75rem 1.5rem; border-radius: 30px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); z-index: 2000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-family: 'IBM Plex Sans Arabic', sans-serif; background: #fff; }
.alert-toast.success { color: #059669; border: 1px solid #10b981; }
.alert-toast.error { color: #dc2626; border: 1px solid #ef4444; }
.alert-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
.alert-icon { font-weight: bold; }

/* Gift Admin Styles */
.gift-admin-section {
  border: 1px solid #fce7f3;
  background: #fff9fc;
}
.gift-msg-admin {
  background: #fff;
  border: 1px solid #fce7f3;
  padding: 1rem;
  border-radius: 8px;
}
.gift-text-admin {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #873260;
  white-space: pre-wrap;
}
</style>
