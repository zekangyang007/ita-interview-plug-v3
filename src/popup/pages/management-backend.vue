<template>
  <div class="home_container">
    <div class="management_backend_home">
      <div
        class="bw100 test_body juc_b radio_container"
        style="padding: 12px 0 0px"
      >
        <t-button variant="text" @click="backHome">
          <template #icon><ChevronLeftIcon /></template>
          返回首页
        </t-button>
        <t-radio-group
          v-model="radioValue"
          variant="default-filled"
          size="medium"
          :style="radioValue === 2 ? 'margin-right: 110px' : ''"
        >
          <t-radio-button :value="1">企业成员管理</t-radio-button>
          <t-radio-button :value="2">权益管理</t-radio-button>
        </t-radio-group>
        <t-button
          v-if="radioValue === 1"
          variant="text"
          theme="primary"
          @click="addNewUser"
        >
          <template #icon><AddIcon /></template>
          添加成员
        </t-button>
        <div v-if="radioValue === 2" />
      </div>
      <div v-if="radioValue === 1" style="padding: 16px">
        <t-table
          class="bh100"
          row-key="id"
          :data="userList"
          :columns="columns"
          :bordered="false"
          :pagination="pagination"
          :loading="tableLoading"
          :hover="true"
          @page-change="
            (pageObj) => {
              (pagination.defaultPageSize = pageObj.pageSize),
                (pagination.defaultCurrent = pageObj.current);
              getDifferentUserList();
            }
          "
        >
          <template #name="{ row }">
            <div class="f14">{{ row.nickName || '未知候选人' }}</div>
          </template>
          <template #phone="{ row }">
            <div class="f14">{{ row.phonenumber || '未知手机号' }}</div>
          </template>
          <template #operation="{ row }">
            <t-button shape="square" variant="text" @click="editUser(row)">
              <template #icon><EditIcon /></template>
            </t-button>
            <t-button
              shape="square"
              variant="text"
              @click="deleteUserOpen(row.userId, row.nickName)"
            >
              <template #icon><DeleteIcon /></template>
            </t-button>
          </template>
        </t-table>
      </div>
      <div v-if="radioValue === 2">
        <RightsAndBenefits />
      </div>
      <div style="height: 24px"></div>
    </div>
    <t-dialog
      v-model:visible="visible"
      :header="title"
      :footer="null"
      :dialogStyle="{
        boxShadow: '0px 1px 10.4px 0px #00000029',
      }"
      :showOverlay="false"
      @close="onCancel"
    >
      <t-form ref="form" :data="formData" :rules="rules" @submit="onSubmit">
        <t-form-item label="姓名" name="nickName" style="margin-bottom: 24px">
          <t-input v-model="formData.nickName" placeholder="请输入姓名" />
        </t-form-item>

        <t-form-item
          label="手机号"
          name="phonenumber"
          style="margin-bottom: 24px"
        >
          <t-input v-model="formData.phonenumber" placeholder="请输入手机号" />
        </t-form-item>
        <t-form-item>
          <t-button type="submit" :loading="loading">确认</t-button>
        </t-form-item>
      </t-form>
    </t-dialog>
    <!-- box-shadow: 0px 1px 10.4px 0px #00000029;-->
    <t-dialog
      v-model:visible="isDeleteVisible"
      :close-btn="false"
      header="删除用户"
      :dialogStyle="{
        boxShadow: '0px 1px 10.4px 0px #00000029',
      }"
      :confirm-btn="{
        content: '删除',
        theme: 'danger',
      }"
      cancel-btn="取消"
      width="50%"
      :showOverlay="false"
      @close="isDeleteVisible = false"
      @confirm="deleteUser"
    >
      <template #body> 确定删除该用户:{{ deleteUserName }}吗？ </template>
    </t-dialog>
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
import browser from 'webextension-polyfill';
import {
  ChevronDownIcon,
  RefreshIcon,
  ChevronLeftIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
} from 'tdesign-icons-vue-next';
import RightsAndBenefits from './rights-and-benefits.vue';

const pagination = ref({
  defaultPageSize: 10,
  defaultCurrent: 1,
  total: 0,
});
const radioValue = ref(1);
const token = ref('');
const clientId = ref('');
const userInfoMain = ref(null);
const loading = ref(false);
const tableLoading = ref(false);
const form = ref(null);

const deptList = ref([]);

const userList = ref([]);

const visible = ref(false);
const isDeleteVisible = ref(false);
const deleteUserId = ref('');
const deleteUserName = ref('');
const title = ref('添加新用户');
const formData = ref({
  userId: '',
  nickName: '',
  userName: '',
  phonenumber: '',
  deptId: '',
  deptName: '',
});

