/**
 * The WebMCP API enables web apps to provide JavaScript-based tools to AI agents.
 */
declare namespace WebMCP {
    /**
     * Value that may be returned synchronously or via Promise.
     */
    type MaybePromise<T> = T | Promise<T>;

    /**
     * Callback for tool execution.
     * @param input The input parameters for the tool, as defined by its inputSchema.
     * @returns A promise that resolves with the tool's output.
     */
    type ToolExecuteCallback<T extends Record<string, unknown>> = (input: T) => MaybePromise<unknown>;

    /**
     * Metadata about a tool's behavior.
     */
    interface ToolAnnotations {
        /**
         * If `true`, the tool does not modify any state and only reads data.
         * @default false
         */
        readOnlyHint?: boolean;
        /**
         * If `true`, indicates the tool may return content from untrusted sources.
         * @default false
         */
        untrustedContentHint?: boolean;
    }

    /**
     * Describes a tool to be registered with the model context.
     */
    interface ModelContextTool {
        /**
         * The name of the tool. Must be 1-128 characters, ASCII alphanumeric, '_', '-', or '.'.
         */
        name: string;
        /**
         * A human-readable title for the tool.
         */
        title?: string;
        /**
         * Natural-language description of what the tool does.
         */
        description: string;
        /**
         * A JSON Schema describing the tool's input parameters.
         */
        inputSchema?: object;
        /**
         * The function to execute when the tool is called.
         */
        execute: ToolExecuteCallback;
        /**
         * Metadata about the tool's behavior.
         */
        annotations?: ToolAnnotations;
    }

    /**
     * Options for registering a tool.
     */
    interface ModelContextRegisterToolOptions {
        /**
         * An AbortSignal that can be used to unregister the tool.
         */
        signal?: AbortSignal;
        /**
         * A list of origins that are allowed to call this tool.
         */
        exposedTo?: string[];
    }

    interface ModelContextEventMap {
        "toolchange": Event;
    }

    /**
     * The ModelContext interface provides methods for registering tools.
     */
    interface ModelContext extends EventTarget {
        /**
         * Registers a new tool.
         * @param tool The tool definition.
         * @param options Registration options.
         */
        registerTool(tool: ModelContextTool, options?: ModelContextRegisterToolOptions): Promise<void>;
        /**
         * Event handler for the toolchange event.
         */
        ontoolchange: ((this: ModelContext, ev: Event) => any) | null;

        addEventListener<K extends keyof ModelContextEventMap>(type: K, listener: (this: ModelContext, ev: ModelContextEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof ModelContextEventMap>(type: K, listener: (this: ModelContext, ev: ModelContextEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
}

interface Document {
    /**
     * The model context for the current document.
     * May be undefined if the browser doesn't support WebMCP.
     */
    readonly modelContext?: WebMCP.ModelContext;
}
