<template>
  <div class="file-validate" v-if="isValidated">
    <!-- 文件校验通过 -->
    <div class="validate-box" v-if="!isShowUpdateCode">
      <div class="file-status">
        <template v-if="isFileOk">
          <i class="icon aufontAll h-icon-all-check-circle file-status-icon"></i>
          <span class="file-status-txt">{{ $t('languages.Apps.DocumentChecked') }}</span>
        </template>

        <!-- 文件错误，如非法文件等 -->
        <template v-else>
          <i class="icon aufontAll h-icon-all-close-circle file-status-icon error"></i>
          <span class="file-status-txt">{{ fileErrMsg }}</span>
        </template>
      </div>

      <template v-if="isFileOk && fileInvalid">
        <div class="file-check-status">
          <template v-if="isCodeRepeat && isShowErr">
            <template v-if="!isModelCodeList">
              <span>{{ coreRepeatErrMsg }}</span>

              <span v-if="codeRepeatObj.modelCodeRepeat && !codeRepeatObj.bothRepeat && !!modelPos" class="model-position">模型位置: {{ modelPos }}</span>

              <span v-if="codeRepeatObj.modelCodeRepeat && !codeRepeatObj.bothRepeat && !!subTableErr" class="model-position">{{ subTableErr }}</span>
            </template>
            <template v-else>
              <p class="isModelCodeList">1. 模型编码已存在<br>
                <span v-if="codeRepeatObj.modelCodeRepeat && !codeRepeatObj.bothRepeat && !!modelPos" class="model-position">模型位置: {{ modelPos }},请修改编码</span>
                <span v-if="codeRepeatObj.modelCodeRepeat && !codeRepeatObj.bothRepeat && !!subTableErr2" class="model-position">{{ subTableErr2 }}</span>
              </p>
              <br>
              <p>2. 修改编码再导入，将会生成新的业务模型。</p>
            </template>
          </template>

          <!-- 异常明细 -->
          <template v-else>
            <span>
              检测到应用有多条对象不存在，应用导入后请重新配置。
              <a
                href="javascript:;"
                class="link"
                @click="showErrorDetail"
              >查看明细</a>
            </span>
          </template>
        </div>
      </template>
    </div>

    <template v-if="isFileOk && isCodeRepeat && fileInvalid && !isShowUpdateCode">
      <div class="status-tip" v-if="!isModelCodeList">
        <p>1. 覆盖后，当前导入业务模型里的数据模型会替换掉现在系统中对应业务模型的数据模型、编码重复的表单和流程；</p>
        <p>2. 修改编码再导入，将会生成新的业务模型。</p>
      </div>
    </template>

    <div class="update-code-box" v-if="isShowUpdateCode">
      <updateCode
        :type="codeRepeatObj"
        :list="updateCodeDataList"
        ref="updateCode"
      />
    </div>

    <div class="update-code-box" v-if="isShowErrorDetail">
      <errorDetail :errDetails="errDetails" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { Icon, Input } from "@h3/antd-vue";

import updateCode from './update-code.vue'

import errorDetail from './error-detail.vue'

import AppsApi from '@/apis/apps';

@Component({
  name: "FileValidate",
  components: {
    AIcon: Icon,
    AInput: Input,
    updateCode,
    errorDetail
  }
})
export default class FileValidate extends Vue {
  @Prop() fileName !: string;

  @Prop() importType !: string;

  @Prop() dmCodeList !: any[];

  @Prop() subCodeList !: any[];

  @Prop() appCode !: string;

  @Prop({ default: false }) override !: boolean;

  @Prop() orignList !: any;



  get isCodeRepeat() {
    const { codeRepeatObj } = this;
    return codeRepeatObj.appCodeRepeat || codeRepeatObj.modelCodeRepeat || codeRepeatObj.recycleCodeRepeat;
  }

  // 文件是否正确
  isFileOk: boolean = false;

  // 文件错误
  fileErrMsg: string = '';

  // 是否校验完成
  isValidated: boolean = false;

  // 是否显示修改编码
  isShowUpdateCode: boolean = false;

  // 是否显示错误详情
  isShowErrorDetail: boolean = false;

  // 编码重复错误提示
  coreRepeatErrMsg: string = '';
  isModelCodeList: boolean = false;

  // 文件检验是否通过
  fileInvalid: boolean = false;

  // 模型位置
  modelPos:string = '';

  // 子表错误
  subTableErr: string = '';
  subTableErr2: string = '';

