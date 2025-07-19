<template>
  <div class="disflex fl_dir_c bw100 bh100">
    <t-button variant="text" @click="backHome" style="width: 85px">
      <template #icon><ChevronLeftIcon /></template>
      返回首页
    </t-button>
    <div class="bw100 test_body juc_b t_mb15" style="gap: 10px">
      <div class="test_body">
        <div class="f14 fw_b">{{ mitJdData?.indexName || '岗位' }}</div>
        <t-tag theme="warning" variant="light">待确认</t-tag>
      </div>
      <t-button
        theme="primary"
        size="medium"
        :disabled="AIview"
        @click="aiResumeEvaluationCriteria()"
      >
        重新优化JD
      </t-button>
    </div>
    <div class="disflex fl_dir_c bw100">
      <!-- <div
        class="bw100 test_body fl_dir_c juc_c"
        style="height: 500px; gap: 10px"
      >
        <t-image
          :src="Group8"
          fit="cover"
          style="width: 132px; height: 132px"
        />
        <div class="f18 fw_b dark_blue">ITA AI正在优化您的JD内容</div>
        <div class="f14 grey1">
          正在分析您的职位描述,并生成专业优化建议,这可能需要一点时间,请您稍后查看。
        </div>
      </div> -->
      <div class="bw100 disflex fl_dir_c">
        <!-- <div v-html="mitJdData?.contrastHtmlJD" /> -->
        <div class="disflex alfs bw100" style="gap: 10px">
          <div
            class="disflex fl_dir_c text_c_card posItem_r"
            :style="
              mitJdData.optimizationNoHtmlJD || AIview
                ? 'width: 50%'
                : 'width: 100%'
            "
          >
            <t-textarea
              v-model="mitJdData.jobDescription"
              placeholder="请输入岗位JD"
              readonly
              class="bw100 posItem_r"
              style="color: #86909c"
              :autosize="{ minRows: 15, maxRows: 15 }"
            />
            <t-tag class="tag_p_a" theme="primary" variant="light"
              >原JD内容</t-tag
            >
          </div>
          <div
            v-if="AIview || mitJdData.optimizationNoHtmlJD"
            class="disflex fl_dir_c"
            style="width: 50%"
          >
            <t-card v-show="AIview" bordered>
              <div
                class="bw100 test_body fl_dir_c juc_c"
                style="height: 335px; gap: 10px"
              >
                <t-loading
                  :loading="true"
                  style="height: 100px; width: 100%; background: #fff"
                />
                <div class="f18 fw_b dark_blue">ITA AI正在优化您的JD内容</div>
                <div class="f14 grey1">正在优化您的职位描述,请勿关闭插件。</div>
              </div>
            </t-card>
            <div
              v-if="mitJdData.optimizationNoHtmlJD && !AIview"
              class="bw100 text_c_card posItem_r"
            >
              <t-textarea
                v-model="mitJdData.optimizationNoHtmlJD"
                placeholder="请输入岗位JD"
                style="width: 100%"
                :autosize="{ minRows: 15, maxRows: 15 }"
              />
              <t-tag class="tag_p_a" theme="success" variant="light"
                >优化后JD内容</t-tag
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="mitJdData.optimizationNoHtmlJD"
      class="test_body bw100 juc_c t_mt15"
    >
      <div class="test_body" style="gap: 10px">
        <t-button
          theme="primary"
          size="medium"
          variant="outline"
          @click="editJDMain('upDateBoss')"
        >
          {{ editType === 2 ? '修改' : '加入已确认列表' }}
        </t-button>
        <t-button
          theme="primary"
          size="medium"
          @click="editJDMain('upDateAloneBoss')"
        >
          更新到BOSS
        </t-button>
      </div>
    </div>
    <div v-if="errorMsg" class="test_body bw100 juc_c t_mt15">
      <div class="f14 red">{{ errorMsg }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import browser from 'webextension-polyfill';
import Group8 from '../../assets/images/Group8.png';

const emit = defineEmits(['backHome']);
const AIview = ref(false);

const jdListToBeConfirmed = ref([]); // JD待确认
const jdListConfirmed = ref([]); // JD已确认

const backHome = async (type) => {
  await browser.storage.local.remove(['local_activeObj']);
  emit('backHome', type);
};

const mitJdData = ref({
  indexName: '',
  contrastHtmlJD: '',
  jobDescription: '',
  optimizationHtmlJD: '',
  optimizationNoHtmlJD: '',
});

const errorMsg = ref('');

const safeParseJSON = (input) => {
  return input
    .replace('```json', '')
    .replace('```JSON', '')
    .replace('```', '')
    .trim();
};
/**
 * 将HTML转换为textarea格式的纯文本
 * @param {string} html - HTML字符串
 * @returns {string} - 转换后的纯文本
 */
const convertHtmlToText = (html) => {
  if (!html) return '';

  // 创建一个临时的div元素来解析HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  let result = '';

  // 递归处理所有节点
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // 文本节点，直接添加内容
      result += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();

      // 根据不同的HTML标签添加相应的格式
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          result += '\n\n';
          break;
        case 'p':
          result += '\n';
          break;
        case 'br':
          result += '\n';
          break;
        case 'li':
          result += '\n• ';
          break;
        case 'ul':
        case 'ol':
          result += '\n';
          break;
        default:
          // 其他标签不做特殊处理
          break;
      }

      // 处理子节点
      for (const child of node.childNodes) {
        processNode(child);
      }

      // 在某些标签后添加换行
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
        case 'p':
        case 'ul':
        case 'ol':
          result += '\n';
          break;
      }
    }
  };

  // 处理所有子节点
  for (const child of tempDiv.childNodes) {
    processNode(child);
  }

  // 清理多余的换行符，但保留必要的换行
  return result.replace(/\n{3,}/g, '\n\n').trim();
};
const token = ref('');
const clientId = ref('');
const pollingTimer = ref(null);
const maxPollingAttempts = ref(60); // 最大轮询次数，5分钟
const currentPollingAttempts = ref(0);

