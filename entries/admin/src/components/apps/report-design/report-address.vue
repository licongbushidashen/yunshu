
<template>
  <pca-selector
    :inReport="true"
    :prevConfirm="true"
    v-model="innerValue"
    @change="valueChange"
  ></pca-selector>
</template>

<script lang="ts">
import { Vue, Component, Model } from "vue-property-decorator";

import PcaSelector from "@cloudpivot/form/src/common/components/pca-selector/pca-selector.vue";

@Component({
  name: "report-address",
  components: {
    PcaSelector,
  },
})
export default class ReportAddress extends Vue {
  @Model("input", {
    default: () => [],
  })
  value!: any;

  get innerValue() {
    return this.value && this.value.length > 0 ? this.value[0].innerValue : {};
  }

  valueChange(val: any) {
    let adcode = val.provinceName||'';
    if (val.cityAdcode) {
      adcode = val.cityAdcode;
    }
    if (val.districtAdcode) {
      adcode = val.districtAdcode;
    }
    let res = { value: adcode, label: val.valString, innerValue: val};
    this.$emit("input", res);
  }
}
</script>

<style lang="less" scoped>
</style>