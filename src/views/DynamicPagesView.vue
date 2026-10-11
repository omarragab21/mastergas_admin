<template>
  <div class="disabled-view">
    <div class="disabled-card">
      <div class="disabled-icon-wrap">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#873260" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 class="disabled-title">الصفحات الديناميكية</h2>
      <p class="disabled-msg">هذه الميزة معطّلة حالياً</p>
      <span class="disabled-badge">غير متاح</span>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.disabled-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}
.disabled-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 3rem 4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 420px;
  width: 100%;
}
.disabled-icon-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #fdf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.disabled-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}
.disabled-msg {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}
.disabled-badge {
  display: inline-block;
  background: #fee2e2;
  color: #991b1b;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  margin-top: 0.25rem;
}
</style>
