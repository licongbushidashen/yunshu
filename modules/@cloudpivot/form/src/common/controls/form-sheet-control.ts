import { Subscription } from "rxjs";
import * as typings from "@cloudpivot/form/schema";
import ThreadPool from "./worker";
import { BaseControl } from "@cloudpivot/form/src/common/controls/base-control";
import { ControlHelper } from "@cloudpivot/form/src/common/controls/control-helper";
import {
  ControlPropertyChange,
  FormSheet,
  ColumnValueChange,
  RowChange,
  RowChangeType,
  ExpressionParser,
  FormGroup,
  FormControl,
} from "h3-forms";

import {
  FormControlValueService,
  ReverseQueryService,
} from "@cloudpivot/form/src/common/services";

import { RendererFormControl } from "@cloudpivot/form/schema";
import { FormBuilderHelper } from "@cloudpivot/form/src/renderer/controls/form-builder-helper";
import { UploadStatus } from "@cloudpivot/form/src/common/controls/upload-control";
import * as platform from "@cloudpivot/platform";
// @ts-ignore
import cloneDeep from 'lodash/cloneDeep';
export abstract class FormSheetControl extends BaseControl<typings.SheetOptions> {
  rows: typings.RendererFormControl[][] = [];

  statisticsMap: { [k: string]: typings.FormSheetStatistic } = {};

  checkeds: boolean[] = [];

  rowChangeSubscription?: Subscription;

  propertyChangeSubscription?: Subscription;

  // visableBack = this.controlOpts;

  // display = this.controlOpts.visible;
  // sub:any[] = []; // 保存监听的事件
  get display() {
    return this.controlOpts.visible;
  }

  pool: any = null;

  // @Watch("visableBack", {
  //   immediate: true
  // })
  // visableBackChange() {
  //  this.display = this.controlOpts.visible;
  // }

  abstract rowInserted(index: number, row: RendererFormControl[]): void;

  abstract rowsInserted(index: number, rows: RendererFormControl[][]): void;

  abstract rowRemoved(index: number, row: RendererFormControl[]): void;

  abstract rowsRemoved(indexs: number[]): void;

  getCtrl() {
    return this.findController(this.id) as FormSheet;
    // return this.ctrl as any as FormArray;
  }

  get sheet() {
    return (this.control as any) as typings.FormSheet;
  }
  // 返回子表表头 options 数据
  get columnOptions() {
    return this.getCtrl().columnOptions;
  }

  get sheetCustomActions() {
    return this.getCtrl().customActions;
    // return (this.control as any).actions || [];
  }

  // get canWritable(){
  //     return this.control.writable !== false;
  // }

  get isEdit() {
    return this.control.edit;
  }
  get importAble() {
    let res = true;
    if (this.controlOpts.hasOwnProperty("importable")) {
      res = this.controlOpts.importable;
    }
    return res;
  }
  get canEdit() {
    return this.controlOpts.editable && this.control.writable !== false;
  }

  // 是否批量编辑
  get getshowAllEdit() {
    return this.controlOpts.showAllEdit;
  }

  // 获取筛选数据
  get sheetFiters() {
    // ID1008845 产品升级到6.2后，导致所有带有子表的表单界面没有显示子表
    // 新需求需考虑到低版本升级问题, 不存在的时候返回为空数组
    if(!Array.isArray(this.controlOpts.sheetFiters)){
      this.controlOpts.sheetFiters = [];
    }
    return this.controlOpts.sheetFiters || [];
  }

  // 筛选数据格式
  get datatype() {
    return (this.control as any).columns.filter(
      (c: any) => c.type === 3 || c.type === 50 || c.type === 51
    );
  }

  get readonlyFormula() {
    if ((this.control as any).columns) {
      return (this.control as any).columns.every(
        (c: any) => c.options.readonlyFormula
      );
    }
    return false;
  }

  get canExport() {
    return this.controlOpts.exportable;
  }

