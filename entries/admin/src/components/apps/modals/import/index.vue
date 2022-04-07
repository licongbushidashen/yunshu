<template>
  <a-modal
      class="import-container"
      v-model="show"
      title="模型导入"
      :width="800"
      @cancel="handleCancel"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false">
    <div class="import-layout">
      <div class="steps" v-if="!isShowUpdateCode">
        <a-steps size="small" :current="curStep" :status="curStepStatus">
          <a-step :title="$t('languages.Apps.UploadFile')"></a-step>
          <a-step :title="$t('languages.Apps.VerifyFile')">
            <a-icon v-if="curStep === 1 && !isValidated" type="loading" slot="icon"/>
          </a-step>
          <a-step :title="$t('languages.Apps.Import')"></a-step>
        </a-steps>
      </div>
      <div class="step-content">
        <file-import
            :percent="importPercent"
            :isImportEnd="isImportEnd"
            :importStatus="importStatus"
            :errmsg="errmsg"
            v-if="isImport"/>

        <file-upload
            :accept="accept"
            :action="action"
            :clearFileList="clearFileList"
            :defaultFolder="defaultFolder"
            @setFileName="setFileName"
            @setFolderId="setFolderId"
            v-if="isUpload"/>
        <file-validate
            ref="fileValidate"
            v-if="isValidate"
            :isShowUpdateCode="isShowUpdateCode"
            :validateStatus="validateStatus"
            :schemaCode="schemaCode"
            :schemaName="schemaName"
            :errorType="errorType"
            :errorInfo="errorInfo"
            :isDelete="isDelete"
            :isShowValidateError="isShowValidateError"
            :subSchemaCodes="subSchemaCodes"
            :subSchemaNames="subSchemaNames"
            :errorSheetList="errorSheetList"
            :referAndChildMap="referAndChildMap"
            :isShowCodeTips="isShowCodeTips"
            :appFunctionModel="appFunctionModel"
            :appPackageModel="appPackageModel"
            :bizImportValid="bizImportValid"
            :bizFormsList = "bizFormsList"
            :workflowsList = "workflowsList"
            :repeatWorkflowCodes = "repeatWorkflowCodes"
            :isClickReturnAndSave = "isClickReturnAndSave"
            @setCode="setCode"
            @validate="setIsValidateOk"
            :repeated="repeated"
        />
      </div>
    </div>

    <template slot="footer">
      <div v-if="curStep === 0">
        <!-- 下一步 -->
        <a-button type="primary" :disabled="nextDisabled" @click="nextStep">{{
            $t('languages.Apps.NextStep')
          }}
        </a-button>
      </div>

      <div v-if="curStep === 1">
        <!-- 取消 -->
        <a-button @click="handleCancel" v-show="validateStatus === 'referCode'"> {{
            $t('languages.Apps.Cancel')
          }}
        </a-button>
        <!-- 编码重复 -->
        <template>
          <!-- 上一步 -->
          <!-- <a-button v-if="isShowUpdateCode && appFunctionModel" @click="preStep">{{ $t('languages.Apps.PreStep') }}</a-button> -->
          <!-- 修改编码 -->
          <a-button v-if="!isShowUpdateCode" @click="updateCode">{{ $t('languages.Apps.EditCode') }}</a-button>
        </template>

        <!-- 编码重复 -->
        <template v-if="validateStatus === 'repeat' || validateStatus === 'referCode' || subSchemaCodes">
          <!-- 7777 -->
          <template >
            <!-- 返回 -->
            <a-button
                v-if="isShowUpdateCode && isChangedCode "
                @click="returnClick"
                >{{ $t('languages.Apps.return') }}
            </a-button>

            <!-- 保存并返回 -->
            <a-button
                v-if="isShowUpdateCode"
                type="primary"
                @click="returnAndSaveClick"
                >{{ $t('languages.Apps.SaveAndReturn') }}
            </a-button>
          </template>
          

          <!-- 导入 -->
          <!-- 在修改编码界面中不显示导入按钮 -->
          <a-button
              v-if="isShowImportBtn && !isShowUpdateCode"
              type="primary"
              @click="importModal"
              :disabled="!isValidatedOk">{{ $t('languages.Apps.Import') }}
          </a-button>

          <!-- 导入并覆盖 -->
          <a-button
              v-if="showCover"
              type="primary"
              @click="importAndCover"
              :disabled="!isValidatedOk">{{ $t('languages.Apps.ImportAndCover') }}
          </a-button>

          <!-- 点击导入并覆盖弹窗 -->
          <a-modal
              title="提示"
              v-model="isRepeat"
              @ok="repeatOk"
              @cancel="repeatCancel($event)"
              okText="是"
              cancelText="否">
            <p>{{ $t('languages.Apps.ImportAndCoverTips') }}</p>
          </a-modal>

        </template>
        <!-- 校验错误 -->
        <!-- @click="" -->
        <a-button
            v-else-if="validateStatus === 'error'"
            type="primary"
            @click="handleCancel"
            :disabled="!isValidatedOk">{{ $t('languages.Apps.Ok') }}
        </a-button>

        <!-- 编码没有重复，可以直接导入 -->
        <a-button
            v-if="!subSchemaCodes && !codeDuplication && (validateStatus === 'ok') && !subSchemaCodes"
            type="primary"
            @click="doImport"
            :disabled="!isValidatedOk">{{ $t('languages.Apps.Import') }}
        </a-button>
      </div>

      <div v-if="curStep === 2">
        <!-- 完成 -->
        <a-button type="primary" @click="handleCancel" :disabled="!isImportEnd">{{
            $t('languages.Apps.Finish')
          }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch
} from 'vue-property-decorator';
import {
  State, Action, Mutation, namespace
} from 'vuex-class';
import cloneDeep from 'lodash/cloneDeep';
import {Modal, Steps, Button} from '@h3/antd-vue';

