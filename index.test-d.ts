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
declare const prebuiltTool: WebMCP.ModelContextTool;

test('keeps the fallback for widened schemas and prebuilt tools', () => {
    const tool = {
        name: 'prebuilt',
        description: 'Keeps the existing ModelContextTool contract.',
        inputSchema: widenedSchema,
        outputSchema: widenedSchema,
        execute: (input) => {
            expectTypeOf(input).toEqualTypeOf<Record<string, unknown>>();
            return 'anything';
        },
    } satisfies WebMCP.ModelContextTool;

    void document.modelContext?.registerTool(tool);
    void document.modelContext?.registerTool(prebuiltTool);
    void document.modelContext?.registerTool({
        name: 'widened',
        description: 'Does not infer from widened schemas.',
        inputSchema: widenedSchema,
        outputSchema: widenedSchema,
        execute: (input) => {
            expectTypeOf(input).toEqualTypeOf<Record<string, unknown>>();
            return 'anything';
        },
    });
});

type SearchSchema = {
    type: 'object';
    properties: { query: { type: 'string' } };
    required: ['query'];
};

type SearchResultsSchema = {
    type: 'array';
    items: { type: 'string' };
};

test('exposes a named inferred tool type', () => {
    expectTypeOf<WebMCP.ModelContextToolFromSchema<SearchSchema>['execute']>()
        .parameter(0)
        .toEqualTypeOf<{ query: string }>();
    expectTypeOf<WebMCP.ModelContextToolFromSchema<SearchSchema, SearchResultsSchema>['execute']>()
        .returns
        .toEqualTypeOf<WebMCP.MaybePromise<string[]>>();
});

test('uses an object fallback for a null schema', () => {
    void document.modelContext?.registerTool({
        name: 'null-schema',
        description: 'Falls back to an object input.',
        inputSchema: { type: 'null' },
        execute: (input) => expectTypeOf(input).toEqualTypeOf<Record<string, unknown>>(),
    });
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

test('supports tool annotations', () => {
    void document.modelContext?.registerTool({
        name: 'annotated-tool',
        description: 'Defines all tool annotations.',
        annotations: {
            readOnlyHint: true,
            untrustedContentHint: false,
            consequentialHint: false,
            debugging: false,
        },
        execute: () => {},
    });

    expectTypeOf<WebMCP.ToolAnnotations>().toEqualTypeOf<{
        readOnlyHint?: boolean;
        untrustedContentHint?: boolean;
        consequentialHint?: boolean;
        debugging?: boolean;
    }>();
    expectTypeOf<WebMCP.ModelContextTool['annotations']>().toEqualTypeOf<WebMCP.ToolAnnotations | undefined>();
    expectTypeOf<WebMCP.RegisteredTool['annotations']>().toEqualTypeOf<WebMCP.ToolAnnotations | undefined>();
});

test('infers execute output from an output schema', () => {
    void document.modelContext?.registerTool({
        name: 'output-only',
        description: 'Infers the return type from the output schema.',
        outputSchema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                currency: { enum: ['EUR', 'USD'] },
            },
            required: ['total'],
        },
        execute: (input) => {
            expectTypeOf(input).toEqualTypeOf<Record<string, unknown>>();
            return { total: 42, currency: 'EUR' };
        },
    });

    void document.modelContext?.registerTool({
        name: 'input-and-output',
        description: 'Infers both input and output.',
        inputSchema: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query'],
        },
        outputSchema: {
            type: 'object',
            properties: { results: { type: 'array', items: { type: 'string' } } },
        },
        execute: (input) => {
            expectTypeOf(input).toEqualTypeOf<{ query: string }>();
            return { results: [input.query] };
        },
    });

    void document.modelContext?.registerTool({
        name: 'async-output',
        description: 'Accepts an async execute callback.',
        outputSchema: { type: 'array', items: { type: 'string' } },
        execute: async () => ['a', 'b'],
    });

    expectTypeOf<WebMCP.ModelContextTool['outputSchema']>().toEqualTypeOf<object | undefined>();
    expectTypeOf<WebMCP.RegisteredTool['outputSchema']>().toEqualTypeOf<object | undefined>();
});

