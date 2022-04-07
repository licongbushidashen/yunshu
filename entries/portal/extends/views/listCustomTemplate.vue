<style lang="less">
.wyc {
  color: #a53030;
  &::before {
    content: "";
    background: url("./zf.png");
    background-size: 100% 100%;
    display: inline-block;
    height: 16px;
    width: 16px;
    vertical-align: sub;
    position: relative;
    top: -1px;
  }
}
.jdwc {
  .ant-modal {
    overflow: auto;
    padding: 0px;
    margin-bottom: 20px;
  }
  .ant-modal-footer {
    display: none;
  }
  .table111.table11 {
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
    border-top: 0px;
    display: block;
  }
  .table11 {
    border-left: 0px;
    display: flex;
    border: 1px solid #e8e8e8;
    border-bottom: 0px;
    // border-top-left-radius: 4px;
    // border-top-right-radius: 4px;
    .table22 {
      width: 100%;
      display: flex;
      > div {
        border-left: 1px solid #e8e8e8;
        border-bottom: 1px solid #e8e8e8;
        padding: 10px;
        color: #666;
        min-width: 92px;
      }
      .table22_1 {
        width: 50px;
        text-align: center;
        border-left: 0px;
      }
      .table22_2 {
        width: 160px;
      }
      .table22_3 {
        flex: 1;
      }
    }
  }
}
.table-row-item-ZRFJ > div,
.table-row-item-CYJC > div,
.table-row-item-RW > div {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 4 !important;
  white-space: break-spaces !important;
  -webkit-box-orient: vertical;
}
.table-row-item.table-row-item-__ordinalNo.table-row-item-type-undefined {
  flex: initial !important;
}
.ant-btn[disabled] {
  display: none !important;
}
.cb {
  background: url("./cd.png");
  width: 16px;
  height: 16px;
  display: inline-block;
  background-size: 100% 100%;
  vertical-align: sub;
}
.dets.cbspan {
  border: 1px solid #ba0505;
  color: #ba0505 !important;
}
.dets.zfdets {
  &::before {
    content: "";
    background: url("./xh.png");
    background-size: 100% 100%;
    display: inline-block;
    height: 16px;
    width: 16px;
    vertical-align: sub;
    margin-right: 3px;
    position: relative;
    top: -1px;
  }
}
.dets {
  border: 1px solid #bbbbbb;
  border-radius: 8px;
  height: 26px;
  display: inline-block;
  padding: 5px;
  line-height: 14px;
  margin-right: 10px;
  color: #e8e8e8 !important;
  padding-top: 5px;
}
.wks {
  color: #000000;
  &::before {
    content: "";
    background: url("./wks.png");
    background-size: 100% 100%;
    display: inline-block;
    height: 16px;
    width: 16px;
    vertical-align: sub;
    position: relative;
    top: -1px;
  }
}
.ycs {
  color: #a53030;
  &::before {
    content: "";
    background: url("./warning01.png");
    background-size: 100% 100%;
    display: inline-block;
    height: 16px;
    width: 16px;
    vertical-align: sub;
    position: relative;
    top: -1px;
  }
}

.yyq {
  color: #ff8300;
  &::before {
    content: "";
    background: url("./warning02.png");
    background-size: 100% 100%;
    display: inline-block;
    height: 16px;
    width: 16px;
    vertical-align: sub;
    position: relative;
    top: -1px;
  }
}
.wks1 {
  color: #000000;
  &::before {
    content: "";
    background: url("./zf.png");
    background-size: 100% 100%;
    display: inline-block;
    height: 16px;
    width: 16px;
    vertical-align: sub;
    position: relative;
    top: -1px;
  }
}
.jxz {
  color: #ff8300;
  &::before {
    content: "";
    background: url("./jx.png");
    background-size: 100% 100%;
    display: inline-block;
    height: 16px;
    width: 16px;
    vertical-align: sub;
    position: relative;
    top: -1px;
  }
}
.wyc {
  color: #a53030;
  &::before {
    content: "";
    background: url("./zf.png");
    background-size: 100% 100%;
    display: inline-block;
    height: 16px;
    width: 16px;
    vertical-align: sub;
    position: relative;
    top: -1px;
  }
}
.ywc {
  color: #5ab192;
  &::before {
    content: "";
    background: url("./wc.png");
    background-size: 100% 100%;
    display: inline-block;
    height: 16px;
    width: 16px;
    vertical-align: sub;
    position: relative;
    top: -1px;
  }
}

