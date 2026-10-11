<template>
  <div class="cities-view">
    <div class="page-header">
      <h1 class="page-title">إدارة المدن</h1>
      <button class="btn-primary" @click="showModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        إضافة مدينة
      </button>
    </div>

    <div class="filters">
      <select v-model="selectedCountry" @change="fetchCities">
        <option value="">كل الدول</option>
        <option v-for="country in countries" :key="country.id" :value="country.id">
          {{ country.name }}
        </option>
      </select>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الدولة</th>
            <th>سعر الشحن</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="city in cities" :key="city.id">
            <td>{{ city.name }}</td>
            <td>{{ city.country?.name }}</td>
            <td>{{ city.shipping_rate?.shipping_cost ? city.shipping_rate.shipping_cost + ' ' + currency : '-' }}</td>
            <td>
              <span class="status-badge" :class="city.is_active ? 'active' : 'inactive'">
                {{ city.is_active ? 'نشط' : 'غير نشط' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon" @click="editCity(city)" title="تعديل">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon delete" @click="deleteCity(city.id)" title="حذف">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h2>{{ isEdit ? 'تعديل مدينة' : 'إضافة مدينة' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>الدولة *</label>
            <select v-model="form.country_id" required>
              <option value="">اختر الدولة</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ country.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>الاسم *</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>الاسم بالإنجليزي</label>
            <input v-model="form.name_en" type="text" />
          </div>
          <div class="form-group">
            <label>الترتيب</label>
            <input v-model="form.sort_order" type="number" />
          </div>
          <div class="form-group checkbox">
            <label>
              <input v-model="form.is_active" type="checkbox" />
              نشط
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">إلغاء</button>
            <button type="submit" class="btn-primary">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../config/axios';

const cities = ref([]);
const countries = ref([]);
const selectedCountry = ref('');
const showModal = ref(false);
const isEdit = ref(false);
const editingId = ref(null);
const currency = ref('JOD');
const form = ref({
  country_id: '',
  name: '',
  name_en: '',
  is_active: true,
  sort_order: 0,
});

const fetchCountries = async () => {
  try {
    const res = await api.get('/dashboard/countries');
    countries.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch countries', error);
  }
};

const fetchCities = async () => {
  try {
    const params = selectedCountry.value ? { country_id: selectedCountry.value } : {};
    const res = await api.get('/dashboard/cities', { params });
    cities.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch cities', error);
  }
};

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await api.put(`/dashboard/cities/${editingId.value}`, form.value);
    } else {
      await api.post('/dashboard/cities', form.value);
    }
    showModal.value = false;
    resetForm();
    fetchCities();
  } catch (error) {
    console.error('Failed to save city', error);
  }
};

const editCity = (city) => {
  isEdit.value = true;
  editingId.value = city.id;
  form.value = { ...city };
  showModal.value = true;
};

const deleteCity = async (id) => {
  if (!confirm('هل أنت متأكد من حذف هذه المدينة؟')) return;
  try {
    await api.delete(`/dashboard/cities/${id}`);
    fetchCities();
  } catch (error) {
    console.error('Failed to delete city', error);
  }
};

const resetForm = () => {
  form.value = {
    country_id: '',
    name: '',
    name_en: '',
    is_active: true,
    sort_order: 0,
  };
  isEdit.value = false;
  editingId.value = null;
};

onMounted(() => {
  fetchCountries();
  fetchCities();
});
</script>

<style scoped>
.cities-view {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #111827;
}

.btn-primary {
  background: #873260;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.filters {
  margin-bottom: 1.5rem;
}

.filters select {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-width: 200px;
  font-size: 1rem;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 16px;
  text-align: right;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background: #f9fafb;
  font-weight: 700;
  color: #374151;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #059669;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
}

.btn-icon.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

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
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 800;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group.checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-group.checkbox input {
  width: auto;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}
</style>
