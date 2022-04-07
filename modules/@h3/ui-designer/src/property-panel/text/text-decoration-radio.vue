
<template>
    <a-radio-group 
      :value="value" 
      size="small"
      @change="onChange"
    >
      <a-radio-button value="none">
          <a-icon  />
      </a-radio-button>
      <a-radio-button value="underline">
        <a-icon type="underline" />
      </a-radio-button>
      <a-radio-button value="line-through">
        <a-icon type="strikethrough" />
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
export default class TextDecorationRadio extends Vue {

    @Model('change',{
        default : 'none'
    })
    value !: string

    onChange(evt: any){
      this.$emit('change', evt.target.value);
    }
    
}
</script>


<style lang="less" scoped>
@base10-padding-sm: 10px;

.ant-btn-group:not(:last-child){
  margin-right: @base10-padding-sm;
}

.ant-btn:active, .ant-btn.active {
  // color: @primary-color;
  background-color: #fff;
  // border-color: @primary-color;
}
</style>