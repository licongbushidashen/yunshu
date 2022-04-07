<template>
  <div class="commonsetting-panel">
    <!-- 消息通知 -->
    <!-- 20200114 子流程需要设置消息通知 -->
    <template v-if="type === 'PARTICIPANT' || type === 'SUB_INSTANCE'">
      <div class="message-notify-box">
        <property-widget label="钉钉/微信通知">
          <div slot="right" class="select-type">
            <a-select
              class="input-select"
              v-model="curActivityProps.todoDataItem.dataItemType"
              @change="changeNotifyType"
            >
              <a-select-option
                v-for="(item, index) in options"
                :key="index"
                :value="item.type"
                >{{ item.name }}</a-select-option
              >
            </a-select>
          </div>
        </property-widget>

        <property-widget label="自定义内容" v-show="isShowDataTitle">
          <div slot="right" class="right-box">
            <ellipsis-input :value="messageTxt" @click="showNotifyModal" />
          </div>
        </property-widget>

        <property-widget label="邮件通知">
          <div slot="right" class="right-box">
            <ellipsis-input
              :value="messageTxts"
              @click="handleClickEmailNotify"
            />
          </div>
        </property-widget>

        <property-widget label="短信通知">
          <div slot="right" class="right-box">
            <a-select
              class="input-select"
              v-model="curActivityProps.todoDataItem.type"
              @change="smsTypeChange"
            > 
              <a-select-option :value="0" >不开启</a-select-option>
              <a-select-option :value="1" >默认模板</a-select-option>
              <a-select-option :value="2" >自定义</a-select-option>
            </a-select>
          </div>
        </property-widget>

        <property-widget label="短信模板设置" v-if="curActivityProps.todoDataItem.type">
          <div slot="right" class="right-box">
            <ellipsis-input :value="getSmsTemplateStatus" @click="toShowSmsTemplateSetting" />
          </div>
        </property-widget>


      </div>
    </template>
    <!-- 消息通知弹窗 -->
    <MessageNotify
      v-model="isShowMessageNotify"
      @ok="updateNotify"
      typeStatus="dingtalk"
    />
    <MessageNotify
      v-model="isShowEmailNotify"
      :titleContent="titleContent"
      @ok="updateNotifyEmail"
      typeStatus="email"
    />

    <a-modal
      :title="$t('languages.Apps.FormDesignPage.OptionSetting')"
      width="480px"
      :visible="showSmsTemplateSetting"
      @cancel="showSmsTemplateSetting = false"
      @ok="handleOk"
      :cancelText="$t('languages.Apps.Cancel')"
      :okText="$t('languages.Apps.Ok')"
      class="modal"
      :maskClosable="false"
      :keyboard="false"
    >
      <div class="modal-wrapper">
        <div class="list">
          <label>模板类型</label>
          <div>
            <a-select
              class="input-select"
              v-model="smsCode"
              @change="smsCodeChange"
              style="width: 100%"
              :disabled="curActivityProps.todoDataItem.type === 1"
            > 
              <a-select-option v-for="(item,index) in filterSmsTemplateList" :key="index" :value="item.code" >{{item.name}}</a-select-option>
            </a-select>
          </div>
        </div>
        <p class="item-title">参数对应数据项设置</p>
        <div class="prames-list">
          <div class="list-header">
            <div class="list-name">参数列表</div>
            <div class="list-info">
              数据项设置
            </div>
          </div>
          <div class="list-body">
            <div class="list-item" v-for="(item, index) in paramsList" :key="index">
              <div :title="item.key" class="list-name">
                <span>{{item.key}}</span>
                <a-tooltip placement="top" overlayClassName="black-tooltip">
                  <template v-if="item.value" slot="title">{{item.value}}</template>
                  <i class="icon aufontAll h-icon-all-question-circle-o"></i>
                </a-tooltip>
              </div>
              <div class="list-info">
                <a-select
                  class="input-select input-select-text"
                  :getPopupContainer="getPopupContainer"
                  :placeholder="$t('languages.PlaceHolder.Select')"
                  v-model="item.param"
                  style="width: 100%"
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
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, namespace } from "vuex-class";
import PropertyWidget from "../base/propertyWidget.vue";
import ellipsisInput from "../base/ellipsisInput.vue";
import { SWTreeGenerator } from "../helper/helper";
/* 弹窗 */
import MessageNotify from "../modals/messageNotify.vue";

