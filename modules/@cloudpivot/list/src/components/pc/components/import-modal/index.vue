<template>
  <a-modal
    :cancelText="$t('cloudpivot.list.pc.Skip')"
    :maskClosable="false"
    :okText="$t('cloudpivot.list.pc.SureImport')"
    :title="'在线修正错误数据'"
    @cancel="cancel"
    @ok="sureImport"
    v-model="showModal"
    width="80%"
    wrapClassName="import-err-modal"
  >
    <div class="data-import-status-half" v-if="isHalfSuccess">
      <p class="data-import-status-half__success">
        <i class="icon aufontAll h-icon-all-check-circle"/>
        <span>{{ `数据导入完成，成功导入${successNum}条数据` }}</span>
      </p>
      <p class="data-import-status-half__error">
        <i class="icon aufontAll h-icon-all-close-circle"/>
        <span v-if="failNum && failNum > 0">{{ `${failNum}条数据导入失败，请`}}
          <a @click="exportErrorResult" href="javascript:;">下载错误数据</a>，修改后再导入
        </span>
        <span v-else>{{ `${failNum}条数据导入失败`}}</span>
      </p>
    </div>
    <div class="line"></div>
    <div class="title-flex">
      <span v-if="hasErrorStatus">
          <i class="icon-gap icon aufontAll h-icon-all-exclamation-circle"></i>
          请先修正人员、部门错误数据，再进行导入操作
        </span>
      <span class="success" v-else>
          <i class="icon-gap icon aufontAll h-icon-all-exclamation-circle"></i>
          已全部修改完成
        </span>
      <div class="flex">
        <div class="title-tips">
          <template>{{ $t("cloudpivot.list.pc.importTitleBatchTips") }}</template>
          <!--        <template v-else>{{ $t("cloudpivot.list.pc.importTitleTips") }}</template>-->
        </div>
        <a-popover :visible="showBacthUpdate" overlayClassName="bacth-update-popover" placement="bottomRight" title=""
                   trigger="click">
          <template #content>
            <div>
              <div class="batch-updata-style">
                <div class="filters">
                  <a-row
                    :gutter="16"
                    :key="index"
                    style="margin-top: 5px"
                    v-for="(row, index) in filterList"
                  >
                    <a-col :span="2">
                      <span style="line-height: 32px" v-if="index === 0">
                        {{$t("cloudpivot.list.pc.filterCondition")}}
                      </span>
                    </a-col>
                    <a-col :span="5">
                      <a-select
                        @change="handleChangeDataItem(row, index)"
                        class="data-filter"
                        placeholder="请选择"
                        v-model="row.data"
                      >
                        <a-select-option
                          :key="ii"
                          :title="type.title"
                          :value="`${type.key}${type.parentDataIndex ? '、' + type.parentDataIndex : ''}`"
                          v-for="(type, ii) in row.dataItem"
                        >{{ type.title }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :span="16">
                      <div>
                        <a-select
                          :filter-option="filterOption"
                          class="data-filter"
                          option-filter-prop="children"
                          placeholder="请选择"
                          show-search
                          v-model="row.type"
                        >
                          <a-select-option
                            :key="vv + index"
                            :title="Array.isArray(type) ? type.map((i) => getNameAndErrorText(i.name, i.type)).join('、') : type"
                            :value="Array.isArray(type) ? type.map((i) => (i.id ? i.id : i.name)).join('、') : type"
                            v-for="(type, vv) in row.typeList"
                          >
                            <a-tooltip placement="bottom">
                              <span slot="title">
                                {{
                                Array.isArray(type)
                                ? type
                                .map((i) =>
                                getNameAndErrorText(i.name, i.excelType)
                                )
                                .join("、")
                                : type
                                }}
                              </span>
                              <span v-if="Array.isArray(type)">
                                <template v-for="(i, v) in type">
                                  <span
                                    :class="{ 'error-user-batch': i.excelType }"
                                    :key="v + i.name"
                                    class="row-inner-user"
                                  >
                                    {{ getNameAndErrorText(i.name, i.excelType) }}
                                    <span
                                      v-if="v !== type.length - 1"
                                    >、</span>
                                  </span>
                                </template>
                              </span>
                              <span v-else>{{ type }}</span>
                            </a-tooltip>
                          </a-select-option>
                        </a-select>
                      </div>
                    </a-col>
                    <a-col :span="1" style="text-align: center; padding-top: 4px">
                      <span @click="delRows(index, 'filterList')" class="delete">
                        <i class="icon aufontAll h-icon-all-delete-o"></i>
                      </span>
                    </a-col>
                  </a-row>

                  <a-row>
                    <a-col :span="2">
                      <span style="line-height: 32px" v-if="filterList.length === 0">
                        {{$t("cloudpivot.list.pc.filterCondition")}}
                      </span>
                    </a-col>
                    <div class="add">
                      <span :style="filterList.length === 0 ? 'margin-left: -86px' : ''" @click="addRowsFilter()">
                        <span>
                          <i class="icon aufontAll h-icon-all-plus-o"></i>
                        </span>
                        <span>
                          {{ $t("cloudpivot.list.pc.Add") + $t("cloudpivot.list.pc.filterCondition") }}
                        </span>
                      </span>
                    </div>
                  </a-row>
                </div>
                <div class="filters">
                  <a-row
                    :gutter="16"
                    :key="index"
                    style="margin-top: 5px"
                    v-for="(row, index) in batchList"
                  >
                    <a-col :span="2">
                      <span style="line-height: 32px" v-if="index === 0">
                        {{$t("cloudpivot.list.pc.batchUpdata")}}
                      </span>
                    </a-col>
                    <a-col :span="5">
                      <a-select
                        @change="handleChangeDataItem(row, index)"
                        class="data-filter"
                        placeholder="请选择"
                        v-model="row.data"
                      >
                        <a-select-option :key="'allData'" :value="`allData`">
                          {{$t("cloudpivot.list.pc.all")}}
                        </a-select-option>
                        <a-select-option
                          :key="ii"
                          :title="type.title"
                          :value="`${type.key}${type.parentDataIndex ? '、' + type.parentDataIndex : ''}`"
                          v-for="(type, ii) in row.dataItem"
                        >{{ type.title }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :span="9">
                      <a-select
                        :filter-option="filterOption"
                        class="data-filter"
                        option-filter-prop="children"
                        placeholder="请选择"
                        show-search
                        v-model="row.type"
                      >
                        <a-select-option value="">
                          &nbsp;
                        </a-select-option>
                        <a-select-option
                          :key="vv + index"
                          :value="type.map((i) => (i.id ? i.id : i.name)).join('、') + '$$$' + type[0].propertyType"
                          v-for="(type, vv) in row.typeList"
                        >
                          <a-tooltip placement="bottom">
                            <span slot="title">
                              {{type.map((i) => getNameAndErrorText(i.name, i.excelType)).join("、")}}
                            </span>
                            <span :class="{ 'error-user-batch': type.some(el => el.excelType) }">
                              <template v-for="(i, v) in type">
                                <span
                                  :key="v + i.name + vv"
                                  class="row-inner-user"
                                >
                                  {{ getNameAndErrorText(i.name, i.excelType) }}
                                  <span v-if="v !== type.length - 1">、</span>
                                </span>
                              </template>
                            </span>
                          </a-tooltip>
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :span="7">
                      <div class="batch-update-new-data">
                        <!-- <div v-if="row.value && row.value.length < 3">
                          <template v-for="(user, index) in row.value">
                          <span
                            :class="{ 'error-user': user.excelType }"
                            :key="index"
                            class="row-inner-user"
                            v-if="index === row.value.length - 1"
                          >{{ user.name }}</span>
                                  <span
                                    :class="{ 'error-user': user.excelType }" :key="index" class="row-inner-user" v-else>
                            {{user.name + "、"}}
                          </span>
                          </template>
                        </div> -->
                        <div>
                          <a-tag v-if="row.value && row.value.length > 0">
                            <a-icon type="team" />
                            已选{{row.value.length}}个</a-tag>
                        </div>

                        <SelectUser :batchStatus="true" :row="row" v-model="row.value"></SelectUser>
                      </div>
                    </a-col>
                    <a-col :span="1" style="text-align: center; padding-top: 4px">
                      <span @click="delRows(index, 'batchList')" class="delete" v-if="batchList.length > 1">
                        <i class="icon aufontAll h-icon-all-delete-o"></i>
                      </span>
                    </a-col>
                  </a-row>

                  <div class="add">
                    <span @click="addRows()">
                      <span>
                        <i class="icon aufontAll h-icon-all-plus-o"></i>
                      </span>
                      <span>{{ $t("cloudpivot.list.pc.addResult") }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex">
                <a-button
                  @click="clearBatchData"
                  size="small"
                  style="margin-right: 20px"
                >{{ $t("cloudpivot.list.pc.Cancel") }}
                </a-button>
                <a-button @click="handleOnBatchConfirm" size="small" type="primary">
                  {{
                  $t("cloudpivot.list.pc.OK")
                  }}
                </a-button>
              </div>
            </div>
          </template>
          <a-button @click="handleOnBatchUpdate">
            {{
            $t("cloudpivot.list.pc.batchUpdata")
            }}
          </a-button>
        </a-popover>
      </div>
    </div>

    <sheet :columns="columns" :dataSource="dataSource" ></sheet>

    <div class="pagination-box" ref="paginationBox">
      <a-pagination
        :current="curPage"
        :pageSize="pageSize"
        :pageSizeOptions="pageSizeOptions"
        :showTotal="(total) => $t('cloudpivot.list.pc.Total', { num: total })"
        :total="total"
        @change="onPaginationChange"
        @showSizeChange="onSizeChange"
        showQuickJumper
        showSizeChanger
      />
    </div>
    <template slot="footer">
      <a-button @click="cancel">
        {{$t('cloudpivot.list.pc.Skip')}}
      </a-button>
      <a-button
        :disabled="hasErrorStatus"
        @click="sureImport"
        type="primary"
      >
        {{$t('cloudpivot.list.pc.SureImport')}}
      </a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import {namespace} from "vuex-class";
  import sheet from "./sheet.vue";
  import {listApi, listParams} from "@cloudpivot/api";
  import SelectUser from "./select-user.vue";

  import {DataItemType} from "@cloudpivot/form/schema";

  const WorkflowCenterModule = namespace("WorkflowCenter/WorkflowCenter");

  @Component({
    name: "import-err-modal",
    components: {
      sheet,
      SelectUser,
    },
  })
  export default class ImportErrModal extends Vue {
    @WorkflowCenterModule.State("applicationPageTitle") applicationPageTitle: any;

    @Prop() value!: boolean;

    @Prop({
      type: Number,
      default: 0,
    })
    successNum!: number;

    @Prop({
      type: Number,
      default: 0,
    })
    failNum!: number;

    @Prop({
      type: Number,
      default: 8,
    })
    status!: any;

    @Prop({
      type: String,
    })
    fileName!: string;

    @Prop() importData!: any;

    get isHalfSuccess() {
      return (
        this.status === listParams.ImportResult.PartialSuccess ||
        this.status === listParams.ImportResult.FaileReImport
      );
    }

    showModal: boolean = false;

    total: number = 0;

    pageSize: number = 20;

    curPage: number = 1;

    columns: any = [];

    dataSource: any = [];

    // 分页配置项
    pageSizeOptions: string[] = ["10", "20", "50", "100"];
    showBacthUpdate: any = false;
    batchList: any = [
      {
        type: undefined,
        value: undefined,
        data: undefined,
        dataItem: [],
        typeList: [],
      },
    ];
    dataItem: any = [];
    dataItemAll: any = [];
    itemContentList: any = [];
    errType: any = {
      Repeat: 1,
      NoExisted: 2,
      Null: 3,
      DisableDept: 4,
      Only: 5
    };
    filterList: any = [];

    /*
     * 初始化表头
     */
    initColumns() {
      const dataItem: any = [];
      const dataItemAll: any = [];
      const _columns = this.importData.headColumns
        .map((col: any, idx: number) => {
          let colWidth: number = this.caculateColWidth(col);
          let childColumns = null;
          switch (col.propertyType) {
            case DataItemType.StaffSingle:
            case DataItemType.StaffMulti:
            case DataItemType.StaffDeptMix:
            case DataItemType.DeptMulti:
            case DataItemType.DeptSingle:
              dataItem.push({
                title: col.name,
                dataIndex: col.propertyCode,
                propertyType: col.propertyType,
                displayFormat: col.displayFormat,
                width: colWidth,
                key: col.propertyCode,
                childColumns,
              });
              break;
          }
          if (col.propertyType !== DataItemType.Sheet) {
            dataItemAll.push({
              title: col.name,
              dataIndex: col.propertyCode,
              propertyType: col.propertyType,
              displayFormat: col.displayFormat,
              width: colWidth,
              key: col.propertyCode,
              childColumns,
            });
          }

          // 子表初始化其子数据项
          if (col.propertyType === DataItemType.Sheet) {
            if (!col.childColumns || !col.childColumns.length) {
              return;
            }
            let childSheetWidth: number = 0;
            childColumns = col.childColumns.map((child: any) => {
              const childWidth: number = this.caculateColWidth(child);
              childSheetWidth += childWidth;
              switch (child.propertyType) {
                case DataItemType.StaffSingle:
                case DataItemType.StaffMulti:
                case DataItemType.StaffDeptMix:
                case DataItemType.DeptMulti:
                case DataItemType.DeptSingle:
                  dataItem.push({
                    title: `${col.name}、${child.name}`,
                    dataIndex: child.propertyCode,
                    propertyType: child.propertyType,
                    displayFormat: child.displayFormat,
                    width: childWidth,
                    parentDataIndex: col.propertyCode,
                    key: child.propertyCode,
                    childColumns: null,
                  });
                  break;
              }
              dataItemAll.push({
                title: `${col.name}、${child.name}`,
                dataIndex: child.propertyCode,
                propertyType: child.propertyType,
                displayFormat: child.displayFormat,
                width: childWidth,
                parentDataIndex: col.propertyCode,
                key: child.propertyCode,
                childColumns: null,
              });
              return {
                title: child.name,
                dataIndex: child.propertyCode,
                propertyType: child.propertyType,
                width: childWidth,
                key: child.propertyCode,
              };
            });
            colWidth = childSheetWidth + 46;
            //子表添加
            if (Array.isArray(childColumns) && childColumns.length > 0) {
              const indexColumn = {
                dataIndex: "index",
                propertyType: 0,
                width: 46,
                key: "index",
              };
              childColumns.unshift(indexColumn);
            }
          }

          const back = {
            title: col.name,
            dataIndex: col.propertyCode,
            propertyType: col.propertyType,
            displayFormat: col.displayFormat,
            width: colWidth,
            key: col.propertyCode,
            childColumns,
          };

          return back;
        })
        .filter(Boolean);
      this.dataItem = JSON.parse(JSON.stringify(dataItem));
      this.batchList[0].dataItem = JSON.parse(JSON.stringify(dataItem));
      this.dataItemAll = JSON.parse(JSON.stringify(dataItemAll));
      // 增加序号列
      if (_columns.length) {
        const indexColumn = {
          dataIndex: "index",
          propertyType: 0,
          width: 46,
          key: "index",
          childColumns: null,
        };
        _columns.unshift(indexColumn);
      }

      this.columns = _columns;
    }

    /*
     * 初始化表格数据（本地分页）
     */
    initTableData() {
      if (this.importData && this.importData.secondImportData) {
        this.dataSource = this.importData.secondImportData.slice(
          0,
          this.pageSize
        );
        this.total = this.importData.secondImportData.length;
      }
    }

    /*
     * 分页改变
     */
    onPaginationChange(page: number, size: number) {
      this.curPage = page;
      this.dataSource = this.importData.secondImportData.slice(
        (page - 1) * this.pageSize,
        page * this.pageSize
      );
    }

    /*
     * 分页pageSize改变
     */
    onSizeChange(current: number, size: number) {
      this.curPage = 1;
      this.pageSize = size;
      this.dataSource = this.importData.secondImportData.slice(0, size);
    }

    /*
     * 计算记录中列的宽度
     */
    caculateColWidth(col: any) {
      const longInput = [1, 5, 8, 9, 10];
      if (longInput.includes(col.propertyType)) {
        return 252;
      }
      return 200;
    }

    // 判断是否有错误
    get hasErrorStatus() {
      const list: any = [];
      this.importData.secondImportData.forEach((item: any) => {
        // console.log(Object.values(item), 'item');
        const values: any = Object.keys(item);
        values.forEach((key: any) => {
          let inner = item[key]
          if (Array.isArray(inner)) {
            inner.forEach(i => {
              if (Object.prototype.toString.call(i) === '[object Object]') {
                if(!i.id && i.excelType){
                  i.propertyType = this.importData.headColumns.find(el => el.propertyCode === key).propertyType
                  list.push(i);
                }
                

                Object.keys(i).forEach((iItem:any) => {
                  let k = i[iItem]
                  if(Array.isArray(k)){
                    k.forEach(l => {
                      if ( Object.prototype.toString.call(l) === '[object Object]' && !l.id && l.excelType) {
                        let _iItem = this.importData.headColumns.find(el => el.propertyCode === iItem)
                        l.propertyType = _iItem && _iItem.propertyType || ''
                        list.push(l);
                      }
                    })
                  }
                  
                })

              }
            })
          }
        });
      });
      if (list.length > 0) {
        return true;
      } else {
        return false;
      }
    }

    /*
     * 确定导入
     */
    async sureImport() {
      this.importData.secondImportData.forEach((data: any) => {
        delete data.index;
        delete data.key;
      });
      const params = {
        headColumns: this.importData.headColumns,
        secondImportData: this.importData.secondImportData,
        queryField: this.importData.queryField,
      };
      const res = await listApi.secondImportData(params);
      if (res.errcode === 0) {
        this.$message.success(
          this.$t("cloudpivot.list.pc.ImportSuccess") as string
        );
        this.cancel();
      } else {
        if (res.errcode === 303030 && res.data) {
          this.$message.error(res.errmsg as string);
          this.importData = {
            headColumns: res.data.headColumns,
            secondImportData: res.data.secondImportData,
            queryField: res.data.queryField,
          };
          this.initColumns();
          this.initTableData();
          return;
        }
        this.$message.error(res.errmsg as string);
      }
    }

    cancel() {
      this.clearBatchData();
      //成功或失败都无需做处理
      listApi.deleteTemporaryFile({fileName: this.fileName});
      this.$emit("reloadList", "reload");
      this.$emit("input", false);
    }

    /**
     * 下载错误信息文档
     */
    async exportErrorResult() {
      console.log('下载错误信息文档')
      const res = await listApi.downErrorResult(this.fileName);
      if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
        this.$message.error(
          this.$t("cloudpivot.list.pc.DownloadFailed") as string
        );
      } else {
        const blob = new Blob([res], {type: "application/vnd.ms-excel"});
        const stamp = new Date().getMilliseconds();
        const fileName = `${
          this.applicationPageTitle
        }错误信息${this.getTime()}.xlsx`;

        this.downloadFile(blob, fileName);
      }
    }

    getTime() {
      const date = new Date();
      const mounth =
        date.getMonth() > 8 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
      const days = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
      const hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
      const minutes =
        date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
      const seconds =
        date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;

      const stamp = `${date.getFullYear()}${mounth}${days}${hours}${minutes}${seconds}`;
      return stamp;
    }

    downloadFile(blob: any, fileName: string) {
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName);
      } else {
        const a = document.createElement("a");
        const url = URL.createObjectURL(blob);
        a.download = fileName;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      }
    }

    /*
     * 重置分页器参数
     */
    resetPagination() {
      this.total = 0;
      this.curPage = 1;
      this.pageSize = 20;
    }

    @Watch("value")
    onValueChange(v: boolean) {
      this.showModal = v;
      if (v) {
        this.initColumns();
        this.initTableData();
      } else {
        this.resetPagination();
      }
    }

    handleOnBatchUpdate() {
      this.showBacthUpdate = !this.showBacthUpdate;
    }

    // 删除行
    delRows(index, key) {
      this[key].splice(index, 1);
    }

    // 添加行
    addRows(type: string): void {
      // newRow Data
      const newRow: any = {
        type: undefined,
        value: undefined,
        data: undefined,
        dataItem: this.dataItem,
        typeList: [],
      };
      this.batchList.push(...[newRow]);
    }

    addRowsFilter(type: string): void {
      // newRow Data
      const newRow: any = {
        type: undefined,
        data: undefined,
        dataItem: this.dataItemAll,
        typeList: [],
      };
      this.filterList.push(...[newRow]);
    }

    handleChangeDataItem(row, index) {
      row.value = undefined
      let arr: any = [];
      let arr2: any = [];
      let parentSheet: any = null;
      let rowArr: any = [];
      if (row.data === "allData") {
        row.dataItem.forEach((o) => {
          this.importData.secondImportData.forEach((i) => {
            const parent = i[o.parentDataIndex];
            if (i[o.dataIndex] || parent) {
              if (parent) {
                parent.forEach((v) => {
                  if (v[o.dataIndex]) {
                    if (Array.isArray(v[o.dataIndex])) {
                      const obj = this.changeData(v[o.dataIndex], arr, arr2,o);
                      if (obj.arr && obj.arr.length > 0) arr = obj.arr;
                      if (obj.arr2 && obj.arr2.length > 0) arr2 = obj.arr2;
                    } else if (typeof v[o.dataIndex] === "string") {
                      const l = arr.filter((i) => i === v[o.dataIndex]);
                      if (!l || (l && l.length <= 0)) arr.push(v[o.dataIndex]);
                    }
                  }
                });
              } else {
                if (Array.isArray(i[o.dataIndex])) {
                  const obj = this.changeData(i[o.dataIndex], arr, arr2, o);
                  if (obj.arr && obj.arr.length > 0) arr = obj.arr;
                  if (obj.arr2 && obj.arr2.length > 0) arr2 = obj.arr2;
                } else if (typeof i[o.dataIndex] === "string") {
                  const l = arr.filter((i) => i === i[o.dataIndex]);
                  if (!l || (l && l.length <= 0)) arr.push(i[o.dataIndex]);
                }
              }
            }
          });
        });
      } else {
        if (row.data) {
          rowArr = row.data.split("、");
          if (rowArr.length === 2) {
            parentSheet = rowArr[1];
          }
        }
        this.importData.secondImportData.forEach((e) => {
          if (parentSheet && e[parentSheet]) {
            e[parentSheet].forEach((o) => {
              if (o[rowArr[0]]) {
                if (Array.isArray(o[rowArr[0]])) {
                  const obj = this.changeData(o[rowArr[0]], arr, arr2,o);
                  if (obj.arr && obj.arr.length > 0) arr = obj.arr;
                  if (obj.arr2 && obj.arr2.length > 0) arr2 = obj.arr2;
                } else if (typeof o[rowArr[0]] === "string") {
                  const l = arr.filter((i) => i === o[rowArr[0]]);
                  if (!l || (l && l.length <= 0)) arr.push(o[rowArr[0]]);
                }
              }
            });
          } else {
            if (Array.isArray(e[row.data])) {
              const obj = this.changeData(e[row.data], arr, arr2,e);
              if (obj.arr && obj.arr.length > 0) arr = obj.arr;
              if (obj.arr2 && obj.arr2.length > 0) arr2 = obj.arr2;
            } else if (typeof e[row.data] === "string") {
              const l = arr.filter((i) => i === e[row.data]);
              if (!l || (l && l.length <= 0)) arr.push(e[row.data]);
            }
          }
        });
      }

      row.type = undefined;
      row.typeList = [...arr, ...arr2];
      console.log(row, "dddd");
    }

    changeData(list, arr, arr2, item?:any) {
      if (list) {
        list.forEach(element => {
          element.propertyType = item.propertyType
        });

        let status = list.filter((i) => i.excelType);
        const name = list.map((i) => i.name);
        if (status && status.length > 0) {
          if (arr.length > 0) {
            let a = arr.filter((i) => JSON.stringify(list) === JSON.stringify(i));
            if (!a || (a && a.length <= 0)) {
              if (list && list.length > 0) arr = arr.concat([list]);
            }
          } else {
            if (list && list.length > 0) arr = arr.concat([list]);
          }
        } else {
          if (arr2.length > 0) {
            let a = arr2.filter(
              (i) => JSON.stringify(list) === JSON.stringify(i)
            );
            if (!a || (a && a.length <= 0)) {
              if (list && list.length > 0) arr2 = arr2.concat([list]);
            }
          } else {
            if (list && list.length > 0) arr2 = arr2.concat([list]);
          }
        }
      }
      return {arr, arr2};
    }

    getNameAndErrorText(name: string, type: any) {
      const types = {
        REPEAT: "重复",
        NOEXIT: "不存在",
        EMPTY: "空",
        FORBIDDEN: "禁用",
        SINGLE_SELECT: "只允许单选",
      };
      let info = types[type]
      return info ? `${name ? name : ""} (${info})` : `${name ? name : ""}`
    }

    filterOption(input, option) {
      return (
        option.componentOptions.propsData.value
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      );
    }

    handleOnBatchConfirm() {
      
      let arr: any = [];
      if (this.filterList.length > 0) {
        this.filterList.forEach((i) => {
          let rowArr: any = i.data && i.data.split("、");
          let parentSheet: any = null;
          if (rowArr && rowArr.length === 2) {
            parentSheet = rowArr[1];
          }
          this.importData.secondImportData.map((v) => {
            if (parentSheet && v[parentSheet]) {
              let child = v[parentSheet].filter((o) => {
                if (o[rowArr[0]]) {
                  if (Array.isArray(o[rowArr[0]])) {
                    const name = o[rowArr[0]]
                      .map((e) => (e.id ? e.id : e.name))
                      .join("、");
                    if (name === i.type.split('$$$')[0]) {
                      return o;
                    }
                  } else if (typeof o[rowArr[0]] === "string") {
                    if (o[rowArr[0]] === i.type.split('$$$')[0]) {
                      return o;
                    }
                  }
                }
              });
              if (child && child.length > 0) {
                const arrs = JSON.parse(JSON.stringify(v));
                arrs[parentSheet] = child;
                arr.push(arrs);
              }
            } else {
              if (v[i.data]) {
                if (Array.isArray(v[i.data])) {
                  const name = v[i.data]
                    .map((e) => (e.id ? e.id : e.name))
                    .join("、");
                  if (name === i.type.split('$$$')[0]) {
                    arr.push(v);
                  }
                } else if (typeof v[i.data] === "string") {
                  if (v[i.data] === i.type.split('$$$')[0]) {
                    arr.push(v);
                  }
                }
              }
            }
          });
        });
        if (arr.length > 0) {
          this.importData.secondImportData = arr;
        }
      }
      this.batchList.forEach((i) => {
        if (i.data === "allData") {
          i.dataItem.forEach((o) => {
            this.importData.secondImportData.forEach((v) => {
              const parent = v[o.parentDataIndex];
              if (v[o.dataIndex] || parent) {
                if (parent) {
                  parent.forEach((c) => {
                    if (c[o.dataIndex]) {
                      const name = c[o.dataIndex]
                        .map((e) => (e.id ? e.id : e.name))
                        .join("、");
                      if (name === i.type.split('$$$')[0]) {
                        c[o.dataIndex] = i.value;
                      }
                    }
                  });
                } else {
                  const name = v[o.dataIndex]
                    .map((e) => (e.id ? e.id : e.name))
                    .join("、");

                  if (name === i.type.split('$$$')[0]) {
                    v[o.dataIndex] = i.value;
                  }
                }
              }
            });
          });
        } else {
          let rowArr: any = i.data && i.data.split("、");
          let parentSheet: any = null;
          if (rowArr && rowArr.length === 2) {
            parentSheet = rowArr[1];
          }
          this.importData.secondImportData.forEach((v) => {
            if (parentSheet && v[parentSheet]) {
              v[parentSheet].forEach((o) => {
                if (o[rowArr[0]]) {
                  const name = o[rowArr[0]]
                    .map((e) => (e.id ? e.id : e.name))
                    .join("、");
                  if (name === i.type.split('$$$')[0]) {
                    o[rowArr[0]] = i.value;
                  }
                }
              });
            } else {
              if (v[i.data]) {
                const name = v[i.data]
                  .map((e) => (e.id ? e.id : e.name))
                  .join("、");
                if (name === i.type.split('$$$')[0]) {
                  v[i.data] = i.value;
                }
              }else{
                v[i.data] = i.value
              }
            }
          });
        }
      });
      this.clearBatchData();
      console.log(
        this.importData.secondImportData,
        "this.dataSourcethis.dataSource",
        this.filterList,
        "ddd",
        arr
      );
    }

    clearBatchData() {
      this.showBacthUpdate = false;
      this.batchList = [
        {
          type: undefined,
          value: undefined,
          data: undefined,
          dataItem: [],
          typeList: [],
        },
      ];
      this.filterList = [];
      this.initColumns();
      this.initTableData();
    }
  }
