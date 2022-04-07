<template>
  <div class="tree">
    <div class="content-top">
      <span class="item">中文名称[代码]<i>*</i></span>
      <span class="add" @click.stop="($event) => add($event, 'root', null)"
        ><a-icon type="plus" />添加节点</span
      >
    </div>
    <tree-content :recordsData="recordsData" :vm="this"></tree-content>

    <!-- 新建节点 -->
    <a-modal
      class="node-edit-modal"
      :visible="nodeEditModalVisble"
      :title="nodeEditModalTitle"
      @cancel="nodeEditModalVisble = false"
      :maskClosable="true"
      :closable="false"
      @ok="save"
      okText="保存"
    >
      <div class="modal-wrapper">
        <list-item :label="'父节点'" :showRequire="true" v-if="isAddSub">
          <a-input
            disabled
            v-model="addNewPosition.name"
            placeholder="父节点中文名称"
          />
        </list-item>
        <list-item :label="'中文名称'" :showRequire="true">
          <a-input
            :disabled="currentData.initialUsed"
            v-model="currentData.name"
            placeholder="请输入中文名称"
          />
        </list-item>
        <list-item :label="'代码'" :showRequire="true">
          <a-input
            :disabled="currentData.initialUsed"
            v-model="currentData.code"
            placeholder="请输入代码"
          />
        </list-item>
        <!-- <list-item :label="'是否启用'" :showRequire="false">
          <a-switch
            :disabled="currentData.initialUsed"
            v-model="currentData.status"
            default-checked
            size="small"
          />
        </list-item> -->
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import treeContent from "./tree-content.vue";
import listItem from "./list-item.vue";

@Component({
  name: "Tree",
  components: {
    treeContent,
    listItem,
  },
})
export default class Tree extends Vue {
  @Prop({
    default: [],
  })
  recordsData!: any[];

  @Prop({
    default: false,
  })
  isEdit!: boolean;

  $isEdit: boolean = false;

  isShowChild: boolean = false;
  showMore() {
    this.isShowChild = !this.isShowChild;
  }

  addNewPosition: any[] = this.recordsData; // 新建的位置

  currentData: any = {
    name: "",
    code: "",
    deleted: false,
    status: true,
  };

  nodeEditModalVisble: boolean = false;
  nodeEditModalTitle: string = "添加节点";
  cancel() {
    this.nodeEditModalVisble = false;
  }

  save() {
    if (this.currentData.name === "") {
      this.$message.error("中文名称不能为空！");
      return;
    }

    if (!/^[-_a-zA-Z0-9]+$/.test(this.currentData.code)) {
      this.$message.error("代码仅支持英文、数字及英文符号”-“和”_“");
      return;
    }

    if (this.currentData.code.length > 50) {
      this.$message.error("代码不能超过50个字");
      return;
    }

    if (!/^[\u4e00-\u9fa5-_a-zA-Z0-9]+$/.test(this.currentData.name)) {
      this.$message.error("中文名称仅支持中英文、数字及英文符号”-“和”_“");
      return;
    }

    if (this.currentData.name.length > 50) {
      this.$message.error("中文名称不能超过50个字");
      return;
    }

    if (this.currentData.code === "") {
      this.currentData.code =
        "code" +
        Math.floor(Math.random() * 10000000) +
        (+new Date() + "").slice(-7);
    }

    if (this.$isEdit) {
      this.addNewPosition = Object.assign(
        this.addNewPosition,
        this.currentData
      );
      this.currentData = { ...this.oneData };
    } else {
      if (this.isAddSub) {
        //添加子节点
        this.currentData.parentCode = this.addNewPosition["code"];
        if (this.addNewPosition["children"]) {
          this.addNewPosition["children"].push(this.currentData);
        } else {
          this.addNewPosition["children"] = [{ ...this.currentData }];
        }
      } else if (this.isAddPeers) {
        //添加平级
        this.refactoringTreeData(this.data, this.addNewPosition["code"]);
      } else {
        //添加根节点
        this.currentData.parentCode = null;
        this.addNewPosition.push(this.currentData);
        this.isShowChild = true;
      }
    }
    this.data = JSON.parse(JSON.stringify(this.data));
    this.$emit("recordsDataChange", this.data);
    console.log(this.currentData);
    
    this.cancel();
  }

