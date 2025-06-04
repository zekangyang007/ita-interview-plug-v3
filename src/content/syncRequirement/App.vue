<template>
  <!-- v-if="!isDemand" -->
  <div
    v-if="false"
    id="draggable"
    class="plug_in"
    style="position: fixed; bottom: 180px; right: 100px; z-index: 10000"
    @click="togglePlug"
  >
    <!-- <div class="plug_in_body">v1.28.36</div> -->
    <div
      :class="
        !isOpen && !isDemand ? 'plug_content_main_in' : 'plug_content_main_out'
      "
    >
      <div v-if="isPlugIn">
        <!-- 头部 -->
        <div v-if="!isLogin && !isDemand" class="plug_content_top">
          <div class="p_c_t_user">
            <div class="p_c_t_u_icon">U</div>
            <div class="p_c_t_u_name">{{ userInfo.userName }}</div>
          </div>
          <div class="p_c_t_u_right" @click.stop="closePlug">
            <span>收起 >></span>
          </div>
        </div>
        <div v-if="isLogin && !isDemand" class="plug_content_top">
          <div class="p_c_t_user">
            <div class="p_c_t_u_name">请登录</div>
          </div>
          <div class="p_c_t_u_right" @click.stop="closePlug">
            <span>收起 >></span>
          </div>
        </div>
        <!-- 内容 -->
        <div v-if="!isLogin && !isDemand">
          <div class="plug_content_body">
            <div class="p_c_b_detail p_c_b_d_experience">
              <div class="p_c_b_d_top">
                <div class="p_c_b_d_avator_box">
                  <img :src="candidate.avatar" alt="" />
                </div>
                <div class="p_c_b_d_box_right">
                  <div class="p_c_b_d_b_r_first">
                    <div class="p_c_b_d_b_r_first_left">
                      <span>{{ candidate.name }}</span>
                      <div></div>
                      <span
                        :class="
                          addStatus === '未加入'
                            ? 'pp--tag p_c_b_d_b_r_tag'
                            : 'pp--tag p_c_b_d_b_r_tag2'
                        "
                        >{{ addStatus }}</span
                      >
                    </div>
                  </div>
                  <div class="p_c_b_d_b_r_second">
                    <span v-if="candidate.age">{{ candidate.age }}</span>
                    <span v-if="candidate.age">·</span>
                    <span v-if="candidate.experienceLevel">{{
                      candidate.experienceLevel
                    }}</span>
                    <span class="p_activation">
                      <span
                        :class="
                          candidate.status.includes('活跃')
                            ? 'p_a_dot_green'
                            : 'p_a_dot'
                        "
                      ></span>
                      {{ candidate.status || '不活跃' }}
                    </span>
                  </div>
                  <div class="p_c_b_d_b_r_tag_list">
                    <span
                      v-for="(tag, index) in tags"
                      :key="index"
                      :class="`pp--tag tag_first_tag tag_b`"
                      >{{ tag }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="p_c_b_d_info">
                <div class="p_c_b_d_info_box">
                  <div>
                    <img
                      src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/plug-in-icon.png"
                      alt=""
                    />
                    <ui-input
                      :model-value="candidate.phone"
                      placeholder="填写手机号"
                    />
                  </div>
                </div>
                <div class="p_c_b_d_info_box">
                  <div>
                    <img
                      src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/plug-in-icon2.png"
                      alt=""
                    />
                    <ui-input
                      :model-value="candidate.wechat"
                      placeholder="填写微信号"
                    />
                  </div>
                </div>
                <div class="p_c_b_d_info_box">
                  <div>
                    <img
                      src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/plug-in-icon-email.png"
                      alt=""
                    />
                    <ui-input
                      :model-value="candidate.email"
                      placeholder="填写email"
                    />
                  </div>
                </div>
              </div>
              <div class="p_c_b_d_nextBody">
                <!--  -->
                <div
                  v-if="candidate.schoolTags.length > 0"
                  class="p_c_b_d_e_body"
                >
                  <div class="top_title test_body">
                    <div class="b_pt t_mr10" />
                    <div class="f16">高校亮点:</div>
                  </div>
                  <div class="area_body">
                    <div class="p_c_b_d_b_r_tag_list">
                      <span
                        v-for="(i, index) in candidate.schoolTags"
                        :key="index"
                        :class="`pp--tag tag_first_tag tag_b`"
                        >{{ i }}</span
                      >
                    </div>
                  </div>
                </div>
                <div v-if="!isLoading && !isDemand">
                  <!--  -->
                  <div v-if="analysisResult?.potential" class="p_c_b_d_e_body">
                    <div class="top_title test_body">
                      <div class="b_pt t_mr10" />
                      <div class="f16">发展潜力:</div>
                    </div>
                    <div class="area_body">
                      {{ analysisResult?.potential }}
                    </div>
                  </div>
                  <!--  -->
                  <div
                    v-if="analysisResult?.gapAnalysis"
                    class="p_c_b_d_e_body"
                  >
                    <div class="top_title test_body">
                      <div class="b_pt t_mr10" />
                      <div class="f16">空窗期分析:</div>
                    </div>
                    <div class="area_body">
                      {{ analysisResult?.gapAnalysis }}
                    </div>
                  </div>
                  <!--  -->
                  <div
                    v-if="analysisResult?.jobHopAnalysis"
                    class="p_c_b_d_e_body"
                    style="border-bottom: 0"
                  >
                    <div class="top_title test_body">
                      <div class="b_pt t_mr10" />
                      <div class="f16">跳槽频率分析:</div>
                    </div>
                    <div class="area_body">
                      {{ analysisResult?.jobHopAnalysis }}
                    </div>
                  </div>
                </div>
                <div
                  v-else
                  style="text-align: center; padding: 10px; height: 200px"
                >
                  <div class="f16">简历分析中,请稍后...</div>
                </div>
              </div>
              <div v-if="addStatus === '未加入'" class="p_c_b_d_bottom">
                <button
                  v-if="noSearch"
                  class="p_c_b_d_bottom_btn"
                  @click="addCandidateInfo"
                >
                  加入人才库
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- 未登录 -->
        <div v-if="isLogin && !isDemand">
          <div class="plug_content_body">
            <div class="p_c_b_detail" style="padding: 0 16px">
              <div class="p_c_b_d_info_box" style="width: 100%">
                <div>
                  <span>手机号：</span>
                  <ui-input
                    v-model="loginData.username"
                    placeholder="填写手机号"
                  />
                </div>
              </div>
              <div class="p_c_b_d_info_box" style="width: 100%">
                <div>
                  <span>验证码：</span>
                  <ui-input
                    v-model="loginData.verificationCode"
                    placeholder="填写验证码"
                  />
                  <button v-if="basicData.timeif" @click="clickCountSet">
                    发送验证码
                  </button>
                  <div v-else class="l_w_r">
                    {{ basicData.countDownNum }}秒后重新获取
                  </div>
                </div>
              </div>
              <button
                class="p_c_b_d_bottom_btn"
                style="margin-top: 20px"
                @click="login"
              >
                登录
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else style="display: flex; flex-direction: column; height: 100%">
        <!-- 头部 -->
        <div v-if="!isLogin && !isDemand" class="plug_content_top">
          <div class="p_c_t_user">
            <div class="p_c_t_u_icon">U</div>
            <div class="p_c_t_u_name">{{ userInfo.userName }}</div>
          </div>
          <div class="p_c_t_u_right" @click.stop="closePlug">
            <span>收起 >></span>
          </div>
        </div>
        <div
          style="
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          <div class="f16">暂无要分析的简历</div>
        </div>
      </div>
    </div>
    <!-- 悬浮球 -->
    <div v-show="!isPlugIn && !isDemand" class="plug_in_main">
      <div class="plug_in_bg">
        <div class="plug_in_img">
          <img
            src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/icon-128.png"
            alt=""
          />
        </div>
      </div>
    </div>
    <!-- 候选人 -->
    <div
      v-if="candidate.name && !isLogin && !isOpen && !isDemand"
      class="user_button"
    >
      <div>
        <div class="user_b_main">
          <img :src="candidate.avatar" alt="" />
          <span class="user_b_name u_overflow">{{ candidate.name }}</span>
        </div>
      </div>
    </div>
    <!-- 未登录 -->
    <div v-if="isLogin && !isDemand" class="user_button" style="right: -4px">
      <div>
        <div class="user_b_main">
          <span class="user_b_name u_overflow">未登录</span>
        </div>
      </div>
    </div>
    <!-- 悬浮球-后台管理 -->
    <div v-if="!isOpen && !isDemand" class="plug_in_item">
      <a
        href="https://test-hr.itasaas.com/#/"
        target="_blank"
        title="ITA面试后台管理"
      >
        <img
          src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/plug-in-home-icon.png"
          alt=""
        />
      </a>
    </div>
    <!-- <ui-button
      class="plug_in_button"
      variant="accent"
      @click="startSynchronization"
    >
      同步需求
    </ui-button> -->
  </div>
  <!-------------------------------------------------- 显示需求 ------------------------------------------------>
  <div
    v-if="false"
    id="draggable"
    class="plug_in"
    style="position: fixed; bottom: 180px; right: 100px; z-index: 10000"
  >
    <div
      :class="
        !isOpen && isDemand ? 'plug_content_main_in' : 'plug_content_main_out'
      "
    >
      <div v-if="isPlugIn && isDemand">
        <!-- 头部 -->
        <div v-if="!isLogin && isDemand" class="plug_content_top">
          <div class="p_c_t_user">
            <div class="p_c_t_u_icon">U</div>
            <div class="p_c_t_u_name">{{ userInfo.userName }}</div>
          </div>
          <div class="p_c_t_u_right" @click.stop="closePlug">
            <span>收起 >></span>
          </div>
        </div>
        <div v-if="isLogin && isDemand" class="plug_content_top">
          <div class="p_c_t_user">
            <div class="p_c_t_u_name">请登录</div>
          </div>
          <div class="p_c_t_u_right" @click.stop="closePlug">
            <span>收起 >></span>
          </div>
        </div>
        <!-- 内容 -->
        <div v-if="!isLogin && isDemand">
          <div class="plug_content_body">
            <div class="p_c_b_detail p_c_b_d_experience">
              <div class="disflex fl_dir_c p_20">
                <div class="f14 t_mb10">
                  <span>职位名称：</span>
                  <span>{{ demandObj.jobTitle }}</span>
                </div>
                <div class="f14 t_mb10">
                  <span>地点：</span>
                  <span>{{ demandObj.base }}</span>
                </div>
                <div class="f14 t_mb10">
                  <span>学历要求：</span>
                  <span>{{ demandObj.qualifications }}</span>
                </div>
                <div class="f14">
                  <span>薪资：</span>
                  <span>{{ demandObj.salary }}</span>
                </div>
              </div>
              <ui-select
                :model-value="selectValue"
                placeholder="选择岗位"
                class="mb-1 mt-4 w-full u_select_main"
                @change="updateData"
              >
                <option
                  v-for="(item, index) in selectOptions"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </ui-select>
              <div class="p_c_b_d_bottom">
                <button class="p_c_b_d_bottom_btn" @click="addCandidateInfo">
                  更新/添加
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- 未登录 -->
        <div v-if="isLogin && isDemand">
          <div class="plug_content_body">
            <div class="p_c_b_detail" style="padding: 0 16px">
              <div class="p_c_b_d_info_box" style="width: 100%">
                <div>
                  <span>手机号：</span>
                  <ui-input
                    v-model="loginData.username"
                    placeholder="填写手机号"
                  />
                </div>
              </div>
              <div class="p_c_b_d_info_box" style="width: 100%">
                <div>
                  <span>验证码：</span>
                  <ui-input
                    v-model="loginData.verificationCode"
                    placeholder="填写验证码"
                  />
                  <button v-if="basicData.timeif" @click="clickCountSet">
                    发送验证码
                  </button>
                  <div v-else class="l_w_r">
                    {{ basicData.countDownNum }}秒后重新获取
                  </div>
                </div>
              </div>
              <button
                class="p_c_b_d_bottom_btn"
                style="margin-top: 20px"
                @click="login"
              >
                登录
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else style="display: flex; flex-direction: column; height: 100%">
        <!-- 头部 -->
        <div v-if="!isLogin && isDemand" class="plug_content_top">
          <div class="p_c_t_user">
            <div class="p_c_t_u_icon">U</div>
            <div class="p_c_t_u_name">{{ userInfo.userName }}</div>
          </div>
          <div class="p_c_t_u_right" @click.stop="closePlug">
            <span>收起 >></span>
          </div>
        </div>
        <div
          style="
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          <div class="f16">暂无要分析的需求</div>
        </div>
      </div>
    </div>
    <!-- 悬浮球 -->
    <div v-show="!isPlugIn && isDemand" class="plug_in_main">
      <div class="plug_in_bg">
        <div class="plug_in_img">
          <img
            src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/icon-128.png"
            alt=""
          />
        </div>
      </div>
    </div>
    <!-- 候选人 -->
    <div
      v-if="candidate.name && !isLogin && !isOpen && isDemand"
      class="user_button"
    >
      <div>
        <div class="user_b_main">
          <img :src="candidate.avatar" alt="" />
          <span class="user_b_name u_overflow">显示需求</span>
        </div>
      </div>
    </div>
    <!-- 未登录 -->
    <div v-if="isLogin && isDemand" class="user_button" style="right: -4px">
      <div>
        <div class="user_b_main">
          <span class="user_b_name u_overflow">未登录(显示需求)</span>
        </div>
      </div>
    </div>
    <!-- 悬浮球-后台管理 -->
    <div v-if="!isOpen" class="plug_in_item">
      <a
        href="https://test-hr.itasaas.com/#/"
        target="_blank"
        title="ITA面试后台管理"
      >
        <img
          src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/plug-in-home-icon.png"
          alt=""
        />
      </a>
    </div>
  </div>
  <!-- 停止插件 -->
  <button v-if="false" class="plug_in_btn" @click="stopPlugin">停止插件</button>
</template>
<script setup>
import {
  onMounted,
  reactive,
  onBeforeUnmount,
  shallowReactive,
  watch,
  ref,
  computed,
  inject,
} from 'vue';
import browser from 'webextension-polyfill';
import cloneDeep from 'lodash.clonedeep';
import workflowParameters from '@business/parameters';
import { sendMessage } from '@/utils/message';
import { debounce } from '@/utils/helper';
import { nanoid } from 'nanoid';
import ParameterInputValue from '@/components/newtab/workflow/edit/Parameter/ParameterInputValue.vue';
import ParameterJsonValue from '@/components/newtab/workflow/edit/Parameter/ParameterJsonValue.vue';
import { tasks } from '@/utils/shared';
import defu from 'defu';
import { set } from 'object-path';

const isDemand = ref(false);

const isStop = ref(false);

const isLogin = ref(false);
const isLoading = ref(false);
const loginData = reactive({
  username: '',
  verificationCode: '',
});

const addStatus = ref('未加入');

// 发送验证码的一些数据
const basicData = reactive({
  countDownNum: 60, // 重新发送验证码的倒计时
  timeif: true, // 是否可以点击发送验证码的按钮
});

const token = ref('');
const clientId = ref('');
const userInfo = reactive({
  userName: '登录人',
  userId: '',
  token: '',
  clientId: '',
});

const isPlugIn = ref(false);
const isOpen = ref(false);
// 候选人
const candidate = reactive({
  name: '',
  age: '',
  avatar: '',
  email: '',
  phone: '',
  wechat: '',
  degree: '',
  experienceLevel: '',
  status: '',
  position: '',
  department: '',
  schoolTags: [],
});

// 需求
const demandObj = ref();

const selectValue = ref('');
const selectOptions = ref([
  {
    value: '1',
    label: '岗位1',
  },
  {
    value: '2',
    label: '岗位2',
  },
]);

const updateData = (val) => {
  selectValue.value = val;
};

const analysisResult = ref(null);
const tags = ref([]);
const candidateInfo = ref({
  name: '',
});

const getLoginCode = async (phone) => {
  try {
    const requestOptions = {
      method: 'GET',
    };
    const response = await fetch(
      `https://interview-api.itasaas.com/resource/sms/code?phonenumber=${phone}`,
      requestOptions
    );

    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json(); // 假设返回的是 JSON 格式
    return result;
  } catch (error) {
    console.error('请求出错：', error);
    return error;
  }
};
// 发送验证码的定时器实例，清除时用
let times;

/**
 * 清除发送验证码的定时器
 */
const clearTime = () => {
  basicData.timeif = true;
  clearInterval(times);
};

const clickCountSet = async () => {
  const phoneRegex = /^1[345789]\d{9}$/;

  if (!phoneRegex.test(loginData.username)) {
    return;
  }
  const res = await getLoginCode(loginData.username);
  if (res.code === 200) {
    basicData.timeif = false;
    basicData.countDownNum = 60;
    times = setInterval(() => {
      basicData.countDownNum -= 1;
      if (basicData.countDownNum <= -1) {
        clearTime();
      }
    }, 1000);
  } else if (res.code === 500) {
    return;
  }
};

const paramsList = {
  string: {
    id: 'string',
    name: 'Input (string)',
    valueComp: ParameterInputValue,
  },
  json: {
    id: 'json',
    name: 'Input (JSON)',
    valueComp: ParameterJsonValue,
  },
};

const inputRef = ref(null);
const state = shallowReactive({
  query: '',
  active: false,
  workflows: [],
  shortcutKeys: [],
  selectedIndex: -1,
});
const paramsState = reactive({
  items: [],
  workflow: {},
  active: false,
  paramNames: [],
  activeIndex: 0,
  inputtedVal: '',
});

const rootElement = inject('rootElement');

const workflows = computed(() =>
  state.workflows.filter((workflow) =>
    workflow.name.toLocaleLowerCase().includes(state.query.toLocaleLowerCase())
  )
);

function clearParamsState() {
  Object.assign(paramsState, {
    items: [],
    workflow: {},
    active: false,
    activeIndex: 0,
    inputtedVal: '',
  });
}
function sendExecuteCommand(workflow, options = {}) {
  const workflowData = {
    ...workflow,
    includeTabId: true,
    options: { ...options, checkParams: false },
  };

  sendMessage('workflow:execute', workflowData, 'background');
  state.active = false;
}
function executeWorkflow(workflow) {
  if (!workflow) return;

  let triggerData = workflow.trigger;
  if (!triggerData) {
    const triggerNode = workflow.drawflow?.nodes?.find(
      (node) => node.label === 'trigger'
    );
    triggerData = triggerNode?.data;
  }

  if (triggerData?.parameters?.length > 0) {
    const keys = new Set();
    const params = [];
    triggerData.parameters.forEach((param) => {
      if (keys.has(param.name)) return;

      params.push(param);
      keys.add(param.name);
    });

    const parameters = cloneDeep(triggerData.parameters).map((item) => ({
      ...item,
      value: item.defaultValue,
    }));

    paramsState.workflow = workflow;
    paramsState.items = parameters;

    paramsState.active = true;
  } else {
    sendExecuteCommand(workflow);
  }

  if (inputRef.value) {
    inputRef.value.value = '';
  }
  state.query = '';
  paramsState.inputtedVal = '';
}
function onKeydown(event) {
  const { ctrlKey, altKey, metaKey, key, shiftKey } = event;

  if (key === 'Escape') {
    if (paramsState.active) {
      clearParamsState();
    } else {
      state.active = false;
    }
    return;
  }

  const shortcuts = window._automaShortcuts;
  if (!shortcuts || shortcuts.length < 1) return;

  const automaShortcut = shortcuts.every((shortcutKey) => {
    if (shortcutKey === 'mod') return ctrlKey || metaKey;
    if (shortcutKey === 'shift') return shiftKey;
    if (shortcutKey === 'option') return altKey;

    return shortcutKey === key.toLowerCase();
  });
  if (automaShortcut) {
    event.preventDefault();
    state.active = true;
    state.shortcutKeys = shortcuts;
  }
}
function checkInView(container, element, partial = false) {
  const cTop = container.scrollTop;
  const cBottom = cTop + container.clientHeight;

  const eTop = element.offsetTop;
  const eBottom = eTop + element.clientHeight;

  const isTotal = eTop >= cTop && eBottom <= cBottom;
  const isPartial =
    partial &&
    ((eTop < cTop && eBottom > cTop) || (eBottom > cBottom && eTop < cBottom));

  return isTotal || isPartial;
}

// watch(inputRef, () => {
//   if (!inputRef.value) return;

//   inputRef.value.focus();
// });
// watch(
//   () => state.active,
//   async () => {
//     if (!state.retrieved && state.active) {
//       const {
//         workflows: localWorkflows,
//         workflowHosts,
//         teamWorkflows,
//       } = await browser.storage.local.get([
//         'workflows',
//         'workflowHosts',
//         'teamWorkflows',
//       ]);
//       state.workflows = [
//         ...Object.values(workflowHosts || {}),
//         ...Object.values(localWorkflows || {}),
//         ...Object.values(Object.values(teamWorkflows || {})[0] || {}),
//       ];

//       state.retrieved = true;
//     } else if (!state.active) {
//       clearParamsState();
//       state.query = '';
//       state.selectedIndex = -1;
//     }
//   }
// );
// watch(
//   () => state.selectedIndex,
//   debounce((activeIndex) => {
//     const container = rootElement.shadowRoot.querySelector(
//       '#workflows-container .workflows-list'
//     );
//     const element = rootElement.shadowRoot.querySelector(
//       `#list-item-${activeIndex}`
//     );

//     if (element && !checkInView(container, element)) {
//       element.scrollIntoView({
//         block: 'nearest',
//         behavior: 'smooth',
//       });
//     }
//   }, 100)
// );

// window.initPaletteParams = (data) => {
//   paramsState.items = data.params;
//   paramsState.workflow = data.workflow;
//   paramsState.active = true;

//   state.active = true;
// };

const getIframeByNameMain = (name) => {
  return document.querySelector(`iframe[name="${name}"]`);
};

const dialogVisible = ref(false);
const checkIframeElement = () => {
  console.log(window.location.href, 'window.location.href');
  // 首先检查页面上是否存在 page-content
  const resumeWrap = document.querySelector('.page-content');
  if (resumeWrap) {
    // 如果存在 page-content，监听这个元素
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // 检查新增的节点
        if (mutation.addedNodes.length) {
          const resumeBox = document.querySelector('.resume-box');
          if (resumeBox) {
            dialogVisible.value = true;
            console.log('resume-box appeared');
          }
        }

        // 检查删除的节点
        if (mutation.removedNodes.length) {
          const resumeBox = document.querySelector('.resume-box');
          if (!resumeBox) {
            dialogVisible.value = false;
            console.log('resume-box disappeared');
          }
        }
      }
    });

    observer.observe(resumeWrap, {
      childList: true,
      subtree: true,
    });

    // 初始检查一次当前状态
    const initialResumeBox = document.querySelector('.resume-box');
    dialogVisible.value = !!initialResumeBox;

    // 返回清理函数
    return () => observer.disconnect();
  }
  // 如果不存在 page-content，则检查 iframe

  let iframe = document.getElementsByTagName('iframe')[0];

  if (window.location.href === 'https://www.zhipin.com/web/chat/search') {
    iframe = null;
    iframe = getIframeByNameMain('searchFrame');
  } else if (
    window.location.href === 'https://www.zhipin.com/web/chat/resume'
  ) {
    iframe = null;
    iframe = getIframeByNameMain('recommendFrame');
  }
  if (!iframe) return false;
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  const seachDom = iframeDoc.querySelector('.search-container');
  if (seachDom) {
    // 如果存在 page-content，监听这个元素
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // 检查新增的节点
        if (mutation.addedNodes.length) {
          const resumeWrapDom = document.querySelector('.resume-detail-wrap');

          if (resumeWrapDom) {
            dialogVisible.value = true;
            console.log('resume-detail-wrap appeared');
          }
        }

        // 检查删除的节点
        if (mutation.removedNodes.length) {
          const resumeWrapDom = document.querySelector('.resume-detail-wrap');
          if (!resumeWrapDom) {
            dialogVisible.value = false;
            console.log('resume-detail-wrap disappeared');
          }
        }
      }
    });

    observer.observe(seachDom, {
      childList: true,
      subtree: true,
    });

    // 初始检查一次当前状态
    const initialResumeBox = document.querySelector('.resume-detail-wrap');
    dialogVisible.value = !!initialResumeBox;

    // 返回清理函数
    return () => observer.disconnect();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // 检查新增的节点
      if (mutation.addedNodes.length) {
        const dialogContainer = iframeDoc.querySelector('.dialog-container');
        if (dialogContainer) {
          dialogVisible.value = true;
          console.log('dialog-container appeared');
        }
      }

      // 检查删除的节点
      if (mutation.removedNodes.length) {
        const dialogContainer = iframeDoc.querySelector('.dialog-container');
        if (!dialogContainer) {
          dialogVisible.value = false;
          console.log('dialog-container disappeared');
        }
      }
    }
  });

  observer.observe(iframeDoc.body, {
    childList: true,
    subtree: true,
  });

  // 初始检查一次当前状态
  const initialDialog = iframeDoc.querySelector('.dialog-container');
  dialogVisible.value = !!initialDialog;

  // 返回清理函数
  return () => observer.disconnect();
};

