<template>
  <div class="commonsetting-panel">
    <!-- 流程编码 -->
    <property-widget
      v-if="type !== 'line'"
      :label="type === 'workflow' ? '流程编码' : '编码'"
    >
      <div slot="right" class="right-box">
        <p v-if="type === 'workflow'" class="inner-padding grey-box">
          {{ workflowData.workflowCode }}
        </p>

        <a-tooltip
          :visible="isShowErrAC"
          :getPopupContainer="getPopupContainer"
          v-else
        >
          <template slot="title">
            <span>{{ acErrMsg }}</span>
          </template>
          <div :class="isShowErrAC ? 'input-box has-error' : 'input-box'">
            <a-input
              v-model="curActivityProps.commonSettings.activityCode"
              class="input-item"
              @change="validateAC()"
            />
          </div>
        </a-tooltip>
      </div>
    </property-widget>

    <!-- 流程名称 -->
    <property-widget label="显示名称">
      <div slot="right" class="right-box">
        <a-tooltip
          :visible="isShowErrName"
          :getPopupContainer="getPopupContainer"
          v-if="type === 'workflow'"
        >
          <template slot="title">
            <span>{{ nameErrMsg }}</span>
          </template>
          <div :class="isShowErrName ? 'input-box has-error' : 'input-box'">
            <a-input
              v-if="isChinese"
              v-model="workflowData.workflowName"
              class="input-item"
              @change="validateName('workflow')"
            />

            <a-input
              v-else
              v-model="workflowData.name_i18n[$i18n.locale]"
              class="input-item"
              @change="validateName('workflow')"
            />
          </div>
        </a-tooltip>

        <a-tooltip
          :visible="isShowErrName"
          :getPopupContainer="getPopupContainer"
          v-else-if="type === 'line'"
        >
          <template slot="title">
            <span>{{ nameErrMsg }}</span>
          </template>
          <div :class="isShowErrName ? 'input-box has-error' : 'input-box'">
            <a-input
              v-if="isChinese"
              v-model="curActivityProps.commonSettings.text"
              class="input-item"
              @change="validateName('line')"
            />

            <a-input
              v-else
              v-model="curActivityProps.commonSettings.name_i18n[$i18n.locale]"
              class="input-item"
              @change="validateName('line')"
            />
          </div>
        </a-tooltip>

        <a-tooltip
          :visible="isShowErrName"
          :getPopupContainer="getPopupContainer"
          v-else
        >
          <template slot="title">
            <span>{{ nameErrMsg }}</span>
          </template>
          <div :class="isShowErrName ? 'input-box has-error' : 'input-box'">
            <a-input
              v-if="isChinese"
              v-model="curActivityProps.commonSettings.activityName"
              class="input-item"
              @change="validateName('activity')"
            />
            <a-input
              v-else
              v-model="curActivityProps.commonSettings.name_i18n[$i18n.locale]"
              class="input-item"
              @change="validateName('activity')"
            />
          </div>
        </a-tooltip>

        <!-- <a-input
          v-if="type === 'workflow'"
          placeholder="显示名称"
          v-model="workflowData.workflowName"
        ></a-input>
        <a-input
          v-else-if="type === 'line'"
          placeholder="显示名称"
          v-model="curActivityProps.commonSettings.text"
        ></a-input>
        <a-input
          v-else
          placeholder="显示名称"
          v-model="curActivityProps.commonSettings.activityName"
        ></a-input>-->
      </div>
    </property-widget>

    <!-- 公开外链 -->
    <template v-if="type === 'workflow'">
      <!-- 条件设置 -->
      <property-widget label="公开外链">
        <div slot="right" class="right-box">
          <ellipsis-input
            :value="workflowData.externalLinkEnable ? '已开启' : '未开启'"
            @click="showLinkModal"
          />
        </div>
      </property-widget>
    </template>

    <!-- 任务表单 -->
    <template v-if="type === 'PARTICIPANT' || type === 'CIRCULATE'">
      <property-widget label="任务表单">
        <div slot="right" class="right-box">
          <a-select
            show-search
            class="task-select"
            v-model="curActivityProps.commonSettings.sheetCode"
          >
            <a-select-option
              v-for="(task, index) in taskList"
              :key="index"
              :value="task.code"
              >{{ task.name }}</a-select-option
            >
            <div class="select-empty-content" slot="notFoundContent">
              暂无数据
            </div>
          </a-select>
        </div>
      </property-widget>
    </template>

    <!-- 前置条件 -->
    <template v-if="type === 'PARTICIPANT' || type === 'CONNECTION'">
      <property-widget
        label="前置条件"
        tip="多条分支汇合点可配置任一分支或全部分支流转到汇合节点后激活汇合节点"
      >
        <div slot="right" class="right-box">
          <a-select
            show-search
            class="task-select"
            v-model="curActivityProps.commonSettings.preCondition.type"
            @change="handleSelectChange"

          >
            <a-select-option
              v-for="(item, index) in preConditionList"
              :key="index"
              :value="item.code"
              >{{ item.name }}</a-select-option
            >
            <div class="select-empty-content" slot="notFoundContent">
              暂无数据
            </div>
          </a-select>
        </div>
      </property-widget>
    </template>

    <!-- 后置条件 -->
    <template v-if="type === 'PARTICIPANT'">
      <property-widget
        label="后置条件"
        tip="存在并行分支的流程节点可配置当前节点审批通过后其他分支取消"
      >
        <div slot="right" class="right-box">
          <a-checkbox
            v-model="curActivityProps.acticityEvent.endActivity.cancelParllelActivity"
            class="checkbox"
          ></a-checkbox>
          <span class="left">通过时取消并行活动</span>
        </div>
      </property-widget>
    </template>

    <!-- 绑定业务方法 -->
    <template v-if="type === 'SYSTEM_ACTIVITY'">
      <property-widget label="绑定业务规则">
        <div slot="right" class="right-box">
          <a-select
            mode="multiple"
            class="task-select"
            :labelInValue="true"
            @change="bizRuleChange"
            :value="bizActions"
          >
            <a-select-option
              v-for="business in bizRuleList"
              :value="business.code"
              :key="business.code"
              >{{ business.name }}</a-select-option
            >
          </a-select>
        </div>
      </property-widget>
    </template>

    <!-- 结束条件 -->
    <template v-if="type === 'SYSTEM_ACTIVITY'">
      <property-widget
        label="结束条件"
        tip="不满足条件时流程会一直停留在当前节点，满足条件后会进入下一节点"
      >
        <div slot="right" class="right-box">
          <ellipsis-input
            :value="
              curActivityProps.commonSettings.finishCondition
                ? '条件已设置'
                : ''
            "
            @click="showFinishConditionModal"
          />
        </div>
      </property-widget>
    </template>

    <!-- 子流程相关 -->
    <template v-if="type === 'SUB_INSTANCE'">
      <!-- 子流程启动方式 -->
      <property-widget
        label="子流程启动方式"
        title="子流程启动方式"
        tip="同步指的是子流程结束前流程会停留在子流程节点，不会走到下个节点；异步指的是子流程被激活的同时父流程继续向下流转，子流程是否结束不影响父流程运行"
      >
        <a-radio-group
          v-model="curActivityProps.commonSettings.sync"
          slot="right"
        >
          <a-radio :value="true">同步</a-radio>
          <a-radio :value="false">异步</a-radio>
        </a-radio-group>
      </property-widget>

      <!-- 子流程模板 -->
      <!-- <property-widget label="子流程模板">
        <template>
          <div slot="right" class="right-box">
            <a-tree-select
              v-if="isShowWorkflowList"
              dropdownClassName="sub-tpl-ts"
              :loadData="loadTreeData"
              @select="setChildWorkflowSchema"
              v-model="curActivityProps.commonSettings.workflowCode"
              :treeData="subWorkflowTplsTree"
              :treeDefaultExpandedKeys="dkeys"
            >
              <span
                slot="title"
                slot-scope="{label, icon}"
                class="cus-title"
              >
                <i :class="'icon aufontAll ' + icon"/>
                {{ label }}
              </span>
            </a-tree-select>
          </div>
        </template>
      </property-widget> -->

      <property-widget label="子流程模板">
        <template>
          <div slot="right" class="right-box">
            <flowTree
              v-if="isShowWorkflowList"
              v-model="curActivityProps.commonSettings.workflowCode"
              @select="setChildWorkflowSchemaNew"
            />
          </div>
        </template>
      </property-widget>

      <!-- 发起环节 -->
      <property-widget label="发起环节">
        <div slot="right" class="right-box">
          <div class="check-box inner-padding">
            <!-- <a-checkbox-group v-model="curActivityProps.commonSettings.finishStartActivity"> -->
            <a-checkbox
              class="checkbox"
              v-model="curActivityProps.commonSettings.finishStartActivity"
              @change="setFinishStartActivity"
            ></a-checkbox>
            <span>自动提交</span>
            <!-- </a-checkbox-group> -->
          </div>
        </div>
      </property-widget>

      <!-- 触发对象 -->
      <property-widget
        label="触发对象"
        tip="触发对象是主表时，父子流程映射只支持主表字段映射；是子表时，支持主表/子表数据映射，且只支持设置子表的选人数据项作为子流程的参与者；"
      >
        <div slot="right" class="right-box">
          <a-select
            class="task-select"
            v-model="triggerMapping"
            @select="selectChange"
          >
            <a-select-option
              v-for="sheet in childSheetList"
              :value="sheet.code"
              :key="sheet.code"
              >{{ sheet.name }}</a-select-option
            >
          </a-select>
        </div>
      </property-widget>
      <property-widget label="触发条件" v-if="triggerMapping !== 'main'">
        <div slot="right" class="right-box">
          <filter-condition
            :triggerMapping="triggerMapping"
            :value="curActivityProps.commonSettings.subFlowTriggerCondition"
            @change="onChange"
          ></filter-condition>
        </div>
      </property-widget>
    </template>

    <!-- 连接线属性 -->
    <template v-if="type === 'line'">

      <property-widget
        label="描述"
      >
        <div slot="right" class="right-box right-box-textarea">
          <a-textarea 
          v-model="curActivityProps.commonSettings.description"
          placeholder="分支条件描述说明"
          class="line-describe"
          :maxLength="200"
          :auto-size="{ minRows: 2 }"></a-textarea>
          <div class="right-box-num">
            {{typeof curActivityProps.commonSettings.description=='string'? curActivityProps.commonSettings.description.length:0}}/200
          </div>
        </div>
      </property-widget>

      <!-- 条件设置 -->
      <property-widget
        label="条件设置"
        tip="当条件满足时流程会流入目标节点"
        v-if="!curActivityProps.commonSettings.utilizeElse"
      >
        <div slot="right" class="right-box">
          <ellipsis-input
            :value="curActivityProps.commonSettings.formula ? '条件已设置' : ''"
            @click="showCondition"
          />
        </div>
      </property-widget>

    

      <!-- 是否为else -->
      <property-widget label="是否使用else">
        <a-radio-group
          v-model="curActivityProps.commonSettings.utilizeElse"
          slot="right"
        >
          <a-radio :value="true">是</a-radio>
          <a-radio :value="false">否</a-radio>
        </a-radio-group>
      </property-widget>
    </template>

    <!-- 条件弹窗 -->
    <condition-modal
      v-model="showConditionModal"
      :data="curActivityProps.commonSettings"
      @close="showConditionModal = false"
      @submit="setCondition"
    />
    <!-- 发起流程外链弹窗 -->
    <ExternalLink
      @backData="setExternalLink"
      v-model="showLink"
      :data="linkData"
    />
    <!-- 系统节点结束条件 -->
    <condition-modal
      v-model="showFinishCondition"
      :data="{
        formula: curActivityProps.commonSettings.finishCondition,
        popupType: judgePopType(
          curActivityProps.commonSettings.finishCondition
        ),
      }"
      @close="showFinishCondition = false"
      @submit="setFinishCondition"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, namespace } from "vuex-class";