const WorkflowModule = namespace("Apps/Workflow");

const AppItemModule = namespace("Apps/AppItem");

const AppCenterModule = namespace("Apps/AppCenter");

import OrgApi from "@/apis/organization";

enum NotifyType {
  default = 0,
  customerize = 1,
}

@Component({
  name: "Notification",
  components: {
    PropertyWidget,
    ellipsisInput,
    MessageNotify,
  },
})
export default class Notification extends Vue {
  /**
   * 类型，根据不同类型展示不同的的属性
   * 流程属性：'workflow'
   * 连接线：'line'
   * 节点：对应的 activityType
   *  */
  @Prop() type!: any;

  @WorkflowModule.State("curActivityProps") curActivityProps: any;

  @WorkflowModule.Mutation("setPropValue") setPropValue: any;

  @WorkflowModule.Mutation("setSmsPropValue") setSmsPropValue: any;
  

  @AppCenterModule.Action("getAppList") getAppList: any;

  @WorkflowModule.State("WorkflowDataItem_origin") WorkflowDataItemOrigin: any;

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


  get getSmsTemplateStatus(){
    if(this.curActivityProps && this.curActivityProps.todoDataItems && Array.isArray(this.curActivityProps.todoDataItems)){
      let item:any = this.curActivityProps.todoDataItems.find((el: any) => el.belong === 'sms') || {}
      if(item.smsCode && (item.summary as any[]).every((el:any) => el.param) && !item.isAuto){
        this.getEnableSmsTemplateList()
        return '已设置'
      }
    }
    return '未设置'
  }

  @Watch('curActivityProps.todoDataItems',{
    immediate: true
  })
  onCurActivityPropsChange(val){
    if(this.curActivityProps && this.curActivityProps.todoDataItems && Array.isArray(this.curActivityProps.todoDataItems)){
      let item:any = this.curActivityProps.todoDataItems.find((el: any) => el.belong === 'sms') || {}
      if(item.smsCode){
        this.smsCode = item.smsCode
        this.getEnableSmsTemplateList()
      }else{
        this.smsCode = ''
        this.paramsList = []
      }
    }
  }

  toShowSmsTemplateSetting(){
    this.onCurActivityPropsChange(this.curActivityProps.todoDataItems);
    this.showSmsTemplateSetting = true;

    if(!this.smsCode){
      this.smsTypeChange(this.curActivityProps.todoDataItem.type)
    }
  }


  paramsList: any[] = [];
  showSmsTemplateSetting:boolean = false;
  smsCode:string = '';
  // 短信通知：类型改变
  smsTypeChange(value){
    if(value){
      this.getEnableSmsTemplateList()
    }


    let params:any = {
      "dataItemType": this.curActivityProps.todoDataItem.type,
      "belong": "sms", //短信通知
      "smsCode": '',
      "summary": [],
      "isAuto": true
    }

    if(value === 1){ 
      params.smsCode = 'Todo'
    }

    this.setSmsPropValue(params);

    this.onCurActivityPropsChange(this.curActivityProps.todoDataItems);
  }

