<template>
  <div class="discounts-page">
    <div class="page-header">
      <div class="header-titles">
        <div class="title-with-icon">
          <h2 class="page-title">{{ page.title }}</h2>
          <div class="tag-icon-wrapper" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
        </div>
        <p class="page-subtitle">{{ page.subtitle }}</p>
      </div>
      <button class="add-btn" type="button" disabled :title="page.pendingMessage">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {{ page.createLabel }}
      </button>
    </div>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon-wrapper" :class="stat.color">
          <svg v-if="stat.icon === 'tag'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <svg v-else-if="stat.icon === 'active'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <svg v-else-if="stat.icon === 'date'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20V14" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ stat.label }}</span>
          <h3 class="stat-value">0</h3>
        </div>
      </div>
    </div>

    <div class="filters-row">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="search-icon">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input class="search-input" type="text" placeholder="البحث في العروض والخصومات..." disabled />
      </div>
      <div class="filter-select">
        <select class="form-select" disabled><option>كل الأنواع</option></select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="select-icon"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      <div class="filter-select">
        <select class="form-select" disabled><option>كل الحالات</option></select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="select-icon"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      <div class="date-comp"><input class="date-input" type="date" disabled title="من تاريخ" /></div>
      <div class="date-comp"><input class="date-input" type="date" disabled title="إلى تاريخ" /></div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="text-right">الاسم</th>
            <th>النوع</th>
            <th>القيمة</th>
            <th>تاريخ البداية</th>
            <th>تاريخ النهاية</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr class="state-row">
            <td colspan="7">
              <div class="empty-state">
                <div class="empty-state-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <strong>{{ page.emptyLabel }}</strong>
                <span>{{ page.emptyDescription }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const page = {
  title: 'العروض والخصومات',
  subtitle: 'إنشاء وإدارة العروض والخصومات',
  createLabel: 'إنشاء عرض جديد',
  emptyLabel: 'لا توجد عروض أو خصومات',
  emptyDescription: 'ستظهر العروض والخصومات هنا عند توفر بياناتها في النظام.',
  pendingMessage: 'سيتم تفعيل العروض والخصومات بعد توفير API الخاص بها.',
};

const stats = [
  { label: 'إجمالي العروض والخصومات', color: 'pink', icon: 'tag' },
  { label: 'العروض النشطة', color: 'green', icon: 'active' },
  { label: 'المنتهية', color: 'gray', icon: 'date' },
  { label: 'إجمالي الاستخدام', color: 'blue', icon: 'usage' },
];
</script>

<style scoped>
.discounts-page { display: flex; flex-direction: column; gap: 1.5rem; direction: rtl; font-family: 'IBM Plex Sans Arabic', sans-serif; padding-bottom: 3rem; }
.page-header { display: flex; align-items: center; justify-content: space-between; }
.title-with-icon { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.2rem; }
.page-title { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 0; }
.tag-icon-wrapper { background: #f3f4f6; color: #000; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.page-subtitle { font-size: 0.85rem; color: #6b7280; margin: 0; }
.add-btn { display: flex; align-items: center; gap: 0.5rem; background: #000; color: #fff; border: none; padding: 0.65rem 1.1rem; border-radius: 8px; font-family: inherit; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
.add-btn:hover { background: #262626; }
.add-btn:disabled { cursor: not-allowed; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.stat-icon-wrapper { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.stat-icon-wrapper.pink { background: #f3f4f6; color: #000; }
.stat-icon-wrapper.green { background: #ecfdf5; color: #10b981; }
.stat-icon-wrapper.gray { background: #f9fafb; color: #6b7280; }
.stat-icon-wrapper.blue { background: #eff6ff; color: #2563eb; }
.stat-info { display: flex; flex-direction: column; gap: 0.2rem; }
.stat-label { font-size: 0.75rem; font-weight: 600; color: #6b7280; }
.stat-value { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 0; }
.filters-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.search-box { flex: 1; min-width: 250px; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; right: 1rem; color: #9ca3af; }
.search-input { width: 100%; padding: 0.75rem 2.8rem 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: inherit; font-size: 0.85rem; outline: none; background: #fff; }
.filter-select { position: relative; display: flex; align-items: center; min-width: 150px; }
.form-select { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.2rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: inherit; font-size: 0.85rem; color: #374151; appearance: none; outline: none; }
.filter-select .select-icon { position: absolute; left: 0.75rem; color: #9ca3af; pointer-events: none; }
.date-input { border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.65rem 0.75rem; font-family: inherit; font-size: 0.85rem; color: #374151; outline: none; }
.search-input:disabled, .form-select:disabled, .date-input:disabled { color: #9ca3af; cursor: not-allowed; background: #fff; opacity: 1; }
.table-container { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow-x: auto; margin-top: 0.5rem; }
.data-table { width: 100%; min-width: 760px; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1.1rem 0.75rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; text-align: center; }
.data-table th { background: #f9fafb; font-size: 0.75rem; font-weight: 700; color: #6b7280; white-space: nowrap; }
.text-right { text-align: right !important; }
.state-row td { height: 260px; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; color: #6b7280; }
.empty-state-icon { width: 62px; height: 62px; display: grid; place-items: center; color: #9ca3af; background: #f3f4f6; border-radius: 16px; margin-bottom: 0.35rem; }
.empty-state strong { color: #374151; font-size: 1rem; }
.empty-state span { color: #9ca3af; font-size: 0.82rem; }
@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) {
  .page-header { align-items: flex-start; gap: 1rem; flex-direction: column; }
  .add-btn { width: 100%; justify-content: center; }
  .stats-grid { grid-template-columns: 1fr; }
  .search-box { min-width: 100%; }
  .filter-select, .date-comp { flex: 1; min-width: 0; }
}
</style>
