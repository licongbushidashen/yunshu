
<template>
  <div>
    <!-- 没有委托人时选择部门 -->
    <template v-if="!isTrust">
      <approve-opinion  v-if="options.approval" :lastAttachment="lastAttachment" :control="options.approval"></approve-opinion>

      <h3-radio-list
        v-if="depts.length > 0"
        v-model="value"
        :required="true"
        :options="depts"
        layout="v"
        showMode="0"
        :title="$t('cloudpivot.form.runtime.modal.selectOrg')"
        :cancelText="$t('cloudpivot.form.runtime.biz.cancel')"
        :confirmText="$t('cloudpivot.form.runtime.biz.ok')"
        :placeholder="$t('cloudpivot.form.runtime.modal.pleaseChoose')"
        @onChange="onChange"
      ></h3-radio-list>
    </template>
    <!-- 存在委托人时选择委托人及部门 -->
    <template v-else>
      <h3-radio-list
        v-model="isTrustor"
        :required="true"
        :options="chooseTrustor"
        showMode="0"
        :title="$t('cloudpivot.form.runtime.modal.selectIdentity')"
        :showEmptyOptions="false"
        :cancelText="$t('cloudpivot.form.runtime.biz.cancel')"
        :confirmText="$t('cloudpivot.form.runtime.biz.ok')"
        :clearText="$t('cloudpivot.form.runtime.biz.clear')"
        :placeholder="$t('cloudpivot.form.runtime.modal.pleaseChoose')"
        @onChange="onTrustorChange"
      ></h3-radio-list>

      <!-- 自己身份 -->
      <template v-if="trustorSelected.value === '0'">
        <h3-radio-list
          v-if="depts.length > 0"
          v-model="value"
          :required="true"
          :options="depts"
          showMode="0"
          :title="$t('cloudpivot.form.runtime.modal.depts')"
          :showEmptyOptions="false"
          :cancelText="$t('cloudpivot.form.runtime.biz.cancel')"
          :confirmText="$t('cloudpivot.form.runtime.biz.ok')"
          :clearText="$t('cloudpivot.form.runtime.biz.clear')"
          :placeholder="$t('cloudpivot.form.runtime.modal.pleaseChoose')"
          @onChange="onChange"
        ></h3-radio-list>
      </template>

      <!-- 委托人身份 -->
      <template v-if="trustorSelected.value === '1'">
        <!-- 委托人 -->
        <h3-radio-list
          v-model="trustee"
          :required="true"
          :options="trustList"
          showMode="0"
          :title="$t('cloudpivot.form.runtime.modal.client')"
          :showEmptyOptions="false"
          :cancelText="$t('cloudpivot.form.runtime.biz.cancel')"
          :confirmText="$t('cloudpivot.form.runtime.biz.ok')"
          :clearText="$t('cloudpivot.form.runtime.biz.clear')"
          :placeholder="$t('cloudpivot.form.runtime.modal.pleaseChoose')"
          @onChange="setTrustee"
        ></h3-radio-list>
        <!-- 委托人部门 -->
        <h3-radio-list
          v-model="trustDept"
          :required="true"
          :options="trusteeDepts"
          showMode="0"
          :title="$t('cloudpivot.form.runtime.modal.clientDpets')"
          :showEmptyOptions="false"
          :cancelText="$t('cloudpivot.form.runtime.biz.cancel')"
          :confirmText="$t('cloudpivot.form.runtime.biz.ok')"
          :clearText="$t('cloudpivot.form.runtime.biz.clear')"
          :placeholder="$t('cloudpivot.form.runtime.modal.pleaseChoose')"
          @onChange="setTrusteeDept"
        ></h3-radio-list>

        <div class="trust-tips">
          <span>{{ $t('cloudpivot.form.runtime.modal.trustTips', {name: name, workflowName: options.workflowName}) }}</span>
        </div>
      </template>
    </template>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import {
  H3List,
  H3ListItem,
  H3RadioList,
  H3Radio,
  H3Switch
} from "h3-mobile-vue";

import components from "../../../renderer/components/mobile";

import {
  FormActionComponent,
  FormActionModalOptions
} from "../../form-action-modal";

@Component({
  name: "form-dept-select",
  components: {
    H3List,
    H3ListItem,
    H3RadioList,
    H3Radio,
    ApproveOpinion: components.ApproveOpinion1
  }
})
export default class FormDeptSelect extends Vue implements FormActionComponent {
  @Prop()
  options!: FormActionModalOptions;

  value = "";

  selected: any = {};

  depts: any[] = [];

  isTrustor = '自己身份';

  trustorSelected:any = {
    value: '0',
    label: '自己身份'
  };

  trustee = '';

  trusteeSelected:any = {};

  trustDept = '';

  trustDeptSelected: any= {};

  chooseTrustor = [{
    value: '0',
    label: '自己身份'
  }, {
     value: '1',
    label: '委托人身份'
  }];

  get isTrust() {
    return this.options ? this.options.trusts: false;
  }

  get name() {
    if (this.options && Array.isArray(this.options.trusts)) {
      const item = this.options.trusts.find((t:any) => t.id === this.trusteeSelected.value);
      return item ? item.name: '';
    }
    return '';
  }

