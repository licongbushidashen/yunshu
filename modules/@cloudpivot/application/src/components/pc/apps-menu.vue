<template>
  <div class="menu-content">
    <a-menu
      theme="dark"
      mode="inline"
      v-if="isLoaded"
      :defaultOpenKeys="defaultOpenKeys"
      v-model="selectKeys"
      @openChange="openChange"
      @click="setSelectedKeys"
    >
      <template v-for="(menu) in appTrees">
          <a-menu-item
          :key="menu.id"
          v-if="menu.type != 'Folder'"
          @click="switchRouter(menu)"
          :title="isChinese ? menu.name : menu.name_i18n[$i18n.locale]"
        >
          <router-link :to="''" v-if="menu.type === 'BizModel'">
            <i class="icon aufontAll" :class="menu.icon"></i>
            <span :class="specStyle ? 'specStyles' : ''">{{ isChinese ? menu.name : menu.name_i18n[$i18n.locale] }}</span>
          </router-link>
          <a v-else>
            <i class="icon aufontAll" :class="menu.icon"></i>
            <span :class="specStyle ? 'specStyles' : ''">{{ isChinese ? menu.name : menu.name_i18n[$i18n.locale] }}</span>
          </a>
        </a-menu-item>
        <sub-menu :fn="switchRouter" :menu="menu" :key="menu.id" :specStyle="specStyle"  v-else></sub-menu>
        <!-- <a-sub-menu :key="menu.id" v-else>
          <span slot="title">
            <i class="icon aufontAll" :class="menu.icon ? menu.icon : 'h-icon-all-folder-open-o'"></i>
            <span :class="specStyle ? 'specStyles' : ''" :title="isChinese ? menu.name : menu.name_i18n[$i18n.locale]">{{ isChinese ? menu.name : menu.name_i18n[$i18n.locale] }}</span>
          </span>
          <a-menu-item
            v-for="(childMenu) in menu.children"
            :key="childMenu.id"
            @click="switchRouter(childMenu)"
          >
            <router-link :title="isChinese ? childMenu.name : childMenu.name_i18n[$i18n.locale]" :to="''" v-if="childMenu.type === 'BizModel'">
              <i class="icon aufontAll" :class="childMenu.icon"></i>
              <span :class="specStyle ? 'specStyles' : ''">{{ isChinese ? childMenu.name : childMenu.name_i18n[$i18n.locale] }}</span>
            </router-link>
            <a :title="isChinese ? childMenu.name : childMenu.name_i18n[$i18n.locale]" v-else>
              <i class="icon aufontAll" :class="childMenu.icon"></i>
              <span :class="specStyle ? 'specStyles' : ''">{{ isChinese ? childMenu.name : childMenu.name_i18n[$i18n.locale] }}</span>
            </a>
          </a-menu-item>
        </a-sub-menu> -->
      </template>
    </a-menu>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Watch, Prop, Emit
} from 'vue-property-decorator';

import {
  Mutation, namespace
} from 'vuex-class';

import {
  Menu
} from '@h3/antd-vue';

import { listApi, listParams } from '@cloudpivot/api';

import common from '@cloudpivot/common';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');
import SubMenu from "./sub-menu.vue";

@Component({
  name: 'AppsMenu',
  components: {
    SubMenu,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    ASubMenu: Menu.SubMenu
  }
})

export default class AppsMenu extends Vue {
  @WorkflowCenterModule.Mutation('setApplicationPageTitle') setApplicationPageTitle:any;

  // 判断当前是否是中文版本
  get isChinese() {
    return this.$i18n.locale === 'zh';
  }
  specStyle:boolean = false;
  // 应用目录
  appTrees:Array<listParams.tree> = [];

  selectKeys:any[] = [];

  defaultOpenKeys:any[] = [];

  isLoaded:boolean = false;

  queryCode:any = '';

