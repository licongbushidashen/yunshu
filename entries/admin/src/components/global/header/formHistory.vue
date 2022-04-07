<template>
  <div class="app-header">
    <div class="header-left">
      <router-link
        tag="i"
        :to="{ name: 'form-design', params: { appCode: this.$route.params.appCode, bizSchemaCode: this.$route.params.bizSchemaCode, sheetCode:this.$route.params.sheetCode } }"
        class="icon aufontAll h-icon-all-arrow-left-o"
      >
      </router-link>
      <span>历史版本</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'AppHeader'
})

export default class AppHeader extends Vue {

  beforeMount() {
    document.title = '历史版本';
  }
}
</script>

<style lang="less" scoped>
// .app-header {
//   background: #052535;
// }
.header-left {
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #fff;
  min-width: 170px;
  span {
    display: inline-block;
    margin-left: 25px;
  }
  .h-icon-all-arrow-left-o {
    cursor: pointer;
  }
}
.header-right {
  position: absolute;
  right: 130px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  color: #fff;
  span {
    display: inline-block;
    padding: 2px 8px;
    border:1px solid #fff;
    border-radius:4px;
    font-family:PingFangSC-Regular;
    font-weight:400;
    cursor: pointer;
  }
  .h-icon-all-question-circle-o {
    font-size: 20px;
  }
  .divide {
    display: inline-block;
    width: 1px;
    height: 20px;
    margin: 0 24px;
    background: rgba(255, 255, 255, 0.2);
  }
}
</style>