/**
 * 获取简历内容-并分析
 */
const resumeContentData = ref('');
const bosssAnalysis = async () => {
  if (window.location.href === 'https://www.zhipin.com/web/chat/search') {
    // 关闭简历对话框，要清除简历信息
    isPlugIn.value = false;
    candidate.name = '';
    candidate.age = '';
    candidate.avatar = '';
    candidate.email = '';
    candidate.phone = '';
    candidate.position = '';
    candidate.department = '';
    candidate.status = '';
    candidate.wechat = '';
    analysisResult.value = null;
    addStatus.value = '未加入';
    tags.value = [];
    setTimeout(() => {
      checkIframeElement();
    }, 1000);
    return;
  }
  const iframe = document.getElementsByTagName('iframe')[0];
  let resumeContent = '';
  if (iframe) {
    // 获取iframe的document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const innerText_data = iframeDoc.querySelector(
      '.resume-item-content'
    ).innerText;
    let searchStr = '牛人分析器';
    const indexText = innerText_data.indexOf(searchStr);
    if (indexText !== -1) {
      resumeContent = innerText_data.substring(0, indexText);
    } else {
      searchStr = '为妥善保护牛人在BOSS直聘平台提交';
      const indexText2 = innerText_data.indexOf(searchStr);
      if (indexText2 !== -1) {
        resumeContent = innerText_data.substring(0, indexText2);
      } else {
        resumeContent = innerText_data;
      }
    }
    resumeContentData.value = resumeContent;
    const myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      token.value // 请替换为您的实际令牌
    );
    myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: resumeContent,
    };
    try {
      const response = await fetch(
        'https://interview-api.itasaas.com/api/v1/business/candidate/analyze-online',
        requestOptions
      );
      const result = await response.json();
      if (result.code === 200) {
        isLoading.value = false;
        analysisResult.value = result.data || null;
        tags.value = result.data?.tags || [];
      } else {
        isLoading.value = false;
      }
      return result;
    } catch (error) {
      isLoading.value = false;
      console.log('error', error);
      return error;
    }
  }
};
/**
 * 获取简历内容-并分析
 */
