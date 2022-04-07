<template>
<!-- 流程运维弹窗页面 -->
  <div>
    
    <customPop :top="top" :height="popHeigth" @OK="popOK" width="566px" :zIndex="100" v-model="modalShow">
      <template slot="title">流程运维</template>
      <template slot="content">
        <div class="current-node" v-if="participants.length">
          <div class="left">
            <div class="list">
              <label>当前节点</label>
              <div class="custom-select">
                <a-dropdown>
                  <p>{{currentNode.activityName}} <a-icon type="down" /></p>

                  <a-menu slot="overlay">
                    <a-menu-item @click="changeCurrentNode(item)" :key="item.activityCode" v-for="item in participants">
                      {{item.activityName}}
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </div>
            </div>
            <div class="list" style="position: relative; padding-bottom: 10px;">
              <label>处理人</label>
              <div class="handler" :style="{'max-height': showAll ? 'auto' : undefined}">
                {{currentNode && currentNode.participants && currentNode.participants.map(el => el.name).join('、') || ''}}
              </div>
              <template v-if="currentNode && currentNode.participants && currentNode.participants.map(el => el.name).join('、').length > 76">
                <span @click="showAll = false" v-if="showAll" class="icon-up icon aufontAll h-icon-all-double-up-o"></span>
                <span @click="showAll = true" v-else class="icon-up icon aufontAll h-icon-all-double-down-o"></span>
              </template>
            </div>
          </div>
          <div class="right" v-if="!isWORKFLOW_ADMIN">
            <a-popover 
              placement="bottom"
              trigger="click"
            >
              <a-button >
                工作交接
              </a-button>

              <template slot="content">
                <div class="to-work-handover" @click="toWorkHandover('dep')">
                  <p>组织机构<i class="icon aufontAll h-icon-all-finder-o" ></i></p>
                  <small style="margin-bottom: 20px;">
                    在职人员和离职人员通过人员、部门查找，进行工作交接
                  </small>
                </div>
                <div class="to-work-handover" @click="toWorkHandover('role')">
                  <p>组织角色<i class="icon aufontAll h-icon-all-finder-o" ></i></p>
                  <small>通过角色查找，进行工作交接</small>
                </div>
              </template>
            </a-popover>
          </div>
        </div>
      
        <!-- 选择流程操作 -->
        <div class="workflow-operation">
          <label>选择流程操作</label>
          <div class="operations">
            <a-radio-group v-model="manage" @change="onManageChange">
              <div class="radio-wrapper">
                <a-radio v-if="isShow('CANCELED_WORKFLOW')" value="CANCELED_WORKFLOW">作废流程</a-radio>
                <a-radio v-if="isShow('ADJUST_PARTICIPANT')" value="ADJUST_PARTICIPANT">调整当前处理人</a-radio>
                <a-radio v-if="isShow('COMPLETED_WORKFLOW')" value="COMPLETED_WORKFLOW">结束流程</a-radio>
                <a-radio v-if="isShow('CANCELED_ACTIVITY_WORKITEM')" value="CANCELED_ACTIVITY_WORKITEM">取消当前节点所有任务</a-radio>
                <a-radio v-if="isShow('DELETE_WORKFLOW')" value="DELETE_WORKFLOW">删除流程</a-radio>
                <a-radio v-if="isShow('ACTIVATE_ACTIVITY')" value="ACTIVATE_ACTIVITY">激活其他节点</a-radio>
                <a-radio v-if="!isWORKFLOW_ADMIN" value="xiugai">修改流程模板</a-radio>
                <a-radio v-if="isShow('MODIFY_OWNER')" value="MODIFY_OWNER">修改拥有者</a-radio>
              </div>
            </a-radio-group>
          </div>
        </div>

        
        <div class="row-item" v-if="manage === 'CANCELED_ACTIVITY_WORKITEM'">
          <!-- <label></label> -->
          <div>
            <p style="margin-bottom: 0;" class="tips"><span class="icon aufontAll h-icon-all-Components_Warning"></span>取消当前节点的所有任务后，流程会停留在当前节点</p>
          </div>
        </div>

        <div class="row-item" v-if="manage === 'ADJUST_PARTICIPANT'">
          <label>选择当前处理人</label>
          <div>
            <Selector v-model="userValue" :options="options"></Selector>
          </div>
        </div>
        
        <!-- 激活其他节点 -->
        <div class="row-item" v-if="manage === 'ACTIVATE_ACTIVITY'">
          <label>选择节点</label>
          <div>
            <a-select
                v-model="activationActivityCode"
                style="width:100%"
                placeholder="请选择"
              >
                <a-select-option
                  v-for="(opt,index) in nodes"
                  :key="index"
                  :value="opt.activityCode"
                  :title="opt.activityName"
                  :disabled="opt.status === 1"
                >
                  {{ opt.activityName }}
                </a-select-option>
              </a-select>
          </div>
        </div>

        <div class="row-item" v-if="manage === 'xiugai'">
          <label>修改流程模板</label>
          <div class="to-template">
            <span class="to-modify-workflow-template" @click="toModifyWorkflowTemplate">{{data.workflowName}}</span>
            <span class="icon aufontAll h-icon-all-finder-o" @click="toModifyWorkflowTemplate"></span>
          </div>
        </div>

        <template v-if="manage === 'MODIFY_OWNER'">
          <div class="row-item">
            <label>选择拥有者</label>
            <div>
              <staff-selector
                v-model="owner"
                :options="taffSelectorOpts"
                @change="onValueChange"
              >
              </staff-selector>
            </div>
          </div>
          <div class="row-item">
            <label>拥有者部门</label>
            <div>
              <a-select
                v-model="departments"
                style="width:100%"
                placeholder="请选择"
                :disabled="!owner.length"
              >
                <a-select-option
                  v-for="(opt,index) in departmentsList"
                  :key="index"
                  :value="opt.deptId"
                  :title="opt.deptName"
                >
                  {{ opt.deptName }}
                </a-select-option>
              </a-select>
            </div>
          </div>

        </template>

        <div class="row-item" v-if="!['xiugai', 'DELETE_WORKFLOW'].includes(manage)">
          <label>处理意见</label>
          <div class="comment-input">
            <a-textarea
              v-model="comment"
              placeholder="请输入"
              :auto-size="{ minRows: 5, maxRows: 5 }"
            />
            <span  class="str-len">{{comment.length}}/200</span>
            <comment ref="comment" />
          </div>
        </div>  

        <template v-if="currentNode.workItemSource === 1 && total && !['xiugai', 'CANCELED_ACTIVITY_WORKITEM','ACTIVATE_ACTIVITY'].includes(manage)">
          <div class="row-item" >
            <label></label>
            <div class="multiplexing">
              <a-checkbox v-model="isMultiplexing" />
              <span>将当前操作复用于以下同类型的无参与者流程</span>

              <a-popover placement="top" overlayClassName="black-tooltip">
                  <template slot="content">
                    <p>1.“无参与者”指当前节点处理人离职或被删除 </p>
                    <p>2.“同类型”指同一模型、同一节点、同一状态、同一处理人的流程</p>
                  </template>
                  <i style="font-size: 12px;color: #2970ff; margin-left: 5px;" class="icon aufontAll h-icon-all-question-circle-o"></i>
              </a-popover>
            </div>
          </div> 

          <div class="row-item" >
            <label></label>
            <div>
              <span class="show-other" @click="showNoParticipantsList = true">【{{data.workflowName}}】无参与者流程{{total}}条</span>
            </div>
          </div>
        </template>

      </template>
    </customPop>

    <customPop 
      @OK="tipsOk" 
      width="432px" 
      height="auto" 
      :zIndex="101"
      top="20%"
      v-model="tipsModalShow"
      :okText="manage==='DELETE_WORKFLOW' ? '确定并删除' : '确定'"
    >
      <template slot="title">
        {{tipsTitle}}
      </template>
      <template slot="content">
        <div v-html="tipsContent"></div>
      </template>
    </customPop>


    <customPop @OK="showNoParticipantsList=false" width="1080px" height="auto" :zIndex="105" v-model="showNoParticipantsList">
      <template slot="title">无参与者流程</template>
      <template slot="content">
        <a-table
          :columns="columns"
          size="small"
          :pagination="false"
          :loading="false"
          :locale="{emptyText: ''}"
          :scroll="{ y: 585 }"
          :dataSource="noParticipantsList"
        >
          <template slot="state" slot-scope="text, record">
            {{status[record.state]}}
          </template>
        </a-table>

        <div class="pagination-wrapper">
          <a-pagination
            @change="pageChange"
            size="small"
            :pageSizeOptions="pageSizeOptions"
            :total="total"
            :showTotal="total => `共${total}条`"
            showSizeChanger
            showQuickJumper
            :defaultPageSize="10"
            :current="page"
            @showSizeChange="showSizeChange"
          />
        </div>
      </template>
    </customPop>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import customPop from '@cloudpivot/form/src/common/components/customPop.vue'
