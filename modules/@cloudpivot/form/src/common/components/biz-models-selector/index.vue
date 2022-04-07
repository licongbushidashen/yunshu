<template>
  <a-tree-select
    ref="treeSelect"
    v-model="result"
    class="biz-models-selector"
    allowClear
    showSearch
    :treeData="treeData"
    :onlyPublish="onlyPublish"
    @treeExpand="onTreeExpand"
    :dropdownStyle="{
      maxHeight: '350px',
      height: '350px',
      maxWidth: width + 'px',
      overflow: 'auto',
    }"
    @change="onChange"
    @search="onSearch"
    @focus="onFocus"
    :disabled="disabled"
    :placeholder="placeholder"
    dropdownClassName="fixed biz-model-select"
    treeNodeFilterProp="title"
    :searchValue="searchValue"
  >
    <!-- treeSelect -->
    <span
      slot="title"
      slot-scope="{ label, icon }"
      class="cus-title"
      style="font-size: 14px !important"
    >
      <i :class="'icon aufontAll ' + icon" />
      {{ label }}
    </span>
  </a-tree-select>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import { listApi } from "@cloudpivot/api";
import { FormControlType, DataItemType } from "@cloudpivot/form/schema";
import { filterTableMater } from "@cloudpivot/common/src/utils/utils";

@Component({
  name: "biz-models-selector",
})
export default class bizModelsSelector extends Vue {
  @Prop() value!: string;
  @Prop() appCode!: string;
  @Prop() folderId!: string;
  @Prop() currentCode!: string;
  @Prop() usePage!: string;
  @Prop({
    default: false,
  })
  disabled?: boolean;

  //为ture显示已发布的模型
  @Prop({
    default: false,
  })
  onlyPublish?: boolean | null;

  @Prop({
    default: "",
  })
  placeholder?: string;

  @Prop() organization!: boolean;

  // @Prop({
  //   default : ''
  // })

  @Prop({
    default: false,
  })
  appManagerFilter?: boolean;

  // 是否展示选择全部模型选项
  @Prop({
    default: false,
  })
  canSelectAll?: boolean;

  // 选择项：全部模型的具体定义
  @Prop() allOption?: any;

  expandCode!: string;

  searchValue = "";

  treeData: Array<any> = [];

  allTreeData: Array<any> | null = null;

  result: any = [];

  searchTask: any;

  selectModel: string = "";

  labelName = "";

  get getTreeValue() {
    return this.organization ? this.labelName : this.result;
  }

  // defaultExpandedKeys:string[] = [];

  // get treeExpandedKeys(){
  //   if(this.expandCode){
  //     return [this.expandCode];
  //   }
  //   return [];
  // }
  async getGruopIdByAppCode(code: string){
     const appsResult: any = await listApi.getAppList();
     let groupId ="";
     appsResult.data && appsResult.data.forEach(v => {
       if(v.code == code)
       {
         groupId = v.groupId;
       }
     })
     return groupId
  }
  /**
   * 异步加载数据
   */
  async onLoadData(treeNode: any, appList) {
    const vm: any = this;
    return new Promise((resolve: any) => {
      if (treeNode.loaded || treeNode.isLeaf) {
        resolve();
        return;
      }
      const { type = null, code = "" } = treeNode.dataRef || {};
      let flag = false;
      if (type === "app" && code) {
        vm.getBizModels(code).then((res: Array<any>) => {
         appList.some((app: any) => {
            if (app.value === code) {
              app.children = res;
             
              return true;
            }
            return false;
          });
          vm.treeData = [...vm.treeData];
          resolve(vm.treeData);
          // console.log(JSON.stringify(vm.treeData),"vm.treeData");
        });
      } else {
        resolve();
      }
    });
  }

  onTreeExpand(expandedKeys: string[]) {
    const len = expandedKeys.length;
    if (len === 0) {
      return;
    }

    const key = expandedKeys[len - 1];

    const node = filterTableMater(key, this.treeData);

    if (!node || node._loaded || node.isLeaf || !node.dataRef) {
      return;
    }

    this.getNodeChildren((node.dataRef as any).code, node);
  }

  getNodeChildren(code: string, node: any) {
    if(node.dataRef && node.dataRef.type == "group")
    {
         this.getAppListByGroupCode(code).then((res: any) => {
           node.children = res;
         })
    }
    else
    {    
      return this.getBizModels(code).then((res: any) => {
      if (Array.isArray(res)) {
        const showTypes: string[] = ["app", "Folder", "BizModel"];
        const children = res.filter((child) => {
          if (child.children) {
            child.children = child.children.filter((c) =>
              showTypes.includes(c.type)
            );
          }
          return showTypes.includes(child.type);
        });

        node.children = res.filter((child) => showTypes.includes(child.type));

        node._loaded = true;
        // this.treeData = [...this.treeData];
        // this.allTreeData = this.treeData;
        // return res;
      }
    });

    }

  }

