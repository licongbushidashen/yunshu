<template>
  <a-modal
    v-model="showModal"
    class="start-workflow"
    title="发起流程"
    :width="552"
    :maskClosable="false"
    :keyboard="false"
    @cancel="cancel"
  >
    <!-- 填写预设人 -->
    <template v-if="type !== 'presetData'">
      <h3 class="step-header">第一步：填写预设人</h3>
      <a-row class="row-flex" type="flex">
        <a-col class="required" :span="4">发起人预设</a-col>
        <a-col :span="20">
          <StaffSelector
            class="select-wrap"
            :class="{'err': errOr}"
            @change="hideErr(0)"
            v-model="params.originator"
            :options="originatorOpts"
          />
        </a-col>
      </a-row>
      <a-row class="row-flex" type="flex">
        <a-col class="required" :span="4">发起人部门</a-col>
        <a-col :span="20">
          <a-select
            placeholder="请选择"
            v-model="params.originatorDept"
            class="select-wrap"
            :class="{'err': errOrdpt}"
            @change="hideErr(1)"
          >
            <a-select-option
              v-for="(dept,index) in depts"
              :key="index"
              :value="dept.deptId"
              :title="dept.deptName"
            >{{ dept.deptName }}</a-select-option>
          </a-select>
        </a-col>
      </a-row>
      <a-row class="row-flex" type="flex">
        <a-col :span="4">运行方式</a-col>
        <a-col :span="20">
          <a-radio-group 
            class="radio-wrap"
            v-model="params.runMode"
          >
            <a-radio class="radio-item" value="1">手动运行</a-radio>
            <a-radio class="radio-item" value="0">自动运行</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>
      <div class="header-tips">注：支持流程基础功能运行，暂不支持消息通知、事件、超时、表单校验、关联表单</div>
    </template>

    <!-- 数据项预设 -->
    <template v-else>
      <h3 class="step-header">第二步：数据项预设</h3>
      <div class="scroll-wrap" v-if="dataItem.length">
        <a-row
          :key="idx"
          v-for="(item,idx) in dataItem"
          class="row-flex pre-data"
          type="flex"
        >
          <a-col class="row-items" :title="item.name" :span="5">{{ item.name }}</a-col>
          <a-col class="row-cols" :span="19">
            <!-- 日期控件 -->
            <a-date-picker
              class="select-wrap"
              v-if="item.propertyType === 3"
              v-model="item.value"
              :showTime="true"
              format="YYYY-MM-DD HH:mm:ss"
            />
            <!-- 逻辑控件 -->
            <a-select
              class="select-wrap"
              v-else-if="item.propertyType === 4"
              v-model="item.value"
              :getPopupContainer="getPopupContainer"
            >
              <a-select-option value="true">true</a-select-option>
              <a-select-option value="false">false</a-select-option>
            </a-select>

            <!-- 选人控件 -->
            <StaffSelector
              class="select-wrap"
              v-else-if="item.propertyType ===5 ||
               item.propertyType === 50 ||
              item.propertyType === 51 ||
              item.propertyType === 60 ||
              item.propertyType === 61"
              v-model="item.value"
              :onlyForm="true"
              :options="getStaffSelectorOpts(item.propertyType)"
            />

            <!-- 输入框 -->
            <a-input v-else class="select-wrap" v-model="item.value"></a-input>

          </a-col>
        </a-row>
      </div>
      <div v-else class="empty">暂无数据项</div>
    </template>

    <template slot="footer">
      <div class="start-workflow__link" @click="goHistoryRunning">无需发起流程，点此可查看历史运行流程</div>
      <a-button key="cancel" @click="cancel">取消</a-button>
      <a-button
        v-if="type === 'presetPerson'"
        key="next"
        type="primary"
        @click="nextStep"
      >下一步</a-button>
      <a-button
        v-if="type === 'presetData'"
        key="back"
        @click="back"
      >上一步</a-button>
      <a-button
        v-if="type === 'presetData'"
        key="run"
        type="primary"
        @click="run"
      >运行</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { State, namespace } from "vuex-class";
