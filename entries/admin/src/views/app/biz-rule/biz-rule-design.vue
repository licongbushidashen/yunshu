<template>
  <div class="workflow">
    <div class="workflow-head" @click="closeContextmenu">
      <div class="workflow-head-l">
        <span class="workflow-name">
          <i
            class="icon aufontAll h-icon-all-arrow-left-o"
            @click="backDataModel"
          />数据操作</span
        >
      </div>
      <div class="workflow-head-c">
        <ul>
          <li
            class="toolbar"
            :class="{ disabled: dicDisabled }"
            @click="horizontal"
          >
            <i class="icon aufontAll h-icon-all-same-high"></i>
            <span>水平等距</span>
          </li>
          <li
            class="toolbar"
            :class="{ disabled: dicDisabled }"
            @click="vertical"
          >
            <i class="icon aufontAll h-icon-all-same-width"></i>
            <span>垂直等距</span>
          </li>
          <li class="toolbar" @click="saveImage">
            <i class="icon aufontAll h-icon-all-picture-o"></i>
            <span>存为图片</span>
          </li>
          <li
            class="toolbar"
            :class="{ disabled: sizeDisabled }"
            @click="sameSize"
          >
            <i class="icon aufontAll h-icon-all-same-size"></i>
            <span>等大小</span>
          </li>
          <li
            class="toolbar"
            :class="{ disabled: sizeDisabled }"
            @click="sameHeight"
          >
            <i class="icon aufontAll h-icon-all-highly-adaptive-o"></i>
            <span>等高</span>
          </li>
          <li
            class="toolbar"
            :class="{ disabled: sizeDisabled }"
            @click="sameWidth"
          >
            <i class="icon aufontAll h-icon-all-width-adaptive-o"></i>
            <span>等宽</span>
          </li>
          <li
            class="toolbar"
            :class="{ disabled: undoDisabled }"
            @click="revoke"
          >
            <i class="icon aufontAll h-icon-all-rollback-o"></i>
            <span>撤销</span>
          </li>
          <li
            class="toolbar"
            :class="{ disabled: redoDisabled }"
            @click="goBack"
          >
            <i class="icon aufontAll h-icon-all-cancell-o"></i>
            <span>返回</span>
          </li>
        </ul>
      </div>
      <div class="workflow-head-r">
        <button
          class="workflow-btn"
          style="color: rgba(0, 0, 0, 0.65); background: #fff"
          :disabled="isDisabledCheck"
          @click="checkRule"
        >
          <i class="icon aufontAll h-icon-all-simple-kanban-o"></i>
          <span>检测</span>
        </button>
        <button
          class="workflow-btn"
          :class="{ disabled: isDisabled }"
          @click="saveWorkflow"
          :disabled="isDisabled"
        >
          <i class="icon aufontAll h-icon-all-save-o"></i>
          <span>保存</span>
        </button>
      </div>
    </div>
    <a-modal
      v-model="isCheckedRule"
      title="业务规则校验"
      :width="1200"
      :centered="true"
    >
      <div class="checkRuleBox">
        <p class="tip_summary" v-if="_checkResult.length === 0">
          <i class="icon aufontAll h-icon-all-check-circle"></i>
          业务规则检测通过
        </p>
        <template v-else>
          <p class="tip_summary">
            <i class="icon aufontAll h-icon-all-close-circle"></i>
            运行失败！原因如下，请全部修正后重新发布
          </p>
          <ol class="tip_detail">
            <li v-if="errList.deadCycleRunMapList.length">
              1、
              <template v-for="(item, index) in errList.deadCycleRunMapList">
                <span :key="index + 'dead'">[{{item.nodeName}}]</span>
              </template>
              节点应用的模型存在死循环；
            </li>

            <li v-if="errList.modelNoData.length">
              {{errList.deadCycleRunMapList.length ? '2' : '1'}}、
              <template v-for="(item, index) in errList.modelNoData">
                <span :key="index+'notExist'">[{{item.nodeName}}]</span>
              </template>
              节点应用的模型数据项不存在；
            </li>

            <li v-if="errList.functionNoData.length">
              {{errList.deadCycleRunMapList.length ? errList.modelNoData.length ? "3" : "2" : errList.modelNoData.length ? "2": "1"}}、
              <template v-for="(item, index) in errList.functionNoData">
                <span :key="index+'notExist'">[{{item.nodeName}}]</span>
              </template>
              节点应用的集成方法找不到出参入参值
            </li>
          </ol>
        </template>
        <div class="board">
          <check-board :nodeRunMaps="nodeRunMaps"/>
        </div>
      </div>
      <template slot="footer">
        <a-button type="primary" @click="isCheckedRule = false"
          >知道了</a-button
        >
      </template>
    </a-modal>
    <div class="workflow-content">
      <!-- 节点仓库 -->
      <div @click="closeContextmenu" class="workflow-content-left">
        <h3-sider
          :options="leftPanel"
          class="workflow-panel"
          @toggle="doAutoFit"
        >
          <biz-rule-panels :workData="workData" />
        </h3-sider>
      </div>
      <!-- 流程绘图区 -->
      <div id="designer-wrap" class="designer-wrap">
        <biz-rule-content
          ref="bizRuleContent"
          @buttonDisable="buttonDisable"
          @loadComplete="loadComplete"
          @nodeClick="nodeClick"
          v-h3-drop
        />
      </div>
      <!-- 节点属性/流程属性 -->
      <div @click="closeContextmenu" class="workflow-content-right">
        <h3-sider
          :options="rightPanel"
          class="workflow-panel"
          @toggle="doAutoFit"
        >
          <biz-rule-property :dataItems="dataItems" ref="bizRuleProperty" />
          <!-- <component :is="'BizRuleProperty'"/> -->
        </h3-sider>
      </div>
    </div>

    <tip-modal
      v-model="isShowErrorValidate"
      :warningMsg="warningMsg"
      :errorMsg="errMsg"
      :type="validateOrPublish"
      @release="stillRelease"
    />

    <!-- <a-modal
      v-model="isShowPublishModal"
      class="publish-modal"
      okText="发布"
      cancelText="取消"
      @ok="publish"
      :maskClosable="false"
      :keyboard="false"
    >
      <p slot="title">
        发布说明
        <span class="title-tip">用于历史版本介绍</span>
      </p>

      <div class="desc-box">
        <textarea
          placeholder="请输入说明（120字以内）必填"
          v-model="publishDesc"
          maxlength="120"
        ></textarea>
        <div class="desc-num">{{ publishDesc.length }}/120</div>
      </div>
    </a-modal> -->

    <a-modal
      v-model="isShowSaveConfirm"
      :closable="false"
      :maskClosable="false"
      :width="400"
      wrapClassName="unsave-confirm"
    >
      <div class="unsave-confirm--content">
        <i class="icon aufontAll h-icon-all-question-circle"></i>
        <strong>您刚对业务规则设置进行了修改，是否保存后再离开？</strong>
      </div>

      <template slot="footer">
        <a-button key="cancel" @click="handleConfirmCancel">{{
          $t("languages.Apps.Cancel")
        }}</a-button>
        <a-button key="unsave" @click="handleConfirmUnsave">{{
          $t("languages.Apps.Unsave")
        }}</a-button>
        <a-button key="save" type="primary" @click="handleConfirmOk">{{
          $t("languages.Apps.SaveAndLeave")
        }}</a-button>
      </template>
    </a-modal>

    <!-- 校验loading -->
    <div
      :class="
        isValidated ? 'validate-loading-box active' : 'validate-loading-box'
      "
    >
      <span><a-icon type="loading" /></span>
      流程检验中
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, namespace } from "vuex-class";
import "@/directives/drag";
import html2canvas from "html2canvas";
import canvg from "canvg";
import H3Sider from "@/common/sider/sider.vue";
import * as WorkflowNamespace from "@/typings/workflow";

