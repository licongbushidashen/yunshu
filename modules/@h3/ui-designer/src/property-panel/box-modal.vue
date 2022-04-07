
<template>
  <div>
    <div class="box-model">
      <div
        class="box-margin position flex-box"
        :class="{noHover: hoverId &&  hoverId !== 'margin'}"
        @mouseenter="mouseenter('margin')"
        @mouseleave="mouseleave('margin')"
        >
        <div class="top flex-size flex-cont">
          <div class="content-s input" v-if="inputStatus === 'marginTop'">
            <a-input
              class="cont-input marginTop"
              type="text"
              size="small"
              :autoFocus="true"
              v-model="marginTop"
              @change="evt => onPropChange('margin-top', evt.target.value)"
              @blur="statusReset('')"
              @keydown.enter="statusReset('marginTop')" />
          </div>
          <div
            class="content-s"
            v-show="inputStatus !== 'marginTop'"
            @dblclick="doubleclick('marginTop')">{{ marginTop }}</div>
          <div class="text">margin</div>
        </div>
        <div class="mid margin flex-cont">
          <div class="left">
            <div class="content-s input" v-if="inputStatus === 'marginLeft'">
              <a-input
                class="cont-input tl marginLeft"
                :autoFocus="true"
                type="text"
                size="small"
                v-model="marginLeft"
                @change="evt => onPropChange('margin-left', evt.target.value)"
                @keydown.enter="statusReset('marginLeft')"
                @blur="statusReset('')" />
            </div>
            <div
              class="content-s"
              v-show="inputStatus !== 'marginLeft'"
              @dblclick="doubleclick('marginLeft')">{{ marginLeft }}</div>
          </div>
          <div class="right">
            <div class="content-s input" v-if="inputStatus === 'marginRight'">
              <a-input
                class="cont-input tr marginRight"
                :autoFocus="true"
                type="text"
                size="small"
                v-model="marginRight"
                @change="evt => onPropChange('margin-right', evt.target.value)"
                @keydown.enter="statusReset('marginRight')"
                @blur="statusReset('')" />
            </div>
            <div
              class="content-s"
              v-show="inputStatus !== 'marginRight'"
              @dblclick="doubleclick('marginRight')">{{ marginRight }}</div>
          </div>
        </div>
        <div class="btm flex-size flex-cont">
          <div class="content-s input" v-if="inputStatus === 'marginBottom'">
            <a-input
              class="cont-input marginBottom"
              :autoFocus="true"
              type="text"
              size="small"
              v-model="marginBottom"
              @change="evt => onPropChange('margin-bottom', evt.target.value)"
              @keydown.enter="statusReset('marginBottom')"
              @blur="statusReset('')" />
          </div>
          <div
            class="content-s"
            v-show="inputStatus !== 'marginBottom'"
            @dblclick="doubleclick('marginBottom')">{{ marginBottom }}</div>
        </div>
      </div>
      <div
        class="box-border position flex-box"
        :class="{noHover: hoverId &&  hoverId !== 'border'}"
        @mouseenter="mouseenter('border')"
        @mouseleave="mouseleave('border')"
        >
        <div class="top flex-size flex-cont">
          <div class="content-s input" v-if="inputStatus === 'borderTopWidth'">
            <a-input
              class="cont-input borderTopWidth"
              :autoFocus="true"
              type="text"
              size="small"
              v-model="borderTopWidth"
              @change="evt => onPropChange('border-top-width', evt.target.value)"
              @keydown.enter="statusReset('borderTopWidth')"
              @blur="statusReset('')" />
          </div>
          <div
            class="content-s"
            v-show="inputStatus !== 'borderTopWidth'"
            @dblclick="doubleclick('borderTopWidth')">{{ borderTopWidth }}</div>
          <div class="text">border</div>
        </div>
        <div class="mid border flex-cont">
          <div class="left">
            <div class="content-s input" v-if="inputStatus === 'borderLeftWidth'">
              <a-input
                class="cont-input tl borderLeftWidth"
              :autoFocus="true"
                type="text"
                size="small"
                v-model="borderLeftWidth"
                @change="evt => onPropChange('border-left-width', evt.target.value)"
                @keydown.enter="statusReset('borderLeftWidth')"
                @blur="statusReset('')" />
            </div>
            <div
              class="content-s"
              v-show="inputStatus !== 'borderLeftWidth'"
              @dblclick="doubleclick('borderLeftWidth')">{{ borderLeftWidth }}</div>
          </div>
          <div class="right">
            <div class="content-s input" v-if="inputStatus === 'borderRightWidth'">
              <a-input
                class="cont-input tr borderRightWidth"
                :autoFocus="true"
                type="text"
                size="small"
                v-model="borderRightWidth"
                @change="evt => onPropChange('border-right-width', evt.target.value)"
                @keydown.enter="statusReset('borderRightWidth')"
                @blur="statusReset('')" />
            </div>
            <div
              class="content-s"
              v-show="inputStatus !== 'borderRightWidth'"
              @dblclick="doubleclick('borderRightWidth')">{{ borderRightWidth }}</div>
          </div>
        </div>
        <div class="btm flex-size flex-cont">
          <div class="content-s input" v-if="inputStatus === 'borderBottomWidth'">
            <a-input
              class="cont-input borderBottomWidth"
              :autoFocus="true"
              type="text"
              size="small"
              v-model="borderBottomWidth"
              @change="evt => onPropChange('border-bottom-width', evt.target.value)"
              @keydown.enter="statusReset('borderBottomWidth')"
              @blur="statusReset('')" />
          </div>
          <div
            class="content-s"
            v-show="inputStatus !== 'borderBottomWidth'"
            @dblclick="doubleclick('borderBottomWidth')">{{ borderBottomWidth }}</div>
        </div>
      </div>

      <div
        class="box-padding position flex-box"
        :class="{noHover: hoverId &&  hoverId !== 'padding'}"
        @mouseenter="mouseenter('padding')"
        @mouseleave="mouseleave('padding')"
        >
        <div class="top flex-size flex-cont">
          <div class="content-s input ml" v-if="inputStatus === 'paddingTop'">
            <a-input
              class="cont-input paddingTop"
              :autoFocus="true"
              type="text"
              size="small"
              v-model="paddingTop"
              @change="evt => onPropChange('padding-top', evt.target.value)"
              @keydown.enter="statusReset('paddingTop')"
              @blur="statusReset('')" />
          </div>
          <div
            class="content-s"
            v-show="inputStatus !== 'paddingTop'"
            @dblclick="doubleclick('paddingTop')">{{ paddingTop }}</div>
          <div class="text">padding</div>
        </div>
        <div class="mid flex-size flex-cont">
          <div class="left">
            <div class="content-s input" v-if="inputStatus === 'paddingLeft'">
              <a-input
                class="cont-input tl paddingLeft"
                :autoFocus="true"
                type="text"
                size="small"
                v-model="paddingLeft"
                @change="evt => onPropChange('padding-left', evt.target.value)"
                @keydown.enter="statusReset('paddingLeft')"
                @blur="statusReset('')" />
            </div>
            <div
              class="content-s"
              v-show="inputStatus !== 'paddingLeft'"
              @dblclick="doubleclick('paddingLeft')">{{ paddingLeft }}</div>
          </div>
          <div class="right">
            <div class="content-s input" v-if="inputStatus === 'paddingRight'">
              <a-input
                class="cont-input tr paddingRight"
                :autoFocus="true"
                type="text"
                size="small"
                v-model="paddingRight"
                @change="evt => onPropChange('padding-right', evt.target.value)"
                @keydown.enter="statusReset('paddingRight')"
                @blur="statusReset('')" />
            </div>
            <div
              class="content-s"
              v-show="inputStatus !== 'paddingRight'"
              @dblclick="doubleclick('paddingRight')">{{ paddingRight }}</div>
          </div>
        </div>
        <div class="btm flex-size flex-cont">
          <div class="content-s input" v-if="inputStatus === 'paddingBottom'">
            <a-input
              class="cont-input paddingBottom"
              :autoFocus="true"
              type="text"
              size="small"
              v-model="paddingBottom"
              @change="evt => onPropChange('padding-bottom', evt.target.value)"
              @keydown.enter="statusReset('paddingBottom')"
              @blur="statusReset('')" />
          </div>
          <div
            class="content-s"
            v-show="inputStatus !== 'paddingBottom'"
            @dblclick="doubleclick('paddingBottom')">{{ paddingBottom }}</div>
        </div>
      </div>
      <div
        class="box-content position flex-cont"
        :class="{noHover: hoverId && hoverId !== 'content'}"
        @mouseenter="mouseenter('content')"
        @mouseleave="mouseleave('content')"
        >
        <div class="content input" v-if="inputStatus === 'width'">
          <a-input
            class="cont-input width"
            :autoFocus="true"
            type="text"
            size="small"
            v-model="width"
            @change="evt => onPropChange('width', evt.target.value)"
            @keydown.enter="statusReset('width')"
            @blur="statusReset('')" />
        </div>
        <div
          class="content"
          v-show="inputStatus !== 'width'"
          @dblclick="doubleclick('width')">{{ width }}</div>
        <span class="ant-desigener-font-color">x</span>
        <div class="content input" v-if="inputStatus === 'height'">
          <a-input
            class="cont-input height"
            :autoFocus="true"
            type="text"
            size="small"
            v-model="height"
            @change="evt => onPropChange('height', evt.target.value)"
            @keydown.enter="statusReset('height')"
            @blur="statusReset('')" />
        </div>
        <div
          class="content"
          v-show="inputStatus !== 'height'"
          @dblclick="doubleclick('height')">{{ height }}</div>
      </div>
    </div>
    <a-list
      itemLayout="horizontal"
      size="small"
      class="unit-selec">
      <a-list-item>
        <a-list-item-meta>
          <div slot="description">{{ $t('designer.label.boxModelUnit') }}</div>
        </a-list-item-meta>
        <a-select
          :defaultValue="unit"
          style="width: 100%;"
          size="small"
          @change="unitChange">
          <a-select-option value="px">px</a-select-option>
        </a-select>
      </a-list-item>
    </a-list>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins } from "vue-property-decorator";

