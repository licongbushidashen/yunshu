<template>
  <a-modal
    class="import-container"
    :title="modalTitle"
    :bodyStyle="{maxHeight: '650px', overflow: 'auto'}"
    v-model="show"
    width = "800px"
    destroyOnClose
    :maskClosable="false"
    @cancel="close"
  >
    <div class="import-type-layout" v-if="!importType">
      <div class="type-item" @click="onTypeItemClicked('LOCAL')">
        <span>
          <i class="icon aufontAll h-icon-all-a-ic_upload_localfile"></i>本地导入</span>
        <span class="icon aufontAll h-icon-all-arrow-right-o"></span>
      </div>
      <div class="type-item" @click="onTypeItemClicked('MARKET')">
        <span>
          <i class="icon aufontAll h-icon-all-upload_am"></i> 应用市场</span>
        <span class="icon aufontAll h-icon-all-arrow-right-o"></span>
      </div>
    </div>
    <div class="import-layout" v-if="importType">
      <p class="import-type-exit" @click="onTypeItemReturn">
        <span class="icon aufontAll h-icon-all-arrow-left-o"></span>
        <span v-if="importType === 'LOCAL'"> 本地导入</span>
        <span v-else> 应用市场</span>
      </p>
      <div class="steps" v-if="!isShowUpdateCode">
        <a-steps size="small" :current="curStep" :status="curStepStatus">
          <a-step :title="$t('languages.Apps.UploadFile')"></a-step>
          <a-step :title="$t('languages.Apps.VerifyFile')">
            <a-icon v-if="curStep === 1 && !isValidated" type="loading" slot="icon" />
          </a-step>
          <a-step :title="$t('languages.Apps.Import')"></a-step>
        </a-steps>
      </div>

      <div class="step-content">
        <div v-show="curStep === 0" class="data-upload">
          <div class="upload-left">所属分组:</div>
          <div class="upload-right">
            <a-select  style="width:100%" v-model="groupId">
              <template v-for="item in groupList">
                <a-select-option
                  v-show="item.code!=='all'"
                  :value="item.id"
                  :key="item.id"
                >{{ item.name }}</a-select-option>
              </template>
            </a-select>
          </div>
          <div class="clearfix"></div>
        </div>
        <fileUpload
          v-if="isUpload && !isValidate"
          accept=".zip"
          :action="uploadUrl"
          :importType="importType"
          @setFileName="setFileName"
        />

        <fileValidate
          v-if="isValidate"
          ref="fileValidate"
          :fileName="fileName"
          :importType="importType"
          :dmCodeList="dmCodeList"
          :subCodeList="subCodeList"
          :appCode="appCodeForCheck"
          :override="overrideForCheck"
          :orignList="orignList"
          @onFileFail="onFileFail"
          @onChecking="onChecking"
          @checkEnd="onCheckEnd"
          @modelCodeList="onModelCodeList"
          @showError="onShowError"
          @statusCode="onStatusCode"
        />

        <fileImport
          v-if="isImport"
          :fileName="fileName"
          :importType="importType"
          :dmCodeList="dmCodeList"
          :subCodeList="subCodeList"
          :appCode="appCodeForCheck"
          :override="overrideForImport"
          :groupId="groupId"
          :formModelMap="formModelMap"
          :workflowList="workflowList"
          @importEnd="isImportEnd = true"
          @succeed="importSucceed"
        />
      </div>

    </div>

    <template slot="footer">
      <div v-if="!importType">
        <a-button type="default" @click="close">取消</a-button>
      </div>
      <div v-if="isUpload && importType">
        <a-button type="primary" :disabled="nextAbled" @click="nextStep">{{ $t('languages.Apps.NextStep') }}</a-button>
      </div>

      <div v-if="isValidate && isValidated && importType">
        <template v-if="isFileOk">
          <template v-if="isCodeRepeat">
            <!-- 修改编码对应footer -->
            <template v-if="isShowUpdateCode">
              <a-button v-if="!isChangedCode"  type="default" @click="closeUpdateCode">返回</a-button>
              <a-button type="primary" @click="directImport" v-if="isShowImportBtn">保存并覆盖</a-button>
              <a-button type="primary" v-else @click="save">保存并返回</a-button>
            </template>

            <template v-else>
              <a-button type="default" @click="updateCode">修改编码</a-button>
              <a-button type="primary" v-if="!isModelCodeList && statusCode === ''" @click="importAndCover">导入并覆盖</a-button>
            </template>
          </template>

          <template v-else>
            <!-- 查看错误明细的时候 -->
            <template v-if="isShowError">
              <a-button type="default" @click="closeErrorDetail">返回</a-button>
              <a-button type="primary" @click="directImport">继续导入</a-button>
            </template>

            <!-- 直接导入 -->
            <a-button v-else type="primary" @click="directImport">导入</a-button>
          </template>
        </template>

        <template v-else>
          <a-button type="default" @click="prevStep">上一步</a-button>
        </template>
        
      </div>

      <div v-if="isImport && importType">
        <a-button type="primary" :disabled="!isImportEnd" @click="close">完成</a-button>
      </div>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from 'vue-property-decorator';