import BizRuleProperty from "./biz-rule-property.vue";

import { LINE } from "@/typings/line";

import Bus from "@/utils/bus";
import { NodeType, systemNode, propertyNode } from "./typings/node-type";

import BizMethodApi from "@/apis/biz-method/index.api";

import BizRulePanels from "./biz-rule-panels.vue";
// import ModelContain from '../workflowDesigner/modelContain.vue';
// import WorkflowDesigner from '../workflowDesigner/workflowDesigner.vue';
import bizRuleContent from "./biz-rule-content.vue";
import checkBoard from "./biz-rule-check-board.vue";
import tipModal from "../workflowDesigner/tipModal.vue";

import { bizpropertyApi } from "@cloudpivot/api";

const BizRuleModule = namespace("Apps/BizRule");

const VERIFYLABEL = "verifyLabel";

@Component({
  name: "workflow",
  components: {
    H3Sider,
    BizRulePanels,
    bizRuleContent,
    checkBoard,
    tipModal,
    BizRuleProperty,
  },
  beforeRouteUpdate(to, from, next) {
    (this as any).validRoute().then(
      () => {
        next();
      },
      () => {
        next(false);
      }
    );
  },
  beforeRouteLeave(to, from, next) {
    const vm = this as any;
    vm.validRoute().then(
      () => {
        next();
        vm.showPropertyPanel("WorkflowProperty");
        vm.unSelect();
        vm.traceManager.Clear();
      },
      () => {
        next(false);
      }
    );
  },
})
export default class Workflow extends Vue {
  @BizRuleModule.State("traceManager") traceManager: any;

  @BizRuleModule.State("activities") activities: any;

  @BizRuleModule.State("lines") lines: any;

  @BizRuleModule.State("workflowData") workflowData: any;

  @BizRuleModule.State("workflow") workflow: any;

  @BizRuleModule.State("selectedActivities") selectedActivities: any;

  @BizRuleModule.State("beforeMovedActivities") beforeMovedActivities: any;

  @BizRuleModule.State("WorkflowDataItem_origin") WorkflowDataItemOrigin: any;

  @BizRuleModule.State("curComponent") curComponent: any;

  @BizRuleModule.State("isSaveProp") isSaveProp: any;

  @BizRuleModule.Mutation("initTraceManager") initTraceManager: any;

  @BizRuleModule.Mutation("resetWorkflow") resetWorkflow: any;

  @BizRuleModule.Mutation("setIsShowContextmenu") setIsShowContextmenu: any;

  @BizRuleModule.Mutation("setWorkflowVersion") setWorkflowVersion: any;

  @BizRuleModule.Mutation("unSelect") unSelect: any;

  @BizRuleModule.Mutation("showPropertyPanel") showPropertyPanel: any;

  @BizRuleModule.Mutation("setBizMethodList") setBizMethodList: any;

  @BizRuleModule.Mutation("propsToData") propsToData: any;

  @BizRuleModule.Mutation("dataToProps") dataToProps: any;

  @BizRuleModule.Mutation("setWorkflowData") setWorkflowData: any;

  @BizRuleModule.Mutation("setCurActivityID") setCurActivityID: any;

  @BizRuleModule.Mutation("setNodeEdit") setNodeEdit: any;

  @BizRuleModule.Action("updateWorkflowDraft") updateWorkflowDraft: any;

  @BizRuleModule.Action("getNodeRunMaps") getNodeRunMaps: any;

  @BizRuleModule.Action("validateWorkflow") validateWorkflow: any;

  @BizRuleModule.Action("transformData") transformData: any;

  @BizRuleModule.Action("releaseWorkflow") releaseWorkflow: any;

  @BizRuleModule.Action("getWorkflowList") getWorkflowList: any;

  @BizRuleModule.Action("getWorkflowDataItem") getWorkflowDataItem: any;

  @Prop({ type: String }) appCode: any;

  @Prop({ type: String }) workflowCode: any;

  @Prop({ type: String }) bizSchemaCode: any;

  leftPanel: any = {
    width: 176,
    minWidth: 176,
    maxWidth: 700,
    direction: "left",
    collapsible: true,
  };

  rightPanel: any = {
    width: 276,
    minWidth: 300,
    maxWidth: 800,
    direction: "right",
    collapsible: true,
  };

  workData: any = "";

  validateOrPublish: string = "";

  isShowErrorValidate: boolean = false;

  isShowPublishModal: boolean = false;

  isShow: boolean = false;

  isDisabled: boolean = false;

