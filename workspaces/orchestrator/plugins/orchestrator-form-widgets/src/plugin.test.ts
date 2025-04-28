/*
 * Copyright Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<<<<<<<< HEAD:workspaces/lightspeed/plugins/lightspeed/src/const.ts
export const TEMP_CONVERSATION_ID = 'temp-conversation-id';
========
import { orchestratorFormWidgetsPlugin } from './plugin';

describe('orchestrator-form-widgets', () => {
  it('should export plugin', () => {
    expect(orchestratorFormWidgetsPlugin).toBeDefined();
  });
});
>>>>>>>> 54c33dbda11cebf917566688f4cd10dd036f4805:workspaces/orchestrator/plugins/orchestrator-form-widgets/src/plugin.test.ts
