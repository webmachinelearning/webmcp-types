import { expectTypeOf, test } from 'vitest';
import type { WebMCP as ImportedWebMCP } from './index.js';

test('exposes WebMCP as both an ambient and exported namespace', () => {
    expectTypeOf<Document['modelContext']>().toEqualTypeOf<WebMCP.ModelContext | undefined>();
    expectTypeOf<ImportedWebMCP.ModelContext>().toEqualTypeOf<WebMCP.ModelContext>();
});

test('infers an inline object schema', () => {
    void document.modelContext?.registerTool({
        name: 'search',
        description: 'Searches the page.',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string' },
                limit: { type: 'integer' },
                tags: { type: 'array', items: { type: 'string' } },
                filters: {
                    type: 'object',
                    properties: { exact: { type: 'boolean' } },
                    required: ['exact'],
                },
                mode: { enum: ['fast', 'full'] },
                version: { const: 1 },
                nothing: { type: 'null' },
            },
            required: ['query', 'tags'],
        },
        execute: (input, options) => {
            expectTypeOf(input).toEqualTypeOf<{
                query: string;
                limit?: number;
                tags: string[];
                filters?: { exact: boolean };
                mode?: 'fast' | 'full';
                version?: 1;
                nothing?: null;
            }>();
            expectTypeOf(options.signal).toEqualTypeOf<AbortSignal>();
        },
    });
});

test('infers a top-level array schema', () => {
    void document.modelContext?.registerTool({
        name: 'sum',
        description: 'Sums an array.',
        inputSchema: { type: 'array', items: { type: 'number' } },
        execute: (input) => expectTypeOf(input).toEqualTypeOf<number[]>(),
    });
});

interface InterfaceProperties {
    query: { type: 'string' };
}

interface RuntimeSchema {
    properties: InterfaceProperties;
    required: readonly ['query'] | readonly [];
}

declare const runtimeSchema: RuntimeSchema;

test('leaves fields optional when runtime required tuples differ', () => {
    void document.modelContext?.registerTool({
        name: 'runtime-required',
        description: 'Does not merge alternative required tuples.',
        inputSchema: runtimeSchema,
        execute: (input) => expectTypeOf(input).toEqualTypeOf<{ query?: string }>(),
    });
});

declare const runtimeRequiredKey: 'query' | 'limit';

test('leaves fields optional when a required key is selected at runtime', () => {
    void document.modelContext?.registerTool({
        name: 'runtime-required-key',
        description: 'Does not require every possible runtime key.',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string' },
                limit: { type: 'integer' },
            },
            required: [runtimeRequiredKey],
        },
        execute: (input) => expectTypeOf(input).toEqualTypeOf<{ query?: string; limit?: number }>(),
    });
});

declare const widenedSchema: object;

test('keeps the existing fallback for widened schemas and prebuilt tools', () => {
    const tool = {
        name: 'prebuilt',
        description: 'Keeps the existing ModelContextTool contract.',
        inputSchema: widenedSchema,
        execute: (input) => expectTypeOf(input).toEqualTypeOf<Record<string, unknown>>(),
    } satisfies WebMCP.ModelContextTool;

    void document.modelContext?.registerTool(tool);
});

type SearchSchema = {
    type: 'object';
    properties: { query: { type: 'string' } };
    required: ['query'];
};

test('exposes a named inferred tool type', () => {
    expectTypeOf<WebMCP.ModelContextToolFromSchema<SearchSchema>['execute']>()
        .parameter(0)
        .toEqualTypeOf<{ query: string }>();
});

test('uses an object fallback for a null schema', () => {
    expectTypeOf<WebMCP.ModelContextToolFromSchema<{ type: 'null' }>['execute']>()
        .parameter(0)
        .toEqualTypeOf<Record<string, unknown>>();
});

test('accepts a tool without an input schema', () => {
    void document.modelContext?.registerTool({
        name: 'schema-less',
        description: 'Does not define input parameters.',
        execute: (input) => expectTypeOf(input).toEqualTypeOf<Record<string, unknown>>(),
    });
});

test('rejects a callback that disagrees with its schema', () => {
    void document.modelContext?.registerTool({
        name: 'mismatch',
        description: 'Must match its schema.',
        inputSchema: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query'],
        },
        // @ts-expect-error query is a string in inputSchema.
        execute: (input: { query: number }) => input.query,
    });
});
