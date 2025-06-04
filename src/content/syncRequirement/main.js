import { createApp } from 'vue';
import vRemixicon from 'v-remixicon';
import TDesign from 'tdesign-vue-next';

import App from './App.vue';
import compsUi from './compsUi';
import icons from './icons';

// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';
import '../../assets/css/theme.css';

const additionalStyle = `.list-item-active svg { visibility: visible }`;

export default function (rootElement) {
  const appRoot = document.createElement('div');
  appRoot.setAttribute('id', 'ita-sync-app');

  const style = document.createElement('style');
  style.textContent = additionalStyle;

  rootElement.shadowRoot.appendChild(style);
  rootElement.shadowRoot.appendChild(appRoot);

  createApp(App)
    .use(compsUi)
    .use(vRemixicon, icons)
    .use(TDesign)
    .provide('rootElement', rootElement)
    .mount(appRoot);
}
