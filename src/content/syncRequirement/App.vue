<template>
  <div
    id="draggable"
    class="plug_in"
    style="position: fixed; bottom: 180px; right: 100px; z-index: 10000"
  >
    <div
      :class="
        !isOpen && !isDemand ? 'plug_content_main_in' : 'plug_content_main_out'
      "
    >
      <div class="panel-container">
        <!-- 头部导航 -->
        <div class="panel-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="header-left">
              <div class="user-avatar-small">
                <span v-if="!isLogin">{{ userInfo.userName[0] }}</span>
                <span v-else>?</span>
              </div>
              <div class="user-info">
                <div class="user-name">{{ isLogin ? '请登录' : userInfo.userName }}</div>
                <!-- <div v-if="!isLogin" class="connection-indicator">
                  <span class="dot"></span>
                  <span>在线</span>
                </div> -->
              </div>
            </div>
            <!-- 退出登录 -->
            <div v-if="!isLogin" class="logout-btn-new" @click="isLogin = true" title="退出登录">退出账号</div>
          </div>
          <button class="header-close-btn" @click.stop="closePlug">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="panel-content">
          <!-- 登录界面 -->
          <div v-if="isLogin && !isDemand" class="login-wrapper">
            <div class="login-card">
              <div class="login-header">
                <div class="login-icon">
                  <img src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/landing-page/title_icon.jpg" alt="ITA面试助手" />
                </div>
                <h2>ITA面试助手</h2>
                <p>请登录以继续使用</p>
              </div>
              <div class="login-form">
                <div class="form-group">
                  <label>手机号</label>
                  <ui-input
                    v-model="loginData.username"
                    placeholder="请输入手机号"
                    style="width: 100%;"
                  />
                </div>
                <div class="form-group">
                  <label>验证码</label>
                  <div class="sms-input-group">
                    <ui-input
                      v-model="loginData.verificationCode"
                      placeholder="验证码"
                      style="width: 100%;"
                    />
                    <button v-if="basicData.timeif" class="sms-btn" @click="clickCountSet">
                      获取验证码
                    </button>
                    <div v-else class="sms-timer">
                      {{ basicData.countDownNum }}s
                    </div>
                  </div>
                </div>
                <button
                  class="login-submit-btn"
                  @click="login"
                >
                  登录并启动
                </button>
              </div>
            </div>
          </div>

          <!-- 主界面 -->
          <div v-else-if="!isDemand">
            <!-- 顶部切换tab -->
            <div class="top-tab-wrapper">
              <button
                :class="['tab-item-btn', { 'is-active': activeTab === 'single' }]"
                @click="activeTab = 'single'"
              >
                当前候选人
              </button>
              <button
                :class="['tab-item-btn batch-tab', { 'is-active': activeTab === 'batch' }]"
                @click="activeTab = 'batch'"
              >
                批量自动发起
              </button>
            </div>

            <!-- 内容切换区域 -->
            <div class="tab-content-container">
              <!-- 当前候选人 -->
              <div v-if="activeTab === 'single'" class="main-wrapper" style="width: 100%;">
                <div v-if="!userInfoMain.name" class="empty-state">
                  <div class="loader"></div>
                  <p>{{ loadingTitle }}</p>
                </div>
                <div v-else class="candidate-container">
                  <!-- 候选人识别卡片 -->
                  <div class="candidate-card-new">
                    <div class="card-header-new">
                      <div class="candidate-avatar-large">
                        {{ userInfoMain.name[0] }}
                      </div>
                      <div class="candidate-basic-info">
                        <div class="name-badge-row">
                          <span class="candidate-name-new">{{ userInfoMain.name }}</span>
                          <span v-if="userInfoMain.isExistSys" class="sys-badge">库内</span>
                        </div>
                        <div class="candidate-tags-new">
                          <span v-if="userInfoMain.age" class="tag-item">{{ userInfoMain.age }}</span>
                          <span v-if="userInfoMain.education" class="tag-item">{{ userInfoMain.education }}</span>
                          <span v-if="userInfoMain.workExperience" class="tag-item">{{ userInfoMain.workExperience }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 识别状态指示 -->
                    <div :class="['status-alert', userInfoMain.isExistSys ? 'alert-success' : 'alert-warning']">
                      <div class="alert-icon">
                        <svg v-if="userInfoMain.isExistSys" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <svg v-else viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      </div>
                      <span>{{ userInfoMain.isExistSys ? '已在简历库中' : '未在简历库中找到此人' }}</span>
                    </div>

                    <!-- 表单详情 -->
                    <div class="details-form-new">
                      <div class="form-field-new">
                        <label>
                          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          识别到的面试时间
                        </label>
                        <div class="time-display-new">
                          {{ userInfoMain.interviewTime || '未识别到面试时间' }}
                          <span class="hint-text">* 系统自动提取</span>
                        </div>
                      </div>

                      <div v-if="userInfoMain.isExistSys" class="form-field-new">
                        <label>
                          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                          关联面试需求
                        </label>
                        <div class="native-select-wrapper">
                          <select
                            :value="demandId"
                            class="styled-native-select"
                            @change="changeDemandMain($event.target.value)"
                          >
                            <option value="" disabled>请选择招聘需求...</option>
                            <option
                              v-for="(item, index) in typeOptions"
                              :key="index"
                              :value="item.value"
                            >
                              {{ item.label }}
                            </option>
                          </select>
                          <div class="select-chevron-new">
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div v-if="userInfoMain.isExistSys" class="action-section-new">
                      <button
                        v-if="
                          userInfoMain.recruitmentStatus == 0 ||
                          userInfoMain.recruitmentStatus == 2 ||
                          userInfoMain.recruitmentStatus == 3 ||
                          userInfoMain.recruitmentStatus == 7
                        "
                        class="btn-primary-new"
                        @click="startInterviewFromTalents"
                      >
                        一键安排面试
                      </button>
                      <div v-else class="status-disabled-box">
                        候选人已在面试中
                      </div>
                    </div>
                  </div>

                  <!-- 底部提示 -->
                  <div class="system-tip-new">
                    <span class="tip-icon">💡</span>
                    <p>若候选人已在流程中，安排面试将自动更新状态。</p>
                  </div>
                </div>
              </div>

              <!-- 批量自动发起 -->
              <div v-if="activeTab === 'batch'" class="main-wrapper" style="width: 100%;">
                <div class="batch-trigger-container">
                  <div class="batch-icon-large">
                    <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  </div>
                  <h3>批量自动安排面试</h3>
                  <p class="batch-desc">系统将自动跳转至BOSS面试页面，读取日程信息自动安排面试</p>
                  <button class="btn-batch-start" @click="startInterviewBatch">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="margin-right: 8px;"><path d="M8 5v14l11-7z"></path></svg>
                    一键安排面试
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部栏 -->
        <div class="panel-footer-new">
          <div class="footer-status">
            <span class="status-dot-active"></span>
            <span>系统连接正常</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <!-- 跳转到ITA面试系统 -->
            <button class="goto-ita-btn" @click="gotoItaInterviewSystem" title="进入ITA面试系统">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮球 -->
    <div
      v-show="!isOpen && !isDemand"
      class="floating-trigger"
      @click="togglePlug"
    >
      <div class="trigger-ball">
        <!-- <span class="trigger-text">面</span> -->
        <img src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/landing-page/title_icon.jpg" alt="批量管理" />
        <!-- <div class="trigger-badge"></div> -->
      </div>
    </div>

    <!-- 批量管理小图标 -->
    <!-- <div v-if="!isOpen && !isDemand" class="batch-trigger-item">
      <img
        src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/plug-in-home-icon.png"
        alt="批量管理"
        @click="startInterviewBatch"
      />
    </div> -->
  </div>
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
import { tasks } from '@/utils/shared';
import defu from 'defu';

const isDemand = ref(false);

const isLogin = ref(false);
const loginData = reactive({
  username: '',
  verificationCode: '',
});

/**
 * 跳转到ITA面试系统
 */
const gotoItaInterviewSystem = () => {
  window.open('https://people.itasaas.com/#/', '_blank');
};

// 发送验证码的一些数据
const basicData = reactive({
  countDownNum: 60, // 重新发送验证码的倒计时
  timeif: true, // 是否可以点击发送验证码的按钮
});

const loadingTitle = ref('未识别到候选人信息');

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
const activeTab = ref('single'); // 'single' | 'batch'
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

const userInfoMain = ref({
  name: '',
  age: '',
  workExperience: '',
  education: '',
  chatMessage: '',
  interviewInfo: null,
  isExistSys: false,
  interviewTime: '',
  recruitmentId: '', // 面试方案ID
  recruitmentStatus: '', // 面试方案状态
});

function extractResumeInfo(htmlString) {
  // 创建临时DOM元素来解析HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  const result = {};

  // 提取姓名 - 从name-box类中获取
  const nameElement = tempDiv.querySelector('.name-box');
  if (nameElement) {
    result.name = nameElement.textContent.replace(/\s+/g, '');
  }

  // 获取所有div元素（因为现在没有外层容器）
  const divElements = tempDiv.querySelectorAll('div');

  // 遍历div元素提取信息
  divElements.forEach((div) => {
    const text = div.textContent.trim();

    // 跳过姓名div和活跃时间div
    if (
      div.classList.contains('name-contet') ||
      div.classList.contains('active-time')
    ) {
      return;
    }

    // 检查年龄（包含"岁"字）
    if (text.includes('岁')) {
      result.age = text;
    }
    // 检查工作年限（包含"年"字）
    else if (
      text.includes('年') &&
      !text.includes('本科') &&
      !text.includes('大专') &&
      !text.includes('硕士') &&
      !text.includes('博士') &&
      !text.includes('中专') &&
      !text.includes('高中')
    ) {
      result.workExperience = text;
    }
    // 检查学历（常见的学历关键词）
    else if (
      text.includes('本科') ||
      text.includes('大专') ||
      text.includes('硕士') ||
      text.includes('博士') ||
      text.includes('中专') ||
      text.includes('高中') ||
      text.includes('初中') ||
      text.includes('学历')
    ) {
      result.education = text;
    }
  });

  return result;
}

/**
 * 批量建面试
 */
const startInterviewBatch = async () => {
  // const host =
  //   document.querySelector('#ita-sync-requirement111') ||
  //   document.querySelector('#ita-sync-requirement112');
  // console.log(host, 'host');
  // if (host) {
  //   const shadowRoot = host.shadowRoot;
  //   try {
  //     // 确保所有数据都是可序列化的
  //     const event = new CustomEvent('launchExtension', {
  //       detail: { fromType: 'startInterviewBatch' },
  //       bubbles: true, // 添加这个确保事件可以冒泡
  //       cancelable: true, // 使事件可以被取消
  //     });
  //     document.dispatchEvent(event);
  //   } catch (error) {
  //     console.error('Error dispatching event:', error);
  //   }
  // }
  const getDetail = {
    token: token.value,
    clientId: clientId.value,
    userId: userInfo.userId,
  };
  const data = await browser.storage.local.get(['workflows', 'isFirstTime']);
  workflows.value = data.workflows;
  for (const element of data.workflows) {
    if (element.name === '批量建面试') {
      element.globalData = getDetail;
      executeWorkflow(element);
    }
  }
};

function formatDate(date, includeSeconds = false) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  if (includeSeconds) {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const safeParseJSON = (input) => {
  return input
    .replace('```json', '')
    .replace('```JSON', '')
    .replace('```', '')
    .trim();
};

/**
 * AI对话
 * @param {*} query
 */
const aiChat = async (obj) => {
  const request = {
    inputs: {
      conversationContent: obj.conversationContent,
      currentTime: obj.currentTime,
    },
    response_mode: 'blocking',
    user: userInfo.userId,
    query: '分析结果',
  };
  const data = JSON.stringify(request);
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer app-NZt8p2NnMCNfn3TsTnmhgzsr',
      'Content-Type': 'application/json',
    },
    body: data,
  };
  try {
    const response = await fetch(
      'https://ai-api.itasaas.com/v1/chat-messages',
      requestOptions
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let res_data = null;
    res_data = await response.json();
    const result_data = JSON.parse(safeParseJSON(res_data.answer));
    return result_data;
  } catch (error) {
    return null;
  }
};

/**
 * 获取系统中存在的面试信息
 */
const getCandidateInterviewInfo = async (searchName) => {
  // 构建查询参数
  const queryParams = new URLSearchParams({
    page: 1,
    pageSize: 10,
    isAsc: 'desc',
    orderByColumn: 'updateTime',
    archived: 1,
    name: searchName,
  });

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
  };

  try {
    const response = await fetch(
      `https://interview-api.itasaas.com/api/v1/business/candidate/list?${queryParams.toString()}`,
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求出错：', error);
    return null;
  }
};

/**
 * 候选人详情
 */
const candidateDetailData = ref(null);
const getCandidateDetail = async (candidateId) => {
  candidateDetailData.value = null;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
  };

  try {
    const response = await fetch(
      `https://interview-api.itasaas.com/api/v1/business/candidate/${candidateId}`,
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    candidateDetailData.value = data?.data || null;
    demandId.value = candidateDetailData.value?.recruitmentId || null;
    const mitvalue = typeOptions.value.find((item) => item.value === demandId.value) || null;
    if (!mitvalue) {
      demandId.value = null;
    }
    return data;
  } catch (error) {
    console.error('请求出错：', error);
    return null;
  }
};

/**
 * 获取面试方案详情
 */
const recruitmentIdData = ref(null);
const getRecruitmentIdDetail = async (recruitmentId) => {
  if (recruitmentId) {
    recruitmentIdData.value = null;
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 如果需要，可以添加其他请求头
        Authorization: token.value,
        clientId: clientId.value,
      },
    };

    try {
      const response = await fetch(
        `https://interview-api.itasaas.com/api/v1/business/recruitment/${recruitmentId}`,
        requestOptions
      );
      if (!response.ok) {
        // 如果响应状态码不是 2xx，抛出错误
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      recruitmentIdData.value = data?.data || null;
      return data;
    } catch (error) {
      console.error('请求出错：', error);
      return null;
    }
  }
};

