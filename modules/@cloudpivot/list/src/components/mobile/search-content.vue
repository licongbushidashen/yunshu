<template>
  <div class="common-search">
    <template v-show="queryConditions.length">
      <div class="common-search-group">
        <div class="search-wrap">
          <query-form
            ref="list"
            :schemaCode="schemaCode"
            :fields="queryConditions"
            :relevanceDataList="relevanceDataList"
            @ready="filterReady"
            :isRelevanceQuery="isRelevanceQuery"
          ></query-form>
        </div>
      </div>
      <div class="common-search_buttom">
        <bottom-button @reset="resetFilters" @submit="query" />
      </div>
    </template>
    <!-- <empty v-else :tip="$t('cloudpivot.list.mobile.NoItems')"></empty> -->
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
import { H3Input, H3Button, datetime } from "h3-mobile-vue";

import { renderer } from "@cloudpivot/form";

import common from "@cloudpivot/common/mobile";

import QueryForm from "./query-form/query-form.vue";

// import TransferDom from '@cloudpivot/form/'

Vue.use(datetime);

Vue.prototype.$datetime = datetime;

@Component({
  name: "ListDesignSearch",
  components: {
    H3Input,
    H3Button,
    QueryForm,
    BottomButton: common.components.BottomButton,
    Empty: common.components.Empty,
  },
  directives: {
    TransferDom: common.directives.transferDom,
  },
})
export default class ListDesignSearch extends Vue {
  @Prop() schemaCode!: any;

  @Prop() queryConditions!: Array<any>;

  @Prop() relevanceDataList!: [];

  @Prop() isRelevanceQuery!: boolean
  /**
   * 设置筛选条件某个条件赋值
   */
  setFilterValue(key: string, value: any) {
    (this.$refs.list as any).findControl(key).value = value;
  }

  /**
   * 筛选条件渲染完毕
   */
  filterReady() {
    this.query();
  }

  // 重置查询条件
  resetFilters() {
    const list = this.$refs.list as any;
    const data = list.resetFilters();
  }

  // 查询
  query() {
    const list = this.$refs.list as any;
    if (list) {
      const data = list.query();
      const opValue = list.getOpValue()
      const backData = this.setFilterData(data, opValue);
      this.$emit("commit", backData);
    }
  }

  getFormat(str: string) {
    switch (Number(str)) {
      case 2:
        return "YYYY-MM-DD HH:mm:ss";
      case 3:
        return "YYYY-MM-DD HH:mm";
      case 4:
        return "YYYY-MM";
      case 5:
        return "YYYY";
      case 6:
        return "MM-DD";
      case 7:
        return "HH:mm";
      case 8:
        return "HH:mm:ss";
      default:
        return "YYYY-MM-DD";
    }
  }

  /**
   * 格式化筛选查询参数
   */
  setFilterData(data: any, opValue:any = {}) {
    const filterArray: any = [];
    const dataArray = Object.entries(data);
    dataArray.forEach((a: any) => {
      if (!a && !a[0]) {
        return;
      }
      const [key, value] = a;
      this.queryConditions.forEach((query: any) => {
        let displayFormat: string = query.displayFormat || "";
        if (key === query.propertyCode) {
          let propertyValue = value;
          if (Array.isArray(propertyValue)) {
            if (key === "sequenceStatus") {
              const sequenceStatus: any = [];
              propertyValue.forEach((pop: any) => {
                switch (pop) {
                  case "草稿":
                    return sequenceStatus.push("DRAFT");
                  case "进行中":
                    return sequenceStatus.push("PROCESSING");
                  case "已完成":
                    return sequenceStatus.push("COMPLETED");
                  case "已作废":
                    return sequenceStatus.push("CANCELED");
                  default:
                    break;
                }
              });
              propertyValue = sequenceStatus.join(";");
            } else if (propertyValue.length === 1 && query.propertyType === 2) {
              propertyValue = `${propertyValue};`;
            } else if (
              query.propertyType === renderer.DataItemType.StaffSingle
            ) {
              propertyValue = JSON.stringify(
                propertyValue.map((p) => ({
                  id: p.id,
                  unitType: p.unitType,
                }))
              );
            } else if (query.propertyType === renderer.DataItemType.Date) {
              if(displayFormat == '5'){
                propertyValue = propertyValue.map((item,index)=>{
                  if(index === 0){
                    item = item?`${item.substring(0,4)}-01-01`:'';
                  } else if(index === 1){
                    item = item?`${item.substring(0,4)}-12-31`:'';
                  }else{
                    item = '';
                  }
                  return item;
                });
              }
              propertyValue = propertyValue
                .map((x) => {
                  if (typeof x === "string" && x) {
                    //年份格式
                    if (this.getFormat(displayFormat) === "YYYY") {
                      return x;
                    }
                    // ios日期格式兼容
                    if ( common.utils.Common.isiOS && this.getFormat(displayFormat) === "YYYY-MM" ) {
                      return x;
                    }
                    x = common.utils.Common.isiOS ? x.replace(/-/g, "/") : x;
                    const date = new Date(x);
                    return common.utils.DateHandle.dateFormat(
                      date,
                      this.getFormat(displayFormat)
                    );
                  } else if (x instanceof Date) {
                    return common.utils.DateHandle.dateFormat(
                      x,
                      this.getFormat(displayFormat)
                    );
                  }
                  return "";
                })
                .join(";");
            } else if (
              query.propertyType === renderer.DataItemType.RelevanceForm
            ) {
              propertyValue = value ? value.id : "";
            } else {
              propertyValue = propertyValue.join(";");
            }
          } else {
            switch (query.propertyType) {
              case renderer.DataItemType.Date:
                propertyValue =
                  value instanceof Date
                    ? common.utils.DateHandle.dateFormat(
                        value,
                        this.getFormat(displayFormat)
                      )
                    : value;
                break;
              case renderer.DataItemType.RelevanceForm:
                propertyValue = value ? value.id : "";
                break;
              case renderer.DataItemType.Address:
                if (value && Object.keys(value).length > 0) {
                  propertyValue = JSON.stringify(propertyValue);
                } else {
                  propertyValue = null;
                }

                break;
              default:
                break;
            }
          }
          // propertyValue = `${propertyValue}`;

          const operatorTypes = {
            已完成: 'COMPLETED',
            进行中: 'PROCESSING'
          }
          propertyValue = operatorTypes[propertyValue] || propertyValue

          filterArray.push({
            propertyCode: query.propertyCode,
            propertyType: query.propertyType,
            propertyValue,
            operatorType: opValue[query.propertyCode] === 'NotEq' ? 2 : undefined
          });
        }
      });
    });

    return filterArray;
  }
}
</script>
<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.common-search {
  background: #fff;
  position: fixed;
  top: 1.16rem;
  bottom: 1.5rem;
  width: 100%;
  .common-search_buttom {
    position: fixed;
    z-index: 999;
    width: 100%;
    bottom: 0;
  }
  .common-search-group {
    height: 100%;
    .search-wrap {
      max-height: calc(100vh - 45px - 40px - 10px);
      height: 100%;
      overflow-y: auto;
    }
  }
}
</style>
