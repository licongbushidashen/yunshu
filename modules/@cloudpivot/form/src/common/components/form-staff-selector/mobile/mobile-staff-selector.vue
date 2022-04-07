
<template>

  <h3-org
    v-control-back
    :org="org"
    :title="title"
    :selectOrg="options.selectOrg"
    :selectUser="options.selectUser"
    :isMulpitle="options.mulpitle"
    :isDisplayRoot="options.isDisplayRoot"
    :selectedData="selected"
    :departmentsTotal="departmentsTotal"
    :usersTotal="usersTotal"
    :searchData="searchList"
    :orgName="options.key"
    :selectPlaceholder="options.placeholder"
    :required="required"
    :readonly="readonlyFormula || readonly"
    :allowRecursion="false"
    :isDisableClick="isDisableClick"
    :showModal="showModal"
    :labelStyle="labelStyle"
    :disabled="disabled"
    :locale="locale"
    :realTimeSearch="true"
    :tip="tip"
    :showNotData="showNotData"
    @updateShow="updateShow"
    @add="treeFocus"
    @onClickBreadcrumb="onClickBreadcrumb"
    @change="onChange"
    @onSearch="onSearch"
    @onClickTrunBack="onClickTrunBack"
    @onClickNextHierarchy="onClickNextHierarchy"
    @ok="onOk"
    @cancle="onCancle"
    @delect="delect"
    ref="h3Org"
  ></h3-org>

</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { H3Org } from "h3-mobile-vue";

import { StaffSelectorBase } from '../staff-selector-base';

import ControlBack from '@cloudpivot/form/src/common/directives/control-back'

@Component({
  name: "mobile-staff-selector",
  components: {
    H3Org
  },
  directives: {
    ControlBack,
  },
  model: {
    event: "change",
    prop: "value"
  }
})
export default class MobileStaffSelector extends StaffSelectorBase {

  @Prop({
    default:''
  })
  title!:string

  @Prop({
    default: false
  })
  required!: boolean

  @Prop({
    default: false
  })
  readonlyFormula!: boolean

  @Prop({
    default: false
  })
  readonly!: boolean

  @Prop({
    default : () => ({})
  })
  labelStyle !: any

  @Prop({
    default:''
  })
  tip?:string

  showModal: boolean = false;

  searchTaskRef : any;

  updateShow(val:  boolean) {
    if ( val ) {
      this.show();
    } else {
      this.close();
    }
  }

  show() {
    this.showModal = true;
  }
  close() {
    this.showModal = false;
  }

  created() {
    // super.treeFocus();
  }

  // 【ID1006424】云枢v6.1.3移动端选人控件映射关系失效
  mounted() {
    Array.isArray(this.selected) && this.selected.length && this.onOk(this.selected);
  }

  treeFocus() {
    super.treeFocus();
  }

  // 删除选中
  delect(val: any) {
    this.selected = this.selected.filter((i:any) => i.key !== val.key);
    super.onChange(this.selected);
  }

  // 树-返回
  onClickTrunBack() {
    super.onClickTrunBack();
  }

  // 树-下一级
  onClickNextHierarchy(val: any) {
    super.onClickNextHierarchy(val);
  }

  onClickBreadcrumb(val: any) {
    super.onClickBreadcrumb(val);
  }

  onChange(items: any[]) {
    super.onChange(items);
  }

  async onOk(items: any[]) {
    // console.log(items);
    super.onOk(items);
  }

  onCancle() {
    super.onCancle();
  }

  onSearch(name: string) {
    clearTimeout(this.searchTaskRef);

    this.searchTaskRef = setTimeout(()=>{
      let type = "";
    if(this.options.selectOrg){
      type = 'department';
    }
    if(this.options.selectUser){//选人
      type = 'user';
    }
    if(this.options.selectOrg && this.options.selectUser){
      type = "";
    }
      super.onSearch(name,type);
    },500);
  }

  @Watch('readonly')
  onReadonlyChange(v: any) {
    setTimeout(() => {
      const h3Org:any = this.$refs.h3Org;
      if (h3Org && h3Org.getContentHeight) {
        h3Org.getContentHeight()
      }
    })
  }
}
</script>

<style lang="less" scoped>
</style>

