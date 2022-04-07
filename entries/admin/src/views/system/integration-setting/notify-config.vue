<template>
  <div class="notify-config">
    <!-- <div class="notify-config__header">
      <span>系统消息通知</span>
      <span class="header__tips">用户接收待办待阅等消息通知</span>
    </div> -->

    <!-- <a-row class="notify-config__item">
      <a-col :span="layout.left" class="notify-config__left">
        <span>总开关</span>
      </a-col>
      <a-col :span="layout.right" class="notify-config__center">
        <a-switch :disabled="!rootAdmin" v-model="mainSwitch"  class="switch" />
      </a-col>
    </a-row> -->

    <!-- <a-row class="notify-config__item">
      <a-col :span="layout.left" class="notify-config__left">
        <a-checkbox v-model="mainSwitch" @change="mainSwitchChange">
          全部
        </a-checkbox>
      </a-col>
    </a-row> -->

    <a-row class="notify-config__item">
      <a-col :span="layout.left" class="notify-config__left">
        <a-checkbox v-model="dingtalkSwitch" v-show="isEditConfig">
          钉钉消息通知
        </a-checkbox>
        <span v-show="!isEditConfig">
          钉钉消息通知
        </span>
      </a-col>
      <a-col :span="layout.right" class="notify-config__right">
        
        <div class="showOrg" :class="{isEditing: isEditConfig, isCloseNotify: !dingtalkSwitch}" @click="toSetOrg('dingtalk')">
          <!-- 编辑状态 -->
          <template v-if="isEditConfig">
            <template v-if="dingTalkSelected.length">
              <span>{{getName('dingtalk')}}</span>
              <span v-if="dingTalkSelected.length > 1">+{{dingTalkSelected.length - 1}}</span>
            </template>
            <template v-else>
              <span style="border: none;color: rgba(0,0,0,0.45);">未设置组织或未开启</span>
            </template>
          </template>

          <template v-else>
            <template v-if="dingtalkSwitch && dingTalkSelected.length">
              <template v-for="num in 5">
                <span :key="num">{{getName('dingtalk',num-1)}}</span>
              </template>


              <a-tooltip placement="bottom" overlayClassName="customTooltipStyle">
                <template slot="title">
                  {{getTitle('dingtalk')}}
                </template>
                <span class="count" v-if="dingTalkSelected.length > 5">+{{dingTalkSelected.length - 5}}</span>
              </a-tooltip>

              <!-- <span class="count" :title="getTitle('dingtalk')" v-if="dingTalkSelected.length > 5">+{{dingTalkSelected.length - 5}}</span> -->
            </template>
            <span v-else style="border: none;color: rgba(0,0,0,0.45);">未设置组织或未开启</span>
          </template>

          
          <font class="del-org" @click.stop="delOrg('dingtalk')">
            <i class="icon aufontAll h-icon-all-close"></i>
          </font>
        </div>
      </a-col>
    </a-row>

    <a-row class="notify-config__item">
      <a-col :span="layout.left" class="notify-config__left">
        <a-checkbox v-model="wechatSwitch" v-show="isEditConfig">
          企业微信消息通知
        </a-checkbox>
        <span v-show="!isEditConfig">
          企业微信消息通知
        </span>
      </a-col>

      
      <a-col :span="layout.right" class="notify-config__right">
        <div class="showOrg" :class="{isEditing: isEditConfig, isCloseNotify: !wechatSwitch}" @click="toSetOrg('wechat')">
          <!-- 编辑状态 -->
          <template v-if="isEditConfig">
            <template v-if="wechatSelected.length">
              <span>{{getName('wechat')}}</span>
              <span v-if="wechatSelected.length > 1">+{{wechatSelected.length - 1}}</span>
            </template>
            <template v-else>
              <span style="border: none;color: rgba(0,0,0,0.45);">未设置组织或未开启</span>
            </template>
          </template>

          <template v-else>
            <template v-if="wechatSwitch && wechatSelected.length">
              <template v-for="num in 5">
                <span :key="num">{{getName('wechat', num-1)}}</span>
              </template>

              <a-tooltip placement="bottom" overlayClassName="customTooltipStyle">
                <template slot="title">
                  {{getTitle('wechat')}}
                </template>
                <span class="count" v-if="wechatSelected.length > 5">+{{wechatSelected.length - 5}}</span>
              </a-tooltip>
              <!-- <span class="count" :title="getTitle('wechat')" v-if="wechatSelected.length > 5">+{{wechatSelected.length - 5}}</span> -->
            </template>
            <span v-else style="border: none;color: rgba(0,0,0,0.45);">未设置组织或未开启</span>
          </template>


          <font class="del-org" @click.stop="delOrg('wechat')">
            <i class="icon aufontAll h-icon-all-close"></i>
          </font>
        </div>
      </a-col>
    </a-row>

    <a-row class="notify-config__item">
      <a-col :span="layout.left" class="notify-config__left">
        <a-checkbox v-model="emailSwitch" v-show="isEditConfig">
          邮件消息通知
        </a-checkbox>
        <span v-show="!isEditConfig">
          邮件消息通知
        </span>
      </a-col>
      <a-col :span="layout.right" class="notify-config__right">
        <div class="showOrg" :class="{isEditing: isEditConfig, isCloseNotify: !emailSwitch}" @click="toSetOrg('email')">

          <!-- 编辑状态 -->
          <template v-if="isEditConfig">
            <template v-if="emailSelected.length">
              <span>{{getName('email')}}</span>
              <span v-if="emailSelected.length > 1">+{{emailSelected.length - 1}}</span>
            </template>
            <template v-else>
              <span style="border: none;color: rgba(0,0,0,0.45);">未设置组织或未开启</span>
            </template>
          </template>

          <template v-else>
            <template v-if="emailSwitch && emailSelected.length">
              <template v-for="num in 5">
                <span :key="num">{{getName('email', num-1)}}</span>
              </template>
              <a-tooltip placement="bottom" overlayClassName="customTooltipStyle">
                <template slot="title">
                  {{getTitle('email')}}
                </template>
                <span class="count" v-if="emailSelected.length > 5">+{{emailSelected.length - 5}}</span>
              </a-tooltip>
              <!-- <span  class="count" :title="getTitle('email')" v-if="emailSelected.length > 5">+{{emailSelected.length - 5}}</span> -->
            </template>
            <span v-else style="border: none;color: rgba(0,0,0,0.45);">未设置组织或未开启</span>
          </template>

          <font class="del-org" @click.stop="delOrg('email')">
            <i class="icon aufontAll h-icon-all-close"></i>
          </font>
        </div>
      </a-col>
    </a-row>

    <!-- <a-row class="notify-config__item">
      <a-col :span="layout.left" class="notify-config__left">
        <span>钉钉消息通知</span>
      </a-col>
      <a-col :span="layout.center" class="notify-config__center">
        <a-switch :disabled="!rootAdmin || !mainSwitch" v-model="dingtalkSwitch" class="switch" />
      </a-col>
      <a-col :span="layout.right" class="notify-config__right">
        <a-select mode="multiple" show-search style="width: 100%" :maxTagCount="1" :disabled="!rootAdmin || !mainSwitch" v-model="dingTalkSelected" @change="onDingTalkSelect">
          <template v-for="item in dingtalkList">
            <a-select-option
              :value="item.corpId"
              :key="item.corpId"
            >{{ item.name }}</a-select-option>
          </template>
        </a-select>
      </a-col>
    </a-row>

    <a-row class="notify-config__item">
      <a-col :span="layout.left" class="notify-config__left">
        <span>企业微信消息通知</span>
      </a-col>
      <a-col :span="layout.center" class="notify-config__center">
        <a-switch :disabled="!rootAdmin || !mainSwitch" v-model="wechatSwitch" class="switch" />
      </a-col>
      <a-col :span="layout.right" class="notify-config__right">
        <a-select mode="multiple" show-search style="width: 100%" :maxTagCount="1" :disabled="!rootAdmin || !mainSwitch" v-model="wechatSelected" @change="onWechatSelect">
          <template v-for="item in wechatList">
            <a-select-option
              :value="item.corpId"
              :key="item.corpId"
            >{{ item.name }}</a-select-option>
          </template>
        </a-select>
      </a-col>
    </a-row>

    <a-row class="notify-config__item">
      <a-col :span="layout.left" class="notify-config__left">
        <span>邮件消息通知</span>
      </a-col>
      <a-col :span="layout.center" class="notify-config__center">
        <a-switch :disabled="!rootAdmin || !mainSwitch" v-model="emailSwitch" class="switch" />
      </a-col>
      <a-col :span="layout.right" class="notify-config__right">
        <a-select mode="multiple" show-search style="width: 100%" :maxTagCount="1" :disabled="!rootAdmin || !mainSwitch" v-model="emailSelected" @change="onEmailSelect">
          <template v-for="item in emailList">
            <a-select-option
              :value="item.corpId"
              :key="item.corpId"
            >{{ item.name }}</a-select-option>
          </template>
        </a-select>
      </a-col>
    </a-row> -->
    <a-row class="notify-config__item" style="margin-top: 30px;">
      <a-col :span="layout.left" class="notify-config__left">
      </a-col>
      <a-col :span="layout.right" class="notify-config__left">
        <a-button type="primary" v-if="!isEditConfig" :disabled="!rootAdmin" @click="isEditConfig=true">编辑</a-button>
        <a-button type="primary" v-else :disabled="!rootAdmin" @click="save">保存</a-button>
      </a-col>
    </a-row>
    

    <set-org-scope
      :list="currentList"
      :currentSelected = "currentSelected"
      @setOrgScopeOver="setOrgScopeOver" 
     ref="setOrgScope" />

  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import OrgApi from "@/apis/organization";