.wyc_title {
  color: #e9b8bb;
}
.treeList {
  width: 100%;
  overflow: auto;
}
.custom-template-container {
  // 滚动
  height: 100%;
  // overflow: auto;
  width: 100%;
  // position: relative;
  // &::-webkit-scrollbar { width:0!important; height:0!important; }
  // 自动隐藏滚动条
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.35);
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
  &.scrollbar-auto-hidding {
    &::-webkit-scrollbar-thumb {
      //滚动条的设置
      background-color: rgba(0, 0, 0, 0);
      // box-shadow:none;
    }
    &:hover::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.35);
    }
  }

  // 列表, 通用
  .table-container {
    width: 100% !important;
    position: relative;
    // 两侧固定, 根据位置变化显示阴影
    @fixedColumnShadow: inset 8px 0px 6px -6px rgba(0, 0, 0, 0.15);
    &:not([data-h-pos="h-left"]) .fixed-left-column-last::after,
    &:not(.self-adaption):not([data-h-pos="h-right"])
      .fixed-right-column-last::after {
      box-shadow: @fixedColumnShadow;
    }
    // 最后一个调节栏在表格100%宽度时, 只能增大, 不能缩小; 图标也根据状态进行改变;
    &.self-adaption .table-head-wrapper .table-row-item:last-child .resize-bar {
      cursor: e-resize;
    }
    // 如果设置了不能调节列宽, 所有调节栏图标hover时呈现默认状态
    &.no-column-resizing .resize-bar {
      cursor: default !important;
    }

    // 通用
    .table-row {
      display: flex;
      flex-direction: row;
      min-height: 37px;
      &:hover {
        background-color: #f0f7ff;
      }
      .table-row-item {
        position: relative;
        z-index: 1;
        box-sizing: border-box;
        padding: 8px;
        // padding-right:13px;
        white-space: nowrap;
        overflow: hidden;

        // 一列高度增加, 其他列自动扩展
        // flex: 0 1 auto;
        flex: 1;
        // &.colspan { flex:1 1 auto; }

        // 当行超出显示省略号
        border-bottom: 1px solid #e8e8e8;
        // border-left: 1px solid #e8e8e8;
        // border-right: 0px solid #e8e8e8;
        &.child-sheet-row-item {
          padding: 0;
        }

        // 序号列
        &-__ordinalNo {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 48px;
        }
        //
        &.text-disabled {
          color: #ccc;
        }
        // 固定列
        &.fixed-left-column,
        &.fixed-right-column {
          position: sticky;
          -ms-position: aboslute;
          z-index: 10;
        }
        @fixedColumnWidth: 8px;
        &.fixed-left-column-last,
        &.fixed-right-column-last {
          overflow: visible !important;
          &::after {
            content: "\200B";
            height: 100%;
            width: @fixedColumnWidth;
            position: absolute;
            top: 0;
            z-index: 1;
            transition: box-shadow 0.3s ease;
            pointer-events: none;
          }
        }
        &.fixed-left-column-last::after {
          right: -@fixedColumnWidth;
        }
        &.fixed-right-column-last::after {
          left: -@fixedColumnWidth;
          transform: rotate(180deg);
        }
      }
      img {
        max-width: 100%;
      }
    }
    // 可选 & 不可选
    .table-body-row .table-row-item-__ordinalNo {
      .row-serial-no {
        display: block;
      }
      .ant-checkbox-wrapper.checked + .row-serial-no {
        display: none;
      }
      .ant-checkbox-wrapper:not(.checked) {
        display: none;
      }
    }
    &.row-selectable {
      .table-body-row .table-row-item-__ordinalNo:hover {
        .ant-checkbox-wrapper {
          display: block;
        }
        .row-serial-no {
          display: none !important;
        }
      }
    }
  }

  // 表头
  .table-head-wrapper {
    &.fixed-top-header {
      position: sticky;
      z-index: 20;
    }
    .table-row {
      .table-row-item {
        background: #eff0f1 !important;
        flex: 1;
        color: #737278;
        font-weight: 600;
        background-color: #f8fbff;
        overflow: visible;
        display: flex;
        align-items: center;
        transition: background-color 200ms;
        border-left: 0px;
        border-right: 0px;
        &.resizing {
          background-color: #e5effe;
        }
        .resize-bar {
          display: none;
          position: absolute;
          right: 0;
          top: 15%;
          width: 5px;
          height: 70%;
          border-right: 1px solid rgba(0, 0, 0, 0.15);
          cursor: col-resize;
        }
        &:last-child {
          padding-right: 13px;
          .resize-bar {
            right: 5px;
          }
        }

        .child-sheet-wrapper {
          overflow: hidden;
          width: 100%;
          .child-sheet-title {
            text-align: center;
            padding: 8px;
            border-bottom: 1px solid #e8e8e8;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .child-row-item {
            position: relative;
            float: left;
            padding: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            &:last-child {
              border-right: none;
            }
          }
        }
      }
    }
    // & .table-head-value:hover {
    //   background-color: rgb(219, 218, 218);
    // }
    .table-head-value {
      width: 100%;
      height: 100%;
      cursor: pointer;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .head-value-up_down {
        .icon-up_down {
          color: rgb(158, 158, 158);
        }
        > .icon-up-down-light {
          color: rgb(34, 133, 247);
        }
        margin-left: 5px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
  }
  // 表体
  .has-number-item {
    margin-bottom: 36px;
  }
  .table-body-row {
    &:hover .table-row-item {
      background: #f0f7ff;
    }
    // &.unfinished .table-row-item:first-child::before {
    //   position: absolute;
    //   left: 0;
    //   top: 0;
    //   width: 4px;
    //   height: 100%;
    //   background-color: #faad14;
    //   content: "\200B";
    // }
    .table-row-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      // height:100%;
      & > * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        // text-align: center;
        // &:only-child {
        //   height:100%;
        // }
      }
      // & > div:only-child {
      //   display:flex;
      //   flex-direction:column;
      //   justify-content:center;
      // }
      background-color: #fff;

      .attachment-wrapper {
        // align-items:center;
        img,
        a {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          &:not(:first-child) {
            margin-top: 4px;
          }
          max-height: 100px;
        }
      }
      .col-inner-wrapper12 {
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        // align-items: center;
        span {
          width: 81px;
          margin-bottom: 3px;
        }
      }
      // 普通项 hover
      // &:not(.text-disabled)
      .col-inner-wrapper:hover {
        cursor: pointer;
        color: #2970ff;
      }
    }
    // .table-row-item-__ordinalNo {
    //   // 默认显示序号, 隐藏"没被选择"的选择框
    //   .row-serial-no { display:block; }
    //   .ant-checkbox-wrapper.checked +.row-serial-no { display:none; }
    //   .ant-checkbox-wrapper:not(.checked) { display:none; }
    //   // .ant-checkbox-wrapper:not(.checked) + .row-serial-no { display:block; }
    //   // hover时显示选择框, 隐藏序号
    //   // &:hover {
    //     // .ant-checkbox-wrapper { display:block; }
    //     // .row-serial-no { display:none!important; }
    //   // }
    // }

    .child-sheet-wrapper {
      height: 100%;
      .child-items-row {
        display: flex;
        border-top: 1px solid #e8e8e8;
        &:first-child {
          border-top: none;
        }
        .child-items {
          padding: 8px;
          &.padding {
            padding-left: 28px;
          }
          .child-row-item {
            position: relative;
            // white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            &.text-disabled {
              color: #ccc;
            }
            &:hover {
              cursor: pointer;
              color: #2970ff;
            }
          }
          .row-collaps {
            height: 20px;
            margin-right: 8px;
            color: rgba(0, 0, 0, 0.65);
            font-size: 10px;
            float: left;
            transition: transform 0.24s;
            cursor: pointer;
            &.expanded {
              transform: rotate(180deg);
            }
          }
        }
        .load-more {
          color: @primary-color;
          font-size: 12px;
          width: 100%;
          padding: 8px;
          padding-left: 28px;
          cursor: pointer;
        }
        .load-complete {
          color: rgba(0, 0, 0, 0.65);
          font-size: 12px;
          width: 100%;
          padding: 8px;
          padding-left: 28px;
        }
      }
    }
  }
  .table-number-item-wrap {
    width: 100%;
    overflow: hidden;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 56px;
    z-index: 10;
  }
  .table-number-item {
    overflow: hidden;
    height: 32px;
    line-height: 32px;
    background: rgba(244, 246, 252, 1);
    display: flex;
    flex-direction: row;
    justify-content: center;

    .table-number-item-row {
      padding: 0 8px;
      font-size: 12px;
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: rgba(0, 0, 0, 0.65);
    }
  }
}
</style>
<template>
  <div
    v-if="modelType === 'LIST'"
    class="custom-template-container"
    :class="{ 'scrollbar-auto-hidding': tableConfig.scrollbarAutoHidding }"
  >
    <!-- 列表容器 -->
    <div
      :class="[
        { 'self-adaption': tableScrollWidth === '100%' },
        ...tableData.additionalClasses
      ]"
      :style="{ width: tableScrollWidth }"
      data-v-pos="v-top"
      data-h-pos="h-left"
    >
      <!-- 列表头 -->
      <div
        :class="tableData.thead.additionalClasses"
        :style="tableData.thead.style"
      >
        <div
          v-for="(row, rowIdx) in tableData.thead.rows"
          :key="rowIdx"
          :class="row.additionalClasses"
          :style="row.style"
        >
          <div
            v-for="(col, colIdx) in row.cols"
            :key="colIdx"
            :class="col.additionalClasses"
            :style="{ 'max-width': col.properties.width, ...col.style }"
          >
            <!-- 首列为 序号&选择 -->
            <template
              v-if="
                tableConfig.rowOrdinal &&
                  tableConfig.rowSelectable &&
                  col.properties.id === '__ordinalNo'
              "
            >
              <span>序号</span>
              <!-- <a-checkbox
                v-if="!tableData.tbody.rows.length"
                :checked="false"
              />
              <a-checkbox
                v-else-if="tableData.tbody.rows.every(r => r.checked)"
                checked
                @change="rowSelection('cancelAll')"
              />
              <a-checkbox
                v-else
                :indeterminate="tableData.tbody.rows.some(r => r.checked)"
                @change="rowSelection('checkAll')"
              ></a-checkbox> -->
            </template>

            <!-- 子表列 -->
            <div
              class="child-sheet-wrapper"
              v-else-if="col.properties.propertyType === DataItemType.Sheet"
            >
              <div class="child-sheet-title">
                {{
                  col.properties.name_i18n
                    ? col.properties.name_i18n[$i18n.locale]
                      ? col.properties.name_i18n[$i18n.locale]
                      : col.value
                    : col.value
                }}
              </div>
              <template v-for="(child, index) in col.properties.childColumns">
                <div
                  class="child-row-item"
                  :style="{ width: child.width + 'px' }"
                  :key="index"
                >
                  <label>{{ getHeaderKey(child) }}</label>
                </div>
              </template>
            </div>
            <!-- 其他列输出 标题 -->
            <div
              class="table-head-value"
              v-else-if="sortKey(col.properties.id)"
              @click="changeSort(row.cols, col.properties)"
            >
              <label>{{
                col.properties.name_i18n
                  ? col.properties.name_i18n[$i18n.locale]
                    ? zhToen[col.properties.name_i18n[$i18n.locale]]
                      ? getHeaderShow(
                          col.properties.name_i18n[$i18n.locale],
                          $i18n.locale
                        )
                      : col.properties.name_i18n[$i18n.locale]
                    : col.value
                  : col.value
              }}</label>
              <div class="head-value-up_down">
                <a-icon
                  type="caret-up"
                  class="icon-up_down"
                  :class="
                    col.properties.isEdit &&
                      (col.properties.sub === 1 ? 'icon-up-down-light' : '')
                  "
                />
                <a-icon
                  type="caret-down"
                  class="icon-up_down"
                  :class="
                    col.properties.isEdit &&
                      (col.properties.sub === 2 ? 'icon-up-down-light' : '')
                  "
                />
              </div>
            </div>
            <label v-else>
              {{
                col.properties.name_i18n
                  ? col.properties.name_i18n[$i18n.locale]
                    ? zhToen[col.properties.name_i18n[$i18n.locale]]
                      ? getHeaderShow(
                          col.properties.name_i18n[$i18n.locale],
                          $i18n.locale
                        )
                      : col.properties.name_i18n[$i18n.locale]
                    : col.value
                  : col.value
              }}</label
            >
          </div>
        </div>
      </div>
      <!-- 加载状态 -->
      <!-- <PageLoading v-model="isLoading" shadeColor="#F4F6FC" :shadeOpacity="0.5" /> -->
      <!-- 列表体 -->
      <div
        :class="tableData.tbody.additionalClasses"
        :style="tableData.tbody.style"
      >
        <div
          v-for="(row, rowIdx) in tableData.tbody.rows"
          :key="rowIdx"
          :class="row.additionalClasses"
          :style="row.style"
        >
          <div
            v-for="(col, colIdx) in row.cols"
            :key="colIdx"
            :class="col.additionalClasses"
            :style="{
              'max-width': col.properties.width,
              ...col.style
            }"
          >
            <!-- 首列为 序号/选择 -->
            <div
              class="row-selection-box"
              v-if="
                tableConfig.rowOrdinal && col.properties.id === '__ordinalNo'
              "
            >
              <!-- <a-checkbox
                :class="{ checked: row.checked }"
                :checked="row.checked"
                @change="rowSelection('check', row)"
              ></a-checkbox> -->
              <span>{{ row.__ordinalNo }}</span>
            </div>
            <!-- 如果是附件, 需要换取地址 -->
            <div
              v-else-if="
                col.properties.propertyType === DataItemType.Attachment
              "
              class="attachment-wrapper"
            >
              <a
                v-for="(atta, attaIdx) in col.value"
                :key="attaIdx"
                :href="atta.url"
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <template v-if="atta.isImage"
                  ><img :src="atta.url" :alt="atta.name"
                /></template>
                <template v-else>{{ atta.name }}</template>
              </a>
            </div>

            <!-- <div v-else-if="col.id==='custom-cols'" class="inner-table">
              {{ col.value }}
            </div> -->
            <!-- 其他字段作为字符串直接输出 -->
            <div
              v-else-if="col.properties.id === 'sequenceStatus'"
              class="col-inner-wrapper"
              :title="col.value"
              :class="states(col.value)"
            >
              {{ col.value }}
            </div>
            <div
              v-else
              class="col-inner-wrapper"
              :title="col.value"
              :class="col.value == '未完成' ? 'wyc_title' : ''"
              :style="{ color: col.wystyle }"
              @click="pageVM.goForm(col.properties, rowIdx)"
              v-html="col.value"
            >
              <!-- {{ col.value }} -->
            </div>
            <!--
            <div
              v-else-if="col.properties.id === 'cz'"
              class="col-inner-wrapper col-inner-wrapper12 "
              :title="col.value"
            > -->
            <!-- <a-popconfirm
                title="是否确定提交？"
                ok-text="是"
                cancel-text="否"
                @confirm="openDet(col, 1, rowIdx)"
              >
                <span
                  class="dets"
                  v-if="col.cz == '草稿' && $route.name != 'work'"
                  style="    border: 1px solid #ba0505;    color: #ba0505!important;"
                  >提交</span
                >
              </a-popconfirm> -->
            <!-- <span
                class="dets"
                v-if="col.cz == '草稿'"
                @click="pageVM.goForm(col.properties, rowIdx)"
                >编辑</span
              > -->
            <!-- <span
                class="dets cbspan"
                v-if="col.cz == '进行中' && col.urge && $route.name != 'work'"
                @click="openDet(col, 3, rowIdx)"
              >
                <i class="cb"></i>
                催办</span
              >

              <a-popconfirm
                title="是否确定作废？"
                ok-text="是"
                cancel-text="否"
                @confirm="poeration(col, 4, rowIdx)"
              >
                <span
                  class="dets zfdets"
                  v-if="col.cz == '进行中' && $route.name != 'work'"
                  >作废</span
                >
              </a-popconfirm>
                <span
                class="dets"
                v-if="
                  col.cz == '已完成' ||
                    (col.cz == '已作废' && $route.name != 'work')
                "
                @click="pageVM.goForm(col.properties, rowIdx)"
                style="    border: 1px solid #abd1b8;    color: #35a85c !important;"
                >查看详情</span
              > -->
            <span
              class="dets"
              v-if="col.SFXUFK == '是' && col.properties.id === 'cz'"
              @click="openmel(rowIdx)"
              style="    border: 1px solid #abd1b8;    color: #35a85c !important;width:70px"
              >完成情况
            </span>

            <!-- </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 数值汇总功能展示 -->
    <div class="table-number-item-wrap" ref="tableNumberItem">
      <div
        :style="{ width: tableScrollWidth, bottom: `${bottom}px` }"
        class="table-number-item"
        v-if="tableData.tbody.rows.length > 0 && originalNumberData"
      >
        <div
          v-for="(col, index) in tableData.tbody.rows[0].cols"
          :key="index"
          :style="{ width: col.properties.width + 'px', ...col.style }"
          class="table-number-item-row"
        >
          <span
            v-if="
              col.properties.propertyType === DataItemType.Number &&
                col.properties.sumType > 0
            "
            >{{
              getsumTypeName(col.properties.sumType) +
                "=" +
                getNumberValue(
                  originalNumberData[col.properties.key],
                  col.properties
                )
            }}</span
          >
          <span v-else></span>
        </div>
      </div>
    </div>
    <a-modal
      class="jdwc"
      title="季度完成情况"
      :visible="visible"
      @cancel="visible = false"
      width="800px"
      height="600px"
    >
      <div style="height: 200px;" v-if="spinning">
        <a-spin
          tip="Loading..."
          v-if="spinning"
          style="
  text-align: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 30px 50px;
  margin: 20px 0;
  height:100%;
  width: 100%;
      padding-top: 10%;
