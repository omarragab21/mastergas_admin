<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../config/axios';

// State
const admins = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const showFormModal = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const currentAdmin = ref(null);
const previewAvatar = ref(null);
const avatarFile = ref(null);

const form = ref({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin',
    is_active: true
});

const initialForm = { ...form.value };

// Fetch Admins
const fetchAdmins = async () => {
    loading.value = true;
    try {
        const response = await api.get('/dashboard/admins', {
            params: { search: searchQuery.value }
        });
        admins.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch admins', error);
        triggerAlert('فشل تحميل قائمة المديرين', 'error');
    } finally {
        loading.value = false;
    }
};

onMounted(fetchAdmins);

// Actions
const openAddModal = () => {
    isEditing.value = false;
    form.value = { ...initialForm };
    previewAvatar.value = null;
    avatarFile.value = null;
    showFormModal.value = true;
};

const openEditModal = (admin) => {
    isEditing.value = true;
    currentAdmin.value = admin;
    form.value = {
        name: admin.name,
        email: admin.email,
        password: '', // Keep empty for no change
        phone: admin.phone,
        role: admin.role,
        is_active: admin.is_active
    };
    previewAvatar.value = admin.avatar;
    avatarFile.value = null;
    showFormModal.value = true;
};

const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        avatarFile.value = file;
        previewAvatar.value = URL.createObjectURL(file);
    }
};