import * as OrganizationApi from "@/apis/organization";
import formPc from '@cloudpivot/form/src/renderer/components/pc';
import { formApi } from "@cloudpivot/api";
import moment from 'moment';
import { DataItemType } from "@cloudpivot/form/schema";

const UserModule = namespace("System/User");
const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: "start-workflow",
  components: {
    StaffSelector: formPc.StaffSelector,
  }
})

export default class StartWorkflow extends Vue {
  @UserModule.State("loginedUserInfo") userInfo!: any;

  @UserModule.State("isJustAdmin") isJustAdmin!: any;

  @WorkflowModule.State('WorkflowDataItem') WorkflowDataItem:any;

  @Prop() value!: boolean;

  @Prop() rules!: any;

  @Prop() activities!: any;

  showModal: boolean = false;

  type:string = 'presetPerson'; // presetPerson: 预设发起人; presetData: 数据项预设

  errOr:boolean = false;

  errOrdpt:boolean = false;

  oldUserId:string = ''; // 暂存历史发起人ID

  params:any = {
    originator: [],
    originatorDept: '',
    runMode: '1', // 运行模式 0：自动运行  1：手动运行
  };

  replayToken:any = '';

  dataItem:any = [];

  depts:any = [];

  originatorOpts:any = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择'
  }

  staffSelectorOpts:any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择'
  }

  getPopupContainer(triggerNode:any) {
    return triggerNode.parentNode;
  }


  
  getStaffSelectorOpts(cond) {
    const obj = {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: "请选择",
    }
    switch (cond) {
      case DataItemType.StaffSingle:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = false;
        break;
      case DataItemType.StaffMulti:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = true;
        break;
      case DataItemType.DeptSingle:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = false;
        break;
      case DataItemType.DeptMulti:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = true;
        break;
      case DataItemType.StaffDeptMix:
        obj.selectOrg = true;
        obj.selectUser = true;
        obj.mulpitle = true;
        break;
    }
    return obj;
  }


  ruleFormat() {
    debugger;
    const itemArr:any = [];
    // 路由条件处理
    console.log('rules',this.rules);
    
    this.dataFormat(this.rules, 'formula', itemArr);
    // 活动节点参与者处理

    console.log('activities',this.activities);
    
    this.dataFormat(this.activities, 'participant', itemArr);
    this.dataItem = itemArr;
  }

  dataFormat(data:any, formula:string, itemArr:any) {
    data.forEach((d:any) => {
      if (!d[formula]) return;
      const arr = d[formula].match(/(?<=\{).*?(?=\})/g);
      if (arr && arr.length && Array.isArray(arr)) {
        arr.forEach((a:any) => {
          const itemRepeat = itemArr.find((t:any) => t.code === a);
          if (itemRepeat) {
            return;
          }
          let code = a;
          let cCode = '';
          // 子表数据项
          if (a.indexOf('.') > -1) {
            code = a.split('.')[0] as string;
            cCode = a.split('.')[1] as string;
          }
          const item = this.WorkflowDataItem.find((w:any) => w.code === code);
          
          if (item && cCode && item.subSchema && Array.isArray(item.subSchema.properties)) {
            const cItem = item.subSchema.properties.find((c:any) => c.code === cCode);
            if (!cItem) {
              return;
            }
            itemArr.push({
              code: a,
              name: `${item.name}.${cItem.name}`,
              propertyType: cItem.propertyType,
              value: null
            });
          } else if (item && !cCode) {
            itemArr.push({
              code: item.code,
              name: item.name,
              propertyType: item.propertyType,
              value: null
            });
          }
        });
      }
    });
  }

  async getDepartmentList(id:string) {
    const params = {
      id,
      filterType: "admin",
    };
    this.oldUserId = id;
    const res = await OrganizationApi.getDepartmentList(params);
    if (res.errcode === 0 && Array.isArray(res.data)) {
      if(!this.params.originatorDept) this.params.originatorDept = res.data[0].deptId || '';
      this.depts = res.data;
    }
  }

  hideErr(errOrign:number) {
    // 0: 发起人， 1： 发起人部门
    if (errOrign === 1 && this.params.originatorDept) {
      this.errOrdpt = false;
    } else if (errOrign === 0) {
      // 发起人change
      if (!this.params.originator || !this.params.originator.length) {
        this.depts = [];
        this.params.originatorDept = '';
        this.oldUserId = '';
      } else if (this.oldUserId !== this.params.originator[0].id) {
        this.params.originatorDept = '';
        this.getDepartmentList(this.params.originator[0].id);
        this.errOr = false;
      }
    }
  }

  /* 
  * 查看历史运行流程
  */
  goHistoryRunning() {
    if (this.$route.query.workflowMock) {
      this.cancel();
    } else {
      this.$router.push({
        name: 'mockHistory',
        params: {
          appCode: this.$route.params.appCode,
          bizSchemaCode: this.$route.params.bizSchemaCode,
          workflowCode: this.$route.params.workflowCode
        },
        query: {
          workflowMock: 'true',
        }
      }).catch((err: any) => {err});
    }
    
  }

  /* 
  * 查看流程详情页面
  */
  goFormDetail(data:any) {
    const { href } = this.$router.resolve({
      name: 'mockDetail',
      params: {
        appCode: this.$route.params.appCode,
        bizSchemaCode: this.$route.params.bizSchemaCode,
        workflowCode: this.$route.params.workflowCode
      },
      query: {
        workflowInstanceId: data.workflowInstanceId,
        workflowMock: 'true',
        firstPage: 'true',
      }
    });
    window.open(href, '_blank');
  }

  nextStep() {
    // 必填校验
    const originatorValid = !this.params.originator || !this.params.originator.length;
    const originatorDeptValid = !this.params.originatorDept;
    this.errOr = originatorValid;
    this.errOrdpt = originatorDeptValid;
    if (originatorValid || originatorDeptValid) {
      this.$message.error('请完善预设人信息！');
      return;
    }

    if (this.params.runMode === '0') {
      if (!this.dataItem || !this.dataItem.length) {
        this.getReplayToken(true);
        return;
      }
      this.getReplayToken();
      this.type = 'presetData';
    } else {
      const { appCode, bizSchemaCode, workflowCode } = this.$route.params;
      const { href } = this.$router.resolve({
        name: 'mockForm',
        params: {
          appCode,
          bizSchemaCode,
          workflowCode
        },
        query: {
          startWorkflowCode: workflowCode,
          workflowMock: 'true',
          firstPage: 'true',
        }
      });
      window.sessionStorage.setItem(`${workflowCode}-mock`, JSON.stringify(this.params));
      window.open(href, '_blank');
      this.cancel();
    }
  }

  // 自动模式下运行
  run() {
    let data:any = {
      agree: 'true',
      actionCode: 'submit',
      depatmentId: this.params.originatorDept,
      formType: '1',
      replayToken: this.replayToken,
      workflowCode: this.$route.params.workflowCode,
      simulative: true,
      runMode: '0'
    };
    console.log(this.$route,'this.$route',this.rules);
    let formCode = '';
    let activityCode = '';
    this.rules.forEach((i:any) => {
      if(i.startActivity && i.startActivity.activityCode === 'Activity1'){
        activityCode = i.endActivity && i.endActivity.activityCode
      }
      // 模拟历史运行流程 返回的rules数据解构不一样
      if(!activityCode && i.preActivityCode && i.preActivityCode === 'Activity1') {
        activityCode = i.postActivityCode;
      }
    })
    this.activities.forEach(i => {
      if(i.activityCode === activityCode){
        formCode = i.sheetCode;
      }
    })

    data.bizObject = {
      schemaCode: this.$route.params.bizSchemaCode,
      data: this.buildSubmitParam(),
      sheetCode:formCode
    }
    console.log(data);
    formApi.submit(data).then((res:any) => {
      if (res.errcode === 0) {
        // 运行成功
        this.goFormDetail(res.data);
        this.cancel();
      } else if (res.errcode === 100005) {
        this.$message.error('请勿频繁重复提交!');
      } else {
        this.$message.error('自动运行失败!');
      }
    });
  }

  buildSubmitParam() {
    const _result:any = {};
    this.dataItem.forEach((d:any) => {
      let val:any = d.value;
      if (d.propertyType === 3 && d.value) {
        // 日期数据格式化
        val = moment(d.value).format('YYYY-MM-DD HH:mm:ss');
      } else if (d.propertyType === 5 && Array.isArray(d.value)) {
        // 选人控件数据格式化
        val = d.value.map((v:any) => {
          return {
            id: v.id,
            type: v.type
          }
        });
      } 
      if (d.code.indexOf('.') > -1) {
        // 子表数据项处理
        const pCode = d.code.split('.')[0] as string;
        const cCode = d.code.split('.')[1] as string;
        _result[pCode] = _result[pCode] ? _result[pCode]: [{}];
        _result[pCode][0][cCode] = val;
      } else {
        _result[d.code] = val;
      }
    });
    if (this.params.originator && this.params.originator.length) {
      _result['owner'] = [{ id: this.params.originator[0].id, type: 3 }];
    }
    return _result;
  }

  getReplayToken(run?:boolean) {
    formApi.getReplayToken().then(res => {
      if (res.errcode === 0 && res.data) {
        this.replayToken = res.data;
        if (run) {
          this.run();
        }
      } else {
        console.error("getReplayToken 接口请求失败!");
      }
    });
  }

  back() {
    this.type = 'presetPerson';
  }

  cancel() {
    this.resetParams();
    this.$emit('input', false);
  }

  resetParams() {
    this.type = 'presetPerson';
    this.errOr = false;
    this.errOrdpt = false;
    this.oldUserId = '';
    this.replayToken = '';
    this.depts = [];
    this.params = {
      originator: [],
      originatorDept: '',
      runMode: '1',
    };
  }

  @Watch('value')
  onValueChange(v: boolean) {
    if (v) {
      this.ruleFormat();
    }
    if (v && !this.isJustAdmin && this.userInfo.name !== 'admin') {
      this.params.originator = [{
        id: this.userInfo.id,
        name: this.userInfo.name,
        type: 3
      }];
      this.params.originatorDept = this.userInfo.departmentId;
      this.getDepartmentList(this.userInfo.id);
    }
    this.showModal = v;
  }

}
</script>

