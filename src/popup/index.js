import { createApp } from 'vue';
import TDesign from 'tdesign-vue-next';
import ElementPlus from 'element-plus';
import App from './App.vue';
import router from './router';
import pinia from '../lib/pinia';
import compsUi from '../lib/compsUi';
import vueI18n from '../lib/vueI18n';
import vRemixicon, { icons } from '../lib/vRemixicon';
import 'element-plus/dist/index.css';
import '../assets/css/tailwind.css';
import '../assets/css/fonts.css';
import '../assets/css/flow.css';
import '../assets/css/el-styles.css';
import '../assets/css/theme.css';

createApp(App)
  .use(router)
  .use(compsUi)
  .use(vueI18n)
  .use(TDesign)
  .use(ElementPlus)
  .use(pinia)
  .use(vRemixicon, icons)
  .mount('#app');

if (module.hot) module.hot.accept();
