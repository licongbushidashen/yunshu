<template>
  <div
    id="app-menu-drawer"
    class="app-menu-designer"
    tabindex="-1"
    ref="designer"
    :style="desingerSize"
  >
    <div class="app-nav" v-show="catalogues.length">
      <template v-for="(item, key) of catalogues">
        <a-button
          type="link"
          :class="{
            appNavNode: true,
            active: groupCode === item.code,
            showDrag: showDrag === key,
          }"
          @click.self="getAppGroupList(item)"
          :key="key"
          :title="item.name"
          :name="item.id"
        >
          {{ item.name }}
          <a-dropdown
            :trigger="['click']"
            :overlayClassName="'visibility'"
            :getPopupContainer="getPopupContainer"
          >
            <div
              style="font-size: 12px"
              class="icon aufontAll h-icon-all-down-o"
            ></div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="0" v-if="item.code !== 'default'">
                  <a href="javascript:;" @click.self="deleteGroup(item)">{{
                    $t("languages.Apps.Delete")
                  }}</a>
                </a-menu-item>
                <a-menu-item key="1">
                  <a href="javascript:;" @click.self="showGroup(item)">{{
                    $t("languages.Apps.Rename")
                  }}</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-button>
      </template>
      <div
        class="app-nav-add"
        @click="showGroup({})"
        v-if="catalogues.length < 10"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { H3Droppable } from "@/directives/drag";
import { State, Action, namespace } from "vuex-class";
const AppCenterModule = namespace("Apps/AppCenter");

@Component({
  name: "ContentMenu",
  components: {},
})
export default class ContentMenu extends Vue implements H3Droppable {
  @Prop() catalogues: any;
  @Prop() groupCode: any;
  @Prop() getPopupContainer: any;
  @AppCenterModule.Action("updateAppPackage") updateAppPackage: any;

  desingerSize: any = {
    // 绘图区尺寸
    width: "100%",
    height: "100%",
  };
  groupId: string = '';

  showDrag: any = null;

  evt: any = {};

  // refactor end

  // 初始化节点
  async mounted() {}

  onDragenter(evt: any) {
    // this.transformData(-1);
    // console.log("拖拽进入到绘图区：", evt);
    if (
      evt.path &&
      evt.path[0].className &&
      evt.path[0].className.indexOf("appNavNode") >= 0
    ) {
      this.catalogues.forEach((i: any, v: number) => {
        if (i.id === evt.path[0].name) {
          this.groupId = i.id;
          this.showDrag = v;
          this.evt = evt;
        } else {
        }
        return i;
      });
    }
  }

  onDragover(evt: DragEvent) {
    evt.preventDefault();
  }

  onDragleave(evt: DragEvent) {
    if (
      !(this.evt.clientX === evt.clientX && this.evt.clientY === evt.clientY)
    ) {
      this.showDrag = null;
    }
    evt.preventDefault();
  }

  onDrop(evt: DragEvent) {
    // console.log("放置了节点到绘图区：", evt);
    let activityDataJson: any = this.getTransferData(evt);
    if (!activityDataJson) {
      return;
    }
    activityDataJson.groupId = this.groupId;
    this.showDrag = null;
    this.handleOnDrop(activityDataJson);
  }
  handleOnDrop(params: any) {
    this.updateAppPackage(params).then((res: any) => {
      if (res.errcode) {
        this.$message.error(res.errmsg as string);
      } else {
        // this.$message.success(
        //   this.$t("languages.appSettings.saveSuccessfully") as string
        // );
      }
      this.$emit("load");
    });
  }

  activityMovedEnd() {
    // this.autoFit();
  }

  getTransferData(evt: DragEvent) {
    // 获取拖拽传输的数据
    const transfer = evt.dataTransfer;
    // 如果传入的数据中不包含指定的type，则判定传入数据不完整，不作处理。
    if (
      !transfer ||
      !transfer.types.some((t: string) =>
        ["origin-offsets", "item-data"].includes(t)
      )
    ) {
      return;
    }
    /* 拖拽节点上传送的光标位置相对于节点的偏移量json */
    const offsetsToActivityJson: string = transfer.getData("origin-offsets");
    /* 施放节点时光标位置相对于画布的偏移量json */
    const activityDataJson: string = transfer.getData("item-data");
    if (!offsetsToActivityJson || !activityDataJson) {
      return;
    }
    const transferData: any = {
      offsetsToActivityJson,
      activityDataJson,
    };
    console.log(activityDataJson, "offsetsToActivityJson");

    return JSON.parse(activityDataJson);
  }

  getAppGroupList(item: any) {
    this.$emit("getAppGroupList", item);
  }
  deleteGroup(item: any) {
    this.$emit("deleteGroup", item);
  }
  showGroup(item: any) {
    this.$emit("showGroup", item);
  }
}
</script>

<style lang="less" scoped>
.app-menu-designer {
  width: 100%;
  height: 100%;
  position: relative;
  .showDrag {
    background: #f5f5f5;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    padding-left: 12px;
    color: #17bc94 !important;
  }
}
</style>