import { Input, InputNumber, List, Select } from '@h3/antd-vue';

import { PropertyComponent } from '@h3/designer-core/property-panel';

import ColorPicker from './color-picker/color-picker.vue';

@Component({
  components:{
    AInput: Input,
    AInputNumber: InputNumber,
    ASelect: Select,
    ASelectOption: Select.Option,
    AList: List,
    AListItem: List.Item,
    AListItemMeta: List.Item.Meta,
    ColorPicker
  }
})
export default class BoxModal extends Mixins(PropertyComponent) {

  inputStatus: string = '';
  compBox: any = {};
  hoverId: string = '';
  unit: string = '';
  width: string = this.value['width'].value;
  height: string =  this.value['height'].value;
  borderTopWidth: number = this.value['border-top-width'].value;
  borderLeftWidth: number = this.value['border-left-width'].value;
  borderRightWidth: number = this.value['border-right-width'].value;
  borderBottomWidth: number = this.value['border-bottom-width'].value;
  marginTop: number = this.value['margin-top'].value;
  marginLeft: number = this.value['margin-left'].value;
  marginRight: number = this.value['margin-right'].value;
  marginBottom: number = this.value['margin-bottom'].value;
  paddingTop: number = this.value['padding-top'].value;
  paddingLeft: number = this.value['padding-left'].value;
  paddingRight: number = this.value['padding-right'].value;
  paddingBottom: number = this.value['padding-bottom'].value;

