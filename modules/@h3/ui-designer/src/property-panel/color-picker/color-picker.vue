
<template>

     <a-popover placement="bottom" :trigger="disabled?'none':'click'">

        <template slot="content">
            <color-picker-panel @change="onChange" />
        </template>

        <a-button class="dropdown-botton" size="default" :disabled="disabled || false">
            
            <span class="icon-left" :style="fillStyle">

                <a-icon v-if="icon" :type="icon" />
                
                    <!-- :style="`color:${value};`" -->
            </span>

            <span class="icon-right">
                <a-icon type="down" />
            </span>
        </a-button>

    </a-popover>

</template>


<script lang="ts">

import { Component, Vue, Prop, Model } from 'vue-property-decorator';

import { Popover, Button, Icon } from '@h3/antd-vue';

import ColorPickerPanel from "./color-picker-panel.vue";


@Component({
    components:{
        APopover: Popover,
        AButton: Button,
        AIcon: Icon,
        ColorPickerPanel
    }
})
export default class ColorPicker extends Vue{

    @Prop({
        default : ''
    })
    icon !: string

    @Model('change',{
        default : ''
    })
    value !: string

    @Prop({
        default: true
    })
    fill !: boolean

    @Prop({
        default : ''
    })
    defaultColor !: string

    @Prop({
        default : ''
    })
    disabled !: boolean

    get fillStyle(){
        if(this.fill){
            return {
                background: this.value
            };
        }
        return {};
    }

    onChange(value:string){
        if(value === 'default'){
            value = this.defaultColor || '#fff';
        }
        this.$emit('change',value);
    }

}

</script>


<style lang="less" scoped>

button{
    vertical-align: top;
    padding: 0;
}

.icon-left{
    width: 46px;
    text-align: center;
    display: inline-block;
    height: 100%;
    border-radius: 4px 0 0 4px;
}

.icon-right {
    height: 100%;
    display: inline-block;
    font-size: 12px;
    border-left: 1px solid #d9d9d9;
    vertical-align: top;
    width: 24px;
    padding-top: 2px;
}

</style>