<template>
  <div class="login-page">
    <!-- القسم الأيسر: نموذج تسجيل الدخول -->
    <div class="login-left">
      <div class="login-form-wrapper">
        <!-- العنوان -->
        <div class="login-header">
          <h2 class="login-title">تسجيل الدخول</h2>
          <p class="login-subtitle">لوحة التحكم الإدارية — ماستر غاز</p>
        </div>

        <!-- نموذج تسجيل الدخول -->
        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <!-- البريد الإلكتروني -->
          <div class="form-group">
            <label for="email" class="form-label">البريد الإلكتروني</label>
            <div class="input-wrapper">
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="admin@mastergas.sa"
                class="form-input"
                :class="{ 'input-error': errors.email }"
                autocomplete="email"
              />
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
            </div>
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
          </div>

          <!-- كلمة المرور -->
          <div class="form-group">
            <label for="password" class="form-label">كلمة المرور</label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="form-input"
                :class="{ 'input-error': errors.password }"
                autocomplete="current-password"
              />
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                tabindex="-1"
                aria-label="إظهار أو إخفاء كلمة المرور"
              >
                <svg v-if="!showPassword" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
          </div>

          <!-- تذكرني ونسيت كلمة المرور -->
          <div class="form-row">
            <label class="remember-label">
              <input
                type="checkbox"
                v-model="form.remember"
                class="remember-checkbox"
              />
              <span class="checkmark"></span>
              <span>تذكرني</span>
            </label>
            <a href="#" class="forgot-link">نسيت كلمة المرور؟</a>
          </div>

          <!-- رسالة الخطأ العامة -->
          <div v-if="error" class="error-alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
          </div>

          <!-- زر تسجيل الدخول -->
          <button
            type="submit"
            class="login-btn"
            :disabled="loading"
          >
            <span v-if="!loading" class="btn-content">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>تسجيل الدخول إلى لوحة التحكم</span>
            </span>
            <span v-else class="btn-loading">
              <span class="spinner"></span>
              جاري تسجيل الدخول...
            </span>
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <p>جميع الحقوق محفوظة © ماستر غاز Mastergas {{ currentYear }}</p>
      </div>
    </div>

    <!-- القسم الأيمن: لوحة العلامة التجارية -->
    <div class="login-right">
      <!-- اللوجو والشارة -->
      <div class="brand-logo">
        <img src="/brand/mastergas-logo-white.png" alt="ماستر غاز" class="brand-logo-img" />
        <span class="brand-badge">
          <svg class="admin-badge-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          لوحة الإدارة
        </span>
      </div>

      <!-- المحتوى الرئيسي -->
      <div class="brand-content">
        <span class="brand-pill">نظام إدارة الأجهزة الإيطالية الفاخرة</span>
        <h1 class="brand-title">
          أجهزة مطبخ بمعايير<br />إيطالية فاخرة
        </h1>
        <p class="brand-desc">
          لوحة التحكم الإدارية المركزية لمتابعة المنتجات، إدارة المخزون، تتبع طلبات العملاء، وضبط أسعار الشحن ومؤشرات الأداء.
        </p>
      </div>

      <!-- زخرفة دوائر في الخلفية -->
      <div class="brand-decoration">
        <div class="deco-circle deco-circle-1"></div>
        <div class="deco-circle deco-circle-2"></div>
        <div class="deco-circle deco-circle-3"></div>
      </div>

      <!-- Footer للقسم الأيمن -->
      <div class="brand-footer">
        <p>جميع الحقوق محفوظة © ماستر غاز Mastergas {{ currentYear }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../config/axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const savedEmail = localStorage.getItem('remembered_email');

const form = ref({
  email: savedEmail || '',
  password: '',
  remember: Boolean(savedEmail),
});

const loading = ref(false);
const error = ref('');
const errors = ref({});
const showPassword = ref(false);

const currentYear = computed(() => new Date().getFullYear());

onMounted(() => {
  // الحفاظ الدائم على أيقونة ماستر غاز وعنوان التاب ومنع استرجاع أيقونات قديمة
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = '/brand/mastergas-icon.png';
  document.title = 'ماستر غاز | تسجيل الدخول للوحة التحكم';
});

const validate = () => {
  errors.value = {};

  if (!form.value.email) {
    errors.value.email = 'البريد الإلكتروني مطلوب';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'البريد الإلكتروني غير صحيح';
  }

  if (!form.value.password) {
    errors.value.password = 'كلمة المرور مطلوبة';
  } else if (form.value.password.length < 6) {
    errors.value.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  }

  return Object.keys(errors.value).length === 0;
};

const handleLogin = async () => {
  error.value = '';

  if (!validate()) return;

  loading.value = true;

  try {
    const response = await api.post('/v1/admin/login', {
      email: form.value.email,
      password: form.value.password,
    });

    // حفظ الـ token والمعلومات
    localStorage.setItem('token', response.data.token);
    const user = response.data.user || response.data.admin || response.data.customer || {};
    localStorage.setItem('admin', JSON.stringify(user));

    if (form.value.remember) {
      localStorage.setItem('remembered_email', form.value.email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    // الانتقال للوحة التحكم
    router.push('/admin/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ===== تخطيط الصفحة الرئيسي ===== */
.login-page {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  direction: ltr; /* LTR على الحاوية لترتيب الأعمدة: نموذج يسار، براند يمين */
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  background: var(--bg-main, #ffffff);
}

/* ===== القسم الأيسر (النموذج) ===== */
.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--bg-main, #ffffff);
  padding: 3rem;
  position: relative;
  min-height: 100vh;
  direction: rtl; /* RTL داخل النموذج */
}

.login-form-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 380px;
  margin: auto;
  width: 100%;
}

/* ===== رأس صفحة تسجيل الدخول ===== */
.login-header {
  text-align: right;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.4rem;
  letter-spacing: -0.4px;
}

.login-subtitle {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
}

/* ===== النموذج ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.72rem 2.5rem 0.72rem 2.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  color: #0f172a;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  direction: ltr;
  text-align: right;
  outline: none;
}

.form-input::placeholder {
  color: #94a3b8;
  direction: ltr;
  text-align: right;
}

.form-input:focus {
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.1);
}

.form-input.input-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-icon {
  position: absolute;
  right: 0.85rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.toggle-password {
  position: absolute;
  left: 0.85rem;
  color: #94a3b8;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #111827;
}

.error-msg {
  font-size: 0.72rem;
  color: #ef4444;
  text-align: right;
}

/* ===== صف تذكرني + نسيت كلمة المرور ===== */
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.1rem;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: #475569;
  user-select: none;
}

.remember-checkbox {
  width: 15px;
  height: 15px;
  accent-color: #111827;
  cursor: pointer;
}

.forgot-link {
  font-size: 0.8rem;
  color: #475569;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #0f172a;
  text-decoration: underline;
}

/* ===== رسالة الخطأ العامة ===== */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

/* ===== زر تسجيل الدخول (لون ماستر غاز الفاخر) ===== */
.login-btn {
  width: 100%;
  padding: 0.82rem 1rem;
  background: #111827;
  color: #ffffff;
  border: 1px solid #1f2937;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 0.35rem;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}

.login-btn:hover:not(:disabled) {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.25);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-icon {
  flex-shrink: 0;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== فوتر القسم الأيسر ===== */
.login-footer {
  text-align: center;
  font-size: 0.75rem;
  color: #94a3b8;
  padding-top: 1rem;
}

/* ===== القسم الأيمن (البراندينج بلون وهوية ماستر غاز) ===== */
.login-right {
  width: 44%;
  background: linear-gradient(145deg, #090d16 0%, #111827 50%, #1e293b 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.75rem 3rem;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  direction: rtl; /* RTL داخل القسم الملوّن */
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: flex-start;
  position: relative;
  z-index: 2;
}

.brand-logo-img {
  height: 34px;
  width: auto;
  object-fit: contain;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f1f5f9;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.32rem 0.85rem;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.admin-badge-icon {
  color: #38bdf8;
  flex-shrink: 0;
}

/* المحتوى الرئيسي للبراند */
.brand-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: right;
  position: relative;
  z-index: 2;
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.25rem 0.8rem;
  border-radius: 9999px;
  margin-bottom: 1.25rem;
  letter-spacing: 0.2px;
}

.brand-title {
  font-size: 2.35rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.35;
  margin-bottom: 1.15rem;
  letter-spacing: -0.6px;
  text-align: right;
}

.brand-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.8;
  max-width: 360px;
  text-align: right;
}

/* زخارف الدوائر */
.brand-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
}

.deco-circle-1 {
  width: 420px;
  height: 420px;
  top: -100px;
  left: -140px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, rgba(255, 255, 255, 0) 70%);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.deco-circle-2 {
  width: 260px;
  height: 260px;
  bottom: 60px;
  right: -80px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 70%);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.deco-circle-3 {
  width: 160px;
  height: 160px;
  top: 42%;
  left: 15%;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

/* فوتر القسم الأيمن */
.brand-footer {
  text-align: center;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
  position: relative;
  z-index: 2;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .login-page {
    flex-direction: column;
  }

  .login-right {
    display: none;
  }

  .login-left {
    padding: 2.5rem 1.5rem;
    min-height: 100vh;
  }

  .login-form-wrapper {
    margin: auto;
  }
}
</style>
