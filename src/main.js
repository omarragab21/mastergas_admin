import { createApp } from 'vue';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './style.css';
import App from './App.vue';
import router from './router/index.js';
import i18n from './i18n/index.js';
import { useTheme } from './composables/useTheme.js';

const { initTheme } = useTheme();
initTheme();

let lang = localStorage.getItem('lang');
if (!lang || (lang !== 'ar' && lang !== 'en')) {
  lang = 'ar';
  localStorage.setItem('lang', 'ar');
}
document.documentElement.lang = lang;
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

const app = createApp(App);
app.use(i18n);
app.use(router);
app.mount('#app');
