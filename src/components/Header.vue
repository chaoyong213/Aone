<script setup>
const ipcRenderer = window.electron.ipcRenderer
const closeOtherWindow = () => {
    ipcRenderer.send('closeOtherWindow')
}
</script>
<template>    
    <t-row justify="space-between" align="middle" style="padding: var(--td-size-3);background:var(--td-brand-color-7);color:var(--td-font-white-1);cursor: pointer;">
        <t-col>我的收藏</t-col>
        <t-col title="关闭" @click="closeOtherWindow"><t-icon name="close" /></t-col>
        
    </t-row>
</template>