import AppsApi from '@/apis/apps';
import * as FileValidateNS from '@/typings/app-error';

import FileUpload from './file-upload.vue';
import FileValidate from './file-validate.vue';
import FileImport from './file-import.vue';

const MenuModule = namespace('Apps/AppItem');
const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'DataImport',
  components: {
    AModal: Modal,
    ASteps: Steps,
    AStep: Steps.Step,
    AButton: Button,
    FileUpload,
    FileValidate,
    FileImport
  }
})

export default class DataImport extends Vue {
  @AppCenterModule.State('appInfo') appDetails: any;

  @MenuModule.State('appInfo') appInfo: any;

  @MenuModule.State('floders') floders: any;

  @MenuModule.State('menuId') menuId: any;

  @MenuModule.Action('getFolders') getFolders: any;


  @Prop() value!: any;

  @Prop() accept!: any;

  @Prop() action!: any;

  visible: boolean = false;

  show = true;

  isClickReturnAndSave: number = + new Date() // 点击 返回按钮
  returnClick(){ // 返回

    this.codeDuplication = this.oldCodeDuplication;
    this.isShowUpdateCode = false
    this.resSetNewCode()
  }

  resSetNewCode(){
    this.bizFormsList.forEach(el => el.newCode = '');
    //返回时若流程编码校验不通过则置空流程编码
    if(this.repeatWorkflowCodes){
      this.workflowsList.forEach(el => el.newCode = '');
    }
    // @ts-ignore
    this.$refs.fileValidate.resSetNewCode()
  }

  returnAndSaveClick(){ // 保存并返回
    this.isClickReturnAndSave = + new Date()
    this.$nextTick( () => {
      this.modifySchemaCodesImport()
    })
  }
  importModal(){
    this.importFile(this.schemaCodeChanged || this.schemaCode, this.fileName, false, false);
  }


  curStep: number = 0; // 当前步骤

  curStepStatus: string = 'process'; // 当前步骤状态

  nextDisabled: boolean = true; // 下一步按钮状态

  isShowUpdateCode: boolean = false; // 是否显示修改编码框

  fileName: string = ''; // 文件名

  isValidated: boolean = false; // 是否校验完成

  isValidatedOk: boolean = true; // 是否校验成功

