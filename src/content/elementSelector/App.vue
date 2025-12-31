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
  background-color: var(--color-accent) !important;
  color: white !important;
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
  border-radius: 4px;
  border: 1px solid #ff9e0b !important;
  color: #ff9e0b !important;
  margin-left: 12px;
  font-size: 12px !important;
  height: 20px !important;
  line-height: 20px !important;
  padding: 4px 8px;
}

.p_c_b_d_b_r_tag2 {
  background: #fff !important;
  border-radius: 4px;
  border: 1px solid #6dd400 !important;
  color: #00d435 !important;
  margin-left: 12px;
  font-size: 12px !important;
  height: 20px !important;
  line-height: 20px !important;
  padding: 4px 8px;
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
  padding: 0 20px 0 20px;
}
.p_c_b_d_info_box {
  margin-top: 20px;
  width: 140px;
  display: inline-block;
  /* margin-left: 8px; */
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
.c_obs {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 14px;
    color: #ccc;
    margin-top: 10px;
}
.p_c_b_d_info_box_item {
  margin-bottom: 8px;
}

/* 现代化选择器样式 */
.select-wrapper {
  position: relative;
  width: 100%;
}

.modern-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 10px 36px 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  font-family: 'PingFang SC', sans-serif;
}

.modern-select:hover {
  border-color: #60a5fa;
  background: #f9fafb;
}

.modern-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #ffffff;
}

.modern-select:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
  font-size: 10px;
  transition: transform 0.2s ease;
}

.modern-select:focus + .select-arrow {
  transform: translateY(-50%) rotate(180deg);
  color: #3b82f6;
}

