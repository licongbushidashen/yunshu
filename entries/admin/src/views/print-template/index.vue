<template>
  <div class="print-warpper">
    <div class="printHeaderWrap">
      <div class="print-header flex-justify-between">
        <div class="header-left">
          <div class="flex-center">
            <div @click="goToBack()" v-show="$route.fullPath.includes('print-template')">
              <i class="icon aufontAll h-icon-all-arrow-left-o router-link-active"></i>
            </div>
            <div v-if="$route.fullPath.includes('print-template')">打印模板设计</div>
            <div v-if="$route.fullPath.includes('pre-view')">打印模板预览</div>
          </div>
        </div>
        <div class="header-right">
          <a-button v-if="isOldPrintTemplate" type="default" icon="switcher-o" @click="switchNew()">切换到新版</a-button>
          <a-button type="default" icon="eye-o" @click="preView()">预览</a-button>
          <a-button type="primary" icon="save" @click="saveDrawerJson()">保存</a-button>
        </div>
        <div class="header-right" v-if="$route.fullPath.includes('pre-view')">
          <a-button type="default" icon="close" @click="closePreView()">关闭</a-button>
        </div>
      </div>
    </div>
    <h3-print-designer
      v-if="!isOldPrintTemplate"
      ref="printDesigner"
      :templateData="templateData"
      :metaData="formMetaData"
      :loading="loadingMetaData && loadingTemplate"
      :fileUploader="fileUploader"
    />
    <div v-else class="print-container">
      <h3-side :options="leftOps" @resize="resizeWidth">
        <LeftComponent @itemStartDrag="doDragStart" />
      </h3-side>
      <CenterPanel
        @dropEdItem="doDropItem"
        @clickedId="filterDataById"
        :providerId="addNamelyClickId"
        @itemStartDrag="doDragStart"
        @rectSelect="onRectSelect"
        ref="cneterPanel"
      />


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

      <h3-side :options="rightOps" @resize="resizeWidth">
        <RightAttr :selecteds="selecteds" />
      </h3-side>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import H3PrintDesigner from "@h3print/designer";
import H3Side from "@/common/sider/sider.vue";
import LeftComponent from "./left-component/index.vue";
import CenterPanel from "./center-panel/index.vue";
import RightAttr from "./right-attr/index.vue";

import { get, update } from "@/apis/form";
import appsApi from "@/apis/apps";
import common from "@cloudpivot/common";
const { replaceValueData } = common.utils.BusinessFunctions;

import {
  leftSide,
  rightSide,
  CreateOneItem,
  CreatPic,
  RectLine,
  systemColumns,
  iconTypes
} from "@/config/print/dataStructure";

import { guid, getOffsetLeft, forRightPosition } from "@/utils/print-util";

import env from "@/env";
import axios from 'axios';

const PrintVuex = namespace("Print/Print");
import { UploadControl } from "@cloudpivot/form/src/common/controls/upload-control";

// import data3 from "./mockData/data4";
// import mockData from "./mockData/data2";
import "@h3print/designer/lib/h3print-designer.css";
import H3PrintRuntime from '@h3print/runtime';

@Component({
  name: "print-template",
  components: {
    LeftComponent,
    CenterPanel,
    RightAttr,
    H3Side,
    H3PrintDesigner,
    H3PrintRuntime
  },
  beforeRouteEnter(to, from, next) {
    // @ts-ignore
    next();
  },
  beforeRouteLeave(to, from, next) {
    // @ts-ignore
    this.validateRoute().then(
      () => {
        // vm.clean();
        next();
      },
      () => {
        next(false);
      }
    );
  },
})
export default class PrintTemplate extends Vue {
  leftOps: any = leftSide;
  rightOps: any = rightSide;
  dragItem: any = {};
  addNamelyClickId: string = "";
  @PrintVuex.State("toLeft") toLeft!: number;
  @PrintVuex.State("toTop") toTop!: number;
  @PrintVuex.Action("changeOver") changeOver!: any;
  @PrintVuex.Mutation("addOneEle") addOneEle!: any;
  @PrintVuex.Mutation("changeLeft") changeLeft!: any;
  @PrintVuex.Mutation("setAttrs") setAttrs!: any;
  @PrintVuex.Getter("getItemAttrsById") getItemAttrsById!: any;
  @PrintVuex.Mutation("changeKey") changeKey!: any;
  @PrintVuex.State("pages") pages!: object[];
  @PrintVuex.State("pageSettings") pageSettings!: any;

