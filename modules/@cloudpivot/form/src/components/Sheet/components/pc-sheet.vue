<template>
  <h3-panel
    v-if="control.columns.length > 0"
    v-show="display"
    :title="!canFull ? label : ''"
    :collapsible="true"
    :labelStyle="style"
    :iconRight="true"
    :tips="tips"
    :class="{ required: control.required , titleHidden: titleVisible === false }"
  >
    <a-divider v-if="(!readonly || canExport) && !canFull" />

    <slot name="settingTips" />

    <template slot="fullIcon" v-if="!canFull">
      <a-tooltip placement="top">
        <template slot="title">
          <span>{{ $t("cloudpivot.form.runtime.biz.fullScreen") }}</span>
        </template>
        <span @click="$emit('fullScreen')" class="fullscreen icon aufontAll">&#xe8e5;</span>
      </a-tooltip>
    </template>

    <div class="actions" v-if="(!readonly || canExport) && !canFull">
      <template>
        <a-button
          icon="plus"
          type="primary"
          v-if="!readonly && canEdit"
          @click="add"
        >{{ $t("cloudpivot.form.runtime.biz.add") }}</a-button>

        <a-button
          icon="download"
          @click="importRelevance"
          v-if="!readonly && importFormRelevanceForm && canEdit"
        >
          {{
          $t("cloudpivot.form.runtime.biz.importFormRelevanceForm")
          }}
        </a-button>

        <a-button
          icon="download"
          @click="importSheet"
          v-if="!readonly && importAble && canEdit"
        >{{ $t("cloudpivot.form.runtime.biz.import") }}</a-button>

        <a-button v-if="canExport"
                  icon="upload"
                  :disabled="canEdit"
                  @click="exportSheet">
          {{ $t("cloudpivot.form.runtime.biz.export") }}
        </a-button>

        <a-button
          icon="edit"
          v-if="!readonly && canEdit && getshowAllEdit"
          @click="allEdit"
          :disabled="!canEdits"
        >{{ $t("cloudpivot.form.runtime.biz.edit") }}</a-button>

        <a-button
          icon="delete"
          v-if="!readonly && canEdit"
          @click="removeChecked"
          :disabled="!canDelete"
        >{{ $t("cloudpivot.form.runtime.biz.delete") }}</a-button>

        <!-- 筛选 S -->
        <filterCard
          @clear="onReset"
          v-if="queryConditionSource.length === 1"
          :source="queryConditionSource"
        />
        <filterCard
          class="mr"
          @item-click="toggleQuery"
          @clear="onReset"
          v-else-if="queryConditionSource.length > 1"
          :source="queryConditionSource"
        />
        <a-tooltip v-if="queryConditionSource.length <= 1&&sheetFiters.length>0">
          <template slot="title">{{ $t("cloudpivot.list.pc.Screen") }}</template>
          <i
            class="icon aufontAll h-icon-all-filter-o"
            :style="`color:${isShowQueryItem ? '#2970ff':''};float: right;`"
            @click="toggleQuery"
          ></i>
        </a-tooltip>
        <!-- 筛选 E -->

        <template v-for="act in sheetCustomActions">
          <a-button
            :key="act.code"
            v-show="act.visible"
            :disabled="act.disabled"
            @click="customBtnclick(act.code)"
          >{{ act.text }}</a-button>
        </template>
      </template>
    </div>

    <div class="actions heard" v-if="canFull">
      <h3>{{ label }}</h3>
      <div  style="padding-right: 34px">
        <template v-if="!readonly || canExport">
          <a-button
            icon="plus"
            type="primary"
            v-if="!readonly && canEdit"
            @click="add"
          >{{ $t("cloudpivot.form.runtime.biz.add") }}</a-button>

          <a-button
            icon="download"
            @click="importRelevance"
            v-if="!readonly && importFormRelevanceForm && canEdit"
          >
            {{
            $t("cloudpivot.form.runtime.biz.importFormRelevanceForm")
            }}
          </a-button>
          <a-button
            icon="download"
            @click="importSheet"
            v-if="!readonly && importAble && canEdit"
          >{{ $t("cloudpivot.form.runtime.biz.import") }}</a-button>

          <a-button icon="upload"
                    v-if="canExport"
                    @click="exportSheet"
                    :disabled="isEdit">
            {{ $t("cloudpivot.form.runtime.biz.export") }}
          </a-button>

          <a-button
            icon="edit"
            v-if="!readonly && canEdit && getshowAllEdit"
            @click="allEdit"
            :disabled="!canEdits"
          >{{ $t("cloudpivot.form.runtime.biz.edit") }}</a-button>
          <a-button
            icon="delete"
            v-if="!readonly && canEdit"
            @click="removeChecked"
            :disabled="!canDelete"
          >{{ $t("cloudpivot.form.runtime.biz.delete") }}</a-button>

          <!-- 筛选 S -->
          <filterCard
            @clear="onReset"
            v-if="queryConditionSource.length === 1"
            :source="queryConditionSource"
          />
          <filterCard
            class="mr"
            @item-click="toggleQuery"
            @clear="onReset"
            v-else-if="queryConditionSource.length > 1"
            :source="queryConditionSource"
          />
          <a-tooltip v-if="queryConditionSource.length <= 1&&sheetFiters.length>0">
            <template slot="title">{{ $t("cloudpivot.list.pc.Screen") }}</template>
            <i
              class="icon aufontAll h-icon-all-filter-o"
              :style="`color:${isShowQueryItem ? '#2970ff':''};margin-left: 10px;`"
              @click="toggleQuery"
            ></i>
          </a-tooltip>
          <!-- 筛选 E -->

          <template v-for="act in sheetCustomActions">
            <a-button
              :key="act.code"
              v-show="act.visible"
              :disabled="act.disabled"
              @click="customBtnclick(act.code)"
            >{{ act.text }}</a-button>
          </template>
        </template>
        <a-tooltip placement="top">
          <template slot="title">
            <span>{{ $t("cloudpivot.form.runtime.biz.smallScreen") }}</span>
          </template>
          <span @click="$emit('fullScreen')" class="fullscreen icon aufontAll">&#xe8e7;</span>
        </a-tooltip>
      </div>
    </div>

    <import-modals
      v-if="showModal"
      :visible="showModal"
      @cancel="handleCancel"
      @importFinishe="importFinishe"
      @repeatErrorHandle="repeatErrorHandle"
      :params="sheetParams"
      :sheet="control"
      ref="importModals"
    />
    <use-repeat-modals
      :importData="importData"
      v-model="showRepeatModal"
      :status="importStatu.status"
      :successNum="importStatu.successNum"
      :failNum="importStatu.failNum"
      :fileName="importStatu.fileName"
      @cancel="closeRepeatModal"
      @editFinishe="editFinishe"
    />
    <a-spin :spinning="importDataNum && !(importDataNum === total)">
      <div class="filters-box" v-show="isShowQueryItem">
        <sheet-filter
          ref="sheetFilter"
          :data="sheetFiters"
          :searchs="queryData"
          :datatype="datatype"
          @reset="onReset"
          @search="onSearch"
          @hide="hideQueryItem"
        />
      </div>
      <sheet
        ref="sheet"
        :rowNumber="pageStart"
        :checkbox="(canEdit && !readonly) || canExport"
        :showAction="!readonly&&canEdit"
        :showTotal="controlOpts.showTotal"
        :columns="control.columns"
        :columnOptions="columnOptions"
        :rows="pagingRows"
        :stats="statisticsMap"
        :checkeds="pagingCheckeds"
        :class="{ fullsheet: canFull }"
        :frozenKeys="frozenKeys"
        @check="onCheck"
        @checkAll="onCheckAll"
        @columnResize="onColumnResize"
        @freezeColumn="onFreezeColumn"
      >
        <template slot="action" slot-scope="{ row, index }">
          <a-popover overlayClassName="sheet-menus" trigger="click" v-if="canEdit">
            <template slot="content" v-if="canEdit">
              <ul class="row-menus _form-sheet" >
                <li
                  v-if="canEdit"
                  @click="copy(index, row)"
                  :title="$t('cloudpivot.form.renderer.copy')"
                >{{ $t("cloudpivot.form.renderer.copy") }}</li>
                <li
                  v-if="canEdit"
                  @click="clear(index)"
                  :title="$t('cloudpivot.form.renderer.sheet.clearRow')"
                >{{ $t("cloudpivot.form.renderer.sheet.clearRow") }}</li>
                <li
                  v-if="canEdit"
                  @click="add(index)"
                  :title="$t('cloudpivot.form.renderer.sheet.addBefore')"
                >{{ $t("cloudpivot.form.renderer.sheet.addBefore") }}</li>
                <li
                  v-if="canEdit"
                  @click="add(index + 1)"
                  :title="$t('cloudpivot.form.renderer.sheet.addAfter')"
                >{{ $t("cloudpivot.form.renderer.sheet.addAfter") }}</li>
              </ul>
            </template>
            <a-icon class="ellipsis" type="ellipsis" />
          </a-popover>
        </template>
      </sheet>
    </a-spin>

    <div class="pagination" v-show="total > 20">
      <a-pagination
        :current="pageIndex"
        :total="total"
        :showTotal="(total) => $t('cloudpivot.list.pc.Total', { num: total })"
        :pageSize="pageSize"
        :pageSizeOptions="pageSizeOptions"
        showSizeChanger
        showQuickJumper
        @change="onPageIndexChange"
        @showSizeChange="onPageSizeChange"
      />
    </div>

    <a-modal
      :title="formTitle"
      :visible="isShowRelevance"
      :width="'850px'"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      :class="{ 'relevance-form': true }"
      @ok="onModalOk"
      @cancel="onModalCancel"
    >
      <list-selector
        v-model="selected"
        :listCode="queryCode"
        :schemaCode="schemaCode"
        :cols="2"
        :columns="columns"
        :showActions="false"
        :query="query"
        :defuaultShowSearch="false"
        :multiple="true"
      ></list-selector>
      <!-- @change="onListChange" -->
    </a-modal>

    <!-- 批量编辑 -->
    <a-modal
      :visible="showModal2"
      :width="'600px'"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      :class="{ 'relevance-form': true }"
      @ok="onshowModal2"
      @cancel="showModal2 = false,showModalLength = 0"
    >
      <template slot="title">
        {{$t('cloudpivot.form.runtime.biz.edit')}}
        <span
          style="font-size: 12px;color: rgba(0, 0, 0, 0.45);line-height: 22px;margin-left:16px;"
        >本次操作将修改{{showModalLength}}条数据</span>
      </template>
      <all-edit :data="sheet.columns" ref="allEdit" @change="alledits"></all-edit>
    </a-modal>
  </h3-panel>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch, Inject } from 'vue-property-decorator';

