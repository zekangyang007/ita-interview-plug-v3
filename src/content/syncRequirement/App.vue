<template>
  <!-- v-if="!isDemand" -->
  <div id="draggable" class="plug_in" style="position: fixed; bottom: 180px; right: 100px; z-index: 10000"
    @click="togglePlug">
    <!-- <div class="plug_in_body">v1.28.36</div> -->
    <div :class="!isOpen && !isDemand ? 'plug_content_main_in' : 'plug_content_main_out'
      ">
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
                      <span :class="addStatus === '未加入'
                        ? 'pp--tag p_c_b_d_b_r_tag'
                        : 'pp--tag p_c_b_d_b_r_tag2'
                        ">{{ addStatus }}</span>
                    </div>
                  </div>
                  <div class="p_c_b_d_b_r_second">
                    <span v-if="candidate.age">{{ candidate.age }}</span>
                    <span v-if="candidate.age">·</span>
                    <span v-if="candidate.experienceLevel">{{
                      candidate.experienceLevel
                    }}</span>
                    <span class="p_activation">
                      <span :class="candidate.status.includes('活跃')
                        ? 'p_a_dot_green'
                        : 'p_a_dot'
                        "></span>
                      {{ candidate.status || '不活跃' }}
                    </span>
                  </div>
                  <div class="p_c_b_d_b_r_tag_list">
                    <span v-for="(tag, index) in tags" :key="index" :class="`pp--tag tag_first_tag tag_b`">{{ tag
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="p_c_b_d_info">
                <div class="p_c_b_d_info_box">
                  <div>
                    <img src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/plug-in-icon.png" alt="" />
                    <ui-input :model-value="candidate.phone" placeholder="填写手机号" />
                  </div>
                </div>
                <div class="p_c_b_d_info_box">
                  <div>
                    <img src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/plug-in-icon2.png" alt="" />
                    <ui-input :model-value="candidate.wechat" placeholder="填写微信号" />
                  </div>
                </div>
                <div class="p_c_b_d_info_box">
                  <div>
                    <img src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/plug-in-icon-email.png" alt="" />
                    <ui-input :model-value="candidate.email" placeholder="填写email" />
                  </div>
                </div>
              </div>
              <div class="p_c_b_d_nextBody">
                <!--  -->
                <div v-if="candidate.schoolTags.length > 0" class="p_c_b_d_e_body">
                  <div class="top_title test_body">
                    <div class="b_pt t_mr10" />
                    <div class="f16">高校亮点:</div>
                  </div>
                  <div class="area_body">
                    <div class="p_c_b_d_b_r_tag_list">
                      <span v-for="(i, index) in candidate.schoolTags" :key="index"
                        :class="`pp--tag tag_first_tag tag_b`">{{ i }}</span>
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
                  <div v-if="analysisResult?.gapAnalysis" class="p_c_b_d_e_body">
                    <div class="top_title test_body">
                      <div class="b_pt t_mr10" />
                      <div class="f16">空窗期分析:</div>
                    </div>
                    <div class="area_body">
                      {{ analysisResult?.gapAnalysis }}
                    </div>
                  </div>
                  <!--  -->
                  <div v-if="analysisResult?.jobHopAnalysis" class="p_c_b_d_e_body" style="border-bottom: 0">
                    <div class="top_title test_body">
                      <div class="b_pt t_mr10" />
                      <div class="f16">跳槽频率分析:</div>
                    </div>
                    <div class="area_body">
                      {{ analysisResult?.jobHopAnalysis }}
                    </div>
                  </div>
                </div>
                <div v-else style="text-align: center; padding: 10px; height: 200px">
                  <div class="f16">简历分析中,请稍后...</div>
                </div>
              </div>
              <div v-if="addStatus === '未加入'" class="p_c_b_d_bottom">
                <button v-if="noSearch" class="p_c_b_d_bottom_btn" @click="addCandidateInfo">
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
                  <ui-input v-model="loginData.username" placeholder="填写手机号" />
                </div>
              </div>
              <div class="p_c_b_d_info_box" style="width: 100%">
                <div>
                  <span>验证码：</span>
                  <ui-input v-model="loginData.verificationCode" placeholder="填写验证码" />
                  <button v-if="basicData.timeif" @click="clickCountSet">
                    发送验证码
                  </button>
                  <div v-else class="l_w_r">
                    {{ basicData.countDownNum }}秒后重新获取
                  </div>
                </div>
              </div>
              <button class="p_c_b_d_bottom_btn" style="margin-top: 20px" @click="login">
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
        <div style="
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
          <div v-if="!userInfoMain.name" class="f16">未识别到候选人信息</div>
          <div v-else>
            <div class="p_c_b_d_info">
              <div class="p_c_b_d_info_box">
                <div class="p_c_b_d_info_box_item">
                  <div class="f16">姓名：</div>
                  <div class="f14">{{ userInfoMain.name }}</div>
                </div>
                <div class="p_c_b_d_info_box_item">
                  <div class="f16">年龄：</div>
                  <div class="f14">{{ userInfoMain.age }}</div>
                </div>
                <div class="p_c_b_d_info_box_item">
                  <div class="f16">学历：</div>
                  <div class="f14">{{ userInfoMain.education }}</div>
                </div>
                <div class="p_c_b_d_info_box_item">
                  <div class="f16">工作年限：</div>
                  <div class="f14">{{ userInfoMain.workExperience }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 悬浮球 -->
    <div v-show="!isPlugIn && !isDemand" class="plug_in_main">
      <div class="plug_in_bg">
        <div class="f40">面</div>
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
      <a href="https://test-hr.itasaas.com/#/" target="_blank" title="ITA面试后台管理">
        <img src="https://test-biubiubiu.oss-cn-shenzhen.aliyuncs.com/plug-in-home-icon.png" alt="" />
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

/**
 * 获取简历内容-并分析
 */
const resumeContentData = ref('');

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

const userInfoMain = ref({
  name: '',
  age: '',
  workExperience: '',
  education: '',
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
  divElements.forEach(div => {
    const text = div.textContent.trim();

    // 跳过姓名div和活跃时间div
    if (div.classList.contains('name-contet') || div.classList.contains('active-time')) {
      return;
    }

    // 检查年龄（包含"岁"字）
    if (text.includes('岁')) {
      result.age = text;
    }
    // 检查工作年限（包含"年"字）
    else if (text.includes('年') && !text.includes('本科') && !text.includes('大专') && !text.includes('硕士') && !text.includes('博士') && !text.includes('中专') && !text.includes('高中')) {
      result.workExperience = text;
    }
    // 检查学历（常见的学历关键词）
    else if (text.includes('本科') || text.includes('大专') || text.includes('硕士') || text.includes('博士') || text.includes('中专') || text.includes('高中') || text.includes('初中') || text.includes('学历')) {
      result.education = text;
    }
  });

  return result;
}

/**
 * 获取候选人信息
 */
const getCandidateInfo = () => {
  userInfoMain.value = {
    name: '',
    age: '',
    education: '',
    workExperience: '',
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
            const resumeInfo = extractResumeInfo(result?.innerHTML);
            console.log(resumeInfo);
            if (resumeInfo.name) {
              userInfoMain.value.name = resumeInfo.name;
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
          }
        }
      }
    }
  }
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
});
onBeforeUnmount(() => {
  // window.removeEventListener('keydown', onKeydown);
  // clearInterval(plugTime);
});
</script>