import { Modal, Steps, Button } from '@h3/antd-vue';
import { State, Action, namespace } from "vuex-class";
import AppsApi from '@/apis/apps';

import fileUpload from './file-upload.vue';

import fileValidate from './file-validate.vue';

import fileImport from './file-import.vue';
const AppCenterModule = namespace("Apps/AppCenter");
@Component({
  name:"",
  components: {
    AModal: Modal,
    ASteps: Steps,
    AStep: Steps.Step,
    fileUpload,
    fileValidate,
    fileImport
  }
})
export default class ImportApp extends Vue {
  @Prop() value !: boolean;
  @AppCenterModule.State("appGroupList") groupList: any;
  // 展示
  show:boolean = false;

  // 弹窗标题
  modalTitle:string = '应用导入';

  // 当前步骤
  curStep:number = 0;

  // 当前步骤状态
  curStepStatus: string = 'process'; // 当前步骤状态

  // 是否校验完成
  isValidated: boolean = false;

  // 当前已上传文件的名称，若删除则为空串
  fileName: string = '';

  // 文件合法性
  isFileOk:boolean = true;

  // 编码重复  应用，模型
  isCodeRepeat: boolean = true;

  // 是否修改编码
  isShowUpdateCode: boolean = false;

  dmCodeList:any = [];

  subCodeList:any = [];

  formModelMap:any = {}
  workflowList:any[] = []

  appCodeForCheck:string = '';

  overrideForCheck:boolean = false;

  isShowError:boolean = false;

  overrideForImport:boolean = false;

  // 是否导入完成
  isImportEnd:boolean = false;

  //groupList: Array<any> = [];
  
  groupId: string = "";
  @Inject()
  getgroupInfo!: Function;

  importType:string = ''; //导入方式：LOCAL-本地、MARKET-应用市场
  
  @Watch('groupList')
  groupListChane(){
    this.groupId = this.getgroupInfo().id;
  }
  async created(){
    
    //this.getGroupList();
  }
  //获取应用分组
  // async getGroupList() {
  //   const params: any = {
  //     groupCode: this.$route.params.appCode,
  //     fromRecycle: false,
  //   };
  //   let res = await AppsApi.getAppgroupList(params);
  //   if(res.errcode == 0)
  //   {
  //     this.groupList = res.data;
  //   }

  // }
  // 是否能点击下一步，必须成功上传文件
  get nextAbled() {
    return !this.fileName;
  }

  // 上传接口
  get uploadUrl() {
    return AppsApi.fileUploadUrl;
  }

  /**
   * 关闭
   * */ 
  close(){
    this.$emit('input', false);
    this.fileName = '';
    this.curStep = 0;
    this.appCodeForCheck = '';
    this.statusCode = '';
    this.dmCodeList = [];
    this.subCodeList = [];
    this.overrideForCheck = false;
    this.overrideForImport = false;
    this.isShowUpdateCode = false;
    this.isModelCodeList = false;
    this.isShowError = false;
    this.isCodeRepeat = true;
    this.coverImport = false;
    this.orignList = null;
    this.modalTitle = '导入';
    if (this.isImportSucceed) {
      this.$emit('importSucceed');
    }
    this.importType = '';
  }

  /**
   * 下一步逻辑
   * */ 
  nextStep(){
    this.curStep += 1;
  }

  /**
   * 上一步
   * */ 
  prevStep(){
    this.fileName = '';
    this.appCodeForCheck = '';
    this.statusCode = '';
    this.dmCodeList = [];
    this.subCodeList = [];
    this.overrideForCheck = false;
    this.overrideForImport = false;
    this.isModelCodeList = false;
    this.orignList = null;
    this.curStep -= 1;
  }

  /**
   * 设置已上传文件得文件名
   * */ 
  setFileName(fileName:string){
    this.fileName = fileName;
  }

