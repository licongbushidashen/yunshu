
<template>
  <div class="app-background">
    <div class="line">
      <div class="item">
        <div class="name">{{ $t('designer.css.width') }}</div>
        <div class="desc">
          <a-input
            v-model="width"
            @blur="evt => onPropChange('width',evt.target.value)"
          />
        </div>
      </div>
      <div class="item">
        <div class="name">{{ $t('designer.css.height') }}</div>
        <div class="desc">
          <a-input
            v-model="height"
            @blur="evt => onPropChange('height',evt.target.value)"
          />
        </div>
      </div>
    </div>
    <div class="line">
      <div class="item">
        <div class="name">{{ $t('designer.css.color') }}</div>
        <div class="desc">
          <ColorPicker :fill="true" :value="color" 
            @change="val => onPropChange('color', val)"
          />
        </div>
      </div>
      <div class="item">
        <div class="name">{{ $t('designer.css.opacity') }}</div>
        <div class="desc">
          <a-input-number
            v-model="opacity"
            :min="0"
            :max="100"
            style="width:100%"
            :formatter="value => `${value}%`"
            :parser="value => value.replace('%', '')"
            @blur="evt => onPropChange('opacity',evt.target.value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins } from "vue-property-decorator";

import { Input, InputNumber } from '@h3/antd-vue';

import { PropertyComponent } from '@h3/designer-core/property-panel';

import ColorPicker from '../color-picker/color-picker.vue';

@Component({
  components:{
    AInput: Input,
    AInputNumber: InputNumber,
    ColorPicker
  }
})
export default class backgroundSetter extends Mixins(PropertyComponent) {
  
  width: string = this.value.width.value;
  height: string = this.value.height.value;
  opacity: string = this.value.opacity.value;

  get color(){
    return this.value.color.value;
  }

  onPropChange(key: string,value:any){
    this.value[key].value = value;
    // console.log(key, value, this.color);
    this.emitChange(this.value);
  }

}
</script>

<style lang='less' scoped>
  @import url('../common.less');
  .app-background{
    font-size: 12px;
  }
</style>
