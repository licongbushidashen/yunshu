<template>
  <a-modal
    v-model="showModal"
    :title="tiltes"
    :width="446"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @ok="submitAddApp"
    :confirmLoading="confirmLoading"
    @cancel="closeAddModal"
    :maskClosable="false"
    :keyboard="false"
  >
    <a-form class="add-app__wrap" :autoFormCreate="FormCreate">
      <a-form-item
        label="分组编码"
        fieldDecoratorId="code"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.code"
      >
        <a-input
          :disabled="isEdit"
          v-model="params.code"
          class="add-app__input"
          maxlength="28"
          placeholder="请输入应用分组编码"
        />
      </a-form-item>
      <a-form-item
        :label="$t('languages.Apps.GroupName')"
        fieldDecoratorId="name"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.name"
      >
        <a-input
          class="add-app__input"
          v-model.trim="params.name"
          maxlength="28"
          placeholder="请输入应用分组名称"
        />
      </a-form-item>
      <a-form-item
        label="选择应用"
        fieldDecoratorId="children"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        v-if="!isEdit"
      >
        <a-tree-select
          :treeData="treeData"
          :maxTagCount="2"
          style="width: 292px;top:5px"
          dropdownClassName="orgsync-form-tree-select"
          class="orgsync-form-item"
          v-model="params.children"
          :getPopupContainer="getPopupContainer"
          :replaceFields="replaceFields"
          placeholder="请选择应用"
          :treeCheckable="true"
          treeNodeFilterProp="title"
          @treeExpand="onTreeExpand"
        ></a-tree-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { pattern } from "@/common/utils";
import AppsApi from "@/apis/apps";
import { State, Action, namespace } from "vuex-class";
const AppCenterModule = namespace("Apps/AppCenter");
@Component({
  name: "AddGroup",
})
export default class AddGroup extends Vue {
  @Prop() value!: boolean;

  @Prop() groupItem!: object;

  @AppCenterModule.State("appGroupList") catalogues: any;

  showModal: boolean = false;

  confirmLoading: boolean = false;
  treeData: Array<any> = [];
  treeExpandedKeys: string[] = [];

  params: any = {
    name: "",
    code: "",
    children: [],
  };

  replaceFields: any = {
    children: "children",
    title: "name",
    key: "key",
    value: "id",
  };

  form: any = this.$form.createForm(this);

  formItemLayout: any = {
    labelCol: {
      span: 5,
    },
    wrapperCol: {
      span: 19,
    },
  };

  rules: any = {};

  get tiltes() {
    return this.groupItem.hasOwnProperty("name") &&
      this.groupItem["name"].length > 0
      ? this.$t("languages.Apps.EditGroup")
      : this.$t("languages.Apps.AddGroup");
  }

  get isEdit() {
    return this.groupItem.hasOwnProperty("name") &&
      this.groupItem["name"].length > 0
      ? true
      : false;
  }

  beforeMount() {
    this.setRules();
  }