  onPropChange(key: string,value:any){
    this.value[key].value = value;
    this.emitChange(this.value);
  }
  
  // 双击
  doubleclick(name:any) {
    this.inputStatus = name;
  }

  // 数值处理
  statusReset(name:any) {
    this.inputStatus = name;
  }
  // 处理数值
  deleteUnit(str: string) {
    str += '';
    let re = { val: '0', unit: false };
    if (str === 'auto') {
      re.val = str;
    }
    let val: any = parseFloat(str);
    if (!isNaN(val)) {
      if (str.slice(-1) === '%') {
        re.val = val + '%';
      } else {
        re.val = val + '';
        re.unit = true;
      }
    }
    return re;
  }
  unitChange(){}

  mouseenter(id: string){
    this.hoverId = id;
  }
  mouseleave(){
    this.hoverId = '';
  }

}
</script>

<style lang='less' scoped>
.box-model {
  width: 100%;
  height: 240px;
  position: relative;
}
.box-margin {
  width: 240px;
  height: 210px;
  margin: 0 auto;
  border-width: 1px;
  border-style: dashed;
  background: rgb(249, 204, 157);
  z-index: 11;
}
.box-border {
  width: 190px;
  height: 150px;
  margin: 0 auto;
  border-width: 1px;
  border-style: solid;
  background: rgb(255, 238, 188);
  z-index: 12;
}
.box-padding {
  width: 140px;
  height: 90px;
  margin: 0 auto;
  border-width: 1px;
  border-style: dashed;
  background: rgb(196, 223, 184);
  z-index: 13;
}
.box-content {
  width: 90px;
  height: 30px;
  margin: 0 auto;
  border-width: 1px;
  border-style: solid;
  background: rgb(160, 198, 232);
  z-index: 14;
}
.noHover{
  background: #fff;
}
.unit-selec {
  height: 20px;
  position: relative;
  top: -20px;
  padding: 0 5px;
}
.position {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.flex-cont {
  display: flex;
  justify-content: center;
  align-items: center;
}
.content {
  width: 35px;
  &.input {
    width: 40px;
  }
}
.cont-input {
  padding: 0;
}
.flex-box {
  display: flex;
  flex-direction: column;
  .top {
    position: relative;
  }
  .text {
    position: absolute;
    left: 5px;
    top: 3px;
  }
  .mid {
    display: flex;
    justify-content: space-between;
    &.border {
      height: 90px;
    }
    &.margin {
      height: 150px;
    }
  }
}
.flex-size {
  flex: 1;
}
.tl {
  text-align: left;
}
.tr {
  text-align: right;
}
.ml {
  margin-left: 10px;
}
.content-s {
  width: 25px;
  &.input {
    width: 30px;
  }
}
</style>
