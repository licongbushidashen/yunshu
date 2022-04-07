<template>
  <a-modal
    v-model="showModal"
    :title="modalTitle"
    :width="506"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @ok="submit"
    @cancel="cancel"
    :maskClosable="false"
    :keyboard="false"
  >
    <a-form
      class="add-role"
      :autoFormCreate="
        (form) => {
          this.form = form;
        }
      "
    >
      
      <a-form-item
        label="角色组"
        fieldDecoratorId="roleGroup"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.roleGroup"
      >
        <a-tree-select
          style="width: 100%"
          :tree-data="sysTreeData"
          show-search
          allowClear
          @change="handleOnChange"
          treeNodeFilterProp="title"
          :disabled="roleType === 1"
          :dropdown-style="{ maxHeight: '350px', overflow: 'auto' }"
          :placeholder="$t('languages.PlaceHolder.Select')"
        />
      </a-form-item>

      <a-form-item
        label="角色编码"
        fieldDecoratorId="roleCode"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.roleCode"
      >
        <a-input class="role__name" :class="codeErr ? 'has-err':''" :disabled="roleType === 1" maxlength="28" placeholder="请输入编码，未填写系统将自动生成" @focus="codeFocus"/>
        <div class="err_msg" v-show="codeErr">角色编码已存在</div>
      </a-form-item>

      <a-form-item
        label="角色名称"
        fieldDecoratorId="roleName"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.roleName"
      >
        <a-input class="role__name" :class="nameErr ? 'has-err':''" maxlength="50" placeholder="请输入名称" @focus="nameFocus"/>
        <div class="err_msg" v-show="nameErr">角色名称已存在</div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { pattern, nameValidator, roleCodeValidator } from "@/common/utils";

import OrgApi from "@/apis/organization";

@Component({
  name: "add-role",
})
export default class AddRole extends Vue {
  @Prop() value!: boolean;

  @Prop() roleType!: number; // 0：新增，1：编辑

  @Prop() roleData!: any;

  @Prop() treeData!: any;

  @Prop() roleInfo!: any;

  sysRoleList: any[] = [];

  dataRef: any = {};

  codeErr: boolean = false;
  
  nameErr: boolean = false;

  get sysTreeData() {
    if (!this.treeData) {
      return [];
    }
    const res = this.treeData.filter((i) => i.children);
    let data = this.dataRecursion(res);
    return this.changeData(data, {});
  }

  codeFocus(){
    this.codeErr = false;
  }
  nameFocus(){  
    this.nameErr = false;
  }

  handleOnChange(value: any, label: any, extra: any) {
    if (extra.triggerNode) {
      this.dataRef = extra.triggerNode.dataRef;
    }
  }
  changeData(data: any, nodes: any){
    // let result: any = [];
    // data.forEach((node: any) => {
    //   let obj: any = {
    //     id: node.id,
    //     value: node.id,
    //     name: node.name,
    //     title: `${node.name}`,
    //     isLeaf: node.children && node.children.length ? false : true,
    //     key: node.id,
    //     code: node.code,
    //     groupId: node.groupId,
    //     corpName: node.corpName,
    //     parentId: nodes.id,
    //     roleType: node.roleType,
    //     corpId: node.corpId,
    //     children: null,
    //   };
    //   if (node.children && node.children.length) {
    //     obj.children = this.changeData(node.children, node);
    //   }
    //   if(obj.name!='默认'){ //隐藏默认角色组
    //     result.push(obj);
    //   }
    // });

    data.forEach((node: any) => {
      if (node.children && node.children.length) {
        node.children = this.changeData(node.children,{});
      }
    })
    return data.filter(el => el.name !== '默认');
  }

  dataRecursion(list: any) {
    const arr: any = [];
    list.map((i: any) => {
      if (i.children && i.children.length) {
        i.selectable = i.corpId ? true : false;
        i.children = this.dataRecursion(i.children);
      } else {
        i.isLeaf = true;
        delete i.children;
      }
      if (i.name !== "默认分组") arr.push(i);
    });
    return arr;
  }

  showModal: boolean = false;