import setOrgScope from './setOrgScope.vue'
import { TabPaneNames } from "../../app/model/datamodel.vue";

@Component({
  name: 'notify-config',
  components: {
    setOrgScope
  }
})
export default class NotifyConfig extends Vue{

  isEdit: boolean = true;

  isEditConfig:boolean = false

  emailList: any = [];

  dingtalkList: any = [];

  wechatList: any = [];

  dingtalkSettingList: any = [];

  wechatSettingList: any = [];

  emailSettingList: any = [];

  layout: any = {
    left: 7,
    center: 3,
    right: 10
  };

  currentSetOrg:string = 'dingtalk' // 当前配置的消息通知类型 dingtalk、wechat、email
  currentList:any[] = []
  currentSelected: Array<string> = []

  toSetOrg(type:string){
    if(!this.isEditConfig){
      return
    }
    this.currentSetOrg = type
    if(type === 'dingtalk'){
      if(!this.dingtalkSwitch){
        this.$message.warning('钉钉消息通知未开启！')
        return
      }
      this.currentList = this.dingtalkList
      this.currentSelected = this.dingTalkSelected
    }else if(type === 'wechat'){
      if(!this.wechatSwitch){
        this.$message.warning('企业微信消息通知未开启！')
        return
      }
      this.currentList = this.wechatList
      this.currentSelected = this.wechatSelected
    }else if(type === 'email'){
      if(!this.emailSwitch){
        this.$message.warning('邮件消息通知未开启！')
        return
      }
      this.currentList = this.emailList
      this.currentSelected = this.emailSelected
    }
    // this.orgScopeVisible = true
    // @ts-ignore
    this.$refs.setOrgScope.visible = true
  }
  setOrgScopeOver(selected:string[]){ // 设置组织范围结束
    if(this.currentSetOrg === 'dingtalk'){
      this.dingTalkSelected = selected
    } else if(this.currentSetOrg === 'wechat'){
      this.wechatSelected = selected
    } else if(this.currentSetOrg === 'email'){
      this.emailSelected = selected
    }
  }
  delOrg(type:string){
    this.currentSetOrg = type
    if(type === 'dingtalk'){
      this.dingTalkSelected = []
    }else if(type === 'wechat'){
      this.wechatSelected = []
    }else if(type === 'email'){
      this.emailSelected = []
    }
  }