  validateStatus: string = ''; // 校验状态

  importPercent: number = 0; // 导入进度

  isImportEnd: boolean = false; // 是否导入完成

  importStatus: string = 'process'; // 导入状态 process success error

  clearFileList: string = '';

  errmsg: string = '';

  schemaCode: string = ''; // 业务模型编码

  subSchemaCodes: any = null; // 业务模型子表编码

  subSchemaNames: any = null; // 业务模型子表名称

  schemaCodeChanged: string = ''; // 修改后的schemaCode

  schemaName: string = ''; // 业务模型名称

  errorType: number = -1; // 导入错误对应的类型

  errorInfo: string = ''; // 数据项错误时的错误文案

  folderId: string = ''; // 文件夹id

  simulateInterval: any = ''; // 模拟动画定时器

  defaultFolder: string = ''; // 默认目录

  isShowValidateError: boolean = false; // 是否展示校验错误

  isCoverable: boolean = false; // 是否覆盖

  referAndChildMap: any = null;

  appFunctionModel: any = null; // 所在目录

  appPackageModel: any = null; // 所在应用

  isRepeat: boolean = false; // 导入校验是否模型重复
  isDelete: boolean = false;

  isImportDataRule: any = null; // 是否导入数据规则

  bizFormsList: any[] = [] // 表单
  workflowsList: any[] = [] // 流程

  bizImportValid: any = null;

  subSchemaCodesCopy:any = null;

  repeated: boolean = false; // 模型编码重复

  get showCover () {
    // console.log(this.appPackageModel, 'this.appPackageModel');
    if (this.appPackageModel) {
      return this.codeDuplication || this.$route.params.appCode === this.appPackageModel.code && !this.isShowUpdateCode && !this.isDelete
    }
    return false;
  }
  /**
   * 关闭弹窗重置
   */
  reset() {
    this.curStep = 0;
    this.curStepStatus = 'process';
    this.nextDisabled = true;
    this.isShowUpdateCode = false;
    this.fileName = '';
    this.isValidated = false;
    this.isValidatedOk = true;
    this.validateStatus = '';
    this.importPercent = 0;
    this.isImportEnd = false;
    this.isDelete = false;
    this.importStatus = 'process';
    this.clearFileList = '';
    this.folderId = '';
    this.importPercent = 0;
    this.isCoverable = false;
    this.isShowValidateError = false;
    this.ignoreCode = false;
    this.errorSheetList = null;
    this.subSchemaCodes = null;
    this.subSchemaNames = null;
    this.isShowCodeTips = false;
    this.referAndChildMap = null;
    this.schemaCodeChanged = '';
    this.appPackageModel = null;
    this.isImportDataRule = null;
    this.bizFormsList = [] // 表单
    this.workflowsList = [] // 流程
    this.isChangedCode = false
    clearInterval(this.simulateInterval);
  }

  isShowCodeTips = false;
  

  /**
   * 关闭弹窗
   */
  handleCancel() {
    this.$emit('importEnd', false);
    this.reset();
  }


  /**
   * 文件上传成功之后保存后台返回的文件名备用
   * 同时，当后台返回文件名的时候，才可以点击下一步
   */
  setFileName(name: string) {
    this.fileName = name;
    this.nextDisabled = !name;
  }


  /**
   * 设置文件夹id
   */
  setFolderId(id: string) {
    if (!id) return;
    this.folderId = id;
  }

  isChangedCode:boolean = false // 修改过编码,不能显示返回按钮
  /**
   * 设置修改后的编码
   */
  setCode(code: string | object) {
    if (code && typeof code === 'string') {
      this.schemaCodeChanged = code;
    } else if (code && typeof code === 'object' && code !== null) {
      this.subSchemaCodes = Object.assign(this.subSchemaCodes || {}, code);
    }
    this.isChangedCode = true
  }

  setIsValidateOk(v: boolean) {
    this.isValidatedOk = v;
  }


  /**
   * 文件上传 点击下一步
   */
  nextStep() {
    this.curStep = 1;
    // 文件校验
    const fileName = this.fileName;
    const schemaCode: string = this.schemaCodeChanged;
    this.checkPackage(schemaCode, fileName, false);
  }

