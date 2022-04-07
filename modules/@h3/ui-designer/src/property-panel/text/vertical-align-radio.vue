
<template>
    <a-radio-group 
      :value="value" 
      size="small"
      @change="onChange"
    >
      <a-radio-button value="top">
          <a-icon type="align-right" />
      </a-radio-button>
      <a-radio-button value="middle">
          <a-icon type="align-center" />
      </a-radio-button>
      <a-radio-button value="bottom">
          <a-icon type="align-left" />
      </a-radio-button>
    </a-radio-group>
</template>


<script lang="ts">
import { Component, Vue, Prop, Model } from "vue-property-decorator";

import { Radio, Icon } from '@h3/antd-vue'

@Component({
  components: {
    AIcon: Icon,
    ARadioGroup: Radio.Group,
    ARadioButton: Radio.Button
  }
})
export default class VerticalAlignRadio extends Vue {

    @Model('change',{
        default : 'middle'
    })
    value !: string

    onChange(evt: any){
      this.$emit('change', evt.target.value);
    }
    
}
</script>


<style lang="less" scoped>
/deep/i.anticon{
  transform: rotate(270deg);
}
</style>