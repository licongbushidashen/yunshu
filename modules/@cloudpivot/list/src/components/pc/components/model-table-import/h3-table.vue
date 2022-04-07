  <template>
  <div class="warp">
    <div class="sheet">
      <div ref="sheetHead" class="sheet__row sheet__head">
        <div
          class="center middle sheet__col"
          :style="getTheadFirstStyle()"
          :class="{'shadow-left': shadowLeft && leftColumns.length === 0}"
        >
          <a-checkbox
            v-if="checkbox && allowCheckAll && multiple"
            :indeterminate="indeterminate"
            :checked="allChecked"
            @change="checkAll"
          />

          <template v-else>
            <div>
              {{ $t('designer.panel.no') }}
            </div>
          </template>
        </div>

        <template v-for="(col, colIdx) in leftColumns">
          <h3-size-slider
            :key="col.key"
            class="middle sheet__col"
            :class="{
              'shadow-left': shadowLeft && colIdx === leftColumns.length - 1,
            }"
            :style="Object.assign({}, getColStyle(col.key), getTheadStyle())"
            :right="true"
            :minWidth="68"
            :maxWidth="855"
            :forbidden="true"
            @resize="e => onColResize(e, colIdx, col)"
          >
            <div
              :class="{
                'sheet__col--required': col.required,
              }"
            >
              {{ col.title }}
              <a-tooltip
                v-if="col.tips"
                :title="col.tips"
              >
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </div>
            <a-dropdown v-show="canUnFrozen" :trigger="['click']">
              <a class="ant-dropdown-link">
                <span class="icon aufontAll h-icon-all-more1"></span>
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a href="javascript:;" @click="freezeColumn(col, false)">{{
                    $t('designer.panel.unFrozen')
                  }}</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </h3-size-slider>
        </template>

        <div class="sheet__cols">
          <div class="sheet__row">
            <template v-for="(col, colIdx) in unFreezeColumns">
              <h3-size-slider
                v-if="col.children.length > 0"
                :key="col.key"
                :right="true"
                class="subsheet sheet__col"
                :style="{width: getColStyle(col.key).width + 'px'}"
                :class="[isLastUnFreeze(col.key) ? 'last' : '']"
                :minWidth="getGroupMin(col, col.children)"
                @resize="e => onColResize(e, colIdx, col, null, true)"
              >
                <div class="subsheet__title" :style="getInitTheadStyle">
                  {{ col.title }}
                </div>

                <div
                  :id="col.key"
                  class="subsheet__group"
                  :class="[isLastUnFreeze(col.key) ? 'last' : '']"
                >
                  <template v-for="(childCol, childIdx) in col.children">
                    <h3-size-slider
                      :key="childCol.key"
                      class="middle sheet__col"
                      :class="[
                        isLastChildCell(childCol.key, col.children)
                          ? 'last-child'
                          : '',
                      ]"
                      :style="
                        Object.assign(
                          {},
                          getColStyle(childCol.key, col.key),
                          getInitTheadStyle,
                        )
                      "
                      :right="
                        isLastChildCell(childCol.key, col.children)
                          ? false
                          : true
                      "
                      :forbidden="true"
                      :minWidth="68"
                      :maxWidth="855"
                      @resize="e => onColResize(e, childIdx, childCol, col)"
                    >
                      <slot
                        v-if="childCol.slotTitle"
                        :name="childCol.slotTitle"
                      ></slot>
                      <div v-else>
                        {{ childCol.title }}
                        <a-tooltip
                          v-if="childCol.tips"
                          :title="childCol.tips"
                        >
                          <a-icon type="question-circle-o" />
                        </a-tooltip>
                      </div>
                    </h3-size-slider>
                  </template>
                </div>
              </h3-size-slider>

              <h3-size-slider
                v-else
                :key="col.key"
                class="middle sheet__col"
                :class="{
                  last: isLastUnFreeze(col.key),
                }"
                :style="
                  Object.assign({}, getColStyle(col.key), getTheadStyle())
                "
                :right="true"
                :minWidth="68"
                :maxWidth="855"
                :forbidden="true"
                @resize="e => onColResize(e, colIdx, col)"
              >
                <slot v-if="col.slotTitle" :name="col.slotTitle"></slot>
                <div
                  v-else
                  :class="{
                    'sheet__col--required': col.required,
                  }"
                >
                  {{ col.title }}
                  <a-tooltip
                    v-if="col.tips"
                    :title="col.tips"
                    :overlayStyle="getOverlayStyle(col.tips)"
                  >
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </div>
                <a-dropdown v-show="canFrozen" :trigger="['click']">
                  <a class="ant-dropdown-link">
                    <span class="icon aufontAll h-icon-all-more1"></span>
                  </a>
                  <a-menu slot="overlay">
                    <a-menu-item>
                      <a href="javascript:;" @click="freezeColumn(col, true)">{{
                        $t('designer.panel.frozen')
                      }}</a>
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
                <!-- 包含字表的列表不能有排序功能 -->
                <!-- 临时注释,待后台开发接口在开放 -->
                <!-- <div class="column-order"
                  v-show="col.order && !col.children.length">
                  <a-icon type="caret-up" @click="columnOrder('ascend')"
                    title="排序" />
                  <a-icon type="caret-down" @click="columnOrder('descend')"
                    title="排序" />
                </div> -->
              </h3-size-slider>
            </template>
          </div>
        </div>

        <template v-for="(col, colIdx) in rightColumns">
          <h3-size-slider
            :key="col.key"
            class="middle sheet__col"
            :class="{
              'shadow-right': shadowRight && colIdx === 0,
            }"
            :style="Object.assign({}, getColStyle(col.key), getInitTheadStyle)"
            :right="true"
            :minWidth="68"
            :maxWidth="855"
            :forbidden="true"
            @resize="e => onColResize(e, colIdx, col)"
          >
            <div
              :class="{
                'sheet__col--required': col.required,
              }"
            >
              {{ col.title }}
              <a-tooltip
                v-if="col.tips"
                :title="col.tips"
              >
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </div>

            <a-dropdown v-show="canUnFrozen" :trigger="['click']">
              <a class="ant-dropdown-link">
                <span class="icon aufontAll h-icon-all-more1"></span>
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a href="javascript:;" @click="freezeColumn(col, false)">{{
                    $t('designer.panel.unFrozen')
                  }}</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </h3-size-slider>
        </template>
        <!-- :style="Object.assign(getTheadStyle(), {'width': `${60 * actions.length}px`})" -->
        <!-- :class="{ 'shadow-right': shadowRight && rightColumns.length === 0 }" formType-->
        <!--          子表操作列固定-->
        <div
          v-if="formType === 'FormSheet' && formSheetColPer"
          style="width: 52px"
          :class="{'shadow-right': shadowRight && rightColumns.length === 0}"
          class="center middle sheet__col form-sheet-action-header action-column-right"
        >
          <template>
            <div class="action-column form-sheet-action-column">
              操作
            </div>
          </template>
        </div>
        <!--          列表动态配置-->
        <div
          v-if="(!formType || formType === 'FormSheet') && actions.length > 0"
          class="center middle sheet__col action-column-right form-sheet-action-header"
          :style="Object.assign({}, getTheadStyle(), getActionsStyle(actions))"
          :class="{'shadow-right': shadowRight && rightColumns.length === 0}"
        >
          <template>
            <div class="action-column">
              操作列
            </div>
          </template>
        </div>
      </div>

      <div class="sheet__body" :style="getTbodyScrollConfig()">
        <div
          v-for="(row, rowIdx) in showDataSource"
          :key="rowIdx"
          v-drag-row="{
            callBack: dragRow,
            index: rowIdx,
            forbidden: forbiddenRow || rowDrag,
          }"
          class="sheet__row"
          :style="rowStyle[rowIdx]"
          :class="[
            {active: row[rowKey] === activeKeySync},
            {'cursor-pointer': hasRowClickEvents},
          ]"
          @click="rowClick(row, rowIdx, $event)"
          @dblclick="rowDblClick(row, rowIdx, $event)"
          @mouseenter="rowMouseEnter(row, rowIdx, $event)"
          @mouseleave="rowMouseLeave(row, rowIdx, $event)"
        >
          <checkbox-text
            :readonly="!checkbox && !radio"
            :radio="radio"
            :value="selectedRowKeysSync.indexOf(row[rowKey]) > -1"
            :style="Object.assign({}, getTbodyStyle())"
            class="center middle sheet__col"
            :class="{'shadow-left': shadowLeft && leftColumns.length === 0}"
            @change="check(row[rowKey])"
          >
            {{ rowIdx + rowNumber + 1 }}
          </checkbox-text>

          <template v-for="(col, colIdx) in leftColumns">
            <div
              :key="`${col.key + rowIdx}`"
              class="center middle sheet__col"
              :style="Object.assign({}, getColStyle(col.key), getTbodyStyle())"
              :class="{
                'shadow-left': shadowLeft && colIdx === leftColumns.length - 1,
              }"
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

          <div class="sheet__cols" @keydown.9="onScroll" @scroll="onScroll">
            <div class="sheet__row">
              <template v-for="(col, colIdx) in unFreezeColumns">
                <!--二级表头-->
                <template v-if="col.children.length > 0">
                  <slot
                    :name="col.key"
                    :row="row"
                    :column="col"
                    :value="getColValue(col, row)"
                    :colStylesObj="colStylesObj"
                    :tbodyStyle="tbodyStyle"
                    :index="rowIdx + rowNumber"
                  ></slot>
                </template>

                <div
                  v-else
                  :key="`${col.key + colIdx}`"
                  class="middle sheet__col diffControls test"
                  :class="[
                    isLastUnFreeze(col.key) ? 'last' : '',
                    isLastUnFreeze(col.key) &&
                      actions.length === 0 &&
                      formType !== 'FormSheet'
                      ? 'last-no-action'
                      : '',
                    isLastUnFreeze(col.key) &&
                      actions.length > 0 &&
                      formType !== 'FormSheet'
                      ? 'last-has-action'
                      : '',
                    isAttentFile(col, row) ? 'file-upload' : '',
                  ]"
                  :style="
                    Object.assign({}, getColStyle(col.key), getTbodyStyle())
                  "
                >
                  <slot
                    :name="col.key"
                    :row="row"
                    :column="col"
                    :value="getColValue(col, row)"
                    :index="rowIdx + rowNumber"
                  >
                  </slot>
                </div>
              </template>
            </div>
          </div>

          <div
            v-for="(col, colIdx) in rightColumns"
            :key="`${col.key + rowIdx}`"
            class="center middle sheet__col action-column-right"
            :style="Object.assign({}, getColStyle(col.key), getTbodyStyle())"
            :class="{'shadow-right': shadowRight && colIdx === 0}"
          >
            <slot
              :name="col.key"
              :value="getColValue(col, row)"
              :row="row"
              :index="rowIdx + rowNumber"
              :column="col"
            ></slot>
          </div>
          <!-- :style="Object.assign({},getTheadStyle(), )" -->
          <div
            v-if="formType === 'FormSheet' && formSheetColPer"
            style="width: 52px;"
            :class="{
              'shadow-right': shadowRight && rightColumns.length === 0,
            }"
            class="center sheet__col btn-list form-sheet-action-box action-column-right"
          >
            <a-dropdown :trigger="['click']" :placement="bottomLeft">
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <i class="aufontAll h-icon-all-ellipsis-o"></i>
              </a>
              <a-menu
                slot="overlay"
                @click="e => handleMenuClick(e, row, rowIdx)"
              >
                <a-menu-item key="copy">
                  复制行
                </a-menu-item>
                <a-menu-item key="delete">
                  删除行
                </a-menu-item>
                <a-menu-item key="empty">
                  清空行
                </a-menu-item>
                <a-menu-item key="unshift">
                  在上面添加行
                </a-menu-item>
                <a-menu-item key="append">
                  在下面添加行
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>

          <div
            v-if="(!formType || formType === 'FormSheet') && actions.length > 0"
            :style="
              Object.assign({}, getTbodyStyle(), getActionsStyle(actions))
            "
            class="center middle sheet__col btn-list action-column-right form-sheet-action-box"
            :class="{
              'shadow-right': shadowRight && rightColumns.length === 0,
            }"
          >
            <div class="btn-list-box">
              <a
                v-for="item in actions"
                :key="item.key"
                href="javascript:;"
                @click.stop="
                  e => handleMenuClick({key: item.value}, row, rowIdx)
                "
              >{{ item.value }}</a>
            </div>
          </div>

          <!-- 在抽屉编辑按钮 -->
          <div
            v-if="formType === 'FormSheet' && editInDrawer"
            class="h3-table-editindrawer"
            @click.stop="
              e => handleMenuClick({key: 'editInDrawer'}, row, rowIdx)
            "
          >
            <span class="icon aufontAll h-icon-all-entend-o"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="sheet__row scrollbar">
      <div class="center middle sheet__col"></div>

      <div
        v-for="col in leftColumns"
        :key="col.key"
        class="center middle sheet__col"
        :style="getColStyle(col.key)"
      ></div>

      <div class="sheet__cols" @scroll="onScroll">
        <div class="sheet__row">
          <template v-for="col in unFreezeColumns">
            <div
              v-if="col.children.length > 0"
              :key="col.key"
              style="display: inline-flex"
            >
              <div
                v-for="(childCol, childIdx) in col.children"
                :key="`${childCol.key + childIdx}`"
                class="middle sheet__col diffControls"
                :class="[isLastUnFreeze(col.key) ? 'last' : '']"
                :style="getColStyle(childCol.key, col.key)"
              ></div>
            </div>

            <div
              v-else
              :key="col.key"
              class="center middle sheet__col"
              :class="[isLastUnFreeze(col.key) ? 'last' : '']"
              :style="getColStyle(col.key)"
            ></div>
          </template>
        </div>
      </div>

      <div
        v-for="col in rightColumns"
        :key="col.key"
        class="center middle sheet__col"
        :style="getColStyle(col.key)"
      ></div>

      <div
        v-if="actions.length > 0"
        :style="getActionsStyle(actions)"
        class="center middle sheet__col"
      ></div>

      <div
        v-if="formType === 'FormSheet' && formSheetColPer"
        style="width: 52px;"
        class="center middle sheet__col"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" src="./h3-table.ts"></script>

