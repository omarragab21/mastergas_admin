<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../config/axios';

// State
const sliders = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const showFormModal = ref(false);
const showViewModal = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const currentSlider = ref(null);
const deleteTarget = ref(null);
const isDeleting = ref(false);
const previewImage = ref(null);
const imageFile = ref(null);
const activeLang = ref('ar');

const backendOrigin = (import.meta.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api')
    .replace(/\/api\/?$/, '');

const normalizeSliderImage = (value) => {
    if (!value) return value;
    const raw = String(value);
    if (raw.startsWith('/storage/')) return `${backendOrigin}/public${raw}`;
    if (raw.includes('/storage/') && !raw.includes('/public/storage/')) {
        return raw.replace('/storage/', '/public/storage/');
    }
    return raw;
};

const form = ref({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    link: '',
    status: 'active',
    order: 0
});

const initialForm = { ...form.value };

// Fetch Sliders
const fetchSliders = async () => {
    loading.value = true;
    try {
        const response = await api.get('/dashboard/sliders', {
            params: { search: searchQuery.value }
        });
        sliders.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch sliders', error);
        triggerAlert('فشل تحميل البيانات', 'error');
    } finally {
        loading.value = false;
    }
};

onMounted(fetchSliders);

// Filtering
const filteredSliders = computed(() => sliders.value);

// Form Actions
const openAddModal = () => {
    isEditing.value = false;
    form.value = { ...initialForm };
    previewImage.value = null;
    imageFile.value = null;
    activeLang.value = 'ar';
    showFormModal.value = true;
};

const openEditModal = (slider) => {
    isEditing.value = true;
    currentSlider.value = slider;
    const titleObj = slider.title_i18n && typeof slider.title_i18n === 'object' ? slider.title_i18n : null;
    const descObj = slider.description_i18n && typeof slider.description_i18n === 'object' ? slider.description_i18n : null;
    form.value = {
        title_ar: titleObj?.ar ?? slider.title ?? '',
        title_en: titleObj?.en ?? '',
        description_ar: descObj?.ar ?? slider.description ?? '',
        description_en: descObj?.en ?? '',
        link: slider.link,
        status: slider.status,
        order: slider.order
    };
    previewImage.value = normalizeSliderImage(slider.image);
    imageFile.value = null;
    activeLang.value = 'ar';
    showFormModal.value = true;
};

const openViewModal = (slider) => {
    currentSlider.value = slider;
    showViewModal.value = true;
};

const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 1 * 1024 * 1024) {
            triggerAlert('حجم الصورة يجب أن لا يتجاوز 1 ميجابايت', 'error');
            e.target.value = '';
            return;
        }
        imageFile.value = file;
        previewImage.value = URL.createObjectURL(file);
    }
};

