
<template>
  <a-col
    v-if="isEntry"
    class="ant-col enter"
    :span="span"
  ></a-col>

  <a-col
    v-else
    class="ant-col"
    :span="span"
    :tabindex="0"
    :class="{ 'title': isTitle,'group-title' : isGroup ,'vertical': layoutType, 'isSystem': isSystem && !isOwener }"
    :id="control.key"
    @keyup.46="onDelete"
    @click="onClick"
    @blur="onBlur"
    @keydown.ctrl.67.stop.prevent="onCtrlC"
    @keydown.ctrl.86.stop.prevent="onCtrlV"
  >
    <template v-if="!isMobile()">

      <template v-if="isTitle || isHtml">
        <abstract-control :control="control"></abstract-control>
      </template>

      <template v-else>
        <div
          class="control-label"
          v-if="!isLayout"
          :class="{ top : isHigh }"
        >
          <div class="control-label-cover" v-show="control.options.labelVisible === false"></div>
          <div>{{ label }}：</div>
        </div>

        <div class="control-field" :class="{ 'group-title' : isGroup, 'isCheckboxOrRadio': isCheckboxOrRadio }">
          <abstract-control :control="control" :class="[ typeClass ]"></abstract-control>
        </div>

        <div
          class="icon-copy"
          v-if="!isSystem && !isTabs"
          @click.stop="onCopy($event)"
        >
          <i class="icon aufontAll h-icon-all-paste"></i>
        </div>

        <div class="icon-delete" @click="onDelete($event)">
          <i class="icon aufontAll h-icon-all-delete-o"></i>
        </div>

      </template>
    </template>
    <!--手机端预览-->
    <template v-else>
      <div class="control-field">
        <abstract-control :control="control"></abstract-control>
      </div>
    </template>

    <div class="cover" v-show="control.options.visible === false"></div>
  </a-col>
</template>


<script lang='ts'>
import { Vue, Prop, Component, Inject, Watch} from "vue-property-decorator";

import AbstractControl from "./abstract-control.vue";

import { H3Draggable } from "@/directives/drag";

import { FormControl, FormControlType } from "../typings";
import {getComponentTitleByControlType} from "@cloudpivot/form/utils"

@Component({
  name: "control-item",
  components: {
    AbstractControl
  }
})
export default class ControlItem extends Vue implements H3Draggable {
  @Prop()
  control!: FormControl;

  @Prop()
  span!: number;

  @Prop()
  readonly path?: string[];

  @Inject()
  emitControlSelect!: Function;

  @Inject()
  isMobile!: Function;

  @Inject()
  setCtrlCKey!: Function;

  @Inject()
  getCtrlCKey!: Function;

  @Inject()
  layoutTypeFn!: Function;

  get typeClass(){
    const type = this.control.type;
    const name = FormControlType[type]||getComponentTitleByControlType(type);
    return name?name.toLowerCase():'';
  }

  // 系统控件
  get isSystem(){
    return this.control.type >= FormControlType.SequenceNo && this.control.type <= FormControlType.SequenceStatus;
  }

  //系统控件为拥有者时
  get isOwener(){
    return this.control.type === FormControlType.OwnerId;
  }

  //多选控件或单选控件
  get isCheckboxOrRadio(){
    return this.control.type === FormControlType.Radio || this.control.type === FormControlType.Checkbox
  }

  //上下布局模式
  get layoutType(){
    if(this.layoutTypeFn){
      return this.layoutTypeFn();
    }
  }

  get isEntry() {
    return this.control && this.control.key === ".";
  }

  get isLayout() {
    return (
      this.control &&
      (this.control.type === FormControlType.Group ||
        this.control.type === FormControlType.Description ||
        this.control.type === FormControlType.Title ||
        this.control.type === FormControlType.Tabs
        )
    );
  }



  get isGroup() {
    return ( this.control &&
    (this.control.type === FormControlType.Group)
     )
  }

  get isHtml(){
    return this.control && this.control.type === FormControlType.Html;
  }

  get isTitle() {
    return this.control && this.control.type === FormControlType.Title;
  }

  get isTabs(){
    return this.control && this.control.type === FormControlType.Tabs;
  }

  get label() {
    if (!this.control || !this.control.options) {
      return "";
    }
    let name = this.control.options.name;
    const name_i18n = this.control.options.name_i18n;
    if (name_i18n) {
      // const map = JSON.parse(name_i18n);
      const map = name_i18n;
      const locale = this.$i18n.locale;
      if (map[locale]) {
        name = map[locale];
      }
    }

    return name;
  }


  get isHigh(){
    const type = this.control.type;
    return type === FormControlType.Textarea
      || type === FormControlType.ApprovalOpinion
      || type === FormControlType.Attachment
      || type === FormControlType.Image
      || type === FormControlType.Sheet
      || type === FormControlType.Address;
  }

  onDragstart(evt: DragEvent) {
    evt.stopPropagation();

    if (evt.dataTransfer) {
      evt.dataTransfer.setData("control", this.control.key);
      evt.dataTransfer.setData("control-key-" + this.control.key, "");
      evt.dataTransfer.setData("control-type-" + this.control.type, "");

      if(this.control.path){
        evt.dataTransfer.setData("control-path", JSON.stringify(this.control.path));
      }
    }
  }