import {
  FormControlValueService,
  ReverseQueryService,
} from '@cloudpivot/form/src/common/services';

import { RendererFormControl, FormControlType } from '@cloudpivot/form/schema';

import BaseControlAdapter from '@cloudpivot/form/src/renderer/components/pc/base-control-adapter.vue';
import filterCard from '@cloudpivot/list/src/components/pc/components/filter-card/filter-card.vue';
// import * as typings from "../../../typings";

import * as schema from '@cloudpivot/form/schema';

import { FormBuilderHelper } from '@cloudpivot/form/src/renderer/controls/form-builder-helper';

import ImportModals from '@cloudpivot/form/src/common/components/import-data/import.vue';

import UseRepeatModals from '@cloudpivot/form/src/common/components/import-data/usename-repeat/index.vue';

import sheetFilter from '@cloudpivot/form/src/common/components/import-data/sheet-filter/index.vue';

import common from '@cloudpivot/common/pc';
import moment from 'moment'

import { FormSheetControl } from '@cloudpivot/form/src/common/controls/form-sheet-control';

import { UploadControl } from '@cloudpivot/form/src/common/controls/upload-control';

import { RelevanceFormControl } from '@cloudpivot/form/src/common/controls/relevance-form-control';

import numberFilter from '@cloudpivot/form/utils/number-filter';

