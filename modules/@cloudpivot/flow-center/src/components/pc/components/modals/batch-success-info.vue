<template>
  <a-modal
    class="success-modal"
    v-model="showModal"
    :width="440"
    :maskClosable="false"
    :keyboard="false"
    >
    <div class="specification"><i class="icon aufontAll h-icon-all-check-circle"></i>{{successNum}}条待办任务已批量处理完成</div>
    <template slot="footer">
      <a-button key="back" type="primary" @click="onClose">{{
        $t('cloudpivot.flowCenter.pc.batchOk')
      }}</a-button>
    </template>
  </a-modal> 
</template>

<script lang="ts">
import { Component, Vue, Prop, PropSync,Watch} from "vue-property-decorator";
import { Modal,Input,Row, Col,Upload,Icon,Button} from "@h3/antd-vue";
import { renderer } from '@cloudpivot/form';
//import ApproveOpinion from "@cloudpivot/form/src/renderer/components/pc/approve-opinion.vue";
Vue.use(Upload);
@Component({
  name: "BatchSuccess",
  components: {
    AModal: Modal,
    ATextarea: Input.TextArea,
    ARow: Row,
    ACol: Col,
    AIcon: Icon,
    AButton:Button,
    AUpload: Upload,
  },
})
export default class BatchInfo extends Vue {
  @Prop() value!: any;

  @Prop() successNum!: any;

  //@PropSync('syncShowModal',{default: false}) showModal!: Boolean = false; 
  showModal:boolean = false;
  
  //isShowModal: boolean = false;
  
  fileList:any =  [];// 已上传的文件信息列表
  //successNum = 80;
  @Watch('value')
  valueChange(val){
    this.showModal = val;
  }
  
  onClose() {
    this.$emit('input',false);
    this.$emit('batchRefresh',false)
    //this.showModal = false;
  }
}
</script>

<style lang="less">
  .success-modal .h-icon-all-check-circle{
    color:#17BC94;
    margin-right: 16px;
  }
  .success-modal /deep/.ant-modal-footer{
    border-top:none ;
  }
</style>
