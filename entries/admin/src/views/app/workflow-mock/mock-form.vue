<template>
  <div class="form-detail">
    <form-detail-header :nodes="nodes" @nodesSwitch="nodesSwitch">
      <form-actions
        v-if="showActions"
        :actions="mockActions"
        @action="onAction"
        :toShowPrints="isShow"
        :setPdfConf="pdfAble"
      ></form-actions>
    </form-detail-header>

    <div class="form-body" @scroll="onBodyScroll">
      <div class="form-wrap">
        <div class="form-d-box">
          <workflow-info
            v-if="workflowInstanceId"
            :id="workflowInstanceId"
            :itemId="formObj.workItemId"
            :curNode="formObj.activityCode"
            @setFinishTime="setFinishTime"
            mockMode="true"
          ></workflow-info>
          <pc-form-renderer
            :class="{'has-form-border': borderMode}"
            ref="formRenderer"
            :controls="controls"
            :relevanceDataList="dataModalList"
            :formPermission="formObj.formPermission"
            :formControls="formControls"
            :dataItems="dataItems"
            sourceType="portal"
            @sheetColumnResize="onSheetColumnResize"
          ></pc-form-renderer>

          <a-collapse
            v-if="workflowInstanceId"
            class="workflow-collapse"
            activeKey="approvals"
            :bordered="false"
          >
            <a-collapse-panel
              class="bold-collapse-panel"
              :header="$t('languages.common.approval')"
              key="approvals"
            >
              <Approval
                :workflowInstanceId="workflowInstanceId"
                :completed="completed"
                :canceled="canceled"
                :finishTime="finishTime"
                mockMode="true"
                :getFileUrlFn="getFileUrlFn"
                @download="onDownload"
              ></Approval>
            </a-collapse-panel>
          </a-collapse>

          <form-action-modal ref="actionModal" @ok="onOk"></form-action-modal>
        </div>
      </div>
      <div v-show="showBacktop" class="back-top" @click="backTop">
        <a-icon type="up"></a-icon>
      </div>
    </div>

    <a-alert
      v-if="comment"
      :message="comment"
      type="info"
      banner
      closable
      class="alert-info" />

    <a-alert
      v-if="showAlertWarn"
      class="alert-warning"
      message="该表单未发布，请联系管理员处理"
      type="warning"
      showIcon
      closable
    />
  </div>
</template>

<script lang="ts">
import "@/config/h3-form";

import { Component, Vue, Prop, Provide } from "vue-property-decorator";

import { schema, renderer, runtime } from "@cloudpivot/form";

import * as pcForm from "@cloudpivot/form/pc";

import { formApi, workflowApi, workflow } from "@cloudpivot/api";

import flow from "@cloudpivot/flow/pc";

import common from "@cloudpivot/common";

const { replaceValueData } = common.utils.BusinessFunctions;

import FormDetailHeader from "./form-detail-header.vue";

@Component({
  name: "mockForm",
  components: {
    FormDetailHeader,
    WorkflowInfo: flow.components.WorkflowInfo,
    FormActionModal: pcForm.runtime.FormActionModal,
    Approval: flow.components.Approval,
    PcFormRenderer: pcForm.renderer.FormRenderer,
    FormActions: pcForm.runtime.FormActions,
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      (vm as mockForm).clean();
      (vm as mockForm).beforeLoad();
    });
  },

  beforeRouteUpdate(to, from, next) {
    const vm = this as mockForm;
    vm.clean();
    next();
    vm.beforeLoad();
  }
})
export default class mockForm extends pcForm.runtime.FormDetail {
  showBacktop = false;

  draftAttributesJson: any[][] = [];
  formdata: any = null;
  isShow: boolean = false; // 是否有打印模板
  pdfAble: boolean = false; // 是否开启打印模板
  showPdf: boolean = false;
  showAlertWarn = false;
  timer: any = null;
  finishTime: string = "";

  @Provide()
  layoutTypeFn() {
    return this.formObj && this.formObj.bizSheet && this.formObj.bizSheet.layoutType === "vertical";
  }

  get borderMode() {
    return this.formObj && this.formObj.bizSheet && this.formObj.bizSheet.borderMode === "open";
  }

  get completed() {
    return (
      this.formObj &&
      this.formObj.bizObject &&
      this.formObj.bizObject.sequenceStatus === "COMPLETED"
    );
  }

  get canceled() {
    return (
      this.formObj && this.formObj.bizObject && this.formObj.bizObject.sequenceStatus === "CANCELED"
    );
  }