const submitForm = async () => {
    // Validate bilingual fields
    if (!String(form.value.title_ar || '').trim()) {
        activeLang.value = 'ar';
        triggerAlert('عنوان الشريحة بالعربي مطلوب', 'error');
        return;
    }
    if (!String(form.value.title_en || '').trim()) {
        activeLang.value = 'en';
        triggerAlert('عنوان الشريحة بالإنجليزية مطلوب', 'error');
        return;
    }

    isSubmitting.value = true;
    const formData = new FormData();
    formData.append('title', JSON.stringify({ ar: form.value.title_ar || '', en: form.value.title_en || '' }));
    if (form.value.description_ar || form.value.description_en) {
        formData.append('description', JSON.stringify({ ar: form.value.description_ar || '', en: form.value.description_en || '' }));
    }
    formData.append('link', form.value.link || '');
    formData.append('status', form.value.status);
    formData.append('order', form.value.order ?? 0);
    if (imageFile.value) {
        formData.append('image', imageFile.value);
    }

    try {
        if (isEditing.value) {
            // Use POST with _method=PUT for multipart/form-data compatibility if needed
            // but standard Laravel POST to a specific update route also works if we use PUT pattern correctly
            // Actually usually for file upload update, we use POST with _method=PUT
            formData.append('_method', 'PUT');
            await api.post(`/dashboard/sliders/${currentSlider.value.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            triggerAlert('تم تحديث الشريحة بنجاح');
        } else {
            await api.post('/dashboard/sliders', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            triggerAlert('تم إضافة الشريحة بنجاح');
        }
        showFormModal.value = false;
        fetchSliders();
    } catch (error) {
        const msg = error.response?.data?.message || 'فشل حفظ البيانات';
        triggerAlert(msg, 'error');
    } finally {
        isSubmitting.value = false;
    }
};

const confirmDelete = (slider) => {
    deleteTarget.value = slider;
};

const cancelDelete = () => {
    if (!isDeleting.value) deleteTarget.value = null;
};

const executeDelete = async () => {
    if (!deleteTarget.value || isDeleting.value) return;

    const target = deleteTarget.value;
    isDeleting.value = true;
    try {
        await api.delete(`/dashboard/sliders/${target.id}`);
        sliders.value = sliders.value.filter((slider) => slider.id !== target.id);
        deleteTarget.value = null;
        triggerAlert('تم حذف الشريحة بنجاح');
    } catch (error) {
        const message = error.response?.data?.message || 'فشل حذف الشريحة. حاول مرة أخرى.';
        triggerAlert(message, 'error');
    } finally {
        isDeleting.value = false;
    }
};

const toggleStatus = async (slider) => {
    try {
        const newStatus = slider.status === 'active' ? 'inactive' : 'active';
        await api.put(`/dashboard/sliders/${slider.id}`, { status: newStatus });
        slider.status = newStatus;
        triggerAlert('تم تحديث الحالة');
    } catch (error) {
        triggerAlert('فشل تحديث الحالة', 'error');
    }
};

// Helpers
const formatStatus = (status) => {
    const statuses = {
        'active': 'نشط',
        'inactive': 'غير نشط',
        'scheduled': 'مجدول'
    };
    return statuses[status] || status;
};

const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('success');

const triggerAlert = (message, type = 'success') => {
    alertMessage.value = message;
    alertType.value = type;
    showAlert.value = true;
    setTimeout(() => showAlert.value = false, 3000);
};

const copyLink = (text) => {
    navigator.clipboard.writeText(text);
    triggerAlert('تم نسخ الرابط بنجاح');
};
</script>

<template>
  <div class="sliders-page p-6">
    <!-- Action Bar -->
    <div class="header-action mb-6">
       
         <div class="title-with-icon">
             <div class="icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
             </div>
             <div>
                <h1>إعلانات السلايدر</h1>
                <p>إدارة شرائح العرض في الصفحة الرئيسية</p>
             </div>
          </div>

       <div class="page-title-area">
          <button class="add-btn" @click="openAddModal">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
         إضافة شريحة جديدة
       </button>
       </div>
    </div>

    <!-- Filters -->
    <div class="filters-card mb-6">
        <div class="search-box">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" v-model="searchQuery" @input="fetchSliders" placeholder="البحث عن شريحة..." />
        </div>
    </div>

    <!-- Table -->
    <div class="table-container shadow-sm">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-order">الترتيب</th>
            <th class="col-info text-right">الصورة والعنوان</th>
            <th class="col-desc">الوصف</th>
            <th class="col-link">الرابط</th>
            <th class="col-status">الحالة</th>
            <th class="col-actions">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="state-row"><td colspan="6">جاري التحميل...</td></tr>
          <tr v-else-if="filteredSliders.length === 0" class="state-row"><td colspan="6">لا توجد شرائح متوفرة</td></tr>
          <template v-else>
            <tr v-for="slider in filteredSliders" :key="slider.id" class="data-row">
              <td class="col-order">
                  <span class="order-badge">#{{ slider.order }}</span>
              </td>
              <td class="col-info text-right">
                <div class="image-title-cell">
                   <div class="slider-thumb">
                      <img :src="normalizeSliderImage(slider.image)" v-if="slider.image" />
                      <div class="img-placeholder" v-else>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><polyline points="10 13 13 10 21 18"/><circle cx="8" cy="8" r="3"/></svg>
                      </div>
                   </div>
                   <div class="info-text">
                      <span class="main-title">{{ slider.title_i18n?.ar || slider.title }}</span>
                   </div>
                </div>
              </td>
              <td class="col-desc">
                <div class="desc-text truncate-2">{{ slider.description_i18n?.ar || slider.description || '-' }}</div>
              </td>
              <td class="col-link">
                <div class="link-wrapper" v-if="slider.link">
                   <span class="link-text">{{ slider.link }}</span>
                   <button class="copy-btn" @click.stop="copyLink(slider.link)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                   </button>
                </div>
                <span v-else>-</span>
              </td>
              <td class="col-status">
                <span :class="['status-badge-table', slider.status]" @click="toggleStatus(slider)" style="cursor: pointer;">
                  {{ formatStatus(slider.status) }}
                </span>
              </td>
              <td class="col-actions">
                <div class="actions-group">
                  <button class="action-btn view" title="عرض" @click="openViewModal(slider)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button class="action-btn edit" title="تعديل" @click="openEditModal(slider)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="action-btn delete" title="حذف" @click="confirmDelete(slider)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Form Modal -->
    <div class="modal-overlay" v-if="showFormModal" @click.self="showFormModal = false">
      <div class="modal-content side-modal">
        <div class="modal-header">
           <button class="close-btn" @click="showFormModal = false">×</button>
           <h2>{{ isEditing ? 'تعديل الشريحة' : 'إضافة شريحة جديدة' }}</h2>
           <p>{{ isEditing ? 'تعديل معلومات الشريحة المحددة' : 'إضافة شريحة عرض جديدة للسلايدر' }}</p>
        </div>
        
        <div class="modal-body">
           <div class="i18n-toggle" role="tablist" aria-label="Language">
             <button type="button" class="i18n-btn" :class="{ active: activeLang === 'en' }" @click="activeLang = 'en'">English</button>
             <button type="button" class="i18n-btn" :class="{ active: activeLang === 'ar' }" @click="activeLang = 'ar'">العربية</button>
           </div>

           <div class="upload-area mb-6">
              <label class="upload-label">صورة الشريحة</label>
              <div class="image-preview-box" @click="$refs.imageInput.click()">
                 <img v-if="previewImage" :src="previewImage" />
                 <div class="upload-placeholder" v-else>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>اسحب الصورة هنا أو اضغط للاختيار</span>
                    <small>يفضل مقاس كبير (مثلاً 1920x800) - الحد الأقصى 1 ميجابايت</small>
                 </div>
              </div>
              <input type="file" ref="imageInput" @change="handleImageChange" hidden accept="image/*" />
           </div>

           <div class="form-group mb-4">
              <label class="form-label">العنوان <span class="req">*</span></label>
              <input v-show="activeLang === 'ar'" type="text" v-model="form.title_ar" class="form-control" placeholder="عنوان الشريحة بالعربي..." />
              <input v-show="activeLang === 'en'" type="text" v-model="form.title_en" class="form-control" placeholder="Slider title in English..." />
           </div>

           <div class="form-group mb-4">
              <label class="form-label">الوصف</label>
              <textarea v-show="activeLang === 'ar'" v-model="form.description_ar" class="form-control" rows="3" placeholder="وصف قصير للعرض بالعربي..."></textarea>
              <textarea v-show="activeLang === 'en'" v-model="form.description_en" class="form-control" rows="3" placeholder="Short slider description in English..."></textarea>
           </div>

           <div class="form-group mb-4">
              <label class="form-label">الرابط (اختياري)</label>
              <div class="link-input">
                 <input type="text" v-model="form.link" class="form-control ltr-text" placeholder="https://example.com/product" />
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
           </div>

           <div class="form-row mb-4">
              <div class="form-group flex-1">
                 <label class="form-label">الترتيب</label>
                 <input type="number" v-model="form.order" class="form-control" min="0" />
              </div>
              <div class="form-group flex-1">
                 <label class="form-label">الحالة</label>
                 <select v-model="form.status" class="form-control">
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="scheduled">مجدول</option>
                 </select>
              </div>
           </div>
        </div>

        <div class="modal-footer">
           <button class="btn-cancel" @click="showFormModal = false">إلغاء</button>
           <button class="btn-save" :disabled="isSubmitting" @click="submitForm">
              {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الشريحة' }}
           </button>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div class="modal-overlay" v-if="showViewModal" @click.self="showViewModal = false">
      <div class="modal-content info-modal">
        <div class="modal-header">
           <button class="close-btn" @click="showViewModal = false">×</button>
           <h2>تفاصيل الشريحة</h2>
           <p>معلومات كاملة عن شريحة السلايدر</p>
        </div>
        <div class="modal-body p-0">
           <div class="view-image-full" v-if="currentSlider.image">
              <img :src="normalizeSliderImage(currentSlider.image)" alt="Slider" />
           </div>
           <div class="modal-body p-8">
              <div class="info-row">
                 <label>العنوان:</label>
                 <span class="font-bold">{{ currentSlider.title_i18n?.ar || currentSlider.title }}</span>
              </div>
              <div class="info-row">
                 <label>الوصف:</label>
                 <span>{{ currentSlider.description_i18n?.ar || currentSlider.description || '-' }}</span>
              </div>
              <div class="info-row">
                 <label>الرابط:</label>
                 <span class="ltr-text text-blue">{{ currentSlider.link || '-' }}</span>
              </div>
              <div class="info-row-flex mt-4">
                 <div class="info-item">
                    <label>الحالة:</label>
                    <span :class="['status-badge-table', currentSlider.status]">{{ formatStatus(currentSlider.status) }}</span>
                 </div>
                 <div class="info-item">
                    <label>الترتيب:</label>
                    <span class="order-badge">#{{ currentSlider.order }}</span>
                 </div>
              </div>
           </div>
        </div>
        <div class="modal-footer">
           <button class="btn-save-alt" @click="showViewModal = false">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div class="modal-overlay" v-if="deleteTarget" @click.self="cancelDelete">
      <div class="modal-content delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <div class="delete-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.6 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/>
          </svg>
        </div>
        <div class="delete-copy">
          <h2 id="delete-title">تأكيد حذف الشريحة</h2>
          <p>هل أنت متأكد من حذف شريحة «{{ deleteTarget.title_i18n?.ar || deleteTarget.title }}»؟ لا يمكن التراجع عن هذا الإجراء.</p>
        </div>
        <div class="modal-footer delete-footer">
          <button class="btn-cancel" type="button" :disabled="isDeleting" @click="cancelDelete">إلغاء</button>
          <button class="btn-delete-confirm" type="button" :disabled="isDeleting" @click="executeDelete">
            <span v-if="isDeleting" class="delete-spinner" aria-hidden="true"></span>
            {{ isDeleting ? 'جاري الحذف...' : 'حذف الشريحة' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Alert -->
    <div v-if="showAlert" :class="['alert-toast', alertType]">
       {{ alertMessage }}
    </div>
  </div>
</template>

<style scoped>
.sliders-page { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; }

/* Header */
.header-action { display: flex; justify-content: space-between; align-items: center; }
.add-btn { background: #873260; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
.add-btn:hover { background: #6b1a3f; transform: translateY(-2px); }

.page-title-area h1 { font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin: 0; }
.page-title-area p { color: var(--text-muted); font-size: 0.875rem; margin: 0; }
.title-with-icon { display: flex; align-items: center; gap: 12px; }
.icon-box { background: #fdf2f8; color: #873260; width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

/* Filters */
.filters-card { background: var(--bg-card); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); }
.search-box { position: relative; width: 100%; }
.search-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
.search-box input { width: 100%; padding: 10px 44px 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; outline: none; transition: 0.3s; font-family: inherit; background: var(--input-bg); color: var(--text-main); }
.search-box input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(139, 34, 82, 0.1); }

/* Table */
.table-container { background: var(--bg-card); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); }
.data-table { width: 100%; border-collapse: collapse; text-align: center; }
.data-table th { background: var(--table-header-bg); padding: 14px; font-weight: 700; color: var(--text-main); font-size: 0.9rem; border-bottom: 2px solid var(--table-border); }
.data-table td { padding: 14px; border-bottom: 1px solid var(--table-border); vertical-align: middle; color: var(--text-main); font-size: 0.9rem; }

.data-row:hover { background: var(--table-hover); }
.state-row td { padding: 40px; color: #9ca3af; }

.col-order { width: 80px; }
.col-info { width: 300px; }
.col-link { width: 250px; }
.col-status { width: 100px; }
.col-actions { width: 150px; }

.order-badge { background: #f3f4f6; color: #4b5563; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; }

.image-title-cell { display: flex; align-items: center; gap: 12px; }
.slider-thumb { width: 60px; height: 35px; border-radius: 6px; overflow: hidden; background: #f3f4f6; border: 1px solid #e5e7eb; }
.slider-thumb img { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; }

.main-title { font-weight: 700; color: var(--text-main); }
.desc-text { color: var(--text-muted); font-size: 0.85rem; max-width: 200px; margin: 0 auto; line-height: 1.4; }
.truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.link-wrapper { display: flex; align-items: center; gap: 6px; justify-content: center; }
.link-text { color: #2563eb; direction: ltr; font-size: 0.8rem; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.copy-btn { border: none; background: #eff6ff; color: #2563eb; width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
.copy-btn:hover { background: #dbeafe; }

.status-badge-table { padding: 4px 10px; border-radius: 100px; font-size: 0.8rem; font-weight: 700; }
.status-badge-table.active { background: #064e3b; color: #10b981; }
.status-badge-table.inactive { background: var(--bg-main); color: var(--text-muted); }
.status-badge-table.scheduled { background: #431407; color: #f97316; }

.actions-group { display: flex; gap: 8px; justify-content: center; }
.action-btn { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
.action-btn.view { background: #f0f9ff; color: #0ea5e9; }
.action-btn.view:hover { background: #e0f2fe; }
.action-btn.edit { background: #f5f3ff; color: #8b5cf6; }
.i18n-toggle { display: inline-flex; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: var(--bg-card); margin: 0 auto 18px; }
.i18n-btn { border: none; background: transparent; padding: 0.4rem 0.9rem; font-weight: 800; font-size: 0.85rem; cursor: pointer; color: var(--text-muted); min-width: 96px; font-family: inherit; }
.i18n-btn.active { background: #873260; color: #fff; }

.action-btn.edit:hover { background: #ede9fe; }
.action-btn.delete { background: #fef2f2; color: #ef4444; }
.action-btn.delete:hover { background: #fee2e2; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; width: 100%; max-width: 500px; animation: modalPop 0.3s ease-out; }

.side-modal { position: fixed; top: 0; left: 0; height: 100vh; max-width: 450px; border-radius: 0; animation: modalSlideLeft 0.3s ease-out; display: flex; flex-direction: column; }

@keyframes modalPop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes modalSlideLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }

.modal-header { padding: 24px; border-bottom: 1px solid var(--border-color); position: relative; }
.close-btn { position: absolute; left: 24px; top: 24px; border: none; background: var(--bg-main); color: var(--text-main); width: 32px; height: 32px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; line-height: 1; }
.modal-header h2 { font-weight: 800; font-size: 1.25rem; margin: 0 0 4px 0; color: var(--text-main); }
.modal-header p { color: var(--text-muted); font-size: 0.85rem; margin: 0; }

.modal-body { padding: 24px; flex: 1; overflow-y: auto; }

.upload-area { position: relative; }
.upload-label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: var(--text-main); }
.image-preview-box { width: 100%; aspect-ratio: 16/7; background: var(--bg-main); border: 2px dashed var(--border-color); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; transition: 0.3s; }
.image-preview-box:hover { border-color: var(--primary); background: var(--bg-card); }
.image-preview-box img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #9ca3af; text-align: center; padding: 20px; }
.upload-placeholder span { font-weight: 600; font-size: 0.9rem; color: #374151; }
.upload-placeholder small { font-size: 0.75rem; }

.form-label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: var(--text-main); }
.form-control { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border-color); background: var(--input-bg); color: var(--text-main); border-radius: 10px; outline: none; transition: 0.30s; font-family: inherit; }
.form-control:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(139, 34, 82, 0.1); }

.link-input { position: relative; }
.link-input input { padding-left: 40px; }
.link-input svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }

.form-row { display: flex; gap: 16px; }
.flex-1 { flex: 1; }

.modal-footer { padding: 20px 24px; background: var(--bg-main); border-top: 1px solid var(--border-color); display: flex; gap: 12px; }
.btn-save { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; flex: 1; transition: 0.3s; }
.btn-save:disabled { background: var(--border-color); cursor: not-allowed; }
.btn-cancel { background: var(--bg-card); color: var(--text-muted); border: 1.5px solid var(--border-color); padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; flex: 1; transition: 0.2s; }
.btn-cancel:hover { background: var(--bg-main); }

/* Info Modal */
.info-modal { max-width: 600px; border-radius: 24px; }
.view-image-full { width: 100%; height: 200px; overflow: hidden; }
.view-image-full img { width: 100%; height: 100%; object-fit: cover; }
.info-row { display: flex; gap: 8px; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
.info-row label { color: #6b7280; font-weight: 600; width: 80px; }
.info-row-flex { display: flex; gap: 40px; }
.info-item { display: flex; align-items: center; gap: 10px; }
.info-item label { color: #6b7280; font-weight: 600; }
.btn-save-alt { width: 100%; background: #1f2937; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; }

.delete-modal { max-width: 460px; padding: 28px; text-align: center; }
.delete-icon { width: 58px; height: 58px; margin: 0 auto 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #dc2626; background: #fef2f2; }
.delete-copy h2 { margin: 0 0 8px; color: var(--text-main); font-size: 1.2rem; }
.delete-copy p { margin: 0; color: var(--text-muted); line-height: 1.7; font-size: 0.92rem; }
.delete-footer { padding: 24px 0 0; background: transparent; border-top: 0; }
.delete-footer button { min-height: 44px; }
.btn-delete-confirm { background: #dc2626; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; flex: 1; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.btn-delete-confirm:hover { background: #b91c1c; }
.btn-delete-confirm:disabled, .btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
.delete-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.45); border-top-color: white; border-radius: 50%; animation: delete-spin 0.7s linear infinite; }
@keyframes delete-spin { to { transform: rotate(360deg); } }

/* Utils */
.mb-6 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 16px; }
.p-0 { padding: 0 !important; }
.mt-4 { margin-top: 16px; }
.font-bold { font-weight: 700; }
.ltr-text { direction: ltr; text-align: left; }
.text-blue { color: #2563eb; }

/* Alert Toast */
.alert-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 10px; color: white; font-weight: 700; z-index: 2000; box-shadow: 0 10px 15px rgba(0,0,0,0.1); animation: toastIn 0.3s ease-out; }
@keyframes toastIn { from { top: -50px; opacity: 0; } to { top: 24px; opacity: 1; } }
.alert-toast.success { background: #10b981; }
.alert-toast.error { background: #ef4444; }

@media (max-width: 768px) {
  .header-action { flex-direction: column-reverse; gap: 16px; align-items: stretch; }
  .col-desc, .col-link { display: none; }
  .side-modal { max-width: 100%; }
}
</style>
