<template>
  <div class="warp">
    <div class="sheet">
      <div class="sheet__row sheet__head">
        <div
          class="center middle sheet__col"
          :class="{
            'shadow-left':
              shadowLeft && freezeColumns && freezeColumns.length === 0,
          }"
        >
          <a-checkbox
            v-if="checkbox"
            @change="checkAll"
            :indeterminate="indeterminate"
            :checked="checkedAll"
          ></a-checkbox>

          <template v-else>{{
            $t("cloudpivot.form.renderer.number")
          }}</template>
        </div>
        <template v-for="(col, colIdx) in freezeColumns">
          <h3-size-slider
            v-if="columnSlots[col.key]"
            class="middle sheet__col"
            :key="col.key"
            :class="[shadowLeft && isLastFreeze(col.key) ? 'shadow-left' : '']"
            :style="getColStyle(col.key)"
            :right="true"
            :maxWidth="855"
            @resize="(e) => onColResize(e, colIdx, col)"
          >
            <slot
              :name="columnSlots[col.key]"
              :column="col"
              :index="colIdx"
            ></slot>
          </h3-size-slider>

          <h3-size-slider
            v-else
            class="middle sheet__col"
            :key="col.key"
            v-show="showColumn(col.key)"
            :class="[
              getControlClass(col.type),
              shadowLeft && isLastFreeze(col.key) ? 'shadow-left' : '',
            ]"
            :style="getColStyle(col.key)"
            :right="true"
            :maxWidth="855"
            @resize="(e) => onColResize(e, colIdx, col)"
          >
            <div :style="getColumnStyle(col)" class="ctrl">
              <template> </template>
              <!-- <span style="color:#F4454E" v-if="getColumnRequired(col)">*</span> -->
              {{ getColumnLabel(col) }}
              <a-tooltip placement="top" v-if="getTips(col)">
                <template slot="title">
                  <span>{{ getTips(col) }}</span>
                </template>
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </div>

            <a-dropdown :trigger="['click']" v-show="canUnFrozen">
              <a class="ant-dropdown-link">
                <a-icon type="down" />
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a
                    href="javascript:;"
                    @click="freezeColumn(col.key, false)"
                    >{{ $t("cloudpivot.form.renderer.unFrozenColumn") }}</a
                  >
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </h3-size-slider>
        </template>

        <div class="sheet__cols" :class="{ noAction: !showAction }">
          <div class="sheet__row">
            <template v-for="(col, colIdx) in unFreezeColumns">
              <h3-size-slider
                v-if="columnSlots[col.key]"
                class="middle sheet__col"
                :key="col.key"
                :class="[isLastUnFreeze(col.key) ? 'last' : '']"
                :style="getColStyle(col.key)"
                :right="true"
                :maxWidth="855"
                @resize="(e) => onColResize(e, colIdx, col)"
              >
                <slot
                  :name="columnSlots[col.key]"
                  :column="col"
                  :index="colIdx"
                ></slot>
              </h3-size-slider>

              <h3-size-slider
                v-if="col.options && col.options.propertyType === 8"
                class="middle sheet__col"
                style="padding: 0"
                :key="col.key"
                v-show="showColumn(col.key)"
                :class="[
                  getControlClass(col.type),
                  isLastUnFreeze(col.key) ? 'last' : '',
                ]"
                :style="getColStyle(col.key)"
                :right="true"
                :maxWidth="855"
                @resize="(e) => onColResize(e, colIdx, col)"
              >
                <div class="child-sheet-wrapper">
                  <div class="child-sheet-title">
                    {{  language ==='en' && zhToEn[getColumnLabel(col)] ? zhToEn[getColumnLabel(col)] : getColumnLabel(col) }}
                    <a-tooltip placement="top" v-if="getTips(col)">
                      <template slot="title">
                        <span>{{ getTips(col) }}</span>
                      </template>
                      <a-icon type="question-circle-o" />
                    </a-tooltip>
                  </div>
                  <div class="child-row" style="padding: 8px">
                    <a-checkbox
                      v-if="isMultiStatus && isMultiStatus()"
                      @change="
                        (val) => {
                          return childCheckAll(val, colIdx);
                        }
                      "
                      :checked="getAllChildChecked(col.key)"
                      @click.stop.native="() => {}"
                    ></a-checkbox>
                    <template
                      v-for="(child, index) in col.options.childColumns"
                    >
                      <!-- :style="{
                          width: child.width + 'px',
                        }" -->
                      <div
                        v-if="child.isShow"
                        :class="{
                          'one-col-style':
                            index === 0 && isMultiStatus && isMultiStatus(),
                          'h3-size-slider__sider_line': index !== 0,
                        }"
                        class="child-row-item"
                        :style="getColSheetStyle(index,child)"
                        :key="index"
                        :title="child.vcTitle"
                      >
                        <label>{{ child.vcTitle }}</label>
                      </div>
                    </template>
                  </div>
                </div>
              </h3-size-slider>

              <h3-size-slider
                v-else
                class="middle sheet__col"
                :key="col.key"
                v-show="showColumn(col.key)"
                :class="[
                  getControlClass(col.type),
                  isLastUnFreeze(col.key) ? 'last' : '',
                ]"
                :style="getColStyle(col.key)"
                :right="true"
                :maxWidth="855"
                @resize="(e) => onColResize(e, colIdx, col)"
              >
                <div :style="getColumnStyle(col)" class="ctrl">
                  <!-- <span style="color:#F4454E"  v-if="getColumnRequired(col)">*</span> -->
                  {{  language ==='en' && zhToEn[getColumnLabel(col)] ? zhToEn[getColumnLabel(col)] : getColumnLabel(col) }}
                  <a-tooltip placement="top" v-if="getTips(col)">
                    <template slot="title">
                      <span>{{ getTips(col) }}</span>
                    </template>
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </div>

                <a-dropdown
                  :trigger="['click']"
                  v-show="canFrozen && sheetIsScroll"
                >
                  <a class="ant-dropdown-link">
                    <a-icon type="down" />
                  </a>
                  <a-menu slot="overlay">
                    <a-menu-item>
                      <a
                        href="javascript:;"
                        @click="freezeColumn(col.key, true)"
                        >{{ $t("cloudpivot.form.renderer.frozenColumn") }}</a
                      >
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </h3-size-slider>
            </template>
          </div>
        </div>

        <div
          v-if="showAction"
          class="center middle sheet__col"
          :class="{ 'shadow-right': shadowRight }"
        >
          {{ $t("cloudpivot.form.renderer.action") }}
        </div>
      </div>

      <div class="sheet__body" :class="{ 'show-total': showTotal }">
        <div
          class="sheet__row"
          v-for="(row, rowIdx) in rows"
          :key="rowIdx"
          :class="{ diffControls: !!row.diff }"
          @click="handleOnClickRows(rowIdx)"
        >
          <checkbox-text
            :readonly="!checkbox && !radio"
            :radio="radio"
            :value="checkeds[rowIdx]"
            @change="check(rowIdx)"
            class="center middle sheet__col"
            :class="{ 'shadow-left': shadowLeft && freezeColumns.length === 0 }"
            >{{ rowIdx + rowNumber + 1 }}</checkbox-text
          >

          <template v-for="(col, colIdx) in getFreezeCells(row)">
            <div
              v-if="rowSlots[col.key]"
              class="center middle sheet__col"
              :key="col.key"
              :style="getColStyle(col.key)"
              :class="{ 'shadow-left': shadowLeft && isLastFreeze(col.key) }"
            >
              <slot
                :name="rowSlots[col.key]"
                :row="row"
                :column="columns[colIdx]"
                :cell="col"
                :rowIndex="rowIdx + rowNumber"
              ></slot>
            </div>

            <div
              v-else
              class="center middle sheet__col"
              :key="col.key"
              v-show="showColumn(col.key)"
              :style="getColStyle(col.key)"
              :class="[
                getControlClass(col.type),
                shadowLeft && isLastFreeze(col.key) ? 'shadow-left' : '',
              ]"
            >
              <a-tooltip
                placement="topLeft"
                v-show="col.controller && col.controller.display"
              >
                <template
                  slot="title"
                  v-if="col.controller && col.controller.hasError"
                >
                  <ul>
                    <li
                      v-for="err in col.controller && col.controller.errors"
                      :key="err"
                    >
                      {{ getErrorMessage(col, err) }}
                    </li>
                  </ul>
                </template>

                <div
                  :class="{
                    error: col.controller && col.controller.hasError,
                    required: col.controller && col.controller.required,
                  }"
                >
                  <base-control-adapter
                    class="cell"
                    :control="col"
                  ></base-control-adapter>
                </div>
              </a-tooltip>
            </div>
          </template>

          <div
            class="sheet__cols"
            :class="{ noAction: !showAction }"
            @keydown.9="onScroll"
            @scroll="onScroll"
          >
            <div class="sheet__row">
              <template v-for="(col, colIdx) in row">
                <template v-if="frozenKeys.indexOf(col.key) === -1">
                  <div
                    :style="getColStyle(col.key)"
                    :key="`${col.key + colIdx}`"
                    :class="[isLastUnFreeze(col.key) ? 'sheet-body-row' : '']"
                    v-if="col.options && col.options.propertyType === 6"
                  >
                    <div :style="getColStyle(col.key)">
                      <a
                        style="padding: 8px; display: block"
                        v-for="(atta, attaIdx) in col.controller._value"
                        :key="attaIdx"
                        :href="atta.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <template v-if="atta.isImage"
                          ><img
                            style="width: 100%"
                            :src="atta.url"
                            :alt="atta.name"
                        /></template>
                        <template v-else>{{ atta.name }}</template>
                      </a>
                    </div>
                  </div>
                  <div
                    v-else-if="rowSlots[col.key]"
                    class="middle sheet__col diffControls"
                    :key="`${col.key + colIdx}`"
                    :class="[isLastUnFreeze(col.key) ? 'last' : '']"
                    :style="getColStyle(col.key)"
                  >
                    <slot
                      :name="rowSlots[col.key]"
                      :row="row"
                      :column="columns[colIdx]"
                      :cell="col"
                      :rowIndex="rowIdx + rowNumber"
                    ></slot>
                  </div>
                  <div
                    :style="getColStyle(col.key)"
                    :key="`${col.key + colIdx}`"
                    :class="[
                      isLastUnFreeze(col.key)
                        ? 'sheet-body-row sheet-row-style-flex'
                        : '',
                    ]"
                    v-else-if="col.options && col.options.propertyType === 8"
                  >
                    <div
                      :style="getColStyle(col.key)"
                      v-if="!col.controller._value"
                    ></div>
                    <div class="flex-div" :style="getColStyle(col.key)">
                      <template
                        v-for="(rowItem, cIdx) in col.controller &&
                        col.controller._value"
                      >
                        <div
                          :key="cIdx"
                          class="child-items-row"
                          v-show="!col.collapsible || cIdx === 0"
                        >
                          <div
                            :key="idx"
                            v-for="(item, idx) in col.options.childColumns"
                            v-if="item.isShow"
                            class="child-items"
                            :style="{
                              minWidth: item.width + 'px',
                              display: 'flex',
                            }"
                          >
                            <div
                              class="checkbox-style"
                              v-if="
                                idx === 0 && isMultiStatus && isMultiStatus()
                              "
                            >
                              <a-checkbox
                                :checked="rowItem.checked"
                                @click.stop.native="() => {}"
                                @change="
                                  (val) => {
                                    return checkboxChange(
                                      val,
                                      rowIdx,
                                      colIdx,
                                      cIdx
                                    );
                                  }
                                "
                              ></a-checkbox>
                            </div>
                            <i
                              @click.prevent.stop="
                                col.collapsible = !col.collapsible
                              "
                              v-if="
                                cIdx === 0 &&
                                idx === 0 &&
                                col.controller._value.length > 1
                              "
                              class="row-collaps icon aufontAll h-icon-all-up-o"
                              :class="{ expanded: !col.collapsible }"
                            ></i>
                            <div
                              v-else-if="
                                cIdx === 0 &&
                                idx === 0 &&
                                col.controller._value.length === 1 &&
                                isMultiStatus &&
                                isMultiStatus()
                              "
                            >
                              <div style="width: 20px"></div>
                            </div>
                            <div
                              :style="{
                                marginLeft:
                                  cIdx !== 0 &&
                                  idx === 0 &&
                                  isMultiStatus &&
                                  isMultiStatus()
                                    ? '20px'
                                    : '',
                              }"
                            >
                              <div
                                v-if="
                                  item.propertyType === DataItemType.Attachment
                                "
                                class="attachment-wrapper"
                              >
                                <a
                                  v-for="(atta, attaIdx) in rowItem[
                                    item.propertyCode
                                  ]"
                                  style="padding: 8px; display: block"
                                  :key="attaIdx"
                                  :href="atta.url"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                >
                                  <template v-if="atta.isImage"
                                    ><img
                                      style="width: 100%"
                                      :src="atta.url"
                                      :alt="atta.name"
                                  /></template>
                                  <template v-else>{{ atta.name }}</template>
                                </a>
                              </div>
                              <div
                                v-else-if="
                                  item.propertyType === DataItemType.LongText &&
                                  typeof rowItem[item.propertyCode] === 'object'
                                "
                                class="child-row-item"
                                :title="rowItem[item.propertyCode]?rowItem[item.propertyCode].text:''"
                                :class="rowItem[item.propertyCode]?rowItem[item.propertyCode].class:''"
                              >
                                {{ rowItem[item.propertyCode]?rowItem[item.propertyCode].text:'' }}
                              </div>
                              <div
                                v-else-if="
                                  typeof rowItem[item.propertyCode] === 'object'
                                "
                                class="child-row-item"
                                :title="rowItem[item.propertyCode.trim()] &&
                                  rowItem[item.propertyCode.trim()].displayCode &&
                                  rowItem[item.propertyCode.trim()][
                                    rowItem[item.propertyCode.trim()].displayCode
                                  ]
                                    ? rowItem[item.propertyCode.trim()][
                                        rowItem[item.propertyCode.trim()].displayCode
                                      ]
                                    : Array.isArray(rowItem[item.propertyCode]) ?  rowItem[item.propertyCode].map(el => el.name).join() : ''
                                "
                                style="max-width: 140px;"
                              >
                                {{
                                  rowItem[item.propertyCode.trim()] &&
                                  rowItem[item.propertyCode.trim()].displayCode &&
                                  rowItem[item.propertyCode.trim()][
                                    rowItem[item.propertyCode.trim()].displayCode
                                  ]
                                    ? rowItem[item.propertyCode.trim()][
                                        rowItem[item.propertyCode.trim()].displayCode
                                      ]
                                    : Array.isArray(rowItem[item.propertyCode]) ?  rowItem[item.propertyCode].map(el => el.name).join() : ""
                                }}
                              </div>
                              <div
                                v-else
                                class="child-row-item"
                              >
                                {{ rowItem[item.propertyCode] }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                    <!-- <div class="child-items-row">
                      <div
                        class="load-more"
                        @click="loadMore(col)"
                        v-if="!col.last"
                      >
                        {{ $t("cloudpivot.list.pc.loadMore") }}
                      </div>
                      <div
                        class="load-complete"
                        v-if="col.last && col.page !== 1"
                      >
                        {{ $t("cloudpivot.list.pc.loadCompleted") }}
                      </div>
                    </div> -->
                  </div>
                  <div
                    v-else
                    class="middle sheet__col"
                    :key="`${col.key + colIdx}`"
                    v-show="showColumn(col.key)"
                    :class="[
                      getControlClass(col.type),
                      isLastUnFreeze(col.key) ? 'last' : '',
                      col.diff ? 'diffControls' : '',
                    ]"
                    :style="getColStyle(col.key)"
                  >
                    <a-tooltip
                      placement="topLeft"
                      v-show="col.controller && col.controller.display"
                    >
                      <template
                        slot="title"
                        v-if="col.controller && col.controller.hasError"
                      >
                        <ul>
                          <li
                            v-for="err in col.controller &&
                            col.controller.errors"
                            :key="err"
                          >
                            {{ getErrorMessage(col, err) }}
                          </li>
                        </ul>
                      </template>

                      <div
                        :class="{
                          error: col.controller && col.controller.hasError,
                          required: col.controller && col.controller.required,
                        }"
                      >
                        <base-control-adapter
                          class="cell"
                          :control="col"
                        ></base-control-adapter>
                      </div>
                    </a-tooltip>
                  </div>
                </template>
              </template>
            </div>
          </div>

          <div
            class="center middle sheet__col"
            v-if="showAction"
            :class="{ 'shadow-right': shadowRight }"
          >
            <slot name="action" :row="row" :index="rowIdx + rowNumber"></slot>
          </div>
        </div>
      </div>

      <div class="sheet__row total" v-if="showTotal && hasStat">
        <div
          class="center middle sheet__col"
          :class="{ 'shadow-left': shadowLeft && freezeColumns.length === 0 }"
        >
          {{ $t("cloudpivot.form.renderer.total") }}
        </div>

        <div
          class="center middle sheet__col"
          v-for="col in freezeColumns"
          :key="col.key"
          v-show="showColumn(col.key)"
          :class="[
            getControlClass(col.type),
            shadowLeft && isLastFreeze(col.key) ? 'shadow-left' : '',
          ]"
          :style="getColStyle(col.key)"
        >
          <template v-if="showStat(col.key)"
            >{{ getStatText(col.key) }}{{ stats[col.key] | number }}</template
          >
        </div>

        <div class="sheet__cols" :class="{ noAction: !showAction }">
          <div class="sheet__row">
            <div
              class="center middle sheet__col"
              v-for="col in unFreezeColumns"
              :key="col.key"
              v-show="showColumn(col.key)"
              :class="[
                getControlClass(col.type),
                isLastUnFreeze(col.key) ? 'last' : '',
              ]"
              :style="getColStyle(col.key)"
            >
              <template v-if="showStat(col.key)"
                >{{ getStatText(col.key)
                }}{{ stats[col.key] | number }}</template
              >
            </div>
          </div>
        </div>

        <div
          v-if="showAction"
          class="center middle sheet__col"
          :class="{ 'shadow-right': shadowRight }"
        ></div>
      </div>
    </div>

    <div class="sheet__row scrollbar">
      <div class="center middle sheet__col"></div>

      <div
        class="center middle sheet__col"
        v-for="col in freezeColumns"
        :key="col.key"
        v-show="showColumn(col.key)"
        :style="getColStyle(col.key)"
        :class="[getControlClass(col.type)]"
      ></div>

      <div class="sheet__cols" @scroll="onScroll"  ref="sheet__cols" @mouseup="mouseup">
        <div class="sheet__row">
          <template v-for="col in unFreezeColumns">
            <div
            v-if="columnSlots[col.key]"
              class="center middle sheet__col"
              :key="col.key"
              :class="[isLastUnFreeze(col.key) ? 'last' : '']"
              :style="getColStyle(col.key)"
            ></div>

            <div
              v-else
              class="center middle sheet__col"
              :key="col.key"
              v-show="showColumn(col.key)"
              :class="[
                getControlClass(col.type),
                isLastUnFreeze(col.key) ? 'last' : '',
              ]"
              :style="getColStyle(col.key)"
            ></div>
          </template>
        </div>
      </div>

      <div v-if="showAction" class="center middle sheet__col"></div>
    </div>
  </div>
