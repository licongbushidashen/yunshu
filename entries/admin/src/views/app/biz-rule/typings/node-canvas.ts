import * as WorkflowNamespace from '@/typings/workflow';
import * as TraceType from '@/typings/traceType';
import { LINE } from '@/typings/line';
import WorkflowBase from '@/common/workflow/WorkflowBase';
// import Line from '@/common/workflow/Line';
import Line from './Line';
import TraceManager from '@/common/workflow/workflowTrace';
import { redrawOnActivityChange } from '@/common/workflow/controllers/line';

import { NodeType } from './node-type';

export default class NodeCanvas extends WorkflowBase {
  constructor(workflowCode: string) {
    super();
    if (workflowCode) {
      this.workflowCode = workflowCode;
    }
  }

  NewShapeID: number = 0;
  ActivityID: number = 0;
  workflowCode: string = '';
  activities: Array<WorkflowNamespace.Activity> = [];
  lines: Array<Line> = [];
  activityCodeArr: Array<string> = [];
  StorePath: string = 'Apps/BizRule'; // vuex workflow模块层级

  // lines: Array<LINE.config> = [];

  // 初始默认配置
  defaultActivitySettings: WorkflowNamespace.defaultActivitySettings = {
    start: {
      left: 327,
      top: 36,
      x: 327,
      y: 36,
      width: 158,
      height: 40,
      right: 358,
      bottom: 110,
      center: 279,
      middle: 90,
      WorkflowElementType: 'Activity',
      activityName: '开始'
    },
    fillsheet: {
      left: 327,
      top: 116,
      x: 327,
      y: 116,
      width: 158,
      height: 40,
      right: 358,
      bottom: 210,
      center: 279,
      middle: 190,
      WorkflowElementType: 'Activity',
      activityName: '填写申请单'
    },
    approve: {
      left: 327,
      top: 196,
      x: 327,
      y: 196,
      width: 158,
      height: 40,
      right: 358,
      bottom: 310,
      center: 279,
      middle: 290,
      WorkflowElementType: 'Activity',
      activityName: '审批'
    },
    end: {
      left: 327,
      top: 276,
      x: 327,
      y: 276,
      width: 158,
      height: 40,
      right: 358,
      bottom: 410,
      center: 279,
      middle: 390,
      WorkflowElementType: 'Activity',
      activityName: '结束'
    }
  }

  // methods
  ActivityClone(obj: WorkflowNamespace.Activity): WorkflowNamespace.Activity {
    return JSON.parse(JSON.stringify(obj));
  }

  // 生成NewShapeID
  getNewShapeID(): number {
    if (!this.NewShapeID) {
      this.NewShapeID = 1;
    } else {
      this.NewShapeID += 1;
    }
    return this.NewShapeID;
  }

  getActivityCode(nodeType: NodeType): string {
    let activityCodePrefix = '';
    switch(nodeType) {
      // case NodeType.BizAction:
      //   activityCodePrefix = 'BizAction';
        case NodeType.Message:
          activityCodePrefix = 'Message';
          break;
        case NodeType.Create: 
          activityCodePrefix = 'DataCreate';
          break;
        case NodeType.Update:
          activityCodePrefix = 'DataUpdate';
          break;
        case NodeType.Delete:
          activityCodePrefix = 'DataRemove';
          break;
        case NodeType.LogicVerify:
          activityCodePrefix = 'Logic';
          break;
        case NodeType.BizAction:
          activityCodePrefix = 'DataAction';
        break;
        case NodeType.Assign:
          activityCodePrefix = 'Assign';
        break;
        case NodeType.DataCheck:
          activityCodePrefix = 'DataCheck';
        break;
        case NodeType.ExistVerify:
          activityCodePrefix = 'ExistVerify';
        break;
    }
    this.ActivityID += 1;
    const _acticityCode:string = activityCodePrefix + this.ActivityID;
    if (this.activityCodeArr.indexOf(_acticityCode) !== -1) {
       return this.getActivityCode(nodeType);
    } else {
      return _acticityCode;
    } 
  }