import { Select, Radio, Input, Checkbox, Popover,Button,Dropdown,Icon,Menu,Table,Pagination } from '@h3/antd-vue'
import comment from '@cloudpivot/flow-center/src/components/pc/components/comment.vue'
import formPc from "@cloudpivot/form/src/renderer/components/pc";
import { workflowApi } from "@cloudpivot/api";
import StaffSelector from "@cloudpivot/form/src/renderer/components/shared/staff-selector.vue";
import { userApi } from "@cloudpivot/api";

@Component({
  name: 'batchOperationAndMaintenance',
  components: {
    customPop,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ATextarea: Input.TextArea,
    comment: comment,
    Selector: formPc.StaffSelector,
    StaffSelector,
    ACheckbox:Checkbox,
    APopover: Popover ,
    AButton:Button,
    ADropdown: Dropdown,
    AIcon:Icon,
    AMenu:Menu,
    AMenuItem: Menu.Item,
    ATable: Table,
    APagination: Pagination
  },
})
export default class batchOperationAndMaintenance extends Vue {
  @Prop({default: false}) value!: boolean;
  @Prop({default: () => {return {}}}) data!: any;

  @Prop() isWORKFLOW_ADMIN!:boolean;
  @Prop() workflowAdminManageScopes!:string[];
  @Prop() workflowState?: string;
  @Prop({ default: () => { } }) headerAction!: any; // 头部按键权限

  
  showAll:boolean =  false;

