/**
 * 集成操作树的工具类
 */
export default class TreeUtils  {
    
  /**
   * 通过指定的key获取树节点信息
   * @param value // 键值
   * @param key   // 键名
   * @param treeArr   // 树数组
   * @return 返回树节点信息
   */
  static getTreeNodeStateByKey(value: string, key: string, treeArr: any[]) {
    let isStop = false;
    const nodePos: number[] = [];
    let nodeState: any;
  
    const findTreeNodeState = function (val: string, k: string, array: any[]) {
      for (let i: number = 0, len: number = array.length; i < len; i++) {
        nodePos.push(i);
        const item = array[i];
  
        if (val === item[k]) {
          isStop = true;
          nodeState = item;
          return;
        }
  
        const children = item.children;
        if (children && children.length) {
            findTreeNodeState(val, k, children);
        }
  
        if (isStop) return;
  
        nodePos.pop();
      }
  
    }
  
    findTreeNodeState(value, key, treeArr);
  
    return { nodeState, nodePos: `0-${nodePos.join("-")}` }
  }


  /**
   * 通过位置来获取树节点信息
   * @param treeArr 树数组
   * @param nodePos 位置
   * @return 返回树节点信息
   */
  static getTreeNodeStateByPos(treeArr: any[], nodePos: string) {
    const pos: string[] = nodePos.split('-').slice(1);
    let resultNode: any = {};
    let tree: any = treeArr;

    for (let i = 0, len = pos.length; i < len; i++) {
      resultNode = tree[Number(pos[i])];

      if (i < len) {
        tree = resultNode.children;
      }
    }

    return resultNode;
  }
}