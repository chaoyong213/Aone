<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import cheerio, { load } from "cheerio";
const ipcRenderer = window.electron.ipcRenderer;

const props = defineProps(["selectedId", "classList"]);

const fav_list = ref();
const total = ref(0);
const loading = ref(false);

const insertData = async (data) => {
  await ipcRenderer.sendSync(
    "runSql",
    `INSERT INTO fav_list (fav_url, fav_title, class_id) VALUES('${data.fav_url}', '${data.fav_title}', '${data.class_id}')`
  );
  getData();
};

const updateData = async (data) => {
  let sql =
    "update favroite set fav_type = " +
    data.fav_type +
    " where fav_id = " +
    data.fav_id;
  await ipcRenderer.sendSync("runSql", sql);
  getData();
};

const deleteData = async (data) => {
  await ipcRenderer.send(
    "runSql",
    `delete from fav_list where fav_id = ${data.fav_id}`
  );
  getData();
};

const batchDelData = async (e) => {
  if (selectedRowKeys.value.join(",").length === 0) {
    return MessagePlugin.warning("未选择任何数据!");
  }
  await ipcRenderer.send(
    "runSql",
    `delete from fav_list where fav_id in ( ${selectedRowKeys.value.join(
      ","
    )} )`
  );
  getData();
};

const getData = async () => {
  loading.value = true;
  const result = await ipcRenderer.sendSync(
    "runSql",
    `select * from fav_list where class_id = ${props.selectedId}`
  ).data;
  total.value = result.length;
  fav_list.value = result;
  const timer = setTimeout(() => {
    loading.value = false;
    clearTimeout(timer);
  }, 1000);
};

const s = computed(async () => {
  loading.value = true;
  const result = await ipcRenderer.sendSync(
    "runSql",
    `select * from fav_list where class_id = ${props.selectedId}`
  ).data;
  total.value = result.length;
  fav_list.value = result;
  const timer = setTimeout(() => {
    loading.value = false;
    clearTimeout(timer);
  }, 1000);
});

const pagination = ref({
  defaultCurrent: 1,
  defaultPageSize: 10,
  pageSizeOptions: [],
  total: total,
});

const columns = [
  { colKey: "any", type: "multiple" },
  { colKey: "fav_title", title: "标题", width: "800", ellipsis: true },
  { colKey: "tools", title: "操作" },
];

const selectedRowKeys = ref([]);

const rehandleSelectChange = (value, ctx) => {
  selectedRowKeys.value = value;
};

const go = (link) => {
  window.electron.shell.openExternal(link);
};

const visible = ref(false);

const handleClick = () => {
  issave.value = false;
  visible.value = true;
  formData.value = ref([]);
  header.value = "新增收藏";
};
const handleClose = () => {
  visible.value = false;
};

const form = ref(null);

const formData = ref({
  fav_title: "",
  fav_url: "",
  class_id: "",
});

const FORM_RULES = {
  fav_title: [{ required: true, message: "标题必填" }],
  fav_url: [{ required: true, message: "网址必填" }],
  class_id: [{ required: true, message: "类型必选" }],
};

const onReset = () => {
  MessagePlugin.success("重置成功");
};

const getTitle = async () => {
  let url = formData._value.fav_url;
  loading.value = true;
  await axios
    .get(url)
    .then((res) => {
      let $ = cheerio.load(res.data);
      formData._value.fav_title = $("title").text();
      loading.value = false;
    })
    .catch((err) => {
      MessagePlugin.warning("获取标题失败，请检查网址是否正确");
      loading.value = false;
    });
};
const onSubmit = ({ validateResult, firstError }) => {
  if (validateResult === true) {
    if (issave.value) {
      updateData({
        fav_title: formData._value.fav_title,
        fav_url: formData._value.fav_url,
        fav_type: formData._value.fav_type,
        fav_id: formData._value.fav_id,
      });
    } else {
      insertData({
        fav_title: formData._value.fav_title,
        fav_url: formData._value.fav_url,
        class_id: formData._value.class_id,
      });
    }

    MessagePlugin.success("提交成功");
    visible.value = false;
  } else {
    console.log("Validate Errors: ", firstError, validateResult);
    MessagePlugin.warning(firstError);
  }
};

const onEnter = (_, { e }) => {
  e.preventDefault();
};