  get trustList() {
    if (this.options && Array.isArray(this.options.trusts)) {
      const filterTrust = this.options.trusts.filter((tl:any) => tl.isTrustor).map((d: any) => ({
        value: d.id,
        label: d.name
      }));
      return filterTrust;
    }
    return [];
  }

  get trusteeDepts() {
    if (this.options && Array.isArray(this.options.trusts)) {
      const index = this.options.trusts.findIndex((t:any) => t.id === this.trusteeSelected.value);
      if (this.options.trusts[index] && this.options.trusts[index].departments) {
        const deptTrust = this.options.trusts[index].departments.map((d: any) => ({
          value: d.id,
          label: d.name
        }));
        return deptTrust;
      }
      return [];
    }
    return [];
  }

  mounted () {
    
  }

  @Watch("options", {
    immediate: true
  })
  setOptions() {
    if (this.options && this.options.data.length > 1) {
      this.value = this.options.data[0].name;

      this.depts = this.options.data.map((d: any) => ({
        value: d.id,
        label: d.name
      }));

      this.selected = this.depts[0] as any;

      // 委托人处理
      if (this.options.trusts) {
        const filterTrust = this.options.trusts.filter((tl:any) => tl.isTrustor);
        if (this.options.trusts.length > filterTrust.length) {
          this.isTrustor = this.$t("cloudpivot.form.runtime.modal.ownIdentity").toString();
          this.trustorSelected = {
            value: '0',
            label: this.$t("cloudpivot.form.runtime.modal.ownIdentity").toString()
          };
          this.chooseTrustor = [{
              value: '0',
              label: this.$t("cloudpivot.form.runtime.modal.ownIdentity").toString()
            }, {
              value: '1',
              label: this.$t("cloudpivot.form.runtime.modal.clientIdentity").toString()
            }];
        } else {
          this.isTrustor = this.$t("cloudpivot.form.runtime.modal.clientIdentity").toString();
          this.trustorSelected = {
            value: '1',
            label: this.$t("cloudpivot.form.runtime.modal.clientIdentity").toString()
          };
          this.chooseTrustor = [{
              value: '1',
              label: this.$t("cloudpivot.form.runtime.modal.clientIdentity").toString()
            }];
        }
        this.trustee = filterTrust ? filterTrust[0].name: '';
        
        this.trusteeSelected = filterTrust ? filterTrust.map((d: any) => ({
          value: d.id,
          label: d.name
        }))[0]: {};
        this.setTrustDept();
      }
    }
  }

  onChange(item: any) {
    this.selected = item;
  }

  onTrustorChange(item: any) {
    this.trustorSelected = item;
  }

  setTrustee(item: any) {
    this.trusteeSelected = item;
    this.setTrustDept();
  }

  setTrusteeDept(item: any) {
    this.trustDeptSelected = item;
  }

  setTrustDept() {
    const index = this.options.trusts.findIndex((t:any) => t.id === this.trusteeSelected.value);
    const curTrust = this.options.trusts[index];
    if (curTrust && curTrust.departments) {
      this.trustDept = curTrust.departments.length ? curTrust.departments[0].name: '';
      this.trustDeptSelected = curTrust.departments.length ? curTrust.departments.map((d: any) => ({
        value: d.id,
        label: d.name
      }))[0]: {};
    }
  }

  get lastAttachment(){
    // @ts-ignore
    return this.options && this.options.approval && this.options.approval.controller && this.options.approval.controller._value && this.options.approval.controller._value.lastAttachment || ''
  }
  submit() {
    const _approval = this.options.approval;
    if (_approval) {
      
      let ctrl = _approval.controller as any;
      let content = window.sessionStorage.getItem('$approval');
        // 用户没有输入审批意见时，填充按钮文本
      if(!ctrl.value) {
        ctrl.value = {
          content
        }
      } else if (!ctrl.value.content && (!ctrl.value.resources || !ctrl.value.resources.length)) { // 如果有附件或签名则不设置默认值
        ctrl.value.content = content
      }

      if (ctrl.required && (!ctrl.value && !ctrl.value.content)) {
        this.$h3.toast.show({
          text: this.$t("cloudpivot.form.runtime.modal.pleaseInputOpinion"),
          iconType: "close"
        });
        return;
      }

      const _options = _approval.options;
      if (
        _options.signatureIsRequired &&
        (!ctrl.value ||
          !ctrl.value.resources ||
          !ctrl.value.resources.some(
            (res: any) => res.name === "signsture.png"
          ))
      ) {
        this.$h3.toast.show({
          text: this.$t("cloudpivot.form.runtime.modal.pleaseAddSign"),
          iconType: "close"
        });
        return;
      }
    }

    if (this.isTrust && this.trustorSelected.value === '1') {
      return {
        deptId: this.trustDeptSelected.value,
        trustor: this.trusteeSelected.value
      };
    }

    return {
      deptId: this.selected.value
    };
  }
}
</script>


<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.ant-radio-wrapper {
  display: block;
}

.trust-tips{
  width: 100%;
  background: #F7F8FC;
  .px2rem(padding-top, 22px);
  .px2rem(padding-left, 32px);
  .px2rem(padding-right, 32px);
  color: #666666;
  text-align: left;
}
</style>
