<template>
  <div class="form-detail">
    <!-- <form-detail-header v-if="!isNew && !isDraft" :formObj="formObj" :nodes="nodes" @nodesSwitch="nodesSwitch">
      <form-actions
        :actions="actions"
        @action="onAction"
        :toShowPrints="isShow"
        :setPdfConf="pdfAble"
        @propPrintClick="getChildPrintClick"
      ></form-actions>
    </form-detail-header> -->

    <form-detail-header-open-in-list
      :formObj="formObj"
      @action="onAction"
      :nodes="nodes"
      @nodesSwitch="nodesSwitch"
    >
      <template slot="h4">
        <template v-if="isWorkflowForm">
          <h4 v-if="isNew">
            {{ $t("languages.common.formTitle.createWorkflow")
            }}{{ formObj.workflowName ? "-" + formObj.workflowName : "" }}
          </h4>
          <h4 v-else-if="isDraft">
            {{ $t("languages.common.formTitle.editWorkflow")
            }}{{ formObj.workflowName ? "-" + formObj.workflowName : "" }}
          </h4>
          <h4 v-else>
            {{ $t("languages.common.formTitle.viewWorkflow")
            }}{{ formObj.workflowName ? "-" + formObj.workflowName : "" }}
          </h4>
        </template>
        <template v-else>
          <h4 v-if="isNew">
            {{ $t("languages.common.formTitle.createForm")
            }}{{
              formObj.bizSheet && formObj.bizSheet.name
                ? "-" + formObj.bizSheet.name
                : ""
            }}
          </h4>
          <h4 v-else-if="isDraft">
            {{ $t("languages.common.formTitle.editForm")
            }}{{
              formObj.bizSheet && formObj.bizSheet.name
                ? "-" + formObj.bizSheet.name
                : ""
            }}
          </h4>
          <h4 v-else>
            {{ $t("languages.common.formTitle.viewForm")
            }}{{
              formObj.bizSheet && formObj.bizSheet.name
                ? "-" + formObj.bizSheet.name
                : ""
            }}
          </h4>
        </template>
      </template>
      <!-- <form-actions
        :actions="actions"
        @action="onAction"
        :toShowPrints="isShow"
        :setPdfConf="pdfAble"
        @propPrintClick="getChildPrintClick"
      ></form-actions> -->
    </form-detail-header-open-in-list>

    <div class="form-body" @scroll="onBodyScroll" @click="isShow = false">
      <div class="form-wrap">
        <div class="form-d-box">
          <workflow-info
            v-if="workflowInstanceId"
            :id="workflowInstanceId"
            :itemId="formObj.workItemId"
            :curNode="formObj.activityCode"
            @setFinishTime="setFinishTime"
            @flowTrack="flowTrack"
          />
          <!--渲染控件-->
          <pc-form-renderer
            :class="{ 'has-form-border': borderMode }"
            ref="formRenderer"
            :controls="controls"
            :relevanceDataList="dataModalList"
            :formPermission="formObj.formPermission"
            :formControls="formControls"
            :dataItems="dataItems"
            sourceType="portal"
            @sheetColumnResize="onSheetColumnResize"
          />
          <a-collapse
            v-if="workflowInstanceId && !isExternal"
            class="workflow-collapse approval-record"
            activeKey="approvals"
            :bordered="false"
          >
            <a-collapse-panel
              class="bold-collapse-panel approval-record-header"
              :header="$t('languages.common.approval')"
              key="approvals"
            >
              <Approval
                :workflowInstanceId="workflowInstanceId"
                :completed="completed"
                :canceled="canceled"
                :finishTime="finishTime"
                :getFileUrlFn="getFileUrlFn"
                @download="onDownload"
              ></Approval>
            </a-collapse-panel>
          </a-collapse>

          <form-action-modal ref="actionModal" @ok="onOk"></form-action-modal>

          <!-- 历史留痕弹窗 -->
          <form-marking ref="FormMarking" :isDetail="true"></form-marking>

          <template v-if="isSsubmited && isLoadComment">
            <div class="retract" @click="toggleComment">
              <img
                v-if="isShowComment"
                src="../../assets/icons/shouqi.png"
                alt=""
              />
              <img v-else src="../../assets/icons/zhankai.png" alt="" />
            </div>
          </template>
        </div>
      </div>
      <div v-show="showBacktop" class="back-top" @click="backTop">
        <a-icon type="up"></a-icon>
      </div>

      <template v-if="isSsubmited && isLoadComment">
        <div v-show="isShowComment" class="comment-box">
          <pc-comment :collspanForPc="isShowComment" :formObj="formObj" />
        </div>
      </template>
    </div>

    <a-alert
      v-if="comment"
      :message="comment"
      type="info"
      banner
      closable
      class="alert-info"
    />

    <a-alert
      v-if="showAlertWarn"
      class="alert-warning"
      message="该表单未发布，请联系管理员处理"
      type="warning"
      showIcon
      closable
    />

    <!-- <div class="pdf-frame-div" v-if="pdfUrl.includes('?file=') && showPdf"></div>
    <iframe class="pdf-frame" :src="pdfUrl" v-if="pdfUrl.includes('?file=') && showPdf"></iframe>
    <a-icon v-if="showPdf" @click="showPdf = false" type="close" class="close-previewPdf" />-->

    <iframe class="pdf-frame" id="pdfFrame" :srcdoc="srcdoc"></iframe>
    <template v-if="isPrintGenerateHtml">
      <GenerateHtml
        ref="printRenderer"
        :pages="[draftAttributesJson]"
        :formdata="formdata"
      ></GenerateHtml>
    </template>
    <template v-for="tempPrintEle of tempPrintEleArray">
      <TempPrintHtml
        :key="tempPrintEle.key"
        :printEle="tempPrintEle.tempPrintEle"
        :pageSettings="tempPrintPageSettings"
        @calcResult="collectorTempPrintInfo"
      ></TempPrintHtml>
    </template>

    <form-detail-footer
      :formObj="formObj"
      :nodes="nodes"
      @nodesSwitch="nodesSwitch"
    >
      <template slot="isSaveData" v-if="isNew || isDraft">
        <a-checkbox
          :checked="isSaveAndCreate"
          @change="e => (isSaveAndCreate = e.target.checked)"
        >
          继续创建时，保留本次提交内容
        </a-checkbox>
      </template>
      <template slot="upAndCreate" v-if="isNew || isDraft">
        <a-button @click="submitAndCreate">提交并继续创建</a-button>
      </template>
      <form-actions
        :actions="actions"
        @action="onAction"
        :toShowPrints="isShow"
        :setPdfConf="pdfAble"
        @propPrintClick="getChildPrintClick"
      ></form-actions>
    </form-detail-footer>
  </div>
