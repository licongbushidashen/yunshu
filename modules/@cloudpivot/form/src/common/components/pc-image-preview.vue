<template>
  <div class="bk-preview">
    <img
      v-show="!waiting"
      class="image"
      ref="image"
      :src="imgListBase64[currentImgUid]"
      @load="onImgLoad($event)"
      @mousedown="onImgDragStart($event)"
      :style="imgStyle"
    >
    <span
      v-if="imgList.length > 1"
      class="btn-cirle btn-left"
      @click="onImgChange(true)"
    >
      <a-icon type="left" />
    </span>
    <span
      v-if="imgList.length > 1"
      class="btn-cirle btn-right"
      @click="onImgChange(false)"
    >
      <a-icon type="right" />
    </span>
    <span
      class="btn-cirle btn-close"
      @click="onClose()"
    >
      <a-icon type="close" />
    </span>
    <div class="ctl-resize">
      <a-icon
        type="minus-circle"
        :class="['btn-resise', {'btn-disabled': this.resize === 10}]"
        @click="onImgResize(false)"
      />
      <span class="txt-resize">{{resize}}%</span>
      <a-icon
        type="plus-circle"
        :class="['btn-resise', {'btn-disabled': this.resize === 800}]"
        @click="onImgResize(true)"
      />
      <a-icon type="redo" class="btn-resise marginL20" @click="rotateImg" />
      <a-icon type="cloud-download" class="btn-resise marginL20" @click="downloadImg"/>
    </div>
    <a-spin
      :spinning="waiting"
      size="large"
    ></a-spin>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from "vue-property-decorator";
import { Icon, Spin } from "@h3/antd-vue";

@Component({
  name: "pc-image-preview",
  components: {
    AIcon: Icon,
    ASpin: Spin
  }
})
export default class PCImagePreview extends Vue {

  @Prop({ default: [] })
  imgList!: any[];

  @Prop({ default: 0 })
  seletedIndex!: number;

  waiting = true;

  imgIndex = 0;

  resize = 100;

  imgNaturalList: { height: number, width: number }[] = [];

  windowInfo: { height: number, width: number } = { height: 0, width: 0 };

  imgStyle: any = {}
  setImgStyle(){
    this.imgStyle = {
      "transform": `rotate(${this.imgRotateObj[this.imgIndex]}deg)`
    }
  }
  imgRotateObj: {} = {} // 记录每张图片的旋转角度
  rotateImg(){
    if(this.imgRotateObj[this.imgIndex] !== undefined){
      this.imgRotateObj[this.imgIndex] += 90
    }else{
      this.imgRotateObj[this.imgIndex] = 90
    }
    this.setImgStyle()
  }
  @Watch('imgIndex')
  OnImgIndexChange() {
    this.setImgListBase64()
    this.setImgStyle()
  }

  downloadImg(){
    let url = this.imgList[this.imgIndex].url
    url && window.open(url, '_self')
  }
  

  created() {
    this.windowInfo.height = window.innerHeight;
    this.windowInfo.width = window.innerWidth;
    this.imgIndex = this.seletedIndex;
    this.imgNaturalList.fill({ height: 0, width: 0 }, 0, this.imgList.length - 1);
    this.setImgListBase64()

    // 通过方向键控制图片切换
    if (this.imgList.length > 1) {
      document.addEventListener('keydown', this.onArrowKeyDown);
    }
  }

  beforeDestroy(){
    document.removeEventListener('keydown', this.onArrowKeyDown);
  }

  onClose() {
    this.$emit('close');
  }

  /**
   * 键盘方向键切换图片
   * @param e 浏览器event
   */
  onArrowKeyDown(e) {
    // 忽略按住不放的情况
    if (e.repeat) {
      return;
    }
    // 方向键 ←
    if (e.keyCode === 37) {
      this.onImgChange(true);
      return;
    }
    // 方向键 →
    if (e.keyCode === 39) {
      this.onImgChange(false);
    }
  }

  /**
   * 图片加载完成
   * @param e 浏览器event
   */
  onImgLoad(e) {
    const img = e.path[0];
    // 图片大小超过可展示区域80%时，以横纵较长侧为基准，缩小至最接近80的整十倍
    if (img.naturalHeight > this.windowInfo.height * 0.8
      || img.naturalWidth > this.windowInfo.width * 0.8) {
      // 确定依据横向or纵向缩放
      const isResizeByHeight = img.naturalHeight / this.windowInfo.height
        > img.naturalWidth / this.windowInfo.width;
      // 计算缩放比例
      const resizeRate = Math.floor(
        (isResizeByHeight ? this.windowInfo.height * 0.8 / img.naturalHeight
          : this.windowInfo.width * 0.8 / img.naturalWidth)
        * 10) * 10;
      this.resize = resizeRate < 10 ? 10 : resizeRate;
    }
    img.style.width = Math.floor(img.naturalWidth * (this.resize / 100)) + 'px';
    // 保留图片原始尺寸
    this.imgNaturalList[this.imgIndex] = { height: img.naturalHeight, width: img.naturalWidth };
    this.waiting = false;
  }

  get url(){
    return this.imgList[this.imgIndex].url
    //  || this.imgList[this.imgIndex].thumbUrl
  }

  get currentImgUid(){
    return this.imgList[this.imgIndex].uid
  }

