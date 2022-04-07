import { searchHighLight } from '@cloudpivot/common/src/utils/pc/utils';
import { Vue } from 'vue-property-decorator';

Vue.directive('slider-left', {
  bind(el, binding) {
    function touchstartHandler(ev) {
      //@ts-ignore
      el.startX = ev.touches[0].clientX;
      //@ts-ignore
      el.parentElement.childNodes.forEach(node => {
        if (node !== el) {
          //@ts-ignore
          node.style.transform = `translateX(0px)`;
        }
      })
    }
    function touchmoveHandler(ev) {
      if (binding.value) {
        return;
      }
      //@ts-ignore
      let moveX = ev.touches[0].clientX - el.startX;
      if (moveX > 0) {
        moveX = 0;
      }
      if (moveX < -1.546666666666667*(window as any).rem) {
        moveX = -1.546666666666667*(window as any).rem;
      }
      el.style.transform = `translateX(${moveX/(window as any)}rem)`;
    }
    function touchendtHandler(ev) {
      if (binding.value) {
        return;
      }
      //@ts-ignore
      let moveX = ev.changedTouches[0].clientX - el.startX;
      if (moveX > -1.546666666666667*(window as any).rem/2) {
        moveX = 0;
      } else {
        moveX = -1.546666666666667*(window as any).rem
      }
      if (moveX < 0) {
        let mask = document.createElement("div");
        mask.setAttribute("style", `width: calc(100% - 1.546666666666667rem);position:absolute;left: 0;top: 0;bottom: 0`);
        mask.setAttribute("class", "mask");
        el.appendChild(mask);
      } else {
        setTimeout(() => {
          el.removeChild(el.getElementsByClassName("mask")[0]);
        },100)
      }
      el.style.transform = `translateX(${moveX/(window as any).rem}rem)`;
    }
    el.addEventListener("touchstart", touchstartHandler);
    el.addEventListener("touchmove", touchmoveHandler);
    el.addEventListener("touchend", touchendtHandler);
  },
});