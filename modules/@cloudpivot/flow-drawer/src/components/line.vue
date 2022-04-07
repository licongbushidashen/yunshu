<template>
  <svg class="lines-instance">
    <!-- 基础定义 -->
    <defs>
      <filter
        x="0"
        y="0"
        width="1"
        height="1"
        id="solid"
      >
        <feFlood flood-color="white"></feFlood>
        <feComposite in="SourceGraphic"></feComposite>
      </filter>
    </defs>
    <!-- 每条存储线条的渲染绘制 -->
    <template v-for="(line,index) in lines">
      <!-- 线条 -->
      <path
        @mouseover="line.text === '' ? onMouseover($event, line) : doEmpty"
        @mouseleave="line.text === '' ? onMouseLeave($event, line) : doEmpty"
        :key="`path-${index}`"
        :stroke="lineColor"
        :d="line.Path"
        :stroke-dasharray="(line.formula || line.utilizeElse) ? '5,5' : ''"
        fill="none"
        stroke-width="1"
      ></path>
      <!-- 箭头 -->
      <polygon
        @mouseover="line.text === '' ? onMouseover($event, line) : doEmpty"
        @mouseleave="line.text === '' ? onMouseLeave($event, line) : doEmpty"
        :key="`arrow-${index}`"
        :fill="lineColor"
        fill-opacity="1"
        :stroke="lineColor"
        stroke-width="1"
        :points="line.Arrow"
      ></polygon>
    </template>
    <!-- 为了保证文字居上, 将它抽离到最后做渲染 -->
    <template v-for="item in textItems">
      <!--
        文字背景
        filter:url(#solid)默认缩小的情况下, 在ios里哪怕放大也会糊成一片; 所以用rect来替代
      -->
      <rect
        :key="item.bgK"
        :x="item.bgX"
        :y="item.bgY"
        :width="item.bgW"
        :height="item.bgH"
        style="fill:white"
      >
      </rect>
      <!-- 文字 -->
      <text
        @mouseover="onMouseover($event, item)"
        @mouseleave="onMouseLeave($event, item)"
        :key="item.textK"
        :x="item.textX"
        :y="item.textY"
      >
        {{ item.text }}
      </text>
    </template>
  </svg>
</template>

<script lang="ts">
import {
  Component, Vue, Prop
} from 'vue-property-decorator';
import Line from '../class/Line';

@Component({
  name: 'LinesInstance',
})

export default class LinesInstance extends Vue {
  @Prop() lines!: Line[];
  @Prop({ default: '#3C9600' }) lineColor!: string; /* 连接线颜色 */

  get textItems() {
    let arr:any[] = [];
    this.lines.forEach((l,i)=>{
      if ( !!l.text ) {
        let len  = l.text.length,
            posX = l.textPosition.x - len * 5,
            posY = l.textPosition.y + 5;
        arr.push({
          ...l,
          textK:`text-${i}`,
          textX:posX,
          textY:posY,
          bgK:`text-bg-${i}`,
          bgX:posX - 5,
          bgY:posY - 15,
          bgW: len * 14 + 10,
          bgH: 20
        });
      }
    });

    return arr;
  }

  onMouseover(e, line) {
    this.$emit('mouseover', line, e);
  }

  onMouseLeave(e, line) {
    this.$emit('mouseleave', line, e);
  }

  doEmpty() {

  }
}
</script>

<style lang="less">
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
  text {
    font-size: 14px;
    line-height: 1;
    background:blue;
  }
}
</style>
