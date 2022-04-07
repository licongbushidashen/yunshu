
// import { VueConstructor } from 'vue';

// import { Store } from 'vuex';

// import { ComponentAsset, GroupInfo, PropertiesData } from './typings';

// import { DataType } from './schema-typings';


// export class DesignerComponentInstance {

//   private _type: string

//   private _id: string

//   private _data: any

//   constructor(id: string, type: string, data: PropertiesData) {
//     this._id = id;
//     this._data = data;
//     this._type = type;
//   }

//   get id() {
//     return this._id;
//   }

//   get type() {
//     return this._type;
//   }

//   get data() {
//     return this._data;
//   }

//   get asset() {
//     return register.assets[this._type];
//   }

//   get info() {
//     return this.asset.info;
//   }

//   get schema() {
//     return this.asset.schema;
//   }

//   get settings() {
//     return this.asset.settings;
//   }

//   _runtimeData: any = {};

//   getRuntimeData() {
//     const data = {} as any;//this._runtimeData
//     data.id = this._id;

//     if (this._data) {
//       for (const key in this._data) {
//         const prop = this._data[key];
//         if (prop.type === DataType.Object || prop.$ref) {
//           const temp = {} as any;
//           const val = prop.value;
//           if (val) {
//             for (const key2 in val) {
//               temp[key2] = val[key2].value;
//             }
//             data[key] = temp;
//           }
//         } else {
//           data[key] = prop.value;
//         }
//       }
//     }

//     return data;
//   }

//   static create(type: string, data: PropertiesData) {
//     // if (!id) {
//     const id = uniqueId();
//     // }

//     const instance = new DesignerComponentInstance(id, type, data);
//     return instance;
//   }

// }

// export function uniqueId(length = 6) {
//   let tim = Date.now().toString().substring(4)
//   let codeBox = Array.from(tim)
//   for (var i = 0; i < length; i++) {
//     const randStr = String.fromCharCode(64 + Math.ceil(Math.random() * 26));
//     let randTim = Math.ceil(Math.random() * tim.length)
//     codeBox.splice(randTim, 0, randStr)
//   }
//   return codeBox.join('');
// }

// // export enum StoreKey {

// //   SetActive = 'setActive',

// //   SetRoot = 'setRoot',

// //   GetActive = 'getActive',

// //   GetChildren = 'getChildren',

// //   GetParent = 'getParent',

// //   IsAncestor = 'isAncestor',

// //   Insert = 'insert',

// //   Append = 'append',

// //   Remove = 'remove',

// //   Move = 'move'

// // }


// // export interface DesignerComponentInstanceMap {

// //   [id: string]: DesignerComponentInstance

// // }

// // export interface ComponentTreeLeaf {

// //   id: string

// //   parentId: string
// // }

// // export interface ComponentTreeNode extends ComponentTreeLeaf {

// //   children: Array<ComponentTreeLeaf | ComponentTreeNode>

// // }

// // export interface DesignerState {

// //   active: DesignerComponentInstance | null

// //   map: DesignerComponentInstanceMap

// //   tree: ComponentTreeNode | null

// // }

// // export interface DesignerState {

// //   active: DesignerComponentInstance | null

// //   map: DesignerComponentInstanceMap

// //   tree: ComponentTreeNode | null

// // }

// // export interface AppendPayload {
// //   parentId: string,
// //   instance: DesignerComponentInstance
// // }

// // export interface RemovePayload {
// //   // parentId: string,
// //   id: string
// // }

// // export interface InsertPayload {

// //   /**
// //    * 小于0为追加
// //    */
// //   index: number,
// //   parentId: string,
// //   instance: DesignerComponentInstance

// // }

// // export class DesignerStore {

// //   private _path: string

// //   private _$store: Store<DesignerState>

// //   constructor(path: string, $store: Store<DesignerState>) {
// //     this._path = path;
// //     this._$store = $store;
// //   }

// //   get active(): DesignerComponentInstance | null {
// //     // const name = this._path + '/' + StoreKey.GetActive;
// //     const state = (this._$store.state as any)[this._path];
// //     return state.active;
// //   }

// //   get(id: string): DesignerComponentInstance | null {
// //     const state = (this._$store.state as any)[this._path];
// //     return state.map[id];
// //   }

// //   getChildren(id: string): DesignerComponentInstance[] {
// //     const name = this._path + '/' + StoreKey.GetChildren;
// //     return this._$store.getters[name](id);
// //   }

// //   getParent(id: string) {
// //     const name = this._path + '/' + StoreKey.GetParent;
// //     return this._$store.getters[name](id);
// //   }

// //   [StoreKey.IsAncestor](id: string, targetId: string) {
// //     const name = this._path + '/' + StoreKey.IsAncestor;
// //     return this._$store.getters[name](id, targetId);
// //   }

// //   set active(instance: DesignerComponentInstance | null) {
// //     const name = this._path + '/' + StoreKey.SetActive;
// //     this._$store.commit(name, instance);
// //   }

// //   set root(instance: DesignerComponentInstance | null) {
// //     const name = this._path + '/' + StoreKey.SetRoot;
// //     this._$store.commit(name, instance);
// //   }

// //   commit(key: StoreKey, payload?: any) {
// //     const name = this._path + '/' + key;
// //     return this._$store.commit(name, payload);
// //   }

// //   insert(payload: InsertPayload) {
// //     this.commit(StoreKey.Insert, payload);
// //   }

// //   remove(payload: RemovePayload) {
// //     this.commit(StoreKey.Remove, payload);
// //   }

// //   move(payload: InsertPayload) {
// //     this.commit(StoreKey.Move, payload);
// //   }
// // }


// export class Register {

//   store: DesignerStore | null = null

