<template>
  <div class="disflex fl_dir_c bw100 bh100">
    <t-button variant="text" @click="backHome" style="width: 85px">
      <template #icon><ChevronLeftIcon /></template>
      返回首页
    </t-button>
    <t-card bordered class="bw100">
      <div class="bw100 test_body fl_dir_c juc_c" style="gap: 14px">
        <div class="bw100 disflex fl_dir_c" style="gap: 10px">
          <div class="f14 fw_b">职位名称</div>
          <t-input
            v-model="formData.name"
            @change="onChangeName"
            placeholder="请输入岗位名称"
          />
        </div>
        <div class="bw100 disflex fl_dir_c" style="gap: 10px">
          <div class="f14 fw_b">职位描述（JD）</div>
          <t-textarea
            v-model="formData.JDValue"
            placeholder="请输入JD内容"
            name="description"
            @change="onChangeName"
            :autosize="{ minRows: 15 }"
          />
        </div>
      </div>
    </t-card>
    <div class="test_body bw100 juc_c">
      <t-button theme="primary" size="medium" @click="editJDMain">
        一键修改
      </t-button>
    </div>
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
  CloseIcon,
  RefreshIcon,
  Edit2Icon,
  SearchIcon,
} from 'tdesign-icons-vue-next';

const emit = defineEmits(['backHome']);

const formData = reactive({
  name: '',
  JDValue: '',
});

const backHome = async () => {
  await browser.storage.local.remove(['local_activeObj']);
  emit('backHome');
};
const jdListToBeConfirmed = ref([]); // JD已确认
const editJDMain = async () => {
  const result = await browser.storage.local.get([
    'local_jdListToBeConfirmed',
    'local_jdListConfirmed',
    'local_jdListUpdate',
  ]);
  jdListToBeConfirmed.value = result.local_jdListToBeConfirmed
    ? Object.values(result.local_jdListToBeConfirmed)
    : [];
  const obj = {
    indexName: formData.name,
    jobTitle: formData.name,
    jobDescription: formData.JDValue,
  };
  jdListToBeConfirmed.value.push(obj);
  await browser.storage.local.set({
    local_jdListToBeConfirmed: jdListToBeConfirmed.value,
  });
  formData.name = '';
  formData.JDValue = '';
  backHome();
};

const active = async () => {
  const result = await browser.storage.local.get(['local_activeObj']);
  const activeObj = result.local_activeObj;
  if (activeObj) {
    formData.name = activeObj.mitObj.jobTitle || '';
    formData.JDValue = activeObj.mitObj.jobDescription || '';
  }
};

const onChangeName = async () => {
  const result = await browser.storage.local.get(['local_activeObj']);
  const activeObj = result.local_activeObj;
  activeObj.mitObj.jobTitle = formData.name;
  activeObj.mitObj.jobDescription = formData.JDValue;
  browser.storage.local.set({ local_activeObj: activeObj });
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
</style>
