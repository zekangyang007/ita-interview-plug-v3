<template>
  <div
    :class="{
      'select-none': state.isDragging,
      'bg-black bg-opacity-30': !state.hide,
    }"
    class="root pointer-events-none fixed top-0 left-0 h-full w-full text-black"
    style="z-index: 99999999"
  >
    <div
      ref="cardEl"
      :style="{ transform: `translate(${cardRect.x}px, ${cardRect.y}px)` }"
      style="width: 320px"
      class="root-card pointer-events-auto relative z-50 rounded-lg bg-white shadow-xl"
    >
      <div
        class="drag-button absolute z-50 cursor-move rounded-lg bg-white p-2 p-1 shadow-xl"
        style="top: -15px; left: -15px"
      >
        <v-remixicon
          name="riDragMoveLine"
          @mousedown="state.isDragging = true"
        />
      </div>
      <div class="flex items-center px-4 pt-4">
        <p class="text-lg font-semibold">Automa</p>
        <div class="grow"></div>
        <button
          class="hoverable mr-2 rounded-md p-1 transition"
          @mousedown.stop.prevent
          @click.stop.prevent="
            state.hide = !state.hide;
            clearConnectedPort();
          "
        >
          <v-remixicon :name="state.hide ? 'riEyeOffLine' : 'riEyeLine'" />
        </button>
        <button
          class="hoverable rounded-md p-1 transition"
          @mousedown.stop.prevent
          @click.stop.prevent="destroy"
        >
          <v-remixicon name="riCloseLine" />
        </button>
      </div>
      <div class="p-4">
        <selector-query
          v-model:selector-type="state.selectorType"
          v-model:select-list="state.selectList"
          :selector="state.elSelector"
          :settings-active="state.showSettings"
          :selected-count="state.selectedElements.length"
          @settings="state.showSettings = $event"
          @selector="updateSelector"
          @parent="selectElementPath('up')"
          @child="selectElementPath('down')"
        />
        <ui-button
          v-if="state.isSelectBlockElement"
          :disabled="!state.elSelector"
          variant="accent"
          class="mt-4 w-full"
          @click="saveSelector"
        >
          Select Element
        </ui-button>
        <selector-elements-detail
          v-if="
            !state.showSettings &&
            !state.hide &&
            state.selectedElements.length > 0
          "
          v-model:active-tab="state.activeTab"
          v-bind="{
            elSelector: state.elSelector,
            selectElements: state.selectElements,
            hideBlocks: state.isSelectBlockElement,
            selectedElements: state.selectedElements,
          }"
          @highlight="toggleHighlightElement"
          @execute="state.isExecuting = $event"
        />
        <div
          v-if="
            state.showSettings && state.selectorType === 'css' && !state.hide
          "
          class="mt-4"
        >
          <p class="mb-4 font-semibold">Selector settings</p>
          <ul class="space-y-4">
            <li>
              <label class="flex items-center space-x-2">
                <ui-switch v-model="selectorSettings.idName" />
                <p>Include element id</p>
              </label>
            </li>
            <li>
              <label class="flex items-center space-x-2">
                <ui-switch v-model="selectorSettings.tagName" />
                <p>Include tag name</p>
              </label>
            </li>
            <li>
              <label class="flex items-center space-x-2">
                <ui-switch v-model="selectorSettings.className" />
                <p>Include class name</p>
              </label>
            </li>
            <li>
              <label class="flex items-center space-x-2">
                <ui-switch v-model="selectorSettings.attr" />
                <p>Include attributes</p>
              </label>
              <template v-if="selectorSettings.attr">
                <label
                  class="ml-1 mt-2 block text-sm text-gray-600"
                  for="automa-attribute-names"
                >
                  Attribute names
                </label>
                <ui-textarea
                  id="automa-attribute-names"
                  v-model="selectorSettings.attrNames"
                  label="Attribute name"
                  placeholder="data-testid, aria-label, type"
                />
                <span class="text-sm">
                  Use commas to separate the attribute
                </span>
              </template>
            </li>
          </ul>
        </div>
        <p class="mt-1 text-sm text-gray-600">
          Click or press
          <kbd class="bg-box-transparent rounded-md p-1">Space</kbd> to select
          an element
        </p>
      </div>
    </div>
  </div>
  <shared-element-selector
    :hide="state.hide"
    :disabled="state.hide"
    :list="state.selectList"
    :selector-type="state.selectorType"
    :selected-els="state.selectedElements"
    :selector-settings="selectorSettings"
    with-attributes
    @selected="onElementsSelected"
  />
