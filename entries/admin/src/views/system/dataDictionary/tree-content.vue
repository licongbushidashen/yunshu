<template>
  <div class="content-wrapper">
    <draggable
      v-model="data"
      :options="dragItemOptions"
      handle=".handles"
      @end="onEnd"
    >
      <transition-group>
        <div
          class="content"
          v-for="(item, key) in data"
          :key="(item.id || item.code || item.name) + key"
        >
          <template v-if="!item.deleted">
            <div class="list">
              <span
                v-if="
                  item.children && item.children.length && !item.isShowChild
                "
                class="item-icon show-more-btn"
              >
                <a-icon
                  type="caret-right"
                  v-if="item.hasEnableChild"
                  @click="showMore(item)"
                />
                <a-icon type="folder-o" :class="{ 'anticon-disabled': !item.status }" v-if="item.hasEnableChild" />
                <a-icon type="file-o" :class="{ 'anticon-disabled': !item.status }" v-else />
              </span>
              <span
                v-if="item.children && item.children.length && item.isShowChild"
                class="item-icon show-more-btn"
                ><a-icon
                  type="caret-down"
                  v-if="item.hasEnableChild"
                  @click="showMore(item)"
                />
                <a-icon type="folder-open-o" :class="{ 'anticon-disabled': !item.status }" v-if="item.hasEnableChild" />
                <a-icon type="file-o" :class="{ 'anticon-disabled': !item.status }" v-else />
              </span>
              <span
                v-if="!item.children || !item.children.length"
                class="item-icon"
                ><a-icon type="file-o" :class="{ 'anticon-disabled': !item.status }"
              /></span>

              <span :title="item.name + item.code">
                {{ item.name }}[{{ item.code }}]
              </span>

              <div class="btns">
                <span class="handles" v-if="(item.id && !item.parentId) || (!item.id && !item.parentCode)"
                  ><a-icon type="more" /><a-icon type="more"
                /></span>
                <span>
                  <a-switch
                    :disabled="item.initialUsed"
                    v-model="item.status"
                    default-checked
                    size="small"
                  />
                </span>
                <a-dropdown>
                  <span><a-icon type="plus" /></span>
                  <a-menu slot="overlay">
                    <a-menu-item key="add"
                      ><span
                        @click.stop="($event) => vm.add($event, 'peers', item)"
                        >添加节点</span
                      ></a-menu-item
                    >
                    <a-menu-item key="addChild"
                      ><span
                        @click.stop="($event) => vm.add($event, 'child', item)"
                        >添加子节点</span
                      ></a-menu-item
                    >
                  </a-menu>
                </a-dropdown>
                <span @click.stop="($event) => vm.edit($event, item)"
                  ><a-icon type="edit"
                /></span>
                <span :class="{ 'disabled-span': item.id }" @click.stop="($event) => vm.deleteItem($event, item)"
                  ><a-icon type="delete-o"
                /></span>
              </div>
            </div>

            <template v-if="item.children && item.isShowChild">
              <tree-content
                :recordsData="item.children"
                :vm="vm"
              ></tree-content>
            </template>
          </template>
        </div>
      </transition-group>
    </draggable>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import Draggable from "vuedraggable";

@Component({
  name: "TreeContent",
  components: {
    Draggable,
  },
})
export default class TreeContent extends Vue {
  @Prop({
    default: () => [],
  })
  recordsData!: any[];

  @Prop()
  vm!: any;

  showMore(item) {
    this.$set(item, "isShowChild", !item.isShowChild);
  }

  dragItemOptions: any = {
    animation: 150,
    ghostClass: "ghostClass",
    forceFallback: true,
    fallbackClass: "dragClass",
    touchStartThreshold: 20,
    delay: 100,
  };

  data: any[] = [];
  @Watch("recordsData")
  onRecordsDataChange(val: any) {
    this.data = this.refactoringTreeData(val);
  }

  /**
   * 字段拖拽排序结束
   */
  onEnd(evt: any) {
    console.log("end==>", this.data);
    const codeList = this.data.map((res: any) => {
      return res.code;
    });
    const item = codeList.filter((i, v) => v === evt.oldIndex);
    let data = codeList.filter((res: any, i: any) => {
      return i !== evt.oldIndex;
    });

    data.splice(evt.newIndex, 0, item);
    this.$emit("sortEnd", data, true);
    this.vm.dragEnd(this.data);
  }

  created() {
    this.data = this.refactoringTreeData(this.recordsData);
  }

  /**
   * 改造树形数据，被删除子节点的父级需赋值是否有下拉箭头
   */
  refactoringTreeData(data) {
    let dataMap = data.map((owner) => {
      owner.children = owner.children ? owner.children : [];
      owner.hasEnableChild = false;
      let enabledlist = owner.children.filter((res) => !res.deleted);
      if (enabledlist.length > 0) {
        owner.hasEnableChild = true;
      }
      if (owner.children.length > 0) {
        owner.children = this.refactoringTreeData(owner.children);
      }
      return owner;
    });
    return dataMap;
  }
}
</script>
<style lang="less" scoped>
.content {
  margin-left: 20px;
  .list {
    display: flex;
    padding-right: 12px;
    height: 32px;
    line-height: 32px;
    &:hover {
      background-color: #fff;
      color: #17bc94;
    }
    .btns {
      text-align: right;
      flex: 1;
      span {
        margin-left: 7px;
        margin-right: 7px;
        cursor: pointer;
        color:#000;
        font-size: 15px;
        .anticon-more {
          margin-right: 60px;
        }
        .anticon-more:first-child {
          margin-right: -9px;
        }
      }
      .disabled-span{
        color: #999;
        cursor: not-allowed;
      }
      .handles {
        cursor: move !important;
      }
      span:hover {
        color: #17bc94;
      }
      .disabled-span:hover {
        color: #999;
      }
    }
    .anticon-folder-open-o,
    .anticon-folder-o,
    .anticon-file-o {
      color: #17bc94;
    }
    .anticon-disabled{
      color: #999;
    }
  }
}
</style>