  // 添加活动 只生成一个节点返回出去
  addActivity(activityModel: any) {
    
    let _activity: any = {};
    const activityType: string = activityModel.activityType;
    // switch (activityType) {
    //   case 'START':
    //     _activity = this.ActivityClone(this.StartActivity);
    //     break;
    //   case 'END':
    //     _activity = this.ActivityClone(this.EndActivity);
    //     break;
    //   case 'PARTICIPANT':
    //     _activity = this.ActivityClone(this.UserActivity);
    //     break;
    //   case 'SYSTEM_ACTIVITY':
    //     _activity = this.ActivityClone(this.SysActivity);
    //     break;
    //   case 'SUB_INSTANCE':
    //     _activity = this.ActivityClone(this.SubWorkflow);
    //     break;
    //   case 'CONNECTION':
    //     _activity = this.ActivityClone(this.Connection);
    //     break;
    //   case 'CIRCULATE':
    //     _activity = this.ActivityClone(this.Circulate);
    //     break;
    //   default:
    //     break;
    // }
    // 更改尺寸以及位置坐标
    const ID = this.getNewShapeID();
    console.log('3333', activityModel);
    const _acticityCode: string = this.getActivityCode(activityModel.nodeType);
    Object.assign(_activity, {
      ID,
      WorkflowElementType: 'Activity',
      left: activityModel.x,
      top: activityModel.y,
      x: activityModel.x,
      y: activityModel.y,
      width: activityModel.width,
      height: activityModel.height,
      right: activityModel.x + activityModel.width,
      bottom: activityModel.y + activityModel.height,
      center: activityModel.x + (activityModel.width / 2),
      middle: activityModel.y + (activityModel.height / 2),
      nodeCode: activityModel.activityCode || _acticityCode,
      isSelected: false,
      ...activityModel,
      // participationModel: activityModel.participationModel || 'PARALLEL'
    });
    
    this.activityCodeArr.push(_activity.nodeCode);
    console.log('activityCodeArr', this.activityCodeArr);
    // this.activities.push(_activity);
    return _activity;
  }

  resetWorkflow() {
  }

  // 节点移动
  moveActivity(params: any) {
    const acticitieModel = params.itemData;
    const position = params.activityPosition;
    this.activities.some((e: any) => {
      if (e.nodeCode === acticitieModel.nodeCode) {
        e.left = position.x;
        e.top = position.y;
        return true;
      }
      return false;
    });
  }

  // 移除活动
  removeActivity(activityId: any) {
    if (activityId) {
      console.log('移出一个活动');
    }
  }

  transformPoints(points: Array<string>) {
    const _pointArr: Array<LINE.point> = [];
    points.forEach((point: any) => {
      _pointArr.push({ x: parseInt(point.split(',')[0]), y: parseInt(point.split(',')[1]) });
    });
    return _pointArr;
  }

  // 添加线条，若存在则更新
  addLine(activities: any, rule: any) {
    const _activities = JSON.parse(JSON.stringify(activities));
    const _startActivity = _activities.find((activity: any) =>
      activity.nodeCode === rule.preNode);
    const _endActivity = _activities.find((activity: any) =>
      activity.nodeCode === rule.postNode);
    if (!_startActivity || !_endActivity) {
      return;
    }

    const _points = this.transformPoints(rule.points);
    const _newLine = new Line({
      ID: this.getNewShapeID(),
      points: _points,
      startActivity: _startActivity,
      endActivity: _endActivity,
      startPoint: _points[0],
      endPoint: _points[_points.length - 1],
      code: rule.code,
      text: rule.text,
      // name_i18n: rule.name_i18n,
      // popupType: rule.popupType,
      // utilizeElse: rule.utilizeElse,
      // formula: rule.formula,
    });
    
    return _newLine;
  }

