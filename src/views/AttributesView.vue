<template>
  <div class="attributes-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-titles">
        <h2 class="page-title">خصائص المنتجات</h2>
        <p class="page-subtitle">إدارة القيم المتاحة ضمن خصائص المنتجات المعرفة مسبقاً</p>
      </div>
      <button class="header-add-btn" type="button" @click="openAttributeModal">+ إضافة خاصية</button>
    </div>

    <!-- Add Attribute Modal -->
    <div class="modal-overlay" v-if="showAttributeModal" @click.self="closeAttributeModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeAttributeModal">×</button>
        <h3 class="modal-title">إضافة خاصية منتج</h3>
        <p class="modal-subtitle">أضف اللون أو المقاس أو أي خاصية نصية جديدة</p>
        <form class="value-form" @submit.prevent="submitAttribute">
          <div class="form-group"><label class="form-label">الاسم بالعربي *</label><input v-model="attributeForm.name_ar" class="form-control" required placeholder="اللون" /></div>
          <div class="form-group"><label class="form-label">الاسم بالإنجليزية *</label><input v-model="attributeForm.name_en" class="form-control" required placeholder="Color" /></div>
          <div class="form-group"><label class="form-label">نوع الخاصية</label><select v-model="attributeForm.type" class="form-control"><option value="color">لون</option><option value="select">اختيارات</option><option value="text">نص</option></select></div>
          <div class="form-group"><label class="form-label">القيم (افصل بينها بفاصلة)</label><input v-model="attributeForm.values_list" class="form-control" placeholder="أسود|#111827, أبيض|#ffffff" /></div>
          <div class="form-actions">
            <button class="btn-cancel" type="button" @click="closeAttributeModal">إلغاء</button>
            <button class="btn-submit" type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الخاصية' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-name">الخاصية</th>
            <th class="col-values">القيم المتوفرة</th>
            <th class="col-status">الحالة</th>
            <th class="col-actions">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="state-row">
            <td colspan="4">جاري التحميل...</td>
          </tr>
          <tr v-else-if="attributes.length === 0" class="state-row">
            <td colspan="4">لا توجد خصائص مضافة مسبقاً</td>
          </tr>
          <template v-else>
            <tr v-for="attr in attributes" :key="attr.id" class="data-row">
              <td class="col-name">
                <div class="attr-name-cell">
                  <div class="attr-text">
                    <span class="attr-title">{{ attr.name }}</span>
                    <span class="attr-desc">{{ attr.label }}</span>
                  </div>
                </div>
              </td>
              <td class="col-values">
                <div class="values-chips">
                  <!-- Show up to 5 values -->
                  <span v-for="val in attr.values.slice(0, 5)" :key="val.id" class="value-chip" :class="{ 'inactive-chip': !val.is_active }">
                    <span v-if="val.color" class="color-dot" :style="{ background: val.color }"></span>
                    {{ val.label }}
                  </span>
                  <span v-if="attr.values.length > 5" class="value-chip more-chip">
                    +{{ attr.values.length - 5 }}
                  </span>
                  <span v-if="attr.values.length === 0" class="no-values-text">لا توجد قيم يرجى الإضافة</span>
                </div>
              </td>
              <td class="col-status">
                <span class="status-badge" :class="attr.is_active ? 'active' : 'inactive'">
                  {{ attr.is_active ? 'نشط' : 'غير نشط' }}
                </span>
              </td>
              <td class="col-actions">
                <div class="actions-group">
                  <button class="action-btn view-btn" @click="openManageModal(attr)" title="إدارة القيم">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  </button>
                  <button class="action-btn add-btn" @click="openAddValueModal(attr)" title="إضافة قيمة جديدة">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                  <button class="action-btn delete-btn" @click="deleteAttributeItem(attr)" title="حذف الخاصية" aria-label="حذف الخاصية">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
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
    <!-- Add/Edit Value Modal -->
    <div class="modal-overlay" v-if="showValueModal" @click.self="closeValueModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeValueModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="modal-title">{{ isEditingValue ? 'تعديل قيمة خاصية' : 'إضافة قيمة جديدة' }}</h3>
        <p class="modal-subtitle">إضافة أو تعديل قيمة لظهورها في خيارات المنتج</p>
        
        <form @submit.prevent="submitValue" class="value-form">
          
          <!-- Binding (Readonly) -->
          <div class="form-group">
            <label class="form-label">الارتباط <span class="req">*</span></label>
            <div class="readonly-input">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>{{ selectedAttribute?.name }} ({{ selectedAttribute?.label }})</span>
            </div>
          </div>

          <!-- Color Code -->
          <div class="form-group" v-if="selectedAttribute?.type === 'color' || valueForm.color || hasColorType(selectedAttribute)">
            <label class="form-label">رمز اللون</label>
            <div class="color-picker-wrapper">
              <input type="text" v-model="valueForm.color" class="form-control color-text-input" placeholder="#000000 أو Red" />
              <input type="color" v-model="valueForm.color" class="color-picker-input" />
            </div>
            <span class="help-text">اختر لوناً إذا كانت القيمة تمثل لوناً مخصصاً (كود Hex)</span>
          </div>

          <!-- Value Name -->
          <div class="form-group">
            <label class="form-label">اسم القيمة <span class="req">*</span></label>
            <input type="text" v-model="valueForm.label" class="form-control" placeholder="مثال: أحمر أو XL ... إلخ" required />
          </div>

          <!-- Status -->
          <div class="form-group">
            <label class="form-label">الحالة</label>
            <div class="select-wrapper">
              <select v-model="valueForm.is_active" class="form-control">
                <option :value="true">نشط</option>
                <option :value="false">غير نشط</option>
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="select-icon"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeValueModal">إلغاء</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'جاري الحفظ...' : (isEditingValue ? 'تحديث القيمة' : 'إضافة القيمة') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Manage Values Modal -->
    <div class="modal-overlay" v-if="showManageModal" @click.self="closeManageModal">
      <div class="modal-content manage-content">
        <button class="modal-close" @click="closeManageModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="modal-title">القيم الخاصة بـ: {{ selectedAttribute?.name }}</h3>
        <p class="modal-subtitle">عرض القيم المتاحة ليتم تعيينها لخيارات المنتجات</p>
        
        <div class="manage-list">
          <div class="manage-list-empty" v-if="selectedAttribute?.values?.length === 0">
            لا توجد قيم حالياً. استخدم الزر الخاص بالإضافة من الجدول.
          </div>
          
          <div v-for="val in selectedAttribute?.values" :key="val.id" class="manage-item">
            <div class="manage-item-info">
              <span class="status-dot" :class="val.is_active ? 'active-dot' : 'inactive-dot'"></span>
              <span class="manage-item-label">{{ val.label }}</span>
              <div v-if="val.color" class="manage-item-color" :style="{ background: val.color }"></div>
            </div>
            
            <div class="manage-item-actions">
              <button class="manage-btn edit-val-btn" @click="editValueItem(val)" title="تعديل">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="manage-btn delete-val-btn" @click="deleteValueItem(val)" title="حذف">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="manage-footer">
          <button class="btn-cancel" @click="closeManageModal">إغلاق</button>
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
import { ref, onMounted } from 'vue';
import productAttributeService from '../services/productAttributeService';

