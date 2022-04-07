<template>
  <div class="activity-drag-bar" :class="direction">
    <span
      v-if="showCircle"
      :class="`drag-circle drag-circle-${direction}`"
      @click="$emit('onConnectPoint')"
    ></span>
  </div>
</template>

<script lang="ts">
import { LINE } from "@/typings/line";
import * as TraceType from "@/typings/traceType";
import Line from "./typings/Line";
// import Line from '@/common/workflow/Line';
import { Component, Vue, Prop } from "vue-property-decorator";
import { H3AvtivityDraggable } from "@/directives/drag";
import { State, Action, namespace } from "vuex-class";
import { dragToDraw } from "@/common/workflow/controllers/line";
import { NodeType } from "./typings";

// const BizRuleModule = namespace('Apps/Workflow');
const BizRuleModule = namespace("Apps/BizRule");

@Component({
  name: "ActivityDragBar",
})
export default class ActivityDragBar
  extends Vue
  implements H3AvtivityDraggable {
  @BizRuleModule.State("traceManager") traceManager: any;

  @BizRuleModule.State("workflow") workflow: any;

  @BizRuleModule.State("activities") activities: any;

  @BizRuleModule.State("lines") lines: any;

  @BizRuleModule.State("tempLine") tempLine: any;

  @BizRuleModule.Mutation("setTempLine") setTempLine: any;

  @BizRuleModule.Mutation("addLine") addLine: any;

  @Prop() instance: any;

  @Prop() direction: any;

  @Prop() container: any;

  @Prop() showCircle!: boolean;

  resultLine: Line | undefined = undefined;

  onDragstart(evt: DragEvent) {
    if (this.instance.activityType === "END") {
      return;
    }
    // console.log('on drag bar', evt);
    if (this.direction && this.instance) {
      let startPoint;
      let startDirection;
      switch (this.direction) {
        case "top":
          startPoint = {
            x: evt.offsetX + this.instance.left,
            y: this.instance.top,
          };
          startDirection = LINE.ArrowDirection.up;
          break;
        case "bottom":
          startPoint = {
            x: evt.offsetX + this.instance.left,
            y: this.instance.bottom,
          };
          startDirection = LINE.ArrowDirection.down;
          break;
        case "left":
          startPoint = {
            x: this.instance.left,
            y: evt.offsetY + this.instance.top,
          };
          startDirection = LINE.ArrowDirection.left;
          break;
        case "right":
          startPoint = {
            x: this.instance.right,
            y: evt.offsetY + this.instance.top,
          };
          startDirection = LINE.ArrowDirection.right;
          break;
        default:
          break;
      }
      if (!startPoint || !startDirection) {
        return;
      }
      const line = new Line({
        ID: this.workflow.getNewShapeID(),
        startPoint,
        startActivity: this.instance,
        startDirection,
        endActivity: undefined,
        endPoint: undefined,
      });
      this.setTempLine(line);
    }
    this.container.addEventListener("mousemove", this.onDragover);
    document.addEventListener("mouseup", this.onDragend);
    evt.preventDefault();
  }

  onDragover(evt: any) {
    this.resultLine = undefined;
    if (!this.tempLine) {
      return;
    }
    const flag: any = dragToDraw(evt, this.tempLine, this.activities);

    if (
      flag.endActivity &&
      flag.endActivity.nodeCode !== this.instance.nodeCode
    ) {
      const _duplicate = this.lines.some((line: any) => {
        const { startActivity, endActivity } = line;
        if (
          startActivity &&
          endActivity &&
          flag.endActivity &&
          startActivity.nodeCode === this.instance.nodeCode &&
          endActivity.nodeCode === flag.endActivity.nodeCode
        ) {
          return true;
        }
        return false;
      });
      if (!_duplicate) {
        if (
          flag.startActivity &&
          ((flag.startActivity as any).nodeType === NodeType.LogicVerify ||
          (flag.startActivity as any).nodeType === NodeType.ExistVerify ||
            (flag.startActivity as any).nodeType === NodeType.DataCheck)
        ) {
          const startActivity: any = flag.startActivity;
          const startCode = startActivity.nodeCode;
          // 查找以当前线为开始节点为开始节点的线
          const lines = this.lines.filter((res) => {
            return res.startActivity.nodeCode === startCode;
          });
          // 超过两个节点 不允许连线
          if (lines.length >= 2) {
            return;
          }
          if (lines.length === 1) {
            const theLine: any = lines[0];
            if (
              theLine.routeCondition &&
              theLine.routeCondition === 1 &&
              flag.endActivity.nodeCode !== "End" &&
              (flag.startActivity as any).nodeType === NodeType.LogicVerify
            ) {
              return;
            }
          }
          this.resultLine = new Line(flag);
          if (lines.length === 0) {
            (this.resultLine as any).routeCondition = 1;
          } else if (lines.length === 1 && lines[0].routeCondition === 0) {
            (this.resultLine as any).routeCondition = 1;
          } else {
            (this.resultLine as any).routeCondition = 0;
          }
          return;
        }

        this.resultLine = new Line(flag);
      }
    }
    evt.preventDefault();
  }

  onDragend() {
    this.container.removeEventListener("mousemove", this.onDragover);
    document.removeEventListener("mouseup", this.onDragend);
    this.setTempLine(undefined);
    this.$nextTick(() => {
      if (this.resultLine && this.resultLine.endActivity) {
        // console.log(this.resultLine, 'resultline');
        if (
          this.resultLine.startActivity &&
          (this.resultLine.startActivity as any).nodeType ===
            NodeType.LogicVerify
        ) {
          const { startPoint, startDirection, startActivity } = this.resultLine;
          const startCode = this.resultLine.startActivity;
          const lines = this.lines.filter((res) => {
            return res.startActivity.nodeCode === startCode;
          });
          if (lines.length === 0) {
            const endp = this.activities.find(
              (res) => res.nodeType === NodeType.End
            );

            if (
              this.resultLine.endActivity &&
              (this.resultLine.endActivity as any).nodeType !== NodeType.End
            ) {
              const endLine = new Line({
                ID: this.workflow.getNewShapeID(),
                text: "",
                startPoint,
                startActivity,
                startDirection,
                endActivity: endp,
                endPoint: undefined,
              });
              (endLine as any).routeCondition = 0;

              endLine.setProps({
                endPoint: {
                  x: endp.left + endp.width / 2,
                  y: endp.top,
                },
              });
              endLine.setPoints();
              endLine.draw();
              this.addLine(endLine);
            }
          }
        }

        this.addLine(this.resultLine);
        this.resultLine.calcCrossPoints(this.lines);
        /* NOTE: 记录添加线的痕迹管理 */
        this.traceManager.AddTrace(
          TraceType.Line.Add,
          this.resultLine,
          null,
          this
        );
      }
      this.resultLine = undefined;
    });
  }
}
</script>

