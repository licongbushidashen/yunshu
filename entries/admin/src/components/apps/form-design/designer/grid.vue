
<template>
  <div>
    <template v-for="(keys,index) in layout">
      <control-container
        :key="index"
        :index="index"
        :controlKeys="keys"
        :controls="controls"
        :clearParentShowEmptyTask="clearParentShowEmptyTask"
        :ignoreTypes="ignoreTypes"
        @control-add="onControlAdd"
        @control-move="onControlMove"
        @control-delete="onControlDelete"
        v-h3-drop
      ></control-container>
    </template>

    <control-container 
      :index="-2"
      :clearParentShowEmptyTask="clearParentShowEmptyTask"
      :ignoreTypes="ignoreTypes"
      @control-add="onControlAdd" 
      v-h3-drop
    ></control-container>
  </div>
</template>


<script lang='ts'>
import {
  Component,
  Vue,
  Prop,
  Emit,
  Watch,
  Provide,
  Inject
} from "vue-property-decorator";
//import { namespace } from 'vuex-class';

import ControlContainer from "./control-container.vue";
import { FormControl, DataItem, FormControlType } from "../typings";

import * as ControlFactory from "../typings/control-factory";

import { Layouter } from "./layouter";
import { schema } from "@cloudpivot/h3-list";

const empty_Key = ".";

@Component({
  name: "grid",
  components: {
    ControlContainer
  }
})
export default class Grid extends Vue implements Layouter {
  @Prop()
  readonly controls!: { [key: string]: FormControl };

  @Prop()
  readonly layout!: string[][];

  @Prop()
  clearParentShowEmptyTask ?: () => void;

  @Prop()
  readonly path?: string[];

  @Prop()
  readonly ignoreTypes?: FormControlType[];

  selected: any = "";

  ctrlCKey = "";

  @Provide()
  setCtrlCKey(key: string) {
    this.ctrlCKey = key;
  }

  @Provide()
  getCtrlCKey() {
    return this.ctrlCKey;
  }

  @Inject()
  removeControlFromParent!: (key: string, path?: string[]) => FormControl | null;

  colsLimit = 3;

  private _showTimeoutRef: any;

  private _hideTimeoutRef: any;

  private layoutSnapshot: any[] | null = null;

  getLayout() {
    return this.layout;
  }

  onControlAdd(add: {
    row: number;
    col: number;
    newline: boolean;
    control: FormControl;
    copyKey?: string;
  }) {
    //console.log('onControlAdd ' + JSON.stringify(add));
    //必须在rearrange之前
    this.emitControlAdd(add.control, add.copyKey);

    this.rearrange(add.row, add.col, add.newline, add.control.key);

    this.emitChange(this.layout);
  }

  onControlMove(move: {
    row: number;
    col: number;
    newline: boolean;
    controlKey: string;
    controlPath?: string[]
  }) {
    let path = move.controlPath;

    let inLevel = !this.path && !path;

    if(!inLevel && path && this.path){
      if(path.length - this.path.length === 1){
        let samo = true;
        for(let i = 0;i<this.path.length;i++){
          if(path[i] !== this.path[i]){
            samo = false;
            break;
          }
        }
        inLevel = samo;
      }
    }

    if(inLevel){
      let [row, col] = this.findIndex(move.controlKey);
      if ((row === -1 && col === -1) || (row === move.row && col === move.col)) {
        return;
      }

      let cols = this.layout[row] as string[];
      cols.splice(col, 1);

      this.rearrange(move.row, move.col, move.newline, move.controlKey);

      this.emitChange(this.layout);

    } else {
      const control = this.removeControlFromParent(move.controlKey, path);
      if(!control){
        return;
      }
      const addData = move as any;
      addData.control = control;
      this.onControlAdd(addData);
    }
  }

  rearrange(row: number, col: number, newline: boolean, controlKey: string) {
    // console.log(`rearrange ${row},${col},${newline}`);
    const layout = this.layout;

    if (row === -2) {
      if (layout.length > 0 && layout[layout.length - 1].length === 0) {
        layout.splice(layout.length - 1, 1, [controlKey]);
      } else {
        layout.push([controlKey]);
      }
      return;
    }

    if (row === -1) {
      layout.splice(0, 0, [controlKey]);
    } else {
      if (newline) {
        layout.splice(row, 0, [controlKey]);
      } else {
        let cols = layout[row] as string[];
        if (
          !cols ||
          (cols.length === 1 &&
            ControlFactory.isFullRow(this.controls[cols[0]].type))
        ) {
          layout.splice(row, 0, [controlKey]);
        } else {
          if (cols.length < this.colsLimit) {
            cols.splice(col, 0, controlKey);
          } else {
            const limit = this.colsLimit - 1;
            const nextline = cols.splice(limit, 1);
            cols.splice(col, 0, controlKey);
            layout.splice(row + 1, 0, nextline);
          }
        }
      }
    }

    layout
      .map((x, i) => (x.length === 0 ? i : -1))
      .filter(i => i !== -1)
      .reverse()
      .forEach(i => layout.splice(i, 1));
  }