  isAddSub: boolean = false; // 添加的是子项
  isAddPeers: boolean = false; // 添加的是平级

  /**
   * 添加节点信息
   */
  add($event, type, item) {
    this.$isEdit = false;
    if (type === "root") {
      // 在根新建字典
      this.addNewPosition = this.data;
      this.isAddSub = false;
      this.isAddPeers = false;
      this.nodeEditModalTitle = "添加节点";
    } else if (type === "peers") {
      this.isAddPeers = true;
      this.isAddSub = false;
      this.addNewPosition = item;
      this.nodeEditModalTitle = "添加节点";
    } else {
      this.isAddSub = true;
      this.isAddPeers = false;
      this.addNewPosition = item;
      this.nodeEditModalTitle = "添加子节点";
    }

    this.currentData = {
      ...this.oneData,
    };
    this.currentData.code =
      "code" +
      Math.floor(Math.random() * 10000000) +
      (+new Date() + "").slice(-7);

    this.nodeEditModalVisble = true;
  }

  refactoringTreeData(data, nodeCode) {
    data.forEach((owner, index) => {
      owner.children = owner.children ? owner.children : [];
      if (owner.code === nodeCode) {
        data.push(this.currentData);
      } else {
        this.refactoringTreeData(owner.children, nodeCode);
      }
    });
  }

  /**
   * 编辑节点信息
   */
  edit($event, record) {
    this.isAddSub = false;
    this.$isEdit = true;
    this.addNewPosition = record;
    this.currentData = { ...record };
    this.nodeEditModalVisble = true;
    this.nodeEditModalTitle = "修改节点";
  }

  dragEnd(data) {
    console.log(data);
    this.$emit("recordsDataChange", data);
  }

  /**
   * 删除树节点
   */
  deleteItem($event, record) {
    if(!record.id){
      let self = this;
      this.$confirm({
        title: "确定删除该数据项吗?",
        okText: "确定",
        cancelText: "取消",
        onOk() {
          self.removeTreeListItem(record);
          self.data = JSON.parse(JSON.stringify(self.data));
          self.$emit("recordsDataChange", self.data);
          console.log(self.data);
        },
      });
    }
  }

  removeTreeListItem(record) {
    // 根据id属性从数组（树结构）中移除元素
    if (!record) {
      return;
    }
    record.deleted = true
    for(let i = 0;i< record.children.length;i++){
      this.removeTreeListItem(record.children[i]);
    }
  }

  oneData: any = {
    name: "",
    code: "",
    status: true,
    deleted: false,
  };

  data: any[] = [];
  created() {
    this.data = this.recordsData;
    this.$isEdit = this.isEdit;
  }
  @Watch("isEdit")
  onIsEditChange() {
    this.$isEdit = this.isEdit;
  }

  @Watch("recordsData")
  onRecordsDataChange(val) {
    this.recordsData.forEach((el, index) => {
      el.index = index + 1;
    });
    this.data = this.recordsData;
    this.$emit("recordsDataChange", val);
  }
}
</script>
<style lang="less" scoped>
.tree {
  padding: 12px;
  padding-left: 0;
  background: #f4f5f9;
  .content-top {
    padding-left: 55px;
    padding-right: 4px;
    margin-bottom: 5px;
    i {
      font-size: 12px;
    }
    .item {
      i {
        color: red;
      }
    }
    .add {
      i {
        display: inline-block;
        margin-right: 5px;
      }
      float: right;
      color: #17bc94;
      cursor: pointer;
      padding: 0 5px;
    }
    span.item {
      margin-right: 118px;
    }
    span.icon-wrapper {
      position: absolute;
      left: 0;
      transform: rotate(90deg);
    }
  }
}

.node-edit-modal .ant-modal-body {
  padding: 0;
}
</style>

<style lang="less">
.item-icon {
  display: inline-block;
  width: 35px;
  text-align: right;
  height: 32px;
  line-height: 32px;
  position: relative;
  i {
    margin-right: 3px;
    height: 32px;
    display: inline-block;
    line-height: 32px;
  }
  .anticon-caret-down,
  .anticon-caret-right {
    cursor: pointer;
  }
}
</style>
