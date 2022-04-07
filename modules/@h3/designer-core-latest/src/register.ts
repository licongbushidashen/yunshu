
import { VueConstructor } from 'vue';

import { Store } from 'vuex';

import { ComponentAsset, GroupInfo, PropertiesData } from './typings';

import { DataType } from './schema-typings';

import * as forms from 'h3-forms'

export function uniqueId(length = 6) {
  let tim = Date.now().toString().substring(4)
  let codeBox = Array.from(tim)
  for (var i = 0; i < length; i++) {
    const randStr = String.fromCharCode(64 + Math.ceil(Math.random() * 26));
    let randTim = Math.ceil(Math.random() * tim.length)
    codeBox.splice(randTim, 0, randStr)
  }
  return codeBox.join('');
}

export enum StoreKey {

  SetActive = 'setActive',

  SetRoot = 'setRoot',

  GetActive = 'getActive',

  GetChildren = 'getChildren',

  GetParent = 'getParent',

  IsAncestor = 'isAncestor',

  Insert = 'insert',

  Append = 'append',

  Remove = 'remove',

  Move = 'move'

}


// export interface DesignerComponentInstanceMap {

//   [id: string]: DesignerComponentInstance

// }

// export interface ComponentTreeLeaf {

//   id: string

//   parentId: string
// }

// export interface ComponentTreeNode extends ComponentTreeLeaf {

//   children: Array<ComponentTreeLeaf | ComponentTreeNode>

// }

// export interface DesignerState {

//   active: DesignerComponentInstance | null

//   map: DesignerComponentInstanceMap

//   tree: ComponentTreeNode | null

// }



export interface DesignerState {

  active: DesignerNode | null

  app: DesignerApplication

}

export interface RemovePayload {
  // parentId: string,
  id: string
}



export interface SetRootPayload {


  id: string,
  type: string,
  // data: PropertiesData
  data: forms.FormGroup

}


export interface InsertPayload {

  /**
   * 小于0为追加
   */
  index: number,
  parentId: string,
  id: string,
  type: string,
  // data: PropertiesData
  data: forms.FormGroup

}

export interface MovePayload {

  /**
   * 小于0为追加
   */
  index: number,
  parentId: string,
  id: string

}

export class DesignerStore {

  private _path: string

  private _$store: Store<DesignerState>

  constructor(path: string, $store: Store<DesignerState>) {
    this._path = path;
    this._$store = $store;
  }

  get active(): DesignerNode | null {
    // const name = this._path + '/' + StoreKey.GetActive;
    const state = (this._$store.state as any)[this._path];
    return state.active;
  }

  set active(node: DesignerNode | null) {
    const name = this._path + '/' + StoreKey.SetActive;
    this._$store.commit(name, node);
  }


  getApp(): DesignerApplication {
    const state = (this._$store.state as any)[this._path];
    return state.app;
  }

  get(id: string): DesignerNode {
    const state = (this._$store.state as any)[this._path];
    return state.app.designer.get(id);
  }

  getChildren(id: string): DesignerNode[] {
    const name = this._path + '/' + StoreKey.GetChildren;
    return this._$store.getters[name](id);
  }

  getParent(id: string) {
    const name = this._path + '/' + StoreKey.GetParent;
    return this._$store.getters[name](id);
  }

  [StoreKey.IsAncestor](id: string, targetId: string) {
    const name = this._path + '/' + StoreKey.IsAncestor;
    return this._$store.getters[name](id, targetId);
  }

  setRoot(payload: SetRootPayload) {
    this.commit(StoreKey.SetRoot, payload);
  }

  commit(key: StoreKey, payload?: any) {
    const name = this._path + '/' + key;
    return this._$store.commit(name, payload);
  }

  insert(payload: InsertPayload) {
    this.commit(StoreKey.Insert, payload);
  }

  remove(payload: RemovePayload) {
    this.commit(StoreKey.Remove, payload);
  }

  move(payload: MovePayload) {
    this.commit(StoreKey.Move, payload);
  }
}


export class Register {

  store: DesignerStore | null = null

  dragging: ComponentAsset | null = null

  draggingNode: DesignerNode | null = null

  groups: GroupInfo[] = []

  components: BaseComponents = {} as any

  assets: { [type: string]: ComponentAsset } = {}

}


export interface BaseComponents {

  /**
   * 属性分组组件
   */
  Collapse: VueConstructor<any>

  DesignerElement: VueConstructor<any>

}


export const register = new Register()













export class Designer {

  private _map: { [id: string]: DesignerNode }

  get map() {
    return this._map;
  }

  constructor(nodes?: DesignerNode[]) {
    this._map = {};
    if (nodes) {
      for (const node of nodes) {
        this._map[node.id] = node;
      }
    }
  }

  get(id: string) {
    return this.map[id];
  }

  getChildren(id: string) {
    const node = this.get(id);
    if (!node) {
      return [];
    }

    return node.childIds.map(cid => this.get(cid));
  }

  private getThrow(id: string) {
    const node = this.map[id];
    if (!node) {
      throw new Error('insert');
    }
    return node;
  }

  setRoot(id: string, type: string, data: forms.FormGroup) {
    const root = new DesignerNode(id, null, type, data);
    this.map[root.id] = root;
  }

  insert(id: string, parentId: string, type: string, data: forms.FormGroup, index?: number) {
    const node = this.getThrow(parentId);

    const child = new DesignerNode(id, parentId, type, data);
    this.map[child.id] = child;

    if (typeof index === 'number' && index > -1) {
      node.childIds.splice(index, 0, child.id);
    } else {
      node.childIds.push(child.id);
    }
    return child;
  }

