<template>
  <div v-show="visible">
    <search-panel
      v-if="visible"
      ref="searchPanelMulti"
      :enableFilter="queryConditions && queryConditions.length > 0"
      :fetch="superFetch"
      @filter="showFilterPanel"
      @confirm="confirm"
      @notifyRes="notifyRes"
      :count="count"
    >
      <template slot-scope="{ data }" v-if="data.length > 0">
        <div 
          v-for="(item,index) in data" 
          :key="index" 
          class="item"
        >
          <div class="item__left">
            <h3-checkbox-item 
              :value="item.id"
              :key="item.id" 
              :returnValue="checkedArr"
              @onChange ="change"
            ></h3-checkbox-item>
          </div>

          <div class="item__center">
            <form-item 
              :formData="item" 
              :isOpenForm="false" 
              :queryColumns="queryColumns" 
            />
          </div>
        </div>
      </template>
      <template slot="fitler">
        <query-form
          :schemaCode="controlOpts.schemaCode"
          :queryConditions="queryConditions"
          @commit="onFilter"
        ></query-form>
      </template>
    </search-panel>
    <div  v-show="canAdd" class="home-add" @click="openRelevanced">
      <img src="./add.png" />
    </div>
  </div>
</template>


<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  Inject,
  Model
} from "vue-property-decorator";

import {
  RelevanceFormSearchParams,
  RelevanceFormSearchResult
} from "@cloudpivot/form/src/common/controls";

import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";

import SearchPanel from "./search-panel.vue";

import { H3Checkbox, H3Avatar, H3Button } from "h3-mobile-vue";

// import TransferDom from "../../../directives/transfer-dom";

import common from '@cloudpivot/common';

// import * as list from '@cloudpivot/list'

@Component({
  name: "relevance-form-modal",
  components: {
    SearchPanel,
    H3CheckboxItem: H3Checkbox.Item,
    H3Avatar,
    H3Button
    // FormItem: list.components.mobile.FormItem
  },
  directives: {
    // TransferDom
  }
})
export default class RelevanceFormModal extends RelevanceFormControl {
  @Prop({
    default: false
  })
  visible!: boolean;

  @Model("change")
  value!: any;

  delValue: any;

  count: number = 0;

  multiValue: any[] = [];

  checkedArr: any[] = [];

  queryConditions: any[] = [];

  queryColumns: any[] = [];

  queryFormData?: any[];

  queryResult: any[] = [];
  
  queryActions: any[] = [];
  @Watch("value", {
    immediate: true
  })
  onValueChange(nVal) {
    if (Array.isArray(nVal) && nVal.length === 0) {
      this.checkedArr = [];
    } else if (nVal && nVal.id) {
      this.checkedArr = nVal.id.split(";")
      this.count = this.checkedArr.length;
      this.change(this.checkedArr, true)
    }
  }

  @Watch("checkedArr")
  onCheckedArrChange(nVal, oVal) {
    this.count = nVal.length;
  }

  @Watch("visible")
  onVisibleChange(nVal) {
    if (nVal) {
      this.getListQueryConditions(true).then((res: any) => {
        if (res) {
          this.queryConditions = res.conditions as any[];
          this.queryColumns = res.queryColumns as any[];
          this.queryActions = res.queryActions as any[]; 
        } else {
          this.queryConditions = [];
        }
      });

      const searchPanelMulti = this.$refs.searchPanelMulti as any;
      if (searchPanelMulti) {
        searchPanelMulti.reFetch();
      }
    }
  }

  back() {
    this.$emit("back");
  }

  getCreater(item: any) {
    if (Array.isArray(item.creater)) {
      if (item.creater.length > 0) {
        return item.creater[0];
      }
    }

    return {};
  }

  change(item: any, isChecked: boolean) {
    let tempArr: any[] = [];
    if (Array.isArray(item)) {
      item.forEach(x => {
        let curItem = this.queryResult.find(z => {
          return z.id === x
        })
        curItem && tempArr.push(curItem);
      })
    }
    this.multiValue = tempArr;
  }

  superFetch(page: number, pageSize: number, value: string, formState: any) {
    let query: any = [];
    if (formState) {
      query = [formState];return
    } else {
      query = this.queryFormData;
    }
    return this.fetch(page, pageSize, value, query, true)
  }

