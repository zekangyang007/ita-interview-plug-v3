<template>
  <!-- 自动找简历库-表单 -->
  <div class="bh100 ability_table_main_body">
    <t-card :bordered="false" class="bw100 bh100 a_t_t_card">
      <div class="bw100 bh100 disflex alfs juc_b">
        <!-- 表格内容 -->
        <div
          class="fr a_t_table disflex fl_dir_c bh100 flex1"
          style="width: calc(100% - 180px)"
        >
          <div class="disflex fl_dir_c bw100 flex1">
            <!-- 顶部标题 -->
            <div class="test_body top_title juc_b bw100">
              <div class="test_body bw100">
                <div class="f14 grey1">筛选时间范围</div>
                <div style="margin-left: 16px">
                  <div
                    class="test_body bw100"
                    style="cursor: pointer; gap: 8px"
                    @click.stop="showVisible = true"
                  >
                    <t-tooltip content="点击切换时间">
                      <t-date-range-picker
                        v-model="date"
                        format="YYYY-MM-DD"
                        style="width: 280px"
                        size="small"
                        @change="handleChange"
                      />
                      <t-button
                        :theme="isActive === '今日' ? 'primary' : 'default'"
                        variant="outline"
                        size="small"
                        @click="handleDateChange('今日')"
                        style="margin-left: 8px"
                        >今日</t-button
                      >
                      <t-button
                        :theme="isActive === '本周' ? 'primary' : 'default'"
                        theme="default"
                        variant="outline"
                        size="small"
                        @click="handleDateChange('本周')"
                        style="margin-left: 8px"
                        >本周</t-button
                      >
                      <t-button
                        :theme="isActive === '本月' ? 'primary' : 'default'"
                        theme="default"
                        variant="outline"
                        size="small"
                        @click="handleDateChange('本月')"
                        style="margin-left: 8px"
                        >本月</t-button
                      >
                      <t-button
                        v-if="false"
                        :theme="isActive === '全部' ? 'primary' : 'default'"
                        theme="default"
                        variant="outline"
                        size="small"
                        @click="handleDateChange('全部')"
                        style="margin-left: 8px"
                        >全部</t-button
                      >
                    </t-tooltip>
                  </div>
                </div>
              </div>
            </div>
            <!-- table列表 -->
            <div class="a_t_t_body bw100 flex1">
              <!-- 统计区域-->
              <t-row>
                <t-col span="6">
                  <t-card
                    class="resume-card"
                    :bordered="false"
                    style="margin-left: 0px; padding: 12px"
                  >
                    <t-image
                      :src="Group4"
                      fit="cover"
                      style="width: 54px; height: 54px; margin-left: -16px"
                    />
                    <div>
                      <t-tooltip
                        placement="top-left"
                        :content="`团队所有人查看数`"
                      >
                        <div class="resume-status">总查看数</div>
                      </t-tooltip>
                      <div
                        class="resume-count disflex"
                        style="align-items: baseline; gap: 4px"
                        :style="
                          getTodayViewResumeNum.length > 4
                            ? 'font-size: 22px;'
                            : 'font-size: 28px;'
                        "
                      >
                        <div>
                          {{ getTodayViewResumeNum }}
                        </div>
                        <div class="resume-unit">份</div>
                      </div>
                    </div>
                  </t-card>
                </t-col>
                <t-col span="6">
                  <t-card
                    class="resume-card"
                    :bordered="false"
                    style="margin-left: 0px; padding: 12px"
                  >
                    <t-image
                      :src="Group5"
                      fit="cover"
                      style="width: 54px; height: 54px; margin-left: -16px"
                    />
                    <div>
                      <t-tooltip
                        placement="top-left"
                        :content="`团队所有人招呼数`"
                      >
                        <div class="resume-status">总沟通数</div>
                      </t-tooltip>
                      <div
                        class="resume-count disflex"
                        style="align-items: baseline; gap: 4px"
                        :style="
                          getTodayGreetNum.length > 4
                            ? 'font-size: 22px;'
                            : 'font-size: 28px;'
                        "
                      >
                        <div>
                          {{ getTodayGreetNum }}
                        </div>
                        <div class="resume-unit">份</div>
                      </div>
                    </div>
                  </t-card>
                </t-col>
                <t-col v-if="false" span="4">
                  <t-card
                    class="resume-card"
                    :bordered="false"
                    style="margin-left: 0px; padding: 12px; margin-right: 0px"
                  >
                    <t-image
                      :src="Group6"
                      fit="cover"
                      style="width: 54px; height: 54px"
                    />
                    <div>
                      <t-tooltip
                        placement="top-left"
                        :content="`ITA RPA成功收到 ${getTodayResumeNum} 份简历`"
                      >
                        <div class="resume-status">简历数</div>
                      </t-tooltip>
                      <div
                        class="resume-count disflex"
                        style="align-items: baseline; gap: 4px"
                        :style="
                          getTodayResumeNum.length > 4
                            ? 'font-size: 22px;'
                            : 'font-size: 28px;'
                        "
                      >
                        <div>
                          {{ getTodayResumeNum }}
                        </div>
                        <div class="resume-unit">份</div>
                      </div>
                    </div>
                  </t-card>
                </t-col>
              </t-row>
              <div
                class="test_body"
                style="gap: 8px; margin-top: 8px; margin-bottom: 8px"
              >
                <div class="f16">查看记录</div>
              </div>
              <t-table
                class="bh100"
                row-key="id"
                :data="mitList"
                :columns="columns"
                :bordered="false"
                :filter-value="filterValue"
                :pagination="pagination"
                :loading="loading"
                :hover="true"
                @filter-change="onFilterChange"
                @page-change="
                  (pageObj) => {
                    (pagination.defaultPageSize = pageObj.pageSize),
                      (pagination.defaultCurrent = pageObj.current);
                    getRecruitRecordListMain(
                      pagination.defaultPageSize,
                      pagination.defaultCurrent,
                      filterValue?.name,
                      filterValue?.status
                    );
                  }
                "
              >
                <template #name="{ row }">
                  <div class="f14">{{ row.name || '未知候选人' }}</div>
                </template>
                <template #status="{ row }">
                  <div class="test_body">
                    <div class="cur_p">
                      <t-tag v-if="row.status === 0" variant="light"
                        >简历筛选中</t-tag
                      >
                      <t-tag
                        v-if="row.status === 1"
                        theme="danger"
                        variant="light"
                        >简历不通过</t-tag
                      >
                      <t-tag
                        v-if="row.status === 2"
                        theme="success"
                        variant="light"
                        >简历通过</t-tag
                      >
                      <t-tag
                        v-if="row.status === 5"
                        theme="success"
                        variant="light"
                        >候选人已发简历，请联系</t-tag
                      >
                      <t-tag
                        v-if="row.status === 6"
                        theme="success"
                        variant="light"
                        >收到简历</t-tag
                      >
                    </div>
                    <t-tooltip
                      v-if="row.reason && row.status !== 5"
                      :content="row.reason"
                    >
                      <t-button
                        v-if="row.reason && row.status !== 5"
                        shape="square"
                        variant="text"
                        size="small"
                      >
                        <template #icon>
                          <ErrorCircleFilledIcon style="color: #4f4d4d66" />
                        </template>
                      </t-button>
                    </t-tooltip>
                  </div>
                </template>
                <template #position="{ row }">
                  <t-tooltip :content="row.position">
                    <div class="f14 bw100 test_of">{{ row.position || '-' }}</div>
                  </t-tooltip>
                </template>
                <template #account="{ row }">
                  <div class="f14">{{ row.account }}</div>
                </template>
              </t-table>
            </div>
          </div>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed,
  watch,
  watchEffect,
  nextTick,
  onUnmounted,
} from 'vue';
import {
  CalendarIcon,
  DeleteIcon,
  Edit2Icon,
  AddIcon,
  ErrorCircleFilledIcon,
  StopCircleIcon,
} from 'tdesign-icons-vue-next';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import dayjs from 'dayjs';
import browser from 'webextension-polyfill';
import Group4 from '../../assets/images/Group4.png';
import Group5 from '../../assets/images/Group5.png';
import Group6 from '../../assets/images/Group6.png';

