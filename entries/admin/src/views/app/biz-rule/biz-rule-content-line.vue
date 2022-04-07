<template>
  <div class="lines-wrap">
    <canvas id="canvas"></canvas>
    <svg class="lines-instance" style="width:100%;height:100%;">
      <!-- 基础定义 -->
      <defs>
        <filter
          x="0"
          y="0"
          width="1"
          height="1"
          id="solid">
          <feFlood flood-color="white" />
          <feComposite in="SourceGraphic" />
        </filter>
      </defs>
      <!-- 每条存储线条的渲染绘制 -->
      <template v-for="(line,index) in lines">
        <!-- 线条 -->
        <path
          :key="`handler-${index}`"
          :class="{'selected':line.isSelected,'handler':!disabled}"
          fill="none"
          stroke="transparent"
          stroke-width="15"
          :d="line.Path"
          @click="selectLine(line)"
          @contextmenu="lineContextmenu($event,line)"
        />
        <path
          :key="`path-${index}`"
          :stroke="lineColor"
          :d="line.Path"
          :stroke-dasharray="(line.formula || line.utilizeElse) ? '5,5' : ''"
          fill="none"
          stroke-width="1"
        />
        <!-- 箭头 -->
        <polygon
          :key="`arrow-${index}`"
          :fill="lineColor"
          fill-opacity="1"
          :stroke="lineColor"
          stroke-width="1"
          :points="line.Arrow"
        />
        <!-- 文字 -->
        <!-- <text
          :key="`text-${index}`"
          v-if="line.text"
          :x="line.textPosition.x"
          :y="line.textPosition.y"
          filter="url(#solid)"
        >{{ line.text }}</text>-->
      </template>
      <!-- </g> -->
      <!-- 临时线条的渲染 -->
      <g v-if="tempLine" class="line-rect">
        <!-- 线条 -->
        <path
          class="temp"
          fill="white"
          fill-opacity="0"
          :stroke="lineColor"
          stroke-width="1"
          :d="tempLine.Path"
        />
        <!-- 箭头 -->
        <polygon
          class="temp"
          :fill="lineColor"
          fill-opacity="1"
          :stroke="lineColor"
          stroke-width="1"
          :points="tempLine.Arrow"
        />
      </g>
    </svg>

    <!-- 连接线控制点 -->
    <p v-show="handlerPoints.length">
      <line-handler
        v-for="(point, j) in handlerPoints"
        :key="`handler-${j}`"
        :position="point"
        :index="j"
        v-h3-drag
      />
    </p>
    <!-- 文字拖拽点 -->
    <template v-for="(line,index) in lines">
      <div
        :key="`text-${index}`"
        :style="`left: ${line.textPosition.x}px;top: ${line.textPosition.y}px;position: absolute`"
        filter="url(#solid)"
        v-if="line.startActivity && (line.startActivity.nodeType === 'LOGIC_VERIFY' || line.startActivity.nodeType === 'DATA_CHECK'|| line.startActivity.nodeType === 'EXIST_VERIFY')"
      >
        <!-- :disabled="true" -->
        <a-select show-search style="width: 64px" v-model="line.routeCondition" :disabled="true">
          <a-select-option :value="1">是</a-select-option>
          <a-select-option :value="0">否</a-select-option>
        </a-select>
      </div>
      <!-- <line-text
        :key="`text-handler-${index}`"
        v-if="line.text || line.name_i18n[$i18n.locale]"
        :line="line"
        :dom="dom"
        @click="storeProperty(line)"
      /> -->
    </template>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Watch, Prop
} from 'vue-property-decorator';
import { State, Action, namespace } from 'vuex-class';
// import Line from '@/common/workflow/Line';
import Line from './typings/Line';
import { Activity } from '@/typings/workflow';
import { LINE } from '@/typings/line';
import { moveSegment, moveEnd, moveStart } from '@/common/workflow/controllers/line';
import * as TraceType from '@/typings/traceType';
import Bus from '@/utils/bus';

import LineHandler from './line-handler.vue';
import LineText from './lineText.vue';
import { NodeType } from './typings';

const BizRuleModule = namespace('Apps/BizRule');
// const BizRuleModule = namespace('Apps/Workflow');

interface Operate {
  oldLine?: Line,
  oldLines: Array<Line>,
  line?: Line,
  point?: LINE.handlerPoint,
  isStart: boolean,
  isEnd: boolean,
}

@Component({
  name: 'LinesInstance',
  components: {
    LineHandler,
    // LineText
  }
})

export default class LinesInstance extends Vue {
  @BizRuleModule.State('lines') lines: any;

  @BizRuleModule.State('activities') activities: any;

  @BizRuleModule.State('tempLine') tempLine: any;

