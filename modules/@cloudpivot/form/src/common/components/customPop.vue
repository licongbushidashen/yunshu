<template>
    <div>
        <div class="shadow" v-show="modalShow" :style="{'z-index': zIndex}"></div>
        <div :style="{'width': width, height: height, 'z-index': zIndex + 1,'top': top}" v-show="modalShow" class="pop">
            <div class="title">
                <span>
                    <slot name="title" />
                </span>
                <span @click="modalShow = false" class="close icon aufontAll h-icon-all-close"></span>
            </div>

            <div class="content" :style="{overflow: overHidden, height: contentHeight}">
                <slot name="content" />
            </div>

            <div class="pop-footer" slot="footer">
                <slot name="footer">
                    <a-button @click="modalShow = false">取消</a-button>
                    <a-button type="primary" @click="determine" class="determine">{{okText ? okText : '确定'}}</a-button>
                </slot>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {Button} from '@h3/antd-vue';
@Component({
  name: 'customPop',
  components: {
    AButton: Button
  }
})
export default class customPop extends Vue {
    @Prop({ default: false }) value!: boolean // 是否显示
    @Prop() width?: string;
    @Prop() height?: string;
    @Prop() zIndex?:number;
    @Prop() overHidden?: string;
    @Prop() okText?: string;
    @Prop() top?: string;


    get contentHeight(){
        if(this.height){
            return parseInt(this.height) - 130 + 'px'
        }
        return 'auto'
    }
    

    modalShow:boolean = false
    @Watch('value')
    onVisibleChange(value:boolean){
        this.modalShow = value
    }
    @Watch('modalShow')
    onModalShowChange(val:boolean){
        this.$emit('input', val)
    }
    
    // 确定
    determine(){
        this.$emit('OK')
        // this.modalShow = false
    }
    created(){
        this.modalShow = this.value
    }
}
</script>

<style lang="less" scoped>
.shadow{
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 98;
  }
  .pop{
    position: absolute;
    z-index: 99;
    top: 8%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
    width: 528px;
    height: 496px;
    background: #FFFFFF;
    box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.15);
    border-radius: 4px;
    padding-bottom: 74px;
    .title{
      display: flex;
      justify-content: space-between;
      height: 56px;
      align-items: center;
      padding-left: 24px;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      .close{
        display: inline-block;
        width: 56px;
        height: 56px;
        text-align: center;
        line-height: 56px;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.45);
        font-size: 18px;
      }
    }
    .pop-footer{
        display: flex;
        justify-content: flex-end;
        height: 74px;
        align-items: center;
        padding: 0 24px;
        .determine{
            margin-left: 8px;
        }
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
    }
    .content{
        padding: 0 24px;
        max-height: 500px;
        overflow: auto;
    }
    .label{
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        margin-top: 24px;
        width: 100%;
        white-space: nowrap;
        span{
        display: inline-block;
        width: 3px;
        height: 12px;
        background: #00C293;
        margin-right: 10px;
        }
        /deep/.radio-group{
        padding-bottom: 0;
        margin-left: 12px;
        }
    }
  }
</style>