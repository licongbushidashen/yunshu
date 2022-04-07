<template>
  <a-drawer
    :title="drawerTitle"
    :closable="true"
    :mask="true"
    :width="640"
    wrapClassName="delegation-drawer"
    :visible="isShow"
    @close="onClose"
  >
    <div class="delegation-box">
        <!-- 委托人 -->
        <a-row class="row">
          <a-col :span="leftWidth">{{ $t('cloudpivot.flowCenter.pc.delegation.client') }}</a-col>
          <a-col :span="rightWidth">
            <label v-if="!admin || type === 1">{{ clientName }}</label>
            <StaffSelector
              v-else
              class="select-wrap"
              v-model="delegationData.client"
              :options="staffSelectorOpts"
              @change="clearWorkflow"
              :params="params"
            />
          </a-col>
        </a-row>

        <!-- 被委托人 -->
        <a-row class="row">
          <a-col :span="leftWidth">{{ $t('cloudpivot.flowCenter.pc.delegation.consignor') }}</a-col>
          <a-col :span="rightWidth">
            <StaffSelector
              class="select-wrap"
              v-model="delegationData.consignor"
              :options="staffSelectorOpts"
              :params="params"
            />
          </a-col>
        </a-row>

        <!-- 委托类型 -->
        <a-row class="row">
          <a-col :span="leftWidth">{{ $t('cloudpivot.flowCenter.pc.delegation.delegateType') }}</a-col>
          <a-col :span="rightWidth">
            <a-select
              class="select-wrap"
              v-model="delegationData.delegateType"
              @change="clearWorkflow"
            >
              <a-select-option value="0">{{ $t('cloudpivot.flowCenter.pc.delegation.workflowApproval') }}</a-select-option>
              <a-select-option value="1">{{ $t('cloudpivot.flowCenter.pc.delegation.startWorkflow') }}</a-select-option>
            </a-select>
          </a-col>
        </a-row>

        <!-- 委托期限 -->
        <a-row class="row">
          <a-col :span="leftWidth">{{ $t('cloudpivot.flowCenter.pc.delegation.entrustedPeriod') }}</a-col>
          <a-col :span="rightWidth" v-if="isShow">
            <a-range-picker
              class="select-wrap"
              :disabledDate="disabledDate"
              v-model="delegationData.entrustedPeriod"
              :showTime="{
                hideDisabledOptions: true,
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
              }"
              format="YYYY-MM-DD HH:mm:ss"
            />
          </a-col>
        </a-row>

        <!-- 流程范围 -->
        <a-row class="row">
          <a-col :span="leftWidth">{{ $t('cloudpivot.flowCenter.pc.delegation.workflowScope') }}</a-col>
          <a-col :span="rightWidth">
            <a-radio-group 
              class="radio-wrap"
              v-model="delegationData.workflowScope"
            >
              <a-radio value="0">{{ $t('cloudpivot.flowCenter.pc.delegation.wholeProcess') }}</a-radio>
              <a-radio value="1">{{ $t('cloudpivot.flowCenter.pc.delegation.partProcess') }}</a-radio>
            </a-radio-group>
            <WorkflowTree 
              v-if="delegationData.workflowScope === '1'"
              v-model="delegationData.workflowTrusts"
              :multiple="true"
              :labelInValue="true"
              :userId="curUserId"
              :trustType="trustType"
              @input="clearWorkflow2"
              class="workflow-select" 
            />
          </a-col>
        </a-row>

        <div class="footer">
          <a-button class="btn" @click="onClose">{{ $t('cloudpivot.flowCenter.pc.cancel') }}</a-button>
          <a-button class="btn" type="primary" @click="submit">{{ $t('cloudpivot.flowCenter.pc.ok') }}</a-button>
        </div>
    </div>
  </a-drawer>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import {
  State, namespace
} from 'vuex-class';
import {
  Drawer, Button, Row, Col, Select, DatePicker, Radio
} from '@h3/antd-vue';
import moment from 'moment';
import formPc from '@cloudpivot/form/src/renderer/components/pc';
import WorkflowTree from './query-condition/tree.vue';
import { workflowCenterApi, workflow }  from '@cloudpivot/api';