const attributes = ref([]);
const loading = ref(false);

const selectedAttribute = ref(null);

// Forms
const showValueModal = ref(false);
const isEditingValue = ref(false);
const isSubmitting = ref(false);
const currentEditValueId = ref(null);
const valueForm = ref({
  label: '',
  color: '',
  is_active: true
});

const showManageModal = ref(false);
const showAttributeModal = ref(false);
const attributeForm = ref({ name_ar: '', name_en: '', label_ar: '', label_en: '', type: 'select', values_list: '', is_active: true, sort_order: 1 });

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

const fetchAttributes = async () => {
  loading.value = true;
  try {
    attributes.value = await productAttributeService.list();
    
    // update selectedAttribute if its open
    if (selectedAttribute.value) {
      const updated = attributes.value.find(a => a.id === selectedAttribute.value.id);
      if (updated) {
        selectedAttribute.value = updated;
      }
    }
  } catch (err) {
    triggerAlert('فشل جلب الخصائص', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAttributes();
});

// Checks if we should show color picker for attribute
const hasColorType = (attr) => {
  return attr?.name?.includes('لون') || attr?.name?.includes('Color'); // simple heuristic
};

// Value Form Actions
const openAddValueModal = (attr) => {
  selectedAttribute.value = attr;
  isEditingValue.value = false;
  currentEditValueId.value = null;
  valueForm.value = { label: '', color: hasColorType(attr) ? '#000000' : '', is_active: true };
  showValueModal.value = true;
};

const closeValueModal = () => {
  showValueModal.value = false;
  selectedAttribute.value = null;
};

const openAttributeModal = () => {
  attributeForm.value = { name_ar: '', name_en: '', label_ar: '', label_en: '', type: 'select', values_list: '', is_active: true, sort_order: attributes.value.length + 1 };
  showAttributeModal.value = true;
};

const closeAttributeModal = () => { showAttributeModal.value = false; };

const submitAttribute = async () => {
  isSubmitting.value = true;
  try {
    await productAttributeService.create({
      ...attributeForm.value,
      label_ar: attributeForm.value.label_ar || `اختر ${attributeForm.value.name_ar}`,
      label_en: attributeForm.value.label_en || `Select ${attributeForm.value.name_en}`,
    });
    closeAttributeModal();
    await fetchAttributes();
    triggerAlert('تم إضافة الخاصية بنجاح');
  } catch (error) {
    triggerAlert(error.response?.data?.message || 'تعذر إضافة الخاصية', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const submitValue = async () => {
  if (!selectedAttribute.value) return;
  isSubmitting.value = true;
  try {
    const payload = { ...valueForm.value };
    if (!payload.color) payload.color = null;

    if (isEditingValue.value) {
      await productAttributeService.updateValue(selectedAttribute.value.id, currentEditValueId.value, payload);
      triggerAlert('تم تحديث القيمة بنجاح');
    } else {
      await productAttributeService.createValue(selectedAttribute.value.id, payload);
      triggerAlert('تم إضافة القيمة بنجاح');
    }
    closeValueModal();
    // Keep the manage modal/list in sync with the server before showing success.
    await fetchAttributes();
  } catch (error) {
    const msg = error.response?.data?.message || 'حدث خطأ أثناء الحفظ';
    triggerAlert(msg, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Manage Values Modal Actions
const openManageModal = (attr) => {
  selectedAttribute.value = attr;
  showManageModal.value = true;
};

const closeManageModal = () => {
  showManageModal.value = false;
  selectedAttribute.value = null;
};

const editValueItem = (val) => {
  // Can open the form over the manage modal
  // Close the manage layer first so it cannot intercept the edit form controls.
  showManageModal.value = false;
  isEditingValue.value = true;
  currentEditValueId.value = val.id;
  valueForm.value = {
    label: val.label,
    color: val.color || (hasColorType(selectedAttribute.value) ? '#000000' : ''),
    is_active: val.is_active
  };
  showValueModal.value = true;
};

const deleteAttributeItem = async (attr) => {
  if (!confirm(`هل أنت متأكد من حذف الخاصية "${attr.name}"؟`)) return;

  try {
    await productAttributeService.delete(attr.id);
    await fetchAttributes();
    const stillExists = attributes.value.some((item) => Number(item.id) === Number(attr.id));
    if (stillExists) {
      triggerAlert('تعذر حذف الخاصية. تم تسجيل تذكرة لمراجعة خطأ Backend.', 'error');
      return;
    }
    triggerAlert('تم حذف الخاصية بنجاح');
  } catch (error) {
    await fetchAttributes();
    triggerAlert(error.response?.data?.message || 'تعذر حذف الخاصية. تم تسجيل تذكرة لمراجعة خطأ Backend.', 'error');
  }
};

const deleteValueItem = async (val) => {
  if (confirm(`هل أنت متأكد من إزالة القيمة "${val.label}"؟`)) {
    try {
      await productAttributeService.deleteValue(selectedAttribute.value.id, val.id);
      const attributeId = selectedAttribute.value.id;
      selectedAttribute.value.values = selectedAttribute.value.values.filter((item) => String(item.id) !== String(val.id));
      await fetchAttributes();
      const refreshed = attributes.value.find((attribute) => Number(attribute.id) === Number(attributeId));
      const stillExists = refreshed?.values?.some((item) => String(item.id) === String(val.id));
      if (stillExists) {
        triggerAlert('تعذر حذف قيمة الخاصية. تم تسجيل تذكرة لمراجعة خطأ Backend.', 'error');
        return;
      }
      triggerAlert('تم إزالة القيمة بنجاح');
    } catch (error) {
      const msg = error.response?.data?.message || 'تعذر إزالة القيمة';
      await fetchAttributes();
      triggerAlert(msg, 'error');
    }
  }
};

</script>

<style scoped>
.attributes-page {
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
.header-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  max-width: max-content;
  white-space: nowrap;
  padding: 6px 12px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 6px;
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.2;
}
.header-add-btn:hover {
  background: #262626;
  border-color: #262626;
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
  padding: 1.1rem;
  text-align: right; /* RTL */
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
.data-table th {
  background: #f9fafb;
  font-size: 0.78rem;
  font-weight: 700;
  color: #6b7280;
  white-space: nowrap;
}
.data-table td {
  font-size: 0.85rem;
  color: #374151;
}
.data-table tr:last-child td { border-bottom: none; }
.data-row:hover td { background: #fafafa; }
.state-row td { text-align: center; color: #6b7280; padding: 2rem; }

/* Columns alignment */
.col-name { text-align: right; width: 35%; }
.col-values { text-align: right; width: 40%; }
.col-status { text-align: center; width: 10%; }
.col-actions { text-align: left; width: 15%; padding-left: 1.5rem !important; }

.attr-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.attr-text {
  display: flex;
  flex-direction: column;
}
.attr-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.2rem;
}
.attr-desc {
  font-size: 0.75rem;
  color: #9ca3af;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}
.status-badge.active { background: #ecfdf5; color: #059669; }
.status-badge.inactive { background: #f3f4f6; color: #4b5563; }

.values-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}
.value-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
}
.inactive-chip {
  opacity: 0.6;
  text-decoration: line-through;
}
.color-dot {
  width: 10px; height: 10px; border-radius: 50%; display: inline-block;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.05) inset;
}
.more-chip {
  background: #f3f4f6;
  color: #374151;
  border-color: #e5e7eb;
}
.no-values-text {
  font-size: 0.75rem;
  color: #9ca3af;
}

.actions-group {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* items on left for RTL table */
  gap: 0.5rem;
}
.action-btn {
  width: 28px; height: 28px;
  border-radius: 6px; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #9ca3af; transition: all 0.2s;
}
.action-btn:hover { background: #f3f4f6; color: #111827; }
.add-btn { color: #000000; }
.add-btn:hover { background: #f3f4f6; color: #000000; }
.view-btn { color: #f59e0b; }
.view-btn:hover { background: #fef3c7; color: #d97706; }
.delete-btn { color: #dc2626; }
.delete-btn:hover { background: #fef2f2; color: #b91c1c; }

/* Modals */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  padding: 1rem;
}
.modal-content {
  background: #fff; border-radius: 12px; width: 100%; max-width: 480px;
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

.form-group { margin-bottom: 1.25rem; }
.form-label { display: block; font-size: 0.8rem; font-weight: 700; color: #374151; margin-bottom: 0.4rem; text-align: right; }
.req { color: #dc2626; }
.form-control {
  width: 100%; padding: 0.65rem 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px;
  font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #1f2937; outline: none; transition: border-color 0.2s; text-align: right;
}
.form-control:focus { border-color: #000000; box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06); }

.select-wrapper { position: relative; display: flex; align-items: center; }
.select-wrapper .form-control { appearance: none; padding-left: 2rem; cursor: pointer; }
.select-wrapper .select-icon { position: absolute; left: 0.8rem; color: #9ca3af; pointer-events: none; }

.readonly-input {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 0.8rem;
  background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; color: #6b7280; font-size: 0.85rem; font-weight: 600;
}

.color-picker-wrapper {
  display: flex; gap: 0.5rem; align-items: center;
}
.color-text-input { flex: 1; direction: ltr; text-align: left; }
.color-picker-input {
  width: 42px; height: 38px; padding: 0; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer;
}
.help-text { display: block; margin-top: 0.3rem; font-size: 0.7rem; color: #9ca3af; }

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
}
.btn-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
  padding: 6px 14px;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
  min-width: 90px;
}
.btn-submit:hover:not(:disabled) {
  background: #262626;
  border-color: #262626;
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Manage Modal List */
.manage-list {
  display: flex; flex-direction: column; gap: 0.5rem; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.5rem; background: #fafafa;
  max-height: 300px; overflow-y: auto; margin-bottom: 1.5rem;
}
.manage-list-empty { padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.85rem; }
.manage-item {
  display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 0.6rem 0.8rem;
  border: 1px solid #f3f4f6; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
.manage-item-info { display: flex; align-items: center; gap: 0.6rem; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.active-dot { background: #10b981; }
.inactive-dot { background: #d1d5db; }
.manage-item-label { font-size: 0.85rem; font-weight: 600; color: #374151; }
.manage-item-color { width: 14px; height: 14px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); }
.manage-item-actions { display: flex; align-items: center; gap: 0.3rem; }
.manage-btn {
  background: none; border: none; color: #9ca3af; cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.edit-val-btn:hover { background: #eff6ff; color: #2563eb; }
.delete-val-btn:hover { background: #fef2f2; color: #dc2626; }

.manage-footer {
  display: flex;
  justify-content: flex-end;
}
.btn-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 6px 14px;
  border-radius: 6px;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
  min-width: 70px;
}
.btn-cancel:hover {
  background: #e5e7eb;
  color: #111827;
}

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
