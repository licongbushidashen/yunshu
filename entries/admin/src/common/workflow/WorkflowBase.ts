import { factory } from '../../../../../modules/@h3/designer-core-latest/property-panel'

import * as WorkflowNamespace from '../../typings/workflow';

import StartSchema  from '../workflow-schema/node-start-property/schema';
import EndSchema  from '../workflow-schema/node-end-property/schema';
import UserSchema  from '../workflow-schema/node-user-property/schema';
import SysSchema  from '../workflow-schema/node-system-property/schema';
import SubInstanceSchema  from '../workflow-schema/node-subinstance-property/schema';
import ConnectionSchema from '../workflow-schema/node-connection-property/schema';
import CirculateSchema from '../workflow-schema/node-circulate-property/schema';

export default class WorkflowBase {
  StartActivity: WorkflowNamespace.Activity = factory.build(StartSchema).value as WorkflowNamespace.Activity

  EndActivity: WorkflowNamespace.Activity = factory.build(EndSchema).value as WorkflowNamespace.Activity

  UserActivity: WorkflowNamespace.Activity = factory.build(UserSchema).value as WorkflowNamespace.Activity

  SysActivity: WorkflowNamespace.Activity = factory.build(SysSchema).value as WorkflowNamespace.Activity

  SubWorkflow: WorkflowNamespace.Activity = factory.build(SubInstanceSchema).value as WorkflowNamespace.Activity

  Connection: WorkflowNamespace.Activity = factory.build(ConnectionSchema).value as WorkflowNamespace.Activity

  Circulate: WorkflowNamespace.Activity = factory.build(CirculateSchema).value as WorkflowNamespace.Activity
}
