<!--
 * @Author: your name
 * @Date: 2020-05-07 11:40:42
 * @LastEditTime: 2020-05-07 19:43:37
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\entries\admin\src\views\app\biz-rule\biz-rule-panels.vue
 -->
<template>
  <div class="acitivity-model-contain">
    <div class="acitivity-model-contain-title">规则节点</div>
    <template v-for="(item,index) in acitivityModel">
      <biz-rule-panels-item
        :class="{ disabled : item.disabled}"
        :item="item"
        :key="index"
        v-h3-drag
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue,Prop, Watch } from 'vue-property-decorator';
import '@/directives/drag';
import bizRulePanelsItem from './biz-rule-panels-item.vue';

import nodes from './typings/node-bill';

import { NodeType } from './typings/node-type';

@Component({
  name: 'bizRulePanels',
  components: {
    bizRulePanelsItem
  }
})

export default class BizRulePanels extends Vue {
  @Prop() 
  workData!: any

  acitivityModel:any = [];

  setActivityModel() {
    this.acitivityModel = nodes.nodeGroup.map((res:any) => {
      return {
        ...res,
        width: 158,
        height: 40,
        // icon: '&#xe935;',
      }
    });
  }

  mounted() {
    this.setActivityModel();
  }
  
  @Watch('workData')
  workDataOnChange(val){
    if(val){
      switch(val.code){
        case 'GetList':
          this.acitivityModel.forEach((m: any) => {
            m.disabled = true;
          });
        break;
        case 'Load':
          this.acitivityModel.forEach((m: any) => {
            if(m.nodeType === NodeType.Create || m.nodeType === NodeType.Update || m.nodeType === NodeType.Delete || m.nodeType === NodeType.LogicVerify || m.nodeType === NodeType.DataCheck|| m.nodeType === NodeType.ExistVerify || m.nodeType === NodeType.Assign){
              m.disabled = true;
            }
          });
        break;
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .acitivity-model-contain {
    background: #fff;
    height: 100%;
    border-radius:4px;
    margin-top: -16px;
    &-title{
      margin: 0 24px;
      min-width: 60px;
      margin-top: 16px;
      padding: 10px 0;
      text-align: center;
      font-size:12px;
      font-weight: 600;
      color:rgba(0,0,0,1);
      padding-bottom: 2px;

    }
  }
</style>
