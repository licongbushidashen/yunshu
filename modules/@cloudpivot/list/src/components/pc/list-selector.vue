<template>
  <div
    class="list-selector"
    ref="listSelector"
    id="list-selector"
    :class="{ hideSearch: hideSearch }"
  >
    <list-search
      v-if="defuaultShowSearch"
      :queryConditionSource="queryConditionSource"
      :queryConditions="queryConditions"
      :showActions="showActions"
      :isReverse="isReverse"
      :isShowFilterBox="isShowFilterBox"
      :showSearch="showSearch"
      :showSearchBox="showSearchBox"
      @toggleQueryConditions="toggleQueryConditions"
      @clearFilter="clearFilter"
    >
      <a-button @click="openForm" v-if="isReverse && showActions" type="primary" slot="add-btn">新增</a-button>
      <query-form
        ref="queryForm"
        slot="form"
        :cols="cols"
        :showAll="true"
        :fields="queryConditions"
        :schemaCode="schemaCode"
        @setFilterData="setFilterData"
        @recovery="recovery"
        @reRenderTable="reRenderTable"
        @toggle="(val) => (showMore = !val)"
      />
    </list-search>
    <list-search-default
      ref="listSelectorDefault"
      :showMore="showMore"
      :isShowFilterBox="isShowFilterBox"
      :showSearch="showSearch"
      :queryConditions="queryConditions"
      v-else
    >
      <query-form
        ref="queryForm"
        slot="form"
        :schemaCode="schemaCode"
        :cols="cols"
        :fields="queryConditions"
        :listConfigData="data"
        @setFilterData="setFilterData"
        @recovery="recovery"
        @reRenderTable="reRenderTable"
        @toggle="(val) => (showMore = !val)"
        :isRelevanceQuery="true"
      />
      <div
        class="actions"
        slot="action"
        v-if="isReverse && showActions"
        :class="{ 'has-filterbox': isShowFilterBox && showSearch }"
      >
        <a-button @click="openForm" type="primary">新增</a-button>
      </div>
    </list-search-default>
    <div
      class="table"
      :class="{
        'has-filterbox': isShowFilterBox && showSearch,
        'has-action': isReverse && showActions,
      }"
    >
      <list
        :checkType="checkType"
        :columns="data.queryColumns"
        :rows="dataSource"
        :checkedKeys="checkedKeys"
        :checkedData="checkedKeysData"
        :sheetParams="sheetParams"
        @check="onCheck"
        @rowClick="onRowClick"
      ></list>

      <div v-show="isLoading" style="text-align: center; padding: 1em">
        <a-spin />
      </div>
    </div>

    <div class="pagination-box">
      <a-pagination
        :current="curPage"
        :total="total"
        :showTotal="(total) => $t('cloudpivot.list.pc.Total', { num: total })"
        :pageSize="pageSize"
        :pageSizeOptions="pageSizeOptions"
        showSizeChanger
        showQuickJumper
        @change="onPaginationChange"
        @showSizeChange="onSizeChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  Model,
  Provide,
} from "vue-property-decorator";

import {
  Button,
  Modal,
  Table,
  Pagination,
  Checkbox,
  Icon,
  Spin,
} from "@h3/antd-vue";

import QueryForm from "./list-query-form.vue";
import * as applicationList from "@cloudpivot/list";

import List from "./list.vue";
import ListSearch from "./components/list-selector/list-search.vue";
import ListSearchDefault from "./components/list-selector/list-search-default.vue";

import { listApi, listParams } from "@cloudpivot/api";
import filterCard from "./components/filter-card/filter-card.vue";
import * as queryConditionTypings from "./helper/query-conditions.typings";
import queryConditionHelper from "./helper/query-conditions";
import { utils } from "@cloudpivot/common";
import { deepCopy } from "@cloudpivot/form/utils";

import { schema, renderer } from "@cloudpivot/form";
import { FormControlType } from "@cloudpivot/form/schema";
const { DataItemType } = schema;
import moment from "moment";
import common from '@cloudpivot/common/pc';
const { getRealValue } = common.utils.BusinessFunctions;

@Component({
  name: "list-selector",
  components: {
    AButton: Button,
    AModal: Modal,
    ATable: Table,
    APagination: Pagination,
    ACheckbox: Checkbox,
    AIcon: Icon,
    ASpin: Spin,
    QueryForm,
    List,
    filterCard,
    ListSearch,
    ListSearchDefault,
  },
})
export default class ListSelector extends Vue {
  @Prop({})
  isAuthorize?: string | boolean;
  @Prop({})
  control?: any;

  @Prop({
    default: "",
  })
  listCode!: string;

  @Prop({
    default: "",
  })
  schemaCode!: string;

  @Prop()
  cols!: number;

  @Prop()
  columns!: string[];

  @Prop()
  query!: any[];

