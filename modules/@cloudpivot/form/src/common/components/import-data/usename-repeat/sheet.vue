<template>
  <div class="import-sheet-container">
    <div class="import-sheet" :style="{'width': tableWidth}" v-if="columns && columns.length">
      <div class="sheet-header-wrapper" :class="{'sheet-fixed-head': fixedHead}">
        <div class="sheet-row sheet-header-row">
          <div
            v-for="(row,rowIdx) in columns"
            :key="row.key"
            class="sheet-row-item"
            :class="{'sheet-fixed-left': fixedLeft && rowIdx === 0}"
            :style="{'width': row.propertyType === DataItemType.Sheet ? '': row.width+'px'}"
          >
            <div
              class="sheet-row-innner"
              v-if="row.title && row.propertyType !== DataItemType.Sheet"
            >
              <div
                class="sheet-seletor-wrapper"
                v-if="row.propertyType === DataItemType.StaffSingle"
              >
                <div class="sheet-seletor-title">{{ row.title }}</div>
                <div class="batch-seletor-info">
                  <SelectUser v-model="tableData" :row="row" :batch="true"></SelectUser>
                </div>
              </div>
              <label v-else>{{ row.title }}</label>
            </div>
            <div
              class="child-sheet-wrapper"
              v-else-if="row.title && row.propertyType === DataItemType.Sheet"
            >
              <div class="child-sheet-title" :style="{'max-width': row.width+'px'}">{{ row.title }}</div>
              <template v-for="(child, index) in row.childColumns">
                <div
                  class="child-row-inner-wrapper"
                  :style="{'width': child.width+'px'}"
                  :key="index"
                >
                  <div v-if="child.propertyType === DataItemType.StaffSingle">
                    <div class="child-sheet-seletor-title">{{ child.title }}</div>
                    <div class="child-sheet-seletor-info">
                      <SelectUser
                        v-model="tableData"
                        :sheetKey="row.key"
                        :row="child"
                        :isSheet="true"
                        :batch="true"
                      ></SelectUser>
                    </div>
                  </div>
                  <div v-else-if="!child.title">
                    <a-checkbox
                      @change="(val) => {return childCheckAll(val, row.key) }"
                      :checked="getAllChildChecked(row.key)"
                    ></a-checkbox>
                  </div>
                  <label v-else>{{ child.title }}</label>
                </div>
              </template>
            </div>
            <div v-else>
              <a-checkbox @change="checkAll" :checked="getAllChecked()"></a-checkbox>
            </div>
          </div>
        </div>
      </div>
      <div class="sheet-body-wrapper">
        <div v-for="(tr,rowIdx) in tableData" :key="tr.key" class="sheet-row sheet-body-row">
          <div
            v-for="(row,idx) in columns"
            :key="row.key"
            class="sheet-row-item"
            :class="{'sheet-fixed-left': fixedLeft && idx === 0}"
            :style="{'width': row.propertyType === DataItemType.Sheet ? '': row.width +'px'}"
          >
            <!-- 子表 -->
            <div class="child-sheet-wrapper" v-if="row.propertyType === DataItemType.Sheet">
              <template v-for="(rowItem,index) in tr[row.dataIndex]">
                <div :key="index" class="child-items-row">
                  <div
                    :key="i"
                    v-for="(item,i) in row.childColumns"
                    class="child-items"
                    :style="{'width': item.width+'px'}"
                  >
                    <!-- 选人控件 -->
                    <div v-if="item.propertyType === DataItemType.StaffSingle">
                      <template v-for="(user,cindex) in rowItem[item.dataIndex]">
                        <span
                          class="row-inner-user"
                          :class="{'error-user': user.excelType}"
                          :key="cindex"
                          v-if="cindex === (rowItem[item.dataIndex].length - 1)"
                        >{{ getNameAndErrorText(user.name, user.excelType) }}</span>
                        <span
                          class="row-inner-user"
                          :class="{'error-user': user.excelType}"
                          :key="cindex"
                          v-else
                        >{{ getNameAndErrorText(user.name, user.excelType) + '、' }}</span>
                      </template>
                      <SelectUser :row="row" v-model="rowItem[item.dataIndex]"></SelectUser>
                    </div>
                    <!-- 关联表单 -->
                    <span
                      v-else-if="item.propertyType === DataItemType.RelevanceForm || item.propertyType === DataItemType.RelevanceFormEx"
                    >{{ rowItem[item.dataIndex] ? rowItem[item.dataIndex].data.name : '' }}</span>
                    <span v-else-if="!item.title">
                      <a-checkbox
                        :checked="rowItem.checked"
                        @change="(val) => { return childCheckboxChange(val,row.key,rowIdx,index) }"
                      ></a-checkbox>
                    </span>
                    <span v-else>{{ rowItem[item.dataIndex] }}</span>
                  </div>
                </div>
              </template>
            </div>
            <!-- 选人控件 -->
            <div
              class="row-inner-wrapper"
              v-else-if="[
                DataItemType.StaffSingle,
                DataItemType.StaffMulti,
                DataItemType.DeptSingle,
                DataItemType.DeptMulti,
                DataItemType.StaffDeptMix,
              ].includes(row.propertyType)"
            >
              <template v-for="(user,index) in tr[row.dataIndex]">
                <span
                  class="row-inner-user"
                  :class="{'error-user': user.excelType}"
                  :key="index"
                  v-if="index === (tr[row.dataIndex].length - 1)"
                >{{ getNameAndErrorText(user.name, user.excelType) }}</span>
                <span
                  class="row-inner-user"
                  :class="{'error-user': user.excelType}"
                  :key="index"
                  v-else
                >{{ getNameAndErrorText(user.name, user.excelType) + '、' }}</span>
              </template>
              <SelectUser :row="row" v-model="tr[row.dataIndex]"></SelectUser>
            </div>
            <!-- 关联表单 -->
            <div
              class="row-inner-wrapper"
              v-else-if="row.propertyType === DataItemType.RelevanceForm || row.propertyType === DataItemType.RelevanceFormEx"
            >{{ tr[row.dataIndex] ? tr[row.dataIndex].data.name : '' }}</div>

            <!-- 多选框 -->
            <div class="row-inner-wrapper" v-else-if="!row.title">
              <a-checkbox
                :checked="tr.checked"
                @change="(val) => { return checkboxChange(val,rowIdx) }"
              ></a-checkbox>
            </div>

            <div
              class="row-inner-wrapper"
              v-else
            >{{ tr[row.dataIndex] && tr[row.dataIndex].marked === true ? tr[row.dataIndex].value : tr[row.dataIndex] }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { DataItemType } from "@cloudpivot/form/schema";

import SelectUser from "./select-user.vue";
import { Checkbox } from "@h3/antd-vue";

@Component({
  name: "import-sheet",
  components: {
    SelectUser,
    ACheckbox: Checkbox,
  },
})
export default class ImportSheet extends Vue {
  @Prop({ default: true }) fixedHead!: boolean; // 固定表头

  @Prop({ default: true }) fixedLeft!: boolean; // 固定序号列

  @Prop() columns!: any;

  @Prop() dataSource!: any;

  tableWidth: any = "";

  DataItemType: any = DataItemType;

  errType: any = {
    Repeat: 1,
    NoExisted: 2,
    Null: 3,
    DisableDept: 4,
  };

  get tableData() {
    let data: any = [];
    data = this.dataSource.map((d: any, index: number) => {
      d.key = index + 1;
      d.index = index + 1;
      return d;
    });
    return data;
  }

  mounted() {
    this.$nextTick(() => {
      this.calcTableWidth();
    });
  }

  /*
   * 计算Table宽度
   */
  calcTableWidth() {
    let tableWidth: number = 0;
    const tableWrapWidth = document.querySelector(".import-sheet-container")
      ? (document.querySelector(".import-sheet-container") as any).clientWidth
      : 0;
    this.columns.forEach((c: any) => {
      // 子表宽度由内部数据项决定
      if (
        c.propertyType === DataItemType.Sheet &&
        Array.isArray(c.childColumns)
      ) {
        c.childColumns.forEach((child: any) => {
          tableWidth += child.width;
        });
        if (c.childColumns.length) {
          tableWidth += 1;
        }
      } else {
        tableWidth += c.width;
      }
    });
    this.tableWidth = tableWidth > tableWrapWidth ? `${tableWidth}px` : "100%";
  }

  getNameAndErrorText(name: string, type: number) {
    let errCode: string = "";
    switch (type) {
      case this.errType.Repeat:
        errCode = `${this.$t("cloudpivot.list.pc.repeat")}`;
        break;
      case this.errType.NoExisted:
        errCode = `${this.$t("cloudpivot.list.pc.noExisted")}`;
        break;
      case this.errType.Null:
        errCode = `${this.$t("cloudpivot.list.pc.null")}`;
        break;
      case this.errType.DisableDept:
        errCode = `${this.$t("cloudpivot.list.pc.deptDisable")}`;
        break;
    }
    return `${name ? name : ""}${errCode}`;
  }

  checkboxChange(val: any, index: number) {
    this.$set(this.tableData[index], "checked", val.target.checked);
    if (!val.target.checked) {
      //找到所有子表
      const arr: Array<any> = this.columns.filter(
        (c: any) => c.propertyType === DataItemType.Sheet
      );
      //清空当前数据中子表的选中状态
      const dataArr: any = this.tableData[index];
      arr.forEach((a: any) => {
        dataArr[a.key].forEach((s: any) => {
          this.$set(s, "checked", val.target.checked);
        });
      });
    }
  }

  childCheckboxChange(val: any, code: string, pidx: number, index: number) {
    const source: any = this.tableData[pidx];
    const sheetArr: any = source[code];
    //改变当前复选框状态
    this.$set(sheetArr[index], "checked", val.target.checked);
    //判断其他子表中是否在当前的这条数据中有选中状态
    const arr: Array<any> = this.columns.filter(
      (c: any) => c.propertyType === DataItemType.Sheet && c.key !== code
    );
    let hasChecked: boolean = false;
    arr.forEach((a: any) => {
      hasChecked = !!source[a.key].find((s: any) => s.checked);
    });
    if (!hasChecked) {
      //改变对应当前这条数据复选框状态
      source.checked = !!sheetArr.find((s: any) => s.checked);
    }
  }

  getAllChecked() {
    return this.tableData.every((c: any) => c.checked);
  }

  getAllChildChecked(code: string) {
    //改变全选的状态
    let checkArr: Array<any> = [];
    this.tableData.forEach((t: any) => {
      checkArr = checkArr.concat(t[code]);
    });
    return checkArr.every((c: any) => c.checked);
  }

  checkAll(val: any) {
    this.tableData.map((t: any) => {
      this.$set(t, "checked", val.target.checked);
    });
    if (!val.target.checked) {
      //找到所有子表
      const arr: Array<any> = this.columns.filter(
        (c: any) => c.propertyType === DataItemType.Sheet
      );
      //清空所有子表的选中状态
      this.tableData.forEach((t: any) => {
        arr.forEach((a: any) => {
          t[a.key].forEach((s: any) => {
            this.$set(s, "checked", val.target.checked);
          });
        });
      });
    }
  }

  childCheckAll(val: any, code: string) {
    //判断子表中是否在当前的这条数据中有选中状态
    const arr: Array<any> = this.columns.filter(
      (c: any) => c.propertyType === DataItemType.Sheet
    );
    //改变当前子表项与所有数据复选框状态
    this.tableData.map((t: any, index: number) => {
      this.$set(t, "checked", val.target.checked);
      t[code].forEach((s: any) => {
        this.$set(s, "checked", val.target.checked);
      });
      // 若有子表中有选中的则不清空当前数据的选中状态
      arr.forEach((a: any) => {
        !t.checked && (t.checked = !!t[a.key].find((s: any) => s.checked));
      });
    });
  }
}
</script>

<style lang="less" scoped>
.import-sheet-container {
  margin-top: 8px;
  height: 100%;
  max-height: 360px;
  overflow: auto;
  border-top: 1px solid #e8e8e8;
  .import-sheet {
    border-bottom: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
    .sheet-header-wrapper {
      .sheet-header-row {
        background: #fafafa;
        border-bottom: 1px solid #e8e8e8 !important;
        &:hover {
          background-color: #fafafa;
        }
        .sheet-row-item {
          padding: 8px;
          display: flex;
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          .sheet-row-innner {
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            .sheet-seletor-wrapper {
              position: relative;
              .sheet-seletor-title {
                width: 142px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .batch-seletor-info {
                position: absolute;
                top: 0;
                right: 0;
              }
            }
          }
          .child-sheet-wrapper {
            margin: -8px;
            overflow: hidden;
            .child-sheet-title {
              padding: 8px;
              border-bottom: 1px solid #e8e8e8;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .child-row-inner-wrapper {
              float: left;
              padding: 8px;
              border-right: 1px solid #e8e8e8;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              position: relative;
              &:last-child {
                border-right: none;
              }
              .child-sheet-seletor-title {
                width: 142px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .child-sheet-seletor-info {
                position: absolute;
                top: 8px;
                right: 8px;
              }
            }
          }
        }
      }
    }
    .sheet-body-wrapper {
      .child-sheet-wrapper {
        height: 100%;
        .child-items-row {
          display: flex;
          border-bottom: 1px solid #e8e8e8;
          &:last-child {
            border-bottom: none;
            height: 100%;
          }
          .child-items {
            padding: 8px;
            white-space: normal;
            overflow: hidden;
            border-right: 1px solid #e8e8e8;
            &:last-child {
              border-right: none;
            }
          }
        }
      }
    }
    .sheet-row {
      display: flex;
      flex-direction: row;
      min-height: 37px;
      border-bottom: 1px solid #e8e8e8;
      &:hover {
        background-color: #f0f7ff;
      }
      &:last-child {
        border-bottom: none;
      }
      .sheet-row-item {
        position: relative;
        z-index: 1;
        box-sizing: border-box;
        overflow: hidden;
        // 一列高度增加, 其他列自动扩展
        flex: 0 1 auto;
        // 当行超出显示省略号
        border-right: 1px solid #e8e8e8;
        &:last-child {
          border-right: none;
        }
        .row-inner-wrapper {
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 8px;
        }
      }
    }
  }
  .sheet-fixed-head {
    position: sticky;
    top: 0;
    z-index: 20;
  }
  .sheet-fixed-left {
    position: sticky !important;
    left: 0 !important;
    border-left: 1px solid #e8e8e8;
    z-index: 19 !important;
    background: #fff !important;
  }
  .error-user {
    color: #f4454e;
  }
  .center {
    text-align: center;
  }
}
</style>
