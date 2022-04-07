<template>
  <div class="item-list">
    <!-- 业务模型分组 -->
    <template v-for="(folder, idx) in appItem">
      <div :key="idx">
        <div
          v-if="folder.type === 'Folder'"
          class="folder-title"
          @click="openFolder(folder)"
        >
          <i
            class="icon aufontAll"
            :class="
              folder.open ? 'h-icon-all-folder-open-o' : 'h-icon-all-folder'
            "
          ></i>
          <span class="folder-title__text">{{ folder.name }}</span>
          <div class="folder-title__left">
            <span v-if="loadBizModel">{{
              `${folder.size ? folder.size : 0}`
            }}</span>
            <span v-else>{{
              `${folder.children ? folder.children.length : 0}`
            }}</span>
            <i
              class="icon aufontAll h-icon-all-down-o"
              :class="!folder.open && 'closed'"
            ></i>
          </div>
        </div>
        <BizModel
          :key="idx"
          @onItem="$emit('onItem', $event)"
          :modelData="folder"
          v-if="folder.type !== 'Folder'"
        />
        <transition v-if="folder.children" name="collapse">
          <div class="folder-content collapse-item" v-show="folder.open">
            <item-list
              @onItem="$emit('onItem', $event)"
              :appItem="folder.children"
            />
          </div>
        </transition>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { initialInstanceApi, initialInstanceParams } from "@cloudpivot/api";
import BizModel from "./biz-model.vue";

@Component({
  name: "item-list",
  components: {
    BizModel,
  },
})
export default class itemList extends Vue {
  @Prop() appItem!: any;

  @Prop() searchWord?: string;

  @Prop({ default: false }) loadBizModel?: boolean;

  openFolder(folder: any) {
    // folder.open = !folder.open;
    this.$set(folder, "open", !folder.open);
    if (!this.loadBizModel) {
      return;
    }
    if (!folder.children || !folder.children.length) {
      initialInstanceApi
        .listMyWorkflowByFolderId(folder.id, true)
        .then((res: initialInstanceParams.HttpResponse<any>) => {
          if (Array.isArray(res.data)) {
            folder.children = res.data;
          }
        });
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
.item-list {
  background: #fff;
  text-align: left;
  overflow-y: auto;
  overflow-x: hidden;
  .folder-title {
    display: flex;
    border-bottom: 1px solid #ebedf2;
    .px2rem(height, 112px);
    .px2rem(line-height, 112px);
    .px2rem(padding-left, 30px);
    .px2rem(padding-right, 30px);
    & > i {
      .px2rem(font-size, 41px);
      .px2rem(margin-right, 30px);
      color: #ffb131;
    }
    &__text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      .px2rem(font-size, 32px);
      color: #333;
    }
    &__left {
      i {
        .px2rem(margin-left, 32px);
        color: #666;
        .px2rem(font-size, 30px);
        float: right;
        transition: all 0.3s;
        &.closed {
          transform: rotate(-90deg);
        }
      }
      span {
        color: #999;
        .px2rem(font-size, 24px);
      }
    }
  }
  .folder-content {
    .px2rem(padding-left, 70px);
  }
}
</style>