  @Prop({
    default: false,
  })
  multiple!: boolean;

  @Model("change", {
    default: () => [],
  })
  value!: any[];

  @Prop({
    default: true,
  })
  selectable!: boolean;

  @Prop({
    default: true,
  })
  defuaultShowSearch!: boolean;
  /**
   * 目前用来区分是反向查询还是关联表单
   */
  @Prop({
    default: true,
  })
  showSearch!: boolean;

  // 区分是否表单点击
  @Prop({
    default: false,
  })
  reverseViewFlag!: boolean;

  // @Prop({
  //   default: false,
  // })
  showSearchBox: boolean = false;
  /**
   * 反向查询自身模型编码
   */
  @Prop({
    default: "",
  })
  reverseSchemaCode!: string;

  /**
   * 反向查询自身表单编码
   */
  @Prop({
    default: "",
  })
  reverseFormCode!: string;

  /**
   * 反向查询控件编码
   */
  @Prop({
    default: "",
  })
  reverseControlCode!: string;

  /**
   *  当前表单id
   */
  @Prop({
    default: "",
  })
  currentFormId!: string;

  /**
   *  当前表单模板id
   */
  @Prop({
    default: "",
  })
  currentSheetId!: string;

  /**
   * 方向关联表单code
   */
  @Prop({
    default: "",
  })
  reverseFormFieldCode!: string;

  @Prop({
    default: false,
  })
  isReverse!: boolean;

  /**
   * 单据状态
   */
  @Prop({
    default: "",
  })
  sequenceStatus!: string;

  @Prop() relevanceFormCode!: any;
  @Prop({
    default: false,
  })
  showActions!: boolean;
  defaultColums: any = [];
  @Prop() newCol!: any;

  get columnsOptsKey() {
    const code: string = this.schemaCode;
    return `${code}_columns_options_select_model`;
  }

  /**
   * 默认附带的查询条件
   */
  @Prop() defaultQuery!: any;

  @Provide()
  getScrollEl() {
    return this.$el;
  }
  /**
   * 关联查询 新增时刷新当前窗口
   */
  mounted() {
    window.addEventListener("message", this.reloadMessage, false);
    const listSelector = this.$refs.listSelector as any;
    listSelector.addEventListener("scroll", this.scrolls, false);
  }
  destroyed() {
    window.removeEventListener("message", this.reloadMessage);
    const listSelector = this.$refs.listSelector as any;
    listSelector && listSelector.removeEventListener("scroll", this.scrolls);
  }
  scrolls() {
    const listSelector = this.$refs.listSelector as any;
    const listSelectorDefault = this.$refs.listSelectorDefault as any;
    let offset_top: number = listSelector.scrollTop;
    if (offset_top === 0) {
      listSelectorDefault.$el.style.position = "relative";
    } else {
      listSelectorDefault.$el.style.position = "sticky";
    }
  }
  reloadMessage() {
    // 判断是否通过新弹出窗新增按钮新增数据
    let isAdd: boolean = false;
    const isAddData = window.localStorage.getItem("relevanceFormAddData");
    if (isAddData && isAddData === "true") {
      isAdd = true;
      this.getQueryList("search");
      window.localStorage.setItem("relevanceFormAddData", "");
    }
    if (this.isReverse) {
      const queryForm = this.$refs.queryForm as any;
      if (queryForm) {
        queryForm.query();
      }
    }
  }

  get checkType() {
    if (!this.selectable) {
      return "";
    }
    if (this.multiple) {
      return "checkbox";
    } else {
      return "radio";
    }
  }

  showMore = true;

  isShowFilterBox: boolean = false;

  isLoading = false;

  data: any = {};

  displayColumns: any[] = [];

  dataSource: any[] = [];

  list?: any[];

  queryConditions: Array<listParams.QueryConditions> = [];

  queryAction: any = [];

  total: number = 0;

  pageSize: number = 20;

  curPage: number = 1;

  queryConditionSource: any = []; // 查询条件展示数组

  get checkedKeys() {
    return this.value.map((x) => x.id);
  }

  get checkedKeysData() {
    return this.value.map((x) => x);
  }

  get hideSearch() {
    return !this.showSearch;
  }

  get sheetParams() {
    return {
      id: this.currentFormId,
      sheetid: this.currentSheetId,
    };
  }

  // 分页配置项
  pageSizeOptions: string[] = ["10", "20", "50", "100"];

  // 自定义列去除序号和摘要
  cusColumns: Array<any> = [];

  filterData: Array<listParams.Filters> = [];

  @Watch("schemaCode", {
    immediate: true,
  })
  onSchemaCodeChange() {
    if (!this.schemaCode) {
      return;
    }

    this.getListConfigData();
  }