const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value);
    pollingTimer.value = null;
  }
  currentPollingAttempts.value = 0;
};

const getRecruitmentMain = async (id) => {
  const result_c = await browser.storage.local.get(['token', 'clientId']);
  token.value = result_c.token;
  clientId.value = result_c.clientId;

  if (!token.value || !clientId.value) {
    AIview.value = false;
    errorMsg.value = 'Token或ClientId未找到';
    return false;
  }

  const myHeaders = new Headers();
  myHeaders.append('Authorization', token.value);
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Clientid', clientId.value);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };

  try {
    const response = await fetch(
      `https://test-interview-api.itasaas.com/api/v1/business/job-sync/${id}`,
      requestOptions
    );
    const result = await response.json();

    if (response.status === 200) {
      console.log(result, 'result');
      if (result.data?.optStatus === 3) {
        // 获取到数据，停止轮询
        stopPolling();
        AIview.value = false;
        errorMsg.value = 'AI优化失败';
        return null;
      }
      if (result.data?.optStatus === 2) {
        // 获取到数据，停止轮询
        stopPolling();
        mitJdData.value.optimizationHtmlJD = result.data.optimizationHtmlJD;
        mitJdData.value.optimizationNoHtmlJD = convertHtmlToText(
          result.data.optimizationHtmlJD
        );
        AIview.value = false;
        const l_result = await browser.storage.local.get([
          'local_jdListToBeConfirmed',
        ]);
        debugger;
        jdListToBeConfirmed.value = l_result.local_jdListToBeConfirmed
          ? Object.values(l_result.local_jdListToBeConfirmed)
          : [];
        jdListToBeConfirmed.value.forEach((item) => {
          if (item.indexName === mitJdData.value.indexName) {
            item.optimizationNoHtmlJD = mitJdData.value.optimizationNoHtmlJD;
            item.optimizationHtmlJD = mitJdData.value.optimizationHtmlJD;
          }
        });
        await browser.storage.local.set({
          local_jdListToBeConfirmed: jdListToBeConfirmed.value,
        });
        const active_result = await browser.storage.local.get([
          'local_activeObj',
        ]);
        const active_obj = active_result.local_activeObj;
        if (active_obj) {
          active_obj.status = 'view';
          active_obj.mitObj = mitJdData.value;
          active_obj.mitObjId = mitJdData.value?.indexName;
        }
        await browser.storage.local.set({ local_activeObj: active_obj });
        return result;
      }
      // 数据还未准备好，继续轮询
      return null;
    }
    // 接口返回错误状态码
    stopPolling();
    AIview.value = false;
    errorMsg.value = 'AI优化失败';
    return result;
  } catch (error) {
    stopPolling();
    AIview.value = false;
    errorMsg.value = 'AI优化失败';
    console.error('轮询请求失败:', error);
    // 网络错误不立即停止轮询，但会计入尝试次数
    return null;
  }
};