import * as WorkflowNamespace from "@/typings/workflow";
import { getRealLength } from "@/common/utils";
import workflowApi from "@/apis/workflow";
import PropertyWidget from "../base/propertyWidget.vue";
import ellipsisInput from "../base/ellipsisInput.vue";
import { SWTreeGenerator } from "../helper/helper";
/* 弹窗 */
import ConditionModal from "../modals/condition/index.vue";
import ExternalLink from "../modals/external-link.vue";
import FilterCondition from "../modals/filter-condition.vue";

import flowTree from "../base/flow-tree.vue";
import { no } from '../../form-design/editor/html-parser';

const WorkflowModule = namespace("Apps/Workflow");

const AppItemModule = namespace("Apps/AppItem");

const AppCenterModule = namespace("Apps/AppCenter");

enum NotifyType {
  default = 0,
  customerize = 1,
}

@Component({
  name: "CommonSetting",
  components: {
    PropertyWidget,
    ellipsisInput,
    ConditionModal,
    ExternalLink,
    flowTree,
    FilterCondition,
  },
})
export default class CommonSetting extends Vue {
  /**
   * 类型，根据不同类型展示不同的的属性
   * 流程属性：'workflow'
   * 连接线：'line'
   * 节点：对应的 activityType
   *  */
  @Prop() type!: any;

