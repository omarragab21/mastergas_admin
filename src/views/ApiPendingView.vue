<template>
  <main class="api-pending-page">
    <section class="api-pending-card" aria-labelledby="api-pending-title">
      <div class="api-pending-icon" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      </div>
      <span class="api-pending-eyebrow">قسم جديد في لوحة التحكم</span>
      <h1 id="api-pending-title">{{ page.title }}</h1>
      <p class="api-pending-description">{{ page.description }}</p>
      <div class="api-pending-status">
        <span class="status-dot" aria-hidden="true"></span>
        الـ API غير متاح حاليًا
      </div>
      <p class="api-pending-note">
        الشاشة مضافة في الـ Admin، وسيتم تفعيل الإضافة والتعديل والحذف فور توفير API الخاص بهذا القسم.
      </p>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const page = computed(() => route.name === 'Offers'
  ? {
      title: 'العروض',
      description: 'إدارة العروض والباقات الترويجية ستتوفر هنا بعد تجهيز API الخاص بالعروض.',
    }
  : {
      title: 'الخصومات',
      description: 'إدارة الخصومات العامة ستتوفر هنا بعد تجهيز API الخاص بالخصومات.',
    });
</script>

<style scoped>
.api-pending-page {
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: 32px;
  background: #f8fafc;
}

.api-pending-card {
  width: min(640px, 100%);
  padding: 48px 40px;
  text-align: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.api-pending-icon {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 20px;
}

.api-pending-eyebrow {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
}

h1 {
  margin: 10px 0 12px;
  color: #111827;
  font-size: clamp(1.7rem, 4vw, 2.35rem);
}

.api-pending-description,
.api-pending-note {
  margin: 0 auto;
  max-width: 520px;
  color: #64748b;
  line-height: 1.8;
}

.api-pending-status {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin: 28px 0 14px;
  padding: 10px 16px;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 999px;
  font-weight: 800;
}

.status-dot {
  width: 9px;
  height: 9px;
  display: inline-block;
  background: #f59e0b;
  border-radius: 50%;
}

.api-pending-note {
  color: #94a3b8;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .api-pending-page { padding: 20px; }
  .api-pending-card { padding: 36px 22px; border-radius: 18px; }
}
</style>
