<script setup>
import { ref } from "vue";
const props = defineProps({
  classList: Object,
});
const ipcRenderer = window.electron.ipcRenderer;
const emit = defineEmits(["class-click"]);

const handleClick = (id, index) => {
  isactive.value = index;
  emit("class-click", id);
};

const isactive = ref(0);

const form = ref(null);
const formData = ref({
  class_name: "",
});
const FORM_RULES = {
  class_name: [{ required: true, message: "标题必填" }],
};

const onSubmit = ({ validateResult, firstError }) => {
  if (validateResult === true) {
    ipcRenderer.sendSync(
      "runSql",
      `INSERT INTO fav_class (class_name) VALUES('${formData._value.class_name}')`
    );
  } else {
    MessagePlugin.warning(firstError);
  }
};

const deleteClass = (id) => {
  ipcRenderer.sendSync(
    "runSql",
    `delete from fav_class where class_id = ${id}`
  );
};
</script>

<template>
  <t-list :split="true">
    <t-list-item
      v-for="(item, index) in classList"
      :key="index"
      @click="handleClick(item.class_id, index)"
      :class="{ actived: index == isactive }"
    >
      {{ item.class_name }}
      <template #action>
        <t-popconfirm
          theme="default"
          content="是否删除"
          @confirm="deleteClass(item.class_id)"
        >
          <t-icon name="delete" />
        </t-popconfirm>
      </template>
    </t-list-item>

    <template #footer>
      <t-form
        ref="form"
        :rules="FORM_RULES"
        :data="formData"
        @submit="onSubmit"
        style="height: 120px"
      >
        <t-form-item
          label="分类名称"
          name="class_name"
          label-align="top"
          layout="inline"
        >
          <t-space>
            <t-input
              style="width: 120px"
              v-model="formData.class_name"
              placeholder="请输入分类名称"
            ></t-input>
            <t-button ghost theme="primary" type="submit" variant="dashed">
              <t-icon name="add"></t-icon>
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </template>
  </t-list>
</template>

<style scoped lang="less">
.actived {
  background-color: var(--td-gray-color-2);
  color: var(--td-brand-color) !important;
}

.t-list-item:hover {
  cursor: pointer;
  background: var(--td-gray-color-1);
  color: var(--td-font-gray-2);
}
</style>