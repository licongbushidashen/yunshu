/*
 * @Author: nooldey <nooldey@gmail.com> 
 * @Date: 2020-04-28 13:46:43 
 * @Last Modified by: nooldey 
 * @Description:  检查节点流的流向路径，可用于检测是否闭环
 * 闭环条件：originNode 与 arrowNode 为同一个节点
 */

import { NodeGraphType } from './typings'

export default class NodeGraph {
  routes: Array<NodeGraphType.Route> = []

  nodes: Array<NodeGraphType.Node> = []

  links: Array<NodeGraphType.Link> = []

  runningLinks: Array<NodeGraphType.Link> = []

  bothNodes: Array<string> = []

  constructor(links: Array<NodeGraphType.Link>) {
    const outNodes = links.map((link:NodeGraphType.Link) => link.start);
    const inNodes = links.map((link:NodeGraphType.Link) => link.end)
    let allNodes = outNodes;
    inNodes.forEach((node: NodeGraphType.Node) => {
      if (allNodes.some((item: NodeGraphType.Node) => item.code === node.code)) {
        this.bothNodes.push(node.code);
      } else {
        allNodes.push(node)
      }
    });


    this.nodes = allNodes

    this.links = links

    this.runningLinks = links
  }
  
  /**
   * 获取指定节点的调用路径
   * A -> B -> C -> D -> A
   * A -> C -> B -> E
   * @param node 
   */
  getRoute(node: NodeGraphType.Node) {
    if (!this.bothNodes.includes(node.code)) {
      return;
    }

    let currentRoute:NodeGraphType.Route = {
      originNode: node,
      crossNodes: [],
      arrowNode: null
    }

    const pickNextNode = (targetNode: NodeGraphType.Node) => {

      const linkItem = this.runningLinks.find((link:NodeGraphType.Link) => link.start.code === targetNode.code)
      
      if (!linkItem) {
        if (currentRoute.arrowNode) {
          currentRoute.crossNodes.push(currentRoute.arrowNode)
        }
        return
      }

      currentRoute.crossNodes.push(targetNode);
      
      const nextTarget = linkItem.end

      if (!nextTarget) {
        return
      }

      /**
       * 移除访问过的流
       */
      this.runningLinks = this.runningLinks.filter((link: NodeGraphType.Link) => link.start.code !== targetNode.code || link.end.code !== nextTarget.code);

      currentRoute.arrowNode = nextTarget;

      if (nextTarget.code === currentRoute.originNode.code) {
        currentRoute.crossNodes.push(nextTarget);
        return
      }

      pickNextNode(nextTarget)
    }

    pickNextNode(node);

    return currentRoute
  }

  getAllRoute(){
    return new Promise((resolve) => {

      let vehicle:Array<any> = [];
  
      this.runningLinks = this.links;
  
      this.nodes.forEach((node: NodeGraphType.Node) => {
        if (!this.bothNodes.includes(node.code)) {
          return;
        }
        const route = this.getRoute(node);
        if (route && route.crossNodes.length) {
          const path = route.crossNodes.map((cn:NodeGraphType.Node) => cn.name).join(' > ')
          vehicle.push({
            ...route,
            path
          })
        }
      })
      
      resolve(vehicle)
    })
  }
}