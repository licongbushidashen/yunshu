<template>
  <div class="form-design">
    <div class="action">
      <a-radio-group :value="viewType" @change="setView">
        <!--<a-radio-button value="web">web端设计</a-radio-button>-->
        <!--<a-radio-button value="mobile">移动端设计</a-radio-button>-->
        <a-radio-button
          v-for="(item, index) in views"
          :key="index"
          :value="item.value"
        >{{ item.text }}</a-radio-button>
      </a-radio-group>
      <div class="tips">
        <a-alert
          type="warning"
          v-show="isShowTips"
          message="保存成功，发布后方可在门户使用！"
          showIcon
          closable
          @close="isShowTips = false"
        />
        <!-- <a-alert
          style="min-width:400px;"
          type="warning"
          v-show="isSubTips"
          showIcon
          closable
          @close="isSubTips = false"
        >
          <div
            slot="message"
          >{{$i18n.locale === 'zh' ? '若模型中包含【子表】，按以下步骤重现【子表】' : 'If the model contains a sub table, repeat the sub table as follows' }}：</div>
          <div slot="description">
            <div>1、{{$i18n.locale === 'zh' ? '点击本页【发布】按钮' : 'Click the [publish] button on this page'}}</div>
            <div>2、{{$i18n.locale === 'zh' ? '从左侧【数据项-业务数据项】中，拖出【子表】' : 'Drag sub table from data item business data item on the left'}}</div>
          </div>
        </a-alert> -->
      </div>
      <div class="tips publicTips">
        <a-alert
          v-for="(msg,idx) in publicDescription"
          :key="idx"
          type="warning"
          :description="msg"
          showIcon
          closable
          @close="onClosePublicTips"
        />
      </div>
      <span>
        <a-button @click="historyView">
          <i class="icon aufontAll h-icon-all-leave-application-o"></i>历史版本
        </a-button>
        <!-- <a-button @click="restore" icon="reload">还原</a-button> -->
        <a-button @click="preview">
          <i class="icon aufontAll h-icon-all-eye-o"></i>预览
        </a-button>

        <a-button @click="exportForm" icon="upload">导出</a-button>

        <!-- <a-button @click="exportForm" icon="reload">还原</a-button> -->

        <a-button icon="save" @click="onSave">保存</a-button>

        <a-button @click="publish" type="primary">
          <i class="icon aufontAll h-icon-all-plane-o"></i>发布
        </a-button>
      </span>
    </div>
    <div></div>
    <div class="form-design-content">
      <h3-sider :options="leftSider" @resize="onSiderToggle">
        <form-design-panel></form-design-panel>
      </h3-sider>

      <editor
        v-if="viewType === 'editor'"
        ref="editor"
        :options="editorOptions"
        @dataitem-add="onDataitemAdd"
        @dataitem-delete="onDataitemDelete"
      ></editor>
      <designer
        v-show="viewType !== 'editor'"
        ref="designer"
        :class="[this.viewType, 'bgf', 'bdr']"
        :warpCls="`${this.viewType}-view`"
        :controls="controls"
        :initLayout="layout"
        :formData="formData"
        :device="this.viewType"
        :showDragTips="showDragTips"
        @control-add="onControlAdd"
        @control-update="onControlUpdate"
        @control-delete="onControlDelete"
        @control-select="onControlSelect"
        @dataitem-add="onDataitemAdd"
        @dataitem-delete="onDataitemDelete"
      ></designer>
      <h3-sider :options="rightSider" @resize="onSiderToggle">
        <FormProperty
          :formData="formData"
          :allControls="selectedControl"
          @control-update="onControlUpdate"
          @modelAttrRule-update="onModelAttrRuleUpdate"
          @edit-formdata-attribute="editFormDataAttribute"
          @control-update-blur="onControlUpdateBlur"
          ref="formAttributeLayout"
        ></FormProperty>
      </h3-sider>
    </div>
    <a-modal
      :visible="showUnsaveConfirm"
      :closable="false"
      :maskClosable="false"
      :width="400"
      wrapClassName="unsave-confirm"
    >
      <div class="unsave-confirm--content">
        <i class="icon aufontAll h-icon-all-question-circle"></i>
        <strong>{{ $t("languages.Apps.FormDesignPage.UnsaveContent") }}</strong>
      </div>

      <template slot="footer">
        <a-button key="cancel" @click="handleConfirmCancel">{{ $t("languages.Apps.Cancel") }}</a-button>
        <a-button key="unsave" @click="handleConfirmUnsave">{{ $t("languages.Apps.Unsave") }}</a-button>
        <a-button
          key="save"
          type="primary"
          @click="handleConfirmOk"
        >{{ $t("languages.Apps.SaveAndLeave") }}</a-button>
      </template>
    </a-modal>
    <a-modal
      v-model="isShowPublishModal"
      class="publish-modal"
      okText="发布"
      cancelText="取消"
      @ok="postPublish"
      :maskClosable="false"
      :keyboard="false"
    >
      <p slot="title">
        发布说明
        <span class="title-tip">用于历史版本介绍</span>
      </p>

      <div class="desc-box">
        <textarea placeholder="请输入说明（120字以内）必填" v-model="publishDesc" maxlength="120"></textarea>
        <div class="desc-num">{{ publishDesc.length }}/120</div>
      </div>
    </a-modal>
    <!-- 预览弹窗 -->
    <div class="design__preview" v-if="showPreview">
      <FormPreview @hidePreview="hidePreview" :curview="viewData"></FormPreview>
    </div>
  </div>
</template>


<script lang='ts'>
import { Store } from "vuex";
import { Component, Vue, Prop, Watch, Provide } from "vue-property-decorator";
import * as formApi from "@/apis/form";
import { TemplateExport } from "@/template/templateExport";
import H3Sider from "@/common/sider/sider.vue";
import "@/directives/drag";
import * as dataitemStore from "./stores/data-items.store-helper";
import FormDesignPanel from "./panels/form-design-panel.vue";
import Designer from "./designer/designer.vue";
import FormProperty from "./form-property/form-attribute-layout.vue";
import { DataItemType, mapToControlType } from "@cloudpivot/form/schema";
import FormPreview from "@/components/apps/form-preview/form-preview.vue";
import { recursionSearch } from "@cloudpivot/common/src/utils/utils";
import { NumberFormatType } from "@cloudpivot/form/component-schema";
import { CompareVersion } from '@cloudpivot/form/utils';
import {
  FormControl,
  FormSheet,
  FormTabs,
  FormSheetColumn,
  FormControlType,
  FormSheetStatistic,
  DataItem,
  ReverseRelevanceOptions,
  DispalyMode,
} from "./typings";

import * as ControlFactory from "./typings/control-factory";

import Editor from "./editor/editor.vue";

import { runtime, schema } from "@cloudpivot/form";

import { LanguageTransform } from "@/utils";

import { DataItemState } from "./stores/data-items.store";

import { State, Mutation, Action, namespace } from "vuex-class";

import appsApi from "@/apis/apps";

import moment from "moment";

import { ControlHelper } from "@cloudpivot/form/src/common/controls/control-helper";
import {
  controlAttributeListMap,
  commonBaseAttributeListMap,
} from "@cloudpivot/form/src/schema/control-attribute-transfer";

import {
  SynRelevanceFormDisplayField,
  SynSheetRelevanceFormDisplayField,
} from "./form-detail-service";
// @ts-ignore
import cloneDeep from "lodash/cloneDeep";
const DataModelModule = namespace("Apps/DataModel");
const FormHisModule = namespace("Apps/FormHis");
@Component({
  name: "form-design",
  components: {
    FormDesignPanel,
    Designer,
    FormProperty,
    H3Sider,
    FormPreview,
    Editor: () => import("./editor/editor.vue"),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      (vm as FormDesign).load();
    });
  },

  beforeRouteUpdate(to, from, next) {
    const vm = this as FormDesign;
    const func = () => {
      vm.clean();
      next();
      (this as any).viewType = "web";
      vm.load();
    };

    if (vm.isEdit()) {
      vm.confirmSave().then(
        () => {
          func();
        },
        () => {
          next(false);
        }
      );
    } else {
      func();
    }
  },

  beforeRouteLeave(to, from, next) {
    const currFormDeleted =
      to.params.bizSchemaCode === from.params.bizSchemaCode &&
      to.query.del_form_code === from.params.sheetCode;

    const vm = this as FormDesign;
    vm.showDragTips = false;
    if (!currFormDeleted && vm.isEdit()) {
      vm.confirmSave().then(
        () => {
          vm.clean();
          next();
        },
        () => {
          next(false);
        }
      );
    } else {
      vm.clean();
      next();
    }
  },
})
export default class FormDesign extends Vue {
  // 表单名称修改后需要同步更新子组件
  @DataModelModule.Action("updateFormData") updateFormData: any;
  @DataModelModule.Action("getFormRuleList") getFormRuleList: any;
  @DataModelModule.Action("getDataItemList") getDataItemList: any;
  @FormHisModule.Mutation("setCurrentVersion") setCurrentVersion: any;
  @DataModelModule.Mutation("setFormSystemVersion") setFormSystemVersion: any;
  @FormHisModule.State("currentVersion") getCurrentVersion: any;
  @DataModelModule.State("formRuleList") formRuleList: any;
  @DataModelModule.State("dataItemList") dataItemList: any;
  @DataModelModule.State("formSystemVersion") formSystemVersion: any;
  showPreview: boolean = false;

  @Provide()
  isPreview() {
    return this.showPreview;
  }

  @Provide()
  getControls() {
    return this.controls;
  }

  // 表单预览数据
  viewData: any;
  views: any = [
    {
      value: "web",
      text: "web端设计",
    },
    {
      value: "mobile",
      text: "移动端设计",
    },
    {
      value: "editor",
      text: "HTML",
    },
  ];

  showDragTips: boolean = false;

  isShowTips: boolean = false;

  isSubTips: boolean = false;

  isShowPublicTips: boolean = false;

  isShowPublishModal: boolean = false;

  publishDesc: string = "";

  publicDescription: Array<string> = [];

  controls: { [key: string]: FormControl } = {};

  layout: string[][] = [];

  actions: Array<schema.FormAction> = [];

  elements: Array<schema.FormElement> = [];

  dataItemAdds: {
    [code: string]: DataItem;
  } = {} as any;

  dataItemDeletes: string[] = [];

  bizDataRuleAdds: any[] = [];

  editProperties: any[] = [];

  deleteBizDataRuleIds: any[] = [];

  draftSchemaOptions: any[] = [];

  // 判断是否组件是否需要设置margin
  clacMargin: string[] = ["left", "right"];

  formData: any = {};

  selectedControl: any = {};

  viewType = "web";

  leftSider = {
    width: 238,
    minWidth: 238,
    maxWidth: 700,
    direction: "left",
    collapsible: true,
  };

  rightSider = {
    width: 276,
    minWidth: 276,
    maxWidth: 700,
    direction: "right",
    collapsible: true,
  };

  tpl = "";

  editorOptions = {};

  showUnsaveConfirm = false;

  saveConfirmPromiseResolve: Function | null = null;

  saveConfirmPromiseReject: Function | null = null;

  isPublishClick: boolean = false; // 是否点击发布按钮

  get designer() {
    return this.$refs.designer as Designer;
  }

  get version() {
    return this.$store.state.config.systemVersion;
  }

  get isEditorView() {
    return this.viewType === "editor";
  }
  setClacMagin(str: string) {
    let arr = this.clacMargin;
    if (arr.includes(str)) {
      arr = arr.filter((item) => item !== str);
    } else {
      arr.push(str);
    }
    this.clacMargin = arr;
  }
  /**
   * @desc 表单设计器控件和控制器显示隐藏回调
   */
  onSiderToggle(str) {
    if (this.isEditorView) {
      const editor = this.$refs.editor as Editor;
      if (editor) {
        editor.resize();
      }
    }
    // 动态设置margin
    this.setClacMagin(str);
  }