  modalTitle: string = "新建角色";

  params: any = {
    roleName: "",
    roleGroup: "",
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

  setRules() {
    this.rules = {
      roleName: {
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
      roleCode:{
        rules: [
          {
            validator: roleCodeValidator,
            message: this.$t("languages.Apps.AppCodeRule"),
          }
        ]
      },
      roleGroup: {
        rules: [
          {
            required: true,
            message: "角色组不能为空",
          },
        ],
      },
    };
  }

  isSubmiting:boolean = false
  // 新建角色
  submit() {
    const vm = this;
    if(this.isSubmiting){
      this.$message.warning('已提交，请等待接口返回')
      return
    }
    this.isSubmiting = true
    
    this.form.validateFields((err: any) => {
      if (!err) {
        const roleName = this.form.getFieldValue("roleName");
        const roleCode = this.form.getFieldValue("roleCode")
        const roleGroup = this.form.getFieldValue("roleGroup");
        if (this.roleType === 1) {
          console.log(this.roleData,'this.roleData');

          // 更新角色
          const params = {
            roleName,
            corpId: this.dataRef.corpId,
            roleId: this.roleData ? this.roleData.id : "",
            code: this.roleData ? this.roleData.code : "",
            roleGroupId: this.roleData ? this.roleData.groupId : "",
          };
          
          OrgApi.updateRole(params).then((res: any) => {
            if (res.errcode) {
              this.isSubmiting = false
              // this.$message.error(res.errmsg);
              switch(res.errcode){
                case 202002:
                  vm.codeErr = true;
                  break
                case 202000:
                  vm.nameErr = true;
                  break
              }
              return;
            }
            this.$message.success("修改成功！");
            this.$emit("reloadTree");
            this.$emit("nameChange", params);
            this.cancel();
            this.isSubmiting = false
          });
        } else {
          if (roleName === "部门主管") {
            this.$message.warning("角色名称不能为部门主管！");
            this.isSubmiting = false
            return;
          }
          // 新建角色
          const params = {
            roleName,
            corpId: this.dataRef.corpId,
            code: roleCode,
            roleGroupId: roleGroup,
          };
          OrgApi.addRole(params).then((res: any) => {
            if (res.errcode) {
              // this.$message.error(res.errmsg);
              switch(res.errcode){
                case 202002:
                  vm.codeErr = true;
                  break
                case 202000:
                  vm.nameErr = true;
                  break
              }
              this.isSubmiting = false
              return;
            }
            this.$message.success("创建成功！");
            this.$emit("reloadTree");
            this.cancel();
            this.isSubmiting = false
          });
        }
      }else{
        this.isSubmiting = false
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
    if (this.roleType === 1) {
      this.modalTitle = "修改角色";
      this.$nextTick(() => {
        if (this.form.setFieldsValue) {
          this.form.setFieldsValue({
            roleName: this.roleData.name,
            roleCode: this.roleData.code,
            roleGroup: this.roleData.groupId,
          });
        }
      });
    } else {
      this.modalTitle = "新建角色";
      this.$nextTick(() => {
        if (this.roleInfo) {
          this.dataRef = this.roleInfo;
          this.form.setFieldsValue({
            roleGroup: this.roleInfo.id,
          });
        }
      });
    }
  }
}
</script>

<style lang="less" scoped>
.add-role{
  padding-bottom: 22px;
  /deep/.ant-form-item-label{
    text-align: left;
    padding-left: 33px;
    width: 124px;
  }
  /deep/.ant-form-item-control-wrapper{
    width: 255px;
  }
  /deep/.ant-form-item-required::before{
    left: -10px;
    top: -3px;
  }
  /deep/.ant-form-item-label > label::after{
    content: "";
  }
  .has-err{
    border-color: #F4454E;
  }
  .err_msg{
    font-size: 12px;
    color: #F4454E;
    line-height: 1.5;
    margin-bottom: -1px;
    margin-top: 1px;
    min-height: 22px;
    clear: both;
    transition: color .3s cubicbezier(0.215, 0.61, 0.355, 1);
  }
}
</style>