const bosssAnalysiscommunication = async () => {
  const resumeBox = document.querySelector('.resume-box');
  let resumeContent = '';
  if (resumeBox) {
    const innerText_data = resumeBox.querySelector('div > div > div').innerText;
    let searchStr = '牛人分析器';
    const indexText = innerText_data.indexOf(searchStr);
    if (indexText !== -1) {
      resumeContent = innerText_data.substring(0, indexText);
    } else {
      searchStr = '为妥善保护牛人在BOSS直聘平台提交';
      const indexText2 = innerText_data.indexOf(searchStr);
      if (indexText2 !== -1) {
        resumeContent = innerText_data.substring(0, indexText2);
      } else {
        resumeContent = innerText_data;
      }
    }
    resumeContentData.value = resumeContent;
    const myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      token.value // 请替换为您的实际令牌
    );
    myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: resumeContent,
    };
    try {
      const response = await fetch(
        'https://interview-api.itasaas.com/api/v1/business/candidate/analyze-online',
        requestOptions
      );
      const result = await response.json();
      if (result.code === 200) {
        isLoading.value = false;
        analysisResult.value = result.data || null;
        tags.value = result.data?.tags || [];
      } else {
        isLoading.value = false;
      }
      return result;
    } catch (error) {
      isLoading.value = false;
      console.log('error', error);
      return error;
    }
  }
};
/**
 * 获取搜索牛人简历内容-并分析
 */