<style lang="less" scoped>
.warp {
  position: relative;

  &:hover {
    & > .sheet__row.scrollbar.stick {
      opacity: 0.8;
    }
  }
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

.sheet {
  border: 1px solid #e8e8e8;
  border-bottom: 0;
  // border-radius: 4px;

  &__row {
    display: flex;
    position: relative;
    .subsheet__row {
      height: 100%;
    }

    // &.active {
    //     background-color: @primary-1;
    // }
  }
  .subsheet .last {
    .subsheet__group {
      width: 100%;
      display: flex;
      .sheet__col {
        &:last-child {
          flex-grow: 1;
          width: 150px;
        }
      }
    }
  }
  /*填补子表表头最后一列宽度为默认*/
  /*.subsheet__group {*/
  /*  .sheet__col {*/
  /*    &:last-child {*/
  /*      width: 150px;*/
  /*    }*/
  /*  }*/
  /*}*/
  .subsheet {
    position: relative;

    padding: 0;
    .subsheet__title {
      padding: 8px;
      border-bottom: 1px solid #e8e8e8;
      border-right: 1px solid #e8e8e8;
    }

    .subsheet__group {
      display: flex;
      flex-grow: 1;
      /*float: left;*/
      /*align-self: baseline;*/
      .sheet__col {
        border-bottom: 0;
      }
      .last-child {
        flex-grow: 1;
        border-right: 0;
      }
    }
  }
  .last {
    .subsheet__title {
      border-right: 0;
    }
  }
  &__col {
    width: 46px;
    padding: 8px;
    flex-shrink: 0;
    border-right: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
    transition: all 0.1s linear;

    &--required {
      &:before {
        content: '*';
        color: red;
        font-size: 12px;
      }
    }

    &.btn-list {
      .btn-list-box {
        text-align: center;
        > a {
          position: relative;
          display: inline-block;
          margin-right: 24px;
          &::after {
            position: absolute;
            content: '';
            left: -12px;
            top: 50%;
            width: 1px;
            height: 12px;
            transform: translateY(-50%);
            background-color: rgba(0, 0, 0, 0.15);
          }
        }
        a:nth-child(1):after {
          display: none;
        }
      }
    }

    & > span {
      word-break: break-all;
      display: block;
      width: 100%;
    }

    &.attachment {
      justify-content: left;
      overflow: hidden;
    }
    & > div {
      /** 防止必填项伪元素“*”无法显示；panwl */
      // overflow: hidden;
    }
    &.two {
      width: 92px;
    }
    span {
      display: inline-block;
      width: 100%;
    }
  }
  .last {
    /*border-right: 0;*/
  }
  .last-no-action {
    border-right: 0;
  }
  .last-has-action {
    border-right: 1px solid #e8e8e8;
  }
  &__head {
    background-color: #fafafa;
    font-weight: 500;
    color: rgba(0, 0, 0, .85);;

    a {
      color: rgba(0, 0, 0, .85);;
    }

    .form-sheet-action-column {
      color: rgba(0, 0, 0, 0.85);
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
      & > span {
        word-break: break-all;
      }
      // min-width: 60px;
      // overflow: auto;

      // & > div.required:before {
      //   content: '*';
      //   color: #f4454e;
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
  .column-order {
    position: relative;
    display: flex;
    flex-direction: column;
    .anticon-caret-up {
      cursor: pointer;
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
    }
    .anticon-caret-down {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
      cursor: pointer;
    }
  }
  &.center {
    border-right-width: 1px;
  }

  /deep/.h3-size-slider__sider-right {
    right: 0;
    background: #e8e8e8;
    width: 1px;
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
    font-weight: 600;
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
  /*border-right: none;*/
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
.form-sheet-action {
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  font-size: 16px;
}
/deep/.form-sheet-action-box .ant-dropdown-link {
  color: rgba(0, 0, 0, 0.85);
  display: inline-block;
  width: 100%;
  text-align: center;
  &:active {
    color: #5291ff;
  }
  &:hover {
    color: #5291ff;
  }
  &:visited {
    color: #5291ff;
  }
}
.file-upload > div {
  width: 100%;
  /deep/ .ant-upload-picture-card-wrapper {
    /*text-align: center;*/
  }
}
.sheet__head {
  .action-column-right {
    overflow-x: unset !important;
  }
}
.sheet__body {
  .action-column-right {
    overflow-x: unset !important;
  }
}
.form-sheet-action-header,
.form-sheet-action-box {
  border-right: 0;
}
.cursor-pointer {
  cursor: pointer;
}

// h3-table-editindrawer
.h3-table-editindrawer {
  display: none;
  position: absolute;
  left: 32px;
  font-size: 14px;
  top: 50%;
  margin-top: -12px;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #fff;
  color: #000;
  border-radius: 50%;
  box-shadow: 0px 2px 8px 0px rgba(0, 49, 199, 0.15);
  z-index: 99;
  cursor: pointer;
  &:hover {
    color: #2970ff;
  }
}
.sheet__row {
  &:hover {
    .h3-table-editindrawer {
      display: block;
    }
  }
}
</style>
