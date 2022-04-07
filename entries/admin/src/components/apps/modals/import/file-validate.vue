<template>
  <div class="file-validate">
    <!-- 文件校验通过 -->
    <div class="validate-box" v-if="validateStatus === 'ok'">
      <div class="file-status">
        <i class="icon aufontAll h-icon-all-check-circle file-status-icon"></i>
        <span class="file-status-txt">{{ $t('languages.Apps.DocumentChecked') }}</span>
      </div>
      <p style="margin-top:8px;color: #999;">模型编码无重复</p>

      <!-- <div class="file-content approved">
        <div class="model-info">
          <div class="model-item">
            <label>{{ $t('languages.Apps.BizSchemaCode') }}:</label>
            <span>{{ schemaCode }}</span>
          </div>
          <div class="model-item">
            <label>{{ $t('languages.Apps.BizSchemaName') }}:</label>
            <span>{{ schemaName }}</span>
          </div>
        </div>
      </div> -->
    </div>

    <!-- 文件校验通过但是编码重复 -->
    <div class="validate-box">

      <!-- 修改编码 -->
      <div v-show="isShowUpdateCode">
        <div class="file-status" v-if="(validateStatus === 'repeat'|| validateStatus === 'referCode') && ((codeList && schemaCode && repeated) || sheetList.length || (workflowsList.length && repeatWorkflowCodes))">
          <span class="file-status-txt">
            <a-icon type="exclamation-circle" />
            检测到<template v-if="codeList && schemaCode && repeated">模型</template>
            <template v-else-if="sheetList.length">子表</template>
            <template v-else-if="workflowsList.length && repeatWorkflowCodes">流程</template>编码重名,修改后导入将生成新的编码  
          </span>
        </div>

        <a-tabs :activeKey="tabKey" @tabClick="tabClick">
          <a-tab-pane key="1" v-if="codeList && schemaCode && repeated">
            <span slot="tab">
              模型<i style="color: red;">*</i>
            </span>

            <a-table :pagination="false" :columns="codeColumns" :data-source="codeList">
              <template slot="newCode" slot-scope="text, record">
                <div class="model-item">
                  <a-input
                    :class="isError ? 'error-input' : ''"
                    :placeholder="$t('languages.Apps.PlzFillInDataModelCode')"
                    v-model="record.newCode"
                    @change="setCode(record)"
                    maxlength="24"></a-input>
                  <p v-if="isError" class="error-txt">{{ validateErrorTxt }}</p>
                </div>
              </template>
            </a-table>
          </a-tab-pane>

          <a-tab-pane key="2" v-if="sheetList.length">
            <span slot="tab">
              子表<i style="color: red;">*</i>
            </span>
            <a-input
              placeholder="请输入子表名称"
              class="input-search"
              v-model="searchSubCodeText"
              @pressEnter="getSubCodeItem"
              style="width: 260px;margin-bottom: 8px;"
            >
              <a-icon
                class="suffix-icon close-icon"
                v-if="searchSubCodeText.length > 0 "
                slot="suffix"
                type="close-circle"
                @click="clearSubCodeText"
              />
              <a-icon
                class="suffix-icon"
                type="search"
                slot="suffix"
                @click="getSubCodeItem"
              />
            </a-input>
            <a-table :pagination="false" :columns="sheetColumns" :data-source="getSubCodeItem()">
              <template slot="newCode" slot-scope="text, record">
                <div class="model-item">
                  <a-input
                    :class="record.isError ? 'error-input' : ''"
                    :placeholder="$t('languages.Apps.PlzFillInSubsheetCode')"
                    v-model="record.newCode"
                    @change="setSheetCode(record)"
                    maxlength="24"></a-input>
                  <p v-if="record.isError" class="error-txt">{{ record.validateErrorTxt }}</p>
                  <!-- <p v-if="!record.isError" class="warn-txt">{{$t('languages.Apps.IsRepeatSubsheetCode')}}</p> -->
                </div>
              </template>
            </a-table>

            <!-- <div class="model-item" v-for="(sheet, index) in sheetList" :key="sheet.code + index">
              <label>
                <i class="icon aufontAll h-icon-all-exclamation-circle file-status-warn"></i>
                <span class="title" :title="sheet.name+'['+sheet.code+']'">{{ sheet.name }}[{{ sheet.code }}]</span>:
              </label>
              <a-input
                :class="sheet.isError ? 'error-input' : ''"
                :placeholder="$t('languages.Apps.PlzFillInSubsheetCode')"
                v-model="sheet.val"
                @change="setSheetCode(sheet)"
                maxlength="24"></a-input>
              <p v-if="sheet.isError" class="error-txt">{{ sheet.validateErrorTxt }}</p>
              <p v-if="!sheet.isError" class="warn-txt">{{$t('languages.Apps.IsRepeatSubsheetCode')}}</p>
            </div> -->
          </a-tab-pane>

          <a-tab-pane key="3" tab="表单" force-render v-if="bizFormsList.length">
            <a-input
              placeholder="请输入表单名称"
              class="input-search"
              v-model="searchFormModelText"
              @pressEnter="getFormModelItem"
              style="width: 260px;margin-bottom: 8px;"
            >
              <a-icon
                class="suffix-icon close-icon"
                v-if="searchFormModelText.length > 0 "
                slot="suffix"
                type="close-circle"
                @click="clearKeyword"
              />

              <a-icon
                class="suffix-icon"
                type="search"
                slot="suffix"
                @click="getFormModelItem"
              />
            </a-input>
            <a-table :pagination="false" :columns="bizFormsColumns" :data-source="getFormModelItem()">
              <template slot="newCode" slot-scope="text, record">
                <a-input type="text" v-model="record.newCode" placeholder="请输入" />
              </template>
            </a-table>
          </a-tab-pane>

          <a-tab-pane key="4" tab="流程" v-if="workflowsList.length">
            <a-table :pagination="false" :columns="workflowsColumns" :data-source="workflowsList">
              <template slot="newCode" slot-scope="text, record">
                <a-input type="text" v-model="record.newCode" placeholder="请输入" />
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>

    <!-- 文件校验不通过 -->
    <div class="validate-box" v-if="validateStatus === 'error'">
      <div class="file-status">
        <i class="icon aufontAll h-icon-all-close-circle file-status-icon error"></i>
        <span class="file-status-txt">{{ $t('languages.Apps.DocumentValidateFailNoImportSupport') }}</span>
      </div>

      <div class="file-content error">
        <div class="file-content-error">
          <!-- 是数据项类型错误 -->
          <ul v-if="isDataModelError">
            <li>1. {{ $t('languages.Apps.DataItemError', {errors: errorInfo}) }}</li>
          </ul>
          <ul v-else-if="isSubTableRepeat">
            <li>1. {{ $t('languages.Apps.SubTableCodeRepeat', {codes: errorInfo}) }}</li>
          </ul>
          <ul v-else>
            <li>1. {{ errorTxt }}</li>
          </ul>
        </div>
      </div>
    </div>

    
    <div class="validate-box" v-if="!isShowUpdateCode && validateStatus !== 'ok'" >
      <div class="file-status">
        <i class="icon aufontAll h-icon-all-check-circle file-status-icon"></i>
        <span class="file-status-txt">{{ $t('languages.Apps.DocumentChecked') }}</span>
      </div>

      <div class="err-validate">
        <div class="validate-top" v-if="referAndChildMap">
          <i class="icon aufontAll h-icon-all-close-circle validate-icon-error"></i>
          <span class="validate-title" style="padding-left:8px">系统检测到以下对象不存在，是否直接导入？</span>
        </div>
        <div class="validate-msg err" v-if="appPackageModel || referAndChildMap || subSchemaNames">
          <ul>
            <li v-for="(item,index) in warnInfoList" :key="index">
              {{ index+1 }}、{{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { Icon, Input } from "@h3/antd-vue";

import * as FileValidateNS from "@/typings/app-error";

@Component({
  name: "FileValidate",
  components: {
    AIcon: Icon,
    AInput: Input
  }
})
export default class FileValidate extends Vue {
  @Prop() isShowUpdateCode!: boolean;

  @Prop() validateStatus!: string;

  @Prop() schemaCode!: string;

  @Prop() schemaName!: string;

  @Prop() errorType!: number;

  @Prop() errorInfo!: string;

  @Prop() isShowValidateError!: boolean;

  @Prop() isDelete!: boolean;

  @Prop() subSchemaCodes!: any;

  @Prop() subSchemaNames!: any;

  @Prop() errorSheetList!: any;

  @Prop() referAndChildMap!: any;

  @Prop() isShowCodeTips!: boolean;

  @Prop() appFunctionModel!: any;

  @Prop() appPackageModel!: any;

  @Prop() bizImportValid!: any;

  @Prop() bizFormsList!: any; // 表单

  @Prop() workflowsList!: any; // 流程

  @Prop() repeatWorkflowCodes!: boolean; // 流程重复

  @Prop() isClickReturnAndSave !: number // 是否点击了保存并返回

  @Prop() repeated!: boolean;

  tabClick(val){
    this.tabKey = val
  }
  


  searchSubCodeText:string = ''
  getSubCodeItem(){
    return this.sheetList.filter(el => el.name.indexOf(this.searchSubCodeText) > -1)
  }

  clearSubCodeText(){
    this.searchSubCodeText = '';
    this.getSubCodeItem();
  }

  searchFormModelText: string = ''
  getFormModelItem(){
    return this.bizFormsList.filter(el => el.name.indexOf(this.searchFormModelText) > -1)
  }

  clearKeyword(){
    this.searchFormModelText = '';
    this.getFormModelItem();
  }

  
  @Watch('isClickReturnAndSave')
  isClickReturnAndSaveChange(){
    this.setCode(this.codeList[0])
    
    this.oldCode = this.codeList[0].newCode
    this.oldSheetList = JSON.parse(JSON.stringify(this.sheetList))


    const backData: any = {};
    this.sheetList.forEach((item: any) => {
      backData[item.code] = item.newCode;
    });
    this.$emit("setCode", backData);

    this.setKeys()
  }

  setKeys(){
    setTimeout(()=>{
      if(this.codeList && this.schemaCode && this.repeated){
        this.isError = true;
        this.validateErrorTxt = '编码有重名';
        this.tabKey = '1'
      } else if(this.sheetList.length){
        this.tabKey = '2'
      } else if(this.bizFormsList.length){
        this.tabKey = '3'
      }else{
        this.tabKey = '4'
      }
    },500)
  }


  tabKey: string = '1';



  code: string = "";
  oldCode: string = ''

  isError: boolean = false;

  validateErrorTxt: string = "";

  sheetItemDate: any = new Map();

  sheetColumns:any[] = [
    {
      title: '子表',
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: '原编码',
      key: 'code',
      dataIndex: 'code'
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    }
  ]

  codeColumns: any[] = [
    {
      title: '模型',
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: '原编码',
      key: 'code',
      dataIndex: 'code'
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    }
  ]

  bizFormsColumns:any[] = [
    {
      title: '表单',
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: '原编码',
      key: 'code',
      dataIndex: 'code'
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    }
  ]

  workflowsColumns:any[] = [
    {
      title: '流程',
      key: 'workflowName',
      dataIndex: 'workflowName'
    },
    {
      title: '原编码',
      key: 'workflowCode',
      dataIndex: 'workflowCode'
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    }
  ]

  codeList:any[] = []
  mounted() {
    this.code = this.schemaCode;
    this.isError = this.isShowValidateError;
    this.validateErrorTxt = this.errorInfo;
    this.codeList = [{
      code: this.code,
      name: this.schemaName,
      newCode: this.code,
      oldCode: this.code
    }]
    this.oldCode = this.code
  }

  resSetNewCode(){
    this.sheetList = JSON.parse(JSON.stringify(this.oldSheetList))
    this.codeList[0].newCode = this.oldCode
  }

  get isShowCodeRepeat() {
    // 与是否显示修改编码互斥
    return !this.isShowUpdateCode;
  }

  // 是否 当前应用
  get isPackageModel() {
    return this.$route.params.appCode === this.appPackageModel && this.appPackageModel.code || '';
  }

  get isDataModelError() {
    return (
      this.errorType === FileValidateNS.FileValidateTypes.DataItemTypeError
    );
  }

  get isSubTableRepeat() {
    return (
      this.errorType === FileValidateNS.FileValidateTypes.SubTableCodeRepeat
    );
  }

  get errorTxt() {
    switch (this.errorType) {
      case FileValidateNS.FileValidateTypes.FileFormateError:
        return this.$t("languages.Apps.FileFormateError");
      case FileValidateNS.FileValidateTypes.VersionError:
        return this.$t("languages.Apps.VersionError");
      case FileValidateNS.FileValidateTypes.SystemError:
        return this.$t("languages.Apps.SystemError");
      case FileValidateNS.FileValidateTypes.RepeatCode:
        return this.$t("languages.Apps.RepeatCode");
      case FileValidateNS.FileValidateTypes.SubTableCodeRepeat:
        return this.$t("languages.Apps.RepeatCode");
      case FileValidateNS.FileValidateTypes.RelativeModelNotImported:
        return this.$t("languages.Apps.RelativeModelNotImported");
      case FileValidateNS.FileValidateTypes.SubFlowNeedBeImportedFirst:
        return this.$t("languages.Apps.SubFlowNeedBeImportedFirst");
      case 10005:
        return this.validateErrorTxt;
      case 50000:
        return '服务异常';
      default:
        return null;
    }
  }

  get warnInfoList() {
    return this.getWarnInfoList();
  }

  getWarnInfoList() {
    const warnList: any = [];
    // 关联表单未关联模型和子流程不存在
    if (this.isShowCodeRepeat && this.referAndChildMap) {
      const codes: string[] = this.referAndChildMap.referCodes.split(',');
      let str = "";
      codes.map((code: string) => {
        str === "" ? str = `【${code}】` : str += "," + `【${code}】`;
      })
      if(str){
        warnList.push(`关联表单：${str}未关联业务模型；`);
      }
      if(this.referAndChildMap.childCodes){
        warnList.push(`子流程关联的业务模型：模型编码【${this.referAndChildMap.childCodes}】不存在；`);
      }
    }
    if (this.isShowCodeRepeat && this.isShowCodeTips && !this.referAndChildMap) {
      if (this.isPackageModel && this.appPackageModel) {
        warnList.push(`是否覆盖已存在的业务模型编码？模型位置:${this.isDelete ? '回收站-' : ''}${this.appPackageModel.name}${this.appFunctionModel ? '-' + this.appFunctionModel.name : ''}`);
      } else if(this.appPackageModel) {
        warnList.push(`当前业务模型编码已存在，模型位置:${this.isDelete ? '回收站-' : ''}${this.appPackageModel.name}${this.appFunctionModel ? '-' + this.appFunctionModel.name : ''}`);
      }
    }
    if (this.isShowCodeRepeat && this.subSchemaCodes && !this.referAndChildMap) {
      warnList.push(`${this.$t('languages.Apps.DocumentValidatedAndSheetcodeExistPlzModify')}`);
    }
    if (this.isShowCodeRepeat && this.referAndChildMap && this.referAndChildMap.childCodes && !this.isShowCodeTips && !this.isChildNodeOrReferCode) {
      warnList.push(`${this.$t('languages.Apps.DocumentValidatedAndUnexistSubprocessModel', { submodel: this.referAndChildMap.childCodes })}`);
    }
    if (this.isShowCodeRepeat && this.referAndChildMap && this.referAndChildMap.referCodes && !this.isShowCodeTips && !this.isChildNodeOrReferCode) {
      const codes: string[] = this.referAndChildMap.referCodes.split(',');
      let str = "";
      codes.map((code: string) => {
         str === "" ? str = `【${code}】` : str += "," + `【${code}】`;
      })
      warnList.push(`关联表单：${str}未关联业务模型；`);
    }
    if (this.bizImportValid && this.isShowCodeTips) {
      if (this.isPackageModel) {
        warnList.push(`${this.$t('languages.Apps.ImportWillReplaceDatamodelFormAndProcess')}`);
      }
      warnList.push(`${this.$t('languages.Apps.ImportWithModifiedCodeWillGenerateNewBizmodel')}`);
    }
    if (this.bizImportValid && this.bizImportValid.noExitCodes) {
      warnList.push(`业务规则中使用的编码为【${this.bizImportValid.noExitCodes}】的业务模型不存在；`)
    }
    if (this.bizImportValid && this.bizImportValid.messageReceiver) {
      warnList.push(`模型文件的业务规则中使用的组织机构与当前系统的组织机构不一致，模型导入后请重新配置业务规则中使用的组织机构；`)
    }
    if (this.bizImportValid && this.bizImportValid.noExitBizActionMethod) {
      warnList.push(`业务规则中使用的编码为【${this.bizImportValid.noExitBizActionMethod}】的业务服务不存在；`)
    }
    return Array.from(new Set(warnList));
  }
  get isChildNodeOrReferCode() {
    return (
      this.referAndChildMap &&
      this.referAndChildMap.childCodes &&
      this.referAndChildMap.referCodes &&
      !this.isShowCodeTips
    );
  }

  setCode(record) {
    
    const reg = /^[a-zA-Z][a-zA-Z0-9_]{0,23}$/;
    if (record.newCode.length <= 0) {
      this.isError = true;
      this.validateErrorTxt = this.$t("languages.Apps.RequiredCode") as string;
      this.$emit("validate", false);
      return;
    }
    

    if (!reg.test(record.newCode)) {
      this.isError = true;
      this.validateErrorTxt = this.$t("languages.Apps.CodeRule") as string;
      this.$emit("validate", false);
    } else {
      this.isError = false;
      this.validateErrorTxt = "";
      this.$emit("setCode", record.newCode);
      this.$emit("validate", true);
    }
  }

  setSheetCode(sheetItem: any) {
    const reg = /^[a-zA-Z][a-zA-Z0-9_]{0,23}$/;

    if (sheetItem.newCode.length <= 0) {
      sheetItem.isError = true;
      sheetItem.validateErrorTxt = this.$t(
        "languages.Apps.RequiredCode"
      ) as string;
      this.$emit("validate", false);
      return;
    }

    if (!reg.test(sheetItem.newCode)) {
      sheetItem.isError = true;
      sheetItem.validateErrorTxt = this.$t("languages.Apps.CodeRule") as string;
      this.$emit("validate", false);
    } else {
      sheetItem.isError = false;
      sheetItem.validateErrorTxt = "";
      this.$emit("validate", true);
    }

    const backData: any = {};
    this.sheetList.forEach((item: any) => {
      backData[item.code] = item.newCode;
    });

    this.$emit("setCode", backData);
  }

  sheetList: any[] = [];
  oldSheetList:any[] = []

  @Watch("subSchemaCodes")
  onSubSchemaCodesChange(v: any) {
    if (v && this.sheetList.length === 0) {
      for (const code in v) {
        this.sheetItemDate.set(code, {
          code,
          val: v[code],
          isError: false,
          validateErrorTxt: ""
        });
      }
    }
  }

  @Watch("subSchemaNames")
  onSubSchemaNamesChange(v: any) {
    this.sheetList = []
    for (const key in v) {
      const sheetName = {
        name: v[key]
      }
      const sheetObj = Object.assign(this.sheetItemDate.get(key), sheetName);
      sheetObj.newCode = sheetObj.newCode || sheetObj.code
      this.sheetList.push(sheetObj);
    }
    this.oldSheetList = JSON.parse(JSON.stringify(this.sheetList))
  }

  @Watch("errorSheetList")
  onErrorSheetList(v: any) {
    if (this.errorSheetList) {
      const { errorSheetList } = this;
      for (const code in errorSheetList) {
        const errorItem = this.sheetList.find((res: any) => res.code === code);

        if (errorItem) {
          errorItem.isError = true;
          errorItem.validateErrorTxt = this.$t(
            "languages.Apps.RepeatSubsheetCode"
          ) as string;
        }
      }
    }
  }

  @Watch("schemaCode")
  onSchemaCodeChange(v: string) {
    this.code = v;

    this.codeList = [{
      code: this.code,
      name: this.schemaName || this.codeList[0].name,
      newCode: this.codeList[0].newCode || this.code
    }]
    // this.oldCode = this.code

  }

  @Watch("isShowValidateError")
  onIsShowValidateErrorChange(v: boolean) {
    if (v) {
      // 01.子表编码重复
      // 01.模型编码重复
    }
    this.isError = v;
  }

  @Watch("errorInfo")
  onErrorInfoChange(v: string) {
    // if()
    // 
    this.validateErrorTxt = v;
  }

  @Watch("isShowUpdateCode")
  onIsShowUpdateCodeChange(v: boolean) {
    if (v) {
      // 只要是修改编码，就回到初始状态
      this.isError = false;
      this.validateErrorTxt = "";
      this.code = this.schemaCode;
      this.$emit("setCode", this.code);
      this.setKeys()
    }
  }
}
</script>

<style lang="less">
.file-validate {
  .validate-box {
    .file-status {
      &.repeat {
        display: block;
        height: auto;
        .file-status-txt {
          font-size: 14px;
          line-height: 22px;
          height: 22px;
          color: rgba(0, 0, 0, 0.85);
          font-weight: 400;
        }
        span {
          display: inline;
        }
        & > div {
          margin-top: 10px;
          margin-left: 26px;
        }
        .high-light {
          color: @primary-color;
        }
      }
      display: flex;
      justify-content: flex-start;
      align-items: center;
      &-icon {
        color: @primary-color;
        font-size: 18px;
        &.error {
          color: #f5222d;
        }
      }
      &-warn {
        color: #faad14;
        transform: scale(0.75);
        display: inline-block;
      }
      &-txt {
        font-size: 16px;
        font-weight: bold;
        color: rgba(0, 0, 0, 0.85);
        margin-left: 8px;
        word-break: break-all;
      }
    }

    .validate-warn {
      width: 488px;
      margin-left: 8px;
      margin-top: 8px;
      padding: 8px;
      color: #f4454e;
      background: rgba(255, 163, 168, 0.06);
      border-radius: 4px;
      border: 1px solid rgba(245, 34, 45, 0.08);
    }
    .file-content {
      &.approved {
        margin-top: 24px;
      }
      &.repeated {
        margin-top: 14px;
      }
      &.error {
        margin-top: 16px;
      }
      &-hint {
        color: rgba(0, 0, 0, 0.45);
        font-size: 12px;
        line-height: 22px;
      }
      &-error {
        & > ul {
          padding: 8px;
          background: rgba(245, 34, 45, 0.06);
          border-radius: 4px;
          border: 1px solid rgba(245, 34, 45, 0.08);
        }
      }
      & .model-info {
        &.update-code {
          max-height: 145px;
          overflow: scroll;
        }
        & .model-item {
          margin-bottom: 20px;
          position: relative;
          &:last-of-type {
            margin-bottom: 0;
          }
          label {
            i {
              float: left;
            }
            color: rgba(0, 0, 0, 0.65);
            margin-right: 12px;
            display: inline-block;
            width: 108px;
            line-height: 32px;
            span.title {
              float: left;
              width: 88px;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              margin-left: 0;
              line-height: 32px;
            }
          }
          & span {
            margin-left: 20px;
          }
          & input {
            width: 375px;
            &.error-input {
              border: 1px solid #f5222d;
              box-shadow: unset;
            }
          }
          & p.warn-txt {
            color: rgba(0, 0, 0, 0.65);
            font-size: 12px;
            line-height: 20px;
            text-indent: 120px;
          }
        }
      }
    }
  }
}
p.error-txt {
  color: #f5222d;
  text-align: left;
  margin-bottom: 0;
  // position: absolute;
}
.validate-msg {
  padding-left: 38px;
  font-size: 14px;
  font-family: PingFang-SC-Regular;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
}

.validate-icon-error {
  color: rgba(245, 154, 35, 1);
}
.validate-msg {
  margin-left: -12px;
  margin-bottom: 24px;
  ul {
    margin-top: 10px;
    padding: 8px;
    border-radius: 4px;
  }
  &.err {
    ul {
      font-size: 12px;
      line-height: 24px;
      background-color: rgba(245, 34, 45, 0.1);
      border: 1px solid rgba(245, 34, 45, 0.1);
    }
  }
  &.warn {
    ul {
      background-color: rgba(245, 245, 245, 1);
      border: 1px solid rgba(191, 191, 191, 0.16);
    }
  }
  .validate-title {
    padding-left: 8px;
  }
}
</style>