/**
 * 创建面试
 */
const createInterviewProcess = async (params) => {
  const {
    candidateObj,
    demand,
    nodes,
    processTemplate,
    interviewTime,
    screenedBy,
  } = params;
  // 遍历节点,如果节点的责任人id没有就默认当前登录用户
  nodes.forEach((item) => {
    if (interviewTime && screenedBy) {
      if (item?.assignee?.userId === screenedBy && item?.name !== '选择简历') {
        // 如果时间包含秒（格式为 YYYY-MM-DD HH:MM:SS），去掉秒部分，保留格式为 YYYY-MM-DD HH:mm
        const time = interviewTime.split(':').length === 3
          ? interviewTime.substring(0, interviewTime.lastIndexOf(':'))
          : interviewTime;
        item.interviewTime = time;
      }
    }
    if (!item.assigneeId) {
      item.assigneeId = screenedBy;
    }
  });
  // 如果没有候选人直接返回
  if (!candidateObj?.id) {
    console.error('请选择候选人简历');
    return;
  }
  // 1. 构建面试数据
  const interviewData = {
    name:
      (demand?.name || processTemplate?.name) +
      (candidateObj.name ? '-' + candidateObj.name : ''),
    description: processTemplate.description,
    profileName: processTemplate.positionProfile?.name,
    positionProfileId: processTemplate.positionProfileId,
    processNodes: nodes,
    candidateId: candidateObj.id,
    recruitmentId: demand?.id || null,
    processTemplateId: processTemplate?.id,
  };

  // 2. 创建面试流程
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
    body: JSON.stringify(interviewData),
  };
  try {
    const response = await fetch(
      'https://interview-api.itasaas.com/api/v1/business/process',
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('发起成功', data);
    const candidateDetailResult = await getCandidateDetail(candidateObj.id);
    if (candidateDetailResult.code === 200) {
      candidateDetailData.value = candidateDetailResult.data;
      userInfoMain.value.recruitmentStatus = candidateDetailResult.data?.recruitmentStatus || null;
      userInfoMain.value.recruitmentId = candidateDetailResult.data?.recruitmentId || null;
    }
    return data;
  } catch (error) {
    console.error('请求出错：', error);
    return null;
  }
};