  get importFormRelevanceForm() {
    return (
      !!this.controlOpts.importFormRelevanceForm &&
      this.control.writable !== false
    );
  }

  get tips() {
    let { tips } = this.control.options;
    return tips;
  }

  get showTotal() {
    if (!this.controlOpts.showTotal) {
      return false;
    }
    if (!this.sheet.statistics) {
      return false;
    }
    return this.sheet.statistics.some(
      (s) =>
        (s.options as typings.SheetStatisticOptions).statisticMode !==
        typings.AggregateType.None
    );
  }

  get queryCode() {
    const relevanceForm = (this.control as any).columns.find((res:any) => {
      return res.key === this.controlOpts.importFormRelevanceForm;
    });
    if (relevanceForm && relevanceForm.options) {
      return relevanceForm.options.queryCode;
    }
    return "";
  }

  get schemaCode() {
    const relevanceForm = (this.control as any).columns.find((res:any) => {
      return res.key === this.controlOpts.importFormRelevanceForm;
    });
    if (relevanceForm && relevanceForm.options) {
      return relevanceForm.options.schemaCode;
    }
    return "";
  }

  reverseMapping: any = null;

  get mappings() {
    if (this.reverseMapping) {
      return this.reverseMapping;
    } else {
      const relevanceForm = (this.control as any).columns.find((res:any) => {
        return res.key === this.controlOpts.importFormRelevanceForm;
      });
      if (
        relevanceForm &&
        relevanceForm.options &&
        relevanceForm.options.mappings
      ) {
        this.reverseMapping = ReverseQueryService.initMappings(
          relevanceForm.options.mappings
        );
        return this.reverseMapping;
      } else {
        return null;
      }
    }
  }

  get isWechat() {
    return (
      platform.IS_WECHAT ||
      platform.IS_DINGTALK ||
      platform.IS_WECHAT_PC_WINDOW ||
      platform.IS_WECHAT_PC_MAC
    );
  }

  get dataItem() {
    const columnsKeys =
      (this.control as any).columns &&
      (this.control as any).columns.map((res:any) => res.key);
    const sheet: any = this.getDataItem(this.ctrl.id as string);
    if (sheet && sheet.subSchema && sheet.subSchema.properties) {
      // const sheetItems = JSON.parse(JSON.stringify(sheet.subSchema.properties));
      const sheetItems = cloneDeep(sheet.subSchema.properties);
      sheetItems.forEach((res:any) => {
        res.propertyCode = res.code;
      });
      return sheetItems.filter((res:any) => columnsKeys.includes(res.code));
    }
    return [];
  }

  customBtnclick(code: string) {
    if (!code) return;
    const selectData: any = [];
    this.checkeds.forEach((res:any, index:number) => {
      if (res) {
        selectData.push(this.ctrl.value[index]);
      }
    });
    const _ctrl: any = this.ctrl;
    const data: any = {
      code,
      value: this.ctrl.value,
      h3forms: (window as any).h3form,
      checkeds: selectData,
    };
    _ctrl.actionDown(data);
  }

  convertVal(formData: any) {
    for (const key in this.mappings) {
      if (formData[key]) {
        const code = this.mappings[key];
        const idx = code.indexOf(".") + 1;
        const sheetKey = code.slice(idx);
        const sheetCtrl = (this.control as any).columns.find((res:any) => {
          return res.key === sheetKey;
        });
        formData[key] = FormControlValueService.convert(
          sheetCtrl.type,
          formData[key]
        );
      }
    }
  }

  relavanceColumns() {
    const relevanceForm = (this.control as any).columns.find((res:any) => {
      return res.key === this.controlOpts.importFormRelevanceForm;
    });
    let displayField = "name";

    if (
      relevanceForm &&
      relevanceForm.options &&
      relevanceForm.options.displayField
    ) {
      displayField = relevanceForm.options.displayField;
    }
    if (
      relevanceForm &&
      relevanceForm.options &&
      relevanceForm.options.mappings
    ) {
      const codes = relevanceForm.options.mappings.split(";").map((item:any) => {
        return item.split(":")[0];
      });
      codes.push(displayField);
      return codes;
    }

    return [displayField];
  }