// 表单验证规则
const rules = {
  nickName: [{ required: true, message: '请输入姓名', type: 'error' }],
  phonenumber: [
    { required: true, message: '请输入手机号', type: 'error' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', type: 'error' },
  ],
};

// T-Design Table表格设置项
const columns = [
  {
    colKey: 'name',
    title: '候选人姓名',
    cell: 'name',
    width: 100,
    align: 'left',
    foot: '-',
  },
  {
    colKey: 'phone',
    title: '手机号',
    cell: 'phone',
    width: 100,
    align: 'left',
    foot: '-',
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 100,
    align: 'center',
  },
];

const emit = defineEmits(['backHome']);

const backHome = () => {
  emit('backHome');
};

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
  const url = `https://interview-api.itasaas.com/api/v1/admin/user/list?isAsc=desc&orderByColumn=updateTime&pageSize=${pagination.value.defaultPageSize}&pageNum=${pagination.value.defaultCurrent}`;
  const response = await fetch(url, requestOptions);
  const result = await response.json();
  if (response.status === 200) {
    userList.value = result.rows;
    pagination.value.total = result.total;
  }
};

const addNewUser = async () => {
  visible.value = true;
  formData.value.userId = '';
  formData.value.nickName = '';
  formData.value.phonenumber = '';
  formData.value.deptId = '';
  formData.value.deptName = '';
  formData.value.userName = '';
  title.value = '添加新用户';
};

const editUser = async (data) => {
  visible.value = true;
  formData.value.userId = data.userId;
  formData.value.nickName = data.nickName;
  formData.value.phonenumber = data.phonenumber;
  formData.value.deptId = data.deptId;
  formData.value.deptName = data.deptName;
  formData.value.userName = data.userName;
  title.value = '编辑用户';
};

const addUser = async (data) => {
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID
  myHeaders.append('Content-Type', 'application/json');

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(data),
  };
  const url = `https://interview-api.itasaas.com/api/v1/admin/user`;
  const response = await fetch(url, requestOptions);
  const result = await response.json();
  console.log(result);
};

const modifyUser = async (data) => {
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID
  myHeaders.append('Content-Type', 'application/json');

  const requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: JSON.stringify(data),
  };
  const url = `https://interview-api.itasaas.com/api/v1/admin/user`;
  const response = await fetch(url, requestOptions);
  const result = await response.json();
  console.log(result);
};

const deleteUserOpen = (userId, userName) => {
  deleteUserId.value = userId;
  deleteUserName.value = userName;
  isDeleteVisible.value = true;
};

const deleteUser = async () => {
  const myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    token.value // 请替换为您的实际令牌
  );
  myHeaders.append('Clientid', clientId.value); // 请替换为您的实际客户端 ID
  const requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
  };
  const url = `https://interview-api.itasaas.com/api/v1/admin/user/${deleteUserId.value}`;
  const response = await fetch(url, requestOptions);
  const result = await response.json();
  console.log(result);
  isDeleteVisible.value = false;
  await getDifferentUserList();
};

// 提交表单
const onSubmit = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    loading.value = true;
    try {
      formData.value.userName = formData.value.phonenumber;
      if (formData.value.userId) {
        // 调用编辑接口
        await modifyUser(formData.value);
        visible.value = false;
        formData.value.userId = '';
        return;
      }
      const deptId = deptList.value[0]?.deptId;
      formData.value.deptId = deptId;
      await addUser(formData.value);
      visible.value = false;
      formData.value.userId = '';
      formData.value.nickName = '';
      formData.value.phonenumber = '';
      formData.value.deptId = '';
      formData.value.deptName = '';
      formData.value.userName = '';
      title.value = '添加新用户';
      await getDifferentUserList();
    } finally {
      loading.value = false;
    }
  } else {
    console.log('提交失败:', firstError);
  }
};

const getAllDeptList = async () => {
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
  const url = `https://interview-api.itasaas.com/api/v1/admin/dept/list`;
  const response = await fetch(url, requestOptions);
  const result = await response.json();
  deptList.value = result.data;
};

onMounted(async () => {
  const result = await browser.storage.local.get(['token', 'clientId']);
  token.value = result.token;
  clientId.value = result.clientId;
  const userInfo_result = await browser.storage.local.get('userInfo');
  userInfoMain.value = userInfo_result.userInfo;
  await getAllDeptList();
  await getDifferentUserList();
});
</script>
<style scoped>
.radio_container
  :deep(
    .t-radio-group.t-radio-group--filled
      .t-radio-button.t-is-checked
      .t-radio-button__label
  ) {
  color: #165dff !important;
}
.radio_container :deep(.t-radio-group.t-radio-group--filled) {
  border-color: #f7f8fa;
  background-color: #f7f8fa;
}
</style>