  async setView(evt: any) {
    const type = evt.target.value;
    // 从编辑器界面切回设计界面时
    if (this.isEditorView && this.viewType !== type) {
      try {
        await this.parseHTML();
      } catch {
        // 如果有错误停留在编辑器界面
        return;
      }
    }

    this.viewType = type;

    // 从设计界面切到编辑器界面
    if (this.isEditorView) {
      this.initEditorOptions();
    }
  }

  initEditorOptions() {
    const layout = this.designer.getLayout();
    this.editorOptions = {
      layout,
      controls: this.controls,
      actions: this.actions,
      elements: this.elements,
    };
  }

  async parseHTML() {
    if (!this.isEditorView) {
      return;
    }

    const editor = this.$refs.editor as Editor;
    if (!editor) {
      return;
    }

    const callOnDataItemAdd = (control: FormControl) => {
      let item = this.findDataItem(control.key, control.parentKey, control);

      if (item) {
        return;
      }

      item = ControlFactory.buildDataItemOf(
        {
          code: control.key,
          type: control.type,
          name: control.options.name,
        },
        control.parentKey
      );
      this.onDataitemAdd(item);
    };

    const checkDataitem = (result: any) => {
      for (const key in result.controls) {
        const control = result.controls[key];
        //处理tabs控件heads 为字符串的情况
        if (control.type === FormControlType.Tabs) {
          if (typeof control.options.heads === "string") {
            control.options.heads = JSON.parse(control.options.heads);
          }
        }
        if (ControlFactory.notDataItemOf(control.type)) {
          continue;
        }

        const isSheet = control.type === FormControlType.Sheet;

        if (!this.controls[key]) {
          callOnDataItemAdd(control);

          if (isSheet) {
            for (const newCol of (control as FormSheet).columns) {
              callOnDataItemAdd(newCol);
            }
          }
        } else if (isSheet) {
          const newSheet = control as FormSheet;
          const oldSheet = this.controls[key] as FormSheet;
          const oldColumnKeys = oldSheet.columns.map((c) => c.key);

          for (const newCol of newSheet.columns) {
            if (oldColumnKeys.indexOf(newCol.key) === -1) {
              callOnDataItemAdd(newCol);
            }
          }
        }
      }

      for (const key in this.controls) {
        const control = this.controls[key];
        if (!result.controls[key]) {
          this.onDataitemDelete(control.key, control.parentKey);
        } else if (control.type === FormControlType.Sheet) {
          const newSheet = result.controls[key] as FormSheet;
          const oldSheet = control as FormSheet;
          const newColumnKeys = newSheet.columns.map((c) => c.key);

          for (const oldCol of oldSheet.columns) {
            if (newColumnKeys.indexOf(oldCol.key) === -1) {
              this.onDataitemDelete(oldCol.key, oldCol.parentKey);
            }
          }
        }
      }
    };

    const result = await editor.parse();
    checkDataitem(result);
    this.controls = result.controls;
    this.layout = result.layout;
    this.actions = result.actions;
    this.elements = result.elements;
  }

  isEdit() {
    if (
      !this.formData.draftAttributesJson &&
      Object.keys(this.controls).length
    ) {
      return true;
    }

    const layout = this.designer.getLayout();
    if (!this.formData.draftViewJson && layout.length) {
      return true;
    }

    const set = new Set();
    let orDraft = this.formatDictionariesOption() !== '' ?
    this.formatDictionariesOption() :
    this.formData.draftAttributesJson

    set.add(JSON.stringify(this.controls));

    if (!set.has(orDraft)) {
      return true;
    }

    set.clear();
    set.add(JSON.stringify(layout));

    if (!set.has(this.formData.draftViewJson)) {
      return true;
    }

    return false;
  }

  onDataitemAdd(item: DataItem) {
    if (item.parentCode) {
      let parent = this.dataItemAdds[item.parentCode];
      if (!parent) {
        const temp = this.findDataItem(item.parentCode);
        if (temp) {
          parent = Object.assign({}, temp) as any;
          this.dataItemAdds[item.parentCode] = parent;
        }
      }
      if (parent.properties) {
        if (item.id) {
          const idx = parent.properties.findIndex((x) => x.id === item.id);
          parent.properties.splice(idx, 1, item);
        } else {
          const idx = parent.properties.findIndex((x) => x.code === item.code);
          if (idx === -1) {
            parent.properties.push(item);
          } else {
            item.id = parent.properties[idx].id;
            parent.properties.splice(idx, 1, item);
          }
        }
      } else {
        parent.properties = [];
        parent.properties.push(item);
      }
    } else {
      this.dataItemAdds[item.code] = item;

      // 将拖拽的表单项添加到内存中
      let newItem: DataItemState = Object.assign(item, {
        used: true,
      });
      dataitemStore.addItem(this, newItem);
    }
  }

  onDataitemDelete(code: string, parentCode?: string) {
    if (parentCode) {
      let parent = this.dataItemAdds[parentCode];
      if (parent) {
        if (parent.properties) {
          const idx = parent.properties.findIndex((p) => p.code === code);
          parent.properties.splice(idx, 1);
        }
      }
      parent = this.items.find((x) => x.code === parentCode) as any;
      if (parent && parent.properties) {
        // const item:any = parent.properties.find((x) => x.code === code);
        // 如果删除子表的【关联控件】 则子表的属性-关联属性要为空
        if (
          code === this.controls[parentCode].options.importFormRelevanceForm
        ) {
          this.controls[parentCode].options.importFormRelevanceForm = "";
        }
      }
    } else {
      delete this.dataItemAdds[code];
      const delIndex = this.items.findIndex((m) => m.code === code);
      const item = this.items[delIndex];
      if (item && !item.published && !item.isSystem) {
        // this.dataItemDeletes.push(code);
        // 删除内存中的表单项
        this.items.splice(delIndex, 1);
      }
    }
    this.setShowDragTips("delete");
  }

  onControlSelect(control?: FormControl, isSeletedControl: Boolean = true) {
    if (control && control.type !== FormControlType.Html) {
      // const globalName:string =  LanguageTransform.getLang(control.options.name, control.options.name_i18n);
      // control.options.name = globalName;

      let dataItem = this.findUnSaveDataItem(control.key, control.parentKey);

      if (!dataItem) {
        const key =
          control.type === FormControlType.SheetStatistic
            ? (control as FormSheetStatistic).columnKey
            : control.key;
        dataItem = this.findDataItem(key, control.parentKey, control);
      }
      this.selectedControl = { control, dataItem, isSeletedControl };
    } else {
      this.selectedControl = {};
    }
  }

  onControlAdd(control: FormControl, copyKey?: string) {
    this.controls[control.key] = control;
    this.setShowDragTips("add");
    if (control.key === ".") {
      return;
    }

    // 如果有数据项，则设置为不可用
    let item = this.findDataItem(control.key);
    if (item) {
      this.synchronizationRules2(control, item);
      this.switchDataitemUsed(control.key);
      if (control.type === FormControlType.Sheet && item.properties) {
        item.properties.forEach((p) => {
          this.switchDataitemUsed(control.key, p.code);
        });
      }
    } else {
      // 只有基础控件和子表需要选择数据项
      if (copyKey) {
        this.copyDataItemFrom(control, copyKey);
      }
    }
    // @ts-ignore
    if(copyKey && control.type === FormControlType.Sheet && control.columns){
      // @ts-ignore
      control.columns.forEach(element => {
        element.key = element.copyKey
      });
    }

    this.onControlSelect(control);
  }

