<template>
  <div id="portal-form-list-container" class="app-menu">
    <div id="ApplicationList" class="application-box" ref="application">
      <!-- style="height: 0px" -->
      <!-- <printHtml style="height: 0px"  :options="opts" /> -->
      <!-- v-if="showTitle" -->
      <div class="content-top" ref="contentTop">
        <h2>
          <!-- 左侧logo -->
          <slot name="left"></slot>
          <!-- 1 -->
          <!-- <span v-if="isSPA">{{ $route.params.displayName }}</span> -->
          <div
            class="list-header"
            @click="showQueryHeaderList = !showQueryHeaderList"
          >
            <div :title="isChinese ? curTitle : curTitleNameI18n[$i18n.locale]">
              {{ isChinese ? curTitle : curTitleNameI18n[$i18n.locale] }}
            </div>
            <i
              v-show="!showQueryHeaderList && showIcon"
              class="icon aufontAll h-icon-all-down-o"
            ></i>
            <i
              v-show="showQueryHeaderList && showIcon"
              class="icon aufontAll h-icon-all-up-o"
            ></i>
          </div>

          <div class="query-header-list" v-if="showQueryHeaderList && showIcon">
            <div
              class="list-item"
              :class="{ selected: curListCode === list.code }"
              v-for="(list, index) in queryHeaderList"
              :key="index"
              @click="changeListView(list)"
            >
              <i class="icon aufontAll h-icon-all-layout-o"></i>
              <div class="item-name">
                {{ isChinese ? list.name : list.name_i18n[$i18n.locale] }}
              </div>
              <i
                class="checked icon aufontAll h-icon-all-check"
                v-show="curListCode === list.code"
              ></i>
            </div>

            <!-- 下拉框遮罩 -->
            <div class="filter-mask" @click="showQueryHeaderList = false"></div>
          </div>
        </h2>

        <!-- 操作 -->
        <div class="actions-box">
          <!-- 设置展示项 -->
          <div class="settings">
            <!-- <div
              class="settings-item"
              v-if="queryConditions && queryConditions.length > 0"
            > -->
            <div
              class="settings-item"
              v-if="queryConditions && visibleQueryConditions.length > 0"
            >
              <filterCard
                @clear="clear"
                v-if="queryConditionSource.length === 1"
                :source="queryConditionSource"
              />
              <filterCard
                @item-click="toggleQueryConditions"
                @clear="clear"
                v-else-if="queryConditionSource.length > 1"
                :source="queryConditionSource"
              />
              <a-tooltip v-if="queryConditionSource.length <= 1">
                <template slot="title">
                  {{ $t("cloudpivot.list.pc.Screen") }}
                </template>
                <i
                  class="icon aufontAll h-icon-all-filter-o"
                  :class="{ 'high-light': isShowFilterBox }"
                  @click="toggleQueryConditions"
                ></i>
              </a-tooltip>
            </div>
            <div class="settings-item">
              <a-tooltip>
                <template slot="title">
                  {{ $t("cloudpivot.list.pc.SetDisplayItems") }}
                </template>
                <i
                  class="icon aufontAll h-icon-all-setting-o"
                  @click="columnSetting"
                ></i>
              </a-tooltip>
            </div>

            <div class="settings-item" v-if="formTrackPermission">
              <a-tooltip>
                <template slot="title">
                  {{ $t("cloudpivot.list.pc.FormTrack") }}
                </template>
                <a-icon
                  class="form-track"
                  type="history"
                  @click="showFormTrack"
                />
              </a-tooltip>
            </div>
          </div>
          <!-- 其他操作按钮:新增/删除/... -->
          <div id="list-actions" ref="actions">
            <template v-for="(ac, index) in queryActions">
              <template v-if="ac.actionCode !== 'batch_print'">
                <template
                  v-if="ac.associationType === 1 && ac.actionCode === 'import'"
                >
                  <a-tooltip :key="index">
                    <template slot="title">
                      <span>{{
                        $t("cloudpivot.list.pc.importWorkflowTips")
                      }}</span>
                    </template>
                    <a-button
                      v-show="
                        ac.actionCode !== 'edit' &&
                          ac.actionCode !== 'form_track' &&
                          ac.actionCode !== 'FORM_TRACK'
                      "
                      style="margin-right: 8px"
                      :disabled="true"
                    >
                      {{ isChinese ? ac.name : ac.name_i18n[$i18n.locale] }}
                    </a-button>
                  </a-tooltip>
                </template>
                <template v-else>
                  <a-button
                    v-show="
                      ac.actionCode !== 'edit' &&
                        ac.actionCode !== 'form_track' &&
                        ac.actionCode !== 'FORM_TRACK'
                    "
                    :class="
                      (ac.attributes && ac.attributes.class) ||
                        `list-action-${ac.actionCode}`
                    "
                    :id="ac.attributes && ac.attributes.id"
                    :type="index === 0 ? 'primary' : 'default'"
                    :key="index"
                    :disabled="
                      (!deleteDisabled && ac.actionCode === 'delete') ||
                        (exportDisabled && ac.actionCode === 'export') ||
                        (exportDisabled && ac.actionCode === 'qr_code') ||
                        (!deleteDisabled && ac.actionCode === 'editowner') ||
                        (ac.actionCode === 'batch_update' &&
                          (isCheckedWorkFlow || !deleteDisabled)) ||
                        (ac.associationType === 1 && ac.actionCode === 'import')
                    "
                    @click="e => actionClick(ac, e)"
                  >
                    {{ isChinese ? ac.name : ac.name_i18n[$i18n.locale] }}
                  </a-button>
                </template>
              </template>
              <span v-else :key="index" ref="printBatchShow">
                <a-button
                  :class="
                    (ac.attributes && ac.attributes.class) ||
                      `list-action-${ac.actionCode}`
                  "
                  :id="ac.attributes && ac.attributes.id"
                  :type="'default'"
                  :disabled="exportDisabled && ac.actionCode === 'batch_print'"
                  :key="index"
                  @click="e => actionClick(ac, e)"
                  >{{
                    isChinese ? ac.name : ac.name_i18n[$i18n.locale]
                  }}</a-button
                >
                <div
                  class="prints-drop-down animated fadeIn"
                  v-show="toShowPrints"
                  :style="printBtnListStyle"
                >
                  <template v-for="(i, v) in printTempList">
                    <a-tooltip placement="left" :key="v">
                      <template slot="title">
                        <span>{{ i.printTemplateName }}</span>
                      </template>
                      <div
                        class="item-print"
                        @click="handleBatchPrintHide(i.printTemplateCode)"
                      >
                        {{ i.printTemplateName }}
                      </div>
                    </a-tooltip>
                  </template>
                </div>
              </span>
            </template>
            <!-- <a-button type="primary" @click="printQrCode">打印二维码</a-button> -->
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <PageLoading v-model="isLoading" shadeColor="#F4F6FC" :shadeOpacity="1" />
      <!-- 列表数据 -->
      <div class="table-box" v-if="isShowTableBox">
        <div class="filters-box" v-show="isShowFilterBox" ref="filtersBox">
          <query-form
            ref="queryForm"
            :fields="queryConditions"
            :relevanceDataList="relevanceDataList"
            :dataItemList="dataItemList"
            @getRelevanceDataList="getRelevanceDataList"
            @setFilterData="setFilterData"
            @hide="hideQueryItem"
          />
        </div>

        <div class="table" ref="table">
          <!-- 加载状态 -->
          <PageLoading
            v-model="tableLoading"
            shadeColor="#F4F6FC"
            :shadeOpacity="0.5"
          />
          <!-- 旧版表单 -->
          <sheet
            v-if="tableConfig.keepInOldVersion || tableConfig.version === '1.0'"
            v-show="cusColumns.length > 0"
            :checkbox="canDelete"
            :checkeds="checkeds"
            :columns="cusColumns"
            :rows="rows"
            :columnSlots="columnSlots"
            :rowSlots="rowSlots"
            @check="onCheck"
            @columnResize="onResizeEnd"
          >
            <!-- checkbox -->
            <span slot="checkboxTitle" v-if="canDelete">
              <a-checkbox
                @change.stop="selectAll"
                v-model="isSelectAll"
              ></a-checkbox>
            </span>
            <!-- 序号 -->
            <span class="order-number-box" slot="indexTitle">
              <span>{{ $t("cloudpivot.list.pc.Number") }}</span>
            </span>

            <span slot="checkbox" v-if="canDelete" slot-scope="{ text, row }">
              <a-checkbox
                v-model="row.isChecked"
                @change.stop="onItemCheckboxChange"
              ></a-checkbox>
            </span>
            <span class="order-number-box" slot="index" slot-scope="{ row }">
              <span>{{ JSON.stringify(row) }}</span>
            </span>

            <!-- 自定义的列 头 -->
            <template v-for="(item, index) in cusColumns">
              <span
                :key="index"
                :slot="columnSlots[item.key]"
                :title="item.vcTitle"
                class="text-ellipsis"
                v-show="item.isShow"
                >{{
                  isChinese ? item.vcTitle : item.name_i18n[$i18n.locale]
                }}</span
              >
            </template>

            <!-- 自定义的列 表体 :title="text" -->
            <template
              v-for="(item, index) in cusColumns"
              :slot="rowSlots[item.key]"
              slot-scope="{ column, rowIndex }"
            >
              <span
                :key="index"
                class="cursor text-ellipsis"
                v-show="item.isShow"
                @click="goForm(column, rowIndex)"
                >{{ getLabelContent(column, rowIndex) }}</span
              >
            </template>
          </sheet>
          <!-- 新版表单 -->
          <!-- <list-custom-template
            v-else
            ref="listCustomTemplate"
            v-show="cusColumns.length > 0"
            :pageVM="pageVM"
            :sortConfig="listConfig ? (listConfig.querySorts ? listConfig.querySorts : []) : []"
            :tableConfig="tableConfig"
            :originalTableColumns="cusColumns"
            :originalTableData="dataSource"
            :originalNumberData="numberData"
            @bySortGetQueryList="bySortGetQueryList"
            @onCheck="onCheck"
            @onResizeEnd="onResizeEnd"
          >
          </list-custom-template> -->
          <table class="my-table">
            <tr>
              <th colspan="3">第一季度</th>
              <th colspan="3">第二季度</th>
              <th colspan="3">第三季度</th>
              <th colspan="3">第四季度</th>
            </tr>
            <tr>
              <th>一月</th>
              <th>二月</th>
              <th>三月</th>
              <th>四月</th>
              <th>五月</th>
              <th>六月</th>
              <th>七月</th>
              <th>八月</th>
              <th>九月</th>
              <th>十月</th>
              <th>十一月</th>
              <th>十二月</th>
            </tr>
            <tr>
              <td>1</td>
              <td>2</td>
              <td>3</td>
              <td colspan="2">4</td>
              <td>6</td>
              <td rowspan="2">7</td>
              <td>8</td>
              <td>9</td>
              <td>10</td>
              <td>11</td>
              <td>12</td>
            </tr>
            <tr>
              <td>1</td>
              <td>2</td>
              <td>3</td>
              <td>5</td>
              <td>6</td>
              <td>7</td>
              <td>8</td>
              <td>9</td>
              <td>10</td>
              <td>11</td>
              <td>12</td>
            </tr>
          </table>

          这里可以放任意其他内容，列表数据可以从接口获取

          <!-- 所有列取消勾选  -->
          <div
            class="no-columns"
            v-if="
              cusColumns.length <= 0 && !isShowNoData && !isShowSearchNoData
            "
          >
            <!-- <img src="./components/no-data/images/no-data.png" alt="" /> -->
            <p>{{ $t("cloudpivot.list.pc.chooseColumns") }}</p>
          </div>

          <div class="no-data" v-if="isShowNoData || isShowSearchNoData">
            <PageNoData
              :isShowNoData="isShowNoData"
              :isShowSearchNoData="isShowSearchNoData"
              :tipText="$t('cloudpivot.list.pc.NoData')"
            />
          </div>
        </div>

        <div
          class="pagination-box"
          ref="paginationBox"
          v-if="cusColumns.length > 0"
        >
          <a-pagination
            :current="curPage"
            :total="total"
            :showTotal="total => $t('cloudpivot.list.pc.Total', { num: total })"
            :pageSize="pageSize"
            :pageSizeOptions="pageSizeOptions"
            showSizeChanger
            showQuickJumper
            @change="onPaginationChange"
            @showSizeChange="onSizeChange"
          />
        </div>
      </div>

      <div class="load-fail-box">
        <PageLoadFail v-model="isShowLoadFailBox" @refresh="reload" />
      </div>
    </div>

    <model-table-import
      v-if="visible"
      :schemaCode="schemaCode"
      :queryCode="curListCode"
      :statusParams="{
        errorMsg,
        successNum,
        failNum,
        importSize,
        importStatus,
        importFileName,
        showImportErrModal
      }"
      :showImportStatus="showImportStatus"
      @change="changeImportBtnStatus"
      @setFileName="setImportFileName"
      @setQueryField="setImportQueryField"
      @reset="reset"
      @ok="handleCancel"
      @importEnd="importEnd"
      @close="handleCancel"
      @setData="confirm"
    ></model-table-import>

    <!--    <a-modal-->
    <!--      class="import-modal"-->
    <!--      v-model="visible"-->
    <!--      :title="$t('cloudpivot.list.pc.ImportData')"-->
    <!--      @cancel="handleCancel"-->
    <!--      :width="552"-->
    <!--      :destroyOnClose="true"-->
    <!--      :footer="null"-->
    <!--      :mask="true"-->
    <!--      :maskClosable="false"-->
    <!--      :keyboard="false"-->
    <!--    >-->
    <!--      <data-upload-->
    <!--        v-if="showUploadModel"-->
    <!--        @change="changeImportBtnStatus"-->
    <!--        @setFileName="setImportFileName"-->
    <!--        @setQueryField="setImportQueryField"-->
    <!--        :schemaCode="schemaCode"-->
    <!--        :queryCode="curListCode"-->
    <!--      ></data-upload>-->

    <!--      <data-import-->
    <!--        v-if="showImportModel"-->
    <!--        :percent="importPercent"-->
    <!--        @importEnd="importEnd"-->
    <!--      ></data-import>-->
    <!--      <data-import-status-->
    <!--        v-if="showImportStatus"-->
    <!--        :successNum="successNum"-->
    <!--        :failNum="failNum"-->
    <!--        :importSize="importSize"-->
    <!--        :status="importStatus"-->
    <!--        :fileName="importFileName"-->
    <!--        :schemaCode="schemaCode"-->
    <!--        :queryCode="curListCode"-->
    <!--      ></data-import-status>-->
    <!--      <div class="modal-footer">-->
    <!--        <a-button v-if="showCancelButton" key="back" @click="handleCancel">{{-->
    <!--          $t("cloudpivot.list.pc.Cancel")-->
    <!--        }}</a-button>-->
    <!--        <a-button-->
    <!--          v-if="showUploadModel"-->
    <!--          key="import"-->
    <!--          type="primary"-->
    <!--          :disabled="!canImport"-->
    <!--          @click="confirmImport"-->
    <!--          >{{ $t("cloudpivot.list.pc.StartImport") }}</a-button-->
    <!--        >-->
    <!--        <a-button-->
    <!--          v-if="showConfirmButton"-->
    <!--          key="confirm"-->
    <!--          type="primary"-->
    <!--          @click="confirm"-->
    <!--          >{{ $t("cloudpivot.list.pc.OK") }}</a-button-->
    <!--        >-->
    <!--        &lt;!&ndash; <a-button-->
    <!--          v-if="showReImportButton"-->
    <!--          key="reimport"-->
    <!--          type="primary"-->
    <!--          @click="reImport"-->
    <!--        >{{ $t('cloudpivot.list.pc.ReImport') }}</a-button> &ndash;&gt;-->
    <!--      </div>-->
    <!--    </a-modal>-->
    <!-- 导入选人值报错时，导入错误信息弹窗 -->
    <!-- <button @click="showImportErrModal = true" style="position: absolute;top: 90px;left: 420px;z-index: 9898;">打开</button> -->
    <!-- 历史留痕弹窗 -->
    <form-marking ref="FormMarking" :dataItemList="dataSource"></form-marking>

    <ImportErrModal
      v-model="showImportErrModal"
      :status="secondImportStatus"
      :successNum="secondSuccessNum"
      :failNum="secondFailNum"
      :fileName="importFileName"
      :importData="importData"
      @reloadList="getQueryList"
    ></ImportErrModal>

    <DataExport
      v-model="showDataExport"
      :queryColumns="queryColumns"
      :extend1="extend1"
      :exportFileId="exportFileId"
      @exportEnd="handleExportData"
    ></DataExport>
    <!-- 打印二维码弹窗 -->
    <PrintQrcode
      v-model="showPrintQrcode"
      :checkedLength="checkedLength"
      @createPrintQrCodeData="createPrintQrCodeData"
    ></PrintQrcode>

    <!-- 修改表单拥有者弹框 -->
    <ModifyOwner
      :checkeds="checkeds"
      :dataSource="dataSource"
      :pageSize="pageSize"
      :curPage="curPage"
      :schemaCode="schemaCode"
      :queryCode="curListCode"
      ref="ModifyOwner"
      @modifyOwnerClick="onModifyOwnerClick"
    ></ModifyOwner>
    <!-- 删除弹窗 -->

    <columnSetting
      v-model="showColumnSetting"
      :columns="columns"
      @confirm="reRenderTable"
      @recovery="recovery"
    />
    <div
      class="pdf-frame-div"
      v-if="pdfUrl.includes('?file=') && isShowPdf"
    ></div>
    <iframe class="pdf-frame" id="pdfFrame" :srcdoc="srcdoc"></iframe>
    <a-icon
      v-if="isShowPdf"
      @click="closePdf"
      type="close"
      class="close-previewPdf"
    />
    <!-- :options="opts" -->
    <printHtml style="height: 0px; overflow: hidden" :options="opts" />
    <template v-if="isPrintGenerateHtml">
      <GenerateHtml
        ref="printRenderer"
        :pages="draftAttributesJsonSet"
        :formdata="formdata"
      ></GenerateHtml>
    </template>
    <template v-for="(i, n) of tempPrintEleArray">
      <template v-for="(tempPrintEle, v) in i">
        <TempPrintHtml
          :key="v + n + tempPrintEle.key"
          :printEle="tempPrintEle.tempPrintEle"
          :pageSettings="tempPrintPageSettings"
          @calcResult="collectorTempPrintInfo"
        ></TempPrintHtml>
      </template>
    </template>

    <batch-update
      @updateOver="updateOver"
      @visibleChange="updateVisibleChange"
      :oldParams="oldParams"
      :updateOptions="updateOptions"
    />

    <div class="iframe-shadow" v-if="showIframeForm"></div>
    <transition name="fade-down">
      <div v-if="showIframeForm" class="iframe-form-warp">
        <div class="icon-close" @click="showIframeForm = false">
          <!-- <span><a-icon type="close" /></span> -->
          <span class="icon aufontAll">&#xe996;</span>
        </div>
        <iframe
          ref="iframe"
          class="iframe-form-warp--page"
          :src="IframeFormUrl"
        ></iframe>
      </div>
    </transition>
  </div>