  /**
   * 修改编码
   * */ 
  updateCode(){
    (this.$refs.fileValidate as any).showUpdateCode();
    this.isShowUpdateCode = true;
  }


  /**
   * 关闭修改编码
   * */ 
  closeUpdateCode(){
    (this.$refs.fileValidate as any).closeUpdateCode();
    this.isShowUpdateCode = false;
  }

  duplicates(arr:any) {
    const result:any = [];
    arr.forEach((item:string) => {
      if (arr.indexOf(item) !== arr.lastIndexOf(item) && result.indexOf((item as any)) === -1) {
          result.push(item);
      }
    })
    return result
  }

  isChangedCode:boolean = false // 修改过编码,不能显示返回按钮
  isShowImportBtn:boolean = false
  /**
   * 修改编码点击保存
   * 获取到修改的编码列表
   * */ 
  orignList:any = null;
  async save() {
    this.overrideForCheck = true;
    this.overrideForImport = false;
    let list:any =  (this.$refs.fileValidate as any).getCodeList();
    if (!list) return;
    this.appCodeForCheck = '';
    this.dmCodeList = [];
    this.subCodeList = [];
    this.formModelMap = {}
    this.workflowList = []
    

    list = this.combinedList(list);
    this.appCodeForCheck = list.appCodeList.length <= 0 ? '' : list.appCodeList[0].newCode;
    this.formModelMap = list.formModelMap
    this.workflowList = list.workflowList
    // 模型编码
    const temList:any[] = [];
    list.modelCodeList.forEach((item:any) => {
      const { modelCode, newCode } = item
      temList.push(
        {
          oldDmCode: modelCode,
          newDmCode: newCode
        }
      ) 
    });
    this.dmCodeList = temList;

    // 子表编码
    const temSubCodeList:any = [];
    list.subCodeList.forEach((item:any) => {
      const { modelCode, newCode } = item
      temSubCodeList.push(
        {
          oldDmCode: modelCode,
          newDmCode: newCode
        }
      ) 
    });
    this.subCodeList = temSubCodeList;

    // 校验是否输入重复的编码
    

    const codes:any[] = [];
    let existCodes:any[] = []
    this.dmCodeList.forEach((l:any) => {
      codes.push(`【${l.newDmCode}】`)
    })

    this.subCodeList.forEach((l:any) => {
      codes.push(`【${l.newDmCode}】`)
    })

    
    existCodes = this.duplicates(codes)

    if (existCodes.length > 0) {
      const errStr:string = `多次输入重复的编码${existCodes.join('、')}，请保证输入的新编码唯一！`;
      this.$message.error(errStr);
      return ;
    } 
    this.orignList = JSON.parse(JSON.stringify(list));

    await (this.$refs.fileValidate as any).$nextTick();
    const { validSuccess, isCodeRepeat, errcode, errmsg } = await (this.$refs.fileValidate as any).checkApp();

    this.isChangedCode = true
    
    if (validSuccess) {// 校验全部通过，直接导入
      this.closeUpdateCode()
      this.isShowImportBtn = true
      return;
      // this.directImport();
    } else if (isCodeRepeat) { // 校验编码有重复，停留当前页面继续修改编码
      this.$message.error('检测到以下新编码与系统中已存在的编码重复，请重新修改');
      this.updateCode();
    } else if (errcode && errcode === 600028) {
      this.$message.error(errmsg);
      this.updateCode();
    } else {
      this.isShowUpdateCode = false;
    }
  }

  /* 
  * 合并新修改的编码数据与所有需更改的编码数据源
  */
 combinedList(list:any) {
  if (!this.orignList) return list;
  const result:any = {};
  result.appCodeList = this.orignList.appCodeList ? this.orignList.appCodeList.map((app:any) => {
                            const appResult = list.appCodeList.find((a:any) => a.appCode === app.appCode);
                            if (appResult) {
                              return appResult;
                            }
                            return app;
                        }): [];
  result.modelCodeList = this.orignList.modelCodeList ? this.orignList.modelCodeList.map((modal:any) => {
                            const modalResult = list.modelCodeList.find((a:any) => a.modelCode === modal.modelCode);
                            if (modalResult) {
                              return modalResult;
                            }
                            return modal;
                        }): [];
  result.subCodeList = this.orignList.subCodeList ? this.orignList.subCodeList.map((sub:any) => {
                            const subResult = list.subCodeList.find((a:any) => a.modelCode === sub.modelCode);
                            if (subResult) {
                              return subResult;
                            }
                            return sub;
                        }): [];

  result.workflowList = list.workflowList
  result.formModelMap = list.formModelMap
  return result;
 }

