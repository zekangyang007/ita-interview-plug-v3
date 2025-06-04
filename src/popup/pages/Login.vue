<template>
  <div class="bg_desktop disflex fl_dir_c main_body">
    <div class="bw100 bh100 test_body juc_c">
      <div class="login_baody">
        <t-card
          :bordered="false"
          class="login_card disflex fl_dir_c bw100 bh100"
        >
          <div
            class="login_title bw100 disflex fl_dir_c f18"
          >
            <div
              class="f36"
              style="line-height: 36px; color: #000000e5; font-weight: 600; margin-bottom: 16px;"
            >
              Welcome !
            </div>
            <div
              class="f36"
              style="line-height: 36px; color: #000000e5; font-weight: 600; margin-bottom: 24px;"
            >
              增量ITA简历助手
            </div>
            <div class="f14" style="color: #00000099">人才是第一生产力</div>
          </div>
          <div class="login_form flex1">
            <t-form
              ref="form"
              class="bh100"
              :rules="FORM_RULES"
              :data="LoginStore.formData"
              :colon="true"
              :label-width="0"
              @submit="onSubmit"
            >
              <t-form-item name="tel" style="margin-bottom: 32px;">
                <t-dropdown
                  trigger="click"
                  :max-height="180"
                  :min-column-width="390"
                >
                  <t-input
                    v-model="LoginStore.formData.tel"
                    label="+86"
                    type="number"
                    placeholder="请输入手机号"
                    size="large"
                  />
                  <t-dropdown-menu>
                    <t-dropdown-item
                      v-for="(t, index) in filteredItems"
                      :key="index"
                      :value="t?.value"
                      @click="LoginStore.formData.tel = t?.value"
                    >
                      {{ t?.content }}
                    </t-dropdown-item>
                    <t-dropdown-item v-if="filteredItems.length === 0" disabled>
                      <div>暂无数据</div>
                    </t-dropdown-item>
                  </t-dropdown-menu>
                </t-dropdown>
              </t-form-item>

              <t-form-item name="status">
                <t-input
                  v-model="LoginStore.formData.verificationCode"
                  placeholder="请输入短信验证码"
                  size="large"
                />
                <div class="click_link">
                  <el-button
                    v-if="basicData.timeif"
                    type="primary"
                    link
                    class="send_sms_code_btn"
                    :loading="LoginStore.verifyLoading"
                    @click="clickCountSet"
                  >
                    发送验证码
                  </el-button>
                  <div v-else class="l_w_r">
                    {{ basicData.countDownNum }}秒后重新获取
                  </div>
                </div>
              </t-form-item>

              <t-form-item>
                <t-button
                  style="margin-top: 20px; margin-bottom: 30px;"
                  theme="primary"
                  type="submit"
                  size="large"
                  :loading="LoginStore.loading"
                  block
                  >登录</t-button
                >
              </t-form-item>
            </t-form>
          </div>
        </t-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import browser from 'webextension-polyfill';

const router = useRouter();

const LoginStore = reactive({
  loading: false,
  formData: {
    tel: null,
    verificationCode: null,
  },
  verifyLoading: false,
  token: '',
  clientId: '',
});

/**
 * 校验手机号是否合法
 * @param phone
 */
const verifyMyPhone = (phone) => {
  const phoneRegex = /^1[345789]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return { result: false, message: '请输入正确的手机号码', type: 'error' };
  }
  return { result: true, message: '', type: 'success' };
};

const FORM_RULES = {
  tel: [
    { required: true, message: '手机号为必填项' },
    { validator: verifyMyPhone },
  ],
  verificationCode: [{ required: true, message: '验证码为必填项' }],
};

const validateMessage = {
  tel: [
    {
      type: 'error',
      message: '请输入正确的手机号码',
    },
  ],
};

const form = ref(null);

const filteredItems = computed(() => {
  return [];
});

// 发送验证码的一些数据
const basicData = reactive({
  countDownNum: 60, // 重新发送验证码的倒计时
  timeif: true, // 是否可以点击发送验证码的按钮
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
    console.log('获取验证码成功：', result);
    return result;
  } catch (error) {
    console.error('请求出错：', error);
    return error;
  }
};

const postLogin = async () => {
  const raw = {
    rememberMe: true,
    clientId: '2993ad2b820949d59ca8be859053dadc',
    grantType: 'sms',
    phonenumber: LoginStore.formData.tel,
    smsCode: LoginStore.formData.verificationCode,
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
    console.log('登录成功：', result);
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
    LoginStore.token // 请替换为您的实际令牌
  );
  myHeaders.append('Clientid', LoginStore.clientId); // 请替换为您的实际客户端 ID

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
    console.log(result);
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

const emits = defineEmits(['loginSuccess']);

const login = async () => {
  LoginStore.loading = true;
  const res = await postLogin();
  if (res.code === 200) {
    await browser.storage.local.set({
      token: `Bearer ${res.data.access_token}`,
    });
    await browser.storage.local.set({ clientId: res.data.client_id });
    LoginStore.token = `Bearer ${res.data.access_token}`;
    LoginStore.clientId = res.data.client_id;
    const user = await getInfo();
    if (user.code === 200) {
      await browser.storage.local.set({ userInfo: user.data.user });
      emits('loginSuccess');
      LoginStore.loading = false;
      LoginStore.formData.tel = null;
      LoginStore.formData.verificationCode = null;
    } else {
      LoginStore.loading = false;
      MessagePlugin.error(user.msg);
    }
  } else {
    LoginStore.loading = false;
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
  if (!phoneRegex.test(LoginStore.formData.tel)) {
    form.value.setValidateMessage(validateMessage);
    return;
  }
  LoginStore.verifyLoading = true;
  const res = await getLoginCode(LoginStore.formData.tel);
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
    LoginStore.verifyLoading = false;
  }
};

const onSubmit = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    await login();
  } else {
    console.log('Validate Errors: ', firstError, validateResult);
  }
};
</script>
<style lang="css" scoped>
.main_body {
  width: 100%;
  height: 100vh;
}

.main_body .m_body {
  padding: 0 20px 20px;
}

.login_baody {
  /* margin-top: -10vh; */
  /* height: 300px; */
}

.login_baody .login_title {
  padding-top: 5px;
  padding-bottom: 40px;
  color: #00000066;
}

.login_baody .login_card .t-card__body {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.login_card {
  border-radius: 16px;
}

.login_card :deep(.t-card__body) {
  padding: 48px;
  border-radius: 16px;
}

.click_link {
  width: 180px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  border: 1px solid #dcdcdc;
  margin-left: 16px;
  background-color: #ffffff;
}

.click_link .l_w_r {
  font-size: 14px;
  color: #409eff;
  padding: 3px;
}
</style>