@Component({
  name: 'DelegationDrawer',
  components: {
    ADrawer: Drawer,
    AButton: Button,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARangePicker: DatePicker.RangePicker,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    StaffSelector: formPc.StaffSelector,
    WorkflowTree
  }
})
export default class DelegationDrawer extends Vue {
  @Prop() value !: any;

  @Prop() type !: number; // 0：新增，1：编辑

  @Prop() drawerId!: string;

  get admin(){
    return this.$store.state.System.System.admin; // 引入系统store的字段
  }

  get userData(){
    return this.$store.state.WorkflowCenter.WorkflowCenter.userData; // 引入系统store的字段
  }

  get clientName() {
    return this.delegationData.client[0] ? this.delegationData.client[0].name : '';
  }

  get curUserId() {
    return this.delegationData.client[0] ? this.delegationData.client[0].id : ''; // 委托人ID
  }

  get trustType() {
    return this.delegationData.delegateType === '1' ? 'START' : 'APPROVAL'; // 委托人ID
  }

  // 显示控制
  isShow: boolean = false;

  drawerTitle: string = '新建委托';

  leftWidth:number = 4;

  rightWidth:number = 20;

  delegationData:any = {
    workflowScope: '0',
    delegateType: '0',
    client: [],
    consignor: [],
    entrustedPeriod: null,
    workflowTrusts: []
  };

  params:any = {
    corpId: ''
  };

