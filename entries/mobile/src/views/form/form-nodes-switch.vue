<template>
  <div class="form-nodes-switch">
    <div class="form-nodes-switch-header" @click="swithShow">
      <span>{{ activeNodes }}</span>
      <i
        class="icon aufontAll h-icon-all-down-o"
      ></i>
    </div>
    <div
      class="form-nodes-switch-content"
      v-transfer-dom
      v-show="showPanel"
    >
      <ul class="form-nodes-switch-content-panel">
        <li
          v-for="(node, index) in nodes"
          :key="node.activityCode"
          @click="nodesSwitch(index)"
        >
          <span>{{ node.activityName }}</span>
          <check-box
            :defaultChecked="node.selected"
            :radio="true"
            @change="nodesSwitch(index)"
          />
        </li>
        
      </ul>
      <div class="form-nodes-switch-content-mask"></div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Watch, Prop
} from 'vue-property-decorator';

import {
  H3Avatar
} from 'h3-mobile-vue';

import * as platform from '@cloudpivot/platform';
import common from '@cloudpivot/common/mobile';

@Component({
  name: 'form-nodes-switch',
  components: {
    H3Avatar,
    CheckBox: common.components.Checkbox,
  },
  directives: {
    TransferDom: common.directives.transferDom
  }
})
export default class FormNodesSwitch extends Vue {

  @Prop() nodes!: any;

  showPanel = false;

  swithShow() {
    this.showPanel = !this.showPanel;
  }

  get activeNodes() {
    const theNode = this.nodes.find(res => res.selected);
    if (theNode) {
      return theNode.activityName
    }
    return '';
  }

  nodesSwitch(index:number) {
    if (this.nodes[index].selected) return;
    let theNode = '';
    this.nodes.forEach((res,idx) => {
      if (idx === index) {
        res.selected = true;
        theNode = res.activityCode
      } else {
        res.selected = false;
      }
    });
    this.nodes = this.nodes.slice();
    this.swithShow();
    this.$emit('nodesSwitch', theNode);
  }
  
}

</script>
<style lang="less" scoped>
@import "~@/styles/mixins.less";
@import "~@/styles/mixins/hairline.less";
.form-nodes-switch {
  &-header {
    position: relative;
    text-align: left;
    background: #fff;
    display: flex;
    align-items: center;
    font-weight: 500;
    .px2rem(padding-left, 30px);
    .px2rem(font-size, 34px);
    height: 44px;
    // .px2rem(height, 90px);
    span {
      .px2rem(padding-right, 18px);
    }
    .hairline("bottom", #eeeeee);
  }
  &-content {
    text-align: left;
    &-mask {
      position: fixed;
      z-index: 1001;
      background-color: rgba(0,0,0,.4);
      .px2rem(top, 90px);
      bottom: 0;
      width: 100%;
    }
    &-panel{
      position: fixed;
      z-index: 1002;
      .px2rem(top, 90px);
      width: 100%;
      .px2rem(min-height, 200px);
      background: #fff;
      & > li {
        .px2rem(height, 90px);
        .px2rem(padding-left, 30px);
        .px2rem(padding-right, 30px);
        .px2rem(font-size, 30px);

        display: flex;
        align-items: center;
        justify-content: space-between;

        /deep/.home-checkbox-item {
        float: right;
        .px2rem(width, 36px);
        .px2rem(height, 36px);
        .px2rem(line-height, 36px);
      }
      }
    }
  }
}

</style>
