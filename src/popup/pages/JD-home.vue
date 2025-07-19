<template>
  <div
    v-if="
      jdListToBeConfirmed.length <= 0 &&
      jdListConfirmed.length <= 0 &&
      jdListUpdate.length <= 0 &&
      activeType === 'home'
    "
    class="disflex fl_dir_c bw100"
  >
    <div class="bw100 test_body fl_dir_c juc_c" style="gap: 14px">
      <t-image :src="Group8" fit="cover" style="width: 132px; height: 132px" />
      <div class="f18 fw_b grey0">开始优化您的职位JD</div>
      <div class="f14 grey1">
        目前您还没有添加任何JD,请选择以下方式添加职位JD以获取AI优化建议。
      </div>
    </div>
    <div class="test_body fl_dir_c juc_c bw100 t_mt20">
      <div class="test_body juc_b" style="width: 50%">
        <t-button
          theme="primary"
          size="large"
          @click="startJD('Synchronization')"
        >
          <template #icon><Edit2Icon /></template>
          自动获取
        </t-button>
        <t-button theme="default" size="large" @click="openEdit">
          <template #icon><Edit2Icon /></template>
          手动输入
        </t-button>
      </div>
    </div>
    <div class="test_body fl_dir_c bw100" style="margin-top: 100px">
      <t-steps :default-current="0" style="width: 80%">
        <t-step-item title="添加JD" content="" />
        <t-step-item title="确认修改" content="" />
        <t-step-item title="更新到BOSS" content="" />
      </t-steps>
    </div>
  </div>
  <div
    v-if="
      (jdListToBeConfirmed?.length > 0 ||
        jdListConfirmed?.length > 0 ||
        jdListUpdate?.length > 0) &&
      activeType === 'home'
    "
    class="disflex fl_dir_c bw100 jd_container"
  >
    <div class="top bw100 disflex fl_dir_c">
      <div class="f16 fw_b grey0">选择操作方式</div>
      <div class="disflex alfs t_mt15 juc_b" style="gap: 15px">
        <t-card
          bordered
          class="cur_p"
          style="width: 48%"
          @click="startJD('Synchronization')"
        >
          <div class="bw100 test_body fl_dir_c juc_c">
            <t-image
              :src="Group6"
              fit="cover"
              style="width: 60px; height: 60px"
            />
            <div
              class="f16 grey0 fw_b"
              style="margin-top: -10px; margin-bottom: 10px; z-index: 99"
            >
              自动获取
            </div>
            <div class="f14 grey3">从BOSS直聘自动获取已发布的职位JD</div>
          </div>
        </t-card>
        <t-card bordered class="cur_p" style="width: 48%" @click="openEdit">
          <div class="bw100 test_body fl_dir_c juc_c">
            <t-image
              :src="Group5"
              fit="cover"
              style="width: 60px; height: 60px"
            />
            <div
              class="f16 grey0 fw_b"
              style="margin-top: -10px; margin-bottom: 10px; z-index: 99"
            >
              手动输入
            </div>
            <div class="f14 grey3">手动输入职位JD获取AI优化建议</div>
          </div>
        </t-card>
      </div>
    </div>
    <div class="disflex fl_dir_c bw100 jd_list_body">
      <div class="top test_body bw100 posItem_r">
        <t-tabs
          :value="tabValue"
          size="medium"
          class="bw100"
          @change="onTabChange"
        >
          <t-tab-panel
            :value="1"
            :label="`待确认(${jdListToBeConfirmed?.length})`"
          />
          <t-tab-panel
            :value="2"
            :label="`已确认(${jdListConfirmed?.length})`"
          />
          <t-tab-panel :value="3" :label="`已更新(${jdListUpdate?.length})`" />
        </t-tabs>
        <t-input
          v-if="false"
          v-model="searchValue"
          style="width: 120px; z-index: 99"
          class="search_body"
          placeholder="搜索职位名称"
          @change="onSearchChange"
        >
          <template #prefix-icon>
            <SearchIcon />
          </template>
        </t-input>
        <!-- <div class="f14 red">{{ errorMsg }}</div> -->
        <t-button
          v-if="tabValue === 2"
          theme="primary"
          size="medium"
          class="upDateBoss"
          :disabled="tabValue === 1"
          style="z-index: 99"
          @click="upDateBossMain"
        >
          {{ `更新到BOSS(${groupValue.length})` }}
        </t-button>
      </div>
      <t-loading
        :loading="listViewLoading"
        style="height: 208px; width: 100%"
      />
      <div v-if="tabValue === 1 && !listViewLoading">
        <div
          v-if="jdListToBeConfirmed.length > 0"
          class="jd_ul_body disflex fl_dir_c bw100 t_mt15"
          style="gap: 12px"
        >
          <t-card
            v-for="(i, index) in jdListToBeConfirmed"
            :key="index"
            bordered
            class="posItem_r jd_card"
          >
            <t-button
              shape="square"
              variant="text"
              class="close_btn"
              @click="delDemand(i, 'jdListToBeConfirmed')"
            >
              <template #icon><CloseIcon /></template>
            </t-button>
            <div class="bw100 disflex fl_dir_c" style="gap: 10px">
              <div class="test_body" style="gap: 15px">
                <div class="disflex fl_dir_c">
                  <div class="test_body" style="gap: 10px">
                    <div class="f16 grey0">{{ i.jobTitle }}</div>
                    <t-tag theme="warning" variant="light">待确认</t-tag>
                    <t-tag
                      v-if="i.optimizationHtmlJD"
                      theme="success"
                      variant="light"
                      >已优化JD</t-tag
                    >
                    <!-- <t-tag v-if="!i.optimizationHtmlJD">优化中</t-tag> -->
                  </div>
                  <div class="test_body">
                    <div class="f14 grey3">{{ i.base }}</div>
                    <t-divider v-if="i.salaryLimit" layout="vertical" />
                    <div class="f14 grey3">{{ i.salaryLimit }}</div>
                  </div>
                </div>
              </div>
              <div class="test_body bw100 juc_b text_area_body">
                <t-textarea
                  v-model="i.jobDescription"
                  :autosize="{ minRows: 4, maxRows: 4 }"
                  readonly
                />
                <t-button
                  variant="outline"
                  theme="primary"
                  size="small"
                  class="t_ml5"
                  @click="viewJD(i, tabValue)"
                >
                  查看
                </t-button>
              </div>
            </div>
          </t-card>
        </div>
        <div v-else class="test_body juc_c fl_dir_c bw100" style="gap: 10px">
          <div class="f14 grey1">暂无待确认JD</div>
          <t-button
            theme="primary"
            size="medium"
            @click="startJD('Synchronization')"
          >
            自动同步JD
          </t-button>
        </div>
      </div>
      <div v-if="tabValue === 2">
        <div
          v-if="jdListConfirmed?.length > 0"
          class="jd_ul_body disflex fl_dir_c bw100 t_mt15"
          style="gap: 12px"
        >
          <t-checkbox-group
            v-model="groupValue"
            @change="onChangeGroup"
            style="display: flex; flex-direction: column; width: 100%"
          >
            <t-checkbox key="all" :check-all="true" label="全选" />
            <t-checkbox
              v-for="(i, index) in jdListConfirmed"
              :key="index"
              :value="i.indexName"
              class="bw100"
            >
              <t-card bordered class="posItem_r jd_card">
                <t-button
                  shape="square"
                  variant="text"
                  class="close_btn"
                  @click="delDemand(i, 'jdListConfirmed')"
                >
                  <template #icon><CloseIcon /></template>
                </t-button>
                <div class="bw100 disflex fl_dir_c" style="gap: 10px">
                  <div class="test_body" style="gap: 10px">
                    <div class="f16 grey0">{{ i.jobTitle }}</div>
                    <t-tag theme="success" variant="light">已确认</t-tag>
                  </div>
                  <div class="test_body">
                    <div class="f14 grey3">{{ i.base }}</div>
                    <t-divider v-if="i.salaryLimit" layout="vertical" />
                    <div class="f14 grey3">{{ i.salaryLimit }}</div>
                  </div>
                  <div class="test_body bw100 juc_b text_area_body">
                    <t-textarea
                      v-model="i.optimizationNoHtmlJD"
                      :autosize="{ minRows: 4, maxRows: 4 }"
                      readonly
                    />
                    <div class="disflex fl_dir_c t_ml5" style="gap: 5px">
                      <t-button
                        variant="outline"
                        theme="primary"
                        size="small"
                        @click="viewJD(i, tabValue)"
                      >
                        查看
                      </t-button>
                      <t-button
                        theme="warning"
                        size="small"
                        @click="cancelEditJD(i)"
                      >
                        取消修改
                      </t-button>
                    </div>
                  </div>
                </div>
              </t-card>
            </t-checkbox>
          </t-checkbox-group>
        </div>
        <div v-else class="test_body juc_c fl_dir_c bw100" style="gap: 10px">
          <div class="f14 grey1">暂无已确认JD</div>
        </div>
      </div>
      <div v-if="tabValue === 3">
        <div
          v-if="jdListUpdate.length > 0"
          class="jd_ul_body disflex fl_dir_c bw100 t_mt15"
          style="gap: 12px"
        >
          <t-card
            v-for="(i, index) in jdListUpdate"
            :key="index"
            bordered
            class="posItem_r jd_card"
          >
            <t-button
              shape="square"
              variant="text"
              class="close_btn"
              @click="delDemand(i, 'jdListUpdate')"
            >
              <template #icon><CloseIcon /></template>
            </t-button>
            <div class="bw100 disflex fl_dir_c" style="gap: 10px">
              <div class="test_body" style="gap: 10px">
                <div class="f16 grey0">{{ i.jobTitle }}</div>
                <t-tag theme="success" variant="light">已修改</t-tag>
              </div>
              <div class="test_body">
                <div class="f14 grey3">{{ i.base }}</div>
                <t-divider v-if="i.salaryLimit" layout="vertical" />
                <div class="f14 grey3">{{ i.salaryLimit }}</div>
              </div>
              <div class="test_body bw100 juc_b text_area_body">
                <t-textarea
                  v-model="i.optimizationNoHtmlJD"
                  :autosize="{ minRows: 4, maxRows: 4 }"
                  readonly
                />
              </div>
            </div>
          </t-card>
        </div>
        <div v-else class="test_body juc_c fl_dir_c bw100" style="gap: 10px">
          <div class="f14 grey1">暂无已修改JD</div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="activeType === 'edit'"
    class="disflex fl_dir_c bw100 bh100"
    style="padding-left: 6px"
  >
    <JDEdit ref="jdEditRef" @backHome="backHome" />
  </div>
  <div
    v-show="activeType === 'ai'"
    class="disflex fl_dir_c bw100 bh100"
    style="padding-left: 6px"
  >
    <JDAI ref="jdAIRef" @backHome="backHome" />
  </div>