  // 需要更新的编码数据
  updateCodeDataList:any = {
    appCodeList: [],
    modelCodeList: [],
    subCodeList: []
  }

  repeatCodeEnum: any = {
    appCodeRepeat: "600021",
    modelCodeRepeat: "600027",
    recycleCodeRepeat: "600030"
  }

  // 编码重复
  codeRepeatObj: any = {
    appCodeRepeat: false,
    modelCodeRepeat: false,
    recycleCodeRepeat: false,
    bothRepeat: false
  }

  // 错误明细
  errDetails:any = {
    appManager: [],
    dataModel: {},
    formDesinge: [],
    workflow: []
  }

  isShowErr:boolean = true;

  mounted() {
    this.checkApp();
  }


  resetNewCode(){
    for (const key in this.updateCodeDataList) {
      if (Object.prototype.hasOwnProperty.call(this.updateCodeDataList, key)) {
        const element = this.updateCodeDataList[key];
        if(key === 'formModelMap'){
          for (const k in element) {
            if (Object.prototype.hasOwnProperty.call(element, k)) {
              const item = element[k];
              if(Array.isArray(item)){
                item.forEach(item => item.newCode = '');
              }
            }
          }
        }else{
          if(Array.isArray(element)){
            element.forEach(element => element.newCode = '');
          }
        }
        
      }
    }
  }

