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
            <div class="test_body" style="gap: 8px; margin-top: 16px">
              <div class="f16">查看次数权益概览</div>
            </div>
            <!-- table列表 -->
            <div class="a_t_t_body bw100 flex1">
              <!-- 统计区域-->
              <t-row>
                <t-col span="4">
                  <t-card
                    class="resume-card"
                    :bordered="false"
                    style="margin-left: 0px; padding: 12px"
                  >
                    <div class="disflex fl_dir_c">
                      <t-tooltip
                        placement="top-left"
                        :content="`总查看次数 ${pointBalance?.total || 0} 次`"
                      >
                        <div class="f12 grey1" style="margin-bottom: 4px">
                          总查看次数
                        </div>
                      </t-tooltip>
                      <div class="test_body" style="gap: 12px">
                        <t-image
                          :src="Group7"
                          fit="cover"
                          style="width: 32px; height: 32px"
                        />
                        <div
                          class="resume-count disflex"
                          style="align-items: baseline; gap: 4px"
                          :style="
                            pointBalance?.total.length > 4
                              ? 'font-size: 28px;'
                              : 'font-size: 28px;'
                          "
                        >
                          <div>
                            {{ pointBalance?.total }}
                          </div>
                          <div class="resume-unit">次</div>
                        </div>
                      </div>
                    </div>
                  </t-card>
                </t-col>
                <t-col span="4">
                  <t-card
                    class="resume-card"
                    :bordered="false"
                    style="margin-left: 0px; padding: 12px"
                  >
                    <div class="disflex fl_dir_c">
                      <t-tooltip
                        placement="top-left"
                        :content="`已使用 ${pointBalance?.consume || 0} 次`"
                      >
                        <div class="f12 grey1" style="margin-bottom: 4px">
                          已使用查看次数
                        </div>
                      </t-tooltip>
                      <div class="test_body" style="gap: 12px">
                        <t-image
                          :src="Group8"
                          fit="cover"
                          style="width: 32px; height: 32px"
                        />
                        <div
                          class="resume-count disflex"
                          style="align-items: baseline; gap: 4px"
                          :style="
                            pointBalance?.consume.length > 4
                              ? 'font-size: 22px;'
                              : 'font-size: 28px;'
                          "
                        >
                          <div>
                            {{ pointBalance?.consume }}
                          </div>
                          <div class="resume-unit">份</div>
                        </div>
                      </div>
                    </div>
                  </t-card>
                </t-col>
                <t-col span="4">
                  <t-card
                    class="resume-card"
                    :bordered="false"
                    style="margin-left: 0px; padding: 12px; margin-right: 0px"
                  >
                    <div class="disflex fl_dir_c">
                      <t-tooltip
                        placement="top-left"
                        :content="`余额 ${pointBalance?.balance || 0} 次`"
                      >
                        <div class="f12 grey1" style="margin-bottom: 4px">
                          余额
                        </div>
                      </t-tooltip>
                      <div class="test_body" style="gap: 12px">
                        <t-image
                          :src="Group9"
                          fit="cover"
                          style="width: 32px; height: 32px"
                        />
                        <div
                          class="resume-count disflex"
                          style="align-items: baseline; gap: 4px"
                          :style="
                            pointBalance?.balance.length > 4
                              ? 'font-size: 28px;'
                              : 'font-size: 28px;'
                          "
                        >
                          <div>
                            {{ pointBalance?.balance }}
                          </div>
                          <div class="resume-unit">次</div>
                        </div>
                      </div>
                    </div>
                  </t-card>
                </t-col>
              </t-row>
              <div class="progress_box" style="margin-bottom: 24px">
                <t-progress
                  :percentage="
                    (pointBalance?.consume / pointBalance?.total) * 100
                  "
                >
                  <template #label
                    >已使用{{
                      (
                        (pointBalance?.consume / pointBalance?.total) *
                        100
                      ).toFixed(2)
                    }}%</template
                  >
                </t-progress>
              </div>
              <div
                class="test_body"
                style="gap: 8px; margin-top: 8px; margin-bottom: 8px"
              >
                <div class="f16">用户查看次数权益汇总</div>
              </div>
              <div class="test_body top_title juc_b bw100">
                <div class="test_body bw100">
                  <div class="f14 grey1">时间范围</div>
                  <div class="date_select" style="margin-left: 16px">
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
                          clearable
                          size="small"
                          @change="handleChange"
                        />
                      </t-tooltip>
                    </div>
                  </div>
                  <t-select
                    v-model="selectUserValue"
                    placeholder="请选择使用用户"
                    :options="userList"
                    style="width: 150px; margin-left: 16px"
                    clearable
                    filterable
                    size="small"
                    @change="handleChange"
                  />
                </div>
              </div>
              <t-table
                class="bh100"
                row-key="id"
                :data="mitList"
                :columns="columns"
                :bordered="false"
                :loading="loading"
                :hover="true"
              >
                <template #name="{ row }">
                  <div class="f14">{{ row.creatorName || '-' }}</div>
                </template>
                <template #viewedBetween="{ row }">
                  <div class="f14">
                    {{ row.amount || '-' }}
                  </div>
                </template>
                <template #occupancyRatio="{ row }">
                  <div class="f14">
                    {{ (row.percent * 100).toFixed(2) + '%' || '-' }}
                  </div>
                </template>
                <template #lastTime="{ row }">
                  <div class="f14">
                    {{ row.updateTime || '-' }}
                  </div>
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
import Group7 from '../../assets/images/Group7.png';
import Group8 from '../../assets/images/Group8.png';
import Group9 from '../../assets/images/Group9.png';

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

