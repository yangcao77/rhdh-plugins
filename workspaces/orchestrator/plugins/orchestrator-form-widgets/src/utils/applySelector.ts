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
import jsonata from 'jsonata';
import { JsonObject } from '@backstage/types';

export const applySelectorArray = async (
  data: JsonObject,
  selector: string,
): Promise<string[]> => {
  const expression = jsonata(selector);
  const value = await expression.evaluate(data);

  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return value;
  }

  throw new Error(
    `Unexpected result of "${selector}" selector, expected string[] type. Value "${value}"`,
  );
};

export const applySelectorString = async (
  data: JsonObject,
  selector: string,
): Promise<string> => {
  const expression = jsonata(selector);
  const value = await expression.evaluate(data);

  if (typeof value === 'string') {
    return value;
  }

  throw new Error(
    `Unexpected result of "${selector}" selector, expected string type. Value "${value}"`,
  );
};