  mounted() {
    // this.getFolder();
    // this.$router.afterEach((to,form) => this.getFolder());
  }

  @Prop(Number) dragWidth!:number;

  @Watch('dragWidth')
  ondragWidthChange(v:any) {
    if(v > 230) {
      this.specStyle = true;
    }else{
      this.specStyle = false;
    }
  }

  get inApp(){
    return this.$route.path.search('/application') > -1;
  }

  async loadFirstMenu(){

    const appCode = this.appCode;
    if(!appCode || !this.inApp){
      return;
    }

    this.isLoaded = false;

    const params = { appCode, isMobile: false };

    const res = await listApi.getFolder(params);
    let _url:string = '';

    if (res.errcode === 0) {
      if (res.data.length <= 0) return;
      // 初始化国际化，兼容老数据
      if (Array.isArray(res.data)) {
        res.data.forEach((data:any) => {
          common.utils.compatible(data, 'name');
          if (data.children && Array.isArray(res.data)) {
            data.children.forEach((childData:any) => {
              common.utils.compatible(childData, 'name');
            });
          }
        });
      }
      this.appTrees = res.data;
      this.setTreeStatus(res.data);
      console.log(this.appTrees, 'this.appTrees')
      await this.getFolder();

      this.isLoaded = true;
  }
  }
  setTreeStatus(treeData: any){ // 之前使用index作为defaultOpenKeys,现在全部用id,需要重新计算
    const { query: queryData } = { ...this.$route };
    const parentId = queryData.parentId;
    const code = queryData.code;
    let defaultOpenKeys = [] as any;
    let _backtrack = (data,id)=>{
      if(!data || !id )return;
      data.some((item:any)=>{
        if(item.id == id){
          defaultOpenKeys.push(id);
          _backtrack(treeData,item.parentId)
          return true;
        }else if(item.id != id && item.children){
          _backtrack(item.children,id)
        }
      })
    }
    let _helper = (data,id) => {
      if(!data) return;
      data.some((item:any) =>{
        // 这个是做深度遍历,这个是获取指定节点ID
        if(item.code == code && item.parentId == id){ //// 后面回溯时不再做这个处理
          this.selectKeys = [item.id];
          return true;
        }else if(item.code != code && item.children){
          _helper(item.children,item.id);
        }
      })
    }
    if(treeData['0'].parentId != parentId){ // 表明是自定义的分组
      _helper(treeData,parentId);
      _backtrack(treeData,parentId);
      this.defaultOpenKeys = defaultOpenKeys;
      // console.log('defaultOpenKeys------------>',defaultOpenKeys);
    }
  }
  // 根据appCode获取目录
  async getFolder() {
    if(!this.inApp){
      return;
    }
    // if (this.$route.query.queryCode) {
    //   this.queryCode = this.$route.query.queryCode;
    // }

    // const { appCode } = this.$route.params;
    // const params = { appCode, isMobile: false };
    // const res = await listApi.getFolder(params);
    // let _url:string = '';

    // if (res.errcode === 0) {
    //   if (res.data.length <= 0) return;
    //   // 初始化国际化，兼容老数据
    //   if (Array.isArray(res.data)) {
    //     res.data.forEach((data:any) => {
    //       common.utils.compatible(data, 'name');
    //       if (data.children && Array.isArray(res.data)) {
    //         data.children.forEach((childData:any) => {
    //           common.utils.compatible(childData, 'name');
    //         });
    //       }
    //     });
    //   }
    //   this.appTrees = res.data;

      // 刷新页面后定位对应列表：如果有参数parentId则默认选中之前打开的模型，否则默认打开第一个模型
     const { query: queryData } = { ...this.$route };
      if (queryData && queryData.parentId && queryData.code) {
        const codes = queryData.code;
        const parentIds = queryData.parentId;
        // 应用下的模型
        if (parentIds === this.appTrees[0].parentId) {
          const index = this.appTrees.findIndex((tree:any) => tree.code === codes);
          if (index !== -1) {
            this.selectKeys = [this.appTrees[index].id];
            if (!queryData.openMode || queryData.openMode === 'undefined') {
              const params : any = {
                appCode: this.appTrees[index].appCode
              };

              const code = this.appTrees[index].code;
              if(this.$route.name === 'applicationReport'){
                params.reportCode = code;
              }else{
                params.schemaCode = code;
                if(!code){
                  return;
                }
              }

              this.$router.push({
                name: this.$route.name,
                params,
                query: queryData,
              }).catch((err: any) => {err});;
            } else if (queryData.openMode === 'RECENT_PAGE_MODE' && queryData.pcUrl) {
              this.$router.push({
                name: 'applicationDefine',
                params: {
                  url: queryData.pcUrl as any
                },
                query: queryData
              }).catch((err: any) => {err});
            } else if (queryData.pcUrl) {
              this.$router.push({
                path: queryData.pcUrl as any,
                query: queryData
              }).catch((err: any) => {err});
            }
            const _title = this.getNameBySelectedKeys(this.selectKeys);
            this.setApplicationPageTitle(_title);
          }
          return;
        } else {
          // 目录下的模型
          const item = this.getItemFromTreeById(parentIds,true);
          //const index = this.appTrees.findIndex((tree:any) => tree.id === parentIds);
          if(item){
            this.openChange([`${item.id}`], codes);
            return;
          }
        }
      } //else { // 第一次打开应用列表逻辑
      this.initFirstMode();
      //}
  }