  /**
   * 文件校验
   * @parms
   * fileName 文件名称
   * coverAble 是否覆盖
   * schemaCode 模型编码
   */
  checkPackage(schemaCode: string, fileName: string, coverAble: boolean) {
    const vm: any = this;
    const params = {
      schemaCode,
      fileName,
      coverAble,
      isImportDataRule: this.isImportDataRule
    }
    this.checkApi(params).then((res: any) => {
      vm.isValidated = true;
      const data = res.data;
      vm.isShowCodeTips = data ? !!data.schemaCode : false;
      if (res.errcode === 0) {
        this.codeDuplication = data.errorType === 5;

        if (data.result) {
          vm.subSchemaCodes === null ? vm.subSchemaCodes = data.subSchemaCodes : vm.subSchemaCodes; // 子表数据项
          vm.subSchemaNames = data.subSchemaNames; // 子表数据项名称
          vm.schemaCode = data.schemaCode;
          vm.schemaName = data.name;
          vm.appFunctionModel = data.appFunctionModel; // 所在目录
          vm.appPackageModel = data.appPackageModel; // 所在应用
          
          if(Array.isArray(data.bizForms)){
            data.bizForms.forEach((el:any) => {
              el.newCode = el.newCode || ''
            });
          }

          if(Array.isArray(data.workflows)){
            data.workflows.forEach((el:any) => {
              el.newCode = el.newCode || ''
            });
          }

          vm.bizFormsList = data.bizForms || [] // 表单
          vm.workflowsList = data.workflows || [] // 流程 

          vm.repeated = data.repeated // 记录是否模型编码重复
          // 77777



          // if(data.appPackageModel) {
          //   vm.appPackageModel = data.appPackageModel; // 所在应用
          // }
          vm.isDelete = data.delete;
          vm.bizImportValid = {
            noExitCodes: data.noExitCodes,
            messageReceiver: data.messageReceiver,
            noExitBizActionMethod: data.noExitBizActionMethod
          }

          if (data.repeated) { // 编码重复
            vm.validateStatus = FileValidateNS.FileValidateStatus.CodeRepeat;
            return;
          }
          // 存在关联模型或者关联表单
          if (data.referAndChildMap) {
            this.validateStatus = FileValidateNS.FileValidateStatus.referCodesError;
            this.referAndChildMap = data.referAndChildMap;
            this.showValidated();
            this.ignoreCode = true;
            return;
          }

          if (data.errorType === 0) {
            this.validateStatus = FileValidateNS.FileValidateStatus.ValidateOk;
          }

        } else { // 校验失败
          this.validateStatus = FileValidateNS.FileValidateStatus.ValidateError;
          this.errorType = data.errorType;
          this.errorInfo = data.resultInfo;
          this.isShowUpdateCode = true;
        }
        // 文件校验成功
      } else {
        this.isShowUpdateCode = true;
        this.validateStatus = FileValidateNS.FileValidateStatus.ValidateError;
        this.errorType = res.errcode;
        this.errorInfo = res.errmsg;
        // 
      }
    })
  }

  // 重复流程编码
  repeatWorkflowCodes: Boolean = false
  isShowImportBtn: Boolean = false


  codeDuplication:boolean = false; // 编码重复