"
        >
        </a-spin>
      </div>
      <div v-else>
        <div class="table11" v-if="wcjdata.length">
          <div class="table22">
            <div class="table22_1">
              <span>序号</span>
            </div>
            <div
              v-for="(item, index) in wcjdatas"
              :key="index"
              :class="'table22_' + (index + 2)"
            >
              <span>{{ item.name }}</span>
            </div>
            <!-- <div class="table22_2">
            <span>要求反馈日期</span>
          </div>
          <div class="table22_3">
            <span>季度完成情况</span>
          </div>
          <div>
            <span>完成率</span>
          </div> -->
          </div>
        </div>
        <div class="table11 table111" v-if="wcjdata.length">
          <div v-for="(item, index) in wcjdata" :key="index">
            <div class="table22">
              <div class="table22_1">
                <span>{{ index + 1 }}</span>
              </div>
              <div
                v-for="(i, t) in item"
                :key="t"
                :class="'table22_' + (t + 2)"
              >
                <span>{{ i }}</span>
              </div>

              <!-- <div class="table22_2">
              <span>{{ format(item.fkrq, "yyyy-MM-dd ") }}</span>
            </div>
            <div class="table22_3">
              <span>{{ item.wcqk || "--" }}</span>
            </div>
            <div>
              <span>{{ item.wcl || "--" }}</span>
            </div> -->
            </div>
          </div>
        </div>
        <div class="no-data" v-else>
          <PageNoData
            :isShowNoData="false"
            :isShowSearchNoData="true"
            :tipText="$t('cloudpivot.list.pc.NoData')"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import Axios from "axios";
import { FormDetailService } from "@cloudpivot/form/src/runtime/services/form-detail-service";
import * as pcForm from "@cloudpivot/form/pc";
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
// 默认模板 & 模板编译器
import listCustomTemplateConverter from "@cloudpivot/list/src/components/listCustom/template/pc/handler";
const vueCompiler = require("@cloudpivot/list/src/components/mobile/application-list/vueCompiler.build");

import zhToen from "@cloudpivot/list/src/components/pc/locales/zhToEn";

// 函数
// import common from '@cloudpivot/common';
const { getRealValue } = common.utils.BusinessFunctions;
// 工具函数
import { renderer } from "@cloudpivot/form";
import * as Helper from "@cloudpivot/list/src/components/pc/helper/helper";

import { DataItemType } from "@cloudpivot/form/schema";

import common from "@cloudpivot/common/pc";

import { listApi, listParams, formApi, workflowApi } from "@cloudpivot/api";
import { Modal, Popconfirm } from "@h3/antd-vue";
import { map } from "lodash";
// ant-design
const Antd = require("@h3/antd-vue");
Vue.use(Antd);

interface Nodes {
  activityCode: string;
  activityName: string;
  workItemsType: WorkItemsType;
  selected: boolean;
  id: string;
}
enum WorkItemsType {
  // 代办
  WorkItem = 0,
  // 已办
  WorkItemFinished = 1,
  // 待阅
  CirculateItem = 2,
  // 已阅
  CirculateItemFinished = 3
}

// 类型
interface TableData {
  thead: TableDataRowCategory;
  tbody: TableDataRowCategory;
  additionalClasses: string[];
  style?: object;
}
interface TableDataRowCategory {
  rows: TableDataRow[];
  additionalClasses: string[];
  style?: object;
}
interface TableDataRow {
  __ordinalNo?: number;
  checked?: boolean;
  cols: TableDataColItem[];
  additionalClasses: string[];
  style?: object;
}
interface TableDataColItem {
  value: any;
  properties: any;
  additionalClasses: string[];
  style?: object;
  colspan?: number;
}

// @@ 组件定义
@Component({
  name: "custom-template",
  components: {
    AModal: Modal,
    APopconfirm: Popconfirm,
    PageNoData: common.components.PageNoData,
    sheet: () =>
      import(/* webpackChunkName: "sheet" */ "@cloudpivot/form/src/renderer/components/pc/form-sheet/sheet.vue"),
    PageLoading: common.components.PageLoading
  }
})
export default class listCustomTemplate extends Vue {
  // @@ 参数
  @Prop() pageVM: any;
  // @Prop() columns:any;
  @Prop() originalTableColumns: any;
  @Prop() originalTableData: any;
  @Prop() templateString: any;
  @Prop() modelType?: string;
  @Prop() isOpen?: boolean;
  @Prop({
    default() {
      return {
        presentationType: "table",
        fixedHeader: true,
        fixedLeftColumns: ["__ordinalNo"],
        fixedRightColumns: [],
        rowOrdinal: true,
        rowSelectable: true,
        columnResizable: true,
        scrollbarAutoHidding: true
      };
    }
  })
  tableConfig: any;
  /**
   * 流程表单节点
   */
  nodes: Nodes[] = [];
  mloading: boolean = false;
  //数值数据项数据
  @Prop() originalNumberData: any;

  // @@ 变量
  columns: any[] = [];
  // tableData:TableData;
  tableData: TableData = {
    additionalClasses: [],
    thead: { rows: [], additionalClasses: [] },
    tbody: { rows: [], additionalClasses: [] }
  };

  // 需要排序的表头
  @Prop() sortConfig!: any[];

  @Watch("tableData", {
    immediate: true
  })
  getTableData(val: any) {
    // console.log('tableData----->' ,val)
  }