  top:any = undefined;
  popHeigth:any = 'auto'

  isShow(type){
    let show = true

    switch (type) {
      case 'COMPLETED_WORKFLOW': // 结束流程
        show = this.workflowState !== 'COMPLETED' && this.headerAction.showAdjust // 只能结束未完成的流程
        break;
      case 'ADJUST_PARTICIPANT': // 调整当前处理人
      case 'CANCELED_ACTIVITY_WORKITEM': // 取消当前节点所有任务
        show = this.workflowState !== 'COMPLETED' && this.showOperat && this.headerAction.showAdjust
        break;
      case 'CANCELED_WORKFLOW': // 作废流程
        show = this.headerAction.showCancel &&  this.workflowState !== 'CANCELED'
        break;
      case 'DELETE_WORKFLOW': // 删除流程
        show = this.headerAction.showRemove
        break;
      case 'MODIFY_OWNER': // 修改拥有者
        show = this.headerAction.showEditOwner
        break;
      
      default:
        break;
    }

    return (!this.isWORKFLOW_ADMIN || (this.isWORKFLOW_ADMIN && this.workflowAdminManageScopes.includes(type))) && show
  }

  showOperat: boolean = true;

  @Watch('comment')
  onCommentChange(val: string){
    if(val.length > 200){
      this.comment = this.comment.slice(0, 200)
    }
  }
  


  activationActivityCode: string = '';
  async created() {
    console.log(this.$route.params)
    const res: any = await workflowApi.getWorkflowNodes({
      workflowInstanceId: this.$route.params.workflowInstanceId,
    });
    const status = res.data.filter((i: { status: any }) => i.status);
    if (status <= 0) {
      this.showOperat = false;
    }
    this.nodes = res.data;
  }


  tipsModalShow:boolean = false
  tipsTitle: string = ''
  tipsContent: string = ''

  isMultiplexing:boolean = false;

  showNoParticipantsList:boolean = false; // 显示无参与者列表
  @Watch('showNoParticipantsList')
  onShowNoParticipantsList(val){
    if(val){
      this.getListInstances(0, 10)
    }
  }

  status:any = {
    DRAFT: '草稿',
    PROCESSING: '进行中',
    COMPLETED: '已完成',
    CANCELED: '已作废',
    EXCEPTION: '流程异常',
  }
  columns:any[] = [
    {
      title: '序列',
      key: 'index',
      dataIndex: 'index',
      width:  64,
      align: 'center',
      ellipsis: true
    },
    {
      title: '流程名称',
      key: 'instanceName',
      dataIndex: 'instanceName',
      width:  226,
      ellipsis: true
    },
    {
      title: '流程模板',
      key: 'workflowName',
      dataIndex: 'workflowName',
      width:  116,
      ellipsis: true
    },
    {
      title: '流程版本号',
      key: 'workflowVersion',
      dataIndex: 'workflowVersion',
      width:  116,
      ellipsis: true
    },
    {
      title: '当前节点',
      key: 'activityName',
      dataIndex: 'activityName',
      width:  227,
      ellipsis: true
    },
    {
      title: '当前处理人',
      key: 'originatorName',
      dataIndex: 'originatorName',
      ellipsis: true
    },
    {
      title: '流程状态',
      key: 'state',
      dataIndex: 'state',
      ellipsis: true,
      scopedSlots: { customRender: 'state' },
    }
  ]