</template>
<script src="./application-list.ts" />
<style lang="less">
.application-box {
  .content-top {
    & > h2 {
      position: relative;
    }
  }
  .list-header {
    cursor: pointer;
    & > div {
      display: inline-block;
      max-width: 144px;
      overflow: hidden;
      white-space: nowrap;
      vertical-align: middle;
      text-overflow: ellipsis;
    }
    i {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.65);
      margin-left: 8px;
    }
  }
  .query-header-list {
    position: absolute;
    top: 30px;
    left: 0;
    width: 480px;
    max-height: 520px;
    overflow-y: auto;
    background: #fff;
    box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.15);
    border-radius: 4px;
    z-index: 30;
    .list-item {
      height: 32px;
      line-height: 32px;
      padding: 0 16px;
      cursor: pointer;
      position: relative;
      z-index: 9;
      &:hover {
        background: #f0f7ff;
      }
      &.selected {
        background: #f8fbff;
      }
      i {
        color: #1890ff;
        font-size: 18px;
        float: left;
      }
      .item-name {
        font-size: 14px;
        width: 292px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-left: 8px;
        float: left;
      }
      .checked {
        float: right;
      }
    }
  }
  .sheet {
    .sheet__body > .sheet__row {
      position: relative;
      &.marked::after {
        content: "";
        display: block;
        width: 4px;
        height: calc(100% - 1px);
        position: absolute;
        left: 0;
        top: 0;
        background: #faad14;
      }
    }
  }
  /*ie11 css hack*/
  @media all and (-ms-high-contrast: none) {
    .sheet {
      .sheet__row.sheet__head {
        padding-right: 17px;
      }
    }
  }
}
</style>
<style lang="less" scoped>
.my-table {
  width: 100%;
  border-left: 1px solid #aaa;
  border-top: 1px solid #aaa;
  th,
  td {
    border-right: 1px solid #aaa;
    border-bottom: 1px solid #aaa;
    text-align: center;
    padding: 0 5px;
  }
  th {
    background-color: #efefef;
    line-height: 32px;
  }
}

