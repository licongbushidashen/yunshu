
<template>
    <a-select show-search v-model="selected" style="width:100%;"  :mode="multiple" @change="onChange">
      <a-select-option
        v-for="(item,index) in selectValue"
        :key="index"
        :value="item.value"
      >{{ item.label }}</a-select-option>
    </a-select>
</template>


<script lang="ts">
import { Component, Vue, Prop, Watch, Model } from "vue-property-decorator";
import { lang } from 'moment';

@Component({
    name : 'report-select-simple'
})
export default class ReportSelectSimple extends Vue{

    @Model('input',{
        default : () => []
    })
    value !: any

    @Prop({
        default:''
    })
    formula !: string
    selected:  any = ''
    selectValue : any[] = [
      {value: 'DRAFT', label: '草稿'},
      {value: 'PROCESSING', label: '进行中'},
      {value: 'CANCELLED', label: '已取消'},
      {value: 'COMPLETED', label: '已完成'},
      {value: 'CANCELED', label: '已作废'}
    ]
    multiple: string = 'default'

    @Watch('formula',{
        immediate:true
    })
    onFormulaChange(formula : string){
        console.log('formula',formula)
        this.selected = '';
        switch(formula){
            case 'Equal':
            case 'NotEqual':
                this.multiple = 'default';
                break;
            default:
                this.multiple = 'multiple';
                break;
        }
    }
    @Watch('value',{
        immediate:true
    })
    onValueChange(val){
        if(val){
          if(Array.isArray(this.value)&&this.value.length>1){
              this.selected = this.value;
          }else{
              this.selected = this.value[0];
          }
        }

    }
    onChange(values: any){
        this.$emit('input',values);
    }

}

</script>