</template>
<script setup>
import {
  computed,
  onMounted,
  shallowReactive,
  watch,
  ref,
  reactive,
} from 'vue';
import {
  ChevronDownIcon,
  CloseIcon,
  RefreshIcon,
  Edit2Icon,
  SearchIcon,
} from 'tdesign-icons-vue-next';
import browser from 'webextension-polyfill';
import Group8 from '../../assets/images/Group8.png';
import Group6 from '../../assets/images/Group6.png';
import Group5 from '../../assets/images/Group5.png';
import JDEdit from '../pages/JD-edit.vue';
import JDAI from '../pages/JD-AI.vue';

const jdListToBeConfirmed = ref([]); // JD待确认
const jdListConfirmed = ref([]); // JD已确认
const jdListUpdate = ref([]); // JD已更新
const mitJdList = ref([]); // 选中的要更新的JD对象
const jdAIRef = ref(null);
const jdEditRef = ref(null);
const token = ref('');
const clientId = ref('');

const listViewLoading = ref(false);

const emit = defineEmits(['startJD']);

const activeType = ref('home'); // home-主页，edit-手动，ai-优化

const tabValue = ref(1);

const groupValue = ref([]);
const onTabChange = (value) => {
  tabValue.value = value;
};

const searchValue = ref('');
const onSearchChange = (value) => {
  searchValue.value = value;
};