  smsCodeChange(value){
    let item:any = this.smsTemplateList.find((el:any) => el.code === value)
    if(item){
      this.paramsList = JSON.parse(item.params)
    }else{
      this.paramsList = []
    }
  }

  
  get filterSmsTemplateList(){
    if(this.curActivityProps.todoDataItem.type === 0){
      return []
    }else if(this.curActivityProps.todoDataItem.type === 1){
      let res:any[] = this.smsTemplateList.filter(el => el.type === "1") || []
      this.smsCode = res[0] && res[0].code;
      let paramsList:any[] = res[0] && res[0].params && JSON.parse(res[0].params) || []

      if(this.curActivityProps && this.curActivityProps.todoDataItems && Array.isArray(this.curActivityProps.todoDataItems)){
        let item:any = this.curActivityProps.todoDataItems.find((el: any) => el.belong === 'sms') || {}

        console.log(this.curActivityProps.todoDataItems)
        if(item.smsCode){
          paramsList.forEach((el:any) => {
            let it = item.summary.find((ele: any) => ele.param === el.key)
            if(it){
              el.param = it.code
            }
          })
        }
      }
      this.paramsList = paramsList
      return res
    }else{
      let item:any = {};
      if(this.smsCode){
        item = this.smsTemplateList.find(el => el.code === this.smsCode) || {}
      }
      let paramsList:any[] = item && item.params && JSON.parse(item.params) || []

      if(this.curActivityProps && this.curActivityProps.todoDataItems && Array.isArray(this.curActivityProps.todoDataItems)){
        let item:any = this.curActivityProps.todoDataItems.find((el: any) => el.belong === 'sms') || {}

        if(item.smsCode){
          paramsList.forEach((el:any) => {
            let it = item.summary.find((ele: any) => ele.param === el.key)
            if(it){
              el.param = it.code
            }
          })
        }
      }
      this.paramsList = paramsList


      return this.smsTemplateList
    }
    
  }
  smsTemplateList:any[] = []; // 短信通知模板
  async getEnableSmsTemplateList(){
    await OrgApi.getEnableSmsTemplateList({}).then((res:any) => {
      if(res.errcode === 0){
        this.smsTemplateList = res.data;
      }
    })
  }

  handleOk(){
    let params:any = {
      "dataItemType": this.curActivityProps.todoDataItem.type,
      "belong": "sms", //短信通知
      "smsCode": this.smsCode,
      "summary": [],
      "type": this.curActivityProps.todoDataItem.type
    }

    let errList:any[] = [];
    this.paramsList.forEach((el:any) => {
      if(!el.param){
        errList.push(el.key)
      }
      params.summary.push({
        "isDataItem": 1,
        "code": el.param,
        "param": el.key
      })
    })
    if(errList.length){
      this.$message.warning(errList[0] + '参数未配置数据项')
      return
    }



    this.setSmsPropValue(params);
    this.showSmsTemplateSetting = false;
  }


  get messageTxt() {
    // 迭代31
    // 反馈单 通知内容要求清空
    if (Object.keys(this.curActivityProps.todoDataItem).length < 0) return "";

    if (this.curActivityProps.todoDataItem.title) {
      if (this.curActivityProps.todoDataItem.title.length > 0) {
        return "已设置";
      }
    }

    if (this.curActivityProps.todoDataItem.summary) {
      if (this.curActivityProps.todoDataItem.summary.length > 0) {
        return "已设置";
      }
    }
    return "";
  }

  get messageTxts() {
    if (
      this.curActivityProps.todoDataItems &&
      (this.curActivityProps.todoDataItems.length <= 0 ||
        Object.keys(this.curActivityProps.todoDataItems[0]).length < 0)
    )
      return "";
    let val = "";
    this.curActivityProps.todoDataItems &&
      this.curActivityProps.todoDataItems.forEach((i) => {
        if (i.belong === "email") {
          if (i.title) {
            if (i.length > 0) {
              val = "已设置";
            }
          }

          if (i.summary) {
            if (i.summary.length > 0) {
              val = "已设置";
            }
          }
        }
      });

    return val;
  }

  options: Array<any> = [
    {
      type: NotifyType.default,
      name: "系统默认通知",
    },
    {
      type: NotifyType.customerize,
      name: "自定义通知",
    },
  ];

  titleContent = {
    title: "邮件通知内容设置",
    emailTitle: "邮件标题",
    emailContent: "邮件内容",
  };