  destroyed() {
    this.$emit("input", false);
    this.params = {
      name: "",
      code: "",
      children: [],
    };
    this.treeData = [];
    this.treeExpandedKeys = [];
    this.form.resetFields();
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  /**
   * 单击三角符展开树
   */
  onTreeExpand(expandedKeys: any) {
    this.treeExpandedKeys = expandedKeys;
  }

  setRules() {
    this.rules = {
      name: {
        rules: [
          {
            required: true,
            message: "请输入应用分组名称",
          },
        ],
      },
      code: {
        rules: [
          {
            required: true,
            message: "请输入应用分组编码",
          },
          {
            pattern: pattern("code"),
            message: this.$t("languages.Apps.AppCodeRule"),
            // '以字母开头不超过28个字符，仅支持字母、数字、下划线'
          },
        ],
      },
    };
  }

  FormCreate(form: any) {
    this.form = form;
  }

  closeAddModal() {
    this.$emit("input", false);
    this.params = {
      name: "",
      code: "",
      children: [],
    };
    this.treeData = [];
    this.treeExpandedKeys = [];
    this.form.resetFields();
  }

  submitAddApp() {
    // console.log(this.params, "after submit");
    /* 校验必填项和格式 */
    this.form.validateFields((err: any) => {
      if (!err) {
        this.confirmLoading = true;
        if (!this.isEdit) {
          // 新增
          if (this.params.children && this.params.children.length) {
            this.params.children = this.params.children.map((d: any) => {
              return {
                id: d
              }
            })
          }

          AppsApi.AppgroupCreate(this.params)
            .then((res:any) => {
              this.confirmLoading = false;
              if (res.errcode !== 0) {
                return this.$message.error(res.errmsg);
              }
              this.$emit("submitGroupEvent");
              /* 关闭弹窗 */
              this.closeAddModal();
            })
            .catch((e: any) => {
              this.confirmLoading = false;
              console.log(e);
            });
        } else {
          // 重命名
          const params: any = {
            id: this.groupItem["id"],
            code: this.groupItem["code"],
            name: this.params.name,
          };
          AppsApi.AppgroupUpdate(params)
            .then((res:any) => {
              this.confirmLoading = false;
              if (res.errcode !== 0) {
                return this.$message.error(res.errmsg);
              }
              this.$emit("submitGroupEvent");
              /* 关闭弹窗 */
              this.closeAddModal();
            })
            .catch((e: any) => {
              this.confirmLoading = false;
              console.log(e);
            });
        }
      }
    });
  }

  @Watch("value")
  onValueChange(v: boolean) {
    this.showModal = v;
    this.$nextTick(() => {
      this.form.setFieldsValue({
        code: this.groupItem["code"],
        name: this.groupItem["name"],
      });
      this.params.name = this.groupItem["name"];
      if (!this.isEdit) {
        this.getTreeData();
      }
    });
  }

  @Watch("$i18n.locale")
  onLanguageChange() {
    this.setRules();
  }

  // 获取应用数据
  getTreeData() {
    this.treeData = [];
    const params: any = {
      groupCode: this.$route.params.appCode,
      fromRecycle: false,
    };
    AppsApi.getAppgroupList(params)
      .then((res: any) => {
        if (res.errcode !== 0) {
          return this.$message.error(res.errmsg);
        }
        this.treeData = res.data.filter((d: any,index) => {
          if (d.children && d.children.length && d.code !== "all") {
          
            d.children.forEach(v=>{
              v.key = v.id +"_" + index;
            })
            return d
          }
        });
        // console.log(this.treeData,"this.treeData----------");
        
      })
      .catch((e: any) => {
        console.log(e);
      });
  }
}
</script>

<style lang="less">
.add-app__wrap {
  .ant-form-item-label {
    // width: 74px;
    label {
      font-family: PingFangSC-Regular;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
    }
  }
  input {
    color: rgba(0, 0, 0, 0.85);
  }
  // .ant-form-item-control-wrapper {
  //   width: 307px;
  // }

  .add-app__input {
    width: 292px;
  }
}
.orgsync-form-tree-select {
  max-width: 292px;

  &.ant-select-tree-dropdown {
    max-height: 35vh !important;
  }
  .ant-select-tree li span.ant-select-tree-checkbox {
    display: inline-block;
  }
  .ant-select-tree
    li
    span.ant-select-tree-checkbox
    + .ant-select-tree-node-content-wrapper {
    width: calc(100% - 46px);
  }
  .ant-select-tree
    > .ant-select-tree-treenode-checkbox-checked
    > .ant-select-tree-node-content-wrapper,
  .ant-select-tree-child-tree
    .ant-select-tree-treenode-checkbox-checked
    .ant-select-tree-node-content-wrapper {
    background: none !important;
    font-weight: normal;
  }

  .ant-select-tree-title {
    max-width: 90%;
    overflow: hidden;
    display: inline-block;
    vertical-align: middle;
    text-overflow: ellipsis;
  }

  .ant-select-tree-node-content-wrapper {
    background-color: #ffffff !important;
  }
  .ant-select-tree-node-content-wrapper:after {
    content: "";
    display: none !important;
  }
}
.orgsync-form-item {
  .ant-select-selection {
    max-height: 150px;
    overflow: hidden;
    overflow-y: auto;

    box-sizing: inherit;
    background-color: #fff;
    transition: none;
  }
}
</style>