  formTitleObj: any | null = null;

  get formTitle() {
    let title = "";
    if (this.formTitleObj) {
      if (this.locale !== "zh") {
        const name_i18n = this.formTitleObj.name_i18n;
        if (name_i18n) {
          const map =
            typeof name_i18n === "string" ? JSON.parse(name_i18n) : name_i18n;
          if (map[this.locale]) {
            title = map[this.locale];
          }
        }
      }
      if (!title) {
        title = this.formTitleObj.name;
      }
    } else {
      title =  this.locale == "zh" ? "关联表单" : "Relevance Form";
    }

    return title;
  }


  getParams(isMobile: boolean) {
    let conditions = "";
    const relevanceForm = (this.control as any).columns.find((res:any) => {
      return res.key === this.controlOpts.importFormRelevanceForm;
    });
    if (relevanceForm && relevanceForm.options) {
      conditions = isMobile
        ? relevanceForm.options.mobileConditions
        : relevanceForm.options.conditions;
    }

    if (!conditions) {
      return [];
    }

    const formControls = this.getFormControls();

    const params = conditions
      .split(";")
      .map((arr) => {
        let [f1, f2] = arr.split(":");

        if (!f2) {
          return null;
        }

        if (f2[0] === "{") {
          f2 = f2.substr(1, f2.length - 2);

          let ctrl: any;
          let control: typings.RendererFormControl | undefined;

          const idx = f2.indexOf(".");
          if (idx > -1) {
            const sheetKey = f2.substring(0, idx);
            const controlKey = f2.substr(idx + 1);

            const sheet = (formControls.find(
              (c) => c.key === sheetKey
            ) as any) as typings.FormSheet;
            if (sheet) {
              control = sheet.columns.find((c) => c.key === controlKey) as any;
            }

            const sheetCtrl = this.findController(
              f2.substring(0, idx)
            ) as FormSheet;
            if (
              sheetCtrl &&
              this.ctrl.options &&
              typeof this.ctrl.options.rowIndex === "number"
            ) {
              const row = sheetCtrl.rows[this.ctrl.options.rowIndex];
              ctrl = row.findChild(f2.substr(idx + 1));
            }
          } else {
            ctrl = this.findController(f2);
            control = formControls.find((c) => c.key === f2);
          }

          if (!ctrl || !control) {
            return null;
          }

          const type = ControlHelper.mapToDataItemType(control.type);

          return {
            code: f1,
            value: ctrl.value,
            type,
          };
        } else {
          return {
            code: f1,
            value: f2,
          };
        }
      })
      .filter((x) => x !== null);

    return params as any[];
  }

  columns: any[] = [];

  query = {};