  onDelete(evt: KeyboardEvent | MouseEvent) {
    evt.stopPropagation();

    if ((evt as KeyboardEvent).key) {
      this.$emit("delete", this.control.key);
    } else {
      const _this = this;

      this.$confirm({
        title: this.$t("languages.Apps.FormDesignPage.DeleteControlTitle", {
          name: this.control.type===FormControlType.Description?"描述说明":this.control.options.name
        }).toString(),
        okText: this.$t("languages.Apps.Ok").toString(),
        cancelText: this.$t("languages.Apps.Cancel").toString(),
        onOk() {
          console.log(_this.control,'this.control');
          _this.$emit("delete", _this.control.key);
        }
      });
    }
  }

  onCopy(){
    this.$emit("copy", this.control.key);
  }

  onCtrlC(){
    if(this.isSystem || this.isTabs){
      return;
    }
    this.setCtrlCKey(this.control.key);
  }

  onCtrlV(){
    const copyKey = this.getCtrlCKey();
    if(copyKey){
      this.$emit("copy", copyKey);
    }
  }

  onClick(evt: Event) {
    evt.stopPropagation();
    if (this.emitControlSelect) {
      this.emitControlSelect(this.control);
    }
  }

  onBlur() {
    // if(this.emitControlSelect){
    //   this.emitControlSelect();
    // }
  }

  // @Watch('$i18n.locale')
  // onLanguageChange() {

  //   this.globalName = this.fieldName();
  // }

}
</script>


<style lang="less" scoped>
.ant-col > div {
  &.control-label {
    width: 102px;
    min-width: 102px;
    max-width: 102px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    color: rgba(0, 0, 0, 0.65);
    .control-label-cover{
      position: absolute;
      z-index: 1;
      height: 100%;
      min-width: 102px;
      max-width: 102px;
      left: 4px;
      top: 0;
      background: url('../../../../assets/images/cover.png');
    }

    & > div {
      word-break: break-word;
    }

    &.top{
      align-items: flex-start !important;
      padding-top: 0.3em;
    }
  }

  &.control-field {
    flex-grow: 1;
    overflow: auto;
    align-items: center;
    /*** display: flex 会导致tab中的子表数据项过多时，子表的滚动条显示在了tab上*/
    // display: flex;

    label {
      color: @light-color-2;
    }
 
    /**
      与其他其他组件字体大小保持一致
    */
    .description{
      font-size: 14px;
    }

    &.group-title {
      /*height: 56px;*/
      /*line-height: 55px;*/
      border-bottom: 1px solid #d9d9d9;
      padding: 0 8px;

      & > h3 {
        font-size: 18px;
        font-family: PingFang-SC-Medium;
        font-weight: 500;
        padding: 22px 0 12px 0;
        color: rgba(0, 0, 0, 0.85);
      }
    }
    .number {
      &:before {
        content: ''
      }
    }
  }
}

.ant-col.title {
  font-size: 28px;
  font-family: PingFang-SC-Regular;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.85);
  line-height: 36px;
  padding: 16px;
  text-align: center;
  outline: none;
}

/deep/.description{
  font-size: 12px;
}

.ant-col {
  position: relative;

  &.selected {
    background-color: #E8FCF4;
  }
}

.ant-col:not(.title) {
  padding: 10px 8px;
  display: flex;
  // align-items: center;
  text-align: left;
  cursor: move;
  border-left: 1px dashed rgb(232, 232, 232);
  position: relative;
  min-height: 52px;

  &:first-child {
    border-left: none;
  }

  &.vertical{
    display: block !important;

  }
  &.vertical:not(.isSystem){
    border-left:none
  }

  &.vertical .control-label{
    width: 100%;
    max-width: 100%;
    font-size:12px;
    font-weight: 900;
    color:rgba(0,0,0,0.65);
    line-height: 20px;
    padding-left: 12px;
  }

  &.vertical.isSystem .control-field{
    padding-left: 12px;
    margin-top: 5px;
  }
  &.vertical .isCheckboxOrRadio{
    padding-left: 12px;
  }
  .isCheckboxOrRadio > .ant-radio-group, .isCheckboxOrRadio > .ant-checkbox-group  {
    word-break: break-all;
  }

  // .designer.mobile
  //&:hover,

  &.dragging,
  &.dragging.selected,
  &.enter {
    min-height: 52px;
    outline: 1px dashed @primary-color;
    background-color: #fff;
    &::before {
      width: 0;
    }
  }

  &.selected {
    // background-color: #E8FCF4;
    &::before {
      content: "";
      width: 4px;
      height: 100%;
      display: inline-block;
      background-color: @primary-color;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}



.ant-col.group-title {
  padding: 0;
  margin-bottom: -1px;
}

.ant-col.dragging > * {
  opacity: 0;
}

.ant-col > .cover {
  position: absolute;
  z-index: 1;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  background: url('../../../../assets/images/cover.png');
}

.mobile > .ant-row-flex > .ant-col > div {
  &.control-label {
    width: 180px;
    margin-right: 24px;
  }
}

.mobile {
  .ant-col {
    padding: 0;
    .control-field {
      width: 100% !important;
      margin: 0 !important;
    }
  }

  .ant-col.title {
    padding: 0;
  }
}
</style>

<style>

.designer.mobile .vertical .h3-moilbe-view-common{
  display: block;
}

.designer.mobile .vertical .h3-moilbe-view-common-content{
  margin-left: 0;
}

.designer.mobile .vertical .control-label{
  padding-left: 0;
}
.designer.mobile .vertical.isSystem .control-field{
    padding-left: 0 !important;
    margin-top: 0;
  }

.vertical .sheet-empty .empty{
    height: 103px;
  }
</style>

