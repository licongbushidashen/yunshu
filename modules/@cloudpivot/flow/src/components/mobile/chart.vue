<template>
  <div class="flow-track-chart" @touchstar.stop>
    <div class="flow-track-chart__explain">
      <div class="flow-track-chart__explain-item">
        <i class="flow-track-chart__finish"></i>
        <span>{{ $t('cloudpivot.flow.mobile.FinishNode') }}</span>
      </div>
      <div class="flow-track-chart__explain-item">
        <i class="flow-track-chart__processing"></i>
        <span>{{ $t('cloudpivot.flow.mobile.ProcessNode') }}</span>
      </div>
      <div class="flow-track-chart__explain-item">
        <i class="flow-track-chart__wrong"></i>
        <span>{{ $t('cloudpivot.flow.mobile.WrongNode') }}</span>
      </div>
      <div class="flow-track-chart__explain-item">
        <i class="flow-track-chart__default"></i>
        <span>{{ $t('cloudpivot.flow.pc.UnstartNode') }}</span>
      </div>
    </div>
    <div
      ref="drawer"
      class="flow-track-chart__drawer"
      @touchstart.prevent.stop="touchstart"
      @touchmove.prevent.stop="touchmove"
      @touchend.prevent.stop="touchend"
    >
      <workflow-designer
        v-if="chart"
        :size="chartLayerStyle"
        :style="serializedChartStyle"
        :lineColor="'#666666'"
        :flowData="chart"
        :flowStatus="flowNodeStatus"
        :workflowStatus="workflowStatus"
        :chartOptions="chartOptions"
        @onActivity="clickActivity"
        @touchstart.prevent
        @touchmove.prevent
      />
    </div>

    <!-- 操作引导 -->
    <div
      class="chart-guide"
      v-if="!hasGuide"
      @click="hideGuide"
    >
      <div class="guide-content">
        <img src="./images/guide.png"/>
        <p>{{ $t('cloudpivot.flow.mobile.chartTips') }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import flowDrawer from '@cloudpivot/flow-drawer';
import { setGesture } from './touch-scale';
import { workflowApi } from '@cloudpivot/api';
import common from '@cloudpivot/common';

@Component({
  name: 'workflow-chart',
  components: {
    WorkflowDesigner: flowDrawer.components.WorkflowDesigner
  }
})
export default class WorkflowChart extends Vue {
  @Prop() workflowStatus?: string;
  @Prop() show!: Boolean;

  // 数据
  chart:any = null;
  chartSize:any;
  chartOptions:any = { clickable:false };
  hasGuide:any = false;
  // 比例
  viewScale:any = 1; // 初始缩放比例
  maxScale:number = 1.2; // 最大放大比例
  minScale:number = 0.3; // 最大缩小比例
  endScale:number = 1; // 缩放后的比例
  // 流程图样式
  chartLayerStyle:any = {};

  /**
   * 获取流程节点状态
   */
  get flowNodeStatus() {
    const flowStatus: any = [];
    if (this.chart && this.chart.activityStatus) {
      this.chart.activityStatus.forEach((activity: any) => {
        let status = '';
        switch (activity.status) {
          case 0:
            status = 'finish';
            break;
          case 1:
            status = 'processing';
            break;
          case 2:
            status = 'wrong';
            break;
          default:
            break;
        }
        flowStatus.push({ activityCode: activity.activityCode, status });
      });
    }
    return flowStatus;
  }


  created() {
    this.onShowChange(true);
  }

  // 居中
  makeChartCenter() {
    this.chartLayerStyle = this.initChartLayerStyle();
    this.setMaxOffset(this.chartLayerStyle.scale);
    this.$nextTick(this.$h3.toast.hide);
  }

  @Watch('show')
  onShowChange(val:boolean) {
    if ( !val ) return;
    if ( !!this.chart ) {
      this.$nextTick(this.makeChartCenter);
      return;
    }

    this.$h3.toast.show({iconType:'loading', duration:99999999});

    workflowApi.getWorkflowChart({ workflowInstanceId:this.$route.params.workflowInstanceId })
    .then((resp:any)=>{
      if ( resp.errcode!==0 ) throw resp.errmsg;
      if ( !resp || !resp.data || typeof(resp.data)!=='object' || !Array.isArray(resp.data.activities) ) throw '找不到流程节点信息';

      let vMax=0,hMax=0,value;
      resp.data.activities.forEach((item:any) => {
        // 记录横向和纵向的最大值, 用以做缩放处理
        if ( (value=item.x+item.width)>hMax ) hMax=value;
        if ( (value=item.y+item.height)>vMax ) vMax=value;
        // 兼容处理(多语言)
        item = common.utils.compatible(item, 'activityName');
      });
      // 赋值
      this.chart = resp.data;
      // (window as any).___at___chart = resp.data;
      // 计算样式
      this.makeChartCenter();
    })
    .catch(err=>this.$h3.toast.show({text:err.toString()}));
  }



  // 获取流程图尺寸
  drawerWrapper:any;
  initChartLayerStyle(isFullScreen?:boolean) {
    // 1. 水平最大值和垂直最大值
    let width=0, height=0, tempVal;
    (this.chart.activities||[]).forEach((item:any) => {
      if ( (tempVal=item.x+item.width)>width ) width=tempVal;
      if ( (tempVal=item.y+item.height)>height ) height=tempVal;
    });
    // 因为这里的最大宽高只取 activity, 考虑到有线的存在, 宽高需要+=120
    // width+=120;
    // height+=120;

    (this.chart.rules||[]).forEach((item:any) => {
      const { points } = item; // ['1, 2', '3, 4'];
      if (!points) return;
      const newp:any = [];
      points.forEach((point:any) => { // '1, 2'
        let temArr:Array<any> = [];
        const str2Arr:any = point.split(',');
        if ( (tempVal = parseInt(str2Arr[0], 10)) > width)  width=tempVal;
        if ( (tempVal = parseInt(str2Arr[1], 10)) > height)  height=tempVal;
      })
    });


    width+=350;
    height+=350;

    // 2. 缩放
    let wrapper       = this.drawerWrapper || (this.drawerWrapper=this.$el.querySelector('.flow-track-chart__drawer') as any);
    let wrapperOffset = 35;   // 增加侧边的偏移, 计算合适的偏移让初始缩放不碰到边
    let wrapperWidth  = wrapper.clientWidth - wrapperOffset;
    let wrapperHeight = wrapper.clientHeight - 30;
    let baseOnWidth   = wrapperWidth / wrapperHeight < width / height;
    let scale         = baseOnWidth? +(wrapperWidth/width).toFixed(2): +(wrapperHeight/height).toFixed(2);
    let minScale      = 0;
    let maxScale      = 0;

    // 不支持缩放
    if ( scale>1 ) {
      maxScale = scale;
      scale =
      minScale = 1;
    }
    else {
      minScale = scale;
      maxScale = 1;
    }


    // 3. 位置偏移
    let offsetLeft = -(width-wrapperWidth-wrapperOffset) / 2;
    let offsetTop  = -(height-wrapperHeight-wrapperOffset) / 2;

    // 5. 根据缩放比例重置节点的left值
  

    // if ((width * scale) <= wrapperWidth) {
    //   (this.chart.activities||[]).forEach((item:any) => {
    //     item.x = item.x * scale;
    //   });

    //   // 6. 调整线
    //   (this.chart.rules||[]).forEach((item:any) => {
    //     const { points } = item; // ['1, 2', '3, 4'];
    //     if (!points) return;
    //     const newp:any = [];
    //     points.forEach((point:any) => { // '1, 2'
    //       let temArr:Array<any> = [];
    //       const str2Arr:any = point.split(',');
    //       temArr = [ parseInt(str2Arr[0], 10) * scale + wrapperOffset, str2Arr[1] ];
    //       newp.push(temArr.join(','))
    //     })
    //     item.points = newp;
    //   });
    // }

    // 返回
    return {
      // 流程图实际宽高
      width, height,
      // 容器宽高&侧边偏移
      wrapperWidth,
      wrapperHeight,
      wrapperOffset:100,
      // 偏移
      centerOffsetLeft:offsetLeft,
      centerOffsetTop:offsetTop,
      offsetLeft,
      offsetTop,
      // 初始为了绝对居中要做的上下或左右偏移
      baseOnWidth,
      initCenterOffsetLeft:baseOnWidth? 0: (wrapperWidth - scale*width) / 2,
      initCenterOffsetTop:baseOnWidth? (wrapperHeight-scale*height) / 2: 0,
      // NOTE: pc端可以按照固定比例(step)进行缩放, 但移动端需要计算手指移动的距离去动态计算step, 才能做到"跟手指"
      scale,
      initScale:scale,
      minScale,
      maxScale,
      scaleStep:0.1,
    };
  }
  // 获取流程图详细样式
  get serializedChartStyle() {
    let { width,height,offsetLeft,offsetTop,scale,hidden } = this.chartLayerStyle;

    return hidden? {
      width: width + 'px',
      height:height + 'px',
      opacity:0,
    }: {
      width: width + 'px',
      height:height + 'px',
      transform:`translate3d(${offsetLeft}px,${offsetTop}px,0) scale(${scale})`,
      transformOrigin:'center center',
    }
  }

  // 拖拽事件
  isDragging=false;
  dragStarX:number=0;
  dragStarY:number=0;
  dragOrigL:number=0;
  dragOrigT:number=0;
  isInitStatus:boolean = true; // 解决第一次加载进来触摸的时候流程图偏移
  touchstart(e) {
    // TODO: 鼠标是否有不同平台/浏览器的兼容问题?
    // cancelAnimationFrame( this.touching.slideTimer );
    if (!this.isInitStatus) {
      this.stopNaturalScrolling();
    } 
    let fingers = e.changedTouches;
    let finger  = fingers[0];
    this.isDragging = true;
    this.dragStarX = this.touching.prevX = finger.pageX;
    this.dragStarY = this.touching.prevY = finger.pageY;
    this.dragOrigL = this.chartLayerStyle.offsetLeft;
    this.dragOrigT = this.chartLayerStyle.offsetTop;
    if (!this.isInitStatus) {
      this.isInitStatus = false;
    } 
  }

  startMaxFingerDistance:number = 0;
  preMaxFingerDistance:number = 0;
  touchmove(e) {
    let fingers = e.touches;
    let fingerLen = fingers.length;
    let touching  = this.touching;

    if ( fingerLen>1 ) {
      if ( !this.startMaxFingerDistance ) {
        this.startMaxFingerDistance =
        this.preMaxFingerDistance = this.getMaxFingerDistance(fingers);
      }

      this.isDragging = false;
      touching.powerY = touching.powerY = 0;
      this.zoom(e, fingers);
    } else {
      // 如果是从zoom转为drag, 需要重新确定锚点
      if ( !this.isDragging ) {
        this.touchstart(e);
        return;
      }
      // if ( !this.isDragging ) return;
      this.dragmove(e, fingers[0])
    }
  }
  touchend(e) {
    this.isDragging = false;
    this.startMaxFingerDistance =
    this.preMaxFingerDistance = 0;

    console.log( this.touching.powerX, this.touching.powerY )

    // 调用滚动 & 回弹
    this.naturalScrolling();
  }
  // 拖拽
  dragmove(e, finger) {
    if ( !this.isDragging ) return;

    let touching = this.touching;
    let { prevX,prevY,powerX,powerY } = touching;
    let pageX = finger.pageX,
        pageY = finger.pageY;
    let dragDistX = this.dragOrigL + pageX - this.dragStarX;
    let dragDistY = this.dragOrigT + pageY - this.dragStarY;

    let layerStyle = this.chartLayerStyle;
    let { maxOffsetLeft,maxOffsetRight,maxOffsetTop,maxOffsetBottom } = layerStyle;

    // 检查限定值, 并重新设置起始点(免得被限制的移动也保存下来)
    if ( dragDistX < maxOffsetLeft ) {
      this.dragStarX = pageX;
      this.dragOrigL = dragDistX = maxOffsetLeft;
    }
    else if ( dragDistX > maxOffsetRight ) {
      this.dragStarX = pageX;
      this.dragOrigL =
      dragDistX = maxOffsetRight;
    }
    if ( dragDistY < maxOffsetTop ) {
      this.dragStarY = pageY;
      this.dragOrigT = dragDistY = maxOffsetTop;
    }
    else if ( dragDistY > maxOffsetBottom ) {
      this.dragStarY = pageY;
      this.dragOrigT = dragDistY = maxOffsetBottom;
    }


    touching.powerX = pageX - prevX;
    touching.powerY = pageY - prevY;
    touching.prevX  = pageX;
    touching.prevY  = pageY;
    layerStyle.offsetLeft = dragDistX;
    layerStyle.offsetTop  = dragDistY;
  }

  // 自然滚动
  touching:any = {
    isDraging:false,
    // outerWrapper,
    // innerWrapper,
    // style,
    // clientWidth,
    // clientHeight,
    // slideWidth,
    // slideHeight,
    // 相关系数 弹性, 摩擦力(必须大于0小于1)
    elasticX: 84,
    elasticY: 150,
    frictionX: 0.5,
    frictionY: 0.7,
    // 触摸事件
    startX:0, // 开始触摸位置
    startY:0,
    offsetX : 0,  // 最终偏移
    offsetY : 0,
    startT:0,
    // 移动
    prevX:0,  // 移动的位置
    prevY:0,
    posX    : 0,   // 移动距离-偏移=最终位置
    posY    : 0,
    // minPosX : 0,
    // maxPosX : clientWidth - slideWidth,
    // minPosY : 0,
    // maxPosY : clientHeight - slideHeight,
    // 滑动
    powerX:0, // 力度
    powerY:0,
    // 回弹
    backPosX: 0,
    backPosY: 0,
    // 计数器
    slideTimer:0,
    rebounceXTimer:0,
    rebounceYTimer:0
  }
  naturalScrolling() {
    let touching = this.touching;
    let layerStyle = this.chartLayerStyle;
    let {
      offsetLeft:posX, offsetTop:posY,
      maxOffsetLeft:minPosX, maxOffsetRight:maxPosX, maxOffsetTop:minPosY, maxOffsetBottom:maxPosY,
      width, height, scale
    } = layerStyle;
    let {
      powerX,powerY,
      frictionX,frictionY,elasticX,elasticY,
      style
    } = touching;
    let { clientWidth, clientHeight } = this.drawerWrapper;
    let slideWidth  = width * scale,
        slideHeight = height * scale;

    // console.log('_______e')
    // console.log( minPosX, maxPosX, ', ', minPosY, maxPosY )
    // console.log( clientWidth, clientHeight, slideWidth, slideHeight );

    // return;

    console.log( powerX, powerY )


    powerX *= 0.93;
    powerY *= 0.93;

    if ( powerX!==0 ) {
      if ( powerX<1 && powerX>-1 ) {
        powerX = 0;
      }
      if ( posX<minPosX ) {
        powerX = 0;
        posX = minPosX;
      }
      else if ( posX>maxPosX ) {
        powerX = 0;
        posX = maxPosX;
      }
    }

    // 纵向力竭或越界
    if ( powerY!==0 ) {
      if ( powerY<1 && powerY>-1 ) {
        powerY = 0;
      }
      if ( posY<minPosY ) {
        powerY = 0;
        posY = minPosY;
      }
      else if ( posY>maxPosY ) {
        powerY = 0;
        posY = maxPosY;
      }

    }


    if ( powerX===0 && powerY===0 ) {
      this.stopNaturalScrolling();
    }
    else {
      // 惯性滑动衰减
      posX += powerX;
      posY += powerY;
      // style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
      touching.slideTimer = requestAnimationFrame( this.naturalScrolling );
    }

    touching.posX = layerStyle.offsetLeft = posX;
    touching.posY = layerStyle.offsetTop  = posY;
    touching.powerX = powerX;
    touching.powerY = powerY;


    // console.log( powerX, powerY )

  }
  stopNaturalScrolling() {
    let layer    = this.chartLayerStyle;
    let touching = this.touching;
    let { posX, posY, slideTimer, style } = touching;
    touching.powerX  = touching.powerY = 0;
    layer.offsetLeft = touching.offsetX = touching.posX = posX;// = Math.round(posX);
    layer.offsetTop  = touching.offsetY = touching.posY = posY;// = Math.round(posY);
    cancelAnimationFrame( slideTimer );
  }
  // 回弹
  rebounce() {
    // console.log('____rebounce')
  }

  // 缩放
  zoomWrapper:any;
  zoomWrapperPageOffsetLeft:number =0;
  zoomWrapperPageOffsetTop:number = 44;
  zoomWrapperCenterX:number = 0;
  zoomWrapperCenterY:number = 0;
  // zoomOrigin:any;
  zoomPreMoveDistance:number =0;
  zoom(e:any, fingers:any) {

    let layerStyle  = this.chartLayerStyle;

    // 当前画布数据
    let { width, height, scale, minScale, maxScale, scaleStep, centerOffsetLeft, centerOffsetTop, offsetLeft, offsetTop } = layerStyle;

    // 画布缩放大小及其中心偏移
    let canvasWidth  = width * scale,
        canvasHeight = height * scale,
        canvasCenterW = width * scale / 2,
        canvasCenterH = height * scale / 2;

    // 已手动调整的偏移量
    let movingLeft = centerOffsetLeft-offsetLeft,
        movingTop  = centerOffsetTop-offsetTop;

    // 容器及其位置
    let layerX = [].reduce.call(fingers,(s,c,i)=>s+c.pageX,0)/fingers.length,
        layerY = [].reduce.call(fingers,(s,c,i)=>s+c.pageY,0)/fingers.length - this.zoomWrapperPageOffsetTop,
        layerCenterX = this.zoomWrapperCenterX || (this.zoomWrapperCenterX=(this.zoomWrapper||(this.zoomWrapper=this.$el.querySelector('.flow-track-chart__drawer'))).clientWidth / 2),
        layerCenterY = this.zoomWrapperCenterY || (this.zoomWrapperCenterY=(this.zoomWrapper||(this.zoomWrapper=this.$el.querySelector('.flow-track-chart__drawer'))).clientHeight / 2);


    // 鼠标对于画布的偏移+历史偏移
    let mouseOffsetX = layerX - layerCenterX + movingLeft,
        mouseOffsetY = layerY - layerCenterY + movingTop,
        mouseOffsetXScale = mouseOffsetX / canvasWidth * 2,
        mouseOffsetYScale = mouseOffsetY / canvasHeight * 2;


    if ( mouseOffsetXScale>1 ) mouseOffsetXScale = 1;
    else if ( mouseOffsetXScale<-1 ) mouseOffsetXScale = -1;
    if ( mouseOffsetYScale>1 ) mouseOffsetYScale = 1;
    else if ( mouseOffsetYScale<-1 ) mouseOffsetYScale = -1;


    // 手指缩放的距离, 取最大移动
    let zoomDistance = this.getMaxFingerDistance(fingers);
    let zoomDistanceOffset = zoomDistance - this.preMaxFingerDistance;
    let zoomScaleInRealSize = zoomDistanceOffset / Math.max(width, height) * 10;
    this.preMaxFingerDistance = zoomDistance;

    if ( zoomDistanceOffset === 0 ) return;

    // 缩放
    if ( zoomDistanceOffset > 0 ) {
      if ( scale + zoomScaleInRealSize > maxScale ) zoomScaleInRealSize = maxScale - scale;
    }
    else if ( zoomDistanceOffset < 0 ) {
      if ( scale + zoomScaleInRealSize < minScale ) zoomScaleInRealSize = -(scale - minScale);
    }


    // 实际需要偏移位置
    let scaleLeft = offsetLeft - width * zoomScaleInRealSize/2 * mouseOffsetXScale,
        scaleTop  = offsetTop - height * zoomScaleInRealSize/2 * mouseOffsetYScale;
    scale = scale + zoomScaleInRealSize;

    // 根据缩放, 计算最大偏移值
    this.setMaxOffset(scale);

    // 检查限定值
    let { maxOffsetLeft,maxOffsetRight,maxOffsetTop,maxOffsetBottom } = layerStyle;
    if ( scaleLeft < maxOffsetLeft ) scaleLeft = maxOffsetLeft;
    else if ( scaleLeft > maxOffsetRight ) scaleLeft = maxOffsetRight;
    if ( scaleTop < maxOffsetTop ) scaleTop = maxOffsetTop;
    else if ( scaleTop > maxOffsetBottom ) scaleTop = maxOffsetBottom;

    // 做放大和偏移
    layerStyle.offsetLeft = scaleLeft;
    layerStyle.offsetTop  = scaleTop;
    layerStyle.scale = scale;
  }
  // 获取最大的手指移动距离(作为缩放基准)
  getMaxFingerDistance(fingers) {
    let minFingerX, maxFingerX, minFingerY, maxFingerY;
    [].forEach.call(fingers, (t,i)=>{
      minFingerX = minFingerX? Math.min(t.pageX, minFingerX): t.pageX
      minFingerY = minFingerY? Math.min(t.pageY, minFingerY): t.pageY
      maxFingerX = maxFingerX? Math.max(t.pageX, maxFingerX): t.pageX
      maxFingerY = maxFingerY? Math.max(t.pageY, maxFingerY): t.pageY
    })

    return Math.max( (maxFingerX-minFingerX), (maxFingerY-minFingerY) );
  }
  // 根据当前的缩放, 设置移动的边界
  setMaxOffset(scale) {
    let layerStyle = this.chartLayerStyle;
    let { width, height, baseOnWidth, initCenterOffsetLeft, initCenterOffsetTop, initScale, wrapperWidth, wrapperHeight, centerOffsetLeft, centerOffsetTop } = layerStyle;
    let offsetHoriRange = width * (scale-initScale) / 2 - initCenterOffsetLeft,
        offsetVertRange = height * (scale-initScale) / 2 - initCenterOffsetTop;

    offsetHoriRange = offsetHoriRange< 0? 0: offsetHoriRange;
    offsetVertRange = offsetVertRange< 0? 0: offsetVertRange;


    let maxOffsetLeft   = centerOffsetLeft - offsetHoriRange,
        maxOffsetRight  = centerOffsetLeft + offsetHoriRange,
        maxOffsetTop    = centerOffsetTop  - offsetVertRange,
        maxOffsetBottom = centerOffsetTop  + offsetVertRange;

    // 某些特殊情况下, 会出现上与下,左与右倒转的情况, 这时候做个调换
    if ( maxOffsetLeft>maxOffsetRight ) maxOffsetLeft = [maxOffsetRight, maxOffsetRight=maxOffsetLeft][0]
    if ( maxOffsetTop>maxOffsetBottom ) maxOffsetTop  = [maxOffsetBottom, maxOffsetBottom=maxOffsetTop][0];

    layerStyle.maxOffsetLeft   = maxOffsetLeft
    layerStyle.maxOffsetRight  = maxOffsetRight
    layerStyle.maxOffsetTop    = maxOffsetTop
    layerStyle.maxOffsetBottom = maxOffsetBottom
  }

  /**
   * 事件回调
   */
  clickActivity(activity: any, e: Event) {
    this.$emit('clickActivity', activity, e);
  }

  /*
  * 隐藏指引图
  */
  hideGuide() {
    this.hasGuide = true;
    window.localStorage.setItem('chartGuide', 'true');
  }

  mounted() {
    this.hasGuide = window.localStorage.getItem('chartGuide');
  }
}
</script>


<style lang="less">
@import "~@cloudpivot/common/styles/mixins.less";

@finish-bg-color: rgba(0, 255, 156, 0.1);
@finish-hover-bg-color: rgba(0, 255, 156, 0.15);
@finish-border-color: rgba(23, 188, 148, 0.5);
@finish-hover-border-color: rgba(50, 182, 131, 1);

@process-bg-color: rgba(41, 112, 255, 0.1);
@process-hover-bg-color: rgba(41, 112, 255, 0.15);
@process-border-color: rgba(41, 112, 255, 0.5);
@process-hover-border-color: rgba(41, 112, 255, 1);

@wrong-bg-color: rgba(244, 69, 78, 0.1);
@wrong-hover-bg-color: rgba(244, 69, 78, 0.15);
@wrong-border-color: rgba(244, 69, 78, 0.5);
@wrong-hover-border-color: rgba(207, 48, 61, 1);

@default-font-color: rgba(0, 0, 0, 0.85);
@default-hover-bg-color: rgba(102, 102, 102, 0.15);
@default-border-color: rgba(153, 153, 153, 1);
@default-hover-border-color: rgba(102, 102, 102, 1);

.flow-track-chart {
  position: relative;
  overflow: hidden;
  height: 100%;
  background-color: #fff;
  &__drawer {
    // .px2rem(padding, 10px);
    // display:flex; align-items:center; justify-content:center;
    // padding:15px;
    // cursor: move;
    position:relative;
    z-index:1;
    overflow: hidden;
    box-sizing: border-box;
    height: 100%;
    .workflow-designer {
      margin: 0!important;
      min-width: auto!important;
      // background-color:#eaeaea;
      .activity-box, .lines-instance {
        min-width:auto;
        min-height:auto;
      }
      .activity-instance {
        .px2rem(border-radius, 4px);
      }
      .activity-instance {
        border-color: #052535;
        i {
          color: #052535;
        }
      }
      .finish {
        background: @finish-bg-color;
        border-color: @finish-border-color !important;
        i {
          color: @finish-hover-border-color;
        }
      }
      .wrong {
        background: @wrong-bg-color;
        border-color: @wrong-border-color !important;
        i {
          color: @wrong-hover-border-color;
        }
      }
      .processing {
        background: @process-bg-color;
        border-color: @process-border-color !important;
        i {
          color: @process-hover-border-color;
        }
      }
    }

    // 隐藏滚动条
    &::-webkit-scrollbar {
      width:0; height:0;
    }
  }

  &__explain {
    position: absolute;
    z-index: 10;
    .px2rem(top, 30px);
    .px2rem(right, 0);
    .px2rem(width, 200px);
    pointer-events:none;
  }
  &__explain-item {
    display: flex;
    flex-direction:row;
    align-items: center;
    .px2rem(margin-bottom, 16px);
    i {
      // flex: 0 0;
      // .px2rem(flex-basis, 26px);
      // .px2rem(width, 26px);
      // .px2rem(height, 26px);
      display:block;
      width:12px;
      height:12px;
      .px2rem(border-radius, 4px);
      .px2rem(margin-right, 16px);
    }
    span {
      // flex: 1 1;
      text-align: left;
      .px2rem(font-size, 26px);
      color: rgba(0, 0, 0, 0.65);
    }
  }
  &__finish {
    background-color: @finish-bg-color;
    border: 1px solid @finish-border-color !important;
  }
  &__wrong {
    background-color: @wrong-bg-color;
    border: 1px solid @wrong-border-color !important;
  }
  &__processing {
    background-color: @process-bg-color;
    border: 1px solid @process-border-color !important;
  }
  &__default {
    border: 1px solid @default-border-color !important;
  }
}

.chart-guide{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 989;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  .guide-content{
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 999;
    .px2rem(margin-left, -140px);
    .px2rem(margin-top, -200px);
    text-align: center;
    img{
      .px2rem(width, 280px);
    }
    p{
      color: rgba(255,255,255,0.85);
      .px2rem(font-size, 28px);
    }
  }
}
</style>
