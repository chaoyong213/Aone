<script setup>
import { ref, onMounted, onBeforeMount } from "vue";

import Aside from "../../components/Aside.vue";
import Content from "../../components/Content.vue";
import Header from "../../components/Header.vue";

const ipcRenderer = window.electron.ipcRenderer;

const classList = ref([]);
const selectedId = ref(1);
const handleClassClick = (id) => {
  selectedId.value = id;
};

const getClassList = async () => {
  classList.value = await ipcRenderer.sendSync(
    "runSql",
    "select * from fav_class"
  ).data;
};

onBeforeMount(() => {
  ipcRenderer.sendSync("createTable");
  getClassList();
});
</script>
<template>
  <t-layout>
    <t-header>
      <Header></Header>
    </t-header>
    <t-layout>
      <t-aside>
        <Aside
          :classList="classList"
          :defaultValue="selectedId"
          @class-click="handleClassClick"
        ></Aside>
      </t-aside>
      <t-content>
        <Content :selectedId="selectedId" :classList="classList"></Content>
      </t-content>
    </t-layout>
  </t-layout>
</template>