  /**
   * 覆盖并导入
   * */ 
  coverImport:boolean = false;
  importAndCover(){
    const comp: any = (this.$refs.fileValidate as any)
    const errDetail:any = comp.errDetails;
    const isErr: boolean = errDetail.appManager.length > 0 || errDetail.dataModel.length > 0 || errDetail.formDesinge.length > 0 || errDetail.workflow.length > 0;
    if (isErr) {
      this.isCodeRepeat = false;
      comp.isShowErr = false; // show other errs
      // 覆盖并导入的时候，override设为true
      this.coverImport = true;
    } else {
      this.overrideForImport = true;
      this.doImport();
    }
  }

  /**
   * 直接导入
   * */ 
  directImport(){
    this.overrideForImport = this.coverImport;
    this.doImport();
    this.coverImport = false;
  }
  

  /**
   * 文件合法性
   * */ 
  onFileFail(isOk:boolean){
    this.isFileOk = isOk;
  }

  /**
   * 校验是否结束
   * */ 
  onChecking(isEnd: boolean) {
    this.isValidated = !isEnd;
  }

  /**
   * 校验结束
   * */ 
  onCheckEnd(obj:any) {
    const { isCodeRepeat } = obj;
    this.isCodeRepeat = isCodeRepeat;
  }

  isModelCodeList: boolean = false;
  /**
   * 监听编码重复的数量
   * */ 
  onModelCodeList(obj: boolean) {
    this.isModelCodeList = obj;
  }

  /**
   * 监听到展示错误明细的时候
   * */ 
  onShowError(){
    this.isShowError = true;
    this.modalTitle = "导入 > 异常明细";
  }

  // 回收站编码重复tag
  statusCode: string = '';
  onStatusCode(str: string) {
    this.statusCode = str;
  }

  /**
   * 关闭错误明细
   * */ 
  closeErrorDetail(){
    this.isShowError = false;
    (this.$refs.fileValidate as any).closeErrorDetail();
    this.modalTitle = "导入";
  } 

  /**
   * 执行导入
   * */ 
  doImport(){
    this.curStep = 2;
  }

  /**
   * 成功导入
   * */ 
  isImportSucceed:boolean = false;
  importSucceed(){
    this.isImportSucceed = true;
  }

  /**
   * 选择导入方式事件
   */
  onTypeItemClicked(type){
    this.importType = type;
  }

  /**
   * 返回导入方式选择界面
   */
  onTypeItemReturn(){
    this.importType = '';
    this.fileName = '';
    this.curStep = 0;
    this.appCodeForCheck = '';
    this.statusCode = '';
    this.dmCodeList = [];
    this.subCodeList = [];
    this.overrideForCheck = false;
    this.overrideForImport = false;
    this.isShowUpdateCode = false;
    this.isModelCodeList = false;
    this.isShowError = false;
    this.isCodeRepeat = true;
    this.coverImport = false;
    this.orignList = null;
  }
  
  /**
   * 监听步进控制组件显隐
   */
  isUpload = true;
  isValidate = false;
  isImport = false;
  @Watch('curStep', { immediate: true })
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


  @Watch('value')
  onValueChange(v: boolean){
    this.show = v;
  }

}
</script>
<style lang="less">
  .import-container {
  & .import-type-layout{
    margin: 50px 0;
    .type-item{
      position: relative;
      margin: 24px auto;
      border: 1px solid #D9D9D9;
      width: 280px;
      height: 95px;
      line-height: 95px;
      text-align: center;
      border-radius: 3px;
      cursor: pointer;
      span>i{
        display: inline-block;
        vertical-align: middle;
        margin-right: 10px;
        font-size: 22px;
      }
      .h-icon-all-arrow-right-o{
        display: none;
      }
    }
    .type-item:hover{
      border-color: #17BC94;
      color:#17BC94;
      .h-icon-all-arrow-right-o{
        display: inline-block;
        position: absolute;
        top: 0;
        right: 30px;
      }
    }
  }
  & .import-layout {
    min-height: 300px;
    position: relative;
    .import-type-exit{
      display: inline-block;
      margin-bottom: 10px;
      font-size: 16px;
      color: #000;
      cursor: pointer;
    }
    .import-type-exit:hover{
      color: #17BC94;
    }
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
</style>