  page:number = 0;
  // 分页 page change 回调
  pageChange(page: number, pageSize: number) {
    this.getListInstances(page-1, pageSize)
  }
  pageSizeOptions: Array<string> = [
    '10',
    '20',
    '50',
    '100'
  ]
  showSizeChange(current: number, size: number) {
    this.page = 0
    this.getListInstances(0, size)
  }




  toWorkHandover(type){
    if(type === 'role'){
      this.winOpen('/admin/#/organization/orgrole', '_blank')
    }else{
      this.winOpen('/admin/#/organization/orguser', '_blank')
    }
  }

  winOpen(url, type){
    let win:any = window
    if (window.top !== window.self) {
      win = window.parent
    }
    win.open(url, type)
  }


  @Watch('data')
  onDataChange(value){
    this.participants = value.participants
    this.currentNode = value.participants[0] || {}
    this.getListInstances(0, 1)
  }

  total: any = 0; // 无参与者总数
  noParticipantsList:any[] = []; // 无参与者列表
  changeCurrentNode(item){
    this.currentNode = item
    this.getListInstances(0, 1)
  }

  async getListInstances(page: number, size: number){
    if(!this.currentNode.activityCode){
      return
    }
    await workflowApi.getListInstances({
      instanceState: 'PROCESSING',
      workflowCode:this.data.workflowCode,
      workflowVersion: this.data.workflowVersion,
      activityCode: this.currentNode.activityCode,
      workItemSource: 1,
      filterWorkflowInstanceId: this.$route.params.workflowInstanceId,
      page: page,
      size: size
    }).then((res: any) => {
      console.log(res)
      if(res.errcode === 0){
        this.total = res.data.totalElements
        res.data.content.forEach((element, index) => {
          element.index =  index + 1
        });
        this.noParticipantsList = res.data.content
      }else{
        this.$message.error(res.errmsg)
      }
    })
  }

  currentNode: any = {}

  participants:any[] = []

