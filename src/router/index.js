import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import AppLayout from '../components/AppLayout.vue';
import NotFoundView from '../views/NotFoundView.vue';
import { trackPageView } from '../utils/metaPixel.js';
import { setRouter } from '../config/axios.js';

const routes = [
  { path: '/', redirect: '/admin/dashboard' },
  { path: '/admin/login', name: 'Login', component: LoginView },
  {
    path: '/admin',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/DashboardView.vue') },
      { path: 'categories', name: 'Categories', component: () => import('../views/CategoriesView.vue') },
      { path: 'brands', name: 'Brands', component: () => import('../views/BrandsView.vue') },
      { path: 'attributes', name: 'Attributes', component: () => import('../views/AttributesView.vue') },
      { path: 'products', name: 'Products', component: () => import('../views/ProductsView.vue') },
      { path: 'data-feeds', name: 'DataFeeds', component: () => import('../views/DataFeedsView.vue') },
      { path: 'orders', name: 'Orders', component: () => import('../views/OrdersView.vue') },
      { path: 'returns', name: 'Returns', component: () => import('../views/ReturnsView.vue') },
      { path: 'dynamic-pages', name: 'DynamicPages', component: () => import('../views/DynamicPagesView.vue') },
      { path: 'reviews', name: 'Reviews', component: () => import('../views/ReviewsView.vue') },
      { path: 'customers', name: 'Customers', component: () => import('../views/CustomersView.vue') },
      { path: 'coupons', name: 'Coupons', component: () => import('../views/CouponsView.vue') },
      { path: 'discounts', name: 'Discounts', component: () => import('../views/DiscountsView.vue') },
      { path: 'payments', name: 'Payments', component: () => import('../views/PaymentsView.vue') },
      { path: 'collector', name: 'Collector', component: () => import('../views/DeliveryManagementView.vue') },
      { path: 'driver-notifications', name: 'DriverNotifications', component: () => import('../views/DashboardView.vue') },
      { path: 'messages', name: 'Messages', component: () => import('../views/MessagesView.vue') },
      { path: 'admins', name: 'Admins', component: () => import('../views/AdminsView.vue') },
      { path: 'sliders', name: 'Sliders', component: () => import('../views/SlidersView.vue') },
      { path: 'branches', name: 'Branches', component: () => import('../views/BranchesView.vue') },
      { path: 'topics', name: 'Topics', component: () => import('../views/TopicsView.vue') },
      { path: 'permissions', name: 'Permissions', component: () => import('../views/PermissionsView.vue') },
      { path: 'accounts', name: 'Accounts', component: () => import('../views/AccountsView.vue') },
      { path: 'countries', name: 'Countries', component: () => import('../views/CountriesView.vue') },
      { path: 'cities', name: 'Cities', component: () => import('../views/CitiesView.vue') },
      { path: 'city-shipping-rates', name: 'CityShippingRates', component: () => import('../views/CityShippingRatesView.vue') },
      { path: 'articles', name: 'Articles', component: () => import('../views/DashboardView.vue') },
      { path: 'activity-log', name: 'ActivityLog', component: () => import('../views/ActivityLogsView.vue') },
      { path: 'settings', name: 'Settings', component: () => import('../views/SettingsView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'AdminNotFound', component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' };
  },
});

setRouter(router);
if (typeof window !== 'undefined') window.__appRouter = router;

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !token) next('/admin/login');
  else if (to.name === 'Login' && token) next('/admin/dashboard');
  else next();
});

router.afterEach((to) => {
  trackPageView({
    page_path: to.fullPath,
    page_title: to.name ? String(to.name) : document.title,
  });
});

export default router;
