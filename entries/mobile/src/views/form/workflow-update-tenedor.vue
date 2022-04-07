<!--
 * @Descripttion: 修改拥有者
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-15 12:10:38
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-09-16 11:34:58
-->
<template>
  <div>
    <form-update-tenedor @submit="ok"></form-update-tenedor>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Watch } from "vue-property-decorator";

import { listApi, workflowApi } from "@cloudpivot/api";

import FormUpdateTenedor from "@cloudpivot/form/src/runtime/components/mobile/form-update-tenedor.vue";

@Component({
  name: "workflow-update-tenedor",
  components: {
    FormUpdateTenedor,
  },
})
export default class workflowUpdateTenedor extends Vue {
  workflowInstanceId: string = "";
  schemaCode:string = "";
  objectId:string = "";

  created() {
    this.workflowInstanceId = this.$route.params.workflowInstanceId;
    this.getLoadData();
  }
  
  async ok(obj) {
    console.log(obj);
    let source: any = {
      mobile: true,
      isSheet: true,
      schemaCode: this.schemaCode, //数据模型编码
      ownerId: obj.participantors[0].id,
      objectIds: [this.objectId], //导出的数据id
      ownerDeptId: obj.participantors[0].departmentId,
      remark: obj.comment
    }
    let res: any = await listApi.modifyOwner(source);
    if (res.errcode !== 0) {
      this.$h3.toast.show({
        text: res.errmsg,
        iconType: "",
      });
      return;
    }
    const url: any = this.$route.query.return;
    this.$router.push({ path: url + "?" + new Date().getTime() });
  }

  async getLoadData(){
     const res:any=  await workflowApi.getOpinionState({
      workflowInstanceId: this.workflowInstanceId,
    });
    if (res.errcode !== 0) {
      this.$h3.toast.show({
        text: res.errmsg,
        iconType: "",
      });
      return;
    }
    if(res.data.bizObject){
      this.schemaCode=res.data.bizObject.schemaCode;
      this.objectId=res.data.bizObject.id;
    }
  }
}
</script>
<style lang='less' scoped>
</style>