  getTitle(type){
    let title = ''
    let currentSelected = this.dingTalkSelected
    if(type === 'dingtalk'){
      currentSelected = this.dingTalkSelected
    }else if(type === 'wechat'){
      currentSelected = this.wechatSelected
    }else if(type === 'email'){
      currentSelected = this.emailSelected
    }
    currentSelected.forEach((el, index) => {
      if(index>5){
        title += this.getName(type, index)
      }
      
    })
    return title
  }

  getName(type, count = 0){
    let name = ''
    let firstItem: any = {}
    let maxCount = 0
    if(type === 'dingtalk'){
      firstItem = this.dingtalkList.find((el:any) => el.corpId === this.dingTalkSelected[count])
      maxCount = this.dingTalkSelected.length
    }else if(type === 'wechat'){
      firstItem = this.wechatList.find((el:any) => el.corpId === this.wechatSelected[count])
      maxCount = this.wechatSelected.length
    }else if(type === 'email'){
      firstItem = this.emailList.find((el:any) => el.corpId === this.emailSelected[count])
      maxCount = this.emailSelected.length
    }
    if(firstItem){
      name = firstItem.name
    }
    if(count === 4 || count === maxCount-1){
      return name
    }
    return name ? name + ', ' : ''
  }


  wechatSelected: Array<string> = [];

