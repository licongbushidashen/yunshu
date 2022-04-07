<template>
  <div class="menu-content workflow-menu">
    <a-menu theme="dark" mode="inline" v-model="selectedKeys">
      <a-menu-item key="1">
        <router-link to="/workflow-center/my-unfinished-workitem">
          <i class="icon aufontAll h-icon-all-list-work-o"></i>
          <!-- 以下的span内容与徽标之间不要出现空格，会造成排版错误 -->
          <span :class="specStyle ? 'specStyles' : ''">
            {{ $t('cloudpivot.flowCenter.pc.todoList') }}
            <a-badge :count="unFinishedListCount" :overflowCount="99" />
          </span>
        </router-link>
      </a-menu-item>

      <a-menu-item key="2">
        <router-link to="/workflow-center/my-unread-workitem">
          <i class="icon aufontAll h-icon-all-leave-application-o"></i>
          <!-- 以下的span内容与徽标之间不要出现空格，会造成排版错误 -->
          <span :class="specStyle ? 'specStyles' : ''">
            {{ $t('cloudpivot.flowCenter.pc.toreadList') }}
            <a-badge :count="unReadListCount" :overflowCount="99" />
          </span>
        </router-link>
      </a-menu-item>

      <a-menu-item key="3">
        <router-link to="/workflow-center/my-finished-workitem">
          <i class="icon aufontAll h-icon-all-clock-edit-o"></i>
          <span :class="specStyle ? 'specStyles' : ''">{{ $t('cloudpivot.flowCenter.pc.doneList') }}</span>
        </router-link>
      </a-menu-item>

      <a-menu-item key="4">
        <router-link to="/workflow-center/my-read-workitem">
          <i class="icon aufontAll h-icon-all-resumption-applicati"></i>
          <span :class="specStyle ? 'specStyles' : ''">{{ $t('cloudpivot.flowCenter.pc.readList') }}</span>
        </router-link>
      </a-menu-item>

      <a-menu-item key="5">
        <router-link to="/workflow-center/my-workflow">
          <i class="icon aufontAll h-icon-all-department-o"></i>
          <span :class="specStyle ? 'specStyles' : ''">{{ $t('cloudpivot.flowCenter.pc.myFlow') }}</span>
        </router-link>
      </a-menu-item>

      <a-menu-item key="9" v-if="!rootAdmin">
        <router-link to="/workflow-center/delegation-workflow">
          <i class="icon aufontAll h-icon-all-sales-order-o"></i>
          <span
            :class="specStyle ? 'specStyles' : ''"
          >{{ $t('cloudpivot.flowCenter.pc.delegationFlow') }}</span>
        </router-link>
      </a-menu-item>

      <a-sub-menu key="sub2" v-if="isAdmin || isPrivilegedPerson">
        <span slot="title">
          <i class="icon aufontAll h-icon-all-search-o"></i>
          <span
            :class="specStyle ? 'specStyles' : 'search-flow'"
          >{{ $t('cloudpivot.flowCenter.pc.searchFlow') }}</span>
        </span>
        <a-menu-item key="6">
          <router-link to="/workflow-center/query-instance">
            <!-- <i class="icon aufontAll h-icon-all-list-work-o"></i> -->
            <span
              :class="specStyle ? 'specStyles' : ''"
            >{{ $t('cloudpivot.flowCenter.pc.instanceSearch') }}</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="7" v-if="admin">
          <router-link to="/workflow-center/query-participant-workItem">
            <!-- <i class="icon aufontAll h-icon-all-list-work-o"></i> -->
            <span
              :class="specStyle ? 'specStyles' : ''"
            >{{ $t('cloudpivot.flowCenter.pc.taskSearch') }}</span>
          </router-link>
        </a-menu-item>
      </a-sub-menu>


      <!-- 常用审批意见已经移至流程详情界面
      <a-menu-item key="8">
        <router-link to="/workflow-center/my-comments">
          <i class="icon aufontAll h-icon-all-setting-o"></i>
          <span>审批意见配置</span>
        </router-link>
      </a-menu-item> -->
    </a-menu>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Watch, Prop
} from 'vue-property-decorator';

import {
  Action, namespace
} from 'vuex-class';

import {
  Menu, Badge
} from '@h3/antd-vue';

import * as WorkflowCenterNS from '../typings/workflow-center';

// 引入流程中心store
import WorkflowCenterStore from '../store/workflow-center';