</template>

<script lang="ts" src="./sheet.ts"></script>

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

.h3-size-slider__sider_line {
  border-left: 1px #e8e8e8 solid;
  padding-left: 8px;
}

.shadow-left {
  position: relative;

  &::after {
    content: "";
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
    content: "";
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
  border-radius: 4px;

  &__row {
    display: flex;
  }

  &__col {
    width: 46px;
    padding: 8px;
    flex-shrink: 0;
    border-right: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
    transition: width 1ms linear;

    &.attachment {
      justify-content: left;
    }
    & > div {
      /** 防止必填项伪元素“*”无法显示；panwl */
      // overflow: hidden;
    }

    &.two {
      width: 92px;
    }
    &.attachment {
    }
  }

  &__head {
    background-color: #fafafa;
    font-weight: 500;
  }
}

.sheet__cols {
  flex-grow: 1;
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;

  & > .sheet__row {
    height: 100%;

    & > .sheet__col {
      min-width: 60px;
      // overflow: auto;

      // & > div.required:before {
      //   content: '*';
      //   color: #F4454E;
      //   position: absolute;
      //   left: -0.5em;
      // }

      &.dropdown {
        line-height: 0.99;
        & > div {
          width: 100%;
        }
      }
      &.number,
      &.logic {
        &:before {
          content: "";
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
.sheet-row-style-flex {
  display: flex;
  .flex-div {
    -webkit-box-flex: 1;
    flex-grow: 1;
  }
}
.attachment-wrapper,
.sheet-body-row {
  // align-items:center;
  img,
  a {
    max-width: 100%;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    &:not(:first-child) {
      margin-top: 4px;
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
    width: 1px;
  }

  // &:last-child{
  //   /deep/.h3-size-slider__sider-right{
  //     right:-1px;
  //   }
  // }

  & > div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-grow: 1;
    color: rgba(0, 0, 0, 0.65);
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
    width: 1px;
    top: 8px;
    height: 80%;
  }

  .sheet__body .sheet__col > div {
    max-width: 100%;

    /deep/.cell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      p{
        white-space: pre-wrap;
      }
    }
    /deep/.form-staff-warp{
      overflow: auto;
      white-space:inherit;
    }
    /deep/.form-staff{
      max-height: initial;
    }
  }
}

/deep/a.ant-dropdown-link {
  color: @light-color-2;

  &:active {
    color: @light-color-2;
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
  .child-row {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    .one-col-style {
      padding-left: 34px !important;
    }
    .child-row-item {
      // position: relative;
      // float: left;
      // padding: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &:last-child {
        border-right: none;
      }
    }
  }
}
.sheet-body-row {
  -webkit-box-flex: 1;
  flex-grow: 1;
}
/deep/ .file-list .file-item-name {
  max-width: 100% !important;
}
.child-items-row {
  display: flex;
  border-top: 1px solid #e8e8e8;
  flex-wrap: nowrap;
  -webkit-box-pack: justify;
  justify-content: space-between;
  &:first-child {
    border-top: none;
  }
  .child-items {
    padding: 8px;
    &.padding {
      padding-left: 28px;
    }
    .checkbox-style {
      width: 30px;
      // float: left;
    }
    .child-row-item {
      position: relative;
      // white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &.text-disabled {
        color: #ccc;
      }
      // &:hover {
      //   cursor: pointer;
      //   color: #2970ff;
      // }
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
.reverse-relevance-list {
  .sheet__row {
    //overflow-y: hidden;
  }
}
</style>