  dingTalkSelected: Array<string> = [];

  emailSelected: Array<string> = [];

  mainSwitch: boolean = true;

  dingtalkSwitch: boolean = true;

  wechatSwitch: boolean = true;

  emailSwitch: boolean = true;

  rootAdmin: boolean = false;

  created() {
    this.getNotifyConfig();
  }

  @Watch("$store.state.System.User.loginedUserInfo.permissions", {
    immediate: true
  })
  watchPermissions(val) {
    this.rootAdmin = val && val.includes("ADMIN");
  }

  async getNotifyConfig() {
    const res = await OrgApi.getOrgaList();
    this.emailList = res.data.filter((item: any) => {
      return item.enabled
    });

    this.dingtalkList = res.data.filter((item: any) => {

      return item.enabled && ((item.syncType === 'PUSH' && item.relatedType === 'DINGTALK' && item.appkey !== '') ||  (item.syncType === 'PULL' && item.relatedType === 'DINGTALK'))

      return item.relatedType === 'DINGTALK' && item.enabled
    })

    this.wechatList = res.data.filter((item: any) => {
      return item.relatedType === 'WECHAT' && item.enabled
    })
    const info = await OrgApi.getNotifySetting();
    this.mainSwitch = info.data.mainSwitch;
    this.dingtalkSwitch = info.data.dingtalkSwitch;
    this.wechatSwitch = info.data.wechatSwitch;
    this.emailSwitch = info.data.emailSwitch;
    this.dingTalkSelected = info.data.dingtalkSettingList && info.data.dingtalkSettingList.map(item => {
      return item.corpId
    }) || []
    this.wechatSelected = info.data.wechatSettingList && info.data.wechatSettingList.map(item => {
      return item.corpId
    }) || []
    this.emailSelected = info.data.emailSettingList && info.data.emailSettingList.map(item => {
      return item.corpId
    }) || []
  }

  onDingTalkSelect(val: Array<string> = []) {

  }