  /**
   * 文件校验后直接导入
   * @parms
   * fileName 文件名称
   * coverAble 是否覆盖
   * schemaCode 模型编码
   */
  checkAndImport(schemaCode: string, fileName: string, coverAble: boolean, isImportDataRule: any, isChecked: boolean = false) {
    console.log(this.subSchemaCodes, 'this.subSchemaCodes');
    console.log(this.subSchemaCodesCopy, 'this.subSchemaCodesCopy');
    let map: any = this.subSchemaCodes;
    if (this.subSchemaCodesCopy) {
      map = Object.assign(this.subSchemaCodesCopy, this.subSchemaCodes);
    }

    const vm: any = this;

    let workflowCodeChangedMap = {};
    this.workflowsList.map((el:any) => {
      if(el.newCode){
        workflowCodeChangedMap[el.workflowCode] = el.newCode
      }
    });
    const params = {
      schemaCode,
      fileName,
      coverAble,
      map,
      isImportDataRule: this.isImportDataRule,
      workflowCodeChangedMap
    }
    
    this.checkApi(params, isChecked).then((res: any) => {

      vm.isValidated = true;
      if (res.errcode === 0) {
        const data = res.data;

        

        if (vm.isShowUpdateCode && vm.schemaCode) { // 修改编码后的修改 保存第一次的错误数据
          vm.subSchemaCodesCopy = cloneDeep(data.subSchemaCodes);
        }
        vm.isShowCodeTips = !!data.schemaCode;
        vm.subSchemaCodes === null ? vm.subSchemaCodes = data.subSchemaCodes : vm.subSchemaCodes; // 子表数据项
        vm.subSchemaNames = data.subSchemaNames; // 子表数据项名称
        vm.schemaCode = data.schemaCode;
        vm.schemaName = data.name;
        vm.appFunctionModel = data.appFunctionModel; // 所在目录
        vm.appPackageModel = data.appPackageModel; // 所在应用

        vm.repeatWorkflowCodes = data.repeatWorkflowCodes ? true : false;
        vm.isDelete = data.delete;
        vm.bizImportValid = {
          noExitCodes: data.noExitCodes,
          messageReceiver: data.messageReceiver,
          noExitBizActionMethod: data.noExitBizActionMethod
        }

        

        if (data.result) {
          this.repeated = data.repeated
          if (data.errorType === 0) {
            // 校验成功
            this.isShowUpdateCode = false
            this.isShowImportBtn = true
            return;
          }else{
            this.isShowImportBtn = false
            this.isShowUpdateCode = true
          }
          if(data.repeated && data.schemaCode){
            this.isShowValidateError = true;
            this.errorInfo = '编码有重名';
          }

          if (data.subSchemaCodes) {
            this.errorSheetList = data.subSchemaCodes;
            this.isShowUpdateCode = false
            if (!this.subSchemaCodes) {
              this.subSchemaCodes = data.subSchemaCodes;
              this.subSchemaNames = data.subSchemaNames;
            }
          }

          if (data.referAndChildMap) {
            this.isShowCodeTips = false;
            this.validateStatus = FileValidateNS.FileValidateStatus.referCodesError;
            this.referAndChildMap = data.referAndChildMap;
            this.showValidated();
            this.ignoreCode = true;
          }
        } else { // 校验错误直接弹出错误
          this.isShowValidateError = false;
          this.validateStatus = FileValidateNS.FileValidateStatus.ValidateError;
          this.errorType = data.errorType;
          this.errorInfo = data.resultInfo;
          this.isShowUpdateCode = true;
        }
      } else{
          this.isShowUpdateCode = true;
          this.isShowValidateError = false;
          this.validateStatus = FileValidateNS.FileValidateStatus.ValidateError;
          this.errorType = res.errcode;
          this.errorInfo = res.errmsg;  
      }
    })
  }

  checkApi(params: any, isChecked:boolean = false) {
    if(isChecked){
      return new Promise((resolve, reject) => {
        AppsApi.check(params).then((res: any) => {
          resolve(res);
        })
      });
    }

    return new Promise((resolve, reject) => {
      AppsApi.check_package_new(params).then((res: any) => {
        resolve(res);
      })
    });
  }

  /**
   * 直接导入
   */

  doImport() {
    this.importFile(this.schemaCodeChanged, this.fileName, this.isCoverable, this.isImportDataRule);
  }

  /**
   * 上一步
   */
  preStep() {
    this.showRepeatCode();
  }


  oldCodeDuplication:boolean = false;
  /**
   * 修改编码
   */
  updateCode() {
    // 7777
    this.oldCodeDuplication = this.codeDuplication; //记录状态，以便返回的时候重置
    this.codeDuplication = false;
    this.isShowUpdateCode = true;
  }

