
<template>
  <div>
    <h3-panel
      v-for="(group,index) in groups"
      :title="group.name"
      :collapsible="true"
      :key="index"
      :bold="true"
    >
      <div class="box">
        <control-block
          v-for="c in group.controls"
          :key="c.code"
          :options="c"
          :class="{ disabled : isUsed(c.code)}"
          v-h3-drag
        ></control-block>
      </div>
    </h3-panel>
  </div>
</template>


<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";

import common from "@cloudpivot/common/pc";

import {getComponentsInfo} from "@cloudpivot/form/utils"

import ControlBlock from "./control-block.vue";

import controlBill from "../typings/control-bill";

import * as dataitemStore from "../stores/data-items.store-helper";

@Component({
  name: "control-panel",
  components: {
    ControlBlock,
    H3Panel: common.components.Panel
  }
})
export default class ControlPanel extends Vue {
  // groups = controlBill.group;
  groups:any = []
  created() {
    this.buildPanel()
  }
  // 构建 Panel
  buildPanel() {
    let registerComponentInfo = getComponentsInfo()
    for(let gItem of controlBill.group) {
      let groupArray:any = {name: gItem.name, controls:[]}
      let componentInfo = registerComponentInfo[gItem.name]
      if(!componentInfo) {
        console.error(`没有 ${gItem.name} 类型组件注册!`)
        break
      }
      for(let ctrlItem of gItem.controls) {
        let ck = ctrlItem.type+"";
        if (componentInfo[ck]) {
         groupArray.controls.push({
           ...componentInfo[ck],
           ...ctrlItem,
         })
         delete componentInfo[ck]
        }
      }
      this.groups.push(groupArray)
    }
    for(let rcKey of Object.keys(registerComponentInfo)) {
      let rcItem = registerComponentInfo[rcKey]
      for(let cItemKey of Object.keys(rcItem)) {
        let cItem = rcItem[cItemKey]
        let t = false
        for(let gItem of this.groups) {
          if (gItem.name === cItem.group) {
            t = true
            gItem.controls.push({
              ...cItem,
              type: cItem.formControllerType,
              name: cItem.title,
            })
            break
          }
        }
        if(!t) {
          this.groups.push({
            name: cItem.group,
            controls: [{
              ...cItem,
              type: cItem.formControllerType,
              name: cItem.title,
            }]
          })
        }
      }
    }
  }
  mounted() {
  }
  isUsed(code: string) {
    if (!code) {
      return false;
    }
    const item = dataitemStore
      .getDataItems(this)
      .filter(x => x.isSystem)
      .find(x => x.code === code);
    if (!item) {
      return false;
    }
    return item.used;
  }
}
</script>


<style lang="less" scoped>
.box {
  text-align: left;
  padding-left: 8px;
}

/deep/.h3-panel-header {
  display: block !important;
}
</style>
