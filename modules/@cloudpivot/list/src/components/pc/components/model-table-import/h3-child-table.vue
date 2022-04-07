<template>
  <div class="warp">
    <div :class="{'height-auto': isAuto}" class="sheet">
      <div class="sheet__body">
        <div
          v-for="(row, rowIdx) in showDataSource"
          :key="rowIdx"
          v-drag-row="{callBack: dragRow, index: rowIdx, forbidden: rowDrag}"
          class="sheet__row"
          :style="rowStyle[rowIdx]"
          :class="{active: row[rowKey] === activeKeySync}"
          @click="rowClick(row)"
        >
          <div class="sheet__cols" @keydown.9="onScroll" @scroll="onScroll">
            <!--            isLastUnFreeze(col.key) && 0 === 0 ? 'last-no-action': '',-->
            <!--            isLastUnFreeze(col.key) && 0 > 0 ? 'last-has-action': '',-->
            <div class="sheet__row">
              <template v-for="(col, colIdx) in unFreezeColumns">
                <div
                  :key="`${col.key + colIdx}`"
                  class="middle sheet__col diffControls"
                  :class="[isLastUnFreeze(col.key) ? 'last' : '']"
                  :style="getAssignStyle(col.key)"
                >
                  <slot
                    :name="col.key"
                    :row="row"
                    :column="col"
                    :value="getColValue(col, row)"
                    :index="rowIdx + rowNumber"
                  ></slot>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./h3-child-table.ts"></script>

<style lang="less" scoped>
.warp {
  display: inline-flex;
  position: relative;

  &:hover {
    & > .sheet__row.scrollbar.stick {
      opacity: 0.8;
    }
  }
}
.last {
  flex-grow: 1;
}
/*ie11 css hack*/
@media all and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  .warp.fullsheet {
    margin-right: 8px;
  }
}

.shadow-left {
  position: relative;

  &::after {
    content: '';
    box-shadow: inset 8px 0px 6px -6px rgba(0, 0, 0, 0.15);
    height: 100%;
    width: 8px;
    display: block;
    right: -8px;
    top: 0; // 解决ie11 往下偏移的问题
    position: absolute;
    z-index: 1;
  }
}

.shadow-right {
  position: relative;

  &::before {
    content: '';
    box-shadow: inset -9px 0 6px -6px rgba(0, 0, 0, 0.15);
    height: 100%;
    width: 8px;
    display: block;
    left: -8px;
    top: 0; // 解决ie11 往下偏移的问题
    position: absolute;
    z-index: 1;
  }
}
.sheet.height-auto {
  .sheet__body {
    height: 100%;
    display: flex;
    flex-direction: column;
    & > .sheet__row {
      &:last-child {
        flex-grow: 1;
      }
    }
  }
}
.warp .sheet__body {
  height: 100%;
  display: flex;
  flex-direction: column;
  .sheet__row {
    flex: 1;
  }
}
.sheet {
  border: 1px solid #e8e8e8;
  border-bottom: 0;
  border: 0;
  width: 100%;
  // border-radius: 4px;

  &__row {
    display: flex;
    .subsheet__row {
      height: 100%;
    }

    // &.active {
    //     background-color: @primary-1;
    // }
  }
  .subsheet .last {
    .subsheet__group {
      display: flex;
      .sheet__col {
        &:last-child {
          flex-grow: 1;
        }
      }
    }
  }

  .subsheet {
    // display: flex;
    // flex-direction: column;
    // align-self: baseline;
    // &:after {
    //     content: '';
    //     display: block;
    //     clear: both;
    // }

    padding: 0;
    .subsheet__title {
      padding: 8px;
      border-bottom: 1px solid #e8e8e8;
    }
    .subsheet__group {
      float: left;
      align-self: baseline;

      .sheet__col {
        border-bottom: 0;
      }
      // .last {
      // }
      .last {
        flex-grow: 1;
      }
    }
  }
  &__col {
    width: 46px;
    padding: 8px;
    flex-shrink: 0;
    border-right: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
    transition: all 0.1s linear;

    &.attachment {
      justify-content: left;
      overflow: hidden;
    }
    // & > div {
    /** 防止必填项伪元素“*”无法显示；panwl */
    // overflow: hidden;
    // }
    &.two {
      width: 92px;
    }
    span {
      display: inline-block;
      width: 100%;
    }
  }
  // .last {
  //   .sheet__col {
  //     /*border-right: 0;*/
  //   }
  // }
  &__head {
    background-color: #fafafa;
    font-weight: 500;
    color: rgba(0, 0, 0, .85);

    a {
      color: rgba(0, 0, 0, .85);
    }
  }
}

.sheet__cols {
  flex-grow: 1;
  width: 100%;
  overflow-x: hidden;

  & > .sheet__row {
    height: 100%;

    & > .sheet__col {
      // min-width: 60px;
      // overflow: auto;

      // & > div.required:before {
      //   content: '*';
      //   color: #F4454E;
      //   position: absolute;
      //   left: -0.5em;
      // }

      &.dropdown {
        // line-height: 0.99;
        & > div {
          width: 100%;
        }
      }
      &.number,
      &.logic {
        &:before {
          content: '';
        }
      }

      // &.logic,
      // &.text,
      // &.number,
      // &.dropdown {
      //   min-width: 60px;
      // }

      // &.textarea {
      //   min-width: 300px;
      // }

      &.last {
        flex-grow: 1;
      }
    }
  }
}

.sheet__head .sheet__col {
  border-right-width: 0;

  &.center {
    border-right-width: 1px;
  }

  /deep/.h3-size-slider__sider-right {
    right: 0;
    background: #e8e8e8;
    width: 2px;
  }

  // &:last-child{
  //   /deep/.h3-size-slider__sider-right{
  //     right:-1px;
  //   }
  // }
  color: rgba(0, 0, 0, 0.65);
  & > div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-grow: 1;
  }
}

.sheet__body .sheet__cols .sheet__col {
  overflow: hidden;
}

.sheet__body .sheet__col > div {
  flex-grow: 1;
}

.sheet__cols + .sheet__col,
.noAction .last {
  border-right: none;
}

.sheet__row.scrollbar {
  min-height: 7px;
  margin-bottom: 7px;

  &.stick {
    position: fixed;
    bottom: 2px;
    z-index: 100;
    opacity: 0.4;
    transition: opacity 0.3s ease-out;
  }

  & > .sheet__cols {
    overflow-x: auto;

    & > .sheet__row {
      height: 0;
    }
  }

  .sheet__col {
    min-height: 1px;
    // height: auto;
    // height:1px;
    border: 0;
    margin-right: 1px;
    padding-top: 0;
    padding-bottom: 0;
  }
}

.center {
  display: inline-flex;
  justify-content: center;
}

.middle {
  display: inline-flex;
  align-items: center;
}

.list {
  .sheet {
    border: none;
  }

  .sheet > .sheet__head,
  .sheet__body > .sheet__row {
    border-bottom: 1px solid #e8e8e8;
  }

  .sheet__col {
    border: none;
  }

  .sheet__head /deep/.h3-size-slider__sider {
    background: #e8e8e8;
    width: 0.2em;
    top: 8px;
    height: 22px;
  }

  .sheet__body .sheet__col > div {
    max-width: 100%;

    /deep/.cell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
