import {
  Component,
  Vue,
  Prop,
  Watch,
  // Inject,
  PropSync,
} from 'vue-property-decorator';

import {
  Popover,
  Divider,
  Button,
  Checkbox,
  Tooltip,
  Icon,
  Dropdown,
  Menu,
} from '@h3/antd-vue';

// @ts-ignore
import CheckboxText from './checkbox-text.vue';

import H3ChildTable from './h3-child-table.vue';

// import components from '@cloudpivot-shared/ui-designer-widgets/components';
// import { register } from '@cloudpivot-shared/ui-designer-common';
import H3SizeSlider from "@cloudpivot/common/src/components/pc/size-slider.vue";

@Component({
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
    CheckboxText,
    H3SizeSlider: H3SizeSlider,
    H3ChildTable,
  },
})
export default class H3Table extends Vue {
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
  rowDrag!: boolean;

  @Prop({
    default: () => [],
  })
  columns!: any[];

  @Prop({
    default: () => [],
  })
  actions!: any[];

  @Prop({
    default: 'id',
  })
  rowKey!: string;

  @Prop({
    default: () => ({}),
  })
  theadStyle!: any;

  @Prop({
    default: () => ({}),
  })
  tbodyStyle!: any;

  @Prop({
    default: true,
  })
  allowCheckAll!: boolean;

  @Prop({
    default: true,
  })
  multiple!: boolean;

  @Prop({
    default: false,
  })
  editInDrawer!: boolean;

  @PropSync('activeKey', {
    default: '',
  })
  activeKeySync!: string;

  @Prop({
    default: () => [],
  })
  dataSource!: any[];

  @PropSync('selectedRowKeys', {
    default: () => [],
  })
  selectedRowKeysSync!: string[];

  @Prop({
    default: true,
  })
  frozen!: boolean;

  @Prop()
  getColValue!: Function;

  @Prop()
  formType!: any;

  @Prop()
  hasRowClickEvents!: any;

  @Prop()
  formSheetColPer!: any;

  onScrollFn?: () => void;

  shadowLeft = false;

  shadowRight = false;

  scrollbar: HTMLDivElement | null = null;

  leftColumns: any[] = [];

  rightColumns: any[] = [];

  unFreezeColumns: any[] = [];

  colStyles: any[] = [];

  colStylesObj: any = [];

  sheetIsScroll = false; // 表格是否滚动

  bottomLeft: string = 'bottomLeft'; // 表格是否滚动

  freezeWidth: number = 0;

  get frozenKeys () {
    return this.columns.filter(c => c.fixed).map(c => c.key);
  }

  get canFrozen () {
    return this.unFreezeColumns.length > 1;
  }

  get canUnFrozen () {
    return this.frozenKeys.length > 0;
  }

  get allChecked () {
    if (this.dataSource.length > 0) {
      return this.dataSource.every(x =>
        this.selectedRowKeysSync.includes(x[this.rowKey]),
      );
    }
    return false;
  }

  get indeterminate () {
    return this.selectedRowKeysSync.length > 0 && !this.allChecked;
  }

  getOverlayStyle (tips:string) {
    let maxWidth = '';
    if (tips.length >= 300) {
      maxWidth = '480px';
    }
    return {
      maxWidth,
      maxHeight: '178px',
      overflowY: tips.length > 160 ? 'scroll' : '',
    };
  }

  freezeColumn (column: any, freeze: boolean) {
    if (freeze) {
      this.freezeWidth = 0;
      let listKey: any = [];
      // 表头宽度
      const headerWidth: any = (this.$refs.sheetHead as Element).clientWidth;
      const freezeTotal: any = [...this.leftColumns, column]; // 已冻结 加 即将冻结
      listKey = freezeTotal.map((item: any) => {
        return item.key;
      });
      const leftWidth: any = [];
      if (listKey.length > 0) {
        this.colStylesObj.forEach((item: any) => {
          if (listKey.includes(item.key)) {
            leftWidth.push(item);
          }
        });
        leftWidth.forEach((item: any) => {
          this.freezeWidth += parseInt(item.width);
        });
        if (this.freezeWidth / headerWidth > 0.8) {
          this.$message.error('超过最大宽度 不可冻结');
          return false;
        }
      }
      let width = 0;
      this.columns
        .map((col, i) =>
          this.frozenKeys.indexOf(col.key) > -1 || col.key === column.key
            ? this.colStyles[i].width
            : 0,
        )
        .forEach(w => (width += parseInt(w)));
    }

    column.fixed = freeze ? 'left' : 'normal';

    this.refreshFreezeColumns();
    // this.$emit('freezeColumn', key, freeze);

    if (!freeze) {
      setTimeout(() => {
        this.syncScrollLeft();
      }, 100);
    }
  }