const errorMsg = ref('');
const upDateBossMain = async () => {
  if (groupValue.value.length <= 0) {
    errorMsg.value = '请选择要更新的JD';
    return;
  }
  if (groupValue.value.length > 0) {
    errorMsg.value = '';
    emit('startJD', 'upDateBoss');
  }
};

// 获取岗位需求列表（自己的）
const getPositionRequirementList = async (obj) => {
  const result = await browser.storage.local.get(['token', 'clientId']);
  token.value = result.token;
  clientId.value = result.clientId;
  const userInfo = await browser.storage.local.get('userInfo');
  const requestOptions = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
  };
  try {
    const response = await fetch(
      `https://test-interview-api.itasaas.com/api/v1/business/recruitment/list?createBy=${userInfo.userInfo.userId}`,
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const arr = data?.rows?.filter((item) => item.jobSyncVo);
    const mitArr =
      arr.map((item) => {
        return {
          ...item.jobSyncVo,
        };
      }) || [];
    if (mitArr && mitArr.length > 0) {
      const mitobj = mitArr.find((it) => it.id === obj.id) || null;
      return mitobj;
    }
    if (mitArr.length <= 0) {
      await browser.storage.local.set({ JD_data_list: mitArr });
      return null;
    }
    return null;
  } catch (error) {
    console.error('请求出错：', error);

    return error;
  }
};
// 获取岗位需求列表（自己的）
const changePositionRequirementList = async () => {
  listViewLoading.value = true;
  const lc_result = await browser.storage.local.get([
    'local_jdListToBeConfirmed',
  ]);
  jdListToBeConfirmed.value = lc_result.local_jdListToBeConfirmed
    ? Object.values(lc_result.local_jdListToBeConfirmed)
    : [];
  const result = await browser.storage.local.get(['token', 'clientId']);
  token.value = result.token;
  clientId.value = result.clientId;
  const userInfo = await browser.storage.local.get('userInfo');
  const requestOptions = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
  };
  try {
    const response = await fetch(
      `https://test-interview-api.itasaas.com/api/v1/business/recruitment/list?createBy=${userInfo.userInfo.userId}`,
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const arr = data?.rows?.filter((item) => item.jobSyncVo);
    const mitArr =
      arr.map((item) => {
        return {
          ...item.jobSyncVo,
        };
      }) || [];
    for (let i = 0; i < mitArr.length; i++) {
      const item = mitArr[i];
      for (let j = 0; j < jdListToBeConfirmed.value.length; j++) {
        const item2 = jdListToBeConfirmed.value[j];
        if (item.indexName === item2.indexName) {
          jdListToBeConfirmed.value[j] = item;
        }
      }
    }
    await browser.storage.local.set({
      local_jdListToBeConfirmed: mitArr,
    });
    listViewLoading.value = false;
    return null;
  } catch (error) {
    listViewLoading.value = false;
    console.error('请求出错：', error);
    return error;
  }
};

