<template>
  <div class="import-sheet-container">
    <div
      :style="{ width: tableWidth }"
      class="import-sheet"
      v-if="columns && columns.length"
    >
      <div
        :class="{ 'sheet-fixed-head': fixedHead }"
        class="sheet-header-wrapper"
      >
        <div class="sheet-row sheet-header-row">
          <div
            :class="{ 'sheet-fixed-left': fixedLeft && rowIdx === 0 }"
            :key="row.key"
            :style="{
              width:
                row.propertyType === DataItemType.Sheet ? '' : row.width + 'px',
            }"
            class="sheet-row-item"
            v-for="(row, rowIdx) in columns"
          >
            <div
              class="sheet-row-innner"
              v-if="row.title && row.propertyType !== DataItemType.Sheet"
            >
              <div
                class="sheet-seletor-wrapper"
                v-if="getStaffSingle(row.propertyType)"
              >
                <div class="sheet-seletor-title">{{ row.title }}</div>
                <div class="batch-seletor-info">
                  <!-- <SelectUser
                    :batch="true"
                    :row="row"
                    v-model="tableData"
                  ></SelectUser> -->
                </div>
              </div>
              <div v-else class="sheet-seletor-title">{{ row.title }}</div>
            </div>
            <div
              class="child-sheet-wrapper"
              v-else-if="row.title && row.propertyType === DataItemType.Sheet"
            >
              <div
                :style="{ 'max-width': row.width + 'px' }"
                class="child-sheet-title"
              >
                {{ row.title }}
              </div>
              <template v-for="(child, index) in row.childColumns">
                <!-- {{(Number(child.width) - 1)}} -->
                <div
                  :key="index"
                  :style="{
                    width: `${
                      index === 1 ? Number(child.width) - 1 : child.width
                    }px`,
                  }"
                  class="child-row-inner-wrapper"
                >
                  <div v-if="getStaffSingle(child.propertyType)">
                    <div class="child-sheet-seletor-title">
                      {{ child.title }}
                    </div>
                    <div class="child-sheet-seletor-info">
                      <!-- <SelectUser
                        :batch="true"
                        :isSheet="true"
                        :row="child"
                        :sheetKey="row.key"
                        v-model="tableData"
                      ></SelectUser> -->
                    </div>
                  </div>
                  <div v-else-if="!child.title">
                    <a-checkbox
                      :checked="getAllChildChecked(row.key)"
                      @change="
                        (val) => {
                          return childCheckAll(val, row.key);
                        }
                      "
                    ></a-checkbox>
                  </div>
                  <label v-else>{{ child.title }}</label>
                </div>
              </template>
            </div>
            <div v-else>
              <a-checkbox
                :checked="getAllChecked()"
                @change="checkAll"
              ></a-checkbox>
            </div>
          </div>
        </div>
      </div>
      <div class="sheet-body-wrapper">
        <div
          :key="tr.key"
          class="sheet-row sheet-body-row"
          v-for="(tr, rowIdx) in tableData"
        >
          <div
            :class="{ 'sheet-fixed-left': fixedLeft && idx === 0 }"
            :key="row.key"
            :style="{
              width:
                row.propertyType === DataItemType.Sheet ? '' : row.width + 'px',
            }"
            class="sheet-row-item"
            v-for="(row, idx) in columns"
          >
            <!-- <template v-if="isHasExcelType(tr[row.dataIndex])">
              <span class="excelType-text">{{
                getExcelTypeText(tr[row.dataIndex])
              }}</span>
            </template> -->

            <!-- 子表 -->
            <div
              class="child-sheet-wrapper"
              v-if="row.propertyType === DataItemType.Sheet"
            >
              <template v-for="(rowItem, index) in tr[row.dataIndex]">
                <div :key="index" class="child-items-row">
                  <div
                    :key="i"
                    :style="{ width: item.width + 'px' }"
                    class="child-items"
                    v-for="(item, i) in row.childColumns"
                  >
                    <!-- 选人控件 -->
                    <div
                      class="row-inner-wrapper-sheet"
                      v-if="getStaffSingle(item.propertyType)"
                    >
                      <div class="text-ellipsis">

                        <span
                          :key="cindex"
                          :title="user.name"
                          v-for="(user, cindex) in rowItem[item.dataIndex]"
                        >
                        <!-- <template v-if="isHasExcelType(user)">
                          <span class="excelType-text">{{
                            getExcelTypeText(user)
                          }}</span>
                        </template> -->
                          <div style="display: none">{{ user }}</div>
                          <template
                            v-if="cindex === rowItem[item.dataIndex].length - 1"
                            >{{ user.name }}</template
                          >
                          <template v-else>{{
                            user.name + "、"
                          }}</template></span
                        >
                      </div>
                      <div
                        v-if="rowItem[item.dataIndex]"
                        style="position: absolute; right: 20px"
                      >
                        <template
                          v-for="(user, index) in arrayUnique2(
                            rowItem[item.dataIndex],
                            'excelType'
                          )"
                        >
                          <a-tooltip
                            :key="index"
                            placement="top"
                            v-if="getNameAndErrorText(user.excelType)"
                          >
                            <template slot="title">
                              <div style="display: flex">
                                <div
                                  style="margin-right: 20px; min-width: 80px"
                                >
                                  {{ getNameAndErrorText(user.excelType) }}
                                </div>
                                <div style="max-width: 300px">
                                  <span
                                    :key="index + 'sheet'"
                                    style="color: #e0dcdc"
                                    v-for="(users, index) in rowItem[
                                      item.dataIndex
                                    ].filter(
                                      (i) => i.excelType === user.excelType
                                    )"
                                  >
                                    <template
                                      v-if="
                                        index ===
                                        rowItem[item.dataIndex].filter(
                                          (i) => i.excelType === user.excelType
                                        ).length -
                                          1
                                      "
                                      >{{ users.name }}</template
                                    >
                                    <template v-else>{{
                                      users.name + "、"
                                    }}</template>
                                  </span>
                                </div>
                              </div>
                            </template>
                            <div style="display: none">{{ user }}</div>
                            <a-tag color="red">{{
                              getNameAndErrorText(user.excelType) 
                            }}</a-tag>
                          </a-tooltip>
                        </template>
                      </div>
                      <SelectUser
                        :row="item"
                        v-model="rowItem[item.dataIndex]"
                      ></SelectUser>
                    </div>
                    <!-- 关联表单 -->
                    <span
                      v-else-if="
                        item.propertyType === DataItemType.RelevanceForm ||
                        item.propertyType === DataItemType.RelevanceFormEx
                      "
                      >{{
                        rowItem[item.dataIndex]
                          ? rowItem[item.dataIndex].data
                          : ""
                      }}</span
                    >
                    <span v-else-if="!item.title">
                      <a-checkbox
                        :checked="rowItem.checked"
                        @change="
                          (val) => {
                            return childCheckboxChange(
                              val,
                              row.key,
                              rowIdx,
                              index
                            );
                          }
                        "
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
              v-else-if="getStaffSingle(row.propertyType)"
            >
              <div class="text-ellipsis">
                <span
                  :key="index"
                  :title="user.name"
                  v-for="(user, index) in tr[row.dataIndex]"
                >
                  <template v-if="index === tr[row.dataIndex].length - 1"
                    >{{ user.name }}
                  </template>
                  <template v-else>{{ user.name + "、" }} </template>
                </span>
              </div>
              <div
                v-if="tr[row.dataIndex]"
                style="position: absolute; right: 20px"
              >
                <template
                  v-for="(user, index) in arrayUnique2(tr[row.dataIndex], 'excelType')"
                >
                  <a-tooltip
                    :key="index"
                    placement="top"
                    v-if="getNameAndErrorText(user.excelType)"
                  >
                    <template slot="title">
                      <div style="display: flex">
                        <div style="margin-right: 20px; min-width: 80px">
                          {{ getNameAndErrorText(user.excelType) }}
                        </div>
                        <div style="max-width: 300px">
                          <span
                            :key="index + 'd'"
                            style="color: #e0dcdc"
                            v-for="(users, index) in tr[row.dataIndex].filter(
                              (i) => i.excelType === user.excelType || user.type
                            )"
                          >
                            <template
                              v-if="
                                index ===
                                tr[row.dataIndex].filter(
                                  (i) => i.excelType === user.excelType || user.type
                                ).length -
                                  1
                              "
                              >{{ users.name }}</template
                            >
                            <template v-else>{{ users.name + "、" }}</template>
                          </span>
                        </div>
                      </div>
                    </template>
                    <a-tag color="red">{{getNameAndErrorText(user.excelType || user.type)}}</a-tag>
                  </a-tooltip>
                </template>
              </div>
              <SelectUser :row="row" v-model="tr[row.dataIndex]"></SelectUser>
            </div>
            <!-- 关联表单 -->
            <div
              class="row-inner-wrapper"
              v-else-if="
                row.propertyType === DataItemType.RelevanceForm ||
                row.propertyType === DataItemType.RelevanceFormEx
              "
            >
              {{ tr[row.dataIndex] ? tr[row.dataIndex] : "" }}
            </div>

            <!-- 多选框 -->
            <div class="row-inner-wrapper" v-else-if="!row.title">
              <a-checkbox
                :checked="tr.checked"
                @change="
                  (val) => {
                    return checkboxChange(val, rowIdx);
                  }
                "
              ></a-checkbox>
            </div>
            <div class="row-inner-wrapper" v-else>
              {{
                tr[row.dataIndex] && tr[row.dataIndex].marked === true
                  ? tr[row.dataIndex].value
                  : tr[row.dataIndex]
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { DataItemType } from "@cloudpivot/form/schema";

import SelectUser from "./select-user.vue";

@Component({
  name: "import-sheet",
  components: {
    SelectUser,
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
    Only: 5,
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

  isHasExcelType(item) {
    if (Array.isArray(item) && item[0] && item[0].excelType || Object.prototype.toString.call(item) === '[object Object]' && item.excelType) {
      return true;
    } else {
      return false;
    }
  }
  getExcelTypeText(item) {
    const types = {
      REPEAT: "重复",
      NOEXIT: "不存在",
      EMPTY: "空",
      FORBIDDEN: "禁用",
      SINGLE_SELECT: "只允许单选",
    };
    if(Object.prototype.toString.call(item) === '[object Object]'){
      return types[item.excelType]
    }
    return types[item[0].excelType];
  }

  getStaffSingle(type) {
    switch (type) {
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return true;
        break;
    }
    return false;
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

  getNameAndErrorText(type: number) {
    const types = {
      REPEAT: "重复",
      NOEXIT: "不存在",
      EMPTY: "空",
      FORBIDDEN: "禁用",
      SINGLE_SELECT: "只允许单选",
    };
    return types[type];
    // let errCode: string = "";
    // switch (type) {
    //   case this.errType.Repeat:
    //     errCode = `${this.$t("cloudpivot.list.pc.dataRepeat")}`;
    //     break;
    //   case this.errType.NoExisted:
    //     errCode = `${this.$t("cloudpivot.list.pc.dataNoExisted")}`;
    //     break;
    //   case this.errType.Null:
    //     errCode = `${this.$t("cloudpivot.list.pc.notData")}`;
    //     break;
    //   case this.errType.DisableDept:
    //     errCode = `${this.$t("cloudpivot.list.pc.dataDeptDisable")}`;
    //     break;
    //   case this.errType.Only:
    //     errCode = `${this.$t("cloudpivot.list.pc.onlyDataDept")}`;
    //     break;
    // }
    // return `${errCode}`;
  }

  arrayUnique2(arr, name) {
    
    let hash = {};
    const a = arr.reduce(function (item, next) {
      hash[next[name]] ? "" : (hash[next[name]] = true && item.push(next));
      return item;
    }, []);
    return a;
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
  .text-ellipsis {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

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
            position: relative;

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
          display: flex;
          justify-content: space-between;
        }
        .row-inner-wrapper-sheet {
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          justify-content: space-between;
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

.sheet-row-item {
  position: relative;
  .excelType-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 16px;
    height: 24px;
    line-height: 22px;
    border: 1px solid #e93419;
    color: #e93419;
    background-color: #fdeae8;
    padding: 0 10px;
  }
}
</style>
