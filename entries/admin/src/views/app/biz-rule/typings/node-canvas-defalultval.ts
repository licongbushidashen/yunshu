import { NodeType } from './node-type'
const baseData = {
    rules: [{
        "preActivityCode": "Start",
        "postActivityCode": "BizRule1",
        "points": ["406, 76", "406, 116"],
    }, {
        
        "preActivityCode": "BizRule1",
        "postActivityCode": "End",
        "points": ["406, 156", "406, 196"],
    },
],
    "activities": [{
        "nodeCode": "Start",
        "nodeName": "开始",
        "height": 40,
        "width": 158,
        "x": 327,
        "y": 36,
        'icon': '&#xe897;',
        nodeType: NodeType.Start,
        
        
    }, {
        "nodeCode": "BizRule1",
        "nodeName": "业务方法",
        "height": 40,
        "width": 158,
        "x": 327,
        "y": 116,
        nodeType: NodeType.BizAction,
    }, 
    {
        "nodeCode": "End",
        "nodeName": "结束",
        nodeType: NodeType.End,
        "height": 40,
        "width": 158,
        "x": 327,
        "y": 196,
        icon: '&#xe9a7;'
    }]
}

const regularOperation = {
    rules: [{
            "preNode": "Start",
            "postNode": "End",
            "points": ["406, 76", "406, 116"],

        }
    ],
    activities: [{
        "nodeCode": "Start",
        "nodeName": "开始",
        "height": 40,
        "width": 158,
        "x": 327,
        "y": 36,
        nodeType: NodeType.Start,
        'icon': '&#xe897;',
    }, 
    {
        "nodeCode": "End",
        "nodeName": "结束",
        nodeType: NodeType.End,
        "height": 40,
        "width": 158,
        "x": 327,
        "y": 116,
        icon: '&#xe9a7;'
    }]
}

const dataOperation = {
    rules: [{
            "preNode": "Start",
            "postNode": "$virtualNode",
            "points": ["406, 76", "406, 116"],
        }, {
            
            "preNode": "$virtualNode",
            "postNode": "End",
            "points": ["406, 156", "406, 196"],
        },
    ],
    activities: [{
        "nodeCode": "Start",
        "nodeName": "开始",
        "height": 40,
        "width": 158,
        "x": 327,
        "y": 36,
        nodeType: NodeType.Start,
        'icon': '&#xe897;',
    }, {
        "nodeCode": "$virtualNode",
        "nodeName": "请从左侧拖入节点",
        "height": 40,
        "width": 158,
        "x": 327,
        "y": 116,
        nodeType: NodeType.VirtualNode,
        isFictitious: true
    }, 
    {
        "nodeCode": "End",
        "nodeName": "结束",
        nodeType: NodeType.End,
        "height": 40,
        "width": 158,
        "x": 327,
        "y": 196,
        icon: '&#xe9a7;'
    }]
}

// export default baseData;

export {
    baseData, regularOperation, dataOperation
}