/**
 * 获取面试需求list
 */
const demandList = ref(null);
const demandId = ref(null);
const typeOptions = ref([]);
const getDemandList = async () => {
  demandList.value = null;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
  };

  try {
    const response = await fetch(
      `https://interview-api.itasaas.com/api/v1/business/recruitment/list?createBy=${userInfo.userId}`,
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    demandList.value = data?.rows || null;
    typeOptions.value = data?.rows.map((item) => {
      let li = {
        label: item.name,
        value: item.id,
        data: item,
        positionId: item.positionId || null
      }
      if (item.positionId) {
        li.postName = returnPostName(item.positionId) || null
      }
      return li
    })
    return data;
  } catch (error) {
    console.error('请求出错：', error);
    return null;
  }
};
/**
 * 获取岗位list
 */
const positionList = ref(null);
const getPositionList = async () => {
  positionList.value = null;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
  };

  try {
    const response = await fetch(
      `https://interview-api.itasaas.com/api/v1/business/position/list`,
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    positionList.value = data?.rows || null;
    return data;
  } catch (error) {
    console.error('请求出错：', error);
    return null;
  }
};
/**
 * 修改候选人详情
 */
const updateCandidateDetail = async () => {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
    body: JSON.stringify(candidateDetailData.value),
  };

  try {
    const response = await fetch(
      `https://interview-api.itasaas.com/api/v1/business/candidate`,
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('修改成功');
    return data;
  } catch (error) {
    console.error('请求出错：', error);
    return null;
  }
};