@Component({
  name: 'WorkflowCenterMenu',
  components: {
    AMenu: Menu,
    AMenuItem: Menu.Item,
    ASubMenu: Menu.SubMenu,
    ABadge: Badge
  }
})

export default class WorkflowCenterMenu extends Vue {

  selectedKeys: string[] = [];

  specStyle: boolean = false;

  @Prop(Number) dragWidth!: number;

  @Watch('dragWidth')
  ondragWidthChange(v: any) {
    if (v > 230) {
      this.specStyle = true;
    } else {
      this.specStyle = false;
    }
  }

  get unFinishedListCount() {
    return this.$store && this.$store.state.WorkflowCenterStore.unFinishedListCount;
  }

  get unReadListCount() {
    return this.$store && this.$store.state.WorkflowCenterStore.unReadListCount;
  }

  get admin() {
    return this.$store && this.$store.state.System.System.admin; // 引入系统store的字段 
  }

  get isPrivilegedPerson(){// 是否特权人
    return this.$store && this.$store.state.System.System.isPrivilegedPerson; // 引入系统store的字段 
  }

  get isAdmin(){// 是否有登陆后台的权限
    return this.$store && this.$store.state.System.System.isAdmin; // 引入系统store的字段 
  }
  

  get rootAdmin() {
    return this.$store && this.$store.state.System.System.isRootAdmin;
  }

  @Watch('admin')
  onAdminChange(val: any) {
    // console.log('admin change: ', val);
    this.setSelectedKeys();
  }

  @Watch('$route')
  routeChange() {
    this.setSelectedKeys();
  }

  created() {
    // 动态注册模块
    this.$store && this.$store.registerModule('WorkflowCenterStore', WorkflowCenterStore);
  }

  beforeMount() {
    this.setSelectedKeys();

    this.handleGetWorkCount();
  }

  // 根据当前路由判断当前选中
  setSelectedKeys() {
    let { name } = this.$route;
    if (!name) return;
    if (!this.admin && ['queryInstance', 'queryParticipantWorkItem'].includes(name)) {
      name = 'myUnfinishedWorkItem'
    }
    name = name.substring(0, 1).toUpperCase() + (name as any).substring(1);
    let skey: number = 0;
    switch (name) {
      case 'MyUnfinishedWorkItem':
        skey = WorkflowCenterNS.SelectKeysMapping.MyUnfinishedWorkItem;
        break;

      case 'MyUnReadWorkItem':
        skey = WorkflowCenterNS.SelectKeysMapping.MyUnReadWorkItem;
        break;
      case 'MyFinishedWorkItem':
        skey = WorkflowCenterNS.SelectKeysMapping.MyFinishedWorkItem;
        break;
      case 'MyReadWorkItem':
        skey = WorkflowCenterNS.SelectKeysMapping.MyReadWorkItem;
        break;
      case 'MyWorkflow':
        skey = WorkflowCenterNS.SelectKeysMapping.MyWorkflow;
        break;
      case 'QueryInstance':
        skey = WorkflowCenterNS.SelectKeysMapping.QueryInstance;
        break;
      case 'QueryParticipantWorkItem':
        skey = WorkflowCenterNS.SelectKeysMapping.QueryParticipantWorkItem;
        break;
      // case 'MyComments':
      //   skey = WorkflowCenterNS.SelectKeysMapping.MyComments;
      //   break;
      case 'DelegationWorkflow':
        skey = WorkflowCenterNS.SelectKeysMapping.DelegationWorkflow;
        break;
      default:
        skey = -1;
        break;
    }

    const _k = skey.toString();
    this.selectedKeys = [_k];
  }

  // 获取任务数
  handleGetWorkCount() {
    this.$store.dispatch('WorkflowCenterStore/getWorkCount');
  }

  destroyed() {
    this.$store.unregisterModule('WorkflowCenterStore');
  }
}
</script>

<style lang="less">
@import "./style/index.less";
.workflow-menu {
  .ant-badge {
    margin-left: @base4-padding-xs;
    margin-top: -5px;
    transform: scale(0.9);
  }
  .ant-badge-count {
    box-shadow: none;
  }

  .ant-menu-dark .ant-menu-inline.ant-menu-sub .ant-menu-item {
    padding-left: 70px !important;
    & > a {
      font-size: 13px;
    }
  }
  /deep/.ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected {
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
      max-width: calc(100% - 34px) !important;
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
}
</style>