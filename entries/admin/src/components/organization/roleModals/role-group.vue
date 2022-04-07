<template>
  <a-modal
    v-model="showModal"
    :title="modalTitle"
    :width="446"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @ok="submit"
    @cancel="cancel"
    :maskClosable="false"
    :keyboard="false"
  >
    <a-form
      class="add-role-group"
      :autoFormCreate="
        (form) => {
          this.form = form;
        }
      "
    >
      <a-form-item
        label="组织来源"
        fieldDecoratorId="source"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.source"
      >
        <!-- <span
          v-if="roleGroupType === 1"
          style="height: 32px; line-height: 32px"
          >{{ showRoleTitle }}</span
        > -->
        <a-tree-select
          style="width: 100%"
          :tree-data="newSysRoleGroup"
          show-search
          allowClear
          :disabled="roleGroupType === 1"
          treeNodeFilterProp="title"
          @change="handleOnChange"
          :dropdown-style="{ maxHeight: '350px', overflow: 'auto' }"
          :placeholder="$t('languages.PlaceHolder.Select')"
        />
      </a-form-item>
      <a-form-item
        label="角色组名称"
        fieldDecoratorId="gruopName"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.gruopName"
      >
        <a-input
          class="role-group__name"
          maxlength="50"
          placeholder="请输入名称"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { pattern, nameValidator } from "@/common/utils";

import OrgApi from "@/apis/organization";
import { create } from '../../../apis/data-rule/data-rule.api';

@Component({
  name: "add-role-group",
})
export default class AddRoleGroup extends Vue {
  @Prop() value!: boolean;

  @Prop() roleGroupType!: number; // 0：新增，1：编辑

  @Prop() roleGroupData!: any;

  @Prop() sysRoleGroup!: any;

  @Prop() roleInfo!: any;

  showModal: boolean = false;

  showRoleTitle: string = "";

  modalTitle: string = "新建角色组";

  get newSysRoleGroup(){
    console.log(this.sysRoleGroup);
    return this.changeData(this.sysRoleGroup,{})
  }

  @Watch("sysRoleGroup")
  getSysRoleGroup(val){
    if(Array.isArray(val)){
      this.changeData(val,{});
    }
  }

  dataRef: any = {};

  params: any = {
    gruopName: "",
    source: "",
  };

  form: any = {};

  formItemLayout: any = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 18,
    },
  };

  rules: any = {};

  beforeMount() {
    this.setRules();
  }

  changeData(data: any, nodes: any){
    /* const result: any = [];
    data.forEach((node: any) => {
      let obj: any = {
        id: node.id,
        value: node.id,
        name: node.name,
        title: `${node.name}`,
        isLeaf: node.children && node.children.length ? false : true,
        key: node.id,
        code: node.code,
        groupId: node.groupId,
        corpName: node.corpName,
        parentId: nodes.id,
        roleType: node.roleType,
        corpId: node.corpId,
        children: null,
      };
      if (node.children && node.children.length) {
        obj.children = this.changeData(node.children, node);
      }
      if(obj.name!=='默认'){ //隐藏默认角色组
        result.push(obj);
      }
    });
    this.newSysRoleGroup = result; */
    data.forEach((node: any) => {
      if (node.children && node.children.length) {
        node.children = this.changeData(node.children,{});
      }
    })
    return data.filter(el => el.name !== '默认');
  }

  setRules() {
    this.rules = {
      gruopName: {
        rules: [
          {
            required: true,
            message: "名称不能为空",
          },
          {
            validator: nameValidator,
            message: this.$t("languages.Apps.AppNameRule"),
            // 仅限50个字符以内，并不能以空格开头
          },
        ],
      },
      source: {
        rules: [
          {
            required: true,
            message: "组织来源不能为空",
          },
        ],
      },
    };
  }

  handleOnChange(value: any, label: any, extra: any) {
    try{
      this.dataRef = extra.triggerNode.dataRef;
    }catch{
    }
  }

  submit() {
    this.form.validateFields((err: any) => {
      if (!err) {
        const gruopName = this.form.getFieldValue("gruopName");
        const source = this.form.getFieldValue("source");

        if (gruopName === "默认") {
          this.$message.error("角色组名称不能为默认！");
          return;
        }
        if (this.roleGroupType === 1) {
          // 编辑角色组接口
          const params: any = {
            roleGroupName: gruopName,
            corpId: source,
            roleGroupId: this.roleGroupData ? this.roleGroupData.id : "",
          };
          OrgApi.updateRoleGroup(params).then((res: any) => {
            if (res.errcode) {
              this.$message.error(res.errmsg);
              return;
            }

            this.$message.success("编辑成功！");
            this.$emit("reloadTree");
            this.cancel();
          });
        } else {
          // 新增角色组接口
          const params: any = {
            roleGroupName: gruopName,
            parentId: source,
            corpId: source === "other" ? "other" : this.dataRef.corpId,
          };
          OrgApi.addRoleGroup(params).then((res: any) => {
            if (res.errcode) {
              this.$message.error(res.errmsg);
              return;
            }

            this.$message.success("创建成功！");
            this.$emit("reloadTree");
            this.cancel();
          });
        }
      }
    });
  }

  cancel() {
    this.form.resetFields();
    this.$emit("input", false);
  }

  @Watch("value")
  onValueChange(v: boolean) {
    this.showModal = v;
    if (!v) {
      return;
    }
    if (this.roleGroupType === 1) {
      this.modalTitle = "编辑角色组";
      this.$nextTick(() => {
        if (this.form.setFieldsValue) {
          this.rules = Object.assign(this.rules,{source: {
              rules: [
                {
                  required: false,
                  message: "",
                },
              ],
            }});
          this.form.setFieldsValue({
            gruopName: this.roleGroupData.name,
            source: this.roleGroupData.corpId,
          });
          this.showRoleTitle = this.roleGroupData.corpName;
        }
      });
    } else {
      this.modalTitle = "新建角色组";
      this.showRoleTitle = "";
      this.$nextTick(() => {
        if (this.roleInfo) {
          this.dataRef = this.roleInfo;
          this.form.setFieldsValue({
            source: this.roleInfo.id,
          });
        }
      });
    }
  }
}
</script>

<style lang="less" scoped>
</style>