  isDisabledCheck: boolean = false;

  dicDisabled: boolean = true; // 水平等距、垂直等距按钮是否禁用

  sizeDisabled: boolean = true; // 等大小、等高、等宽按钮是否禁用

  publishDesc: string = "";

  lastTraceIndex: number = -1; // 保存后的痕迹序号

  warningMsg = [];

  errMsg = [];

  workflowVersion: any = 0;

  flag: boolean = true;

  // 流程检验loading
  isValidated: boolean = false;

  // 是否展示未保存提示弹窗
  isShowSaveConfirm: boolean = false;

  saveConfirmPromiseResolve: Function | null = null;

  saveConfirmPromiseReject: Function | null = null;

  isCheckedRule: boolean = false;
  checkResult: boolean = false;

  dataItems: any = [];
  get workflowName() {
    const { locale } = this.$i18n;
    if (locale === "zh") {
      return this.workflowData.workflowName;
    }
    if (!this.workflowData.name_i18n) {
      return this.workflowData.workflowName;
    }
    return this.workflowData.name_i18n[locale];
  }

  // 撤销按钮是否禁用
  get undoDisabled() {
    if (this.traceManager.LastTraceIndex > -1) {
      return false;
    }
    return true;
  }

  // 返回按钮是否禁用
  get redoDisabled() {
    if (
      this.traceManager.LastTraceIndex <
      this.traceManager.TraceStack.length - 1
    ) {
      return false;
    }
    return true;
  }

  async created() {
    const schemaCode: string = this.$route.params.bizSchemaCode;
    const params = { schemaCode };

    this.initTraceManager();
    if (this.$route.query.version) {
      this.workflowVersion = this.$route.query.version;
    }
    this.getMethodList();
    this.dataItems = await this.getWorkflowDataItem(params);
    console.log("-----------biz_rule-design----------", this.dataItems);
  }

  backDataModel() {
    this.$router
      .push({
        name: "busRules",
      })
      .catch((err: any) => {
        err;
      });
  }

  nodeClick(node: any) {
    const bizRuleProperty: any = this.$refs.bizRuleProperty;
    if (bizRuleProperty) {
      bizRuleProperty.nodeClick(node);
    }
  }

  // 路由变化时检测做了修改的需要保存
  validRoute() {
    const vm = this as Workflow;
    const changed: boolean =
      vm.traceManager && vm.traceManager.LastTraceIndex !== vm.lastTraceIndex;
    if (!changed) {
      return Promise.resolve();
    }
    this.isShowSaveConfirm = true;
    return new Promise((resolve, reject) => {
      this.saveConfirmPromiseResolve = resolve;
      this.saveConfirmPromiseReject = reject;
    });
  }

  /**
   * 面板数据加载完成
   */
  loadComplete(data: any) {
    // 
    this.workData = data;
    const bizRuleProperty: any = this.$refs.bizRuleProperty;
    bizRuleProperty.setBizRuleProperty();
  }

  /**
   * 点击取消按钮
   */
  handleConfirmCancel() {
    this.isShowSaveConfirm = false;
    if (this.saveConfirmPromiseReject) {
      this.saveConfirmPromiseReject();
      this.saveConfirmPromiseReject = null;
    }
  }
  /**
   * 点击不保存按钮
   */
  handleConfirmUnsave() {
    this.isShowSaveConfirm = false;
    if (this.saveConfirmPromiseResolve) {
      this.saveConfirmPromiseResolve();
      this.saveConfirmPromiseResolve = null;
    }
  }
  /**
   * 点击保存按钮
   */
  handleConfirmOk() {
    this.saveWorkflow().then(
      () => {
        this.handleConfirmUnsave();
      },
      () => {
        this.handleConfirmCancel();
      }
    );
  }

  // validRoute(fn:any) {
  //   const vm = this as Workflow;
  //   if (vm.traceManager && vm.traceManager.LastTraceIndex !== vm.lastTraceIndex) {
  //     this.$confirm({
  //       title: '您刚对流程设置进行了修改，是否保存后再离开？',
  //       okText: '保存并离开',
  //       cancelText: '不保存',
  //       async onOk() {
  //         await vm.saveWorkflow();
  //         fn();
  //       },
  //       onCancel() {
  //         fn();
  //       }
  //     });
  //   } else {
  //     fn();
  //   }
  // }

  // 关闭右键菜单
  closeContextmenu() {
    this.setIsShowContextmenu(false);
  }

  // 水平等距
  horizontal() {
    // ;
    this.workflow.setSameStyle(
      WorkflowNamespace.SameStyle.HorizontalDistance,
      this
    );
    Bus.$emit("autoFit");
  }

  // 垂直等距
  vertical() {
    this.workflow.setSameStyle(
      WorkflowNamespace.SameStyle.VerticalDistance,
      this
    );
    Bus.$emit("autoFit");
  }

  // 存为图片
  saveImage() {
    if (!this.flag) {
      return;
    }
    this.flag = false;
    const svg = document.getElementsByClassName(
      "lines-instance"
    )[0] as HTMLElement;
    if (typeof html2canvas !== "undefined") {
      // 以下是对svg的处理
      const parentNode = document.getElementsByClassName("lines-wrap")[0];
      const svg2 = svg.outerHTML.trim();
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      canvg(canvas, svg2, { ignoreMouse: true, ignoreAnimation: true });
      svg.style.display = "none";

      // 对图标的处理--开始
      const icon = document.getElementsByClassName("activity-icon");
      for (let i = 0; i < icon.length; i += 1) {
        const iconparentNode = icon[i].parentNode as HTMLElement;
        const icon2 = icon[i] as HTMLElement;
        const iconcanvas = document.createElement("canvas");
        iconcanvas.width = 14;
        iconcanvas.height = 14;
        iconcanvas.style.marginRight = "5px";
        iconcanvas.style.verticalAlign = "middle";
        const content = document.getElementsByClassName("activity-icon")[i]
          .textContent;

        // 获取画布
        const context: any = iconcanvas.getContext("2d");
        // 设置字体，能实现的关键点2
        context.font = "14px aufontAll";
        // 绘制内容
        context.fillText(content, 0, 12);

        iconparentNode.insertBefore(iconcanvas, icon2);
        icon2.style.display = "none";
      }
      // 对图标的处理--完成

      // html2canvas将DOM转为canvas存为图片
      const timer = setTimeout(() => {
        const dom = document.querySelector("#workflow-drawer") as HTMLElement;
        html2canvas(dom, {
          allowTaint: true,
          height: dom.offsetHeight,
        }).then((canva: any) => {
          svg.style.display = "block";
          parentNode.removeChild(canvas);
          for (let i = 0; i < icon.length; i += 1) {
            const iconparentNode = icon[i].parentNode as HTMLElement;
            const icon2 = icon[i] as HTMLElement;
            const iconcanvas = document.getElementsByTagName("canvas")[0];
            iconparentNode.removeChild(iconcanvas);
            icon2.style.display = "inline-block";
          }
          const image = new Image();
          image.src = canva.toDataURL("image/png");
          const aLink = document.createElement("a");
          aLink.href = image.src;
          aLink.download = `${this.workflowData.name}.png`;
          document.body.appendChild(aLink);
          aLink.click();
          document.body.removeChild(aLink);
          const canvas2 = document.createElement("canvas");
          canvas2.id = "canvas";
          parentNode.appendChild(canvas2);
          this.flag = true;
          clearTimeout(timer);
        });
      }, 1000);
    }
  }