  comment:string = ''; // 审批意见
  manage:string = ''; // 选择的流程操作
  userValue: any = []; // 当前处理人
  nodeValue: any = []; // 激活的节点
  selectOptions: any[] = []; // 下拉配置项
  nodes: any; // 所有节点信息
  owner: Array<any> = []; // 拥有者
  departments:any = undefined; // 拥有者部门
  options: any = {
    key: "test",
    selectOrg: false,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "点击选择",
  };
  taffSelectorOpts: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title:'选择拥有者'
  }
  departmentsList:any[] = [];
  
  onValueChange(value : any[]){
    if(value.length > 0){
      this.getUserDepartments(value[0].id);
    }else{
      this.departmentsList = [];
      this.departments = undefined;
    }
  }
  async getUserDepartments(userId: string){
    const res: any = await userApi.getUserDepartments(userId);
    if(res && res.errcode === 0) {
      this.departmentsList = res.data;
      let resoure = res.data.find((d: any) => d.isMain);
      this.departments = resoure.deptId;
    }else{
      this.$message.error(res.errmsg);
    }
  }

  onManageChange(){
    if(this.manage === 'ACTIVATE_ACTIVITY'){
      
    }
    
    
  }

  toModifyWorkflowTemplate(){
    const params = this.data
    // 去修改流程模板
    this.winOpen(`/admin/#/apps/model/${params.appCode}/${params.schemaCode}/workflowDesign/${params.workflowCode}`, '_blank')
  }

  // 确定批量运维
  popOK(){
    if(this.manage === ''){
      this.modalShow = false
      return
    }
    
    if(this.manage === 'ACTIVATE_ACTIVITY'){
      if(this.activationActivityCode === ''){
        this.$message.warning('激活节点不能为空！')
        return
      }

      let node = this.nodes.find(el => el.activityCode === this.activationActivityCode)
      // 激活其他节点
      this.tipsTitle = '请确定'
      this.tipsContent = `是否激活已选择节点“${node.activityName}”？`
      this.tipsModalShow = true
    } else if(this.manage === 'CANCELED_WORKFLOW'){
      // 作废流程
      this.tipsTitle = '作废'
      this.tipsContent = '作废后该流程将停止流转，确定要作废？'
      this.tipsModalShow = true
    } else if(this.manage === 'ADJUST_PARTICIPANT'){
      if(!this.userValue.length){
        this.$message.error('当前处理人不能为空！')
        return
      }
      // 调整当前处理人
      this.tipsTitle = '请确定'
      this.tipsContent = '是否调整当前处理人？'
      this.tipsModalShow = true
    } else if(this.manage === 'COMPLETED_WORKFLOW'){
      // 提前结束流程
      this.tipsTitle = '提前结束流程'
      this.tipsContent = '确定立即结束流程？'
      this.tipsModalShow = true
    } else if (this.manage === 'CANCELED_ACTIVITY_WORKITEM'){
      // 取消当前节点所有任务
      this.tipsTitle = '请确定'
      this.tipsContent = '是否取消当前节点所有任务？'
      this.tipsModalShow = true
    } else if (this.manage === 'DELETE_WORKFLOW'){
      // 删除流程
      this.tipsTitle = '删除'
      this.tipsContent = '流程删除后该流程所有数据将删除，<span style="color: red;">且删除后不可恢复</span>，确定要删除？'
      this.tipsModalShow = true
    } else if (this.manage === 'MODIFY_OWNER'){
      // 修改拥有者
      if(this.owner.length === 0){
        this.$message.warning('拥有者不能为空！')
        return
      }
      if(this.departments.length === 0){
        this.$message.warning('拥有者部门不能为空！')
        return
      }

      this.tipsTitle = '请确定'
      this.tipsContent = '是否修改流程拥有者？'
      this.tipsModalShow = true
    } else if (this.manage === 'xiugai'){
      // 修改流程模板
      this.modalShow = false
      return
    }
  }

  tipsOk(){
    this.tipsModalShow = false;
    let params: any = {
      activityCode: this.currentNode.activityCode,
      approval: this.getApproval(),
      batchOperation: this.isMultiplexing,
      operationType: this.manage,
      workflowInstanceId: this.$route.params.workflowInstanceId
    }

    switch (this.manage) {
      case 'ADJUST_PARTICIPANT': // 调整当前处理人
        params.participantors = this.userValue.map(el => el.id)
        break;
      case 'MODIFY_OWNER': // 修改拥有者
        params.ownerDeptId = this.departments
        params.ownerId = this.owner[0].id
        break;
      case 'ACTIVATE_ACTIVITY': // 激活其他节点
        params.activityCode = this.activationActivityCode
      default:
        break;
    }
    this.workflowOperation(params)
  }

  async workflowOperation(params){
    await workflowApi.workflowOperation(params).then((res:any) => {
      console.log('res==>', res)
      if(res.errcode === 0){
        this.modalShow = false;
        this.$message.success(res.errmsg)
        this.$emit('operationOver', this.manage)
      }else{
        this.$message.error(res.errmsg)
      }
    })
  }


  // 获取审批意见参数：意见、附件和签名
  getApproval(){
    const Enclosure = this.getEnclosureValue()
    return {
      activityCode: this.currentNode.activityCode,
      commonSet: false,
      deleted: false,
      resources: Enclosure,
      content: this.comment || null
    }
  }
  // 获取附件和手写签名
  getEnclosureValue(){
    // @ts-ignore
    return this.$refs.comment && this.$refs.comment.getValue() || []
  }

  // 获取批量运维的流程id[]
  getWorkflowInstanceIds(){
    return this.getWorkflowInstance().map(el => el.id)
  }
  // 获取批量运维的流程[]
  getWorkflowInstance(){
    return this.data.filter(el => {
      return el.workflowCode === this.workflow && el.activityCode === this.workflowNode
    })
  }


  workflow:any = null // 选中的流程模板
  workflowNode:any = null // 选中的流程节点

  get checkedWorkflow(){
    if(!this.workflows || !this.workflow){
      return {}
    }
    return this.workflows[this.workflow]
  }
  

  workflowChange(){
    this.workflowNode = null
  }


  get activitys(){
    let key = this.workflow || undefined
    if(!key){
      return []
    }
    return this.workflows[key].activitys
  }


  workflows:any = {}; // 存在的流程模板
  firstData:any = {}
  init(){
    // @ts-ignore
    let bodyHeigth:number = document.querySelector('body').offsetHeight;

    if(bodyHeigth < bodyHeigth * 0.08 + 630){
      this.top = 0;
      this.popHeigth = bodyHeigth + 'px'
    }

    this.onDataChange(this.data)
  }


  modalShow:boolean = false
  @Watch('value', {
    immediate: true
  })
  onVisibleChange(value:boolean){
    this.modalShow = value
    if(value){
      this.init()
    } 
  }

  @Watch('modalShow')
  onModalShowChange(val:boolean){
    this.$emit('input', val)
  }
  close(){
    this.$emit('input', false)
  }
}
</script>
<style lang='less' scoped>

