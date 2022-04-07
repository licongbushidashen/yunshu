# 说明

## 用途
用于检查数据流向、逻辑走向等矢量问题，输出结果为 矢量经过的所有节点的集合；

## 前提
每一个节点分为两种状态：输入端口/输出端口；
每两个节点之间的关系为：单向；

每个节点在输入/输出端口中均只使用一次，不作为多次引入；

## 判断逻辑

1. 取出所有同时出现在 输入/输出 端口 的节点的集合，作为目标检索；
2. 深度优先，搜索：起始节点的输出目标——输出目标的输出目标——输出目标与起始节点相同？终止！

## 使用

节点：node: { code: string }
节点关系：links: [{ start: node, end: node }]

输出：routes: [{ originNode:node, arrowNode: node, path: string }]

const graph = new NodeGraph(links)

const routes =  await graph.getAllRoute()