  getStatus(status: string) {
    const txt = this.$t(
      `cloudpivot.form.renderer.formStatus.${status.toLowerCase()}`
    );
    return txt;
    // switch (status) {
    //   case "DRAFT":
    //     return "草稿";
    //   case "PROCESSING":
    //     return "进行中";
    //   case "COMPLETED":
    //     return "已完成";
    //   case "CANCELED":
    //     return "已作废";
    //   default:
    //     return "";
    // }
  }

  showFilterPanel(show: boolean) {
    //   if(show){
    //     this.getListQueryConditions().then(res => {
    //       this.queryConditions = res || [];
    //     });
    //   }
  }

  onFilter(query: any[]) {
    // this.queryFormData = query.map(x => ({
    //   code : x.propertyCode,
    //   type : x.propertyType,
    //   value : x.propertyValue
    // }));
    this.queryFormData = query;
    const searchPanelMulti = this.$refs.searchPanelMulti as any;
    if (searchPanelMulti) {
      searchPanelMulti.reFetch();
    }
  }

  async confirm() {
    this.$emit("back");
    let item = await this.convertForMappings(this.multiValue.map(item => item.data));
    this.$emit("change", item);
  }

  notifyRes(list) {
    this.queryResult = list;
  }

  openRelevanced() {
    let returnPath = `/form/detail?schemaCode=${this.$route.query.schemaCode}&return=/apps/apps-form-list/${this.$route.query.schemaCode}`;
    returnPath = encodeURI(returnPath);
    this.$router.push({
      name: "form-detail",
      query: {
        schemaCode: this.control.options.schemaCode,
        return: returnPath,
      },
    });
  }

  beforeCreate() {
    (this
      .$options as any).components.FormStatus = RelevanceFormControl.loadFormStatus();

    (this
      .$options as any).components.QueryForm = RelevanceFormControl.loadQueryForm();

    (this
      .$options as any).components.FormItem = RelevanceFormControl.loadFormItem();
  }

  get canAdd(){
    let addFlag = this.queryActions.some(v => v.actionCode == "add");
    return addFlag;
  }

}
</script>

<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";

.item {
  background-color: #fff;
  position: relative;
  // font-size: 15px;
  display: flex;
  margin: 0.26666667rem;
  // .px2rem(margin, @horizontal-padding-md);
  .px2rem(border-radius, @border-radius-lg);

  &__title {
    color: #333333;
  }

  &__desc {
    color: #999999;
    .px2rem(margin-top, @horizontal-padding-sm);
  }

  &__left {
    display: inline-flex;
    align-items: center;
  }

  &__center {
    flex-grow: 1;
    position: relative;
    // .px2rem(margin, @horizontal-padding-lg);
    margin-left: 0;
    /deep/.work-item {
      margin: 0;
      padding-left: 0;
      // padding: 0;
    }
  }

  &__status {
    display: inline-block;
    position: absolute;
    right: 0;
    top: 0;

    /deep/img {
      width: 1.6rem !important;
      height: 1.28rem !important;
    }
  }

  & > i.icon {
    color: @primary-color;
    position: absolute;
    right: 1.5em;
    top: 40%;
  }
}

/deep/.common-search {
  &_buttom {
    background: #fff;
    .px2rem(padding-top, 16px);
  }

  & > .empty {
    text-align: center;
  }
}

.status {
  font-size: 10px;
  border-radius: 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 18px;
  padding: 0 0.5em;

  &.DRAFT {
    color: rgba(250, 173, 20, 1);
    border: 1px solid rgba(250, 173, 20, 1);
    background-color: rgba(250, 173, 20, 0.1);
  }

  &.PROCESSING {
    color: rgba(24, 144, 255, 1);
    border: 1px solid rgba(24, 144, 255, 1);
    background-color: rgba(24, 144, 255, 0.1);
  }

  &.COMPLETED {
    color: rgba(82, 196, 26, 1);
    border: 1px solid rgba(82, 196, 26, 1);
    background-color: rgba(82, 196, 26, 0.1);
  }

  &.CANCELED {
    color: rgba(190, 190, 190, 1);
    border: 1px solid rgba(190, 190, 190, 1);
    background-color: rgba(244, 244, 244, 1);
  }
}

.home-add {
  position: fixed;
  z-index: 99;
  .px2rem(right,40px);
  .px2rem(bottom,130px);
  img {
    .px2rem(height,100px);
    .px2rem(width,100px);
  }
}
</style>