import { listApi } from '@cloudpivot/api';

import {
  Popover,
  Divider,
  Button,
  Checkbox,
  Tooltip,
  Icon,
  Modal,
  Pagination,
  Spin,
} from '@h3/antd-vue';

import Sheet from './pc-sheet';
import { ColumnResize } from './pc-sheet';
import SheetComp from './sheet.vue';
import alledit from './alledit.vue';
import * as typings from '@cloudpivot/form/schema';
export interface SheetColumnResize extends ColumnResize {
  sheet: schema.FormSheet;
}

@Component({
  name: 'form-sheet',
  components: {
    AllEdit: alledit,
    sheetFilter: sheetFilter,
    filterCard: filterCard,
    AModal: Modal,
    AIcon: Icon,
    APopover: Popover,
    ADivider: Divider,
    AButton: Button,
    ACheckbox: Checkbox,
    ATooltip: Tooltip,
    APagination: Pagination,
    ASpin: Spin,
    BaseControlAdapter,
    ImportModals,
    UseRepeatModals,
    H3Panel: common.components.Panel,
    H3SizeSlider: common.components.H3SizeSlider,
    Sheet: SheetComp,
  },
  filters: {
    number: numberFilter,
  },
})
export default class FormSheet extends FormSheetControl {
  @Prop({
    default: false,
  })
  canFull!: boolean;

