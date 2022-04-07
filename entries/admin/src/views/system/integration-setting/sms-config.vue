<template>
  <div class="sms-config">
    <a-tabs :defaultActiveKey="integrationDefaultActiveKey" @change="change">
      <!-- 短信配置 -->
      <a-tab-pane tab="短信配置" key="1">
        <div class="tabs__wrap">
          <div class="row">
            <div class="wrapper">
              <div class="label">
                <a-checkbox v-model="params.sms" v-if="isEditConfig"></a-checkbox>
                短信消息通知
              </div>
              <div v-if="!isEditConfig" class="status">{{params.sms ? '已开启' : '未开启'}}</div>
            </div>
            <p v-if="isEditConfig">开启后，所有流程中均可调用<span><font>短信模板</font></span>里的模板发起短信通知</p>
          </div>

          <div class="row">
            <div class="wrapper">
              <div class="label">
                <a-checkbox v-model="params.urge" v-if="isEditConfig"></a-checkbox>
                催办使用短信消息通知
              </div>
              <div v-if="!isEditConfig" class="status">{{params.urge ? '已开启' : '未开启'}}</div>
            </div>
            <p v-if="isEditConfig">流程运行时，催办信息可使用短信发送 <font>ps:催办是全局操作，不建议开启</font></p>
          </div>

          <div class="btns">
            <a-button v-if="!isEditConfig" @click="isEditConfig = true " type="primary">编辑</a-button>
            <a-button type="primary" v-else @click="save">保存</a-button>
          </div>
        </div>
      </a-tab-pane>

      <!-- 短信模板 -->
      <a-tab-pane tab="短信模板" key="2">
        <div class="tabs__wrap2">
          <p class="tips"><span class="icon aufontAll h-icon-all-Components_Warning"></span>短信模板主要用于与第三方短信服务商对接使用，使用时在服务商和产品上创建相同模板，并将服务商的模板编码写入产品模板中</p>
          <smsTemplateSetting />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import OrgApi from "@/apis/organization";
import smsTemplateSetting from './sms-template-setting.vue'

@Component({
  name: "sms-config",
  components: {
    smsTemplateSetting
  },
})
export default class smsConfig extends Vue {
  integrationDefaultActiveKey: string = "1";
  isEditConfig:boolean = false;

  @Prop() parentKey!: string;

  @Watch('parentKey')
  onParentKeyChange(){
    this.change()
  }

  change(){
    this.isEditConfig = false;
  }

  save(){
    this.updateSmsSetting()
  }

  // 更新短信通知开关状态
  async updateSmsSetting(){
    await OrgApi.updateSmsSetting({
      todoSwitch: this.params.sms ? 'true' : 'false',
      urgeSwitch: this.params.urge ? 'true' : 'false'
    }).then((res:any) => {
      if(res.errcode === 0){
        this.isEditConfig = false;
        this.getSmsSetting()
        this.$message.success(res.errmsg as string)
      }else{
        this.$message.error(res.errmsg as string)
      }
    })
  }

  // 获取短信通知开关状态
  async getSmsSetting(){
    await OrgApi.getSmsSetting({}).then((res:any) => {
      if(res.errcode === 0){
        (res.data as any[]).forEach(element => {
          if(element.settingCode === 'sms.todo.switch'){
            this.$set(this.params, 'sms', element.settingValue === 'true')
          }else if(element.settingCode === 'sms.urge.switch'){
            this.$set(this.params, 'urge', element.settingValue === 'true')
          }
        });
      }
    })
  }

  params:any = {
    sms: false,
    urge: false
  }

  created(){
    this.getSmsSetting()
  }
}
</script>
<style lang="less" scoped>
.row{
  display: flex;
  flex-direction: column;
  line-height: 22px;
  font-size: 14px;
  color: #000;
  margin-bottom: 20px;
  .wrapper{
    display: flex;
    .label{
      width: 204px;
      text-align: left;
      display: flex;
      align-items: center;
      label{
        margin-right: 8px;
      }
    }
  }
  p{
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    margin-top: 10px;
    span{
      display: inline-block;
      position: relative;
      margin: 0 3px;
      line-height: 1;
      font{
        display: inline-block;
        position: relative;
        background-color: #fff;
        z-index: 2;
        padding: 0 3px;
        color: #17BC94;
      }
      &::after{
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 8px;
        background-color: #17BC94;
        margin-left: -1px;
        margin-top: -1px;
        z-index: 1;
      }
      &::before{
        content: '';
        position: absolute;
        right: 0;
        bottom: 0;
        width: 4px;
        height: 8px;
        background-color: #17BC94;
        margin-right: -1px;
        margin-bottom: -1px;
        z-index: 1;
      }
    }
  }
}

.btns{
  padding-top: 4px;
}
// .tabs__wrap{
//   margin-top: 8px;
//   // padding-left: 26px;
// }
.tips{
  height: 32px;
  line-height: 30px;
  background: #FFFBE6;
  border-radius: 4px;
  border: 1px solid #FFE58F;
  padding: 0 16px;
  color: rgba(0, 0, 0, 0.65);
  span{
    margin-right: 10px;
    color: #FAAD14;
  }
}
</style>

<style lang="less">
.sms-config{
  .ant-tabs-bar{
    border-bottom: none;
  }

  .ant-tabs-nav{
    height: 34px;
    margin: 0 !important;
    .ant-tabs-tab{
      width: 90px;
      height: 32px;
      background: #FFFFFF;
      
      border: 1px solid #17BC94;
      line-height: 32px;
      padding: 0;
      margin: 0;
      text-align: center;
      &::before{
        display: none;
      }

      &:first-child{
        border-radius: 4px 0 0 4px;
        border-right: none;
      }
      &:nth-child(2){
        border-radius: 0 4px 4px 0;
        border-left: 1px solid #17BC94 !important;
      }
    }
    // .ant-tabs-tab-active{
    //   border-left: 1px solid #17BC94 !important;
    //   border-right: 1px solid #17BC94 !important;
    // }

    .ant-tabs-ink-bar{
      display: none !important;
    }
  }
}

</style>