const backHome = async (type) => {
  activeType.value = 'home';
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
  jdListUpdate.value = result.local_jdListUpdate
    ? Object.values(result.local_jdListUpdate)
    : [];
  await changePositionRequirementList();
  if (type === 'upDateBoss') {
    groupValue.value = jdListConfirmed.value.map((i) => i.indexName);
    tabValue.value = 2;
  } else if (type === 'upDateAloneBoss') {
    tabValue.value = 2;
    emit('startJD', 'upDateAloneBoss');
  }
};

const onChangeGroup = (value) => {
  const mitArr = [];
  for (const element of value) {
    const item = jdListConfirmed.value.find((i) => i.indexName === element);
    mitArr.push(item);
  }
  mitJdList.value = mitArr;
  browser.storage.local.set({ local_mitJdList: mitArr });
};

const active = async (list) => {
  jdListToBeConfirmed.value = [];
  jdListConfirmed.value = [];
  jdListUpdate.value = [];
  mitJdList.value = [];
  browser.storage.local.set({ local_mitJdList: mitJdList.value });
  const result = await browser.storage.local.get([
    'local_jdListToBeConfirmed',
    'local_jdListConfirmed',
    'local_jdListUpdate',
    'local_activeObj',
  ]);
  jdListToBeConfirmed.value = result.local_jdListToBeConfirmed
    ? Object.values(result.local_jdListToBeConfirmed)
    : [];
  jdListConfirmed.value = result.local_jdListConfirmed
    ? Object.values(result.local_jdListConfirmed)
    : [];
  jdListUpdate.value = result.local_jdListUpdate
    ? Object.values(result.local_jdListUpdate)
    : [];
  if (
    jdListToBeConfirmed.value.length <= 0 &&
    jdListConfirmed.value.length <= 0 &&
    jdListUpdate.value.length <= 0
  ) {
    if (list) {
      jdListToBeConfirmed.value = list;
      browser.storage.local.set({ local_jdListToBeConfirmed: list });
    }
    console.log(jdListToBeConfirmed.value, '000');
  } else if (list) {
    // 先将list赋值给jdListToBeConfirmed
    console.log(list, 'list');

    jdListToBeConfirmed.value = list;
    console.log(jdListToBeConfirmed.value, '111');

    // 如果jdListConfirmed有值，过滤掉已确认的对象
    if (jdListConfirmed.value && jdListConfirmed.value.length > 0) {
      const confirmedIndexNames = jdListConfirmed.value.map(
        (item) => item.indexName
      );
      jdListToBeConfirmed.value = jdListToBeConfirmed.value.filter(
        (item) => !confirmedIndexNames.includes(item.indexName)
      );
    }
    console.log(jdListToBeConfirmed.value, '222');
    // 如果jdListUpdate有值，过滤掉已更新的对象
    if (jdListUpdate.value && jdListUpdate.value.length > 0) {
      const updateIndexNames = jdListUpdate.value.map((item) => item.indexName);
      jdListToBeConfirmed.value = jdListToBeConfirmed.value.filter(
        (item) => !updateIndexNames.includes(item.indexName)
      );
    }
    console.log(jdListToBeConfirmed.value, '333');
    browser.storage.local.set({
      local_jdListToBeConfirmed: jdListToBeConfirmed.value,
    });
  }
  const activeObj = result.local_activeObj;
  console.log(activeObj, 'activeObj');
  if (activeObj && activeObj.activeType === 'ai') {
    activeType.value = activeObj.activeType;
    tabValue.value = activeObj.tabValue;
    jdAIRef.value.active(activeObj.mitObj, tabValue.value);
  }
  if (activeObj && activeObj.activeType === 'edit') {
    activeType.value = activeObj.activeType;
    tabValue.value = activeObj.tabValue;
    jdEditRef.value.active();
  }
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
      }

      // 处理子节点
      for (let child of node.childNodes) {
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
  for (let child of tempDiv.childNodes) {
    processNode(child);
  }

  // 清理多余的换行符，但保留必要的换行
  return result.replace(/\n{3,}/g, '\n\n').trim();
};

