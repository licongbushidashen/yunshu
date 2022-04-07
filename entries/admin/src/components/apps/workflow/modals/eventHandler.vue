<template>
  <a-drawer
    :title="eventObj.eventTitle"
    :closable="true"
    :mask="true"
    :width="850"
    wrapClassName="event-drawer"
    :visible="isShow"
    @close="onClose"
  >
    <div class="event-box">
      <a-form>
        <!-- 钉钉通知 -->
        <div class="dd-box">
          <p class="title">钉钉/微信消息通知</p>
          <div class="event-content">
            <a-form-item
              label="接收方"
              :labelCol="{ span: 2 }"
              :wrapperCol="{ span: 22 }"
              :colon="false"
              class="clear-receiver-input"
            >
              <a-input :value="receiver" @click="showModal = true"> </a-input>
              <a-icon
                v-if="receiver"
                @click.stop="clearReceiver"
                type="close-circle"
                class="clear-receiver-icon"
              ></a-icon>
            </a-form-item>

            <a-form-item
              label="消息内容"
              :labelCol="{ span: 2 }"
              :wrapperCol="{ span: 22 }"
              :colon="false"
            >
            <a-radio-group
                class="radoo-group"
                v-model="isDataItem"
                @change="eventData.content = isDataItem ? '': []"
              >
                <a-radio :value="true">视图展示格式</a-radio>
                <a-radio :value="false">自定义</a-radio>
              </a-radio-group>

              <template v-if="isDataItem">
                <a-select
                  class="input-select input-select-text"
                  :placeholder="$t('languages.PlaceHolder.Select')"
                  allowClear
                  v-model="eventData.content"
                >
                  <a-select-option v-for="i in lists" :key="i.id">
                    {{ i.name }}
                  </a-select-option>
                </a-select>
                <p class="input-select-hint">取对应列表移动端的展示字段作为消息内容</p>
              </template>
              
            <template v-else>
              <a-select
                class="input-select input-select-text"
                mode="tags"
                :getPopupContainer="getPopupContainer"
                :placeholder="$t('languages.PlaceHolder.Select')"
                v-model="eventData.content"
              >
                <a-select-opt-group>
                  <span slot="label" class="select-title">业务数据项</span>
                  <a-select-option v-for="i in bizSummaryList" :key="i.code">{{
                    i.name
                  }}</a-select-option>
                </a-select-opt-group>
                <a-select-opt-group>
                  <span slot="label" class="select-title">系统数据项</span>
                  <a-select-option
                    v-for="i in defaultSummaryList"
                    :key="i.code"
                    >{{ i.name }}</a-select-option
                  >
                </a-select-opt-group>
              </a-select>
              <p class="input-select-hint">选择数据项或输入文本</p>
            </template>
              <!-- <a-textarea v-model="eventData.content" rows="5"></a-textarea> -->
            </a-form-item>
          </div>
        </div>
        <!-- 邮件通知 -->
        <div class="dd-box">
          <p class="title">邮件消息通知</p>
          <div class="event-content">
            <a-form-item
              label="接收方"
              :labelCol="{ span: 2 }"
              :wrapperCol="{ span: 22 }"
              :colon="false"
              class="clear-receiver-input"
            >
              <a-input :value="emailReceiver" @click="showEmailModal = true" style="padding-right: 30px;">
              </a-input>
              <a-icon
                v-if="emailReceiver"
                @click.stop="clearEmailReceiver"
                type="close-circle"
                class="clear-receiver-icon"
              ></a-icon>
            </a-form-item>

            <a-form-item
              label="邮件内容"
              :labelCol="{ span: 2 }"
              :wrapperCol="{ span: 22 }"
              :colon="false"
            >
              <a-select
                class="input-select"
                mode="tags"
                :getPopupContainer="getPopupContainer"
                :placeholder="$t('languages.PlaceHolder.Select')"
                v-model="eventData.emailContent"
              >
                <a-select-opt-group>
                  <span slot="label" class="select-title">业务数据项</span>
                  <a-select-option v-for="i in bizSummaryList" :key="i.code">{{
                    i.name
                  }}</a-select-option>
                </a-select-opt-group>
                <a-select-opt-group>
                  <span slot="label" class="select-title">系统数据项</span>
                  <a-select-option
                    v-for="i in defaultSummaryList"
                    :key="i.code"
                    >{{ i.name }}</a-select-option
                  >
                </a-select-opt-group>
              </a-select>
              <!-- <a-textarea v-model="eventData.content" rows="5"></a-textarea> -->
            </a-form-item>
          </div>
        </div>

        <div class="dd-box">
          <p class="title">短信通知</p>
          <div class="event-content">
            <a-form-item
              label="接收方"
              :labelCol="{ span: 2 }"
              :wrapperCol="{ span: 22 }"
              :colon="false"
              class="clear-receiver-input"
            >
              <a-input :value="smsReceiver" @click="showSmsModal = true" style="padding-right: 30px;">
              </a-input>
              <a-icon
                v-if="smsReceiver"
                @click.stop="clearSmsReceiver"
                type="close-circle"
                class="clear-receiver-icon"
              ></a-icon>
            </a-form-item>

            <a-form-item
              label="短信模板"
              :labelCol="{ span: 2 }"
              :wrapperCol="{ span: 22 }"
              :colon="false"
              class="clear-receiver-input"
              v-if="eventData.smsDisposal"
            >
              <a-select
                class="input-select"
                mode="default"
                :getPopupContainer="getPopupContainer"
                :placeholder="$t('languages.PlaceHolder.Select')"
                @change="smsCodeChange"
                v-model="eventData.smsDisposal.smsCode"
                :allowClear="true"
              >
                <a-select-option
                  v-for="i in smsTemplateList"
                  :key="i.code"
                >
                  {{ i.name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <div class="prames-list">
              <div class="list-header">
                <div class="list-name">参数列表</div>
                <div class="list-info">
                  参数说明
                </div>
                <div class="list-value">
                  数据项设置                  
                </div>
              </div>
              <div class="list-body">
                <div class="list-item" v-for="(item, index) in paramsList" :key="index">
                  <div :title="item.key" class="list-name">{{item.key}}</div>
                  <div class="list-info">
                    {{item.value}}
                  </div>
                  <div class="list-value">
                    <a-select
                      class="input-select input-select-text"
                      mode="default"
                      :getPopupContainer="getPopupContainer"
                      :placeholder="$t('languages.PlaceHolder.Select')"
                      v-model="item.code"
                    >
                      <a-select-opt-group>
                        <span slot="label" class="select-title">业务数据项</span>
                        <a-select-option v-for="i in bizSummaryList" :key="i.code">{{
                          i.name
                        }}</a-select-option>
                      </a-select-opt-group>
                      <a-select-opt-group>
                        <span slot="label" class="select-title">系统数据项</span>
                        <a-select-option
                          v-for="i in defaultSummaryList"
                          :key="i.code"
                          >{{ i.name }}</a-select-option
                        >
                      </a-select-opt-group>
                    </a-select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 设置数据 -->
        <div class="dd-box">
          <p class="title">设置数据</p>
          <div class="event-content">
            <a-table :dataSource="eventData.dataDisposals" :pagination="false">
              <!-- 数据项 -->
              <a-table-column key="property" data-index="property">
                <span slot="title" class="resize resize-first">数据项</span>
                <template slot-scope="text, record">
                  <a-select
                    class="p-w-section"
                    v-model="record.property"
                    showSearch="true"
                    optionFilterProp="children"
                    :getPopupContainer="getPopupContainer"
                    @change="onDataItemChange($event, record)"
                  >
                    <a-select-option
                      v-for="(d, i) in record.list"
                      :key="i"
                      :value="d.code"
                      :title="d.name+'['+d.code+']'"
                      >{{ `${d.name}[${d.code}]` }}</a-select-option
                    >
                  </a-select>
                </template>
              </a-table-column>

              <!-- 操作方式 -->
              <a-table-column key="disposalType" data-index="disposalType">
                <span slot="title" class="resize">操作方式</span>
                <template slot-scope="operationWay">等于</template>
              </a-table-column>

              <!-- 值类型 -->
              <a-table-column key="valueType" data-index="valueType">
                <span slot="title" class="resize">值类型</span>
                <template slot-scope="text, record">
                  <a-select
                    :disabled="constValueDisableArr.includes(record.type)"
                    class="v-t-section"
                    :getPopupContainer="getPopupContainer"
                    v-model="record.valueType"
                    @change="onValueTypeChange(record)"
                  >
                    <a-select-option value="CONST">固定值</a-select-option>
                    <a-select-option value="DYNAMIC">动态值</a-select-option>
                  </a-select>
                </template>
              </a-table-column>

              <!-- 值 -->
              <a-table-column key="value" data-index="value">
                <span slot="title" class="resize">值</span>

                <template slot-scope="value, record">
                  <a-tooltip :visible="!!record.errorMsg">
                    <template slot="title">
                      <span>{{ record.errorMsg }}</span>
                    </template>
                    <div
                      :class="!!record.errorMsg && 'has-error'"
                      class="value"
                    >
                      <!-- 固定值 -->
                      <template v-if="record.valueType === 'CONST'">
                        <!-- 日期控件 -->
                        <a-date-picker
                          v-if="record.type === 3"
                          v-model="record.value"
                          :showTime="true"
                          format="YYYY-MM-DD HH:mm:ss"
                          @change="validate(record, $event)"
                        />
                        <!-- <a-time-picker
                          v-else-if="record.type === 12"
                          v-model="record.value"
                          format="HH:mm:ss"
                          @change="validate(record, $event)"
                        /> -->
                  

                        <!-- 逻辑控件 -->
                        <a-select
                          v-else-if="record.type === 4"
                          v-model="record.value"
                          :getPopupContainer="getPopupContainer"
                        >
                          <a-select-option value="true">true</a-select-option>
                          <a-select-option value="false">false</a-select-option>
                        </a-select>
                        <!-- 选人控件 -->
                        <StaffSelector
                          v-else-if="[50,51,60,61,5].includes(record.type)"
                          v-model="record.value"
                          :onlyForm="true"
                          :options="getStaffSelectorOpts(record.type)"
                          @change="validate(record, $event)"
                        />


                        <!-- 输入框 -->
                        <a-input
                          v-else
                          v-model="record.value"
                          @change="validate(record, $event)"
                        ></a-input>
                      </template>
                      <!-- 动态值 -->
                      <template v-else>
                        <a-select
                          v-model="record.value"
                          class="v-section"
                          :getPopupContainer="getPopupContainer"
                          :showSearch="true"
                          optionFilterProp="children"
                        >
                          <a-select-option
                            v-for="(d, i) in record.valueList"
                            :key="i"
                            :value="d.code"
                            :title="d.name+'['+d.code+']'"
                            >{{ `${d.name}[${d.code}]` }}</a-select-option
                          >
                        </a-select>
                      </template>
                    </div>
                  </a-tooltip>
                </template>
              </a-table-column>

              <a-table-column key="operationIndex" data-index="operationIndex">
                <span slot="title" class="resize">操作</span>
                <template slot-scope="operationIndex, record">
                  <i
                    @click="deleteItem(record)"
                    class="icon aufontAll h-icon-all-delete-o"
                  ></i>
                </template>
              </a-table-column>
            </a-table>
            <div class="add-item" @click="addItem" ref="addButton">
              <i class="icon aufontAll h-icon-all-plus-o"></i> 新增数据
            </div>
          </div>
        </div>
        

        <!-- 触发动作 -->
        <div class="dd-box">
          <p class="title">触发动作</p>
          <div class="event-content last">
            <div
              class="check-box inner-padding"
              v-if="
                eventObj.eventCode === 'endActivity' &&
                nodeType !== 'SYSTEM_ACTIVITY'
              "
            >
              <!-- <a-checkbox
                v-model="eventData.cancelParllelActivity"
                class="checkbox"
              ></a-checkbox>
              <span class="left">通过时取消并行活动</span> -->
              <a-checkbox
                v-model="eventData.rejectCancelParllelActivity"
                class="checkbox"
              ></a-checkbox>
              <span>驳回时取消并行活动</span>
            </div>
            <div class="business-box">
              <a-form-item
                label="执行业务规则"
                :labelCol="{ span: 4 }"
                :wrapperCol="{ span: 21 }"
                :colon="false"
              >
                <a-select
                  mode="multiple"
                  placeholder="请选择"
                  :labelInValue="true"
                  @change="bizRuleChange"
                  :getPopupContainer="getPopupContainer"
                  :value="eventData.bizActions"
                >
                  <a-select-option
                    v-for="(business, index) in bizRuleList"
                    :value="business.code"
                    :key="index"
                    >{{ business.name }}</a-select-option
                  >
                  <div class="select-empty-content" slot="notFoundContent">
                    暂无数据
                  </div>
                </a-select>
              </a-form-item>
            </div>
          </div>
        </div>

        <div class="footer">
          <a-button type="primary" @click="saveData">保存</a-button>
        </div>
      </a-form>
    </div>
    <!-- 参与者弹窗 -->
    <participant-modal
      v-model="showModal"
      :data="eventData.receiver"
      :popupType="eventData.popupType"
      @close="showModal = false"
      @submit="setReceiver"
    />

    <participant-modal
      v-model="showEmailModal"
      :data="eventData.emailReceiver"
      :emailStatus="true"
      :popupType="eventData.emailPopupType"
      @close="showEmailModal = false"
      @submit="setEmailReceiver"
    />

    <template v-if="eventData.smsDisposal">
    <participant-modal
      v-model="showSmsModal"
      :data="eventData.smsDisposal.receiver"
      :popupType="eventData.smsDisposal.popupType"
      @close="showSmsModal = false"
      @submit="setSmsReceiver"
    />
    </template>

  </a-drawer>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import Bus from "@/utils/bus";
import NodeGraph from "@/utils/flowGraph/graph";
import participantModal from "./participant/index.vue";
import formPc from "@cloudpivot/form/src/renderer/components/pc";
import moment from "moment";
import * as listApi from "@/apis/list/list.api";
const DataModelModule = namespace('Apps/DataModel');
import WorkflowApi from '@/apis/workflow'
import { DataItemType } from "@cloudpivot/form/schema";

import OrgApi from "@/apis/organization";

const WorkflowModule = namespace("Apps/Workflow");

@Component({
  name: "EventHandler",
  components: {
    participantModal,
    StaffSelector: formPc.StaffSelector,
  },
})
export default class EventHandler extends Vue {
  @WorkflowModule.State("curActivityProps") curActivityProps: any;

  @WorkflowModule.State("WorkflowDataItem_all") WorkflowDataItem_all: any;

  @WorkflowModule.State("workflowData") workflowData: any;
  
  @WorkflowModule.State("bizMethodList") bizMethodList: any;

  @WorkflowModule.State("bizRuleList") bizRuleList: any;

  @WorkflowModule.Mutation("setPropValue") setPropValue: any;

  @WorkflowModule.Mutation("setWorkflowEventHandler")
  setWorkflowEventHandler: any;

  @WorkflowModule.Mutation("setWorkflowListItem") setWorkflowListItem: any;

  @WorkflowModule.State("WorkflowDataItem_origin") WorkflowDataItemOrigin: any;

  @DataModelModule.State('bizSchemaCode') schemaCode: any; // 当前的业务模型schemaCode

  @Prop() value!: any;

  @Prop() eventObj!: any;

  @Prop() type!: any;

  // 节点类型
  @Prop() nodeType?: any;

  // 参与者弹窗类型
  @Prop() popupType?: string;

  get defaultSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => data.defaultProperty
    );
  }

  get bizSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => !data.defaultProperty
    );
  }

  get receiver() {
    if (!this.eventData) return;
      //判断选择的值中是否有数组标志[]，

    if (this.eventData.receiver) {
      let str = "";
      const data = this.eventData.receiver.split("+");
      data.forEach(d => {
        // 判断 data 的项是否是以[开头，则进行转换为json进行取值
        if(/^\[.*\]$/.test(d)){
          // 组织结构类型
          let dArray = JSON.parse(d);
          const name:any[] = dArray.map(item => item.name);
          str += name.join(';');
          str += ";";
        } else if(d.indexOf('{')>-1){
            //处理接收方只为object的情况
            let key = d.slice(1, d.length - 1);
            str += this.list[key] ? `${this.list[key]};` : '';
        } else{
          // 纯字符串类型，例如业务数据项
          str += `${d};`;
        }
      });
      return str || this.eventData.receiver;
    }

    return this.eventData.receiver;
  }

  get emailReceiver() {
    if (!this.eventData) return;
   //判断选择的值中是否有数组标志[]，
    if (this.eventData.emailReceiver) {
      let str = "";
      const data = this.eventData.emailReceiver.split("+");
      data.forEach(d => {
        // 判断 data 的项是否是以[开头，则进行转换为json进行取值
        if(/^\[.*\]$/.test(d)){
          // 组织结构类型
          let dArray = JSON.parse(d);
          const name:any[] = dArray.map(item => item.name);
          str += name.join(';');
          str += ";";
        } else if(d.indexOf('{')>-1){
            //处理接收方只为object的情况
            let key = d.slice(1, d.length - 1);
            str += this.list[key] ? `${this.list[key]};` : '';
        } else{
          // 纯字符串类型，例如业务数据项
          str += `${d};`;
        }
      });
      return str || this.eventData.emailReceiver;
    }

    return this.eventData.emailReceiver;
  }

  get smsReceiver() {
    if (!this.eventData || !this.eventData.smsDisposal) return;
   //判断选择的值中是否有数组标志[]，
    if (this.eventData.smsDisposal.receiver) {
      let str = "";
      const data = this.eventData.smsDisposal.receiver.split("+");
      data.forEach(d => {
        // 判断 data 的项是否是以[开头，则进行转换为json进行取值
        if(/^\[.*\]$/.test(d)){
          // 组织结构类型
          let dArray = JSON.parse(d);
          const name:any[] = dArray.map(item => item.name);
          str += name.join(';');
          str += ";";
        } else if(d.indexOf('{')>-1){
            //处理接收方只为object的情况
            let key = d.slice(1, d.length - 1);
            str += this.list[key] ? `${this.list[key]};` : '';
        } else{
          // 纯字符串类型，例如业务数据项
          str += `${d};`;
        }
      });
      return str || this.eventData.smsDisposal.receiver;
    }

    return this.eventData.smsDisposal.receiver;
  }
  

  //消息通知类型
  isDataItem: boolean = true;
  //消息视图展示数据
  lists: any = [];

  // 显示控制
  isShow: boolean = false;

  // 事件抽屉数据
  eventData: any = {
    bizActions: [],
    receiver: "",
    emailReceiver: "",
    smsReceiver: ""
  };

  // 业务模型数据项列表
  dataItem: any = [];

  canSelectDataItem: any = []; // 动态值可选的数据项列表

  // 已选的数据项列表
  // selectedItem:any = [];
  // 展示参与者弹窗
  showModal: boolean = false;
  showEmailModal: boolean = false;
  showSmsModal:boolean = false;

  index: number = -1;

  constValueDisableArr: any = [6, 9, 10, 11]; // 固定值禁用数据项类型--附件、关联表单、地址

  filterSysArr: any = [
    "id",
    "name",
    "workflowInstanceId",
    "ownerDeptQueryCode",
  ]; // 动态值需过滤掉的系统数据项code数据

  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: "请选择",
  };



  getStaffSelectorOpts(type){
    const obj = {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: "请选择",
    }
    switch (type) {
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


  list: any = {}
  async getFormulaTree(params: Apps.Workflow.FormulaParams){
    const res: any = await WorkflowApi.getFormulaList(params);
    if (res.errcode === 0 && Array.isArray(res.data)) {
      let Functions:any = []
      res.data.forEach(element => {
        element.childrenFunctions = element.childrenFunctions || [];
        Functions = [...Functions, ...element.childrenFunctions]
      });
      let resData = {}
      Functions.forEach(element => {
        resData[element.code] = element.fullName
      });
      this.list= resData;
    }
  }

    /*
   * 获取查询列表的列表
   */
  getLists() {
    const { bizSchemaCode } = this.$route.params;
    listApi.getList(bizSchemaCode).then((res: any) => {
      if (res.data && Array.isArray(res.data)) {
        this.lists = res.data.filter((l: any) => l.publish);
        this.setWorkflowListItem(this.lists);
      }
    });
  }

  // 获取当前下标
  getOperationIndex() {
    this.index += 1;
    return this.index;
  }

  mounted() {
    this.getFormulaTree({ // 用于回显参与者名称
      schemaCode: this.schemaCode,
      type: 'participant'
    })
    this.dataMounted();
    this.getLists();
    // 处理流程事件加载不到数据项问题，请求完成再执行设置
    if (this.type === "workflow" && !this.WorkflowDataItem_all.length) {
      Bus.$on("initWorkflowDataItem", this.setWorkflowDataItem);
    } else {
      this.setWorkflowDataItem();
    }

    this.getEnableSmsTemplateList()
  }

  smsTemplateList:any[] = []; // 短信通知模板
  async getEnableSmsTemplateList(){
    await OrgApi.getEnableSmsTemplateList({}).then((res:any) => {
      if(res.errcode === 0){
        this.smsTemplateList = res.data;
        this.getParamsList()
      }
    })
  }

  get checkedSmsTemPlate(){
    if(this.eventData.smsDisposal && this.eventData.smsDisposal.smsCode){
      return this.smsTemplateList.find(el => el.code === this.eventData.smsDisposal.smsCode)
    }
    return null
  }

  smsCodeChange(){
    this.getParamsList()
  }


  // once:boolean = true;
  @Watch('eventData.smsDisposal.smsCode')
  onSmsDisposalChange(val){
    if(val){
      this.getParamsList()
    }
  }

  paramsList:any[] = [];

  getParamsList(){
    if(this.checkedSmsTemPlate){
      let paramsList:any[] = JSON.parse(this.checkedSmsTemPlate.params)
      if(this.eventData.smsDisposal && this.eventData.smsDisposal.paramMapping && this.eventData.smsDisposal.paramMapping.length){
        paramsList.forEach((el, index) => {
          el.code = this.eventData.smsDisposal.paramMapping[index].code
        })
      }
      this.paramsList = paramsList;
    }else{
      this.paramsList = []
    }
  }

  // 设置流程数据项
  setWorkflowDataItem() {
    if (this.WorkflowDataItem_all.length) {
      this.WorkflowDataItem_all.forEach((item: any) => {
        if (
          item.propertyType === 8 &&
          item.subSchema &&
          item.subSchema.properties
        ) {
          item.subSchema.properties.forEach((subItem: any) => {
            if (!subItem.defaultProperty) {
              const subData: any = {
                ...subItem,
                code: `${item.code}.${subItem.code}`,
                name: `${item.name}-${subItem.name}`,
                isSubItem: true,
              };
              this.dataItem.push(subData);
              this.canSelectDataItem.push(subData);
            }
          });
        } else if (!item.defaultProperty) {
          this.dataItem.push(item);
        }
        if (!this.filterSysArr.includes(item.code) && item.propertyType !== 8) {
          this.canSelectDataItem.push(item);
        }
      });
      const curTime: any = {
        code: "current",
        name: "系统当前时间",
        propertyType: 3,
      };
      this.canSelectDataItem.push(curTime);
      // console.log('dataItem', this.dataItem);
      // console.log('canSelectDataItem', this.canSelectDataItem);
    }
  }

  // 根据数据初始化视图
  dataMounted() {
    if (this.type === "workflow") {
      if (this.eventObj.eventCode) {
        const jsonStr = this.workflowData[this.eventObj.eventCode];
        if (jsonStr) {
          this.eventData = JSON.parse(
            JSON.stringify(this.workflowData[this.eventObj.eventCode])
          );
        } else {
          this.eventData = {
            bizActions: [],
            dataDisposals: [],
            receiver: "",
            emailReceiver: "",
            content: [],
            emailContent: [],
          };
        }
        if (!this.eventData.receiver) {
          this.eventData.receiver = "";
        }
        if (!this.eventData.emailReceiver) {
          this.eventData.emailReceiver = "";
        }
      }
    } else if (Object.keys(this.curActivityProps.acticityEvent).length) {
      const acticityEventArray = Object.entries(
        this.curActivityProps.acticityEvent
      );
      acticityEventArray.forEach((a: any) => {
        if (!a && !a[0] && !a[1]) {
          return;
        }
        const [key, value] = a;
        if (key === this.eventObj.eventCode) {
          this.eventData = JSON.parse(JSON.stringify(value));
        }
      });
    }
    if (!this.eventData.receiver) {
      this.eventData.receiver = "";
    }
    if (!this.eventData.emailReceiver) {
      this.eventData.emailReceiver = "";
    }
    if (!this.eventData.bizActions || !this.eventData.bizActions.length) {
      this.eventData.bizActions = [];
      this.eventData.bizActionType = "BIZ_RULE";
    }
    this.eventData.bizActions = this.eventData.bizActions
      .filter((biz: any) => biz)
      .map((b: any) => {
        let item: any = null;
        if (
          !this.eventData.bizActionType ||
          this.eventData.bizActionType === "BIZ_METHOD"
        ) {
          item = this.bizMethodList.find((m: any) => m.code === b);
        } else {
          item = this.bizRuleList.find((m: any) => m.code === b);
        }
        return {
          key: b,
          label: item ? item.name : b,
        };
      });

    // 兼容老数据
    this.compatibleContent('content');
    this.compatibleContent('emailContent');


    if (!this.eventData.dataDisposals) {
      return;
    }
    this.eventData.dataDisposals.forEach((td: any, index: number) => {
      const options = this.filterDataItem(td.property);
      const arr = options ? options : [...this.dataItem];
      this.$set(td, "list", arr);
      const _item = this.dataItem.find((d: any) => d.code === td.property);
      td.type = _item.propertyType;
      td.index = this.getOperationIndex();
      td.key = td.index;
      td.valueType = td.valueType
        ? td.valueType
        : this.constValueDisableArr.includes(_item.propertyType)
        ? "DYNAMIC"
        : "CONST";
      td.valueList = this.filterDynamicList(_item, td.property);
      if (td.type === 3 && td.valueType === "CONST") {
        // 日期数据初始化
        td.value = moment(td.value);
      } else if (td.type === 5 && td.valueType === "CONST" && td.value) {
        // 选人控件数据初始化
        td.value =
          typeof td.value === "string" ? JSON.parse(td.value) : td.value;
      }
    });

    if(!this.eventData.smsDisposal){
      this.eventData.smsDisposal = {
        receiver: '',
        smsCode: '',
        paramMapping: [],
        popupType: 'FUNCTION'
      }
    }
  }

  /*
   * eventData.content 兼容
   */
  compatibleContent(data) {
    const _content: any = this.eventData[data];
    let arr: any = [];
    if(data==='content'){
      this.isDataItem=true;
    }
    if (Array.isArray(_content) && _content.length > 0) {
      if(data==='content'){
        this.isDataItem =_content.some((item:any)=>{return this.lists.findIndex((dataItem:any) => dataItem.id === item) > -1});
      }
      return;
    }
    if (_content) {
      try {
        // 是json字符串
        const json: any = JSON.parse(_content);
        if(data==='content'){
          // if(json.some((item:any)=>{return item.hasOwnProperty('code')})){
          //    this.isDataItem =json.some((item:any)=>{return this.lists.findIndex((dataItem:any) => dataItem.id === item.code) > -1});
          // }else{
          //   this.isDataItem =json.some((item:any)=>{return this.lists.findIndex((dataItem:any) => dataItem.id === item) > -1});
          // };
          //代码优化
          this.isDataItem =json.some((item:any)=>{
            return this.lists.findIndex((dataItem:any) => 
              dataItem.id === (json.some((item:any)=>{return item.hasOwnProperty('code')})?item.code:item)
            ) > -1
          });
        }
        json.forEach((item: any) => {
          if (item.code) {
            arr.push(item.code);
          }
        });
        this.eventData[data] = arr;
      } catch {
        // 不是json字符串
        if (Array.isArray(_content)) {
          _content.forEach((item: any) => {
            if (item.code) {
              arr.push(item.code);
            }
          });
          this.eventData[data] = arr;
          if(data==='content'){
              this.isDataItem =_content.some((item:any)=>{
            return this.lists.findIndex((dataItem:any) => 
              dataItem.id === (_content.some((item:any)=>{return item.hasOwnProperty('code')})?item.code:item)
             ) > -1
           });
          }
        } else {
          this.eventData[data] = [_content];
        }
      }
    } else {
      // 防止select组件报错
      // if (this.type !== 'workflow') {
      this.eventData[data] = [];
      // }
    }
    console.log(this.isDataItem);
    
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  // 参与者弹窗submit事件
  setReceiver(payload: any) {
    this.eventData.receiver = payload.formula;
    this.eventData.popupType = payload.popupType;
    this.showModal = false;
  }
  // 参与者弹窗submit事件
  setEmailReceiver(payload: any) {
    this.eventData.emailReceiver = payload.formula;
    this.eventData.emailPopupType = payload.popupType;
    this.showEmailModal = false;
  }

  setSmsReceiver(payload: any) {
    this.eventData.smsDisposal.receiver = payload.formula;
    this.eventData.smsDisposal.popupType = payload.popupType;
    this.showSmsModal = false;

    this.eventData = JSON.parse(JSON.stringify(this.eventData))
  }

  // 设置数据项
  addItem() {
    if (this.eventData.dataDisposals && this.eventData.dataDisposals.length) {
      const flag = this.eventData.dataDisposals.every((d: any) => {
        return d.property && d.value && d.value.length !== 0;
      });
      if (!flag) {
        this.$message.warning("请先完善当前数据设置");
        return;
      }
    }

    if (!this.eventData.dataDisposals) {
      this.eventData.dataDisposals = [];
    }
    const options: any = this.filterDataItem();
    if (Array.isArray(options) && options.length) {
      this.eventData.dataDisposals.push({
        property: "",
        disposalType: "SET",
        value: "",
        valueType: "CONST",
        type: 0,
        index: this.getOperationIndex(),
        key: this.index,
        list: options,
        valueList: [],
      });
      const dom: any = this.$refs.addButton;
      dom.scrollIntoView();
    } else {
      this.$message.warning("暂无可设置数据项");
    }
  }

  // 数据项改变事件
  onDataItemChange(code: any, item: any) {
    // 数据项切换清空value,防止类型转换异常
    item.value = "";
    const _item = this.dataItem.find((d: any) => d.code === code);
    this.eventData.dataDisposals.forEach((td: any) => {
      const options = this.filterDataItem(td.property);
      if (options) {
        this.$set(td, "list", options);
      }
    });
    item.type = _item.propertyType;
    item.valueType = this.constValueDisableArr.includes(_item.propertyType)
      ? "DYNAMIC"
      : "CONST";
    if (_item.propertyType === 4) {
      item.value = "false";
    } else if (_item.propertyType === 3) {
      item.value = moment(new Date());
    } else if (_item.propertyType === 12) {
      item.value = "";
    }
    item.valueList = this.filterDynamicList(_item, code);
    item.errorMsg = "";
    // if (item.type === 2 && item.value) {
    //   this.validate(item);
    // }
  }

  // 过滤数据项赋动态值可选的数据项列表
  filterDynamicList(_item: any, code: string) {
    const type = _item.propertyType;
    const relativeCode = _item.relativeCode;
    const sheetCode = code.split(".").length > 1 ? code.split(".")[0] : "";
    // 过滤掉该数据项本身及类型不同的数据项
    let baseItem = this.canSelectDataItem.filter(
      (item: any) => {

        // 单行文本、单选、下拉单选可以互相选择
        if([DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown].includes(item.propertyType)){
          return [DataItemType.ShortText, DataItemType.Radio, DataItemType.Dropdown ].includes(type) && item.code !== code
        }
        // 多选、下拉多选可以相互选择
        if([DataItemType.Checkbox, DataItemType.DropdownMulti].includes(item.propertyType)){
          return [DataItemType.Checkbox, DataItemType.DropdownMulti ].includes(type) && item.code !== code
        }

        return item.code !== code && item.propertyType === type
      }
    );
    // 关联表单只能选择绑定同一业务模型的数据项
    if (type === 9 || type === 11) {
      baseItem = baseItem.filter((m: any) => m.relativeCode === relativeCode);
    }
    if (sheetCode) {
      // 数据项为子表数据项--只能选择同一子表里的数据项和主表数据项
      const childItem = baseItem.filter(
        (item: any) =>
          !item.isSubItem ||
          (item.isSubItem && item.code.split(".")[0] === sheetCode)
      );
      return childItem;
    } else {
      // 数据项为主表数据项
      return baseItem.filter((item: any) => !item.isSubItem);
    }
  }

  // 值类型改变事件
  onValueTypeChange(item: any) {
    item.value = "";
    item.errorMsg = "";
  }

  // 数据项去重
  filterDataItem(selfCode?: string) {
    if (!this.eventData.dataDisposals) {
      return;
    }
    const selectedItem: Array<string> = [];
    this.eventData.dataDisposals.forEach((td: any) => {
      if (selfCode === td.property) {
        return;
      }
      selectedItem.push(td.property);
    });
    const optionList = this.dataItem.filter(
      (wd: any) => !selectedItem.includes(wd.code)
    );
    if (!optionList) {
      return;
    }
    return optionList;
  }

  // 校验输入框内容
  validate(item: any, evt?: Event) {
    let err = "";
    if (!item.value || (!item.value.length && item.type === 5)) {
      this.$set(item, "errorMsg", "请输入内容");
      return;
    }
    if (item.type === 0 && item.value.length > 200) {
      err = "短文本长度不得超过200";
    } else if (item.type === 1 && item.value.length > 2000) {
      err = "长文本长度不得超过2000";
    } else if (item.type === 2 && !/^\d{1,9}(\.\d{0,4})?$/.test(item.value)) {
      err = "请输入数值（支持最大9位整数和4位小数）";
      setTimeout(() => {
        const matches: any = item.value.match(/\d{1,9}(\.\d{0,4})?/);
        item.value = Array.isArray(matches) ? matches[0] : "";
        item.errorMsg = "";
      }, 1500);
    }
    this.$set(item, "errorMsg", err);
    // item.errorMsg = err;
  }

  // 删除数据项
  deleteItem(item: any) {
    const index = this.eventData.dataDisposals.findIndex(
      (a: any) => a.index === item.index
    );
    this.eventData.dataDisposals.splice(index, 1);
    // 将删除的数据项添加回所有的list中
    const dataItemList = this.dataItem.find(
      (wd: any) => wd.code === item.property
    );
    if (!dataItemList) {
      return;
    }
    this.eventData.dataDisposals.forEach((td: any) => {
      if (
        dataItemList.code !== td.property &&
        !td.list.includes(dataItemList)
      ) {
        td.list.push(dataItemList);
      }
    });
  }

  // 业务规则change事件
  bizRuleChange(val: any) {
    const vm: any = this;
    // 改变业务方法时，出现确认弹窗
    if (
      !this.eventData.bizActionType ||
      this.eventData.bizActionType === "BIZ_METHOD"
    ) {
      let label = "";
      vm.eventData.bizActions.forEach((biz: any, idx: number) => {
        label += `“${biz.label}”${
          idx === vm.eventData.bizActions.length - 1 ? "" : "、"
        }`;
      });
      this.$confirm({
        okText: "确定",
        cancelText: "取消",
        class: "biz-rule-confirm",
        content: `由于1.7.0及以后的版本，业务方法已升级为业务规则，如需修改，历史配置的业务方法${label}将被清除`,
        onOk() {
          vm.eventData.bizActionType = "BIZ_RULE";
          val = val.filter((v: any) => {
            const item = vm.eventData.bizActions.find(
              (b: any) => b.key === v.key
            );
            if (item) {
              return false;
            }
            return true;
          });
          vm.eventData.bizActions = val;
        },
      });
    } else {
      vm.eventData.bizActionType = "BIZ_RULE";
      vm.eventData.bizActions = val;
    }
  }

  // 抽屉关闭事件
  onClose() {
    if (this.eventData.dataDisposals) {
      this.eventData.dataDisposals.forEach((td: any) => {
        delete td.errorMsg;
      });
    }
    // this.eventData.content = [];
    // this.eventData.emailContent = [];
    this.paramsList = []
    this.$emit("input", false);
  }

  contentDataForamt(data: any) {
    let array: any = [];
    if (typeof data === "string") {
      // array = JSON.parse(data);
       array=[data];
    } else {
      array = JSON.parse(JSON.stringify(data));
    }

    let obj: any = {};
    const json: Array<any> = [];
    array.forEach((item: any) => {
      item = item.trim();
      if (item) {
          //代码优化
        const flag:boolean =Array.isArray(this.lists) ? (this.lists.findIndex((dataItem:any) => dataItem.id === item) > -1) :false;
        const isItemData:boolean = this.WorkflowDataItemOrigin.findIndex((dataItem:any) => dataItem.code === item) > -1;
        json.push({
            isDataItem: flag ? 2: (isItemData ? 1 : 0),
            code:  item
        })
        // const isItemData: boolean =
        //   this.WorkflowDataItemOrigin.findIndex(
        //     (dataItem: any) => dataItem.code === item
        //   ) > -1;
        // if (isItemData) {
        //   obj = {
        //     isDataItem: 1,
        //     code: item,
        //   };
        // } else {
        //   obj = {
        //     isDataItem: 0,
        //     code: item,
        //   };
        // }
        //json.push(obj);
      }
    });

    return json;
  }

  setContent2JsonStr() {
    const _content: any = this.eventData.content;
    // 统一将content转成json字符串
    if (_content && _content.length > 0) {
      const d: any = this.contentDataForamt(_content);
      this.eventData.content = JSON.stringify(d);
    }
  }
  setEmailContent2JsonStr() {
    const _content: any = this.eventData.emailContent;
    // 统一将content转成json字符串
    if (_content && _content.length > 0) {
      const d: any = this.contentDataForamt(_content);
      this.eventData.emailContent = JSON.stringify(d);
    }
  }
  setSmsContent2JsonStr() {
    // const _content: any = this.eventData.smsContent;
    // // 统一将content转成json字符串
    // if (_content && _content.length > 0) {
    //   const d: any = this.contentDataForamt(_content);
    //   this.eventData.smsContent = JSON.stringify(d);
    // } this.eventData.paramsList = this.paramsList

    this.eventData.smsDisposal.paramMapping = this.paramsList.map(el => {
      return {
        isDataItem: 1,
        code: el.code,
        param: el.key,
        value: el.value
      }
    })
  }

  // 保存数据事件
  async saveData() {
    // 保存前过滤消息内容中空格
    if (this.eventData.content && Array.isArray(this.eventData.content)) {
      this.eventData.content = this.eventData.content.filter(
        (ev: any) => !/^\s+\s+$/g.test(ev)
      );
    }
    if (this.eventData.emailContent && Array.isArray(this.eventData.emailContent)) {
      this.eventData.emailContent = this.eventData.emailContent.filter(
        (ev: any) => !/^\s+\s+$/g.test(ev)
      );
    }
    

    // NOTE: 【钉钉消息通知】检查消息通知接收方和消息内容是否存在其一为空
    if (
      this.eventData.content &&
      this.eventData.content.length > 0 &&
      !this.eventData.receiver
    ) {
      this.$emit("saveEvent", {
        code: this.eventObj.eventCode,
        isSetting: false,
      });
      this.$message.warning("钉钉消息接收方不可为空！");
      return;
    }

    if (
      this.eventData.emailContent &&
      this.eventData.emailContent.length > 0 &&
      !this.eventData.emailReceiver
    ) {
      this.$emit("saveEvent", {
        code: this.eventObj.eventCode,
        isSetting: false,
      });
      this.$message.warning("邮件消息接收方不可为空！");
      return;
    }

    // 短信通知
    if (
      !this.eventData.smsDisposal.receiver &&
      this.eventData.smsDisposal.smsCode
    ) {
      this.$emit("saveEvent", {
        code: this.eventObj.eventCode,
        isSetting: false,
      });
      this.$message.warning("短信通知接收方不可为空！");
      return;
    }
    if (
      this.eventData.smsDisposal.receiver &&
      !this.eventData.smsDisposal.smsCode
    ) {
      this.$emit("saveEvent", {
        code: this.eventObj.eventCode,
        isSetting: false,
      });
      this.$message.warning("短信模板不能为空");
      return;
    }


    if (
      this.eventData.receiver &&
      (!this.eventData.content || !this.eventData.content.length)
    ) {
      this.$emit("saveEvent", {
        code: this.eventObj.eventCode,
        isSetting: false,
      });
      this.$message.warning("钉钉消息内容不能为空！");
      return;
    }
    if (
      this.eventData.emailReceiver &&
      (!this.eventData.emailContent || !this.eventData.emailContent.length)
    ) {
      this.$emit("saveEvent", {
        code: this.eventObj.eventCode,
        isSetting: false,
      });
      this.$message.warning("邮件消息内容不能为空！");
      return;
    }

    // NOTE：【设置数据】检查数据项值为空或校验不通过的情况
    let save = true;
    let required = false;
    let isBizConsistent = true;
    if (Array.isArray(this.eventData.dataDisposals)) {
      this.eventData.dataDisposals.forEach((td: any) => {
        if (td.errorMsg || !td.value || !td.property || td.value.length === 0) {
          save = false;
        }
        if (!td.value || !td.property || td.value.length === 0) {
          required = true;
        }
        if (td.type === 11) {
          let keyItem = td.list.find((item) => item.code === td.property);
          let valueItem = td.valueList.find((item) => item.code === td.value);
          if (
            !(
              keyItem &&
              valueItem &&
              keyItem.relativeCode === valueItem.relativeCode
            )
          ) {
            isBizConsistent = false;
          }
        }
      });
    }

    if (required) {
      this.$message.warning("数据项值不可为空！");
      return;
    }

    if (!isBizConsistent) {
      this.$message.warning("关联表单多选所配置的业务模型不一致！");
      return;
    }

    // NOTE: 检查赋值是否有闭环回归的问题， eg: A -> B -> A
    const hasClosedCycle = await this.checkClosedCycle();
    if (hasClosedCycle) {
      return;
    }
    // NOTE: 【设置数据】处理内容
    if (
      (this.eventData.dataDisposals &&
        this.eventData.dataDisposals.length &&
        save) ||
      (this.eventData.receiver &&
        this.eventData.content &&
        this.eventData.content.length) ||
      (this.eventData.emailReceiver &&
        this.eventData.emailContent &&
        this.eventData.emailContent.length) ||

      // 短信通知
      (this.eventData.smsDisposal.receiver && this.eventData.smsDisposal.smsCode) ||

      (this.eventData.bizActions && this.eventData.bizActions.length) ||
      (this.eventObj.eventCode === "endActivity" &&
        this.eventData.cancelParllelActivity) ||
      (this.eventObj.eventCode === "endActivity" &&
        !this.eventData.rejectCancelParllelActivity)
    ) {
      // NOTE: 【钉钉消息通知】 格式化钉钉消息的消息内容
      if (
        this.eventData.receiver &&
        this.eventData.content &&
        this.eventData.content.length > 0
      ) {
        this.setContent2JsonStr();
      }

      if (
        this.eventData.emailReceiver &&
        this.eventData.emailContent &&
        this.eventData.emailContent.length > 0
      ) {
        this.setEmailContent2JsonStr();
      }

      // 格式化短信通知内容
      if ( this.eventData.smsDisposal.receiver && this.eventData.smsDisposal.smsCode ) {
        this.setSmsContent2JsonStr()
      }

      this.$emit("saveEvent", {
        code: this.eventObj.eventCode,
        isSetting: true,
      });
    } else {
      this.$emit("saveEvent", {
        code: this.eventObj.eventCode,
        isSetting: false,
      });
    }
    // NOTE: 【数据设置】格式化处理
    if (!this.eventData.dataDisposals) {
      // 处理业务规则
      if (this.eventData.bizActions && this.eventData.bizActions.length) {
        this.eventData.bizActions = this.eventData.bizActions.map(
          (biz: any) => {
            return biz.key;
          }
        );
      }
      if (this.type === "workflow") {
        const _p = { key: this.eventObj.eventCode, value: this.eventData };
        this.setWorkflowEventHandler(_p);

      } else {
        const value = JSON.parse(JSON.stringify(this.eventData));
        this.setPropValue({
          key: `acticityEvent.${this.eventObj.eventCode}`,
          value,
        });
      }
      this.onClose();
      return;
    }
    if (save) {
      this.eventData.dataDisposals.forEach((td: any) => {
        if (td.type === 3 && td.valueType === "CONST") {
          // 日期数据格式化
          td.value = moment(td.value).format("YYYY-MM-DD HH:mm:ss");
        } else if (
          td.type === 5 &&
          td.valueType === "CONST" &&
          Array.isArray(td.value)
        ) {
          // 选人控件数据格式化
          const result = td.value.map((v: any) => {
            return {
              id: v.id,
              name: v.name,
              type: v.type,
            };
          });
          td.value =
            typeof result === "object" ? JSON.stringify(result) : result;
        }
        delete td.list;
        delete td.valueList;
        delete td.index;
        delete td.type;
        delete td.errorMsg;
        delete td.key;
      });
      // 处理业务规则
      if (this.eventData.bizActions && this.eventData.bizActions.length) {
        this.eventData.bizActions = this.eventData.bizActions.map(
          (biz: any) => {
            return biz.key;
          }
        );
      }
      if (this.type === "workflow") {
        const _p = { key: this.eventObj.eventCode, value: this.eventData };
        this.setWorkflowEventHandler(_p);
      } else {
        const value = JSON.parse(JSON.stringify(this.eventData));
        this.setPropValue({
          key: `acticityEvent.${this.eventObj.eventCode}`,
          value,
        });
      }
      this.onClose();
    }
  }

  /**
   * 检查是否有闭环
   */
  async checkClosedCycle() {
    if (!this.eventData.dataDisposals) return;
    const links: Array<any> = this.eventData.dataDisposals
      .filter((item: any) => item.valueType === "DYNAMIC")
      .map((item: any) => {
        const startNode = this.canSelectDataItem.find(
          (dt: any) => dt.code === item.value
        );
        const endNode = this.canSelectDataItem.find(
          (dt: any) => dt.code === item.property
        );
        return {
          start: {
            code: item.value,
            name: startNode ? startNode.name : item.value,
          },
          end: {
            code: item.property,
            name: endNode ? endNode.name : item.property,
          },
        };
      });
    const nodeGraph: any = new NodeGraph(links);
    const routes: any = await nodeGraph.getAllRoute();
    const cycleRoute = routes.find(
      (route: any) => route.originNode.code === route.arrowNode.code
    );
    if (cycleRoute) {
      this.$message.warning(
        `存在赋值逻辑闭环问题，请检查以下数据项的赋值：${cycleRoute.path}`
      );
    }
    return !!cycleRoute;
  }

  /**
   * 清除消息接收人
   */
  clearReceiver() {
    this.eventData.receiver = "";
    this.showModal = false;
  }
  clearEmailReceiver() {
    this.eventData.emailReceiver = "";
    this.showEmailModal = false;
  }

  clearSmsReceiver() {
    this.eventData.smsDisposal.receiver = "";
    this.showSmsModal = false;
  }

  @Watch("value")
  onValueChange(v: any) {
    this.isShow = v;
    if (this.isShow) {
      this.dataMounted();
      this.getParamsList()

      this.$nextTick(() => {
        // @ts-ignore
        document.querySelector('.event-drawer .ant-drawer-body').addEventListener('scroll', this.scroll)
      })
    }else{
      // @ts-ignore
      document.querySelector('.event-drawer .ant-drawer-body').removeEventListener('scroll', this.scroll)
    }
  }

  scroll(){
    // @ts-ignore
    if(document.activeElement.tagName !== 'BODY'){
      // @ts-ignore
      document.activeElement.blur()
    }
  }
}
</script>
<style lang="less" scoped>
.prames-list {
  .list-header {
    height: 32px;
    background: #fafafa;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    padding: 0 24px;
    line-height: 32px;
    color: #252525;
  }
  .list-body {
    .list-item {
      height: 40px;
      line-height: 40px;
      display: flex;
      padding: 0 24px;
      border-bottom: 1px solid #e8e8e8;
    }
    .empty{
      img{
        width: 80px;
      }
      text-align: center;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
    }
  }
  .list-value{
    width: 260px;
    .input-select-text{
      margin: 0;
    }
  }

  .list-name {
    width: 88px;
    text-align: left;
    margin-right: 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .list-info {
    flex: 1;
    align-items: center;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    i {
      margin-left: 6px;
    }
  }
}


.event-box {
  /deep/.ant-table-tbody > tr > td {
    padding: 3px 16px;
    color: rgba(0, 0, 0, 0.85);
  }
  /deep/.ant-table-thead > tr > th {
    padding: 8px 10px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.65);
  }
  .title {
    font-weight: bold;
    margin-bottom: 16px;
    color: rgba(0, 0, 0, 0.85);
  }
  .event-content {
    border-bottom: 1px solid #e8e8e8;
    padding-bottom: 24px;
    margin-bottom: 24px;
    /deep/.ant-form-item-label {
      width: 72px;
      text-align: left;
    }
    .left {
      margin-right: 32px;
    }
    .business-box {
      /deep/.ant-form-item-label {
        width: 106px;
        text-align: left;
      }
    }
    /deep/.ant-select-selection-selected-value {
      color: rgba(0, 0, 0, 0.85);
    }
    /deep/.ant-table-empty {
      .ant-table-body {
        overflow: inherit !important;
      }
      .ant-table-placeholder {
        display: none;
      }
    }
    .p-w-section {
      width: 212px;
    }
    .v-t-section {
      width: 106px;
    }
    .value {
      width: 216px;
      .ant-calendar-picker {
        width: 216px !important;
      }
    }
  }
  .last {
    border-bottom: none;
  }
  .business-box {
    margin-bottom: 66px;
  }
  .icon {
    cursor: pointer;
  }
  .add-item {
    color: @primary-color;
    text-align: center;
    margin-top: 8px;
    user-select: none;
    cursor: pointer;
    margin-bottom: 20px;
  }
  .inner-padding {
    margin: 10px 0;
  }
  .footer {
    text-align: center;
    position: absolute;
    height: 50px;
    line-height: 50px;
    left: 0;
    bottom: 0;
    width: 100%;
    background: #fff;
    border-top: 1px solid #e8e8e8;
  }
}
.resize {
  display: inline-block;
  height: 22px;
  width: calc(100% + 32px);
  padding: 0 16px;
  -webkit-transform: translateX(-16px);
  transform: translateX(-16px);
  border-left: 1px solid #e8e8e8;
  font-weight: 600;
}
.resize-first {
  border-left: none;
}
.clear-receiver-input {
  /deep/.ant-form-item-control {
    position: relative;
  }
  .clear-receiver-icon {
    position: absolute;
    z-index: 9;
    right: 10px;
    top: 2px;
    color: rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }
}
.select-empty-content {
  margin: 8px 0;
  text-align: center;
}
/deep/.h3-organization__label {
  background: #fff;
}
.has-error /deep/.h3-organization__label,
.has-error /deep/.h3-organization__label:hover {
  border: 1px solid #f5222d !important;
}
/deep/.task-select{
  /deep/.ant-select-selection{
    border: 1px solid #d9d9d9 !important;
  }
}

.input-select-text{
  margin: 10px 0;
}
.input-select-hint{
  line-height: 1em;
}
</style>
<style lang="less">
.event-drawer {
  .ant-drawer-body {
    overflow: auto;
  }
}
.biz-rule-confirm {
  /deep/.ant-modal-confirm-title {
    display: none;
  }
  /deep/.ant-modal-confirm-content {
    word-break: break-all;
  }
}
</style>