  async getAppListByGroupCode(code: string)
  {
    let res:any = await listApi.getAppgroupList({groupCode:code,fromRecycle:false});
    let appList: Array<any> = [];
    if(res.errcode == 0)
    {
      res.data.forEach(v => {
        if(code === v.code)
        {
          appList = v.children;
          return true;
        }
        
      })
    }
    appList = appList.map( item => ({
            title: item.name,
            value: item.code,
            id: item.id,
            key: `${item.code}$list`,
            isLeaf: false,
            selectable: false,
            children: [],
            dataRef: {
              type: "app",
              code: item.code,
              id: item.id
            }
      }));
    return appList;
  }
  /**
   * 获取应用列表
   */
  getAppList(param?: any) {
    listApi.getAllAppGroups(param).then((res: any) => {
      if (Array.isArray(res.data)) {
        let gourps = res.data.filter(v => v.code != "all");
        const tree: any[] = gourps.map(
          (item: any) => ({
            title: item.name,
            value: item.code + "_group", //group 的code会和app，模型冲突，所以添加一个group用来区分
            id: item.id,
            key: `${item.code}`,
            isLeaf: false,
            selectable: false,
            children: [],
            dataRef: {
              type: "group",
              code: item.code,
              id: item.id
            },
          })
        );

        if (this.expandCode) {
          const idx = tree.findIndex((n: any) => n.key === this.expandCode);
          if (idx > -1) {
            const node = tree[idx];
            tree.splice(idx, 1);
            tree.splice(0, 0, node);

            this.getNodeChildren(node.key, node);
          }
        }

        this.treeData = tree;
        this.allTreeData = tree;
        // console.log(this.treeData, "treeData------1--------------");
        // 追加展示“全部”选项
        if (this.canSelectAll) {
          this.treeData.unshift({
            ...this.allOption,
            key: this.allOption.value,
            isLeaf: true,
            selectable: true,
            dataRef: {
              type: "external",
            },
          });
        }

        // 存在默认值
        if (this.value) {
          this.setDefault();
        }
      }
    });
  }

  // filterTree(data) {
  //   data.forEach((item) => {
  //     if (item.children) {
  //       item.children = this.filterTree(item.children);
  //     }
  //   });
  //   data = data.filter((item) => {
  //     return item.published !== false;
  //   });
  //   return data;
  // }

  /**
   * 获取应用下的目录和业务模型
   */
  getBizModels(appCode: string) {
    let p = this.currentCode
      ? { appCode, currentAppCode: this.currentCode, isPortal: true }
      : { appCode, isPortal: true }; // 集成组 传强要求加的 在admin关联表单控件
    return listApi.getAppItem(p).then((res: any) => {
      if (res.errcode !== 0) {
        this.$message.error(res.errmsg as string);
        return;
      }
      function formatTree(list,ctx) {
        if (list && list.length > 0) {
          return list.map((childnode) => {
            return {
              title: childnode.name,
              value: childnode.code,
              key: childnode.code,
              published: childnode.published,
              disabled: ctx.onlyPublish&&childnode.published===false,
              isLeaf: !childnode.children,
              selectable: !childnode.children,
              children: childnode.children
                ? formatTree(childnode.children,ctx)
                : [],
              type: childnode.type,
            };
          });
        }
      }
      // if (this.onlyPublish) {
      //   res.data = this.filterTree(res.data);
      // }
      const child = formatTree(res.data,this);
      
      return child;
    });
  }

  onChange(val: string, vNode: any) {
    console.log('--------onChange-------------', val, vNode);
    this.labelName = vNode[0];
    this.selectModel = val;
    this.result = this.organization ? this.labelName : [this.result];
    let code = "";
    if (!val) {
      this.$emit("change", "");
      this.$emit("select", []);
    } else {
      const theModel = filterTableMater(val, this.treeData);

      const appsArr = val.split("-");

      this.$emit("change", appsArr[appsArr.length - 1]);
      this.$emit("select", appsArr, theModel);

      code = appsArr[0];

      const $treeSelect = this.$refs.treeSelect as Vue;

      this.treeData = this.allTreeData || [];

      const node = filterTableMater(code, this.treeData);

      if (!node || node._loaded) {
        return;
      }

      if (
        this.canSelectAll &&
        node.dataRef &&
        node.dataRef.type === "external"
      ) {
        this.$emit("selectAll", node); // 目前未使用到此触发方法，备用
        return;
      }

      let res: any = this.getNodeChildren(code, node);
      res && res.then(() => {
        this.$emit("change", appsArr[appsArr.length - 1]);
        this.$emit("select", appsArr);
      });
    }
  }

  onSearch(text: string) {
    this.searchValue = text;
    console.log(text, "text++++++++++++++++++++++++++++++");
    // 【业务规则->规则节点->新增数据新增->目标模型->搜索，搜索删除搜索框内容，流程列表没有自动更新】https://www.tapd.cn/31542502/bugtrace/bugs/view?bug_id=1131542502001009035
    // if (!text) {
    //   return;
    // }

    clearTimeout(this.searchTask);
    this.searchTask = setTimeout(() => {
      this.doSearch(text);
    }, 500);
  }