  /**
   * 校验文件
   * */
  async checkApp() {
    const { fileName, dmCodeList, appCode, override, subCodeList } = this;
    let fromAppMarket = this.importType==='MARKET' ? true : false;
    const params: Apps.AppItem.CheckAppParams = {
      appCode,
      fileName,
      override,
      dmCodeList,
      subCodeList,
      fromAppMarket
    }

    this.isShowUpdateCode = false;
    this.isShowErrorDetail = false;

    this.modelPos = '';
    this.subTableErr = '';
    this.subTableErr2 = '';

    this.isValidated = false;
    this.$emit('onChecking', true); // 校验中
    const res: any = await AppsApi.checkApp(params);
    this.isValidated = true;
    this.$emit('onChecking', false); // 校验结束

    const { errcode, data, errmsg } = res;

    

    if (errcode === 0) {
      // 先将错误分类： 编码重复错误 |  其他错误
      const { appMsgList, dmMsgList, formMsgModel, workflowMsgList, workflowList, formModelMap } = data;


      this.fileInvalid = (appMsgList || []).length > 0
                         || (dmMsgList || []).length > 0
                         || (formMsgModel || []).length > 0
                         || (workflowMsgList || []).length > 0;
      // 校验成功
      if (!this.fileInvalid) {
        this.isFileOk = true;
        this.$emit('checkEnd', { isCodeRepeat: false  });
        this.$emit('onFileFail', this.isFileOk);
        return {validSuccess: true};
      }

      const { repeatCodeEnum } = this;

      this.codeRepeatObj.appCodeRepeat = (appMsgList || []).some((item:any) => item.statusCode === repeatCodeEnum.appCodeRepeat);

      this.codeRepeatObj.recycleCodeRepeat = (appMsgList || []).some((item:any) => item.statusCode === repeatCodeEnum.recycleCodeRepeat);
      
      // 业务模型编码重复 1. 应用会校验  2. 数据模型会校验
      const repeatFormAppChcek:boolean = (appMsgList || []).some((item:any) => item.statusCode === repeatCodeEnum.modelCodeRepeat)
      const repeatFormDmChcek:boolean = (dmMsgList || []).some((item:any) => item.statusCode === "601001");
      this.codeRepeatObj.modelCodeRepeat = repeatFormAppChcek || repeatFormDmChcek;        
      this.codeRepeatObj.bothRepeat = this.codeRepeatObj.appCodeRepeat && this.codeRepeatObj.modelCodeRepeat;


      // 通知当前是否存在编码重复
      this.$emit('checkEnd', { isCodeRepeat: this.isCodeRepeat  })

      // 应用或编码重复
      const { appCodeRepeat, modelCodeRepeat, recycleCodeRepeat, bothRepeat } = this.codeRepeatObj;
      if (appCodeRepeat || modelCodeRepeat || recycleCodeRepeat) {
        if (recycleCodeRepeat) {
          this.coreRepeatErrMsg = `应用编码：${appMsgList[0].appCode}已存在回收站，是否修改编码？`
          this.$emit('statusCode', appMsgList[0].statusCode);
        } else if (appCodeRepeat && !modelCodeRepeat) {
          this.coreRepeatErrMsg = `应用编码：${appMsgList[0].appCode}已存在，是否覆盖已存在的应用编码？`
        } else if (!appCodeRepeat && modelCodeRepeat) { // 仅仅业务模型重复, 展示模型位置
          this.coreRepeatErrMsg = `是否覆盖已存在的模型？`;
          const modelPosArr:any = appMsgList
                                    .map((item:any) => {
                                      if (item.statusCode === repeatCodeEnum.modelCodeRepeat) {
                                        return item.errMsg;
                                      }
                                    })
                                    .filter((item:any) => !!item);
          this.modelPos = modelPosArr.join(';')

          // 子表错误整理
          let subErr:any = [];
          // 找出字表错误的项
          const subErrItem:any = (dmMsgList || []).find((item:any) => item.statusCode === "601001");
          if (subErrItem) {
            subErr = (subErrItem.data || []).map((item:any) => {
              return item.schemaName;
            })
          }
          this.subTableErr = subErr.length ? `${subErr.join('，')}的子表编码与系统中已经存在的模型编码重复，是否要覆盖模型编码？` : '';
          this.subTableErr2 = subErr.length ? `${subErr.join('，')}的子表编码与系统中已经存在的模型编码重复，请修改子表编码` : '';
          // 仅仅业务模型重复, 展示模型位置
          this.isModelCodeList = this.getModelCodeList(appMsgList).length ? true : false;
          this.$emit('modelCodeList', this.isModelCodeList);
        } else {
          this.coreRepeatErrMsg = '应用编码跟业务模型编码已存在，是否要覆盖应用编码？';
        }

        // 组合应用编码重复的数组
        this.updateCodeDataList.appCodeList = this.getAppCodeList(appMsgList);
        // 组合业务模型重复的编码
        this.updateCodeDataList.modelCodeList = this.getModelCodeList(appMsgList);
        // 组合子表重复的编码
        this.updateCodeDataList.subCodeList = this.getSubCodeList(dmMsgList);

        this.updateCodeDataList.workflowList = this.getWorkflowList(this.orignList ? this.orignList.workflowList : workflowList) 
        this.updateCodeDataList.formModelMap = this.getFormModelMap(this.orignList ? this.orignList.formModelMap : formModelMap)

      }
      // 其他情况, 展示明细
        
      this.errDetails.appManager = this.appErrorsHandler(appMsgList);
      
      this.errDetails.dataModel = this.dmErrorsHandler(dmMsgList);

      this.errDetails.formDesinge = this.formErrorsHandler(formMsgModel);

      this.errDetails.workflow = this.workflowErrorsHandler(workflowMsgList); 
      

      this.isFileOk = true;
      this.$emit('onFileFail', this.isFileOk);
      return {isCodeRepeat: this.isCodeRepeat};
    } else if(errcode === 600028){
      return {errcode, errmsg};
    } else {
      this.isFileOk = false;
      this.fileErrMsg = errmsg || '';
      this.$emit('onFileFail', this.isFileOk);
    }
  }

  /***************** 错误数据处理 start*******************/ 
  
  /**
   * 应用权限错误
   * */ 
  appErrorsHandler(list:any) {
    if (!list) list = [];
    const authCodes:string[] = ["200013", "202018"];
    const data:any [] = list.map((item:any) => {
      if (authCodes.includes(item.statusCode)) {
        return item.errMsg;
      } 
    }).filter((i:any) => !!i);
    return data;
  }

