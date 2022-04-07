<template>
  <aside class="aside" :style="{ width: `${dragWidth}px` }">
    <a-layout-sider
      ref="slider"
      :trigger="null"
      theme="dark"
      collapsible
      collapsedWidth="52"
      v-model="isShow"
      class="aside-menu"
      width="100%"
    >
      <div
        :class="isShow ? 'aside-top hide-text' : 'aside-top'"
        v-if="curMenu === 'WorkflowCenterMenu'"
      >{{ $t('languages.common.workflowCenter') }}</div>
      <div
        :class="isShow ? 'aside-top hide-text' : 'aside-top'"
        v-else
        :title="isChinese ? menuTitle : menuTitleI18n[$i18n.locale]"
      >{{ isChinese ? menuTitle : menuTitleI18n[$i18n.locale] }}</div>
      <component :is="curMenu" />
      <!-- <workflow-center-menu/> -->
      <!-- <apps-menu/> -->
      <div :class="isShow ? 'hide-menu' : 'hide-menu open'" @click="hideMenu"></div>
    </a-layout-sider>
  </aside>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import {
  Layout
} from '@h3/antd-vue';

import {
  Mutation, namespace
} from 'vuex-class';

// import * as FlowCenter from '@cloudpivot/flow-center';

// import * as Application from '@cloudpivot/application';

// import AppsMenu from './menu/apps-menu.vue';

import common from '@cloudpivot/common';

import WorkflowCenterMenu from '@cloudpivot/flow-center/src/components/pc/menu/workflow-center-menu.vue';
import AppsMenu from '@cloudpivot/application/src/components/pc/apps-menu.vue';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

@Component({
  name: 'Aside',
  components: {
    ALayoutSider: Layout.Sider,
    // WorkflowCenterMenu: FlowCenter.components.pc.WorkflowCenterMenu,
    // AppsMenu: Application.components.pc.AppsMenu
    WorkflowCenterMenu,
    AppsMenu
  }
})
export default class Aside extends Vue {
  @WorkflowCenterModule.State('asideTitle') asideTitle: any;

  @WorkflowCenterModule.State('asideTitleI18n') asideTitleI18n: any;

  // 判断当前是否是中文版本
  get isChinese() {
    return this.$i18n.locale === 'zh';
  }

  // 侧边栏可拖拽初始宽度
  dragWidth: number = 200;

  startX:number = 200;

  // false 展开 true收起
  isShow: boolean = false;

  curMenu: string = 'WorkflowCenterMenu';

  menuTitle: string = '流程中心';

  menuTitleI18n: any = {};

  mounted() {
    this.switchMenu();
    // 拖拽功能
    this.$nextTick(() => {
      const dragLine: any = document.querySelector('#jDragLine');
      let that = this;
      let maxClientWidth
      let minWidth
      let maxWidth
      dragLine.addEventListener('mousedown', (e: any) => {
        maxClientWidth = document.body.clientWidth / 3;
        minWidth = that.dragWidth - 8;
        maxWidth = that.dragWidth + 8;
        document.body.setAttribute('unselectable','on');
        document.body.setAttribute('onselectstart','return false;')
        if (e.clientX >= minWidth && e.clientX <= maxWidth) {
          document.onmousemove = function (ev: any) {
            // 收缩的时候不允许拖拽
            if (that.isShow) return;
            that.dragWidth = ev.clientX;
            if (ev.clientX > maxClientWidth) {
              that.dragWidth = maxClientWidth;
            } else if (ev.clientX < that.startX) {
              that.dragWidth = that.startX;
            }
            common.utils.Bus.$emit('resize');
          }
          document.onmouseup = function () {
            document.body.removeAttribute('unselectable');
            document.body.removeAttribute('onselectstart')
            document.onmousemove = null;
            document.onmouseup = null;
          };
        }
      },false)
    });

    const curDom: any = this.$refs.slider;
    curDom.$el.addEventListener('transitionend', this.transitionendEvent, false);
  }

  transitionendEvent(e:any) {
    if (e.propertyName === 'width') {
      common.utils.Bus.$emit('resize');
    }
  }

  beforeDestroy() {
    const curDom: any = this.$refs.slider;
    curDom.$el.removeEventListener('transitionend', this.transitionendEvent, false);
  }

  // 切换菜单
  switchMenu() {
    if (!this.$route) return;
    const { fullPath } = this.$route;
    const isWorkflowCenterRoute = fullPath.includes('workflow-center');
    const isApplicationRoute = fullPath.includes('application');
    if (isWorkflowCenterRoute) {
      this.curMenu = 'WorkflowCenterMenu';
    } else if (isApplicationRoute) {
      this.curMenu = 'AppsMenu';
      this.menuTitle = this.asideTitle;
      this.menuTitleI18n = this.asideTitleI18n;
    }
  }

  hideMenu() {
    this.isShow = !this.isShow;
    if (this.isShow) {
      this.dragWidth = 52;
      this.startX = 52;
    } else {
      this.dragWidth = 200;
      this.startX = 200;
    }
  }

  @Watch('$route')
  onRouterChange() {
    this.switchMenu();
  }

  @Watch('asideTitle')
  onAsideTitleChange(v: any) {
    if (v) {
      this.menuTitle = v;
    }
  }

  @Watch('asideTitleI18n')
  onAsideTitleI18nChange(v: any) {
    if (v) {
      this.menuTitleI18n = v;
    }
  }

  // @Watch('dragWidth')

}
</script>

<style lang="less">
@import "../../../styles/themes/default.less";

.aside {
  height: 100%;
  position: relative;
  overflow-y: scroll;
  background: #001529;
  &::-webkit-scrollbar {
    width: 0px;
  }
  &::-webkit-scrollbar-thumb{
    background: transparent;
  }
  &:hover::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.45);
  }
  &::-webkit-scrollbar-track{
    background: transparent;
  }
  .aside-menu {
    height: calc(100vh - 64px);
  }
  .aside-top {
    width: 100%;
    height: 50px;
    overflow: hidden;
    padding: 0 14px 0 @base4-padding-xs;
    line-height: 50px;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
  }
  .hide-text {
    text-indent: -999px;
  }

  .hide-menu {
    width: 14px;
    height: 28px;
    line-height: 28px;
    border-radius: 2px 0px 0px 2px;
    position: absolute;
    top: 10px;
    right: 0;
    z-index: 10;
    background: url("../../../assets/icons/arrow-right.png") no-repeat center;
    background-color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
  }
  .open {
    background: url("../../../assets/icons/arrow-left.png") no-repeat center;
    background-color: rgba(255, 255, 255, 0.3);
  }
}
.ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected {
  background-color: unset;
  a {
    color: white !important;
    .icon {
      margin-right: @base4-padding-xs;
    }
  }
}
.ant-menu-item > a {
  & > .icon,
  & > span {
    height: 40px;
    vertical-align: top !important;
  }
}
.ant-menu-inline-collapsed-tooltip a {
  color: white !important;
  .icon {
    margin-right: @base4-padding-xs;
  }
  .ant-badge {
    margin-bottom: 3px;
  }
}

.ant-layout-sider {
  transition: unset !important;
}

// .ant-layout-sider-children {
//   margin-left: 4px;
// }
</style>