  setSameStyle(sameStyle: string, vm: any) {
    if (vm.selectedActivities && vm.selectedActivities.length > 1) {
      const ObjectAndStates = TraceManager.GetMultiObjAndStates(vm.selectedActivities);
      const SourceStates = ObjectAndStates.States;
      let _TraceType:any = '';
      // 调整活动格式
      switch (sameStyle) {
        case WorkflowNamespace.SameStyle.Left:
        case WorkflowNamespace.SameStyle.Top:
        case WorkflowNamespace.SameStyle.Width:
          {
            const _curActivity = vm.selectedActivities[0];
            const _value = _curActivity.width;
            vm.selectedActivities.forEach((activity: WorkflowNamespace.Activity, index: number) => {
              if (index !== 0) {
                activity.width = _value;
                activity.right = activity.x + activity.width;
                activity.center = activity.x + (activity.width / 2);
                vm.$store.commit(`${this.StorePath}/updateActivityProps`, activity);
              }
            });
            _TraceType = TraceType.Multi.SameWidth;
          }
          break;

        case WorkflowNamespace.SameStyle.Height:
          {
            const _curActivity = vm.selectedActivities[0];
            const _value = _curActivity.height;
            vm.selectedActivities.forEach((activity: WorkflowNamespace.Activity, index: number) => {
              if (index !== 0) {
                activity.height = _value;
                activity.bottom = activity.y + activity.height;
                activity.middle = activity.y + (activity.height / 2);
                vm.$store.commit(`${this.StorePath}/updateActivityProps`, activity);
              }
            });
            _TraceType = TraceType.Multi.SameHeight;
          }
          break;

        case WorkflowNamespace.SameStyle.Size:
          {
            const _curActivity = vm.selectedActivities[0];
            const _height = _curActivity.height;
            const _width = _curActivity.width;
            vm.selectedActivities.forEach((activity: WorkflowNamespace.Activity, index: number) => {
              if (index !== 0) { 
                activity.height = _height; 
                activity.width = _width;
                activity.right = activity.x + activity.width;
                activity.center = activity.x + (activity.width / 2);
                activity.bottom = activity.y + activity.height;
                activity.middle = activity.y + (activity.height / 2);
                vm.$store.commit(`${this.StorePath}/updateActivityProps`, activity);
              }
            });

            _TraceType = TraceType.Multi.SameSize;
          }
          break;
        case WorkflowNamespace.SameStyle.VerticalDistance:
          {
            const _activities = vm.selectedActivities.slice();
            _activities.sort((a: WorkflowNamespace.Activity, b: WorkflowNamespace.Activity) => a.top - b.top);
            let distanceSum = _activities[_activities.length - 1].top - _activities[0].bottom;
            for (let index = 1; index < _activities.length - 1; index++) {
              distanceSum -= _activities[index].height;
            }
            const distanceAvg = distanceSum / (_activities.length - 1);
            _activities.forEach((activity: WorkflowNamespace.Activity, index: number) => {
              if (index > 0 && index !== _activities.length - 1) {
                const top = _activities[index - 1].top + _activities[index - 1].height + distanceAvg;
                activity.top = top;
                activity.y = top;
                activity.bottom = activity.y + activity.height;
                activity.middle = activity.y + (activity.height / 2);
              }
              vm.$store.commit(`${this.StorePath}/updateActivityProps`, activity);
            });

            _TraceType = TraceType.Multi.VerticalDistance;
          }
          break;
        case WorkflowNamespace.SameStyle.HorizontalDistance:
          {
            const _activities = vm.selectedActivities.slice();
            _activities.sort((a: WorkflowNamespace.Activity, b: WorkflowNamespace.Activity) => a.left - b.left);
            let distanceSum = _activities[_activities.length - 1].left - _activities[0].right;
            for (let index = 1; index < _activities.length - 1; index++) {
              distanceSum -= _activities[index].width;
            }

            const distanceAvg = distanceSum / (_activities.length - 1);
            _activities.forEach((activity: WorkflowNamespace.Activity, index: number) => {
              if (index > 0 && index !== _activities.length - 1) {
                const left = _activities[index - 1].left + _activities[index - 1].width + distanceAvg
                activity.left = left;
                activity.x = left;
                activity.right = activity.x + activity.width;
                activity.center = activity.x + (activity.width / 2);
                vm.$store.commit(`${this.StorePath}/updateActivityProps`, activity);
              }
            });

            _TraceType = TraceType.Multi.HorizontalDistance;
          }
          break;
      }

      // 重新绘线
      redrawOnActivityChange(vm.selectedActivities, vm.lines);

      // workflow.autoFit();
      vm.traceManager.AddTrace(_TraceType, vm.selectedActivities, vm.beforeMovedActivities, vm);
    }
  }
}
