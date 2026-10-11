<template>
  <div class="countries-view">
    <div class="page-header">
      <h1 class="page-title">إدارة الدول</h1>
      <div class="header-actions">
        <button class="btn-seed" @click="seedJordan" :disabled="seedingJordan">
          <svg v-if="!seedingJordan" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          {{ seedingJordan ? 'جاري التحميل...' : 'تحميل الأردن ومحافظاته 🇯🇴' }}
        </button>
        <button class="btn-primary" @click="showModal = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          إضافة دولة
        </button>
      </div>
    </div>

    <!-- Seed Result Toast -->
    <div v-if="seedMessage" :class="['seed-toast', seedMessageType]">
      {{ seedMessage }}
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>العلم</th>
            <th>الاسم</th>
            <th>الكود</th>
            <th>المدن</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="country in countries" :key="country.id">
            <td>{{ country.flag || '-' }}</td>
            <td>{{ country.name }}</td>
            <td>{{ country.code }}</td>
            <td>{{ country.cities?.length || 0 }}</td>
            <td>
              <span class="status-badge" :class="country.is_active ? 'active' : 'inactive'">
                {{ country.is_active ? 'نشط' : 'غير نشط' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon" @click="editCountry(country)" title="تعديل">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon delete" @click="deleteCountry(country.id)" title="حذف">
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
        <h2>{{ isEdit ? 'تعديل دولة' : 'إضافة دولة' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>الاسم *</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>الاسم بالإنجليزي</label>
            <input v-model="form.name_en" type="text" />
          </div>
          <div class="form-group">
            <label>الكود *</label>
            <input v-model="form.code" type="text" required maxlength="5" />
          </div>
          <div class="form-group">
            <label>العلم (Emoji)</label>
            <input v-model="form.flag" type="text" />
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

const countries = ref([]);
const showModal = ref(false);
const seedingJordan = ref(false);
const seedMessage = ref('');
const seedMessageType = ref('success');

const JORDAN_GOVERNORATES = [
  { name: 'عمّان',        name_en: 'Amman',   sort_order: 1 },
  { name: 'إربد',         name_en: 'Irbid',   sort_order: 2 },
  { name: 'الزرقاء',      name_en: 'Zarqa',   sort_order: 3 },
  { name: 'البلقاء',      name_en: 'Balqa',   sort_order: 4 },
  { name: 'الكرك',        name_en: 'Karak',   sort_order: 5 },
  { name: 'مأدبا',        name_en: 'Madaba',  sort_order: 6 },
  { name: 'الطفيلة',     name_en: 'Tafileh', sort_order: 7 },
  { name: 'معان',         name_en: "Ma'an",  sort_order: 8 },
  { name: 'العقبة',       name_en: 'Aqaba',   sort_order: 9 },
  { name: 'المفرق',       name_en: 'Mafraq',  sort_order: 10 },
  { name: 'جرش',          name_en: 'Jerash',  sort_order: 11 },
  { name: 'عجلون',        name_en: 'Ajloun',  sort_order: 12 },
];

const showSeedToast = (msg, type = 'success') => {
  seedMessage.value = msg;
  seedMessageType.value = type;
  setTimeout(() => { seedMessage.value = ''; }, 4000);
};

const seedJordan = async () => {
  if (seedingJordan.value) return;
  seedingJordan.value = true;
  try {
    // 1. Find or create Jordan
    let jordan = countries.value.find(c =>
      c.code === 'JO' || c.name === 'الأردن' || c.name_en === 'Jordan'
    );
    if (!jordan) {
      const res = await api.post('/dashboard/countries', {
        name: 'الأردن', name_en: 'Jordan', code: 'JO',
        flag: '🇯🇴', is_active: true, sort_order: 1,
      });
      jordan = res.data.data || res.data;
    }
    const countryId = jordan.id;

    // 2. Fetch existing cities for Jordan to avoid duplicates
    const citiesRes = await api.get('/dashboard/cities', { params: { country_id: countryId } });
    const existing = (citiesRes.data.data || []).map(c => c.name);

    // 3. Create missing governorates
    let created = 0;
    for (const gov of JORDAN_GOVERNORATES) {
      if (existing.includes(gov.name)) continue;
      await api.post('/dashboard/cities', {
        country_id: countryId,
        name: gov.name,
        name_en: gov.name_en,
        is_active: true,
        sort_order: gov.sort_order,
      });
      created++;
    }

    await fetchCountries();
    if (created > 0) {
      showSeedToast(`تم إضافة الأردن و ${created} محافظة بنجاح`);
    } else {
      showSeedToast('الأردن ومحافظاته موجودة مسبقاً', 'info');
    }
  } catch (err) {
    console.error('Seed Jordan failed', err);
    showSeedToast('حدث خطأ أثناء تحميل الأردن', 'error');
  } finally {
    seedingJordan.value = false;
  }
};
const isEdit = ref(false);
const editingId = ref(null);
const form = ref({
  name: '',
  name_en: '',
  code: '',
  flag: '',
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

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await api.put(`/dashboard/countries/${editingId.value}`, form.value);
    } else {
      await api.post('/dashboard/countries', form.value);
    }
    showModal.value = false;
    resetForm();
    fetchCountries();
  } catch (error) {
    console.error('Failed to save country', error);
  }
};

const editCountry = (country) => {
  isEdit.value = true;
  editingId.value = country.id;
  form.value = { ...country };
  showModal.value = true;
};

const deleteCountry = async (id) => {
  if (!confirm('هل أنت متأكد من حذف هذه الدولة؟')) return;
  try {
    await api.delete(`/dashboard/countries/${id}`);
    fetchCountries();
  } catch (error) {
    console.error('Failed to delete country', error);
  }
};

const resetForm = () => {
  form.value = {
    name: '',
    name_en: '',
    code: '',
    flag: '',
    is_active: true,
    sort_order: 0,
  };
  isEdit.value = false;
  editingId.value = null;
};

onMounted(fetchCountries);
</script>

<style scoped>
.countries-view {
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

.header-actions { display: flex; gap: 10px; align-items: center; }

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

.btn-seed {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  transition: 0.2s;
}
.btn-seed:hover { background: #dcfce7; }
.btn-seed:disabled { opacity: 0.6; cursor: not-allowed; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.seed-toast {
  margin-bottom: 1rem;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  animation: fadeIn 0.3s ease;
}
.seed-toast.success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.seed-toast.error   { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.seed-toast.info    { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
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
.form-group input[type="number"] {
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