const bosssAnalysiscommunicationSearch = async () => {
  const resumeBox = document.querySelector('.resume-middle-wrap');
  let resumeContent = '';
  if (resumeBox) {
    const innerText_data = resumeBox.querySelector(
      '.resume-center-side'
    ).innerText;
    let searchStr = '牛人分析器';
    const indexText = innerText_data.indexOf(searchStr);
    if (indexText !== -1) {
      resumeContent = innerText_data.substring(0, indexText);
    } else {
      searchStr = '为妥善保护牛人在BOSS直聘平台提交';
      const indexText2 = innerText_data.indexOf(searchStr);
      if (indexText2 !== -1) {
        resumeContent = innerText_data.substring(0, indexText2);
      } else {
        resumeContent = innerText_data;
      }
    }
    resumeContentData.value = resumeContent;
    const myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      token.value // 请替换为您的实际令牌
    );
    myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: resumeContent,
    };
    try {
      const response = await fetch(
        'https://interview-api.itasaas.com/api/v1/business/candidate/analyze-online',
        requestOptions
      );
      const result = await response.json();
      if (result.code === 200) {
        isLoading.value = false;
        analysisResult.value = result.data || null;
        tags.value = result.data?.tags || [];
      } else {
        isLoading.value = false;
      }
      return result;
    } catch (error) {
      isLoading.value = false;
      console.log('error', error);
      return error;
    }
  }
};