  onFocus() {
    console.log("onFocus");
  }
  doSearch(text: string) {
    if (text) {
      listApi
        .appSearch({
          name: text,
        })
        .then((res: any) => {
          if (res.errcode !== 0) {
            // this.treeData = [];
            return;
          }
          // if (this.onlyPublish) {
          //   res.data = this.filterTree(res.data);
          // }
          const treeData = res.data.map((x: any) => this.convert(x));

          treeData.forEach((item) => {
            const key = item.key;
            const theItemKey = filterTableMater(key, this.treeData);
            if (theItemKey) {
              theItemKey.children = item.children;
            }
          });
          this.treeData = [...this.treeData];

          // console.log('pppp',this.allTreeData)
          if(res.data.length===0){
            this.treeData = [];
          }else{
            this.treeData = treeData;
          }
        });
    } else {
      this.treeData = this.allTreeData || [];
    }
  }

  convert(item: any, parentKey?: string) {
    const key = parentKey ? `${parentKey}-${item.code}` : item.code;

    const isLeaf = item.type === "BizModel";

    const node: any = {
      title: item.name,
      value: key,
      key: key,
      isLeaf,
      published: item.published,
      disabled: this.onlyPublish&&item.published===false,
      selectable: isLeaf,
      scopedSlots: {
        title: "title",
      },
    };

    if (!isLeaf && Array.isArray(item.children)) {
      node.children = item.children.map((c: any) => this.convert(c, key));
    }

    return node;
  }

  filter(inputValue: string, treeNode: any) {
    return false;
  }

  /**
   * 设置默认值
   */
  async setDefault() {
    let res: any = await listApi.getAppCodeByModelCode({
      schemaCode: this.value
    })
    if(res.errcode === 0) {
      let appCode = res.data.appCode;
      const treeNode = {
        loaded: false,
        isLeaf: false,
        dataRef: {
          type: "app",
          code: appCode,
        },
      };
      let groupId = await this.getGruopIdByAppCode(appCode);
      let groupItem: any = this.treeData.find((v: any) => v.id == groupId);

      if(!groupItem && !groupId){
        groupItem = this.treeData.find((v: any) => v.key == "default")
      }

      if(!groupItem)
      {
        return;
      }

      // list里已经存在数据则不重新请求
      const theItemKey = filterTableMater(this.result[0], this.treeData);
      if (!theItemKey) {
        let appList = await this.getAppListByGroupCode(groupItem.dataRef.code);
        groupItem.children = appList;
        this.onLoadData(treeNode, appList).then((res: any) => {
          if (res) {
            let theApp: any;
            if (this.selectModel !== "") {
              const treeData = this.treeData;
              const key = this.selectModel.split("-")[0];
              let theModel: any = filterTableMater(this.value, this.treeData);
              this.result = [theModel.key];
            } else {
              theApp = res.filter((app:any) => app.value === appCode)[0];
              if (theApp) {
                const theKey = this.getDefaultValue(this.value, theApp.children);
                if (theKey) {
                  this.result = [theKey];
                }
              }
            }
          }
        });
      }
    }    
  }

  getDefaultValue(code, item) {
    let result = "";
    item.forEach((res) => {
      const codes = res.key.split("-");
      const theCode = codes[codes.length - 1];
      if (code === theCode) {
        result = res.key;
      }
      if (res.children && res.children.length > 0) {
        res.children.forEach((child) => {
          const childCodes = child.key.split("-");
          const theChildCode = childCodes[childCodes.length - 1];
          if (code === theChildCode) {
            result = child.key;
          }
        });
      }
    });

    return result;
  }

  created() {
    // 工作交接
    if (this.usePage === "handover") {
      this.getAppList();
    } else {
      // 20200527 根据管理员过滤
      const param: any = {
        filterType: "admin",
      };

      this.getAppList(param);
    }
  }
  mounted() {
    this.width = (this.$refs.treeSelect as any).$el.offsetWidth;
    this.onValueChange();
  }
  clearVal() {
    this.result = [];
  }
  width = 0;
  /**
   * 关联表单改变时候 初始默认值
   */

  @Watch("value")
  onValueChange() {
    if (!this.value) {
      this.result = [];
      return;
    }
    this.result = [this.value];  // 两次赋值类型不一致导致搜索框内容闪动
    this.setDefault();
    
  }
}
</script>
<style lang="less" scoped>
.biz-models-selector {
  width: 100%;
  max-width: 500px;
}
</style>
<style lang="less">
.biz-model-select {
  .ant-select-tree {
    margin-top: 36px;
    // padding-top: 36px;
    height: calc(100% - 36px);
    overflow: auto;
  }
  .ant-select-tree-node-selected{
    background: #b6f0da!important;
    &::after {
      content: "";
    }
  }
}
</style>
