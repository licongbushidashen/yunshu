<template>
  <div class="add-permit">
    <div class="form-item">
      <span class="label-required">{{ $t('languages.appSettings.SetType') }}</span>
      <p>
        <a-radio-group v-model="setType" @change="toggleType">
          <a-radio :value="0">按组织/人员</a-radio>
          <a-radio :value="1">按角色</a-radio>
        </a-radio-group>
      </p>
    </div>
    <div class="form-item" v-if="setType === 0">
      <span class="label-required">组织</span>
      <div class="selector">
        <staff-selector
          v-model="selectStaff"
          :options="staffSelectorOptions"
          @change="changeStaffs"
          ref="staffsSelect"
        ></staff-selector>
      </div>
    </div>
    <div class="form-item" v-if="setType === 1">
      <span class="label-required">角色</span>
      <div class="selector">
        <role-select class="roleSelect" :multiple="true" :defaultValue="selectRoles" @select="changeRoles"></role-select>
        <!-- <role-tree
          v-model="selectRoles"
          placeholder="请选择角色"
          :treeCheckable="true"
          @change="changeRoles"
          ref="roleSelect"
        /> -->
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import StaffSelector from "@cloudpivot/form/src/renderer/components/shared/staff-selector.vue";
import common from "@cloudpivot/common/pc";

@Component({
  name: "originator-modal",
  components: {
    StaffSelector,
    RoleSelect: common.components.RoleSelect
  }
})
export default class OriginatorModal extends Vue {
  @Prop() workflowCode!: string;

  @Prop() visible!: boolean;

  // 选人控件配置项
  staffSelectorOptions = {
    selectOrg: true,
    selectUser: true,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择'
  }

  // 选人控件选中的数组集合
  selectStaff: any = [];

  // 角色选择器选中的
  selectRoles: any = [];

  // 选择的最终参数结果
  selectParams: any = [];

  // 设置类型：组织部门用户0/角色1
  setType: number = 0;

  reset() {
    this.setType = 0;
    this.selectStaff = [];
    this.selectRoles = [];
    this.selectParams = [];
  }

  toggleType() {
    console.log(this.setType);
    switch (this.setType) {
      case 0:
        this.selectParams = this.selectStaff;
        break;
      case 1:
        this.selectParams = this.selectRoles;
        break;
      default:
        this.selectParams = [];
        break;
    }
    this.$emit('select', this.selectParams);
  }

  // 选中了角色
  changeRoles(val:any) {
    this.selectRoles = val;
    // TODO: 选择角色作为权限设置时，具体传参待定。
    this.selectParams = this.selectRoles.map((role: any) => {
      return {
        unitId: role.id,
        unitType: 2,
        workflowCode: this.workflowCode
      }
    });
    this.$nextTick(() => {
      this.$emit('select', this.selectParams)
    });
  }

  // 选中了部门或用户
  changeStaffs() {
    this.selectParams = this.selectStaff.map((staff: any) => {
      return {
        unitId: staff.id,
        unitType: staff.unitType,
        workflowCode: this.workflowCode
      }
    });
    this.$nextTick(() => {
      this.$emit('select', this.selectParams)
    });
  }

  @Watch('visible')
  onVisibleChange(v: boolean) {
    if (!v) {
      this.$nextTick(() => {
        this.reset();
      });
    }
  }

}
</script>


<style lang="less">
.add-permit-wrap {
  .selector {
    position: relative;
    min-height: 32px;
    // .ant-select {
    //   display: block;
    //   max-height: 50vh;
    //   overflow-y: auto;
    // }
    .role-tree {
      display: block;
      /deep/ .ant-select-selection--multiple {
        max-height: 40vh;
        overflow-y: auto;
      }
    }
  }

  .form-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    color: rgba(0, 0, 0, 0.65);
    > span {
      display: inline-block;
      width: 84px;
      margin-right: 8px;
    }
    .selector {
      flex: 1;
    }
    .ant-input {
      font-family: initial;
      width: 310px;
    }
  }
}
.ant-select-tree-dropdown {
  max-height: 60vh !important;
}
.ant-select-tree li span.ant-select-tree-checkbox {
  display: none;
}
.ant-select-tree
  li
  span.ant-select-tree-checkbox
  + .ant-select-tree-node-content-wrapper {
  width: calc(100% - 24px);
}
.ant-select-tree
  > .ant-select-tree-treenode-checkbox-checked
  > .ant-select-tree-node-content-wrapper,
.ant-select-tree-child-tree
  .ant-select-tree-treenode-checkbox-checked
  .ant-select-tree-node-content-wrapper {
  background-color: #fafafa !important;
  font-weight: bold;
}
.ant-select-tree
  > .ant-select-tree-treenode-checkbox-checked
  > .ant-select-tree-node-content-wrapper::after,
.ant-select-tree-child-tree
  .ant-select-tree-treenode-checkbox-checked
  .ant-select-tree-node-content-wrapper::after {
  content: "\E98F";
  color: #17bc94;
  position: absolute;
  right: 8px;
  display: inline-block;
  font-family: "aufontAll" !important;
  font-weight: bold;
}
.ant-select-tree-node-content-wrapper {
  background-color: #ffffff !important;
}
.ant-select-tree-node-content-wrapper:after {
  content: "";
}
</style>