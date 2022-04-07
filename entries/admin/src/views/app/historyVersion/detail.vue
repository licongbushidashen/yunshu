<template>
  <div class="form-design">
    <a-spin :spinning="isLoading" tip="Loading..." >
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
        <span>
          <a-button :disabled="true">
            <i class="icon aufontAll h-icon-all-leave-application-o"></i>历史版本
          </a-button>
          <!-- <a-button @click="restore" icon="reload">还原</a-button> -->
          <a-button :disabled="true">
            <i class="icon aufontAll h-icon-all-eye-o"></i>预览
          </a-button>

          <a-button icon="upload" :disabled="true">导出</a-button>

          <!-- <a-button @click="exportForm" icon="reload">还原</a-button> -->

          <a-button icon="save" :disabled="true">保存</a-button>

          <a-button type="primary" :disabled="true">
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
          @control-select="onControlSelect"
        ></designer>
        <h3-sider :options="rightSider" @resize="onSiderToggle">
          <FormProperty
            :formData="formData"
            :allControls="selectedControl"
            @edit-formdata-attribute="editFormDataAttribute"
            ref="formAttributeLayout"
          ></FormProperty>
        </h3-sider>
      </div>
    </a-spin>
  </div>
</template>


<script lang='ts'>
import { Store } from 'vuex';
import { Component, Vue, Prop, Watch, Provide } from 'vue-property-decorator';
import {
    State, Mutation, namespace
  } from 'vuex-class';
const FormHisModule = namespace('Apps/FormHis');
import { DataItemType } from '@cloudpivot/form/schema';
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
} from '@/components/apps/form-design/typings';

import * as ControlFactory from '@/components/apps/form-design/typings/control-factory';

import Editor from '@/components/apps/form-design/editor/editor.vue';

import H3Sider from '@/common/sider/sider.vue';

import { schema } from '@cloudpivot/form';

import { LanguageTransform } from '@/utils';
import FormDesignPanel from '@/components/apps/form-design/panels/form-design-panel.vue';
import FormProperty from './form-attr.vue';

import Designer from '@/components/apps/form-design/designer/designer.vue';

import {
  SynRelevanceFormDisplayField,
  SynSheetRelevanceFormDisplayField,
} from '@/components/apps/form-design/form-detail-service';

import appsApi from '@/apis/apps';

@Component({
  name: 'form-his-design',
  components: {
    FormDesignPanel,
    H3Sider,
    Designer,
    FormProperty,
    Editor: Editor
  },
})
export default class FormHisDesign extends Vue {
  @FormHisModule.Mutation('setCurHistory') setCurHistory: any;
  @FormHisModule.State('currentHistoty') currentHistoty: any;
  // 表单预览数据
  viewData: any;
  views: any = [
    {
      value: 'web',
      text: 'web端设计',
    },
    {
      value: 'mobile',
      text: '移动端设计',
    },
    {
      value: 'editor',
      text: 'HTML',
    },
  ];

  showDragTips: boolean = false;

  isShowTips: boolean = false;

  isLoading: boolean = false;

  isSubTips: boolean = false;

  isShowPublicTips: boolean = false;

  publicDescription: Array<string> = [];

  controls: { [key: string]: FormControl } = {};

  layout: string[][] = [];

  actions: Array<schema.FormAction> = [];

  elements: Array<schema.FormElement> = [];

  dataItemAdds: {
    [code: string]: DataItem;
  } = {} as any;

  dataItemDeletes: string[] = [];

  // 判断是否组件是否需要设置margin
  clacMargin: string[] = ['left', 'right'];

  formData: any = {};

  selectedControl: any = {};

  viewType = 'web';

  leftSider = {
    width: 238,
    minWidth: 238,
    maxWidth: 700,
    direction: 'left',
    collapsible: true,
  };

  rightSider = {
    width: 276,
    minWidth: 276,
    maxWidth: 700,
    direction: 'right',
    collapsible: true,
  };

