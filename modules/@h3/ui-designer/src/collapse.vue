
<template>
  <a-collapse :activeKey="activeKey" :bordered="false">
    <a-collapse-panel 
      v-for="group in groups" 
      :header="group.label" 
      :key="group.value"
    >
      <slot :group="group" />
    </a-collapse-panel>
  </a-collapse>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide } from "vue-property-decorator";

import { Collapse, Input } from "@h3/antd-vue";

import { PropertyGroupInfo } from "@h3/designer-core/property-panel";

@Component({
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel
  }
})
export default class DesignerCollapse extends Vue {
  @Prop()
  groups!: PropertyGroupInfo[];

  @Prop()
  activeKey!: string[];
}
</script>