/* 优化主容器样式 */
.plug_content_main_out {
  text-align: left;
  position: fixed;
  z-index: 99999999;
  bottom: 35px;
  width: 380px;
  height: 652px;
  background: #ffffff;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-sizing: border-box !important;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  right: 10px;
  left: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

/* 优化顶部样式 */
.plug_content_top {
  display: flex;
  align-items: center;
  width: 100%;
  height: 56px !important;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 16px;
}

.p_c_t_user {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.p_c_t_u_icon {
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.p_c_t_u_right {
  margin-left: auto;
  margin-right: 0;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  line-height: 22px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.p_c_t_u_right:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

/* 优化信息卡片样式 */
.p_c_b_d_info {
  padding: 16px 20px;
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
}

.p_c_b_d_info_box_item {
  margin-bottom: 16px;
  padding: 12px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.p_c_b_d_info_box_item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.p_c_b_d_info_box_item .f16 {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.p_c_b_d_info_box_item .f14 {
  font-size: 15px;
  color: #111827;
  font-weight: 500;
  line-height: 1.6;
}

/* 优化标签样式 */
.p_c_b_d_b_r_tag {
  background: #fef3c7 !important;
  border-radius: 6px;
  border: 1px solid #fbbf24 !important;
  color: #d97706 !important;
  margin-left: 0;
  font-size: 12px !important;
  height: auto !important;
  line-height: 1.4 !important;
  padding: 6px 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.p_c_b_d_b_r_tag::before {
  content: '⚠️';
  font-size: 14px;
}

.p_c_b_d_b_r_tag2 {
  background: #d1fae5 !important;
  border-radius: 6px;
  border: 1px solid #10b981 !important;
  color: #047857 !important;
  margin-left: 0;
  font-size: 12px !important;
  height: auto !important;
  line-height: 1.4 !important;
  padding: 6px 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.p_c_b_d_b_r_tag2::before {
  content: '✓';
  font-size: 14px;
}

/* 优化按钮样式 */
.p_c_b_d_bottom_btn {
  width: 100%;
  margin-bottom: 10px;
  height: 40px;
  color: #ffffff !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  border: none !important;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3), 0 2px 4px -1px rgba(102, 126, 234, 0.2);
  position: relative;
  overflow: hidden;
}

.p_c_b_d_bottom_btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.p_c_b_d_bottom_btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.4), 0 4px 6px -2px rgba(102, 126, 234, 0.3);
}

.p_c_b_d_bottom_btn:hover::before {
  left: 100%;
}

.p_c_b_d_bottom_btn:active {
  transform: translateY(0);
}

/* 优化悬浮球样式 */
.plug_in_bg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  padding: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.5);
  transition: all 0.3s ease;
  cursor: pointer;
}

.plug_in_bg:hover {
  transform: scale(1.1);
  box-shadow: 0 15px 30px -5px rgba(102, 126, 234, 0.6);
}

.plug_in_bg .f40 {
  font-size: 40px;
  color: #ffffff;
  font-weight: 600;
}

/* 优化登录输入框样式 */
.input-ui input {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  width: 100%;
  outline: none;
}

.input-ui input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-ui input::placeholder {
  color: #9ca3af;
}

/* 优化状态提示 */
.c_obs {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 10px;
  font-size: 14px;
  color: #6b7280;
  margin-top: 10px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

/* 优化加载状态 */
.f16 {
  font-size: 16px;
  color: #374151;
  font-weight: 500;
}

/* 优化验证码按钮 */
button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px -1px rgba(102, 126, 234, 0.3);
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}

.l_w_r {
  font-size: 13px;
  color: #6b7280;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-weight: 500;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .plug_content_main_out {
    width: calc(100vw - 20px);
    right: 10px;
  }
}

/* 滚动条美化 */
.p_c_b_d_info::-webkit-scrollbar {
  width: 6px;
}

.p_c_b_d_info::-webkit-scrollbar-track {
  background: transparent;
}

.p_c_b_d_info::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.p_c_b_d_info::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.p_c_b_d_info_box_item {
  animation: slideIn 0.3s ease forwards;
}

.p_c_b_d_info_box_item:nth-child(1) {
  animation-delay: 0.05s;
}

.p_c_b_d_info_box_item:nth-child(2) {
  animation-delay: 0.1s;
}

.p_c_b_d_info_box_item:nth-child(3) {
  animation-delay: 0.15s;
}

.p_c_b_d_info_box_item:nth-child(4) {
  animation-delay: 0.2s;
}
/* 现代化面板样式 */
.panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  background: #ffffff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-small {
  width: 28px;
  height: 28px;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.user-info .user-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.connection-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #059669;
}

.connection-indicator .dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
}

.header-close-btn {
  padding: 4px;
  color: #9ca3af;
  border-radius: 4px;
  background: transparent;
  transition: all 0.2s;
}

.header-close-btn:hover {
  background: #f3f4f6;
  color: #4b5563;
}

/* 登录样式 */
.login-wrapper {
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f9fafb;
}

.login-card {
  width: 100%;
  max-width: 320px;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-icon {
  width: 48px;
  height: 48px;
  background: #2563eb;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  overflow: hidden;
}

.login-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.login-header p {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.login-form .form-group {
  margin-bottom: 16px;
}

.login-form label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 6px;
}

.sms-input-group {
  display: flex;
  gap: 8px;
}

.sms-btn {
  white-space: nowrap;
  padding: 0 12px;
  font-size: 12px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
  border-radius: 8px;
}

.sms-timer {
  white-space: nowrap;
  padding: 0 12px;
  font-size: 12px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.login-submit-btn {
  width: 100%;
  padding: 10px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  margin-top: 8px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

/* 主界面样式 */
.panel-content {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
}

.main-wrapper {
  padding: 16px;
}

.candidate-card-new {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header-new {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.candidate-avatar-large {
  width: 44px;
  height: 44px;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.candidate-basic-info {
  flex: 1;
}

.name-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.candidate-name-new {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.sys-badge {
  font-size: 10px;
  background: #dbeafe;
  color: #1e40af;
  padding: 1px 6px;
  border-radius: 10px;
}

.candidate-tags-new {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-item {
  font-size: 11px;
  background: #f3f4f6;
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

.alert-success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.alert-warning {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.details-form-new {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field-new label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.time-display-new {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
}

.hint-text {
  font-size: 10px;
  color: #9ca3af;
  margin-left: 4px;
}

.native-select-wrapper {
  position: relative;
  width: 100%;
}

.styled-native-select {
  width: 100%;
  appearance: none;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 36px 10px 12px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.styled-native-select:hover {
  border-color: #d1d5db;
}

.styled-native-select:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.select-chevron-new {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #9ca3af;
}

.action-section-new {
  margin-top: 20px;
}

.btn-primary-new {
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;
}

.btn-primary-new:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3);
}

.btn-primary-new:active {
  transform: translateY(0);
}

.status-disabled-box {
  text-align: center;
  padding: 12px;
  background: #f3f4f6;
  color: #9ca3af;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.system-tip-new {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding: 10px;
  background: #eff6ff;
  border-radius: 10px;
  font-size: 12px;
  color: #1e40af;
  line-height: 1.5;
}

.panel-footer-new {
  padding: 12px 16px;
  background: #ffffff;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.status-dot-active {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.logout-btn-new {
  padding: 6px;
  color: #9ca3af;
  border-radius: 6px;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 12px;
}

.logout-btn-new:hover {
  color: #ef4444;
  background: #fee2e2;
}

/* 悬浮球样式更新 */
.floating-trigger {
  position: fixed;
  right: 20px;
  bottom: 80px;
  z-index: 10001;
  cursor: pointer;
}

.trigger-ball {
  width: 56px;
  height: 56px;
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.trigger-ball:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.trigger-text {
  font-size: 24px;
  font-weight: 700;
  color: #2563eb;
}

.trigger-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border: 2px solid white;
  border-radius: 50%;
}

.batch-trigger-item {
  position: absolute;
  left: -40px;
  top: 0;
  width: 32px;
  height: 32px;
  background: #111827;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  cursor: pointer;
  transition: all 0.2s;
}

.batch-trigger-item:hover {
  opacity: 1;
  transform: scale(1.1);
}

.batch-trigger-item img {
  width: 20px;
  height: 20px;
}

/* 覆盖原有容器样式以适配新面板 */
.plug_content_main_out {
  width: 380px !important;
  height: 600px !important;
  border-radius: 20px !important;
  overflow: hidden !important;
  border: none !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.plug_content_main_in {
  right: -400px !important;
}

/* Tab 切换样式 */
.top-tab-wrapper {
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  padding: 0 4px;
}

.tab-item-btn {
  flex: 1;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: none;
}

.tab-item-btn:hover {
  color: #2563eb;
  background: #f9fafb;
}

.tab-item-btn.is-active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background: #eff6ff;
}

.tab-item-btn.batch-tab.is-active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background: #eff6ff;
}

.tab-content-container {
  flex: 1;
  overflow-y: auto;
}

/* 批量自动发起界面样式 */
.batch-trigger-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  text-align: center;
}

.batch-icon-large {
  width: 64px;
  height: 64px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.batch-trigger-container h3 {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.batch-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 24px;
}

.batch-config-card {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.config-header {
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 8px 0;
}

.config-item:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.config-item span:first-child {
  color: #374151;
}

.config-item .val {
  color: #6b7280;
}

.btn-batch-start {
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);
  transition: all 0.2s;
  border: none;
}

.btn-batch-start:hover {
  background: #2564ebb4;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(58, 115, 237, 0.3);
}

.btn-batch-start:active {
  transform: translateY(0);
}

/* .overlay {
    position: fixed;
    top: 0;
    right: 0;
    width: 3vw;
    height: 100%;
    background: rgba(0, 0, 0, 0);
    pointer-events: none;
    z-index: 9999;
} */
</style>