  initFirstMode(){
    // 如果第一级是目录，则展开并选中目录下第一个模型，否则选中第一个
    if (this.appTrees[0].type === 'Folder') {
      const _d = this.appTrees[0].children[0];
      this.selectKeys = [_d.id];
      this.switchRouter(_d);
      // _url = `/application/${_d.appCode}/application-list/${_d.code}`;
    } else if (this.appTrees[0].type === 'Page') { // 自定义页面
      this.selectKeys = [this.appTrees[0].id];
      this.pageGo(this.appTrees[0]);
    } else {
      this.selectKeys = [this.appTrees[0].id];
      this.switchRouter(this.appTrees[0]);
      // _url = `/application/${this.appTrees[0].appCode}/application-list/${this.appTrees[0].code}?queryCode=${this.queryCode}`;
      // this.$router.push(_url);
    }
    const _title = this.getNameBySelectedKeys(this.selectKeys);
    this.setApplicationPageTitle(_title);

    this.isLoaded = true;
  }

  /**
   *@desc 获取当前目录下的模型
   *@params openKeys 当前展开的key,key就是当前的数据的下标
  */
  async openChange(openKeys:string[], schemaCodes?:any, indexKey?:number) {
    const _k:number = 0;
    let index:number = -1;
    // openKeys.forEach((key:string) => {
    //   const _idx = parseInt(openKeys[0], 10);
    //   if (!this.appTrees[_idx].children || this.appTrees[_idx].children.length <= 0) {
    //     index = _idx;
    //   }
    // });

    // 只有更新了index才会去加载最新的
    if (index !== -1) {
      const folderId = this.appTrees[index].id;
      const timestamp:number = Date.now();
      const res = await listApi.getModel({ id: folderId });
      if (res.errcode === 0) {
        const diff:number = Date.now() - timestamp;
        if (res.data && res.data.length > 0) {
          // 初始化国际化，兼容老数据
          if (Array.isArray(res.data)) {
            res.data.forEach((data:any) => {
              common.utils.compatible(data, 'name');
            });
          }
          const throttle:number = diff > 280 ? 0 : (280 - diff);

          setTimeout(() => {
            this.appTrees[index].children = res.data;
            this.setDefaultKeys(schemaCodes, indexKey);
          }, throttle);
        }
      }
    } else {
      this.setDefaultKeys(schemaCodes, indexKey);
    }
  }