  // 等大小
  sameSize() {
    this.workflow.setSameStyle(WorkflowNamespace.SameStyle.Size, this);
    Bus.$emit("autoFit");
  }

  // 等高
  sameHeight() {
    this.workflow.setSameStyle(WorkflowNamespace.SameStyle.Height, this);
    Bus.$emit("autoFit");
  }

  // 等宽
  sameWidth() {
    this.workflow.setSameStyle(WorkflowNamespace.SameStyle.Width, this);
    Bus.$emit("autoFit");
  }

  // 撤销
  revoke() {
    this.traceManager.Undo();
    Bus.$emit("autoFit");
  }

  // 监听sider收起
  doAutoFit() {
    Bus.$emit("autoFit");
  }

  // 返回
  goBack() {
    this.traceManager.Redo();
    Bus.$emit("autoFit");
  }
  // 重置
  // 功能已实现，后因某些原因撤销此按钮
  // 20181211
  // reset() {
  //   const vm = this;
  //   this.$warning({
  //     title: "重置会清空全部节点操作，确定重置吗？",
  //     onOk() {
  //       vm.resetWorkflow();
  //     }
  //   });
  // }

  /**
   * 格式化消息通知数据
   */
  notifyDataForamt(data: any) {
    let array: any = [];
    if (typeof data === "string") {
      array = JSON.parse(data);
    } else {
      array = JSON.parse(JSON.stringify(data));
    }
    // const array:Array<any> = JSON.parse(JSON.stringify(data));
    let obj: any = {};
    const json: Array<any> = [];
    array.forEach((item: any) => {
      item = item.trim();
      if (item) {
        const isItemData: boolean =
          this.WorkflowDataItemOrigin.findIndex(
            (dataItem: any) => dataItem.code === item
          ) > -1;
        if (isItemData) {
          obj = {
            isDataItem: 1,
            code: item,
          };
        } else {
          obj = {
            isDataItem: 0,
            code: item,
          };
        }
        json.push(obj);
      }
    });

    return json;
  }

  // 消息内容
  summaryDataForamt(data: any) {
    if (!data) return;
    let code: string = "";
    const obj = {
      isDataItem: 2,
      code: "",
    };
    if (typeof data === "string") {
      obj.code = data;
    } else {
      obj.code = data[0] ? data[0].code : "";
    }

    return [obj];
  }

  contentDataFormator(item: any) {
    if (!item) return;
    if (Array.isArray(item)) {
      return JSON.stringify(this.notifyDataForamt(item));
    } else {
      return item;
    }
  }

  // 设置数据
  setWorkflowDataForAjax() {
    // 先保存已修改过得数据
    // this.transformData(-1);
    this.propsToData();
    const _activities = JSON.parse(JSON.stringify(this.activities));
    const _linesConfig = JSON.parse(JSON.stringify(this.lines));
    const _lines: Array<any> = [];
    // content转json string
    const _workflowData: any = JSON.parse(JSON.stringify(this.workflowData));
    // 将流程时间转成json格式

    _activities.forEach((item: any) => {
      // 因为流程编码可能与应用编码或其他编码重复，故加前缀，转成数据时去前缀
      if (item.workflowCode && item.workflowCode.indexOf("-") > -1) {
        [, item.workflowCode] = item.workflowCode.split("-");
      }

      delete item.left;
      delete item.top;
      delete item.right;
      delete item.bottom;
      delete item.middle;
      delete item.center;
      delete item.ID;
      delete item.WorkflowElementType;
    });
    this.lines.forEach((line: any) => {
      const _points = line.points.map(
        (pointObj: LINE.point) => `${pointObj.x}, ${pointObj.y}`
      );
      const routeCondition: any = {};
      if (line.routeCondition !== undefined) {
        routeCondition.routeCondition = line.routeCondition ? true : false;
      }
      _lines.push({
        // text: line.text,
        // name_i18n: JSON.stringify(line.name_i18n),
        // utilizeElse: line.utilizeElse || false,
        // fixedPoint: true,
        // formula: line.formula || '',
        // popupType: line.popupType,
        // routeCondition: true,
        preNode: line.startActivity.nodeCode,
        postNode: line.endActivity.nodeCode,
        points: _points,
        ...routeCondition,
      });
    });

    const params = {};
    // if (!_workflowData.workflowName) {
    //   const workflowNameObj = JSON.parse(_workflowData.name_i18n);
    //   _workflowData.workflowName = workflowNameObj[this.$i18n.locale];
    // }
    Object.assign(params, _workflowData, {
      node: JSON.stringify(_activities),
      route: JSON.stringify(_lines),
    });
    return params;
  }

  props2DataAndReset() {
    // 将当前节点属性转成数据
    this.dataToProps();
    // 重置当前节点
    this.setCurActivityID(-1);
  }

  isClickSave = false

