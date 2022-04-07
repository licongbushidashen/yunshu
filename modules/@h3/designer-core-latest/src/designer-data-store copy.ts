

// import {
//     DesignerState, ComponentTreeNode, ComponentTreeLeaf,
//     DesignerComponentInstance, StoreKey, InsertPayload,
//     AppendPayload, RemovePayload
// } from './register';


// const state: DesignerState = {
//     active: null,
//     map: {},
//     tree: null
// }


// function findNodeById(state: DesignerState, id: string) {
//     if (!id) {
//         return;
//     }

//     if (!state.tree) {
//         return null
//     }

//     const instance = state.map[id];
//     if (!instance) {
//         return null;
//     }

//     // if (instance.path === '/') {
//     //     return state.tree;
//     // }

//     // const segments = instance.path.split('/');
//     // segments.shift();
//     let node: ComponentTreeLeaf | ComponentTreeNode | null = state.tree;
//     // for (const seg of segments) {
//     //     if (node && (node as ComponentTreeNode).children) {
//     //         node = (node as ComponentTreeNode).children.find(c => c.id === seg) || null;
//     //     } else {
//     //         node = null;
//     //         break;
//     //     }
//     // }

//     return node
// }

// function removeNode(state: DesignerState, leaf: ComponentTreeLeaf) {
//     const node = leaf as ComponentTreeNode;
//     if (node.children) {
//         node.children.forEach(c => removeNode(state, c));
//     }
//     delete state.map[node.id];
// }

// function updateChildrenPath(state: DesignerState, node: ComponentTreeNode, path: string) {
//     if(!node.children){
//         return;
//     }
    
//     for(const child of node.children){
//         const childPath = path + '/' + child.id;
//         // state.map[child.id].path = childPath;
//         if(node.children && node.children.length > 0){
//             updateChildrenPath(state, child as ComponentTreeNode, childPath);
//         }
//     }
// }

// const getters = {

//     [StoreKey.GetChildren]: (state: DesignerState) => (id: string) => {
//         const node = findNodeById(state, id);
//         if (node && (node as ComponentTreeNode).children) {
//             return (node as ComponentTreeNode).children.map(c => state.map[c.id]);
//         }
//         return [];
//     },

//     [StoreKey.GetParent]: (state: DesignerState) => (id: string) => {
//         const node = findNodeById(state, id);
//         if (!node) {
//             return null;
//         }

//         return state.map[node.parentId];
//     },

//     [StoreKey.IsAncestor]: (state: DesignerState) => (id: string, targetId: string) => {
//         let node = findNodeById(state, id);
//         if (!node) {
//             throw new Error('not found node: ' + id);
//         }

//         while (node && node.parentId) {
//             if (node.parentId === targetId) {
//                 return true;
//             }
//             node = findNodeById(state, node.parentId);
//         }

//         return false;
//     },
// }

// const mutations = {

//     setActive(state: DesignerState, instance: DesignerComponentInstance | null) {
//         state.active = instance;
//     },

//     setRoot(state: DesignerState, instance: DesignerComponentInstance) {
//         if (state.tree) {
//             return;
//         }

//         state.map[instance.id] = instance;
//         state.tree = {
//             id: instance.id,
//             children: [],
//             parentId: ''
//         };
//     },

//     insert(state: DesignerState, payload: InsertPayload) {
//         let { index, parentId, instance } = payload;
//         const parent = findNodeById(state, parentId) as ComponentTreeNode;
//         if (!parent) {
//             throw new Error('');
//         }

//         if (!parent.children) {
//             throw new Error('');
//         }

//         state.map[instance.id] = instance;

//         const node: ComponentTreeLeaf = {
//             id: instance.id,
//             parentId
//         };

//         if (instance.info.container) {
//             (node as ComponentTreeNode).children = [];
//         }

//         if (index < 0) {
//             parent.children.push(node);
//         } else {
//             parent.children.splice(index, 0, node)
//         }
//     },

//     remove(state: DesignerState, payload: RemovePayload) {

//         const { id } = payload;

//         const node = findNodeById(state, id) as ComponentTreeNode;
//         if (!node) {
//             return;
//         }

//         const parent = findNodeById(state, node.parentId) as ComponentTreeNode;
//         if (!parent || !parent.children) {
//             return;
//         }

//         const idx = parent.children.findIndex(c => c.id === id);
//         if (idx === -1) {
//             return;
//         }

//         parent.children.splice(idx, 1);

//         removeNode(state, node);
//     },

//     move(state: DesignerState, payload: InsertPayload) {
//         const { index, parentId, instance } = payload;

//         const parent = findNodeById(state, parentId) as ComponentTreeNode;
//         if (!parent || !parent.children) {
//             return;
//         }

//         const self = findNodeById(state, instance.id);
//         if (!self) {
//             throw new Error('move');
//         }

//         const oldParent = findNodeById(state, self.parentId) as ComponentTreeNode;
//         const idx = oldParent.children.findIndex(c => c.id === self.id);
//         if (idx === -1) {
//             throw new Error('move');
//         }

//         oldParent.children.splice(idx, 1);
//         parent.children.splice(index, 0, self);

//         // let path = state.map[parentId].path;
//         // const uid = self.id;
//         // if (path === '/') {
//         //     path += uid;
//         // } else {
//         //     path += '/' + uid;
//         // }
//         // instance.path = path;
//         self.parentId = parent.id;
//         // updateChildrenPath(state, self as ComponentTreeNode, path);
//     }
// }


// export const vuexStore = {
//     namespaced: true,
//     state,
//     getters,
//     mutations,
//     actions: {

//     }

// }
