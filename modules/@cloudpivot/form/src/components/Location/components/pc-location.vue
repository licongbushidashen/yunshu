
<template>
  <SmartLocation
    v-if="!readonly"
    v-model="val"
    :vid="control.key"
    @ok="valueChange"
    :showTip="controlOpts.displayMode === 'accurate'"
    :placeholder="placeholder"
    :disabled="readonlyFormula"
    :initMap="initMap"
    :isShowSearch="isShowSearch"
  ></SmartLocation>

  <div v-else>{{ address }}</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
  RendererFormControl,
  LocationOptions,
  FormControlType
} from "@cloudpivot/form/schema";

import SmartLocation from "@cloudpivot/form/src/common/components/smart-location/index.vue";

import { FormLocationControl } from "@cloudpivot/form/src/common/controls/form-location-control";

import { FromAddressValueService } from "@cloudpivot/form/src/common/services";

@Component({
  name: "input-location",
  components: {
    SmartLocation
  }
})
export default class InputLocation extends FormLocationControl {
  get initMap() {
    console.log(FormLocationControl.service)
    return FormLocationControl.service.initMap;
  }

  get isShowSearch() {
    const options: any = this.control.options
    if (!options) {
      return true
    }
    return options.showSearch === 'false' ? false : true
  }

  valueChange(val:any) {
    if(val.adcode){
      FromAddressValueService.setAddressVal(val.adcode).then((value:any) => {
        // this.ctrl.value = Object.assign(this.val,value);
        this.setValue(Object.assign(this.val,value));
      });
    }else{
      this.ctrl.value = null;
    }
  }
}
</script>

<style lang="less" scoped>
</style>

