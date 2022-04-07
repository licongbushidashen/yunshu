<template>
  <div class="app-list-tab">
    <div
      v-for="(item, index) in currentItemList"
      class="tab-item"
      :key="item.id"
      :class="{ active: activeIndex == index }"
      
      @click="clickTab(index)"
      :style="tabItemStyle"
    ><span class="item-text" :title="item.name" v-text="item.name"></span></div>
    <div
      v-show="moreList.length > 0"
      class="tab-item"
      :class="{ active: activeIndex == -1 }"
      @click="showMoreClick"
      :style="tabItemStyle"
    >
    <span class="item-text">更多</span>
    </div>
    <div v-show="moreVisible" class="more-list" :style="moreListStyle">
      <div
        class="more-list-item"
        @click="clickMoreItem(item.id)"
        v-for="item in moreList"
        v-text="item.name"
        :key="item.id"
      ></div>
    </div>
    <div
      v-show="moreVisible"
      @click="maskClick"
      class="more-list-mask"
      :style="moreListStyle"
    ></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({
  name: "appListTab",
  components: {},
})
export default class AppListTab extends Vue {
  @Prop()
  itemList!: Array<any>;
  showMaxSize: number = 3;
  activeIndex: number = 0;
  moreListStyle: any = { top: "0px" };
  lastIndex: number = 0;
  moreVisible: boolean = false;
  get currentItemList() {
    return this.itemList.slice(0, this.showMaxSize);
  }
  get moreList() {
    return this.itemList.slice(this.showMaxSize);
  }
  get tabItemStyle() {
    let style: any = {};
    let tabLength = this.moreList.length > 0 ? this.showMaxSize + 1 : this.showMaxSize;
  
    let percent: any = 100 / tabLength + "%";
    style.width = percent;
    return style;
  }
  created() {}
  showMoreClick() {
    this.$nextTick(() => {
      let bodyHeight = (document as any).documentElement.clientHeight;
      let position: any = this.$el.getBoundingClientRect();
      let bottom = position.bottom;
      this.moreListStyle.top = bottom + "px";
      this.moreListStyle['maxHeight'] = bodyHeight - bottom + "px"
      this.activeIndex = -1;
      this.moreVisible = true;
    });
  }
  clickTab(index: number) {
    this.activeIndex = index;
    this.lastIndex = index;
    this.moreVisible = false;
    this.tabChang(this.itemList[index].id);
  }
  maskClick() {
    this.activeIndex = this.lastIndex;
    this.moreVisible = false;
  }
  tabChang(id: string) {
    this.$emit("change", id);
  }
  clickMoreItem(id: string) {
    this.tabChang(id);
    this.moreVisible = false;
    this.lastIndex = -1;
  }
  mounted() {}
}
</script>

<style lang="less" scoped>
.app-list-tab {
  font-size: 15px;

  display: flex;
  align-items: center;
  height: 44px;
  justify-content: space-between;
  color: #999999;
  background: #fff;
  border-bottom: 1px solid #e4e4e4;
  .tab-item {
    flex-shrink: 0;
    flex-grow: 1;
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .item-text{
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-left: 8px;
    }
  }
  .active {
    color: rgba(0, 0, 0, 0.85);
    &::before {
      content: " ";
      width: 24px;
      height: 3px;
      bottom: 0px;
      left: 50%;
      transform: translateX(-50%);
      background: #2970ff;
      position: absolute;
    }
  }
  .more-list {
    position: fixed;
    left: 0;
    right: 0;
    padding: 0 16px;
    bottom:200px;
    background: #fff;
    z-index: 101;
    overflow-y: auto;
    color: #333333;
    .more-list-item {
      display: flex;
      align-items: center;
      height: 46px;
    }
  }
  .more-list-mask {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.3);
  }
}
</style>