</template>
<script setup>
import SelectorElementsDetail from '@/components/content/selector/SelectorElementsDetail.vue';
import SelectorQuery from '@/components/content/selector/SelectorQuery.vue';
import SharedElementSelector from '@/components/content/shared/SharedElementSelector.vue';
import findSelector from '@/lib/findSelector';
import FindElement from '@/utils/FindElement';
import { debounce } from '@/utils/helper';
import {
  inject,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRaw,
  watch,
} from 'vue';
import browser from 'webextension-polyfill';
import { getElementRect } from '../utils';
import getSelectorOptions from './getSelectorOptions';

let connectedPort = null;
const originalFontSize = document.documentElement.style.fontSize;
const selectedElement = {
  path: [],
  pathIndex: 0,
  cache: new WeakMap(),
};

const rootElement = inject('rootElement');

const cardEl = ref('cardEl');
const state = reactive({
  hide: false,
  elSelector: '',
  destroyed: false,
  isDragging: false,
  selectList: false,
  isExecuting: false,
  selectElements: [],
  showSettings: false,
  selectorType: 'css',
  selectedElements: [],
  activeTab: 'attributes',
  isSelectBlockElement: false,
});
const cardRect = reactive({
  x: 0,
  y: 0,
  height: 0,
  width: 0,
});
const selectorSettings = reactive({
  idName: true,
  tagName: true,
  attr: true,
  className: true,
  attrNames: 'data-testid',
});

const cardElementObserver = new ResizeObserver(([entry]) => {
  const { height, width } = entry.contentRect;

  cardRect.width = width;
  cardRect.height = height;
});

const updateSelector = debounce((selector) => {
  let frameSelector;
  let elSelector = selector;

  if (selector.includes('|>')) {
    [frameSelector, elSelector] = selector.split(/\|>(.+)/);
  }

  const selectorType = state.selectorType === 'css' ? 'cssSelector' : 'xpath';

  try {
    if (frameSelector) {
      const frame = FindElement[selectorType]({
        selector: frameSelector,
        multiple: false,
      });
      if (!['IFRAME', 'FRAME'].includes(frame.tagName)) return;

      const { top, left } = frame.getBoundingClientRect();
      frame.contentWindow.postMessage(
        {
          selectorType,
          selector: elSelector,
          type: 'automa:find-element',
          frameRect: { top, left },
        },
        '*'
      );
      return;
    }

    const elements = FindElement[selectorType]({
      selector: elSelector,
      multiple: true,
    });
    state.selectedElements = Array.from(elements || []).map((el) =>
      getElementRect(el, true)
    );
  } catch (error) {
    console.error(error);
    state.selectedElements = [];
  }
}, 200);