//   dragging: ComponentAsset | null = null

//   draggingInstance: DesignerComponentInstance | null = null

//   groups: GroupInfo[] = []

//   components: BaseComponents = {} as any

//   assets: { [type: string]: ComponentAsset } = {}

// }


// export interface BaseComponents {

//   /**
//    * 属性分组组件
//    */
//   Collapse: VueConstructor<Vue>

//   DesignerElement: VueConstructor<Vue>

// }


// export const register = new Register()













// export class Designer {

//   private map: { [id: string]: DesignerNode }

//   constructor(nodes?: DesignerNode[]) {
//       this.map = {};
//       if (nodes) {
//           for (const node of nodes) {
//               this.map[node.id] = node;
//           }
//       }
//   }

//   get(id: string) {
//       return this.map[id];
//   }

//   private getThrow(id: string) {
//       const node = this.map[id];
//       if (!node) {
//           throw new Error('insert');
//       }
//       return node;
//   }

//   setRoot(data: DesignerComponentInstance) {
//       const root = new DesignerNode(data.id, null, data);
//       this.map[data.id] = root;
//   }

//   insert(id: string, data: DesignerComponentInstance, index?: number) {
//       const node = this.getThrow(id);

//       const child = new DesignerNode(data.id, id, data);
//       this.map[id] = child;

//       if (typeof index === 'number' && index > -1) {
//           node.childIds.splice(index, 0, data.id);
//       } else {
//           node.childIds.push(data.id);
//       }
//   }

//   private removeOfParent(id: string, parentId: string) {
//       const parent = this.getThrow(parentId);
//       const index = parent.childIds.findIndex(cid => cid === id);
//       if (index > -1) {
//           parent.childIds.splice(index, 1);
//       }
//   }

//   private deepRemove(node: DesignerNode) {
//       node.childIds
//           .map(id => this.map[id])
//           .forEach(child => {
//               this.deepRemove(child);
//               delete this.map[child.id];
//           })
//   }

//   remove(id: string) {
//       const node = this.getThrow(id);
//       delete this.map[id];

//       if (node.parentId) {
//           this.removeOfParent(id, node.parentId);
//       }

//       if (node.childIds) {
//           this.deepRemove(node);
//       }
//   }

//   move(id: string, toParentId: string, index?: number) {
//       const node = this.getThrow(id);

//       if (node.parentId) {
//           this.removeOfParent(id, node.parentId);
//       }

//       const parent = this.getThrow(toParentId);
//       if (typeof index === 'number' && index > -1) {
//           parent.childIds.splice(index, 0, id);
//       } else {
//           parent.childIds.push(id);
//       }
//   }

// }


// export class DesignerNode {

//   // _id: string

//   // _parentId: string | null

//   // _data: DesignerComponentInstance

//   // _childIds: string[] = []

//   constructor(
//       public id: string,
//       public parentId: string | null,
//       public data: DesignerComponentInstance,
//       public childIds: string[] = []
//   ) {
//       // this._id = id;
//       // this._parentId = parentId;
//       // this._data = data;
//       // this._childIds = childIds;
//   }

//   // get id(){
//   //     return this._id
//   // }

//   // get data(){
//   //     return this._data
//   // }

//   // get parentId(){
//   //     return this._parentId
//   // }

//   // get childIds(){
//   //     return this._childIds
//   // }

// }

// export enum DesignerEventType {

//   Insert = 'insert',

//   Remove = 'remove',

//   Move = 'move'
// }

// export class DesignerInsertEvent {

//   readonly type = DesignerEventType.Insert

//   readonly index?: number

//   readonly parentId: string

//   readonly instance: DesignerComponentInstance

//   constructor(
//       parentId: string,
//       instance: DesignerComponentInstance,
//       index?: number
//   ) {
//       this.index = index;
//       this.parentId = parentId;
//       this.instance = instance;
//   }
// }

// export class DesignerMoveEvent {

//   readonly type = DesignerEventType.Move

//   readonly index?: number

//   readonly parentId: string

//   readonly id: string

//   constructor(
//       id: string,
//       parentId: string,
//       index?: number
//   ) {
//       this.id = id;
//       this.index = index;
//       this.parentId = parentId;
//   }

// }

// export class DesignerRemoveEvent {

//   readonly type = DesignerEventType.Remove

//   readonly id: string

//   constructor(
//       id: string
//   ) {
//       this.id = id;
//   }

// }

// export interface DesignerEvent {

//   type: DesignerEventType

// }

// export class DesignerApplication {

//   private _designer: Designer

//   private events: DesignerEvent[] = [];

//   constructor(designer: Designer) {
//       this._designer = designer;
//   }

//   get designer() {
//       return this._designer;
//   }

//   public apply(event: DesignerEvent) {

//       switch (event.type) {

//           case DesignerEventType.Insert:
//               const insertEvt = event as DesignerInsertEvent;
//               this._designer.insert(insertEvt.parentId, insertEvt.instance, insertEvt.index);
//               break;

//           case DesignerEventType.Move:
//               const moveEvt = event as DesignerMoveEvent;
//               this._designer.move(moveEvt.id, moveEvt.parentId, moveEvt.index);
//               break;

//           case DesignerEventType.Remove:
//               const removeEvt = event as DesignerRemoveEvent;
//               this._designer.remove(removeEvt.id);
//               break;
//       }

//   }

//   public back(step: number) {
//       const end = this.events.length + step;
//       this._designer = new Designer();
//       for (let i = 0; i < end; i++) {
//           this.apply(this.events[0]);
//       }
//   }

// }

// // export class EventStore {

// //     private events: DesignerEvent[] = [];

// //     append(event: DesignerEvent) {
// //         this.events.push(event);
// //     }

// //     get E

// // }