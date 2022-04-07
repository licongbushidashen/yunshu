import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
  Popover,
  Divider,
  Button,
  Checkbox,
  Tooltip,
  Icon,
  Dropdown,
  Menu,
} from "@h3/antd-vue";

import { FormControlErrorCodes } from "h3-forms";

import common from "@cloudpivot/common/pc";

import {
  FormSheetColumn,
  FormSheetStatistic,
  SheetStatisticOptions,
  AggregateType,
  FormControlType,
} from "@cloudpivot/form/schema";

import { FormRendererHelper } from "@cloudpivot/form/src/renderer/components/form-renderer-helper";

import BaseControlAdapter from "@cloudpivot/form/src/renderer/components/pc/base-control-adapter.vue";

import CheckboxText from "./checkbox-text.vue";

import numberFilter from "@cloudpivot/form/utils/number-filter";
// import { max } from "moment";

export interface ColumnResize {
  index: number;

  column: FormSheetColumn;

  width: number;
}

@Component({
  name: "sheet",
  components: {
    AIcon: Icon,
    APopover: Popover,
    ADivider: Divider,
    AButton: Button,
    ACheckbox: Checkbox,
    ADropdown: Dropdown,
    ATooltip: Tooltip,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    BaseControlAdapter,
    H3SizeSlider: common.components.H3SizeSlider,
    CheckboxText,
  },
  filters: {
    number: numberFilter,
  },
})
export default class Sheet extends Vue {
  @Prop({
    default: 0,
  })
  rowNumber!: number;

  @Prop({
    default: false,
  })
  checkbox!: boolean;

  @Prop({
    default: false,
  })
  radio!: boolean;

  @Prop({
    default: false,
  })
  showAction!: boolean;

  @Prop({
    default: false,
  })
  showTotal!: boolean;

  @Prop({
    default: () => [],
  })
  columns!: FormSheetColumn[];
  @Prop({
    default: () => [],
  })
  columnOptions!: any[];

  @Prop({
    default: () => [],
  })
  removeList!: any[];

  @Prop({
    default: () => [],
  })
  frozenKeys!: string[];

  @Prop({
    default: () => ({}),
  })
  columnSlots!: { [key: string]: string };

  @Prop({
    default: () => [],
  })
  rows!: any[];

  @Prop({
    default: () => ({}),
  })
  rowSlots!: { [key: string]: string };

  @Prop({
    default: () => [],
  })
  checkeds!: boolean[];

  @Prop({
    default: -1,
  })
  checked!: number;

  @Prop({
    default: () => ({}),
  })
  stats!: { [key: string]: FormSheetStatistic };

  @Inject()
  getScrollEl!: () => HTMLDivElement;

  onScrollFn?: () => void;

  shadowLeft = false;

  shadowRight = false;

  scrollbar: HTMLDivElement | null = null;

  colStyles: any[] = [];

  sheetIsScroll = false; // 表格是否滚动

  get canFrozen() {
    return this.unFreezeColumns.length > 1;
  }

  get canUnFrozen() {
    return this.frozenKeys.length > 0;
  }

  get checkedAll() {
    return this.checkeds.length > 0 && this.checkeds.every((c) => c);
  }

  get indeterminate() {
    const checkeds = this.checkeds.filter((c) => c);
    return checkeds.length > 0 && checkeds.length < this.checkeds.length;
  }

  get hasStat() {
    return Object.keys(this.stats).length > 0;
  }

  get freezeColumns() {
    return this.frozenKeys.map((k) =>
      this.columns.find((col) => col.key === k)
    );
  }

  get unFreezeColumns() {
    return this.columns.filter(
      (col) => this.frozenKeys.indexOf(col.key) === -1
    );
  }

  mounteStartTime: number = 0;

  updateStartTime: number = 0;

  freezeColumn(key: string, freeze: boolean) {
    if (freeze) {
      if (this.frozenKeys.length >= 3) {
        this.$message.error(
          this.$t("cloudpivot.form.renderer.tip.frozenColumnMax") as string
        );
        return;
      }

      let width = 0;
      this.columns
        .map((col, i) =>
          this.frozenKeys.indexOf(col.key) > -1 || col.key === key
            ? this.colStyles[i].width
            : 0
        )
        .forEach((w) => (width += parseInt(w)));

      if (width > 854) {
        this.$message.error(
          this.$t("cloudpivot.form.renderer.tip.frozenColumnWidthMax") as string
        );
        return;
      }
    }

    this.$emit("freezeColumn", key, freeze);

    if (!freeze) {
      setTimeout(() => {
        this.syncScrollLeft();
      }, 100);
    }
  }

  getFreezeCells(row: any[]) {
    return this.frozenKeys.map((k) => row.find((cell) => cell.key === k));
  }

  isLastFreeze(key: string) {
    return this.frozenKeys[this.frozenKeys.length - 1] === key;
  }