  onCheck(checkeds: any[], currentRow: any) {
    if (this.multiple) {
      let val: any[] = [];
      if (this.value) {
        val = deepCopy(this.value);
        if (currentRow && !currentRow.isChecked && currentRow.row) {
          let delIndex = val.findIndex((x: any) => x.id === currentRow.row.id);
          val.splice(delIndex, 1);
          this.$emit("change", val);
        } else if (currentRow && currentRow.isChecked && currentRow.row) {
          let row: any = currentRow.row;
          if (row) {
            const arr = val.filter((i) => i.id === row.id);
            if (arr.length <= 0) {
              val.push(row);
            } else {
              val = val.map((i) => {
                if (i.id === row.id) {
                  i = row;
                }
                return i;
              });
            }
          }
          this.$emit("change", val);
        } else {
          this.$emit("change", checkeds);
        }
      } else {
        this.$emit("change", checkeds);
      }
    } else {
      this.$emit("change", checkeds);
    }
  }

  /**
   * 展示搜索条件
   */
  toggleQueryConditions() {
    this.showSearchBox = !this.showSearchBox;
  }
  /**
   * 清空
   */
  clearFilter() {
    this.queryConditionSource = [];
    this.filterData = [];
    this.$nextTick(() => {
      const queryForm: any = this.$refs.queryForm;
      queryForm.clearFilters();

      this.getQueryList();
    });
  }
  onRowClick(row: any) {
    if (this.isReverse) {
      const params = {
        bizObjectId: row.id,
        schemaCode: row.schemaCode,
      };
      listApi.getFormUrl(params).then((res: any) => {
        if (this.isDingTalk) {
          res += `&return=${
            location.pathname + encodeURIComponent(location.search)
          }`;
          this.$router
            .push({
              path: res,
            })
            .catch((err: any) => {
              err;
            });
        } else {
          window.open(res);
        }
      });
    } else {
      if (this.multiple) {
        let val = [row];
        if (this.value) {
          // val = JSON.parse(JSON.stringify(this.value));
          // JSON.parse会改变数据类型
          val = deepCopy(this.value);
          const curRow = val.find((res) => {
            return res.id === row.id;
          });
          if (curRow) {
            val.splice(val.indexOf(curRow), 1);
          } else {
            val.push(row);
          }
        }
        this.$emit("change", val);
      } else {
        this.$emit("change", [row]);
      }
    }
  }

  openForm() {
    const ac = this.queryAction.find((x) => x.actionCode === "add");
    if (ac) {
      this.handleAdd(ac);
    }
  }
  handleAdd(obj) {
    let sequenceStatus: any = {};
    let url: string = "";
    const code = obj.associationCode;
    if (obj.associationType === 1) {
      // 关联流程

      if (this.sequenceStatus && this.sequenceStatus !== "DRAFT") {
        url = `/form/detail?startWorkflowCode=${code}&${this.reverseFormFieldCode}=${this.currentFormId}`;
      } else {
        url = `/form/detail?startWorkflowCode=${code}`;
      }
    } else {
      // 关联表单
      const schemaCode = obj.schemaCode;
      if (this.sequenceStatus && this.sequenceStatus !== "DRAFT") {
        url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${code}&${this.reverseFormFieldCode}=${this.currentFormId}`;
      } else {
        url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${code}`;
      }
    }

    url += `&return=${location.pathname + encodeURIComponent(location.search)}`;
    if (this.isDingTalk) {
      sessionStorage.setItem("backList", "false");
      this.$router.push(url).catch((err: any) => {
        err;
      });
    } else {
      const opens = window.open(url);
    }
  }
  /*
   * 初始化表格表头信息
   */
  initColumns() {
    const columnsArray = this.data.queryColumns.filter(
      (a: any) => a.propertyCode
    );
    const columns: any[] = columnsArray.map((c: any) => ({
      vcTitle: c.name,
      dataIndex: c.propertyCode,
      width: c.width ? Number(c.width) : 176,
      slots: { title: `${c.propertyCode}Title` },
      propertyType: c.propertyType,
    }));

    this.cusColumns = JSON.parse(JSON.stringify(columns));
    this.defaultColums = JSON.parse(JSON.stringify(columns));

    // columns.splice(0, 0, {
    //   width: 250,
    //   dataIndex: 'name',
    //   slots: { title: 'nameTitle' },
    //   scopedSlots: { customRender: 'name' }
    // });

    columns.splice(0, 0, {
      width: 100,
      dataIndex: "index",
      slots: { title: "indexTitle" },
      scopedSlots: { customRender: "index" },
    });

    this.displayColumns = columns;
  }