  get mockActions() {
    const { startWorkflowCode } = this.$route.query;
    if (startWorkflowCode && !this.formObj.workflowInstanceId) {
      const action = this.actions.filter((ac:any) => ac.code === runtime.FormAction.Submit);
      return action;
    }
    return this.actions.filter((ac:any) => ac.code !== runtime.FormAction.Print);
  }

  get showActions() {
    const { onlyView } = this.$route.query;
    return !onlyView;
  }

  mounted() {
    this.$message.config({
      maxCount: 1,
      duration: 3
    });
    // 来自待阅的页面需要发出重载信号
    const { workitemType } = this.$route.query;
    if (workitemType && workitemType === 'unreadWorkitem') {
      const url: any = this.$route.query.return;
      window.onbeforeunload = () => {
        opener.postMessage(url, opener.location.href);
      };
    }
  }


  /**
   * 让收起按钮始终可见
   * */

  makeRetractShow() {
    const formWrap: HTMLDivElement = document.querySelector(".form-wrap") as HTMLDivElement;
    const retractDom: HTMLDivElement = document.querySelector(".retract") as HTMLDivElement;
    if (!retractDom) return;
    formWrap.addEventListener("scroll", (e: any) => {
      const st: number = formWrap.scrollTop as number;
      (retractDom.style as any).top = `${st + 3}px`;
    });
  }

  // 页面销毁的时候
  destroyed() {
    clearInterval(this.timer);
  }

  onBodyScroll(evt: Event) {
    const formBody = evt.target as HTMLDivElement;
    this.showBacktop = formBody.scrollTop > 0;
  }

  @Provide()
  getScrollEl() {
    return this.$el.querySelector(".form-wrap") as HTMLDivElement;
  }

  backTop() {
    const formBody = this.getScrollEl();
    if (formBody) {
      formBody.scrollTop = 0;
    }
  }

  showMessage() {
    const h3Messsag = this.$refs.h3Messsag as any;
    return h3Messsag.show();
  }

  get $message() {
    return Vue.prototype.$message;
  }

  get $confirm() {
    return Vue.prototype.$confirm;
  }

  get getFileUrlFn() {
    return renderer.UploadControl.service.getDownloadUrl;
  }

  clean(excludeNode?: boolean) {
    super.clean(excludeNode);
    this.showBacktop = false;
  }

  get dataItems() {
    if (this.formObj.bizSchema && this.formObj.bizSchema.properties) {
      return this.formObj.bizSchema.properties;
    }

    return [];
  }

  async beforeLoad() {
    if (this.isWorkFlowSheet) {
      this.nodes = await (this.getWorkFlowNodes() as any);
      this.nodes.forEach((res, index) => {
        if (index === 0) {
          res.selected = true;
        } else {
          res.selected = false;
        }
      });
      if (this.nodes.length > 0) {
        this.getNodesParams(this.nodes[0].activityCode);
      }
      this.load();
    } else {
      this.load();
    }
  }

  nodesSwitch(node: string) {
    this.getNodesParams(node);
    this.clean(true);
    this.load();
  }

  async load(edit?: boolean) {
    let closeLoading;
    if (!/Trident/.test(navigator.userAgent)) {
      closeLoading = this.$message.loading(null, 0);
    }
    try {
      const res = await super.load(edit);

      this.loadSheetColumnWidth();

      if (this.formObj) {
        let {
          creater: { name }
        } = this.formObj.bizObject;

        // 附件上传者因为当前表单操作者
        const operater = window.sessionStorage.getItem("user");
        operater ? name = JSON.parse(operater).name : name;
        window.sessionStorage.setItem("uploadName", name);
        const title = this.formObj.instanceName || this.formObj.bizSheet.name;
        document.title = `云枢-${title}`;
      }

      this.$nextTick(() => {
        this.makeRetractShow();
      });
    } catch (e) {
      console.log(e);return;
      if (e.errcode === 601010 || e.errcode === 6000018) {
        this.goPermission();
        return;
      }

      if (
        e.errcode === 302034 ||
        (this.formObj &&
          this.formObj.bizSheet &&
          this.formObj.bizSheet.publishedAttributesJson === null)
      ) {
        this.goUnpublished();
        return;
      }

      const noData =
        this.formObj && this.formObj.bizObject ? this.formObj.bizObject.loadedFromDb : true;
      if (e.errcode === 402500 || !noData) {
        setTimeout(() => {
          this.$message.error("页面渲染失败或数据已删除，请检查HTML设置或者数据。");
        }, 50);
      }

      this.goEmptyPage();
      return;
    } finally {
      if (closeLoading) {
        closeLoading();
      }
    }
  }