  @WorkflowModule.State("activities") activities: any;

  @WorkflowModule.State("curActivityProps") curActivityProps: any;

  @WorkflowModule.State("workflowData") workflowData: any;

  @WorkflowModule.State("WorkflowDataItem") WorkflowDataItem: any;

  @WorkflowModule.State("WorkflowDataItem_origin") WorkflowDataItemOrigin: any;

  @WorkflowModule.State("subWorkflowTplsTree") subWorkflowTplsTree: any;

  @WorkflowModule.State("taskList") taskList: any;

  @WorkflowModule.State("preConditionList") preConditionList: any;

  @WorkflowModule.State("workflow") workflow: any;

  @WorkflowModule.State("curActivityID") curActivityID: any;

  @WorkflowModule.State("bizMethodList") bizMethodList: any;

  @WorkflowModule.State("bizRuleList") bizRuleList: any;

  @WorkflowModule.Mutation("setChildWorkflow") setChildWorkflow: any;

  @WorkflowModule.Mutation("setPropValue") setPropValue: any;

  @WorkflowModule.Mutation("setIsSaveProp") setIsSaveProp: any;

  @WorkflowModule.Mutation("setSubWorkflowTplsTree")
  setSubWorkflowTplsTree: any;

  @WorkflowModule.Mutation("setWorkflowChooseAction")
  setWorkflowChooseAction: any;

