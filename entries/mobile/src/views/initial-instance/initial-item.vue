<template>
  <span>
    <form-empty v-if="showEmpty" :isClose="true" />
    <initial-item v-else />
  </span>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import flowCenter from "@cloudpivot/flow-center/mobile";

import { State } from "vuex-class";

import * as platform from "@cloudpivot/platform";

import FormEmpty from "../form/empty.vue";

@Component({
  name: "initial-items",
  components: {
    InitialItem: flowCenter.components.InitialItem,
    FormEmpty,
  },
})
export default class InitialItems extends Vue {
  @State("appName") appName!: any;

  appCode: string = "";

  showEmpty: boolean = false;

  created() {
    this.appCode = this.$route.params.appCode;
    if (this.appCode === "ben" && !this.appName) {
      this.showEmpty = true;
    }
    platform.service.setTitle(this.appName);
  }
}
</script>

<style lang="less" scoped>
</style>