const startPolling = (id) => {
  // 清除之前的轮询
  stopPolling();

  // 重置轮询计数
  currentPollingAttempts.value = 0;

  // 立即执行一次
  getRecruitmentMain(id);
  // 开始定时轮询
  pollingTimer.value = setInterval(async () => {
    currentPollingAttempts.value += 1;

    // 检查是否超过最大尝试次数
    if (currentPollingAttempts.value >= maxPollingAttempts.value) {
      stopPolling();
      AIview.value = false;
      errorMsg.value = 'AI优化超时，请稍后重试';
      return;
    }

    await getRecruitmentMain(id);
  }, 5000);
};

/**
 * 简历评估
 * @param {*} query
 */
const aiResumeEvaluationCriteria_2 = async () => {
  const data = JSON.stringify({
    inputs: {
      position: mitJdData.value.indexName,
      jd: mitJdData.value.jobDescription,
    },
    response_mode: 'streaming',
    user: '123',
    query: '优化JD内容',
  });
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer app-SWAwMGAi4wFCCJII1MJ5lSHo',
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

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留不完整的行

      for (const line of lines) {
        if (line.trim() !== '' && line.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(line.slice(6)); // 移除 'data: ' 前缀
            console.log('收到数据:', jsonData);

            // 处理不同类型的事件
            if (jsonData.event === 'agent_message' && jsonData.answer) {
              const result = JSON.parse(safeParseJSON(jsonData.answer));
              finalResult = result;
              mitJdData.value.optimizationHtmlJD = result.optimizationHtmlJD;
              mitJdData.value.optimizationNoHtmlJD = convertHtmlToText(
                result.optimizationHtmlJD
              );
              console.log('最终结果:', result);
            } else {
              AIview.value = false;
              errorMsg.value = 'AI优化失败';
            }
          } catch (e) {
            AIview.value = false;
            errorMsg.value = 'AI优化失败';
            console.log('解析数据失败:', e, line);
          }
        }
      }
    }
    return finalResult;
  } catch (error) {
    AIview.value = false;
    errorMsg.value = 'AI优化失败';
    console.log(error, 'error');
    throw error;
  }
};

/**
 * 简历评估
 * @param {*} query
 */
const aiResumeEvaluationCriteria = async () => {
  AIview.value = true;
  const active_result = await browser.storage.local.get(['local_activeObj']);
  const active_obj = active_result.local_activeObj;
  if (active_obj) {
    active_obj.status = 'AIchange';
  }
  await browser.storage.local.set({ local_activeObj: active_obj });
  if (mitJdData.value.id) {
    AIview.value = true;
    errorMsg.value = '';
    const result_c = await browser.storage.local.get(['token', 'clientId']);
    token.value = result_c.token;
    clientId.value = result_c.clientId;
    const data = JSON.stringify({
      position: mitJdData.value.indexName,
      jd: mitJdData.value.jobDescription,
    });
    const requestOptions = {
      method: 'PUT',
      headers: {
        Authorization: token.value,
        Clientid: clientId.value,
        'Content-Type': 'application/json',
      },
      body: data,
    };
    try {
      const response = await fetch(
        `https://test-interview-api.itasaas.com/api/v1/business/job-sync/jd-optimize/${mitJdData.value?.id}`,
        requestOptions
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.data?.optStatus === 1) {
        AIview.value = true;
        startPolling(mitJdData.value?.id);
        return;
      }
      if (result.data?.optStatus === 2) {
        const jd_result = result.data;
        mitJdData.value.optimizationHtmlJD = jd_result.optimizationHtmlJD;
        mitJdData.value.optimizationNoHtmlJD = convertHtmlToText(
          jd_result.optimizationHtmlJD
        );
        const l_result = await browser.storage.local.get([
          'local_jdListToBeConfirmed',
          'local_jdListConfirmed',
          'local_jdListUpdate',
        ]);
        jdListToBeConfirmed.value = l_result.local_jdListToBeConfirmed
          ? Object.values(l_result.local_jdListToBeConfirmed)
          : [];
        jdListConfirmed.value = l_result.local_jdListConfirmed
          ? Object.values(l_result.local_jdListConfirmed)
          : [];
        jdListToBeConfirmed.value.forEach((item) => {
          if (item.indexName === mitJdData.value.indexName) {
            item.optimizationNoHtmlJD = mitJdData.value.optimizationNoHtmlJD;
            item.optimizationHtmlJD = mitJdData.value.optimizationHtmlJD;
          }
        });
        await browser.storage.local.set({
          local_jdListToBeConfirmed: jdListToBeConfirmed.value,
        });
      } else if (result.data?.optStatus === 3) {
        AIview.value = false;
        errorMsg.value = 'AI优化失败';
      }
      AIview.value = false;
      return false;
    } catch (error) {
      AIview.value = false;
      errorMsg.value = 'AI优化失败';
      console.log(error, 'error');
      throw error;
    }
  } else {
    await aiResumeEvaluationCriteria_2();
  }
  return false;
};

