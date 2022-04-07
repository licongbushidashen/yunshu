<template>
  <div class="import-data-modal">
    <a-modal
      :title="'在线修正错误数据'"
      :visible="showDataFix"
      @cancel="handleCancel"
      width="80%"
      wrapClassName="import-data-fix"
    >
      <div class="import-data-fix--header clearfix">
        <span v-if="hasErrorStatus">
          <i class="icon-gap icon aufontAll h-icon-all-exclamation-circle"></i>
          请先修正人员、部门错误数据，再进行导入操作
        </span>
        <span class="success" v-else>
          <i class="icon-gap icon aufontAll h-icon-all-exclamation-circle"></i>
          已全部修改完成
        </span>
        <div>
          <a-button @click="BatchEdit" v-show="!isBatch">
            批量修正
          </a-button>
          <a-button @click="CancelBatchEdit" v-show="isBatch">
            取消批量修正
          </a-button>
        </div>
      </div>
      
      <h3-table
        :activeKey.sync="activeKeySync"
        :allowCheckAll="true"
        :checkbox="isBatch"
        :columns="columns"
        :dataSource="dataSource"
        :getColValue="getColValue"
        :multiple="true"
        :rowKey="rowKey"
        :selectedRowKeys.sync="selectedRowKeysSync"
        :theadStyle="theadStyle"
        @rowClick="row => $emit('rowClick', row)"
        class="import-data-fix-table"
      >
        <!-- 头部 -->
        <template :slot="col.slotTitle" v-for="col in mergeColumns">
          <div :key="col.slotTitle">
            {{ col.title }}
            <!-- 选人控件才修复-->
            <template
              v-if="isBatch && col.valueType && personType(col.valueType)"
            >
              <!-- 人员单选-->
              <span @click="showStaffAll(col)" class="icon-gap icon aufontAll h-icon-all-user-o"
                    v-if="col.valueType === 'RADIO_PERSON'"></span>
              <!-- 人员多选-->
              <span @click="showStaffAll(col)"
                    class="icon-gap icon aufontAll h-icon-all-team-o"
                    v-else-if="col.valueType === 'MULTI_SELECT_PERSON'"></span>
              
              <span @click="showStaffAll(col)"
                    class="icon-gap icon aufontAll h-icon-all-department-single-se"
                    v-else-if="col.valueType === 'RADIO_DEPARTMENT'"></span>
              
              <span @click="showStaffAll(col)"
                    class="icon-gap icon aufontAll h-icon-all-department-multiple-"
                    v-else-if="col.valueType === 'MULTI_SELECT_DEPARTMENT'"></span>
              
              <span @click="showStaffAll(col)" class="icon-gap icon aufontAll h-icon-all-user-list-o" v-else></span>
            
            </template>
          </div>
        </template>
        
        <!--表体-->
        <template
          :slot="col.key"
          slot-scope="{value, row, index, colStylesObj}"
          v-for="(col, idx) in columns"
        >
          <!--子表-->
          <template v-if="col.children.length > 0">
            <H3ChildTable
              :class="['last']"
              :colStylesObj="colStylesObj"
              :columns="col.children"
              :dataSource="value"
              :key="col.key"
              :parentKey="col.key"
              :tbodyStyle="tbodyStyle"
              :theadStyle="theadStyle"
            >
              <template
                :slot="childCol.key"
                slot-scope="{colValue}"
                v-for="(childCol, Index) in col.children"
              >
                <template v-if="childCol.node">
                  <span :key="Index" :title="colValue ? colValue.value : ''">{{
                    formatOf(
                      childCol.modelPropInfo,
                      colValue ? colValue.value : '',
                    )
                  }}</span>
                </template>
              </template>
            </H3ChildTable>
          </template>
          
          <!--非子表-->
          <template v-else>
            <template v-if="col.node">
              <span
                :key="idx"
                :title="formatOf(col.modelPropInfo, value ? value.value : '')"
              >
                {{ formatOf(col.modelPropInfo, value ? value.value : '') }}
              </span>
              <!--错误提示-->
              <div
                :key="col.key"
                :title="formatOf(col.modelPropInfo, value ? value.value : '')"
                class="import-error"
              >
                <span
                  class="not-exist-person"
                  v-if="value && value.notExists && value.notExists.length > 0"
                >
                  <a-tooltip>
                    <template slot="title">
                      <div class="import-error-tips">
                        <div class="import-error-tips--left">
                          不存在
                        </div>
                        <div class="import-error-tips--right">
                          <span
                            :key="idex"
                            class="not-exist-person"
                            v-for="(inner, idex) in value.notExists"
                          >{{ inner }}&nbsp;</span>
                        </div>
                      </div>
                    </template>
                    不存在
                  </a-tooltip>
                </span>
                
                <span
                  class="not-exist-person"
                  v-else-if="value && value.repeats && value.repeats.length > 0"
                >
                  <a-tooltip>
                    <template slot="title">
                      <div class="import-error-tips">
                        <div class="import-error-tips--left">
                          重复
                        </div>
                        <div class="import-error-tips--right">
                          <span
                            :key="idex"
                            v-for="(inner, idex) in value.repeats"
                          >{{ inner }}&nbsp;</span>
                        </div>
                      </div>
                    </template>
                    重复
                  </a-tooltip>
                </span>
                
                <span
                  class="not-exist-person"
                  v-else-if="value && value.requiredWithNull"
                >必填数据丢失</span>
                <template
                  v-if="!isBatch && value && personType(value.valueType)"
                >
                  <!--人员单选-->
                  <span @click="showStaff(value, row[col.key])" class="icon-gap icon aufontAll h-icon-all-user-o"
                        v-if="value.valueType === 'RADIO_PERSON'"></span>
                  
                  <!--人员多选-->
                  <span @click="showStaff(value, row[col.key])"
                        class="icon-gap icon aufontAll h-icon-all-team-o"
                        v-if="value.valueType === 'MULTI_SELECT_PERSON'"></span>
                  
                  <span @click="showStaff(value, row[col.key])"
                        class="icon-gap icon aufontAll h-icon-all-department-single-se"
                        v-if="value.valueType === 'RADIO_DEPARTMENT'"></span>
                  
                  <span @click="showStaff(value, row[col.key])"
                        class="icon-gap icon aufontAll h-icon-all-department-multiple-"
                        v-if="value.valueType === 'MULTI_SELECT_DEPARTMENT'"></span>
                  
                  <span @click="showStaff(value, row[col.key])" class="icon-gap icon aufontAll h-icon-all-user-list-o"
                        v-else></span>
                
                </template>
              </div>
            </template>
          </template>
        </template>
      </h3-table>
      
      <div class="import-data-fix--footer clearfix">
        <a-pagination
          :defaultPageSize="10"
          :pageSizeOptions="pageSizeOptions"
          :showTotal="total => `共${totalElements}条`"
          :total="totalElements"
          @change="pageChange"
          @showSizeChange="showSizeChange"
          showQuickJumper
          showSizeChanger
          size="small"
        />
      </div>
      <template slot="footer">
        <a-button @click="handleCancel">
          取消
        </a-button>
        <a-button
          :disabled="hasErrorStatus"
          @click="handleImportFixed"
          type="primary"
        >
          导入
        </a-button>
      </template>
      <!-- 选人控件-->
      <div>
        <staff-selector
          :options="deptOpts"
          @cancel="handleCancelStaff"
          @change="changeSelect"
          @ok="changeSelect"
          class="user-info-staff"
          v-model="currentSelect"
        />
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
  /* eslint-disable vue/no-template-shadow */
  /* eslint-disable vue/no-unused-vars */
  /* eslint-plugin-vue-disable vue/custom-event-name-casing */

  import {Component, Prop, Vue,} from 'vue-property-decorator';
  import {Button, Modal, Pagination, Tooltip,} from '@h3/antd-vue';
  import H3Table from './h3-table.vue';
  import H3ChildTable from './h3-child-table.vue';
  import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";


  import {formatOf} from './model-value-service';
  import {ModelPropertyValueType} from './model-client';

  // import { register, DesignerNodeDto } from '@cloudpivot-shared/ui-designer-common';
  // import { widgetStore } from '@cloudpivot-shared/ui-designer-widgets';
  @Component({
    components: {
      AModal: Modal,
      H3Table,
      H3ChildTable,
      AButton: Button,
      APagination: Pagination,
      ATooltip: Tooltip,
      StaffSelector,
    },
  })
  export default class ImportDataFix extends Vue {
    @Prop()
    node!: any;

    @Prop()
    showDataFix!: boolean;

    @Prop()
    dataList!: any[];

    @Prop({
      default: () => [],
    })
    dataItems!: any[];

    @Prop()
    importData!: any;

    formatOf = formatOf;

    hasError = true;

    selectedRowKeysSync: any = [];

    activeKeySync = '';

    rowKey = 'document';

    currentSelect: any = [];

    colStylesObj: any = [];

    currentClick: any = {};

    deptOpts: any = {
      selectOrg: false,
      selectUser: true,
      showModel: false,
      mulpitle: false,
      showSelect: false,
      placeholder: '请选择',
    };

    // 分页
    page = 1;

    size = 10;

    totalElements = 0;

    children: any[] = [];

    dataSource: any[] = [];

    allowCheckAll = false;

    isBatch = false;

    mulpitle = false; // 是否多选

    pageChange(page: number, pageSize: number) {
      this.page = page;
      this.size = pageSize;
      this.pagination();
    }

    showSizeChange(current: number, size: number) {
      this.page = 1;
      this.size = size;
      this.pagination();
    }

    pageSizeOptions: string[] = ['10', '20', '50', '100'];

    created() {
      console.log(this.importData, 'ddd')
      this.totalElements = this.importData.secondImportData.length;
      this.children = this.importData.headColumns;
      this.pagination();
    }

    pagination() {
      const start = (this.page - 1) * this.size;
      const end = this.page * this.size;
      this.dataSource = this.importData.secondImportData.slice(start, end);
    }

    // 取消修正数据
    handleCancel() {
      this.$emit('closeDataFix');
    }

    checkValueType(value: any) {
      return Object.prototype.toString
        .call(value)
        .split(' ')[1]
        .toLocaleLowerCase()
        .slice(0, -1);
    }

    // 修正数据后导入
    handleImportFixed() {
      // console.log(this.dataList, 'this.dataList');
      const list: any = [];
      this.dataList.map((inner: any) => {
        const values: any = Object.values(inner);
        values.forEach((item: any) => {
          if (item.value) {
            const type = this.checkValueType(item.value);
            if (type !== 'string') {
              item.value = JSON.stringify(item.value);
            }
          }
        });
        list.push(values);
      });
      // console.log(list, 'dataList');
      // list.forEach((item:any) => {})
      this.$emit('handleImportFixed', list);
    }

    // 选人控件-单个/多个/部门/多选部门/混选
    showStaff(item: any, col: any) {
      this.selectType(item);
      this.deptOpts.showModel = !this.deptOpts.showModel;
      this.currentClick = col; // 存储当前列的值
      if (item.value && item.value.length > 0) {
        if (item.notExists && item.notExists.length > 0) {
          this.currentSelect = null; // 选中的值
        } else {
          this.currentSelect = item.value; // 选中的值
        }
        // if (item.value.length > 1) {
        //   this.currentSelect = item.value; // 选中的值
        // } else {
        //   this.currentSelect = item.value; // 选中的值
        // }
      } else {
        this.currentSelect = null; // 选中的值
      }
    }

    // 选人控件-批量
    showStaffAll(col: any) {
      if (this.selectedRowKeysSync.length === 0) {
        return this.$message.error('请先在左侧选择修改的数据行', 3);
      }
      if (this.dataSource.length > 0) {
        // 获取第一条作为默认选中数据
        const currentValue: any = this.dataSource[0];
        if (currentValue[col.key].notExists && currentValue[col.key].notExists.length > 0) {
          this.currentSelect = null; // 选中的值
        } else {
          this.currentSelect = currentValue[col.key].value;
        }
      } else {
        this.currentSelect = null; // 选中的值
      }
      this.selectType(col);
      this.deptOpts.showModel = !this.deptOpts.showModel;
      this.currentClick = col; // 存储当前列的值
    }

    selectType(item: any) {
      this.mulpitle = false;
      if (item.valueType === ModelPropertyValueType.RADIO_DEPARTMENT) {
        // 部门单选
        this.deptOpts.selectOrg = true;
        this.deptOpts.selectUser = false;
        this.deptOpts.mulpitle = false;
      } else if (item.valueType === ModelPropertyValueType.RADIO_PERSON) {
        // 人员单选
        this.deptOpts.selectOrg = false;
        this.deptOpts.selectUser = true;
        this.deptOpts.mulpitle = false;
      } else if (
        item.valueType === ModelPropertyValueType.MULTI_SELECT_DEPARTMENT
      ) {
        // 部门多选
        this.deptOpts.selectOrg = true;
        this.deptOpts.selectUser = false;
        this.deptOpts.mulpitle = true;
        this.mulpitle = true;
      } else if (item.valueType === ModelPropertyValueType.MULTI_SELECT_PERSON) {
        // 人员多选
        this.deptOpts.selectOrg = false;
        this.deptOpts.selectUser = true;
        this.deptOpts.mulpitle = true;
        this.mulpitle = true;
      } else if (
        item.valueType === ModelPropertyValueType.PERSON_DEPARTMENT_SELECT
      ) {
        // 混选
        this.deptOpts.selectOrg = true;
        this.deptOpts.selectUser = true;
        this.deptOpts.mulpitle = true;
        this.mulpitle = true;
      }
    }

    // 取消选人
    handleCancelStaff() {
      this.deptOpts.showModel = false;
      this.deptOpts.selectOrg = false;
      this.deptOpts.selectUser = true;
      this.mulpitle = false;
      this.deptOpts.mulpitle = false;
    }

    // 确定选人
    changeSelect(payload: any) {
      const value = payload.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
      }));

      /**
       * @Description: 如果选择修改的等于原来的 则不修改
       * @author AoFei Zhu
       * @date 2020-10-23 11:44:28
       */
      if (!this.isBatch) {
        this.currentClick.value = value;
        this.currentSelect = value;
        this.currentClick.repeats = [];
        this.currentClick.notExists = [];
        this.currentClick.requiredWithNull = false;
      } else {
        const obj: any = value;
        this.dataSource
          .filter((item: any) =>
            this.selectedRowKeysSync.includes(item[this.rowKey]),
          )
          .forEach((inner: any) => {
            inner[this.currentClick.key].value = obj;
            inner[this.currentClick.key].repeats = [];
            inner[this.currentClick.key].notExists = [];
            inner[this.currentClick.key].requiredWithNull = false;
          });
      }
    }

    // 批量编辑
    BatchEdit() {
      this.isBatch = true;
      this.selectedRowKeysSync = [];
    }

    // 取消批量编辑
    CancelBatchEdit() {
      this.isBatch = false;
      this.selectedRowKeysSync = [];
      this.currentClick = {};
    }

    // 选人控件类型
    get personType() {
      return function (val: any) {
        if (
          val === ModelPropertyValueType.RADIO_DEPARTMENT ||
          val === ModelPropertyValueType.MULTI_SELECT_DEPARTMENT ||
          val === ModelPropertyValueType.RADIO_PERSON ||
          val === ModelPropertyValueType.MULTI_SELECT_PERSON ||
          val === ModelPropertyValueType.PERSON_DEPARTMENT_SELECT
        ) {
          return true;
        } else {
          return false;
        }
      };
    }

    getColValue(col: any, row: any) {
      if (!row) {
        return null;
      }

      const fk = col.fromAssociationPropKey;
      if (fk) {
        const value = row[fk];
        return Array.isArray(value) && value.length > 0
          ? value[0][col.key]
          : null;
      } else {
        const key = col.key as string;
        if (key.includes('.')) {
          const segs = key.split('.');
          let temp = row;
          for (const seg of segs) {
            temp = temp[seg];
            if (temp === undefined || temp === null) {
              return null;
            }
          }
          return temp;
        } else {
          return row[key];
        }
      }
    }

    // 重新序列化表头
    get mergeColumns() {
      const arr: any = [];
      this.columns.forEach((res: any) => {
        const obj = Object.assign({}, res);
        if (res.children && res.children.length > 0) {
          res.children.forEach((item: any) => {
            const _obj = Object.assign({}, item);
            delete _obj.children;
            arr.push(_obj);
          });
        } else {
          delete obj.children;
          arr.push(obj);
        }
      });
      // console.log(arr, 'arr');
      return arr;
    }

    // 序列化列
    get columns() {
      // const fixData:any = this.dataList[0];
      // const filterChild:any = this.children.filter((item:any) => {
      //   for (let i in fixData) {
      //     if (item.props.key === i) {
      //       return true;
      //     }
      //   }
      // });
      // console.log(filterChild, 'filterChild');
      const cols = this.children.map((node: any) => {
        const col = node;
        const input = '';

        const tableCol = {
          key: node.id,
          title: col.name,
          width: col.width || 150,
          align: col.align,
          ellipsis: col.ellipsis,
          fixed: col.fixed,
          valueType: 0,
          scopedSlots: {customRender: node.id},
          slotTitle: `${node.id}Title`,
          node,
          input,
          children: node.childColumns ? this.initColumns(node.childColumns, col.id) : [],
        };

        return tableCol;
      });
      // console.log(cols, 'columns');
      return cols;
    }

    initColumns(childIds: string[], parentKey: string) {
      if (childIds.length > 1) {
        return childIds.map((col: any) => {
          const input = '';
          const tableCol: any = {
            key: col.id,
            title: col.name,
            width: col.width || 150,
            align: col.align,
            ellipsis: col.ellipsis,
            fixed: col.fixed,
            valueType: 0,
            scopedSlots: {customRender: col.id},
            slotTitle: `${col.id}Title`,
            node: col,
            input,
            children: col.childColumns ? this.initColumns(col.childColumns, col.id) : [],
          };
          return tableCol;
        });
      } else {
        return [];
      }
    }

    // get dataItems() {
    //   return getDataItems(this.node) || [];
    // }
    get tbodyStyle() {
      return {
        height: '',
        backgroundColor: '',
        color: '',
        fontSize: '',
        fontFamily: '',
        textAlign: '',
        textIndent: '',
        alignItems: '',
      };
    }

    get theadStyle() {
      return {};
    }

    // 判断是否有错误
    get hasErrorStatus() {
      const list: any = [];
      this.dataList.forEach((item: any) => {
        // console.log(Object.values(item), 'item');
        const values: any = Object.values(item);
        values.forEach((inner: any) => {
          if (
            (Array.isArray(inner.notExists) && inner.notExists.length > 0) ||
            (Array.isArray(inner.repeats) && inner.repeats.length > 0) ||
            inner.requiredWithNull
          ) {
            list.push(inner);
          }
        });
      });
      if (list.length > 0) {
        return true;
      } else {
        return false;
      }
    }
  }
