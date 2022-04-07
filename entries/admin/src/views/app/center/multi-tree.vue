<template>
  <a-tree
    showIcon
    class="draggable-tree"
    :treeData="tree"
    draggable
    @drop="onDrop"
    @select="onSelect"
  >
    <template slot="custom">
      <i class="icon aufontAll h-icon-all-folder-o"></i>
    </template>
  </a-tree>
  <!--  :replaceFields="replaceFields" -->
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { State, Action, Mutation, namespace } from 'vuex-class';
const MenuModule = namespace('Apps/AppItem');
@Component({
  name: 'MultiTree',
  components: {},
})
export default class MultiTree extends Vue {
  @Prop({ default: () => [] })
  treeData!: any[];

  @MenuModule.Mutation('setFolders') setFolders: any;

  @MenuModule.Action('appItemTreeSort') appItemTreeSort: any;

  @MenuModule.Action('getAppItem') getAppItem: any;

  datas: any[] = [];
  onSelect(data, info) {
    this.$emit('treeSelect', { id: data[0], pos: info.node.pos });
  }
  get tree() {
    // 需要写icon,识别是folder 还是菜单
    let copyTreeData = JSON.parse(JSON.stringify(this.treeData));
    console.log(copyTreeData, 'copyTreeData');
    copyTreeData.splice(0, 1); // 把根分组删除，不展示
    return copyTreeData.map((item: any) => {
      if (item.children && item.children.length) {
        return this.convert(item, false);
      } else {
        return {
          value: item.id,
          scopedSlots: { icon: 'custom' },
          key: item.id,
          title: item.name,
          children: null,
          parentId: item.parentId,
          code: item.code,
        };
      }
    });
  }
  convert(x: any, isLeaf: boolean) {
    let children = null;
    if (x.children) {
      children = x.children.map((c: any) => this.convert(c, !c.children));
    }
    return {
      scopedSlots: { icon: 'custom' },
      value: x.id || x.value,
      key: x.id || x.value,
      title: x.name,
      name: x.name,
      children,
      parentId: x.parentId,
      code: x.code,
    };
  }

  onDrop(info: any) {
    console.log('拖动完成:', info);
    // 
    const dropKey = info.node.eventKey; // 目标节点的id
    const dragKey = info.dragNode.eventKey; // 拖拽节点的id
    const dropPos = info.node.pos.split('-');
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          this.$emit('dragEnd')
          return callback(item, index, arr);
        }
        if (item.children) {
          this.$emit('dragEnd')
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...this.tree];
    const lastParentId = data[data.length - 1]['parentId'];

    // Find dragObject
    let dragObj;

    // 如果拖动到内部
    if (!info.dropToGap) {
    } else if (
      (info.node.children || []).length > 0 && // Has children
      info.node.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
    } else {
      // 获得拖拽节点的层级id数组 this.datas
      this.getItemAndParentsIdArr(data, dragKey);
      let dragKeyString = this.datas.filter((d: any) => d.key === dragKey);

      // 拖拽节点父级id
      let dragKeyParentId = dragKeyString[0] ? dragKeyString[0].parentId : '';
      /**
       * --------------------------------分割线---------------------------------------
       */
      // 获得目标节点的层级id数组 this.datas
      this.getItemAndParentsIdArr(data, dropKey);
      let dropKeyString = this.datas.filter((d: any) => d.key === dropKey);

      // 目标节点父级id
      let dropKeyParentId = dropKeyString[0] ? dropKeyString[0].parentId : '';
      /**
       * --------------------------------分割线---------------------------------------
       */
      // 只允许在第一级别父级id下进行拖动
      if (
        dragKeyParentId === dropKeyParentId &&
        dragKeyParentId === lastParentId
      ) {
        loop(data, dragKey, (item, index, arr) => {
          arr.splice(index, 1);
          dragObj = item;
        });
        let ar;
        let i;
        loop(data, dropKey, (item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj);
        } else {
          ar.splice(i + 1, 0, dragObj);
        }
        data.forEach((item: any) => {
          item.id = item.key;
          item.name = item.title;
          item.parentId = item.parentId;
          item.sortKey = item.sortKey;
          item.code = item.code;
        });
        data.unshift({ id: 1 });
        this.setFolders(data);

        const dragKeyArr = this.datas.filter((d: any) => d.key === dragKey)[0];
        const parentId: string = dragKeyArr.parentId;
        const ItemId: string = dragKeyArr.code;
        const sortKey: number = data.findIndex((item) => item.id === dragKey);
        const parmars: any = {
          code: ItemId,
          parentId,
          sortKey,
        };
        this.appItemTreeSort(parmars);
      } else {
        this.$emit('dragEnd')
        return this.$message.warning('只允许在第一级下进行拖动');
      }
    }
    this.$emit('dragEnd')
  }

  // 递归 获得自己的层级id数组
  getItemAndParentsIdArr(arr, key) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key === key) {
        this.datas.push(arr[i]);
        return true;
      } else {
        if (
          arr[i].children &&
          this.getItemAndParentsIdArr(arr[i].children, key)
        ) {
          this.datas.push(arr[i]);
          return true;
        }
      }
    }
  }
  // 获得自己的父级id
  getFirstParentId(strings, key) {
    let stringsArr = strings.split('/');
    let index = stringsArr.indexOf(key.toString());
    let parenId;
    if (index !== 0) {
      parenId = stringsArr[index - 1];
    } else {
      parenId = stringsArr[index];
    }
    return parenId;
  }
  // replaceFields = {
  //   title: "name",
  //   key: "id",
  //   value: "id",
  // };
}
</script>
<style lang="less" scoped>
.draggable-tree {
  margin-left: 8px;
  /deep/ .ant-tree-switcher {
    //display: none;
  }
}
</style>