  @WorkflowModule.Mutation("setWorkflowEventHandler")
  setWorkflowEventHandler: any;

  // @WorkflowModule.Action('setTreeDataAsync') setTreeDataAsync: any;

  // @WorkflowModule.Action('getAppMenu') getAppMenu: any;

  @WorkflowModule.Action("getWorkflowDetails") getWorkflowDetails: any;

  @AppItemModule.Action("getWorkflowList") getWorkflowList: any;

  @AppCenterModule.State("appList") appList: any;

  @AppCenterModule.Action("getAppList") getAppList: any;

  // 判断当前是否是中文版本
  get isChinese() {
    return this.$i18n.locale === "zh";
  }

  subInstanceWays: Array<any> = [
    { label: "同步", value: true },
    { label: "异步", value: false },
  ];

  defaultSubinstanceWay: boolean = false;

  showConditionModal: boolean = false;

  // 是否展示条件设置弹窗
  showFinishCondition: boolean = false; // 是否展示系统节点结束条件弹窗

  showLink: boolean = false; // 是否展示发起流程外链弹窗

  linkData: any = {};

  isShowWorkflowList: boolean = true;

  levelOneIndex: number = -1;

  levelTwoIndex: number = -1;

  levelThreeIndex: number = -1;

  // 父级key
  parentKey: string = "";

  isShowErrAC: boolean = false;

  acErrMsg: string = "";

  isShowErrName: boolean = false;

  nameErrMsg: string = "";

  cacheActivityCode: string = "";

  dkeys: Array<string> = [];

  tree: any = [];

  au_mark: string = "";

  bizActions: any = [];

  triggerMapping: any = "main";

