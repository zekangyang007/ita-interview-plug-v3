<template>
  <template v-if="retrieved">
    <router-view />
    <ui-dialog />
  </template>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import browser from 'webextension-polyfill';
import { useStore } from '@/stores/main';
import { sendMessage } from '@/utils/message';
import { useWorkflowStore } from '@/stores/workflow';
import { useHostedWorkflowStore } from '@/stores/hostedWorkflow';
import { loadLocaleMessages, setI18nLanguage } from '@/lib/vueI18n';

const store = useStore();
const workflowStore = useWorkflowStore();
const hostedWorkflowStore = useHostedWorkflowStore();

const retrieved = ref(false);

browser.storage.local.get('isRecording').then(({ isRecording }) => {
  if (!isRecording) return;

  sendMessage('open:dashboard', '/recording', 'background').then(() => {
    window.close();
  });
});

onMounted(async () => {
  try {
    await store.loadSettings();
    await loadLocaleMessages(store.settings.locale, 'popup');
    await setI18nLanguage(store.settings.locale);

    await workflowStore.loadData();
    await hostedWorkflowStore.loadData();

    retrieved.value = true;
  } catch (error) {
    console.error(error);
    retrieved.value = true;
  }
});
</script>
<style>
body {
  height: 600px !important;
  width: 650px !important;
  font-size: 16px;
}
input:focus {
  box-shadow: none !important;
}
</style>