</script>

<style lang="less">
  .import-data-fix {
    .ant-modal-body {
      padding-top: 0;
      padding-bottom: 0;
    }
    
    &--header {
      & > span {
        vertical-align: center;
        color: #f4454e;
        line-height: 52px;
        
        &.success {
          color: #17bc94;
        }
      }
      
      & > div {
        float: right;
        padding: 10px 0;
      }
    }
    
    &--footer {
      .ant-pagination {
        float: right;
      }
      
      padding: 14px 0;
    }
    
    &-table {
      .sheet__head {
        .sheet__col {
          & > div {
            width: 100%;
            
            .icon {
              float: right;
              margin-top: 2px;
              color: @primary-color;
              cursor: pointer;
            }
          }
        }
      }
      
      & > .sheet {
        & > .sheet__body {
          max-height: 500px;
          overflow-y: auto;
        }
      }
      
      .sheet__body {
        .sheet__cols {
          .sheet__col {
            & > span {
              display: inline-block;
              width: 80%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            
            position: relative;
            
            .import-error {
              position: absolute;
              text-align: center;
              width: 100%;
              margin: 0 -8px;
              
              .icon {
                float: right;
                color: @primary-color;
                margin-top: 4px;
                margin-right: 8px;
              }
              
              & > span {
                display: inline-block;
                background: #fff1f0;
                border: 1px solid #ffa39e;
                border-radius: 10px;
                cursor: pointer;
                padding: 0 8px;
                color: #fb9b96;
                margin-right: 8px;
                
                &:hover {
                  border: 1px solid #f4454e;
                  color: #f4454e;
                }
              }
              
              .not-exist-person {
                width: auto;
              }
            }
          }
        }
      }
    }
    
    .ant-dropdown-trigger {
      display: none;
    }
  }
  
  .ant-tooltip {
    .import-error-tips {
      padding: 12px;
      display: flex;
      
      &--right {
        color: rgba(255, 255, 255, 0.85);
        margin-left: 16px;
      }
    }
  }
  
  .ant-modal-footer .ant-btn-primary:disabled {
    color: rgba(0, 0, 0, 0.45);
  }
  
  //
</style>
