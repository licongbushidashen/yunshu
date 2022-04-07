<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <span class="txt">{{ inputValue }}</span>
        <a-icon type="ellipsis" />
    </div>
    <a-modal
      title="接收人设置"
      okText="确定"
      cancelText="取消"
      v-model="visible"
      @ok="modalHide"
      wrapClassName="recipientSettings"
    >
      <a-row>
        <a-col :span="4">
          <span>接收部门</span>
        </a-col>
        <a-col :span="20">
          <staff-selector v-model="departments" :options="staffSelectorOpts"></staff-selector>
        </a-col>
      </a-row>
      <a-row class="mt-5">
        <a-col :span="4">
          <span>接收用户</span>
        </a-col>
        <a-col :span="20">
          <staff-selector v-model="users" :options="staffSelectorUsers"></staff-selector>
        </a-col>
      </a-row>
      <a-row class="mt-5">
        <a-col :span="4">
          <span>接收角色</span>
        </a-col>
        <a-col :span="20">
          <role-select
            class="roleSelect"
            :multiple="true"
            :defaultValue="role"
            @select="selectRole"></role-select>
        </a-col>
      </a-row>
      <a-row class="mt-5">
        <a-col :span="4">
          <span>接收数据项</span>
        </a-col>
        <a-col :span="20">
          <data-item-select
            :onlyPublished="true"
            style="margin-left:-5px"
             mode="multiple"
            :defaultValue="selections"
            :list="currentFieldList"
            :systemFilterCtl="{code: ['workflowInstanceId', 'sequenceNo', 'sequenceNo', 'ownerDeptQueryCode', 'sortKey']}"
            :bizFilterCtl="{ type: [10, 8, 6, 7]}"
            :disabled="false"
            @change="(val,vNode) => { dataItemChange(val,vNode);}"
          ></data-item-select>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Mixins, Inject, Watch } from "vue-property-decorator";
import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import DataItemSelect from "../../data-rule/data-item-select.vue";
import common from "@cloudpivot/common/pc";
import appsApi from "@/apis/apps";
import { PropertyComponent } from "@h3/designer-core/property-panel";
import * as forms from "h3-forms";
import bizrule from "../../../../store/modules/app/bizrule";
import { BizRuleDataCondition } from "../typings/rule-data-condition-type";

const BizRuleBll = new BizRuleDataCondition();

/**选择项内容 */
interface ISelectionValue {
  id: string;
  type: string;
}

interface IMessageReceiver {
  /**部门 */
  departments: Array<ISelectionValue>;
  /**用户 */
  users: Array<ISelectionValue>;
  /**角色 */
  roles: Array<string>;
  /**选人控件 */
  selections: Array<string>;
}

@Component({
  name: "recipientSettings",
  components: {
    StaffSelector,
    DataItemSelect,
    RoleSelect: common.components.RoleSelect
  }
})
export default class RecipientSettings extends Mixins(PropertyComponent) {
  @Inject()
  getController!: () => forms.FormGroup;

  get controller() {
    return this.getController();
  }
  visible: boolean = false;
  users: Array<any> = [];
  role: Array<string> = [];
  departments: Array<any> = [];
  selections: Array<string> = [];
  currentFieldList: any = [];
  inputValue: string = "未设置";
  // 选人控件初始化参数
  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: false,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择"
  };
  staffSelectorUsers: any = {
    selectOrg: false,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择"
  };
  modalShow() {
    this.visible = true;
    this.getCurrentDataItems();

    this.initModal();
  }

  initModal() {
    // 编辑时候
    if (this.value && this.value.hasOwnProperty("departments")) {
      this.departments = this.value.departments;
      this.role = this.value.roles;
      this.users = this.value.users;
      this.selections = this.value.selections;
      this.inputValue = "已设置";
    } else {
      //【消息通知接收人选择表单数据bug】https://www.tapd.cn/52843214/bugtrace/bugs/view/1152843214001004631
      this.departments = [];
      this.role = [];
      this.users = [];
      this.selections = [];
      this.inputValue = "未设置";
    }
  }

  dataItemChange(val, vNode) {
    this.selections = val;
  }
  modalHide() {
    let valid: boolean = false;
    const subData = {
      departments: this.departments,
      users:this.users,
      roles: this.role,
      selections: this.selections
    };
    Object.values(subData).map((val: []) => {
      if (val.length !== 0) {
        valid = true;
        return;
      }
    });

    this.visible = false;
    if (valid) {
      this.inputValue = "已设置";
      this.value = subData;
      this.emitChange(this.value);
    } else {
      this.inputValue = "未设置";
    }
  }

  selectRole(value: any) {
    this.role = [];
    value.map((val: any) => {
      val.code && this.role.push(val.code);
    });
  }

  @Watch("value", {
    immediate: true
  })
  valueChange(value) {
    this.emitChange(value);
    if (this.value && this.value.hasOwnProperty("departments")) {
      this.inputValue = "已设置";
    } else {
      this.inputValue = "未设置";
    }
  }

  // 获取当前模型数据项
  async getCurrentDataItems() {
    const schemaCode = this.$route.params.bizSchemaCode;
    this.currentFieldList = [];
    // 获取数据字段
    const res = await appsApi.getDataItemList({ schemaCode: schemaCode });
    if (res && res.errcode === 0) {
      // 只保留和人员相关的数据字段
      res.data.map((d: any) => {
        if (d.propertyType === 5) {
          this.currentFieldList.push(d);
        }
      });
    } else {
      this.$message.error(res.errmsg as string);
    }
  }
}
</script>

<style lang='less'>
.recipientSettings {
  .ant-select-selection {
    width: 392px;
    margin-left: 5px;
  }
  .mt-5 {
    margin-top: 5px;
  }
  .roleSelect {
    width: 392px;
  }
  .role-selector__input {
    width: 392px;
  }
}
</style>