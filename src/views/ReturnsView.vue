<template>
  <div class="returns-view">
    <header class="page-header">
      <h1 class="page-title">طلبات الإرجاع</h1>
      <div class="header-actions">
        <div class="stats-cards">
          <div class="stat-card">
            <span class="stat-label">قيد المراجعة</span>
            <span class="stat-value pending">{{ pendingCount }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">تم القبول</span>
            <span class="stat-value approved">{{ approvedCount }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">مرفوض</span>
            <span class="stat-value rejected">{{ rejectedCount }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">تم رد المبلغ</span>
            <span class="stat-value refunded">{{ refundedCount }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="returns-table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري التحميل...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="btn-retry" type="button" @click="fetchReturns">إعادة المحاولة</button>
      </div>

      <div v-else-if="returns.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 0 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 0-6.74-2.74L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
        <p>لا توجد طلبات إرجاع</p>
      </div>

      <div v-else class="returns-list">
        <div v-for="ret in returns" :key="ret.id" class="return-card">
          <div class="return-header">
            <div class="return-info">
              <span class="return-id">طلب #{{ ret.returnNumber }}</span>
              <span class="customer-name">{{ ret.customerName }} · {{ ret.customerEmail }}</span>
              <span class="order-number">{{ ret.orderNumber || ('طلب ' + ret.orderId) }}</span>
            </div>
            <span class="status-badge" :class="ret.status">{{ formatStatus(ret.status) }}</span>
          </div>

          <div class="return-body">
            <div class="product-info">
              <span class="product-name">{{ ret.productName }}</span>
              <span class="refund-amount">{{ formatPrice(ret.refundAmount) }}</span>
            </div>
            <div class="reason-section">
              <span class="reason-label">السبب:</span>
              <span class="reason-text">{{ ret.reason }}</span>
            </div>
            <div v-if="ret.adminNotes" class="admin-notes">
              <span class="notes-label">ملاحظة الإدارة:</span>
              <span class="notes-text">{{ ret.adminNotes }}</span>
            </div>
          </div>

          <div class="return-footer">
            <span class="return-date">{{ ret.date ? formatDate(ret.date) : '—' }}</span>
            <div v-if="ret.status === 'pending'" class="action-buttons">
              <button class="btn-approve" @click="handleApprove(ret.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                قبول
              </button>
              <button class="btn-reject" @click="openRejectModal(ret.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                رفض
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">رفض طلب الإرجاع</h3>
        <div class="modal-body">
          <label>سبب الرفض</label>
          <textarea v-model="rejectReason" rows="4" placeholder="يرجى توضيح سبب الرفض..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeRejectModal">إلغاء</button>
          <button class="btn-confirm" @click="handleReject">تأكيد الرفض</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import returnsService from '../services/returnsService';

const returns = ref([]);
const loading = ref(false);
const error = ref('');
const showRejectModal = ref(false);
const rejectReason = ref('');
const selectedReturnId = ref(null);

const pendingCount = computed(() => returns.value.filter(r => r.status === 'pending').length);
const approvedCount = computed(() => returns.value.filter(r => r.status === 'approved').length);
const rejectedCount = computed(() => returns.value.filter(r => r.status === 'rejected').length);
const refundedCount = computed(() => returns.value.filter(r => r.status === 'refunded').length);

const formatStatus = (status) => {
  const labels = {
    pending: 'قيد المراجعة',
    approved: 'تم القبول',
    rejected: 'مرفوض',
    refunded: 'تم رد المبلغ'
  };
  return labels[status] || status;
};

const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' د.أ';
};

const formatDate = (date) => new Date(date).toLocaleDateString('ar-JO');

const fetchReturns = async () => {
  loading.value = true;
  error.value = '';
  try {
    returns.value = await returnsService.listAll();
  } catch (err) {
    console.error('Failed to fetch returns:', err);
    error.value = err.response?.data?.message || 'فشل تحميل طلبات الإرجاع';
  } finally {
    loading.value = false;
  }
};

const handleApprove = async (id) => {
  if (!confirm('هل أنت متأكد من قبول هذا الطلب؟ سيتم إضافة المبلغ إلى رصيد العميل.')) return;
  
  try {
    await returnsService.updateStatus(id, {
      status: 'approved'
    });
    alert('تم قبول طلب الإرجاع بنجاح');
    fetchReturns();
  } catch (err) {
    alert(err.response?.data?.message || 'فشل قبول الطلب');
  }
};

const openRejectModal = (id) => {
  selectedReturnId.value = id;
  rejectReason.value = '';
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  selectedReturnId.value = null;
  rejectReason.value = '';
};

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    alert('يرجى إدخال سبب الرفض');
    return;
  }

  try {
    await returnsService.updateStatus(selectedReturnId.value, {
      status: 'rejected',
      admin_notes: rejectReason.value.trim()
    });
    alert('تم رفض طلب الإرجاع');
    closeRejectModal();
    fetchReturns();
  } catch (err) {
    alert(err.response?.data?.message || 'فشل رفض الطلب');
  }
};

onMounted(() => {
  fetchReturns();
});
</script>

<style scoped>
.returns-view {
  padding: 30px;
  background: #f9fafb;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stats-cards {
  display: flex;
  gap: 15px;
}

.stat-card {
  background: #fff;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-width: 140px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  display: block;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  display: block;
}

.stat-value.pending {
  color: #f59e0b;
}

.stat-value.approved {
  color: #10b981;
}

.stat-value.rejected {
  color: #ef4444;
}

.stat-value.refunded {
  color: #2563eb;
}

.returns-table-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 25px;
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 15px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #873260;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 15px;
  color: #9ca3af;
}

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 14px;
  min-height: 280px;
  color: #b91c1c;
}