  onControlDelete(controlKey: string) {
    let [row, col] = this.findIndex(controlKey);
    //console.log('onControlDelete ' + row + ',' + col);
    if (row === -1 && col === -1) {
      return;
    }

    const cols = this.layout[row] as string[];
    cols.splice(col, 1);

    if (cols.length === 0) {
      this.layout.splice(row, 1);
    }

    this.emitControlDelete(controlKey);

    this.emitChange(this.layout);
  }

  /**
   * 快照
   */
  snapshot() {
    this.layoutSnapshot = JSON.parse(JSON.stringify(this.layout));
  }

  showEmptyCol(rowIndex: number, colIndex: number, newline: boolean) {
    const key = empty_Key;
    if (!this.controls[key]) {
      this.snapshot();

      this.onControlAdd({
        row: rowIndex,
        col: colIndex,
        newline: newline,
        control: {
          key: key
        } as any
      });
    } else {
      this.onControlMove({
        row: rowIndex,
        col: colIndex,
        newline: newline,
        controlKey: key
      });
    }
  }

  hideEmptyCol() {
    clearTimeout(this._showTimeoutRef);
    if (this.layoutSnapshot) {
      // this.layout = this.layoutSnapshot;
      //delete this.controls[empty_Key];
      //this.emitLayoutChange(this.layoutSnapshot);
      this.emitControlDelete(empty_Key);
      this.layout.splice(0, this.layout.length, ...this.layoutSnapshot);
      console.log("hideEmptyCol", this.layoutSnapshot);
      this.layoutSnapshot = null;
    }
  }

  setHideEmptyTask(now = false) {
    clearTimeout(this._hideTimeoutRef);
    if (now) {
      this.hideEmptyCol();
    } else {
      this._hideTimeoutRef = setTimeout(() => this.hideEmptyCol(), 300);
    }
  }

  clearHideEmptyTask() {
    clearTimeout(this._hideTimeoutRef);
  }

  clearShowEmptyTask() {
    // console.log('clearShowEmptyTask');
    clearTimeout(this._showTimeoutRef);
  }

  setShowEmptyTask(rowIndex: number, colIndex: number, full = false) {
    clearTimeout(this._showTimeoutRef);
    this._showTimeoutRef = setTimeout(
      // () => this.showEmptyCol(rowIndex, colIndex, full),
      () => {
        this.showEmptyCol(rowIndex, colIndex, full);
        this.setHideEmptyTask();
      },
      300
    );
  }

  replaceEmpty(control: FormControl) {
    const key = empty_Key;

    let [rowIndex, colIndex] = this.findIndex(key);

    if (rowIndex === -1 && colIndex === -1) {
      return false;
    }

    const row = this.layout[rowIndex];
    this.emitControlAdd(control);
    this.emitControlDelete(key);

    row.splice(colIndex, 1, control.key);

    this.emitChange(this.layout);

    this.layoutSnapshot = null;

    // this.layout.splice(rowIndex, 1, row);
    // this.snapshot();

    return true;
  }

  findIndex(controlKey: string): [number, number] {
    return ControlFactory.findIndexFromGrid(this.layout, controlKey);
  }

  replace(rowIndex: number, colIndex: number, key: string) {
    const row = this.layout[rowIndex];
    row.splice(colIndex, 1, key);
    this.layout.splice(rowIndex, 1, row);

    this.emitChange(this.layout);
  }

  emitControlAdd(control: FormControl, copyKey?: string) {
    this.$emit("control-add", control, copyKey);
  }

  emitControlDelete(controlKey: string) {
    this.$emit("control-delete", controlKey);
  }

  emitChange(layout: string[][]) {
    this.$emit("change", layout);
  }

  beforeDestroy(){
    this.setHideEmptyTask(true);
  }
}
</script>


<style lang="less" scoped>
/deep/.ant-radio-wrapper {
  white-space: pre-wrap;
}
</style>
