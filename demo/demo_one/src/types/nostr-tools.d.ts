declare module '@ai-chen2050/nostr-tools/pure' {
    export function finalizeEvent(event: any, secretKey: string): any;
    export function generateSecretKey(): string;
    export function getPublicKey(secretKey: string): string;
    export function serializeEvent(event: any): string;
}

declare module '@ai-chen2050/nostr-tools/relay' {
    export class Relay {
        static connect(url: string): Promise<Relay>;
        url: string;
        publish(event: any): Promise<void>;
        subscribe(filters: any[], options: { onevent: (event: any) => void }): void;
        close(): void;
    }
    export function useWebSocketImplementation(WebSocket: any): void;
}

declare module '@ai-chen2050/nostr-tools/cip/subspace' {
    export function NewSubspaceCreateEvent(
        name: string,
        ops: string,
        rules: string,
        description: string,
        imageURL: string
    ): any;
    export function ValidateSubspaceCreateEvent(event: any): void;
    export function NewSubspaceJoinEvent(subspaceID: string): any;
    export function ValidateSubspaceJoinEvent(event: any): void;
    export function toNostrEvent(event: any): any;
}

declare module '@ai-chen2050/nostr-tools/cip/constants' {
    export const KindSubspaceCreate: number;
}

declare module '@ai-chen2050/nostr-tools/cip/cip01/governance' {
    export function newPostEvent(subspaceID: string, operation: string): Promise<any>;
    export function newVoteEvent(subspaceID: string, operation: string): Promise<any>;
    export function toNostrEvent(event: any): any;
} 