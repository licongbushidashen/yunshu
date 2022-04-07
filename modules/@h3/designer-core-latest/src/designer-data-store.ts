

import * as forms from 'h3-forms'

import {
    DesignerState, DesignerApplication,
    StoreKey, InsertPayload,
    MovePayload, RemovePayload, DesignerInsertEvent,
    DesignerRemoveEvent, DesignerMoveEvent, DesignerNode
} from './register';

const app = new DesignerApplication()

const state: DesignerState = {
    active: null,
    app
}


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

const getters = {

    [StoreKey.GetChildren]: (state: DesignerState) => (id: string) => {
        const node = state.app.designer.get(id);
        if(node && node.childIds){
            const children = node.childIds.map(cid => state.app.designer.get(cid)).filter(c => !!c);
            return children;
        }
        return []
    },

    [StoreKey.GetParent]: (state: DesignerState) => (id: string) => {
        const node = state.app.designer.get(id);
        if(node.parentId){
            return state.app.designer.get(node.parentId);
        }
        return null;
    },

    [StoreKey.IsAncestor]: (state: DesignerState) => (id: string, targetId: string) => {
        let node = state.app.designer.get(id);
        if (!node) {
            throw new Error('not found node: ' + id);
        }

        while (node && node.parentId) {
            if (node.parentId === targetId) {
                return true;
            }
            node = state.app.designer.get(node.parentId);
        }

        return false;
    },
}

const mutations = {

    setActive(state: DesignerState, node: DesignerNode | null) {
        state.active = node;
    },

    setRoot(state: DesignerState, payload: InsertPayload) {
        let { id, type, data } = payload;
        state.app.apply(new DesignerInsertEvent(id, type, data, null))
        // state.map = state.app.designer.map;
    },

    insert(state: DesignerState, payload: InsertPayload) {
        let { id, index, parentId, type, data } = payload;
        state.app.apply(new DesignerInsertEvent(id, type, data, parentId, index))
        // state.map = state.app.designer.map;
    },

    remove(state: DesignerState, payload: RemovePayload) {

        const { id } = payload;

        state.app.apply(new DesignerRemoveEvent(id))
    },

    move(state: DesignerState, payload: MovePayload) {
        const { index, parentId, id } = payload;

        state.app.apply(new DesignerMoveEvent(id, parentId, index))
    }
}


export const vuexStore = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions: {

    }

}