  isLastUnFreeze(key: string) {
    const cols = this.unFreezeColumns;
    let visibles = cols.filter(el => el.options.visible)
    return true
    return cols[cols.length - 1].key === key || visibles[visibles.length - 1].key === key;
  }

  showColumn(key: string) {
    const index = this.columns.findIndex((c) => c.key === key);

    if (index < 0) {
      return false;
    }

    const col = this.columns[index];
    if (!col || !col.options.visible) {
      return false;
    }

    if (this.rows.length === 0) {
      return true;
    }

    const allHide = this.rows.every(
      (row) => row[index].controller && !row[index].controller.display
    );
    return !allHide;
  }

  @Watch("columns", {
    immediate: true,
  })
  onColumnsChange() {
    this.initColStyleMap();
    this.$nextTick(() => {
      const el = this.$el.querySelector(
        ".sheet__row:last-child > .sheet__cols"
      ) as HTMLDivElement;

      if (el) {
        this.sheetIsScroll = el.offsetWidth < el.scrollWidth;
      }
    });
  }

  @Watch("rows", {
    immediate: true,
  })
  onRowsChange() {
    this.$nextTick(() => {
      this.syncScrollLeft();
    });
  }

  checkAll(evt: any) {
    const checked = evt.target.checked;
    const checkeds = this.checkeds.map((c) => checked);
    this.$emit("check", checkeds);
    this.$emit("checkAll", checked);
  }

  check(idx: number) {
    const checked = this.checkeds[idx];
    let checkeds = this.checkeds.slice();
    if (this.radio) {
      checkeds = checkeds.map(() => false);
    }
    checkeds[idx] = !checked;
    this.$emit("check", checkeds, idx);
  }

  onScroll(evt: UIEvent) {
    this.syncScroll(evt.target as any);
  }

  syncScrollLeft() {
    if (!this.scrollbar) {
      this.scrollbar = this.$el.querySelector(".scrollbar");
      if (!this.scrollbar) {
        return;
      }
    }

    const el = this.scrollbar.querySelector(".sheet__cols") as HTMLDivElement;
    if (!el) {
      return;
    }
    this.syncScroll(el);
  }