</script>

<style lang="less">
  .bacth-update-popover {
    width: calc(80% - 48px);
    z-index: 1000;
  }

  .error-user-batch {
    color: #f4454e;
  }

  .batch-updata-style {
    max-height: 250px;
    overflow-y: auto;
    overflow-x: hidden;

    .filters {
      margin: 15px;
    }
  }

  .add {
    margin-top: 8px;
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    margin-right: 24px;

    span {
      margin-right: 8px;
    }
  }

  .batch-update-new-data {
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 0 10px;
    min-height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .data-filter {
    width: 100%;
    // margin-left: 5px;
  }

  .data-select {
    width: 220px !important;
  }

  .filter-title {
    color: #000;
    opacity: 0.85;
    font-weight: 600;
  }

  .flex {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .import-err-modal {
    .line {
      border-bottom: 1px solid #e8e8e8;
      margin: 20px 0;
    }

    .title-flex {
      display: flex;
      justify-content: space-between;

      & > span {
        vertical-align: center;
        color: #f4454e;

        i {
          font-size: 14px;
        }

        &.success {
          color: #17bc94;
        }
      }
    }

    .title-tips {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      padding-right: 5px;
    }

    .fieldlab {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.64);
      font-weight: 500;
    }

    .title-tips {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      line-height: 24px;
    }

    .pagination-box {
      margin-top: 8px !important;
      text-align: right;
      padding: 8px 16px;
    }

    /deep/ .ant-pagination-total-text {
      margin-right: @base4-padding-md;
    }

    /deep/ .ant-pagination-options {
      height: 32px;
    }

    /deep/ .ant-modal-header {
      border-bottom: none;
    }

    /deep/ .ant-modal-body {
      padding-bottom: 8px;
    }

    /deep/ .ant-modal-footer {
      border-top: none;
    }

    .data-import-status-half {
      display: flex;

      p {
        line-height: @line-height-11;

        span {
          margin-left: 5px;
          color: rgba(0, 0, 0, 0.85);
        }

        i {
          font-size: @font-size-14;
        }

        .data-import-status--halfsuccess__tip {
          margin-top: 8px;
          padding-left: 32px;
          font-size: @font-size-14;
          color: rgba(0, 0, 0, 0.45);

          a {
            margin-left: 10px;
            color: @primary-color;
          }
        }

        &.data-import-status-half__success {
          margin-right: 24px;

          i {
            color: @success-color;
          }
        }

        &.data-import-status-half__error {
          a {
            color: #f4454e;
            text-decoration: underline
          }

          i {
            color: @error-color;
          }
        }
      }
    }
  }
</style>
