<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../config/axios';

// State
const activeTab = ref('general'); // 'general' or 'social'
const loading = ref(false);
const isSaving = ref(false);
const settings = ref({
    site_name: 'Tijara',
    free_delivery_threshold: '10',
    shipping_cost: '15',
    tax_rate: '0',
    delivery_range_km: '10',
    enable_city_shipping: '0',
    use_city_specific_rates: '0',
    default_city_shipping_rate: '0',
    support_phone: '+962712345678',
    support_email: 'info@tijara.com',
    email: 'support@tijaracms.com',
    address_ar: 'عمان، الأردن - شارع الملك عبدالله الثاني',
    address_en: 'Amman, Jordan - King Abdullah II Street',
    working_hours_ar: 'السبت - الخميس: 9:00 صباحاً - 9:00 مساءً',
    working_hours_en: 'Saturday - Thursday: 9:00 AM - 9:00 PM',
    friday_hours_ar: 'الجمعة: 2:00 مساءً - 9:00 مساءً',
    friday_hours_en: 'Friday: 2:00 PM - 9:00 PM',
    currency_ar: 'د.أ',
    currency_en: 'JOD',
    logo: null,
    favicon: null,
    footer_logo: null,
    whatsapp: 'https://wa.me/962...',
    facebook: 'https://facebook.com/...',
    instagram: 'https://instagram.com/...',
    x_twitter: 'https://x.com/...',
    linkedin: 'https://linkedin.com/...',
    youtube: 'https://youtube.com/...',
    snapchat: 'https://snapchat.com/...',
    tiktok: 'https://tiktok.com/...',
    home_category_1: null,
    home_category_2: null,
    home_section_category_title_ar: 'تسوّق حسب الفئة',
    home_section_category_title_en: 'Shop by Category',
    home_section_offers_title_ar: 'العروض المميزة',
    home_section_offers_title_en: 'Featured Offers',
    about_title_ar: '',
    about_title_en: '',
    about_content_ar: '',
    about_content_en: ''
});

const categories = ref([]);
const logoPreview = ref(null);

const isCityShippingEnabled = computed(() =>
    settings.value.enable_city_shipping === '1' ||
    settings.value.enable_city_shipping === true ||
    settings.value.enable_city_shipping === 1
);
const isCitySpecificRates = computed(() =>
    settings.value.use_city_specific_rates === '1' ||
    settings.value.use_city_specific_rates === true ||
    settings.value.use_city_specific_rates === 1
);
const faviconPreview = ref(null);
const footerLogoPreview = ref(null);

// Fetch Data
const fetchSettings = async () => {
    loading.value = true;
    try {
        const response = await api.get('/dashboard/settings');
        const isIrisAsset = (val) => {
            if (!val) return false;
            const str = String(val).toLowerCase();
            return str.includes('iris') || str.includes('t3jcwn2n2rvkxvcva') || str.includes('dobvpg934hatbpm5') || str.includes('yugdc4mk4vmsf6el');
        };
        data.forEach(s => {
            if (settings.value.hasOwnProperty(s.key)) {
                // Sanitize empty arrays stored as string '[]' or actual empty arrays
                if (s.value === '[]' || (Array.isArray(s.value) && s.value.length === 0)) {
                    settings.value[s.key] = null;
                } else if (isIrisAsset(s.value)) {
                    if (s.key === 'logo') settings.value[s.key] = '/brand/mastergas-logo.png';
                    else if (s.key === 'footer_logo') settings.value[s.key] = '/brand/mastergas-logo-white.png';
                    else if (s.key === 'favicon') settings.value[s.key] = '/brand/mastergas-icon.png';
                    else if (s.key === 'site_name') settings.value[s.key] = 'ماسترجاز | Mastergas';
                    else settings.value[s.key] = null;
                } else {
                    settings.value[s.key] = s.value;
                }
            }
        });
    } catch (error) {
        triggerAlert('فشل تحميل الإعدادات', 'error');
    } finally {
        loading.value = false;
    }
};

const fetchAllCategories = async () => {
    try {
        const response = await api.get('/dashboard/categories');
        categories.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch categories');
    }
};

onMounted(() => {
    fetchSettings();
    fetchAllCategories();
});