  // 保存 by John
  saveWorkflow(isCheckRule: boolean = false) {
    if(this.isClickSave){
      return
    }
    this.isClickSave = true
    setTimeout(()=>{
      this.isClickSave = false
    },3000)
    if (!this.isSaveProp) return;
    const params: any = this.setWorkflowDataForAjax();
    params.schemaCode = this.schemaCode;
    if (!this._submitVerify(params)) return; // 提交校验

    return this.updateWorkflowDraft(params).then((res: any) => {
      if (res.errcode === 0) {
        this.lastTraceIndex = this.traceManager.LastTraceIndex;
        if(isCheckRule !== true){// 来自检测之前的保存不弹窗提示
          this.$message.success(res.errmsg);
        }
        
        this.unSelect();
        this.props2DataAndReset();
        this.showPropertyPanel("WorkflowProperty");
        this.getWorkflowMenus();

        this.$router.replace({
          name: "biz-rule",
          params: { bizRuleCode: res.data.id },
          query: { isEdit: `${false}`, code: this.$route.query.code}
        });

        this.setWorkflowData(res.data);
        this.setNodeEdit();

        // const ruleContent =  this.$refs.bizRuleContent as any;
        // ;
        return true
      } else if (res.errcode === 550012) {
        this.$message.error("执行时间段的长度不能小于执行周期");
      } else {
        this.$message.error(res.errmsg);
      }
      return false
    });
  }
  // 提交校验
  _submitVerify(params) {
    if (!this._verifyCode(params.code)) return false; // 校验规则编码

    if (!this._verifyName(params.name)) return false; // 校验规则名称

    if (!this._verifyBizRule()) return false; //校验规则

    if (!this._verifyActivities()) return false; // 校验节点的合法性

    if (!this._verifyNode(params.node)) return false;

    if (!this._verifyLine(params)) return false;

    return true;
  }

  _verifyNode(node: string) {
    if (!node) {
      return false;
    }
    const nodeList: any = JSON.parse(node);
    const len = nodeList.length;
    const modeCodes: any = [];
    if (len) {
      for (let i = 0; i < len; i++) {
        if (nodeList[i].nodeType === NodeType.VirtualNode) {
          this.$message.error(`请先拖入一个节点！`);
          return false;
        }
        if (modeCodes.includes(nodeList[i].nodeCode)) {
          this.$message.error(
            `节点编码 ${nodeList[i].nodeCode} 重复，请检查！`
          );
          return false;
        }
        modeCodes.push(nodeList[i].nodeCode);
      }
    }
    return true;
  }

  _verifyLine(params: any) {
    const route = JSON.parse(params.route);
    const node: any = JSON.parse(params.node);
    const logicNode = node.filter((res) => {
      return (
        res.nodeType === NodeType.LogicVerify ||
        res.nodeType === NodeType.ExistVerify ||
        res.nodeType === NodeType.DataCheck
      );
    });
    for (let i = 0; i < logicNode.length; i++) {
      const code = logicNode[i].nodeCode;
      let nodeInfo = `【${logicNode[i].nodeName}[${logicNode[i].nodeCode}]】`;
      const theRoute = route.filter((res) => res.preNode === code);
      if (theRoute.length === 1) {
        if (theRoute[0].routeCondition) {
          this.$message.error(`${nodeInfo} 缺少逻辑否连线！`);
        } else {
          this.$message.error(`${nodeInfo} 缺少逻辑是连线！`);
        }
        return false;
      }
    }
    return true;
  }