  private removeOfParent(id: string, parentId: string) {
    const parent = this.getThrow(parentId);
    const index = parent.childIds.findIndex(cid => cid === id);
    if (index > -1) {
      parent.childIds.splice(index, 1);
    }
  }

  private deepRemove(node: DesignerNode) {
    node.childIds
      .map(id => this.map[id])
      .forEach(child => {
        this.deepRemove(child);
        delete this.map[child.id];
      })
  }

  remove(id: string) {
    const node = this.getThrow(id);
    delete this.map[id];

    if (node.parentId) {
      this.removeOfParent(id, node.parentId);
    }

    if (node.childIds) {
      this.deepRemove(node);
    }
  }

  move(id: string, toParentId: string, index?: number) {
    const node = this.getThrow(id);

    if (node.parentId) {
      this.removeOfParent(id, node.parentId);
    }

    const parent = this.getThrow(toParentId);
    node.parentId = toParentId;
    if (typeof index === 'number' && index > -1) {
      parent.childIds.splice(index, 0, id);
    } else {
      parent.childIds.push(id);
    }
  }

}


export class DesignerNode {

  // _id: string

  // _parentId: string | null

  // _data: DesignerComponentInstance

  // _childIds: string[] = []

  constructor(
    public id: string,
    public parentId: string | null,
    public type: string,
    public data: forms.FormGroup,
    public childIds: string[] = []
  ) {
    // this._id = id;
    // this._parentId = parentId;
    // this._data = data;
    // this._childIds = childIds;
  }

  // get id(){
  //     return this._id
  // }

  // get data(){
  //     return this._data
  // }

  // get parentId(){
  //     return this._parentId
  // }

  // get childIds(){
  //     return this._childIds
  // }

}


export enum DesignerEventType {

  Insert = 'insert',

  Remove = 'remove',

  Move = 'move',

  Back = 'back',

  Forward = 'forward'
}

export class DesignerInsertEvent {

  readonly eventType = DesignerEventType.Insert

  readonly index?: number

  readonly parentId: string | null

  readonly id: string

  readonly type: string

  // readonly data: PropertiesData
  readonly data: forms.FormGroup

  constructor(
    id: string,
    type: string,
    data: forms.FormGroup,
    parentId: string | null,
    index?: number
  ) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.index = index;
    this.parentId = parentId;
  }
}

export class DesignerMoveEvent {

  readonly eventType = DesignerEventType.Move

  readonly index?: number

  readonly parentId: string

  readonly id: string

  constructor(
    id: string,
    parentId: string,
    index?: number
  ) {
    this.id = id;
    this.index = index;
    this.parentId = parentId;
  }

}

export class DesignerRemoveEvent {

  readonly eventType = DesignerEventType.Remove

  readonly id: string

  constructor(
    id: string
  ) {
    this.id = id;
  }

}

export class DesignerBackEvent {

  readonly eventType = DesignerEventType.Back

  readonly steps: number

  constructor(steps: number) {
    this.steps = steps;
  }

}

export class DesignerForwardEvent {

  readonly eventType = DesignerEventType.Forward

  readonly steps: number

  constructor(steps: number) {
    this.steps = steps;
  }

}

export interface DesignerEvent {

  eventType: DesignerEventType

}

export class DesignerApplication {

  private _designer: Designer

  private events: DesignerEvent[] = [];

  private backSteps = 0;

  constructor() {
    this._designer = new Designer();
  }

  get designer() {
    return this._designer;
  }

  get steps() {
    return this.events.length;
  }

  public apply(event: DesignerEvent) {

    if (event.eventType === DesignerEventType.Back) {

      const backEvt = event as DesignerBackEvent;
      this.back(backEvt.steps);

    } else if (event.eventType === DesignerEventType.Forward) {

      if (this.backSteps === 0) {
        return;
      }

      const backEvt = event as DesignerForwardEvent;
      this.forward(backEvt.steps);

    } else {

      Array(this.backSteps).fill(0).forEach(() => this.events.pop());
      this.backSteps = 0;
      this.handle(event, this._designer);
      this.events.push(event);

    }

  }

  private handle(event: DesignerEvent, designer: Designer) {
    switch (event.eventType) {

      case DesignerEventType.Insert:
        const insertEvt = event as DesignerInsertEvent;
        if (insertEvt.parentId) {
          designer.insert(insertEvt.id, insertEvt.parentId, insertEvt.type, insertEvt.data, insertEvt.index);
        } else {
          designer.setRoot(insertEvt.id, insertEvt.type, insertEvt.data);
        }
        break;

      case DesignerEventType.Move:
        const moveEvt = event as DesignerMoveEvent;
        designer.move(moveEvt.id, moveEvt.parentId, moveEvt.index);
        break;

      case DesignerEventType.Remove:
        const removeEvt = event as DesignerRemoveEvent;
        designer.remove(removeEvt.id);
        break;

    }
  }

  private back(steps: number) {
    this.backSteps += steps;
    const end = this.events.length - this.backSteps;
    const designer = new Designer();
    for (let i = 0; i < end; i++) {
      this.handle(this.events[i], designer);
    }
    this._designer = designer;
  }

  private forward(steps: number) {
    let current = this.events.length - this.backSteps;
    if (steps > this.backSteps) {
      steps = this.backSteps;
    }
    this.backSteps -= steps;
    this.events.slice(current, current + steps).forEach(evt => {
      this.handle(evt, this.designer);
    });
  }

}

// export class EventStore {

//     private events: DesignerEvent[] = [];

//     append(event: DesignerEvent) {
//         this.events.push(event);
//     }

//     get E

// }