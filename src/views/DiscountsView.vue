<template>
  <div class="discounts-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-titles">
        <div class="title-with-icon">
          <h2 class="page-title">العروض والخصومات</h2>
          <div class="tag-icon-wrapper">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
             </svg>
          </div>
        </div>
        <p class="page-subtitle">إنشاء وإدارة العروض الترويجية</p>
      </div>
      <button class="add-btn" @click="openAddModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        إنشاء عرض جديد
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper pink">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي العروض</span>
          <h3 class="stat-value">{{ offers.length }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">العروض النشطة</span>
          <h3 class="stat-value">{{ activeOffersCount }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper gray">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">المنتهية</span>
          <h3 class="stat-value">{{ expiredOffersCount }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20V14"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي الاستخدام</span>
          <h3 class="stat-value">{{ totalUsageCount }}</h3>
        </div>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="filters-row">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="search-icon">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" v-model="searchQuery" placeholder="البحث باسم العرض أو الكود..." class="search-input" />
      </div>
      
      <div class="filter-select">
        <select v-model="typeFilter" class="form-select">
          <option value="">كل العروض</option>
          <option value="percentage">نسبة مئوية</option>
          <option value="fixed">قيمة ثابتة</option>
          <option value="buy_x_get_y">اشتري X واحصل على Y</option>
          <option value="free_shipping">شحن مجاني</option>
        </select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="select-icon" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      <div class="filter-select">
        <select v-model="statusFilter" class="form-select">
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="paused">متوقف</option>
          <option value="expired">منتهي</option>
          <option value="scheduled">مجدول</option>
        </select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="select-icon" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      <div class="date-comp">
        <input type="date" v-model="startDateFilter" class="date-input" placeholder="من تاريخ" title="من تاريخ" />
      </div>
      <div class="date-comp">
        <input type="date" v-model="endDateFilter" class="date-input" placeholder="إلى تاريخ" title="إلى تاريخ" />
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-name text-right">اسم العرض</th>
            <th class="col-type">النوع</th>
            <th class="col-value">قيمة الخصم</th>
            <th class="col-code">كود الخصم</th>
            <th class="col-start">تاريخ البداية</th>
            <th class="col-end">تاريخ النهاية</th>
            <th class="col-used">استخدم</th>
            <th class="col-status">الحالة</th>
            <th class="col-actions">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="state-row"><td colspan="9">جاري التحميل...</td></tr>
          <tr v-else-if="filteredOffers.length === 0" class="state-row"><td colspan="9">لا توجد عروض مطابقة</td></tr>
          <template v-else>
            <tr v-for="offer in filteredOffers" :key="offer.id" class="data-row">
              <td class="col-name text-right">
                <span class="offer-name">{{ offer.name_i18n?.ar || offer.name }}</span>
              </td>
              <td class="col-type">
                {{ formatType(offer.type) }}
              </td>
              <td class="col-value font-bold" :class="offer.type === 'percentage' ? 'text-pink' : 'text-blue'">
                {{ formatValue(offer) }}
              </td>
              <td class="col-code">
                <div class="code-badge" v-if="offer.code">
                  {{ offer.code }}
                  <button class="copy-tiny" @click.stop="copyText(offer.code)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                  </button>
                </div>
                <span v-else>-</span>
              </td>
              <td class="col-start">{{ formatDate(offer.start_date) }}</td>
              <td class="col-end">{{ formatDate(offer.end_date) }}</td>
              <td class="col-used">
                <div class="usage-text">{{ offer.total_uses || 0 }} / {{ offer.max_uses || '∞' }}</div>
                <div class="usage-bar-bg">
                  <div class="usage-bar-fill" :style="{ width: offer.usage_percentage + '%' }"></div>
                </div>
              </td>
              <td class="col-status">
                <div class="status-toggle-wrapper">
                    <label class="table-switch">
                        <input type="checkbox" :checked="offer.is_active" @change="toggleOfferStatus(offer)" hidden>
                        <div class="ts-slider" :class="{ on: offer.is_active }">
                            <div class="ts-knob"></div>
                        </div>
                    </label>
                    <span :class="['status-badge-table', offer.status]">
                    {{ formatStatus(offer.status) }}
                    </span>
                </div>
              </td>
              <td class="col-actions">
                <div class="actions-group">
                   <button class="action-btn delete-btn" @click="confirmDelete(offer)" title="حذف">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                  <button class="action-btn copy-btn-action" @click="duplicateOffer(offer)" title="تكرار">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                  <button class="action-btn view-btn" @click="openViewModal(offer)" title="عرض">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button class="action-btn edit-btn" @click="openEditModal(offer)" title="تعديل">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination placeholder -->
    <div class="pagination-footer" v-if="totalOffersCount > perPage">
       <span class="results-text">عرض {{ (currentPage - 1) * perPage + 1 }} - {{ Math.min(currentPage * perPage, totalOffersCount) }} من {{ totalOffersCount }} عرض</span>
       <div class="pagination-btns">
         <button class="p-btn prev" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
         </button>
         <button v-for="page in totalPages" :key="page" class="p-btn" :class="{ active: currentPage === page }" @click="goToPage(page)">
           {{ page }}
         </button>
         <button class="p-btn next" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
         </button>
       </div>
    </div>

    <!-- Add/Edit Modal (Figma Inspired) -->
    <div class="modal-overlay" v-if="showFormModal" @click.self="showFormModal = false">
      <div class="modal-content form-content">
        <button class="modal-close" @click="showFormModal = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="form-header">
            <div class="header-icon-main">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </div>
            <h3 class="modal-title-main">{{ isEdit ? 'تعديل العرض' : 'إنشاء عرض جديد' }}</h3>
            <p class="modal-subtitle-main">أدخل تفاصيل العرض الترويجي الجديد</p>
        </div>

        <form @submit.prevent="submitForm" class="offer-form">
            <div class="form-section">
                <label class="form-label">صورة العرض <span class="req">*</span></label>
                <div class="upload-wrapper" @click="fileInputRef?.click()">
                    <input type="file" ref="fileInputRef" @change="handleImageUpload" accept="image/*" hidden />
                    <div class="upload-box">
                        <img v-if="imagePreview" :src="imagePreview" class="preview-image" alt="Preview" />
                        <div v-else class="upload-placeholder">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <p>انقر لرفع صورة العرض</p>
                            <span>الحد الأقصى 1 ميجابايت</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="i18n-toggle" role="tablist" aria-label="Language">
                  <button type="button" class="i18n-btn" :class="{ active: activeLang === 'en' }" @click="activeLang = 'en'">English</button>
                  <button type="button" class="i18n-btn" :class="{ active: activeLang === 'ar' }" @click="activeLang = 'ar'">العربية</button>
                </div>

                <label class="form-label">اسم العرض <span class="req">*</span></label>
                <input v-show="activeLang === 'ar'" type="text" v-model="form.name_ar" class="form-control" placeholder="مثلاً: خصم الربيع الكبير" />
                <input v-show="activeLang === 'en'" type="text" v-model="form.name_en" class="form-control" placeholder="Offer name in English" />
            </div>

            <div class="form-section">
                <label class="form-label">وصف العرض (اختياري)</label>
                <textarea v-show="activeLang === 'ar'" v-model="form.description_ar" class="form-control" placeholder="وصف قصير للعرض بالعربي..." rows="3"></textarea>
                <textarea v-show="activeLang === 'en'" v-model="form.description_en" class="form-control" placeholder="Short offer description in English..." rows="3"></textarea>
            </div>

            <div class="form-section">
                <label class="form-label">نوع العرض <span class="req">*</span></label>
                <div class="type-cards-grid">
                    <div class="type-card" :class="{ active: form.type === 'fixed' }" @click="form.type = 'fixed'">
                        <div class="card-icon">💵</div>
                        <span class="card-label">قيمة ثابتة</span>
                        <p class="card-desc">خصم مبلغ محدد من الطلب</p>
                    </div>
                    <div class="type-card" :class="{ active: form.type === 'percentage' }" @click="form.type = 'percentage'">
                        <div class="card-icon">％</div>
                        <span class="card-label">نسبة مئوية</span>
                        <p class="card-desc">خصم نسبة مئوية من الإجمالي</p>
                    </div>
                    <div class="type-card" :class="{ active: form.type === 'buy_x_get_y' }" @click="form.type = 'buy_x_get_y'">
                        <div class="card-icon">🎁</div>
                        <span class="card-label">اشتري X واحصل على Y</span>
                        <p class="card-desc">عرض الهدايا والكميات</p>
                    </div>
                    <div class="type-card" :class="{ active: form.type === 'free_shipping' }" @click="form.type = 'free_shipping'">
                        <div class="card-icon">🚚</div>
                        <span class="card-label">شحن مجاني</span>
                        <p class="card-desc">إلغاء رسوم الشحن للطلب</p>
                    </div>
                </div>
            </div>

            <div class="form-grid">
                <div class="form-group" v-if="form.type !== 'free_shipping' && form.type !== 'buy_x_get_y'">
                    <label class="form-label">قيمة الخصم {{ form.type === 'percentage' ? '%' : '(د.أ)' }} <span class="req">*</span></label>
                    <input type="number" step="0.01" v-model="form.value" class="form-control" placeholder="0.00" required />
                </div>

                <template v-if="form.type === 'buy_x_get_y'">
                   <div class="form-group">
                      <label class="form-label">اشتري (الكمية X) <span class="req">*</span></label>
                      <input type="number" v-model="form.buy_x" class="form-control" placeholder="مثلاً: 2" required />
                   </div>
                   <div class="form-group">
                      <label class="form-label">واحصل على (الكمية Y) <span class="req">*</span></label>
                      <input type="number" v-model="form.get_y" class="form-control" placeholder="مثلاً: 1" required />
                   </div>
                </template>

                <div class="form-group">
                    <label class="form-label">كود الخصم (اختياري)</label>
                    <input type="text" v-model="form.code" class="form-control ltr-text" placeholder="SPRING20" />
                </div>

                <div class="form-group" v-if="form.type === 'percentage'">
                    <label class="form-label">الحد الأقصى للخصم (د.أ)</label>
                    <input type="number" step="0.01" v-model="form.max_discount" class="form-control" placeholder="مثلاً: 10.00" />
                </div>

                <div class="form-group">
                    <label class="form-label">الحد الأدنى للطلب</label>
                    <input type="number" step="0.01" v-model="form.min_order_value" class="form-control" placeholder="0.00" />
                </div>

                <div class="form-group">
                    <label class="form-label">الحد الأقصى للاستخدام الكلي</label>
                    <input type="number" v-model="form.max_uses" class="form-control" placeholder="مثلاً: 500" />
                </div>

                <div class="form-group">
                    <label class="form-label">عدد المرات لكل عميل</label>
                    <input type="number" v-model="form.max_per_customer" class="form-control" placeholder="مثلاً: 1" />
                </div>
            </div>

            <div class="form-section">
                <label class="form-label">ينطبق على <span class="req">*</span></label>
                <div class="applies-cards-grid">
                    <div class="apply-card" :class="{ active: form.applies_to === 'all' }" @click="form.applies_to = 'all'">
                        <div class="apply-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg></div>
                        <span>جميع المنتجات</span>
                    </div>
                    <div class="apply-card" :class="{ active: form.applies_to === 'categories' }" @click="form.applies_to = 'categories'">
                        <div class="apply-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
                        <span>أقسام محددة</span>
                    </div>
                    <div class="apply-card" :class="{ active: form.applies_to === 'products' }" @click="form.applies_to = 'products'">
                        <div class="apply-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>
                        <span>منتجات محددة</span>
                    </div>
                </div>
                <div class="selection-box-area" v-if="form.applies_to === 'categories'">
                   <label class="form-label">اختر الأقسام</label>
                   <div class="checkbox-list">
                      <label v-for="cat in categoriesList" :key="cat.id" class="chk-item">
                         <input type="checkbox" :value="cat.id" v-model="form.selected_categories">
                         <span>{{ cat.name_i18n?.ar || cat.name }}</span>
                      </label>
                   </div>
                </div>

                <div class="selection-box-area" v-if="form.applies_to === 'products'">
                   <label class="form-label">اختر المنتجات</label>
                   <div class="checkbox-list">
                      <label v-for="pro in productsList" :key="pro.id" class="chk-item">
                         <input type="checkbox" :value="pro.id" v-model="form.selected_products">
                         <span>{{ pro.name_i18n?.ar || pro.name }}</span>
                      </label>
                   </div>
                </div>
            </div>

            <div class="form-grid mt-1">
                <div class="form-group">
                    <label class="form-label">تاريخ البدء <span class="req">*</span></label>
                    <input type="date" v-model="form.start_date" class="form-control" required />
                </div>
                <div class="form-group">
                    <label class="form-label">تاريخ الانتهاء <span class="req" v-if="!form.no_end_date">*</span></label>
                    <input type="date" v-model="form.end_date" class="form-control" :required="!form.no_end_date" :disabled="form.no_end_date" />
                    <label class="chk-item mt-2">
                        <input type="checkbox" v-model="form.no_end_date">
                        <span>مفتوح (غير محدد المدة)</span>
                    </label>
                </div>
            </div>

            <div class="form-section-toggle">
               <span class="toggle-lbl">تفعيل العرض</span>
               <label class="toggle-switch">
                  <input type="checkbox" v-model="form.is_active" hidden>
                  <div class="t-slider" :class="{ on: form.is_active }">
                     <div class="t-knob"></div>
                  </div>
               </label>
            </div>

            <div class="form-footer-btns">
                <button type="button" class="btn-cancel-form" @click="showFormModal = false">إلغاء</button>
                <button type="submit" class="btn-submit-form" :disabled="isSubmitting">
                    {{ isSubmitting ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إنشاء العرض') }}
                </button>
            </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div class="modal-overlay" v-if="deleteTarget" @click.self="cancelDelete">
      <div class="modal-content delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-offer-title">
        <div class="delete-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.6 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/>
          </svg>
        </div>
        <div class="delete-copy">
          <h2 id="delete-offer-title">تأكيد حذف العرض</h2>
          <p>هل أنت متأكد من حذف عرض «{{ deleteTarget.name_i18n?.ar || deleteTarget.name }}»؟ لا يمكن التراجع عن هذا الإجراء.</p>
        </div>
        <div class="modal-footer delete-footer">
          <button class="btn-cancel-form" type="button" :disabled="isDeleting" @click="cancelDelete">إلغاء</button>
          <button class="btn-delete-confirm" type="button" :disabled="isDeleting" @click="executeDelete">
            <span v-if="isDeleting" class="delete-spinner" aria-hidden="true"></span>
            {{ isDeleting ? 'جاري الحذف...' : 'حذف العرض' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Alert Message -->
    <div class="alert-toast" :class="[alertType, { show: showAlert }]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
        <path v-if="alertType === 'success'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline v-if="alertType === 'success'" points="22 4 12 14.01 9 11.01"/>
        <circle v-if="alertType === 'error'" cx="12" cy="12" r="10"/><line v-if="alertType === 'error'" x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ alertMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../config/axios';

// States
const offers = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const typeFilter = ref('');
const statusFilter = ref('');
const startDateFilter = ref('');
const endDateFilter = ref('');
const isSubmitting = ref(false);

// Pagination
const currentPage = ref(1);
const perPage = ref(15);
const totalOffersCount = ref(0);

// Modals
const showFormModal = ref(false);
const isEdit = ref(false);
const currentId = ref(null);
const deleteTarget = ref(null);
const isDeleting = ref(false);

const backendOrigin = (import.meta.env.VITE_API_BASE_URL || 'https://backend-mastergas.be-kite.com/api')
    .replace(/\/api\/?$/, '');

const normalizeOfferImage = (value) => {
    if (!value) return value;
    const raw = String(value);
    if (raw.startsWith('/storage/')) return `${backendOrigin}/public${raw}`;
    if (raw.includes('/storage/') && !raw.includes('/public/storage/')) {
        return raw.replace('/storage/', '/public/storage/');
    }
    return raw;
};

const activeLang = ref('ar');

const initialForm = {
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    image: null,
    type: 'percentage',
    value: '',
    buy_x: '',
    get_y: '',
    code: '',
    min_order_value: '',
    max_discount: '',
    max_uses: '',
    max_per_customer: '',
    applies_to: 'all',
    selected_categories: [],
    selected_products: [],
    start_date: '',
    end_date: '',
    no_end_date: false,
    min_order_enabled: false,
    is_active: true
};
const form = ref({ ...initialForm });

const fileInputRef = ref(null);
const imagePreview = ref(null);
const categoriesList = ref([]);
const productsList = ref([]);
const isFetchingSelection = ref(false);

const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('success');

// Stat Computed
const activeOffersCount = computed(() => offers.value.filter(o => o.status === 'active').length);
const expiredOffersCount = computed(() => offers.value.filter(o => o.status === 'expired').length);
const totalUsageCount = computed(() => offers.value.reduce((acc, o) => acc + (o.total_uses || 0), 0));

// Pagination Computed
const totalPages = computed(() => Math.ceil(totalOffersCount.value / perPage.value));

// Utils
const formatPrice = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatDate = (d) => {
    if (!d) return '-';
    if (d.length <= 10) return d;
    return new Date(d).toISOString().split('T')[0];
};

const triggerAlert = (msg, type = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  showAlert.value = true;
  setTimeout(() => { showAlert.value = false; }, 3000);
};

const formatType = (t) => {
    const map = {
        'percentage': 'نسبة مئوية',
        'fixed': 'قيمة ثابتة',
        'buy_x_get_y': 'اشتري X واحصل على Y',
        'free_shipping': 'شحن مجاني'
    };
    return map[t] || t;
};

const formatValue = (offer) => {
    if (offer.type === 'percentage') return offer.value + '%';
    if (offer.type === 'fixed') return formatPrice(offer.value) + ' د.أ';
    if (offer.type === 'buy_x_get_y') return `اشتري ${offer.buy_x} خذ ${offer.get_y}`;
    if (offer.type === 'free_shipping') return 'مجاني';
    return '-';
};

const formatStatus = (s) => {
    const map = {
        'active': 'نشط',
        'paused': 'متوقف',
        'expired': 'منتهي',
        'scheduled': 'مجدول'
    };
    return map[s] || s;
};

const copyText = (txt) => {
  navigator.clipboard.writeText(txt);
  triggerAlert('تم نسخ الكود بنجاح');
};

// Pagination
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchOffers();
};

const defaultDashboardOffers = [
  {
    id: 101,
    name: 'عروض التصفية الكبرى',
    name_ar: 'عروض التصفية الكبرى',
    name_en: 'Grand Clearance Offers',
    name_i18n: { ar: 'عروض التصفية الكبرى', en: 'Grand Clearance Offers' },
    description_ar: 'تخفيضات كبرى تصل إلى 35% على طباخات وأفران الغاز الإيطالية',
    description_en: 'Clearance discounts up to 35% on Italian gas hobs and cookers',
    code: 'CLEARANCE35',
    type: 'percentage',
    value: 35,
    status: 'active',
    is_active: true,
    applies_to: 'categories',
    selected_categories: [57],
    selected_products: [],
    start_date: '2026-09-01',
    end_date: '2026-10-31',
    total_uses: 48,
    max_uses: 100,
    usage_percentage: 48,
    image: '/images/home/offer_clearance_pro.jpg'
  },
  {
    id: 102,
    name: 'باقة المطابخ المدمجة',
    name_ar: 'باقة المطابخ المدمجة',
    name_en: 'Built-in Kitchen Suite',
    name_i18n: { ar: 'باقة المطابخ المدمجة', en: 'Built-in Kitchen Suite' },
    description_ar: 'وفر 25% عند شراء أجهزة المطابخ البلت إن الإيطالية المتكاملة',
    description_en: 'Save 25% on Italian built-in kitchen appliance suites',
    code: 'BUILTIN25',
    type: 'percentage',
    value: 25,
    status: 'active',
    is_active: true,
    applies_to: 'categories',
    selected_categories: [57],
    selected_products: [],
    start_date: '2026-09-01',
    end_date: '2026-10-31',
    total_uses: 32,
    max_uses: 100,
    usage_percentage: 32,
    image: '/images/home/offer_builtin_pro.jpg'
  },
  {
    id: 103,
    name: 'باقة الأمان الإيطالية',
    name_ar: 'باقة الأمان الإيطالية',
    name_en: 'Italian Safety Pack',
    name_i18n: { ar: 'باقة الأمان الإيطالية', en: 'Italian Safety Pack' },
    description_ar: 'منظومات ومحابس الأمان الإيطالية الأصلية مع فحص معتمد وضمان 5 سنوات',
    description_en: 'Authentic Italian gas regulators and safety valves with certified 5-year warranty',
    code: 'SAFETY15',
    type: 'percentage',
    value: 15,
    status: 'active',
    is_active: true,
    applies_to: 'categories',
    selected_categories: [52],
    selected_products: [],
    start_date: '2026-09-01',
    end_date: '2026-12-31',
    total_uses: 67,
    max_uses: 200,
    usage_percentage: 33.5,
    image: '/images/home/offer_safety_pro.jpg'
  },
  {
    id: 104,
    name: 'شوايات الحدائق الفاخرة',
    name_ar: 'شوايات الحدائق الفاخرة',
    name_en: 'Luxury Outdoor BBQ Grills',
    name_i18n: { ar: 'شوايات الحدائق الفاخرة', en: 'Luxury Outdoor BBQ Grills' },
    description_ar: 'عروض موسمية خاصة على شوايات الغاز الخارجية الفاخرة للحدائق والرحلات',
    description_en: 'Special seasonal offers on luxury outdoor BBQ gas grills',
    code: 'GRILL20',
    type: 'percentage',
    value: 20,
    status: 'active',
    is_active: true,
    applies_to: 'categories',
    selected_categories: [59],
    selected_products: [],
    start_date: '2026-09-01',
    end_date: '2026-10-15',
    total_uses: 19,
    max_uses: 50,
    usage_percentage: 38,
    image: '/images/home/offer_bbq_pro.jpg'
  }
];

// Fetch Data
const fetchOffers = async () => {
  loading.value = true;
  try {
    const res = await api.get('/dashboard/offers', {
      params: {
        page: currentPage.value,
        per_page: perPage.value
      }
    });
    offers.value = Array.isArray(res.data?.data) ? res.data.data : [];
    totalOffersCount.value = res.data?.meta?.total ?? res.data?.total ?? offers.value.length;
  } catch (err) {
    offers.value = [];
    totalOffersCount.value = 0;
    triggerAlert('فشل تحميل العروض من الخادم', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOffers();
  fetchSelectionData();
});

const fetchSelectionData = async () => {
    isFetchingSelection.value = true;
    try {
        const [cats, pros] = await Promise.all([
            api.get('/dashboard/categories'),
            api.get('/dashboard/products')
        ]);
        categoriesList.value = cats.data.data;
        productsList.value = pros.data.data;
    } catch (err) {
        console.error('Failed to fetch selection data', err);
    } finally {
        isFetchingSelection.value = false;
    }
};

// Filtering
const filteredOffers = computed(() => {
  return offers.value.filter(o => {
    const q = searchQuery.value.toLowerCase();
    const nameAr = (o.name_i18n?.ar || o.name || '').toString().toLowerCase();
    const nameEn = (o.name_i18n?.en || '').toString().toLowerCase();
    const code = (o.code || '').toString().toLowerCase();
    const nameMatch = nameAr.includes(q) || nameEn.includes(q) || code.includes(q);
    const typeMatch = typeFilter.value === '' ? true : o.type === typeFilter.value;
    const statusMatch = statusFilter.value === '' ? true : o.status === statusFilter.value;
    
    // Dates
    let dateMatch = true;
    if (startDateFilter.value) dateMatch = dateMatch && o.start_date >= startDateFilter.value;
    if (endDateFilter.value) dateMatch = dateMatch && o.end_date <= endDateFilter.value;

    return nameMatch && typeMatch && statusMatch && dateMatch;
  });
});

// Actions
const openAddModal = () => {
    isEdit.value = false;
    currentId.value = null;
    form.value = { ...initialForm };
    imagePreview.value = null;
    if (fileInputRef.value) fileInputRef.value.value = '';
    activeLang.value = 'ar';
    showFormModal.value = true;
};

const openEditModal = (offer) => {
    isEdit.value = true;
    currentId.value = offer.id;
    const nameObj = offer.name_i18n && typeof offer.name_i18n === 'object' ? offer.name_i18n : null;
    const descObj = offer.description_i18n && typeof offer.description_i18n === 'object' ? offer.description_i18n : null;
    form.value = { 
        ...initialForm,
        ...offer,
        name_ar: nameObj?.ar ?? offer.name ?? '',
        name_en: nameObj?.en ?? '',
        description_ar: descObj?.ar ?? offer.description ?? '',
        description_en: descObj?.en ?? '',
        image: null,
        selected_products: offer.selected_products || [],
        selected_categories: offer.selected_categories || [],
        start_date: formatDate(offer.start_date),
        end_date: offer.end_date ? formatDate(offer.end_date) : '',
        no_end_date: !offer.end_date
    };
    imagePreview.value = normalizeOfferImage(offer.image);
    activeLang.value = 'ar';
    showFormModal.value = true;
};

const openViewModal = (offer) => {
    // We can implement a separate view modal or just use edit for now
    openEditModal(offer);
};

const duplicateOffer = async (offer) => {
    try {
        const baseNameAr = offer.name_i18n?.ar || offer.name || '';
        const baseNameEn = offer.name_i18n?.en || '';
        const baseDescAr = offer.description_i18n?.ar || offer.description || '';
        const baseDescEn = offer.description_i18n?.en || '';

        const dup = {
            ...offer,
            name: JSON.stringify({ ar: `${baseNameAr} (نسخة)`, en: baseNameEn ? `${baseNameEn} (Copy)` : '' }),
            description: JSON.stringify({ ar: baseDescAr, en: baseDescEn }),
            code: offer.code ? offer.code + '2' : null,
        };
        delete dup.id;
        delete dup.status;
        delete dup.usage_percentage;
        delete dup.total_uses;
        delete dup.name_i18n;
        delete dup.description_i18n;
        
        await api.post('/dashboard/offers', dup);
        triggerAlert('تم تكرار العرض بنجاح');
        fetchOffers();
    } catch (err) {
        triggerAlert('فشل تكرار العرض', 'error');
    }
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 1 * 1024 * 1024) {
    triggerAlert('حجم الصورة يجب أن لا يتجاوز 1 ميجابايت', 'error');
    e.target.value = '';
    return;
  }
  form.value.image = file;
  imagePreview.value = URL.createObjectURL(file);
};

const submitForm = async () => {
    // Validate bilingual fields
    if (!String(form.value.name_ar || '').trim()) {
        activeLang.value = 'ar';
        triggerAlert('اسم العرض بالعربي مطلوب', 'error');
        return;
    }
    if (!String(form.value.name_en || '').trim()) {
        activeLang.value = 'en';
        triggerAlert('اسم العرض بالإنجليزية مطلوب', 'error');
        return;
    }

    isSubmitting.value = true;
    try {
        const formData = new FormData();

        formData.append('name', JSON.stringify({ ar: form.value.name_ar || '', en: form.value.name_en || '' }));
        if (form.value.description_ar || form.value.description_en) {
            formData.append('description', JSON.stringify({ ar: form.value.description_ar || '', en: form.value.description_en || '' }));
        }
        
        Object.keys(form.value).forEach(key => {
            if (['name_ar','name_en','description_ar','description_en'].includes(key)) return;
            if (key === 'image' && !form.value[key]) return; // Handle file
            if (key === 'selected_categories' || key === 'selected_products') {
                form.value[key].forEach((val, i) => formData.append(`${key}[${i}]`, val));
                return;
            }
            if (form.value[key] !== null && form.value[key] !== '') {
                 if (typeof form.value[key] === 'boolean') {
                     formData.append(key, form.value[key] ? 1 : 0);
                 } else {
                     formData.append(key, form.value[key]);
                 }
            }
        });

        if (isEdit.value) {
            formData.append('_method', 'PUT');
            await api.post(`/dashboard/offers/${currentId.value}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            triggerAlert('تم تحديث العرض بنجاح');
        } else {
            await api.post('/dashboard/offers', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            triggerAlert('تم إنشاء العرض بنجاح');
        }
        showFormModal.value = false;
        fetchOffers();
    } catch (error) {
        const errorData = error.response?.data;
        let msg = errorData?.message || 'فشل حفظ البيانات';
        if (errorData?.errors) {
            // Pick first validation error if exists
            const firstErr = Object.values(errorData.errors)[0][0];
            msg = firstErr;
        }
        triggerAlert(msg, 'error');
    } finally {
        isSubmitting.value = false;
    }
};

const toggleOfferStatus = async (offer) => {
    try {
        const newStatus = !offer.is_active;
        await api.put(`/dashboard/offers/${offer.id}`, { is_active: newStatus });
        offer.is_active = newStatus;
        // Re-fetch or manually update status for badges (logic is in model, so re-fetching is safer or we can mimic)
        fetchOffers(); 
        triggerAlert(newStatus ? 'تم تفعيل العرض' : 'تم تعطيل العرض');
    } catch (err) {
        triggerAlert('فشل تحديث الحالة', 'error');
    }
};

const confirmDelete = (offer) => {
    deleteTarget.value = offer;
};

const cancelDelete = () => {
    if (!isDeleting.value) deleteTarget.value = null;
};

const executeDelete = async () => {
    if (!deleteTarget.value || isDeleting.value) return;

    const target = deleteTarget.value;
    isDeleting.value = true;
    try {
        await api.delete(`/dashboard/offers/${target.id}`);
        offers.value = offers.value.filter((offer) => offer.id !== target.id);
        totalOffersCount.value = Math.max(0, totalOffersCount.value - 1);
        deleteTarget.value = null;
        triggerAlert('تم حذف العرض بنجاح');
    } catch (err) {
        const message = err.response?.data?.message || 'فشل حذف العرض. حاول مرة أخرى.';
        triggerAlert(message, 'error');
    } finally {
        isDeleting.value = false;
    }
};
</script>

<style scoped>
.discounts-page {
  display: flex; flex-direction: column; gap: 1.5rem; direction: rtl; font-family: 'IBM Plex Sans Arabic', sans-serif; padding-bottom: 3rem;
}

/* Page Header */
.page-header { display: flex; align-items: center; justify-content: space-between; }
.title-with-icon { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.2rem; }
.page-title { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 0; }
.tag-icon-wrapper { background: #fdf2f8; color: #db2777; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.page-subtitle { font-size: 0.85rem; color: #6b7280; margin: 0; }

.add-btn {
  display: flex; align-items: center; gap: 0.5rem; background: #873260; color: #fff; border: none; padding: 0.65rem 1.15rem; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: 0.2s;
}
.add-btn:hover { background: #6E1A41; }

/* Stats Cards */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.stat-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.stat-icon-wrapper {
  width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
}
.stat-icon-wrapper.pink { background: #fdf2f8; color: #db2777; }
.stat-icon-wrapper.green { background: #ecfdf5; color: #10b981; }
.stat-icon-wrapper.gray { background: #f9fafb; color: #6b7280; }
.stat-icon-wrapper.blue { background: #eff6ff; color: #2563eb; }

.stat-info { display: flex; flex-direction: column; gap: 0.2rem; }
.stat-label { font-size: 0.75rem; font-weight: 600; color: #6b7280; }
.stat-value { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 0; }

/* Filters */
.filters-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.search-box { flex: 1; min-width: 250px; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; right: 1rem; color: #9ca3af; }
.search-input { width: 100%; padding: 0.75rem 2.8rem 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; outline: none; background: #fff; }
.search-input:focus { border-color: #873260; }

.filter-select { position: relative; display: flex; align-items: center; min-width: 150px; }
.form-select { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.2rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #374151; appearance: none; outline: none; }
.filter-select .select-icon { position: absolute; left: 0.75rem; color: #9ca3af; pointer-events: none; }

.date-input { border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.65rem 0.75rem; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; color: #374151; outline: none; }

/* Table */
.table-container { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow-x: auto; margin-top: 0.5rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1.1rem 0.75rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; text-align: center; }
.data-table th { background: #f9fafb; font-size: 0.75rem; font-weight: 700; color: #6b7280; white-space: nowrap; }
.data-table td { font-size: 0.82rem; color: #374151; }
.data-row:hover td { background: #fdfafb; }

.text-right { text-align: right !important; }
.font-bold { font-weight: 700; }
.text-pink { color: #db2777; }
.text-blue { color: #2563eb; }
.ltr-text { direction: ltr; }

.offer-name { font-weight: 700; color: #111827; }

.code-badge { background: #f9fafb; border: 1px dashed #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: #4b5563; display: inline-flex; align-items: center; gap: 0.4rem; direction: ltr; }
.copy-tiny { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 0; display: flex; align-items: center; }
.copy-tiny:hover { color: #873260; }

/* Usage Bar */
.usage-text { font-size: 0.65rem; color: #6b7280; font-weight: 600; margin-bottom: 4px; }
.usage-bar-bg { width: 80px; height: 6px; background: #f3f4f6; border-radius: 10px; margin: 0 auto; overflow: hidden; }
.usage-bar-fill { height: 100%; background: #873260; border-radius: 10px; }

/* Status Badges */
.status-badge-table { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }
.status-badge-table.active { background: #ecfdf5; color: #059669; }
.status-badge-table.paused { background: #eff6ff; color: #2563eb; }
.status-badge-table.expired { background: #fef2f2; color: #dc2626; }
.status-badge-table.scheduled { background: #fff7ed; color: #ea580c; }

/* Table Toggle Switch */
.status-toggle-wrapper { display: flex; align-items: center; gap: 0.75rem; justify-content: center; }
.table-switch { cursor: pointer; display: flex; align-items: center; }
.ts-slider { width: 34px; height: 18px; background: #e5e7eb; border-radius: 100px; position: relative; transition: 0.3s; }
.ts-knob { width: 14px; height: 14px; background: #fff; border-radius: 50%; position: absolute; top: 2px; right: 2px; transition: 0.3s; }
.ts-slider.on { background: #10b981; }
.ts-slider.on .ts-knob { transform: translateX(-16px); }

/* Actions */
.actions-group { display: flex; align-items: center; justify-content: center; gap: 0.4rem; }
.action-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: none; cursor: pointer; transition: 0.2s; }
.view-btn { background: #fdf2f8; color: #db2777; }
.edit-btn { background: #eff6ff; color: #2563eb; }
.delete-btn { background: #fef2f2; color: #dc2626; }
.delete-modal { max-width: 460px; padding: 28px; text-align: center; }
.delete-icon { width: 58px; height: 58px; margin: 0 auto 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #dc2626; background: #fef2f2; }
.delete-copy h2 { margin: 0 0 8px; color: #111827; font-size: 1.2rem; }
.delete-copy p { margin: 0; color: #6b7280; line-height: 1.7; font-size: 0.92rem; }
.delete-footer { padding: 24px 0 0; background: transparent; border-top: 0; }
.delete-footer button { min-height: 44px; }
.btn-delete-confirm { background: #dc2626; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; flex: 1; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.btn-delete-confirm:hover { background: #b91c1c; }
.btn-delete-confirm:disabled, .btn-cancel-form:disabled { opacity: 0.6; cursor: not-allowed; }
.delete-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.45); border-top-color: white; border-radius: 50%; animation: delete-spin 0.7s linear infinite; }
@keyframes delete-spin { to { transform: rotate(360deg); } }
.copy-btn-action { background: #f9fafb; color: #6b7280; }
.action-btn:hover { opacity: 0.8; transform: translateY(-1px); }

/* Pagination */
.pagination-footer { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; }
.results-text { font-size: 0.75rem; color: #6b7280; }
.pagination-btns { display: flex; align-items: center; gap: 0.5rem; }
.p-btn { width: 32px; height: 32px; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #374151; }
.p-btn.active { background: #873260; color: #fff; border-color: #873260; }
.p-btn:disabled, .p-btn.disabled { opacity: 0.5; cursor: not-allowed; }

/* FORM MODAL */
.form-content { max-width: 650px; padding: 0; max-height: 95vh; overflow-y: auto; }
.form-header { text-align: center; padding: 2rem 2rem 1.5rem 2rem; position: relative; }
.header-icon-main { width: 50px; height: 50px; background: #fdf2f8; color: #db2777; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
.modal-title-main { font-size: 1.3rem; font-weight: 800; color: #111827; margin: 0; }
.modal-subtitle-main { font-size: 0.85rem; color: #9ca3af; margin-top: 0.4rem; }

.offer-form { padding: 0 2.5rem 2.5rem 2.5rem; }
.i18n-toggle { display: inline-flex; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; margin: 0 auto 1.1rem; }
.i18n-btn { border: none; background: transparent; padding: 0.4rem 0.9rem; font-weight: 800; font-size: 0.85rem; cursor: pointer; color: #6b7280; min-width: 96px; font-family: 'IBM Plex Sans Arabic', sans-serif; }
.i18n-btn.active { background: #873260; color: #fff; }
.form-section { margin-bottom: 1.5rem; }
.form-label { display: block; font-size: 0.85rem; font-weight: 700; color: #374151; margin-bottom: 0.75rem; text-align: right; }
.form-control { width: 100%; padding: 0.8rem 1rem; border: 1px solid #e5e7eb; border-radius: 10px; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 0.85rem; transition: 0.2s; outline: none; background: #f9fafb; }
.form-control:focus { background: #fff; border-color: #873260; box-shadow: 0 0 0 4px rgba(139, 34, 82, 0.08); }

/* Type Cards */
.upload-wrapper { width: 100%; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 1.5rem; text-align: center; cursor: pointer; transition: 0.2s; background: #f9fafb; margin-bottom: 1rem; }
.upload-wrapper:hover { border-color: #873260; background: #fff; }
.upload-box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 120px; }
.preview-image { max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: contain; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: #6b7280; }
.upload-placeholder svg { color: #9ca3af; margin-bottom: 0.25rem; }
.upload-placeholder p { font-size: 0.9rem; font-weight: 700; margin: 0; color: #374151; }
.upload-placeholder span { font-size: 0.75rem; color: #9ca3af; }

.type-cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
.type-card {
  padding: 1rem 0.5rem; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.2s; background: #fff;
}
.type-card:hover { border-color: #db2777; background: #fdf2f8; }
.type-card.active { border-color: #db2777; background: #fdf2f8; box-shadow: 0 0 0 2px #db2777 inset; }
.card-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
.card-label { display: block; font-size: 0.75rem; font-weight: 800; color: #111827; margin-bottom: 0.25rem; }
.card-desc { font-size: 0.6rem; color: #9ca3af; margin: 0; line-height: 1.3; }

/* Applies Cards */
.applies-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.apply-card {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; border: 1px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: 0.2s; background: #fff;
}
.apply-card span { font-size: 0.8rem; font-weight: 700; color: #374151; }
.apply-icon { color: #9ca3af; }
.apply-card:hover { border-color: #db2777; background: #fdf2f8; }
.apply-card.active { border-color: #873260; background: #fdf2f8; }
.apply-card.active .apply-icon { color: #873260; }
.apply-card.active span { color: #873260; }

.selection-box-area { margin-top: 1rem; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; background: #fff; }
.checkbox-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; max-height: 200px; overflow-y: auto; padding: 0.5rem; border: 1px solid #f3f4f6; border-radius: 8px; }
.chk-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #374151; cursor: pointer; padding: 0.25rem 0; border-bottom: 1px solid #f9fafb; }
.chk-item:hover { background: #fdfafb; }
.chk-item input { width: 16px; height: 16px; accent-color: #873260; }

/* Form Grid */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.mt-1 { margin-top: 1.5rem; }

/* Toggle */
.form-section-toggle { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #f9fafb; border-radius: 12px; margin-top: 1.5rem; }
.toggle-lbl { font-size: 0.9rem; font-weight: 700; color: #111827; }
.toggle-switch { cursor: pointer; }
.t-slider { width: 50px; height: 26px; background: #e5e7eb; border-radius: 100px; position: relative; transition: 0.4s; }
.t-knob { width: 20px; height: 20px; background: #fff; border-radius: 50%; position: absolute; top: 3px; right: 3px; transition: 0.4s; }
.t-slider.on { background: #10b981; }
.t-slider.on .t-knob { transform: translateX(-24px); }

/* Footer Btns */
.form-footer-btns { margin-top: 2rem; display: flex; gap: 1rem; }
.btn-cancel-form { flex: 1; padding: 0.85rem; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; color: #6b7280; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; cursor: pointer; }
.btn-submit-form { flex: 2; padding: 0.85rem; border-radius: 10px; border: none; background: #873260; color: #fff; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-submit-form:hover:not(:disabled) { background: #6E1A41; }
.btn-submit-form:disabled { opacity: 0.6; }

/* Modals Shared */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; backdrop-filter: blur(4px);
}
.modal-content {
  background: #fff; border-radius: 20px; width: 100%; position: relative; box-shadow: 0 25px 70px rgba(0,0,0,0.25);
}
.modal-close { position: absolute; top: 1.5rem; left: 1.5rem; background: #f3f4f6; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }

/* Alerts */
.alert-toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: 12px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 0.75rem; transform: translateY(150%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 2000; font-family: 'IBM Plex Sans Arabic', sans-serif; font-weight: 600; font-size: 0.9rem; }
.alert-toast.show { transform: translateY(0); }
.alert-toast.success { border-right: 4px solid #059669; color: #065f46; }
.alert-toast.error { border-right: 4px solid #dc2626; color: #991b1b; }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .type-cards-grid { grid-template-columns: repeat(2, 1fr); }
  .applies-cards-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
