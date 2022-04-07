import createSchema from "./node-create/schema";
import createSetting from "./node-create/design/settings";

import bizActionsSchema from "./node-biz-actions/schema";
import bizActionsSettings from "./node-biz-actions/settings";

import messageSchema from "./node-message/schema";
import messageSetting from "./node-message/settings";

import logicVerifySchema from "./node-logic-verify/schema";
import logicVerifySetting from "./node-logic-verify/settings";

import getListSchema from "./node-get-list/schema";
import getListSetting from "./node-get-list/settings";

import updateSchema from './node-update/schema';
import updateSetting from './node-update/settings';

import assignSchema from './node-assign/schema';
import assignSetting from './node-assign/settings';

import dataCheckSchema from './node-data-check/schema';
import dataCheckSetting from './node-data-check/settings';

import existVerifySchema from './node-exist-verify/schema';
import existVerifySetting from './node-exist-verify/settings';

import deleteSchema from  './node-delete/schema';
import deleteSetting from  './node-delete/settings';

import { NodeType } from '../typings/node-type';

// export const settings = {
//     8: createSetting,
//     9: bizActionsSettings,
//     7: createSetting,
//     6: createSetting,
//     3: messageSetting,
//     4: logicVerifySetting,
//     10: getListSetting
// }

// export const schema = {
//     8: createSchema,
//     9: bizActionsSchema,
//     7: createSchema,
//     6: createSchema,
//     3: messageSchema,
//     4:logicVerifySchema,
//     10: getListSchema
// }

export const settings = {
    [NodeType.Create]: createSetting,
    [NodeType.BizAction]: bizActionsSettings,
    [NodeType.Update]: updateSetting,
    [NodeType.Delete]: deleteSetting,
    [NodeType.Message]: messageSetting,
    [NodeType.LogicVerify]: logicVerifySetting,
    [NodeType.Assign]: assignSetting,
    [NodeType.DataCheck]: dataCheckSetting,
    [NodeType.ExistVerify]: existVerifySetting,
    [NodeType.GetList]: getListSetting
}

export const schema = {
    [NodeType.Create]: createSchema,
    [NodeType.BizAction]: bizActionsSchema,
    [NodeType.Update]: updateSchema,
    [NodeType.Delete]: deleteSchema,
    [NodeType.Message]: messageSchema,
    [NodeType.LogicVerify]:logicVerifySchema,
    [NodeType.Assign]:assignSchema,
    [NodeType.DataCheck]:dataCheckSchema,
    [NodeType.ExistVerify]:existVerifySchema,
    [NodeType.GetList]: getListSchema
}


 


