<template>
  <div class="coming-soon-container">
    <div class="glass-card fade-in">
      <div class="icon-orbit">
        <div class="main-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <path d="M7 15h.01" />
            <path d="M11 15h2" />
          </svg>
        </div>
        <div class="orbit-item visa">V</div>
        <div class="orbit-item master">M</div>
        <div class="orbit-item paypal">P</div>
      </div>

      <h1 class="title">بوابات الدفع</h1>
      <p class="subtitle">نعمل حالياً على تجهيز أنظمة دفع آمنة ومتطورة لتجربة تسوق متكاملة</p>
      
      <div class="status-badge">
        <span class="pulse-dot"></span>
        قيد التطوير
      </div>

      <div class="features-preview">
        <div class="feature-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          بطاقات الائتمان (Visa / MasterCard)
        </div>
        <div class="feature-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          الدفع عند الاستلام (Cash on Delivery)
        </div>
        <div class="feature-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          محافظ إلكترونية محليه
        </div>
      </div>

      <div class="footer-note">
        ستكون الخدمة متاحة قريباً جداً...
      </div>
    </div>
  </div>
</template>

<style scoped>
.coming-soon-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  direction: rtl;
  padding: 2rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 34, 82, 0.1);
  border-radius: 30px;
  padding: 4rem 3rem;
  text-align: center;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Icon Orbit Animation */
.icon-orbit {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-icon {
  background: #873260;
  color: white;
  width: 100px;
  height: 100px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(139, 34, 82, 0.3);
  z-index: 2;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.orbit-item {
  position: absolute;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.75rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  color: #873260;
  border: 1px solid #f3f4f6;
}

.visa { top: -10px; right: -10px; animation: orbit 4s linear infinite; }
.master { bottom: -10px; left: -10px; animation: orbit 4s linear infinite reverse; }
.paypal { top: 50%; left: -20px; animation: float 2.5s ease-in-out infinite; }

@keyframes orbit {
  from { transform: rotate(0deg) translateX(10px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
}

.title {
  font-size: 2.2rem;
  font-weight: 900;
  color: #111827;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: #fdf2f8;
  color: #db2777;
  padding: 0.5rem 1.25rem;
  border-radius: 100px;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 3rem;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #db2777;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(219, 39, 119, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(219, 39, 119, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(219, 39, 119, 0); }
}

.features-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: right;
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 20px;
  margin-bottom: 2.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #4b5563;
  font-weight: 600;
  font-size: 0.95rem;
}

.feature-item svg {
  color: #10b981;
}

.footer-note {
  font-size: 1rem;
  color: #9ca3af;
  font-style: italic;
  letter-spacing: 0.5px;
}
</style>