  get defaultSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => data.defaultProperty
    );
  }

  get bizSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => !data.defaultProperty
    );
  }

  // 子流程触发对象子表列表
  get childSheetList() {
    const arr = this.WorkflowDataItem.filter((d: any) => d.propertyType === 8);
    arr.splice(0, 0, {
      code: "main",
      name: "主表",
    });
    return arr;
  }


  handleSelectChange(val) {
    console.log('val', val)
    this.setPropValue({
      key: "commonSettings.preCondition",
      value: {type: val, rule: {}},
    });
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  /*
   * 子流程触发对象change事件
   */
  selectChange(val: any) {
    console.log(val);
    
    this.triggerMapping = val;
    if (val === "main") {
      const data = {
        mainTable: 0,
      };
      this.setPropValue({
        key: "commonSettings.triggerMappingObj",
        value: data,
      });
    } else {
      const data = {
        mainTable: 1,
        code: val,
      };
      this.setPropValue({
        key: "commonSettings.triggerMappingObj",
        value: data,
      });
      this.setPropValue({
        key: "commonSettings.subFlowTriggerCondition",
        value: {},
      });
    }
    // 切换触发对象参与者值置空
    this.setPropValue({
      key: "participant.participant",
      value: "",
    });
    // 切换触发对象为子表时，去掉数据映射里已设置其他子表映射值
    if (Array.isArray(this.curActivityProps.workflowDataMaps)) {
      const mapData = this.curActivityProps.workflowDataMaps
        .map((map: any) => {
          if (map.parentDataName.indexOf(".") === -1) {
            return map;
          }
          const cSheetCode = map.parentDataName.split(".")[0] as string;
          const subIsChildCode: boolean = map.childDataName.indexOf(".") > -1; // 子流程数据是否为子表数据项
          if (cSheetCode !== val && !subIsChildCode) {
            return;
          } else if (cSheetCode === val && subIsChildCode) {
            return;
          }
          return map;
        })
        .filter(Boolean);
      this.setPropValue({
        key: "workflowDataMaps",
        value: mapData,
      });
      this.$emit("setMappingStr");
    }
  }

  // 业务规则change事件
  bizRuleChange(val: any) {
    const vm: any = this;
    // 改变业务方法时，出现确认弹窗
    if (
      !this.curActivityProps.commonSettings.bizActionType ||
      this.curActivityProps.commonSettings.bizActionType === "BIZ_METHOD"
    ) {
      let label = "";
      vm.bizActions.forEach((biz: any, idx: number) => {
        label += `“${biz.label}”${
          idx === vm.bizActions.length - 1 ? "" : "、"
        }`;
      });
      this.$confirm({
        okText: "确定",
        cancelText: "取消",
        class: "biz-rule-confirm",
        content: `由于1.7.0及以后的版本，业务方法已升级为业务规则，如需修改，历史配置的业务方法${label}将被清除`,
        onOk() {
          vm.setPropValue({
            key: "commonSettings.bizActionType",
            value: "BIZ_RULE",
          });
          val = val.filter((v: any) => {
            const item = vm.bizActions.find((b: any) => b.key === v.key);
            if (item) {
              return false;
            }
            return true;
          });
          vm.bizActions = val;
          const value = val.map((biz: any) => {
            return biz.key;
          });
          vm.setPropValue({
            key: "commonSettings.bizActions",
            value,
          });
        },
      });
    } else {
      vm.setPropValue({
        key: "commonSettings.bizActionType",
        value: "BIZ_RULE",
      });
      vm.bizActions = val;
      const value = val.map((biz: any) => {
        return biz.key;
      });
      vm.setPropValue({
        key: "commonSettings.bizActions",
        value,
      });
    }
  }

  // 条件设置
  showCondition() {
    this.showConditionModal = true;
  }

  // 发起流程外链弹窗
  showLinkModal() {
    this.showLink = true;
    const { bizSchemaCode, workflowCode } = this.$route.params;
    this.linkData = {
      schemaCode: bizSchemaCode,
      workflowCode,
      shortCode: this.workflowData.shortCode,
      externalLinkEnable: this.workflowData.externalLinkEnable,
    };
  }

  // 设置外链数据
  setExternalLink(link: any) {
    this.setWorkflowEventHandler({ key: "shortCode", value: link.shortCode });
    this.setWorkflowEventHandler({
      key: "externalLinkEnable",
      value: link.externalLinkEnable,
    });
  }

  setCondition(payload: any) {
    this.setPropValue({
      key: "commonSettings.formula",
      value: payload.formula,
    });
    this.setPropValue({
      key: "commonSettings.popupType",
      value: payload.popupType,
    });
    // 保存条件，关闭弹窗
    this.showConditionModal = false;
  }

  // 系统节点--结束条件
  showFinishConditionModal() {
    this.showFinishCondition = true;
  }

  judgePopType(express: string) {
    /* 判断系统节点结束条件弹窗类型 */
    if (/==|>|<|>=|<=|!=|Contains/.test(express) || !express) {
      return "EXPRESSION";
    }
    return "FUNCTION";
  }

  setFinishCondition(payload: any) {
    this.setPropValue({
      key: "commonSettings.finishCondition",
      value: payload.formula,
    });
    // this.setPropValue({
    //   key: 'commonSettings.popupType',
    //   value: payload.popupType
    // });
    // 保存结束条件，关闭弹窗
    this.showFinishCondition = false;
  }

  async mounted() {
    this.cacheActivityCode = this.curActivityProps.commonSettings.activityCode;
    if (this.type === "SYSTEM_ACTIVITY") {
      this.mountBizRule();
    }
    if (this.type !== "line") {
      this.validateAC();
    }
    if (this.type === "SUB_INSTANCE") {
      this.dataMounted();
      // await this.getFlowPath();
      // this.handleInitTree();
    }
  }

  // 数据初始化
  dataMounted() {
    if (!this.curActivityProps.commonSettings.triggerMappingObj) {
      // 子流程触发对象默认为主表
      const data = {
        mainTable: 0,
      };
      this.setPropValue({
        key: "commonSettings.triggerMappingObj",
        value: data,
      });
      return;
    }
    const data = this.curActivityProps.commonSettings.triggerMappingObj;
    this.triggerMapping = data.code ? data.code : "main";
  }

  // 业务规则初始化
  mountBizRule() {
    this.bizActions = this.curActivityProps.commonSettings.bizActions
      ? this.curActivityProps.commonSettings.bizActions.map((b: any) => {
          let item: any = null;
          if (
            !this.curActivityProps.commonSettings.bizActionType ||
            this.curActivityProps.commonSettings.bizActionType === "BIZ_METHOD"
          ) {
            item = this.bizMethodList.find((m: any) => m.code === b);
          } else {
            item = this.bizRuleList.find((m: any) => m.code === b);
          }
          return {
            key: b,
            label: item ? item.name : b,
          };
        })
      : [];
  }

  /**
   * 通过接口获取子流程所在目录
   */
  // async getFlowPath() {
  //   if (!this.curActivityProps.commonSettings.workflowCode) return;
  //   const params: any = { workflowCode: this.curActivityProps.commonSettings.workflowCode.split('-')[1] as any };
  //   const res: any = await workflowApi.getParentByWorkflowCode(params);
  //   if (res.errcode === 0) {
  //     const arr: Array<string> = res.data.split('-');
  //     arr.pop();
  //     this.au_mark = arr.join('-');
  //   }
  // }

  /**
   * 流程模板树展示
   */

  // handleInitTree() {
  //   this.getAppList().then(async () => {
  //     // 生成第一级
  //     const temTree: any = SWTreeGenerator(this.appList, 1, 'App');
  //     this.setSubWorkflowTplsTree(temTree);

  //     //

  //     const { au_mark } = this;
  //     console.log(au_mark, 'au_mark')
  //     if (au_mark) {
  //       const markArr = au_mark.split('-');
  //       const _appCode = markArr[0];
  //       const appMenuRes = await this.getAppMenu({ appCode: _appCode });
  //       this.levelOneIndex = temTree.findIndex((item: any) => item.value === _appCode);
  //       // 获取第二级以及第三级
  //       if (appMenuRes.errcode === 0) {
  //         const _resData = appMenuRes.data;
  //         if (!_resData || _resData.length === 0) return;
  //         // 先生成二级树
  //         const levelTwoTree = SWTreeGenerator(_resData, 2, '', temTree[this.levelOneIndex].key);
  //         temTree[this.levelOneIndex].children = levelTwoTree;
  //         this.levelTwoIndex = temTree[this.levelOneIndex].children.findIndex((item: any) => item.value === markArr[1]);

  //         console.log(this.levelTwoIndex, 'this')

  //         // 再生成三级树
  //         _resData.forEach((rd: any, rdIndex: number) => {
  //           if (rd.type === 'Folder') { // 只有是目录类型才做三级目录的操作
  //             if (rd.children.length !== 0) {
  //               const levelThreeTree = SWTreeGenerator(rd.children, 3, '', temTree[this.levelOneIndex].children[rdIndex].key);
  //               temTree[this.levelOneIndex].children[rdIndex].children = levelThreeTree;
  //             }
  //           }
  //         });

  //         const getType: string = '';
  //         this.setSubWorkflowTplsTree(temTree);
  //         if (markArr.length === 3) { // 四级
  //           // 第二级是目录，取目录下的数据模型，再取流程列表
  //           const _schemaCode = markArr[2];
  //           try {
  //             this.levelThreeIndex = temTree[this.levelOneIndex].children[this.levelTwoIndex].children.findIndex((item: any) => item.value === markArr[2]);
  //           } catch (err) {
  //             this.levelThreeIndex = -1;
  //           }
  //           await this.handleGetWorkflowListAndToTree(_schemaCode, 4);
  //         } else {
  //           // 第二级是数据模型，直接取流程列表
  //           const _schemaCode = markArr[1];
  //           await this.handleGetWorkflowListAndToTree(_schemaCode, 3);
  //         }
  //         this.$nextTick(() => {
  //           this.dkeys = []; // 默认展示，todo
  //           this.isShowWorkflowList = true;
  //         });
  //       }
  //     } else {
  //       this.dkeys = []; // 默认展示，todo
  //       this.isShowWorkflowList = true;
  //     }
  //   });
  // }

  // 重复校验
  validateRepeatCode(ac: string) {
    if (this.curActivityID === -1) return;
    const acCode: any = this.activities.find(
      (activity: any) => activity.ID === this.curActivityID
    ).activityCode;
    if (ac !== acCode) {
      if (this.workflow.activityCodeArr.includes(ac)) {
        this.isShowErrAC = true;
        this.acErrMsg = "节点编码已存在";
        this.setIsSaveProp(false);
        return true;
      }
      this.isShowErrAC = false;
      this.acErrMsg = "";
      this.setIsSaveProp(true);
      return false;
    }
  }

  // 格式校验
  validateFormat(ac: string) {
    if (typeof ac !== "string") return;
    const reg = /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/;
    const len = getRealLength(ac);
    if (len <= 0) {
      this.isShowErrAC = true;
      this.acErrMsg = "编码不能为空";
      this.setIsSaveProp(false);
      return;
    }
    if (!reg.test(ac)) {
      this.isShowErrAC = true;
      this.acErrMsg = "以字母开头,包括字母或下划线或数字,不超过28个字符";
      this.setIsSaveProp(false);
    } else {
      this.isShowErrAC = false;
      this.acErrMsg = "";
      this.setIsSaveProp(true);
    }
  }

  // 校验编码
  validateAC() {
    const _ac: any = this.curActivityProps.commonSettings.activityCode;
    console.log("validate activity code");
    const isRepeat = this.validateRepeatCode(_ac);
    if (!isRepeat) {
      this.validateFormat(_ac);
    }
  }

  // 校验名称
  validateName(type: string) {
    let name: string = "";
    const { locale } = this.$i18n;
    if (type === "workflow") {
      name =
        locale === "zh"
          ? this.workflowData.workflowName
          : this.workflowData.name_i18n[locale];
    } else if (type === "line") {
      name =
        locale === "zh"
          ? this.curActivityProps.commonSettings.text
          : this.curActivityProps.commonSettings.name_i18n[locale];
    } else {
      name =
        locale === "zh"
          ? this.curActivityProps.commonSettings.activityName
          : this.curActivityProps.commonSettings.name_i18n[locale];
    }
    const reg = /^\S(.{0,49})?$/;
    const len = getRealLength(name);
    if (len <= 0) {
      if (type === "line") {
        this.isShowErrName = false;
        this.nameErrMsg = "";
        this.setIsSaveProp(true);
      } else {
        this.isShowErrName = true;
        this.nameErrMsg = "名称不能为空";
        this.setIsSaveProp(false);
        return;
      }
    } else if (len > 50 || !reg.test(name)) {
      this.isShowErrName = true;
      this.nameErrMsg = "请输入不以空格开头长度不超过50个字符";
      this.setIsSaveProp(false);
    } else {
      this.isShowErrName = false;
      this.nameErrMsg = "";
      this.setIsSaveProp(true);
    }
  }

  // async loadTreeData(node: any) {
  //   const _type = node.$vnode.data.props.type;
  //   const _val = node.$vnode.data.props.value;
  //   this.parentKey = node.$vnode.data.key;
  //   switch (_type) {
  //     case 'App': // 是应用，获取目录
  //       this.handleGetAppMenu(_val);
  //       break;
  //     case 'BizModel': // 是数据模型，获取流程
  //       this.handleGetWorkflowList(_val);
  //       break;
  //     default:
  //       break;
  //   }
  // }

  // 获取目录
  // async handleGetAppMenu(code: string) {
  //   const { au_mark } = this;
  //   if (code === au_mark.split('-')[0]) return;
  //   const appMenuRes = await this.getAppMenu({ appCode: code });
  //   if (appMenuRes.errcode === 0) {
  //     const _resData = appMenuRes.data;
  //     if (!_resData || _resData.length === 0) return;
  //     // 先生成二级树
  //     const levelTwoTree = SWTreeGenerator(_resData, 2, '', this.parentKey);

  //     // 再生成三级树
  //     _resData.forEach((rd: any, rdIndex: number) => {
  //       if (rd.type === 'Folder') { // 只有是目录类型才做三级目录的操作
  //         if (rd.children && rd.children.length !== 0) {
  //           const _key = `${this.parentKey}-${(rdIndex + 1).toString()}`;
  //           const levelThreeTree = SWTreeGenerator(rd.children, 3, '', _key);
  //           if (!levelTwoTree) return;
  //           levelTwoTree[rdIndex].children = levelThreeTree;
  //         }
  //       }
  //     });
  //     const _p = { key: this.parentKey, tree: levelTwoTree };
  //     this.setTreeDataAsync(_p);
  //   }
  // }

  // 获取流程列表
  // async handleGetWorkflowList(code: string) {
  //   const params: Apps.Workflow.WorkflowSchemaCode = {
  //     schemaCode: code
  //   };
  //   // 获取流程列表 最底层树
  //   const _worfklowRes = await this.getWorkflowList(params); // registration
  //   const level = this.parentKey.split('-').length === 2 ? 3 : 4;
  //   if (_worfklowRes.errcode === 0) {
  //     const workflowData = _worfklowRes.data;
  //     if (!workflowData && workflowData.length === 0) return;

  //     // 流程树
  //     // 过滤掉没有发布的流程
  //     const workflowList: Array<any> = workflowData.filter((item: any) => item.published);
  //     const workflowTree = SWTreeGenerator(workflowList, level, 'workflow', this.parentKey);
  //     const _p = { key: this.parentKey, tree: workflowTree };
  //     this.setTreeDataAsync(_p);
  //   }
  // }

  /**
   * 获取流程列表并生成树 初始化使用
   */
  // async handleGetWorkflowListAndToTree(code: string, level: number) {
  //   const params: Apps.Workflow.WorkflowSchemaCode = {
  //     schemaCode: code
  //   };
  //   const _worfklowRes = await this.getWorkflowList(params);
  //   const temTree = this.subWorkflowTplsTree;
  //   const lvOneIndex = this.levelOneIndex < 0 ? 0 : this.levelOneIndex;
  //   const lvTwoIndex = this.levelTwoIndex < 0 ? 0 : this.levelTwoIndex;
  //   const lvThreeIndex = this.levelThreeIndex < 0 ? 0 : this.levelThreeIndex;
  //   const _parentKey = level === 3 ? temTree[lvOneIndex].children[lvTwoIndex].key : temTree[lvOneIndex].children[lvTwoIndex].children[lvThreeIndex].key;
  //   if (_worfklowRes.errcode === 0
  //     && _worfklowRes.data
  //     && _worfklowRes.data.length !== 0) {
  //     // 过滤掉没有发布的流程
  //     const workflowList: Array<any> = _worfklowRes.data.filter((item: any) => item.published);
  //     const levelThreeOrFourTree = SWTreeGenerator(workflowList, level, 'workflow', _parentKey);
  //     if (level === 4) {
  //       temTree[lvOneIndex].children[lvTwoIndex].children[lvThreeIndex].children = levelThreeOrFourTree;
  //     } else {
  //       temTree[lvOneIndex].children[lvTwoIndex].children = levelThreeOrFourTree;
  //     }
  //     this.setSubWorkflowTplsTree(temTree);
  //   }
  // }

  setChildWorkflowSchemaNew({ schemaCode }) {
    const _schemaCode = schemaCode;
    if (!_schemaCode) return;
    this.setPropValue({
      key: "workflowDataMaps",
      value: [],
    });
    this.setChildWorkflow(_schemaCode);
  }

  // setChildWorkflowSchema(v: any, node: any) {
  //   const _schemaCode = node.$vnode.data.props.schemaCode;
  //   const _curKey = node.$vnode.data.key;
  //   // 保存记录 appCode-code-code-workflowCode
  //   const keyArr = _curKey.split('-');
  //   keyArr.pop();
  //   const strArr: Array<any> = [];
  //   keyArr.forEach((key: string, index: number) => {
  //     const i = parseInt(key, 10) - 1;
  //     keyArr[index] = i;
  //   });

  //   if (keyArr.length === 2) { // 长度为2 或者3
  //     strArr.push(this.subWorkflowTplsTree[keyArr[0]].value);
  //     strArr.push(this.subWorkflowTplsTree[keyArr[0]].children[keyArr[1]].value);
  //   } else {
  //     strArr.push(this.subWorkflowTplsTree[keyArr[0]].value);
  //     strArr.push(this.subWorkflowTplsTree[keyArr[0]].children[keyArr[1]].value);
  //     strArr.push(this.subWorkflowTplsTree[keyArr[0]].children[keyArr[1]].children[keyArr[2]].value);
  //   }

  //   this.setWorkflowChooseAction(strArr.join('-'));

  //   if (!_schemaCode) return;
  //   this.setChildWorkflow(_schemaCode);
  // }

  setFinishStartActivity(e: any) {
    const isChecked = e.target.checked;
    this.setPropValue({
      key: "commonSettings.finishStartActivity",
      value: isChecked,
    });
  }

  @Watch("curActivityID", { deep: true })
  async onCurActivityIDChange(v: any) {
    if (v) {
      const curActivity = this.activities.find((ac: any) => ac.ID === v);
      this.cacheActivityCode =
        this.curActivityProps.commonSettings.activityCode;
      if (this.type === "SYSTEM_ACTIVITY") {
        this.mountBizRule();
      }
      this.isShowWorkflowList = false;
      if (this.type === "SUB_INSTANCE") {
        this.dataMounted();
      }
      this.$nextTick(() => {
        this.isShowWorkflowList = true;
      });
      // await this.getFlowPath();
      // this.handleInitTree();
    }
  }

  @Watch("$i18n.locale")
  onLanguageChange() {
    this.validateName("workflow");
  }

  onChange(value: any) {
    // todo 根据元数据校验来自外部控件的数据
    this.curActivityProps.commonSettings.subFlowTriggerCondition = value;
  }
}
</script>