/**
 * 匹配岗位名称
 * @param id
 */
const returnPostName = (id) => {
  const title = positionList.value?.find((item) => item.id === id)?.name
  return title || null
}

/**
 * 变更面试需求
 * @param id
 */
const changeDemandMain = async(id) => {
  demandId.value = id;
  console.log(demandId.value, 'demandId.value');
  candidateDetailData.value.recruitmentId = id;
  candidateDetailData.value.positionId = typeOptions.value.find((item) => item.value === id)?.positionId || null;
  await updateCandidateDetail();
  await getRecruitmentIdDetail(id);
}

/**
 * 直接发起
 */
const directStartInterview = async (
  candidateObj,
  demand,
  processTemplate,
  interviewTime,
  screenedBy
) => {
  // 准备流程节点数据
  const nodes = JSON.parse(JSON.stringify(processTemplate.nodes));
  nodes.forEach((item) => {
    item.abilityIds = item.abilities.map((ability) => ability.id) || [];
    delete item.abilities;
  });
  const res = await createInterviewProcess({
    candidateObj,
    demand,
    nodes,
    processTemplate,
    interviewTime,
    screenedBy,
  });
  return res;
};

/**
 * 发起面试
 */
const startInterviewFromTalents = async () => {
  if (recruitmentIdData.value && recruitmentIdData.value?.processTemplateVo) {
    await directStartInterview(
      candidateDetailData.value,
      recruitmentIdData.value,
      recruitmentIdData.value?.processTemplateVo,
      userInfoMain.value.interviewTime,
      userInfo.userId
    );
  }
};