  /*
   * 分页改变
   */
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.getQueryList("pageChange");
  }

  /*
   * 分页pageSize改变
   */
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getQueryList("pageChange");
  }

  /*
   * 重新加载
   */
  reload() {
    this.getListConfigData();
  }

  /*
   * 获取模型的配置信息
   */
  async getListConfigData() {
    const params = {
      code: this.listCode,
      schemaCode: this.schemaCode,
      source: 1,
    }; // test datang01
    this.isLoading = true;
    const res = await listApi.getListConfigData(params);
    this.isLoading = false;
    if (res.errcode === 0) {
      try {
        // 如果配置了查询条件，使用配置的，如果没有就使用关联目标视图中配置的查询条件
        let conditions = JSON.parse(this.control.options.conditions)
        if(conditions.$queryData) {
          //将返回queryConditions数据更多信息赋值给res.data.queryConditions
          (conditions.$queryData).forEach((ele)=>{
            let Item = res.data.queryConditions && (res.data.queryConditions).find((item)=>{
              return ele.propertyCode === item.propertyCode;
            }) || {};
            ele = Object.assign(ele, Item);
          });
          res.data.queryConditions = conditions.$queryData;
        }
      } catch (error) {

      }
      

      // 如果是关联表单过滤,去掉单据状态选项，直接给出状态为已完成的列表
      // if (this.relevanceFormCode) {
      //   if (Array.isArray(res.data.queryConditions)) {
      //     this.queryConditions = res.data.queryConditions.filter(
      //       (item: any) => {
      //         return item.propertyCode !== "sequenceStatus";
      //       }
      //     );
      //   }
      // } else {

        /*单据状态可以作为查询条件 @刘青*/
        this.queryConditions = res.data.queryConditions;
      // }
      this.queryAction = res.data.queryActions;

      if (Array.isArray(this.query) && this.queryConditions) {
        this.query.forEach((x) => {
          const item = this.queryConditions.find(
            (q: any) => q.propertyCode === x.code
          );
          if (item) {
            switch (item.propertyType) {
              case DataItemType.Date:
              case DataItemType.Time:
              case DataItemType.Number:
                if (x.value !== "") {
                  item.defaultValue = [x.value, x.value];
                }
                break;
              case DataItemType.Logic:
                if (typeof x.value === "string") {
                  if (x.value === "false" || x.value === "否") {
                    item.defaultValue = false;
                  } else {
                    item.defaultValue = true;
                  }
                } else {
                  item.defaultValue = x.value;
                }
                break;
              case DataItemType.RelevanceForm:
                if (x.value !== undefined && x.value !== null) {
                  if (typeof x.value == "object") {
                    if (x.value.id) {
                      // 关联表单
                      item.defaultValue = { id: x.value.id };
                    }
                  } else {
                    item.defaultValue = { id: x.value };
                  }
                }
                break;
              default:
                if (x.value !== undefined && x.value !== null) {
                  item.defaultValue = x.value;
                }
                break;
            }
          }
        });
      }

      // ;
      if (!this.queryConditions || this.queryConditions.length <= 0) {
        this.isShowFilterBox = false;
        setTimeout(() => {
          this.getQueryList();
        }, 500);
      } else {
        this.isShowFilterBox = true;
      }
      if (this.relevanceFormCode && this.newCol.length > 0) {
        res.data.queryColumns = this.newCol;
      }
      let newColumns = res.data.queryColumns.map((e) => {
        // e.code = e.code === "id" ? "ids" : e.code;
        // e.propertyCode = e.code;
        e.isShow = true;
        e.vcTitle = e.name;
        e.childColumns &&
          e.childColumns.forEach((i) => {
            i.vcTitle = i.name;
            i.width = "150";
            i.isShow = true;
          });
        return e;
      });
      const columnOpts: any = window.localStorage.getItem(this.columnsOptsKey);
      if (columnOpts) {
        const _column: any = JSON.parse(columnOpts);
        // this.cusColumns = _column.filter((col:any) => col.isShow);
        const showColumns = _column.filter((col: any) => col.isShow);
        // 记录列是否全在请求列中
        const isAllIncluded: boolean = showColumns.every(
          (col: any) =>
            !!res.data.queryColumns.find(
              (innerCol: any) => innerCol.propertyCode === col.propertyCode
            )
        );
        if (isAllIncluded) {
          // 把剩余列修改成不显示
          const fCols: any = res.data.queryColumns
            .map((col: any) => {
              const item: any = _column.find(
                (innerCol: any) => col.propertyCode === innerCol.propertyCode
              );
              if (!item) {
                // 新增的展示列
                col.isShow = true;
                return col;
              }
            })
            .filter((col: any) => !!col);
          const _showColumns = _column
            .map((col: any) => {
              const item: any = res.data.queryColumns.find(
                (innerCol: any) => col.propertyCode === innerCol.propertyCode
              );
              if (item.propertyType === DataItemType.Sheet) {
                const childColumns = col.childColumns;
                item.childColumns.forEach((o) => {
                  let i = col.childColumns.find(
                    (innerCol: any) => o.propertyCode === innerCol.propertyCode
                  );
                  if (!i) {
                    childColumns.push(o);
                  }
                });
                item.childColumns = col.childColumns;
              }
              if (item) {
                let childShow =
                  item.childColumns &&
                  item.childColumns.filter((i) => i.isShow);

                if (childShow && childShow.length > 0) {
                  item.isShow = true;
                } else {
                  item.isShow = col.isShow;
                }
                return item;
              }
            })
            .filter((col: any) => !!col);
          newColumns = _showColumns.concat(fCols);
          this.cusColumns = showColumns.concat(fCols);
          //把请求列中子表的数据更新到记录列中
          this.cusColumns.forEach((c: any) => {
            let source: any = res.data.queryColumns.find(
              (r: any) => r.propertyCode === c.propertyCode
            );
            if (source) {
              c.childColumns = source.childColumns;
              c.width = source.width;
              c.displayFormat = source.displayFormat;
              c.sumType = source.sumType;
              c.vcTitle = source.vcTitle;
              c.isShow = source.isShow;
            }
          });
        } else {
          // 记录列是否全不在请求列中
          let isAllNotInclude: boolean = true;
          showColumns.forEach((sCol: any) => {
            const f: boolean = !!res.data.queryColumns.find(
              (innerCol: any) => innerCol.propertyCode === sCol.propertyCode
            );
            if (!f) {
              isAllNotInclude = true;
            } else {
              isAllNotInclude = false;
            }
          });
          if (isAllNotInclude) {
            // 都不在，使用请求列，清空记录
            this.cusColumns = res.data.queryColumns;
            newColumns = res.data.queryColumns;
            window.localStorage.removeItem(this.columnsOptsKey);
          } else {
            // 部分在
            // 1. 找出展示列
            const sCols: any = showColumns
              .map((col: any) => {
                const c: any = res.data.queryColumns.find(
                  (innerCol: any) => col.propertyCode === innerCol.propertyCode
                );
                if (c) {
                  c.isShow = true;
                  return c;
                }
              })
              .filter((col: any) => !!col);
            this.cusColumns = sCols;

            // 2. 把剩余列修改成不显示
            const fCols: any = res.data.queryColumns
              .map((col: any) => {
                const item: any = sCols.find(
                  (innerCol: any) => col.propertyCode === innerCol.propertyCode
                );
                if (!item) {
                  col.isShow = false;
                  return col;
                }
              })
              .filter((col: any) => !!col);
            newColumns = sCols.concat(fCols);
            //把请求列中子表的数据更新到记录列中
            this.cusColumns.forEach((c: any) => {
              let source: any = res.data.queryColumns.find(
                (r: any) => r.propertyCode === c.propertyCode
              );
              if (source) {
                c.childColumns = source.childColumns;
                c.width = source.width;
                c.displayFormat = source.displayFormat;
                c.sumType = source.sumType;
                c.vcTitle = source.vcTitle;
                c.isShow = source.isShow;
              }
            });
          }
        }
      }
      res.data.queryColumns =
        newColumns && newColumns.length > 0
          ? newColumns
          : res.data.queryColumns;
      this.data = res.data;
      if (res.data.queryColumns) {
        this.initColumns();
      }

      // this.getQueryList();
    } else {
      // this.isShowTableBox = false;
      // this.isShowLoadFailBox = true;
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

  /*
   * 获取查询条件
   */
  setFilterData(data: any, opValue) {
    const filterArray: any = [];
    const dataArray = Object.entries(data);
    dataArray.forEach((a: any) => {
      if (!a && !a[0]) {
        return;
      }
      const [key, value] = a;
      this.queryConditions.forEach((query: listParams.QueryConditions) => {
        let displayFormat: string = query.displayFormat || "";
        if (key === query.propertyCode) {
          let propertyValue = value;

          if (value === null) {
            return;
          }

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
            } else if (query.propertyType === DataItemType.StaffSingle || query.propertyType === DataItemType.StaffMulti || query.propertyType === DataItemType.DeptSingle || query.propertyType === DataItemType.DeptMulti || query.propertyType === DataItemType.StaffDeptMix) {
              propertyValue = JSON.stringify(
                propertyValue.map((p) => ({
                  id: p.id,
                  type: p.unitType,
                  name: p.name, //查询条件中有选人控件选中之后需要显示名字
                }))
              );
            } else if (query.propertyType === DataItemType.Date) {
              propertyValue = propertyValue
                .map((x) => {
                  if (typeof x === "string") {
                    return x;
                  } else if (x instanceof Date) {
                    return utils.DateHandle.dateFormat(
                      x,
                      this.getFormat(displayFormat)
                    );
                  }
                  return "";
                })
                .join(";");
            } else if (query.propertyType === DataItemType.Time) {
              propertyValue = propertyValue
                .map((x) => {
                  if (typeof x === "string") {
                    return x;
                  } else if (moment.isMoment(x)) {
                    return x.format(
                      this.getFormat(displayFormat) || "HH:mm:ss"
                    );
                  }
                  return "";
                })
                .join(";");
            } else {
              propertyValue = propertyValue
                .filter((x) => x !== null || x !== undefined)
                .join(";");
            }
          } else {
            switch (query.propertyType) {
              case DataItemType.Date:
                propertyValue =
                  value instanceof Date
                    ? utils.DateHandle.dateFormat(
                        value,
                        this.getFormat(displayFormat)
                      )
                    : value;
                break;
              case DataItemType.Time:
                propertyValue = moment.isMoment(value)
                  ? value.format(this.getFormat(displayFormat) || "HH:mm:ss")
                  : value;
                break;
              case DataItemType.RelevanceForm:
                propertyValue = value ? value.id : "";
                break;
              case DataItemType.Address:
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
          console.log(filterArray,"filterArray-------------");
          debugger
          let tepOpValue =  opValue && opValue[query.propertyCode]
          filterArray.push({
            propertyCode: query.propertyCode,
            propertyType: query.propertyType,
            propertyValue:propertyValue,
            operatorType: tepOpValue === 'NotEq' ? 2 : undefined
          });
        }
      });
    });
    this.filterData = filterArray;
    let filterData = this.filterData;
    const qcArr = queryConditionHelper.getValue(
      queryConditionTypings.CheckTypes.FromFilterData,
      (this.queryConditions as any) || [],
      filterData as any
    );

    this.queryConditionSource = qcArr;
    this.curPage = 1;
    this.getQueryList("search");
    this.showSearchBox = false;
  }
  get searchFormula() {
    let _searchFormula =
      this.relevanceFormCode && this.relevanceFormCode.options.searchFormula;
    return _searchFormula ? JSON.parse(_searchFormula).conditions : [];
  }

  /*
   * 查询列表数据参数
   */
  queryParamsFormater() {
    let filters = JSON.parse(JSON.stringify(this.filterData));
    if (this.defaultQuery && this.defaultQuery.length > 0) {
      const defaultQuery: any[] = [];
      this.defaultQuery.forEach((q) => {
        const curFilter = filters.find((f) => f.propertyCode === q.code);
        if (curFilter) {
          curFilter.propertyValue = q.value;
        } else {
          defaultQuery.push(q);
        }
      });
      filters = filters.concat(defaultQuery);
    }
    

    const code =
      this.$store &&
      this.$store.state &&
      this.$store.state.WorkflowCenter &&
      this.$store.state.WorkflowCenter.WorkflowCenter.code;

    let reverseSchemaParam: any = null;
    if (this.relevanceFormCode) {
      let relevanceFormCode = this.relevanceFormCode.parentKey
        ? `${this.relevanceFormCode.parentKey}.${this.relevanceFormCode.key}`
        : this.relevanceFormCode.key;
      if (this.relevanceFormCode.path) {
        relevanceFormCode = this.relevanceFormCode.path.join(".");
      }
      reverseSchemaParam = {
        reverseRelevanceFormCode: relevanceFormCode,
        reverseSchemaCode: code
          ? code.split("-")[0]
          : this.$route.query.schemaCode || this.$route.query.code,
        reverseSheetCode: code
          ? code.split("-")[1]
          : this.$route.query.sheetCode || this.$route.query.code,
      };
      // 关联表单只查单据状态为已完成的列表
      filters.push({
        propertyCode: "sequenceStatus",
        propertyType: 0,
        propertyValue: "PROCESSING;COMPLETED",
      });
    }

    // 添加关联表单添加的过滤条件
    this.searchFormula.forEach((el) => {
      filters.push({
        propertyCode: el.propertyCode,
        propertyType: el.propertyType,
        propertyValue:
          typeof el.value === "string" ? el.value : JSON.stringify(el.value),
        operatorType: el.operatorType,
      });
    });

    const params: listParams.QueryListParams = {
      filters,
      mobile: false,
      page: this.curPage - 1,
      queryCode: this.listCode,
      schemaCode: this.schemaCode,
      size: this.pageSize,
      reverseSchemaParam: reverseSchemaParam,
      reverseViewFlag: this.reverseViewFlag,
    };
    if (this.reverseSchemaCode) {
      params.reverseSchemaCode = this.reverseSchemaCode;
      params.reverseCode = this.reverseControlCode;
      params.formCode = this.reverseFormCode;
    }
    return params;
  }

  /**
   * 字段排序筛选之后重新渲染表格
   */
  reRenderTable(columns: any) {
    this.cusColumns = columns.filter((col: any) => col.isShow);
    // 更新columns状态
    this.data.queryColumns = columns;
    this.rowsFormatter(this.cusColumns);

    this.saveColumnsOpts(columns);
  }
  /**
   * 字段信息存入本地缓存
   */
  saveColumnsOpts(columns: any) {
    const jsonStr: string = JSON.stringify(columns);
    window.localStorage.setItem(this.columnsOptsKey, jsonStr);
  }
  /**
   * 回复默认设置
   */
  recovery() {
    this.cusColumns = this.defaultColums;
    this.data.queryColumns = this.defaultColums;
    this.rowsFormatter(this.defaultColums);

    window.localStorage.removeItem(this.columnsOptsKey);
  }
  /**
   * 表格row格式化
   * @desc 将展示列的每一列整合到每一行
   * @params columns 共有多少列
   */
  rowsFormatter(columns: any) {
    const data: Array<any> = JSON.parse(JSON.stringify(this.dataSource));
    const newRows: any = [];
    data.forEach(() => {
      const _row: Array<any> = [];
      columns.forEach((col: any) => {
        _row.push({ key: col.key });
      });
      newRows.push(_row);
    });
    this.dataSource = data;
    return newRows; // 初次加载默认设置
  }

  // 监听当通过列表新增按钮打开新标签页添加数据

  /*
   * 获取查询列表数据
   */
  async getQueryList(type?: string) {
    

    const vm: any = this;
    // this.dataSource = [];
    this.list = [];
    this.isLoading = true;
    const params = this.queryParamsFormater();

    if (this.columns && this.columns.length > 0) {
      params.options = {
        customDisplayColumns: this.columns,
        queryDisplayType: listParams.QueryDisplayType.Append,
      };
    }

    if (!this.showSearch && this.query && this.query.length > 0) {
      // const items = this.query.map((x: any) => ({
      //   propertyCode: x.code,
      //   propertyType: x.type,
      //   propertyValue: x.value
      // }));
      // params.filters = params.filters.concat(items);
      for (const item of this.query) {
        if (params.filters.find((x) => x.propertyCode === item.code)) {
          break;
        }

        

        let val:any = item.value;
        if(item.type === 3){ // 日期格式
          val = moment(val).format("YYYY-MM-DD"); 
        }

        if([50,51,60,61].includes(item.type) && val){
          val = JSON.parse(JSON.stringify(val))
          val.forEach(element => {
            if(!element.unitType){
              element.unitType = type
            }
          });
          val = JSON.stringify(val)
        }


        if (
          item.type === schema.DataItemType.Number ||
          item.type === schema.DataItemType.Date
        ) {
          val = val + ";";
        }

        const statusType = {
          已完成: 'COMPLETED',
          进行中: 'PROCESSING'
        }
        val = statusType[val] || val

        params.filters.push({
          propertyCode: item.code,
          propertyType: item.type,
          propertyValue: val,
          // @ts-ignore
          operatorType: item.op === "NotEq" ? 2 : undefined 
        });
      }
    }

    if (this.isAuthorize === "Optional") {
      // 关联表单 临时授权配置为可选时，添加参数
      console.log(this.control);
      const options = this.control.options;
      const sheetParams: any = options.sheetParams;
      const sheetId = sheetParams.sheetid;
      const id = sheetParams.id;
      params.tempAuthSheetId = sheetId;
      params.tempAuthObjectId = id;
      params.tempAuthPropertyCode = this.control.key;
    }

    const res = !this.isReverse
      ? await listApi.getQueryList(params)
      : await listApi.queryReverse(params);

    this.isLoading = false;
    if (res.errcode === 0) {
      this.dataSource = [];
      this.list = res.data.content.map((x: any) => {
        x.data.ids = x.data.id;
        x.data.schemaCode = x.schemaCode;
        return x.data;
      });

      res.data.content.forEach((item: any, index: number) => {
        item.data.ids = item.data.id;
        item.data.index = index + 1;
        item.data.key = index;
        item.data.isChecked = false;
        this.data.queryColumns.forEach((i) => {
          console.log(
            i.propertyType === DataItemType.Sheet &&
              Array.isArray(item.data[i.propertyCode]) &&
              Array.isArray(i.childColumns),
            "i.propertyType === DataItemType.Sheet"
          );
          if (
            i.propertyType === DataItemType.Attachment &&
            !!item.data[i.propertyCode] &&
            Array.isArray(item.data[i.propertyCode])
          ) {
            item.data[i.propertyCode] = item.data[i.propertyCode].map((v) => {
              // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
              v.isImage = /^image\//.test(v.mimeType);
              v.url = renderer.UploadControl.service.getDownloadUrl(v);
              return v;
            });
          }
          // 对富文本
          else if (
            i.propertyType === DataItemType.LongText &&
            /<\/?[a-zA-Z]+("[^"]*"|'[^']*'|[^'">])*>/.test(item.data[i.propertyCode])
          ) {
            item.data[i.propertyCode] = "该内容不支持展示";
          }
          // 对子表
          else if (
            i.propertyType === DataItemType.Sheet &&
            Array.isArray(item.data[i.propertyCode]) &&
            Array.isArray(i.childColumns)
          ) {
            // 子表数据项做本地分页，sourceValue为原数据
            item.data[i.propertyCode] = item.data[i.propertyCode].map((val) => {
              i.childColumns.map((childCol: any) => {
                // 对附件(子表)
                if (
                  childCol.propertyType === DataItemType.Attachment &&
                  !!val[childCol.propertyCode] &&
                  Array.isArray(val[childCol.propertyCode])
                ) {
                  val[childCol.propertyCode] = val[childCol.propertyCode].map((v) => {
                    // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
                    v.isImage = /^image\//.test(v.mimeType);
                    v.url = renderer.UploadControl.service.getDownloadUrl(v);
                    return v;
                  });
                }
                // 地址
                else if ( childCol.propertyType === DataItemType.Address && !!val[childCol.propertyCode]) {
                  let isJson = this.isJSON(val[childCol.propertyCode]);
                  if(isJson){
                    val[childCol.propertyCode] = getRealValue(childCol, val[childCol.propertyCode]);
                  }
                }
                // 关联单选
                else if ( childCol.propertyType === DataItemType.RelevanceForm && !!val[childCol.propertyCode]) {
                  //关联单选中关联的是地址类型控件的话value为字符串JSON，这里目前先使用是否json来判断
                  let isJson = this.isJSON(val[childCol.propertyCode]);
                  if(isJson){
                    val[childCol.propertyCode] = getRealValue(childCol, val[childCol.propertyCode]);
                  }
                }
                // 关联多选
                else if (childCol.propertyType === DataItemType.RelevanceFormEx && !!val[childCol.propertyCode]) {
                  //关联多选中关联的是地址类型控件的话value为字符串JSON，这里目前先使用是否json来判断
                  let isJson = false;
                  let valueList = [];
                  if(val[childCol.propertyCode].indexOf(';')>-1) {
                    valueList = val[childCol.propertyCode].split(';');
                    //@ts-ignore
                    isJson = this.isJSON(valueList[0]);
                  }
                  if(isJson) {
                    val[childCol.propertyCode] = '';
                    valueList.forEach((ele)=>{
                      val[childCol.propertyCode] += `${getRealValue(childCol, ele)};`;
                    });
                  }
                }
                // 对富文本（子表）
                else if (
                  childCol.propertyType === DataItemType.LongText &&
                  /<\/?[a-zA-Z]+("[^"]*"|'[^']*'|[^'">])*>/.test(
                    val[childCol.id]
                  )
                ) {
                  val[childCol.id] = "该内容不支持展示";
                }
                return childCol;
              });
              return val;
            });
          }
          return i;
        });

        this.dataSource.push(item.data);
      });

      this.total = res.data.totalElements;
    } else {
      // this.isShowTableBox = false;
      // this.isShowLoadFailBox = true;
    }
  }

  isJSON(str) {
  if (typeof str == 'string') {
      try {
          var obj=JSON.parse(str);
          if(typeof obj == 'object' && obj ){
              return true;
          }else{
              return false;
          }
      } catch(e) {
          return false;
      }
  }
 }
}
</script>

