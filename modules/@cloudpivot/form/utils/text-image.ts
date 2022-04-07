// 文字转图片
function textBeComeImg(
  text: string,
  fontColor: string = "#1890ff",
  fontSize: number = 16
) {
  var canvas = document.createElement("canvas");
  //小于32字加1  小于60字加2  小于80字加4    小于100字加6
  let $buHeight = 0;
  if (fontSize <= 32) {
    $buHeight = 1.2;
  } else if (fontSize > 32 && fontSize <= 60) {
    $buHeight = 2;
  } else if (fontSize > 60 && fontSize <= 80) {
    $buHeight = 4;
  } else if (fontSize > 80 && fontSize <= 100) {
    $buHeight = 6;
  } else if (fontSize > 100) {
    $buHeight = 10;
  }
  //对于g j 等有时会有遮挡，这里增加一些高度
  canvas.height = fontSize + $buHeight;
  var context: any = canvas.getContext("2d");
  // 擦除(0,0)位置大小为200x200的矩形，擦除的意思是把该区域变为透明
  context.fillStyle = fontColor;
  context.font = fontSize + "px PingFangSC-RegularPingFangSC-Regular";
  context.textBaseline = "middle";
  context.fillText(text, 0, fontSize / 2 + 3);

  canvas.width = context.measureText(text).width;
  context.fillStyle = fontColor;
  context.font = fontSize + "px PingFangSC-Regular";
  context.textBaseline = "middle";
  context.fillText(text, 0, fontSize / 2 + 3);
  // context.clearRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png"); //注意这里背景透明的话，需要使用png
}

export { textBeComeImg };