  /**
   * 数据模型错误
   * */ 
  dmErrorsHandler(list:any) {   
    if (!list) list = [];
    let data:any = {};

    // 业务模型编码冲突
    // const conflictSCItem:any = list.find((i:any) => i.statusCode === "601001");
    // let conflictCodesErrs: any[] = [];
    // if (conflictSCItem) {
    //   conflictCodesErrs = conflictSCItem.data.map((i:any) => {
    //     const { i } 
    //   })
    // }

    // 关联表单绑定的业务模型在当前系统中没有找到时 301017
    const bizModelNotExistItem:any = list.find((i:any) => i.statusCode === "301017");
    
    let bizModelNotExistErrs: any[] = [];

    if (bizModelNotExistItem) {
      bizModelNotExistErrs = bizModelNotExistItem.data.map((item:any) => {
        const { schemaName, propertyName } = item;
        return `【${schemaName}】的关联表单-【${propertyName}】绑定的业务模型不存在，应用导入后请重新配置`;
      })
    }

    // 业务规则错误 550014
    let bizRuleAllErrs = [];
    const bizRuleErrItem = list.find((i:any) => i.statusCode === "550014");
    if (bizRuleErrItem)  {
      // 目标模型在当前系统中不存在 301017
      const targetModelNotExistItem:any = bizRuleErrItem.data.filter((i:any) => i.statusCode === "301017");
      if (targetModelNotExistItem) {
        const err:any = targetModelNotExistItem.map((i:any) => {
          const { schemaName, businessRuleName, nodeName  } = i;
          return `【${schemaName}】中的业务规则-【${businessRuleName}】中的节点-【${nodeName}】中使用的目标模型不存在，应用导入后请重新配置`
        })
        bizRuleAllErrs = bizRuleAllErrs.concat(err);
      }

      // 绑定的业务服务在当前系统中不存在时 500111
      const bizService:any = bizRuleErrItem.data.filter((i:any) => i.statusCode === "301017");
      if (bizService) {
        const err:any = bizService.map((i:any) => {
          const { schemaName, businessRuleName, nodeName  } = i;
          return `【${schemaName}】中的业务规则【${businessRuleName}】中的节点-【${nodeName}】中使用的业务服务不存在，应用导入后请重新配置`
        })
        bizRuleAllErrs = bizRuleAllErrs.concat(err);
      }

      // 业务方法或GetList节点 500106
      const bizMethodsOrGetList:any = bizRuleErrItem.data.filter((i:any) => i.statusCode === "500106");
      if (bizMethodsOrGetList) {
        const err:any = bizMethodsOrGetList.map((i:any) => {
          const { schemaName, businessRuleName  } = i;
          return `【${schemaName}】中的业务规则-【${businessRuleName}】中的数据源中使用的业务服务不存在，应用导入后请重新配置`
        })
        bizRuleAllErrs = bizRuleAllErrs.concat(err);
      }

      // 绑定部门组织或角色不存在时 201009 todo
      const deptsOrRolesBotExist:any = bizRuleErrItem.data.filter((i:any) => i.statusCode === "201009");
      if (deptsOrRolesBotExist) {
        const err:any = deptsOrRolesBotExist.map((i:any) => {
          const { schemaName, businessRuleName  } = i;
          return `【${schemaName}】中的业务规则-【${businessRuleName}】中的数据源中使用的业务服务不存在，应用导入后请重新配置`
        })
        bizRuleAllErrs = bizRuleAllErrs.concat(err);
      }

    }

    // 数据权限错误
    let dataPermissionErrs = [];
    // 部门 200010
    let deptsErr:any = [];
    const errDeptItem = list.find((i:any) => i.statusCode === "200010");
    if (errDeptItem) {
     deptsErr =  errDeptItem.data.map((i:any) => {
       const { schemaName, permGroupName } = i;
       return `系统检测到【${ schemaName }】的数据权限-【${ permGroupName }】中使用的组织机构在当前系统的组织机构中不存在，应用导入后请重新配置数据权限中的授权组织`
     })
    }
    dataPermissionErrs = dataPermissionErrs.concat(deptsErr);


    // 角色 202006
    let rolesErr:any = [];
    const errRoleItem = list.find((i:any) => i.statusCode === "202006");
    if (errDeptItem) {
     deptsErr =  errDeptItem.data.map((i:any) => {
       const { schemaName, permGroupName } = i;
       return `系统检测到【${ schemaName }】的数据权限-【${ permGroupName }】中使用的角色在当前系统的角色中不存在，应用导入后请重新配置数据权限中的授权角色`;
     })
    }
    dataPermissionErrs = dataPermissionErrs.concat(deptsErr);


    // 组合数据
    data = {
      dataModelErr: bizModelNotExistErrs,
      bizRuleErr: bizRuleAllErrs,
      dataPermErr: dataPermissionErrs
    }

    return data;
  }

  /**
   * 表单错误 
   * */ 
  formErrorsHandler(list:any) {
     if (!list) list = [];
      const fromCodes:string[] = ["200010"];
      const data:any [] = list.map((item:any) => {
        if (fromCodes.includes(item.statusCode)) {
          const { schemaName,propertyName  } = item;
          return `【${schemaName}】的数据项-【${propertyName}】配置的根节点在当前系统中不存在，应用导入后请重新配置`;
        } 
      }).filter((i:any) => !!i);
      return data;
  }

