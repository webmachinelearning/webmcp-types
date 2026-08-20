/**
 * Type-level tests for the WebMCP declarations.
 *
 * These are statically checked by the TypeScript compiler through vitest's
 * typecheck mode (`npm test`); they are never executed.
 */
import { expectTypeOf, test } from 'vitest';

test('the WebMCP global declarations are ambient', () => {
    expectTypeOf<Pick<Document, 'modelContext'>>().toEqualTypeOf<{
        readonly modelContext?: WebMCP.ModelContext;
    }>();
});

test('execute receives the input object and ToolExecuteCallbackOptions', () => {
    expectTypeOf<WebMCP.ToolExecuteCallback<{ text: string }>>()
        .parameter(0)
        .toEqualTypeOf<{ text: string }>();
    expectTypeOf<WebMCP.ToolExecuteCallback<{ text: string }>>()
        .parameter(1)
        .toEqualTypeOf<WebMCP.ToolExecuteCallbackOptions>();
    expectTypeOf<WebMCP.ToolExecuteCallbackOptions['signal']>().toEqualTypeOf<AbortSignal>();
});

test('registerTool accepts a handler with a narrowed input type', () => {
    void document.modelContext?.registerTool({
        name: 'add_todo',
        description: 'Adds a todo item.',
        inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
        execute: (input: { text: string }) => input.text,
    });
});

test('registerTool accepts a method-shorthand handler', () => {
    void document.modelContext?.registerTool({
        name: 'add_todo',
        description: 'Adds a todo item.',
        execute(input: { text: string }) {
            return input.text;
        },
    });
});

test('an interface input type satisfies the constraint', () => {
    interface AddTodoInput {
        text: string;
        done?: boolean;
    }
    void document.modelContext?.registerTool<AddTodoInput>({
        name: 'add_todo',
        description: 'Adds a todo item.',
        execute: (input) => {
            expectTypeOf(input).toEqualTypeOf<AddTodoInput>();
            return input.text;
        },
    });
});

test('a prebuilt typed callback is accepted by registerTool', () => {
    const execute: WebMCP.ToolExecuteCallback<{ text: string }> = (input) => input.text;
    void document.modelContext?.registerTool({
        name: 'add_todo',
        description: 'Adds a todo item.',
        execute,
    });
});

test('an explicit type argument threads through to the handler', () => {
    const registration = document.modelContext?.registerTool<{ query: string }>({
        name: 'search',
        description: 'Searches the page.',
        execute: (input) => {
            expectTypeOf(input).toEqualTypeOf<{ query: string }>();
            return input.query;
        },
    });
    expectTypeOf(registration).toEqualTypeOf<Promise<void> | undefined>();
});

test('a mismatched handler is rejected', () => {
    expectTypeOf<(input: { count: number }) => string>()
        .not.toExtend<WebMCP.ToolExecuteCallback<{ query: string }>>();
    expectTypeOf<(input: { query: string; count: number }) => string>()
        .not.toExtend<WebMCP.ToolExecuteCallback<{ query: string }>>();
    expectTypeOf<(input: Record<never, never>) => string>().toExtend<
        WebMCP.ToolExecuteCallback<{ query: string }>
    >();
});

test('untyped registrations keep the Record<string, unknown> default', () => {
    expectTypeOf<WebMCP.ModelContextTool['execute']>()
        .parameter(0)
        .toEqualTypeOf<Record<string, unknown>>();
    void document.modelContext?.registerTool({
        name: 'echo',
        description: 'Echoes its input.',
        inputSchema: { type: 'object' },
        execute: async (input) => {
            expectTypeOf(input).toEqualTypeOf<Record<string, unknown>>();
            return JSON.stringify(input);
        },
    });
});

test('tools typed without a type argument keep working', () => {
    const tool: WebMCP.ModelContextTool = {
        name: 'echo',
        description: 'Echoes its input.',
        execute: (input) => JSON.stringify(input),
    };
    const tools: WebMCP.ModelContextTool[] = [tool];
    const registerAll = (context: WebMCP.ModelContext, list: WebMCP.ModelContextTool[]) =>
        Promise.all(list.map((entry) => context.registerTool(entry)));
    void document.modelContext?.registerTool(tool);
    void tools;
    void registerAll;
});