  @Prop()
  formPermission!: any;

  @Inject()
  emitSheetColumnResize!: (data: SheetColumnResize) => void;

  isFullScreen = false;

  // 分页配置项
  pageSizeOptions = ['10', '20', '50', '100', '200', '300'];

  pageSize = 20;

  pageIndex = 1;

  sheetImport = '22';

  importDataNum = null;

  get canDelete() {
    return this.checkeds.some((c) => c);
  }

  get canEdits() {
    return this.checkeds.some((c) => c);
  }

  get total() {
    return this.rows.length;
  }

  get pageStart() {
    const start = (this.pageIndex - 1) * this.pageSize;
    return start;
  }

  get pageEnd() {
    let end = this.pageIndex * this.pageSize;
    if (end > this.total) {
      end = this.total;
    }
    return end;
  }

  get pagingRows() {
    return this.rows.slice(this.pageStart, this.pageEnd);
  }

  get pagingCheckeds() {
    return this.checkeds.slice(this.pageStart, this.pageEnd);
  }

  get titleVisible(){
    return this.control.options.labelVisible;
  }

  @Prop({
    default: () => [],
  })
  frozenKeys!: string[];

  @Watch('isEdit')
  onIsEditChange() {
    // this.$set(this.control,'edit',!this.readonly);
    super.edit();
  }

  setControl() {
    const ctrl = this.getCtrl();
    if (!ctrl) {
      return;
    }

    sessionStorage.removeItem('sheet-' + this.id);

    this.reset();

    super.listenPropertyChange();

    this.initRows(this.canFull, 'pc');

    super.initStat();

    this.checkeds = this.rows.map(() => false);

    super.listenRowChange();

    if (this.canFull && this.control.edit) {
      super.edit();
    }
  }

  onCheck(checkeds: boolean[]) {
    this.checkeds.splice(
      this.pageStart,
      this.pageEnd - this.pageStart,
      ...checkeds
    );
  }

  onCheckAll(check: boolean) {
    this.checkeds = this.checkeds.map(() => check);
  }

  onColumnResize(data: SheetColumnResize) {
    if (this.emitSheetColumnResize) {
      data.sheet = this.sheet;
      this.emitSheetColumnResize(data);
    }
  }

  onFreezeColumn(columnKey: string, freeze: boolean) {
    this.$emit('freezeColumn', columnKey, freeze);
  }