  /**
   * 流程错误
   * */ 
  workflowErrorsHandler(list:any) {
    if (!list) list = [];
    const data:any [] = list.map((item:any) => item.errMsg);
    return data;
  }

  /***************** 错误数据处理 end*******************/ 

  // 是否展示修改编码
  showUpdateCode() {
    this.isShowUpdateCode = true;
  }

  // 关闭修改编码
  closeUpdateCode() {
    this.resetNewCode()
    this.isShowUpdateCode = false;
  }

  

  // 展示错误明细
  showErrorDetail(){
    this.isShowErrorDetail = true;
    this.$emit('showError')
  }

  // 关闭错误明细
  closeErrorDetail(){
    this.isShowErrorDetail = false;
  }

  /**
   * 获取修改后的编码list
   * */ 
  getCodeList(){
    return (this.$refs.updateCode as any).getCodeList();
  }

  /**
   * 获取应用编码列表
   * */ 
  getAppCodeList(list:any[]){
    const { repeatCodeEnum } = this;
    return list.map((item:any) => {
        if (item.statusCode === repeatCodeEnum.appCodeRepeat || item.statusCode === repeatCodeEnum.recycleCodeRepeat) {
          const { appName, appCode } = item;
          return {
            appName,
            appCode,
            newCode: ''
          }
        }
      }).filter((i:any) => !!i);
  }

  /**
   * 获取模型编码列表
   * @params list 应用校验中的数据
   * @params dmList 数据模型校验中的数据
   * */ 
  getModelCodeList(list:any[]) {
    const { repeatCodeEnum } = this;
    const data:any [] = [];
    const d1 = list.map((item:any) => {
        if (item.statusCode === repeatCodeEnum.modelCodeRepeat) {
          const { modelName, modelCode } = item;
          return {
            modelName,
            modelCode,
            newCode: ''
          }
        }
      }).filter((i:any) => !!i);

    return data.concat(d1);
  }

  // 获取流程列表
  getWorkflowList(workflowList){
    if(!Array.isArray(workflowList)){
      return []
    }
    workflowList.forEach((el: any) => {
      el.newCode = el.newCode || ''
    });
    return workflowList
  }

  // 获取表单列表
  getFormModelMap(getFormModelMap){
    
    Object.keys(getFormModelMap).forEach((el:any) => {
      let item = getFormModelMap[el]
      item.forEach((element:any) => {
        element.newCode = element.newCode || ''
      });
    })
    return getFormModelMap
  }
  /**
   * 获取子表编码列表
   * */ 
  getSubCodeList(list:any[]){
    if (!list) list = [];
    // 子表重复
    const item:any = list.find((i:any) => i.statusCode === "601001");
    let d2:any = [];
    if (item) {
      d2 = item.data.map((d:any) => {
        return {
          modelName: d.schemaName,
          modelCode: d.schemaCode,
          newCode: '',
          parentSchemaName: d.parentSchemaName,
          parentSchemaCode: d.parentSchemaCode
        } 
      })
    }
    return d2;
  }
}
</script>

<style lang="less">
.file-validate {
  width: 90%;
  margin: 0 auto;
  .validate-box {
    .file-status {
      &.repeat {
        display: block;
        height: auto;
        .file-status-txt {
          font-size: 14px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0);
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
      height: 24px;
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
        display: block;
        height: 24px;
        line-height: 24px;
        font-weight: bold;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.65);
        margin-left: 8px;
        word-break: break-all;
      }
    }

    .file-check-status {    
      margin: 12px 0;
      padding-left: 30px;
      color: rgba(0, 0, 0, 0.45);
      & .model-position {
        color: #17bc94;
        padding-top: 8px;
        display: block;
      }
      .link {
        color: #17bc94;
      }
      .isModelCodeList {
        .model-position {
          padding-left: 15px;
        }
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
          & p.error-txt {
            color: #f5222d;
            text-indent: 120px;
          }
        }
      }
    }
  }
  .status-tip {
    margin-left: 30px;
    padding: 15px;
    background: #FFFBE6;
    border-radius: 4px;
    border: 1px solid #FFE58F;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    line-height: 22px;
  }
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

.update-code-box {
  // position: absolute;
  top: 0;
  left: -1px;
  background: white;
  width: 100%;
  height: 100%;
}
</style>