  setDefaultKeys(schemaCodes:any, indexKey?:number) {
    if (schemaCodes && indexKey) {
      const key = this.appTrees[indexKey - 1].children.findIndex((tree:any) => tree.code === schemaCodes);
      if(key === -1){
        this.initFirstMode();
        return;
      }
      const _d = this.appTrees[indexKey - 1].children[key];
      this.defaultOpenKeys = [this.appTrees[indexKey - 1].id];
      this.selectKeys = [_d.id];
      this.isLoaded = true;
      this.switchRouter(_d);
    }

    const _title = this.getNameBySelectedKeys(this.selectKeys);
    this.setApplicationPageTitle(_title);
  }

  setSelectedKeys(item:any, key:any, keyPath:any) {
    // if (typeof item.key === 'number') {
    //   const k = item.key.toString();
    //   this.selectKeys = [k];
    // } else {
    this.selectKeys = [item.key];
    //}
    this.setApplicationPageTitle({});

    const _title = this.getNameBySelectedKeys(this.selectKeys);
    setTimeout(() => { this.setApplicationPageTitle(_title); }, 0);

  }
  updateFolderChildById(key:string,listData:any){ // 更新folder下对应的children,会改变appTree的值
    let _helper = (data) => {
      if(!data)return;
      data.some((item: any)=>{
        if(item.id == key && item.type == 'Folder'){
          item.children = listData;// 引用关系改变值,危险操作
          return true;
        }else if(item.id != key && item.type == 'Folder'){
          _helper(item.children);
        }
      })
    }
    _helper(this.appTrees);
  }
  // getFolderById(id){ // 通过parentId查

  // }
  // isFolder true 表明查询的是folder,如果不是查询的item
  getItemFromTreeById(key:any,isFolder?:any){
    let selectItem = undefined as any;
    let _helper = (data) => {
      if(!data)return;
      data.some((item: any)=>{
        if(item.id == key && item.type != 'Folder' && !isFolder){ // 查询item info
          selectItem = item;
          return true;
        }else if(item.id == key && item.type == 'Folder' && isFolder){ // 查询folder info
          selectItem = item;
          return true;
        }
        else if(item.type == 'Folder' && item.children){
          _helper(item.children);
        }
      })
    }
    _helper(this.appTrees);
    return selectItem;
  }
  // 根据key获取当前title
  getNameBySelectedKeys(keys:any) {
    if (!keys) return;
    const _keys = keys[0]; // 现在key用id,逻辑需要调整
    return this.getItemFromTreeById(_keys);
    // let selectItem = {};
    // let _helper = (data) => {
    //   if(!data)return;
    //   data.some((item: any)=>{
    //     if(item.id == _keys && item.type != 'Folder'){
    //       selectItem = item;
    //       return true;
    //     }else if(item.type == 'Folder' && item.children){
    //       _helper(item.children);
    //     }
    //   })
    // }
    // _helper(this.appTrees);
    // let _t:any = '';
    // if (_keys && _keys.includes('-')) { // 说明是目录下的模型
    //   const _m = parseInt(_keys.split('-')[0], 10);
    //   const _c = parseInt(_keys.split('-')[1], 10);

    //   _t = this.appTrees[_m].children[_c];
    // } else { // 说明当前选中就是模型
    //   const _i = parseInt(_keys, 10);
    //   _t = this.appTrees[_i];
    // }

    //return _t;
    // return selectItem;
  }


