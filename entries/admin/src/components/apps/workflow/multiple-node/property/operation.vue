<template>
  <div class="operation">
    <!-- 基本操作 -->
    <property-widget
      label="基本操作"
      v-show="!isLoading"
    >
      <template>
        <div slot="right" class="check-wrap">
          <div
            v-for="(i,index) in baseOperation"
            :key="index"
            class="check-item"
          >
            <a-checkbox
              v-model="i.selected"
              :indeterminate="i.indeterminate"
              class="checkbox"
              @change="onSelectChange(i)"
            ></a-checkbox>
            <span>{{ i.text }}</span>
            <p v-if="i.code === 'batchOperate'" class="check-tips">批量处理不进行表单校验，请谨慎勾选</p>
          </div>
        </div>
      </template>
    </property-widget>
    <!-- 驳回操作 -->
    <property-widget
      label="驳回操作"
      v-show="!isLoading"
    >
      <template>
        <div slot="right" class="check-wrap">
          <div
            v-for="(item,index) in permittedOperation"
            :key="index"
            class="check-item"
          >
            <a-checkbox
              v-model="item.selected"
              :indeterminate="item.indeterminate"
              :disabled="item.code === 'rejectToFixded'"
              class="checkbox"
              @change="onSelectChange(item)"
            ></a-checkbox>
            <span :class="{'check-disabled': item.code === 'rejectToFixded'}">{{ item.text }}</span>
          </div>
        </div>
      </template>
    </property-widget>

    <PageLoading
      v-model="isLoading"
      shadeColor="#FFF"
      text="操作权限获取中，请稍侯…"
      :shadeOpacity="0.8"
    ></PageLoading>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import {
  State, Mutation, namespace
} from 'vuex-class';
import PropertyWidget from '../../base/propertyWidget.vue';
import PageLoading from '@/components/shared/loading/page-loading/page-loading.vue';

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'MultiOperation',
  components: {
    PropertyWidget,
    PageLoading
  }
})

export default class MultiOperation extends Vue {
  @WorkflowModule.State('selectedActivities') selectedActivities: any;

  @WorkflowModule.Mutation('changeActivityByBatch') changeActivityByBatch: any;

  // 基本操作默认数据
  baseOperation:any = [{
    text: '转办',
    code: 'forward',
    indeterminate: false,
    flag: 'flag',
    selected: false
  }, {
    text: '撤回',
    code: 'retrieve',
    indeterminate: false,
    flag: 'flag',
    selected: false
  }, {
    text: '协办',
    code: 'assist',
    indeterminate: false,
    flag: 'flag',
    selected: false
  }, {
    text: '传阅',
    code: 'circulate',
    indeterminate: false,
    flag: 'flag',
    selected: false
  }, {
    text: '加签',
    code: 'adjustParticipant',
    indeterminate: false,
    flag: 'flag',
    selected: false
  }, {
    text: '结束流程',
    code: 'finishInstance',
    indeterminate: false,
    flag: 'flag',
    selected: false
  }, {
    text: '批量处理',
    code: 'batchOperate',
    indeterminate: false,
    flag: 'flag',
    selected: false
  }];

  // 驳回操作默认数据
  permittedOperation:any = [{
    text: '驳回到开始',
    code: 'rejectToStart',
    indeterminate: false,
    flag: 'flag',
    selected: false
  }, {
    text: '驳回到上一步',
    code: 'reject',
    indeterminate: false,
    flag: 'flag',
    selected: false
  }, {
    text: '驳回到指定活动',
    code: 'rejectToFixded',
    indeterminate: false,
    flag: 'flag',
    selected: false
  }];

  isLoading:boolean = false;

  get multipleLength() {
    return this.selectedActivities.length || 0;
  }

  // 操作权限select改变
  onSelectChange(check?: any) {
    if (check && check.indeterminate) {
      this.$nextTick(() => {
        this.$set(check, 'selected', true);
        this.$set(check, 'indeterminate', false);
        this.changeActivityByBatch({ key: 'permittedAction', PropValue: { key: check.code, value: true } });
      });
      return;
    }
    this.changeActivityByBatch({ key: 'permittedAction', PropValue: { key: check.code, value: check.selected } });
  }

  // 根据数据初始化视图
  dataMounted() {
    this.isLoading = true;
    this.baseOperation.forEach((base: any) => base.flag = 'flag');
    this.permittedOperation.forEach((base: any) => base.flag = 'flag');
    
    this.selectedActivities.forEach((sel:any) => {
      const operationArray = Object.entries(sel.permittedAction);
      operationArray.forEach((a: any) => {
        if (!a && !a[0] && !a[1]) {
          return;
        }
        const [key, value] = a;
        this.baseOperation.forEach((base: any) => {
          if (base.code === key) {
            base.selected = value;
            if (base.flag !== 'flag' && base.flag !== value) {
              base.indeterminate = true;
            }
            base.flag = value;
          }
        });
        this.permittedOperation.forEach((base: any) => {
          if (base.code === key) {
            base.selected = value;
            if (base.flag !== 'flag' && base.flag !== value) {
              base.indeterminate = true;
            }
            base.flag = value;
          }
        });
      });
    });
    this.isLoading = false;
  }

  @Watch('multipleLength', { immediate: true })
  onMultiActivityChange(v: string) {
    this.dataMounted();
  }
}
</script>

<style lang="less" scoped>
.operation{
  &.page-loading-wrap{
    min-height: 104px;
  }
  .check-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 100%;
    padding: 0 8px;
    .check-item{
      width: 50%;
      font-size: 14px;
      margin: 5px 0px;
      line-height: 22px;
      .checkbox{
        font-size: 14px;
        margin-right: 6px;
        /deep/.ant-checkbox-indeterminate{
          .ant-checkbox-inner{
            background-color: #75C9B5;
            border-color: #75C9B5;
            &:after{
              width: 10px;
              height: 3px;
              background-color: #fff;
            }
          }
        }
      }
      .check-disabled{
        color: rgba(0,0,0,0.45) !important;
      }
      .check-tips{
        color: rgba(0,0,0,0.45);
        font-size:12px;
        padding-left: 30px;
      }
    }
    /deep/.input-select{
      width: 100%;
      border: none;
      /deep/.ant-select-selection{
        border: none;
        box-shadow: none;
      }
    }
  }
}
.select-empty-content{
  margin: 8px 0;
  text-align: center;
}
</style>