test('rejects an invalid output schema or a return value that disagrees with it', () => {
    void document.modelContext?.registerTool({
        name: 'invalid-output-schema',
        description: 'Output schema must be an object.',
        // @ts-expect-error outputSchema must be an object.
        outputSchema: '',
        execute: () => {},
    });

    void document.modelContext?.registerTool({
        name: 'output-mismatch',
        description: 'Must return a value matching its output schema.',
        outputSchema: {
            type: 'object',
            properties: { total: { type: 'number' } },
            required: ['total'],
        },
        // @ts-expect-error total is a number in outputSchema.
        execute: () => ({ total: 'many' }),
    });

    void document.modelContext?.registerTool({
        name: 'output-missing',
        description: 'Must return the required output properties.',
        inputSchema: {
            type: 'object',
            properties: { query: { type: 'string' } },
        },
        outputSchema: {
            type: 'object',
            properties: { total: { type: 'number' } },
            required: ['total'],
        },
        // @ts-expect-error total is required in outputSchema.
        execute: async () => ({}),
    });
});

declare const registeredTool: WebMCP.RegisteredTool;

test('supports executeTool', async () => {
    const controller = new AbortController();

    if (document.modelContext) {
        const result = await document.modelContext.executeTool(registeredTool);
        expectTypeOf(result).toEqualTypeOf<string>();

        await document.modelContext.executeTool(registeredTool, { query: 'test' });
        await document.modelContext.executeTool(registeredTool, [1, 2, 3]);
        await document.modelContext.executeTool(registeredTool, {}, { signal: controller.signal });

        // @ts-expect-error inputObject must be an object.
        await document.modelContext.executeTool(registeredTool, 'invalid');
        // @ts-expect-error inputObject must be an object.
        await document.modelContext.executeTool(registeredTool, 123);
    }

    expectTypeOf<WebMCP.ModelContextExecuteToolOptions>().toEqualTypeOf<{
        signal?: AbortSignal;
    }>();
});

test('supports the toolchange, toolactivated, and toolcancel events', () => {
    document.modelContext?.addEventListener('toolchange', (event) => {
        expectTypeOf(event).toEqualTypeOf<Event>();
    });

    document.modelContext?.addEventListener('toolactivated', (event) => {
        expectTypeOf(event).toEqualTypeOf<ToolActivatedEvent>();
        expectTypeOf(event.toolName).toEqualTypeOf<string>();
    });

    document.modelContext?.addEventListener('toolcancel', (event) => {
        expectTypeOf(event).toEqualTypeOf<ToolCancelEvent>();
        expectTypeOf(event.toolName).toEqualTypeOf<string>();
    });

    if (document.modelContext) {
        document.modelContext.ontoolchange = (event) => {
            expectTypeOf(event).toEqualTypeOf<Event>();
        };
        document.modelContext.ontoolactivated = (event) => {
            expectTypeOf(event).toEqualTypeOf<ToolActivatedEvent>();
        };
        document.modelContext.ontoolcancel = (event) => {
            expectTypeOf(event).toEqualTypeOf<ToolCancelEvent>();
        };
        document.modelContext.ontoolchange = null;
        document.modelContext.ontoolactivated = null;
        document.modelContext.ontoolcancel = null;
    }

    expectTypeOf(new ToolActivatedEvent('toolactivated')).toEqualTypeOf<ToolActivatedEvent>();
    expectTypeOf(new ToolActivatedEvent('toolactivated', { toolName: 'search', bubbles: true }))
        .toEqualTypeOf<ToolActivatedEvent>();
    expectTypeOf(new ToolCancelEvent('toolcancel', { toolName: 'search' })).toEqualTypeOf<ToolCancelEvent>();

    expectTypeOf<ToolActivatedEvent>().toExtend<Event>();
    expectTypeOf<ToolCancelEvent>().toExtend<Event>();
    expectTypeOf<WebMCP.ToolActivatedEvent>().toEqualTypeOf<ToolActivatedEvent>();
    expectTypeOf<WebMCP.ToolCancelEvent>().toEqualTypeOf<ToolCancelEvent>();
    expectTypeOf<WebMCP.ToolActivatedEventInit>().toEqualTypeOf<ToolActivatedEventInit>();
    expectTypeOf<WebMCP.ToolCancelEventInit>().toEqualTypeOf<ToolCancelEventInit>();
    expectTypeOf<ToolActivatedEventInit['toolName']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ToolCancelEventInit['toolName']>().toEqualTypeOf<string | undefined>();
});