</template>

<script src="./form-detail.ts"></script>

<!--自定义弹出框背景样式-->
<style lang="less">
.ant-modal-mask {
  background: rgba(0, 0, 0, 0.3968);
}
.pdf-frame-div {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 233;
  background-color: #000;
  opacity: 0.6;
}
// .pdf-frame {
//   position: absolute;
//   left: 25%;
//   top: 0;
//   z-index: 2333;
//   width: 50%;
//   height: 100%;
// }
.pdf-frame {
  position: fixed;
  left: 250%;
  top: 0;
  z-index: 2333;
  width: 50%;
  height: 100%;
}
.close-previewPdf {
  width: 32px;
  position: relative;
  z-index: 2333;
  left: 75.5%;
  bottom: 96%;
  color: #606165;
  font-size: 32px;
  background: #ccc;
  border-radius: 50%;
  &:hover {
    color: #000;
    cursor: pointer;
    transition: all 0.3s;
  }
}
</style>
<style lang="less" scoped>
@import "../../styles/themes/default.less";
// @import "../../components/apps/form/style";
/deep/.ant-tabs {
  padding-left: 0.5em;
}
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

.comment-box {
  width: 330px;
  min-width: 330px;
  height: 100%;
  background: #f4f6fc;
  padding: 16px 0;
  box-sizing: border-box;
}

.form-body {
  display: flex;
  flex-grow: 1;
  height: calc(100% - 64px);
  position: relative;
  min-width: 924px;
  transition: all ease 0.5s;
}

.retract {
  position: absolute;
  right: 0;
  top: 3px;
  transition: all ease 0.1s;
  cursor: pointer;
  & > img {
    opacity: 0.6;
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
// /deep/.ant-tabs-content{
//   min-height: 500px;
// }
.form-wrap {
  position: relative;
  overflow: auto;
  flex-grow: 1;
  padding: 20px 0 100px 0;
  // background: #f0f0f0;
  & > div.form-d-box {
    max-width: 972px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .approval-record {
    background: #fff;
  }
  .approval-record-header {
    /deep/.ant-collapse-header {
      width: 100%;
      padding: 10px !important;
      color: rgba(0, 0, 0, 0.65);
      &:hover {
        background: #eef3ff;
      }
      .ant-collapse-arrow {
        left: 88px !important;
        color: rgba(0, 0, 0, 0.45);
        font-weight: normal;
      }
    }
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
  // overflow: hidden;
  // white-space: nowrap;
  // text-overflow: ellipsis;
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
  display: flex;
  align-items: center;
  width: 102px;
  min-width: 102px;
  max-width: 102px;
  &.top {
    padding-top: 7px;
  }
}

/deep/.h3-panel-body .ant-row-flex .field__label-div {
  width: 100%;
  flex: none;
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

  // & > .ant-col:last-child > .field.system {
  //   .field__label {
  //     flex-grow: 1;
  //     margin-right: 0;
  //     max-width: none;
  //   }

  //   .field__control {
  //     flex-grow: 0;
  //     flex-shrink: 0;
  //     justify-content: flex-end;
  //   }
  // }
}
</style>