const editJDMain = async (type) => {
  const result = await browser.storage.local.get([
    'local_jdListToBeConfirmed',
    'local_jdListConfirmed',
    'local_jdListUpdate',
  ]);
  jdListToBeConfirmed.value = result.local_jdListToBeConfirmed
    ? Object.values(result.local_jdListToBeConfirmed)
    : [];
  jdListConfirmed.value = result.local_jdListConfirmed
    ? Object.values(result.local_jdListConfirmed)
    : [];
  const mitConfirmedObj = jdListConfirmed.value.find(
    (item) => item.indexName === mitJdData.value.indexName
  );
  if (mitConfirmedObj) {
    jdListConfirmed.value = jdListConfirmed.value.filter(
      (item) => item.indexName !== mitJdData.value.indexName
    );
    jdListConfirmed.value.unshift(mitJdData.value);
  } else {
    jdListConfirmed.value.push(mitJdData.value);
  }
  await browser.storage.local.set({
    local_jdListConfirmed: jdListConfirmed.value,
  });
  jdListToBeConfirmed.value = jdListToBeConfirmed.value.filter(
    (item) => item.indexName !== mitJdData.value.indexName
  );
  await browser.storage.local.set({
    local_jdListToBeConfirmed: jdListToBeConfirmed.value,
  });
  if (type === 'upDateAloneBoss') {
    const aloneObj = [mitJdData.value];
    await browser.storage.local.set({
      local_aloneObj: aloneObj,
    });
  }
  backHome(type);
};

const editType = ref(null);
const active = async (item, type) => {
  mitJdData.value.indexName = '';
  mitJdData.value.jobDescription = '';
  mitJdData.value.optimizationHtmlJD = '';
  mitJdData.value.optimizationNoHtmlJD = '';
  mitJdData.value.contrastHtmlJD = '';
  errorMsg.value = '';
  editType.value = type;
  console.log(item, 'item');
  if (item) {
    if (item?.optimizationHtmlJD) {
      if (!item.optimizationNoHtmlJD) {
        item.optimizationNoHtmlJD = convertHtmlToText(item.optimizationHtmlJD);
      }
    } else {
      mitJdData.value = item;
      if (mitJdData.value.optStatus === 1) {
        AIview.value = true;
        const active_result = await browser.storage.local.get([
          'local_activeObj',
        ]);
        const active_obj = active_result.local_activeObj;
        if (active_obj) {
          active_obj.status = 'AIchange';
        }
        await browser.storage.local.set({ local_activeObj: active_obj });
        startPolling(item.id);
        return;
      }
      mitJdData.value = item;
    }
    mitJdData.value = item;
    if (mitJdData.value?.optimizationHtmlJD) {
      mitJdData.value.optimizationNoHtmlJD = convertHtmlToText(mitJdData.value?.optimizationHtmlJD);
    }
    // await aiResumeEvaluationCriteria();
    const active_result = await browser.storage.local.get(['local_activeObj']);
    const active_obj = active_result.local_activeObj;
    if (active_obj.status === 'AIchange') {
      AIview.value = true;
      editType.value = active_obj.tabValue;
      startPolling(item.id);
    }
  }
};

defineExpose({
  active,
});
</script>
<style scoped>
:deep(.t-check-tag-group) {
  line-height: 36px;
}
.disflex {
  display: flex;
}
.fl_dir_c {
  flex-direction: column;
}
.posItem_r {
  position: relative;
}
.test_body {
  display: flex;
  align-items: center;
}
.t_mr5 {
  margin-right: 5px;
}
.t_ml5 {
  margin-left: 5px;
}
.red {
  color: #f53f3f;
}
.f14 {
  font-size: 14px;
}
.f12 {
  font-size: 12px;
}
:deep(.t-image__wrapper) {
  background: #fff;
}
.jd_container {
  padding: 0 6px 6px 12px;
}
.search_body {
  position: absolute;
  right: 180px;
}
.upDateBoss {
  position: absolute;
  right: 0px;
}
.close_btn {
  position: absolute;
  top: 0;
  right: 0;
  display: none;
}
.jd_card:hover .close_btn {
  display: block;
}
.text_c_card :deep(.t-textarea__inner) {
  padding-top: 30px;
}
.tag_p_a {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