/**
 * 添加候选人信息到人才库
 */
const addCandidateInfo = async () => {
  candidateInfo.value.name = candidate.name;
  candidateInfo.value.degree = candidate.degree;
  candidateInfo.value.experienceLevel = candidate.experienceLevel;
  candidateInfo.value.email = candidate.email;
  candidateInfo.value.phoneNumber = candidate.phone;
  const data = {
    resume: resumeContentData.value,
    matchParams: `${candidate.age},${candidate.degree},${candidate.experienceLevel}`,
  };
  delete candidateInfo.value.id;
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(data),
  };
  try {
    const response = await fetch(
      'https://interview-api.itasaas.com/api/v1/business/candidate/online-create',
      requestOptions
    );
    const result = await response.json();
    if (result.code === 200) {
      addStatus.value = '已加入';
    }
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * 获取岗位列表
 */
const getJobList = async () => {
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID
  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };
  try {
    const response = await fetch(
      'https://interview-api.itasaas.com/api/v1/business/position/list',
      requestOptions
    );
    const result = await response.json();
    if (result.code === 200) {
      const arr = result.rows.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      selectOptions.value = arr;
    }
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};
/**
 * 解析教育经历
 */
const noSearch = ref(true);
const parseEducationInfo = (html, type) => {
  // 创建一个临时的DOM解析器
  // const parser = new DOMParser();
  // const doc = parser.parseFromString(html, 'text/html');
  // 初始化结果数组
  const result = [];
  noSearch.value = true;

  try {
    if (type === 'iframe') {
      // 找到主容器
      const mainContent = html.querySelector('.resume-item-content');

      if (!mainContent) return result;

      // 找到所有resume-item元素
      const resumeItems = mainContent.querySelectorAll('.resume-item');

      // 遍历找到教育经历部分
      for (const item of resumeItems) {
        const titleElement = item.querySelector('h3.title');
        if (titleElement && titleElement.textContent.trim() === '教育经历') {
          // 找到教育经历下的history-list
          const historyList = item.querySelector('.history-list');
          if (historyList) {
            // 遍历所有history-item
            const historyItems = historyList.querySelectorAll('.history-item');

            historyItems.forEach((historyItem) => {
              const educationInfo = {
                name: '',
                fullName: '',
                isFullTime: true,
                tags: [],
              };

              // 获取学校名称
              const nameElement = historyItem.querySelector('.name b');
              const fullnameElement = historyItem.querySelector('.name');
              if (nameElement) {
                educationInfo.name = nameElement.textContent.trim();
                educationInfo.fullName = fullnameElement.textContent.trim();
                if (educationInfo.fullName.includes('非全日制')) {
                  educationInfo.isFullTime = false;
                }
              }

              // 获取标签
              const tagsContainer = historyItem.querySelector('.school-tags');
              if (tagsContainer) {
                const tagElements = tagsContainer.querySelectorAll('span');
                tagElements.forEach((tag) => {
                  educationInfo.tags.push(
                    tag.textContent.trim() +
                      `${!educationInfo.isFullTime ? ` · 非全日制` : ``}`
                  );
                });
              }

              result.push(educationInfo);
            });
          }
          break; // 找到教育经历后就可以退出循环了
        }
      }
    } else if (type === 'resumeBox') {
      // 找到主容器
      const mainContent = html.querySelector('div > div > div');

      if (!mainContent) return result;
      // 找到所有resume-item元素
      const resumeItems = mainContent.querySelectorAll('.resume-item');

      // 遍历找到教育经历部分
      for (const item of resumeItems) {
        const titleElement = item.querySelector('h3.title');
        if (titleElement && titleElement.textContent.trim() === '教育经历') {
          // 找到教育经历下的history-list
          const historyList = item.querySelector('.history-list');
          if (historyList) {
            // 遍历所有history-item
            const historyItems = historyList.querySelectorAll('.history-item');

            historyItems.forEach((historyItem) => {
              const educationInfo = {
                name: '',
                fullName: '',
                isFullTime: true,
                tags: [],
              };

              // 获取学校名称
              const nameElement = historyItem.querySelector('.name b');
              const fullnameElement = historyItem.querySelector('.name');
              if (nameElement) {
                educationInfo.name = nameElement.textContent.trim();
                educationInfo.fullName = fullnameElement.textContent.trim();
                if (educationInfo.fullName.includes('非全日制')) {
                  educationInfo.isFullTime = false;
                }
              }

              // 获取标签
              const tagsContainer = historyItem.querySelector('.school-tags');
              if (tagsContainer) {
                const tagElements = tagsContainer.querySelectorAll('span');
                tagElements.forEach((tag) => {
                  educationInfo.tags.push(
                    tag.textContent.trim() +
                      `${!educationInfo.isFullTime ? ` · 非全日制` : ``}`
                  );
                });
              }

              result.push(educationInfo);
            });
          }
          break; // 找到教育经历后就可以退出循环了
        }
      }
    } else if (type === 'resumeWrapDom') {
      noSearch.value = false;
      const mainContent = html;
      if (!mainContent) return result;
      // 找到所有resume-item元素
      const resumeItems = mainContent.querySelectorAll('.resume-section');
      // 遍历找到教育经历部分
      for (const item of resumeItems) {
        const titleElement = item.querySelector('.section-title');
        if (titleElement && titleElement.textContent.trim() === '教育经历') {
          // 找到教育经历下的history-list
          const historyList = item.querySelector('.section-content');
          if (historyList) {
            // 遍历所有history-item
            const historyItems = historyList.querySelectorAll('.edu-wrap');

            historyItems.forEach((historyItem) => {
              const educationInfo = {
                name: '',
                fullName: '',
                isFullTime: true,
                tags: [],
              };

              // 获取学校名称
              const nameElement = historyItem.querySelector(
                '.school-name-wrap .school-name'
              );
              const fullnameElement =
                historyItem.querySelector('.school-name-wrap');
              if (nameElement) {
                educationInfo.name = nameElement.textContent.trim();
                educationInfo.fullName = fullnameElement.textContent.trim();
                if (educationInfo.fullName.includes('非全日制')) {
                  educationInfo.isFullTime = false;
                }
              }

              // 获取标签
              const tagsContainer = historyItem.querySelector('.tags');
              if (tagsContainer) {
                const tagElements = tagsContainer.querySelectorAll('span');
                tagElements.forEach((tag) => {
                  educationInfo.tags.push(
                    tag.textContent.trim() +
                      `${!educationInfo.isFullTime ? ` · 非全日制` : ``}`
                  );
                });
              }

              result.push(educationInfo);
            });
          }
          break; // 找到教育经历后就可以退出循环了
        }
      }
    }
  } catch (error) {
    console.error('解析出错:', error);
  }

  return result;
};

const repetitionVerify = async (name, matchParams) => {
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };
  try {
    const response = await fetch(
      `https://interview-api.itasaas.com/api/v1/business/candidate/list?name=${name}&matchParams=${matchParams}`,
      requestOptions
    );
    const result = await response.json();
    if (result.code === 200) {
      if (result.rows.length > 0) {
        addStatus.value = '已加入';
      }
    }
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * 从页面上那基本简历信息
 */
const getCandidateInfo = () => {
  isLoading.value = true;
  const pageContent = document.querySelector('.page-content');
  const resumeBox = document.querySelector('.resume-box');
  const resumeWrapDom = document.querySelector('.resume-detail-wrap');
  if (!pageContent) {
    const iframe = document.getElementsByTagName('iframe')[0];
    console.log(resumeWrapDom, 'resumeWrapDom');
    if (resumeWrapDom) {
      candidate.name = resumeWrapDom.querySelector('.geek-name')?.innerText;
      candidate.avatar = resumeWrapDom.querySelector('.avatar-wrap img')?.src;
      if (resumeWrapDom.querySelector('.active-status')) {
        candidate.status =
          resumeWrapDom.querySelector('.active-status')?.innerText || null;
      } else {
        candidate.status = '在线';
      }
      const spans = resumeWrapDom.querySelectorAll(
        '.info-labels .join-text-wrap'
      );
      const texts = Array.from(spans).map((span) => span.innerText.trim());
      candidate.age = texts[0] || '';
      candidate.degree = texts[1] || '';
      candidate.experienceLevel = texts[2] || '';
      const parseEducationInfoData = parseEducationInfo(
        resumeWrapDom,
        'resumeWrapDom'
      );
      const new_arr = [];
      parseEducationInfoData.forEach((item) => {
        item.tags.forEach((mitem) => {
          new_arr.push(mitem);
        });
      });
      candidate.schoolTags = new_arr || [];
      repetitionVerify(
        candidate.name,
        `${candidate.age},${candidate.degree},${candidate.experienceLevel}`
      );

      bosssAnalysiscommunicationSearch();
      return;
    }
    if (iframe) {
      // 获取iframe的document
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const jobListContent =
        iframeDoc.querySelector('.job-list-content') || null;
      const resumeContent = iframeDoc.querySelector('.resume-item-pop-box');
      console.log(jobListContent, 'jobListContent');
      if (jobListContent) {
        const css = `
        .sync-btn {
          padding: 4px 12px;
          background: #00bec1;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          margin-right: 10px;
        }
        .sync-btn:hover {
          background: #00a2a5;
        }`;

        const style = iframeDoc.createElement('style');
        style.id = 'sync-btn-styles';
        style.textContent = css;
        iframeDoc.head.appendChild(style);
        isDemand.value = true;
        // 遍历所有职位条目
        jobListContent.querySelectorAll('li').forEach((li) => {
          // 创建同步按钮
          const syncBtn = document.createElement('button');
          syncBtn.textContent = '同步需求';
          syncBtn.className = 'sync-btn'; // 添加样式类名

          // 添加到操作按钮容器（根据实际DOM结构调整选择器）
          const operationContainer = li.querySelector('.operation-container');
          if (operationContainer) {
            operationContainer.prepend(syncBtn); // 插入到操作区最前面
          }

          // 添加点击事件
          syncBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            // 获取被点击的 li 元素
            const targetLi = event.currentTarget.closest('li');

            const salary_limit_name = targetLi.querySelector(
              '.info-labels span:nth-child(7)'
            )?.textContent;
            // 示例：获取关键数据
            let salary_limit = '';
            if (salary_limit_name) {
              if (salary_limit_name.indexOf('K') !== -1) {
                salary_limit = salary_limit_name.split('K')[0] + 'K';
              }
            }
            const jobData = {
              encrypt_id: targetLi.dataset.id,
              jobTitle: targetLi
                .querySelector('.job-title a')
                .textContent.trim(),
              base: targetLi.querySelector('.info-labels span:nth-child(1)')
                ?.textContent,
              qualifications: targetLi.querySelector(
                '.info-labels span:nth-child(5)'
              )?.textContent,
              salary: salary_limit,
            };
            console.log('点击的职位信息：', jobData);
            demandObj.value = jobData;
            if (!isPlugIn.value && !isOpen.value) {
              isPlugIn.value = true;
              isOpen.value = true;
            }
            // 这里可以添加你的业务逻辑
          });
        });
      } else {
        setTimeout(() => {
          document
            .getElementsByTagName('iframe')[0]
            .contentDocument.querySelector('.resume-next')
            ?.addEventListener('click', () => {
              setTimeout(() => {
                getCandidateInfo();
              }, 1000);
            });
          document
            .getElementsByTagName('iframe')[0]
            .contentDocument.querySelector('.resume-prev')
            ?.addEventListener('click', () => {
              setTimeout(() => {
                getCandidateInfo();
              }, 1000);
            });
        }, 1000);
        candidate.name = iframeDoc.querySelector('.geek-name')?.innerText;
        candidate.avatar = iframeDoc.querySelector('.figure img')?.src;
        if (iframeDoc.querySelector('.online-marker')) {
          candidate.status = '在线';
        } else {
          candidate.status =
            iframeDoc.querySelector('.text-orange')?.innerText || '';
        }
        const spans = iframeDoc.querySelectorAll('.info-labels .label-text');
        const texts = Array.from(spans).map((span) => span.innerText.trim());
        candidate.age = texts[0];
        candidate.degree = texts[1];
        candidate.experienceLevel = texts[2];

        const parseEducationInfoData = parseEducationInfo(
          resumeContent,
          'iframe'
        );
        const new_arr = [];
        parseEducationInfoData.forEach((item) => {
          item.tags.forEach((mitem) => {
            new_arr.push(mitem);
          });
        });
        candidate.schoolTags = new_arr || [];
        repetitionVerify(
          candidate.name,
          `${candidate.age},${candidate.degree},${candidate.experienceLevel}`
        );

        bosssAnalysis();
      }
    }
  } else if (resumeBox) {
    if (resumeBox) {
      candidate.name = resumeBox.querySelector('.geek-name')?.innerText;
      candidate.avatar = resumeBox.querySelector('.figure img')?.src;
      if (resumeBox.querySelector('.online-marker')) {
        candidate.status = '在线';
      } else {
        candidate.status =
          resumeBox.querySelector('.text-orange')?.innerText || '';
      }
      const spans = resumeBox.querySelectorAll('.info-labels .label-text');
      const texts = Array.from(spans).map((span) => span.innerText.trim());
      candidate.age = texts[0];
      candidate.degree = texts[1];
      candidate.experienceLevel = texts[2];
      const parseEducationInfoData = parseEducationInfo(resumeBox, 'resumeBox');
      const new_arr = [];
      parseEducationInfoData.forEach((item) => {
        item.tags.forEach((mitem) => {
          new_arr.push(mitem);
        });
      });
      candidate.schoolTags = new_arr || [];
      repetitionVerify(
        candidate.name,
        `${candidate.age},${candidate.degree},${candidate.experienceLevel}`
      );

      bosssAnalysiscommunication();
    }
  }
};