  syncScroll(el: HTMLDivElement) {
    // @ts-ignore
    if(document.activeElement.tagName === 'INPUT'){
      // @ts-ignore
      document.activeElement.blur()
    }

    this.shadowLeft = el.scrollLeft > 0;
    this.shadowRight = el.scrollLeft + el.offsetWidth < el.scrollWidth;
    if (NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (let i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
    }

    const $sheetBody = this.$el.querySelector(".sheet__body");

    if (!$sheetBody) {
      return;
    }
    let _el = this.$el.querySelectorAll(
      ".sheet__cols"
    ) as NodeListOf<HTMLDivElement>;
    for (let dv of _el) {
      if (dv != el) {
        // dv.scrollLeft = el.scrollLeft - (el.scrollWidth - dv.scrollWidth);
        dv.scrollLeft = el.scrollLeft;
      }
    }
    
  }

  getErrorMessage(col: any, errCode: FormControlErrorCodes) {
    return FormRendererHelper.getErrorMessage(col, errCode, this.$i18n.locale);
  }

  getControlClass(type: number) {
    return (FormControlType as any)[type].toLowerCase();
  }

  initColStyleMap() {
    this.colStyles = this.columns.map((col, colIdx) => {
      const last = colIdx === this.columns.length - 1;

      if (last && this.columns.length > 0) {
        const widths = this.columns.map((x) => x.width || 0);

        if (widths.length > 0) {
          const totalWidth = widths.reduce((x, y) => x + y);
          if (totalWidth < 885) {
            return {};
          }
        }
      }

      let width = col.width + "px";

      return {
        width,
      };
    });
  }

  onColResize(evt: { width: number }, colIdx: number, col: FormSheetColumn) {
    const width = evt.width + "px";

    colIdx = this.columns.findIndex((c) => c.key === col.key);

    this.colStyles.splice(colIdx, 1, {
      width,
    });

    this.$emit("columnResize", {
      index: colIdx,
      column: col,
      width: evt.width,
    });

    // this.$forceUpdate();
  }

  getColStyle(key: string) {
    const index = this.columns.findIndex((c) => c.key === key);

    if (index < 0) {
      return {};
    }

    return this.colStyles[index];
  }

  getColumnStyle(col: FormSheetColumn) {
    return col.options.style;
  }

  showStat(columnKey: string) {
    const s = this.stats[columnKey];
    if (!s) {
      return false;
    }
    const val = (s as any).value;
    if (!val && typeof val !== "number") {
      return false;
    }
    return true;
  }

  getStatText(columnKey: string) {
    const s = this.stats[columnKey];
    if (!s) {
      return;
    }
    const opts = s.options as SheetStatisticOptions;
    switch (opts.statisticMode) {
      case AggregateType.Sum:
        return this.$t("cloudpivot.form.renderer.label.sum");
      case AggregateType.Avg:
        return this.$t("cloudpivot.form.renderer.label.avg");
      case AggregateType.Min:
        return this.$t("cloudpivot.form.renderer.label.min");
      case AggregateType.Max:
        return this.$t("cloudpivot.form.renderer.label.max");
    }
  }

  // 求和
  getStats(columnKey: string) {
    const s: any = this.stats[columnKey];
    if (!s) {
      return;
    }

    if (this.rows.length === 0) {
      s.value = "";
      return s;
    }
    let rowsArr: number[] = [];
    this.rows.forEach((d: any) => {
      d.forEach((e: any) => {
        if (e.key === columnKey) {
          rowsArr.push(e.controller.value ? e.controller.value : 0);
        }
      });
    });
    const opts = s.options as SheetStatisticOptions;
    switch (opts.statisticMode) {
      case AggregateType.Sum:
        //因为前端控制了输入最大不会超过八位小数，所以这里可以这样处理求和精度问题
        rowsArr = rowsArr.map((item) => 10 ** 10 * item);
        s.value =
          rowsArr.reduce(function (prev, curr) {
            return prev + curr;
          }) /
          10 ** 10;
        return s;
      case AggregateType.Avg:
        s.value =
          rowsArr.reduce(function (prev, curr) {
            return prev + curr;
          }) / this.rows.length;
        return s;
      case AggregateType.Min:
        s.value = rowsArr.sort((a, b) => a - b)[0];
        return s;
      case AggregateType.Max:
        s.value = rowsArr.sort((a, b) => a - b).reverse()[0];
        return s;
    }
  }

  getColumnLabel(col: FormSheetColumn) {
    const label = col.options.name;
    const locale = this.$i18n.locale;
    const name_i18n = col.options.name_i18n;

    if (locale && name_i18n) {
      const locales =
        typeof name_i18n === "string" ? JSON.parse(name_i18n) : name_i18n;
      if (locales[locale]) {
        return locales[locale];
      }
    }

    return label;
  }
  getColumnRequired(col: FormSheetColumn) {
    let item = this.columnOptions.find((val) => val.key === col.key);
    if (item) {
      return !!item.options.required;
    } else {
      return false;
    }
  }
  getTips(col: FormSheetColumn) {
    const { tips } = col.options;

    return tips;
  }
  handleRootScroll() {
    if (!this.scrollbar) {
      this.scrollbar = this.$el.querySelector(".scrollbar");
      if (!this.scrollbar) {
        return;
      }
    }

    const $sheet = this.$el.querySelector(".sheet") as HTMLDivElement;

    if (!$sheet) {
      return;
    }

    const $sheetBody = $sheet.querySelector(".sheet__body");

    if (!$sheetBody) {
      return;
    }

    const sheetRect = $sheet.getBoundingClientRect() as DOMRect;
    const bodyRect = $sheetBody.getBoundingClientRect() as DOMRect;

    const clientHeight = (document as any).documentElement.clientHeight;

    const over =
      sheetRect.top + sheetRect.height + this.scrollbar.offsetHeight >
      clientHeight;

    if (bodyRect.top < clientHeight && over) {
      this.scrollbar.style.width = $sheet.offsetWidth + "px";
      this.scrollbar.classList.add("stick");
    } else {
      this.scrollbar.classList.remove("stick");
    }
  }

  created() {
    this.mounteStartTime = Date.now();
  }

  mounted() {
    this.$nextTick(() => {
      // console.log('====mounted use time:', Date.now() - this.mounteStartTime);
      this.setMaxHeight();
      const el = this.$el.querySelector(
        ".sheet__row:last-child > .sheet__cols"
      ) as HTMLDivElement;

      if (el) {
        this.shadowRight = el.offsetWidth < el.scrollWidth;
        // this.sheetIsScroll = this.shadowRight;
      }

      this.handleRootScroll();

      this.onScrollFn = () => {
        this.handleRootScroll();
      };

      if (this.getScrollEl) {
        const scrollEl = this.getScrollEl();
        if (scrollEl) {
          scrollEl.addEventListener("scroll", this.onScrollFn);
        }
      }
    });
    window.addEventListener("resize", this.setMaxHeight);
  }

  beforeUpdate() {
    this.updateStartTime = Date.now();
  }

  destroyed() {
    if (this.getScrollEl && this.onScrollFn) {
      const scrollEl = this.getScrollEl();
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", this.onScrollFn);
      }
    }
    window.removeEventListener("resize", this.setMaxHeight);
  }
  sheetBodyStyle: any = {};
  // 设置最大高度,表单内容超过最大高度滚动。
  setMaxHeight() {

    //节流
    let setTimeoutHander = setTimeout(()=>{
      clearTimeout(setTimeoutHander);
      let maxHeight =
        document.body.clientHeight -
        (document.querySelector(".form-detail>.header") as HTMLDivElement)
          .offsetHeight -
        150;
      maxHeight = maxHeight < 100 ? 100 : maxHeight;
      this.sheetBodyStyle = {
        maxHeight: maxHeight + "px",
        overflowY: "auto",
      };
    },500)

  }
}
