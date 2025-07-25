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

import { useState } from 'react';
import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { openshiftImageRegistryApiRef } from '../api';
import { ImageStream, ImageStreamMetadata } from '../types';
import { formatByteSize } from '../utils';

export const useImageStreamsMetadataFromTag = (imageStreams: ImageStream[]) => {
  const client = useApi(openshiftImageRegistryApiRef);
  const [imageStreamsData, setImageStreamsData] = useState<
    ImageStreamMetadata[]
  >([]);

  const { loading } = useAsync(async () => {
    const imgStsData = imageStreams?.length
      ? await Promise.all(
          imageStreams.map(async (imst: ImageStream) => {
            try {
              const tag = await client.getImageStreamTag(
                imst.namespace,
                imst.name,
                imst.tags[0] || '',
              );
              return {
                ...imst,
                description:
                  tag.image.dockerImageMetadata?.Config?.Labels?.[
                    'io.k8s.description'
                  ] ||
                  tag.image.dockerImageMetadata?.Config?.description ||
                  '',
                version:
                  tag.image.dockerImageMetadata?.Config?.Labels?.version || '',
                size: formatByteSize(tag.image.dockerImageMetadata?.Size) || '',
              };
            } catch {
              return imst;
            }
          }),
        )
      : [];
    setImageStreamsData(imgStsData);
  }, [imageStreams]);

  return { loading, imageStreamsMetadata: imageStreamsData };
};
