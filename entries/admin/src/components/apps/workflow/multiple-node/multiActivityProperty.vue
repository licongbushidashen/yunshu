<template>
  <div class="property-container">
    <a-collapse :bordered="false" :activeKey="['1', '2', '3']">
      <!-- 一般属性 -->
      <a-collapse-panel header="一般属性" key="1">
        <common-setting/>
      </a-collapse-panel>

      <!-- 数据权限 -->
      <a-collapse-panel key="2">
        <div slot="header">
          <span>数据权限</span>
          <p class="head-tips">注：
            <a-checkbox class="check-box" :checked="true"></a-checkbox>所有节点都选中
            <a-checkbox class="check-box" :indeterminate="true"></a-checkbox>节点存在不同权限
            <a-checkbox class="check-box check-empty" :checked="false"></a-checkbox>所有节点均为空
          </p>
        </div>
        <data-item/>
      </a-collapse-panel>

      <!-- 操作权限 -->
      <a-collapse-panel key="3">
        <div slot="header">
          <span>操作权限</span>
          <p class="head-tips">注：
            <a-checkbox class="check-box" :checked="true"></a-checkbox>所有节点都选中
            <a-checkbox class="check-box" :indeterminate="true"></a-checkbox>节点存在不同权限
            <a-checkbox class="check-box check-empty" :checked="false"></a-checkbox>所有节点均为空
          </p>
        </div>
        <operation/>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DataItem from './property/dataItem.vue';
import CommonSetting from './property/commonSetting.vue';
import Operation from './property/operation.vue';


@Component({
  name: 'MultiActivityProperty',
  components: {
    CommonSetting,
    Operation,
    DataItem,
  }
})

export default class MultiActivityProperty extends Vue {

}
</script>

<style lang="less" scoped>
.property-container{
    position: relative;
    /deep/.ant-collapse-header{
      i{
        top: 23px !important;
      }
      .head-tips{
        color: rgba(0,0,0,0.45);
        font-size:12px;
        font-weight: 400;
        margin-top: 10px;
        margin-left: -14px;
        .check-box{
          &.check-empty:hover{
            /deep/.ant-checkbox-inner{
              border-color: #d9d9d9;
            }
          }
          /deep/.ant-checkbox-inner{
            width: 14px;
            height: 14px;
            margin-right: 3px;
          }
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
      }
    }
}
.property-container{
  /deep/.ant-collapse .ant-collapse-item {
    text-align: left;
    background: #fff;
  }
}
.property-container .ant-collapse > .ant-collapse-item {
  border-bottom: 0;
}
</style>