<style lang="less" scoped>
/deep/.ant-table-thead > tr > th,
/deep/.ant-table-tbody > tr > td {
  padding: 8px 10px;
}

.list-selector {
  position: relative;
  // overflow: hidden;
  .filters-box {
    position: absolute;
    width: 100%;
    z-index: 666;
    background: #fff;

    /deep/.collapsed {
      // height: 100%;
      // overflow: auto;
    }
    &.show-more {
      height: 100%;
      overflow: auto;
    }
  }

  .table.has-filterbox {
    // padding-top: 64px;
    padding-top: 4px;
    // margin-top: 48px;
  }
  .table.has-filterbox.has-action {
    margin-top: 4px;
  }
  // .actions {
  // text-align: right;

  // margin-bottom: 8px;
  // }
  .actions.has-filterbox {
    margin-top: 48px;
  }
  &.hideSearch > .table {
    padding-top: 0;
  }

  .pagination-box {
    margin-top: @base4-padding-md;
    text-align: right;
    /*margin-bottom: 10px;*/
  }

  /deep/.ant-pagination-total-text {
    margin-right: @base4-padding-md;
  }
}
.relevance-form,
.reverse-relevance-list {
  .table {
    height: calc(100% - 95px);
    overflow: hidden;
    .list {
      height: 100%;
      /deep/ .sheet {
        height: calc(100% - 10px);
      }
    }
  }
  .table /deep/ .sheet .sheet__body {
    height: calc(100% - 77px);
    overflow-x: auto;
    //padding: 0 0 20px 0;
  }
}
</style>