//正在运行的插件流程数
const badge = ref(0);

const pagination = ref({
  defaultPageSize: 10,
  defaultCurrent: 1,
  total: 0,
});

const mitList = ref([]);
const menuList = ref([]);
const mitItem = ref(null);
const mitItemTitle = ref(null);

const token = ref('');
const clientId = ref('');

const userInfoMain = ref(null);

const loading = ref(false);

const filterValue = ref({
  name: '',
  status: '',
});

const presets = ref({
  今日: [
    dayjs().startOf('day').format('YYYY-MM-DD'),
    dayjs().endOf('day').format('YYYY-MM-DD'),
  ],
  本周: [
    dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'),
    dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD'),
  ],
  本月: [
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD'),
  ],
});

// T-Design Table表格设置项
const columns = [
  {
    colKey: 'name',
    title: '候选人姓名',
    cell: 'name',
    width: 100,
    align: 'left',
    foot: '-',
    filter: {
      type: 'input',
      resetValue: '',
      // 按下 Enter 键时也触发确认搜索
      confirmEvents: ['onEnter'],
      props: {
        placeholder: '输入关键词过滤',
      },
      // 是否显示重置取消按钮，一般情况不需要显示
      showConfirmAndReset: true,
    },
  },

  {
    colKey: 'status',
    title: 'AI筛选结论',
    cell: 'status',
    width: 80,
    align: 'left',
    foot: '-',
    filter: {
      type: 'single',
      list: [
        { label: '简历筛选中', value: 0 },
        { label: '简历不通过', value: 1 },
        { label: '简历通过', value: 2 },
        { label: '收到简历', value: 6 },
      ],
      confirmEvents: ['change'],
    },
  },
  {
    colKey: 'position',
    title: '招聘岗位（求职）',
    cell: 'position',
    width: 120,
    align: 'left',
    foot: '-',
  },
  {
    colKey: 'account',
    title: '筛选简历账号',
    cell: 'account',
    width: 80,
    align: 'left',
    foot: '-',
  },
];