  @BizRuleModule.State('traceManager') traceManager: any;

  @BizRuleModule.State('curActivityID') curActivityID: any;

  @BizRuleModule.State('curComponent') curComponent: any;

  @BizRuleModule.State('curActivityProps') curActivityProps: any;

  @BizRuleModule.State('selectedActivities') selectedActivities: any;

  @BizRuleModule.Mutation('setTempLine') setTempLine: any;

  @BizRuleModule.Mutation('setLines') setLines: any;

  @BizRuleModule.Mutation('showPropertyPanel') showPropertyPanel: any;

  @BizRuleModule.Mutation('unSelect') unSelect: any;

  @BizRuleModule.Action('transformData') transformData: any;

  @Prop() dom: any;

  @Prop({default:false}) disabled?: boolean;//默认不禁用可操作功能

  /* 连接线颜色 */
  lineColor: string = '#17bc94';

  operate:any = {
    /* 操作线之前将线的状态和数组缓存起来 */
    oldLine: undefined,
    oldLines: [],
    /* 当前操作的线的信息 */
    line: undefined,
    /* 当前操作的控制点 */
    point: undefined,
    /* 是否拖拽了起点 */
    isStart: false,
    /* 是否拖拽了终点 */
    isEnd: false,
    isLogic: false
  }

  previous: any = null;

  mounted() {
    Bus.$on('startDragHandler', this.startDragLine);
  }

  beforeDestroy() {
    Bus.$off('startDragHandler');
  }

  selectLine(line: Line) {
    if(this.disabled){
      return;
    }
    const flag = line.isSelected;
    this.clearTempLine();
    /* 存储当前的连接线的属性 */
    this.storeProperty(line);
    this.$nextTick(() => {
      if (flag) {
        line.Unselect();
      } else {
        line.select();
        /* 保存当前的连接线状态 */
        this.operate.oldLine = JSON.parse(JSON.stringify(line));
        this.operate.oldLines = JSON.parse(JSON.stringify(this.lines));
        /* 标明操作线 */
        this.operate.line = line;
      }
    });
  }

  storeProperty(line: Line) {
    if (line.ID) {
      // console.log('存储线属性', line.ID);
      this.transformData({ activityID: line.ID, type: 'line' });
      this.showPropertyPanel('LineProperty');
    }
  }

  clearTempLine() {
    this.lines.forEach((l: Line) => l.Unselect());
    this.operate = {
      oldLine: undefined,
      oldLines: [],
      line: undefined,
      point: undefined,
      isStart: false,
      isEnd: false,
      isLogic: false
    };
  }

  /*  ///////////////// 调整连接线相关 --- Start //////////////////////  */

  startDragLine(evt: DragEvent, point: LINE.handlerPoint, index: number) {
    evt.preventDefault();
    evt.stopPropagation();
    this.operate.point = point;
    if (this.operate.line) {
      const { line: { startActivity, endActivity, routeCondition } } = this.operate;
      this.operate.isStart = !!(index === 0 && point.Activity && startActivity && point.Activity.ID === startActivity.ID);
      if (endActivity.nodeType === NodeType.End && routeCondition === 0 && startActivity.nodeType === NodeType.LogicVerify) {
        this.operate.isLogic = true;
      }
  
      this.operate.isEnd = !!(index !== 0 && point.Activity && endActivity && point.Activity.ID === endActivity.ID);
    }
    /* 监听移动 */
    this.dom.addEventListener('mousemove', this.draggingLine);
    document.addEventListener('mouseup', this.endDragLine);
  }

  /**
   * 拖拽绘线，实时重绘
   */
  async draggingLine(evt: any) {
    /* 频繁触发节流 */
    let throttle: boolean = true;
    const remind: number = 15;

    if (throttle) {
      // 节流
      const currentTime: any = Date.now();
      if (this.previous) {
        const diff: number = currentTime - this.previous;
        if (diff < remind) {
          return;
        }
      }
      this.previous = currentTime;
    }
    /* 节流通过，执行绘制 */
    const {
      point, line, isStart, isEnd
    } = this.operate;
    if (!point || !line || !this.operate.point) {
      return;
    }
    let _point: any = null;
    if (isStart) {
      _point = await moveStart(evt, line, this.activities);
    } else if (isEnd) {
      _point = await moveEnd(evt, line, this.activities);
    } else {
      _point = await moveSegment(evt, point, line, this.lines);
    }
    // console.log(_point);
    if (_point && _point.x !== undefined && _point.y !== undefined) {
      this.operate.point.x = _point.x;
      this.operate.point.y = _point.y;
      this.operate.point.Activity = _point.Activity;
      Bus.$emit('setPosition', _point);
      line.redraw(this.lines);
    }
    evt.preventDefault();
    evt.stopPropagation();
  }