  /**
   * 文件校验点击上一步
   */
  showRepeatCode() {
    this.isShowUpdateCode = false;
    this.isValidatedOk = true;
  }

  showValidated() {
    this.isShowImportBtn = true;
    this.isShowUpdateCode = false;
    this.isValidatedOk = true;
  }


  /**
   * 文件校验根据类型执行不同函数
   */
  handleConfirmClick() {

    const vStatus = this.validateStatus;
    switch (vStatus) {
      case FileValidateNS.FileValidateStatus.ValidateOk:
        this.fileImport();
        break;
      case FileValidateNS.FileValidateStatus.CodeRepeat:
      case FileValidateNS.FileValidateStatus.referCodesError:
        this.fileImport();
        break;
      case FileValidateNS.FileValidateStatus.ValidateError:
        this.handleCancel();
        break;
      default:
        break;
    }
  }

  /**
   * 覆盖导入
   */
  // 点击"是"
  repeatOk() {
    this.isImportDataRule = true;
    this.checkAndImport('', this.fileName, true, this.isImportDataRule);
  }

  // 点击"否"
  repeatCancel(e) {
    if (e.currentTarget.innerText === "否") {
      this.isImportDataRule = false;
      this.checkAndImport('', this.fileName, true, this.isImportDataRule)
    } else {
      this.isRepeat = false;
    }
  }

  importAndCover() {
    //this.checkAndImport('',this.fileName,true)
    /* 只有当点击导入并覆盖按钮且errorType为7时才弹窗 */

    this.importFile(this.schemaCodeChanged || this.schemaCode, this.fileName, true, false);
    return
    this.isCoverable = true;
    this.checkAndImport('', this.fileName, true, this.isImportDataRule)
  }

  /**
   * 修改编码导入
   */
  modifySchemaCodesImport() {
    
    console.log('修改编码导入',this.isValidatedOk)
    if(!this.isValidatedOk){
      return 
    }
    // 7777777
    this.checkAndImport(this.schemaCodeChanged, this.fileName, false, this.isImportDataRule, true)
  }

  /**
   * 文件校验点击导入
   */

  /**
   * 导入逻辑
   */
  errorSheetList: any = null;


  ignoreCode: boolean = false;

  fileImport() {
  }


  /**
   * 导入操作
   */
  import() {
    this.curStep = 2;
    ;
    this.subSchemaCodesCopy = null;
    if (this.validateStatus === FileValidateNS.FileValidateStatus.ValidateOk) {
      this.isCoverable = false;
    } else if (this.validateStatus === FileValidateNS.FileValidateStatus.CodeRepeat) {
      this.isCoverable = !this.isShowUpdateCode;
    } else {
      this.isCoverable = false;
    }
    const params: Apps.AppItem.ImportModelParams = {
      schemaCode: this.schemaCodeChanged,
      fileName: this.fileName,
      coverAble: this.isCoverable,
      parentId: this.folderId
    };
    this.simulateImport();
    setTimeout(async () => {
      const importRes:any = await AppsApi.import_package(params);
      console.log(importRes, 'importRes');
      this.isImportEnd = true;
      if (importRes.errcode === 0) {
        const {data} = importRes;
        if (data.result) {
          this.importPercent = 100;
          this.importStatus = FileValidateNS.ImportStatus.ImportSuccess;
        } else {
          this.importPercent = 75;
          this.errmsg = importRes.errmsg;
          this.importStatus = FileValidateNS.ImportStatus.ImportError;
        }
      } else {
        this.importPercent = 75;
        this.errmsg = importRes.errmsg;
        this.importStatus = FileValidateNS.ImportStatus.ImportError;
      }
    }, 5000);
  }

  /**
   * 文件导入
   * @parms
   * fileName 文件名称
   * coverAble 是否覆盖
   * schemaCode 模型编码
   */

  importFile(schemaCode: string, fileName: string, coverAble: boolean, isImportDataRule: any) {

    const map: any = JSON.parse(JSON.stringify(this.subSchemaCodes));

    for (const key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        const element = map[key];
        if(element === ''){
          delete map[key]
        }
      }
    }

