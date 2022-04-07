<template>
  <div class="attr-rows" >
    <div
      class="attr-row"
      v-for="(attr, i) in controlAttributeFilter"
      :key="i"
      :style="(attr.field === 'requiredFormula' && attrKey === 'controlAttributeColumns') ? 'border-bottom: none' : '' "
      v-show="attr.display !== false && attr.field !== 'regexpText'"
    >
      <div v-if="controlType === FormControlType && attr.field ==='name' && (type !== 'controlAttribute' || (type === 'controlAttribute' && attr.field !== 'requiredFormula'))" style="width:100%">
        <h3-editor :value="attr.value" :field="attr.field" @change="change"/>
      </div>
      <template v-else-if="(type !== 'controlAttribute' || (type === 'controlAttribute' && attr.field !== 'requiredFormula'))">
        <transition name="fade" v-if="attr.seriesNum">
          <div class="transferTips" :style="{ height: attr.seriesNum * 33 + 'px'}">
            <i @click="deleteTips(attr)" class="icon aufontAll h-icon-all-close posCls"></i>
            <div class="content">
              {{ attr.removeNames }}已挪至模型配置
            </div>
          </div>
        </transition>
        <label class="attr-lab">
          <a-tooltip>
            <span slot="title" v-html="attr.label"></span>
            <span v-html="attr.label"></span>
          </a-tooltip>
          <a-tooltip v-if="attr.tip">
            <span slot="title" v-html="attr.tip.content"></span>
            <a-icon :type="attr.tip.icon"/>
          </a-tooltip>
          <a-tooltip v-else-if="attr.options && attr.options.tip">
            <span slot="title" v-html="attr.options.tip.content"></span>
            <a-icon :type="attr.options.tip.icon"/>
          </a-tooltip>
        </label>
        <div class="attr-val">
          <FormAttributeValue
            :dataItem="attr.dataItem"
            :label="attr.label"
            :dom="attr.dom"
            :value="getValue(attr)"
            :field="attr.field"
            :type="attr.type"
            :attrType="attr.attrType"
            :attributes="controlAttribute"
            :assistAttribute="assistAttribute"
            :options="attr.options"
            :formData="formData"
            :attributeItem="attr"
            @change="change"
            @blur="blur"
            @callback="callback"
            :control="control"
          ></FormAttributeValue>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject, Watch } from 'vue-property-decorator';
import FormAttributeValue from './form-attribute-value.vue';
import { FormControlType } from "../typings";
@Component({
  name: 'form-control-attribute',
  components: {
    FormAttributeValue,
    H3Editor: () =>
        import(/* webpackChunkName: "h3-editor" */ './h3-editor.vue')
  }
})
export default class FormControlAttribute extends Vue {
  @Prop() attrKey !: string;// 控件ID
  @Prop() controlAttribute!: any;// 控件的属性集合
  @Prop() assistAttribute!: any; // 辅助控件属性集合
  @Prop() formData!: any;
  @Prop() controlType!: any;
  @Prop({default: ''}) type?: string
  @Prop() control?: any;

  @Inject()
  updateAttribute?:Function;
  @Inject()
  inputAttributeBlur?:Function;
  @Inject()
  attrCallback?:Function;

  get FormControlType(){
    return FormControlType.Description;
  }

  /**
   * 过滤掉子表里面的数据项，“标题是否显示”属性
   */
  get controlAttributeFilter(){
    console.log(this.controlAttribute,"-------------------------CONTROLATTRIBUTE")
    let controlAttribute = this.controlAttribute.filter((item)=>{
      return !item.dataItem || !item.dataItem.parentCode || (item.dataItem.parentCode && item.field !== 'labelVisible');
    });
    if(this.controlAttribute && this.controlAttribute.length && this.controlAttribute[0].dataItem && this.controlAttribute[0].dataItem.type === 9){
      for(const attribute of this.controlAttribute){
        if(attribute.field === "showStyle" && attribute.value === "tree"){
          controlAttribute = controlAttribute.filter((item: any) => {
            return !["queryCode","conditions","searchFormula"].includes(item.field)
          })
        }
      }
    }
    if(this.assistAttribute && this.assistAttribute.length && this.assistAttribute[0].dataItem && this.assistAttribute[0].dataItem.type === 9){
      for(const attribute of this.assistAttribute){
        if(attribute.field === "showStyle" && attribute.value === "tree"){
          controlAttribute = controlAttribute.filter((item: any) => {
            return !["showField"].includes(item.field)
          })
        }
      }
    }
    return controlAttribute;
  }

