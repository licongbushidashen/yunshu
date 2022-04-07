<template>
  <div class="single-app">
    <app-header></app-header>
    <div class="single-app__main">
      <router-view></router-view>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue} from 'vue-property-decorator';
import AppHeader from '../../components/single-app/app-header.vue';
import * as FormCommentIns from '@cloudpivot/api';
import { Mutation, namespace } from "vuex-class";
const SystemModule = namespace("System/System");

@Component({
  name: 'single-app',
  components: {
    AppHeader
  }
})
export default class SingleApp extends Vue {
  @SystemModule.Mutation("setUserInfo") setUserInfo: any;
  created() {
    FormCommentIns.FormCommentApi.getUserInfo().then((res:any) => {
      if (res.errcode === 0) {
        sessionStorage.setItem("user", JSON.stringify(res.data));

        this.setUserInfo(res.data)

      }
     
    });
  }
}

</script>
<style lang='less' scoped>
@import "../../styles/themes/default.less";
.single-app{
  background: @main-background;
  &__main {
    flex: 1;
    position: relative;
    overflow: hidden;
  //   position: absolute;
  //   top: 64px;
  //   left: @base4-padding-md;
  //   right: @base4-padding-md;
  //   bottom: @base4-padding-md;
  }
}
</style>
