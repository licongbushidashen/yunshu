<template>
  <div class="page-font">
    <div class="line">
      <div class="item big">
        <div class="name"></div>
        <div class="desc">
          <a-select
            v-model="fontFamily"
            style="width:100%"
            @change="evt => onPropChange('fontFamily',evt.target.value)"
          >
            <a-select-option value="SimSun">宋体</a-select-option>
            <a-select-option value="SimHei">黑体</a-select-option>
            <a-select-option value="Microsoft YaHei">微软雅黑</a-select-option>
            <a-select-option value="FangSong">仿宋</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="item">
        <div class="name"></div>
        <div class="desc">
          <a-input
            v-model="fontSize"
            @blur="evt => onPropChange('fontSize',evt.target.value)"
          />
        </div>
      </div>
    </div>

    <div class="line">
      <div class="item big">
        <div class="name"></div>
        <div class="desc">
          <a-select
            v-model="fontWeight"
            style="width:100%"
            @change="evt => onPropChange('fontWeight',evt.target.value)"
          >
            <a-select-option value="100">100</a-select-option>
            <a-select-option value="200">200</a-select-option>
            <a-select-option value="300">300</a-select-option>
            <a-select-option value="400">400(normal)</a-select-option>
            <a-select-option value="500">500</a-select-option>
            <a-select-option value="600">600</a-select-option>
            <a-select-option value="700">700(blod)</a-select-option>
            <a-select-option value="800">800</a-select-option>
            <a-select-option value="900">900</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="item">
        <div class="name"></div>
        <div class="desc">
          <a-input
            type="color"
            v-model="fontColor"
            @change="evt => onPropChange('fontColor',evt.target.value)"
          />
        </div>
      </div>
    </div>

    <div class="line">
      <div class="item">
        <div class="name"></div>
        <div class="desc">
          <a-radio-group v-model="textDecoration" @change="evt => onPropChange('textDecoration',evt.target.value)">
            <a-radio-button value="none">T</a-radio-button>
            <a-radio-button value="overline">上</a-radio-button>
            <a-radio-button value="underline"><a-icon type="underline"/></a-radio-button>
            <a-radio-button value="line-through"><a-icon type="strikethrough"/></a-radio-button>
          </a-radio-group>
        </div>
      </div>
      <div class="item">
        <div class="name"></div>
        <div class="desc">
          <a-radio-group v-model="textTransform" @change="evt => onPropChange('textTransform',evt.target.value)">
            <a-radio-button value="uppercase">TT</a-radio-button>
            <a-radio-button value="capitalize">Tt</a-radio-button>
            <a-radio-button value="lowercase">tt</a-radio-button>
            <a-radio-button value="none">none</a-radio-button>
          </a-radio-group>
        </div>
      </div>
    </div>

    <div class="line">
      <div class="item">
        <div class="name"></div>
        <div class="desc">
          <a-radio-group v-model="textAlign" @change="evt => onPropChange('textAlign',evt.target.value)">
            <a-radio-button value="left"><a-icon type="align-left"/></a-radio-button>
            <a-radio-button value="center"><a-icon type="align-center"/></a-radio-button>
            <a-radio-button value="right"><a-icon type="align-right"/></a-radio-button>
            <a-radio-button value="justify"><a-icon type="pic-center"/></a-radio-button>
          </a-radio-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Mixins } from 'vue-property-decorator';
import { Icon, Select, Radio, Input } from '@h3/antd-vue';
import { PropertyComponent } from '@h3/designer-core/property-panel';


@Component({
  name: 'page-font',
  components: {
    AIcon: Icon,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ARadioButton: Radio.Button,
    AInput: Input
  }
})

export default class PageFont extends Mixins(PropertyComponent) {
  

  fontFamily: string = this.value.fontFamily.value
  fontSize:string = this.value.fontSize.value
  fontWeight:string = this.value.fontWeight.value
  fontColor:string = this.value.fontColor.value
  textDecoration:string = this.value.textDecoration.value
  textAlign:string = this.value.textAlign.value
  textTransform:string = this.value.textTransform.value

  onPropChange(key: string,value:any){
    this.value[key].value = value;
    // console.log(key, value, this.color);
    this.emitChange(this.value);
  }
}
</script>

<style lang='less' scoped>
  @import url('./common.less');
  /deep/.ant-radio-group{
      display: flex;
    }
  /deep/.ant-radio-button-wrapper{
    padding: 0;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