// T-Design Table表格设置项
const columns = [
  {
    colKey: 'name',
    title: '姓名',
    cell: 'name',
    width: 80,
    align: 'left',
    foot: '-',
  },
  {
    colKey: 'viewedBetween',
    title: '已使用查看次数',
    cell: 'viewedBetween',
    width: 100,
    align: 'left',
    foot: '-',
  },
  {
    colKey: 'occupancyRatio',
    title: '占用比例',
    cell: 'occupancyRatio',
    width: 80,
    align: 'left',
    foot: '-',
  },
  {
    colKey: 'lastTime',
    title: '最近使用时间',
    cell: 'lastTime',
    width: 150,
    align: 'left',
    foot: '-',
  },
];

// 获取今天的日期
const date = ref([]);

const showVisible = ref(false);
// 日期选择
const handleChange = async (val) => {
  await getPointTransactionList(date.value[0], dayjs(date.value[1]).add(1, 'day').format('YYYY-MM-DD'), selectUserValue.value);
  showVisible.value = false;
};

const getPointTransactionList = async (createAfter, createBefore, createBy) => {
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
  if (createBy) queryParams.append('createBy', createBy);
  if (createAfter) queryParams.append('createAfter', createAfter);
  if (createBefore) queryParams.append('createBefore', createBefore);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };

  try {
    const url = `https://test-interview-api.itasaas.com/api/v1/point/point-transaction/count?${queryParams}`;
    const response = await fetch(url, requestOptions);
    const result = await response.json();
    console.log(result);
    if (response.status === 200) {
      loading.value = false;
      const arr = result.data || [];
      mitList.value = arr;
    }
    loading.value = false;
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

const pointBalance = ref(null);
const getPointBalance = async () => {
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
      'https://test-interview-api.itasaas.com/api/v1/point/point-balance/detail',
      requestOptions
    );
    const result = await response.json();
    if (response.status === 200) {
      pointBalance.value = result.data;
    }
    return result;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

const userList = ref([]);
const selectUserValue = ref(null);
const getDifferentUserList = async () => {
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
  const url = `https://test-interview-api.itasaas.com/api/v1/admin/user/list`;
  const response = await fetch(url, requestOptions);
  const result = await response.json();
  if (response.status === 200) {
    userList.value = result.rows.map((item) => {
      return {
        value: item.userId,
        label: item.nickName,
      };
    });
  }
};

// 修改 onMounted
onMounted(async () => {
  const result = await browser.storage.local.get(['token', 'clientId']);
  token.value = result.token;
  clientId.value = result.clientId;
  const userResult = await browser.storage.local.get('userInfo');
  userInfoMain.value = userResult.userInfo;
  // 初始调用一次
  await getPointBalance();
  await getPointTransactionList(null, null, null);
  await getDifferentUserList();
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
  justify-content: space-between;
}

.resume-status {
  font-size: 12px;
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

.date_select :deep(.t-input) {
  color: #4e5969!important;
  border: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  background: #F7F8FA;
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
</style>
