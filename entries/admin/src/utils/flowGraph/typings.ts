export declare namespace NodeGraphType {
  
  export interface Node {
    code: string,
    name?: string
  }

  export interface Link {
    start: Node,
    end: Node
  }

  export interface Route {
    originNode: Node,
    crossNodes: Array<Node>,
    arrowNode: Node | null,
  }

}