/**
 * 获取候选人信息
 */
const c_loading = ref(false);
const getCandidateInfo = async () => {
  c_loading.value = true;
  loadingTitle.value = '正在识别候选人信息...';
  userInfoMain.value = {
    name: '',
    age: '',
    education: '',
    workExperience: '',
    chatMessage: '',
  };
  const resumeWrap = document.querySelector('.page-content');
  if (resumeWrap) {
    const chatBox = resumeWrap.querySelector('.chat-box');
    if (chatBox) {
      const chatContainer = chatBox.querySelector('.chat-container');
      if (chatContainer) {
        const conversationBox =
          chatContainer.querySelector('.conversation-box');
        if (conversationBox) {
          const conversationMain =
            conversationBox.querySelector('.conversation-main');
          if (conversationMain) {
            const result = conversationMain.querySelector(
              '.base-info-single-detial'
            );
            const conversationMessage = conversationMain.querySelector(
              '.conversation-message'
            );
            if (conversationMessage) {
              // 获取对话内容
              const conversationContentHtml =
                conversationMessage.querySelector(
                  '.chat-message-list'
                ).innerHTML;
              // 获取对话时间
              const currentTime = formatDate(new Date(), false);
              // 组装AI分析参数
              const chatMessage = {
                conversationContent: conversationContentHtml,
                currentTime,
              };
              // 调用AI分析
              const aiResult = await aiChat(chatMessage);
              if (aiResult.interviewTime) {
                userInfoMain.value.interviewTime = aiResult.interviewTime;
              } else {
                userInfoMain.value.interviewTime = '';
              }
              // 拿到页面上的后续人信息
              const resumeInfo = extractResumeInfo(result?.innerHTML);
              if (resumeInfo.name) {
                userInfoMain.value.name =
                  aiResult.candidateName || resumeInfo.name; // 优先使用AI分析的结果
              }
              if (resumeInfo.age) {
                userInfoMain.value.age = resumeInfo.age;
              }
              if (resumeInfo.education) {
                userInfoMain.value.education = resumeInfo.education;
              }
              if (resumeInfo.workExperience) {
                userInfoMain.value.workExperience = resumeInfo.workExperience;
              }
              const r_result = await getCandidateInterviewInfo(
                userInfoMain.value.name
              );
              if (r_result.code === 200) {
                if (r_result.rows.length > 0) {
                  userInfoMain.value.isExistSys = true;
                  // 获取候选人详情
                  const d_result = await getCandidateDetail(
                    r_result.rows[0].id
                  );
                  if (d_result.code === 200) {
                    console.log(d_result, 'd_result');
                    userInfoMain.value.recruitmentId =
                      d_result.data.recruitmentId || '';
                    userInfoMain.value.recruitmentStatus =
                      d_result.data.recruitmentStatus || '';
                    //  获取岗位详情
                    const pp_result = await getPositionList();
                    if (pp_result.code === 200) {
                      console.log(pp_result, 'pp_result');
                    }
                    //   获取需求详情
                    const dd_result = await getDemandList();
                    if (dd_result.code === 200) {
                      console.log(dd_result, 'dd_result');
                    }
                    // 获取面试方案详情
                    const rr_result = await getRecruitmentIdDetail(
                      userInfoMain.value?.recruitmentId
                    );
                    if (rr_result.code === 200) {
                      console.log(rr_result, 'rr_result');
                    }
                  }
                } else {
                  userInfoMain.value.isExistSys = false;
                  loadingTitle.value = '未找到候选人信息';
                  c_loading.value = false;
                }
              }
            } else {
              loadingTitle.value = '未找到候选人信息';
              c_loading.value = false;
            }
          }
        }
      }
    }
  }
  loadingTitle.value = '未识别到候选人信息';
  c_loading.value = false;
};