function toggleHighlightElement({ index, highlight }) {
  state.selectedElements[index].highlight = highlight;
}
function onElementsSelected({ selector, elements, path, selectElements }) {
  if (path) {
    selectedElement.path = path;
    selectedElement.pathIndex = 0;
  }

  state.elSelector = selector;
  state.selectedElements = elements || [];
  state.selectElements = selectElements || [];
}
function onMousemove({ clientX, clientY }) {
  if (!state.isDragging) return;

  const height = window.innerHeight;
  const width = document.documentElement.clientWidth;

  if (clientY < 10) clientY = 10;
  else if (cardRect.height + clientY > height)
    clientY = height - cardRect.height;

  if (clientX < 10) clientX = 10;
  else if (cardRect.width + clientX > width) clientX = width - cardRect.width;

  cardRect.x = clientX;
  cardRect.y = clientY;
}
function selectElementPath(type) {
  let pathIndex =
    type === 'up'
      ? selectedElement.pathIndex + 1
      : selectedElement.pathIndex - 1;
  let element = selectedElement.path[pathIndex];

  if ((type === 'up' && !element) || element?.tagName === 'BODY') return;

  if (type === 'down' && !element) {
    const previousElement = selectedElement.path[selectedElement.pathIndex];
    const childEl = Array.from(previousElement.children).find(
      (el) => !['STYLE', 'SCRIPT'].includes(el.tagName)
    );

    if (!childEl) return;

    element = childEl;
    selectedElement.path.unshift(childEl);
    pathIndex = 0;
  }

  selectedElement.pathIndex = pathIndex;

  state.selectedElements = [getElementRect(element, true)];
  state.elSelector = selectedElement.cache.has(element)
    ? selectedElement.cache.get(element)
    : findSelector(element, getSelectorOptions(selectorSettings));
}
function onMouseup() {
  if (state.isDragging) state.isDragging = false;
}
function onMessage({ data }) {
  if (data.type !== 'automa:selected-elements') return;

  state.selectedElements = data.elements;
}
function destroy() {
  rootElement.style.display = 'none';

  Object.assign(state, {
    hide: true,
    activeTab: '',
    elSelector: '',
    isDragging: false,
    isExecuting: false,
    hoveredElements: [],
    selectedElements: [],
  });

  const prevSelectedList = document.querySelectorAll('[automa-el-list]');
  prevSelectedList.forEach((element) => {
    element.removeAttribute('automa-el-list');
  });

  document.documentElement.style.fontSize = originalFontSize;
}
function clearConnectedPort() {
  if (!connectedPort) return;

  connectedPort = null;
  state.isSelectBlockElement = false;
}
function onVisibilityChange() {
  if (!connectedPort || document.visibilityState !== 'hidden') return;

  clearConnectedPort();
}
function saveSelector() {
  if (!connectedPort) return;

  connectedPort.postMessage(state.elSelector);
  clearConnectedPort();
  destroy();
}
function attachListeners() {
  cardElementObserver.observe(cardEl.value);

  window.addEventListener('message', onMessage);
  window.addEventListener('mouseup', onMouseup);
  window.addEventListener('mousemove', onMousemove);
  document.addEventListener('visibilitychange', onVisibilityChange);
}
function detachListeners() {
  cardElementObserver.disconnect();

  window.removeEventListener('message', onMessage);
  window.removeEventListener('mouseup', onMouseup);
  window.removeEventListener('mousemove', onMousemove);
  document.removeEventListener('visibilitychange', onVisibilityChange);
}

watch(
  () => state.isDragging,
  (value) => {
    document.body.toggleAttribute('automa-isDragging', value);
  }
);
watch(
  selectorSettings,
  (settings) => {
    browser.storage.local.set({
      selectorSettings: toRaw(settings),
    });
  },
  { deep: true }
);

browser.runtime.onConnect.addListener((port) => {
  clearConnectedPort();

  connectedPort = port;
  state.isSelectBlockElement = true;

  port.onDisconnect.addListener(clearConnectedPort);
});

onMounted(() => {
  browser.storage.local.get('selectorSettings').then((storage) => {
    const settings = storage.selectorSettings || {};
    Object.assign(selectorSettings, settings);
  });

  setTimeout(() => {
    const { height, width } = cardEl.value.getBoundingClientRect();

    cardRect.x = window.innerWidth - (width + 35);
    cardRect.y = 20;
    cardRect.width = width;
    cardRect.height = height;
  }, 500);

  attachListeners();
});
onBeforeUnmount(() => {
  detachListeners();
});
</script>
<style>
.root {
  font-size: 16px;
  z-index: 99999;
  line-height: 1.5 !important;
  font-family: 'Inter var', sans-serif;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}
