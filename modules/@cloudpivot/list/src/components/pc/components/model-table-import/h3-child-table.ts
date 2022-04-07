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

import CheckboxText from './checkbox-text.vue';

import './drag-row';

// import components from '@cloudpivot-shared/ui-designer-widgets/components';
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
  isAuto!: Boolean;

  @Prop({
    default: true,
  })
  rowDrag!: boolean;

  @Prop({
    default: false,
  })
  radio!: boolean;

  @Prop({
    default: () => [],
  })
  columns!: any[];

  @Prop({
    default: 'id',
  })
  rowKey!: string;

  @Prop({
    default: () => ({}),
  })
  theadStyle!: any;

  @Prop({
    default: {},
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

  @PropSync('activeKey', {
    default: '',
  })
  activeKeySync!: string;

  @Prop({
    default: () => [],
  })
  dataSource!: any;

  @Prop({
    default: () => [],
  })
  parentKey!: any[];

  @Prop({
    default: () => [],
  })
  colStylesObj!: any[];

  @PropSync('selectedRowKeys', {
    default: () => [],
  })
  selectedRowKeysSync!: string[];

  // @Inject()
  // getScrollEl!: () => HTMLDivElement;

  onScrollFn?: () => void;

  shadowLeft = false;

  shadowRight = false;

  scrollbar: HTMLDivElement | null = null;

  leftColumns: any[] = [];

  rightColumns: any[] = [];

  unFreezeColumns: any[] = [];

  colStyles: any[] = [];
  //   colStylesObj: any = [];

  sheetIsScroll = false; // 表格是否滚动

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
      return this.dataSource.every((x: any) =>
        this.selectedRowKeysSync.includes(x[this.rowKey]),
      );
    }
    return false;
  }

  get indeterminate () {
    return this.selectedRowKeysSync.length > 0 && !this.allChecked;
  }

  freezeColumn (column: any, freeze: boolean) {
    if (freeze) {
      // if (this.frozenKeys.length >= 3) {
      //     this.$message.error(
      //         this.$t('cloudpivot.form.renderer.tip.frozenColumnMax')
      //     );
      //     return;
      // }

      let width = 0;
      this.columns
        .map((col, i) =>
          this.frozenKeys.indexOf(col.key) > -1 || col.key === column.key
            ? this.colStyles[i].width
            : 0,
        )
        .forEach(w => (width += parseInt(w)));

      if (width > 854) {
        // this.$message.error(
        //     this.$t('cloudpivot.form.renderer.tip.frozenColumnWidthMax')
        // );
        return;
      }
    }

    // column.fixed = freeze ? 'left' : '';
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

  refreshFreezeColumns () {
    this.leftColumns = this.columns.filter(c => c.fixed === 'left');
    this.rightColumns = this.columns.filter(c => c.fixed === 'right');
    // this.unFreezeColumns = this.columns.filter(c => !c.fixed);
    this.unFreezeColumns = this.columns.filter(
      c => c.fixed === 'normal' || !c.fixed,
    );
    // console.log(this.unFreezeColumns, 'this.unFreezeColumns');
  }

  @Watch('columns', {
    immediate: true,
  })
  onColumnsChange () {
    this.refreshFreezeColumns();

    this.initColStyleMap();

    this.$nextTick(() => {
      const el = this.$el.querySelector(
        '.sheet__row:last-child > .sheet__cols',
      ) as HTMLDivElement;

      if (el) {
        this.sheetIsScroll = el.offsetWidth < el.scrollWidth;
      }
    });
  }

  created () {}

  rowStyle: any[] = [];

  showDataSource: any;

  dragRow (index: number, height: number) {
    if (height < 50) {
      return false;
    }
    this.rowStyle[index].height = height + 'px';
    this.rowStyle = [...this.rowStyle];
  }

  @Watch('dataSource', {
    immediate: true,
  })
  onDataSourceChange () {
    let mapList: any = [];
    /**
     * @Description: 如果二级表头没有数据 则制造假数据
     * @author AoFei Zhu
     * @date 2020-10-13 16:39:48
     */
    // console.log(this.dataSource, 'this.dataSource');
    if (!this.dataSource || this.dataSource.length === 0) {
      mapList = this.unFreezeColumns.map((_, i: number) => {
        const row: any = {};
        row.id = i;
        this.unFreezeColumns.map((inner: any) => {
          row[inner.key] = '';
        });
        return row;
      });
      // console.log(mapList, 'mapList');
      mapList = mapList.slice(0, 1);
      // console.log(mapList, 'mapList');
    }
    // 转换后台返回可能是string的情况
    const dataSource: any =
      this.dataSource && this.dataSource.length > 0 ? this.dataSource : mapList;
    // const dataSource:any = this.dataSource;
    // console.log(dataSource, 'dataSource');
    let lastValue: any = [];
    if (dataSource) {
      if (typeof dataSource === 'string' && dataSource.indexOf('[') > -1) {
        lastValue = JSON.parse(dataSource);
      } else {
        lastValue = dataSource;
      }
    }
    // 如果子表的dataSource 是个对象属性 则取Value
    if (lastValue.value) {
      if (lastValue.value.length > 0) {
        this.showDataSource = lastValue.value;
      }
    } else {
      this.showDataSource = lastValue;
    }
    if (this.showDataSource.length > 0) {
      this.showDataSource.forEach((res: any, index: number) => {
        this.rowStyle[index] = {
          height: this.tbodyStyle.height ? this.tbodyStyle.height : 'auto',
          // height: '100%',
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
      this.selectedRowKeysSync = this.dataSource.map(
        (x: any) => x[this.rowKey],
      );
    }
  }

  check (key: string) {
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

  rowClick (row: any) {
    //   this.activeKeySync = row[this.rowKey];
    this.$emit('rowClick', row);
  }

  onScroll (evt: UIEvent) {
    this.syncScroll(evt.target as any);
  }

  syncScrollLeft () {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initColStyleFn (pre: string, columns: any) {}

  initColStyleMap () {
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

  timer: any = null;

  onColResize (
    evt: { width: number },
    colIdx: number,
    col: any,
    parentCal: any,
  ) {
    const width = evt.width + 'px';

    const k = parentCal ? `${parentCal.key}.${col.key}` : col.key;

    const theCol: any = this.colStylesObj.find(res => res.key === k);

    theCol.width = width;
    if (parentCal) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        const theContent = this.$el.querySelector(
          `#${parentCal.key}`,
        ) as HTMLDivElement;
        const w = theContent.clientWidth;

        const theParentCol: any = this.colStylesObj.find(
          res => res.key === parentCal.key,
        );
        if (theParentCol) {
          theParentCol.width = w;
          this.colStylesObj = [...this.colStylesObj];
          console.log(w);
        }
      }, 100);
    }

    //   this.colStyles.splice(colIdx, 1, {
    //       width
    //   });

    this.$emit('columnResize', {
      index: colIdx,
      column: col,
      width: evt.width,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getColStyle (key: string, parentKey?: string) {
    const k = `${this.parentKey}.${key}`;
    const style = this.colStylesObj.find(res => res.key === k);
    if (style) {
      if (!style.width) {
        // 添加默认宽度
        style.width = '150px';
      }
      return style;
    } else {
      return {};
    }
  }

  getAssignStyle (key: string) {
    const tbodyStyle = Object.assign({}, this.tbodyStyle);
    delete tbodyStyle.height;
    // tbodyStyle.minHeight = '50px'; // 二级表最少高度添加
    return Object.assign({}, this.getColStyle(key), tbodyStyle);
  }

  getTheadStyle (isChild = false) {
    // console.log(this.theadStyle, 'theadStyle');
    const index = this.columns.findIndex(
      res => res.children && res.children.length > 0,
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

  mounted () {
    this.$nextTick(() => {
      const el = this.$el.querySelector(
        '.sheet__row:last-child > .sheet__cols',
      ) as HTMLDivElement;

      if (el) {
        this.shadowRight = el.offsetWidth < el.scrollWidth;
        // this.sheetIsScroll = this.shadowRight;
      }

      this.handleRootScroll();

      this.onScrollFn = () => {
        this.handleRootScroll();
      };

      // if (this.getScrollEl) {
      //   const scrollEl = this.getScrollEl();
      //   if (scrollEl) {
      //     scrollEl.addEventListener('scroll', this.onScrollFn);
      //   }
      // }
    });
  }

  destroyed () {
    // if (this.getScrollEl && this.onScrollFn) {
    //   const scrollEl = this.getScrollEl();
    //   if (scrollEl) {
    //     scrollEl.removeEventListener('scroll', this.onScrollFn);
    //   }
    // }
  }

  getColValue (col: any, row: any) {
    if (!row) {
      return null;
    }

    const fk = col.fromAssociationPropKey;
    if (fk) {
      const value = row[fk];
      return Array.isArray(value) && value.length > 0
        ? value[0][col.key]
        : null;
    } else {
      const key = col.key as string;
      if (key.includes('.')) {
        const segs = key.split('.');
        let temp = row;
        for (const seg of segs) {
          temp = temp[seg];
          if (temp === undefined || temp === null) {
            return null;
          }
        }
        return temp;
      } else {
        return row[key];
      }
    }
  }
}
