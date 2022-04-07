<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-12-08 19:47:39
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-10 11:32:39
-->
<template>
  <div>
    <a-modal
      class="datasource-container"
      :visible="show"
      :width="567"
      wrapClassName="refer-modal_wrap"
      title="数据源检测"
      :maskClosable="false"
      :destroyOnClose="true"
      :closable="true"
      :footer="null"
      @ok="close"
      @cancel="close">
      <div class="datasource-box">
        <div class="datasource-hint">
          <i class="icon aufontAll h-icon-all-exclamation-circle-o"></i>
          本次导入的集成服务中心使用的以下数据源，系统中无法查找<br />
          请在数据源页面添加如下数据源：
        </div>
        <h2>数据源编码</h2>
        <div class="datasource-content">
          <span>{{missedDataSourceCodes}}</span>
        </div>
        
        <div class="footer-box">
          <a-button  type="primary" @click="close">
             确定
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
@Component({ name: "data-source-detect", components: {} })
export default class DataSourceDetect extends Vue {
  @Prop() show!: boolean;
  @Prop() missedDataSourceCodes!:string;

  close() {
    this.$emit("close");
  }
}
</script>
<style lang='less' scoped>
.datasource-container {
  .datasource-box {
    .datasource-hint {
      width: 100%;
      height: 60px;
      background: #fffbe6;
      border-radius: 4px;
      border: 1px solid #ffe58f;
      padding: 10px 38px 0;
      position: relative;
      font-size: 14px;
      font-weight: 400;
      > i {
        position: absolute;
        font-size: 14px;
        color: #faad14;
        left: 16px;
        top: 10px;
      }
    }
    h2 {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      margin: 32px 0 8px;
      font-weight: 700;
    }
    .datasource-content {
      width: 100%;
      height: 142px;
      background: #fafafa;
      border-radius: 4px;
      overflow-y: auto;
      padding: 9px 12px;
      >span{
          font-size: 14px;
          color: rgba(0, 0, 0, 0.85);
          font-weight: 400;
      }
    }
  }
  .footer-box{
    display: flex;
    justify-content: flex-end;
    margin-top: 36px;
  }
}
</style>