  _verifyBizRule() {
    const { bizRuleType } = this.workflowData;
    if (bizRuleType === 2) {
      const schedulerSetting = this.workflowData.schedulerSetting;
      if (!schedulerSetting) {
        this.$message.error(`定时设置未设置！`);
        return false;
      }
      if (
        typeof schedulerSetting === "object" &&
        Object.keys(schedulerSetting).length === 0
      ) {
        this.$message.error(`定时设置未设置！`);
        return false;
      }
    }

    return true;
  }
  /**
   * 校验规则编码
   */
  _verifyCode(code) {
    if (!code) {
      this.$message.error("业务规则编码不能为空！");
      return false;
    }
    if (!/^[\d\w]+$/.test(code) || code.length > 50) {
      this.$message.error(
        "规则编码仅支持输入字母和数字，且仅支持５０个字符以内"
      );
      return false;
    }
    return true;
  }
  /**
   * 校验规则名称
   */
  _verifyName(name) {
    if (!name) {
      this.$message.error("业务规则名称不能为空！");
      return false;
    }
    if (!/^[A-Za-z0-9\u4e00-\u9fa5]+$/gi.test(name) || name.length > 50) {
      this.$message.error(
        "规则名称仅支持输入中文、字母和数字，且仅支持50个字符以内"
      );
      return false;
    }
    return true;
  }
  /**
   * 校验节点的填写合法性 目前支持的节点:
   * Start - 开始节点
   * End - 结束节点
   * CREATE - 新建节点
   */
  _verifyActivities() {
    for (let i = 0; i < this.activities.length; i++) {
      let activeNode = this.activities[i];
      if (!activeNode.nodeName) {
        this.$message.error(`节点名称不能为空`);
        return false;
      }
      if (!activeNode.nodeCode) {
        this.$message.error(`节点编码不能为空`);
        return false;
      }
      let verifyCode = activeNode.nodeType.toUpperCase();
      let nodeInfo = `【${activeNode.nodeName}[${activeNode.nodeCode}]】`;
      switch (verifyCode) {
        case "START":
        case "END":
          break;
        case "ASSIGN":
          {const { triggerObjectCode, filterCondition, dataActions } = activeNode;
          if (!triggerObjectCode) {
            this.$message.error(`${nodeInfo} 目标模型未选择`);
            return false;
          }
          if (
            !filterCondition ||
            Object.keys(filterCondition).length === 0 ||
            !filterCondition.mainTableConditions ||
            Object.keys(filterCondition.mainTableConditions).length === 0
          ) {
            this.$message.error(`${nodeInfo} 数据条件未配置`);
            return false;
          }
          if (!dataActions || dataActions.length === 0) {
            this.$message.error(`${nodeInfo} 赋值设置未配置`);
            return false;
          }}
          break;
        case "DATA_CHECK":
          {const { verifySchemaCode, dataCondition } = activeNode;
          if (!verifySchemaCode) {
            this.$message.error(`${nodeInfo} 目标模型未选择`);
            return false;
          }
          if (
            !dataCondition.conditions ||
            (dataCondition.conditions && dataCondition.conditions.length === 0)
          ) {
            this.$message.error(`${nodeInfo} 验证条件未配置`);
            return false;
          }}
          break;
        case "EXIST_VERIFY":
          {const { targetSchema, existVerifyCondition } = activeNode;
          if (
            !targetSchema ||
            !targetSchema.appCode ||
            !targetSchema.schemaCode
          ) {
            this.$message.error(`${nodeInfo} 目标模型未选择`);
            return false;
          }
          // ;
          if (
            !existVerifyCondition.itemList ||
            (existVerifyCondition.itemList &&
              existVerifyCondition.itemList.length === 0)
          ) {
            this.$message.error(`${nodeInfo} 判断条件未配置`);
            return false;
          }}
          break;
        case "CREATE":
        case "UPDATE":
        case "DELETE":
          {const {
            triggerObjectCode,
            targetSchema,
            targetObjectCode,
            createDataAction,
            dataActions,
            childTriggerConditionType, // 子表触发条件
            filterCondition,
          } = activeNode;
          // triggerObjectCode 触发对象
          if (!triggerObjectCode) {
            this.$message.error(`${nodeInfo} 触发对象未配置`);
            return false;
          }
          if (
            verifyCode === "CREATE" &&
            triggerObjectCode &&
            triggerObjectCode.indexOf(".") > -1 &&
            !childTriggerConditionType
          ) {
            this.$message.error(`${nodeInfo} 子表触发条件未配置`);
            return false;
          }
          // targetSchema 目标模型
          if (
            !targetSchema ||
            !targetSchema.appCode ||
            !targetSchema.schemaCode
          ) {
            this.$message.error(`${nodeInfo} 目标模型未选择`);
            return false;
          }
          // targetObjectCode 目标对象
          if (!targetObjectCode) {
            this.$message.error(`${nodeInfo} 目标对象未选择`);
            return false;
          }
          if (
            verifyCode === "UPDATE" &&
            (!filterCondition ||
              Object.keys(filterCondition).length === 0 ||
              !filterCondition.mainTableConditions ||
              Object.keys(filterCondition.mainTableConditions).length === 0)
          ) {
            this.$message.error(`${nodeInfo} 查找数据范围未配置`);
            return false;
          }

          if (
            verifyCode === "UPDATE" &&
            (!dataActions || dataActions.length === 0)
          ) {
            this.$message.error(`${nodeInfo} 更新数据动作未配置`);
            return false;
          }

          if (
            verifyCode === "DELETE" &&
            (!filterCondition || Object.keys(filterCondition).length === 0)
          ) {
            this.$message.error(`${nodeInfo} 删除数据范围未配置`);
            return false;
          }

          if (
            verifyCode === "CREATE" &&
            (!createDataAction ||
              !createDataAction.createActions ||
              createDataAction.createActions.length === 0)
          ) {
            this.$message.error(`${nodeInfo} 数据新增动作未配置`);
            return false;
          }}
          break;
        case "MESSAGE":
          {const { receiver, title, content } = activeNode;
          // 接收人  departments/部门 users/人员 selections/接受数据项 roles/接受角色
          // if (!receiver ||
          // !receiver.departments ||
          // !receiver.users ||
          // !receiver.departments.length ||
          // !receiver.users.length ||
          // !receiver.selections ||
          // !receiver.roles ) {
          //   this.$message.error(`${nodeInfo} 接收人未设置`)
          //   return false
          // }
          // if (!receiver) {
          //   this.$message.error(`${nodeInfo} 接收人未设置`);
          //   return false;
          // }
          if (Object.keys(receiver).length === 0) {
            this.$message.error(`${nodeInfo} 接收人未设置`);
            return false;
          }

          // 标题
          if (!title || !title.length) {
            this.$message.error(`${nodeInfo} 通知标题未设置`);
            return false;
          }
          // 内容
          if (!content || !content.length) {
            this.$message.error(`${nodeInfo} 通知内容未设置`);
            return false;
          }}
          break;
        case "LOGIC_VERIFY":
          {const { verifySchemaCode, targetSchema, judgeCondition, verifyConditions } = activeNode;
          if (!verifySchemaCode) {
            this.$message.error(`${nodeInfo} 验证模型未设置`);
            return false;
          }
          // targetSchema 目标模型
          if (
            !targetSchema ||
            !targetSchema.appCode ||
            !targetSchema.schemaCode
          ) {
            this.$message.error(`${nodeInfo} 目标模型未选择`);
            return false;
          }
          if (
            !judgeCondition.conditions || judgeCondition.conditions.length===0
          ) {
            this.$message.error(`${nodeInfo} 判断条件未设置`);
            return false;
          }
          if (
            !verifyConditions.conditions || verifyConditions.conditions.length===0
          ) {
            this.$message.error(`${nodeInfo} 验证条件未设置`);
            return false;
          }}
          break;
        case "GET_LIST":
          let { dataSourceType, methodMapping } = activeNode;
          if (dataSourceType === "BIZ_SERVICE" && !methodMapping) {
            this.$message.error(`${nodeInfo} 绑定业务服务方法未设置`);
            return false;
          }
          break;
        case "BIZ_ACTION":
          if (!activeNode.methodMapping) {
            this.$message.error(`${nodeInfo} 绑定业务服务方法未设置`);
            return false;
          }
          break;
      }
    }
    return true;
  }

  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  // 流程检验 by John
  validate() {
    if (!this.isSaveProp) return;
    const params = this.setWorkflowDataForAjax();
    this.validateOrPublish = "validate";
    this.isValidated = true;
    setTimeout(() => {
      // this.validateWorkflow(params).then(this.thenHandler);
    }, 500);
  }

  // 流程发布 by john
  // publish() {
  //   if (!this.isSaveProp) return;

  //   if (this.publishDesc === "") {
  //     // 发布说明为空不可发布
  //     this.$message.error("请填写发布说明");
  //     return;
  //   }

