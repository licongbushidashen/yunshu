<template>
  <div style="margin: 0 -5px;">
    <template v-for="(item, index) in computedAppList">
      <model-items
        :item="item"
        :key="index"
        v-bind="$attrs"
        v-on="$listeners"
        v-h3-drag
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import "@/directives/drag";
import ModelItems from "./modelItems.vue";
const icon = require("@/assets/images/appicon.png");

@Component({
  name: "AppListItem",
  components: {
    ModelItems,
  },
})
export default class AppListItem extends Vue {
  @Prop() computedAppList!: any;
  defaultAppIcon: any = icon;
}
</script>