.root-card:hover .drag-button {
  transform: scale(1);
}
.drag-button {
  transform: scale(0);
  transition: transform 200ms ease-in-out;
}
.main-tab {
  background-color: transparent !important;
  padding: 0 !important;
}
.main-tab .ui-tab.is-active.fill {
  @apply bg-accent text-white !important;
}
.plug_in_main {
  position: relative;
  cursor: pointer;
}
.plug_in:hover .plug_in_item {
  visibility: visible;
}
.plug_in_bg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  padding: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #e3e7ed54;
}
.plug_in_img {
  width: 78px;
  height: auto;
  background-color: #fff;
  border-radius: 50%;
  object-fit: cover;
  padding: 3px;
}
.plug_in_item {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1d2129;
  opacity: 0.9;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  transition: all 0.5s;
  left: -30px;
  top: -4px;
  cursor: pointer;
}
.plug_in_item img {
  width: 20px;
}
.user_button {
  position: absolute;
  top: 80px;
  padding: 7px 5px;
  background: #1d2129;
  border-radius: 4px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  width: -webkit-max-content;
  width: -moz-max-content;
  width: max-content;
  flex-wrap: wrap;
  right: -20px;
  cursor: pointer;
}
.user_b_main {
  display: flex;
  align-items: center;
  padding: 0px 5px;
}
.user_b_main img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 10px;
}
.user_b_name {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #fff;
  line-height: 22px;
  white-space: nowrap;
  padding: 0 5px;
}
.u_overflow {
  display: inline-block;
  overflow: hidden;
  max-width: 100px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.plug_content_main_in {
  text-align: left;
  position: fixed;
  z-index: 99999999;
  left: auto !important;
  right: -360px !important;
  bottom: 35px;
  width: 0px;
  height: 652px;
  background: #fff;
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: none;
  box-sizing: border-box !important;
  font-family: PingFang SC !important;
  transition: right 0.4s;
  overflow: hidden;
}
.plug_content_main_out {
  text-align: left;
  position: fixed;
  z-index: 99999999;
  bottom: 35px;
  width: 360px;
  height: 652px;
  background: #fff;
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #dadbdf;
  box-sizing: border-box !important;
  font-family: PingFang SC !important;
  right: 10px;
  left: auto;
  transition: right 0.4s;
  overflow: hidden;
}
.plug_content_top {
  display: flex;
  align-items: center;
  width: 100%;
  height: 52px !important;
  border-bottom: 1px solid #dadbdf;
}
.p_c_t_user {
  font-size: 13px;
  font-weight: bold;
  color: rgb(29, 33, 41);
  margin: 0px 20px;
  display: flex;
  align-items: center;
}
.p_c_t_u_icon {
  color: rgb(255, 255, 255);
  font-size: 12px;
  font-weight: normal;
  width: 18px;
  height: 18px;
  margin-right: 10px;
  border-radius: 4px;
  background: linear-gradient(
    134deg,
    rgb(122, 149, 255) 0%,
    rgb(68, 109, 255) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}
.p_c_t_u_right {
  margin-left: auto;
  margin-right: 18px;
  font-size: 13px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #86909c;
  line-height: 22px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.plug_content_body {
  height: 600px;
  max-height: 95vh;

}
.p_c_b_detail {
  height: 100%;
  padding: 0 0 5px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box !important;
  font-family: PingFang SC !important;
}
.p_c_b_d_top {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  position: relative;
  padding: 0 20px;
}
.p_c_b_d_avator_box img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
.p_c_b_d_box_right {
  margin-left: 8px;
  flex: 1;
  -webkit-flex: 1;
  display: flex;
  flex-direction: column;
}
.p_c_b_d_b_r_first {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.p_c_b_d_b_r_first_left {
  display: flex;
  align-items: center;
}
.p_c_b_d_b_r_first_left span {
  font-size: 16px;
  font-family: PingFangSC-Semibold, PingFang SC;
  font-weight: 600;
  color: #1d2129;
  line-height: 24px;
}
.p_c_b_d_b_r_tag {
  background: #fff !important;
  border-radius: 12px;
  border: 1px solid #ff9e0b !important;
  color: #ff9e0b !important;
  margin-left: 12px;
  font-size: 12px !important;
  height: 20px !important;
  line-height: 20px !important;
}

.p_c_b_d_b_r_tag2 {
  background: #fff !important;
  border-radius: 12px;
  border: 1px solid #6dd400 !important;
  color: #00d435 !important;
  margin-left: 12px;
  font-size: 12px !important;
  height: 20px !important;
  line-height: 20px !important;
}
.p_c_b_d_b_r_second {
  margin-top: 4px;
  font-size: 13px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #4e5969;
  line-height: 22px;
}
.p_activation {
  margin-left: 12px;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #86909c;
  line-height: 22px;
  min-width: 80px;
}
.p_a_dot {
  display: inline-block;
  margin-right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f7b500;
}
.p_a_dot_green {
  background: #6dd400;
}
.p_c_b_d_b_r_tag_list {
  display: flex;
  flex-flow: wrap;
  gap: 8px;
  margin-top: 8px;
}
.pp--tag {
  background-color: #ecf5ff;
  border-color: #d9ecff;
  color: #409eff;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  font-size: 12px;
  line-height: 1;
  border-width: 1px;
  border-style: solid;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
}
.tag_first_tag {
  background: #f9f0ff !important;
  color: #964aff !important;
}
.tag_b {
  border-radius: 4px;
  border: none !important;
}
.p_c_b_d_info {
  padding: 0 0 0 20px;
}
.p_c_b_d_info_box {
  margin-top: 20px;
  width: 140px;
  display: inline-block;
  margin-left: 8px;
}
.p_c_b_d_info_box div {
  display: flex;
  align-items: center;
}
.p_c_b_d_info_box img {
  width: 14px;
  height: 14px;
  margin-right: 6px;
}
.input-ui input {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 14px;
}
.p_c_b_d_experience {
  max-height: none;
  flex: 1;
  overflow: auto;
}
.p_c_b_d_nextBody {
  padding: 0 20px;
  margin-top: 20px;
  margin-bottom: 10px;
}
.p_c_b_d_bottom {
  width: 100%;
  border-top: 1px solid #dadbdf;
  padding: 10px 20px;
}
.p_c_b_d_bottom_btn {
  width: 100%;
  margin-bottom: 10px;
  height: 32px;
  color: #fff !important;
  background: #165dff;
  border-radius: 4px;
  border-color: #fff !important;
}
.l_w_r {
  font-size: 14px;
  color: #409eff;
  padding: 3px;
}
.test_body {
  display: flex;
  align-items: center;
}
.f14 {
  font-size: 14px;
}
.f16 {
  font-size: 16px;
}
.f40 {
  font-size: 40px;
}
.t_mr10 {
  margin-right: 10px;
}
.p_c_b_d_e_body {
  border-bottom: 1px solid #dadbdf;
  margin-bottom: 12px;
}
.b_pt {
  width: 4px;
  height: 16px;
  border-radius: 26px;
  background-color: #2b68ff;
}
.area_body {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  padding-left: 15px;
  margin-top: 8px;
  margin-bottom: 8px;
}
.p_c_b_d_experience {
  scrollbar-width: thin;
  scrollbar-color: #8888884d #f1f1f100;
}
.disflex {
  display: flex;
}
.fl_dir_c {
  flex-direction: column;
}
.p_20 {
  padding: 12px 20px 0;
}
.u_select_main {
  padding: 0 20px 15px;
}
.t_mb10 {
  margin-bottom: 10px;
}
/* .p_c_b_d_experience ::-webkit-scrollbar {
  width: 8px;
}
.p_c_b_d_experience ::-webkit-scrollbar-track {
  border-radius: 4px;
}
.p_c_b_d_experience ::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
.p_c_b_d_experience ::-webkit-scrollbar-thumb:hover {
  background: #555;
} */

/* .p_c_b_d_experience::-webkit-scrollbar {
  display: none;
} */
/* .plug_in_item {
  left: -30px;
  top: -4px;
} */
.plug_in_btn {
  position: fixed;
  top: 65px;
  right: 50px;
  z-index: 9999999999999999999999999999999999999999999999999999999;
  background-color: red;
  padding: 8px 16px;
  color: white;
  border-radius: 10px;
  text-align: center;
}
</style>