/**
 * 监听boss简历dialogVisible的变化
 */
// watch(dialogVisible, (newValue) => {
//   // console.log('Dialog visibility changed:', newValue);
//   // 这里可以执行任何你需要的逻辑
//   // 打开简历对话框
//   // 关闭简历对话框，要清除简历信息
//   if (newValue) {
//     if (!isLogin.value) {
//       if (isOpen.value) {
//         isPlugIn.value = true;
//         setTimeout(() => {
//           getCandidateInfo();
//         }, 1000);
//         return;
//       }
//     }
//     setTimeout(() => {
//       getCandidateInfo();
//     }, 1000);
//   } else {
//     // 关闭简历对话框，要清除简历信息
//     isPlugIn.value = false;
//     candidate.name = '';
//     candidate.age = '';
//     candidate.avatar = '';
//     candidate.email = '';
//     candidate.phone = '';
//     candidate.position = '';
//     candidate.department = '';
//     candidate.status = '';
//     candidate.wechat = '';
//     analysisResult.value = null;
//     addStatus.value = '未加入';
//     tags.value = [];
//   }
// });

const togglePlug = () => {
  if (isLogin.value) {
    isPlugIn.value = true;
    isOpen.value = true;
    return;
  }
  if (candidate.name) {
    isPlugIn.value = true;
    isOpen.value = true;
    return;
  }
  isPlugIn.value = false;
  isOpen.value = true;
};