//获取今天的日期
const date = ref([dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]);

const isActive = ref('今日');
const handleDateChange = (type) => {
  isActive.value = type;
  if (type === '全部') {
    date.value = [null, null];
  } else {
    date.value = presets.value[type];
  }
  handleChange(date.value);
};

const showVisible = ref(false);
//日期选择
const handleChange = async (val) => {
  console.log(val);
  let date1 = null;
  if ((val[0] === val[1]) === null) {
    date1 = null;
  } else {
    date1 = val[0] + ',' + dayjs(val[1]).add(1, 'day').format('YYYY-MM-DD');
  }
  await getTodayViewVitaeList1(date1);
  await getTodayViewVitaeList2(date1);
  await getTodayViewVitaeList3(date1);
  getRecruitRecordListMain(
    pagination.value.defaultPageSize,
    pagination.value.defaultCurrent,
    filterValue.value?.name,
    filterValue.value?.status
  );
  showVisible.value = false;
};

const getRecruitRecordList = async (
  pageSize,
  pageNum,
  name,
  status,
  dateTime,
  createAfter,
  createBefore
) => {
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID

  // 构建查询参数
  const queryParams = new URLSearchParams();
  queryParams.append('isAsc', 'desc');
  queryParams.append('orderByColumn', 'updateTime');
  if (pageSize) queryParams.append('pageSize', pageSize);
  if (pageNum) queryParams.append('pageNum', pageNum);
  if (name) queryParams.append('name', name);
  if (status !== undefined && status !== '')
    queryParams.append('status', status);
  if (dateTime) queryParams.append('date', dateTime);
  if (createAfter) queryParams.append('createAfter', createAfter);
  if (createBefore) queryParams.append('createBefore', createBefore);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };

  try {
    const url = `https://test-interview-api.itasaas.com/api/v1/business/recruit-record/list?${queryParams}`;
    const response = await fetch(url, requestOptions);
    const result = await response.json();
    console.log(result);
    if (response.status === 200) {
      loading.value = false;
      const arr = result.rows || [];
      if (arr.length > 0) {
        arr.forEach((item) => {
          if (item.status === 3) {
            if (item.reason) {
              item.reason = '候选人' + item.reason?.slice(2);
            }
          }
        });
      }
      mitList.value = arr;
      pagination.value.total = result?.total;
    }
    loading.value = false;
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

const getRecruitRecordListMain = async (pageSize, pageNum, name, status) => {
  const res = await getRecruitRecordList(
    pageSize,
    pageNum,
    name,
    status,
    null,
    date.value[0],
    dayjs(date.value[1]).add(1, 'day').format('YYYY-MM-DD')
  );
};

//筛选功能
const onFilterChange = async (filters) => {
  // filters = getObjectDifference(filters,filterValue.value);
  filterValue.value = {
    ...filters,
  };
  await getRecruitRecordList(
    pagination.value.defaultPageSize,
    pagination.value.defaultCurrent,
    filterValue.value.name,
    filterValue.value.status,
    null,
    date.value[0],
    dayjs(date.value[1]).add(1, 'day').format('YYYY-MM-DD')
  );
};

const userId = ref(null);

const getPositionGroupList = async () => {
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID
  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };
  try {
    const response = await fetch(
      'https://test-interview-api.itasaas.com/api/v1/business/position/list',
      requestOptions
    );
    const result = await response.json();
    console.log(result);
    if (response.status === 200) {
      menuList.value = result.rows || [];
      if (menuList.value.length > 0) {
        mitItem.value = menuList.value[0].id;
        mitItemTitle.value = menuList.value.find(
          (item) => item.id === mitItem.value
        )?.name;
      }
    }
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * 查询职位序列列表
 * @param name 职位序列名称-查询条件
 */
const getPositionGroupListMain = async (name) => {
  await getPositionGroupList(name);
};

// 新增轮询函数
const pollBadgeCount = async () => {
  try {
    const event = new CustomEvent('postMessage', {
      detail: { action: 'getBadge' },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
    // 没有筛选的时候才会调用, filterValue 的 value 为 null 或者 {} 时表示没有筛选
    if (!filterValue.value || Object.keys(filterValue.value).length === 0) {
      await getPositionGroupListMain(null);
      getRecruitRecordListMain(
        pagination.value.defaultPageSize,
        pagination.value.defaultCurrent
      );
    }
    let date1 = null;
    if ((date.value[0] === date.value[1]) === null) {
      date1 = null;
    } else {
      date1 = date.value[0] + ',' + dayjs(date.value[1]).add(1, 'day').format('YYYY-MM-DD');
    }
    await getTodayViewVitaeList1(date1);
    await getTodayViewVitaeList2(date1);
    await getTodayViewVitaeList3(date1);
  } catch (error) {
    console.error('Error dispatching event:', error);
  }
};

const getTodayViewVitaeList = async (
  viewedBetween,
  CommunicatedBetween,
  receivedBetween,
  pageSize,
  pageNum
) => {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', token.value);
  myHeaders.append('Clientid', clientId.value);

  // 构建查询参数
  const queryParams = new URLSearchParams();
  if (viewedBetween) queryParams.append('viewedBetween', viewedBetween);
  if (CommunicatedBetween)
    queryParams.append('CommunicatedBetween', CommunicatedBetween);
  if (receivedBetween) queryParams.append('receivedBetween', receivedBetween);
  if (pageSize) queryParams.append('pageSize', pageSize);
  if (pageNum) queryParams.append('pageNum', pageNum);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };

  try {
    const url = `https://test-interview-api.itasaas.com/api/v1/business/recruit-record/list?${queryParams}`;
    const response = await fetch(url, requestOptions);
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

let pollInterval;

const getTodayViewResumeNum = ref(0);
const getTodayViewVitaeList1 = async (date) => {
  const res = await getTodayViewVitaeList(date, null, null, 1, 1);
  getTodayViewResumeNum.value = res.total;
};
const getTodayGreetNum = ref(0);
const getTodayViewVitaeList2 = async (date) => {
  const res = await getTodayViewVitaeList(null, date, null, 1, 1);
  getTodayGreetNum.value = res.total;
};
const getTodayResumeNum = ref(0);
const getTodayViewVitaeList3 = async (date) => {
  const res = await getTodayViewVitaeList(null, null, date, 1, 1);
  getTodayResumeNum.value = res.total;
};

// 修改 onMounted
onMounted(async () => {
  const result = await browser.storage.local.get(['token', 'clientId']);
  token.value = result.token;
  clientId.value = result.clientId;
  const userResult = await browser.storage.local.get('userInfo');
  userInfoMain.value = userResult.userInfo;
  // 初始调用一次
  await getPositionGroupListMain(null);
  getRecruitRecordListMain(
    pagination.value.defaultPageSize,
    pagination.value.defaultCurrent
  );
  await getTodayViewVitaeList1(
    date.value[0] +
      ',' +
      (date.value[1]
        ? dayjs(date.value[1]).add(1, 'day').format('YYYY-MM-DD')
        : null)
  );
  await getTodayViewVitaeList2(
    date.value[0] +
      ',' +
      (date.value[1]
        ? dayjs(date.value[1]).add(1, 'day').format('YYYY-MM-DD')
        : null)
  );
  await getTodayViewVitaeList3(
    date.value[0] +
      ',' +
      (date.value[1]
        ? dayjs(date.value[1]).add(1, 'day').format('YYYY-MM-DD')
        : null)
  );

  // 设置 5 秒轮询
  // pollInterval = setInterval(pollBadgeCount, 10000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  console.log('卸载');
  clearInterval(pollInterval);
});
</script>
<style scoped>
.ability_table_main_body :deep(.t-card__body) {
  padding: 0;
  width: 100%;
  height: 100%;
}
.a_t_t_card {
  padding: 4px 8px 24px 16px;
}
.top_title {
  margin-bottom: 5px;
  padding-top: 10px;
}
.a_t_t_body :deep(.t-table) {
  display: flex;
  flex-direction: column;
}
.a_t_t_body :deep(.t-table__content) {
  flex: 1;
}
.a_t_t_body :deep(.t-pagination__select) {
  display: none;
}
.a_t_menu {
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 8px;
}
.a_t_m_title {
  background-color: #f2f3f5;
  padding: 10px;
  border-radius: 3px;
  margin-bottom: 6px;
}
.a_t_menu :deep(.t-menu__content) {
  width: 100%;
}
.a_t_menu :deep(.t-default-menu__inner .t-menu) {
  padding: 0;
}
.a_t_table {
  /* padding: 10px 0 0 10px; */
}
.a_t_table :deep(.t-table th) {
  padding: 12px 12px;
}
.item_title {
  width: 75%;
}
.bold {
  font-weight: bold;
}
.t-dropdown-item {
  padding: 0 !important;
}

.full-width-link {
  display: block;
  width: 100%;
}

.full-width-link:hover {
  text-decoration: none !important;
}

:deep(.t-link--hover-underline) {
  text-decoration: none !important;
}
.date {
  display: flex;
}

.calendar-icon {
  color: rgb(22, 93, 255);
  fill: rgb(22, 93, 255); /* 添加 fill 属性 */
}

.date:hover .calendar-icon {
  color: rgb(22, 93, 255);
  fill: rgb(22, 93, 255); /* 添加 fill 属性 */
}

.resume-card {
  background: #f7f8fa;
  margin: 15px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
}
.resume-card:deep(.t-image__wrapper) {
  background: #ffffff00;
}
.resume-card:deep(.t-card__body) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.resume-status {
  font-size: 14px;
  font-weight: 400;
  color: #1d2129;
}

.resume-count {
  font-weight: 700;
  color: #1d2129;
  margin-top: 6px;
}

.resume-unit {
  font-size: 12px;
  font-weight: 400;
  color: #86909c;
}
.demand-container :deep(.t-button--variant-base.t-button--theme-primary) {
  background-color: #f0f7ff;
  border-color: #f0f7ff;
  color: #165dff;
}
.demand-container :deep(.t-button--variant-base.t-button--theme-primary:hover) {
  color: #4080ff;
}
.demand-container :deep(.t-button--variant-base.t-button--theme-default) {
  background-color: #f2f3f500;
  border-color: #f2f3f500;
  color: #4e5969;
}
.demand-container:deep(.t-button--variant-base.t-button--theme-default:hover) {
  color: #86909c;
}
.demand-container :deep(.t-button--variant-base div) {
  display: none;
}
.filter-bar {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.screen-select {
  width: 200px;
}

.candidate-list {
  padding: 16px;
}

.candidate-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.candidate-checkbox {
  margin-top: 20px;
}

.candidate-card {
  flex: 1;
}

.candidate-card :deep(.t-card__body) {
  padding: 16px;
}

.content-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 240px;
}

.basic-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.sub-info {
  color: #86909c;
  font-size: 12px;
  display: flex;
  gap: 8px;
}

.status-tag {
  min-width: 60px;
  text-align: center;
}

.content {
  flex: 1;
  color: #4e5969;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-bd .lbox {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  position: relative;
}

.status-bd .lbox em,
.status-bd .lbox i {
  background: url(https://images3.c-ctrip.com/train/activity/ctrip-order-static/icon-status.png)
    no-repeat;
  background-size: 40px 452px;
}

.status-bd .lbox i {
  width: 40px;
  height: 40px;
  display: block;
}

.status-bd .lbox .icon-loading-orange {
  background-position: 0 -350px;
}

.status-bd .lbox .icon-loading-orange {
  -webkit-animation: rotate 1.5s linear infinite;
  animation: rotate 1.5s linear infinite;
}

:deep(.t-range-input__suffix > .t-icon) {
  color: #4e5969;
}

@keyframes rotate {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}
.boss_wrapper {
  padding: 5px 12px;
  background-color: #f7f8fa;
  border-radius: 3px;
}
.boss-icon {
  width: 16px;
  height: 16px;
}
.cur_p :deep(.t-tag--success.t-tag--light) {
  color: #00B42A;
}
.cur_p :deep(.t-tag--success.t-tag--light) {
  background-color: #E8FFEA;

}
</style>