  endDragLine() {
    this.dom.removeEventListener('mousemove', this.draggingLine);
    document.removeEventListener('mouseup', this.endDragLine);
    /* 判断移动后的线段是否符合条件 */
    const line:any = this.operate.line;
    const startActivity = line.startActivity;
    //不能把逻辑连线拖到某个节点，使得两个节点之间同时有两条逻辑连线
    console.log(line.startActivity.ID,line.endActivity.ID);
    let flag = this.lines.map(item=>`${item.startActivity.ID}-${item.endActivity.ID}`);
    if(flag.length!==[...new Set(flag)].length){
      this.resetLine();
    }
    if ((this.operate.isStart || this.operate.isEnd) && this.operate.point && this.operate.point.Activity === undefined) {
      this.resetLine();
    } else if (this.operate.isLogic) {
      const endActivity:any = line.endActivity;
      if (line && startActivity && startActivity.nodeType !== NodeType.LogicVerify && startActivity.nodeType !== NodeType.DataCheck && startActivity.nodeType !== NodeType.ExistVerify) {
        this.resetLine();
      }
      if (line && line.routeCondition === 0 && endActivity.nodeType !== NodeType.End) {
        this.resetLine();
      }
      
    } else if (line && startActivity && startActivity.nodeType === NodeType.LogicVerify && startActivity.nodeType !== NodeType.DataCheck&& startActivity.nodeType !== NodeType.ExistVerify) {
      if ((line as any).routeCondition === undefined) {
        const logicLine = this.operate.oldLines.filter(res => {
          return res.startActivity.nodeCode === startActivity.nodeCode;
        })
        if (logicLine.length === 0 ) {
          (line as any).routeCondition = 1;
        } else if (logicLine.length === 1 && logicLine[0].routeCondition === 0) {
          (line as any).routeCondition = 1;
        } else {
          (line as any).routeCondition = 0;
        }
      }
      this.renewLine();
    } else {
      this.renewLine();
    }
  }

  renewLine() {
    if (!this.operate.line) {
      return;
    }
    const { ID } = this.operate.line;
    this.lines.some((l: Line) => {
      if (l.ID === ID) {
        /* 记录更新的线 */
        this.traceManager.AddTrace(TraceType.Line.PointChange, l, this.operate.oldLine, this);
        return true;
      }
      return false;
    });
    /* 清除缓存的连接线 */
    this.clearTempLine();
  }

  resetLine() {
    /* 恢复线条 */
    if (this.operate.oldLine && this.operate.line) {
      const {
        ID,
        startActivity,
        startPoint,
        endActivity,
        endPoint,
        points,
        startDirection,
        endDirection,
        textPosition,
       
      } = this.operate.oldLine;
      this.operate.line.setProps({
        // ...this.operate.oldLine
        startActivity,
        startPoint,
        endActivity,
        endPoint,
        points,
        textPosition,
        
        endDirection
      } as any);
      if (startActivity && startActivity.activityType === 'START') {
        this.operate.line.setProps({
          startDirection,
          endDirection
        });
      }
      this.operate.line.draw();
    }
    /* 重置线段 */
    this.clearTempLine();
  }
  /*  ///////////////// 调整连接线相关 --- END ///////////////////////  */

  lineContextmenu(e: any, line: Line) {
    if (this.selectedActivities.length) {
      this.unSelect(); // 取消所有节点的选中
    }
    this.lines.forEach((l: Line) => {
      // 取消所有线的选中
      if (l.ID === line.ID) {
        l.select();
      } else {
        l.Unselect();
      }
    });
    this.$emit('contextmenu', line, e);
    e.preventDefault();
  }

  @Watch('curComponent')
  onComponentChange(v: string) {
    if (v !== 'LineProperty') {
      this.clearTempLine();
    }
  }

  get handlerPoints() {
    if (this.operate.line && this.operate.line.handlerPoints && !this.disabled) {
      return this.operate.line.handlerPoints;
    }
    return [];
  }
}
</script>

<style lang="less">
.lines-wrap {
  height: 100%;
  .lines-instance {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    min-width: 100%;
    min-height: 100%;
    &:not(:root) {
      overflow: visible;
      // z-index: 10;
    }
    // text {
    //   font-size: 14px;
    //   line-height: 1;
    // }
    path:not(.handler),
    polygon {
      cursor: pointer;
      pointer-events: none;
    }
    .handler {
      position: relative;
      z-index: 10;
      cursor: pointer;
      &.selected,
      &:hover {
        & + path {
          stroke: @primary-color;
          stroke-width: 2px;
          & + polygon {
            stroke-width: 2px;
            fill: @primary-color;
            stroke: @primary-color;
          }
        }
      }
    }
  }
}
</style>