  onPageIndexChange(page: number, size: number) {
    this.pageIndex = page;
  }

  onPageSizeChange(page: number, size: number) {
    this.pageIndex = 1;
    this.pageSize = size;
  }

  showModal2: boolean = false;

  showModalLength: number = 0;

  // 批量编辑
  allEdit() {
    console.log(this.sheet, 'sheet');
    let indexs: number[] = [];
    for (let i = 0; i < this.checkeds.length; i++) {
      let s = this.checkeds[i];
      if (s) {
        indexs.push(i);
      }
    }
    this.showModalLength = indexs.length;
    this.showModal2 = true;
  }

  // 批量编辑确认
  onshowModal2() {
    (this.$refs['allEdit'] as any).emits();
  }

  // 批量编辑
  alledits(value: any) {
    console.log(value);
    this.showModal2 = false;
    this.showModalLength = 0;
    if (Object.values(value).length) {
      let indexs: number[] = [];
      for (let i = 0; i < this.checkeds.length; i++) {
        let s = this.checkeds[i];
        if (s) {
          indexs.push(i);
        }
      }
      try {
        this.rows.forEach((d: any, i: number) => {
          if (indexs.indexOf(i) > -1) {
            Object.keys(value).forEach((k) => {
              d.forEach((s) => {
                if (value[k].key === s.key) {
                  if ([1, 2, 4, 5, 6, 7, 19].indexOf(s.type) > -1) {
                    // 短文本,长文本,数值,单选,复选,下拉
                    if (s.type === 4) {
                      // 数值
                      console.log('value[k].value==>', value[k].value)
                      s.controller.value = value[k].value * 1
                    } else {
                      s.controller.value = value[k].value;
                    }
                  } else if (s.type === 3) {
                    // 日期
                    s.controller.value = new Date(value[k].value);
                  }
                }
              });
            });
          }
        });
        this.$message.success(
          `${
            (this as any).$i18n.locale === 'zh'
              ? '操作成功'
              : 'Successful operation'
          }`
        );
      } catch (error) {
        this.$message.error(
          `${
            (this as any).$i18n.locale === 'zh'
              ? '操作失败'
              : 'operation failed'
          }`
        );
      }
    }
  }

  removeChecked() {
    this.importDataNum = null;
    let indexs: number[] = [];
    let indexCopy: number[] = [];
    for (let i = 0; i < this.checkeds.length; i++) {
      let s = this.checkeds[i];
      let row: any = this.rows[i];
      if (s && i < this.rows.length) {
        indexs.push(row[0].controller.options.rowIndex);
        indexCopy.push(i);
      }
    }
    this.removeRows(indexs);

    // 子表筛选过后处理逻辑
    if (indexs.join() !== indexCopy.join()) {
      indexCopy
        .sort((a, b) => a - b)
        .reverse()
        .forEach((d: number) => {
          this.rows.splice(d, 1);
        });
      this.onCheckAll(false);
    }
    if (this.pagingRows.length === 0) {
      this.pageIndex = 1;
    }
  }

  copy(idx: number, row: any) {
    this.importDataNum = null;
    super.copy(idx, row);
  }

  add(idx?: number, vals?: any) {
    this.importDataNum = null;
    const row =
      typeof idx === 'number' ? this.addRow(vals, idx) : this.addRow(vals);
  }

  splice(idx: number) {
    this.removeRow(idx);
  }

  rowInserted(index: number, row: RendererFormControl[]): void {
    this.importDataNum = null;
    this.checkeds.splice(index, 0, false);
    if (this.control.edit) {
      super.edit();
    }
    this.syncScroll();
  }

  rowRemoved(index: number, row: RendererFormControl[]) {
    this.importDataNum = null;
    this.checkeds.splice(index, 1);
  }

  rowsInserted(index: number, rows: RendererFormControl[][]): void {
    this.importDataNum = null;
    const news = rows.map(() => false);
    this.checkeds.splice(index, 0, ...news);
    if (this.control.edit) {
      super.edit();
    }
    this.syncScroll();
  }

