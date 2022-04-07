 <template>
  <a-tree-select
    ref="treeSelect"
    allowClear
    :treeCheckable="treeCheckable"
    :multiple="multiple"
    :treeData="treeData"
    :placeholder="placeholder"
    :filterTreeNode="false"
    v-model="selected"
    @onExpand="onExpand"
    @change="onChange"
    @search="onSearch"
    style="width:100%"
    :class="{'role-tree':true,'has-selected':selected.length>0}"
    dropdownClassName="j-dp-down"
  />
</template>


<script lang="ts">
import {
  Component, Vue, Prop, Watch, Model
} from 'vue-property-decorator';

import OrgApi from '@/apis/organization';

@Component({
  name: 'RoleTree'
})
export default class RoleTree extends Vue {
  @Model('change', {
    default() {
      return []
    }
  })
  value!: any[];

  @Prop({
    default: true
  })
  multiple!: boolean;

  //是否可选父节点
  @Prop({
    default: false
  })
  treeCheckable!: boolean;

  @Prop({
    default: ''
  })
  placeholder!: string;

  selected: any[] = [];

  tree: any[] = [];
  searchKeyword: string = '';

  get treeData() {
    let treeData: any = this.tree;

    if (this.searchKeyword) {
      treeData = this.getTreeDataBySearch(this.tree);
    }

    return treeData
  }

  @Watch('value')
  async onValueChange(value: any[]) {

    if (!value) {
      return;
    }

    if (this.treeData.length) {
      this.selected = value.map((v: any) => v.id);
    }
    
  }

  async mounted() {
    await this.getRoleList();
  }

  convert(x: any, isLeaf: boolean) {
    let children = null;
    if (x.children) {
      children = x.children.map((c : any) => this.convert(c, !c.children));
    }
    return {
      value: x.id,
      key: x.id,
      title: x.name,
      // 有以下2属性 树不能单个选中，故注释
      // isLeaf: !!isLeaf,
      // selectable: !!isLeaf, // || this.groupSelectable,
      children
    };
  }

  onExpand(evt: any) {
    const groupId = evt.key;
    if (!groupId) {
      return;
    }

    const node = this.tree.find((x: any) => x.key === groupId);
    if (node.children && node.children.length) {
      return;
    }

    OrgApi.getChildrenRole({
      groupId
    }).then((res: Common.Data) => {
      if (res.errcode === 0) {
        node.children = res.data.map((x: any) => this.convert(x, true));
        this.tree = this.tree.slice(0);
      }
    });
  }

  /**
   * 根据输入关键字筛选角色数据
   */
  getTreeDataBySearch(tree: any, parentObject?: any) {
    let treeData: any = [];
    let isPerantShow: boolean = false;
    const stringTreeData: any = Array.isArray(tree) && JSON.parse(JSON.stringify(tree));
    
    for (let i = 0, len = stringTreeData.length; i < len; i++) {
      const item: any = stringTreeData[i];
      const object: any = {
        title: item.title,
        key: item.key,
        value: item.value,
        disabled: true
      };

      const isShow = item.title.includes(this.searchKeyword);

      // 当前名称符合关键字
      if (isShow) {
        object.disabled = false;
        isPerantShow = true;
      }

      // 如果父级角色显示，则不管子级角色符不符合关键字，所有子级角色都要显示
      if (parentObject && !parentObject.disabled) object.disabled = false;

        // 如果子级角色符合关键字，不管父级符不符合关键字，父级角色都要显示
      if (parentObject && i === len - 1 && isPerantShow) {
          parentObject.disabled = false;
      }

      if (item.children && item.children.length) {
        object.children = this.getTreeDataBySearch(item.children, object);
      }

      treeData.push(object);

    }

    return treeData;
  }

  /**
   * 通过关键字筛选
   */
  onSearch(value) {
    if (typeof value === "undefined") return;

    this.searchKeyword = value;
  }


  onChange() {
    const value = (this.tree as any)
      .flatMap((x: any) => x.children)
      .filter((x: any) => x && this.selected.indexOf(x.key) > -1)
      .map((s: any) => ({
        id: s.key,
        name: s.title,
        groupId: s.groupId
      }));
    this.$emit('change', value);
  }

  async getRoleList() {
    const res = await OrgApi.getRoleLeveOneInfo(true)

    if (Array.isArray(res.data) && res.data.length) {
        this.tree = res.data.filter((x: any) => x.children && x.children.length)
          .map((x: any) => this.convert(x, false));
        // console.log(this.tree, 'this.tree')
        if (this.value && this.value.length) {
          // this.value.
          this.selected = this.value.map((v: any) => v.id);
          this.roleMounted();
        }
      }
  }

  roleMounted() {
    this.$nextTick(() => {
      this.$emit('onLoad');
    })
  }
}
</script>
<style lang="less">
.role-tree{
  /deep/ .ant-select-selection--multiple{
    min-height: auto;
    max-height: 180px;
    overflow: auto;
  }

  // 样式hack太严重 故在此重新hack
  /deep/.ant-select-tree-child-tree .ant-select-tree-treenode-checkbox-checked .ant-select-tree-node-content-wrapper, .ant-select-tree>.ant-select-tree-treenode-checkbox-checked>.ant-select-tree-node-content-wrapper {
    background-color: #fafafa!important;
    font-weight: 700;
  }
}
.has-selected {
  /deep/ .ant-select-selection--multiple{
      
    .ant-select-selection__rendered{
      margin-bottom: 0px!important;
      // 加了以下2个属性影响样式
      // todo: 为什么要加？？
      // line-height: 24px;
      // margin-bottom: 3px!important;
    }
  }
}

.j-dp-down {
  /deep/.ant-select-tree li .ant-select-tree-node-content-wrapper.ant-select-tree-node-selected{
    background-color:#FAFAFA !important;
    font-weight: bold!important;
  }
  /deep/.ant-select-tree-node-content-wrapper.ant-select-tree-node-selected:after{
    content: "\E98F";
  }

  .ant-select-tree-treenode-disabled {
    display: none;
  }
}

</style>