  //   const params = this.setWorkflowDataForAjax();
  //   this.validateOrPublish = "publish";
  //   this.releaseWorkflow(params).then(this.thenHandler);
  // }

  // thenHandler(res: any) {
  //   this.isValidated = false;
  //   const successStr =
  //     this.validateOrPublish === "validate" ? "流程检验通过!" : "发布成功!";
  //   const errorStr =
  //     this.validateOrPublish === "validate"
  //       ? "流程检验异常，请稍后重试!"
  //       : "发布失败，请重试！";
  //   this.isShowPublishModal = false;
  //   this.publishDesc = "";
  //   if (res.errcode === 0) {
  //     if (res.data && res.data.length > 0) {
  //       const filtedMsg = this.filterMsg(res.data);
  //       if (filtedMsg) {
  //         this.errMsg = filtedMsg.err;
  //         this.warningMsg = filtedMsg.warn;
  //         this.isShowErrorValidate = true;
  //       }
  //     } else {
  //       this.lastTraceIndex = this.traceManager.LastTraceIndex;
  //       if (this.validateOrPublish === "validate") {
  //         this.$message.success(successStr);
  //       } else {
  //         this.setWorkflowVersion(res.errmsg);
  //         this.$message.success(`版本（Version ${res.errmsg}）流程发布成功！`);
  //       }
  //     }
  //     if (this.validateOrPublish === "publish") {
  //       this.getWorkflowMenus();
  //     }
  //   } else {
  //     this.$message.error(errorStr);
  //   }
  //   this.unSelect();
  //   this.props2DataAndReset();
  //   this.showPropertyPanel("WorkflowProperty");
  // }

  /**
   * @desc 获取流程设计菜单
   * @todo 寻找更合理的方案
   */
  getWorkflowMenus() {
    const params = {
      schemaCode: this.$route.params.bizSchemaCode,
    };
    this.getWorkflowList(params);
  }

  // 流程发布弹窗
  showPublishModal() {
    if (!this.isSaveProp) return;

    // 先校验
    const params = this.setWorkflowDataForAjax();
    this.validateOrPublish = "publish";
    this.validateWorkflow(params).then((res: any) => {
      if (res.errcode === 0) {
        if (res.data && res.data.length > 0) {
          const filtedMsg = this.filterMsg(res.data);
          if (filtedMsg) {
            this.errMsg = filtedMsg.err;
            this.warningMsg = filtedMsg.warn;
            this.isShowErrorValidate = true;
          }
        } else {
          this.isShowPublishModal = true;
        }
      } else {
        this.$message.error("流程检验异常，请稍后重试!");
      }
    });
  }

  filterMsg(msg: any) {
    if (msg) {
      const _msg = JSON.parse(JSON.stringify(msg));
      const warnMsg = _msg.filter((item: any) => item.errorLevel === "WARN");
      const errMsg = _msg.filter((item: any) => item.errorLevel === "ERROR");
      return { warn: warnMsg, err: errMsg };
    }
  }

  // 打开流程设置页面
  openWorkflowSetting() {
    if (this.workflowCode && this.bizSchemaCode && this.appCode) {
      const { href } = this.$router.resolve({
        name: "workflowSetting",
        params: {
          appCode: this.appCode,
          bizSchemaCode: this.bizSchemaCode,
          workflowCode: this.workflowCode,
        },
      });
      window.open(href, "_blank");
    }
  }

  // 流程设置查看历史版本时按钮置灰事件
  buttonDisable(disabled: boolean) {
    this.isDisabled = disabled;
  }

  stillRelease() {
    this.isShowPublishModal = true;
  }

  /**
   * 获取业务方法列表
   */
  getMethodList() {
    const param: BizMethod.ListParam = {
      schemaCode: this.bizSchemaCode,
    };
    BizMethodApi.listBizMethods(param).then((res: any) => {
      if (Array.isArray(res.data)) {
        this.setBizMethodList(res.data);
      }
    });
  }
  nodeRunMaps:any = []
  checkRule() {
    this.isClickSave = false
    this.isDisabledCheck = true;
    let checkLoading = this.$message.loading("检测中",0);
    this.saveWorkflow(true).then(
      (res) => {
        if(res){
          const params: any = this.setWorkflowDataForAjax();
          this.getNodeRunMaps({id: params.id}).then((res) => {
            if (res.errcode === 0) {
              this.nodeRunMaps = res.data

              this.checkResult = true;
            } else {
              this.checkResult = false;
            }
            this.isCheckedRule = true;
          });
        }
        this.isDisabledCheck = false;
        checkLoading();
      },
      () => {
        console.log('更新业务规则失败！')
      }
    );
  }
  get _checkResult(){
    let errorRes = this.nodeRunMaps.filter(el=>{
      if(Array.isArray(el.notExistPropertyObjectList) && el.notExistPropertyObjectList.length === 0){
        el.notExistPropertyObjectList = null
      }
      if(Array.isArray(el.deadCycleRunMapList) && el.deadCycleRunMapList.length === 0){
        el.notExistPropertyObjectList = null
      }
      return el.notExistPropertyObjectList || el.deadCycleRunMapList
    })
    return errorRes
  }
  get errMap(){
    let errMap = {
      deadCycleRunMapList: [],
      notExistPropertyObjectList: []
    }
    this._checkResult.forEach((el:any) => {
      // @ts-ignore
      el.notExistPropertyObjectList && errMap.notExistPropertyObjectList.push(el)
      // @ts-ignore
      el.deadCycleRunMapList && errMap.deadCycleRunMapList.push(el)
    });
    return errMap
  }

  get errList(){
    let errList = {
      functionNoData:[],
      modelNoData: [],
      deadCycleRunMapList:[]
    }
    this.errMap.notExistPropertyObjectList.forEach((el: any) => {
      (el.notExistPropertyObjectList as any).forEach(item => {
        if(item.objectType === 1){
          // @ts-ignore
          errList.functionNoData.push(el)
        }else{
          // @ts-ignore
          errList.modelNoData.push(el)
        }
      });
    })
    errList.deadCycleRunMapList = this.errMap.deadCycleRunMapList
    return errList
  }

  


