import { Vue } from 'vue-property-decorator';
// import { delete } from 'vue/types/umd';

// const noxss = (text: string) => {
//   return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// };

Vue.directive('drag-row', {
  bind (el: any, binding: any) {
    if (binding.value.forbidden) {
      return;
    }
    el.style.position = 'relative';

    const dragEl = document.createElement('div');
    dragEl.style.position = 'absolute';
    dragEl.style.width = '100%';
    dragEl.style.bottom = '0';
    dragEl.style.height = '2px';
    dragEl.style.cursor = 'ns-resize';
    let disY = 0;

    dragEl.onmousemove = function () {
      dragEl.style.background = '#17bc94';
    };
    dragEl.onmouseout = function () {
      dragEl.style.background = 'inherit';
    };
    dragEl.onmousedown = function (ev) {
      var oEvent: any = ev || event;
      // disX = oEvent.clientX - dragEl.offsetLeft;
      disY = oEvent.clientY - dragEl.offsetTop;
      document.onmousemove = function (_el) {
        var _oEvent: any = _el || event;
        // var l = _oEvent.clientX - disX; // 获取div左边的距离
        var t = _oEvent.clientY - disY; // 获取div上边的距离

        binding.value.callBack(binding.value.index, t);
      };
      document.onmouseup = function () {
        // 当鼠标松开后关闭移动事件和自身事件
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
    el.appendChild(dragEl);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update (el: any, binding: any) {},
});
