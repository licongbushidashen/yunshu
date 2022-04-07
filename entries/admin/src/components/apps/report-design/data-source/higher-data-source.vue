<template>
  <div :class="prefixCls">
    <sidebar
      ref="sidebar"
      :corpId="corpId"
      :config="config"
      :initActiveNodeId="initActiveNodeId"
      :showCustomSql="customSql"
      :extendMenu="extendMenu"
      :extendActions="extendActions"
      editableKey="operateFlag"
      @add-data-source="addDataSource"
      @change="changeDataSource"
      @edit="editDataSource"
      @reload="refreshList"
      @onItem="onClickNode"
      @onAction="onAction"
    >
    </sidebar>

    <preview
      v-if="activeNode && pannelSwitch === 0"
      :corpId="corpId"
      :config="config"
      :objectId="activeNode ? activeNode.objectId : ''"
      :groupId="activeNode ? activeNode.parentObjectId : ''"
      :dateSourceType="activeNode ? activeNode.dateSourceType : ''"
      :displayName="activeNode ? activeNode.displayName : ''"
      :editable ="activeNode ? activeNode.operateFlag : ''"
      @edit="editSource"
    />

    <permisson-list v-if="pannelSwitch === 1" :objectId="permissonId" :nodeType="nodeType"></permisson-list>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DataSource } from "@h3/report";
import { isArray } from "tinymce";
import reportApi from '@/apis/report/data-source-api';
import PermissonList from './components/permisson-list.vue'

interface ExtendActionParam {
  value: string;
  label: string;
}

@Component({
  name: "h3-data-source-list",
  components: {
    Sidebar: DataSource.Sidebar,
    Preview: DataSource.Preview,
    PermissonList: PermissonList
  },
})
export default class DataSourceList extends Vue {
  // prefixCls = "h3-report-Js-plumb";
  @Prop()
  corpId!: String;
  @Prop()
  config!: any;

  dataSourceId = "";
  groupId = "testGroup";

  dataSteamList: any[] = [];

  nodeType: string = ''

  // 获取数据流列表
  getDataSteamList() {
    const vueInstance = this.$refs.sidebar as any;
    if (vueInstance) {
      this.dataSteamList = vueInstance.list;
    } else {
    }
  }

  // 自定义时失效
  extendMenu = [
    {
      type: 1, // 1:数据源项 0：数据源分组
      value: "permisson",
      label: "权限设置"
    },
  ];

  // 顶部扩展菜单
  extendActions: Array<ExtendActionParam> = [
    // {
    //   value: "permission",
    //   label: "权限设置",
    // },
  ];

  // 菜单vue实例对象
  siderInstance: any = null;

  mounted() {
    // 监听siderbar list变化
    this.$watch(
      () => {
        const instance = this.$refs.sidebar as any;
        return instance.list;
      },
      (val) => {
        console.log("值变化", val);
        if (isArray(val)) {
          this.checkMenuPermisson(val) 
        }
      }
    );
  }

  nodeOptions(e: any, treeNode: any) {
    (e.domEvent as Event).stopPropagation();
    const eventKey = e.key as string;
    const instance = this.$refs.sidebar as any
    instance[eventKey](treeNode, e.domEvent)
  }

  // 请求权限接口并重新赋值
  checkMenuPermisson(val) {
    const objectIds = val.reduce((stat: any, item: any) => {
      stat.push(item.objectId)
      return stat
    }, []).join(',')
    const params = {
      objectIdList: objectIds
    }
    console.log(params)
    reportApi.queryOperatePermission(params).then((res: any) => {
      if (res.errcode !== 0) {
        this.$message.error(res.errmsg as string);
        return;
      } else {
        // 根据返回内容处理权限组
        if(res.data) {
          res.data.forEach((item: any) => {
            val.forEach((element: any) => {
              if(item.objectId === element.objectId) {
                this.$set(element, "operateFlag", item.operateFlag);
              }
            })
          });
        }
      }
    })
  }

  pannelSwitch: number = 0  // 0 预览 1 权限

  permissonId: string = ''  // 当前查看的权限组id

  // 切换右侧为权限控制面板
  openPermissonList(node: any) {
    console.log('node==>', node)
    this.pannelSwitch = 1
    this.permissonId = node.objectId
    this.nodeType = node.nodeType
  }