const issave = ref(false);
const edit = (data) => {
  issave.value = true;
  formData._value = data;

  visible.value = true;
  header.value = "编辑收藏";
};

const header = ref("new");

onMounted(() => {});
</script>
<template>
  <t-layout class="custom">
    <t-content
      style="background: #fff; -webkit-app-region: no-drag; padding: 20px"
    >
      <t-space>
        <t-button theme="primary" @click="handleClick">
          <template #icon>
            <t-icon name="bookmark-add"></t-icon>
          </template>
          新增收藏
        </t-button>
        <t-button theme="danger" variant="base" @click="batchDelData">
          <template #icon>
            <t-icon name="delete"></t-icon>
          </template>
          批量删除
        </t-button>
      </t-space>
      <div class="mytable">
        <t-table
          v-if="s"
          :data="fav_list"
          :columns="columns"
          row-key="fav_id"
          size="small"
          :hover="true"
          :bordered="false"
          :pagination="pagination"
          @select-change="rehandleSelectChange"
          :loading="loading"
          :selected-row-keys="selectedRowKeys"
          :select-on-row-click="true"
          :resizable="false"
          lazy-load
        >
          <template #fav_title="{ row }">
            <t-row justify="space-between">
              <t-col>{{ row.fav_title }}</t-col>

              <t-col
                ><t-space>
                  <t-icon
                    class="iconbox"
                    name="edit"
                    @click="
                      edit({
                        fav_id: `${row.fav_id}`,
                        fav_url: `${row.fav_url}`,
                        fav_title: `${row.fav_title}`,
                        fav_type: `${row.fav_type}`,
                      })
                    "
                  ></t-icon>
                </t-space>
              </t-col>
            </t-row>
          </template>
          <template #tools="{ row }">
            <t-space>
              <t-button theme="success" @click="go(row.fav_url)" variant="text">
                <t-icon name="link" />
              </t-button>

              <t-popconfirm
                theme="danger"
                placement="right-bottom"
                content="是否删除"
                @confirm="deleteData(row)"
              >
                <t-button theme="danger" variant="text">
                  <t-icon name="delete" />
                </t-button>
              </t-popconfirm>
            </t-space>
          </template>
        </t-table>
      </div>
    </t-content>

    <t-drawer
      v-model:visible="visible"
      :footer="false"
      :header="header"
      placement="top"
      :on-confirm="handleClose"
      @close="handleClose"
    >
      <t-space direction="vertical" size="large" style="width: 100%">
        <t-form
          ref="form"
          :rules="FORM_RULES"
          :data="formData"
          :colon="true"
          @reset="onReset"
          @submit="onSubmit"
        >
          <t-form-item label="标题" name="fav_title">
            <t-input
              v-model="formData.fav_title"
              placeholder="请输入内容"
              @enter="onEnter"
            ></t-input>
          </t-form-item>

          <t-form-item label="网址" name="fav_url">
            <t-input
              v-model="formData.fav_url"
              placeholder="请输入内容"
              @enter="onEnter"
            ></t-input>
          </t-form-item>
          <t-form-item label="类型" name="fav_type">
            <t-select v-model="formData.class_id">
              <t-option
                v-for="(item, index) in classList"
                :key="index"
                :value="item.class_id"
                :label="item.class_name"
                >{{ item.class_name }}</t-option
              >
            </t-select>
          </t-form-item>
          <t-form-item>
            <t-space size="small">
              <t-button theme="primary" type="submit" :disabled="loading"
                >提交</t-button
              >
              <t-button theme="success" @click="getTitle" :loading="loading"
                >获取标题</t-button
              >
              <t-button theme="default" variant="base" type="reset"
                >重置</t-button
              >
            </t-space>
          </t-form-item>
        </t-form>
      </t-space>
    </t-drawer>
  </t-layout>
</template>

<style lang="less" scoped>
.mytable {
  margin-top: 10px;
}

.iconbox {
  display: none;
  cursor: pointer;
}

.t-table-td--ellipsis:hover {
  .iconbox {
    display: inline;
  }
}

.custom {
  height: 700px;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-button {
    display: none;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-track-piece {
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(144, 147, 153, 0.3);
    cursor: pointer;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-corner {
    display: none;
  }
  &::-webkit-resizer {
    display: none;
  }
}
</style>