  @Watch("selectedActivities")
  onSelectActivitiesChange(v: any) {
    if (v && v.length >= 2) {
      this.sizeDisabled = false;
      if (v.length >= 3) {
        this.dicDisabled = false;
      } else {
        this.dicDisabled = true;
      }
    } else {
      this.dicDisabled = true;
      this.sizeDisabled = true;
    }
  }

  @Watch("$i18n.locale")
  onLanguageChange() {
    this.propsToData();
  }
}
</script>

<style lang="less" scoped>
.workflow {
  background: #e9edf2 !important;
  .workflow-head {
    display: flex;
    width: 100%;
    height: 48px;
    overflow: hidden;
    background: #fff;
    margin-bottom: 8px;
    .workflow-head-l {
      flex: none;
      padding: 0 24px;
      width: 220px;
      text-align: left;
      .workflow-name {
        max-width: 112px;
        white-space: nowrap;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        overflow: hidden;
        font-size: 16px;
        line-height: 48px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        display: inline-block;
        font-weight: bold;
        .icon {
          margin-right: 9px;
          color: rgba(0, 0, 0, 0.65);
        }
      }
      .workflow-version {
        display: inline-block;
        vertical-align: top;
        font-size: 14px;
        margin-left: 8px;
        line-height: 48px;
        color: rgba(0, 0, 0, 0.85);
      }
    }
    .workflow-head-c {
      flex-grow: 1;
      text-align: center;
      ul {
        height: 100%;
        width: 100%;
        overflow: hidden;
        &:after {
          content: "";
          display: block;
          height: 0;
          clear: both;
        }
        .toolbar {
          display: inline-block;
          line-height: 48px;
          margin-left: 16px;
          font-size: 12px;
          cursor: pointer;
          user-select: none;
          color: rgba(0, 0, 0, 0.65);
          &:hover {
            color: @primary-color;
          }
          i {
            font-size: 14px;
            vertical-align: middle;
            margin-right: 5px;
            &:before {
              transform: rotate(180deg);
            }
          }
        }
        .disabled {
          color: #ccc;
          cursor: not-allowed;
          &:hover {
            color: #ccc;
          }
        }
      }
    }
    .workflow-head-r {
      flex: none;
      margin-right: 24px;
      .workflow-btn {
        background: #fff;
        margin-top: 8px;
        margin-left: 8px;
        cursor: pointer;
        border: 1px solid #d9d9d9;
        padding: 0 16px;
        height: 32px;
        border-radius: 4px;
        color: #fff;
        font-size: 14px;
        transition: all 0.5s ease;
        background: @primary-color;
        &:hover {
          border-color: @primary-color;
          // color: @primary-color;
        }
        i {
          margin-right: 5px;
          font-size: 14px;
          &:hover {
            color: unset;
          }
        }
      }
      .disabled {
        color: rgba(0, 0, 0, 0.25);
        background-color: #f5f5f5;
        border-color: #d9d9d9;
        cursor: not-allowed;
      }
      .publish {
        background: @primary-color;
        color: #fff;
        &:hover {
          background: @primary-color;
          color: #fff;
        }
      }
    }
  }
  .workflow-content {
    .workflow-content-left {
      /deep/.h3-sider-body {
        overflow: hidden;
        border-radius: 4px;
        padding-right: 8px;
        // background: #fff;
      }
    }
    .workflow-content-right {
      /deep/.h3-sider-body {
        overflow: hidden;
        border-radius: 4px;
        padding-left: 8px;
        // background: #fff;
      }
    }
    padding: 0 16px;
    display: flex;
    height: calc(100% - 57px);
    width: 100%;

    .property-name {
      width: 100%;
      height: 46px;
      line-height: 46px;
      text-align: center;
      border-bottom: 1px solid #e9e9e9;
    }
    .designer-wrap {
      padding: 30px 30px 50px 30px;
      flex-grow: 1;
      overflow: auto;
      background: #fff;
    }
  }

  /deep/.ant-collapse > .ant-collapse-item {
    border-bottom: none;
  }

  /deep/.ant-collapse > .ant-collapse-item .ant-collapse-content-box {
    border-top: 1px solid #e9e9e9;
  }
  /deep/.property-container .property-panel-style .property-item {
    border-top: none;
    border-bottom: 1px solid #e9e9e9;
  }

  /deep/.property-container .property-panel-style .last-none-item {
    border-top: none;
  }

  /deep/.ant-collapse > .ant-collapse-item > .ant-collapse-header {
    padding: 12px 0 12px 30px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
  }
  /deep/.ant-collapse > .ant-collapse-item > .ant-collapse-header .arrow {
    left: 8px;
  }
  /deep/.ant-select-selection__rendered {
    line-height: 32px;
  }
  .validate-loading-box {
    position: fixed;
    top: 75px;
    left: 50%;
    margin-left: -100px;
    text-align: center;
    width: 197px;
    height: 42px;
    line-height: 42px;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.43);
    background: white;
    color: #4a4a4a;
    transform: scale(0);
    transition: all ease 0.3s;
    span {
      margin-right: 8px;
    }
    &.active {
      transform: scale(1);
    }
  }
}
.workflow-panel {
  position: relative;
  z-index: 10;
  height: 100%;
}

.ant-modal-body {
  padding: 16px 24px;
}

.title-tip {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
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

.checkRuleBox {
  & > p.tip_summary {
    margin-top: 13px;
    font-size: 16px;
    font-weight: 500;
    color: #000000;
    i.h-icon-all-close-circle {
      color: #f4454e;
    }
    i.h-icon-all-check-circle {
      color: #17bc94;
    }
  }
  & > ol.tip_detail {
    margin: 16px 0;
    padding: 12px 16px;
    background: #fff1f0;
    border-radius: 4px;
    border: 1px solid #ffc5c2;
  }
  & > div.board {
    width: 100%;
    height: 562px;
    overflow: scroll;
  }
}
</style>

<style lang="less">
.div-height {
  height: 100%;
  .input-modal {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 11px;
    cursor: pointer;
    .txt {
      flex: 1 1;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
.property-bind-biz-method,
.data-action-modal-content,
.property-execute-condition,
.property-judgement-condition,
.property-timing-task {
  .delete {
    position: relative;
    top: 6px;
  }
}
</style>