    this.curStep = 2;

    let workflowCodeChangedMap = {} 
    this.workflowsList.map((el:any) => {
      if(el.newCode && el.newCode !== el.workflowCode){
        workflowCodeChangedMap[el.workflowCode] = el.newCode
      }
    })
    let sheetCodeChangedMap = {}
    this.bizFormsList.map((el:any) => {
      if(el.newCode && el.newCode !== el.code){
        sheetCodeChangedMap[el.code] = el.newCode
      }
    })
    const params: any = {
      schemaCode,
      fileName,
      coverAble,
      parentId: this.folderId,
      subCodes: map,
      isImportDataRule: this.isImportDataRule,
      workflowCodeChangedMap,
      sheetCodeChangedMap
    };
    // 进度条
    this.simulateImport();

    setTimeout(() => {
      AppsApi.import_package(params).then((importRes: any) => {
        this.isImportEnd = true;
        if (importRes.errcode === 0) {
          const {data} = importRes;
          if (data.result) {
            this.importPercent = 100;
            this.importStatus = FileValidateNS.ImportStatus.ImportSuccess;
          } else {
            this.importPercent = 75;
            this.errmsg = importRes.errmsg;
            this.importStatus = FileValidateNS.ImportStatus.ImportError;
          }
        } else {
          this.importPercent = 75;
          this.errmsg = importRes.errmsg;
          this.importStatus = FileValidateNS.ImportStatus.ImportError;
        }
      });
      // this.isImportEnd = true;

    }, 5000);

  }


  /**
   * 模拟导入处理进度
   */
  simulateImport() {
    let percent = 1;
    this.simulateInterval = setInterval(() => {
      if (!this.isImportEnd) {
        if (percent <= 90) {
          percent += this.random(5);
          this.importPercent = percent;
        }
      } else {
        clearInterval(this.simulateInterval);
      }
    }, 1500);
  }


  /**
   * 产生随机整数
   */
  random(num: number) {
    return Math.ceil(Math.random() * 5);
  }


  /**
   * 关闭弹窗
   */
  closeModal() {
    this.$emit('input', false);
  }

  created() {
    this.onValueChange(true);
  }

  // todo: 数据存store，统一调用
  @Watch('value')
  onValueChange(v: any) {
    this.visible = v;
    if (v) {
      const promise = new Promise((resolve: (value: any) => void, reject) => {
        resolve(this.getFolders(this.appInfo));
      });
      promise.then(() => {
        if (this.menuId) {
          const id = this.floders.filter(val => val.id === this.menuId);
          if (id.length === 0) {
            this.defaultFolder = this.appDetails.id;
          } else {
            this.defaultFolder = this.menuId;
          }

        } else {
          this.defaultFolder = this.appDetails.id;
        }
        this.folderId = this.defaultFolder;
      });

    }
  }

  /**
   * 监听步进控制组件显隐
   */

  isUpload = true;
  isValidate = false;
  isImport = false;

  @Watch('curStep')
  onCurStepChange(v: number) {
    switch (v) {
      case 0:
        this.isUpload = true;
        this.isValidate = false;
        this.isImport = false;
        break;
        // return 'file-upload';
      case 1:
        this.isUpload = false;
        this.isValidate = true;
        this.isImport = false;
        break;
        // return 'file-validate';
      case 2:
        this.isUpload = false;
        this.isValidate = false;
        this.isImport = true;
        break;
        // return 'file-import';
      default:
        break;
    }
  }


}
</script>

<style lang="less">
.import-container {
  & .import-layout {
    .data-upload{
      width: 80%;
      margin: 15px auto;
      .upload-left{
        width: 16%;
      }
      .upload-right{
        width: 80%;
      }
    }
    & .steps {
      width: 50%;
      margin: 30px auto;
    }
    .ant-table table{
      border: 1px solid #E9E9E9;
      border-bottom: none;
    }
    .ant-table-thead > tr > th{
      padding: 8px 10px;
    }
    .ant-table-tbody > tr > td{
      padding: 4px 10px;
    }
  }
}
</style>