  rowsRemoved(indexs: number[]) {
    this.importDataNum = null;
    for (const index of indexs) {
      this.checkeds.splice(index, 1);
    }
  }

  syncScroll() {
    this.$nextTick(() => {
      const $sheet = this.$refs.sheet as Sheet;
      if ($sheet) {
        $sheet.syncScrollLeft();
        $sheet.handleRootScroll();
      }
    });
  }

  /**
   * 子表导入,导出代码
   */
  showModal = false;
  // sheetParams:any = {}

  // 是否显示人员重复的弹框
  showRepeatModal = false;

  importSheet() {
    this.importDataNum = null;
    this.showModal = true;
  }

  /**
   * reset
   */
  handleCancel() {
    this.importDataNum = null;
    let fileName =
      (this.$refs.importModals as any).errorFile ||
      (this.$refs.importModals as any).importFileName;
    if (fileName) {
      //清除临时文件
      listApi.deleteTemporaryFile({ fileName });
    }
    this.showModal = false;
  }

  /**
   * 导出
   */

  exportSheet() {
    this.importDataNum = null;
    const exportRows: string[] = [];

    // const ctrl:any = JSON.parse(JSON.stringify(this.ctrl));

    this.checkeds.forEach((r, index) => {
      //
      let row: any = this.rows[index];
      if (r && index < this.rows.length) {
        let i: number = row[0].controller.options.rowIndex;
        const value: any = (this.ctrl as any).rows[i].value;
        if (value.id) {
          exportRows.push(value.id as string);
        }
      }
    });

    const params = Object.assign({}, this.sheetParams);

    // 获取导出权限数据
    const schemaCode: string = this.sheetParams.subSchemaCode;
    const permissData = this.formPermission.dataPermissions[schemaCode];

    params.permiss = permissData;
    params.name =
      this.control.options.name +
      this.$t('cloudpivot.form.renderer.exportFile').toString();

    if (exportRows.length > 0) {
      params.objectIds = exportRows;
    }

    UploadControl.service.exportSheet(params,this);
  }

  isShowRelevance = false;

  selected = [];

  // onListChange(val) {
  //   ;
  // };

  beforeCreate() {
    const comp = RelevanceFormControl.loadListSelector();

    (this.$options as any).components.ListSelector = comp;
  }

  async onModalOk() {
    const formControls = this.getFormControls();
    const dataitems = await RelevanceFormControl.service.dataitemsOf(
      this.schemaCode
    );
    this.selected.forEach((res) => {
      const obj: any = {};
      (this.control as any).columns.forEach((c) => {
        if (c.key === this.controlOpts.importFormRelevanceForm) {
          let formData: any = res;
          if (this.mappings) {
            formData = ReverseQueryService.convertForMappings(
              res,
              dataitems,
              this.mappings,
              formControls
            );
          }
          obj[c.key] = formData;
        } else {
          // obj[c.key] = null;
        }
      });
      const backRow: any = this.addRow();

      backRow.value = obj;
    });
    this.selected = [];
    this.onModalCancel();
  }
  customBtnclick(code: string) {
    super.customBtnclick(code);
  }
  onModalCancel() {
    this.isShowRelevance = false;
  }
  async importRelevance() {
    this.isShowRelevance = true;
    this.query = this.getParams(false);
    this.columns = this.relavanceColumns();
    this.formTitleObj = await RelevanceFormControl.service.getBizmodelTitle(
      this.schemaCode || ''
    );
  }

