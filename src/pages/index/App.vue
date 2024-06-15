<script setup>
const ipcRenderer = window.electron.ipcRenderer

//关闭主窗口
const closeWindow = () => {
  ipcRenderer.send('closeWindow')
}

//创建子窗口
const createOtherWindow = (e, b) => {
  ipcRenderer.send('createOtherWindow', {
    height: 720,
    width: 1280,
    name: "favroite"
  })
}


</script>
<template>
  <t-layout align="center">
    <t-space direction="vertical">
      <t-header>
        <t-button  @click="closeWindow">关闭窗口</t-button>
      </t-header>
      <t-content> 
        <t-button @click="createOtherWindow">我的收藏</t-button>
      </t-content>      
    </t-space>
  </t-layout>
</template>
