import { formApi } from "@cloudpivot/api";
const KeyReplayToken = "ReplayToken"; // sessionStorage 保存 校验码key名称
/**
 * @Author: Fan
 * @Description: 表单页 校验码操作内容
 * @Date: 2020-01-09 18:15:24
 */
export abstract class FormDetailService {
  /**
   * @Author: Fan
   * @Description: 获取 表单提交校验码
   * @URL:
   * @param  path/请求路径
   * @Date: 2020-01-09 18:16:09
   */
  static setReplayToken(path?: string) {
    // 获取
    formApi.getReplayToken(path).then(res => {
      if (res.errcode === 0 || res.data) {
        sessionStorage.setItem(KeyReplayToken, res.data);
      } else {
        console.error("getReplayToken 接口请求失败!");
      }
    });
  }
  /**
   * @Author: Fan
   * @Description: 将 校验码合并到 请求接口数据参数中, 目前 只有 submit、save接口需要 校验码
   * @Date: 2020-01-09 18:17:20
   */
  static mergeReplayToken(data: any): any {
    data["replayToken"] = sessionStorage.getItem(KeyReplayToken);
    return data;
  }
}