/**
 * 解析教育经历
 */
const noSearch = ref(true);

const togglePlug = () => {
  console.log(1223333333);

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
  getCandidateInfo();
};

const closePlug = () => {
  isOpen.value = false;
  isPlugIn.value = false;
};

/**
 * 点击外部关闭悬浮球
 */
const handleClickOutside = (event) => {
  // 如果悬浮球未打开，不需要处理
  if (!isOpen.value) return;

  // 获取 draggable 元素 - 在 Shadow DOM 中查找
  const draggable = rootElement?.shadowRoot?.querySelector('#draggable');
  if (!draggable) return;

  // 使用 composedPath 来获取事件路径（包括穿过 Shadow DOM 边界）
  const path = event.composedPath ? event.composedPath() : [event.target];

  // 检查点击路径中是否包含 draggable 元素或 rootElement
  const clickedInside = path.some((el) => {
    // 确保 el 是一个节点对象，避免 window、document 等非节点对象
    if (!el || typeof el !== 'object') return false;

    // 检查是否是 draggable 或 rootElement
    if (el === draggable || el === rootElement) return true;

    // 检查 el 是否是 Node 类型，再调用 contains
    if (el instanceof Node && draggable.contains(el)) return true;

    return false;
  });

  // 如果点击在外部，则关闭悬浮球
  if (!clickedInside) {
    isOpen.value = false;
    isPlugIn.value = false;
  }
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
  }
};

onMounted(async () => {
  browser.storage.local.get('automaShortcut').then(({ automaShortcut }) => {
    if (Array.isArray(automaShortcut) && automaShortcut.length < 1) return;
    let keys = ['mod', 'shift', 'e'];
    if (automaShortcut) keys = automaShortcut.split('+');
    window._automaShortcuts = keys;
  });
  const result = await browser.storage.local.get(['token', 'clientId']);
  const user_result = await browser.storage.local.get(['userInfo']);
  token.value = result.token;
  clientId.value = result.clientId;
  userInfo.userName = user_result?.userInfo?.nickName || '登录人';
  userInfo.userId = user_result?.userInfo?.userId || '';
  if (!token.value) {
    isLogin.value = true;
  }

  // 添加点击外部关闭悬浮球的事件监听（使用捕获阶段）
  document.addEventListener('click', handleClickOutside, true);
  // 同时监听 Shadow DOM 内的点击（如果存在）
  if (rootElement?.shadowRoot) {
    rootElement.shadowRoot.addEventListener('click', handleClickOutside, true);
  }
});
onBeforeUnmount(() => {
  // window.removeEventListener('keydown', onKeydown);
  // clearInterval(plugTime);

  // 移除点击外部关闭悬浮球的事件监听
  document.removeEventListener('click', handleClickOutside, true);
  if (rootElement?.shadowRoot) {
    rootElement.shadowRoot.removeEventListener(
      'click',
      handleClickOutside,
      true
    );
  }
});
</script>