@import "./index.less";
@media screen and (max-width: 1366px) {
  .application-box .table-box .no-data {
    margin-top: 50px;
  }
}
.modal-footer {
  height: 53px;
  line-height: 53px;
  text-align: right;
  margin-bottom: -24px;
  & button + button {
    margin-left: 8px;
    margin-bottom: 0;
  }
}
.actions-box {
  display: flex;
  align-items: center;
  justify-content: space-around;
  .settings {
    display: flex;
    align-items: center;
    .settings-item {
      margin-right: 16px;
      cursor: pointer;
      .form-track {
        font-size: 16px;
        transform: rotateY(180deg);
        rgba(0, 0, 0, 0.65) &:hover {
          color: @primary-color;
        }
      }

      .icon:hover {
        color: @primary-color;
      }
      .high-light {
        color: @primary-color;
      }
    }
  }
  #list-actions {
    button {
      margin-right: 8px;
      // &:last-of-type {
      //   margin-right: 0;
      // }
    }
  }
}
.table-box {
  position: relative;
  min-height: 400px;
  .filters-box {
    position: absolute;
    width: 100%;
    z-index: 666;
    margin-top: -8px;
  }
  .table {
    /deep/.sheet__body::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0);
      box-shadow: unset;
      transition: all ease 0.3s;
    }
    & /deep/.scrollbar .sheet__cols {
      opacity: 0;
    }

    &.active {
      /deep/.sheet__body::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.45);
        box-shadow: auto;
      }
      & /deep/.scrollbar .sheet__cols {
        opacity: 1;
      }
    }

    /deep/.sheet .sheet__body .sheet__row {
      transition: all ease 0.3s;
      &:hover {
        background: #f0f7ff;
      }
    }

    .common-table.active .common-table__tbody-wrap::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.45);
      box-shadow: auto;
    }
    height: 100%;
    max-height: calc(100% - 50px);
    // position: relative;
    // overflow-y: hidden;
    /deep/.ant-table-wrapper {
      height: 100%;
    }
    /deep/.ant-table-body {
      max-height: calc(100vh - 95px - 52px - 160px) !important;
    }
    &.has-filterbox {
      /deep/.ant-table-body {
        max-height: calc(100vh - 155px - 52px - 160px) !important;
      }
    }

    .order-number-box {
      .index {
        margin-left: @base4-padding-lg;
      }
    }
    .name {
      cursor: pointer;
    }
    .cursor {
      cursor: pointer;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover {
        color: @primary-color;
      }
    }
    .no-columns {
      text-align: center;
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  /*ie11 css hack*/
  @media all and (-ms-high-contrast: none) {
    *::-ms-backdrop,
    .table {
      max-height: calc(100% - 68px);
    }
  }
}

