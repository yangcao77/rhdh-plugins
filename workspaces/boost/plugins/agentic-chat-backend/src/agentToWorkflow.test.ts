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

import type { Entity } from '@backstage/catalog-model';
import { agentToWorkflow } from './agentToWorkflow';

const agent: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'AiResource',
  metadata: { name: 'support-agent' },
  spec: {
    type: 'agent',
    lifecycle: 'production',
    owner: 'group:default/platform',
    instructions: 'Help the user',
    model: 'granite',
    tools: ['search'],
    outputSchema: {
      type: 'object',
      properties: { answer: { type: 'string' } },
    },
  },
};

it('maps the Catalog fields and query into exactly one workflow agent step', () => {
  expect(agentToWorkflow(agent, 'What failed?')).toEqual({
    apiVersion: 'v1',
    kind: 'AgentWorkflow',
    metadata: { name: 'support-agent' },
    spec: {
      steps: [
        {
          agent: 'support-agent',
          name: 'agent',
          type: 'agent',
          prompt: 'What failed?',
          output_key: 'result',
          instructions: 'Help the user',
          tools: ['search'],
          inference_provider: { name: 'granite', model: 'granite' },
          output_schema: {
            type: 'object',
            properties: { answer: { type: 'string' } },
          },
        },
      ],
    },
  });
});

it.each([
  ['in-process', 'none'],
  ['subprocess', 'local'],
  ['sandbox', 'ephemeral'],
])('maps %s to spawn %s', (mode, spawn) => {
  expect(
    agentToWorkflow(
      { ...agent, spec: { ...agent.spec, executionMode: mode } },
      'Hello',
    ).spec.steps[0].spawn,
  ).toBe(spawn);
});

it('leaves omitted execution mode and optional capabilities absent', () => {
  const minimal = {
    ...agent,
    spec: { type: 'agent', lifecycle: 'production', owner: 'team' },
  };
  const step = agentToWorkflow(minimal, 'Hello').spec.steps[0];
  expect(JSON.parse(JSON.stringify(step))).toEqual({
    agent: 'support-agent',
    name: 'agent',
    type: 'agent',
    prompt: 'Hello',
    output_key: 'result',
  });
});

it.each(['invalid', false, null])('rejects invalid execution mode %s', mode => {
  expect(() =>
    agentToWorkflow(
      { ...agent, spec: { ...agent.spec, executionMode: mode } },
      'Hello',
    ),
  ).toThrow('Invalid agent configuration');
});

it('rejects handoffs instead of silently dropping another agent', () => {
  expect(() =>
    agentToWorkflow(
      { ...agent, spec: { ...agent.spec, handoffs: ['other-agent'] } },
      'Hello',
    ),
  ).toThrow('Handoffs are not supported');
});

it('rejects non-agent entities and unsupported string output schemas', () => {
  expect(() =>
    agentToWorkflow({ ...agent, kind: 'Component' }, 'Hello'),
  ).toThrow('Expected an AiResource agent');
  expect(() =>
    agentToWorkflow(
      { ...agent, spec: { ...agent.spec, outputSchema: 'CustomType' } },
      'Hello',
    ),
  ).toThrow('Invalid agent configuration');
});
