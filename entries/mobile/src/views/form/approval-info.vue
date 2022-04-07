<template>
  <div>
    <div class="list">
      <label>操作动作</label>
      <div>{{getTitle($route.params.workActionType)}}</div>
    </div>

    <!-- 修改拥有者 -->
    <template v-if="[17].includes($route.params.workActionType)">
      <div class="list">
        <label>新拥有者</label>
        <div>{{$route.params.bizComment && $route.params.bizComment.userInfos && $route.params.bizComment.userInfos.map(el => el.name).join('、')}}</div>
      </div>
      <div class="list">
        <label>拥有者部门</label>
        <div>{{$route.params.bizComment && $route.params.bizComment.userInfos && $route.params.bizComment.userInfos.map(el => el.departmentName).join('、')}}</div>
      </div>
    </template>

    <!-- 激活其他节点 -->
    <div class="list" v-if="$route.params.workActionType === 18">
      <label>选择节点</label>
      <div>{{$route.params.bizComment && $route.params.bizComment.activityName}}</div>
    </div>

    <!-- 调整当前处理人 -->
    <div class="list" v-if="[19].includes($route.params.workActionType)">
      <label>调整后处理人</label>
      <div>{{$route.params.bizComment && $route.params.bizComment.userInfos && $route.params.bizComment.userInfos.map(el => el.name).join('、')}}</div>
    </div>


    <div class="list" >
      <label>处理意见</label>
      <div>{{$route.params.bizComment.content}}</div>
    </div>
    <div class="list" >
      <label>操作人</label>
      <div>{{$route.params.approvaler.name}}</div>
    </div>
    <div class="list" >
      <label>操作时间</label>
      <div>{{$route.params.approvalTime}}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
@Component({
  name: "approval-info",
  components: {
    
  },
})
export default class approvalInfo extends Vue {
  getTitle(workActionType){
    const Obj = {
      2: '作废流程',
      9: '结束流程',
      18: '激活其他节点',
      20: '取消当前节点所有任务',
      17: '修改拥有者',
      19: '调整当前处理人',
    }
    return Obj[workActionType]
  }
}
</script>
<style lang="less" scoped>
@import "~@/styles/mixins.less";

.list{
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  .px2rem(line-height, 38px);
  .px2rem(padding-top, 26px);
  .px2rem(padding-bottom, 26px);
  .px2rem(padding-left, 15px);
  .px2rem(padding-right, 15px);
  .px2rem(font-size, 30px);
  background-color: #fff;
  label{
    min-width: 7em;
    max-width: 7em;
    display: inline-block;
    color: #666;
    text-align: left;
  }
  &>div{
    flex: 1;
    text-align: justify;
    color: #333;
  }
}
</style>
