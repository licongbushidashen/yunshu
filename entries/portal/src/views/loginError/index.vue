<template>
  <div class="login-error">
    <div class="login-error-head">
      <img src="../../assets/images/yslogo.png" />
    </div>
    <div class="login-error-content">
      <div class="login-error-content-contain">
        <div class="img-content">
            <img src="./tip-icon.png" alt="">
            <div class="tip">系统未配置组织信息，请联系管理员处理</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Model } from 'vue-property-decorator';

@Component({
  name: 'LoginError'
})
export default class LoginError extends Vue {

}
</script>

<style lang="less" scoped>
.login-error {

  .login-error-head {
    width: 100%;
    height: 64px;
    line-height: 64px;
    padding-left: 24px;
    background:rgba(255,255,255,1);
    box-shadow:0px 2px 8px 0px rgba(30,85,255,0.1);

    & > img {
      max-height: 30px !important;
    }
  }
  .login-error-content {
    height: calc(100% - 64px);
    min-width: 1066px;
    background: #fff;
    &-contain {
      width: 1066px;
      height: 100%;
      overflow: hidden;
      margin: 0 auto;
      
      .img-content {
          margin: 0 auto;

          width: 290px;

          img {
            display: block;

            width: 290px;
          }

          .tip {
            margin-top: 24px;
            
            line-height:20px;
            text-align: center;
            
            font-family:PingFangSC-Regular,PingFang SC;
            font-weight:400;
            color:rgba(0,0,0,0.65);
          }

      }
    }
  }
  
}

</style>