<style lang="less" scoped>
.activity-drag-bar {
  position: absolute;
  z-index: 9;
  // outline: 1px solid;
  cursor: pointer;
  &.top {
    top: -1px;
    left: 2px;
    right: 2px;
    height: 10px;
  }
  &.bottom {
    bottom: -1px;
    left: 2px;
    right: 2px;
    height: 10px;
  }
  &.left {
    left: -1px;
    top: 2px;
    bottom: 2px;
    width: 10px;
  }
  &.right {
    right: -1px;
    top: 2px;
    bottom: 2px;
    width: 10px;
  }

  .drag-circle {
    width: 5px;
    height: 5px;
    z-index: 991;
    position: absolute;
    cursor: pointer;
    &:after {
      width: 5px;
      height: 5px;
      border: 1px solid #f1aba1;
      border-radius: 50%;
      content: "";
      display: block;
      background: #fff;
    }
    &-left {
      top: 50%;
      left: -2.5px;
      margin-top: -2.5px;
      // &:after {
      //   margin-top: 3px;
      //   margin-left: 6px;
      // }
    }
    &-right {
      top: 50%;
      right: -2.5px;
      margin-top: -2.5px;
      // &:after {
      //   margin-top: 3px;
      // }
    }
    &-top {
      top: -2.5px;
      left: 50%;
      margin-left: -2.5px;
      // &:after {
      //   margin-top: 6px;
      //   margin-left: 3px;
      // }
    }
    &-bottom {
      bottom: -2.5px;
      left: 50%;
      margin-left: -2.5px;
      // &:after {
      //   margin-left: 3px;
      // }
    }
  }
}
</style>
