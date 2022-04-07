<template>
  <a-modal
    v-model="showModal"
    title="驳回节点"
    :width="552"
    :maskClosable="false"
    :keyboard="false"
    @cancel="cancel"
    @ok="handleOk"
  >
    <h1>请选择需要驳回的哪一节点</h1>
    <a-row>
      <a-col :span="4"><i class="star">*</i>驳回节点:</a-col>
      <a-col :span="20">
        <a-select
          @change="selectChange"
          placeholder="请选择"
          v-model="activityCode"
          class="select-wrap"
          :class="errTip ? 'error': ''"
        >
          <a-select-option
            v-for="(item,index) in list"
            :key="index"
            :value="item.activityCode"
          >{{ item.activityName }}</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col>
        <a-checkbox @change="checkboxChange" :checked="submitToReject">提交后返回当前节点</a-checkbox>
      </a-col>
    </a-row>
  </a-modal>
</template>  
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
@Component({
  name: 'reject-modal',
  components: {
  
  },
})
export default class RejectModal extends Vue {
  @Prop() value!: boolean;
  @Prop() list:any;
  @Prop() record: any;
  showModal = false;
  errTip = false;
  submitToReject:boolean = false;
  activityCode = '';
  cancel() {
    this.errTip = false;
    this.activityCode = '';
    this.submitToReject = false;
    this.$emit('input',false)
  }
  checkboxChange(event){
    this.submitToReject = event.target.checked;
  }
  selectChange(){
    if(this.activityCode) this.errTip = false;
  }
  handleOk(){
    if(!this.activityCode) {
      this.errTip = true;
      return this.$message.error('驳回节点必填')
    }
    this.errTip = false;
    this.$emit('input',false)
    this.$emit('rejectAction',{
      rejectToActivityCode: this.activityCode,
      workItemId: this.record.id,
      workflowCode: this.record.workflowCode,
      submitToReject: this.submitToReject
    });
    this.activityCode = '';
    this.submitToReject = false;
  }
 
  @Watch('value')
  onValueChange(val: boolean) {
    this.showModal = val;
  }
}
</script>
<style lang="less" scoped>
h1{
  font-weight:500;
  color:rgba(0,0,0,0.85);
  font-size: 16px;
  margin-bottom:16px;
}
.select-wrap{
  width: 100%;
}
.star{
  color: #F4454E;
}
.row{
  margin-top: 20px;
}
</style>