  getSheetStorageKey(sheet: schema.FormSheet) {
    return `${this.formObj.bizSchema.code}-${this.formObj.bizSheet.code}-${sheet.key}`;
  }

  onSheetColumnResize(data: {
    sheet: schema.FormSheet;
    column: schema.FormSheetColumn;
    width: number;
  }) {
    const key = this.getSheetStorageKey(data.sheet);
    let json = localStorage.getItem(key);

    let widthMap: any;
    if (json) {
      try {
        widthMap = JSON.parse(json);
      } catch (error) { }
    }

    if (!widthMap) {
      widthMap = {};
    }

    widthMap[data.column.key] = data.width;

    json = JSON.stringify(widthMap);
    localStorage.setItem(key, json);
  }

  loadSheetColumnWidth() {
    const formControls: schema.RendererFormControl[] = [];
    renderer.components.FormRendererHelper.findFormControl(this.controls, formControls);

    const sheets = formControls.filter(
      c =>
        c.type === schema.FormControlType.Sheet &&
        ((c as any) as schema.FormSheet).columns.length > 0
    );

    for (const s of sheets) {
      const sheet = (s as any) as schema.FormSheet;
      const key = this.getSheetStorageKey(sheet);
      const json = localStorage.getItem(key);
      if (!json) {
        continue;
      }

      try {
        const widthMap = JSON.parse(json);

        if (!widthMap) {
          continue;
        }

        for (const col of sheet.columns) {
          const w = widthMap[col.key];
          if (w) {
            col.width = w;
          }
        }
      } catch { }
    }
  }

  onOk(ac: runtime.FormActionButton, data: any) {
    // 删除保存在sessionStorage中的值，防止错误填充审批衣间
    window.sessionStorage.removeItem("$approval");
    super.doAction(ac, data);
  }

  async onAction(ac: runtime.FormActionButton) {
    await super.onAction(ac);
  }

  async goto(ac: runtime.FormActionButton, res: any) {
    this.judgeIfNeedReload(ac);
    let url = this.$route.query.return as string;
    const params: any = this.$route.query;

    const reload = () => {
      const workitem = res.data.workItem;
      if (workitem) {
        this.goWfForm(workitem.id, workitem.instanceId);
      } else if (params.workitemId && params.workflowInstanceId) {
        this.goWfForm(params.workitemId, params.workflowInstanceId);
      }
    };

    switch (ac.code) {
      case runtime.FormAction.Save:
      case runtime.FormAction.Assist:
      case runtime.FormAction.Circulate:
      case runtime.FormAction.AdjustParticipant:
        reload();
        break;

      case runtime.FormAction.Retrieve:
        const workflowInstanceId = this.$route.query.workflowInstanceId as string;
        this.goWfForm(res.data.id as string, workflowInstanceId, true);
        break;

      case runtime.FormAction.Submit:
        this.goDetailPage(res.data);
        break;

      default:
        this.goSuccessPage(res.data);
        break;
    }
  }

  goWfForm(workitemId: string, workflowInstanceId: string, reload?: boolean) {
    const params = {
      name: 'mockForm',
      params: {
        appCode: this.$route.params.appCode,
        bizSchemaCode: this.$route.params.bizSchemaCode,
        workflowCode: this.$route.params.workflowCode
      },
      query: {
        workitemId,
        workflowInstanceId,
        workflowMock: 'true',
        hideBtn: 'true',
        t: new Date().getSeconds().toString() || ''
      }
    };

    if (reload) {
      const { href } = this.$router.resolve(params);
      window.location.href = href;
    } else {
      this.workflowInstanceId = '';
      setTimeout(() => {
        this.$router.push(params).catch((err: any) => {err});
      }, 0);
    }
  }

  goEmptyPage() {
    this.$router.push({
      name: "shared-empty"
    }).catch((err: any) => {err});
  }

  goUnpublished() {
    this.$router.push({
      name: "formUnpublished"
    }).catch((err: any) => {err});
  }

  goPermission() {
    this.$router.push({
      name: "permission"
    }).catch((err: any) => {err});
  }

  goSuccessPage(backData?: any) {
    this.$message.success('已操作完成', 2, () => window.close());
  }

