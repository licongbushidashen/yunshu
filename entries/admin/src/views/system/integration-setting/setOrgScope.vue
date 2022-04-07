<template>
    <a-modal
      title="组织范围"
      width="560px"
      :visible="visible"
      @cancel="visible = false"
      @ok="handleOk"
      :cancelText="$t('languages.Apps.Cancel')"
      :okText="$t('languages.Apps.Ok')"
      :maskClosable="false"
      :keyboard="false"
    >
      <template>
        <div style="max-height: 300px;overflow-y: auto;">
          <div style="border-bottom: 1px solid #E9E9E9 ;margin-bottom: 8px;padding-bottom: 12px;">
            <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">
              全选
            </a-checkbox>
          </div>
          <a-checkbox-group v-model="selected" @change="selecteChange">
            <div class="checkbox-item" v-for="item in list" :key="item.corpId">
              <a-checkbox :value="item.corpId" >
                  {{item.name}}
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </div>
      </template>


    </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

@Component({
  name: 'setOrgScope',
  components: {
  }
})

export default class setOrgScope extends Vue{
    @Prop() list!:any[]
    @Prop() currentSelected!: Array<string>

    selected: string[] = []
    visible: boolean = false
    indeterminate: boolean = false
    checkAll: boolean = false
    handleOk(){
        this.$emit('setOrgScopeOver', this.selected)

        this.visible = false
    }

    onCheckAllChange(e){ // 全选
        let type = e.target.checked
        if(type){
            this.selected = this.list.map((el: any) => el.corpId)
        }else{
            this.selected = []
        }
        this.selecteChange()
    }
    selecteChange(){ // 选项改变
        if(this.selected.length === this.list.length){
            this.indeterminate =  false
            this.checkAll = true
        }else{
            this.indeterminate = this.selected.length !== 0
            this.checkAll = false
        }
    }

    @Watch('visible')
    onVisibleChange(type){
        if(type){
            this.selected = this.currentSelected
            this.selecteChange()
        }else{
            this.reset()
        }
    }

    reset(){
       this.indeterminate = false
       this.checkAll = false
       this.selected = []
    }
}
</script>

<style lang="less" scoped>
.checkbox-item{
    width: 100%;
    line-height: 32px;
    overflow: hidden;
    white-space: nowrap;
}
</style>