.load-fail-box {
  padding-top: 100px;
  text-align: center;
}

/deep/.ant-pagination-total-text {
  margin-right: @base4-padding-md;
}
.pagination-box {
  margin-top: 0 !important;
}
/deep/.ant-pagination-options {
  height: 32px;
}
.delete-title {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
}
.delete-content {
  margin-left: -38px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  padding: 12px;
  border-radius: 4px;
  margin-top: 12px;
  div {
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    line-height: 22px;
    .tip-text {
      color: rgba(0, 0, 0, 0.65);
      font-size: 12px;
    }
    span {
      font-weight: 600;
    }
    img {
      width: 5px;
      height: 5px;
      margin-right: 5px;
      margin-top: -2px;
      vertical-align: middle;
    }
  }
  .hidden {
    display: none;
  }
}
.filter-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0);
  z-index: 1;
}
.prints-drop-down {
  width: 150px;
  min-height: 40px;
  max-height: 350px;
  overflow-y: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(30, 85, 255, 0.15);
  background: #fff;
  position: absolute;
  top: 35px;
  z-index: 999;
  .item-print {
    text-align: left;
    height: 32px;
    line-height: 32px;
    padding: 0px 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover {
      cursor: pointer;
      background: rgba(240, 247, 255, 1);
      transition: 0.3s all;
    }
    &:last-of-type {
      margin-bottom: 10px;
    }
    &:first-of-type {
      margin-top: 5px;
    }
  }
}
.list-action-FORM_TRACK,
.list-action-form_track {
  margin-left: 8px;
}

.iframe-form-warp {
  position: fixed;
  top: 48px;
  bottom: 48px;
  left: 83px;
  right: 83px;
  margin: auto;
  min-width: 1024px;
  max-width: 1200px;
  background: #fff;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  &--page {
    width: 100%;
    height: 100%;
    overflow: auto;
    border: none;
  }
}
.iframe-shadow {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 999;
}

.fade-down-enter-active {
  transition: all 0.3s ease;
}
.fade-down-leave-active {
  transition: all 0s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-down-enter, .fade-down-leave-to
  /* .slide-fade-leave-active 用于 2.1.8 以下版本 */ {
  transform: translateY(-30px);
  opacity: 0;
}

.icon-close {
  position: absolute;
  right: 24px;
  top: 20px;
}

.icon-close:hover {
  cursor: pointer;
}
</style>