  /**
   * @param eventKey 自定义事件钩子
   * @param node 当前操作的数据源项
   * @param e 当前操作的事件Dom信息，一般不用到
   */
  onClickNode({ eventKey, node, e }) {
    console.log(eventKey, node, e);
    // if (node.folder) {
    //   console.log('分组的菜单事件');
    // }
    //点击权限设置
    if (eventKey === 'permisson') {    
      this.pannelSwitch = 1
      this.permissonId = node.objectId
      this.nodeType = node.nodeType
    }
  }

  /**
   * 阻止i点击的默认行为
   */
  returnClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * 测试节点自定义菜单事件
   */
  test(payload) {
    // alert(JSON.stringify(payload))
  }

  getCookie(name: string) {
    // const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
    // const arr = document.cookie.match(reg);
    // if (arr) {
    //   return unescape(arr[2]);
    // }
    // return null;
  }

  // header新增sql数据流开关
  customSql: boolean = false;

  prefixCls: string = "h3-data-source-list";
  // 激活的数据流节点
  // activeNode: H3.DataSourceAPI.DataSourceNode | null = null;
  activeNode: any | null = null;

  // 初始化时默认选中的节点id
  initActiveNodeId: string | null = null;

  /**
   * 新建数据
   * @param groupId
   */
  addDataSource(groupId?: string) {
    this.$destroy();
    this.$router
      .push({ name: "ReportDataSourceDesigner" })
      .catch((err: any) => {
        err;
      });
  }

  /**
   * 刷新列表
   */
  refreshList() {
    (this.$refs.sidebar as any).loadDataSourceList();
  }

  editSource(node: any) {
    node.parentObjectId = this.activeNode.parentObjectId?this.activeNode.parentObjectId : '';
    (this.$refs.sidebar as any).edit(node);
  }
  /**
   * 改变源
   * @param nodeId
   */
  changeDataSource(node: any | null) {
    // 这里可以控制是否切换源，或者切换其他视图
    console.log(node)
    this.activeNode = node;
    this.pannelSwitch = 0
  }

  /**
   * 改变源Id
   * @param dataSourceId
   */
  editDataSource({ objectId, groupId, dateSourceType }) {
    // //判断url是否相同
    // if (dateSourceType === 200) {
    //   this.activeNode = null;
    // } else {
    //   let originId = getUrlNodeId();
    //   if (originId !== objectId) {
    //     let newUrl = "";
    //     if (originId) {
    //       let paramExp = new RegExp(`id=${originId}`);
    //       newUrl = location.href.replace(paramExp, `id=${objectId}`);
    //     } else {
    //       newUrl = location.href + `?id=${objectId}`;
    //     }
    //     window.history.replaceState({ objectId, groupId }, "", newUrl);
    //   }
    //   this.$destroy();
    //   this.$router.push({ path: "/pc/data-source/designer", query: { objectId, groupId } });
    // }

    console.log("editDataSource", objectId, groupId);
    this.$destroy();
    this.$router
      .push({ name: "ReportDataSourceDesigner", query: { objectId, groupId } })
      .catch((err: any) => {
        err;
      });
  }

  hashChange(e) {
    // if (e.oldURL !== e.newURL) {
    //   this.initActiveNodeId = getUrlNodeId();
    // }
  }

  // 顶部扩展菜单点击回调
  onAction(action: ExtendActionParam) {
    console.log(action);
    const value = action.value;
    switch (value) {
      case "permission":
        // 打开权限侧边弹窗
        const list = this.$refs.sidebar as any;
        this.dataSteamList = list.list;
        console.log(list.list);
        this.showPermisson = true;
        break;
    }
  }

  

  showPermisson: Boolean = false;

  created() {
    // this.getDataSteamList()
    // this.corpId = (this.getCookie("h3_EngineCode") as string) || this.corpId;
    // this.config.token = (this.getCookie("h3_Session") as string) || this.config.token;
    // this.config.userId = (this.getCookie("gr_user_id") as string) || this.config.userId;
    // this.initActiveNodeId = getUrlNodeId();
    // //hashchange
    // window.onhashchange = this.hashChange;
  }
}
</script>

<style lang="less">
// @import "~@base/styles/theme.less";
// .h3-data-source-list {
//   position: relative;
//   overflow: hidden;
//   flex: 1 1;
//   display: flex;
//   height: 100%;
//   color: @report-font-color-base;
// }
</style>