  staffSelectorOpts:any = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择'
  }

  disabledDate(current) {
    return current < moment().startOf('day');
  }
  
  moment() {
    moment();
  }

  mounted() {
    this.placeHolderLang();
  }

  /* 
  * 提交数据
  */
  submit() {
    let flag = false;
    if (!this.delegationData.client || !this.delegationData.client[0]) {
      flag = true;
    }

    if (!this.delegationData.consignor || !this.delegationData.consignor[0]) {
      flag = true;
    }

    if (!this.delegationData.entrustedPeriod || this.delegationData.entrustedPeriod.length < 2) {
      flag = true;
    }

    if (this.delegationData.workflowScope === '1' && (!this.delegationData.workflowTrusts || !this.delegationData.workflowTrusts.length)) {
      flag = true;
    }

    if (flag) {
      this.$message.warning(`${this.$t('cloudpivot.flowCenter.pc.delegation.createDelegationTips1')}`); 
      return;
    }
    const params:any = {
      trustor: this.delegationData.client[0].id,
      trustorName: this.delegationData.client[0].name,
      trustee: this.delegationData.consignor[0].id,
      trusteeName: this.delegationData.consignor[0].name,
      trustType: this.delegationData.delegateType,
      rangeType: this.delegationData.workflowScope,
    };
    if (this.delegationData.workflowScope === '1' && this.delegationData.workflowTrusts) {
      params.workflowTrusts = this.delegationData.workflowTrusts.map((wl:any) => {
        return {
          workflowCode: wl.value.replace('workflow-', ''),
        }
      });
    }
    const paramsTime = this.delegationData.entrustedPeriod;
    if (paramsTime.length) {
      params.startTime = moment(paramsTime[0]).format('YYYY-MM-DD HH:mm:ss');
      params.endTime = moment(paramsTime[1]).format('YYYY-MM-DD HH:mm:ss');
    }
    if (this.type === 1) {
      // 编辑委托
       params.id = this.delegationData.id;
       workflowCenterApi.updateWorkflowTrust(params).then((res:any) => {
        if (res.errcode) {
          this.$message.error(res.errmsg);
          return;
        }

        this.$message.success(`${this.$t('cloudpivot.flowCenter.pc.delegation.createDelegationTips2')}`);
        this.$emit('reloadList');
        this.onClose();
      });
    } else {
      // 新建委托
      workflowCenterApi.createWorkflowTrust(params).then((res:any) => {
        if (res.errcode === 404001) {
          this.$message.error(`${this.$t('cloudpivot.flowCenter.pc.delegation.createDelegationTips3')}`);
          return;
        }

        if (res.errcode) {
          this.$message.error(res.errmsg);
          return;
        }

        this.$message.success(`${this.$t('cloudpivot.flowCenter.pc.delegation.createDelegationTips4')}`);
        this.$emit('reloadList');
        this.onClose();
      });
    }
  }

  // 抽屉关闭事件
  onClose() {
    this.resetData();
    this.$emit('input', false);
  }

  // 重置数据
  resetData() {
    this.delegationData = {
      workflowScope: '0',
      delegateType: '0',
      client: [],
      consignor: [],
      entrustedPeriod: null,
      workflowTrusts: [],
      id: ''
    };
  }

  // 清空部分流程数据
  clearWorkflow() {
    this.delegationData.workflowTrusts = [];
    this.delegationData.workflowScope = '0';
  }

  clearWorkflow2(nVal) {
    if (!nVal) {
      this.delegationData.workflowTrusts = [];
    }
  }

  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang(){
    this.staffSelectorOpts.placeholder = this.$t('cloudpivot.flowCenter.pc.plzSelect') as string;
  }

  @Watch('value')
  onValueChange(v: any) {
    this.isShow = v;
    if (!v) {
      return;
    }
    this.params.corpId = this.userData.corpId;
    if (this.type === 1) {
      this.drawerTitle = this.$t('cloudpivot.flowCenter.pc.delegation.editDelegation').toString();
      // 获取当前流程委托详情
      const params = { workflowTrustRuleId: this.drawerId };
      workflowCenterApi.getWorkflowTrust(params).then((res:any) => {
        if (res.errcode === 0 && res.data) {
          const workflowTrusts = res.data.workflowTrusts ? res.data.workflowTrusts.map((wl:any) => {
              return { value: wl.workflowCode, label: wl.workflowName }
            }): [];
          this.delegationData = {
            id: res.data.id,
            workflowScope: `${res.data.rangeType}`,
            delegateType: `${res.data.trustType}`,
            client: res.data.trustor ? [{
              name: res.data.trustorName,
              id: res.data.trustor,
              type: 3
            }] : [],
            consignor: res.data.trustee ? [{
              name: res.data.trusteeName,
              id: res.data.trustee,
              type: 3
            }] : [],
            entrustedPeriod: [moment(res.data.startTime), moment(res.data.endTime)],
            workflowTrusts,
          };
        }
      });
    } else {
      this.drawerTitle = this.$t('cloudpivot.flowCenter.pc.delegation.addDelegation').toString();
      if (this.userData && this.userData.id) {
        // 默认当前用户为委托人
        this.delegationData.client = [{
          id: this.userData.id,
          name: this.userData.name
        }];
      }
    }
  }

  @Watch('$i18n.locale')
  onLanguageChange(l:string) {
    this.placeHolderLang();
  }
}
</script>

<style lang="less" scoped>
  .delegation-drawer {
    .delegation-box {
      margin-bottom: 50px;
      .row {
        margin-bottom: 20px;
        &>div {
          line-height: 32px;
        }
        .select-wrap {
          width: 100% !important;
          color: rgba(0,0,0,0.85) !important;
        }
        .workflow-select{
           width: 100% !important;
           margin-top: 20px;
          /deep/.ant-select{
            width: 100%;
          }
        }
        .radio-wrap {
          .ant-radio-wrapper{
            color: rgba(0,0,0,0.85) !important;
            margin-right: 24px;
          }
        }
        .ant-col-20{
          color: rgba(0,0,0,0.85) !important;
        }
      }
    }
    .footer {
      width: 100%;
      text-align: center;
      padding: 10px 0;
      position: absolute;
      bottom: 0;
      z-index: 100;
      margin-left: -24px;
      background: #fff;
      border-top: 1px solid #e8e8e8;
      .btn{
        &:last-child{
          margin-left: 10px;
        }
        span{
          font-weight:400;
        }
      }
    }
  }
</style>