// Actions
const onLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        settings.value.logo = file;
        logoPreview.value = URL.createObjectURL(file);
    }
};

const onFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        settings.value.favicon = file;
        faviconPreview.value = URL.createObjectURL(file);
    }
};

const onFooterLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        settings.value.footer_logo = file;
        footerLogoPreview.value = URL.createObjectURL(file);
    }
};

const saveSettings = async () => {
    isSaving.value = true;
    try {
        // 1. Update basic settings (everything except potentially new logo file)
        const settingsArray = Object.keys(settings.value)
            .filter(key => key !== 'logo' || !(settings.value[key] instanceof File))
            .map(key => ({
                key: key,
                value: settings.value[key] === '[]' ? null : settings.value[key],
                type: 'string'
            }));

        await api.post('/dashboard/settings/multiple', { settings: settingsArray });

        // 2. Update logo specifically if it's a new file
        if (settings.value.logo instanceof File) {
            const formData = new FormData();
            formData.append('key', 'logo');
            formData.append('value', settings.value.logo);
            formData.append('type', 'image');
            
            await api.post('/dashboard/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }

        // 3. Update favicon specifically if it's a new file
        if (settings.value.favicon instanceof File) {
            const formData = new FormData();
            formData.append('key', 'favicon');
            formData.append('value', settings.value.favicon);
            formData.append('type', 'image');
            
            await api.post('/dashboard/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }

        // 4. Update footer logo specifically if it's a new file
        if (settings.value.footer_logo instanceof File) {
            const formData = new FormData();
            formData.append('key', 'footer_logo');
            formData.append('value', settings.value.footer_logo);
            formData.append('type', 'image');
            
            await api.post('/dashboard/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }

        triggerAlert('تم حفظ الإعدادات بنجاح');
        // Refresh to get full URLs
        fetchSettings();
    } catch (error) {
        triggerAlert('فشل حفظ الإعدادات', 'error');
        console.error('Save failed:', error);
    } finally {
        isSaving.value = false;
    }
};

// Alert State
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('success');

const triggerAlert = (message, type = 'success') => {
    alertMessage.value = message;
    alertType.value = type;
    showAlert.value = true;
    setTimeout(() => showAlert.value = false, 3000);
};
</script>

<template>
  <div class="settings-page p-6">
    <!-- Breadcrumbs -->
    <div class="breadcrumb mb-4">
       <span>لوحة التحكم الرئيسية</span>
       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
       <span class="active">الإعدادات</span>
    </div>

    <!-- Header -->
    <div class="header-section mb-6">
        <div class="page-title-area">
            <div class="title-with-icon">
                <div class="icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
                <div>
                    <h1>الإعدادات</h1>
                    <p>إدارة إعدادات النظام العامة</p>
                </div>
            </div>
        </div>
        <div class="left-actions">
            <button class="save-btn" @click="saveSettings" :disabled="isSaving">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
               {{ isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات' }}
            </button>
        </div>
    </div>

    <!-- Tabs Nav -->
    <div class="tabs-nav mb-6">
        <button :class="['tab-link', { active: activeTab === 'general' }]" @click="activeTab = 'general'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            الإعدادات العامة
        </button>
        <button :class="['tab-link', { active: activeTab === 'social' }]" @click="activeTab = 'social'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            مواقع التواصل
        </button>
        <button :class="['tab-link', { active: activeTab === 'homepage' }]" @click="activeTab = 'homepage'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            الصفحة الرئيسية
        </button>
        <button :class="['tab-link', { active: activeTab === 'about' }]" @click="activeTab = 'about'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            من نحن
        </button>
    </div>

    <!-- Content Sections -->
    <div class="settings-content shadow-sm">
        <!-- General Settings Tab -->
        <div v-if="activeTab === 'general'" class="tab-pane fade-in">
            <div class="form-grid">
                <div class="form-group">
                    <label>اسم الموقع <span class="req">*</span></label>
                    <input type="text" v-model="settings.site_name" placeholder="Tijara" />
                </div>
                <div class="form-group">
                    <label>حد التوصيل المجاني (د.أ) <span class="req">*</span></label>
                    <input type="text" v-model="settings.free_delivery_threshold" placeholder="10" />
                </div>
                <div class="form-group">
                    <label>تكلفة الشحن الثابتة (د.أ) <span class="req">*</span></label>
                    <input type="text" v-model="settings.shipping_cost" placeholder="15" />
                </div>
                <!-- Commented out as requested:
                <div class="form-group full-width">
                    <div class="toggle-row">
                        <div class="toggle-info">
                            <span class="toggle-title">تفعيل نظام الشحن حسب المدن</span>
                            <span class="toggle-hint">تحديد سعر شحن مختلف لكل مدينة / محافظة</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" v-model="settings.enable_city_shipping" true-value="1" false-value="0" />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="form-group full-width" v-if="isCityShippingEnabled">
                    <div class="toggle-row">
                        <div class="toggle-info">
                            <span class="toggle-title">استخدام أسعار خاصة لكل مدينة</span>
                            <span class="toggle-hint">تخصيص سعر منفصل لكل مدينة من إدارة أسعار الشحن</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" v-model="settings.use_city_specific_rates" true-value="1" false-value="0" />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="form-group" v-if="isCityShippingEnabled && !isCitySpecificRates">
                    <label>سعر الشحن الموحد للمدن (د.أ)</label>
                    <input type="text" v-model="settings.default_city_shipping_rate" placeholder="3" />
                </div>
                -->
                <div class="form-group">
                    <label>نسبة الضريبة (%) <span class="req">*</span></label>
                    <input type="text" v-model="settings.tax_rate" placeholder="0" />
                </div>
                <div class="form-group">
                    <label>اختصار العملة بالعربية <span class="req">*</span></label>
                    <input type="text" v-model="settings.currency_ar" placeholder="د.أ" />
                </div>
                <div class="form-group">
                    <label>اختصار العملة بالإنجليزية <span class="req">*</span></label>
                    <input type="text" v-model="settings.currency_en" placeholder="JOD" class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>مدى إرسال الطلبات كحد أقصى (كم) <span class="req">*</span></label>
                    <input type="text" v-model="settings.delivery_range_km" placeholder="10" />
                </div>
                <div class="form-group">
                    <label>رقم كوليكت للدعم <span class="req">*</span></label>
                    <input type="text" v-model="settings.support_phone" placeholder="+962712345678" class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>رابط الواتساب <span class="req">*</span></label>
                    <input type="text" v-model="settings.whatsapp" placeholder="https://wa.me/962" class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>البريد الإلكتروني الرئيسي <span class="req">*</span></label>
                    <input type="email" v-model="settings.email" placeholder="support@tijaracms.com" class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>بريد الدعم <span class="req">*</span></label>
                    <input type="email" v-model="settings.support_email" placeholder="info@tijara.com" class="ltr-input" />
                </div>
                
                <div class="form-group full-width">
                    <label>العنوان بالعربية <span class="req">*</span></label>
                    <textarea v-model="settings.address_ar" rows="2" placeholder="عمان، الأردن - شارع الملك عبدالله الثاني"></textarea>
                </div>
                <div class="form-group full-width">
                    <label>العنوان بالإنجليزية <span class="req">*</span></label>
                    <textarea v-model="settings.address_en" rows="2" placeholder="Amman, Jordan - King Abdullah II Street" class="ltr-input"></textarea>
                </div>

                <div class="form-group full-width">
                    <label>ساعات العمل بالعربية <span class="req">*</span></label>
                    <input type="text" v-model="settings.working_hours_ar" placeholder="السبت - الخميس: 9:00 صباحاً - 9:00 مساءً" />
                </div>
                <div class="form-group full-width">
                    <label>ساعات العمل بالإنجليزية <span class="req">*</span></label>
                    <input type="text" v-model="settings.working_hours_en" placeholder="Saturday - Thursday: 9:00 AM - 9:00 PM" class="ltr-input" />
                </div>
                <div class="form-group full-width">
                    <label>ساعات يوم الجمعة بالعربية <span class="req">*</span></label>
                    <input type="text" v-model="settings.friday_hours_ar" placeholder="الجمعة: 2:00 مساءً - 9:00 مساءً" />
                </div>
                <div class="form-group full-width">
                    <label>ساعات يوم الجمعة بالإنجليزية <span class="req">*</span></label>
                    <input type="text" v-model="settings.friday_hours_en" placeholder="Friday: 2:00 PM - 9:00 PM" class="ltr-input" />
                </div>

                <div class="form-group full-width">
                    <label>شعار الموقع <span class="req">*</span></label>
                    <div class="logo-upload-container">
                        <div class="logo-preview-box">
                            <img v-if="logoPreview" :src="logoPreview" />
                            <img v-else-if="settings.logo && typeof settings.logo === 'string' && settings.logo.startsWith('http')" :src="settings.logo" />
                            <div v-else class="placeholder-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </div>
                        </div>
                        <div class="upload-info">
                            <p>قم بتحميل شعار الموقع الرئيسي.</p>
                            <div class="upload-btn-wrapper">
                                <button class="btn-outline-upload">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    اختيار شعار
                                </button>
                                <input type="file" @change="onLogoChange" accept="image/*" />
                            </div>
                            <span>PNG أو SVG | 200x200 بكسل</span>
                        </div>
                    </div>
                </div>

                <div class="form-group full-width">
                    <label>أيقونة المتصفح (Favicon) <span class="req">*</span></label>
                    <div class="logo-upload-container">
                        <div class="logo-preview-box small">
                            <img v-if="faviconPreview" :src="faviconPreview" />
                            <img v-else-if="settings.favicon && typeof settings.favicon === 'string' && settings.favicon.startsWith('http')" :src="settings.favicon" />
                            <div v-else class="placeholder-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </div>
                        </div>
                        <div class="upload-info">
                            <p>قم بتحميل أيقونة المتصفح، تظهر بجانب اسم الموقع في التبويبات.</p>
                            <div class="upload-btn-wrapper">
                                <button class="btn-outline-upload">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    اختيار أيقونة
                                </button>
                                <input type="file" @change="onFaviconChange" accept="image/*" />
                            </div>
                            <span>PNG أو ICO | 32x32 بكسل</span>
                        </div>
                    </div>
                </div>

                <div class="form-group full-width">
                    <label>شعار الفوتر (Footer Logo) <span class="req">*</span></label>
                    <div class="logo-upload-container">
                        <div class="logo-preview-box dark">
                            <img v-if="footerLogoPreview" :src="footerLogoPreview" />
                            <img v-else-if="settings.footer_logo && typeof settings.footer_logo === 'string' && settings.footer_logo.startsWith('http')" :src="settings.footer_logo" />
                            <div v-else class="placeholder-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </div>
                        </div>
                        <div class="upload-info">
                            <p>قم بتحميل الشعار الذي يظهر في أسفل الصفحة (يفضل أن يكون باللون الأبيض).</p>
                            <div class="upload-btn-wrapper">
                                <button class="btn-outline-upload">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    اختيار شعار الفوتر
                                </button>
                                <input type="file" @change="onFooterLogoChange" accept="image/*" />
                            </div>
                            <span>PNG أو SVG | خلفية شفافة</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Social Media Tab -->
        <div v-if="activeTab === 'social'" class="tab-pane fade-in">
            <div class="form-grid">
                <div class="form-group">
                    <label>واتساب</label>
                    <input type="text" v-model="settings.whatsapp" placeholder="https://wa.me/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>فيسبوك</label>
                    <input type="text" v-model="settings.facebook" placeholder="https://facebook.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>إنستجرام</label>
                    <input type="text" v-model="settings.instagram" placeholder="https://instagram.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>إكس (تويتر)</label>
                    <input type="text" v-model="settings.x_twitter" placeholder="https://x.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>لينكد إن</label>
                    <input type="text" v-model="settings.linkedin" placeholder="https://linkedin.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>يوتيوب</label>
                    <input type="text" v-model="settings.youtube" placeholder="https://youtube.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>سناب شات</label>
                    <input type="text" v-model="settings.snapchat" placeholder="https://snapchat.com/..." class="ltr-input" />
                </div>
                <div class="form-group">
                    <label>تيك توك</label>
                    <input type="text" v-model="settings.tiktok" placeholder="https://tiktok.com/@..." class="ltr-input" />
                </div>
            </div>
        </div>

        <!-- Homepage Sections Tab -->
        <div v-if="activeTab === 'homepage'" class="tab-pane fade-in">
            <div class="form-grid">
                <div class="form-group full-width">
                   <div class="info-alert mb-4">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      إختر الفئات التي تود عرض منتجاتها بشكل خاص في الصفحة الرئيسية للموقع.
                   </div>
                </div>
                <div class="form-group">
                    <label>الفئة المخصصة الأولى (Home Section 1)</label>
                    <select v-model="settings.home_category_1" class="custom-select-v2">
                        <option :value="null">--- إختر فئة ---</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>الفئة المخصصة الثانية (Home Section 2)</label>
                    <select v-model="settings.home_category_2" class="custom-select-v2">
                        <option :value="null">--- إختر فئة ---</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                </div>
                
                <div class="form-group full-width" style="grid-column: span 2; border-top: 1px solid #f3f4f6; padding-top: 30px; margin-top: 10px;">
                    <h3 style="font-size: 1.1rem; font-weight: 800; color: #1f2937; margin: 0 0 20px 0;">عناوين الأقسام في الصفحة الرئيسية</h3>
                </div>
                
                <div class="form-group">
                    <label>عنوان قسم الفئات (عربي)</label>
                    <input type="text" v-model="settings.home_section_category_title_ar" placeholder="تسوّق حسب الفئة" />
                </div>
                <div class="form-group">
                    <label>عنوان قسم الفئات (English)</label>
                    <input type="text" v-model="settings.home_section_category_title_en" placeholder="Shop by Category" class="ltr-input" />
                </div>
                
                <div class="form-group">
                    <label>عنوان قسم العروض (عربي)</label>
                    <input type="text" v-model="settings.home_section_offers_title_ar" placeholder="العروض المميزة" />
                </div>
                <div class="form-group">
                    <label>عنوان قسم العروض (English)</label>
                    <input type="text" v-model="settings.home_section_offers_title_en" placeholder="Featured Offers" class="ltr-input" />
                </div>
            </div>
        </div>
        <!-- About Us Tab -->
        <div v-if="activeTab === 'about'" class="tab-pane fade-in">
            <div class="form-grid">
                <div class="form-group full-width">
                    <div class="info-alert mb-4">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        محتوى صفحة "من نحن" يظهر على الموقع عند الضغط على رابط "من نحن" في القائمة.
                    </div>
                </div>
                <div class="form-group">
                    <label>عنوان الصفحة (عربي) <span class="req">*</span></label>
                    <input type="text" v-model="settings.about_title_ar" placeholder="من نحن" />
                </div>
                <div class="form-group">
                    <label>عنوان الصفحة (English)</label>
                    <input type="text" v-model="settings.about_title_en" placeholder="About Us" class="ltr-input" />
                </div>
                <div class="form-group full-width">
                    <label>محتوى الصفحة (عربي) <span class="req">*</span></label>
                    <textarea v-model="settings.about_content_ar" rows="10" placeholder="اكتب محتوى صفحة من نحن بالعربية..."></textarea>
                </div>
                <div class="form-group full-width">
                    <label>Page Content (English)</label>
                    <textarea v-model="settings.about_content_en" rows="10" placeholder="Write About Us page content in English..." class="ltr-input"></textarea>
                </div>
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
.settings-page { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; }

/* Breadcrumbs */
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #9ca3af; }
.breadcrumb svg { transform: rotate(180deg); color: #d1d5db; }
.breadcrumb .active { color: #873260; font-weight: 700; }

/* Header */
.header-section { display: flex; justify-content: space-between; align-items: center; }
.page-title-area h1 { font-size: 1.4rem; font-weight: 800; color: #1f2937; margin: 0; }
.page-title-area p { color: #6b7280; font-size: 0.85rem; margin: 0; }
.title-with-icon { display: flex; align-items: center; gap: 12px; }
.icon-box { background: #fdf2f8; color: #873260; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }

.save-btn { background: #873260; color: white; border: none; padding: 10px 22px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; font-size: 0.9rem; }
.save-btn:hover { background: #721c43; transform: translateY(-2px); }
.save-btn:disabled { background: #9ca3af; }

/* Tabs */
.tabs-nav { display: flex; gap: 25px; border-bottom: 1px solid #f3f4f6; }
.tab-link { background: none; border: none; padding: 12px 5px; color: #6b7280; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; position: relative; border-bottom: 2px solid transparent; transition: 0.2s; }
.tab-link.active { color: #873260; border-bottom-color: #873260; }
.tab-link:hover { color: #873260; }

/* Content */
.settings-content { background: white; border-radius: 20px; padding: 40px; border: 1px solid #f3f4f6; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.form-group.full-width { grid-column: span 2; }

.form-group label { display: block; font-weight: 700; font-size: 0.9rem; color: #374151; margin-bottom: 10px; text-align: right; }
.form-group input, .form-group textarea { width: 100%; padding: 14px 18px; border: 1px solid #f3f4f6; border-radius: 12px; outline: none; transition: 0.3s; font-family: inherit; font-size: 0.95rem; background: #fafafa; color: #1f2937; }
.form-group input:focus, .form-group textarea:focus { border-color: #873260; background: white; box-shadow: 0 0 0 4px rgba(139, 34, 82, 0.05); }

.ltr-input { direction: ltr; text-align: left; }
.req { color: #dc2626; }

/* Toggle Switch */
.toggle-row { display: flex; align-items: center; justify-content: space-between; background: #f9fafb; padding: 16px 20px; border-radius: 14px; border: 1px solid #f3f4f6; gap: 1rem; }
.toggle-info { display: flex; flex-direction: column; gap: 3px; }
.toggle-title { font-weight: 700; font-size: 0.92rem; color: #1f2937; }
.toggle-hint { font-size: 0.78rem; color: #9ca3af; }
.toggle-switch { position: relative; display: inline-block; width: 52px; height: 28px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #e5e7eb; border-radius: 28px; transition: 0.3s; }
.toggle-slider::before { position: absolute; content: ''; height: 22px; width: 22px; right: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
.toggle-switch input:checked + .toggle-slider { background: #873260; }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(-24px); }

/* Logo Upload */
.logo-upload-container { display: flex; align-items: center; gap: 25px; background: #fafafa; padding: 25px; border-radius: 15px; border: 1px dashed #e5e7eb; }
.logo-preview-box { width: 100px; height: 100px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #f3f4f6; overflow: hidden; flex-shrink: 0; }
.logo-preview-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
.logo-preview-box.dark { background: #1f2937; }
.logo-preview-box.small { width: 60px; height: 60px; }

.upload-info p { margin: 0 0 8px; color: #4b5563; font-size: 0.85rem; font-weight: 600; }
.upload-info span { font-size: 0.75rem; color: #9ca3af; }

.upload-btn-wrapper { position: relative; overflow: hidden; display: inline-block; margin: 10px 0; }
.btn-outline-upload { border: 1px solid #e5e7eb; background: white; color: #374151; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; cursor: pointer; }
.upload-btn-wrapper input[type=file] { font-size: 100px; position: absolute; left: 0; top: 0; opacity: 0; cursor: pointer; }

/* Custom Select and Alert */
.custom-select-v2 { width: 100%; padding: 14px 18px; border: 1px solid #f3f4f6; border-radius: 12px; outline: none; background: #fafafa; color: #1f2937; font-family: inherit; font-size: 0.95rem; cursor: pointer; }
.custom-select-v2:focus { border-color: #873260; background: white; }

.info-alert { background: #eff6ff; color: #1e40af; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-size: 0.85rem; font-weight: 600; border: 1px solid #dbeafe; }
.mb-4 { margin-bottom: 1rem; }

/* Alert */
.alert-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 10px; color: white; font-weight: 700; z-index: 2000; box-shadow: 0 10px 15px rgba(0,0,0,0.1); animation: toastIn 0.3s ease-out; }
@keyframes toastIn { from { top: -50px; opacity: 0; } to { top: 24px; opacity: 1; } }
.alert-toast.success { background: #10b981; }
.alert-toast.error { background: #ef4444; }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
    .form-grid { grid-template-columns: 1fr; }
    .form-group.full-width { grid-column: span 1; }
    .logo-upload-container { flex-direction: column; text-align: center; }
}
</style>