  importFinishe(val: any) {
    this.importDataNum = val.length + this.rows.length;
    if (!val) return;
    for (const col of (this.control as any).columns) {
      val.forEach((row: any) => {
        if (row[col.key] !== undefined && row[col.key] !== null) {
          if (col.options.computeFormula) {
            delete row[col.key];
          }
          row[col.key] = FormControlValueService.convert(
            col.type,
            row[col.key],
            col.options && col.options.multi
          );
        } else {
          row[col.key] = FormBuilderHelper.getControlValue(col as any);
        }
      });
    }
    for (const row of val) {
      this.addRow(row);
    }
    // this.getCtrl().value =val
  }
  importData = {
    headColumns: this.dataItem,
    queryField: '',
    secondImportData: [],
  };
  importStatu = {
    status: 0,
    successNum: 0,
    failNum: 0,
    fileName: '',
  };
  closeRepeatModal() {
    this.showRepeatModal = false;
  }
  editFinishe(val: any) {
    this.closeRepeatModal();
    this.importFinishe(val);
  }
  /**
   * @description: 列表导入时候，人员名称重复，弹出修复数据弹框
   * @param data.errorType 错误类型 data.successCount 成功数量  data.errorCount失败数量  data.fileName 错误模板名称
   * @return:
   */
  repeatErrorHandle(data: any) {
    this.importStatu.status = data.errorType;
    this.importStatu.successNum = data.successCount;
    this.importStatu.failNum = data.errorCount;
    this.importStatu.fileName = data.fileName;
    this.importData.secondImportData = data.secondImportData || [];
    if (data.data) {
      this.importFinishe(data.data);
    }
    this.showModal = false;
    this.showRepeatModal = true;
  }

  get sheetParams() {
    const formStatus: any = {
      DRAFT: 0,
      PROCESSING: 1,
      CANCELLED: 2,
      COMPLETED: 3,
    };

    const params: any = Object.assign({}, this.control.options.sheetParams);
    params.sequenceStatus = formStatus[params.sequenceStatus];
    return params;
  }

  isShowQueryItem: boolean = false; // 是否显示查询条件
  queryConditionSource: any = [];
  queryData: any = {};
  toggleQuery() {
    this.isShowQueryItem = !this.isShowQueryItem;
  }

  // 点击搜索
  onSearch(params: any, nameObj: any, queryData: any) {
    console.log(params, nameObj, queryData);
    this.isShowQueryItem = false;
    const Ctrl = this.getCtrl();
    const sheet: any = Ctrl;

    const formControls = this.getFormControls();
    const sheets = (formControls.find(
      (c) => c.key === this.id
    ) as any) as typings.FormSheet;

    if (sheet && sheet.rows.length > 0) {
      // 清空子表数据在获取
      this.rows = [];
      // 标记筛选子表
      sessionStorage.setItem('sheet-' + this.id, '1');

      if (Object.keys(params).length) {
        const vals: any = this.dataTranslateToFilterCard(params, nameObj);
        this.queryConditionSource = vals;

        // 获取过滤的数据
        sheet.rows.forEach((g, i) => {
          if (!this.hasRows(g, params)) {
            this.buildRow(i, g);
          }
        });
        // this.initFilterStat(sheets);
      } else {
        this.queryConditionSource = [];
        sheet.rows.forEach((g, i) => {
          this.buildRow(i, g);
        });
        // this.initStat();
      }
    }
    this.onCheckAll(false);
  }

  // 筛选过滤条件
  hasRows(objs: any, params: any): number {
    let status = 0;
    let obj:any = {};

    for (let key in objs.value) {
      obj[key] = objs.value[key];
    }
    for (let i in params) {
      const arr = Array.isArray(obj[i]) ? obj[i].map((d:any) => d.id) : [];
      // 支持类型：短文本、日期、数值、选人控件、逻辑、关联表单
      // const type = [1, 3, 4, 50, 51, 8, 80, 81];
      switch (params[i].type) {
        case 1:
        case 4:
           (obj[i] + '').toLowerCase().indexOf((params[i].value + '').toLowerCase())>-1 ? 0 : status++;
          break;
        case 3:
          // 日期
          let rowDate:string = moment(obj[i]).format('YYYY-MM-DD HH:mm:ss')
          rowDate = rowDate.slice(0, params[i].value.length)
          // new Date(params[i].value).getTime() === new Date(obj[i]).getTime()
          rowDate === params[i].value ? 0 : status++;
          break;
        case 8:
          // 逻辑
          JSON.parse(params[i].value) === obj[i] ? 0 : status++;
          break;
        case 50:
        case 51:
        case 81:
          // 选人和关联多选
          const arr1 = params[i].value.map((d) => d.id);
          arr.some((r) => arr1.indexOf(r) >= 0) ? 0 : status++;
          break;
        case 80:
          // 关联单选
          params[i].value.hasOwnProperty('id') && params[i].value.id === obj[i].id
            ? 0
            : status++;
          break;
      }
    }
    return status;
  }

