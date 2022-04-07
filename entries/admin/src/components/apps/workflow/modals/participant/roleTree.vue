<template>
  <a-tree
    :expandedKeys="expandedKeys"
    :loadData="loadChildrenNodes"
    :loadedKeys="loadedKeys"
    :treeData="treeDatas"
    @expand="getExpandedNodes"
    @select="selectItem"
    class="formula-tree"
    showIcon
    style="display: inline-block"
  >
    <span class="role-title" slot="title" slot-scope="node">
      <span :title="node.name" class="title">{{ node.name }}</span>
    </span>
  </a-tree>
</template>
<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';
  import {namespace} from 'vuex-class';
  import { organizationApi } from "@cloudpivot/api";

  const WorkflowModule = namespace('Apps/Workflow');

  @Component({
    name: "RoleTree"
  })
  export default class RoleTree extends Vue {
    expandedKeys: any = [];
    treeData: any = [{
      id: 'defalutRoleTree123',
      name: '组织角色',
      children: [],
      group: true
    }];

    get treeDatas() {
      return this.dataRecursion(this.treeData);
    }

    dataRecursion(list: []) {
      const arr: any = [];
      list.map((i: any) => {
        i.scopedSlots = {title: "title"};
        i.isLeaf = !i.group;
        i.selectable= !i.group;
        if (i.children && i.children.length) {
          i.children = this.dataRecursion(i.children);
        }
        arr.push(i);
      });
      return arr;
    }

    // 已加载的节点key值
    get loadedKeys(): string[] {
      return this.expandedKeys;
    }

    selectItem(keys: string[],e:any) {
      if(e.node.dataRef.id !== 'defalutRoleTree123'){
        this.$emit('select', e.node.dataRef);
      }
    }

    /**
     * 加载子节点
     */
    async loadChildrenNodes(e) {
      // 已展开的节点不再请求
      const {expanded, dataRef, pos} = e;

      if (expanded) return;

      if (dataRef.children && dataRef.children.length) return;
      let role: any = [];
      if(dataRef.id === 'defalutRoleTree123'){
        const res = await organizationApi.getRoleLeveOneInfoNew(false, false);
        role = res.data;
      }else{
        role = await this.getChildrenRole(dataRef.id);
      }
      dataRef.children = [...role];
    }

    async getChildrenRole(groupId) {
      const res = await organizationApi.getChildrenRoleNew({
        groupId: groupId,
      });

      return res.data;
    }



    // 获取角色组下的角色
    getExpandedNodes(expandedKeys: any, e: any) {
      this.expandedKeys = expandedKeys;
    }
  }
</script>
<style lang="less" scoped>
  .formula-tree {
    min-width: 284px;
    text-align: left;
    margin-left: 12px;
    /*padding-bottom: 10px;*/
    
    /deep/ li {
      padding: 7px 0;
      
      span,
      span:hover,
      span:before {
        color: rgba(0, 0, 0, 0.65);
        background-color: transparent !important;
        user-select: none;
      }
      
      span.ant-tree-switcher {
        color: rgba(0, 0, 0, 0.65) !important;
      }
      
      span.ant-tree-iconEle {
        display: none;
      }
      
      span.ant-tree-title {
        padding-right: 8px;
      }
      
      ul.ant-tree-child-tree {
        span:hover,
        span.ant-tree-node-content-wrapper:hover,
        span.ant-tree-node-selected .ant-tree-title {
          color: @primary-color !important;
        }
      }
    }
  }
</style>
