
<template>
  <div class="app-border">
    <div class="border-handle">
      <div class="around">
        <a-icon
          type="border-left"
          @click="chooseBorder('left')"
          :class="{'ant-desigener-font-color':borderArr.includes('left')}"
        />
      </div>
      <div class="mid">
        <a-icon
          type="border-top"
          @click="chooseBorder('top')"
          :class="{'ant-desigener-font-color':borderArr.includes('top')}"
        />
        <a-icon
          type="lock"
          class="small-font ant-desigener-font-color"
          v-show="borderLock"
          @click="borderLockClick"
        />
        <a-icon
          type="unlock"
          class="small-font"
          v-show="!borderLock"
          @click="borderLockClick"
        />
        <a-icon
          type="border-bottom"
          @click="chooseBorder('bottom')"
          :class="{'ant-desigener-font-color':borderArr.includes('bottom')}"
        />
      </div>
      <div class="around">
        <a-icon
          type="border-right"
          @click="chooseBorder('right')"
          :class="{'ant-desigener-font-color':borderArr.includes('right')}"
        />
      </div>
    </div>
    <div class="line">
      <div class="item">
        <div class="name">{{ $t('designer.css.lineStyle') }}</div>
        <div class="desc">
          <a-select :disabled="!borderArr.length" v-model="borderStyle" @change="val => onPropChange('border-style', val)">
            <a-select-option value="none">{{ $t('designer.css.none') }}</a-select-option>
            <a-select-option value="solid"><a-icon type="minus"/></a-select-option>
            <a-select-option value="dashed"><a-icon type="dash"/></a-select-option>
            <a-select-option value="dotted"><a-icon type="small-dash"/></a-select-option>
          </a-select>
        </div>
      </div>
      <div class="item">
        <div class="name">{{ $t('designer.css.width') }}</div>
        <div class="desc">
          <a-input
           :disabled="!borderArr.length"
            v-model="borderWidth"
            @blur="evt => onPropChange('border-width', evt.target.value)"
          />
        </div>
      </div>
      <div class="item">
        <div class="name">{{ $t('designer.css.color') }}</div>
        <div class="desc">
          <ColorPicker :disabled="!borderArr.length" :fill="true" :value="borderColor" 
            @change="val => onPropChange('border-color', val)"
          />
        </div>
      </div>
    </div>

    <div class="line">
      <div class="item">
        <div class="name">{{ $t('designer.css.radius') }}</div>
        <div class="desc">
          <a-input
            :value="borderTopLeftRadius"
            @change="evt => onPropChange('border-top-left-radius', evt.target.value)"
          >
            <a-icon slot="addonBefore" type="radius-upleft"/>
          </a-input>
        </div>
      </div>
      <div class="item">
        <div class="name" style="visibility:hidden">{{ $t('designer.css.radius') }}</div>
        <div class="desc">
          <a-input
            v-model="borderTopRightRadius"
            @change="evt => onPropChange('border-top-right-radius', evt.target.value)"
          >
            <a-icon slot="addonBefore" type="radius-upright"/>
          </a-input>
        </div>
      </div>
    </div>
    <div class="lock">
      <div class="lock-icon">
        <a-icon
          type="lock"
          class="ant-desigener-font-color"
          v-show="radiusLock"
          @click="radiusLock=false"
        />
        <a-icon
          type="unlock"
          v-show="!radiusLock"
          @click="radiusLock=true"
        />
      </div>
    </div>
    <div class="line">
      <div class="item">
        <div class="name"></div>
        <div class="desc">
          <a-input
            v-model="borderBottomLeftRadius"
            @change="evt => onPropChange('border-bottom-left-radius', evt.target.value)"
          >
            <a-icon slot="addonBefore" type="radius-bottomleft"/>
          </a-input>
        </div>
      </div>
      <div class="item">
        <div class="name"></div>
        <div class="desc">
          <a-input
            v-model="borderBottomRightRadius"
            @change="evt => onPropChange('border-bottom-right-radius', evt.target.value)"
          >
            <a-icon slot="addonBefore" type="radius-bottomright"/>
          </a-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins } from "vue-property-decorator";

import { Input, InputNumber, Icon, Select } from '@h3/antd-vue';

import { PropertyComponent } from '@h3/designer-core/property-panel';

import ColorPicker from './color-picker/color-picker.vue';

@Component({
  components:{
    AIcon: Icon,
    ASelect: Select,
    ASelectOption: Select.Option,
    AInput: Input,
    ColorPicker
  }
})
export default class backgroundSetter extends Mixins(PropertyComponent) {
  
  'borderStyle': string = this.value['border-style'].value;
  'borderWidth': string = this.value['border-width'].value;

  borderLock:boolean = true // border锁
  radiusLock:boolean = false // radius锁
  borderArr:string[] = this.value.borderSides.value; // border方向 'Left', 'Right', 'Top', 'Bottom'

  get borderColor(){
    return this.value['border-color'].value;
  }
  get borderTopLeftRadius(){
    return this.value['border-top-left-radius'].value;
  }
  get borderTopRightRadius(){
    return this.value['border-top-right-radius'].value;
  }
  get borderBottomLeftRadius(){
    return this.value['border-bottom-left-radius'].value;
  }
  get borderBottomRightRadius(){
    return this.value['border-bottom-right-radius'].value;
  }
  
  // 选中边框
  chooseBorder(borderName:string) {
    let index = this.borderArr.indexOf(borderName);
    if (index === -1) {
      this.borderArr.push(borderName);
    } else {
      this.borderArr.splice(index, 1);
    }
    if(this.borderArr.length === 4){
      this.borderLock = true;
    }else{
      this.borderLock = false;
    }
  }

  // 边框锁
  borderLockClick() {
    this.borderLock = !this.borderLock;
    this.borderArr = this.borderLock ? ['left', 'right', 'top', 'bottom'] : [];
  }
  
  onPropChange(key: string,value:any){
    if(key.indexOf('radius') != -1 && this.radiusLock){
      this.value['border-top-left-radius'].value = value;
      this.value['border-top-right-radius'].value = value;
      this.value['border-bottom-left-radius'].value = value;
      this.value['border-bottom-right-radius'].value = value;
    }
    // if(key.indexOf('border') != -1){
    //   this.borderArr.forEach((item)=>{
    //     let keyItems = key.split("-")
    //     keyItems.splice(1,0,item);
    //     let keyName = keyItems.join('-');
    //     this.value[keyName].value = value;
    //   })
    // }
    this.value[key].value = value;
    this.emitChange(this.value);
  }

}
</script>

<style lang='less' scoped>
  @import url('./common.less');
  .border-handle {
    height: 90px;
    margin-right: 12px;
    background:rgba(233,237,242,1);
    border-radius:4px;
    opacity:0.65;
    display: flex;
    justify-content: center;
    font-size: 30px;
    .around {
      width: 28px;
      height: 100%;
      display: flex;
      align-items: center;
    }
    .mid {
      width: 52px;
      height: 100%;
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      .small-font {
        font-size: 16px;
      }
    }
  }
  .lock {
    width: 100%;
    padding-right: 12px;
    margin-top: -4px;
    margin-bottom: 4px;
    .lock-icon {
      width:24px;
      height:18px;
      margin: 0 auto;
      line-height: 18px;
      background:rgba(233,237,242,1);
      border-radius:2px;
      opacity:0.65;
      text-align: center;
    }
  }
  .app-border {
    .green {
      color: #17BC94;
    }
  }
  .ant-desigener-font-color{
    color: #17BC94;
  }
</style>