const closePlug = () => {
  isOpen.value = false;
  isPlugIn.value = false;
};

const postLogin = async () => {
  const raw = {
    rememberMe: true,
    clientId: '2993ad2b820949d59ca8be859053dadc',
    grantType: 'sms',
    phonenumber: loginData.username,
    smsCode: loginData.verificationCode,
  };
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
    },
    body: JSON.stringify(raw),
  };
  try {
    const response = await fetch(
      'https://interview-api.itasaas.com/auth/login',
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('请求出错：', error);
    return error;
  }
};

const getInfo = async () => {
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };
  try {
    const response = await fetch(
      'https://interview-api.itasaas.com/system/user/getInfo',
      requestOptions
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

const login = async () => {
  const res = await postLogin();
  if (res.code === 200) {
    await browser.storage.local.set({
      token: `Bearer ${res.data.access_token}`,
    });
    await browser.storage.local.set({ clientId: res.data.client_id });
    token.value = `Bearer ${res.data.access_token}`;
    clientId.value = res.data.client_id;
    const user = await getInfo();
    if (user.code === 200) {
      await browser.storage.local.set({ userInfo: user.data.user });
      loginData.username = null;
      loginData.verificationCode = null;
      userInfo.userName = user.data.user.nickName;
      userInfo.userId = user.data.user.userId;
      isPlugIn.value = false;
      isLogin.value = false;
      await getJobList();
    }
  } else {
    return;
  }
};

let plugTime = null;

let draggable = null;
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

const setTranslate = (xPos, yPos, el) => {
  console.log('setTranslate', xPos, yPos, el);
  el.style.transform = `translate(${xPos}px, ${yPos}px)`;
};

const dragStart = (e) => {
  if (e.type === 'touchstart') {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
  }
  console.log('dragStart', draggable);
  console.log('target', e.target);
  // if (e.target === draggable) {
  // }
  isDragging = true;
};

const drag = (e) => {
  if (isDragging) {
    e.preventDefault();

    if (e.type === 'touchmove') {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
    } else {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
    }

    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, draggable);
  }
};

const dragEnd = (e) => {
  initialX = currentX;
  initialY = currentY;
  isDragging = false;
};

onMounted(async () => {
  // browser.storage.local.get('automaShortcut').then(({ automaShortcut }) => {
  //   if (Array.isArray(automaShortcut) && automaShortcut.length < 1) return;
  //   let keys = ['mod', 'shift', 'e'];
  //   if (automaShortcut) keys = automaShortcut.split('+');
  //   state.shortcutKeys = keys;
  //   window._automaShortcuts = keys;
  // });
  // const result = await browser.storage.local.get(['token', 'clientId']);
  // const user_result = await browser.storage.local.get(['userInfo']);
  // token.value = result.token;
  // clientId.value = result.clientId;
  // userInfo.userName = user_result?.userInfo?.nickName || '登录人';
  // userInfo.userId = user_result?.userInfo?.userId || '';
  // if (!token.value) {
  //   isLogin.value = true;
  // }
  // const initDraggable = () => {
  //   const host = document.querySelector('#ita-sync-requirement112');
  //   if (host && host.shadowRoot) {
  //     draggable = host.shadowRoot.getElementById('draggable');
  //     if (draggable) {
  //       // 添加触摸事件支持
  //       draggable.addEventListener('touchstart', dragStart, false);
  //       draggable.addEventListener('mousedown', dragStart, false);
  //       document.addEventListener('touchmove', drag, false);
  //       document.addEventListener('mousemove', drag, false);
  //       document.addEventListener('touchend', dragEnd, false);
  //       document.addEventListener('mouseup', dragEnd, false);
  //       // 防止拖动时出现默认行为
  //       draggable.addEventListener('dragstart', (e) => e.preventDefault());
  //       return true;
  //     }
  //   }
  //   return false;
  // };
  // // 等待元素加载完成
  // const waitForDraggable = setInterval(() => {
  //   if (initDraggable()) {
  //     clearInterval(waitForDraggable);
  //   }
  // }, 100);
  // // 清理函数
  // onBeforeUnmount(() => {
  //   if (draggable) {
  //     draggable.removeEventListener('touchstart', dragStart);
  //     draggable.removeEventListener('mousedown', dragStart);
  //     document.removeEventListener('touchmove', drag);
  //     document.removeEventListener('mousemove', drag);
  //     document.removeEventListener('touchend', dragEnd);
  //     document.removeEventListener('mouseup', dragEnd);
  //   }
  //   clearInterval(waitForDraggable);
  //   // ... existing cleanup code ...
  // });
  // window.addEventListener('keydown', onKeydown);
  // Object.assign(paramsList, workflowParameters());
  // checkIframeElement();
  // plugTime = setInterval(checkIframeElement, 1000);
});
onBeforeUnmount(() => {
  // window.removeEventListener('keydown', onKeydown);
  // clearInterval(plugTime);
});

const startSynchronization = async (electron) => {
  const data = await browser.storage.local.get(['workflows', 'isFirstTime']);
  const result = await browser.storage.local.get(['token', 'clientId']);
  token.value = result.token;
  clientId.value = result.clientId;
  if (token.value && clientId.value) {
    const Arr = Array.isArray(data?.workflows)
      ? data.workflows
      : Object.values(data.workflows);
    for (const element of Arr) {
      isStop.value = true;
      if (element.name === '同步岗位') {
        element.globalData = {
          token: token.value,
          clientId: clientId.value,
          isElectron: electron,
        };
        executeWorkflow(element);
      }
    }
  } else {
    alert('请先登录插件');
  }
};

const defaultWorkflow = (data = null, options = {}) => {
  let workflowData = {
    id: nanoid(),
    name: '',
    icon: 'riGlobalLine',
    folderId: null,
    content: null,
    connectedTable: null,
    drawflow: {
      edges: [],
      zoom: 1.3,
      nodes: [
        {
          position: {
            x: 100,
            y: window.innerHeight / 2,
          },
          id: nanoid(),
          label: 'trigger',
          data: tasks.trigger.data,
          type: tasks.trigger.component,
        },
      ],
    },
    table: [],
    dataColumns: [],
    description: '',
    trigger: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDisabled: false,
    settings: {
      publicId: '',
      blockDelay: 0,
      saveLog: true,
      debugMode: false,
      restartTimes: 3,
      notification: true,
      execContext: 'popup',
      reuseLastState: false,
      inputAutocomplete: true,
      onError: 'stop-workflow',
      executedBlockOnWeb: false,
      insertDefaultColumn: false,
      defaultColumnName: 'column',
    },
    version: browser.runtime.getManifest().version,
    globalData: '{\n\t"key": "value"\n}',
  };

  if (data) {
    if (options.duplicateId && data.id) {
      delete workflowData.id;
    }

    if (data.drawflow?.nodes?.length > 0) {
      workflowData.drawflow.nodes = [];
    }

    workflowData = defu(data, workflowData);
  }

  return workflowData;
};

function convertWorkflowsToObject(workflows) {
  if (Array.isArray(workflows)) {
    return workflows.reduce((acc, workflow) => {
      acc[workflow.id] = workflow;

      return acc;
    }, {});
  }

  return workflows;
}

const version = ref(null);
const retrieved = ref(false);

// https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/firstWorkflows-test.json
// https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/firstWorkflows.json
// https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/firstWorkflows-orc.json
const API_URL =
  'https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/firstWorkflows.json';
const loadData = async () => {
  const { workflowsData, isFirstTime } = await browser.storage.local.get([
    'workflows',
    'isFirstTime',
  ]);

  let localWorkflows = workflowsData || {};
  if (isFirstTime) {
    try {
      workflows.value = {};
      browser.storage.local.remove('workflows');
      let firstWorkflows = [];
      // 添加no-cache参数避免缓存
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        // 确保不使用缓存
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // 为每条数据添加 id (如果远程数据没有 id 的话)
      firstWorkflows = data.map((item) => ({
        ...item,
        id: nanoid(),
      }));
      localWorkflows = firstWorkflows.map((workflow) =>
        defaultWorkflow(workflow)
      );
      await browser.storage.local.set({
        isFirstTime: false,
        workflows: localWorkflows,
      });
    } catch (error) {
      console.error('获取数据失败:', error);
      // 可以返回一个默认数据或者抛出错误
      return [];
    }
  } else {
    version.value = (await browser.storage.local.get('ita_version')) || null;
  }

  workflows.value = convertWorkflowsToObject(localWorkflows);

  retrieved.value = true;

  // 添加返回值
  return retrieved.value;
};

const versionMit = async () => {
  // https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config-test.json
  // https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config.json
  // https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config-orc.json
  const API_VERSION_URL =
    'https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/app-file/version-config.json';
  try {
    // 添加no-cache参数避免缓存
    const response = await fetch(API_VERSION_URL, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      // 确保不使用缓存
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = null;
    version.value = (await browser.storage.local.get('ita_version')) || null;
    data = await response.json();
    if (!version.value) {
      await browser.storage.local.set({
        ita_version: data,
        isFirstTime: true,
      });
      await loadData();
    } else if (version.value.version !== data.version) {
      await browser.storage.local.set({
        ita_version: data,
        isFirstTime: true,
      });
      await loadData();
    }
    return data;
  } catch (error) {
    console.error('获取数据失败:', error);
    // 可以返回一个默认数据或者抛出错误
    return [];
  }
};

document.addEventListener('postMessage', async (event) => {
  isStop.value = true;
  if (event.detail.action === 'getBadge') {
    sendMessage('workflow:running-size', '', 'background').then((res) => {
      try {
        // 确保所有数据都是可序列化的
        const event1 = new CustomEvent('receiveMessage', {
          detail: { action: 'getBadge', data: res },
          bubbles: true, // 添加这个确保事件可以冒泡
          cancelable: true, // 使事件可以被取消
        });
        document.dispatchEvent(event1);
      } catch (error) {
        console.error('Error dispatching event:', error);
      }
    });
  } else if (event.detail.action === 'stopPlugin') {
    await versionMit();
    const data = await browser.storage.local.get(['workflows', 'isFirstTime']);
    workflows.value = data.workflows;
    for (const element of data.workflows) {
      if (element.name === '停止所有工作流') {
        element.globalData = event.detail;
        executeWorkflow(element);
      }
    }
  }
});

const stopPlugin = async () => {
  await versionMit();
  const data = await browser.storage.local.get(['workflows', 'isFirstTime']);
  workflows.value = data.workflows;
  for (const element of data.workflows) {
    if (element.name === '停止所有工作流') {
      element.globalData = { action: 'stopPlugin' };
      executeWorkflow(element);
      isStop.value = false;
    }
  }
};

// content.js
document.addEventListener('launchExtension', async (event) => {
  isStop.value = true;
  console.log(isStop.value, 'wewewewewewewew');
  debugger;
  try {
    await versionMit();
    const getDetail = event.detail;
    console.log(isStop.value, 'wewewewewewewew');
    if (getDetail.fromType === 'synchronization') {
      await browser.storage.local.set({
        token: getDetail.token,
      });
      const electron = getDetail?.isElectron || '';
      await browser.storage.local.set({ clientId: getDetail.clientId });
      token.value = getDetail.token;
      clientId.value = getDetail.clientId;
      const user = await getInfo();
      if (user.code === 200) {
        await browser.storage.local.set({ userInfo: user.data.user });
        loginData.username = null;
        loginData.verificationCode = null;
        userInfo.userName = user.data.user.nickName;
        userInfo.userId = user.data.user.userId;
        isPlugIn.value = false;
        isLogin.value = false;
        await startSynchronization(electron);
        return;
      }
      await startSynchronization(electron);
    } else if (getDetail.fromType === 'initiate') {
      await browser.storage.local.set({
        token: getDetail.token,
      });
      await browser.storage.local.set({ clientId: getDetail.clientId });
      token.value = getDetail.token;
      clientId.value = getDetail.clientId;
      const data = await browser.storage.local.get([
        'workflows',
        'isFirstTime',
      ]);
      workflows.value = data.workflows;
      const user = await getInfo();
      if (user.code === 200) {
        await browser.storage.local.set({ userInfo: user.data.user });
        loginData.username = null;
        loginData.verificationCode = null;
        userInfo.userName = user.data.user.nickName;
        userInfo.userId = user.data.user.userId;
        isPlugIn.value = false;
        isLogin.value = false;
      }

      for (const element of data.workflows) {
        if (element.name === 'ITA 简历助手') {
          element.globalData = event.detail;
          executeWorkflow(element);
        }
      }
    } else if (getDetail.fromType === 'loginQrCode') {
      const data = await browser.storage.local.get([
        'workflows',
        'isFirstTime',
      ]);
      workflows.value = data.workflows;
      for (const element of data.workflows) {
        if (element.name === 'ITA 获取登录二维码') {
          element.globalData = event.detail;
          executeWorkflow(element);
        }
      }
    }
  } catch (error) {
    console.error('Error accessing storage or executing workflow:', error);
  }
});
</script>
