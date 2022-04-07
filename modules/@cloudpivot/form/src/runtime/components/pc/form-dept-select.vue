
<template>
  <div class="field">
    <!-- 没有委托人时选择部门 -->
    <template v-if="!isTrust">
      <div class="dept__label">{{ $t('cloudpivot.form.runtime.modal.selectOrg') }}</div>
      <div class="field__control" style="max-height:194px;overflow:auto">

        <a-radio-group v-model="id">
          <a-radio
            v-for="dept in options.data"
            :key="dept.id"
            :value="dept.id"
          >{{ dept.name }}</a-radio>
        </a-radio-group>

      </div>
    </template>
    <!-- 存在委托人时选择委托人及部门 -->
    <template v-else>
      <a-row class="row">
        <a-col :span="4">{{ $t("cloudpivot.form.runtime.modal.selectIdentity") }}</a-col>
        <a-col :span="20">
          <a-radio-group
            class="radio-wrap"
            v-model="isTrustor"
          >
            <a-radio value="0" v-if="oneself">{{ $t("cloudpivot.form.runtime.modal.ownIdentity") }}</a-radio>
            <a-radio value="1">{{ $t("cloudpivot.form.runtime.modal.clientIdentity") }}</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>

      <!-- 自己身份 -->
      <template v-if="isTrustor === '0'">
        <a-row class="row">
          <a-col :span="4">{{ $t("cloudpivot.form.runtime.modal.depts") }}</a-col>
          <a-col :span="20">
            <a-select
              class="select-wrap"
              v-model="id"
            >
              <a-select-option
                v-for="dept in options.data"
                :key="dept.id"
                :value="dept.id"
              >
                <a-tooltip>
                  <div slot="title">{{ dept.name }}</div>
                  {{ dept.name }}
                </a-tooltip>
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
      </template>

      <!-- 委托人身份 -->
      <template v-if="isTrustor === '1'">
        <!-- 委托人 -->
        <a-row class="row">
          <a-col :span="4">{{ $t("cloudpivot.form.runtime.modal.client") }}</a-col>
          <a-col :span="20">
            <a-select
              class="select-wrap"
              v-model="trustee"
              @change="setTrustDept"
            >
              <a-select-option
                v-for="user in trustList"
                :key="user.id"
                :value="user.id"
              >{{ user.name }}</a-select-option>
            </a-select>
          </a-col>
        </a-row>
        <!-- 委托人部门 -->
        <a-row class="row">
          <a-col :span="4">{{ $t("cloudpivot.form.runtime.modal.clientDpets") }}</a-col>
          <a-col :span="20">
            <a-select
              class="select-wrap"
              v-model="trustDept"
            >
              <a-select-option
                v-for="dep in trusteeDepts"
                :key="dep.id"
                :value="dep.id"
              >
                <a-tooltip>
                  <div slot="title">{{ dep.name }}</div>
                  {{ dep.name }}
                </a-tooltip>
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>

        <div class="trust-tips">
          <i class="icon aufontAll h-icon-all-exclamation-circle"></i>
          <span>{{ $t('cloudpivot.form.runtime.modal.trustTips', {name: name, workflowName: options.workflowName}) }}</span>
        </div>
      </template>
    </template>
  </div>
</template>


<script lang="ts">

import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import { Radio, Checkbox, Row, Col, Select, Tooltip } from '@h3/antd-vue';

import { FormActionComponent, FormActionModalOptions } from '../../form-action-modal';

@Component({
  name: 'form-dept-select',
  components: {
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ACheckbox: Checkbox,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATooltip: Tooltip
  }
})
export default class FormDeptSelect extends Vue implements FormActionComponent {
  @Prop()
  options !: FormActionModalOptions

  id = '';

  isTrustor = '0';

  trustee = '';

  trustDept = '';

  get isTrust() {
    return this.options ? this.options.trusts: false;
  }

  get name() {
    if (this.options && Array.isArray(this.options.trusts)) {
      const item = this.options.trusts.find((t:any) => t.id === this.trustee);
      return item ? item.name: '';
    }
    return '';
  }

  get trustList() {
    if (this.options && Array.isArray(this.options.trusts)) {
      const filterTrust = this.options.trusts.filter((tl:any) => tl.isTrustor);
      return filterTrust;
    }
    return [];
  }

  get oneself() {
    if (this.options && Array.isArray(this.options.trusts)) {
      const filterTrust = this.options.trusts.filter((tl:any) => !tl.isTrustor);
      return filterTrust.length;
    }
    return false;
  }

  get trusteeDepts() {
    if (this.options && Array.isArray(this.options.trusts)) {
      const index = this.options.trusts.findIndex((t:any) => t.id === this.trustee);
      return this.options.trusts[index] ? this.options.trusts[index].departments: [];
    }
    return [];
  }

  @Watch('options', {
    immediate: true
  })
  setOptions() {
    if (this.options) {
      this.id = this.options.data[0].id;
      // 委托人处理
      if (this.options.trusts) {
        const filterTrust = this.options.trusts.filter((tl:any) => tl.isTrustor);
        this.isTrustor = this.options.trusts.length > filterTrust.length ? '0': '1';
        this.trustee = filterTrust ? filterTrust[0].id: '';
        this.setTrustDept();
      }
    }
  }

  setTrustDept() {
    const index = this.options.trusts.findIndex((t:any) => t.id === this.trustee);
    const curTrust = this.options.trusts[index];
    if (curTrust && curTrust.departments) {
      this.trustDept = curTrust.departments.length ? curTrust.departments[0].id: '';
    }
  }

  submit() {
    if (this.isTrust && this.isTrustor === '1') {
      return {
        deptId: this.trustDept,
        trustor: this.trustee
      };
    }
    return {
      deptId: this.id
    };
  }
}

</script>


<style lang="less" scoped>

/deep/.ant-radio-wrapper{
  display: block;
  margin-bottom:8px;
}

.radio-wrap{
  /deep/.ant-radio-wrapper{
    display: inline-block;
    margin-right: 8px;
  }
}

.select-wrap{
  width: 100% !important;
}

.row {
  margin-bottom: 20px;
  &>div {
    line-height: 32px;
  }
}

.trust-tips{
  width: 100%;
  background: #FFFBE6;
  border: 1px solid #FFE58F;
  border-radius: 4px;
  padding: 8px 16px;
  color: rgba(0,0,0,0.85);
  i{
    font-size: 14px;
    color: #FAAD14;
    margin-right: 8px;
  }
}
.dept__label{
  font-size: 16px;
  font-weight: 500;
  line-height: 40px;
}
</style>