  isShowMessageNotify: boolean = false; // 是否展示消息通知弹窗
  isShowEmailNotify: boolean = false;

  get isShowDataTitle() {
    if (this.curActivityProps.todoDataItem) {
      return (
        this.curActivityProps.todoDataItem.dataItemType ===
        NotifyType.customerize
      );
    }
    return false;
  }

  async mounted() {}

  /**
   * 弹出消息通知弹窗
   */
  showNotifyModal() {
    this.isShowMessageNotify = true;
  }

  handleClickEmailNotify() {
    this.isShowEmailNotify = true;
  }

  /**
   * 更新消息通知数据
   */
  updateNotify(data: any) {
    const { title, summary } = data;
    this.setPropValue({
      key: "todoDataItem.summary",
      value: summary,
    });

    this.setPropValue({
      key: "todoDataItem.title",
      value: title,
    });
    this.handleSelectData(title, summary, "dingtalk", "email");
  }
  /**
   * 更新邮件消息通知数据
   */
  updateNotifyEmail(data: any) {
    const { title, summary } = data;
    this.handleSelectData(title, summary, "email", "dingtalk");
  }


  handleSelectData(title, summary, logo, logos) {
    const value = [{ dataItemType: 1, belong: logo, title, summary }];
    if (
      this.curActivityProps.todoDataItems &&
      this.curActivityProps.todoDataItems.length > 0
    ) {
      this.curActivityProps.todoDataItems.forEach((v) => {
        if (v.belong === logos) {
          value.push(v);
        }
      });
    }
    this.setPropValue({
      key: "todoDataItems",
      value,
    });
  }
  /**
   * 切换消息通知类型后，
   * 应该清空无效的消息内容
   */
  changeNotifyType(value: any) {
    if (value === NotifyType.customerize) {
      const { summary } = this.curActivityProps.todoDataItem;
      console.log("summary ->", summary);

      if (Array.isArray(summary) && summary.length) {
        this.setPropValue({
          key: "todoDataItem.summary",
          value: "",
        });

        this.setPropValue({
          key: "todoDataItem.title",
          value: [],
        });
        if (
          this.curActivityProps.todoDataItems &&
          this.curActivityProps.todoDataItems.lenght > 0
        ) {
          let val = this.curActivityProps.todoDataItems.filter(
            (v) => v.belong === "email"
          );
          if (!val) {
            val = [
              {
                dataItemType: 1,
                belong: "email",
                summary: [],
                title: [],
              },
            ];
          }
          this.setPropValue({
            key: "todoDataItems",
            value: val,
          });
        }
      }
    } else {
      let val =
        this.curActivityProps.todoDataItems &&
        this.curActivityProps.todoDataItems.map((v) => {
          if (v.belong === "dingtalk") {
            v.dataItemType = 0;
            v.title = [];
            v.summary = "";
          }
          return v;
        });
      let obj = this.curActivityProps.todoDataItem;
      obj.dataItemType = 0;
      obj.title = [];
      obj.summary = "";
      this.setPropValue({
        key: "todoDataItem",
        value: obj,
      });
      if (val) {
        this.setPropValue({
          key: "todoDataItems",
          value: val,
        });
      }
    }
  }
}
</script>


<style lang="less" scoped>
.modal-wrapper{
  height: 400px;
  overflow-y: auto;
  .list{
    display: flex;
    align-items: center;
    label{
      width: 88px;
      margin-right: 8px;
    }
    & > div{
      flex: 1;
    }
  }
}

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
  }
  .list-name {
    width: 88px;
    text-align: left;
    margin-right: 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    span{
      display: inline-block;
      width: 70px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .list-info {
    flex: 1;
    display: flex;
    align-items: center;
    i {
      margin-left: 6px;
    }
  }
}
.item-title{
  height: 22px;
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
  line-height: 22px;
  margin: 35px 0 12px 0;
}

</style>