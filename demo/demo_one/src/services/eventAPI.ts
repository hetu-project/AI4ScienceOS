interface Event {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    content: string;
    tags: string[][];
    sig: string;
}

export class EventAPIService {
    private static instance: EventAPIService;
    private baseURL: string = 'http://18.143.76.146:8080';
    private maxRetries: number = 3;
    private retryDelay: number = 1000; // 1秒

    private constructor() {
        console.log('EventAPIService initialized with baseURL:', this.baseURL);
    }

    public static getInstance(): EventAPIService {
        if (!EventAPIService.instance) {
            EventAPIService.instance = new EventAPIService();
        }
        return EventAPIService.instance;
    }

    // 延迟函数
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 检查服务器状态
    private async checkServerStatus(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            console.error('Server health check failed:', error);
            return false;
        }
    }

    // 带重试的请求函数
    private async fetchWithRetry(url: string, options: RequestInit, retries: number = this.maxRetries): Promise<Response> {
        try {
            console.log(`Attempting to fetch: ${url}`);
            console.log('Request options:', options);
            
            const response = await fetch(url, {
                ...options,
                mode: 'cors', // 明确指定CORS模式
                headers: {
                    ...options.headers,
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                console.error('Response:', await response.text());
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
        } catch (error) {
            console.error(`Fetch attempt failed:`, error);
            if (retries > 0) {
                console.log(`Retrying... ${retries} attempts left`);
                await this.delay(this.retryDelay);
                return this.fetchWithRetry(url, options, retries - 1);
            }
            throw error;
        }
    }

    // 发布事件
    async publishEvent(event: Event): Promise<any> {
        try {
            // 首先检查服务器状态
            const isServerHealthy = await this.checkServerStatus();
            if (!isServerHealthy) {
                throw new Error('服务器不可用');
            }

            console.log('Publishing event:', event);
            const response = await this.fetchWithRetry(`${this.baseURL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            const data = await response.json();
            console.log('Event published successfully:', data);
            return data;
        } catch (error) {
            console.error('Failed to publish event:', error);
            if (error instanceof Error) {
                throw new Error(`发布事件失败: ${error.message}`);
            }
            throw new Error('发布事件失败: 未知错误');
        }
    }

    // 获取所有事件
    async getAllEvents(): Promise<Event[]> {
        try {
            // 首先检查服务器状态
            const isServerHealthy = await this.checkServerStatus();
            if (!isServerHealthy) {
                throw new Error('服务器不可用');
            }

            console.log('Fetching all events');
            const response = await this.fetchWithRetry(`${this.baseURL}/events/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),  // 空对象表示获取所有事件
            });

            const data = await response.json();
            console.log('Events fetched successfully:', data);
            return data;
        } catch (error) {
            console.error('Failed to fetch events:', error);
            if (error instanceof Error) {
                throw new Error(`获取事件失败: ${error.message}`);
            }
            throw new Error('获取事件失败: 未知错误');
        }
    }

    // 获取特定类型的事件
    async getEventsByKind(kind: number): Promise<Event[]> {
        try {
            // 首先检查服务器状态
            const isServerHealthy = await this.checkServerStatus();
            if (!isServerHealthy) {
                throw new Error('服务器不可用');
            }

            console.log('Fetching events by kind:', kind);
            const response = await this.fetchWithRetry(`${this.baseURL}/events/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ kind }),
            });

            const data = await response.json();
            console.log('Events fetched successfully:', data);
            return data;
        } catch (error) {
            console.error('Failed to fetch events by kind:', error);
            if (error instanceof Error) {
                throw new Error(`获取事件失败: ${error.message}`);
            }
            throw new Error('获取事件失败: 未知错误');
        }
    }

    // 获取特定用户的事件
    async getEventsByPubkey(pubkey: string): Promise<Event[]> {
        try {
            // 首先检查服务器状态
            const isServerHealthy = await this.checkServerStatus();
            if (!isServerHealthy) {
                throw new Error('服务器不可用');
            }

            console.log('Fetching events by pubkey:', pubkey);
            const response = await this.fetchWithRetry(`${this.baseURL}/events/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pubkey }),
            });

            const data = await response.json();
            console.log('Events fetched successfully:', data);
            return data;
        } catch (error) {
            console.error('Failed to fetch events by pubkey:', error);
            if (error instanceof Error) {
                throw new Error(`获取事件失败: ${error.message}`);
            }
            throw new Error('获取事件失败: 未知错误');
        }
    }
}

export const eventAPIService = EventAPIService.getInstance();