<style lang="less" scoped>
.start-workflow{
  .header-tips{
    color: rgba(0,0,0,0.45);
    font-size: 12px;
    margin-bottom: 40px;
    line-height: 22px;
  }
  .step-header{
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color:rgba(0,0,0,0.85);
  }
  .radio-wrap{
    .radio-item{
      margin-right: 24px;
    }
  }
  &__link{
    color: @primary-color;
    cursor: pointer;
    font-size: 14px;
    position: absolute;
    bottom: 15px;
    left: 24px;
  }
}
.row-flex{
  margin-bottom: 20px;
  align-items: center;
  /deep/.ant-col-20{
    padding-left: 8px;
  }
  .select-wrap{
    width: 100% !important;
  }
  .err{
    /deep/.h3-organization__label{
      border: 1px solid #e0b4b4;
      border-radius: 4px;
      background-color: #fff6f6;
      &:focus{
        box-shadow: none;
      }
    }
    /deep/.ant-select-selection{
      border: 1px solid #e0b4b4;
      border-radius: 4px;
      background-color: #fff6f6;
      &:focus{
        box-shadow: none;
      }
    }
  }
  .required {
    position: relative;
    &:before {
      content: "*";
      color: @error-color;
      position: absolute;
      left: -0.5em;
    }
  }
}
.pre-data{
  align-items: center;
  .row-items{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.scroll-wrap{
  height: 208px;
  overflow-y: auto;
  /deep/.ant-col-5{
    padding-right: 5px;
  }
  /deep/.ant-col-19{
    padding-left: 3px;
  }
}
.empty{
  height: 208px;
  line-height: 208px;
  text-align: center;
  color: rgba(0,0,0,0.45);
}
</style>