  onControlUpdate(
    key: string,
    properties: { [key: string]: any },
    parentKey?: string,
    path?: string[]
  ) {
    let control: any;

    let parents: FormControl[] = [];

    if (path) {
      control = this.findControlByPath(path, parents);
    } else if (parentKey) {
      // let parent = this.controls[parentKey];
      // if (parent) {
      //   parents.push(parent);
      //   control = findChild(parent, key);
      // }
      path = [parentKey, key];
      control = this.findControlByPath(path, parents);
    } else {
      control = this.controls[key];
    }
    if (!control) {
      return;
    }

    if (this.selectedControl && this.selectedControl.control) {
      let currentMaxlengthRule: any = this.formRuleList.find(
        (x) =>
          x.propertyCode === this.selectedControl.control.key &&
          x.dataRuleType === 1 &&
          x.checkType === 4
      );
      if (currentMaxlengthRule) {
        try {
          let optionObj = JSON.parse(currentMaxlengthRule.options);
          if (optionObj) {
            let { maxLength } = optionObj;
            let { defaultValue } = properties.options;
            if (defaultValue && defaultValue.length > maxLength) {
              properties.options.defaultValue =
                properties.options.defaultValue.slice(0, maxLength);
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
    }

    // 子表子控件处理
    if (parents.length === 1 && parents[0].type === FormControlType.Sheet) {
      const sheet = parents[0] as FormSheet;
      if (control.type === FormControlType.Number) {
        if (properties.options) {
          let propertys = Object.keys(properties.options);
          if (propertys.includes("format") && sheet.statistics) {
            this.syncSheetNumberAndStatistic(
              key,
              sheet,
              properties.options.format
            );
          }
        }
      }
    }

    let name = control.options.name;
    if (!control) {
      return;
    }

    Object.keys(properties).forEach((k) => {
      const c = control as any;
      if (c[k] === undefined) {
        return;
      }
      const prop = properties[k];
      let obj: any;
      if (Array.isArray(prop)) {
        obj = prop.slice();
      } else if (prop && typeof prop === "object") {
        obj = Object.assign({}, (control as any)[k], properties[k]);
      } else {
        obj = prop;
      }
      // this.$set(control, k, obj);
      c[k] = obj;
    });



    if (properties.hasOwnProperty("type")) {
      control.options = ControlFactory.buildControlOptions(
        properties.type,
        control.options
      );

      // 子表列宽处理
      if (parents.length === 1 && parents[0].type === FormControlType.Sheet) {
        (control as FormSheetColumn).width = ControlFactory.getSheetColumnWidth(
          control.type
        );
      }
    }

    if (properties.options) {
      if (properties.options.name) {
        // const globalName =  LanguageTransform.setLang(control.options.name, control.options.name_i18n);
        // control.options =  Object.assign({},control.options,globalName);
        const locale = this.$i18n.locale;
        if (locale === "zh") {
          this.updateDataItem(control, "name");
        } else {
          if (name) {
            control.options.name = name;
          }
          if (!control.options.name_i18n) {
            control.options.name_i18n = {};
          }
          control.options.name_i18n[locale] = properties.options.name;
          this.updateDataItem(control, "name_i18n");
        }
      } else if (properties.options.schemaCode) {
        this.updateDataItem(control, "schemaCode", "relativeCode");
      }
      // 当修改显示字段时
      else if (properties.options.displayField) {
        this.updateDataItem(control, "displayField", "relativePropertyCode");
      } else if (properties.options.dataItemName) {
        return;
        // this.updateDataItemCode(control, properties.options.dataItemName, path);
      }
    }

    if (parents && parents.length > 0) {
      const parent = parents[parents.length - 1];
      if (
        parents[0].type === FormControlType.Tabs &&
        (parent as any).controls
      ) {
        (parent as any).controls[control.key] = Object.assign({}, control);
        const tabs = parents[0] as FormTabs;
        const layout = (parent as any).layout;
        const [rowIdx, colIdx] = ControlFactory.findIndexFromGrid(
          layout,
          control.key
        );
        if (rowIdx > -1 && colIdx > -1) {
          const row = layout[rowIdx];
          row.splice(colIdx, 1, control.key);
        }
      }
    }
    this.onControlSelect(control, false);
  }

  onControlUpdateBlur(
    key: string,
    properties: { [key: string]: any },
    parentKey?: string,
    path?: string[]
  ) {
    let control: any;

    let parents: FormControl[] = [];

    if (path) {
      control = this.findControlByPath(path, parents);
    } else if (parentKey) {
      path = [parentKey, key];
      control = this.findControlByPath(path, parents);
    } else {
      control = this.controls[key];
    }
    if (!control) {
      return;
    }

    if (properties.options.dataItemName) {
      this.updateDataItemCode(control, properties.options.dataItemName, path);
      this.updateBizDataRuleAddsCode(key, properties.options.dataItemName);
    }
    if (parents && parents.length > 0) {
      const parent = parents[parents.length - 1];
      if (
        parents[0].type === FormControlType.Tabs &&
        (parent as any).controls
      ) {
        (parent as any).controls[control.key] = Object.assign({}, control);
        const tabs = parents[0] as FormTabs;
        const layout = (parent as any).layout;
        const [rowIdx, colIdx] = ControlFactory.findIndexFromGrid(
          layout,
          control.key
        );
        if (rowIdx > -1 && colIdx > -1) {
          const row = layout[rowIdx];
          row.splice(colIdx, 1, control.key);
        }
      }
    }

    this.onControlSelect(control, false);
  }

  /**
   * 修改bizDataRuleAdds中对应的编码值
   */
  updateBizDataRuleAddsCode(key,propertyCode){
    if(this.bizDataRuleAdds.length>0) {
      this.bizDataRuleAdds.forEach((item)=>{
        if(key === item.propertyCode){
          item.propertyCode = propertyCode;
        }
      });
    }
  }

  // 同步子表中 数值框格式和统计的格式
  syncSheetNumberAndStatistic(
    numberCode: string,
    sheet: FormSheet,
    newFormat: string
  ) {
    let item = sheet.statistics.find((val) => val.columnKey === numberCode);
    if (item) {
      item.options.format = newFormat;
    }
  }

  findDataItem(code: string, parentCode?: string, control?:any) {
    if (parentCode) {
      const parent = this.items.find((x) => x.code === parentCode);
      if (!parent || !parent.properties) {
        return null;
      }
      return parent.properties.find((x) => x.code === code);
    } else {
      const item: any = this.items.find((x) => x.code === code);
      if(item) {
        return item;
      } else {
        // 描述说明添加属性
        if (control && control.type === 202) {
          const name:string = control.options.name;
          return Object.assign(control.options, {
            name,
            code: control.key,
            id: control.key
          })
        }
        return undefined;
      }
    }
  }

  findUnSaveDataItem(code: string, parentCode?: string) {
    if (parentCode) {
      const parent = this.dataItemAdds[parentCode];
      if (!parent || !parent.properties) {
        return null;
      }
      const item = parent.properties.find((p) => p.code === code || p.code === code + '_1');
      return item;
    }
    return this.dataItemAdds[code];
  }

  updateDataItem(control: FormControl, key: string, alias?: string) {
    let add: any;

    if (control.parentKey) {
      let item = this.findUnSaveDataItem(control.key, control.parentKey);

      if (item) {
        add = item;
      } else {
        item = this.findDataItem(control.key, control.parentKey, control);

        if (item && !item.published && !item.isSystem) {
          add = Object.assign({}, item);
          this.onDataitemAdd(add);
        }
      }
    } else {
      add = this.dataItemAdds[control.key];

      if (!add) {
        const item = this.items.find((x) => x.code === control.key);
        if (item && !item.published && !item.isSystem) {
          add = Object.assign({}, item);
          this.onDataitemAdd(add);
        }
      }
    }

    if (add) {
      alias = alias || key;
      add[alias] = control.options[key];
    }
  }

  updateDataItemCode(control: FormControl, code: string, path?: string[]) {
    if (control.key === code) {
      return false;
    }

    const item = this.findDataItem(control.key, control.parentKey, control);

    if (item && (item.published || item.isSystem || item.code === code)) {
      return false;
    }

    let item2 = control.parentKey
      ? this.findDataItem(code, control.parentKey, control)
      : this.findDataItem(code);
    if (!item2) {
      item2 = control.parentKey
        ? this.findUnSaveDataItem(code, control.parentKey)
        : this.findUnSaveDataItem(code);
    }

    //在表单设计时删除组件后若使用被删除组件的编码，则会提示以下错误信息
    if (item2) {
      this.$message.error(`数据项编码重复，系统已重置为上一次编码，请根据需要修改`);
      return false;
    }

    let updateItem:any = this.findUnSaveDataItem(control.key, control.parentKey);

    if (updateItem) {
      if (updateItem.code === code) {
        return false;
      }

      if (!updateItem.parentCode) {
        delete this.dataItemAdds[updateItem.code];
        this.dataItemAdds[code] = updateItem;
      }

      updateItem.code = code;
    } else {
      updateItem = Object.assign({}, item);
      updateItem.code = code;
      this.onDataitemAdd(updateItem);
    }

    if (updateItem.properties) {
      updateItem.properties.forEach((x) => (x.parentCode = code));
    }

    if (control.type === FormControlType.Sheet) {
      const sheet = control as FormSheet;
      sheet.columns.forEach((c) => (c.parentKey = code));
      if (sheet.statistics) {
        sheet.statistics.forEach((c) => (c.parentKey = code));
      }
    } else if (control.parentKey) {
      const sheet = this.controls[control.parentKey] as FormSheet;
      if (sheet && sheet.statistics) {
        sheet.statistics
          .filter((c) => c.columnKey === control.key)
          .forEach((c) => (c.columnKey = code));
      }
    }

    // 原控件
    let oldPath = "";
    if (path && control.path && control.path.length) {
      oldPath = path[path.length - 1];
      // 修改dataItem后，同步最新path
      path[path.length - 1] = code;
    }

    if (control.parentKey) {
      control.key = code;
    } else {
      //标签页控件中基础组件属性设置
      if (path && control.path && control.path.length) {
        // 当前组件的父组件为tab时，需更新tab内维护的组件code
        if (
          path.length > 2 &&
          path[path.length - 2].includes("tab") &&
          path[path.length - 3].includes("tabs")
        ) {
          // 找父级tab
          const findParentTab = (target, tabsKey, tabKey) =>
            target[tabsKey].panels.find((panel) => panel.key === tabKey)
              .controls;
          let index = 0;
          let tabs: any = this.controls;
          while (index < path.length - 3) {
            tabs = findParentTab(tabs, path[index], path[index + 1]);
            index += 2;
          }
          // 被修改组件的直接父panel
          const panel = tabs[path[path.length - 3]].panels.find(
            (panel) => panel.key === path[path.length - 2]
          );
          // 更新layout
          const [rowIndex, colIndex] = ControlFactory.findIndexFromGrid(
            panel.layout,
            oldPath
          );
          const row = panel.layout[rowIndex];
          row.splice(colIndex, 1, code);
          panel.layout.splice(rowIndex, 1, row);
          // 更新controls
          const controls = panel.controls;
          const oldControl = Object.assign({}, controls[oldPath], {
            key: code,
          });
          this.$delete(controls, oldPath);
          controls[code] = oldControl;
        }
      } else {
        const [rowIndex, colIndex] = this.findIndex(control.key);
        if (rowIndex !== -1 && colIndex !== -1) {
          this.$delete(this.controls, control.key);
          control.key = code;
          this.$set(this.controls, code, control);
          // this.designer.replace(row, col, code);
          const row = this.layout[rowIndex];
          row.splice(colIndex, 1, code);
          this.layout.splice(rowIndex, 1, row);
        }
      }
    }

    return true;
  }

  findIndex(controlKey: string): [number, number] {
    return ControlFactory.findIndexFromGrid(this.layout, controlKey);
  }

  onControlDelete(controlKey: string) {
    const control = this.controls[controlKey];
    if (!control) {
      return;
    }

    delete this.controls[controlKey];
    if (control.key === ".") {
      return;
    }

    this.onControlSelect();

    this.cleanControlFormulaBy(this.controls, control);

    if (!ControlFactory.notDataItemOf(control.type)) {
      this.switchDataitemUsed(controlKey);

      if (control.type === FormControlType.Sheet) {
        const item = this.findDataItem(controlKey);
        if (item && item.properties) {
          item.properties.forEach((p) => {
            this.switchDataitemUsed(controlKey, p.code);
          });
        }
      }

      this.onDataitemDelete(control.key, control.parentKey);
    }
    this.setShowDragTips("delete");
  }

  cleanControlFormulaBy(controls: any, control: FormControl) {
    for (const key in controls) {
      const c = controls[key];
      const opts = c.options;
      if (!opts) {
        continue;
      }

      const text = control.parentKey
        ? `{${control.parentKey}.${control.key}}`
        : `{${control.key}}`;

      if (opts.displayFormula && opts.displayFormula.indexOf(text) > -1) {
        opts.displayFormula = "";
      }
      // 兼容 必填条件变成布尔值处理
      if (opts.requiredFormula && typeof opts.requiredFormula === "boolean") {

        opts.requiredFormula = `${opts.requiredFormula}`;
      }

      if (opts.requiredFormula && opts.requiredFormula.indexOf(text) > -1) {
        opts.requiredFormula = "";
      }

      if (opts.computeFormula && opts.computeFormula.indexOf(text) > -1) {
        opts.computeFormula = "";
      }
      if (opts.verifyFormula && ~opts.verifyFormula.indexOf(control.key)) {
        opts.verifyFormula = "";
      }
    }
  }

  setDataitemUsed(used: boolean, code: string, subCode?: string) {
    dataitemStore.setUsed(this, used, code, subCode);
  }

  switchDataitemUsed(code: string, subCode?: string) {
    dataitemStore.switchUsed(this, code, subCode);
  }

  get items() {
    return dataitemStore.getDataItems(this);
  }

  reload() {
    this.clean();
    this.load();
  }

  clean() {
    // this.viewType = "web";
    this.clearTempDataItem();
    this.formData = {};
    this.controls = {};
    this.layout = [];
    this.actions = [];
    this.elements = [];
    this.publishDesc = "";
    dataitemStore.unregister(this);
  }

  clearTempDataItem() {
    this.dataItemAdds = {};
    this.dataItemDeletes = [];
  }

  load() {
    const hideLoader = (this.$message as any).loading();
    dataitemStore
      .init(this)
      .then(() => this.getFormRuleList())
      .then(() => this.loadForm())
      .then(
        () => {
          hideLoader();
        },
        (res) => {
          hideLoader();
          if (res) {
            this.$message.error(res.errmsg);
          }
        }
      );
  }

  /**
   * 加载表单
   */
  loadForm() {
    const sheetCode = this.$route.params.sheetCode;
    const schemaCode = this.$route.params.bizSchemaCode;

    if (!sheetCode || !schemaCode) {
      // this.$message.error("缺少参数");
      return Promise.reject(new Error("缺少参数"));
    }

    const _this = this;
    return formApi.get(schemaCode, sheetCode).then((res: any) => {
      // 过滤留痕已被删除数据源
      let track: any = res.data.trackDataCodes
        ? res.data.trackDataCodes.split(";")
        : [];
      let result: Array<any> = [];
      this.items.forEach((element: any, idx: any) => {
        const code = element.code;
        track.forEach((track: any) => {
          if (code === track) {
            result.push(track);
          }
        });
      });
      res.data.trackDataCodes = result ? result.join(";") : "";

      _this.formData = res.data;
      _this.setFormSystemVersion(res.data.formSystemVersion);
      // if (_this.formData.subTip) {
      //   this.isSubTips = true;
      // }

      // store存储当前表单的版本
      if (res.data) {
        this.setCurrentVersion(res.data.version);
        if (res.data.draftSchemaOptionsJson) {
          this.draftSchemaOptions = JSON.parse(res.data.draftSchemaOptionsJson);
        }
      }

      if (_this.formData.sheetType) {
        _this.$message.error("无法打开自定义表单");
        return Promise.reject(new Error("无法打开自定义表单"));
      }

      if (!res.data.draftAttributesJson && !res.data.publishedAttributesJson) {
        this.autoLayout();
      } else {
        this.initLayout();
      }

      this.setDataitemUesdFor(this.controls, true);

      return res;
    });
  }

  /**
   * 初始化布局
   */
  initLayout() {
    this.showDragTips = false;
    const controls = JSON.parse(
      this.formData.draftAttributesJson || this.formData.publishedAttributesJson
    );

    // 处理关联表单历史数据显示字段问题；
    Object.keys(controls).map((ctrlKey: any) => {
      let ctrl = controls[ctrlKey];

      // // 首次加载，同步数据模型配置start
      // if(Array.isArray(this.dataItemList) && this.dataItemList.length){
      //   let filterItem = this.dataItemList.find(el => el.code === ctrlKey)
      //   if(filterItem){
      //     const tempData= {...ctrl.options};
      //     const filterItemData = JSON.parse(filterItem.options);
      //     ctrl.options = Object.assign(ctrl.options, filterItemData)
      //     ctrl.options.defaultValue=tempData.defaultValue||ctrl.options.defaultValue; //保证控件属性有默认值
      //   }
      // }
      // // 首次加载，同步数据模型配置end

      if (
        ctrl &&
        (ctrl.type === FormControlType.RelevanceForm ||
          ctrl.type === FormControlType.RelevanceFormEx)
      ) {
        ctrl = SynRelevanceFormDisplayField(ctrl, this.items);
      } else if (ctrl && ctrl.type === FormControlType.Sheet) {
        ctrl = SynSheetRelevanceFormDisplayField(ctrl, this.items);
      } else if (ctrl && ctrl.type === FormControlType.Tabs) {
        const loopArray = [ctrl];
        while (loopArray.length) {
          let _tempTabsCtrl = loopArray.shift();
          for (let val of _tempTabsCtrl.panels) {
            for (let _pcKey of Object.keys(val.controls)) {
              let _ctrl = val.controls[_pcKey];
              if (
                _ctrl.type === FormControlType.RelevanceForm ||
                _ctrl.type === FormControlType.RelevanceFormEx
              ) {
                _ctrl = SynRelevanceFormDisplayField(_ctrl, this.items);
              } else if (_ctrl.type === FormControlType.Sheet) {
                _ctrl = SynSheetRelevanceFormDisplayField(_ctrl, this.items);
              } else if (_ctrl.type === FormControlType.Tabs) {
                loopArray.push(_ctrl);
              }
            }
          }
        }
      }

      // 描述说明去掉Tips属性,兼容历史已保存的数据
      else if (ctrl && ctrl.type === FormControlType.Description) {
        delete ctrl.options.tips;
      }
    });

    const layout: Array<any[]> = JSON.parse(
      this.formData.draftViewJson || this.formData.publishedViewJson
    );
    const actionsJson =
      this.formData.draftActionsJson || this.formData.publishedActionsJson;
    if (actionsJson) {
      this.actions = JSON.parse(actionsJson);
    }

    const elementsJson =
      this.formData.draftHtmlJson || this.formData.publishedHtmlJson;
    if (elementsJson) {
      this.elements = JSON.parse(elementsJson);
    }

    localStorage.setItem("layoutType", this.formData.layoutType);

    const itemCodes = this.items.map((x) => x.code);

    const keys = Object.keys(controls);
    let deleteKeys: any = [];
    let tabDeleteKeys: any = [];
    for (let k of keys) {
      const ct = controls[k].type;
      // 从表单中移除审批意见控件
      if (ct === FormControlType.ApprovalOpinion) {
        deleteKeys.push(k);
      } else if (ct === FormControlType.Tabs) {
        let delKey = this.lostTabDataItem(controls[k]);
        tabDeleteKeys = [...tabDeleteKeys, ...delKey];
      } else if (!ControlFactory.notDataItemOf(ct) && !~itemCodes.indexOf(k)) {
        deleteKeys.push(k);
      }

      // 数据模型中部分属性与规则兼容
      let item = controls[k];
      if (item.type === FormControlType.Sheet) {
        this.synchronizationRules(item);
        for (let cl of item.columns) {
          this.synchronizationRules(cl, item.key);
        }
      } else if (item.type === FormControlType.Tabs) {
        const loop = [item];
        while (loop.length) {
          let loopItem = loop.shift();
          for (let lt of loopItem.panels) {
            let pnCtrlKeys = Object.keys(lt.controls);
            for (let pnCtrlKey of pnCtrlKeys) {
              let pnCtrl = lt.controls[pnCtrlKey];
              if (pnCtrl.type === FormControlType.Sheet) {
                this.synchronizationRules(pnCtrl);
                for (let cl of pnCtrl.columns) {
                  this.synchronizationRules(cl, pnCtrl.key);
                }
              } else if (pnCtrl.type === FormControlType.Tabs) {
                loop.push(pnCtrl);
              } else {
                this.synchronizationRules(pnCtrl);
              }
            }
          }
        }
      } else {
        this.synchronizationRules(item);
      }
    }

    for (const row of layout) {
      for (const key of row) {
        if (keys.indexOf(key) === -1) {
          deleteKeys.push(key);
        }
      }
    }

    for (const key of deleteKeys) {
      if (controls[key]) {
        this.cleanControlFormulaBy(controls, controls[key]);
      }
    }

    this.removeControlOf(deleteKeys, controls, layout);
    this.removeTabControlOf(tabDeleteKeys, controls);

    for (const key in controls) {
      const control = controls[key];

      // 旧数据多语言兼容

      // control.options.name_i18n = LanguageTransform.initNameI18n(control.options.name, control.options.name_i18n);

      // const globalName:string =  LanguageTransform.getLang(control.options.name, control.options.name_i18n);
      // control.options.name = globalName;

      if (control.type === FormControlType.Sheet) {
        const item = this.items.find((x) => x.code === control.key);
        control.columns = control.columns.filter(
          (val) => val.code !== FormControlType.SystemOther
        ); // 子表过滤 子表排序号
        if (item && item.properties) {
          // item.properties.forEach((res:any) => {
          //   const globalName:string =  LanguageTransform.getLang(control.name, control.name_i18n);
          //   res.name = globalName;
          // });

          const _deleteKeys = (control as FormSheet).columns
            .filter(
              (c) =>
                !(item.properties as any).some((p: any) => p.code === c.key)
            )
            .map((c) => c.key);
          this.removeSheetControlOf(control, _deleteKeys);
        }
      }
    }
    this.compatibleDateControls(controls); // 旧的最大最小值,兼容新的校验规则

    this.controls = ControlFactory.restoreOptions(controls);

    //初始化时，旧数据兼容到最新版本
    this.formData.draftAttributesJson = JSON.stringify(this.controls);

    this.layout = layout;

    this.onControlSelect(this.selectedControl.control)
  }

  // 用数据模型同步更新表单控件
  synchronizationRules(item: any, parentKey = null) {
    const type = ControlHelper.mapToDataItemType(item.type);
    let controls: any = this.getControlsByDataItemType(type);
    const source: any = controls.find((x) => x.code === item.key);
    if (type === DataItemType.ShortText) {
      if (source && source.noRepeat) {
        item.options.noRepeat = source.noRepeat;
      }
    }
    if (
      type === DataItemType.RelevanceForm ||
      type === DataItemType.RelevanceFormEx
    ) {
      if (source && source.relativeCode) {
        item.options.schemaCode = source.relativeCode;
      }
      if (source && source.relativePropertyCode) {
        item.options.displayField = source.relativePropertyCode;
      }
    }
    const transferAttributesArr: any[] = controlAttributeListMap[item.type];
    const attrList: any[] = Array.isArray(transferAttributesArr)
      ? transferAttributesArr.filter((x) => x.isRuleAttribute === 2)
      : [];
    const ruleList: any[] = Array.isArray(transferAttributesArr)
      ? transferAttributesArr.filter((x) => x.isRuleAttribute === 1)
      : [];
    let rules: any[] = this.formRuleList.filter(
      (x) => x.propertyCode === item.key
    );
    if (source) {
      const dataItem = this.findItemRecurse(this.dataItemList, item.key, parentKey);
      if (dataItem) {
        let draftSchemaOptions: any[] = [];
        let diff = -1;
        try {
          draftSchemaOptions = JSON.parse(this.formData.draftSchemaOptionsJson);
          if (Array.isArray(draftSchemaOptions)) {
            let findSchemaOptions = draftSchemaOptions.find(
              (x) => x.code === item.key
            );
            if (findSchemaOptions) {
              diff = moment(dataItem.modifiedTime).diff(
                moment(findSchemaOptions.lastModifyTime),
                "seconds"
              );
            }
          }
        } catch(err) {
          console.log(err);
        }
        if (diff !== 0) {
          // 同步数据项数据 覆盖表单数据
          if (dataItem.options) {
            try {
              let optionsObj: any = JSON.parse(dataItem.options);
              if (optionsObj) {
                attrList.forEach((x) => {
                  if (x.key === "format") {
                    if (CompareVersion(
                      this.version,
                      this.formSystemVersion
                    ) === 1) {
                      item.options["format1"] = optionsObj[x.key];
                    }
                  }

                  // lin
                  // console.log('q1', item.options)
                  // console.log('q2', optionsObj)
                  // if(item.type === 5) {
                  //   // 单选框类型
                  //   if(optionsObj.defaultValue) {
                  //     item.options.defaultValue = optionsObj.defaultValue
                  //   }
                  // }

                  item.options[x.key] = optionsObj[x.key];
                  // if(x.key === "format" && item.options[x.key] && !item.options['format1']){
                  //   item.options['format1'] = item.options[x.key]
                  // }
                });
              } else {
                attrList.forEach((x) => {
                  item.options[x.key] = "";
                });
              }
            } catch (err) {
              attrList.forEach((x) => {
                item.options[x.key] = "";
              });
            }
          } else {
            // 历史数据兼容
            attrList.forEach((x) => {
              if (x === "format" && item.options[x.key]) {
                item.options["format1"] = item.options[x.key];
                if (item.type === FormControlType.Number) {
                  item.options[x.key] = NumberFormatType.Int;
                } else if (item.type === FormControlType.Date) {
                  item.options[x.key] = "YYYY-MM-DD";
                }
              }
            });
          }
          ruleList.forEach((x) => {
            let findItem: any = rules.find(
              (rule) => rule.options && rule.options.indexOf(x.key) > -1
            );
            if (findItem && findItem.options) {
              try {
                let ruleOption: any = JSON.parse(findItem.options);
                if (ruleOption) {
                  item.options[x.key] = ruleOption[x.key];
                } else {
                  item.options[x.key] = "";
                }
              } catch (err) {
                item.options[x.key] = "";
              }
            } else {
              if(x.key === "noRepeat" || x.key === "isEmptyRow") {
                item.options[x.key] = false;
              } else {
                item.options[x.key] = "";
              }
            }
          });
        } else {
          // 保存或更新时根据当前项与数据模型比较, 构造属性、规则变更参数
          this.synchronizationRulesDataOthers(source, item);
        }
      }
    }
  }

  synchronizationRules2(item: any, source: any) {
    let controls: any = this.getControlsByDataItemType(source.type);
    const type = mapToControlType(source.type);
    let rules: any[] = this.formRuleList.filter(x => x.propertyCode === item.key);
    const transferAttributesArr: any[] = controlAttributeListMap[type];
    const attrList: any[] = Array.isArray(transferAttributesArr) ? transferAttributesArr.filter(x => x.isRuleAttribute === 2) : [];
    const ruleList: any[] = Array.isArray(transferAttributesArr) ? transferAttributesArr.filter(x => x.isRuleAttribute === 1) : [];
    if (item.type === DataItemType.ShortText) {
      if (source && source.noRepeat) {
        item.options.noRepeat = source.noRepeat;
      }
    }
    if (item.type === DataItemType.RelevanceForm || item.type === DataItemType.RelevanceFormEx) {
      if (source && source.relativeCode) {
        item.options.schemaCode = source.relativeCode;
      }
      if (source && source.relativePropertyCode) {
        item.options.displayField = source.relativePropertyCode;
      }
    }
    if(source) {
      if(source.options) {
        try {
          let optionsObj:any = JSON.parse(source.options);
          if (optionsObj) {
            attrList.forEach(x => {
              item.options[x.key] = optionsObj[x.key];
            })
          } else {
            attrList.forEach(x => {
              item.options[x.key] = '';
            })
          }
        } catch(err) {
          attrList.forEach(x => {
            item.options[x.key] = '';
          })
        }
      } else {

      }
    }
    ruleList.forEach(x => {
      let findItem: any = rules.find(rule => rule.options && rule.options.indexOf(x.key) > -1);
      if (findItem && findItem.options) {
        try {
          let ruleOption: any = JSON.parse(findItem.options);
          if (ruleOption) {
            item.options[x.key] = ruleOption[x.key];
          } else {
            item.options[x.key] = "";
          }
        } catch(err) {
          item.options[x.key] = '';
        }
      } else {
        item.options[x.key] = '';
      }
    })
  }

  // 新增时从控件中获取值同步更新到数据模型
  synchronizationRulesDataAdd(item: any, control: any) {
    const type = mapToControlType(item.type);
    let obj = Object.create(null);
    if (control) {
      const optionObj = control.options;
      if (optionObj) {
        const transferAttributesArr: any[] = controlAttributeListMap[type];
        const attrList: any[] = Array.isArray(transferAttributesArr)
          ? transferAttributesArr.filter((x) => x.isRuleAttribute === 2).filter(i => i.key !== 'options')
          : [];
        const ruleList: any[] = Array.isArray(transferAttributesArr)
          ? transferAttributesArr.filter((x) => x.isRuleAttribute === 1)
          : [];
        attrList.forEach((x) => {
          if (optionObj[x.key]) {
            obj[x.key] = optionObj[x.key];
          }
        });
        if (Object.keys(obj).length > 0) {
          item.options = JSON.stringify(obj);
        }
        ruleList.forEach((x) => {
          if (optionObj[x.key]) {
            this.onModelAttrRuleUpdate({
              type: "modelRuleColumns",
              key: item.code,
              field: x.key,
              parentKey: item.parentCode,
              value: optionObj[x.key],
            });
          }
        });
      }
    }
  }

  // 编辑时从控件从控件中获取值同步更新到数据模型 主要是构造bizDataRuleAdds、editProperties、deleteBizDataRuleIds参数
  synchronizationRulesDataOthers(item: any, control: any) {
    const type = mapToControlType(item.type);
    const transferAttributesArr: any[] = controlAttributeListMap[type];
    const attrList: any[] = Array.isArray(transferAttributesArr)
      ? transferAttributesArr.filter((x) => x.isRuleAttribute === 2)
      : [];
    const ruleList: any[] = Array.isArray(transferAttributesArr)
      ? transferAttributesArr.filter((x) => x.isRuleAttribute === 1)
      : [];
    let currentDataModelAttr: any = item.options;
    let currentAttrObj: any = null;
    let currentDataModelRules: any[] = this.formRuleList.filter(
      (x) => x.propertyCode === item.code
    );
    const controlOptions = control.options;

    attrList.forEach((x) => {
      this.onModelAttrRuleUpdate({
        type: "modelAttributeColumns",
        key: item.code,
        field: x.key,
        parentKey: item.parentCode ? item.parentCode : '',
        value: controlOptions[x.key],
      })
    });

    ruleList.forEach((x) => {
      this.onModelAttrRuleUpdate({
        type: "modelRuleColumns",
        key: item.code,
        field: x.key,
        parentKey: item.parentCode ? item.parentCode : '',
        value: controlOptions[x.key],
      })
    })

  }

  getControlsByDataItemType(type: DataItemType) {
    let typeControls: Array<any> = [];
    this.items.forEach((item: any) => {
      if (item.type === type) {
        typeControls.push(item);
      } else if (item.type === DataItemType.Sheet) {
        if (Array.isArray(item.properties)) {
          let list: Array<any> = item.properties.filter(
            (i: any) => i.type === type
          );
          typeControls.push(...list);
        }
      }
    });
    return typeControls;
  }

  // 收集tab中已经删除的数据项
  lostTabDataItem(tabItem: any) {
    let pannels = tabItem.panels;
    let delItem: any = [];
    const itemCodes = this.items.map((x) => x.code);
    for (let pannel of pannels) {
      let ctrls = pannel.controls;
      let layout = pannel.layout;
      for (let ctrlKey of Object.keys(ctrls)) {
        let ctrl = ctrls[ctrlKey];
        switch (ctrl.type) {
          case FormControlType.ApprovalOpinion:
            delItem.push({ ctrl: ctrls, key: ctrlKey });
            break;
          case FormControlType.Tabs:
            let dItem = this.lostTabDataItem(ctrl);
            delItem = [...delItem, ...dItem];
            break;
          case FormControlType.Sheet:
            const theSheet: any = this.items.find((it) => it.code === ctrl.key);
            if (theSheet) {
              const sheetItems = theSheet.properties.map((x) => x.code);
              ctrl.columns.forEach((res) => {
                if (!sheetItems.includes(res.key)) {
                  delItem.push({ ctrl: ctrls, key: `${ctrl.key}.${res.key}` });
                }
              });
              break;
            }
          default:
            if (
              !ControlFactory.notDataItemOf(ctrl.type) &&
              !~itemCodes.indexOf(ctrl.key)
            ) {
              delItem.push({ ctrl: ctrls, key: ctrlKey });
              let p = -1;
              let c = -1;
              layoutTag: for (let i1 = 0, l1 = layout.length; i1 < l1; i1++) {
                for (let i2 = 0, l2 = layout[i1].length; i2 < l2; i2++) {
                  let k = layout[i1][i2];
                  if (k === ctrlKey) {
                    p = i1;
                    c = i2;
                    break layoutTag;
                  }
                }
              }
              // 删除 layout中的 控制key
              if (~p && ~c) {
                if (pannel.layout[p].length === 1) {
                  pannel.layout.splice(p, 1);
                } else {
                  pannel.layout[p].splice(c, 1);
                }
              }
            }
        }
      }
    }
    return delItem;
  }

  // 删除tab中的控制器
  removeTabControlOf(tabDeleteKeys, controls) {
    for (let keys of tabDeleteKeys) {
      let { ctrl, key } = keys;
      if (key.indexOf(".") > -1) {
        const keyArr = key.split(".");
        ctrl[keyArr[0]].columns = ctrl[keyArr[0]].columns.filter((res) => {
          return res.key !== keyArr[1];
        });
      } else {
        delete ctrl[key];
      }
    }
  }

  // 兼容 日期控件 旧的 大小值 和 新的校验规则
  // 如果 旧数据 maxDate 和 minDate数据类型不同(一个是固定值,一个是数据项)则在新的校验规则弹框不做处理
  compatibleDateControls(ctr) {
    if (!ctr) return;
    for (let key of Object.keys(ctr)) {
      let val = ctr[key];
      if (val.type === DataItemType.Date) {
        let opt = val.options;
        if (opt.maxDate || opt.minDate) {
          let arr: string[] = [];
          if (opt.maxDate && opt.minDate) {
            if (~opt.maxDate.indexOf("{") && ~opt.minDate.indexOf("{")) {
              // max min 都是数据项
              let maxDateKey = opt.maxDate.replace(/^{|}$/g, "");
              let minDateKey = opt.minDate.replace(/^{|}$/g, "");
              if (ctr[maxDateKey] && ctr[minDateKey]) {
                arr = [
                  `type:2`,
                  `rule:~`,
                  `lSelect:${minDateKey}`,
                  `rSelect:${maxDateKey}`,
                  `day:0`,
                  `defaultPrompt:${opt.name}必须介于${ctr[minDateKey].options.name}~${ctr[maxDateKey].options.name}`,
                ];
              }
            } else if (
              !~opt.maxDate.indexOf("{") &&
              !~opt.minDate.indexOf("{")
            ) {
              // max min 都是字符串
              arr = [
                `type:1`,
                `rule:~`,
                `lDate:${opt.minDate}`,
                `rDate:${opt.maxDate}`,
                `defaultPrompt:${opt.name}必须介于${opt.minDate}~${opt.maxDate}`,
              ];
            }
          } else if (opt.maxDate && !opt.minDate) {
            if (~opt.maxDate.indexOf("{")) {
              // max 是数据项
              let maxDateKey = opt.maxDate.replace(/^{|}$/g, "");
              if (ctr[maxDateKey]) {
                arr = [
                  `type:2`,
                  `rule:<=`,
                  `select:${opt.maxDate.replace(/^{|}$/g, "")}`,
                  `day:0`,
                  `defaultPrompt:${opt.name}必须小于等于${ctr[maxDateKey].options.name}`,
                ];
              }
            } else {
              // max 是字符串
              arr = [
                `type:1`,
                `rule:<=`,
                `date:${opt.maxDate}`,
                `defaultPrompt:${opt.name}必须小于等于${opt.maxDate}`,
              ];
            }
          } else if (!opt.maxDate && opt.minDate) {
            if (~opt.minDate.indexOf("{")) {
              // min 是数据项
              let minDateKey = opt.minDate.replace(/^{|}$/g, "");
              if (minDateKey) {
                arr = [
                  `type:2`,
                  `rule:>=`,
                  `select:${opt.minDate.replace(/^{|}$/g, "")}`,
                  `day:0`,
                  `defaultPrompt:${opt.name}必须大于等于${ctr[minDateKey].options.name}`,
                ];
              }
            } else {
              // min 是字符串
              arr = [
                `type:1`,
                `rule:>=`,
                `date:${opt.minDate}`,
                `defaultPrompt:${opt.name}必须大于等于${opt.minDate}`,
              ];
            }
          }
          let obj = {};
          for (let item of arr) {
            let [k, v] = item.split(":");
            obj[k] = v;
          }
          opt.verifyFormula = JSON.stringify(obj);
          opt.maxDate = "";
          opt.minDate = "";
        }
      }
    }
  }

  /**
   * 移除
   */
  removeSheetControlOf(control: FormSheet, deleteKeys: string[]) {
    const idxs = control.columns
      .map((c, i) => (deleteKeys.indexOf(c.key) > -1 ? i : -1))
      .filter((i) => i > -1)
      .reverse();

    idxs.forEach((i) => {
      const c = control.columns.splice(i, 1)[0];
      if (c.type === FormControlType.Number && control.statistics) {
        const idx = control.statistics.findIndex((s) => s.columnKey === c.key);
        control.statistics.splice(idx, 1);
      }
    });
  }

  /**
   * 移除表单控件
   */
  removeControlOf(
    deleteKeys: string[],
    controls: any,
    layout: Array<string[]>
  ) {
    deleteKeys.forEach((k) => {
      delete controls[k];
    });

    for (const row of layout) {
      if (typeof row[0] === "string") {
        const idxs = row
          .map((x, i) => (deleteKeys.indexOf(x) > -1 ? i : -1))
          .filter((i) => i > -1)
          .reverse();
        if (idxs.length > 0) {
          idxs.forEach((i) => row.splice(i, 1));
        }
      }
    }

    const idxs = layout
      .map((x, i) => (x.length === 0 ? i : -1))
      .filter((i) => i > -1)
      .reverse();

    if (idxs.length > 0) {
      idxs.forEach((i) => layout.splice(i, 1));
    }
  }

  /**
   * 自动布局
   */
  autoLayout() {
    const items = this.items.filter((x) => x.published || x.isSystem || x.code === "parentId");
    // const items = this.items.filter((x) => x.published || x.isSystem);
    const bizItems = this.items.filter((x) => !x.isSystem);
    if (bizItems.length === 0) {
      this.showDragTips = true;
    }
    if (items.length === 0) {
      return;
    }
    const schemaCode = this.$route.params.bizSchemaCode;

    const [controls, layout] = ControlFactory.autoLayout(this.formData, items);

    this.controls = controls;
    this.layout = layout;
  }

  /**
   * 设置提示控件显示
   */
  setShowDragTips(type: string) {
    if (type === "add") {
      this.showDragTips = false;
    } else {
      if (Object.keys(this.controls).length === 1) {
        this.showDragTips = true;
      }
    }
  }

  editFormDataAttribute(field: string, value: any) {
    let tmp: any = {};

    tmp[field] = value;

    if (field === "name") {
      const obj: any = LanguageTransform.setLang(
        value,
        this.formData.name_i18n
      );

      tmp = obj;
    }

    this.formData = Object.assign({}, this.formData, tmp);
  }
  /**
   * 历史版本
   */
  historyView() {
    this.$router
      .push({
        name: "versionList",
        params: {
          appCode: this.$route.params.appCode,
          bizSchemaCode: this.$route.params.bizSchemaCode,
          sheetCode: this.$route.params.sheetCode,
        },
      })
      .catch((err: any) => {
        err;
      });
  }
  /**
   * 预览
   */
  preview() {
    const controls = JSON.parse(JSON.stringify(this.controls));
    const layout = JSON.parse(
      JSON.stringify((this.$refs.designer as Designer).getLayout())
    );

    this.viewData = {
      controls,
      layout,
      layoutType: this.formData.layoutType
        ? this.formData.layoutType
        : "horizontal",
      borderMode: this.formData.borderMode ? this.formData.borderMode : "close",
    };
    this.showPreview = true;
  }
  hidePreview() {
    this.showPreview = false;
  }
  newTemplateExport() {
    return new TemplateExport({
      configure: JSON.parse(JSON.stringify(this.controls)),
      layout: JSON.parse(JSON.stringify(this.layout)),
    });
  }

  /**
   * 导出
   */
  exportForm() {
    this.newTemplateExport().getHTMLFile();
  }

  /**
   * 发布
   */
  async publish() {
    try {
      await this.parseHTML();
    } catch {
      // 如果有错误停留在编辑器界面
      return;
    }

    const keys = Object.keys(this.controls);

    let RelevanceFormsError:any[] = [] // 未选择业务模型
    let DispalyModeListError:any[] = [] // 未选择查询列表
    let FieldCodeError:any[] = [] //未选择关联字段
    for (const key of keys) {
      const control = this.controls[key];
      if (
        control.type === FormControlType.RelevanceForm ||
        control.type === FormControlType.RelevanceFormEx
      ) {
        if (!control.options.schemaCode) {
          // this.$message.error(`${control.options.name}未选择业务模型`);
          // return;
          RelevanceFormsError.push(control && control.options && control.options.name || '')
        }
      }

      if (control.type === FormControlType.ReverseRelevance) {
        const opts = control.options as ReverseRelevanceOptions;

        if (!opts.schemaCode) {
          // this.$message.error(`${control.options.name}未选择业务模型`);
          // return;
          RelevanceFormsError.push(control && control.options && control.options.name || '')
        }

        if (!opts.fieldCode) {
          // this.$message.error(`${control.options.name}未选择关联字段`);
          // return;
          FieldCodeError.push(control && control.options && control.options.name || '')
        }

        if (opts.displayMode === DispalyMode.List && !opts.listCode) {
          // this.$message.error(`${control.options.name}未选择查询列表`);
          // return;
          DispalyModeListError.push(control && control.options && control.options.name || '')
        }
      }




      if (control.type === FormControlType.Sheet) {
        const sheet = control as FormSheet;
        for (const col of sheet.columns) {
          if (
            col.type === FormControlType.RelevanceForm ||
            col.type === FormControlType.RelevanceFormEx 
          ) {
            if (!col.options.schemaCode) {
              // this.$message.error(`${col.options.name}未选择业务模型`);
              // return;
              RelevanceFormsError.push(control && control.options && control.options.name || '')
            }
          }
        }
      }
    }
    let res = ''
    if(RelevanceFormsError.length){
      res += RelevanceFormsError.map(el => `【${el}】`).join('') + '未选择业务模型'
    }
    if(DispalyModeListError.length){
      res += DispalyModeListError.map(el => `【${el}】`).join('') + '未选择查询列表'
    }
    if(FieldCodeError.length){
      res += FieldCodeError.map(el => `【${el}】`).join('') + '未选择关联字段'
    }

    if(res){
      this.$message.error(res)
      return
    }

    // const controls = ControlFactory.trimOptions(this.controls);
    const controls = this.controls;

    Object.values(controls).forEach(item => {
      let options = item.options
      if(options && options.dictionariesData){
        let dictionariesData = JSON.parse(options.dictionariesData).useDictionariesData
        let useOptions = options.options.split(';')
        if(dictionariesData.length !== useOptions.length || !dictionariesData.every(el => useOptions.includes(el.name))){
          item.options.dictionariesData = ''
        }
      }
      // 数值和时间、创建时间、修改时间控件显示格式开启了同步默认值
      if([3, 4, 104, 105].includes(item.type) && options.syncFormate){
        options.format1 = options.format
      }
    })

    // 子表
    // const arr = Object.keys(controls).filter(item => item.startsWith('Sheet'));
    // arr.map(item => {
    //   // @ts-ignore
    //   let columns = controls[item].columns;
    //   if(columns.length > 0) {
    //       columns.map(i => {
    //         console.log(i)
    //         if(i.options.dataLinkage) {
    //           let dataLinkage = JSON.parse(i.options.dataLinkage)
    //           dataLinkage.fillProperty = `{${i.parentKey}.${dataLinkage.fillProperty.split('.')[1]}`
    //           i.options.dataLinkage = JSON.stringify(dataLinkage)
    //         }
    //       })
    //     }
    // })

    this.formData.publishedAttributesJson = JSON.stringify(controls);

    const layout = (this.$refs.designer as Designer).getLayout();
    this.formData.publishedViewJson = JSON.stringify(layout);

    this.formData.draftAttributesJson = this.formData.publishedAttributesJson;
    this.formData.draftViewJson = this.formData.publishedViewJson;
    this.formData.tempAuthSchemaCodes = this.setTempAuthSchemaCodes();

    if (this.actions) {
      this.formData.draftActionsJson = this.formData.publishedActionsJson =
        JSON.stringify(this.actions);
    }

    if (this.elements) {
      this.formData.draftHtmlJson = this.formData.publishedHtmlJson =
        JSON.stringify(this.elements);
    }

    const versionChangedMsg = this.$t("languages.versionChanged").toString();

    // 在发布之前调用checkVersion接口
    appsApi
      .checkVersion({
        schemaCode: this.$route.params.bizSchemaCode,
        sheetCode: this.$route.params.sheetCode,
        version: this.getCurrentVersion,
      })
      .then((res: any) => {
        if (res.errcode === 0) {
          let v: any = parseInt(res.data);
          if (isNaN(v)) {
            v = 0;
          }
          let cv: any = parseInt(this.getCurrentVersion);
          if (isNaN(cv)) {
            cv = 0;
          }
          if (v > cv) {
            this.$message.info(versionChangedMsg.replace("$", v));
          }
        } else {
          // checkVersion接口 失败不做任何操作
          console.log(res.errmsg);
        }
      })
      .catch((err: any) => {
        console.log(err);
      });

    this.updateFormData(this.formData);

    this.isShowPublishModal = true;
  }

  postPublish() {
    if (this.isPublishClick) {
      return;
    }
    this.isPublishClick = true;
    if (this.publishDesc.trim() === "") {
      this.$message.error("请填写发布说明");
      this.isPublishClick = false;
      return;
    }
    const msg = this.$t("languages.PublishSuccess").toString();
    this.updateForm(true, msg)
      .then(() => {
        this.getFormRuleList();
        this.bizDataRuleAdds = [];
        this.deleteBizDataRuleIds = [];
        this.editProperties = [];
        this.clearLocalHistory();
        this.isShowPublishModal = false;
        /* 1.模拟鼠标点击选中控件 2.给选中控件的状态设置为已发布 */
        if (this.selectedControl["dataItem"]) {
          this.onControlSelect((this.selectedControl as any).control);
          this.selectedControl["dataItem"].published = true;
        }
        /* 刷新右侧表单属性 */
        (this.$refs.formAttributeLayout as any).initData();
        this.isPublishClick = false;
      })
      .catch((err) => {
        this.isShowPublishModal = false;
        this.isPublishClick = false;
        console.log(err);
      });
  }

  /**
   * 清理本地缓存的tip信息
   */
  clearLocalHistory() {
    let transferOpRecord: any = window.localStorage.getItem("transferOpRecord");
    if (transferOpRecord) {
      let userStr = window.sessionStorage.getItem("user");
      if (userStr) {
        let user: any = JSON.parse(userStr);
        let transferOpObj: any = JSON.parse(transferOpRecord);
        if (transferOpObj && transferOpObj[user.id]) {
          let keyStr = `${this.$route.params.bizSchemaCode}|${this.$route.params.sheetCode}`;
          if (transferOpObj[user.id].hasOwnProperty(keyStr)) {
            delete transferOpObj[user.id][keyStr];
          }
        }
        window.localStorage.setItem(
          "transferOpRecord",
          JSON.stringify(transferOpObj)
        );
      }
    }
  }

  /**
   * 还原
   */
  restore() {
    const _this = this;
    this.$confirm({
      title: this.$t("languages.Apps.FormDesignPage.RestoreTitle").toString(),
      content: this.$t(
        "languages.Apps.FormDesignPage.RestoreContent"
      ).toString(),
      okText: this.$t("languages.Apps.Ok").toString(),
      cancelText: this.$t("languages.Apps.Cancel").toString(),
      onOk() {
        _this.autoLayout();
        // _this.publish();
      },
    });
  }

  async onSave(throwError = false) {
    try {
      await this.parseHTML();
    } catch {
      if (throwError) {
        throw new Error();
      } else {
        // 如果有错误停留在编辑器界面
        return;
      }
    }

    return this.save().then(() => {
      // setTimeout(() => location.reload(), 1000);
      this.load();
      this.getDataItemList();
      this.isShowTips = true;
      return;
    });
  }

  /**
   * 保存
   */
  save() {
    // const controls = ControlFactory.trimOptions(this.controls);
    const controls = this.controls;

    this.formData.tempAuthSchemaCodes = this.setTempAuthSchemaCodes();

    this.formData.draftAttributesJson = JSON.stringify(controls);
    this.formData.draftViewJson = JSON.stringify(
      (this.$refs.designer as Designer).getLayout()
    );

    if (this.actions) {
      this.formData.draftActionsJson = JSON.stringify(this.actions);
    }

    if (this.elements) {
      this.formData.draftHtmlJson = JSON.stringify(this.elements);
    }

    const msg = this.$t("languages.SaveSuccess").toString();

    this.isPublishClick = false;

    this.updateFormData(this.formData);

    return this.updateForm(false, msg);
  }
  /**
   * 设置临时授权code
   */
  setTempAuthSchemaCodes(): string {
    const controls = this.controls;
    const relevanceForms: FormControl[] = [];
    for (const key in controls) {
      const ctrl = controls[key];
      if (
        (ctrl.type === FormControlType.RelevanceForm ||
          ctrl.type === FormControlType.RelevanceFormEx) &&
        ctrl.options.isAuthorize
      ) {
        relevanceForms.push(controls[key]);
      }

      if (ctrl.type === FormControlType.Sheet) {
        const columns = (ctrl as any).columns;
        columns.forEach((item) => {
          if (
            (item.type === FormControlType.RelevanceForm ||
              item.type === FormControlType.RelevanceFormEx) &&
            item.options.isAuthorize
          ) {
            relevanceForms.push(item);
          }
        });
      }
    }
    return relevanceForms
      .map((res) => {
        return `${res.options.schemaCode}_${res.options.queryCode}`;
      })
      .join(",");
  }

  /**
   * 发布或保存表单
   */
  updateForm(isPublish: boolean, msg: string) {
    const _this = this;
    const hideLoader = (this.$message as any).loading();
    const data = this.formData as any;

    if (this.publishDesc) {
        data.remarks = this.publishDesc;
      }

      if (this.dataItemDeletes.length) {
        data.deleteProperties = this.dataItemDeletes;
      }
      const addCodes = Object.keys(this.dataItemAdds);
      if (addCodes.length) {
        const schemaCode = this.$route.params.bizSchemaCode;
        data.properties = addCodes.map((code) => {
          let item = this.dataItemAdds[code];
          let control = recursionSearch(this.controls, item.code);
          this.synchronizationRulesDataAdd(item, control);
          // @ts-ignore
          let option = typeof item.options === 'string' ? item.options : item.options ? JSON.stringify(item.options) : null;
          if(!option && (item.formPropertyType===5||item.formPropertyType===6) && control.options && control.options.options){
            option = {"defaultValue":"","options":control.options.options};
            option = JSON.stringify(option);
          }
          const obj: any = {
            schemaCode,
            id: item.id,
            code: item.code,
            name: item.name,
            name_i18n: null,
            propertyType: item.type,
            propertyIndex: item.propertyIndex || false,
            propertyEmpty: item.propertyEmpty || false,
            relativeCode: item.relativeCode,
            relativePropertyCode: item.relativePropertyCode || "",
            options: option,
            subSchema: {
              properties: new Array<any>(),
            },
          };

          if (item.name_i18n) {
            if (typeof item.name_i18n === "string") {
              obj.name_i18n = item.name_i18n;
            } else {
              obj.name_i18n = JSON.stringify(item.name_i18n);
            }
          }

          if (!item.properties) {
            return obj;
          }

          if (Array.isArray(item.properties)) {
            // let parentControl: any = this.controls[item.code];
            // 下拉多选新增赋值失败问题
            obj.subSchema.properties = item.properties
              .filter((p) => !p.isSystem)
              .map((p: any) => {
                if (Array.isArray(control.columns)) {
                  let subControl: any = control.columns.find(x => {
                    return x.key === p.code
                  })
                  this.synchronizationRulesDataAdd(p, subControl);
                }

                let ob: any = {
                  schemaCode: p.parentCode,
                  id: p.id,
                  code: p.code,
                  name: p.name,
                  // name_i18n: p.name_i18n,
                  relativeCode: p.relativeCode,
                  propertyType: p.type,
                  propertyIndex: p.propertyIndex || false,
                  propertyEmpty: p.propertyEmpty || false,
                  relativePropertyCode: p.relativePropertyCode || "",
                  // @ts-ignore
                  options: p.options
                };

                if (p.name_i18n) {
                  if (typeof p.name_i18n === "string") {
                    ob.name_i18n = p.name_i18n;
                  } else {
                    ob.name_i18n = JSON.stringify(p.name_i18n);
                  }
                }
                return ob;
              }) as any;
          }
          return obj;
        });
      } else {
        data.properties = [];
        // 将表单控件中的项同步更新到规则和属性中
      }

      if (isPublish && this.bizDataRuleAdds.length) {
        data.bizDataRuleModels = this.bizDataRuleAdds;
      }

      if (isPublish && this.deleteBizDataRuleIds.length) {
        data.deleteBizDataRuleIds = this.deleteBizDataRuleIds;
      }

      if (isPublish && this.editProperties.length) {
        data.editProperties = this.editProperties;
      }

      if (this.draftSchemaOptions.length) {
        data.draftSchemaOptionsJson = JSON.stringify(this.draftSchemaOptions);
        console.log("当前提交的draftSchemaOptionsJson：", data.draftSchemaOptionsJson);
      }

      // if(isPublish){
      //   console.log(data)
      //   data.isPublish = isPublish
      //   debugger
      // }
      data.isPublish = isPublish

      const p = isPublish ? formApi.publish(data) : formApi.update(data);

      return p.then(
        (res) => {
          // hideLoader();
          this.clearTempDataItem();
          setTimeout(()=> {
            this.reload(); // 刷新数据项--防止后台数据同步到数据模型前加载旧数据，覆盖当前数据
          },300)
          if (isPublish && res.data) {
            _this.$message.success(
              `版本（Version ${res.data}）表单发布成功！`,
              0.5
            );
          } else {
            _this.$message.success(msg);
          }
          // _this.$message.success(msg);
          if (data.properties.length !== 0 && this.isPublishClick) {
            this.isPublishClick = false;
            _this.showPublichTips();
          }
          return res;
        },
        (res) => {
          hideLoader();
          if (
            res.errcode === 301005 &&
            Array.isArray(res.data) &&
            res.data.length > 0
          ) {
            _this.clearAndPublish(res.data, isPublish, msg);
          } else if (res.errmsg) {
            _this.$message.error(res.errmsg);
          }
          return Promise.reject(new Error());
        }
      );
  }

  showPublichTips() {
    this.publicDescription = [
      "您新增加了数据项，如果在流程中使用请重新发布流程",
    ];
  }

  onClosePublicTips() {
    this.publicDescription = [];
  }

  /**
   * 清理已被删除的数据项并发布
   */
  clearAndPublish(
    deletedDataItemCodes: string[],
    isPublish: boolean,
    msg: string
  ) {
    const dataItems = this.items;

    const names = deletedDataItemCodes
      .map((code) => {
        const idx = code.indexOf(".");
        if (idx === -1) {
          const item = dataItems.find((x) => x.code === code);
          return item ? item.name : null;
        }
        const parentCode = code.substring(0, idx);
        const childCode = code.substring(idx + 1);
        const item = dataItems.find((x) => x.code === parentCode);
        if (!item || !item.properties) {
          return null;
        }
        const childItem = item.properties.find((p) => p.code === childCode);
        if (!childItem) {
          return null;
        }
        return `${item.name}.${childItem.name}`;
      })
      .filter((n) => !!n)
      .join("、");

    if (!names) {
      return;
    }

    const _this = this;

    const clear = () => {
      deletedDataItemCodes
        .filter((code) => code.indexOf(".") < 0)
        .forEach((code) => {
          _this.removeControlOf(
            deletedDataItemCodes,
            _this.controls,
            _this.layout
          );
        });

      deletedDataItemCodes
        .filter((code) => code.indexOf(".") > -1)
        .forEach((code) => {
          const idx = code.indexOf(".");
          const parentCode = code.substring(0, idx);
          const childCode = code.substring(idx + 1);
          const sheet = _this.controls[parentCode] as FormSheet;
          if (!sheet) {
            return;
          }
          _this.removeSheetControlOf(sheet, [childCode]);
        });
    };

    this.$confirm({
      content: this.$t("languages.Apps.FormDesignPage.PublishError", {
        name: names,
      }).toString(),
      okText: this.$t("languages.Apps.Ok").toString(),
      cancelText: this.$t("languages.Apps.Cancel").toString(),
      onOk() {
        clear();
        _this.publish();
      },
    });
  }

  /**
   * 询问是否保存
   */
  confirmSave() {
    const _this = this;
    this.showUnsaveConfirm = true;

    return new Promise((resolve, reject) => {
      this.saveConfirmPromiseResolve = resolve;
      this.saveConfirmPromiseReject = reject;
    });

    // return new Promise((resolve, reject) => {
    //   _this.$confirm({
    //     title: _this.$t("languages.Apps.FormDesignPage.UnsaveContent"),
    //     okText: _this.$t("languages.Apps.SaveAndLeave"),
    //     cancelText: _this.$t("languages.Apps.Unsave"),
    //     onOk() {
    //       _this.save().then(() => resolve(), () => reject());
    //     },
    //     onCancel() {
    //       resolve();
    //     }
    //   });
    // });
  }

  handleConfirmCancel() {
    this.showUnsaveConfirm = false;
    if (this.saveConfirmPromiseReject) {
      this.saveConfirmPromiseReject();
      this.saveConfirmPromiseReject = null;
    }
  }

  handleConfirmUnsave() {
    this.showUnsaveConfirm = false;
    if (this.saveConfirmPromiseResolve) {
      this.saveConfirmPromiseResolve();
      this.saveConfirmPromiseResolve = null;
    }
  }

  handleConfirmOk() {
    this.save().then(
      () => {
        this.handleConfirmUnsave();
      },
      () => {
        this.handleConfirmCancel();
      }
    );
  }

  onModelAttrRuleUpdate(params: any) {
    console.log(params, this.controls)
    if(params.field === "maxLength" && this.controls[params.key]) {
      if(Number(params.value) < this.controls[params.key].options.defaultValue.length) {
        this.$message.error('默认值超出最大限制,设置不生效')
        return
      }
    }
    if (params) {
      let obj = {};
      obj[params.field] = params.value;
      let controlKey = params.key;
      let schemaCode = this.$route.params.bizSchemaCode;
      let findControlItem: any = null;

      if (params.parentKey) {
        findControlItem = this.findItemRecurse(this.dataItemList, controlKey, params.parentKey);
      } else {
        findControlItem = this.findItemRecurse(this.dataItemList, controlKey);
      }
      if(["sequenceNo"].includes(params.key) && Array.isArray(params.modelAttributeColumns)){
        let res = {}
        params.modelAttributeColumns.forEach((el:any) => {
          res[el.field] = el.value || el.default
        });
        findControlItem.options = JSON.stringify(res)
      }
      if (findControlItem) {
        // 修改操作
        if (findControlItem.parentCode) {
          schemaCode = findControlItem.parentCode;
        } else if (params.parentKey) {
          schemaCode = params.parentKey;
        }
        // 记录当前数据项的修改时间
        let cachedIndex: any = this.draftSchemaOptions.findIndex(
          (x) => x.code === controlKey
        );
        if (cachedIndex !== -1) {
          this.draftSchemaOptions.splice(cachedIndex, 1, {
            code: controlKey,
            lastModifyTime: findControlItem.modifiedTime,
          });
        } else {
          this.draftSchemaOptions.push({
            code: controlKey,
            lastModifyTime: findControlItem.modifiedTime,
          });
        }
      } else {
        if (params.parentKey) {
          schemaCode = params.parentKey
        }
      }
      if (params.type === "modelAttributeColumns") {
        console.log("modelAttributeColumns", this.dataItemList);
        let iIndex: number = -1;
        let findItem: any = this.editProperties.find((item, index) => {
          if (params.parentKey) {
            if (item.code === controlKey && item.schemaCode === params.parentKey) {
              iIndex = index;
              return true;
            } else {
              return false;
            }
          } else {
            if (item.code === controlKey) {
              iIndex = index;
              return true;
            } else {
              return false;
            }
          }
          
        });
        if (findItem) {
          if (findItem.options) {
            try {
              let optionObj: any = JSON.parse(findItem.options);
              optionObj = Object.assign(optionObj, obj);
              findItem.options = JSON.stringify(optionObj);
            } catch (err) {
              findItem.options = null;
            }
          } else {
            findItem.options = JSON.stringify(obj);
          }
          this.editProperties.splice(iIndex, 1, findItem);
        } else {
          if (findControlItem) {
            let cloneItem = cloneDeep(findControlItem);
            if (cloneItem) {
              if (cloneItem.options) {
                try {
                  let optionObj: any = JSON.parse(cloneItem.options);
                  optionObj = Object.assign(optionObj, obj);
                  cloneItem.options = JSON.stringify(optionObj);
                } catch (err) {
                  cloneItem.options = null;
                }
              } else {
                cloneItem.options = JSON.stringify(obj);
              }
            }
            this.editProperties.push(cloneItem);
          } else {
            let currentItemAdd: any = this.dataItemAdds[controlKey];
            if (currentItemAdd) {
              if (currentItemAdd.options) {
                try {
                  let optionObj: any = JSON.parse(currentItemAdd.options);
                  optionObj = Object.assign(optionObj, obj);
                  currentItemAdd.options = JSON.stringify(optionObj);
                } catch (err) {
                  currentItemAdd.options = null;
                }
              } else {
                currentItemAdd.options = JSON.stringify(obj);
              }
            }
          }
        }
      } else {
        let checkType: any = 0;
        let dataRuleType: number = 0;
        switch (params.field) {
          case "regexp":
          case "regexpText":
            checkType = 1;
            dataRuleType = 1;
            break;
          case "verifyFormula":
            checkType = 2;
            dataRuleType = 1;
            break;
          case "isEmptyRow":
            checkType = 3;
            dataRuleType = 1;
            break;
          case "maxLength":
            checkType = 4;
            dataRuleType = 1;
            break;
          case "noRepeat":
            checkType = 5;
            dataRuleType = 1;
            break;
          case "displayFormula":
            checkType = null;
            dataRuleType = 3;
            break;
          case "requiredFormula":
            checkType = null;
            dataRuleType = 4;
            break;
          case "shortTextStitch":
            checkType = null;
            dataRuleType = 2;
            break;
        }
        let ruleItem: any = {
          propertyCode: controlKey,
          name: "",
          checkType,
          schemaCode,
          dataRuleType,
          options: JSON.stringify(obj),
        };
        console.log("onModelAttrRuleUpdate:", ruleItem, findControlItem, this.controls);
        // 校验数据项是新增还是编辑
        let existItem: any = this.formRuleList.find(
          (x) =>
            x.propertyCode === controlKey &&
            x.dataRuleType === dataRuleType &&
            x.checkType === checkType
        );
        if (existItem && !params.value) {
          console.log("清空规则----", params.field, params.value);
          // 存在且当前值为清空时， 这里暂时以传入的params.value为空作为表单清空规则的依据， 后续又发现继续补充完善 需要删除对应的规则
          let isDeleteIndex = this.deleteBizDataRuleIds.findIndex(
            (x) => x === existItem.id
          );
          if (isDeleteIndex === -1) {
            this.deleteBizDataRuleIds.push(existItem.id);
          }
          // 同时还要判断是否在bizDataRuleAdds中存在这样的记录 如果有， 一并删掉
          let iIndex = this.bizDataRuleAdds.findIndex((item, index) => {
            if (
              item.propertyCode === controlKey &&
              item.dataRuleType === dataRuleType &&
              item.checkType === checkType
            ) {
              return true;
            } else {
              return false;
            }
          });
          if(iIndex > -1) {
            this.bizDataRuleAdds.splice(iIndex, 1);
          }
        } else {
          if (existItem) {
            if (existItem.options === ruleItem.options) {
              return;
            }
            ruleItem.id = existItem.id;
          } else {
            if (!params.value) {
              return;
            }
          }
          let iIndex: number = -1;
          let findItem: any = this.bizDataRuleAdds.find((item, index) => {
            if (
              item.propertyCode === controlKey &&
              item.dataRuleType === dataRuleType &&
              item.checkType === checkType
            ) {
              iIndex = index;
              return true;
            } else {
              return false;
            }
          });
          if (findItem) {
            if (findItem.options) {
              try {
                let objOption: any = JSON.parse(findItem.options);
                obj = Object.assign(objOption, obj);
                ruleItem.options = JSON.stringify(obj);
              } catch (err) {}
            }
            this.bizDataRuleAdds.splice(iIndex, 1, ruleItem);
          } else {
            this.bizDataRuleAdds.push(ruleItem);
          }
        }
      }
    }
  }

  findItemRecurse(arr: any, code: string, parentCode = null) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (!parentCode) {
          if (item.code === code) return item;
        } else {
          if (item.code === code && item.schemaCode === parentCode) return item;
        }
        if (item.children && item.children.length) {
          const _item = this.findItemRecurse(item.children, code, parentCode);
          if (_item) return _item;
        }
      }
    }
  }

  findItemRecurse2(arr: any, code: string, parentCode = null) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (item.code === code && item.schemaCode === parentCode) {
          return item;
        } else {
          if (item.type === DataItemType.Sheet) {
            if (Array.isArray(item.properties)) {
              const _item = this.findItemRecurse2(item.properties, code, item.schemaCode);
              if (_item) return _item;
            }
          }
        }
      }
    }
  }

  // 对数据字典设置的options进行处理，处理为默认格式
  formatDictionariesOption() {
    try {
      let draft = JSON.parse(this.formData.draftAttributesJson)
      for(let key in draft) {
        const value: any = draft[key]
        // 处理但单选 多选 下拉多选 单行文本
        if((value.type === 5 || value.type === 6 || value.type === 7 ||  value.type === 19)&& value.options && value.options.options) {
          if(value.options.options.indexOf('useDictionariesDat') > 0) {
            let options = JSON.parse(value.options.options)
            let result = options.useDictionariesData.reduce((stat: any, item: any) => {
            stat.push(item.name)
              return stat
            }, []).join(";")
            value.options.options = result
          }
        }
      }
      return JSON.stringify(draft)
    } catch (error) {
      console.log(error)
      return ''
    }
  }

  created() {
    this.$message.config({
      maxCount: 1,
      duration: 3,
    });
  }

  @Watch("$i18n.locale")
  onLanguageChange() {
    if ((this.selectedControl as any).control) {
      this.onControlSelect((this.selectedControl as any).control);
    }
  }

  @Provide()
  getFormControls() {
    return this.controls;
  }

  @Provide()
  getControl() {
    return this.selectedControl.control;
  }

  @Provide()
  setDataitemUesdFor(
    controls: { [key: string]: schema.FormControl },
    used: boolean,
    key?: string
  ) {
    const fn = (k: string) => {
      this.setDataitemUsed(used, k);
      const c = controls[k] as FormSheet;

      if (c.type === FormControlType.Sheet && c.columns) {
        c.columns.forEach((col) => this.setDataitemUsed(used, c.key, col.key));
      } else if (c.type === FormControlType.Tabs) {
        const tabs = controls[k] as schema.FormTabs;
        tabs.panels.forEach((panel) =>
          this.setDataitemUesdFor(panel.controls, used)
        );
      }
    };

    if (key) {
      fn(key);
    } else {
      Object.keys(controls).forEach((k) => fn(k));
    }
  }

  @Provide()
  findControlByPath(path: string[], parents?: FormControl[]) {
    let control: FormControl | null = null;

    if (!path || path.length === 0) {
      return control;
    }

    let parent = this.controls[path[0]];

    const findChild = (c: FormControl, childKey: string) => {
      if (c.type === FormControlType.Sheet) {
        const sheet = c as FormSheet;
        let col;
        if (childKey.indexOf("stat-") > -1) {
          col = sheet.statistics.find((x) => x.key === childKey);
        } else {
          col = sheet.columns.find((x) => x.key === childKey);
        }
        return col;
      } else if (c.type === FormControlType.Tabs) {
        const tabs = c as FormTabs;
        const panel = tabs.panels.find((p) => p.key === childKey);
        return panel;
      } else if (c.type === FormControlType.TabsPanel) {
        const tabsPanel = c as schema.FormTabsPanel;
        const child = tabsPanel.controls[childKey];
        return child;
      }
    };

    if (parent) {
      let index = 1;
      while (index < path.length && parent) {
        if (parents) {
          parents.push(parent);
        }
        parent = findChild(parent, path[index++]);
      }

      control = parent;
    }

    return control;
  }

  @Provide()
  removeControlFromParent(key: string, path?: string[]) {
    if (path) {
      const parents: FormControl[] = [];
      const control = this.findControlByPath(path, parents);
      const parent = parents.pop();
      if (!control || !parent || parent.type !== FormControlType.TabsPanel) {
        return null;
      }

      const tabsPanel = parent as schema.FormTabsPanel;
      if (ControlFactory.removeItemromGrid(tabsPanel.layout, key)) {
        delete tabsPanel.controls[key];
        return control;
      }
    } else {
      if (ControlFactory.removeItemromGrid(this.layout, key)) {
        const control = this.controls[key];
        delete this.controls[key];
        return control;
      }
    }

    return null;
  }

  @Provide()
  copyDataItemFrom(control: FormControl, copyKey: string) {
    // 只有基础控件和子表需要选择数据项
    if (control.type >= 90 && control.type !== FormControlType.Sheet) {
      return;
    }

    let item =
      this.findDataItem(copyKey, control.parentKey, control) ||
      this.findUnSaveDataItem(copyKey, control.parentKey);

    // item = JSON.parse(JSON.stringify(item));
    item = cloneDeep(item);


    if (item) {
      item.code = control.key;
      item.published = false;
      let newName: any = (item.name += "1");
      if (control.type === 202) {
        // 描述说明最大2000
        item.name = newName.substring(0, 2000);
      } else {
        // 其他最大长度10
        item.name = newName.substring(0, 10);
      }
      delete item.id;
      if (control.type === FormControlType.Sheet && item.properties) {

        let sheetColumnsKeyCode = {}
        // @ts-ignore
        Array.isArray(control.columns) && control.columns.forEach(element => {
          sheetColumnsKeyCode[element.key] = element.copyKey
        });

        item.properties.forEach((p) => {
          p.published = false;
          p.parentCode = control.key;
          p.schemaCode = control.key;
          p.code = sheetColumnsKeyCode[p.code] || p.code
          delete p.id;
        });
      }
      this.onDataitemAdd(item);
    }
  }
}
</script>

<style lang="less">
@import "./form-design.less";
</style>
<style lang="less" scoped>
.tips {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 800;
}
.ant-modal-body {
  padding: 16px 24px;
}

.title-tip {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
.publicTips {
  width: 500px;
}
.design__preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background: #f4f6fc;
}
/deep/ .control-field > .logic:before {
  content: "";
}
/deep/ .location:before {
  content: "";
}
.form-design-content {
  /deep/.right {
    .h3-sider-body {
      overflow-x: hidden;
    }
  }
}
.desc-box {
  height: 223px;
  position: relative;
  .desc-num {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    text-align: right;
  }
  textarea {
    width: 100%;
    height: 100%;
    font-size: 14px;
    border: none;
    resize: none;
    outline: none;
  }
}
</style>