  getColumnLabel(col: RendererFormControl) {
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

  showColumn(index: number) {
    const col = this.sheet.columns[index];
    if (!col || !col.options.visible) {
      return false;
    }

    if (this.rows.length === 0) {
      return true;
    }

    const allHide = this.rows.every((row) => !row[index].controller.display);
    return !allHide;
  }

  edit() {
    this.rows.forEach((row) => {
      row.forEach((col, index) => {
        if ((this.sheet.columns[index] as any).writable !== false) {
          // col.edit = this.control.edit;
          col.controller.readonly = this.control.edit === false;
        }
      });
    });
  }

  showStat(columnKey: string) {
    const s = this.statisticsMap[columnKey];
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
    const s = this.statisticsMap[columnKey];
    if (!s) {
      return;
    }
    const opts = s.options as typings.SheetStatisticOptions;
    switch (opts.statisticMode) {
      case typings.AggregateType.Sum:
        return this.$t("cloudpivot.form.renderer.label.sum");
      case typings.AggregateType.Avg:
        return this.$t("cloudpivot.form.renderer.label.avg");
      case typings.AggregateType.Min:
        return this.$t("cloudpivot.form.renderer.label.min");
      case typings.AggregateType.Max:
        return this.$t("cloudpivot.form.renderer.label.max");
    }
  }

  /**
   * 初始化统计
   */
  initStat() {
    if (!this.showTotal) {
      return;
    }

    const ctrl = this.getCtrl();

    const sheetVal = ctrl.value;

    const func = this.stat.bind(this);

    this.sheet.statistics
      .filter((s) => s.options.statisticMode !== typings.AggregateType.None)
      .forEach((s) => {
        (s as any).value = "";
        this.statisticsMap[s.columnKey] = s;

        if (sheetVal.length > 0) {
          const colValues = sheetVal.map((x) => x[s.columnKey]);
          (s as any).value = ExpressionParser.aggregate(
            s.options.statisticMode,
            colValues
          );
        }
        const subject = ctrl.getColumnValueChange(s.columnKey);

        if (subject) {
          subject.subscribe(func);
        }
      });
  }

  stat(change: ColumnValueChange) {
    const s = this.statisticsMap[change.key];
    if (!s || !change.value) {
      return;
    }

    const opts = s.options as typings.SheetStatisticOptions;
    if (opts.statisticMode === typings.AggregateType.None) {
      return;
    }

    const value = ExpressionParser.aggregate(opts.statisticMode, change.value);

    (s as any).value = value;
    this.statisticsMap = Object.assign({}, this.statisticsMap);
  }

  clear(idx: number) {
    const row = this.rows[idx];
    if (!row) {
      return;
    }
    row.forEach((c) => {
      if (!c.controller || c.writable === false) {
        return;
      }
      if (
        c.type !== typings.FormControlType.Radio
        // && !(c.type === typings.FormControlType.Dropdown && !c.options.multi)
      ) {
        if (
          c.type === typings.FormControlType.Attachment ||
          c.type === typings.FormControlType.Image
        ) {
          c.controller.commander.next({
            name: "clear",
          });
        } else {


          c.controller.value = FormControlValueService.defaultValueOf(
            c.type,
            c.options.multi
          );
          // @ts-ignore
          c.controller.isChangeFromEmptyRow = true
        }
      }
    });
  }

  copy(idx: number, row: any = []) {
    const ctrl = this.getCtrl();
    if (!ctrl || !ctrl.children[idx]) {
      return;
    }

    let vals = ctrl.children[idx].value;
    delete vals.id;

    // PC端copy
    if (row.length) {
      vals = {};
      row.map((d: any) => {
        vals[d.key] = d.controller.value;
      });
    }

    // 如果有数组或对象，会产生状态关联，所以这里需要深度复制
    // vals = JSON.parse(JSON.stringify(vals));
    vals = cloneDeep(vals);

    for (const col of (this.control as any).columns) {
      if (vals[col.key] !== undefined) {
        if (col.type === typings.FormControlType.Date && vals[col.key]) {
          vals[col.key] = new Date(vals[col.key]);
        } else if (
          vals[col.key] &&
          (col.type === typings.FormControlType.Attachment ||
            col.type === typings.FormControlType.Image)
        ) {
          vals[col.key] = vals[col.key].filter(
            (f: any) => f.status === UploadStatus.Done || f.status === "done"
          );
        }
      }
    }
    // this.addRow(vals, idx + 1); 去掉复制行插入的操作，插入行会使得原有的监听乱掉

    this.addRow(vals, undefined, true);
  }

  reset() {
    this.rows = [];

    if (this.rowChangeSubscription) {
      this.rowChangeSubscription.unsubscribe();
      this.rowChangeSubscription = undefined;
    }

    if (this.propertyChangeSubscription) {
      this.propertyChangeSubscription.unsubscribe();
      this.propertyChangeSubscription = undefined;
    }
  }

  isSafari() {
    const ua = navigator.userAgent.toLowerCase();
    if (
      (ua.indexOf("applewebkit") > -1 &&
        ua.indexOf("mobile") > -1 &&
        ua.indexOf("safari") > -1 &&
        ua.indexOf("linux") === -1 &&
        ua.indexOf("android") === -1 &&
        ua.indexOf("chrome") === -1 &&
        ua.indexOf("ios") === -1 &&
        ua.indexOf("browser") === -1) ||
      (/Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent))
    ) {
      return true;
    } else {
      return false;
    }
  }

