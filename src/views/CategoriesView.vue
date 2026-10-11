
<template>
  <div class="categories-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-titles">
        <h2 class="page-title">أقسام المنتجات</h2>
        <p class="page-subtitle">إدارة الأقسام الرئيسية والفرعية للمنتجات</p>
      </div>
      <button class="add-btn" @click="openAddModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        إضافة قسم رئيسي
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon-wrapper active-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">الأقسام النشطة</span>
          <span class="stat-value">{{ activeCategoriesCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper total-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي المنتجات</span>
          <span class="stat-value">{{ totalProductsCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper sub-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">الأقسام الفرعية</span>
          <span class="stat-value">{{ subCategoriesCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper main-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">الأقسام الرئيسية</span>
          <span class="stat-value">{{ mainCategoriesCount }}</span>
        </div>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="filters-row">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="search-icon">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" v-model="searchQuery" placeholder="البحث عن اسم..." class="search-input" />
      </div>
      <div class="filter-select">
        <select v-model="statusFilter" class="form-select">
          <option value="">جميع الحالات</option>
          <option value="1">نشط</option>
          <option value="0">غير نشط</option>
        </select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="select-icon">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-name">القسم</th>
            <th class="col-products">المنتجات</th>
            <th class="col-parent">القسم الرئيسي</th>
            <th class="col-status">الحالة</th>
            <th class="col-actions">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="state-row">
            <td colspan="5">جاري التحميل...</td>
          </tr>
          <tr v-else-if="filteredCategories.length === 0" class="state-row">
            <td colspan="5">لا توجد أقسام مطابقة للبحث</td>
          </tr>
          <template v-else>
            <tr v-for="cat in filteredCategories" :key="cat.id" class="data-row">
              <td class="col-name">
                <div class="cat-name-cell">
                  <div class="cat-image" v-if="cat.image">
                    <img :src="cat.image" :alt="cat.name_i18n?.ar || cat.name" />
                  </div>
                  <div class="cat-icon-placeholder" v-else>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <span>{{ cat.name_i18n?.ar || cat.name }}</span>
                  <svg class="sub-indicator" v-if="cat.parent_id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
                    <polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>
                  </svg>
                  <svg class="main-indicator" v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                </div>
              </td>
              <td class="col-products">
                <span class="products-count">{{ cat.products_count }} <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>
              </td>
              <td class="col-parent">
                <span v-if="cat.parent" class="parent-badge">{{ cat.parent.name_i18n?.ar || cat.parent.name }}</span>
                <span v-else class="dash-mark">—</span>
              </td>
              <td class="col-status">
                <span class="status-badge" :class="cat.is_active ? 'active' : 'inactive'">
                  {{ cat.is_active ? 'نشط' : 'غير نشط' }}
                </span>
              </td>
              <td class="col-actions">
                <div class="actions-group">
                  <button class="action-btn delete-btn" @click="confirmDelete(cat)" title="حذف">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                  <button class="action-btn edit-btn" @click="openEditModal(cat)" title="تعديل">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="action-btn view-btn" @click="openViewModal(cat)" title="عرض">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button class="action-btn add-sub-btn" v-if="!cat.parent_id" @click="openAddSubModal(cat)" title="إضافة قسم فرعي">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Modals -->
    <!-- Form Modal (Add/Edit) -->
    <div class="modal-overlay" v-if="showFormModal" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="modal-title">{{ isEdit ? 'تعديل قسم' : (form.parent_id ? 'إضافة قسم فرعي جديد' : 'إضافة قسم رئيسي جديد') }}</h3>
        <p class="modal-subtitle">أدخل معلومات القسم لإتمام العملية</p>

        <div class="i18n-toggle" role="tablist" aria-label="Language">
          <button type="button" class="i18n-btn" :class="{ active: activeLang === 'en' }" @click="activeLang = 'en'">English</button>
          <button type="button" class="i18n-btn" :class="{ active: activeLang === 'ar' }" @click="activeLang = 'ar'">العربية</button>
        </div>
        
        <form @submit.prevent="submitForm" class="cat-form">
          <!-- Image Upload -->
          <div class="form-group" style="text-align: center;">
            <label class="form-label" style="text-align: right; width: 100%;">صورة القسم <span class="req">*</span></label>
            <div class="image-upload-box" @click="triggerFileInput">
              <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" class="hidden-input" />
              <div v-if="imagePreview" class="preview-area">
                <img :src="imagePreview" class="preview-img" />
              </div>
              <div v-else class="upload-placeholder">
                <div class="upload-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p>إسحب وأفلت صورة القسم هنا</p>
                <span>أو انقر للاختيار من جهازك - الحد الأقصى 1 ميجابايت</span>
              </div>
            </div>
          </div>

          <!-- Name -->
          <div class="form-group" v-show="activeLang === 'ar'">
            <label class="form-label">الاسم (عربي) <span class="req">*</span></label>
            <input type="text" v-model="form.name_ar" class="form-control" placeholder="اسم القسم بالعربي" />
          </div>

          <div class="form-group" v-show="activeLang === 'en'">
            <label class="form-label">الاسم (English) <span class="req">*</span></label>
            <input type="text" v-model="form.name_en" class="form-control" placeholder="Category name in English" required />
          </div>



          <!-- Description -->
          <div class="form-group" v-show="activeLang === 'ar'">
            <label class="form-label">الوصف (عربي)</label>
            <textarea v-model="form.description_ar" class="form-control textarea" placeholder="وصف القسم بالعربي (اختياري)" rows="3"></textarea>
          </div>

          <div class="form-group" v-show="activeLang === 'en'">
            <label class="form-label">الوصف (English)</label>
            <textarea v-model="form.description_en" class="form-control textarea" placeholder="Category description in English (optional)" rows="3"></textarea>
          </div>

          <!-- Status -->
          <div class="form-group">
            <label class="form-label">الحالة</label>
            <div class="select-wrapper">
              <select v-model="form.is_active" class="form-control">
                <option :value="true">نشط</option>
                <option :value="false">غير نشط</option>
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="select-icon"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>

          <!-- Sort Order -->
          <div class="form-group">
            <label class="form-label">الترتيب</label>
            <input type="number" v-model="form.sort_order" class="form-control" placeholder="1" min="1" />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إضافة القسم') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div class="modal-overlay" v-if="showViewModal" @click.self="viewCategory = null; showViewModal = false;">
      <div class="modal-content view-content">
        <button class="modal-close" @click="viewCategory = null; showViewModal = false;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="modal-title" style="text-align: center;">تفاصيل القسم</h3>
        <p class="modal-subtitle" style="text-align: center; margin-bottom: 2rem;">معلومات شاملة عن القسم</p>
        
        <div class="view-header" v-if="viewCategory">
          <div class="view-img-large">
            <img v-if="viewCategory.image" :src="viewCategory.image" :alt="viewCategory.name" />
            <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <h4 class="view-name">{{ viewCategory.name_i18n?.ar || viewCategory.name }}</h4>
          <span class="status-badge" :class="viewCategory.is_active ? 'active' : 'inactive'" style="margin: 0.5rem auto;">
            {{ viewCategory.is_active ? 'نشط' : 'غير نشط' }}
          </span>
        </div>

        <div class="view-details" v-if="viewCategory">
          <div class="detail-row">
            <span class="detail-label">القسم الرئيسي:</span>
            <span class="detail-value">{{ viewCategory.parent ? (viewCategory.parent.name_i18n?.ar || viewCategory.parent.name) : 'لا يوجد (قسم رئيسي)' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">الوصف:</span>
            <span class="detail-value">{{ viewCategory.description || 'لا يوجد وصف' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">عدد المنتجات:</span>
            <span class="detail-value">{{ viewCategory.products_count }} منتج</span>
          </div>
        </div>
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

// State
const categories = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');

// Computed Stats
const activeCategoriesCount = computed(() => categories.value.filter(c => c.is_active).length);
const mainCategoriesCount = computed(() => categories.value.filter(c => !c.parent_id).length);
const subCategoriesCount = computed(() => categories.value.filter(c => c.parent_id).length);
const totalProductsCount = computed(() => categories.value.reduce((sum, c) => sum + (c.products_count || 0), 0));

// Filtered categories
const filteredCategories = computed(() => {
  return categories.value.filter(cat => {
    const matchSearch = (cat.name_i18n?.ar || cat.name).includes(searchQuery.value);
    const matchStatus = statusFilter.value === '' ? true : (cat.is_active.toString() === statusFilter.value);
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    // Show main category first, then its children
    if (a.parent_id === b.parent_id) return (a.sort_order || 0) - (b.sort_order || 0);
    if (a.parent_id === b.id) return 1;
    if (b.parent_id === a.id) return -1;
    return (a.parent_id || a.id) - (b.parent_id || b.id);
  });
});

const mainCategories = computed(() => categories.value.filter(c => !c.parent_id));

// Modals
const showFormModal = ref(false);
const showViewModal = ref(false);
const isEdit = ref(false);
const editingId = ref(null);
const viewCategory = ref(null);
const fileInput = ref(null);
const isSubmitting = ref(false);
const activeLang = ref('ar');

const form = ref({
  name_ar: '',
  name_en: '',
  description_ar: '',
  description_en: '',
  parent_id: '',
  is_active: true,
  sort_order: 1,
  image: null
});
const imagePreview = ref(null);

const getBaseForm = () => ({
  name_ar: '',
  name_en: '',
  description_ar: '',
  description_en: '',
  parent_id: '',
  is_active: true,
  sort_order: 1,
  image: null
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

// Fetch data
const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await api.get('/dashboard/categories');
    categories.value = res.data.data || res.data;
  } catch (error) {
    triggerAlert('فشل جلب الأقسام', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Force Arabic language for dashboard
  localStorage.setItem('lang', 'ar');
  fetchCategories();
});

const openAddModal = () => {
  isEdit.value = false;
  editingId.value = null;
  form.value = getBaseForm();
  imagePreview.value = null;
  activeLang.value = 'ar';
  showFormModal.value = true;
};

const openAddSubModal = (parentCat) => {
  openAddModal();
  form.value.parent_id = parentCat.id;
};

const openEditModal = (cat) => {
  isEdit.value = true;
  editingId.value = cat.id;
  const nameObj = cat.name_i18n && typeof cat.name_i18n === 'object' ? cat.name_i18n : null;
  const descObj = cat.description_i18n && typeof cat.description_i18n === 'object' ? cat.description_i18n : null;
  form.value = {
    name_ar: nameObj?.ar ?? cat.name ?? '',
    name_en: nameObj?.en ?? '',
    description_ar: descObj?.ar ?? cat.description ?? '',
    description_en: descObj?.en ?? '',
    parent_id: cat.parent_id || '',
    is_active: cat.is_active,
    sort_order: cat.sort_order || 0,
    image: null
  };
  imagePreview.value = cat.image || null;
  activeLang.value = 'ar';
  showFormModal.value = true;
};

const openViewModal = (cat) => {
  viewCategory.value = cat;
  showViewModal.value = true;
};

const closeModal = () => {
  showFormModal.value = false;
  form.value = getBaseForm();
  imagePreview.value = null;
  activeLang.value = 'ar';
};

// Image Upload
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 1 * 1024 * 1024) {
    triggerAlert('حجم الصورة يجب أن لا يتجاوز 1 ميجابايت', 'error');
    e.target.value = '';
    return;
  }
  form.value.image = file;
  imagePreview.value = URL.createObjectURL(file);
};

// Submit form
const submitForm = async () => {
  if (!String(form.value.name_ar || '').trim()) {
    activeLang.value = 'ar';
    triggerAlert('اسم القسم بالعربي مطلوب', 'error');
    return;
  }
  if (!String(form.value.name_en || '').trim()) {
    activeLang.value = 'en';
    triggerAlert('اسم القسم بالإنجليزية مطلوب', 'error');
    return;
  }

  isSubmitting.value = true;
  
  const formData = new FormData();
  formData.append('name', JSON.stringify({ ar: form.value.name_ar || '', en: form.value.name_en || '' }));
  formData.append('description', JSON.stringify({ ar: form.value.description_ar || '', en: form.value.description_en || '' }));
  if (form.value.parent_id) formData.append('parent_id', form.value.parent_id);
  formData.append('is_active', form.value.is_active ? 1 : 0);
  formData.append('sort_order', form.value.sort_order || 0);
  if (form.value.image) formData.append('image', form.value.image);

  try {
    if (isEdit.value) {
      formData.append('_method', 'PUT'); // For Laravel multipart put
      await api.post(`/dashboard/categories/${editingId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      triggerAlert('تم تحديث القسم بنجاح');
    } else {
      await api.post('/dashboard/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      triggerAlert('تم إضافة القسم بنجاح');
    }
    closeModal();
    fetchCategories();
  } catch (error) {
    const msg = error.response?.data?.message || 'حدث خطأ أثناء الحفظ';
    triggerAlert(msg, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Delete
const confirmDelete = async (cat) => {
  if (confirm(`هل أنت متأكد من حذف القسم "${cat.name_i18n?.ar || cat.name}"؟`)) {
    try {
      await api.delete(`/dashboard/categories/${cat.id}`);
      triggerAlert('تم الحذف بنجاح');
      fetchCategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'لا يمكن حذف القسم';
      triggerAlert(msg, 'error');
    }
  }
};
</script>

<style scoped>
.categories-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  direction: rtl;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  padding-bottom: 2rem;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.i18n-toggle {
  display: inline-flex;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  margin: 0.75rem auto 1.25rem;
}

.i18n-btn {
  border: none;
  background: transparent;
  padding: 0.4rem 0.9rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  color: #6b7280;
  min-width: 96px;
}

.i18n-btn.active {
  background: #873260;
  color: #fff;
}
.page-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.2rem;
}
.page-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
}
.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #873260;
  color: #fff;
  border: none;
  padding: 0.65rem 1.1rem;
  border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.add-btn:hover { background: #6E1A41; }

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.stat-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* RTL: right align text, icon right */
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  flex-direction: row-reverse;
}
.stat-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}
.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-top: 0.2rem;
}
.stat-icon-wrapper {
  width: 46px; height: 46px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.active-icon { background: #fdf2f8; color: #db2777; }
.total-icon { background: #ecfdf5; color: #059669; }
.sub-icon { background: #f3f4f6; color: #4b5563; }
.main-icon { background: #fefce8; color: #ca8a04; }

/* Filters */
.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  right: 1rem;
  color: #9ca3af;
}
.search-input {
  width: 100%;
  padding: 0.7rem 2.8rem 0.7rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 0.85rem;
  outline: none;
  background: #fff;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #873260; }

.filter-select {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 160px;
}
.form-select {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 0.85rem;
  color: #374151;
  appearance: none;
  outline: none;
  cursor: pointer;
}
.filter-select .select-icon {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  pointer-events: none;
}

/* Table */
.table-container {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  padding: 1rem;
  text-align: right;
  border-bottom: 1px solid #f3f4f6;
}
.data-table th {
  background: #f9fafb;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  white-space: nowrap;
}
.data-table td {
  font-size: 0.85rem;
  color: #374151;
  vertical-align: middle;
}
.data-row:hover td { background: #fdfafb; }
.state-row td { text-align: center; color: #6b7280; padding: 2rem; }

/* Columns alignment based on Figma */
.col-name { text-align: right; width: 45%; }
.col-products { text-align: center; width: 15%; }
.col-parent { text-align: center; width: 15%; }
.col-status { text-align: center; width: 10%; }
.col-actions { text-align: left; width: 15%; padding-left: 1.5rem !important; }
.data-table th.col-actions, .data-table th.col-status, .data-table th.col-parent { text-align: center; }
.data-table th.col-actions { text-align: left; }
.data-table th.col-name { text-align: right; }

.cat-name-cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  font-weight: 600;
  color: #111827;
  flex-direction: row; /* Image left then text */
}
.cat-image, .cat-icon-placeholder {
  width: 32px; height: 32px;
  border-radius: 6px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}
.cat-image img { width: 100%; height: 100%; object-fit: cover; }
.cat-icon-placeholder svg { color: #9ca3af; }

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
}
.status-badge.active { background: #ecfdf5; color: #059669; }
.status-badge.inactive { background: #f3f4f6; color: #4b5563; }

.parent-badge {
  background: #fdf2f8; color: #db2777;
  padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600;
}
.dash-mark { color: #9ca3af; }

.products-count {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #6b7280;
  font-weight: 600;
}

.actions-group {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* actions on the left side of RTL table */
  gap: 0.4rem;
}
.action-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.2s;
}
.action-btn:hover { background: #f3f4f6; }
.delete-btn:hover { color: #dc2626; background: #fef2f2; }
.edit-btn:hover { color: #2563eb; background: #eff6ff; }
.view-btn:hover { color: #059669; background: #ecfdf5; }
.add-sub-btn:hover { color: #db2777; background: #fdf2f8; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  padding: 1rem;
}
.modal-content {
  background: #fff; border-radius: 12px; width: 100%; max-width: 500px;
  padding: 2rem; position: relative; max-height: 90vh; overflow-y: auto;
}
.modal-close {
  position: absolute; top: 1.2rem; left: 1.2rem;
  background: none; border: none; color: #9ca3af; cursor: pointer;
  transition: color 0.2s;
}
.modal-close:hover { color: #111827; }
.modal-title { font-size: 1.2rem; font-weight: 800; color: #111827; text-align: center; margin-bottom: 0.2rem; }
.modal-subtitle { font-size: 0.8rem; color: #6b7280; text-align: center; margin-bottom: 1.5rem; }

.form-group { margin-bottom: 1.2rem; }
.form-label { display: block; font-size: 0.8rem; font-weight: 700; color: #374151; margin-bottom: 0.4rem; text-align: right; }
.req { color: #dc2626; }
.form-control {
  width: 100%; padding: 0.65rem 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #1f2937; outline: none; transition: border-color 0.2s; text-align: right;
}
.form-control:focus { border-color: #873260; }
.textarea { resize: vertical; min-height: 80px; }

.select-wrapper { position: relative; display: flex; align-items: center; }
.select-wrapper .form-control { appearance: none; padding-left: 2rem; cursor: pointer; }
.select-wrapper .select-icon { position: absolute; left: 0.8rem; color: #9ca3af; pointer-events: none; }

.image-upload-box {
  border: 1.5px dashed #d1d5db; border-radius: 10px; padding: 1.5rem; text-align: center; cursor: pointer;
  transition: border-color 0.2s, background 0.2s; background: #fafafa;
}
.image-upload-box:hover { border-color: #873260; background: #fdfafb; }
.hidden-input { display: none; }
.upload-icon { color: #9ca3af; margin-bottom: 0.5rem; display: inline-flex; }
.upload-placeholder p { font-size: 0.85rem; font-weight: 600; color: #374151; margin: 0 0 0.2rem; }
.upload-placeholder span { font-size: 0.75rem; color: #9ca3af; }
.preview-area { display: flex; justify-content: center; }
.preview-img { max-height: 120px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

.form-actions { margin-top: 1.5rem; display: flex; justify-content: center; }
.btn-submit {
  background: #873260; color: #fff; border: none; padding: 0.7rem 2rem; border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: background 0.2s;
  width: 100%;
}
.btn-submit:hover:not(:disabled) { background: #6E1A41; }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

/* View Modal */
.view-content { max-width: 400px; }
.view-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem; }
.view-img-large {
  width: 80px; height: 80px; border-radius: 12px; overflow: hidden; background: #f3f4f6;
  display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; border: 1px solid #e5e7eb;
}
.view-img-large img { width: 100%; height: 100%; object-fit: cover; }
.view-name { font-size: 1.25rem; font-weight: 800; color: #111827; }

.view-details { background: #f9fafb; border-radius: 10px; padding: 1.2rem; display: flex; flex-direction: column; gap: 0.8rem; }
.detail-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.detail-label { font-size: 0.8rem; font-weight: 700; color: #6b7280; flex-shrink: 0; }
.detail-value { font-size: 0.85rem; font-weight: 600; color: #1f2937; text-align: left; }

/* Alert */
.alert-toast {
  position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%) translateY(100px);
  padding: 0.75rem 1.5rem; border-radius: 30px; font-size: 0.85rem; font-weight: 600;
  display: flex; align-items: center; gap: 0.5rem; opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-family: 'IBM Plex Sans Arabic', sans-serif;
}
.alert-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
.alert-toast.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.alert-toast.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.alert-icon { flex-shrink: 0; }
</style>
