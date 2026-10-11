<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../config/axios';

// State
const messages = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const showViewModal = ref(false);
const currentMessage = ref(null);

// Fetch Messages
const fetchMessages = async () => {
    loading.value = true;
    try {
        const response = await api.get('/dashboard/contact-messages', {
            params: {
                search: searchQuery.value,
                status: statusFilter.value
            }
        });
        messages.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch messages', error);
        triggerAlert('فشل تحميل الرسائل', 'error');
    } finally {
        loading.value = false;
    }
};

onMounted(fetchMessages);

// Actions
const openViewModal = async (message) => {
    currentMessage.value = message;
    showViewModal.value = true;
    
    // Auto mark as read if it was unread
    if (message.status === 'unread') {
        try {
            await api.patch(`/dashboard/contact-messages/${message.id}/read`);
            message.status = 'read';
            // Optional: update local list state or just keep the object update
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    }
};

const confirmDelete = async (message) => {
    if (confirm(`هل أنت متأكد من حذف رسالة "${message.name}"؟`)) {
        try {
            await api.delete(`/dashboard/contact-messages/${message.id}`);
            triggerAlert('تم حذف الرسالة بنجاح');
            fetchMessages();
        } catch (error) {
            triggerAlert('فشل عملية الحذف', 'error');
        }
    }
};

const toggleReadStatus = async (message) => {
    try {
        const newStatus = message.status === 'read' ? 'unread' : 'read';
        const endpoint = newStatus === 'read' ? 'read' : 'unread';
        await api.patch(`/dashboard/contact-messages/${message.id}/${endpoint}`);
        message.status = newStatus;
        triggerAlert(newStatus === 'read' ? 'تم تعيين الرسالة كمقروءة' : 'تم تعيين الرسالة كغير مقروءة');
    } catch (error) {
        triggerAlert('فشل تحديث الحالة', 'error');
    }
};

// Export to Excel (Mock)
const exportToExcel = () => {
    triggerAlert('جاري تحضير ملف Excel...', 'success');
};

// Helpers
const totalMessages = computed(() => messages.value.length);
const unreadCount = computed(() => messages.value.filter(m => m.status === 'unread').length);
const readCount = computed(() => messages.value.filter(m => m.status === 'read').length);

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatStatus = (status) => {
    return status === 'read' ? 'مقروءة' : 'غير مقروءة';
};

// Alert State
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('success');

const triggerAlert = (message, type = 'success') => {
    alertMessage.value = message;
    alertType.value = type;
    showAlert.value = true;
    setTimeout(() => showAlert.value = false, 3000);
};
</script>

<template>
  <div class="messages-page p-6">
    <!-- Header -->
    <div class="header-section mb-6">
        <div class="page-title-area">
          <div class="title-with-icon">
             <div class="icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
             </div>
             <div>
                <h1>رسائل العملاء</h1>
                <p>إدارة رسائل العملاء من نموذج الاتصال في الموقع</p>
             </div>
          </div>
       </div>

       <div class="left-actions">
           <button class="export-btn" @click="exportToExcel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              تصدير Excel
           </button>
       </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-grid mb-6">
       <div class="stat-card">
          <div class="stat-icon total"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="stat-info">
             <span class="stat-val">{{ totalMessages }}</span>
             <span class="stat-label">إجمالي الرسائل</span>
          </div>
       </div>
       <div class="stat-card">
          <div class="stat-icon unread"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div>
          <div class="stat-info">
             <span class="stat-val">{{ unreadCount }}</span>
             <span class="stat-label">غير مقروءة</span>
          </div>
       </div>
       <div class="stat-card">
          <div class="stat-icon read"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="stat-info">
             <span class="stat-val">{{ readCount }}</span>
             <span class="stat-label">مقروءة</span>
          </div>
       </div>
    </div>

    <!-- Filters -->
    <div class="filters-card shadow-sm mb-6">
       <div class="filter-row">
           <div class="search-group flex-1">
              <div class="search-input-wrapper">
                 <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                 <input type="text" v-model="searchQuery" @input="fetchMessages" placeholder="البحث في الرسائل..." class="search-input" />
              </div>
           </div>
          <div class="filter-group">
             <select v-model="statusFilter" @change="fetchMessages" class="filter-select">
                <option value="">جميع الرسائل</option>
                <option value="unread">غير مقروءة</option>
                <option value="read">مقروءة</option>
             </select>
          </div>
       </div>
    </div>

    <!-- Table -->
    <div class="table-container shadow-sm">
       <table class="data-table">
          <thead>
             <tr>
                <th class="col-name text-right">الاسم</th>
                <th class="col-phone">رقم الجوال</th>
                <th class="col-email">البريد الإلكتروني</th>
                <th class="col-subject">الموضوع</th>
                <th class="col-status">الحالة</th>
                <th class="col-actions">الإجراءات</th>
             </tr>
          </thead>
          <tbody>
             <tr v-if="loading" class="state-row"><td colspan="6">جاري التحميل...</td></tr>
             <tr v-else-if="messages.length === 0" class="state-row"><td colspan="6">لا توجد رسائل حالياً</td></tr>
             <template v-else>
                <tr v-for="msg in messages" :key="msg.id" class="data-row" :class="{ 'is-unread': msg.status === 'unread' }">
                   <td class="col-name text-right">
                      <div class="name-cell">
                         <span class="unread-dot" v-if="msg.status === 'unread'"></span>
                         <span class="sender-name">{{ msg.name }}</span>
                      </div>
                   </td>
                   <td class="col-phone ltr-text">{{ msg.phone || '-' }}</td>
                   <td class="col-email ltr-text">{{ msg.email || '-' }}</td>
                   <td class="col-subject">{{ msg.subject || '-' }}</td>
                   <td class="col-status">
                      <span :class="['status-badge-table', msg.status]" @click="toggleReadStatus(msg)" style="cursor: pointer;">
                         {{ formatStatus(msg.status) }}
                      </span>
                   </td>
                   <td class="col-actions">
                      <div class="actions-group">
                         <button class="action-btn view" title="عرض التفاصيل" @click="openViewModal(msg)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                         </button>
                         <button class="action-btn delete" title="حذف" @click="confirmDelete(msg)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                         </button>
                      </div>
                   </td>
                </tr>
             </template>
          </tbody>
       </table>
    </div>

    <!-- View Modal -->
    <div class="modal-overlay" v-if="showViewModal" @click.self="showViewModal = false">
       <div class="modal-content info-modal fade-in">
          <div class="modal-header">
             <button class="close-modal-btn" @click="showViewModal = false">×</button>
             <h2>تفاصيل الرسالة</h2>
             <p>معلومات مرسلة من نموذج الاتصال</p>
          </div>
          
          <div class="modal-body">
             <div class="msg-detail-grid">
                <div class="detail-item">
                   <label>الاسم:</label>
                   <span>{{ currentMessage.name }}</span>
                </div>
                <div class="detail-item">
                   <label>رقم الجوال:</label>
                   <span class="ltr-text" style="text-align: right !important;">{{ currentMessage.phone || '-' }}</span>
                </div>
                <div class="detail-item">
                   <label>البريد الإلكتروني:</label>
                   <span>{{ currentMessage.email || '-' }}</span>
                </div>
                <div class="detail-item">
                   <label>التاريخ والوقت:</label>
                   <span>{{ formatDate(currentMessage.created_at) }}</span>
                </div>
                <div class="detail-item full-width mt-4">
                   <label>الموضوع:</label>
                   <span class="subject-text">{{ currentMessage.subject || '-' }}</span>
                </div>
                <div class="detail-item full-width">
                   <label>الرسالة:</label>
                   <div class="message-content-box">
                      {{ currentMessage.message }}
                   </div>
                </div>
                <div class="detail-item mt-4">
                   <label>الحالة:</label>
                   <span :class="['status-badge-table', currentMessage.status]">{{ formatStatus(currentMessage.status) }}</span>
                </div>
             </div>
          </div>
          
          <div class="modal-footer">
             <button class="btn-close-alt" @click="showViewModal = false">إغلاق</button>
          </div>
       </div>
    </div>

    <!-- Alert Toast -->
    <div v-if="showAlert" :class="['alert-toast', alertType]">
       {{ alertMessage }}
    </div>
  </div>
</template>

<style scoped>
.messages-page { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; }

/* Header Section */
.header-section { display: flex; justify-content: space-between; align-items: center; }
.export-btn { background: white; color: #4b5563; border: 1px solid #e5e7eb; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; font-size: 0.875rem; }
.export-btn:hover { background: #f9fafb; border-color: #d1d5db; }

.page-title-area h1 { font-size: 1.5rem; font-weight: 800; color: #1f2937; margin: 0; }
.page-title-area p { color: #6b7280; font-size: 0.875rem; margin: 0; }
.title-with-icon { display: flex; align-items: center; gap: 12px; }
.icon-box { background: #fdf2f8; color: #873260; width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

/* Stats Bar */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.stat-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 15px; }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.stat-icon.total { background: #eff6ff; color: #2563eb; }
.stat-icon.unread { background: #fff1f2; color: #e11d48; }
.stat-icon.read { background: #f0fdf4; color: #16a34a; }
.stat-val { display: block; font-size: 1.25rem; font-weight: 800; color: #111827; }
.stat-label { font-size: 0.8rem; color: #6b7280; }

/* Filters Card */
.filters-card { background: white; border-radius: 12px; padding: 8px; border: 1px solid #e5e7eb; }
.filter-row { display: flex; gap: 12px; align-items: center; }
.filter-select { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; background: #f9fafb; color: #4b5563; font-family: inherit; font-size: 0.875rem; cursor: pointer; }
.search-input-wrapper { position: relative; width: 100%; }
.search-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-input { width: 100%; padding: 10px 44px 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; transition: 0.3s; font-family: inherit; font-size: 0.875rem; background: #fff; }
.search-input:focus { border-color: #873260; box-shadow: 0 0 0 3px rgba(139, 34, 82, 0.1); }
.flex-1 { flex: 1; }

/* Table Section */
.table-container { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #f9fafb; padding: 14px; font-weight: 700; color: #4b5563; font-size: 0.85rem; border-bottom: 2px solid #f3f4f6; text-align: center; }
.data-table td { padding: 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #374151; font-size: 0.875rem; text-align: center; }

.data-row { transition: 0.2s; }
.data-row:hover { background: #fefafb; }
.data-row.is-unread { background: #fff9fc; }

.name-cell { display: flex; align-items: center; gap: 8px; justify-content: flex-start; }
.unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #873260; flex-shrink: 0; }
.sender-name { font-weight: 700; color: #111827; }

.ltr-text { direction: ltr; text-align: left; }

.status-badge-table { padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; display: inline-block; transition: 0.2s; }
.status-badge-table.unread { background: #fdf2f8; color: #873260; border: 1px solid rgba(139, 34, 82, 0.2); }
.status-badge-table.read { background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }
.status-badge-table:hover { opacity: 0.8; }

.actions-group { display: flex; gap: 8px; justify-content: center; }
.action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
.action-btn.view { background: #f5f3ff; color: #8b5cf6; }
.action-btn.view:hover { background: #ede9fe; }
.action-btn.delete { background: #fef2f2; color: #ef4444; }
.action-btn.delete:hover { background: #fee2e2; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 20px; overflow: hidden; width: 100%; max-width: 550px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.modal-header { padding: 24px; border-bottom: 1px solid #f3f4f6; position: relative; }
.close-modal-btn { position: absolute; left: 24px; top: 24px; border: none; background: #f3f4f6; width: 32px; height: 32px; border-radius: 50%; font-size: 1.25rem; line-height: 1; cursor: pointer; color: #6b7280; }
.modal-header h2 { font-weight: 800; font-size: 1.25rem; margin: 0 0 4px 0; color: #111827; }
.modal-header p { color: #6b7280; font-size: 0.875rem; margin: 0; }

.modal-body { padding: 24px; }
.msg-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item label { font-size: 0.75rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; }
.detail-item span { font-weight: 700; color: #374151; font-size: 0.95rem; }
.full-width { grid-column: span 2; }
.message-content-box { background: #f9fafb; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; min-height: 100px; color: #4b5563; line-height: 1.6; font-size: 0.9rem; margin-top: 4px; }
.subject-text { color: #111827 !important; font-size: 1.05rem !important; }

.modal-footer { padding: 20px 24px; background: #f9fafb; border-top: 1px solid #f3f4f6; text-align: left; }
.btn-close-alt { background: #1f2937; color: white; border: none; padding: 10px 30px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-close-alt:hover { background: #111827; }

/* Alert */
.alert-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 10px; color: white; font-weight: 700; z-index: 2000; box-shadow: 0 10px 15px rgba(0,0,0,0.1); animation: toastIn 0.3s ease-out; }
@keyframes toastIn { from { top: -50px; opacity: 0; } to { top: 24px; opacity: 1; } }
.alert-toast.success { background: #10b981; }
.alert-toast.error { background: #ef4444; }

/* Utils */
.mb-6 { margin-bottom: 24px !important; }
.mb-4 { margin-bottom: 16px !important; }
.mt-4 { margin-top: 16px !important; }
.full-width { grid-column: span 2; }

/* Responsive */
@media (max-width: 768px) {
    .msg-detail-grid { grid-template-columns: 1fr; }
    .header-section { flex-direction: column-reverse; gap: 16px; align-items: stretch; }
    .col-phone, .col-email { display: none; }
}
</style>
