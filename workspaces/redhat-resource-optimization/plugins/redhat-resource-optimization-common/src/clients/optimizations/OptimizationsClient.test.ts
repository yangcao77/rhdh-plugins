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

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { OptimizationsClient } from './OptimizationsClient';
import { DiscoveryApi } from '../../generated/types/discovery';
import { GetRecommendationByIdRequest } from './types';
import RecommendationMockResponse from './fixtures/recommendation-mock.json' assert { type: 'json' };

function makePlotsDataPropertyPathWithTerm(
  term: 'short' | 'medium' | 'long',
  dateString: string,
) {
  return [
    'recommendations',
    'recommendationTerms',
    `${term}Term`,
    'plots',
    'plotsData',
    dateString,
  ];
}

const MOCK_BASE_URL = 'https://backstage:1234/api/proxy';
const mockDiscoveryApi: DiscoveryApi = {
  async getBaseUrl(_pluginId: string): Promise<string> {
    return MOCK_BASE_URL;
  },
};
const server = setupServer(
  http.get(`${MOCK_BASE_URL}/token`, _info =>
    HttpResponse.json({
      accessToken: 'hereisyourtokensir',
      expiresAt: 1234567890,
    }),
  ),
  http.get(`${MOCK_BASE_URL}/access`, _info =>
    HttpResponse.json({
      decision: 'ALLOW',
    }),
  ),
);

// eslint-disable-next-line jest/no-disabled-tests
describe('OptimizationsApiClientProxy.ts', () => {
  let client: OptimizationsClient;

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => {
    client = new OptimizationsClient({
      discoveryApi: mockDiscoveryApi,
      fetchApi: { fetch: globalThis.fetch },
    });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('getRecommendationById', () => {
    describe('responses', () => {
      it("should not transform the plotsData's date-string properties", async () => {
        expect.assertions(3);

        // Arrange
        server.use(
          http.get(
            `${MOCK_BASE_URL}/cost-management/v1/recommendations/openshift/:id`,
            _info => HttpResponse.json(RecommendationMockResponse),
          ),
        );

        // Act
        const request: GetRecommendationByIdRequest = {
          path: { recommendationId: 'abcdef01-abcd-abcd-abcd-0123456789abc' },
          query: {},
        };
        const response = await client.getRecommendationById(request);
        const json = await response.json();

        // Assert
        expect(json).toHaveProperty(
          makePlotsDataPropertyPathWithTerm(
            'short',
            '2024-07-30T17:00:05.000Z',
          ),
        );
        expect(json).toHaveProperty(
          makePlotsDataPropertyPathWithTerm(
            'medium',
            '2024-07-25T11:00:05.000Z',
          ),
        );
        expect(json).toHaveProperty(
          makePlotsDataPropertyPathWithTerm('long', '2024-07-17T11:00:05.000Z'),
        );
      });

      it('should not transform to snake_case the recommendationId path parameter', async () => {
        expect.assertions(2);

        // Arrange
        const spyOnDefaultClientGetRecommendationById = jest.spyOn(
          // @ts-ignore (because defaultClient is private 🤫)
          client.defaultClient,
          'getRecommendationById',
        );
        server.use(
          http.get(
            `${MOCK_BASE_URL}/cost-management/v1/recommendations/openshift/:id`,
            _info => HttpResponse.json(RecommendationMockResponse),
          ),
        );

        // Act
        const request: GetRecommendationByIdRequest = {
          path: { recommendationId: 'abcdef01-abcd-abcd-abcd-0123456789abc' },
          query: { cpuUnit: 'cores' },
        };
        await client.getRecommendationById(request);

        // Assert
        expect(
          spyOnDefaultClientGetRecommendationById.mock.lastCall?.[0],
        ).toHaveProperty('path.recommendationId');
        expect(
          spyOnDefaultClientGetRecommendationById.mock.lastCall?.[0],
        ).toHaveProperty('query.cpu_unit');
      });
    });
  });
});