const submitForm = async () => {
    isSubmitting.value = true;
    const formData = new FormData();
    
    // Fill formData
    Object.keys(form.value).forEach(key => {
        if (key === 'password' && !form.value[key] && isEditing.value) {
            // Skip empty password on edit
        } else {
            let val = form.value[key];
            if (typeof val === 'boolean') val = val ? 1 : 0;
            formData.append(key, val);
        }
    });

    if (avatarFile.value) {
        formData.append('avatar', avatarFile.value);
    }

    try {
        if (isEditing.value) {
            await api.post(`/dashboard/admins/${currentAdmin.value.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            triggerAlert('تم تحديث بيانات المدير بنجاح');
        } else {
            await api.post('/dashboard/admins', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            triggerAlert('تم إضافة المدير بنجاح');
        }
        showFormModal.value = false;
        fetchAdmins();
    } catch (error) {
        if (error.response?.data?.errors) {
            const firstError = Object.values(error.response.data.errors)[0][0];
            triggerAlert(firstError, 'error');
        } else {
            const msg = error.response?.data?.message || 'فشل حفظ البيانات';
            triggerAlert(msg, 'error');
        }
    } finally {
        isSubmitting.value = false;
    }
};

const confirmDelete = async (admin) => {
    if (confirm(`هل أنت متأكد من حذف المدير "${admin.name}"؟`)) {
        try {
            await api.delete(`/dashboard/admins/${admin.id}`);
            triggerAlert('تم حذف المدير بنجاح');
            fetchAdmins();
        } catch (error) {
            triggerAlert('فشل عملية الحذف', 'error');
        }
    }
};

const toggleAdminStatus = async (admin) => {
    try {
        const newStatus = !admin.is_active;
        await api.post(`/dashboard/admins/${admin.id}`, { 
            is_active: newStatus ? 1 : 0 
        });
        admin.is_active = newStatus;
        triggerAlert(newStatus ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
    } catch (error) {
        triggerAlert('فشل تحديث الحالة', 'error');
    }
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

const getRoleBadge = (role) => {
    const roles = {
        'super_admin': 'مدير عام',
        'admin': 'مدير',
        'editor': 'محرر'
    };
    return roles[role] || role;
};
</script>

<template>
  <div class="admins-page p-6">
    <!-- Header -->
    <div class="header-section mb-6">
        <div class="page-title-area">
           <div class="title-with-icon">
              <div class="icon-box">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                 <h1>إدارة المديرين</h1>
                 <p>إدارة فريق العمل، الصلاحيات، وحسابات المشرفين</p>
              </div>
           </div>
        </div>
        
       <button class="add-btn" @click="openAddModal">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
         إضافة مدير جديد
       </button>
       
    </div>

    <!-- Stats Bar (Mock) -->
    <div class="stats-grid mb-6">
       <div class="stat-card">
          <div class="stat-icon users"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div class="stat-info">
             <span class="stat-val">{{ admins.length }}</span>
             <span class="stat-label">إجمالي المديرين</span>
          </div>
       </div>
       <div class="stat-card">
          <div class="stat-icon active"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
          <div class="stat-info">
             <span class="stat-val">{{ admins.filter(a => a.is_active).length }}</span>
             <span class="stat-label">نشط الآن</span>
          </div>
       </div>
    </div>

    <!-- Filters -->
    <div class="filters-card shadow-sm mb-6">
        <div class="search-box">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" v-model="searchQuery" @input="fetchAdmins" placeholder="البحث عن اسم، بريد، أو رقم هاتف..." />
        </div>
    </div>

    <!-- Table -->
    <div class="table-container shadow-sm">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-avatar">الصورة</th>
            <th class="col-name text-right">الاسم</th>
            <th class="col-phone">رقم الجوال</th>
            <th class="col-email">البريد الإلكتروني</th>
            <th class="col-role">الصلاحية</th>
            <th class="col-status">الحالة</th>
            <th class="col-date">وقت التسجيل</th>
            <th class="col-actions">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="state-row"><td colspan="9">جاري التحميل...</td></tr>
          <tr v-else-if="admins.length === 0" class="state-row"><td colspan="9">لا يوجد مديرون حالياً</td></tr>
          <template v-else>
            <tr v-for="admin in admins" :key="admin.id" class="data-row" @click="openEditModal(admin)">
              <td class="col-avatar">
                 <div class="admin-avatar-table">
                    <img :src="admin.avatar" v-if="admin.avatar" />
                    <div class="avatar-placeholder-table" v-else>{{ admin.name.charAt(0) }}</div>
                 </div>
              </td>
              <td class="col-name text-right">
                <span class="admin-name-text">{{ admin.name }}</span>
              </td>
              <td class="col-phone ltr-text">
                  {{ admin.phone || '-' }}
              </td>
              <td class="col-email">
                  <span class="email-text">{{ admin.email }}</span>
              </td>
              <td class="col-role">
                  <span :class="['role-chip', admin.role]">{{ getRoleBadge(admin.role) }}</span>
              </td>
              <td class="col-status">
                <button :class="['status-btn', { 'active': admin.is_active }]" @click.stop="toggleAdminStatus(admin)">
                   {{ admin.is_active ? 'مفعل' : 'غير مفعل' }}
                </button>
              </td>
              <td class="col-date">
                  <span class="date-text">{{ admin.createdAt }}</span>
              </td>
              <td class="col-actions" @click.stop>
                <div class="actions-group">
                  <button class="action-btn edit" title="تعديل" @click="openEditModal(admin)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="action-btn delete" title="حذف" @click="confirmDelete(admin)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Form Modal (Side Panel Style) -->
    <div class="modal-overlay" v-if="showFormModal" @click.self="showFormModal = false">
      <div class="modal-content side-panel">
        <div class="modal-header">
           <button class="close-btn" @click="showFormModal = false">×</button>
           <h2>{{ isEditing ? 'تعديل بيانات المدير' : 'إضافة مدير جديد' }}</h2>
           <p>{{ isEditing ? 'تحديث معلومات حساب المدير المختار' : 'إنشاء حساب مدير جديد بصلاحيات محددة' }}</p>
        </div>
        
        <div class="modal-body">
           <!-- Avatar Upload -->
           <div class="avatar-upload-section mb-6">
              <div class="avatar-preview-box" @click="$refs.avatarInput.click()">
                 <img v-if="previewAvatar" :src="previewAvatar" />
                 <div class="upload-icon" v-else>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                 </div>
                 <div class="edit-overlay"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
              </div>
              <input type="file" ref="avatarInput" @change="handleAvatarChange" hidden accept="image/*" />
              <div class="upload-text">
                 <span>الصورة الشخصية</span>
                 <small>بصيغة JPG أو PNG (بحد أقصى 2MB)</small>
              </div>
           </div>

           <!-- Form Fields -->
           <div class="form-group mb-4">
              <label class="form-label">الاسم الكامل *</label>
              <input type="text" v-model="form.name" class="form-control" placeholder="اسم المدير..." />
           </div>

           <div class="form-row mb-4">
              <div class="form-group flex-1">
                 <label class="form-label">البريد الإلكتروني *</label>
                 <input type="email" v-model="form.email" class="form-control ltr-text" placeholder="admin@example.jo" />
              </div>
           </div>

           <div class="form-row mb-4">
              <div class="form-group flex-1">
                 <label class="form-label">رقم الجوال</label>
                 <input type="text" v-model="form.phone" class="form-control ltr-text" placeholder="07xxxxxxxx" />
              </div>
           </div>

           <div class="form-group mb-4">
              <label class="form-label">{{ isEditing ? 'كلمة المرور (اتركها فارغة للتخطي)' : 'كلمة المرور *' }}</label>
              <input type="password" v-model="form.password" class="form-control" placeholder="********" />
           </div>

           <div class="form-row mb-6">
              <div class="form-group flex-1">
                 <label class="form-label">الدور / الصلاحية</label>
                 <select v-model="form.role" class="form-control">
                    <option value="super_admin">مدير عام (Super Admin)</option>
                    <option value="admin">مدير (Admin)</option>
                    <option value="editor">محرر (Editor)</option>
                 </select>
              </div>
           </div>

           <div class="form-group">
              <label class="toggle-control">
                 <span class="form-label">حالة الحساب</span>
                 <div class="status-toggle-wrapper" @click="form.is_active = !form.is_active">
                    <div :class="['toggle-track', { 'active': form.is_active }]">
                       <div class="toggle-thumb"></div>
                    </div>
                    <span class="status-text">{{ form.is_active ? 'نشط' : 'معطل' }}</span>
                 </div>
              </label>
           </div>
        </div>

        <div class="modal-footer">
           <button class="btn-cancel" @click="showFormModal = false">إلغاء</button>
           <button class="btn-save" :disabled="isSubmitting" @click="submitForm">
              {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ المدير' }}
           </button>
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
.admins-page { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; }

/* Header Section */
.header-section { display: flex; justify-content: space-between; align-items: center; }
.add-btn { background: #873260; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
.add-btn:hover { background: #6b1a3f; transform: translateY(-2px); }

.page-title-area h1 { font-size: 1.5rem; font-weight: 800; color: #1f2937; margin: 0; }
.page-title-area p { color: #6b7280; font-size: 0.875rem; margin: 0; }
.title-with-icon { display: flex; align-items: center; gap: 12px; }
.icon-box { background: #fdf2f8; color: #873260; width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

/* Stats grid */
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.stat-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 15px; }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.stat-icon.users { background: #f0fdf4; color: #16a34a; }
.stat-icon.active { background: #eff6ff; color: #2563eb; }
.stat-val { display: block; font-size: 1.25rem; font-weight: 800; color: #111827; }
.stat-label { font-size: 0.8rem; color: #6b7280; }

/* Filters */
.filters-card { background: white; padding: 12px; border-radius: 12px; border: 1px solid #e5e7eb; }
.search-box { position: relative; width: 100%; }
.search-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-box input { width: 100%; padding: 10px 44px 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; transition: 0.3s; font-family: inherit; font-size: 0.9rem; }
.search-box input:focus { border-color: #873260; box-shadow: 0 0 0 3px rgba(139, 34, 82, 0.1); }

/* Table */
.table-container { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #f4f6f8; padding: 12px 14px; font-weight: 700; color: #637381; font-size: 0.8rem; border-bottom: 1px solid #f3f4f6; text-align: center; text-transform: uppercase; }
.data-table td { padding: 16px 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; color: #212b36; font-size: 0.875rem; text-align: center; }

.data-row { transition: 0.2s; cursor: pointer; }
.data-row:hover { background: #f9fafb; }

.col-check { width: 50px; }
.col-check input[type="checkbox"] { width: 18px; height: 18px; border-radius: 4px; cursor: pointer; border: 1px solid #d1d5db; }
.col-avatar { width: 80px; }
.col-name { width: 180px; }
.col-date { width: 150px; }

.admin-avatar-table { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: #f3f4f6; border: 1px solid #e5e7eb; margin: 0 auto; }
.admin-avatar-table img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder-table { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #873260; color: white; font-weight: 700; }

.admin-name-text { font-weight: 700; color: #111827; }
.email-text { color: #6b7280; font-size: 0.85rem; }
.date-text { color: #9ca3af; font-size: 0.85rem; }

.role-chip { padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
.role-chip.super_admin { background: #f3e8ff; color: #7e22ce; }
.role-chip.admin { background: #fdf2f8; color: #873260; }
.role-chip.editor { background: #eff6ff; color: #1d4ed8; }

.status-btn { padding: 4px 14px; border-radius: 8px; border: none; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
.status-btn.active { background: #dcfce7; color: #15803d; }
.status-btn:not(.active) { background: #fee2e2; color: #b91c1c; }
.status-btn:hover { opacity: 0.8; }

.actions-group { display: flex; gap: 8px; justify-content: center; }
.action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
.action-btn.edit { background: #f5f3ff; color: #8b5cf6; }
.action-btn.edit:hover { background: #ede9fe; }
.action-btn.delete { background: #fef2f2; color: #ef4444; }
.action-btn.delete:hover { background: #fee2e2; }

.ltr-text { direction: ltr; display: block; }

/* Modal SidePanel */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.side-panel { position: fixed; top: 0; left: 0; width: 450px; height: 100vh; background: white; border-radius: 0; box-shadow: 20px 0 50px rgba(0,0,0,0.1); animation: panelSlide 0.3s ease-out; display: flex; flex-direction: column; }
@keyframes panelSlide { from { transform: translateX(-100%); } to { transform: translateX(0); } }

.modal-header { padding: 30px; border-bottom: 1px solid #f3f4f6; position: relative; }
.close-btn { position: absolute; left: 30px; top: 30px; border: none; background: #f3f4f6; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; line-height: 1; font-size: 1.25rem; color: #6b7280; }
.modal-header h2 { font-weight: 800; font-size: 1.35rem; margin: 0 0 5px 0; color: #111827; }
.modal-header p { color: #9ca3af; font-size: 0.85rem; margin: 0; }

.modal-body { padding: 30px; flex: 1; overflow-y: auto; }

/* Avatar Upload */
.avatar-upload-section { display: flex; align-items: center; gap: 20px; }
.avatar-preview-box { width: 80px; height: 80px; border-radius: 20px; background: #f9fafb; border: 2.5px dashed #e5e7eb; position: relative; cursor: pointer; overflow: hidden; transition: 0.3s; }
.avatar-preview-box:hover { border-color: #873260; background: #fffcfd; }
.avatar-preview-box img { width: 100%; height: 100%; object-fit: cover; }
.upload-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #d1d5db; }
.edit-overlay { position: absolute; inset: 0; background: rgba(139, 34, 82, 0.4); opacity: 0; display: flex; align-items: center; justify-content: center; color: white; transition: 0.2s; }
.avatar-preview-box:hover .edit-overlay { opacity: 1; }
.upload-text span { display: block; font-weight: 700; color: #374151; font-size: 0.95rem; }
.upload-text small { color: #9ca3af; font-size: 0.75rem; }

.form-label { display: block; font-weight: 700; color: #374151; font-size: 0.9rem; margin-bottom: 10px; }
.form-control { width: 100%; padding: 12px 16px; border: 1.5px solid #e5e7eb; border-radius: 10px; outline: none; transition: 0.3s; font-family: inherit; font-size: 0.9rem; }
.form-control:focus { border-color: #873260; box-shadow: 0 0 0 3px rgba(139, 34, 82, 0.1); }
.form-row { display: flex; gap: 15px; }

.modal-footer { padding: 25px 30px; background: #f9fafb; border-top: 1px solid #f3f4f6; display: flex; gap: 15px; }
.btn-save { background: #873260; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; flex: 2; transition: 0.3s; }
.btn-save:hover { background: #6b1a3f; }
.btn-save:disabled { background: #d1d5db; cursor: not-allowed; }
.btn-cancel { background: white; color: #6b7280; border: 1.5px solid #e5e7eb; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; flex: 1; transition: 0.2s; }
.btn-cancel:hover { background: #f3f4f6; }

/* Utils */
.mb-6 { margin-bottom: 24px !important; }
.mb-4 { margin-bottom: 16px !important; }
.mt-4 { margin-top: 16px !important; }
.flex-1 { flex: 1; }

/* Alert */
.alert-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 10px; color: white; font-weight: 700; z-index: 2000; box-shadow: 0 10px 15px rgba(0,0,0,0.1); animation: toastIn 0.3s ease-out; }
@keyframes toastIn { from { top: -50px; opacity: 0; } to { top: 24px; opacity: 1; } }
.alert-toast.success { background: #10b981; }
.alert-toast.error { background: #ef4444; }

@media (max-width: 768px) {
  .side-panel { width: 100%; }
  .col-email, .col-phone { display: none; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