  @Watch("sortConfig", {
    immediate: true
  })
  getSortConfig(val: any) {
    if (val.length) {
      const data: any[] = this.sortConfigMap;
      if (!data.length) {
        this.sortConfigMap = val.map((item: any) => {
          item.direction = 0;
          return item;
        });
      }
    }
  }
  zhToen: any = {};
  created() {
    this.zhToen = zhToen;
  }
  format(data, fmt) {
    if (!data) {
      return "--";
    }
    let _this = new Date(data);
    var o = {
      "M+": _this.getMonth() + 1, //月份
      "d+": _this.getDate(), //日
      "h+": _this.getHours(), //小时
      "m+": _this.getMinutes(), //分
      "s+": _this.getSeconds(), //秒
      "q+": Math.floor((_this.getMonth() + 3) / 3), //季度
      S: _this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (_this.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  }
  getHeaderShow(text, type) {
    if (type === "zh") {
      return text;
    } else {
      return this.zhToen[text];
    }
  }

  pageSize: number = 20; // 子表一页展示数据条数，默认为20
  visible: boolean = false;
  DataItemType: any = DataItemType;

  // 默认排序方式
  sortConfigMap: any[] = [];

  // 是否为加载状态
  isLoading: boolean = false;

  // 当前是否进行过排序状态
  isSort: boolean = false;

  // 排序的code
  sortCode: string = "";

  // 排序升序倒叙
  sortAscDesc: number = 0;

  // @@ watching
  @Watch("originalTableColumns", { immediate: true })
  onOriginalTableColumnsChange(columns, oldColumns) {
    if (!columns || !columns.length) return;
    this.columns = this.serializeColumns();
  }
  @Watch("columns", { immediate: true })
  onColumnsChange(columns, oldColumns) {
    if (!columns || !columns.length) return;
    // console.log( '___________', columns?columns.length:'000', oldColumns?oldColumns.length:'111' );
    this.tableData = this.serializeTableData();
    this.$nextTick(this.initDomEvents);
  }
  @Watch("tableConfig", { immediate: true })
  onTableConfigChange(newVal: any, oldVal: any) {
    if (!oldVal) return;
    this.tableData = this.serializeTableData();
  }
  @Watch("originalTableData", { immediate: true })
  onOriginalTableDataChange(newVal: any, oldVal: any) {
    console.log("originalTableData----->", newVal);
    if (!oldVal) return;
    this.tableData = this.serializeTableData();
    this.$nextTick(() => {
      this.handleSerializeNumberScroll();
    });
  }
  wcjdata: [] = [];
  wcjdatas: [] = [];
  spinning: Boolean = true;
  openmel(rows) {
    this.spinning = true;
    this.mloading = true;
    this.visible = true;
    let ids = this.originalTableData[rows];
    return Axios.post(`/weiyuapi/authine-lowCode/dcdb/getfks`, [
      ids.workflowInstanceId
    ]).then(res => {
      let wcjdata = [];
      let wcjdatas = [];
      if (res.code != 200) {
        this.wcjdata = [];
        this.wcjdatas = [];
        this.spinning = false;
        return true;
      }
      for (let i = 0; i < res.head.length; i++) {
        if (res.head[i].id != "id") {
          wcjdatas.push(res.head[i]);
        }
      }
      console.log(wcjdatas, 1111);
      for (let i = 0; i < res.list.length; i++) {
        let data = res.list[i];
        let arr = wcjdatas.map(e => {
          if (e.id != "id") {
            if (isNaN(data[e.id]) && !isNaN(Date.parse(data[e.id]))) {
              if (data[e.id].indexOf("%") == "-1") {
                let tiem = this.format(data[e.id], "yyyy-MM-dd ");
                return tiem;
              } else {
                return data[e.id] || "--";
              }
            } else {
              return data[e.id] || "--";
            }
          }
        });
        wcjdata.push(arr);
      }
      this.wcjdata = wcjdata;

      this.wcjdatas = wcjdatas;
      this.spinning = false;
    });
  }
  // 获取非系统数据key
  getHeaderKey(cur: any) {
    let name: any = cur.vcTitle;
    if (cur.name_i18n) {
      let name_i18n: any;
      if (typeof cur.name_i18n === "string") {
        name_i18n = JSON.parse(cur.name_i18n);
      } else {
        name_i18n = cur.name_i18n;
      }
      if (name_i18n[this.$i18n.locale]) {
        name = name_i18n[this.$i18n.locale];
      }
    }
    return name;
  }

  // 过滤当前的表单需要排序的表头字段
  sortKey(id: string): any {
    if (Array.isArray(this.sortConfig)) {
      if (
        this.sortConfig.findIndex((item: any) => {
          return item.propertyCode === id;
        }) > -1
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // 改变排列方式，发送请求
  changeSort(cols: any[], currentThead: any) {
    let orderByFields: string[] = [];
    let orderType: number = 0;
    // 将当前状态变为排序状态
    this.isSort = true;
    // 更新映射数组，---》改变表头字段排序状态
    this.sortConfigMap.forEach((item: any) => {
      if (currentThead.key === item.propertyCode) {
        // 将当前字段变为排序模式
        item.isEdit = true;
        if (item.direction === null || item.direction === 2) {
          item.direction = 0;
          this.sortAscDesc = 0;
          this.sortCode = "";
        } else if (item.direction === 0) {
          item.direction = 1;
          orderType = item.direction;
          orderByFields = [item.propertyCode];
          this.sortAscDesc = item.direction;
          this.sortCode = item.propertyCode;
        } else if (item.direction === 1) {
          item.direction = 2;
          orderType = item.direction;
          orderByFields = [item.propertyCode];
          this.sortAscDesc = item.direction;
          this.sortCode = item.propertyCode;
        }
      }
    });
    if (orderType === 0) {
      this.$emit("bySortGetQueryList");
    } else {
      this.$emit("bySortGetQueryList", {
        orderByFields: orderByFields,
        orderType: orderType
      });
    }
  }

  mounted() {
    //左侧导航栏收缩时触发resize事件
    common.utils.Bus.$on("resize", e => {
      this.tableClientWidth = this.$el.clientWidth;
      this.computeWidth();
    });
    console.log(this.$t("cloudpivot.form.runtime.pc.cancel"));
  }

  // @@ 数据序列化
  serializeColumns() {
    let originalTableColumns = this.originalTableColumns;

    let sle = { id: "__ordinalNo", width: 68, vcTitle: "序号", type: 1000 };
    let cls = this.tableConfig.rowOrdinal
      ? [sle, ...originalTableColumns]
      : [...originalTableColumns];
    return JSON.parse(JSON.stringify(cls));
  }

  serializeTableData() {
    let tableData: TableData;
    let dt = {
      childColumns: null,
      dataIndex: "cz",
      id: "cz",
      isShow: true,
      key: "cz",
      propertyType: 10,
      vcTitle: "操作",
      width: 140
    };
    let columns = [];
    if (this.$route.name == "work") {
      columns = [...this.columns, dt];
    } else {
      columns = this.columns;
    }
    let tableConfig = this.tableConfig;

    let num = 100;
    for (let i = 0; i < columns.length; i++) {
      switch (columns[i].id) {
        case "sequenceStatus":
          columns[i].width = "100px";
          break;
        case "RWLY":
          columns[i].width = "15%";
        case "ZDGZ":
          columns[i].width = "22%";
          break;
        case "RWMC":
          columns[i].width = "auto";
          break;
        case "RWSM":
          columns[i].width = "15%";
          break;
        case "ZYNR":
          columns[i].width = "auto";
          break;
        case "ZDRW":
          columns[i].width = "15%";
          break;
        case "FJZB":
          columns[i].width = "22%";
          break;
        case "PSLR":
          columns[i].width = "15%";
          break;
        case "LWBT":
          columns[i].width = "auto";
          break;
        case "RW":
          columns[i].width = "15%";
          break;
        case "ZRFJ":
          columns[i].width = "15%";
          break;
        case "RWNR":
          columns[i].width = "15%";
          break;
        case "CYJC":
          columns[i].width = "15%";
          break;
        case "cz":
          columns[i].width = "6%";
          break;
        case "__ordinalNo":
          columns[i].width = "40px";
          break;
        default:
          columns[i].width = "auto";
          break;
      }
    }

    // 表属性
    let tableClasses: string[] = ["table-container"];
    if (tableConfig.rowSelectable) {
      tableClasses.push("row-selectable");
    }
    if (!tableConfig.columnResizable) {
      tableClasses.push("no-column-resizing");
    }
    // 表头
    let thead: TableDataRowCategory = {
      additionalClasses: ["table-head-wrapper"],
      rows: [
        {
          checked: false,
          additionalClasses: ["table-row", "table-head-row"],
          cols: columns.map(col => ({
            value: col.vcTitle,
            // NOTE: thead-col 的属性会复制到 tbody-col 上
            properties: this.setOnlyFlag(col),
            additionalClasses: [
              "table-row-item",
              `table-row-item-${col.id}`,
              `table-row-item-type-${col.propertyType}`,
              col.propertyType === DataItemType.Sheet
                ? "child-sheet-row-item"
                : ""
            ],
            style: {}
          }))
        }
      ]
    };

    // 加 fixed-top 标识, 并带上 sticky 位置信息;
    if (tableConfig.fixedHeader) {
      thead.additionalClasses.push("fixed-top-header");
      thead.style = { top: 0 };
    }
    // 加 fixed-left
    let positiveCols: TableDataColItem[] = thead.rows[0].cols.concat();
    let fixedLeftColumns = tableConfig.fixedLeftColumns || [];
    let fixedLeftPosition = 0;
    // 计算 fixed-left 位置
    // positiveCols.some((col: TableDataColItem, colIdx: number) => {
    //   if (fixedLeftColumns.indexOf(col.properties.id) < 0) {
    //     if (colIdx > 0) {
    //       // 给最后一个添加标识
    //       positiveCols[colIdx - 1].additionalClasses =
    //         positiveCols[colIdx - 1].additionalClasses || [];
    //       positiveCols[colIdx - 1].additionalClasses.push(
    //         "fixed-left-column-last"
    //       );
    //     }
    //     return true;
    //   }
    //   // 加上固定左边的标识
    //   col.additionalClasses.push("fixed-left-column");
    //   // console.log('__________', col);
    //   col.style = { ...col.style, left: fixedLeftPosition + "px" };
    //   fixedLeftPosition += col.properties.width;
    //   return false;
    // });

    // 加 fixed-right 标识
    let invertedCols: TableDataColItem[] = thead.rows[0].cols
      .concat()
      .reverse();
    let fixedRightColumns = tableConfig.fixedRightColumns || [];
    let fixedRightPosition = 0;
    // 倒序循环, 计算 fixed-right 的位置
    invertedCols.some((col: TableDataColItem, colIdx) => {
      // 如果碰到 fixed-left, 也结束循环
      // col.additionalClasses = col.additionalClasses || [];
      if (
        col.additionalClasses.indexOf("fixed-left-column-last") > -1 ||
        fixedRightColumns.indexOf(col.properties.id) < 0
      ) {
        if (colIdx > 0) {
          invertedCols[colIdx - 1].additionalClasses.push(
            "fixed-right-column-last"
          );
        }
        return true;
      }
      // 加上固定左边的标识
      col.additionalClasses.push("fixed-right-column");
      col.style = { ...col.style, right: fixedRightPosition + "px" };
      fixedRightPosition += col.properties.width;
      return false;
    });

    // 表体, 表头标题字段一致; 所以某些属性直接复制, 不做计算
    //当有数字汇总项时添加额外的class

    let additionalClasses: any = [];
    if (this.originalNumberData) {
      additionalClasses = ["table-body-wrapper has-number-item"];
    } else {
      additionalClasses = ["table-body-wrapper"];
    }
    let tbody: TableDataRowCategory = {
      additionalClasses,
      rows: this.originalTableData.map((row, rowIdx) => {
        // 'table-row-item',`table-row-item-${col.properties.id}`, ...
        let additionalClasses: string[] = ["table-row", "table-body-row"];
        if (["草稿", "进行中"].includes(row.sequenceStatus)) {
          additionalClasses.push("unfinished");
        }
        return {
          index: rowIdx,
          __ordinalNo:
            this.pageVM.curPage > 1
              ? rowIdx + 1 + (this.pageVM.curPage - 1) * this.pageVM.pageSize
              : rowIdx + 1,
          checked: false,
          additionalClasses,
          cols: columns.map((col, colIdx) => {
            let value = row[col.propertyAlias] || row[col.id];
            let cz: string = "";
            let urge: string = "";
            let page: number = 1;
            let last: boolean = true;
            let sourceValue: any = null;
            let collapsible: boolean = true;
            // NOTE:  table-body-col 会使用 table-head-col 所定义的类名
            let { properties, additionalClasses, style } = positiveCols[colIdx];
            if (col.id == "cz") {
              cz = row["sequenceStatus"];
              urge = row.urge;
            }
            // 对附件
            if (
              col.propertyType === DataItemType.Attachment &&
              !!value &&
              Array.isArray(value)
            ) {
              value.forEach(v => {
                // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
                v.isImage = /^image\//.test(v.mimeType);
                v.url = renderer.UploadControl.service.getDownloadUrl(v);
              });
            }
            // 关联单选
            if (col.propertyType === DataItemType.RelevanceForm && !!value) {
              //关联多选中关联的是地址类型控件的话value为字符串JSON，这里目前先使用是否json来判断
              let isJson = this.isJSON(value);
              if (isJson) {
                value = getRealValue(col, value);
              } else if (Array.isArray(value)) {
                value = value.map(el => el.name).join(",");
              }
            }
            // 关联多选
            if (col.propertyType === DataItemType.RelevanceFormEx && !!value) {
              // 关联多选中关联的是地址类型控件的话value为字符串JSON，这里目前先使用是否json来判断

              let isJson = false;
              let valueList = [];
              valueList = value.split(";");
              //@ts-ignore
              isJson = this.isJSON(valueList[0]);
              if (isJson) {
                value = "";
                valueList.forEach(ele => {
                  value += `${getRealValue(col, ele)};`;
                });
              }
            }
            // 对富文本
            else if (
              col.propertyType === DataItemType.LongText &&
              /<\/?[a-zA-Z]+("[^"]*"|'[^']*'|[^'">])*>/.test(value)
            ) {
              value = "该内容不支持展示";
              additionalClasses = [...additionalClasses];
              additionalClasses.push("text-disabled");
            } else if (
              col.propertyType === DataItemType.Date ||
              col.propertyType === DataItemType.Time
            ) {
              value = getRealValue(col, value);
            }
            // 对子表
            else if (
              col.propertyType === DataItemType.Sheet &&
              Array.isArray(value) &&
              Array.isArray(col.childColumns)
            ) {
              // 子表数据项做本地分页，sourceValue为原数据
              value.forEach(val => {
                col.childColumns.forEach((childCol: any) => {
                  let cValue = val[childCol.id];
                  // 对附件(子表)
                  if (
                    childCol.propertyType === DataItemType.Attachment &&
                    !!cValue &&
                    Array.isArray(cValue)
                  ) {
                    cValue.forEach(v => {
                      // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
                      v.isImage = /^image\//.test(v.mimeType);
                      v.url = renderer.UploadControl.service.getDownloadUrl(v);
                    });
                  } else if (
                    childCol.propertyType === DataItemType.Date ||
                    childCol.propertyType === DataItemType.Time
                  ) {
                    cValue = getRealValue(childCol, cValue);
                  }
                  // 对富文本（子表）
                  else if (
                    childCol.propertyType === DataItemType.LongText &&
                    /<\/?[a-zA-Z]+("[^"]*"|'[^']*'|[^'">])*>/.test(cValue)
                  ) {
                    val[childCol.id] = {
                      text: "该内容不支持展示",
                      class: "text-disabled"
                    };
                  }
                });
              });
              sourceValue = value;
              value = value.slice(0, this.pageSize);
              last = sourceValue.length === value.length;
            }
            switch (properties.id) {
              case "SFFK":
                properties.width = "120px";
                style = { "padding-left": "40px" };
                break;
              case "SFXUFK":
                properties.width = "120px";
                style = { "padding-left": "40px" };
                break;
              case "DJ":
                properties.width = "100px";
                break;
              case "JJCD":
                properties.width = "100px";
                break;
              case "BLJZ":
                properties.width = "140px";
                style = { "padding-left": "20px" };
                break;
              case "BLRQ":
                properties.width = "140px";
                style = { "padding-left": "20px" };
                break;
              case "LXRQ":
                properties.width = "140px";
                break;
              case "RWBH":
                properties.width = "200px";
                break;
              case "LY":
                properties.width = "200px";
                break;
              case "JGCD":
                properties.width = "120px";
                style = { "padding-left": "22px" };
                break;
              case "QPRQ":
                properties.width = "140px";
                // style = { "padding-left": "10px" };
                break;
              case "PSR":
                properties.width = "120px";
                style = { "padding-left": "10px" };
                break;
              case "FK":
                properties.width = "120px";
                style = { "padding-left": "40px" };
                break;
              case "sequenceStatus":
                properties.width = "100px";
                break;
              case "CBBM":
                properties.width = "210px";
                break;
              case "JZRQ":
                properties.width = "145px";
                style = { "padding-left": "15px" };
                break;
              case "RWLY":
                properties.width = "22%";
                break;
              case "RWMC":
                properties.width = "auto";
                break;
              case "RWSM":
                properties.width = "22%";
                break;
              case "ZYNR":
                properties.width = "auto";
                break;
              case "ZDRW":
                properties.width = "20%";
                break;
              case "FJZB":
                properties.width = "22%";
                break;
              case "PSLR":
                properties.width = "22%";
                break;
              case "LWBT":
                properties.width = "auto";
                break;
              case "RW":
                properties.width = "22%";
                break;
              case "ZRFJ":
                properties.width = "22%";
                break;
              case "RWNR":
                properties.width = "22%";
                break;
              case "CYJC":
                properties.width = "22%";
                break;
              case "cz":
                properties.width = "6%";
                break;
              case "__ordinalNo":
                properties.width = "48px";
                break;
              default:
                properties.width = "auto";
                break;
            }
            return {
              properties,
              additionalClasses,
              style,
              value,
              sourceValue,
              page,
              last,
              collapsible,
              cz,
              SFXUFK: row.SFFK || row.SFXUFK || row.FK,
              urge,
              wystyle: row.wystyle
            };
          })
        };
      })
    };
    tableData = { thead, tbody, additionalClasses: tableClasses };

    // let z1 = { value:'占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; 占据三列; ', colspan:3, properties:{ id:'custom-cols' }, additionalClasses:[]}
    // tableData.tbody.rows[0].cols.splice(3, 3, z1)
    // let z2 = {value:'占据2列; 占据2列; 占据2列; 占据2列; 占据2列; 占据2列; 占据2列; 占据2列; 占据2列; ', colspan:2, properties:{id:'ttt'}, additionalClasses:[] }
    // tableData.tbody.rows[0].cols.splice(4, 2, z2)

    // console.log('_____________ tabl')
    // console.log( tableData )

    return tableData;
  }
  // 操作
  async poeration(item, index, rows) {
    let res = this.originalTableData[rows];
    this.nodes = await this.getWorkFlowNodes(res.workflowInstanceId);
    // console.log(this.nodes);
    // return;
    let params = {
      batchOperation: false,
      operationType: "CANCELED_WORKFLOW",
      workflowInstanceId: res.workflowInstanceId,
      approval: {
        commonSet: false,
        content: null,
        deleted: false,
        resources: []
      }
    };
    // this.$emit("onloads", "");
    await workflowApi.workflowOperation(params).then((res: any) => {
      if (res.errcode === 0) {
        this.$message.info("操作成功");
        this.$emit("onloads", "");
      } else {
        this.$message.info(res.errmsg);
      }
    });
  }
  async openDet(item, index, rows) {
    let workItemId: string;
    let obj: object;
    let res = this.originalTableData[rows];
    workItemId = await this.existWorkItem(res.workflowInstanceId, res.id);
    console.log(workItemId, 555555555555555);
    this.nodes = await this.getWorkFlowNodes(res.workflowInstanceId);
    if (this.nodes.length > 0) {
      obj = {
        ...this.getNodesParams(this.nodes[0].activityCode),
        workflowInstanceId: res.workflowInstanceId,
        isWorkFlow: true
      };
    }
    let loads: any;
    switch (index) {
      case "1":
        // 发送通知
        loads = await formApi.load(obj);
        this.submit(loads.actionCode, loads.deptId, true, loads.trustor, loads);
        break;
      case "2":
        // 编辑
        break;
      case 3:
        // 催办
        loads = await formApi.load(obj);
        this.submit(
          loads.data.actionCode,
          loads.data.deptId,
          true,
          loads.data.trustor,
          loads.data
        );
        break;
      case "4":
        // 撤销
        break;
      // 查看详情
      case "5":
        break;
    }
  }
  /**
   * 提交、同意、不同意
   * @param deptId
   * @param agree
   */
  async submit(
    actionCode: string,
    deptId: string,
    agree: boolean,
    trustor?: string,
    dataParams?: any
  ) {
    const closeLoader = (this.$message as any).loading();
    console.log(dataParams);
    let data: object = {};
    data.agree = agree;
    data.actionCode = "submit";
    data.depatmentId = deptId;
    data.trustor = trustor;
    data.workItemId = dataParams.workItemId;
    data.workflowInstanceId = dataParams.workflowInstanceId;
    data.workflowCode = dataParams.workflowCode;
    data.bizObject = {
      sheetCode: dataParams.workflowCode,
      schemaCode: dataParams.workflowCode,
      id: dataParams.bizObject.id,
      workflowInstanceId: dataParams.workflowInstanceId
    };
    if (dataParams && dataParams.participantInfos) {
      data.participantInfos = dataParams.participantInfos.map((i: any) => {
        if (typeof i.participantList === "string") {
          i.participantList = i.participantList.split();
        }
        return i;
      });
    }
    // 流程模拟，发起流程时提交处理
    if (this.$route.query.workflowMock && this.$route.query.startWorkflowCode) {
      const startWorkflowCode = `${this.$route.query.startWorkflowCode}-mock`;
      const _preMockData: any = window.sessionStorage.getItem(
        startWorkflowCode
      );
      const mockData = JSON.parse(_preMockData);
      data.simulative = true;
      if (mockData && mockData.originator && mockData.originator.length) {
        data.runMode = mockData.runMode;
        let isAdmin = false;
        if (window.sessionStorage.getItem("user")) {
          // 当前用户为超管的话，在流程模拟时取预设人作为拥有者
          const user: any = JSON.parse(window.sessionStorage.getItem(
            "user"
          ) as string);
          isAdmin = user.permissions.includes("ADMIN");
        }
        if (data.bizObject.data["owner"] && !isAdmin) {
          // 如果表单设置了拥有者，流程模拟时需将部门清空，后台默认取主部门
          data.depatmentId = "";
        } else {
          // 如果表单未设置拥有者，流程模拟时取预设发起人作为拥有者
          data.bizObject.data["owner"] = [
            { id: mockData.originator[0].id, type: 3 }
          ];
        }
      }
    }
    // 1流程表单 2非流程表单
    data.formType = dataParams.workflowCode ? "1" : "2";
    data = FormDetailService.mergeReplayToken(data); // 合并 校验码
    let vm = this;
    try {
      data.bizObject.data = dataParams.bizObject;
      console.log(data, "xxxx");
      data.bizObject.data.version = dataParams.workflowVersion;
      const res: any = await formApi.submit(data, "/api/runtime/form");
      if (res.errcode === 0) {
        this.$message.success("提交成功", 3);
      } else if (res.errcode === 302036) {
        return this.popErr(res);
      }
      return res;
    } finally {
      closeLoader();
    }
  }

  /*
    提交、暂存、驳回、作废 数据已经修改弹窗提示
  */
  popErr(res: any) {
    let vm = this;
    this.$confirm({
      content: res.errmsg + "将重新加载数据",
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk() {},
      onCancel() {
        console.log("Cancel");
      }
    });
    return false;
  }

  async getWorkFlowNodes(val) {
    const workflowInstanceId: string = val;
    const res = await formApi.getWorkFlowNode(workflowInstanceId);
    if (res.errcode === 0 && res.data) {
      return res.data;
    }
    return [];
  }

  getNodesParams(nodes: string) {
    console.log(this.nodes, "asd");
    const theNode = this.nodes.find(res => res.activityCode === nodes);
    let str = "";
    if (theNode) {
      switch (theNode.workItemsType) {
        case WorkItemsType.WorkItem:
          str = "unfinishedWorkitem";
          // str = '/workflow-center/my-unfinished-workitem';
          break;
        case WorkItemsType.WorkItemFinished:
          str = "finishedWorkitem";
          // str = '/workflow-center/my-finished-workitem';
          break;
        case WorkItemsType.CirculateItem:
          str = "unreadWorkitem";
          // str = '/workflow-center/my-unread-workitem';
          break;
        default:
          str = "readWorkitem";
          // str = '/workflow-center/my-read-workitem';
          break;
      }
    }
    if (str && theNode) {
      return {
        return: str,
        workitemId: theNode.id
      };
    }
  }
  existWorkItem(workflowInstanceId: string, ownerId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        formApi.workItemExist(workflowInstanceId, ownerId).then(
          res => {
            if (res.errcode === 0) {
              if (res.errmsg) {
                this.$message.error("提交失败，请到详情页提交", 3);
              }
              resolve(res.data);
            } else {
              resolve();
            }
          },
          res => reject(res)
        );
      }, 1000);
    });
  }
  isJSON(str) {
    if (typeof str === "string") {
      try {
        var obj = JSON.parse(str);
        if (typeof obj === "object" && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  }

  // 给具有排序字段添加状态
  setOnlyFlag(col: any): any {
    // 判断是否为序号，是，则直接返回
    if (col.type === 1000) return col;
    // {...col ,isEdit: false,sub: null }
    this.sortConfigMap.forEach((item: any) => {
      if (col.key === item.propertyCode) {
        this.$set(col, "isEdit", false);
        if (this.isSort) {
          if (item.propertyCode === this.sortCode) {
            this.$set(col, "isEdit", true);
          }
        }
        const subValue = item.direction === null ? 2 : item.direction;
        this.$set(col, "sub", subValue);
        // col.isEdit = false
        // col.sub = item.direction || 2
      }
    });
    return col;
  }

  // 子表数据项加载更多
  loadMore(col: any) {
    col.page += 1;
    col.value = col.sourceValue.slice(0, col.page * this.pageSize);
    col.last = col.value.length >= col.sourceValue.length;
  }

  // @@ 函数
  // 合并列宽度(colspan)
  combineColsWidth(row, col) {
    // return col.properties.width;
    let span = +col.colspan;
    if (isNaN(span) || span <= 1) return col.properties.width;

    // 计算对应的 columns idx
    let colIdx = 0;
    row.cols.some((c, i) => {
      if (c === col) return true;
      colIdx += isNaN(c.colspan) ? 1 : parseInt(c.colspan, 10);
    });

    // 通过下标和span的长度, 获取合并长度
    let columns = this.columns;
    let colWidth = 0;
    let loopIdx = colIdx;
    let loopLen =
      colIdx + span > columns.length ? columns.length : colIdx + span;
    for (; loopIdx < loopLen; loopIdx++) {
      colWidth += +columns[loopIdx].width;
    }
    return colWidth;
  }

  // @@ dom 事件
  // * 列宽自定义
  resizeStart: number = 0;
  resizeMove: number = 0;
  resizeBar: any = null;
  resizeBars: any[] = [];
  resizeBarName: string = "resize-bar";
  resizeMinWidth = 70;
  resizeStartHandler(e) {
    // console.log( e );
    let target = e.target;
    if (target.className !== this.resizeBarName) return;

    // console.log( target, this.resizeBars.length );

    e.preventDefault();
    const isChildSheet = target.getAttribute("data-sheet");
    let resizeBar: any = {};
    if (isChildSheet) {
      const parentIndex = +target.getAttribute("parent-index");
      const parentBar = this.resizeBars[parentIndex];
      if (!parentBar || !parentBar.childColumns) {
        return;
      }
      resizeBar = parentBar.childColumns[+target.getAttribute("data-index")];
      resizeBar.parentIndex = parentIndex;
    } else {
      resizeBar = this.resizeBars[+target.getAttribute("data-index")];
    }

    resizeBar.width = resizeBar.parent.clientWidth;
    // resizeBar.minWidth = (resizeBar.parent.children[0] as any).clientWidth || this.resizeMinWidth;
    resizeBar.parent.classList.add("resizing");

    // console.log( (resizeBar.parent.children[0]).clientWidth, resizeBar.minWidth );

    // 记录
    this.resizeBar = resizeBar;
    this.resizeStart = e.pageX;
  }
  resizeMoveHandler(e) {
    if (!this.resizeBar) return;
    let {
      index,
      column,
      width,
      parent,
      minWidth,
      isLastColumn,
      isChildSheet,
      parentIndex,
      childColumns
    } = this.resizeBar;

    let computedWidth = width - (this.resizeStart - e.pageX);

    // 如果小于最小宽度, 直接滚粗
    if (computedWidth <= minWidth) {
      return;
    }

    // 重置 backupWidth, 否则最后一列的宽度无法设置
    if (isLastColumn) {
      this.resizeBar.backupWidth = 0;
    }

    // console.log('_______ coooo')
    column.width = computedWidth;

    // 子表子数据项处理
    if (isChildSheet) {
      const parentBar = this.resizeBars[parentIndex];
      if (parentBar && parentBar.childColumns) {
        // 拖拽子表子数据项且父级子表为最后一列时重置backupWidth和backupMinWidth
        parentBar.backupWidth = parentBar.isLastColumn
          ? 0
          : parentBar.backupWidth;
        parentBar.backupMinWidth = parentBar.isLastColumn
          ? 0
          : parentBar.backupMinWidth;
        this.computeChildSheetWidth(
          parentIndex,
          parentBar,
          parentBar.childColumns
        );
      }
    }

    this.computeWidth({ isChildSheet, curColumn: column, isLastColumn });
    // this.columns.splice( index, column );
  }
  resizeEndHandler(e) {
    if (!this.resizeBar) return;
    let {
      index,
      width,
      parent,
      column,
      isChildSheet,
      parentIndex
    } = this.resizeBar;
    let finalWidth = parseInt(parent.style.width);

    parent.classList.remove("resizing");

    this.resizeBar.width = column.width;
    this.resizeStart = 0;
    this.resizeBar = null;

    let cIndex = index;
    let parentColumn: any = null;
    if (isChildSheet) {
      parentColumn = this.originalTableColumns[parentIndex];
      if (parentColumn && parentColumn.childColumns) {
        parentColumn.childColumns[cIndex].width = column.width;
      }
    } else {
      // 修改源数据, 否则在不刷新的情况下调整宽度+设置列展示项, 会取之前的宽度
      cIndex = this.tableConfig.rowOrdinal ? index - 1 : index;
      this.originalTableColumns[cIndex].width = column.width;
    }

    // 驱动 vm 做记录
    this.$emit("onResizeEnd", {
      index,
      column,
      width: column.width,
      parentColumn
    });
  }
  // * 初始化列调整尺寸功能
  initColumnsResizing() {
    let theadWrapper: any = this.$el.querySelector(".table-head-wrapper");
    if (!theadWrapper) return console.error("table-head not found!");

    let ths = theadWrapper.querySelectorAll(".table-row-item");

    this.resizeBars = [];
    this.columnsResizing(ths, this.columns, this.resizeBars);
  }
  columnsResizing(
    ths: any,
    or_columns: any,
    resizeBars: any,
    isChildSheet?: boolean,
    parentIndex?: number
  ) {
    let thLen = ths.length;
    [].forEach.call(ths, (th, i) => {
      // 最后一个不开发"手动"宽度调整, 仅程序自动
      // if ( i===thLen-1 ) return;

      // 序号不开放宽度调整
      let column = or_columns[i];
      let isLastColumn = i === thLen - 1;
      let offsetWidth = th.children[0].offsetWidth;
      if (!column || column.id === "__ordinalNo") return;
      let bar = th.querySelector(`.${this.resizeBarName}`);
      if (!bar && (!isChildSheet || !isLastColumn)) {
        bar = document.createElement("b");
        bar.className = this.resizeBarName;
        bar.setAttribute("data-index", String(resizeBars.length));
        // 给子表数据项增加标记及其所属子表index
        if (isChildSheet) {
          bar.setAttribute("data-sheet", isChildSheet);
          bar.setAttribute("parent-index", parentIndex);
        }
        th.appendChild(bar);
      }

      // 最后一行样式有些许不同, 因此这里做个偏移
      let minWidthOffset = isLastColumn ? 5 : 0;
      let minWidth = offsetWidth
        ? offsetWidth + 15 + minWidthOffset
        : this.resizeMinWidth + minWidthOffset;

      // 子表里的数据项作为子表项childColumns
      let childColumns: any = null;

      // 子表处理-重复调用columnsResizing方法。
      if (column.propertyType === DataItemType.Sheet && column.childColumns) {
        childColumns = [];
        column.width = isLastColumn ? column.width + 13 : column.width;
        let cths = th.querySelectorAll(".child-row-item");
        this.columnsResizing(
          cths,
          column.childColumns,
          childColumns,
          true,
          resizeBars.length
        );
        // 子表最小宽由子数据项的宽之和
        const lastChildColumn =
          column.childColumns[column.childColumns.length - 1];
        const lastChildResizebar = childColumns[childColumns.length - 1];
        let exsertedWidth = column.childColumns.reduce(
          (s, c, i) =>
            (s +=
              c === lastChildColumn ? lastChildResizebar.minWidth : +c.width),
          0
        );
        minWidth = isLastColumn ? exsertedWidth + 13 : exsertedWidth;
        let sumWidth = column.childColumns.reduce(
          (s, c, i) => (s += c === lastChildColumn ? 0 : +c.width),
          0
        );
        lastChildColumn.width = isLastColumn
          ? column.width - sumWidth - 13 - 15
          : column.width - sumWidth;
        // console.log('child-sheet-minWidth', minWidth);
      }

      if (minWidth > column.width) column.width = minWidth;

      resizeBars.push({
        index: i,
        element: bar,
        parent: th,
        column,
        // 最后一个需要做特别处理, 所以加个标识
        isLastColumn,
        minWidth,
        // : offsetWidth? offsetWidth+15+minWidthOffset: this.resizeMinWidth+minWidthOffset
        // 子表表头参数标识
        isChildSheet,
        childColumns
      });
    });
  }

  tableScrollHandler(e) {
    // console.log('_)____')
    let el = this.$el;
    let container = this.tableContainerElement;
    let v;
    let h;

    if (!container) return;
    // 纵向
    if (el.scrollTop === 0) {
      v = "v-top";
    } else if (el.scrollTop === el.scrollHeight - el.clientHeight) {
      v = "v-bottom";
    } else {
      v = "v-middle";
    }
    // 横向
    if (el.scrollLeft === 0) {
      h = "h-left";
    } else if (el.scrollLeft === el.scrollWidth - el.clientWidth) {
      h = "h-right";
    } else {
      h = "h-middle";
    }

    //设置数值汇总项在table底部
    if (this.originalNumberData) {
      const numberEl: any = this.$refs.tableNumberItem;
      const rowEl: any = document.querySelectorAll(".table-number-item-row");
      if (el.scrollLeft > 0) {
        //@ts-ignore
        if (
          Number(el.scrollLeft.toFixed()) ===
          el.scrollWidth - el.clientWidth
        ) {
          rowEl.forEach(r => {
            r.style.paddingLeft = "5px";
          });
        } else {
          rowEl.forEach(r => {
            r.style.paddingLeft = "8px";
          });
        }
        numberEl.scrollLeft = el.scrollLeft;
      }
    }
    container.setAttribute("data-v-pos", v);
    container.setAttribute("data-h-pos", h);
  }
  bottom = 0;

  //初始化底部汇总功能位置
  handleSerializeNumberScroll() {
    if (this.originalNumberData) {
      const numberEl: any = this.$refs.tableNumberItem;
      numberEl.scrollLeft = this.$el.scrollLeft;
    }
  }

  // 根据用户自定义子表数据项列宽, 动态调整子表表格的尺寸
  computeChildSheetWidth(
    parentIndex: number,
    childSheet: any,
    childResizeBar: any
  ) {
    if (!childResizeBar.length) return;

    const pIndex = this.tableConfig.rowOrdinal ? parentIndex + 1 : parentIndex;
    let columns = this.columns[pIndex].childColumns;
    let lastColumn = columns[columns.length - 1];
    let lastChildResizebar = childResizeBar[childResizeBar.length - 1];
    let tableClientWidth = childSheet.backupWidth || 0;
    let tableScrollWidth = columns.reduce(
      (s, c, i) => (s += isNaN(c.width) ? this.resizeMinWidth : +c.width),
      0
    );
    let exsertedWidth = tableScrollWidth - tableClientWidth;

    tableScrollWidth = childSheet.isLastColumn
      ? tableScrollWidth + 13 + 5
      : tableScrollWidth;

    // 做拉伸
    if (exsertedWidth === 0) return;
    else {
      let childSheetMinWidth =
        tableScrollWidth - lastColumn.width + lastChildResizebar.minWidth;
      childSheet.minWidth = childSheetMinWidth;
      // console.log('childSheetMinWidth', childSheetMinWidth);
      this.columns[pIndex].width = tableScrollWidth;
    }
  }

  // 根据用户自定义列宽, 动态调整表格/最后一列的尺寸
  tableClientWidth: number = 0;
  tableScrollWidth: string = "100%";
  // shouldComputeWidth:boolean = true;
  computeWidth(obj?: any) {
    if (!this.resizeBars.length) return; // 跟着 columns 变, 但仍然需要等待渲染完毕才能用

    let columns = this.columns;
    let lastColumn = columns[columns.length - 1];
    let lastResizebar = this.resizeBars[this.resizeBars.length - 1];
    let tableClientWidth =
      this.tableClientWidth ||
      (this.tableClientWidth =
        (document.querySelector("#ApplicationList") as any).clientWidth || 0);
    let tableScrollWidth = columns.reduce(
      (s, c, i) =>
        (s += isNaN(c.width)
          ? this.resizeMinWidth
          : // 如果是最后一个, 取备份值来计算
            +((c === lastColumn && lastResizebar.backupWidth) || c.width)),
      0
    );
    let exsertedWidth = tableScrollWidth - tableClientWidth;

    // console.log( 'computeWidth---',tableClientWidth, tableScrollWidth, exsertedWidth, lastResizebar );

    // 记录尾列的原始数据
    if (!lastResizebar.backupWidth) {
      lastResizebar.backupWidth = +lastColumn.width;
    }
    if (!lastResizebar.backupMinWidth) {
      lastResizebar.backupMinWidth = lastResizebar.minWidth;
    }

    // 做拉伸
    if (exsertedWidth === 0) return;
    else if (exsertedWidth > -5) {
      // console.log( 'Width---',lastResizebar.backupWidth,lastResizebar.minWidth, exsertedWidth, lastResizebar.backupMinWidth );
      // this.shouldComputeWidth = false;
      lastColumn.width = lastResizebar.backupWidth;
      // 动态记录最后一列的最小宽度
      lastResizebar.minWidth =
        lastResizebar.minWidth - exsertedWidth > lastResizebar.backupMinWidth
          ? lastResizebar - exsertedWidth
          : lastResizebar.backupMinWidth;
      this.tableScrollWidth = tableScrollWidth + "px";
    } else {
      // this.shouldComputeWidth = false;
      lastColumn.width = lastResizebar.backupWidth - exsertedWidth;
      // 动态记录最后一列的最小宽度
      lastResizebar.minWidth =
        lastColumn.width > lastResizebar.backupMinWidth
          ? lastColumn.width
          : lastResizebar.backupMinWidth;
      this.tableScrollWidth = "100%";
    }

    // 最后一列为子表时动态处理子表的最后一列子数据项列宽(主表数据项才需要调整)
    if (
      obj &&
      !obj.isChildSheet &&
      lastColumn.propertyType === DataItemType.Sheet &&
      lastColumn.childColumns
    ) {
      const lastChildColumn =
        lastColumn.childColumns[lastColumn.childColumns.length - 1];
      let extraWidth = lastColumn.childColumns.reduce(
        (s, c, i) => (s += c === lastChildColumn ? 0 : +c.width),
        0
      );
      // 去除最后一列的padding-right:13px(滚动条预留15px兼容IE)
      lastChildColumn.width = lastColumn.width - extraWidth - 13 - 15;
    }

    // 拖拽非最后一列且为子表时，调整该子表的子数据项最后一列的列宽
    if (
      obj &&
      obj.curColumn &&
      !obj.isLastColumn &&
      obj.curColumn.propertyType === DataItemType.Sheet &&
      obj.curColumn.childColumns
    ) {
      const lastChildColumn =
        obj.curColumn.childColumns[obj.curColumn.childColumns.length - 1];
      let extraWidth = obj.curColumn.childColumns.reduce(
        (s, c, i) => (s += c === lastChildColumn ? 0 : +c.width),
        0
      );
      lastChildColumn.width = obj.curColumn.width - extraWidth;
      // console.log('lastChildColumn-width', lastChildColumn.width);
    }
  }

  tableContainerElement: any;
  initDomEvents() {
    // console.log('--------')
    let tableConfig = this.tableConfig;
    let tableSelector = tableConfig.tableSelector || ".table-container";
    let tableContainer = this.$el.querySelector(tableSelector) as any;
    if (!tableContainer && this.modelType === "LIST")
      return this.$message.error(`找不到表单元素: ${tableSelector}`);

    // 记录为 vm 变量
    this.tableContainerElement = tableContainer;

    // 如果可调节尺寸
    if (tableConfig.columnResizable) {
      let theadSelector = tableConfig.theadSelector || ".table-head-wrapper";
      let theadWrapper = tableContainer.querySelector(theadSelector);
      if (theadWrapper) {
        theadWrapper.removeEventListener("mousedown", this.resizeStartHandler);
        theadWrapper.addEventListener("mousedown", this.resizeStartHandler);
        document.removeEventListener("mousemove", this.resizeMoveHandler);
        document.addEventListener("mousemove", this.resizeMoveHandler);
        document.removeEventListener("mouseup", this.resizeEndHandler);
        document.addEventListener("mouseup", this.resizeEndHandler);
      } else {
        this.$message.error(`找不到表头元素: ${theadSelector}`);
      }
    }

    // 如果有固定的元素, 要监听滚动操作
    if (
      tableConfig.fixedHeader ||
      (Array.isArray(tableConfig.fixedLeftColumns) &&
        tableConfig.fixedLeftColumns.length) ||
      (Array.isArray(tableConfig.fixedRightColumns) &&
        tableConfig.fixedRightColumns.length)
    ) {
      this.$el.removeEventListener("scroll", this.tableScrollHandler);
      this.$el.addEventListener("scroll", this.tableScrollHandler);
    }

    window.onresize = function() {};
    window.addEventListener("resize", e => {
      this.tableClientWidth = this.$el.clientWidth;
      this.computeWidth();
    });

    this.initColumnsResizing();
    this.computeWidth();
    this.tableScrollHandler(null);
  }
  // 颜色修改
  states(row) {
    let class1 = "";
    switch (row) {
      case "草稿":
        class1 = "wks";
        break;
      case "进行中":
        class1 = "jxz";
        break;
      case "已作废":
        class1 = "wks1";
        break;
      case "已逾期":
        class1 = "ycs";
        break;
      case "未完成":
        class1 = "wyc";
        break;
      case "已完成":
        class1 = "ywc";
        break;
      case "已延期":
        class1 = "yyq";
        break;
    }
    return class1;
  }
  // @@ 用户事件
  rowSelection(action: string, row) {
    let rows = this.tableData.tbody.rows;

    if (action === "checkAll") {
      rows.forEach(r => (r.checked = true));
    } else if (action === "cancelAll") {
      rows.forEach(r => (r.checked = false));
    } else if (action === "check") {
      row.checked = !row.checked;
    }

    this.$emit("onCheck", rows.map(r => r.checked));
  }

  // @@ render
  // 如果模板字符串改变, compiled 相关也重置
  templateRender: Function | null = null;
  templateStaticRenderFns: Function | null = null;
  @Watch("templateString", { immediate: true })
  onTemplateStringChange() {
    this.templateRender = null;
    this.templateStaticRenderFns = null;
  }
  // 正常渲染流程
  render(h) {
    const outerVm = this;
    const templateString = outerVm.templateString
      ? outerVm.templateString.trim()
      : listCustomTemplateConverter.template;

    // 优先使用缓存模板
    if (!outerVm.templateRender) {
      let compiled = vueCompiler.compile(templateString);
      if (compiled.errors.length) {
        outerVm.templateParsingError = `Error compiling template:\n\n${templateString}'\n\n${compiled.errors.join(
          "\n"
        )}`;
        return outerVm.errorRender(h);
      }
      outerVm.templateRender = new Function(compiled.render);
      outerVm.templateStaticRenderFns = new Function(compiled.staticRenderFns);
    }

    return outerVm.templateRender(h);
  }
  // 错误渲染流程 (输出错误信息)
  templateParsingError: string = "";
  templateParsingErrorHtml: any;
  errorRender(h) {
    return h(
      "div",
      {
        attrs: { id: "custom-list-container" }
      },
      [
        h(
          "pre",
          { attrs: { id: "custom-list-parsing-error" } },
          this.templateParsingError
        )
      ]
    );
  }
  //获取数值数据项汇总名称
  getsumTypeName(type) {
    let name: string = "";
    switch (type) {
      case 1:
        name = "求和";
        break;
      case 2:
        name = "平均值";
        break;
      case 3:
        name = "最小值";
        break;
      case 4:
        name = "最大值";
        break;
      case 5:
        name = "计数";
        break;
    }
    return name;
  }
  // 格式化数值数据项汇总的值
  getNumberValue(value: any, column: any) {
    let val: any = "--";
    if (value && value.num) {
      if (typeof value.num === "number") {
        if (value.sumType !== 5) {
          val = Helper.numberToDisplay(value.num, column);
        } else {
          //计数不需要做格式化
          val = value.num;
        }
      }
    }
    return val;
  }
}
</script>