const viewJD = async (item, type) => {
  const activeObj = {
    mitObj: item,
    mitObjId: item.indexName,
    activeType: 'ai',
    status: 'view',
    tabValue: tabValue.value,
  };
  browser.storage.local.set({ local_activeObj: activeObj });
  activeType.value = 'ai';
  if (!item.optimizationHtmlJD) {
    const mitobj = await getPositionRequirementList(item);
    if (mitobj) {
      if (mitobj.optimizationHtmlJD) {
        item.optimizationHtmlJD = mitobj.optimizationHtmlJD;
        item.optimizationNoHtmlJD = convertHtmlToText(
          mitobj.optimizationHtmlJD
        );
      }
    }
  }
  jdAIRef.value.active(item, type);
};

const cancelEditJD = (item) => {
  jdListConfirmed.value = jdListConfirmed.value.filter(
    (i) => i.indexName !== item.indexName
  );
  browser.storage.local.set({ local_jdListConfirmed: jdListConfirmed.value });
  jdListToBeConfirmed.value.push(item);
  groupValue.value = jdListConfirmed.value.map((i) => i.indexName);
  browser.storage.local.set({
    local_jdListToBeConfirmed: jdListToBeConfirmed.value,
  });
};

const startJD = async (type) => {
  emit('startJD', type);
};