  goDetailPage(backData?: any) {
    this.$message.success('已操作完成', 2, () => {
      this.$router.push({
        name: 'mockDetail',
        params: {
          appCode: this.$route.params.appCode,
          bizSchemaCode: this.$route.params.bizSchemaCode,
          workflowCode: this.$route.params.workflowCode
        },
        query: {
          workflowInstanceId: backData.workflowInstanceId,
          workflowMock: 'true',
        }
      }).catch((err: any) => {err});
    });
  }

  setFinishTime(time: any) {
    if (time) {
      this.finishTime = time;
    }
  }

  async getFirstUnfinish() {
    const res = await workflowApi.searchWorkitems({
      wd: "",
      page: 0,
      size: 1
    });

    if (res.errcode === 0 && res.data.totalElements > 0) {
      return res.data.content[0];
    }

    return null;
  }

  onDownload(file: any) {
    if (!file || !file.refId) {
      return;
    }

    const url = renderer.UploadControl.service.getDownloadUrl(file);
    window.open(url);
  }

  getDownloadUrl(file: renderer.H3File) {
    return renderer.UploadControl.service.getDownloadUrl(file);
  }

  /**
   * 根据操作按钮类型，判断是否需要发出列表重载信号
   * @param ac 操作按钮对象
   */
  judgeIfNeedReload(ac: runtime.FormActionButton) {
    let ifNeedReload: boolean = false;
    switch (ac.code) {
      case runtime.FormAction.Submit:
      case runtime.FormAction.Delete:
      case runtime.FormAction.Agree:
      case runtime.FormAction.DisAgree:
      case runtime.FormAction.Cancel:
      case runtime.FormAction.Forward:
      case runtime.FormAction.FinishInstance:
      case runtime.FormAction.Reject:
      case runtime.FormAction.Retrieve:
        ifNeedReload = true;
        break;

      default:
        break;
    }

    if (!ifNeedReload) {
      return;
    }
    // 定义页签关闭前发出重载信号
    const url: any = this.$route.query.return;
    const opener = window.opener;
    window.onbeforeunload = () => {
      opener.postMessage(url, opener.location.href);
    };
  }
}
</script>

<style lang="less" scoped>
.form-detail {
  min-width: 1100px;
}
.textarea {
  display: flex;
  align-items: center;
}

.form-box {
  display: flex;
}

.form-body {
  display: flex;
  flex-grow: 1;
  height: calc(100% - 64px);
  position: relative;
  min-width: 924px;
  transition: all ease .5s;
}

.retract {
  position: absolute;
  right: 0;
  top: 3px;
  transition: all ease .1s;;
  cursor: pointer;
  & > img {
    opacity: .6;
    &:hover {
      opacity: 1;
    }
  }
}

@media print {
  .form-body {
    display: block;
    overflow: unset !important;
  }
}
.report .vue-grid-layout {
  height: auto !important;
}
.form-wrap {
  position: relative;
  overflow: auto;
  flex-grow: 1;
  padding: 20px 0 100px 0;
  & > div.form-d-box {
    width: 924px;
    margin: 0 auto;
  }
}

.back-top {
  cursor: pointer;
  position: fixed;
  display: inline-flex;
  right: 40px;
  bottom: 40px;
  width: 40px;
  height: 40px;
  background: @light-color-3;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  font-size: @font-size-18;
  justify-content: center;
  align-items: center;
}

/deep/.ant-alert.alert-info {
  position: absolute;
  top: 74px;
  left: calc(50% - 308px);
  width: 616px;
  min-height: 40px;
  background-color: #f0f7ff;
  color: rgba(0, 0, 0, 0.65);
  border-radius: 4px;
  border: 1px solid rgba(41, 112, 255, 0.5);

  & > i {
    top: 12px;
  }
}

/deep/.ant-alert-message {
  word-break: break-all;
  display: block;
  margin-right: 1em;
}

/deep/.ant-alert.alert-warning {
  position: absolute;
  top: 74px;
  left: calc(50% - 308px);
  width: 616px;
  height: 40px;
  border-radius: 4px;
}

/deep/.field__label {
  min-width: 102px;
  max-width: 102px;
  width: 102px;
}

/deep/.ant-row-flex {
  .field.system .field__control {
    padding-left: 5px;
  }

  .field.system {
    padding-left: 0;
    padding-right: 0;
    .field__label {
      flex-grow: 1;
      // max-width: none;
      margin-right: 0;
      margin-left: 8px;
    }
  }

  & > .ant-col:first-child > .field.system {
    .field__label {
      min-width: 1em;
      width: auto;
      margin-right: 0;
      justify-content: flex-start;
      flex-grow: 0 !important;
    }
  }
}
</style>
