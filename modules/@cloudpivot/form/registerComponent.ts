import component from "@cloudpivot/form/src/components"; // 云枢原生组件
import { register } from "@cloudpivot/form/utils/register";
// import { ComponentInfo, ComponentAsset } from "@cloudpivot/form/typings";
import extendComponent from "@cloudpivot/form/components-extend";

const components = [...component];
export default function () {
  for (let cmp of components) {
    register.append(cmp);
  }
}