  getFreezeCells (row: any[]) {
    return this.frozenKeys.map((k: string) => row.find(cell => cell.key === k));
  }

  isLastFreeze (key: string) {
    return this.frozenKeys[this.frozenKeys.length - 1] === key;
  }

  isLastUnFreeze (key: string) {
    const cols = this.unFreezeColumns;
    return cols[cols.length - 1].key === key;
  }

  isLastChildCell (key: string, cols: any) {
    return cols[cols.length - 1].key === key;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isAttentFile (col: any, row: any) {
    if (col.componentType === 'Upload') {
      return true;
    }
  }

  refreshFreezeColumns () {
    this.leftColumns = this.columns.filter(c => c.fixed === 'left');
    this.rightColumns = this.columns.filter(c => c.fixed === 'right');
    this.unFreezeColumns = this.columns.filter(
      c => c.fixed === 'normal' || !c.fixed,
    );
    // console.log(this.columns, 'this.columns');
  }

  @Watch('columns', {
    immediate: true,
  })
  onColumnsChange () {
    this.refreshFreezeColumns();

    this.initColStyleMap();

    this.$nextTick(() => {
      if (this.$el.querySelector) {
        const el = this.$el.querySelector(
          '.sheet__row:last-child > .sheet__cols',
        ) as HTMLDivElement;

        if (el) {
          this.sheetIsScroll = el.offsetWidth < el.scrollWidth;
        }
      }
    });
  }

  rowStyle: any[] = [];

  showDataSource: any = [];

  get forbiddenRow () {
    const idx = this.columns.findIndex(
      res => res.children && res.children.length > 0,
    );
    return idx > -1;
  }

  dragRow (index: number, height: number) {
    const idx = this.columns.findIndex(
      res => res.children && res.children.length > 0,
    );
    if (idx > -1) {
      return;
    }
    this.rowStyle[index].height = height + 'px';
    this.rowStyle = [...this.rowStyle];
  }

  @Watch('dataSource', {
    immediate: true,
  })
  onDataSourceChange () {
    this.showDataSource = this.dataSource;
    if (this.dataSource.length > 0) {
      this.dataSource.forEach((res, index) => {
        const idx = this.columns.findIndex(
          _res => _res.children && _res.children.length > 0,
        );
        this.rowStyle[index] = {
          height:
            this.tbodyStyle.height && idx === -1
              ? this.tbodyStyle.height
              : 'auto',
        };
      });
    }
    this.$nextTick(() => {
      this.syncScrollLeft();
    });
  }

  checkAll () {
    if (this.allChecked) {
      this.selectedRowKeysSync = [];
    } else {
      this.selectedRowKeysSync = this.dataSource
        .map(x => x[this.rowKey])
        .filter(id => !!id);
    }
  }

  check (key?: string) {
    if (!key) {
      return;
    }

    let copy = this.selectedRowKeysSync.slice();
    const index = this.selectedRowKeysSync.indexOf(key);

    if (index > -1) {
      copy.splice(index, 1);
    } else {
      if (!this.multiple) {
        copy = [];
        copy.push(key);
      } else {
        copy.push(key);
      }
    }

    this.selectedRowKeysSync = copy;
  }

  // 行单击事件
  rowClick (row: any, index: number, event: MouseEvent) {
    this.$emit('rowClick', row, index, event);
  }

  // 行双击事件
  rowDblClick (row: any, index: number, event: MouseEvent) {
    this.$emit('rowDblClick', row, index, event);
  }

  // 鼠标移入行
  rowMouseEnter (row: any, index: number, event: MouseEvent) {
    this.$emit('rowMouseEnter', row, index, event);
  }

  // 鼠标移出行
  rowMouseLeave (row: any, index: number, event: MouseEvent) {
    this.$emit('rowMouseLeave', row, index, event);
  }

  onScroll (evt: UIEvent) {
    this.syncScroll(evt.target as any);
  }

  syncScrollLeft () {
    if (this.$el.querySelector) {
      if (!this.scrollbar) {
        this.scrollbar = this.$el.querySelector('.scrollbar');
        if (!this.scrollbar) {
          return;
        }
      }

      const el = this.scrollbar.querySelector('.sheet__cols') as HTMLDivElement;
      if (!el) {
        return;
      }
      this.syncScroll(el);
    }
  }

  syncScroll (el: HTMLDivElement) {
    this.shadowLeft = el.scrollLeft > 0;
    this.shadowRight = el.scrollLeft + el.offsetWidth < el.scrollWidth;
    if (NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function (callback, _thisArg) {
        const thisArg = _thisArg || window;
        for (let i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
    }

    const $sheetBody = this.$el.querySelector('.sheet__body');

    if (!$sheetBody) {
      return;
    }
    // eslint-disable-next-line no-undef
    const _el = this.$el.querySelectorAll('.sheet__cols') as NodeListOf<
      HTMLDivElement
    >;
    for (const dv of _el) {
      if (dv !== el) {
        // dv.scrollLeft = el.scrollLeft - (el.scrollWidth - dv.scrollWidth);
        dv.scrollLeft = el.scrollLeft;
      }
    }
  }

  normalStyle: any = [];

  fixedStyle: any = [];

  initColStyleFn (pre: string, columns: any) {
    const norMalCols: any = columns.filter(
      (col: any) => col.fixed === 'normal' || !col.fixed,
    );
    const fixedCols: any = columns.filter((col: any) => col.fixed !== 'normal');
    norMalCols.forEach((col: any, colIdx: number) => {
      const last = colIdx === norMalCols.length - 1;
      const key = pre ? `${pre}.${col.key}` : `${col.key}`;
      const width = col.width + 'px';
      if (col.children && col.children.length > 0) {
        const w = col.children.map((x: any) => x.width || 0);
        const totalW = w.reduce((x: any, y: any) => x + y);
        this.normalStyle.push({
          width: totalW,
          key,
        });

        this.initColStyleFn(key, col.children);
      }
      if (last && norMalCols.length > 0) {
        // const widths = normalStyle.map((x:any) => {
        const widths = this.colStylesObj.map((x: any) => {
          if (x.key.indexOf('.') > -1) {
            return 150;
          } else {
            return parseInt(x.width);
          }
        });

        if (widths.length > 0) {
          const totalWidth = widths.reduce((x: any, y: any) => x + y);

          if (totalWidth < 885) {
            const obj = {
              key,
            };
            this.normalStyle.push(obj);
            return;
          }
        }
      }
      this.normalStyle.push({
        width,
        textAlign: col.align,
        key,
      });
    });
    fixedCols.forEach((col: any) => {
      const key = pre ? `${pre}.${col.key}` : `${col.key}`;
      const width = col.width + 'px';
      this.fixedStyle.push({
        width,
        textAlign: col.align,
        key,
      });
    });

    // 读取本地的样式
    // const table: any = register.store.getParent(columns[0].node.id);
    const table: any = columns[0];
    const styles: any = window.localStorage.getItem('tableStyles');
    if (styles) {
      const style: any = JSON.parse(styles);
      const findRes: any = style.find((item:any) => item.id === table.id);
      if (findRes.id === table.id) {
        this.colStylesObj = style.styles;
      } else {
        this.colStylesObj = [...this.normalStyle, ...this.fixedStyle];
      }
    } else {
      this.colStylesObj = [...this.normalStyle, ...this.fixedStyle];
    }
  }

  initColStyleMap () {
    this.normalStyle = [];
    this.fixedStyle = [];
    this.initColStyleFn('', this.columns);

    this.colStyles = this.columns.map((col, colIdx) => {
      const last = colIdx === this.columns.length - 1;

      if (last && this.columns.length > 0) {
        const widths = this.columns.map(x => x.width || 0);

        if (widths.length > 0) {
          const totalWidth = widths.reduce((x, y) => x + y);
          if (totalWidth < 885) {
            return {};
          }
        }
      }

      const width = col.width + 'px';

      return {
        width,
        textAlign: col.align,
      };
    });
  }

  childList: any = [];

  childWidth: number = 0;

  timer: any = null;

  onColResize (
    evt: { width: number },
    colIdx: number,
    col: any,
    parentCal: any,
    isGroup?: boolean,
  ) {
    const width = evt.width + 'px';

    const k = parentCal ? `${parentCal.key}.${col.key}` : col.key;

    const theCol: any = this.colStylesObj.find((res: any) => res.key === k);
    this.childList = [];
    this.childWidth = 0;
    theCol.width = width;
    if (parentCal) {
      // 分组表头子元素拖动
      /* const theContent = this.$el.querySelector(
        `#${parentCal.key}`,
      ) as HTMLDivElement; */
      // const parentWidth: number = theContent.clientWidth;
      // 获取子元素的key
      const groupChild: any = parentCal.children.map((item: any) => {
        return `${parentCal.key}.${item.key}`;
      });
      // 获取子元素的定义样式
      this.colStylesObj.forEach((item: any) => {
        if (groupChild.includes(item.key)) {
          this.childList.push(item);
        }
      });
      // 获取子元素的样式宽度
      this.childList.forEach((item: any) => {
        this.childWidth += parseInt(item.width);
      });
      // 当前子元素的父元素
      const theParentCol: any = this.colStylesObj.find(
        (res: any) => res.key === parentCal.key,
      );
      // 子元素拖动的距离
      const rightWidth: number = this.childWidth - parseInt(theParentCol.width); // 表头拖动的距离
      if (theParentCol) {
        // 赋值父元素宽度
        this.colStylesObj.forEach((item: any) => {
          if (item.key === parentCal.key) {
            item.width = parseInt(item.width) + rightWidth;
          }
        });
        this.colStylesObj = [...this.colStylesObj];
      }
    }
    if (isGroup) {
      // 分组表头
      const groupChild: any = col.children.map((item: any) => {
        return `${col.key}.${item.key}`;
      });
      this.colStylesObj.forEach((item: any) => {
        if (groupChild.includes(item.key)) {
          this.childList.push(item);
        }
      });
      this.childList.forEach((item: any) => {
        this.childWidth += parseInt(item.width);
      });
      const rightWidth = parseInt(theCol.width) - this.childWidth; // 表头拖动的距离
      // 二级表头最后一个元素的宽度 加上表头拖动的宽度
      this.colStylesObj.forEach((item: any) => {
        if (groupChild[groupChild.length - 1] === item.key) {
          item.width = parseInt(item.width) + rightWidth + 'px';
        }
        if (item.key === col.key) {
          item.width = parseInt(theCol.width);
        }
      });
    }
    const table: any = col.node.id
    // const table: any = register.store.getParent(col.node.id);
    if (table.id) {
      const stylesList:any = [];
      let styles:any;
      let localStylesList:any;
      const currentStyles: any = {
        id: table.id,
        styles: this.colStylesObj,
      };
      const localStyles = window.localStorage.getItem('tableStyles');
      if (localStyles) {
        styles = JSON.parse(localStyles);
        const findRs:any = styles.find((inner) => inner.id === table.id);
        if (findRs) {
          styles.forEach((item:any) => {
            if (item.id === findRs.id) {
              item.styles = this.colStylesObj;
            };
          });
          localStylesList = JSON.stringify(styles);
        } else {
          styles.push(currentStyles);
          localStylesList = JSON.stringify(styles);
        }
      } else {
        stylesList.push(currentStyles);
        localStylesList = JSON.stringify(stylesList);
      }
      window.localStorage.setItem('tableStyles', localStylesList);
      // 把拖动后的宽度存储在本地
    }

    this.$emit('columnResize', {
      index: colIdx,
      column: col,
      width: evt.width,
    });
  }

  // 二级表头最小宽度
  getGroupMin (col: any, cols: any) {
    let minWidth: number = 0;
    cols.forEach((item: any) => {
      minWidth += parseInt(item.width);
    });
    return +(minWidth * 0.7);
  }

  getColStyle (key: string, parentKey?: string) {
    const k = parentKey ? `${parentKey}.${key}` : key;
    const style = this.colStylesObj.find((res: any) => res.key === k);
    if (style) {
      return style;
    } else {
      return {};
    }
  }

  getAssignStyle (key: string) {
    const tbodyStyle = this.tbodyStyle;
    delete tbodyStyle.height;
    return Object.assign({}, this.getColStyle(key), tbodyStyle);
  }

  getTheadStyle (isChild = false) {
    const index = this.columns.findIndex(
      (res: any) => res.children && res.children.length > 0,
    );
    if (index > -1 && !isChild && this.theadStyle.height) {
      const h = parseInt(this.theadStyle.height);
      const style: any = Object.assign({}, this.theadStyle);
      style.height = 2 * h + 1 + 'px';
      return style;
    } else {
      return this.theadStyle;
    }
  }

  /**
   * @Description: 第一列选择框去除缩进
   * @author AoFei Zhu
   * @date 2020-09-24 17:28:23
   */
  getTheadFirstStyle () {
    const theadStyle: any = Object.assign({}, this.theadStyle, {
      height: 'initial',
    }); // first column need to self adjusting based on head row
    delete theadStyle.textIndent;
    return theadStyle;
  }

  // 序列化头部样式
  get getInitTheadStyle () {
    return this.theadStyle;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTbodyStyle (isChild = false) {
    /* const index = this.columns.findIndex(
      res => res.children && res.children.length > 0,
    ); */
    const style: any = Object.assign({}, this.tbodyStyle);
    delete style.height;
    return style;
    // if (index > -1 && !isChild && this.theadStyle.height) {
    //   const style:any = Object.assign({}, this.tbodyStyle);
    //   delete style.height;
    //   return style;
    // } else {
    //   return this.tbodyStyle;
    // }
  }

  /**
   * @Description: 操作列样式
   * @author AoFei Zhu
   * @date 2020-09-24 16:31:51
   */
  getActionsStyle (actions: any) {
    return {
      width:
        actions && actions.length > 1 ? 70 * actions.length + 'px' : '90px',
      overflowX: 'hidden',
    };
  }

  getTbodyScrollConfig () {
    const style = {} as any;
    if (this.frozen) {
      const { maxDefaultHeight } = this.tbodyStyle;
      style['max-height'] = `${maxDefaultHeight}px`;
      // style['overflow-y'] = 'scroll';
    }
    return style;
  }

  getColumnStyle (col: any) {
    return col.options.style;
  }

  handleRootScroll () {
    if (!this.scrollbar) {
      this.scrollbar = this.$el.querySelector('.scrollbar');
      if (!this.scrollbar) {
        return;
      }
    }

    const $sheet = this.$el.querySelector('.sheet') as HTMLDivElement;

    if (!$sheet) {
      return;
    }

    const $sheetBody = $sheet.querySelector('.sheet__body');

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
      this.scrollbar.style.width = $sheet.offsetWidth + 'px';
      this.scrollbar.classList.add('stick');
    } else {
      this.scrollbar.classList.remove('stick');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  columnOrder (direction: string) {
    // 表格排序
  }

  // 列操作
  handleMenuClick (e: any, row: any, index: number) {
    this.$emit('columnAction', e.key, row, index);
  }

  beforeCreate (): void {
    window.localStorage.removeItem('tableStyles');
  }

  mounted () {
    this.$nextTick(() => {
      if (this.$el.querySelector) {
        const el = this.$el.querySelector(
          '.sheet__row:last-child > .sheet__cols',
        ) as HTMLDivElement;

        if (el) {
          this.shadowRight = el.offsetWidth < el.scrollWidth;
        }
        this.onScrollFn = () => {
          this.handleRootScroll();
        };
      }
    });
  }

  beforeDestroy (): void {
    window.localStorage.removeItem('tableStyles');
  }

  // destroyed() {
  //   if (this.getScrollEl && this.onScrollFn) {
  //     const scrollEl = this.getScrollEl();
  //     if (scrollEl) {
  //       scrollEl.removeEventListener('scroll', this.onScrollFn);
  //     }
  //   }
  // }
}