  isIE() {
    if (!!(window as any).ActiveXObject || "ActiveXObject" in window) {
      return true;
    } else {
      return false;
    }
  }

  /***
   * 获取当前浏览器类型
   */
  myBrowser() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1;
    if (isOpera) {
      //判断是否Opera浏览器
      return "Opera";
    }
    if (userAgent.indexOf("Firefox") > -1) {
      //判断是否Firefox浏览器
      return "FF";
    }
    if (userAgent.indexOf("Chrome") > -1) {
      return "Chrome";
    }
    if (userAgent.indexOf("Safari") > -1) {
      //判断是否Safari浏览器
      return "Safari";
    }
    if (
      userAgent.indexOf("compatible") > -1 &&
      userAgent.indexOf("MSIE") > -1 &&
      !isOpera
    ) {
      //判断是否IE浏览器
      return "IE";
    }
  }

  initRows(canFull: any, type: any) {
    if (this.sheet.columns.length === 0) {
      return;
    }

    const sheet = this.getCtrl();
    console.log("initRows", sheet, this.control);
    console.log("this.sheet", sheet, this.sheet);
    if (sheet && sheet.rows.length > 0) {
      sheet.rows.forEach((g, i) => this.buildRow(i, g));
    } else {
      const value: any[] = this.control.value;
      let diff_tag = !!(this.control as any).diff;
      if (value && value.length > 0) {
        // todo worker兼容性问题，现排除safari,ie，移动端使用，具体兼容问题后续查找为何catch时生成行会生成两行
        if (
          typeof Worker !== "undefined" &&
          type === "pc" &&
          !this.isWechat &&
          !this.isSafari() &&
          !this.isIE() &&
          (this.myBrowser() === "FF" || this.myBrowser() === "Chrome")
        ) {
          if (this.pool) {
            this.pool.dispose();
            this.pool = null;
          }
          this.pool = new ThreadPool((value: any) => {
            return value;
          }, 1);
          this.pool
            .dispatch(value)
            .then((res: any) => {
              this.rowChangeSubscription &&
                this.rowChangeSubscription.unsubscribe();
              this.rowChangeSubscription = undefined;
              res.forEach((val: any, i: any) => {
                const g = this.addRow(val, i, true);
                if (diff_tag) (g as any).diff = (this.control as any).diff[i]; // 表单对比 子表值是否相等 标记
                if (g) {
                  this.buildRow(i, g);
                }
              });
            })
            .then(() => {
              if (type === "pc") {
                this.initStat();
                this.checkeds = this.rows.map(() => false);
                if (canFull && this.control.edit) {
                  this.edit();
                }
              } else {
                this.checkeds = this.rows.map(() => false);
                canFull = 0;
              }
              this.listenRowChange();
              this.pool.dispose();
              this.pool = null;
            })
            .catch((err: any) => {
              this.rowChangeSubscription &&
              this.rowChangeSubscription.unsubscribe();
              this.rowChangeSubscription = undefined;
              value.forEach((val, i) => {
                const g = this.addRow(val, i, true);
                if (diff_tag) (g as any).diff = (this.control as any).diff[i]; // 表单对比 子表值是否相等 标记
                if (g) {
                  this.buildRow(i, g);
                }
              });
              console.error(err);
            });
        } else {
          value.forEach((val, i) => {
            const g = this.addRow(val, i, true);
            if (diff_tag) (g as any).diff = (this.control as any).diff[i]; // 表单对比 子表值是否相等 标记
            if (g) {
              this.buildRow(i, g);
            }
          });
        }
      } else {
      }
    }
  }

  buildRow(index: number, group: FormGroup, initDefaultValue = false) {
    // const row: typings.RendererFormControl[] = JSON.parse(
    //   JSON.stringify(this.sheet.columns)
    // );
    // @ts-ignore
    const row: typings.RendererFormControl[] = cloneDeep(this.sheet.columns);

    row.forEach((col: typings.RendererFormControl, i) => {
      const sheetParams = (this.controlOpts as any).sheetParams;
      if (sheetParams) {
        col.options.sheetParams = sheetParams;
      }

      if (group) {
        const _ctrl = group.findChild(col.key) as FormControl<any>;
        if (_ctrl) {
          col.controller = _ctrl;
          if (initDefaultValue && !_ctrl.hasValue) {

            let val = FormBuilderHelper.getControlValue(col as any);
            if (val === undefined) {
              _ctrl.value = FormBuilderHelper.defaultValueOf(col as any);
            }
            if (val !== undefined) {
              _ctrl.value = val;
            }
          }

          if ((this.sheet.columns[i] as any).writable !== false) {
            _ctrl.readonly = this.control.edit === false;
          } else {
            _ctrl.readonly = true;
          }
        }
      }
      col = this._colAddDiff(group, col);
    });
    this.rows.splice(index, 0, row);
    // console.log(row, 'row');
    if ((group as any).diff && (group as any).diff._rowDiff)
      (row as any).diff = true;
    return row;
  }

  // 表单对比 子表 col对比
  _colAddDiff(group: any, col: any) {
    if (group.diff && !group.diff._rowDiff) {
      col.diff = !!group.diff[col.key];
    }
    return col;
  }

  /**
   * @Author: Fan
   * @Date: 2020-04-27 17:23:21
   * @description:
   * @param {type}  init 是否是初始化调用
   * @return:
   * @LastEditors: Fan
   */
  addRow(vals?: any, idx?: number, init = false) {
    // 导入和手动新增把状态至为新增 初始化后台数据为Unchanged
    // console.log(vals, 'vals');
    if (vals) {
      // 如果初始化是读取已有数据
      if (vals['id']) {
        vals['rowStatus'] = 'Unchanged'
      } else { // 否则是新增
        vals['rowStatus'] = 'Added'
      }
    }
    if (!vals) {
      vals = {};
      this.sheet.columns.forEach((col) => {
        let val = FormBuilderHelper.getControlValue(col as any);
        // 新增 手动添加行没有数据
        if (val === undefined) {
          if (col.key === 'rowStatus') {
            vals[col.key] = 'Added'
          } else {
            vals[col.key] = FormBuilderHelper.defaultValueOf(col as any);
          }
        }
        if (val !== undefined) {
          vals[col.key] = val;
        }
      });
    }

    // 删除有值表达的值
    this.sheet.columns.forEach((col) => {
      if (col.options.computeFormula) {
        if (!init || this.getIsNew()) {
          delete vals[col.key];
        }
      }
    });

    const ctrl = this.getCtrl();
    const group =
      idx !== undefined ? ctrl.insertRow(idx, vals) : ctrl.appendRow(vals);
    return group;
  }

  removeRow(index: number) {
    const ctrl = this.getCtrl();
    ctrl.removeRow(index);
  }

  removeRows(indexs: number[]) {
    const ctrl:any = this.getCtrl();
    if (indexs.length === 1) {
      ctrl.removeRow(indexs[0]);
    } else {
      for (const idx of indexs) {
        const val:any = ctrl.value[idx];
        if(val) {
          val['rowStatus'] = 'Deleted';
          (ctrl.removeList as any).push(val);
        }
      }
      ctrl.removeRows(indexs);
    }
  }

  /**
   * 监听行变化事件
   */
  listenRowChange() {
    if (this.rowChangeSubscription) {
      return;
    }

    const sheet:any = this.getCtrl();
    sheet.removeList = []; // 添加删除列表 提交删除数据
    const onAddRow = this.controlOpts.onAddRow
      ? this.newFunc(this.controlOpts.onAddRow)
      : null;
    const onDeleteRow = this.controlOpts.onDeleteRow
      ? this.newFunc(this.controlOpts.onDeleteRow)
      : null;

    const func = (change: RowChange) => {
      console.log(change, 'change');
      console.log(sheet, 'sheet');
      if (change.type === RowChangeType.Insert) {
        const group = sheet.rows[change.index];
        if(change.value && (change.value as any).rowStatus) {
          change.value.rowStatus = 'Added'; // 新增状态
        }
        const row = this.buildRow(change.index, group, true);
        this.rowInserted(change.index, row);

        if (onAddRow) {
          onAddRow.call(this.getThisProxy(), change.index, change.value);
        }
      } else if (change.type === RowChangeType.Remove) {
        if(change.value && (change.value as any).rowStatus) {
          change.value.rowStatus = 'Deleted'; // 删除状态
          (sheet.removeList as any).push(change.value);
        }
        this.rows.splice(change.index, 1);
        this.rowRemoved(change.index, this.rows[change.index]);

        if (onDeleteRow) {
          onDeleteRow.call(this.getThisProxy(), change.index, change.value);
        }
      } else if (change.type === RowChangeType.InsertMulti) {
        if (change.insertCount) {
          const indexs = new Array(change.insertCount)
            .fill(0)
            .map((_, i) => change.index + i);

          const rows = indexs.map((idx) =>
            this.buildRow(idx, sheet.rows[idx], true)
          );

          this.rowsInserted(change.index, rows);

          if (onAddRow) {
            const _this = this.getThisProxy();
            for (const idx of indexs) {
              onAddRow.call(_this, idx, sheet.rows[idx].value);
            }
          }
        }
      } else if (change.type === RowChangeType.RemoveMulti) {
        if (change.removeIndexs) {
          for (const idx of change.removeIndexs) {
            this.rows.splice(idx, 1);
          }
          this.rowsRemoved(change.removeIndexs);

          if (onDeleteRow) {
            const _this = this.getThisProxy();
            for (const idx of change.removeIndexs) {
              onDeleteRow.call(_this, idx);
            }
          }
        }
      }
    };
    if (sheet && sheet.rowChange) {
      this.rowChangeSubscription = sheet.rowChange.subscribe(func);
    }
  }

  newFunc(funcBody?: string) {
    if (!funcBody) {
      return null;
    }
    return new Function("index", "row", funcBody);
  }

  /**
   * 监听属性变化
   */
  listenPropertyChange() {
    const ctrl = this.getCtrl();
    if (ctrl && ctrl.display === false) {
      this.control.options.visible = false;
      // this.display = false;
    }
    // 只有当visible为true时，才需要监听display
    if (ctrl.propertyChange) {
      const _this = this;
      this.propertyChangeSubscription = ctrl.propertyChange.subscribe(
        (change: ControlPropertyChange) => {
          if (change.name === "display") {
            // _this.display = change.value;
            _this.control.options.visible = change.value;
          }
        }
      );
    }
  }

  /**
   * @des 取消订阅
   */
  unsubscribe() {
    // this.sub.forEach(events => {
    //   let keys = Object.keys(events);
    //   keys.map(key => {
    //     events[key].unsubscribe();
    //   })
    // })
  }

  destroyed() {
    super.destroyed();
    this.pool.dispose();
    this.reset();
    this.unsubscribe();
  }
}