  /**
   * 将查询条件转成组件需要的格式
   * @params data 需要转的数据
   */
  dataTranslateToFilterCard(data: any, nameObj: any) {
    const deepData: any = JSON.parse(JSON.stringify(data));
    const vals: any = [];
    let type = [50, 51, 81];
    Object.keys(deepData).forEach((key: string) => {
      //
      let content =
        deepData[key].type === 80
          ? deepData[key].value.name
          : type.indexOf(deepData[key].type) > -1
          ? deepData[key].value.map((res) => res.name).join(',')
          : deepData[key].value;
      vals.push({
        name: nameObj[key].name,
        name_i18n: nameObj[key].name_i18n,
        content: content,
        type: -1,
      });
    });
    return vals;
  }

  // 重置
  onReset() {
    this.queryConditionSource = [];
    this.queryData = {};
    this.importDataNum = null;
    this.onSearch({}, {}, {});
  }

  // 点击过滤弹出层外隐藏
  hideQueryItem() {
    if (!this.isShowQueryItem) return;
    this.isShowQueryItem = false;
  }
}
</script>

<style lang="less" scoped>
.filters-box {
  position: absolute;
  top: 0px;
  left: 0;
  width: 100%;
  height: 45px;
  z-index: 99;
  background: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px 0px;
  border-radius: 4px;
  padding: 0px 1px;
  input,
  select {
    width: 100% !important;
  }
}
.h3-panel {
  width: 100%;
  text-align: left;
}

.h3-panel.vertical {
  padding: 0 12px;
}

.ant-divider-horizontal {
  margin: 1px 0;
}

.actions {
  margin: 16px 0;
  margin-bottom: 8px;
  text-align: left;
  position: relative;
  .ant-btn {
    margin-bottom: 8px;
  }

  .fullscreen {
    float: right;
    margin-top: 4.5px;
    cursor: pointer;
  }
  /*ie11 css hack*/
  @media all and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    .fullsheet {
      margin-right: 8px;
    }
  }

  & > button {
    margin-right: 8px;
  }
}

.actions.heard {
  box-shadow: 0px -1px 0px 0px rgba(232, 232, 232, 1);
  margin: 0;
  padding: 16px;
  display: flex;
  justify-content: space-between;

  & > h3 {
    line-height: 32px;
    font-weight: 600;
  }

  & > div {
    text-align: right;
    & > button {
      margin-left: 8px;
    }
    .fullscreen {
      margin-left: 17px;
      // margin-right: 25px;
    }
  }
}

/deep/.fullsheet > .sheet {
  margin: 0 10px;
  .sheet__body {
    max-height: calc(100vh - 115px);
    overflow-y: scroll;
    margin-right: -6px;
  }

  /*ie11 css hack*/
  @media all and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    .sheet__body {
      margin-right: -17px;
    }
  }

  .sheet__body.show-total {
    max-height: calc(100vh - 160px);
  }

  & + .sheet__row.scrollbar {
    margin: 0 10px;
  }
}

.pagination {
  text-align: right;
}

.ellipsis {
  cursor: pointer;
}
</style>

<style lang="less">
.h3-panel-body {
  overflow: unset !important;
}
.modal-footer {
  text-align: right;
  button {
    margin-left: 8px;
  }
}

._form-sheet{
  li{
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
  }
}
/deep/.ant-popover-inner-content{
  min-width: 160px !important;
}
.titleHidden{
  .span-title{
    display: none!important;
  }
}
</style>
