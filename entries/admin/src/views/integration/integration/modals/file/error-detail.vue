<template>
  <div class="error-detail">
    <!-- 应用权限 -->
    <template v-if="errDetails.appManager && errDetails.appManager.length > 0">
      <div class="error-detail-item">
        <h3 class="title">应用权限：</h3>
        <ol>
          <li
            v-for="(item, index) in errDetails.appManager"
            :key="index"
          >{{ `${index + 1}. ${item}` }}</li>
        </ol>
      </div>
    </template>

    <!-- 数据模型 -->
    <template v-if="errDetails.dataModel">
      <!-- 数据模型 -->
      <template v-if="errDetails.dataModel.dataModelErr && errDetails.dataModel.dataModelErr.length > 0">
        <div class="error-detail-item">
          <h3 class="title">数据模型：</h3>
          <ol>
            <li
              v-for="(item, index) in errDetails.dataModel.dataModelErr"
              :key="index"
            >{{ `${index + 1}. ${item}` }}</li>
          </ol>
        </div>
      </template>

      <!-- 业务规则 -->
      <template v-if="errDetails.dataModel.bizRuleAllErrs && errDetails.dataModel.bizRuleAllErrs.length > 0">
        <div class="error-detail-item">
          <h3 class="title">业务规则：</h3>
          <ol>
            <li
              v-for="(item, index) in errDetails.dataModel.bizRuleAllErrs"
              :key="index"
            >{{ `${index + 1}. ${item}` }}</li>
          </ol>
        </div>
      </template>

      <!-- 数据权限 -->
      <template v-if="errDetails.dataModel.dataPermErr && errDetails.dataModel.dataPermErr.length > 0">
        <div class="error-detail-item">
          <h3 class="title">数据权限：</h3>
          <ol>
            <li
              v-for="(item, index) in errDetails.dataModel.dataPermErr"
              :key="index"
            >{{ `${index + 1}. ${item}` }}</li>
          </ol>
        </div>
      </template>

    </template>

    <!-- 表单设计 -->
    <template v-if="errDetails.formDesinge && errDetails.formDesinge.length > 0">
      <div class="error-detail-item">
        <h3 class="title">表单设计：</h3>
        <ol>
          <li
            v-for="(item, index) in errDetails.formDesinge"
            :key="index"
          >{{ `${index + 1}. ${item}` }}</li>
        </ol>
      </div>
    </template>

    <!-- 流程设计 -->
    <template v-if="errDetails.workflow && errDetails.workflow.length > 0">
      <div class="error-detail-item">
        <h3 class="title">流程设计：</h3>
        <ol>
          <li
            v-for="(item, index) in errDetails.workflow"
            :key="index"
          >{{ `${index + 1}. ${item}` }}</li>
        </ol>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component({
  name:"ErrorDetail"
})
export default class ErrorDetail extends Vue {
  @Prop() errDetails !:any;

}
</script>
<style lang="less" scoped>
  .error-detail {
    &-item {
      margin-bottom: 32px;
      .title {
        line-height: 22px;
      }
      & > ol > li {
        color: rgba(0, 0, 0, 0.65);
        line-height: 22px;
      }
    }
  }
</style>