const openEdit = () => {
  const activeObj = {
    mitObj: {
      jobTitle: '',
      jobDescription: '',
    },
    mitObjId: null,
    activeType: 'edit',
    status: 'view',
    tabValue: tabValue.value,
  };
  browser.storage.local.set({ local_activeObj: activeObj });
  activeType.value = 'edit';
};

const delDemand = async (item, type) => {
  const delId = item.demandId;
  const result = await browser.storage.local.get(['token', 'clientId']);
  token.value = result.token;
  clientId.value = result.clientId;
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要，可以添加其他请求头
      Authorization: token.value,
      clientId: clientId.value,
    },
  };
  try {
    const response = await fetch(
      `https://test-interview-api.itasaas.com/api/v1/business/recruitment/${delId}`,
      requestOptions
    );
    if (!response.ok) {
      // 如果响应状态码不是 2xx，抛出错误
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const lc_result = await browser.storage.local.get([
      'local_jdListToBeConfirmed',
      'local_jdListConfirmed',
      'local_jdListUpdate',
    ]);
    jdListToBeConfirmed.value = lc_result.local_jdListToBeConfirmed
      ? Object.values(lc_result.local_jdListToBeConfirmed)
      : [];
    jdListConfirmed.value = lc_result.local_jdListConfirmed
      ? Object.values(lc_result.local_jdListConfirmed)
      : [];
    jdListUpdate.value = lc_result.local_jdListUpdate
      ? Object.values(lc_result.local_jdListUpdate)
      : [];
    if (type === 'jdListToBeConfirmed') {
      jdListToBeConfirmed.value = jdListToBeConfirmed.value.filter(
        (p) => p.indexName !== item.indexName
      );
      browser.storage.local.set({
        local_jdListToBeConfirmed: jdListToBeConfirmed.value,
      });
    } else if (type === 'jdListConfirmed') {
      jdListConfirmed.value = jdListConfirmed.value.filter(
        (p) => p.indexName !== item.indexName
      );
      browser.storage.local.set({
        local_jdListConfirmed: jdListConfirmed.value,
      });
    } else if (type === 'jdListUpdate') {
      jdListUpdate.value = jdListUpdate.value.filter(
        (p) => p.indexName !== item.indexName
      );
      browser.storage.local.set({ local_jdListUpdate: jdListUpdate.value });
    }
    await getPositionRequirementList();
    return null;
  } catch (error) {
    console.error('请求出错：', error);

    return error;
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
.text_area_body :deep(.t-textarea__inner) {
  border: 0px;
  padding: 0px;
  color: #c5c5c5;
}
.text_area_body :deep(.t-textarea__inner:focus) {
  box-shadow: none;
}
.jd_ul_body :deep(.t-checkbox__label) {
  width: 100%;
}
:deep(.t-divider--vertical) {
  border-left: 1px solid #e5e5e5;
}
</style>
