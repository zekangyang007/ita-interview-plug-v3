<template>
  <div class="test_body grey3" style="padding: 12px;">
   当前版本：V1.3.28
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

</script>
<style scoped>
:deep(.t-check-tag-group) {
  line-height: 36px;
}
.recording-card {
  transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.home-form-container .t-check-tag-group .t-tag {
  margin-top: 5px;
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
.pos_a_err {
  position: absolute;
  bottom: -22px;
  left: 0;
}
.bg_login {
  background-image: url('../../assets//images/bg_plug_in.png');
  background-size: 100% 100%;
  z-index: -1;
}
.home_container {
  background-color: #fff;
  /* padding: 12px; */
}
.logo_container :deep(.t-image__wrapper) {
  background: #fff;
}
.top_container {
  padding: 12px 16px;
  border-bottom: 1px solid #f2f3f5;
}
.avatar_body {
  background-color: #fff;
  border-radius: 70px;
  padding-right: 8px;
}
.avatar_body:hover {
  background-color: #f2f3f5;
}
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
.plug_container {
  margin: 14px 8px 8px !important;
  padding: 24px 0;
  border-radius: 8px;
  border: 1px solid #f2f3f5;
}
.Group_container:deep(.t-image__wrapper) {
  background: #fff;
}
:deep(.t-form__item) {
  margin-bottom: 4px;
}
.pi_close {
  position: absolute;
  left: -32px;
}
:deep(.t-collapse) {
  border: none;
}
:deep(.t-collapse-panel__header) {
  border: none !important;
}
:deep(
    .t-radio-group.t-radio-group--primary-filled .t-radio-button.t-is-checked
  ) {
  color: #ffffff !important;
}
:deep(.t-form__label--top) {
  display: flex;
}
.b_card {
  background-color: #f7f8fa;
  border-radius: 4px;
  padding: 12px;
}
:deep(.t-radio-group.t-radio-group--filled) {
  background-color: #eee;
}
</style>