  selecteds: any[] = [];

  templateData: any = {
    content: "",
    settings: "",
    templateName: "",
    id: "",
  };

  formMetaData: any = {
    fields: {},
    workflowField: [],
  };

  isOldPrintTemplate: boolean = true;

  loadingMetaData = true;

  loadingTemplate = true;

  showUnsaveConfirm = false;

  saveConfirmPromiseResolve: Function | null = null;

  saveConfirmPromiseReject: Function | null = null;

  doDragStart(dragItemObj: any) {
    this.dragItem = dragItemObj;
  }

  onRectSelect(selecteds: any) {
    this.selecteds = selecteds || [];
  }

  @Provide()
  getDragItem() {
    return this.dragItem;
  }

  getLeftAndTop() {
    const Odrawer: any = document.querySelector(".main-body");
    if (!Odrawer) return;
    this.changeLeft(getOffsetLeft(Odrawer));
  }


  fileUploader(formData: any) {
    const file = formData && formData.get('partFile');
    if (file) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        const fileName = 'printBg.png';
        formData.append('file', file);
        formData.append('isAddWatermark', 'false');
        formData.append('locationInfo', '');
        formData.append('fileName', fileName);
        axios.post(env.apiHost + '/api/aliyun/upload', formData).then(res => {
          const fileURL = UploadControl.service.getDownloadUrlByRefId(res.data.refId);
          resolve({
            data: fileURL,
          });
        })
      });
    } else {
      return Promise.reject(new Error('PartFile 不存在'));
    }
  }
  async mounted() {
    await this.getPrintTemplateData();
    // this.formMetaData = mockData.ReturnData.MetaData;
  }
  async judgeDataIsSame() {
    // @ts-ignore
    const { data, errcode, errmsg } = await get(
      this.$route.params.bizSchemaCode,
      this.$route.params.printCode
    );
    if (errcode !== 0) {
      this.$message.error(errmsg);
      return true;
    }
    const set = new Set();
    if (data && data.draftAttributesJson) {
      set.add(data.draftAttributesJson);
    }

    let json = JSON.stringify(this.$store.state.Print.Print.pages);
    const pages = JSON.parse(json);

    for (const page of pages) {
      for (const item of page) {
        if (item.leftKey && item.leftKey.active) {
          item.leftKey.active = true;
        }
        if (item.rightValue && item.rightValue.active) {
          item.rightValue.active = true;
        }
        // @ts-ignore
        if (item.active) {
          // @ts-ignore
          item.active = false;
        }
      }
    }

    json = JSON.stringify(pages);

    if (!set.has(json)) {
      return true;
    }

    return false;
  }
  async updateFlagInJson(res: any) {
    if (res) {
      let draftAttributesJsonObj: any = JSON.parse(res);
      if (Array.isArray(draftAttributesJsonObj) && draftAttributesJsonObj.length > 0) {
        if(Array.isArray(draftAttributesJsonObj[0]) && draftAttributesJsonObj[0].length) {
          let pageSettings: any = draftAttributesJsonObj[0].find(item => item.eleType === "pageSettings");
          if (pageSettings) {
            pageSettings.isChoosed = true;
          }
        }
      }
      const params: any = {
        // @ts-ignore
        code: this.$route.params.printCode,
        // @ts-ignore
        schemaCode: this.$route.params.bizSchemaCode,
        id: localStorage.getItem(
          `upPrintTempJsonId${this.$route.params.printCode}`
        ),
        name: "打印模板",
        sheetType: "2",
        draftAttributesJson: JSON.stringify(draftAttributesJsonObj)
      };
      const { errcode, errmsg } = await update(params);
      if (errcode !== 0) this.$message.error(errmsg);
    }
  }
  async saveDrawerJson() {
    if (this.isOldPrintTemplate) {
      // @ts-ignore
      const res: object[] = replaceValueData(
        env,
        this.$store.state.Print.Print.pages,
        "fake"
      );
      const params: any = {
        // @ts-ignore
        code: this.$route.params.printCode,
        // @ts-ignore
        schemaCode: this.$route.params.bizSchemaCode,
        id: localStorage.getItem(
          `upPrintTempJsonId${this.$route.params.printCode}`
        ),
        name: "打印模板",
        sheetType: "2",
        draftAttributesJson: JSON.stringify(res)
      };
      const { errcode, errmsg } = await update(params);
      if (errcode !== 0) this.$message.error(errmsg);
      if (errcode === 0) this.$message.success(errmsg);
    } else {
      // @ts-ignore
      let printData = this.$refs.printDesigner.getTemplateData();
      const params: any = {
        // @ts-ignore
        code: this.$route.params.printCode,
        // @ts-ignore
        schemaCode: this.$route.params.bizSchemaCode,
        id: localStorage.getItem(
          `upPrintTempJsonId${this.$route.params.printCode}`
        ),
        name: "打印模板",
        sheetType: "2",
        draftAttributesJson: printData.content,
        printJson: printData.settings,
      };
      const { errcode, errmsg } = await update(params);
      if (errcode !== 0) this.$message.error(errmsg);
      if (errcode === 0) this.$message.success(errmsg);
    }
  }

  async validateRoute(func: any) {
    const _this = this;

    const edited = await this.judgeDataIsSame();

    if (!edited) {
      return Promise.resolve();
    }
  }

  getSystemFields() {
    let systemColumnsCy = systemColumns.map((item: any) => {
      let { name, code } = item;
      let xitem: Common.ChuanyunPrintModel = {
        children: null,
        fieldCode: code,
        fieldName: name,
        fieldType: 'Text',
      }
      return xitem;
    });
    return systemColumnsCy;
  }

  async getFormFields() {
    const schemaCode = this.$route.params.bizSchemaCode;
    const formCode = this.$route.params.printCode.substring(0, this.$route.params.printCode.lastIndexOf('_print'));
    let bizColumns: any[] = [];
    const { data, errcode, errmsg } = await appsApi.getDataItemList({
      schemaCode: schemaCode,
      formCode: formCode,
    });
    if (errcode !== 0) {
      bizColumns = [];
    }
    if (!data || !data.length) bizColumns = [];
    if(Array.isArray(data)) {
      data.forEach((item: any, index: number) => {
        if (
          item.propertyType === 8 &&
          item.subSchema.properties.filter((x: any) => !x.defaultProperty)
            .length === 0
        ) {
          return;
        }
        if (!item.defaultProperty) {
          bizColumns.push(item);
        }
      });
    } else {
      console.log(data);
      this.$message.error('获取数据项列表时出错，请联系技术人员处理')
      return;
    }

    let bizColumnsCy = bizColumns.map((item: any) => {
      let { propertyType, formPropertyType, name, code } = item;
      let retItem: Common.ChuanyunPrintModel;
      if (propertyType === 8) {
        // 子表
        let children: any[] = item.subSchema.properties
          .filter((x: any) => !x.defaultProperty)
          .map((xitem: any) => {
            let {
              propertyType: xpropertyType,
              formPropertyType: xformPropertyType,
              name: xname,
              code: xcode,
            } = xitem;
            let mapItem:Common.ChuanyunPrintModel = {
              children: null,
              fieldCode: xcode,
              fieldName: xname,
              fieldType: this.adapterType(xpropertyType, xformPropertyType),
            }
            return mapItem;
          });
        retItem = {
          children: children,
          fieldCode: code,
          fieldName: name,
          fieldType: this.adapterType(propertyType, formPropertyType),
        };
        return retItem;
      }
      retItem = {
        children: null,
        fieldCode: code,
        fieldName: name,
        fieldType: this.adapterType(propertyType, formPropertyType),
      };
      return retItem;
    });
    return bizColumnsCy;
  }

  async getWorkflowFields() {
    const { data, errcode, errmsg } = await appsApi.getIsWorkflow({
      schemaCode: this.$route.params.bizSchemaCode,
    });
    if (errcode !== 0) {
      this.$message.error(errmsg as string);
      return false;
    }
    let list: Array<Common.ChuanyunPrintModel> = [];
    let children: Array<Common.ChuanyunPrintModel> = [
      {
        fieldCode: "approval",
        fieldName: "审批",
        fieldType: "Text",
        children: null,
      },
      {
        fieldCode: "assist",
        fieldName: "协办",
        fieldType: "Text",
        children: null,
      },
      {
        fieldCode: "addWorkitem",
        fieldName: "加签",
        fieldType: "Text",
        children: null,
      },
      {
        fieldCode: "forward",
        fieldName: "转办",
        fieldType: "Text",
        children: null,
      },
      {
        fieldCode: "abortInstance",
        fieldName: "作废",
        fieldType: "Text",
        children: null,
      },
      {
        fieldCode: "finishInstance",
        fieldName: "结束流程",
        fieldType: "Text",
        children: null,
      },
      {
        fieldCode: "systemAutoAdd",
        fieldName: "系统自动添加",
        fieldType: "Text",
        children: null,
      },
      {
        fieldCode: "circulate",
        fieldName: "传阅",
        fieldType: "Text",
        children: null,
      }
    ];
    if (data) {
      list= [
        {
          fieldCode: "WorkFlowLog",
          fieldName: "流程日志",
          fieldType: "WorkflowLog",
          children: children,
        },
        {
          children: null,
          fieldCode: "F0000020",
          fieldName: "流程印章",
          fieldType: "Stamp",
		    }
      ]
    }
    return list;
  }

  getOtherFields() {
    let list: Array<Common.ChuanyunPrintModel> = [
      {
        fieldCode: "QRCode",
        fieldName: "二维码",
        fieldType: "QrCode",
        children: null,
      },
      {
        fieldCode: "BarCode",
        fieldName: "条形码",
        fieldType: "BarCode",
        children: null,
      },
    ];
    return list;
  }

  getWorkflowFieldOutter() {
    let list: Array<Common.ChuanyunPrintModel> = [
      {
          fieldCode: "activityName",
          fieldName: "节点名称",
          fieldType: "Text",
          children: null,
        },
        {
          fieldCode: "receiveTime",
          fieldName: "接收时间",
          fieldType: "Text",
          children: null,
        },
        {
          fieldCode: "finishTime",
          fieldName: "完成时间",
          fieldType: "Text",
          children: null,
        },
        {
          fieldCode: "usedTime",
          fieldName: "耗时",
          fieldType: "Text",
          children: null,
        },
        {
          fieldCode: "name",
          fieldName: "参与者",
          fieldType: "Text",
          children: null,
        },
        {
          fieldCode: "content",
          fieldName: "处理意见",
          fieldType: "Text",
          children: null,
        },
        {
          fieldCode: "signature",
          fieldName: "手写签名",
          fieldType: "Image",
          children: null,
        },
        {
          fieldCode: "operating",
          fieldName: "操作",
          fieldType: "Text",
          children: null,
        }
    ];
    return list;
  }

  adapterType(propertyType: number, formPropertyType: number | any) {
    if (propertyType === 6) {
      // 附件类型的返回Image, 其他的返回Text
      if (formPropertyType === 9) {
        return 'Text';
      } else {
        return "Image";
      }
    } else if (propertyType === 8) {
      return "SubTable";
    } else {
      return "Text";
    }
  }

  async getPrintTemplateData() {
    // @ts-ignore
    const bizSchemaCode: string = this.$route.params.bizSchemaCode;
    // @ts-ignore
    let printCode: string = this.$route.params.printCode;
    let version: string = this.$route.params.version;
    this.isOldPrintTemplate = version === '0' || false;
    if (!printCode.includes("_print")) {
      printCode += "_print";
    }
    if (this.isOldPrintTemplate) {
      const isNewPrintTemplateTips = localStorage.getItem("isNewPrintTemplateTips");
      if (!isNewPrintTemplateTips) {
        let self = this;
        this.$confirm({
          title: '打印模板提示信息',
          content: h => h('div', {}, [
            h('p', {style: 'text-align:justify;'}, '打印模板现已全面升级为EXCEL画布，如切换新版，旧版所有设置项将被清空且不可恢复。是否升级？'),
            h('p', {style: 'text-align:justify; color:red;'}, '说明：升级新版打印模版后，旧版模版数据不可恢复，请谨慎升级！！')
          ]),
          okText: '确认升级',
          cancelText: '不升级',
          onOk() {
            self.isOldPrintTemplate = false;
            self.getFormMetaData();
          },
          onCancel() {
            self.isOldPrintTemplate = true;
            localStorage.setItem("isNewPrintTemplateTips", "1");
            self.getLeftAndTop();
            window.onresize = () => {
              self.getLeftAndTop();
            };
          }
        });
      } else {
        this.getLeftAndTop();
        window.onresize = () => {
          this.getLeftAndTop();
        };
      }
    } else {
       const { data, errcode, errmsg } = await get(bizSchemaCode, printCode);
      if (errcode !== 0) {
        this.$message.error(errmsg);
      }
      if (!data) {
        this.$message.error("查询数据有误！");
      }
      localStorage.setItem(`upPrintTempJsonId${printCode}`, data.id || "");
      this.templateData = {
        content: data.printJson ? data.draftAttributesJson : "",
        settings: data.printJson,
        templateName: data.name,
        id: data.id,
      };
      this.getFormMetaData();
      this.loadingMetaData = false;
      this.loadingTemplate = false;
    }
  }

  async getFormMetaData() {
    this.formMetaData = {
      fields: {
        flowFields: await this.getWorkflowFields(),
        formFields: (await this.getFormFields()) || [],
        otherFields: this.getOtherFields(),
        sysFields: this.getSystemFields() || [],
      },
      workflowField: this.getWorkflowFieldOutter()
    };
  }

  goToBack() {
    // @ts-ignore
    if (history.length > 1) {
      history.go(-1);
    } else {
      this.$router.push({ path: "/" }).catch((err: any) => {
        err;
      });
    }
  }

  preView() {
    if(this.isOldPrintTemplate) {
      // @ts-ignore
      const res: object[] = replaceValueData(env, this.pages, "fake", iconTypes);
      localStorage.setItem("print_pages", JSON.stringify(res));
      // @ts-ignore
      const href = `/admin#/apps/model/${this.$route.params.appCode}/${this.$route.params.bizSchemaCode}/pre-view`;
      window.open(href, "_blank");
    } else {
      // @ts-ignore
      this.$refs.printDesigner.printPreview(false)
      // let formData: any = {};
      // // @ts-ignore
      // let printData = this.$refs.printDesigner.getTemplateData();
      // let contentArr: [] = JSON.parse(printData.content);
      // contentArr.forEach((item: any) => {
      //   if (item.cells) {
      //     Object.keys(item.cells).forEach((row: any) => {
      //       let rowContent = item.cells[row];
      //       Object.keys(rowContent).forEach((col:any) => {
      //         let colContent = rowContent[col];
      //         if (colContent && colContent.content && colContent.content.hasOwnProperty("fieldCode")) {
      //           if (colContent.content.hasOwnProperty("parentFieldCode")) {
      //             let parentFieldCode = colContent.content["parentFieldCode"];
      //             if (!formData.hasOwnProperty(parentFieldCode)) {
      //               formData[parentFieldCode] = [{
      //                 activityName: '--',
      //                 receiveTime: '--',
      //                 finishTime: '--',
      //                 usedTime: '--',
      //                 name: '--',
      //                 operating: '--'
      //               }];
      //             }
      //           } else if (colContent.content['fieldCode'] === 'QRCode') {
      //             // 二维码
      //             let qrContent: any = colContent.content;
      //             let retObj: Object = {};
      //             if(Array.isArray(qrContent.children) && qrContent.children.length > 0) {
      //               retObj[qrContent.children[0].fieldCode] = '--';
      //             }
      //             formData[colContent.content["fieldCode"]] = retObj;
      //           } else if (colContent.content['fieldCode'] === 'BarCode') {
      //             // 条形码
      //           } else {
      //             formData[colContent.content["fieldCode"]] =`--`;
      //           }
      //         }
      //       })
      //     })
      //   }
      // })
      // let templateData: any = {
      //   id: printData.id,
      //   content: printData.content,
      //   settings: printData.settings,
      //   templateName: '预览测试',
      //   template: {
      //     Id: printData.id,
      //     SchemaCode: this.$route.params.bizSchemaCode,
      //     TemplateName: '预览测试',
      //     Remark: '',
      //     CreatedTime: new Date().getTime()
      //   }
      // }
      // const runtimePrint = new H3PrintRuntime(templateData, formData);
      // runtimePrint.printPreview();
    }
  }

  closePreView() {}

  mockData(templateData: any) {

  }

  resizeWidth() {
    this.getLeftAndTop();
    (this.$refs.cneterPanel as any).getPagesWidth();
  }
  doDropItem(e: any) {
    e.preventDefault();
    this.changeOver(false);
    this.resizeWidth();
    // @ts-ignore
    const { left, top } = forRightPosition(
      // @ts-ignore
      e.clientX - this.toLeft - this.dragItem.offsetX,
      // @ts-ignore
      e.clientY - this.toTop - this.dragItem.offsetY,
      this.dragItem
    ) as object;
    let tempObj: object = {};
    // @ts-ignore
    if (this.dragItem.owner.includes("left")) {
      // @ts-ignore
      if (this.dragItem.kind.includes("leftColumn")) {
        // @ts-ignore
        tempObj = {
          id: guid(),
          eleType: "column",
          left,
          top,
          widthValue: 85,
          heightValue: 30,
          // @ts-ignore
          leftKey: new CreateOneItem(
            guid(),
            "",
            "column",
            this.dragItem.str.trim(),
            left,
            top,
            85,
            30
          ),
          // @ts-ignore
          rightValue: new CreateOneItem(
            guid(),
            `${this.dragItem.code}#_#${
              this.dragItem.propertyType
            }#_#${this.dragItem.str.trim()}`,
            "column",
            `\${ ${this.dragItem.str.trim()} }`,
            left,
            top,
            85,
            30
          )
        };
      }
      // @ts-ignore
      if (this.dragItem.kind.includes("leftQrcodePic"))
        tempObj = new CreatPic(
          guid(),
          "leftQrcodePic",
          "二维码",
          left,
          top,
          84,
          84
        );
      // @ts-ignore
      if (this.dragItem.kind.includes("leftBarcodePic"))
        tempObj = new CreatPic(
          guid(),
          "leftBarcodePic",
          "条形码",
          left,
          top,
          98,
          74
        );
      // @ts-ignore
      if (this.dragItem.kind.includes("flowLog")) {
        this.$message.warning("todo");
        return false;
      }
    }
    // @ts-ignore
    if (this.dragItem.owner.includes("top")) {
      // @ts-ignore
      if (this.dragItem.kind.includes("topText"))
        tempObj = new CreateOneItem(
          guid(),
          "",
          "text",
          this.dragItem.str.trim(),
          left,
          top,
          85,
          30
        );
      // @ts-ignore
      if (this.dragItem.kind.includes("topDrawerRect"))
        tempObj = new RectLine(
          guid(),
          "topDrawerRect",
          "矩形",
          left,
          top,
          85,
          30
        );
      // @ts-ignore
      if (this.dragItem.kind.includes("topDrawerLine"))
        tempObj = new RectLine(
          guid(),
          "topDrawerLine",
          "直线",
          left,
          top,
          85,
          1
        );
      // @ts-ignore
      if (this.dragItem.kind.includes("topPic"))
        tempObj = new CreatPic(guid(), "topPic", "图片", left, top, 134, 74);
    }
    // @ts-ignore
    this.addOneEle(tempObj);
    this.setAttrs(tempObj);
    // @ts-ignore
    this.addNamelyClickId = tempObj.id;
    this.changeKey("1");
  }
  filterDataById(id: string) {
    this.setAttrs(this.getItemAttrsById(id));
    this.changeKey("1");
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
    this.saveDrawerJson().then(
      () => {
        this.handleConfirmUnsave();
      },
      () => {
        this.handleConfirmCancel();
      }
    );
  }

  switchNew() {
    let self = this;
    this.$confirm({
      title: '打印模板提示信息',
      content: h => h('div', {}, [
        h('p', {style: 'text-align:justify;'}, '打印模板现已全面升级为EXCEL画布，如切换新版，旧版所有设置项将被清空且不可恢复。是否升级？'),
        h('p', {style: 'text-align:justify; color:red;'}, '【说明：升级新版打印模版后，旧版模版数据不可恢复，请谨慎升级！】')
      ]),
      okText: '确认升级',
      cancelText: '不升级',
      onOk() {
        self.isOldPrintTemplate = false;
        self.getFormMetaData();
      },
      onCancel() {
        // nothing to do
      }
    });
  }
}
</script>

<style lang="less" scoped>
.print-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
  position: absolute;
  overflow-x: auto;
}
.printHeaderWrap {
  position: absolute;
  width: 100%;
  height: 64px;
  top: -64px;
}
.print-header {
  height: 64px;
  width: 100%;
  background: rgba(5, 37, 53, 1);
  color: #fff;
  padding: 0 25px;
  position: relative;
  z-index: 3;
  .header-left {
    i {
      margin-right: 25px;
      &:hover {
        cursor: pointer;
      }
    }
    div:nth-child(2) {
      font-size: 18px;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
    }
  }
  .header-right {
    .ant-btn-default {
      margin-right: @base4-padding-xs;
      background: rgba(5, 37, 53, 1);
      color: #fff;
      &:hover {
        border: 1px solid #17bc94;
        color: #17bc94;
        transition: all 0.2s;
      }
    }
  }
}
</style>
