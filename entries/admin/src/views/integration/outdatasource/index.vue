<template>
  <div class="outdatasource">
    <sidebar
      v-show="currentFolder"
      class="outdatasource__sidebar"
      ref="sidebar"
      @toggle="selectFolder"
      v-resize.east
    />
    <content-panel
      v-show="currentFolder"
      class="outdatasource__content"
      ref="content"
    />
    <template v-if="loaded && !currentFolder">
      <no-data
        tip="新建报表高级数据源前请新建目录"
        buttonText="新建目录"
        @click="addFolder"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NoData from "@/components/global/no-data.vue";
import Sidebar from "./sidebar.vue";
import ContentPanel from "./content.vue";

@Component({
  name: "outdatasource",
  components: {
    Sidebar,
    ContentPanel,
    NoData,
  },
})
export default class outdatasource extends Vue {
  currentFolder: any = null;

  loaded: boolean = false;

  mounted() {
    setTimeout(() => {
      this.loaded = true;
    }, 500);
  }

  /**
   * 选中目录
   */
  selectFolder(item: any) {
    this.currentFolder = item;
    const dom: any = this.$refs.content;
    dom.setFolder(item);
  }

  /**
   * 新建目录
   */
  addFolder() {
    const dom: any = this.$refs.sidebar;
    dom.addFolder();
  }
}
</script>
<style lang="less" scoped>
.outdatasource {
  display: flex;
  overflow: hidden;
  &__sidebar {
    flex: none;
    width: 224px;
    height: calc(100% - 45px);
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }
  &__content {
    flex: 1;
    height: 100%;
    padding: 0 24px;
    overflow-y: auto;
  }

  /deep/.no-data {
    flex: 1;
  }
}
</style>