<style lang="less">
.right-box {
  width: 100%;
  display: flex;
  align-items: center;
  &.right-box-textarea{
    position: relative;
    padding-bottom: 20px;
    textarea:focus{
      box-shadow: none!important;
    }
    >.right-box-num{
      position: absolute;
      bottom: 0;
      right: 11px;
      color: #e2e2e2;
    }
  }
  .line-describe {
    border: none;
    border-radius: unset;
  }
  .inner-padding {
    padding: 0 12px;
    margin-bottom: 0;
  }
  .ant-select {
    width: 100%;
    .ant-select-selection {
      border: none !important;
    }
  }
  .grey-box {
    width: 100%;
    height: 31px;
    line-height: 31px;
    background: #f5f5f5;
  }
  .white-box {
    padding: 0 8px;
    margin-bottom: 0;
  }
}
.commonsetting-panel {
  .checkbox {
    margin-left: 8px;
  }
  .ant-radio-group {
    display: flex;
    width: 100%;
    padding: 0 8px;
  }
  .ant-radio-wrapper {
    flex: 1;
  }
  .task-select {
    width: 100%;
    border: none;
    .ant-select-selection {
      border: none;
      box-shadow: none;
    }
  }
  .input-box {
    width: 100%;
    input {
      width: 100%;
    }
  }
  .message-notify-box {
    .select-type {
      width: 100%;
      height: 32px;
      .input-select {
        width: 100%;
        height: 100%;
        border: none;
        .ant-select-selection {
          border: none;
          box-shadow: none;
        }
      }
    }
  }
}
.has-error .ant-input,
.has-error .ant-input:hover {
  border: 1px solid #f5222d !important;
}

.sub-tpl-ts {
  max-height: 45vh !important;
  /deep/ .ant-select-tree-treenode-disabled {
    span.ant-select-tree-title .cus-title {
      color: rgba(0, 0, 0, 0.65) !important;
    }
  }
  // 多出一个小方块，去除 by John 20191015
  /deep/.ant-select-tree-iconEle.ant-select-tree-icon__customize {
    display: none !important;
  }
}
.select-empty-content {
  margin: 8px 0;
  text-align: center;
}
.biz-rule-confirm {
  /deep/.ant-modal-confirm-title {
    display: none;
  }
  /deep/.ant-modal-confirm-content {
    word-break: break-all;
  }
}
</style>
