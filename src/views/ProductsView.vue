<template>
  <div class="products-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-titles">
        <h2 class="page-title">إدارة المنتجات</h2>
        <p class="page-subtitle">إضافة وتعديل وإدارة المنتجات</p>
      </div>
      <button class="add-btn" @click="openAddModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        إضافة منتج جديد
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
        <div class="stat-card">
        <div class="stat-icon-wrapper main-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي المنتجات</span>
          <span class="stat-value">{{ totalProducts }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper total-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">منتجات نشطة</span>
          <span class="stat-value">{{ activeProductsCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper empty-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">منتجات غير نشطة</span>
          <span class="stat-value">{{ inactiveProductsCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper active-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي المبيعات</span>
          <span class="stat-value">{{ totalSales }}</span>
        </div>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="filters-row">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="search-icon">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" v-model="searchQuery" placeholder="البحث عن منتج..." class="search-input" />
      </div>
      <div class="filter-select">
        <select v-model="statusFilter" class="form-select">
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="select-icon" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="filter-select">
        <select v-model="catFilter" class="form-select">
          <option value="">جميع الأقسام</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="select-icon" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-name">المنتج</th>
            <th class="col-price">السعر</th>
            <th class="col-stock">المخزون</th>
            <th class="col-sales">المبيعات</th>
            <th class="col-status">الحالة</th>
            <th class="col-actions">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="state-row"><td colspan="6">جاري التحميل...</td></tr>
          <tr v-else-if="filteredProducts.length === 0" class="state-row"><td colspan="6">لا توجد منتجات مطابقة</td></tr>
          <template v-else>
            <tr v-for="prod in filteredProducts" :key="prod.id" class="data-row">
              <td class="col-name">
                <div class="prod-name-cell">
                  <div class="prod-image">
                    <img v-if="prod.images?.length" :src="prod.images[0]" :alt="prod.name_i18n?.ar || prod.name" />
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span v-if="prod.images?.length > 1" class="multi-img-badge" :title="`${prod.images.length} صور للمنتج`">+{{ prod.images.length }}</span>
                  </div>
                  <div class="prod-details">
                    <span class="prod-title">{{ prod.name_i18n?.ar || prod.name }}</span>
                    <span class="prod-cat-badge">{{ prod.category || 'غير محدد' }}</span>
                  </div>
                </div>
              </td>
              <td class="col-price">
                <div class="price-cell">
                  <span class="current-price">{{ formatPrice(prod.price * (1 - (getDiscountPercent(prod) / 100))) }} د.أ</span>
                  <span v-if="getDiscountPercent(prod) > 0" class="old-price">{{ formatPrice(prod.price) }} د.أ</span>
                </div>
              </td>
              <td class="col-stock">
                <span :class="['stock-badge', prod.stock > 0 ? 'in-stock' : 'out-of-stock']">
                  {{ prod.stock }}
                </span>
              </td>
              <td class="col-sales">
                <span class="sales-count">{{ prod.sales }} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg></span>
              </td>
              <td class="col-status">
                <span class="status-badge" :class="prod.status === 'active' ? 'active' : 'inactive'">
                  {{ prod.status === 'active' ? 'نشط' : 'غير نشط' }}
                </span>
              </td>
              <td class="col-actions">
                <div class="actions-group">
                  <button class="action-btn delete-btn" @click="confirmDelete(prod)" title="حذف">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                  <button class="action-btn edit-btn" @click="openEditModal(prod)" title="تعديل">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="action-btn view-btn" @click="openViewModal(prod)" title="عرض">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="totalProductsCount > 0">
      <div class="pagination-info">
        <span>إظهار {{ totalProductsCount > 0 ? (currentPage - 1) * perPage + 1 : 0 }} - {{ Math.min(currentPage * perPage, totalProductsCount) }} من أصل {{ totalProductsCount }} منتج</span>
      </div>
      <div class="pagination-controls" v-if="totalPages > 1">
        <button class="pagination-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" title="السابق" aria-label="السابق">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div class="pagination-pages">
          <button v-for="page in totalPages" :key="page" class="pagination-page-btn" :class="{ active: currentPage === page }" @click="goToPage(page)">
            {{ page }}
          </button>
        </div>
        <button class="pagination-btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" title="التالي" aria-label="التالي">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal-overlay" v-if="showFormModal" @click.self="closeModal">
      <div class="modal-content form-content">
        <button class="modal-close" @click="closeModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="modal-title">{{ isEdit ? 'تعديل المنتج' : 'إضافة منتج جديدة' }}</h3>
        <p class="modal-subtitle">أدخل معلومات السلعة للجدول</p>

        <div class="i18n-toggle" role="tablist" aria-label="Language">
          <button type="button" class="i18n-btn" :class="{ active: activeLang === 'en' }" @click="activeLang = 'en'">English</button>
          <button type="button" class="i18n-btn" :class="{ active: activeLang === 'ar' }" @click="activeLang = 'ar'">العربية</button>
        </div>

        <!-- Tabs -->
        <div class="modal-tabs">
          <button class="tab-btn" :class="{ active: currentTab === 'info' }" @click.prevent="currentTab = 'info'">معلومات المنتج</button>
          <button class="tab-btn" :class="{ active: currentTab === 'attributes' }" @click.prevent="currentTab = 'attributes'">خصائص المنتج</button>
        </div>
        
        <form @submit.prevent="submitForm" class="prod-form">
          <div v-show="currentTab === 'info'" class="tab-pane">
            <!-- Images Upload -->
            <div class="form-group">
              <div class="image-label-row">
                <label class="form-label mb-0" style="text-align: right;">صور المنتج <span class="req">*</span></label>
                <span class="images-count-badge">
                  {{ form.existing_images.length + form.new_images.length }} / {{ maxImages }} صور
                </span>
              </div>
              <div class="image-uploader">
                <!-- Dropzone -->
                <div class="upload-box" @click="triggerFileInput" v-if="(form.existing_images.length + form.new_images.length) < maxImages">
                  <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" multiple class="hidden-input" />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#873260" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <p>اضغط أو اسحب لرفع صور متعددة للمنتج<br><span>(JPG, PNG, WebP | بحد أقصى {{ maxImages }} صورة)</span></p>
                </div>
                <div class="upload-box disabled" v-else>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  <p>تم بلوغ الحد الأقصى ({{ maxImages }} صورة)</p>
                </div>
                <!-- Images Preview -->
                <div class="preview-grid" v-if="imagePreviews.length > 0 || form.existing_images.length > 0">
                  <!-- Existing Images -->
                  <div class="preview-item" v-for="(img, idx) in form.existing_images" :key="'e'+idx">
                    <img :src="img" />
                    <span v-if="idx === 0" class="primary-tag-badge">الرئيسية</span>
                    <button v-else type="button" class="set-primary-btn" @click.prevent="setPrimaryExistingImage(idx)" title="تعيين كصورة رئيسية للمنتج">
                      ★ تعيين كرئيسية
                    </button>
                    <button type="button" class="remove-img-btn" @click.prevent="removeExistingImage(idx)" title="حذف الصورة">✕</button>
                  </div>
                  <!-- New Staged Images -->
                  <div class="preview-item new-preview-item" v-for="(file, idx) in imagePreviews" :key="'p'+idx">
                    <img :src="file.preview" />
                    <span v-if="form.existing_images.length === 0 && idx === 0" class="primary-tag-badge">الرئيسية</span>
                    <button v-else type="button" class="set-primary-btn" @click.prevent="setPrimaryNewImage(idx)" title="تعيين كصورة رئيسية للمنتج">
                      ★ تعيين كرئيسية
                    </button>
                    <button type="button" class="remove-img-btn" @click.prevent="removeNewImage(idx)" title="إلغاء الصورة">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Long Text Fields with simple fake toolbar -->
            <div class="form-group" v-show="activeLang === 'ar'">
              <label class="form-label">اسم المنتج (عربي) <span class="req">*</span></label>
              <input type="text" v-model="form.name_ar" class="form-control" placeholder="أدخل اسم المنتج بالعربي (Enter product name in Arabic)" />
            </div>

            <div class="form-group" v-show="activeLang === 'en'">
              <label class="form-label">اسم المنتج (English) <span class="req">*</span></label>
              <input type="text" v-model="form.name_en" class="form-control" placeholder="Product name in English (اسم المنتج بالإنجليزية)" required />
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label class="form-label">القسم الرئيسي <span class="req">*</span></label>
                <div class="select-wrapper">
                  <select v-model="form.category_id" class="form-control" required @change="updateSubcats">
                    <option value="" disabled selected>اختر القسم الرئيسي هنا (Select Main Category)</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                  <svg class="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <div class="form-group half-width">
                <label class="form-label">القسم الفرعي</label>
                <div class="select-wrapper">
                  <select v-model="form.subcategory_id" class="form-control" :disabled="!subCategories.length">
                    <option value="">لا يوجد (None)</option>
                    <option v-for="sc in subCategories" :key="sc.id" :value="sc.id">{{ sc.name }}</option>
                  </select>
                  <svg class="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label class="form-label">السعر (د.أ) <span class="req">*</span></label>
                <input type="number" step="0.01" min="0" v-model="form.price" class="form-control no-rtl-issue" placeholder="0.00 (Price in JOD)" required />
              </div>
              <div class="form-group half-width">
                <label class="form-label">الخصم (%)</label>
                <input type="number" step="0.1" min="0" max="100" v-model="form.discount" class="form-control no-rtl-issue" placeholder="0 (Discount)" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label class="form-label">المخزون <span class="req">*</span></label>
                <input type="number" min="0" v-model="form.quantity" class="form-control no-rtl-issue" placeholder="0 (Stock)" required />
              </div>
              <div class="form-group half-width">
                <label class="form-label">الحالة</label>
                <div class="select-wrapper">
                  <select v-model="form.is_active" class="form-control">
                    <option :value="true">نشط (Active)</option>
                    <option :value="false">غير نشط (Inactive)</option>
                  </select>
                  <svg class="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            <!-- Long Text Fields with simple fake toolbar -->
            <div class="form-group" v-show="activeLang === 'ar'">
              <label class="form-label">وصف المنتج (عربي) <span class="req">*</span></label>
              <div class="rich-textarea-mock">
                <div class="rt-toolbar"><span class="rt-icon">B</span><span class="rt-icon">I</span><span class="rt-icon">U</span></div>
                <textarea v-model="form.description_ar" class="form-control rt-body" placeholder="أدخل تفاصيل ووصف المنتج بالعربي هنا... (Enter product description in Arabic...)"></textarea>
              </div>
            </div>

            <div class="form-group" v-show="activeLang === 'en'">
              <label class="form-label">وصف المنتج (English)</label>
              <div class="rich-textarea-mock">
                <div class="rt-toolbar"><span class="rt-icon">B</span><span class="rt-icon">I</span><span class="rt-icon">U</span></div>
                <textarea v-model="form.description_en" class="form-control rt-body" placeholder="Product description in English (وصف المنتج بالإنجليزية)..."></textarea>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">المميزات ونظرة عامة (Features & Overview)</label>
              <div class="rich-textarea-mock">
                <div class="rt-toolbar"><span class="rt-icon">B</span><span class="rt-icon">I</span><span class="rt-icon">U</span></div>
                <textarea v-show="activeLang === 'ar'" v-model="form.features_ar" class="form-control rt-body" placeholder="أدخل المزايا الرئيسية للمنتج (تغذي تبويب نظرة عامة بالمتجر - ميزة في كل سطر)..."></textarea>
                <textarea v-show="activeLang === 'en'" v-model="form.features_en" class="form-control rt-body" placeholder="Key product features (powers the Overview tab)..."></textarea>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">دليل التركيب وإرشادات الاستخدام (Installation Guide & Tips)</label>
              <div class="rich-textarea-mock">
                <div class="rt-toolbar"><span class="rt-icon">B</span><span class="rt-icon">I</span><span class="rt-icon">U</span></div>
                <textarea v-show="activeLang === 'ar'" v-model="form.tips_ar" class="form-control rt-body" placeholder="أدخل متطلبات التركيب وخطوات التركيب وإرشادات الأمان (تغذي تبويب التركيب بالمتجر)..."></textarea>
                <textarea v-show="activeLang === 'en'" v-model="form.tips_en" class="form-control rt-body" placeholder="Installation requirements, steps, and safety notes (powers the Installation tab)..."></textarea>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">الشحن والإرجاع والضمان (Shipping, Returns & Warranty)</label>
              <div class="rich-textarea-mock">
                <div class="rt-toolbar"><span class="rt-icon">B</span><span class="rt-icon">I</span><span class="rt-icon">U</span></div>
                <textarea v-show="activeLang === 'ar'" v-model="form.shipping_info_ar" class="form-control rt-body" placeholder="تفاصيل الشحن، شروط الاستبدال والإرجاع، ومدة وسياسة الضمان (تغذي تبويب الشحن والإرجاع بالمتجر)..."></textarea>
                <textarea v-show="activeLang === 'en'" v-model="form.shipping_info_en" class="form-control rt-body" placeholder="Shipping, returns, and warranty terms (powers Shipping & Returns tab)..."></textarea>
              </div>
            </div>
          </div>

          <div v-show="currentTab === 'attributes'" class="tab-pane attributes-tab-pane">
            <!-- 1. Colors Management Section -->
            <div v-if="false" class="variant-section-card">
              <div class="variant-section-header">
                <div class="variant-icon-wrapper color-icon-bg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
                </div>
                <div>
                  <h4 class="variant-section-title">ألوان المنتج (Colors & Finishes)</h4>
                  <p class="variant-section-desc">حدد درجات الألوان المتاحة للمنتج مع شكلها ولونها الواقعي (Hex)</p>
                </div>
              </div>

              <!-- Popular Quick Color Presets -->
              <div class="presets-block">
                <span class="presets-label">ألوان خصائص المنتجات من API (اضغط للإضافة):</span>
                <div class="color-presets-row" v-if="apiColorPresets.length > 0">
                  <button 
                    type="button" 
                    v-for="p in apiColorPresets" 
                    :key="p.label" 
                    class="color-preset-pill" 
                    :class="{ active: isColorSelected(p) }" 
                    @click.prevent="toggleColorPreset(p)"
                  >
                    <span class="preset-dot" :style="{ background: p.color }" :class="{ 'dot-white': isLightColor(p.color) }"></span>
                    <span class="preset-name">{{ p.label }}</span>
                    <span v-if="isColorSelected(p)" class="preset-check">✓</span>
                  </button>
                </div>
                <div v-else class="empty-variants-hint">لا توجد ألوان محملة من API خصائص المنتجات.</div>
              </div>

              <!-- Custom Color Adder -->
              <div class="custom-variant-box">
                <span class="presets-label">إضافة لون مخصص جديد:</span>
                <div class="color-custom-row">
                  <input 
                    type="text" 
                    v-model="customColorName" 
                    placeholder="اسم اللون (مثال: رمادي مطفي، كحلي، أسود ملكي)..." 
                    class="form-control custom-color-name"
                    @keydown.enter.prevent="addCustomColor"
                  />
                  <div class="color-picker-input-box">
                    <input type="color" v-model="customColorHex" class="native-color-picker" title="اختر اللون" />
                    <input type="text" v-model="customColorHex" class="form-control custom-color-hex" placeholder="#111827" />
                  </div>
                  <button type="button" class="btn-add-variant" @click.prevent="addCustomColor">
                    + إضافة اللون
                  </button>
                </div>
              </div>

              <!-- Selected Colors Display -->
              <div class="selected-items-block">
                <div class="selected-header-row">
                  <span class="presets-label">الألوان المختارة للمنتج ({{ form.colors.length }}):</span>
                </div>
                <div class="selected-colors-grid" v-if="form.colors.length > 0">
                  <div class="color-chip-card" v-for="(col, cIdx) in form.colors" :key="cIdx">
                    <div class="chip-swatch" :style="{ background: col.color }" :class="{ 'chip-light': isLightColor(col.color) }"></div>
                    <div class="chip-info">
                      <span class="chip-name">{{ col.label }}</span>
                      <span class="chip-hex">{{ col.color }}</span>
                    </div>
                    <button type="button" class="chip-del-btn" @click.prevent="removeColor(cIdx)" title="إزالة هذا اللون">✕</button>
                  </div>
                </div>
                <div v-else class="empty-variants-hint">
                  لم يتم تحديد ألوان لهذا المنتج. انقر على أحد الألوان المقترحة أعلاه أو أدخل لوناً مخصصاً.
                </div>
              </div>
            </div>

            <!-- 2. Sizes & Dimensions Management Section -->
            <div v-if="false" class="variant-section-card">
              <div class="variant-section-header">
                <div class="variant-icon-wrapper size-icon-bg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <div>
                  <h4 class="variant-section-title">المقاسات والأحجام والسعات (Sizes & Dimensions)</h4>
                  <p class="variant-section-desc">حدد المقاسات، الأبعاد، أو السعة المتوفرة للمنتج (مثل: 60 سم، 90 سم، 8 لتر، إلخ)</p>
                </div>
              </div>

              <!-- Popular Quick Size Presets -->
              <div class="presets-block">
                <span class="presets-label">مقاسات وسعات شائعة (اضغط للإضافة):</span>
                <div class="size-presets-row">
                  <button 
                    type="button" 
                    v-for="s in sizePresets" 
                    :key="s" 
                    class="size-preset-pill" 
                    :class="{ active: isSizeSelected(s) }" 
                    @click.prevent="toggleSizePreset(s)"
                  >
                    <span>{{ s }}</span>
                    <span v-if="isSizeSelected(s)" class="preset-check">✓</span>
                  </button>
                </div>
              </div>

              <!-- Custom Size Adder -->
              <div class="custom-variant-box">
                <span class="presets-label">إضافة مقاس أو سعة مخصصة:</span>
                <div class="size-custom-row">
                  <input 
                    type="text" 
                    v-model="customSizeInput" 
                    placeholder="أدخل المقاس أو السعة (مثال: 75×50 سم، 15 لتر، 50 كغم)..." 
                    class="form-control custom-size-input"
                    @keydown.enter.prevent="addCustomSize"
                  />
                  <button type="button" class="btn-add-variant" @click.prevent="addCustomSize">
                    + إضافة المقاس
                  </button>
                </div>
              </div>

              <!-- Selected Sizes Display -->
              <div class="selected-items-block">
                <div class="selected-header-row">
                  <span class="presets-label">المقاسات المحددة للمنتج ({{ form.sizes.length }}):</span>
                </div>
                <div class="selected-sizes-grid" v-if="form.sizes.length > 0">
                  <div class="size-chip-card" v-for="(size, sIdx) in form.sizes" :key="sIdx">
                    <span class="size-chip-text">{{ size }}</span>
                    <button type="button" class="chip-del-btn" @click.prevent="removeSize(sIdx)" title="إزالة هذا المقاس">✕</button>
                  </div>
                </div>
                <div v-else class="empty-variants-hint">
                  لم يتم تحديد مقاسات لهذا المنتج. انقر على أحد المقاسات المقترحة أعلاه أو أضف مقاساً مخصصاً.
                </div>
              </div>
            </div>

            <div v-if="attributesLoading" class="attributes-state-card">
              جاري تحميل خصائص المنتجات من API...
            </div>
            <div v-else-if="attributesLoadError" class="attributes-state-card error">
              تعذر تحميل خصائص المنتجات. اضغط لإعادة المحاولة.
              <button type="button" class="attributes-retry-btn" @click.prevent="fetchDependencies">إعادة المحاولة</button>
            </div>

            <!-- Product attributes -->
            <div class="variant-section-card api-attributes-section" v-else-if="apiAttributesList.length > 0">
              <div class="other-attrs-list">
                  <div v-for="attr in apiAttributesList" :key="attr.id" class="other-attr-row">
                    <label class="other-attr-label">{{ attr.label }} ({{ attr.name }})</label>
                    <div class="attr-values-list" v-if="attr.values && attr.values.length > 0">
                      <button
                        v-for="val in attr.values"
                        :key="val.id"
                        class="attr-val-checkbox"
                        type="button"
                        :aria-pressed="isApiAttributeSelected(attr.name, val.label)"
                        @click="toggleApiAttribute(attr.name, val.label)"
                      >
                        <span class="checkmark" :class="{ active: isApiAttributeSelected(attr.name, val.label) }"></span>
                        <span v-if="val.color" class="api-attribute-color-dot" :style="{ background: val.color }"></span>
                        <span class="val-text">{{ val.label }}</span>
                      </button>
                  </div>
                  <div v-else class="attr-no-vals">
                    <span class="text-muted-xs">لا توجد قيم مسجلة لهذه الخاصية.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. Full Technical Specifications (Key-Value) Section -->
            <div v-if="false" class="variant-section-card" style="background: rgba(255, 255, 255, 1);">
              <div class="variant-section-header">
                <div class="variant-icon-wrapper other-icon-bg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                </div>
                <div>
                  <h4 class="variant-section-title">المواصفات الفنية الكاملة (Full Technical Specifications)</h4>
                  <p class="variant-section-desc">تغذي جدول المواصفات الفنية المباشر في صفحة تفاصيل المنتج (كالارتفاع، العرض، السعة، الجهد، وغيرها)</p>
                </div>
              </div>

              <!-- Quick Presets -->
              <div class="presets-block">
                <span class="presets-label">مواصفات شائعة سريعة (اضغط لاختيار اسم الخاصية):</span>
                <div class="specs-presets-row">
                  <button 
                    type="button" 
                    v-for="preset in specPresets" 
                    :key="preset" 
                    class="spec-preset-pill"
                    @click.prevent="newSpecKey = preset"
                  >
                    {{ preset }}
                  </button>
                </div>
              </div>

              <!-- Input Row -->
              <div class="add-spec-row">
                <input 
                  type="text" 
                  v-model="newSpecKey" 
                  class="form-control" 
                  placeholder="اسم المواصفة (مثلاً: الارتفاع، السعة)" 
                />
                <input 
                  type="text" 
                  v-model="newSpecVal" 
                  class="form-control" 
                  placeholder="القيمة (مثلاً: 59.5 سم أو 65 لتر)" 
                  @keyup.enter.prevent="addCustomSpec"
                />
                <button type="button" class="btn-add-spec" @click.prevent="addCustomSpec">
                  + إضافة
                </button>
              </div>

              <!-- Specs Table -->
              <div class="specs-table-wrapper" v-if="form.specs && form.specs.length > 0">
                <table class="specs-admin-table">
                  <thead>
                    <tr>
                      <th style="width: 45%;">اسم المواصفة</th>
                      <th>القيمة</th>
                      <th style="width: 60px; text-align: center;">حذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(sp, idx) in form.specs" :key="idx">
                      <td class="font-bold">{{ sp.key }}</td>
                      <td>{{ sp.value }}</td>
                      <td style="text-align: center;">
                        <button type="button" class="chip-del-btn" @click.prevent="removeSpec(idx)" title="حذف المواصفة">✕</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="empty-variants-hint">
                لم يتم إدخال مواصفات فنية إضافية بعد. يمكنك كتابة أو اختيار اسم المواصفة وقيمتها أعلاه لتظهر ديناميكياً بجدول المواصفات بالمتجر.
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'جاري الحفظ...' : (isEdit ? 'تعديل' : 'إضافة المنتج') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal Details -->
    <div class="modal-overlay" v-if="showViewModal" @click.self="showViewModal = false;">
      <div class="modal-content view-content no-padding-top">
        <button class="modal-close floating-close" @click="showViewModal = false;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="view-image-slider">
          <img v-if="viewProduct?.images?.length" :src="viewProduct.images[currentImageIdx]" class="view-main-image" />
          <div v-else class="view-main-image-placeholder">لا توجد صورة</div>
          <button v-if="viewProduct?.images?.length > 1" class="slider-btn prev-btn" @click.prevent="prevImage">&#10095;</button>
          <button v-if="viewProduct?.images?.length > 1" class="slider-btn next-btn" @click.prevent="nextImage">&#10094;</button>
          <div v-if="viewProduct?.images?.length > 1" class="image-indicator">{{currentImageIdx + 1}} / {{viewProduct.images.length}}</div>
        </div>
        <div class="view-thumbnails" v-if="viewProduct?.images?.length > 1">
          <img v-for="(img, idx) in viewProduct.images" :key="idx" :src="img" class="thumb-img" :class="{active: currentImageIdx === idx}" @click="currentImageIdx = idx" />
        </div>

        <div class="view-body-wrapper">
          <div class="view-title-row">
            <div>
              <h3 class="view-title">{{ viewProduct?.name }}</h3>
              <p class="view-subtitle">{{ viewProduct?.category }} <span v-if="viewProduct?.subcategory">/ {{ viewProduct?.subcategory }}</span></p>
            </div>
            <div class="view-status-badge" :class="viewProduct?.status === 'active' ? 'active' : 'inactive'">
              {{ viewProduct?.status === 'active' ? 'نشط' : 'غير نشط' }}
            </div>
          </div>

          <div class="view-stats-grid">
            <div class="v-stat-box">
              <span class="v-stat-label">السعر</span>
              <span class="v-stat-value green-text">{{ formatPrice(viewProduct?.price * (1 - ((viewProduct?.discount||0)/100))) }} <span style="font-size: 0.75rem">د.أ</span></span>
            </div>
            <div class="v-stat-box">
              <span class="v-stat-label">الخصم</span>
              <span class="v-stat-value">{{ viewProduct?.discount || 0 }}%</span>
            </div>
            <div class="v-stat-box">
              <span class="v-stat-label">المتبقي</span>
              <span class="v-stat-value px-badge">{{ viewProduct?.stock }}</span>
            </div>
            <div class="v-stat-box">
              <span class="v-stat-label">المبيعات</span>
              <span class="v-stat-value">{{ viewProduct?.sales }} مرة</span>
            </div>
          </div>

          <div class="view-sections">
            <div class="v-section" v-if="viewProduct?.description">
              <h4 class="v-section-title">نبذة عن المنتج</h4>
              <div class="v-section-content" style="white-space: pre-wrap;">{{ viewProduct?.description }}</div>
            </div>
            <div class="v-section" v-if="viewProduct?.features">
              <h4 class="v-section-title">المميزات الرئيسية</h4>
              <div class="v-section-content">
                <ul class="v-feature-list">
                  <li v-for="(feature, idx) in viewProduct.features.split('\n')" :key="idx" v-show="feature.trim() !== ''">
                    {{ feature.replace(/^[-*•]\s*/, '').trim() }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="v-section" v-if="viewProduct?.tips">
              <h4 class="v-section-title">نصائح</h4>
              <div class="v-section-content">
                <ul class="v-feature-list">
                  <li v-for="(tip, idx) in viewProduct.tips.split('\n')" :key="idx" v-show="tip.trim() !== ''">
                    {{ tip.replace(/^[-*•]\s*/, '').trim() }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="v-section" v-if="viewProduct?.shipping_info">
              <h4 class="v-section-title">الشحن والضمان</h4>
              <div class="v-section-content" style="white-space: pre-wrap;">{{ viewProduct.shipping_info }}</div>
            </div>
            <div class="v-section" v-if="Object.keys(viewProduct?.attributes || {}).length > 0">
              <h4 class="v-section-title">خصائص المنتج</h4>
              <div class="v-section-content">
                <div class="v-attr-row" v-for="(vals, key) in viewProduct.attributes" :key="key">
                  <span class="v-attr-key">{{ key }}:</span> 
                  <div class="v-attr-vals">
                    <span class="v-attr-chip" v-for="val in resolveAttributeValues(key, vals)" :key="val.label">
                      <span class="v-val-text">{{ val.label }}</span>
                      <span v-if="val.color" class="color-dot" :style="{background: val.color}"></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="view-footer-actions">
            <button class="btn-cancel" @click="showViewModal = false;">إغلاق</button>
            <button class="btn-outline-edit" @click="showViewModal=false; openEditModal(viewProduct); ">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>  
              تعديل المنتج
            </button>
          </div>
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
import { ref, computed, onMounted, watch } from 'vue';
import api from '../config/axios';
import { dedupeColorOptions, isColorAttribute, normalizeProductAttributes } from '../utils/productAttributes';

// States
const products = ref([]);
const categories = ref([]);
const attributesList = ref([]);
const attributesLoading = ref(false);
const attributesLoadError = ref(false);
const loading = ref(false);

const searchQuery = ref('');
const statusFilter = ref('');
const catFilter = ref('');

// Pagination
const currentPage = ref(1);
const perPage = ref(50);
const totalProductsCount = ref(0);

const customInputs = ref({});
const customAttributes = ref({});

const maxImages = 15;

const presetColorMap = {
  'أسود': '#111827',
  'black': '#111827',
  'فضي': '#9ca3af',
  'فضي استانلس': '#9ca3af',
  'silver': '#9ca3af',
  'ستانلس': '#9ca3af',
  'inox': '#9ca3af',
  'أبيض': '#ffffff',
  'white': '#ffffff',
  'رمادي': '#4b5563',
  'رمادي داكن': '#4b5563',
  'gray': '#4b5563',
  'grey': '#4b5563',
  'ذهبي': '#d97706',
  'ذهبي شامبانيا': '#d97706',
  'gold': '#d97706',
  'أحمر': '#dc2626',
  'red': '#dc2626',
  'أزرق': '#2563eb',
  'أزرق كحلي': '#1e3a8a',
  'blue': '#2563eb',
  'بيج': '#d4b996',
  'beige': '#d4b996',
  'برتقالي': '#f97316',
  'orange': '#f97316',
  'بني': '#78350f',
  'brown': '#78350f'
};

const getPresetColorHex = (name) => {
  if (!name) return null;
  const trimmed = String(name).trim().toLowerCase();
  return presetColorMap[trimmed] || presetColorMap[String(name).trim()] || null;
};

const isLightColor = (hex) => {
  if (!hex) return false;
  const h = String(hex).trim().toLowerCase();
  if (h === '#ffffff' || h === '#fff' || h === 'white' || h === 'أبيض') return true;
  if (h.startsWith('#') && h.length >= 7) {
    const r = parseInt(h.substr(1, 2), 16) || 0;
    const g = parseInt(h.substr(3, 2), 16) || 0;
    const b = parseInt(h.substr(5, 2), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 190;
  }
  return false;
};

// Standard color choices are sourced from the product-attributes API.
const apiColorPresets = computed(() => {
  const colorAttribute = attributesList.value.find(attribute => isColorAttribute(attribute));
  return dedupeColorOptions((colorAttribute?.values || [])
    .map(value => ({
      label: value.label,
      color: value.color || getPresetColorHex(value.label) || '#111827',
    }))
    .filter(value => value.label));
});

const sizePresets = [
  '60 سم',
  '90 سم',
  '70 سم',
  '6 لتر',
  '8 لتر',
  '10 لتر',
  '12.5 كغ',
  'صغير (S)',
  'وسط (M)',
  'كبير (L)'
];

const customColorName = ref('');
const customColorHex = ref('#111827');
const customSizeInput = ref('');

// All rendered standard attributes displayed in the product form come from the API.
// The legacy custom sections are intentionally removed from the attributes tab.
const apiAttributesList = computed(() => attributesList.value);

const isApiAttributeSelected = (attributeName, valueLabel) => (
  Array.isArray(form.value.selectedAttributes[attributeName]) &&
  form.value.selectedAttributes[attributeName].includes(valueLabel)
);

const toggleApiAttribute = (attributeName, valueLabel) => {
  const selected = Array.isArray(form.value.selectedAttributes[attributeName])
    ? form.value.selectedAttributes[attributeName]
    : [];
  const checked = selected.includes(valueLabel);
  const next = checked
    ? selected.filter(value => value !== valueLabel)
    : Array.from(new Set([...selected, valueLabel]));

  form.value.selectedAttributes = {
    ...form.value.selectedAttributes,
    [attributeName]: next,
  };
};

const toggleColorPreset = (preset) => {
  form.value.colors = dedupeColorOptions(form.value.colors);
  const idx = form.value.colors.findIndex(c => c.label === preset.label || (c.color && c.color.toLowerCase() === preset.color.toLowerCase()));
  if (idx > -1) {
    form.value.colors.splice(idx, 1);
  } else {
    form.value.colors.push({ label: preset.label, color: preset.color });
  }
};

const isColorSelected = (preset) => {
  return (form.value.colors || []).some(c => c.label === preset.label || (c.color && c.color.toLowerCase() === preset.color.toLowerCase()));
};

const addCustomColor = () => {
  const name = customColorName.value.trim();
  const hex = customColorHex.value.trim() || '#111827';
  if (!name) {
    triggerAlert('يرجى كتابة اسم اللون', 'error');
    return;
  }
  const exists = form.value.colors.some(c => c.label.toLowerCase() === name.toLowerCase());
  if (!exists) {
    form.value.colors.push({ label: name, color: hex });
    form.value.colors = dedupeColorOptions(form.value.colors);
    customColorName.value = '';
    customColorHex.value = '#111827';
  } else {
    triggerAlert('هذا اللون مضاف بالفعل للمنتج', 'error');
  }
};

const removeColor = (idx) => {
  form.value.colors.splice(idx, 1);
};

const toggleSizePreset = (size) => {
  const idx = form.value.sizes.indexOf(size);
  if (idx > -1) {
    form.value.sizes.splice(idx, 1);
  } else {
    form.value.sizes.push(size);
  }
};

const isSizeSelected = (size) => {
  return (form.value.sizes || []).includes(size);
};

const addCustomSize = () => {
  const s = customSizeInput.value.trim();
  if (!s) return;
  if (!form.value.sizes.includes(s)) {
    form.value.sizes.push(s);
    customSizeInput.value = '';
  } else {
    triggerAlert('هذا المقاس مضاف بالفعل للمنتج', 'error');
  }
};

const removeSize = (idx) => {
  form.value.sizes.splice(idx, 1);
};

const hasColorType = (attr) => {
  return isColorAttribute(attr);
};

const addCustomAttributeValue = (attrName, defaultVal = '') => {
  if (!customAttributes.value[attrName]) customAttributes.value[attrName] = [];
  
  if (defaultVal) {
    customAttributes.value[attrName].push(defaultVal);
  } else {
    const val = customInputs.value[attrName]?.trim();
    if (val && !customAttributes.value[attrName].includes(val)) {
      customAttributes.value[attrName].push(val);
      customInputs.value[attrName] = '';
    }
  }
};

// Specifications Management
const specPresets = [
  'الارتفاع', 'العرض', 'العمق', 'السعة', 'الجهد الكهربائي', 
  'نوع الطاقة', 'المؤقت الرقمي', 'وظائف الطهي', 'نظام الإشعال', 
  'صمام الأمان', 'بلد المنشأ', 'الضمان'
];
const newSpecKey = ref('');
const newSpecVal = ref('');

const addCustomSpec = () => {
  const k = newSpecKey.value.trim();
  const v = newSpecVal.value.trim();
  if (!k) {
    triggerAlert('يرجى تحديد أو كتابة اسم المواصفة', 'error');
    return;
  }
  if (!v) {
    triggerAlert('يرجى كتابة قيمة المواصفة', 'error');
    return;
  }
  if (!Array.isArray(form.value.specs)) {
    form.value.specs = [];
  }
  const existingIdx = form.value.specs.findIndex(s => s.key === k);
  if (existingIdx > -1) {
    form.value.specs[existingIdx].value = v;
  } else {
    form.value.specs.push({ key: k, value: v });
  }
  newSpecKey.value = '';
  newSpecVal.value = '';
};

const removeSpec = (idx) => {
  if (form.value.specs && form.value.specs.length > idx) {
    form.value.specs.splice(idx, 1);
  }
};

// Modals
const showFormModal = ref(false);
const showViewModal = ref(false);
const isEdit = ref(false);
const editingId = ref(null);
const currentTab = ref('info');
const isSubmitting = ref(false);
const viewProduct = ref(null);
const currentImageIdx = ref(0);

const fileInput = ref(null);
const imagePreviews = ref([]); // new uploads
const activeLang = ref('ar');

const form = ref({
  name_ar: '',
  name_en: '',
  description_ar: '',
  description_en: '',
  price: '',
  discount: '',
  quantity: '',
  is_active: true,
  category_id: '',
  subcategory_id: '',
  features_ar: '',
  features_en: '',
  tips_ar: '',
  tips_en: '',
  shipping_info_ar: '',
  shipping_info_en: '',
  existing_images: [],
  new_images: [],
  colors: [], // Array of { label, color }
  sizes: [], // Array of strings e.g. ['60 سم', '90 سم']
  specs: [], // Array of { key, value }
  selectedAttributes: {} // structured as { attrName: [val1, val2] }
});
const subCategories = ref([]);

// Stats Computed
const overallStats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  totalSales: 0,
  isLoaded: false
});

const totalProducts = computed(() => {
  if (overallStats.value.isLoaded && overallStats.value.total > 0) {
    return overallStats.value.total;
  }
  return totalProductsCount.value;
});

const activeProductsCount = computed(() => {
  if (overallStats.value.isLoaded) {
    return overallStats.value.active;
  }
  return products.value.filter(p => p.status === 'active' || p.is_active === true || p.is_active === 1).length;
});

const inactiveProductsCount = computed(() => {
  if (overallStats.value.isLoaded) {
    return overallStats.value.inactive;
  }
  return products.value.filter(p => p.status !== 'active' && !p.is_active && p.is_active !== 1).length;
});

const totalSales = computed(() => {
  if (overallStats.value.isLoaded) {
    return overallStats.value.totalSales;
  }
  return products.value.reduce((sum, p) => sum + Number(p.sales || 0), 0);
});

// Pagination Computed
const totalPages = computed(() => Math.ceil(totalProductsCount.value / perPage.value) || 1);

// Filtering
const filteredProducts = computed(() => {
  const q = (searchQuery.value || '').toLowerCase();
  return products.value.filter(p => {
    const nameAr = (p.name_i18n?.ar || p.name || '').toString().toLowerCase();
    const nameEn = (p.name_i18n?.en || '').toString().toLowerCase();
    const sku = (p.sku || '').toString().toLowerCase();
    const matchQ = !q || nameAr.includes(q) || nameEn.includes(q) || sku.includes(q);
    const matchS = statusFilter.value ? (
      statusFilter.value === 'active' ? (p.status === 'active' || p.is_active === true || p.is_active === 1) :
      (p.status !== 'active' && !p.is_active && p.is_active !== 1)
    ) : true;
    const matchC = catFilter.value ? (p.category_id == catFilter.value || p.category === categories.value.find(c => c.id == catFilter.value)?.name) : true;
    return matchQ && matchS && matchC;
  });
});

// Watch filters and reset page to 1
watch([catFilter, statusFilter, searchQuery], () => {
  currentPage.value = 1;
  fetchProducts();
});

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

// Utils
const formatPrice = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// The dashboard API returns discount as an amount, while the product form
// edits it as a percentage. Normalize both shapes before rendering/submitting.
const normalizeDiscountPercent = (discount, price) => {
  const rawDiscount = Number(discount);
  const rawPrice = Number(price);
  if (!Number.isFinite(rawDiscount) || rawDiscount <= 0) return 0;
  if (rawDiscount > 100 && rawPrice > 0 && rawDiscount <= rawPrice) {
    return Number(((rawDiscount / rawPrice) * 100).toFixed(2));
  }
  return Math.min(rawDiscount, 100);
};

const getDiscountPercent = (product) => normalizeDiscountPercent(product?.discount, product?.price);

// Pagination
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchProducts();
};

// Fetch Data
const fetchProducts = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value
    };

    if (catFilter.value) {
      params.category_id = catFilter.value;
    }
    if (statusFilter.value) {
      params.status = statusFilter.value;
      if (statusFilter.value === 'active') params.is_active = 1;
      else if (statusFilter.value === 'inactive') params.is_active = 0;
    }
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    const res = await api.get('/dashboard/products', { params });

    const rawData = res.data.data;
    const productList = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    products.value = productList;

    const extractedTotal = res.data.meta?.total ?? 
                           res.data.total ?? 
                           (rawData && typeof rawData === 'object' && !Array.isArray(rawData) ? rawData.total : undefined) ?? 
                           res.data.stats?.total ?? 
                           res.data.summary?.total_products ?? 
                           res.data.total_products;

    if (extractedTotal !== undefined && extractedTotal !== null) {
      totalProductsCount.value = Number(extractedTotal);
    } else {
      totalProductsCount.value = productList.length;
    }
  } catch (err) {
    triggerAlert('فشل استيراد المنتجات', 'error');
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const statsRes = await api.get('/dashboard/statistics').catch(() => null);
    if (statsRes?.data?.data?.summary) {
      const s = statsRes.data.data.summary;
      if (s.total_products !== undefined || s.products_count !== undefined) {
        overallStats.value.total = Number(s.total_products ?? s.products_count ?? 0);
      }
    }

    const allRes = await api.get('/dashboard/products', { params: { per_page: 10000 } }).catch(() => null);
    if (allRes?.data) {
      const rawAll = allRes.data.data;
      const allList = Array.isArray(rawAll) ? rawAll : (rawAll?.data || []);
      const totalFromMeta = allRes.data.meta?.total ?? allRes.data.total ?? (rawAll && typeof rawAll === 'object' && !Array.isArray(rawAll) ? rawAll.total : undefined);
      
      const totalCount = totalFromMeta !== undefined && totalFromMeta !== null ? Number(totalFromMeta) : allList.length;
      const activeCount = allList.filter(p => p.status === 'active' || p.is_active === true || p.is_active === 1).length;
      const inactiveCount = totalCount > allList.length && allList.length > 0 ? (totalCount - activeCount) : allList.filter(p => p.status !== 'active' && !p.is_active && p.is_active !== 1).length;
      const salesSum = allList.reduce((sum, p) => sum + Number(p.sales || p.sales_count || p.total_sold || 0), 0);

      overallStats.value = {
        total: totalCount || overallStats.value.total,
        active: activeCount,
        inactive: inactiveCount,
        totalSales: salesSum,
        isLoaded: true
      };

      if (totalCount > 0) {
        totalProductsCount.value = totalCount;
      }
    }
  } catch (err) {
    console.error('Failed to fetch overall product stats:', err);
  }
};

const fetchDependencies = async () => {
  attributesLoading.value = true;
  attributesLoadError.value = false;
  try {
    const [cats, attrs] = await Promise.all([
      api.get('/dashboard/categories'),
      api.get('/dashboard/product-attributes')
    ]);
    categories.value = cats.data.data.filter(c => !c.parent_id);
    const allC = cats.data.data;
    categories.value.forEach(c => {
      c.subchildren = allC.filter(sc => sc.parent_id === c.id);
    });

    const rawAttributes = attrs?.data?.data ?? attrs?.data ?? [];
    const normalizedAttributes = normalizeProductAttributes(rawAttributes).filter(a => a.is_active);
    if (!normalizedAttributes.length) {
      throw new Error('Product attributes API returned an empty list.');
    }
    attributesList.value = normalizedAttributes;
  } catch (err) {
    attributesLoadError.value = true;
    console.error('Failed to fetch dependencies', err);
  } finally {
    attributesLoading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
  fetchStats();
  fetchDependencies();
});

// Category -> sub dropdown update
const updateSubcats = () => {
  const cat = categories.value.find(c => c.id === form.value.category_id);
  subCategories.value = cat ? (cat.subchildren || []) : [];
  if (!subCategories.value.find(sc => sc.id === form.value.subcategory_id)) {
    form.value.subcategory_id = '';
  }
};

// Modals Setup
const openAddModal = () => {
  if (!attributesList.value.length && !attributesLoading.value) fetchDependencies();
  isEdit.value = false;
  editingId.value = null;
  currentTab.value = 'info';
  activeLang.value = 'ar';
  imagePreviews.value = [];
  subCategories.value = [];
  customColorName.value = '';
  customColorHex.value = '#111827';
  customSizeInput.value = '';
  
  const selAttr = {};
  const custAttr = {};
  const cInputs = {};
  attributesList.value.forEach(a => { 
    selAttr[a.name] = []; 
    custAttr[a.name] = [];
    cInputs[a.name] = '';
  });

  customAttributes.value = custAttr;
  customInputs.value = cInputs;

  form.value = {
    name_ar: '', name_en: '', description_ar: '', description_en: '', price: '', discount: '', quantity: '', is_active: true,
    category_id: '', subcategory_id: '',
    features_ar: '', features_en: '',
    tips_ar: '', tips_en: '',
    shipping_info_ar: '', shipping_info_en: '',
    existing_images: [], new_images: [],
    colors: [],
    sizes: [],
    specs: [],
    selectedAttributes: selAttr
  };
  showFormModal.value = true;
};

const openEditModal = (prod) => {
  if (!attributesList.value.length && !attributesLoading.value) fetchDependencies();
  isEdit.value = true;
  editingId.value = prod.id;
  currentTab.value = 'info';
  activeLang.value = 'ar';
  imagePreviews.value = [];
  customColorName.value = '';
  customColorHex.value = '#111827';
  customSizeInput.value = '';
  
  // Find category ID
  const cat = categories.value.find(c => c.name === prod.category);
  const catId = cat ? cat.id : '';
  if (catId) {
    subCategories.value = cat.subchildren || [];
  }
  const subcatId = subCategories.value.find(sc => sc.name === prod.subcategory)?.id || '';

  const selAttr = {};
  const custAttr = {};
  const cInputs = {};
  
  // Normalize existing attributes
  const existingAttrs = prod.attributes || {};
  
  attributesList.value.forEach(a => { 
    const key = a.name;
    const values = existingAttrs[key] || [];
    const predefinedLabels = a.values ? a.values.map(v => v.label) : [];
    
    selAttr[key] = values.filter(v => predefinedLabels.includes(v));
    custAttr[key] = values.filter(v => !predefinedLabels.includes(v));
    cInputs[key] = '';
  });

  customAttributes.value = custAttr;
  customInputs.value = cInputs;

  // Extract custom technical specifications
  const extractedSpecs = [];
  Object.keys(existingAttrs).forEach(k => {
    if (['color', 'اللون', 'size', 'المقاس', 'الحجم', 'images', 'image'].includes(k)) return;
    const v = existingAttrs[k];
    const strVal = Array.isArray(v) ? v.join(' / ') : String(v || '');
    if (strVal && strVal !== 'null' && strVal.trim()) {
      extractedSpecs.push({ key: k, value: strVal.trim() });
    }
  });

  // Extract colors
  const extractedColors = [];
  const rawColors = prod.color_options || 
                    existingAttrs.color || 
                    existingAttrs['اللون'] || 
                    prod.colors || [];

  if (Array.isArray(rawColors)) {
    rawColors.forEach(c => {
      if (typeof c === 'object' && c !== null) {
        extractedColors.push({
          label: c.label || c.name || '',
          color: c.color || c.hex || getPresetColorHex(c.label || c.name) || '#111827'
        });
      } else if (typeof c === 'string' && c.trim()) {
        if (c.includes('|')) {
          const [lbl, hex] = c.split('|');
          extractedColors.push({ label: lbl.trim(), color: hex.trim() || getPresetColorHex(lbl.trim()) || '#111827' });
        } else {
          extractedColors.push({
            label: c.trim(),
            color: getPresetColorHex(c.trim()) || '#111827'
          });
        }
      }
    });
  }

  // Extract sizes
  const extractedSizes = [];
  const rawSizes = prod.size_options || 
                   existingAttrs.size || 
                   existingAttrs['المقاس'] || 
                   existingAttrs['الحجم'] || 
                   prod.sizes || [];

  if (Array.isArray(rawSizes)) {
    rawSizes.forEach(s => {
      if (typeof s === 'string' && s.trim()) {
        extractedSizes.push(s.trim());
      } else if (typeof s === 'object' && s !== null && (s.label || s.name || s.size)) {
        extractedSizes.push(s.label || s.name || s.size);
      }
    });
  }

  form.value = {
    name_ar: (prod.name_i18n && typeof prod.name_i18n === 'object' ? (prod.name_i18n.ar ?? prod.name) : prod.name) || '',
    name_en: (prod.name_i18n && typeof prod.name_i18n === 'object' ? (prod.name_i18n.en ?? '') : ''),
    description_ar: (prod.description_i18n && typeof prod.description_i18n === 'object' ? (prod.description_i18n.ar ?? prod.description) : prod.description) || '',
    description_en: (prod.description_i18n && typeof prod.description_i18n === 'object' ? (prod.description_i18n.en ?? '') : ''),
    price: prod.price,
    discount: normalizeDiscountPercent(prod.discount, prod.price),
    quantity: prod.stock,
    is_active: prod.status === 'active',
    category_id: catId,
    subcategory_id: subcatId,
    features_ar: (prod.features_i18n && typeof prod.features_i18n === 'object' ? (prod.features_i18n.ar ?? prod.features) : prod.features) || '',
    features_en: (prod.features_i18n && typeof prod.features_i18n === 'object' ? (prod.features_i18n.en ?? '') : ''),
    tips_ar: (prod.tips_i18n && typeof prod.tips_i18n === 'object' ? (prod.tips_i18n.ar ?? prod.tips) : prod.tips) || '',
    tips_en: (prod.tips_i18n && typeof prod.tips_i18n === 'object' ? (prod.tips_i18n.en ?? '') : ''),
    shipping_info_ar: (prod.shipping_info_i18n && typeof prod.shipping_info_i18n === 'object' ? (prod.shipping_info_i18n.ar ?? prod.shipping_info) : prod.shipping_info) || '',
    shipping_info_en: (prod.shipping_info_i18n && typeof prod.shipping_info_i18n === 'object' ? (prod.shipping_info_i18n.en ?? '') : ''),
    existing_images: [...(prod.images || [])],
    new_images: [],
    colors: dedupeColorOptions(extractedColors),
    sizes: extractedSizes,
    specs: extractedSpecs,
    selectedAttributes: selAttr
  };
  showFormModal.value = true;
};

const openViewModal = (prod) => {
  viewProduct.value = prod;
  currentImageIdx.value = 0;
  showViewModal.value = true;
};

const prevImage = () => {
  if (currentImageIdx.value > 0) currentImageIdx.value--;
  else currentImageIdx.value = (viewProduct.value?.images?.length || 1) - 1;
};
const nextImage = () => {
  const max = (viewProduct.value?.images?.length || 1) - 1;
  if (currentImageIdx.value < max) currentImageIdx.value++;
  else currentImageIdx.value = 0;
};

const resolveAttributeValues = (attrName, valIds) => {
  if (!Array.isArray(valIds)) return [];
  const isColor = hasColorType({ name: attrName, label: attrName });
  const attr = attributesList.value.find(a => a.name === attrName || a.label === attrName);

  return valIds.map(v => {
    if (typeof v === 'object' && v !== null) {
      const lbl = v.label || v.name || '';
      return {
        label: lbl,
        color: v.color || (isColor ? getPresetColorHex(lbl) : null)
      };
    }
    if (typeof v === 'string') {
      if (v.includes('|')) {
        const [lbl, hex] = v.split('|');
        return { label: lbl.trim(), color: hex.trim() };
      }
      const matched = attr?.values?.find(av => av.label === v);
      return {
        label: v.trim(),
        color: matched?.color || (isColor ? getPresetColorHex(v.trim()) : null)
      };
    }
    return { label: String(v), color: null };
  });
};

const closeModal = () => {
  showFormModal.value = false;
};

// Images Uploader
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  const currentTotal = form.value.existing_images.length + form.value.new_images.length;
  
  if (currentTotal + files.length > maxImages) {
    triggerAlert(`يُسمح بـ ${maxImages} صورة كحد أقصى للمنتج الواحد`, 'error');
    const allowedCount = maxImages - currentTotal;
    if (allowedCount > 0) {
      files.slice(0, allowedCount).forEach(file => {
        form.value.new_images.push(file);
        imagePreviews.value.push({ file, preview: URL.createObjectURL(file) });
      });
    }
  } else {
    files.forEach(file => {
      form.value.new_images.push(file);
      imagePreviews.value.push({ file, preview: URL.createObjectURL(file) });
    });
  }
  e.target.value = null; // reset
};

const removeExistingImage = (idx) => {
  form.value.existing_images.splice(idx, 1);
};
const removeNewImage = (idx) => {
  form.value.new_images.splice(idx, 1);
  imagePreviews.value.splice(idx, 1);
};

const setPrimaryExistingImage = (idx) => {
  if (idx > 0 && idx < form.value.existing_images.length) {
    const item = form.value.existing_images.splice(idx, 1)[0];
    form.value.existing_images.unshift(item);
  }
};

const setPrimaryNewImage = (idx) => {
  if (idx >= 0 && idx < form.value.new_images.length) {
    const file = form.value.new_images.splice(idx, 1)[0];
    const preview = imagePreviews.value.splice(idx, 1)[0];
    // If existing images exist, unshift to new_images
    form.value.new_images.unshift(file);
    imagePreviews.value.unshift(preview);
  }
};

const handleAttrCheckbox = (attrName, valId, e) => {
  const arr = form.value.selectedAttributes[attrName];
  if (!Array.isArray(arr)) { form.value.selectedAttributes[attrName] = []; }
};

// Form Submission
const submitForm = async () => {
  if (!String(form.value.name_ar || '').trim()) {
    activeLang.value = 'ar';
    triggerAlert('اسم المنتج بالعربي مطلوب', 'error');
    return;
  }
  if (!String(form.value.name_en || '').trim()) {
    activeLang.value = 'en';
    triggerAlert('اسم المنتج بالإنجليزية مطلوب', 'error');
    return;
  }

  isSubmitting.value = true;
  
  const fd = new FormData();
  fd.append('name', JSON.stringify({ ar: form.value.name_ar || '', en: form.value.name_en || '' }));
  fd.append('price', form.value.price);
  fd.append('quantity', form.value.quantity);
  fd.append('is_active', form.value.is_active ? 1 : 0);
  
  if (form.value.category_id) fd.append('category_id', form.value.category_id);
  if (form.value.subcategory_id) fd.append('subcategory_id', form.value.subcategory_id);
  
  fd.append('description', JSON.stringify({ ar: form.value.description_ar || '', en: form.value.description_en || '' }));
  fd.append('discount', form.value.discount || 0);
  fd.append('features', JSON.stringify({ ar: form.value.features_ar || '', en: form.value.features_en || '' }));
  fd.append('tips', JSON.stringify({ ar: form.value.tips_ar || '', en: form.value.tips_en || '' }));
  fd.append('shipping_info', JSON.stringify({ ar: form.value.shipping_info_ar || '', en: form.value.shipping_info_en || '' }));

  // Merge attributes
  const finalAttributes = {};
  const normalizedColors = dedupeColorOptions(form.value.colors || []);
  const colorAttribute = attributesList.value.find(attribute => isColorAttribute(attribute));
  const canonicalColorKey = colorAttribute?.name || 'color';
  const selectedColorValues = Object.entries(form.value.selectedAttributes || {})
    .filter(([key]) => isColorAttribute({ name: key, label: key }))
    .flatMap(([, values]) => Array.isArray(values) ? values : []);
  const selectedColors = selectedColorValues.map(value => {
    const raw = value && typeof value === 'object'
      ? (value.label || value.name || value.value || '')
      : String(value || '');
    const [label, inlineColor] = raw.split('|', 2);
    const matched = colorAttribute?.values?.find(item => item.label === label.trim());
    return {
      label: label.trim(),
      color: inlineColor?.trim() || matched?.color || getPresetColorHex(label.trim()) || '#111827',
    };
  });
  const payloadColors = dedupeColorOptions(normalizedColors.length > 0 ? normalizedColors : selectedColors);

  // 1. Color Options
  if (payloadColors.length > 0) {
    finalAttributes[canonicalColorKey] = payloadColors.map(c => `${c.label}|${c.color}`);
  }

  // 2. Size Options
  if (form.value.sizes && form.value.sizes.length > 0) {
    finalAttributes['size'] = [...form.value.sizes];
    finalAttributes['المقاس'] = [...form.value.sizes];
  }

  // 3. Other attributes
  Object.keys(form.value.selectedAttributes).forEach(key => {
    if (isColorAttribute({ name: key, label: key }) || ['size', 'المقاس', 'الحجم'].includes(key)) return;
    const combined = [
      ...(form.value.selectedAttributes[key] || []),
      ...(customAttributes.value[key] || [])
    ];
    if (combined.length > 0) {
      finalAttributes[key] = Array.from(new Set(combined));
    }
  });
  fd.append('attributes', JSON.stringify(finalAttributes));
  fd.append('color_options', JSON.stringify(payloadColors));
  fd.append('size_options', JSON.stringify(form.value.sizes || []));

  // Images
  form.value.existing_images.forEach(img => { fd.append('existing_images[]', img); });
  form.value.new_images.forEach(img => { fd.append('images[]', img); });

  // Main image fallback if new
  if (form.value.new_images.length > 0 && form.value.existing_images.length === 0) {
    fd.append('image', form.value.new_images[0]);
  }

  try {
    if (isEdit.value) {
      fd.append('_method', 'PUT');
      await api.post(`/dashboard/products/${editingId.value}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      triggerAlert('تم تحديث المنتج بنجاح');
    } else {
      await api.post('/dashboard/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      triggerAlert('تم إضافة المنتج بنجاح');
    }
    closeModal();
    fetchProducts();
    fetchStats();
  } catch (error) {
    const msg = error.response?.data?.message || 'حدث خطأ يرجى تعبئة الحقول المطلوبة';
    triggerAlert(msg, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = async (prod) => {
  if (confirm(`تأكيد حذف المنتج "${prod.name_i18n?.ar || prod.name}"؟`)) {
    try {
      await api.delete(`/dashboard/products/${prod.id}`);
      triggerAlert('تم الحذف بنجاح');
      fetchProducts();
      fetchStats();
    } catch (err) {
      triggerAlert('فشل عملية الحذف', 'error');
    }
  }
};

</script>

<style scoped>
.products-page {
  display: flex; flex-direction: column; gap: 1.5rem; direction: rtl; font-family: 'IBM Plex Sans Arabic', sans-serif; padding-bottom: 2rem;
}

/* Page Header */
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 1.4rem; font-weight: 800; color: #111827; margin-bottom: 0.2rem; }
.page-subtitle { font-size: 0.85rem; color: #6b7280; }
.add-btn {
  display: inline-flex; align-items: center; gap: 6px; background: #000000; color: #fff; border: 1px solid #000000; padding: 6px 14px; border-radius: 6px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; font-size: 0.82rem; cursor: pointer; transition: all 0.2s; width: fit-content;
}
.add-btn:hover { background: #262626; border-color: #262626; }

/* Stats Cards */
.stats-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.stat-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem; display: flex; align-items: center; justify-content: flex-end; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); flex-direction: row-reverse;
}
.stat-info { display: flex; flex-direction: column; align-items: flex-start; flex: 1; }
.stat-label { font-size: 0.75rem; font-weight: 700; color: #6b7280; }
.stat-value { font-size: 1.5rem; font-weight: 800; color: #1f2937; margin-top: 0.2rem; }
.stat-icon-wrapper { width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.active-icon { background: #fdf2f8; color: #db2777; }
.empty-icon { background: #fee2e2; color: #dc2626; }
.total-icon { background: #ecfdf5; color: #059669; }
.main-icon { background: #fefce8; color: #ca8a04; }

/* Filters */
.filters-row { display: flex; gap: 1rem; align-items: center; }
.search-box { flex: 1; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; right: 1rem; color: #9ca3af; }
.search-input { width: 100%; padding: 0.7rem 2.8rem 0.7rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; outline: none; background: #fff; transition: border-color 0.2s; }
.search-input:focus { border-color: #873260; }
.filter-select { position: relative; display: flex; align-items: center; min-width: 150px; }
.form-select { width: 100%; padding: 0.7rem 1rem 0.7rem 2.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #374151; appearance: none; outline: none; cursor: pointer; }
.filter-select .select-icon { position: absolute; left: 1rem; color: #9ca3af; pointer-events: none; }

/* Table */
.table-container { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.data-table th { background: #f9fafb; font-size: 0.75rem; font-weight: 700; color: #6b7280; white-space: nowrap; }
.data-table td { font-size: 0.85rem; color: #374151; }
.data-table tr:last-child td { border-bottom: none; }
.data-row:hover td { background: #fdfafb; }
.state-row td { text-align: center; color: #6b7280; padding: 2.5rem; }

/* Columns */
.col-name { text-align: right; width: 35%; }
.col-price { text-align: center; width: 15%; }
.col-stock { text-align: center; width: 10%; }
.col-sales { text-align: center; width: 15%; }
.col-status { text-align: center; width: 10%; }
.col-actions { text-align: left; width: 15%; padding-left: 1.5rem !important; }
.data-table th.col-actions, .data-table th.col-status, .data-table th.col-stock, .data-table th.col-price, .data-table th.col-sales { text-align: center; }
.data-table th.col-actions { text-align: right; }

.prod-name-cell { display: flex; align-items: center; gap: 0.85rem; }
.prod-image { width: 40px; height: 40px; border-radius: 6px; overflow: hidden; background: #f3f4f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid #e5e7eb; }
.prod-image img { width: 100%; height: 100%; object-fit: cover; }
.prod-details { display: flex; flex-direction: column; align-items: flex-start; }
.prod-title { font-weight: 700; color: #111827; font-size: 0.85rem; line-height: 1.3; margin-bottom: 0.2rem; }
.prod-cat-badge { background: #fdf2f8; color: #db2777; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.65rem; font-weight: 600; }

.price-cell { display: flex; flex-direction: column; align-items: center; }
.current-price { font-weight: 800; color: #059669; }
.old-price { font-size: 0.7rem; color: #9ca3af; text-decoration: line-through; }

.stock-badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 700; font-size: 0.75rem; }
.in-stock { color: #374151; }
.out-of-stock { color: #dc2626; background: #fee2e2; }

.sales-count { font-weight: 700; color: #374151; display: inline-flex; align-items: center; gap: 0.2rem; }
.sales-count svg { color: #10b981; }

.status-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
.status-badge.active { background: #ecfdf5; color: #059669; }
.status-badge.inactive { background: #fef2f2; color: #dc2626; }

.actions-group { display: flex; align-items: center; justify-content: flex-start; gap: 0.4rem; }
.action-btn { width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #9ca3af; transition: all 0.2s; }
.action-btn:hover { background: #f3f4f6; }
.delete-btn:hover { color: #dc2626; background: #fef2f2; }
.edit-btn:hover { color: #2563eb; background: #eff6ff; }
.view-btn:hover { color: #059669; background: #ecfdf5; }


/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
.modal-content { background: #fff; border-radius: 12px; width: 100%; max-width: 600px; padding: 2rem; position: relative; max-height: 90vh; overflow-y: auto; }
.form-content { max-width: 700px; }
.modal-close { position: absolute; top: 1.2rem; left: 1.2rem; background: none; border: none; color: #9ca3af; cursor: pointer; transition: color 0.2s; }
.modal-close:hover { color: #111827; }
.modal-title { font-size: 1.2rem; font-weight: 800; color: #111827; text-align: center; margin-bottom: 0.2rem; }
.modal-subtitle { font-size: 0.8rem; color: #6b7280; text-align: center; margin-bottom: 1.5rem; }

.i18n-toggle { display: inline-flex; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; margin: 0.75rem auto 1.25rem; }
.i18n-btn { border: none; background: transparent; padding: 0.4rem 0.9rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; color: #6b7280; min-width: 96px; }
.i18n-btn.active { background: #873260; color: #fff; }

/* Tabs */
.modal-tabs { display: flex; gap: 1rem; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.5rem; justify-content: center; }
.tab-btn { background: none; border: none; color: #6b7280; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; font-size: 0.9rem; padding: 0.6rem 1rem; cursor: pointer; position: relative; }
.tab-btn.active { color: #873260; }
.tab-btn.active::after { content:''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #873260; }
.tab-pane { animation: fadeIn 0.3s; }
.attributes-tab-pane { display: flex; flex-direction: column; }
.attributes-tab-pane > .variant-section-card { order: 1; }
.attributes-tab-pane > .api-attributes-section { order: 0; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Form Fields */
.form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
.half-width { flex: 1; }
.form-group { margin-bottom: 1rem; }
.form-label { display: block; font-size: 0.8rem; font-weight: 700; color: #374151; margin-bottom: 0.4rem; text-align: right; }
.req { color: #dc2626; }
.form-control { width: 100%; padding: 0.65rem 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #1f2937; outline: none; transition: border-color 0.2s; text-align: right; }
.no-rtl-issue { direction: ltr; text-align: right; }
.form-control:focus { border-color: #873260; }

.select-wrapper { position: relative; display: flex; align-items: center; }
.select-wrapper .form-control { appearance: none; padding-left: 2rem; cursor: pointer; }
.select-wrapper .select-icon { position: absolute; left: 0.8rem; color: #9ca3af; pointer-events: none; }

/* Fake Toolbar */
.rich-textarea-mock { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.rich-textarea-mock:focus-within { border-color: #873260; }
.rt-toolbar { padding: 0.4rem 0.8rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; gap: 0.5rem; }
.rt-icon { font-weight: 700; font-size: 0.8rem; color: #6b7280; cursor: pointer; padding: 0.1rem 0.3rem; border-radius: 3px; }
.rt-icon:hover { background: #e5e7eb; }
.rt-body { border: none !important; border-radius: 0 !important; resize: vertical; min-height: 80px; }
.rt-body:focus { outline: none; box-shadow: none; border: none; }

/* Image Uploader */
.image-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
.images-count-badge { font-size: 0.75rem; font-weight: 700; color: #873260; background: #fdf2f8; padding: 0.2rem 0.6rem; border-radius: 12px; }
.image-uploader { display: flex; flex-direction: column; gap: 0.8rem; }
.upload-box {
  border: 1.5px dashed #d1d5db; border-radius: 10px; padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; background: #fafafa;
}
.upload-box:hover { border-color: #873260; background: #fdf2f8; }
.hidden-input { display: none; }
.upload-box p { font-size: 0.85rem; font-weight: 600; color: #374151; margin: 0.5rem 0 0; }
.upload-box span { font-size: 0.75rem; color: #9ca3af; }
.preview-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem; }
.preview-item { width: 90px; height: 90px; border-radius: 8px; border: 1.5px solid #e5e7eb; position: relative; overflow: hidden; background: #f9fafb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.preview-item img { width: 100%; height: 100%; object-fit: cover; }
.primary-tag-badge {
  position: absolute; bottom: 0; left: 0; right: 0; background: #873260; color: #fff; font-size: 0.65rem; font-weight: 700; text-align: center; padding: 2px 0; letter-spacing: 0.5px;
}
.set-primary-btn {
  position: absolute; bottom: 0; left: 0; right: 0; background: rgba(17, 24, 39, 0.85); color: #fff; font-size: 0.6rem; font-weight: 700; border: none; padding: 3px 0; cursor: pointer; transition: background 0.2s; text-align: center;
}
.set-primary-btn:hover { background: #873260; }
.remove-img-btn {
  position: absolute; top: 3px; left: 3px; background: rgba(0,0,0,0.6); color: #fff; width: 20px; height: 20px; border-radius: 50%; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: background 0.2s; z-index: 2;
}
.remove-img-btn:hover { background: #dc2626; }

.multi-img-badge {
  position: absolute; bottom: 2px; right: 2px; background: rgba(17, 24, 39, 0.85); color: #fff; font-size: 0.6rem; font-weight: 800; padding: 1px 4px; border-radius: 4px; line-height: 1.2;
}

/* Variant & Attribute Management Cards */
.variant-section-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.variant-section-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.2rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.8rem; }
.variant-icon-wrapper { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.color-icon-bg { background: #fdf2f8; color: #db2777; }
.size-icon-bg { background: #eff6ff; color: #2563eb; }
.other-icon-bg { background: #f5f3ff; color: #7c3aed; }
.variant-section-title { font-size: 0.95rem; font-weight: 800; color: #111827; margin: 0 0 0.2rem 0; }
.variant-section-desc { font-size: 0.75rem; color: #6b7280; margin: 0; }

.presets-block { margin-bottom: 1rem; }
.presets-label { display: block; font-size: 0.78rem; font-weight: 700; color: #4b5563; margin-bottom: 0.5rem; text-align: right; }
.color-presets-row, .size-presets-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.color-preset-pill {
  display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.75rem; border: 1.5px solid #e5e7eb; border-radius: 20px; background: #fff; font-size: 0.8rem; font-weight: 700; color: #374151; cursor: pointer; transition: all 0.2s; font-family: 'IBM Plex Sans Arabic', sans-serif;
}
.color-preset-pill:hover { border-color: #873260; color: #873260; background: #fdfafb; }
.color-preset-pill.active { border-color: #873260; background: #fdf2f8; color: #873260; box-shadow: 0 0 0 1px #873260; }
.preset-dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; }
.dot-white { border: 1px solid #d1d5db; }
.preset-check { font-size: 0.75rem; font-weight: 800; color: #873260; margin-right: 0.2rem; }

.custom-variant-box { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 0.9rem; margin-bottom: 1rem; }
.color-custom-row, .size-custom-row { display: flex; gap: 0.6rem; align-items: center; }
.custom-color-name, .custom-size-input { flex: 1; }
.color-picker-input-box { display: flex; align-items: center; gap: 0.4rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.25rem 0.5rem; height: 38px; }
.native-color-picker { width: 28px; height: 28px; border: none; background: none; cursor: pointer; padding: 0; border-radius: 4px; }
.custom-color-hex { width: 80px; border: none; font-family: monospace; font-size: 0.8rem; font-weight: 700; padding: 0; }
.custom-color-hex:focus { border: none; box-shadow: none; }
.btn-add-variant {
  background: #000000; color: #fff; border: 1px solid #000000; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background 0.2s; font-family: 'IBM Plex Sans Arabic', sans-serif;
}
.btn-add-variant:hover { background: #262626; border-color: #262626; }

.selected-items-block { border-top: 1px dashed #e5e7eb; padding-top: 0.8rem; margin-top: 0.5rem; }
.selected-colors-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.color-chip-card {
  display: inline-flex; align-items: center; gap: 0.5rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.35rem 0.6rem; box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.chip-swatch { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; }
.chip-light { border: 1px solid #cbd5e1; }
.chip-info { display: flex; flex-direction: column; align-items: flex-start; }
.chip-name { font-size: 0.8rem; font-weight: 700; color: #1f2937; line-height: 1.2; }
.chip-hex { font-size: 0.65rem; color: #9ca3af; font-family: monospace; }
.chip-del-btn { background: none; border: none; color: #9ca3af; font-size: 0.75rem; cursor: pointer; padding: 0 0 0 0.3rem; line-height: 1; transition: color 0.15s; }
.chip-del-btn:hover { color: #dc2626; }

.size-preset-pill {
  display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.85rem; border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 0.8rem; font-weight: 700; color: #374151; cursor: pointer; transition: all 0.2s; font-family: 'IBM Plex Sans Arabic', sans-serif;
}
.size-preset-pill:active { border-color: #000000; background: #f3f4f6; color: #000000; box-shadow: 0 0 0 1px #000000; }

/* Technical Specs Admin Styles */
.specs-presets-row { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.8rem; }
.spec-preset-pill {
  display: inline-flex; align-items: center; padding: 0.35rem 0.75rem; border: 1.5px solid #e5e7eb; border-radius: 6px; background: #fff; font-size: 0.8rem; font-weight: 700; color: #374151; cursor: pointer; transition: all 0.2s; font-family: 'IBM Plex Sans Arabic', sans-serif;
}
.spec-preset-pill:hover { border-color: #000000; color: #000000; background: #f9fafb; }

.add-spec-row { display: flex; gap: 0.6rem; align-items: center; margin-bottom: 1rem; }
.btn-add-spec {
  background: #000000; color: #fff; border: 1px solid #000000; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background 0.2s; font-family: 'IBM Plex Sans Arabic', sans-serif;
}
.btn-add-spec:hover { background: #262626; border-color: #262626; }

.specs-table-wrapper { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-top: 0.5rem; margin-bottom: 1rem; }
.specs-admin-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: right; }
.specs-admin-table th { background: #f9fafb; padding: 0.55rem 0.8rem; font-weight: 700; color: #4b5563; border-bottom: 1px solid #e5e7eb; }
.specs-admin-table td { padding: 0.55rem 0.8rem; border-bottom: 1px solid #f3f4f6; color: #1f2937; }
.specs-admin-table tr:last-child td { border-bottom: none; }

.selected-sizes-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.size-chip-card {
  display: inline-flex; align-items: center; gap: 0.5rem; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.35rem 0.65rem;
}
.size-chip-text { font-size: 0.8rem; font-weight: 700; color: #1f2937; }

.empty-variants-hint {
  font-size: 0.78rem; color: #9ca3af; font-style: italic; background: #f9fafb; padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px dashed #e5e7eb;
}
.attributes-state-card {
  display: flex; align-items: center; justify-content: center; gap: 0.75rem; min-height: 120px; padding: 1rem; border: 1px dashed #d1d5db; border-radius: 10px; background: #f9fafb; color: #6b7280; font-size: 0.85rem; font-weight: 700;
}
.attributes-state-card.error { flex-direction: column; color: #b91c1c; background: #fff7f7; border-color: #fecaca; }
.attributes-retry-btn { background: #000; color: #fff; border: 0; border-radius: 6px; padding: 0.45rem 0.9rem; cursor: pointer; font-family: inherit; font-weight: 700; }

.other-attrs-list { display: flex; flex-direction: column; gap: 0.8rem; }
.other-attr-row { background: #f9fafb; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #f3f4f6; }
.other-attr-label { font-size: 0.8rem; font-weight: 800; color: #374151; display: block; margin-bottom: 0.4rem; }
.text-muted-xs { font-size: 0.75rem; color: #9ca3af; }
.attr-values-list { display: flex; flex-wrap: wrap; gap: 0.8rem; }
.attr-val-checkbox { display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; position: relative; border: 0; padding: 0; background: transparent; font-family: inherit; }
.checkmark { width: 16px; height: 16px; border: 1px solid #d1d5db; border-radius: 4px; display: inline-block; position: relative; background: #fff; transition: all 0.2s; }
.checkmark.active { background: #000000; border-color: #000000; }
.api-attribute-color-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid rgba(17, 24, 39, 0.15); flex: 0 0 auto; }
.checkmark.active::after { content: ''; position: absolute; display: block; left: 4px; top: 1px; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.val-text { font-size: 0.85rem; font-weight: 600; color: #374151; }
.color-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; border: 1px solid rgba(0,0,0,0.1); }


.form-actions { margin-top: 2rem; display: flex; justify-content: center; }
.btn-submit { background: #000000; color: #fff; border: 1px solid #000000; padding: 0.65rem 2.5rem; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: background 0.2s; width: fit-content; }
.btn-submit:hover:not(:disabled) { background: #262626; border-color: #262626; }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

/* View Details Modal */
.view-content { max-width: 500px; }
.no-padding-top { padding-top: 0 !important; overflow-x: hidden; overflow-y: auto; }
.floating-close { top: 1rem; left: 1rem; background: rgba(0,0,0,0.4); color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; z-index: 10; border: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.floating-close:hover { background: rgba(0,0,0,0.6); color: white; }

.view-image-slider { position: relative; width: calc(100% + 4rem); margin: 0 -2rem 1rem -2rem; height: 350px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.view-main-image { width: 100%; height: 100%; object-fit: cover; }
.view-main-image-placeholder { color: #9ca3af; font-size: 0.9rem; font-weight: 600; }
.slider-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; z-index: 2; font-size: 1rem; }
.slider-btn:hover { background: rgba(0,0,0,0.8); }
.prev-btn { left: 1rem; }
.next-btn { right: 1rem; }
.image-indicator { position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); color: white; padding: 0.25rem 0.7rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; letter-spacing: 1px; backdrop-filter: blur(4px); }

.view-thumbnails { display: flex; gap: 0.6rem; justify-content: center; margin-bottom: 1.5rem; }
.thumb-img { width: 45px; height: 45px; border-radius: 6px; object-fit: cover; cursor: pointer; border: 2px solid transparent; opacity: 0.5; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.thumb-img.active { border-color: #873260; opacity: 1; transform: scale(1.05); }
.thumb-img:hover { opacity: 1; }

.view-body-wrapper { padding: 0 0 0.5rem 0; }
.view-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; gap: 1rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 1.25rem; }
.view-title { font-size: 1.3rem; font-weight: 800; color: #111827; margin: 0 0 0.4rem 0; line-height: 1.3; }
.view-subtitle { font-size: 0.85rem; font-weight: 700; color: #db2777; margin: 0; }
.view-status-badge { padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; display: inline-block; }
.view-status-badge.active { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.view-status-badge.inactive { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.view-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.8rem; margin-bottom: 1.5rem; }
.v-stat-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.8rem 0.5rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); text-align: center; }
.v-stat-label { font-size: 0.7rem; color: #6b7280; font-weight: 700; margin-bottom: 0.4rem; }
.v-stat-value { font-size: 1rem; font-weight: 800; color: #1f2937; }
.green-text { color: #059669; font-size: 1.1rem; }
.px-badge { background: #fdf2f8; color: #db2777; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.85rem; }

.view-sections { display: flex; flex-direction: column; gap: 0.6rem; border-top: 1px solid #f3f4f6; margin-bottom: 1.5rem; padding-top: 1.2rem;}
.v-section { background: #f9fafb; padding: 1.25rem; border-radius: 8px; border: 1px solid #f3f4f6; }
.v-section-title { font-size: 0.85rem; font-weight: 800; color: #111827; margin: 0 0 0.8rem 0; }
.v-section-content { font-size: 0.85rem; color: #4b5563; line-height: 1.7; font-weight: 500; }
.v-feature-list { list-style: none; padding: 0; margin: 0; }
.v-feature-list li { position: relative; padding-left: 1.2rem; margin-bottom: 0.4rem; font-size: 0.85rem; color: #4b5563; }
.v-feature-list li::before { content: '•'; position: absolute; left: 0; color: #873260; font-weight: 700; }

.v-attr-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: flex-start; margin-bottom: 0.6rem; }
.v-attr-key { font-weight: 700; color: #374151; font-size: 0.85rem; }
.v-attr-vals { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.v-attr-chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.6rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.8rem; font-weight: 600; color: #374151; }
.v-val-text { color: #374151; }

/* Pagination */
.pagination-container { display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; padding: 0.75rem 1rem; background: #fff; border-radius: 10px; border: 1px solid #e5e7eb; }
.pagination-info { font-size: 0.85rem; color: #6b7280; font-weight: 600; }
.pagination-controls { display: flex; align-items: center; gap: 0.4rem; }
.pagination-btn { width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; font-weight: 600; color: #374151; cursor: pointer; transition: all 0.2s; }
.pagination-btn:hover:not(:disabled) { background: #873260; color: #fff; border-color: #873260; }
.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pagination-pages { display: flex; gap: 0.3rem; }
.pagination-page-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; font-weight: 600; font-size: 0.85rem; color: #374151; cursor: pointer; transition: all 0.2s; }
.pagination-page-btn:hover { background: #f3f4f6; }
.pagination-page-btn.active { background: #873260; color: #fff; border-color: #873260; }


.v-attr-row { display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.8rem; }
.v-attr-row:last-child { margin-bottom: 0; }
.v-attr-key { font-weight: 700; color: #111827; min-width: 80px; font-size: 0.8rem; padding-top: 0.2rem; }
.v-attr-vals { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.v-attr-chip { background: #fff; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: #374151; display: inline-flex; align-items: center; gap: 0.4rem; border: 1px solid #e5e7eb; }

/* Custom Attribute Helpers */
.flex-row-center { display: flex; align-items: center; }
.gap-2 { gap: 0.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mb-2 { margin-bottom: 0.5rem; }
.custom-chips-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.custom-val-chip { background: #f3f4f6; color: #374151; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem; }
.custom-val-chip button { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 0.7rem; padding: 0; line-height: 1; }
.custom-val-chip button:hover { color: #dc2626; }

.view-footer-actions { display: flex; gap: 1rem; justify-content: space-between; border-top: 1px solid #f3f4f6; padding-top: 1.5rem; }
.view-footer-actions button { flex: 1; padding: 0.75rem; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.btn-cancel { background: #f3f4f6; color: #374151; border: none; }
.btn-cancel:hover { background: #e5e7eb; color: #111827; }
.btn-outline-edit { background: #fff; border: 1px solid #873260; color: #873260; }
.btn-outline-edit:hover { background: #fdf2f8; }

/* Alert */
.alert-toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%) translateY(100px); padding: 0.75rem 1.5rem; border-radius: 30px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-family: 'IBM Plex Sans Arabic', sans-serif; }
.alert-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
.alert-toast.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.alert-toast.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.alert-icon { flex-shrink: 0; }
</style>