  get currentImgBase64(){
    return this.imgListBase64[this.currentImgUid]
  }

  imgListBase64:any = {}
  setImgListBase64(){
    if(!this.imgListBase64[this.currentImgUid]){
      this.getImgBase64(this.url).then((res) => {
        this.$set(this.imgListBase64, this.currentImgUid, res)
      })
    }
  }

   getImgBase64(src){
    return new Promise((resolve, reject) =>{
      var img = new Image();
      var that = this
      img.src= src;
      img.setAttribute("crossOrigin",'Anonymous')
      img.onload = function(){
        resolve(that.imageToBase64(img))
      }
      img.onerror = function(){
        resolve(that.imageToBase64(img))
      }
    })
  }

  imageToBase64(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx:any = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL;
  }

  /**
   * 图片切换功能
   * @param toPrev 是否点击前一页
   */
  onImgChange(toPrev) {
    this.waiting = true;
    toPrev ? this.imgIndex-- : this.imgIndex++;
    if (this.imgIndex < 0) {
      this.imgIndex = this.imgList.length - 1;
    }
    if (this.imgIndex > this.imgList.length - 1) {
      this.imgIndex = 0;
    }
    this.$refs['image']['style'].transform = '';
    this.resize = 100;
  }

  /**
   * 图片缩放功能
   * @param isAdd 是否点击放大
   */
  onImgResize(isAdd) {
    if (!isAdd && this.resize === 10 || isAdd && this.resize === 800) {
      return;
    }
    const oldResize = this.resize;
    isAdd ? this.resize += 10 : this.resize -= 10;
    // 缩放时，根据已有偏移量，重新计算缩放后的偏移量

    let style = this.$refs['image']['style'].transform
      // 获取旋转角度
      let rotate = style.match(/rotate\(.+deg\)/)
      if(rotate && rotate.length){
        style = style.replace(rotate, '')
      }else{
        rotate = ''
      }

    const translateInfo = style.match(/(\-)?\d+/g);
    if (translateInfo && translateInfo.length) {
      this.$refs['image']['style'].transform = `translate(${
        Math.floor(translateInfo[0] / oldResize * this.resize)}px, ${
        Math.floor(translateInfo[1] / oldResize * this.resize)}px) ${rotate}`;
    }
    this.$refs['image']['style'].width =
      Math.floor(this.imgNaturalList[this.imgIndex].width * (this.resize / 100)) + 'px';
  }

  /**
   * 图片拖拽功能
   * @param e 浏览器event
   */
  onImgDragStart(e) {
    e.preventDefault();
    let img = e.target || e.srcElement;
    let mouseInfo: any = { x: e.x, y: e.y };

    /**
     * 监听鼠标在图片上的移动
     * @param ev 浏览器event
     */
    img.onmousemove = (ev) => {
      ev.preventDefault();

      let style = img.style.transform
      // 获取旋转角度
      let rotate = style.match(/rotate\(.+deg\)/)
      if(rotate && rotate.length){
        style = style.replace(rotate, '')
      }else{
        rotate = ''
      }

      const translateInfo = style.match(/(\-)?\d+/g);
      if (translateInfo && translateInfo.length) {
        img.style.transform = `translate(${Number(translateInfo[0]) + ev.x - mouseInfo.x}px, ${
          Number(translateInfo[1]) + ev.y - mouseInfo.y}px) ${rotate}`;
      } else {
        img.style.transform = `translate(${ev.x - mouseInfo.x}px, ${ev.y - mouseInfo.y}px) ${rotate}`;
      }
      mouseInfo = { x: ev.x, y: ev.y };
    }

    /**
     * 鼠标离开图片区域时，清除绑定事件
     */
    img.onmouseleave = () => {
      img.onmousemove = null;
      img.onmouseup = null;
      mouseInfo = null;
    }

    /**
     * 鼠标弹起时，清除绑定事件
     */
    img.onmouseup = () => {
      img.onmousemove = null;
      img.onmouseup = null;
      mouseInfo = null;
    }
  }
}
</script>

<style lang="less" scoped>
.bk-preview {
  background-color: rgba(0, 0, 0, 0.4);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  z-index: 999;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image {
  background-color: #fff;
  cursor: move;
  position: absolute;
  margin: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.btn-cirle {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: block;
  font-size: 18px;
  line-height: 52px;
  position: absolute;
  text-align: center;
  margin: auto;
  height: 52px;
  width: 52px;
  transition: all 0.3s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
.btn-left {
  left: 16px;
  top: 0;
  bottom: 0;
}
.btn-right {
  right: 16px;
  top: 0;
  bottom: 0;
}
.btn-close {
  top: 32px;
  right: 16px;
}
.ctl-resize {
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  cursor: default;
  bottom: 20px;
  font-size: 18px;
  margin: auto;
  position: absolute;
  padding: 15px 0;
  left: 0;
  right: 0;
  width: 230px;
  text-align: center;
  border-radius: 4px;
}
.txt-resize {
  display: inline-block;
  font-size: 16px;
  margin: 0 20px;
  min-width: 48px;
}
.btn-resise {
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    box-shadow: 0 0 8px #fff;
  }
}
.btn-disabled {
  color: #555;
  cursor: default;
  &:hover {
    box-shadow: none;
  }
}

.marginL20{
  margin-left: 20px;
}
</style>