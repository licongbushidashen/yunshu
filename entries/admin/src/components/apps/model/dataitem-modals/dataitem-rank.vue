<template>
  <div class="dataitem-rank clearfix">
    <Draggable
      element="div"
      id="dataitemrank"
      :list="itemList"
      :options="dragItemOptions"
      @end="onSortEnd"
    >
      <template v-for="(item, index) in itemList">
        <div
          v-if="item.propertyType == 8"
          :key="item.code"
          class="dataitem-rank-sheet__item clearfix sheetDiv"
          :class="{'dataitem-rank-sheet-sort__item': item.sheetSort, 'dataitem-rank-sheet-hover__item': item.hove}"
        >
          <div @mouseover="itemOver(item)" @mouseleave="itemLeave(item)">
            <span class="dataitem-rank-sheet__title"><span class="dataitem-rank-sheet__index">{{ index+1 }}</span>{{ item.name }}</span>
            <span
              class="dataitem-rank-sheet-show_btn"
              @click="item.sheetSort = !item.sheetSort"
            >{{ item.sheetSort?'收起':'展开' }}</span>
            <span v-if="item.hove" class="icon aufontAll">&#xe63e;</span>
          </div>
          <div v-show="item.sheetSort">
            <Draggable
              element="div"
              :id="'dataitemrank'+item.code"
              :list="item.children"
              :options="dragItemOptions"
              @end="onSheetSortEnd(item.code)"
            >
              <template v-for="(sheetItem, sheetIndex) in item.children">
                <div
                  :key="sheetItem.code"
                  class="dataitem-rank__item clearfix"
                  style="font-size: 12px"
                  @mouseover="itemOver(sheetItem)"
                  @mouseleave="itemLeave(sheetItem)"
                >
                  <a-tooltip placement="topLeft">
                    <template #title>
                      <span>{{ sheetItem.name }}</span>
                    </template>
                    <span class="dataitem-rank__title"><span class="dataitem-rank-sheet__index">{{ sheetIndex+1 }}</span> {{ sheetItem.name }}</span>
                  </a-tooltip>

                  <span class="icon aufontAll" v-show="sheetItem.hove">&#xe63e;</span>
                  <!-- v-show="sheetItem.hove" -->
                </div>
              </template>
            </Draggable>
          </div>
        </div>
        <div
          v-else
          :key="item.code"
          class="dataitem-rank__item clearfix"
          @mouseover="itemOver(item)"
          @mouseleave="itemLeave(item)"
        >
          <a-tooltip placement="topLeft">
            <template #title>
              <span>{{ item.name }}</span>
            </template>
            <span class="dataitem-rank__title"><span class="dataitem-rank-sheet__index">{{ index+1 }}</span>{{ item.name }}</span>
          </a-tooltip>

          <span v-if="item.hove" class="icon aufontAll">&#xe63e;</span>
        </div>
      </template>
    </Draggable>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';

@Component({
  name: 'dataitem-rank',
  components: {
    Draggable,
  },
})
export default class DataItemRank extends Vue {
  @Prop() dataItemList!: any;

  dragItemOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    forceFallback: true,
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 100,
  };

  itemList = [];
  created() {
    this.itemList = this.dataItemList.map((res: any) => {
      const { code, name_i18n, name, propertyType, children } = res;
      return {
        code,
        name,
        name_i18n,
        propertyType,
        hove: false,
        sheetSort: false, // 子表排序
        children: children
          ? children.map((val: any) => {
              const { code: c, name_i18n: n, name: nm } = val;
              return {
                code: c,
                name: nm,
                name_i18n: n,
                propertyType,
                hove: false,
              };
            })
          : [],
      };
    });
  }

  itemOver(item: any) {
    item.hove = true;
  }
  itemLeave(item: any) {
    item.hove = false;
  }

  onSortEnd(evt: any) {
    const codeList = this.itemList.map((res: any) => {
      return res.code;
    });
    this.$emit('sortEnd', codeList);
  }

  onSheetSortEnd(sheetCode: string) {
    let filter: any = this.itemList.filter((val: any) => {
      return val.code === sheetCode;
    });
    if (filter.length) {
      this.$emit(
        'sortChildrenRankList',
        filter[0].children.map((res) => res.code).join(','),
        sheetCode
      );
    }
  }
}
</script>
<style lang="less" scoped>
.dataitem-rank {
  &__item {
    float: left;
    width: 33.33%;
    line-height: 32px;
    border-radius: 4px;
    color: rgba(0, 0, 0, 0.85);
    cursor: move;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -khtml-user-select: none; /* Konqueror */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently */
    .dataitem-rank__title {
      float: left;
      display: inline-block;
      width: 75%;
    }
    span {
      margin-left: 8px;
    }
    .icon {
      width: 15%;
      display: inline-block;
      float: right;
      margin-left: 0;
      // margin-right: 10px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }
    &:hover {
      background: rgba(232, 252, 244, 1);
    }
  }
  &__title {
    margin-left: 8px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 75%;
  }
  &-sheet {
    &__item {
      float: left;
      width: 100%;
      line-height: 32px;
      border-radius: 4px;
      color: rgba(0, 0, 0, 0.85);
      cursor: move;
      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Chrome/Safari/Opera */
      -khtml-user-select: none; /* Konqueror */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently */
      span {
        margin-left: 8px;
      }
      .icon {
        float: right;
        // margin-right: 10px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
      }
    }
    &__title {
      margin-left: 8px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    &__index {
      margin-right: 16px;
      color: rgba(0, 0, 0, 0.45);
      margin-left: 0;
      display: inline-block;
      width: 24px;
      text-align: center;
    }
    &-show_btn {
      width: 24px;
      height: 20px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(23, 188, 148, 1);
      line-height: 20px;
      cursor: pointer;
    }
    &-sort__item {
      background: rgba(250, 250, 250, 1);
      border-radius: 4px;
    }
    &-hover__item {
      background: rgba(232, 252, 244, 1);
    }
  }

  .ghostClass {
    opacity: 1;
    background-color: #fff;
    border-radius: 4px;
    position: relative;
    // position:absolute;
    // border: 1px solid @primary-color;
    * {
      opacity: 0;
    }
    &:after {
      display: block;
      height: 30px;
      position: absolute;
      border: 1px dashed @primary-color;
      width: 100%;
      border-radius: 4px;
    }
  }
  .dragClass {
    // display: none;
    background: rgba(232, 252, 244, 1);
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    position: absolute;
  }
}
.sheetDiv {
  width: 100%;
}
</style>