  getValue(attr){
    if(attr.dataItem && attr.dataItem.options && attr.label === "选项"){
      try {
        let options: {} = JSON.parse(attr.dataItem.options)
        if(options){
          // @ts-ignore
          options = JSON.parse(options.options)
        }
        // @ts-ignore
        if(options.checkedDictionary){
          return JSON.stringify(options)
        }
      } catch (error) {

      }
    }

    return attr.value
  }

  /**
   * 属性修改的回调
   * @param field
   * @param value
   */
  change(field: string, value:any, extraVal: any = null) {
    // 表单属性中 控制布局与边框模式互斥设置
    if(field === 'layoutType') {
      localStorage.setItem('layoutType',value);
      this.controlAttribute.forEach(c => {
        if(c.field === 'borderMode'){
          if(value === 'vertical'){
            this.$set(c.options, 'selectorDisabled', true)
          }else{
            this.$set(c.options, 'selectorDisabled', false)
          }

        }
      })
    }else if(field === 'borderMode'){
      this.controlAttribute.forEach(c => {
        if(c.field === 'layoutType'){
          if(value === 'open'){
            this.$set(c.options, 'selectorDisabled', true)
          }else{
            this.$set(c.options, 'selectorDisabled', false)
          }

        }
      })
    } else if (field === 'fieldCode') {
      this.controlAttribute.forEach(c => {
        if(c.field === 'relativeType'){
          this.$set(c.options, 'relativeType', extraVal);
        }
      })
    }
  if (this.updateAttribute) {
    this.updateAttribute(this.attrKey, field, value);
  }
}
  /**
   * 属性修改的回调
   * @param field
   * @param fun
   */
  callback(field: string, fun:Function, extra = null) {
    if (this.attrCallback) {
      this.attrCallback(this.attrKey, field, fun, extra);
    }
  }

  blur(field: string, value:any) {
    if (this.inputAttributeBlur) {
      this.inputAttributeBlur(this.attrKey, field, value);
    }
  }

  @Watch("controlAttribute", {
    deep: true
  })
  watchControlAttribute(val) {
    this.initDataType()
  }

  initDataType() {
    //初始化表单属性中 控制布局与边框模式
    this.controlAttribute.forEach(c => {
      if(c.field === 'layoutType' && c.value === 'vertical'){
        this.controlAttribute.forEach(f => {
          if(f.field === 'borderMode'){
            this.$set(f.options, 'selectorDisabled', true)
          }
        })
      }
      if(c.field === 'borderMode' && c.value === 'open'){
        this.controlAttribute.forEach(f => {
          if(f.field === 'layoutType'){
            this.$set(f.options, 'selectorDisabled', true)
          }
        })
      }
      // 显示字段置灰
      if(c.field==="displayField" && c.dataItem.published){
        this.controlAttribute.forEach(f => {
          if(f.field === 'displayField'){
            this.$set(f.options, 'selectorDisabled', true)
          }
        })
      }
      //显示样式置灰
      if(c.field==="showStyle" && c.dataItem.published){
        this.controlAttribute.forEach(f => {
          if(f.field === 'showStyle'){
            this.$set(f.options, 'selectorDisabled', true)
          }
        })
      }
    })
  }

  deleteTips(attr) {
    this.$emit('transferRemove', attr)
  }
}
</script>

<style lang="less" scoped>
  .transferTips {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    text-align: center;
    background: rgba(255, 251, 230, 0.85);
    border-radius: 4px;
    border: 1px solid #FFE58F;
    color: rgba(0, 0, 0, 0.65);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .content {
    display: inline-block;
    text-align: left;
    margin: 0 30px;
  }
  .posCls {
    position: absolute;
    right: 8px;
    top: 2px;
  }
</style>