  tpl = '';

  editorOptions = {};

  showUnsaveConfirm = false;

  saveConfirmPromiseResolve: Function | null = null;

  saveConfirmPromiseReject: Function | null = null;

  isPublishClick: boolean = false; // 是否点击发布按钮

  get designer() {
    return this.$refs.designer as Designer;
  }

  get isEditorView() {
    return this.viewType === 'editor';
  }

  @Provide()
  removeControlFromParent(key: string, path?: string[]) {
    return null;
  }

  @Provide()
  getFormControls() {
    return this.controls;
  }

  @Provide()
  getControl() {
    return this.selectedControl.control;
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

    const result = await editor.parse();
    this.controls = result.controls;
    this.layout = result.layout;
    this.actions = result.actions;
    this.elements = result.elements;
  }  

  mounted() {
    this.loadForm();
  }

  /**
   * 加载表单
   */
  loadForm() {
    console.log(this.formData);
    if (!this.currentHistoty.draftAttributesJson && !this.currentHistoty.publishedAttributesJson) {
      //重新根据参数请求
      this.isLoading = true;
      this.formData = null;
      const id = this.$route.params.id;
      appsApi.getFormHistoryById(id)
      .then(res => {
        if(res.errcode === 0) {
          try {
            this.formData = res.data;
            this.setCurHistory(res.data);
            this.initLayout();
            this.isLoading = false;
          } catch (err) {
            this.isLoading = false;
          }
        }
      })
      .catch(err => {
        this.isLoading = false;
      })
    } else {
      this.isLoading = true;
      try {
        this.formData = this.currentHistoty;
        this.initLayout();
      } catch (err) {
        this.isLoading = false;
      }
      this.isLoading = false;
    }

    // const sheetCode = this.$route.params.sheetCode;
    // const schemaCode = this.$route.params.bizSchemaCode;

    // if (!sheetCode || !schemaCode) {
    //   this.$message.error("缺少参数");
    // }
    // const _this = this;
    // formApi.get(schemaCode, sheetCode).then((res: any) => {
    //   _this.formData = res.data;
    //   if (_this.formData.subTip) {
    //     this.isSubTips = true;
    //   }
    //   if (_this.formData.sheetType) {
    //     _this.$message.error('无法打开自定义表单');
    //     return;
    //   }
    //   if (!res.data.draftAttributesJson && !res.data.publishedAttributesJson) {
    //     // todo
    //   } else {
    //     this.initLayout();
    //   }
    // }, (err: any) => {
    //   console.log("error happend", err);
    // });
  }
  /**
   * 初始化布局
   */
  initLayout() {
    this.showDragTips = false;
    const controls = JSON.parse(
      this.formData.draftAttributesJson || this.formData.publishedAttributesJson
    );

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

    this.controls = ControlFactory.restoreOptions(controls);
    
    //初始化时，旧数据兼容到最新版本
    this.formData.draftAttributesJson = JSON.stringify(this.controls);

    this.layout = layout;
  }

  editFormDataAttribute(field: string, value: any) {
    let tmp: any = {};

    tmp[field] = value;

    if (field === 'name') {
      const obj: any = LanguageTransform.setLang(
        value,
        this.formData.name_i18n
      );

      tmp = obj;
    }

    this.formData = Object.assign({}, this.formData, tmp);
  }

  onControlSelect(control?: FormControl, isSeletedControl: Boolean = true) {
    if (control && control.type !== FormControlType.Html) {
      this.selectedControl = { control, isSeletedControl };
    } else {
      this.selectedControl = {};
    }
  }
}
</script>

<style lang="less">
@import './form-history.less';
</style>
<style lang="less" scoped>
.tips {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 800;
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
  content: '';
}
.form-design-content {
  /deep/.right {
    .h3-sider-body {
      overflow-x: hidden;
    }
  }
}
</style>


