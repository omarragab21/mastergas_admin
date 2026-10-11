<template>
  <div class="reviews-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">تقييمات المنتجات</h1>
        <p class="page-subtitle">إدارة ومراجعة تقييمات العملاء للمنتجات</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon reviews-icon">
          <i class="fas fa-star"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي التقييمات</span>
          <span class="stat-value">{{ reviews.length }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">بانتظار المراجعة</span>
          <span class="stat-value">{{ pendingReviewsCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon approved-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">تقييمات منشورة</span>
          <span class="stat-value">{{ approvedReviewsCount }}</span>
        </div>
      </div>
    </div>

    <!-- Filter & Search -->
    <div class="table-actions">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input type="text" v-model="searchQuery" placeholder="بحث باسم العميل أو المنتج..." />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" class="filter-select">
          <option value="">كل الحالات</option>
          <option value="pending">بانتظار المراجعة</option>
          <option value="approved">تمت الموافقة</option>
        </select>
      </div>
    </div>

    <!-- Reviews Table -->
    <div class="table-container shadow-sm">
      <table class="custom-table">
        <thead>
          <tr>
            <th>المنتج</th>
            <th>العميل</th>
            <th>التقييم</th>
            <th>التعليق</th>
            <th>التاريخ</th>
            <th>الحالة</th>
            <th>العمليات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">جاري التحميل...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredReviews.length === 0">
            <td colspan="7" class="text-center py-5 no-data">
              <i class="fas fa-comment-slash d-block mb-2"></i>
              لا توجد تقييمات مطابقة للبحث
            </td>
          </tr>
          <tr v-for="review in filteredReviews" :key="review.id">
            <td>
              <div class="product-info">
                <span class="product-name">{{ review.product?.name }}</span>
              </div>
            </td>
            <td>{{ review.customer?.name }}</td>
            <td>
              <div class="rating-stars">
                <i v-for="i in 5" :key="i" :class="i <= review.rating ? 'fas fa-star filled' : 'far fa-star'"></i>
              </div>
            </td>
            <td>
              <p class="review-comment-text" :title="review.comment">{{ review.comment || '---' }}</p>
            </td>
            <td>{{ formatDate(review.created_at) }}</td>
            <td>
              <span :class="['status-badge', review.is_approved ? 'status-approved' : 'status-pending']">
                {{ review.is_approved ? 'منشور' : 'بانتظار المراجعة' }}
              </span>
            </td>
            <td>
              <div class="actions-btns">
                <button 
                  v-if="!review.is_approved" 
                  @click="approveReview(review.id)" 
                  class="btn-icon btn-approve" 
                  title="موافقة ونشر"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button 
                  @click="confirmDelete(review.id)" 
                  class="btn-icon btn-delete" 
                  title="حذف"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Alert Toast -->
    <div class="alert-toast" :class="[alertType, { show: showAlert }]">
      {{ alertMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../config/axios';

const reviews = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const statusFilter = ref('');

const pendingReviewsCount = computed(() => reviews.value.filter(r => !r.is_approved).length);
const approvedReviewsCount = computed(() => reviews.value.filter(r => r.is_approved).length);

const filteredReviews = computed(() => {
  return reviews.value.filter(r => {
    const matchesSearch = (r.customer?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          r.product?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchesStatus = statusFilter.value === '' ? true : 
                          (statusFilter.value === 'approved' ? r.is_approved : !r.is_approved);
    return matchesSearch && matchesStatus;
  });
});

const fetchReviews = async () => {
  loading.value = true;
  try {
    const res = await api.get('/dashboard/reviews');
    reviews.value = res.data.data;
  } catch (err) {
    triggerAlert('فشل تحميل التقييمات', 'error');
  } finally {
    loading.value = false;
  }
};

const approveReview = async (id) => {
  try {
    await api.patch(`/dashboard/reviews/${id}/approve`);
    triggerAlert('تمت الموافقة على التقييم بنجاح');
    fetchReviews();
  } catch (err) {
    triggerAlert('فشل الموافقة على التقييم', 'error');
  }
};

const confirmDelete = (id) => {
  if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
    deleteReview(id);
  }
};

const deleteReview = async (id) => {
  try {
    await api.delete(`/dashboard/reviews/${id}`);
    triggerAlert('تم حذف التقييم بنجاح');
    fetchReviews();
  } catch (err) {
    triggerAlert('فشل حذف التقييم', 'error');
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric' });
};

// Alert Logic
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('success');
const triggerAlert = (msg, type = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  showAlert.value = true;
  setTimeout(() => { showAlert.value = false; }, 3000);
};

onMounted(fetchReviews);
</script>

<style scoped>
.reviews-page {
  padding: 20px;
  direction: rtl;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.page-subtitle {
  color: #6b7280;
  font-size: 14px;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.reviews-icon { background: #fef3c7; color: #d97706; }
.pending-icon { background: #fee2e2; color: #dc2626; }
.approved-icon { background: #dcfce7; color: #16a34a; }

.stat-label {
  display: block;
  font-size: 13px;
  color: #6b7280;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

/* Table Actions */
.table-actions {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fff;
}

/* Table Styles */
.table-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  background: #f9fafb;
  padding: 12px 15px;
  text-align: right;
  font-weight: 600;
  font-size: 13px;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
}

.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #1f2937;
}

.rating-stars {
  color: #fbbf24;
  font-size: 12px;
}

.rating-stars .filled {
  color: #fbbf24;
}

.review-comment-text {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  color: #6b7280;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-approved { background: #dcfce7; color: #166534; }
.status-pending { background: #fff7ed; color: #9a3412; }

.actions-btns {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve { background: #dcfce7; color: #16a34a; }
.btn-approve:hover { background: #16a34a; color: #fff; }

.btn-delete { background: #fee2e2; color: #dc2626; }
.btn-delete:hover { background: #dc2626; color: #fff; }

/* Alert Toast */
.alert-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: #111827;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 1000;
  opacity: 0;
}

.alert-toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.alert-toast.error {
  background: #dc2626;
}
</style>