  /**
   * 目录切换
   */
  switchRouter(menu: any) {
    if (menu.type === 'BizModel') {
      this.selectKeys = [menu.id];
      this.$nextTick(() => {
        this.bizModelGo(menu);
      })
    } else if (menu.type === 'Report') {
      this.reportGo(menu);
    } else if(menu.pcUrl && menu.pcUrl.includes('workflow-design')) { // 流程设计,则新开
      this.redirectWorkflowPage(menu);
    } else if (menu.pcUrl) {
      this.pageGo(menu);
    } else if (menu.type === 'Folder' && menu.children && menu.children.length > 0){
      menu.children[0].id && this.switchRouter(menu.children[0]);
    } else {
      this.$message.error('页面地址未设置，请联系管理员！');
    }
  }
  redirectWorkflowPage(data: any){
    const { href } = this.$router.resolve({
      name: 'design',
      query: {
        parentId: data.parentId,
        code: data.code,
        openMode: data.openMode
      }
    });
    window.open(href,'_blank');
  }
  pageGo(menu: any) {
    if (menu.openMode === 'RECENT_PAGE_MODE') {
      console.log(menu, 'menu')
      this.$router.push({
        name: 'applicationDefine',
        params: {
          url: menu.pcUrl
        },
        query: {
          parentId: menu.parentId,
          code: menu.code,
          openMode: menu.openMode,
          pcUrl: menu.pcUrl,
          queryCode: this.queryCode
        },
      }).catch((err: any) => {err});
    } else if (menu.openMode === 'NEW_PAGE_MODE') {
      window.open(menu.pcUrl);
    } else {

      this.$router.push({
        path: menu.pcUrl,
        query: {
          parentId: menu.parentId,
          code: menu.code,
          openMode: menu.openMode,
          pcUrl: menu.pcUrl,
          queryCode: this.queryCode
        },
      }).catch((err: any) => {err});
    }
  }

  bizModelGo(menu: any) {
    if(menu.appCode === 'nfq007' && menu.code ==="liucheng0001"){
      this.$router.push({
        name: 'testApplication',
        params: {
          appCode: menu.appCode,
          schemaCode: menu.code
        },
        query: {
          parentId: menu.parentId,
          code: menu.code,
          openMode: menu.openMode,
          pcUrl: menu.pcUrl,
          queryCode: this.queryCode
        },
      }).catch((err: any) => {err});
    }else{
      this.$router.push({
        name: 'applicationList',
        params: {
          appCode: menu.appCode,
          schemaCode: menu.code
        },
        query: {
          parentId: menu.parentId,
          code: menu.code,
          openMode: menu.openMode,
          pcUrl: menu.pcUrl,
          queryCode: this.queryCode
        },
      }).catch((err: any) => {err});
    }
  }


  reportGo(menu: any) {
    this.$router.push({
      name: 'applicationReport',
      params: {
        appCode: menu.appCode,
        reportCode: menu.code
      },
      query: {
        parentId: menu.parentId,
        code: menu.code,
        openMode: menu.openMode,
        pcUrl: menu.pcUrl,
        queryCode: this.queryCode
      },
    }).catch((err: any) => {err});
  }

  get appCode(){
    return this.$route.params.appCode;
  }

  get schemaCode(){
    return this.$route.params.reportCode || this.$route.params.schemaCode;
  }

  get routeName(){
    return this.$route.name;
  }

  @Watch('appCode',{
    immediate: true
  })
  onAppCodeChange(){
    this.loadFirstMenu();
  }

  @Watch('schemaCode',{
    immediate: true
  })
  onSchemaCodeChange(nextVal,prevVal){
    if(this.isLoaded){
      this.getFolder();
    }
  }

  @Watch('routeName',{
    immediate: true
  })
  onRouteNameChange(){
    if(this.isLoaded){
      this.getFolder();
    }
  }

  // @Watch('$route',{
  //   immediate: true
  // })
  // onRouteChange() {
  //   // 路由切换加载对用的目录
  //   const { name } = this.$route;
  //   // if (name === 'application') {
  //     setTimeout(() => {
  //       // this.isLoaded = false;
  //     this.getFolder();
  //     }, 0);
  //   // }
  // }

}
</script>

<style lang="less" scoped>
  @import './style/aside.less';
</style>