  onWechatSelect(val: Array<string> = []) {

  }

  onEmailSelect(val: Array<string> = []) {

  }

  save() {
    this.dingtalkSettingList = this.dingtalkList.filter((item) => {
      return this.dingTalkSelected.includes(item.corpId)
    }).map((sub) => {
      return {corpId: sub.corpId, msgChannelType: 0}
    })
    this.wechatSettingList = this.wechatList.filter((item) => {
      return this.wechatSelected.includes(item.corpId)
    }).map((sub) => {
      return {corpId: sub.corpId, msgChannelType: 1}
    })
    this.emailSettingList = this.emailList.filter((item) => {
      return this.emailSelected.includes(item.corpId)
    }).map((sub) => {
      return {corpId: sub.corpId, msgChannelType: 4}
    })
    let params = {
      mainSwitch: this.mainSwitch,
      dingtalkSwitch: this.dingtalkSwitch,
      wechatSwitch: this.wechatSwitch,
      emailSwitch: this.emailSwitch,
      dingtalkSettingList: this.dingtalkSettingList,
      wechatSettingList: this.wechatSettingList,
      emailSettingList: this.emailSettingList
    }
    OrgApi.saveNotifySetting(params).then(res => {
      if(res.errcode === 0) {
        this.$message.success('保存成功')
        this.isEditConfig = false
      }else {
        this.$message.error('保存失败')
      }
    }).catch(err => {
      this.$message.error('保存失败')
    })
  }
}
</script>
<style lang="less" scoped>

.count{
  color: #17BC94;
  margin-left: 8px;
}
.showOrg{
  height: 32px;
  width: 270px;
  border-radius: 4px;
  padding: 0 4px;
  box-sizing: border-box;
  white-space: nowrap;
  
  span{
    line-height: 22px;
    padding: 0 4px;
    border-radius: 2px;
    display: inline-block;
    margin-right: 4px;
    max-width: 12em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgba(0, 0, 0, 0.65);
    margin-top: 5px;
  }
  .count{
    color: #17BC94;
    margin-left: 8px;
    cursor: pointer;
  }
  position: relative;
  .del-org{
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    display: none;
    color: rgba(0, 0, 0, 0.45);
  }
}

.isEditing{
  border: 1px solid #d9d9d9;
  cursor: pointer;
  &:hover{
    border:1px solid #17BC94;
    animation: all 0.3s;
    .del-org{
      display: block;
    }
  }
  span{
    border: 1px solid #d9d9d9;
    background-color: #fafafa;
    margin-top: 3px;
  }
}

.isEditing.isCloseNotify{
  background-color: #f5f5f5;
  cursor: not-allowed;
  &:hover{
    border:1px solid #d9d9d9;
    animation: all 0.3s;
    .del-org{
      display: none;
    }
  }
  span{
    color: rgba(0, 0, 0, 0.25);
  }
  
}

.notify-config {
  padding-top: 32px;
  width: 644px;
  &__header {
    padding-bottom: 20px;
    position: relative;
    // font-size:18px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    span {
      line-height: 26px;
      height: 26px;
    }

    .header__tips {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      padding-left: 8px;
    }
  }
  .notify-config__item {
    margin-bottom: 16px;
    line-height: 32px;
  }
}

.customTooltipStyle{
  /deep/.ant-tooltip-inner{
    background-color: #fff;
    color: rgba(0, 0, 0, 0.65);
  }
}
</style>
<style lang="less">
.customTooltipStyle{
  .ant-tooltip-inner{
    background-color: #fff;
    color: rgba(0, 0, 0, 0.65);
    z-index: 2;
    position: relative;
    padding: 20px 24px;
    text-align: justify;
  }
  .ant-tooltip-arrow{
    width: 12px;
    height: 12px;
    top: 0;
    z-index: 1;
    transform: rotate(45deg);
    box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 8px 0px;
  }
}
</style>