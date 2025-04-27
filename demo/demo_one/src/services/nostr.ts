import { finalizeEvent, generateSecretKey, getPublicKey } from '@ai-chen2050/nostr-tools/pure';
import { Relay, useWebSocketImplementation } from '@ai-chen2050/nostr-tools/relay';
import {
    NewSubspaceCreateEvent,
    ValidateSubspaceCreateEvent,
    NewSubspaceJoinEvent,
    ValidateSubspaceJoinEvent,
    NewSubspaceOpEvent,
    SetContentType,
    toNostrEvent,
    KindSubspaceCreate,
    ValidateSubspaceOpEvent,
} from '@ai-chen2050/nostr-tools/subspace';

export class NostrService {
    private relay: Relay | null = null;
    private secretKey: string | null = null;
    private publicKey: string | null = null;

    constructor(private relayURL: string = 'ws://161.97.129.166:10547') {
        // 初始化WebSocket实现
        if (typeof window !== 'undefined') {
            const WebSocket = window.WebSocket;
            useWebSocketImplementation(WebSocket);
        }
    }
    // 连接到中继服务器
    async connect(): Promise<void> {
        try {
            this.relay = await Relay.connect(this.relayURL);
            console.log(`Connected to ${this.relay.url}`);
        } catch (error) {
            console.error('Failed to connect to relay:', error);
            throw error;
        }
    }

    // 生成新的密钥对
    generateKeys(): { secretKey: string; publicKey: string } {
        this.secretKey = generateSecretKey();
        this.publicKey = getPublicKey(this.secretKey);
        return {
            secretKey: this.secretKey,
            publicKey: this.publicKey,
        };
    }

    // 获取当前密钥对
    getKeys(): { secretKey: string | null; publicKey: string | null } {
        return {
            secretKey: this.secretKey,
            publicKey: this.publicKey,
        };
    }

    // 创建新的子空间
    async createSubspace(params: {
        name: string;
        ops: string;
        rules: string;
        description: string;
        imageURL: string;
    }): Promise<any> {
        if (!this.relay) {
            throw new Error('Not connected to relay');
        }

        const subspaceEvent = NewSubspaceCreateEvent(
            params.name,
            params.ops,
            params.rules,
            params.description,
            params.imageURL
        );
        ValidateSubspaceCreateEvent(subspaceEvent);

        const signedSubspaceEvent = finalizeEvent(toNostrEvent(subspaceEvent), this.secretKey!);
        await this.relay.publish(signedSubspaceEvent);
        return signedSubspaceEvent;
    }

    // 加入子空间
    async joinSubspace(subspaceID: string): Promise<any> {
        if (!this.relay) {
            throw new Error('Not connected to relay');
        }

        const joinEvent = NewSubspaceJoinEvent(subspaceID);
        ValidateSubspaceJoinEvent(joinEvent);

        const signedJoinEvent = finalizeEvent(toNostrEvent(joinEvent), this.secretKey!);
        await this.relay.publish(signedJoinEvent);
        return signedJoinEvent;
    }

    // 在子空间中发布内容
    async publishContent(params: {
        subspaceID: string;
        operation: string;
        contentType: string;
        content: string;
    }): Promise<any> {
        if (!this.relay) {
            throw new Error('Not connected to relay');
        }

        const opEvent = NewSubspaceOpEvent(params.subspaceID, params.operation);
        SetContentType(opEvent, params.contentType);
        opEvent.content = params.content;
        ValidateSubspaceOpEvent(opEvent);

        const signedOpEvent = finalizeEvent(toNostrEvent(opEvent), this.secretKey!);
        await this.relay.publish(signedOpEvent);
        return signedOpEvent;
    }

    // 订阅子空间事件
    subscribeToSubspace(subspaceID: string, callback: (event: any) => void): void {
        if (!this.relay) {
            throw new Error('Not connected to relay');
        }

        this.relay.subscribe(
            [
                {
                    kinds: [KindSubspaceCreate],
                    limit: 1,
                },
            ],
            {
                onevent(event) {
                    callback(event);
                },
            }
        );
    }

    // 关闭连接
    close(): void {
        if (this.relay) {
            this.relay.close();
            this.relay = null;
        }
    }
}
// 创建单例实例
export const nostrService = new NostrService(); 
console.log('typeof window', typeof window)
console.log(window)