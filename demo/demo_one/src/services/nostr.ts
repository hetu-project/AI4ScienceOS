import { finalizeEvent, generateSecretKey, getPublicKey, serializeEvent,finalizeEventBySig } from '../../node_modules/@ai-chen2050/nostr-tools/lib/esm/pure.js';
import { Relay, useWebSocketImplementation } from '../../node_modules/@ai-chen2050/nostr-tools/lib/esm/relay.js';
import {
  NewSubspaceCreateEvent,
  ValidateSubspaceCreateEvent,
  NewSubspaceJoinEvent,
  ValidateSubspaceJoinEvent,
  toNostrEvent,
} from '../../node_modules/@ai-chen2050/nostr-tools/lib/esm/cip/subspace.js'
import {KindSubspaceCreate} from '../../node_modules/@ai-chen2050/nostr-tools/lib/esm/cip/constants.js'
import {newPostEvent, newVoteEvent, toNostrEvent as toNostrEventGov} from '../../node_modules/@ai-chen2050/nostr-tools/lib/esm/cip/cip01/governance.js'
import { ethers } from 'ethers';

interface NostrEvent {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    content: string;
    tags: string[][];
    sig: string;
}

// 首先定义一个 SubspaceEvent 接口
interface SubspaceEvent {
    subspaceID: string;
    name: string;
    ops: string;
    rules: string;
    description: string;
    imageURL: string;
    // 其他可能的字段
}

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

    // 设置relay实例
    setRelay(relay: Relay) {
        this.relay = relay;
    }

    // 断开连接
    disconnect() {
        if (this.relay) {
            this.relay.close();
            this.relay = null;
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

    // 设置密钥对
    setKeys(secretKey: string, publicKey: string) {
        this.secretKey = secretKey;
        this.publicKey = publicKey;
    }

    // 创建新的子空间
    async createSubspace(params: {
        name: string;
        ops: string;
        rules: string;
        description: string;
        imageURL: string;
    }): Promise<SubspaceEvent> {
        const subspaceEvent = NewSubspaceCreateEvent(
            params.name,
            params.ops,
            params.rules,
            params.description,
            params.imageURL
        );
        ValidateSubspaceCreateEvent(subspaceEvent);
        console.log('subspaceEvent', subspaceEvent);
        return subspaceEvent;
    }

    // 修改参数类型
    async PublishCreateSubspace(subspaceEvent: SubspaceEvent, address: string, sig: string): Promise<NostrEvent> {
        console.log('sig', sig);
        console.log('address', address);
        const nostrEvent = toNostrEvent(subspaceEvent);
        const signedSubspaceEvent = finalizeEventBySig(nostrEvent, address, sig);
        console.log('signedSubspaceEvent', signedSubspaceEvent);
        const result = await this.relay.publish(signedSubspaceEvent);
        console.log('Successfully published subspace event:', result);
        return signedSubspaceEvent;
    }

    // 加入子空间
    async joinSubspace(subspaceID: string): Promise<NostrEvent> {
        if (!this.relay) {
            throw new Error('Not connected to relay');
        }
        if (!this.secretKey) {
            throw new Error('No secret key available');
        }

        const joinEvent = NewSubspaceJoinEvent(subspaceID);
        ValidateSubspaceJoinEvent(joinEvent);

        const signedJoinEvent = finalizeEvent(toNostrEvent(joinEvent), this.secretKey);
        await this.relay.publish(signedJoinEvent);
        return signedJoinEvent;
    }

    // 在子空间中发布帖子
    async publishPost(params: {
        subspaceID: string;
        contentType: string;
        parent?: string;
    }): Promise<NostrEvent> {
        if (!this.relay) {
            throw new Error('Not connected to relay');
        }
        if (!this.secretKey) {
            throw new Error('No secret key available');
        }

        const postEvent = await newPostEvent(params.subspaceID, "post");
        if (!postEvent) {
            throw new Error('Failed to create post event');
        }

        postEvent.setContentType(params.contentType);
        if (params.parent) {
            postEvent.setParent(params.parent);
        }

        const signedPostEvent = finalizeEvent(toNostrEventGov(postEvent), this.secretKey);
        await this.relay.publish(signedPostEvent);
        return signedPostEvent;
    }

    // 在子空间中投票
    async publishVote(params: {
        subspaceID: string;
        targetId: string;
        vote: string;
    }): Promise<NostrEvent> {
        if (!this.relay) {
            throw new Error('Not connected to relay');
        }
        if (!this.secretKey) {
            throw new Error('No secret key available');
        }

        const voteEvent = await newVoteEvent(params.subspaceID, "vote");
        if (!voteEvent) {
            throw new Error('Failed to create vote event');
        }

        voteEvent.setVote(params.targetId, params.vote);

        const signedVoteEvent = finalizeEvent(toNostrEventGov(voteEvent), this.secretKey);
        await this.relay.publish(signedVoteEvent);
        return signedVoteEvent;
    }

    // 订阅子空间事件
    subscribeToSubspace(subspaceID: string, callback: (event: NostrEvent) => void): void {
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
                onevent(event: NostrEvent) {
                    callback(event);
                },
            }
        );
    }
    recoverAddress(signedMessage: string, signature: string) {
        const recoveredAddress = ethers.utils.verifyMessage(signedMessage, signature);
        console.log("恢复的地址：", recoveredAddress);
        return recoveredAddress;
    }
}
// 创建单例实例
export const nostrService = new NostrService(); 
console.log('typeof window', typeof window)
console.log(window)