.pagination-wrapper {
    padding-top: 10px;
    padding-bottom: 10px;
    display: flex;
    justify-content: flex-end;
    & > div {
      float: right;
    }
    // 分页器高度调整
    /deep/.ant-pagination-options {
      height: 26px;
      .ant-pagination-options-size-changer {
        margin-top: 1px;
      }
    }
  }
.to-work-handover{
  display: flex;
  flex-direction: column;
  cursor: pointer;
  small{
    margin-left: 0;
    color: rgba(0, 0, 0, 0.45);
    max-width: 186px;
    text-align: justify;
    margin-top: 10px;
  }
  p{
    color: #2970FF;
    display: flex;
    align-items: center;
    i{margin-left: 5px;font-size: 14px;}
  }
}

.current-node{
  background-color: #FAFAFA;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  .left{
    .list{
      margin-bottom: 0;
      &:first-child{
        margin-bottom: 10px;
      }
      label{
        width: 80px;
      }
    }
  }
}
.show-other{
  color: #2970FF;
  cursor: pointer;
}
small{
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-left: 5px;
  font{
    color: #2970FF
  }
}

.list{
  display: flex;
  justify-content: space-between;
  // align-items: center;
  margin-bottom: 16px;
  label{
    width: 98px;
    margin-right: 16px;
    white-space: nowrap;
  }
  &>div{
    flex: 1
  }
}
.tips{
  width: 100%;
  height: 32px;
  line-height: 30px;
  background: #FFFBE6;
  border-radius: 4px;
  border: 1px solid #FFE58F;
  padding: 0 16px;
  color: rgba(0, 0, 0, 0.65);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 22px;
  span{
    margin-right: 10px;
    color: #FAAD14;
  }
}

.workflow-operation{
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  &>label{
    width: 98px;
    margin-right: 16px;
  }
  .operations{
    flex: 1;
    overflow: hidden;
  }
}
.row{
  margin-bottom: 8px;
  label{
    margin-right: 20px;
    width: 120px;
  }
}
.row-item{
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  &>label{
    width: 98px;
    margin-right: 16px;
    line-height: 32px;
  }
  &>div{
    flex: 1;
  }
}
.to-template{
  display: flex;
  align-items: center;
  
  span{
    color: rgba(0, 0, 0, 0.35);
    font-size: 14px;
    cursor: pointer;
    &.icon{
      padding-top: 3px;
    }
  }

  .to-modify-workflow-template{
    height: 32px;
    line-height: 32px;
    display: inline-block;
    color: #2970FF;
    text-decoration: underline;
    text-underline-offset: 2px;
    margin-right: 6px;
  }
}
.radio-wrapper{
  display: flex;
  flex-wrap: wrap;
  label{
    margin-bottom: 8px;
    &:nth-child(even){
      width: 180px;
    }
    &:nth-child(odd){
      width: 180px;
    }
  }
}
.multiplexing{
  display: flex;
  align-items: center;
  line-height: 21px;
  &>span{
    margin-bottom: 2px;
    margin-left: 5px;
  }
}
.comment-input{
  position: relative;
  .str-len{
    position: absolute;
    right: 10px;
    top: 90px;
    color: rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
}

.handler{
  position: relative;
  max-height: 88px;
  overflow: hidden;
  text-align: justify;
  padding-right: 10px;
}
.icon-up{
  position: absolute;
  left: 58%;
  transform: translateX(-50%);
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  top: 100%;
  margin-top: -10px;
  font-size: 12px;
}
</style>


<style lang="less">
.black-tooltip{
  .ant-popover-inner{
    background-color: rgba(0, 0, 0, 0.8);
    
  }
  .ant-popover-arrow{
    border-right-color: rgba(0, 0, 0, 0.8) !important;
    border-bottom-color: rgba(0, 0, 0, 0.8) !important;
  }
  p{
    color: #fff;
    font-size: 14px;
  }
}
</style>