.btn-retry {
  border: 0;
  border-radius: 8px;
  padding: 10px 18px;
  background: #873260;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.returns-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.return-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.return-card:hover {
  border-color: #873260;
  box-shadow: 0 4px 12px rgba(135, 50, 96, 0.1);
}

.return-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f3f4f6;
}

.return-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.return-id {
  font-weight: 800;
  color: #1f2937;
  font-size: 14px;
}

.customer-name {
  color: #6b7280;
  font-size: 14px;
}

.order-number {
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #4b5563;
  font-weight: 600;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.approved {
  background: #d1fae5;
  color: #059669;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.refunded {
  background: #dbeafe;
  color: #1d4ed8;
}

.return-body {
  margin-bottom: 15px;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-name {
  font-weight: 700;
  color: #1f2937;
  font-size: 15px;
}

.refund-amount {
  font-weight: 800;
  color: #873260;
  font-size: 16px;
}

.reason-section {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.reason-label {
  font-weight: 700;
  color: #6b7280;
  font-size: 13px;
  min-width: 80px;
}

.reason-text {
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
}

.admin-notes {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #fef3c7;
  border-radius: 8px;
}

.notes-label {
  font-weight: 700;
  color: #d97706;
  font-size: 13px;
  min-width: 120px;
}

.notes-text {
  color: #92400e;
  font-size: 14px;
}

.return-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f3f4f6;
}

.return-date {
  font-size: 13px;
  color: #9ca3af;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-approve,
.btn-reject {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  border: none;
}

.btn-approve {
  background: #10b981;
  color: #fff;
}

.btn-approve:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-reject {
  background: #ef4444;
  color: #fff;
}

.btn-reject:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 20px;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-body label {
  display: block;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.modal-body textarea {
  width: 100%;
  padding: 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  outline: none;
}

.modal-body textarea:focus {
  border-color: #873260;
  box-shadow: 0 0 0 3px rgba(135, 50, 96, 0.05);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: #ef4444;
  color: #fff;
}

.btn-confirm:hover {
  background: #dc2626;
}
</style>
