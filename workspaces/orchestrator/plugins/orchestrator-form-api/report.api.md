## API Report File for "@red-hat-developer-hub/backstage-plugin-orchestrator-form-api"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

/// <reference types="react" />

import { ApiRef } from '@backstage/core-plugin-api';
import { ErrorSchema } from '@rjsf/utils';
import { FormProps } from '@rjsf/core';
import { JsonObject } from '@backstage/types';
import { JSONSchema7 } from 'json-schema';
import { default as React_2 } from 'react';
import { UiSchema } from '@rjsf/utils';

// @public
export type FormDecoratorProps = Pick<FormProps<JsonObject, JSONSchema7>, 'formData' | 'formContext' | 'widgets' | 'onChange' | 'customValidate'> & {
    getExtraErrors?: (formData: JsonObject) => Promise<ErrorSchema<JsonObject>> | undefined;
};

// @public
export interface OrchestratorFormApi {
    getFormDecorator(): OrchestratorFormDecorator;
}

// @public
export const orchestratorFormApiRef: ApiRef<OrchestratorFormApi>;

// @public (undocumented)
export type OrchestratorFormContextProps = {
    schema: JSONSchema7;
    updateSchema: OrchestratorFormSchemaUpdater;
    numStepsInMultiStepSchema?: number;
    children: React_2.ReactNode;
    onSubmit: (formData: JsonObject) => void;
    uiSchema: UiSchema<JsonObject, JSONSchema7>;
    formData: JsonObject;
    setFormData: (data: JsonObject) => void;
};

// @public
export type OrchestratorFormDecorator = (FormComponent: React.ComponentType<FormDecoratorProps>) => React.ComponentType;

// @public
export type OrchestratorFormSchemaUpdater = (chunks: SchemaChunksResponse) => void;

// @public
export type SchemaChunksResponse = {
    [key: string]: JsonObject;
};

// @public
export const useWrapperFormPropsContext: () => OrchestratorFormContextProps;

// @public
export const WrapperFormPropsContext: React_2.Context<OrchestratorFormContextProps | null>;

// Warnings were encountered during analysis:
//
// src/context.d.ts:9:1 - (ae-undocumented) Missing documentation for "OrchestratorFormContextProps".

// (No @packageDocumentation comment for this package)

```
