import React, { useEffect, useState } from 'react';
import { Card, Button, Input, message, List, Typography, Space } from 'antd';
import { nostrService } from '@/services/nostr';
import { usePrivy } from '@privy-io/react-auth';

const { Title, Text } = Typography;
const { TextArea } = Input;

const HomePage: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [createSubspaceId, setCreateSubspaceId] = useState('');
  const [joinSubspaceId, setJoinSubspaceId] = useState('');
  const [publishSubspaceId, setPublishSubspaceId] = useState('');
  const [content, setContent] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { login, logout, user, ready, authenticated, createWallet, signMessage } = usePrivy();

  useEffect(() => {
    const initializeServices = async () => {
      try {
        if (authenticated && user) {
          setConnected(true);
          // 获取MPC钱包
          const embeddedWallet = user.linkedAccounts.find(account => account.type === 'wallet');
          if (embeddedWallet) {
            // 使用MPC钱包地址作为Nostr身份
            setPublicKey(embeddedWallet.address);
            console.log('MPC Wallet Address (Nostr Identity):', embeddedWallet.address);
          }
        }

        // 连接到Nostr中继
        await nostrService.connect();
        message.success('Connected to Nostr relay');
      } catch (error) {
        console.error('Initialization failed:', error);
        message.error('Failed to initialize services');
      }
    };

    if (ready) {
      initializeServices();
    }
  }, [ready, authenticated, user]);

  const handleLogin = async () => {
    try {
      await login();
      // 创建MPC钱包
      const wallet = await createWallet();
      if (wallet) {
        setPublicKey(wallet.address);
        console.log('New MPC Wallet Address (Nostr Identity):', wallet.address);
      }
    } catch (error) {
      message.error('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setPublicKey(null);
      setConnected(false);
      message.success('Logged out successfully');
    } catch (error) {
      message.error('Logout failed');
    }
  };

  const handleTestSignature = async () => {
    try {
      if (!user) {
        message.error('Please login first');
        return;
      }

      // 获取当前时间作为消息
      const messageText = `Test signature at ${new Date().toISOString()}`;
      
      // 请求签名
      const result = await signMessage(messageText);
      setSignature(result);
      
      console.log('Message:', messageText);
      console.log('Signature:', result);
      
      message.success('Signature successful');
    } catch (error) {
      console.error('Signature failed:', error);
      message.error('Signature failed');
    }
  };

  const handleCreateSubspace = async () => {
    if (!publicKey) {
      setError('请先生成Nostr密钥对');
      message.error('请先生成Nostr密钥对');
      return;
    }
    if (!createSubspaceId) {
      setError('请输入子空间ID');
      message.error('请输入子空间ID');
      return;
    }
    try {
      const result = await nostrService.createSubspace({
        name: 'Test Subspace',
        ops: 'test',
        rules: 'test',
        description: 'A test subspace',
        imageURL: 'https://example.com/image.jpg'
      });
      message.success('子空间创建成功');
      console.log('Created subspace:', result);
      setCreateSubspaceId('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建子空间失败';
      setError(errorMessage);
      message.error(errorMessage);
    }
  };

  const handleJoinSubspace = async () => {
    if (!publicKey) {
      setError('请先生成Nostr密钥对');
      message.error('请先生成Nostr密钥对');
      return;
    }
    if (!joinSubspaceId) {
      setError('请输入要加入的子空间ID');
      message.error('请输入要加入的子空间ID');
      return;
    }
    try {
      const result = await nostrService.joinSubspace(joinSubspaceId);
      message.success('成功加入子空间');
      console.log('Joined subspace:', result);
      setJoinSubspaceId('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加入子空间失败';
      setError(errorMessage);
      message.error(errorMessage);
    }
  };

  const handlePublishContent = async () => {
    if (!publicKey) {
      setError('请先生成Nostr密钥对');
      message.error('请先生成Nostr密钥对');
      return;
    }
    if (!publishSubspaceId) {
      setError('请输入要发布内容的子空间ID');
      message.error('请输入要发布内容的子空间ID');
      return;
    }
    if (!content) {
      setError('请输入要发布的内容');
      message.error('请输入要发布的内容');
      return;
    }
    try {
      const result = await nostrService.publishContent({
        subspaceID: publishSubspaceId,
        operation: 'post',
        contentType: 'text',
        content: content
      });
      message.success('内容发布成功');
      console.log('Published content:', result);
      setContent('');
      setPublishSubspaceId('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发布内容失败';
      setError(errorMessage);
      message.error(errorMessage);
    }
  };

  // 生成Nostr密钥对
  const handleGenerateKeys = () => {
    try {
      const { secretKey, publicKey } = nostrService.generateKeys();
      setSecretKey(secretKey);
      setPublicKey(publicKey);
      message.success('成功生成Nostr密钥对');
    } catch (error) {
      console.error('生成密钥对失败:', error);
      message.error('生成密钥对失败');
    }
  };

  return (
    <div className="p-6">
      <Title level={2}>Nostr Service</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Connection Status */}
        <Card title="Connection Status">
          <Space direction="vertical">
            <Text>Status: {connected ? 'Connected' : 'Disconnected'}</Text>
            {publicKey && (
              <>
                <Text>Nostr Public Key: {publicKey}</Text>
                <Text type="secondary">Your Nostr public key is used for all operations.</Text>
              </>
            )}
            {connected ? (
              <Button type="primary" danger onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Button type="primary" onClick={handleLogin}>
                Login with MPC Wallet
              </Button>
            )}
          </Space>
        </Card>

        {/* Generate Nostr Keys */}
        <Card title="Nostr Keys">
          <Space direction="vertical">
            <Button type="primary" onClick={handleGenerateKeys}>
              Generate Nostr Keys
            </Button>
            {publicKey && (
              <>
                <Text>Public Key:</Text>
                <Text code>{publicKey}</Text>
              </>
            )}
            {secretKey && (
              <>
                <Text>Secret Key:</Text>
                <Text code>{secretKey}</Text>
              </>
            )}
          </Space>
        </Card>

        {/* Create Subspace */}
        <Card title="Create Subspace">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="Enter Subspace ID to create"
              value={createSubspaceId}
              onChange={(e) => setCreateSubspaceId(e.target.value)}
              style={{ width: 300 }}
            />
            <Button type="primary" onClick={handleCreateSubspace}>
              Create Subspace
            </Button>
          </Space>
        </Card>

        {/* Join Subspace */}
        <Card title="Join Subspace">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="Enter Subspace ID to join"
              value={joinSubspaceId}
              onChange={(e) => setJoinSubspaceId(e.target.value)}
              style={{ width: 300 }}
            />
            <Button type="primary" onClick={handleJoinSubspace}>
              Join Subspace
            </Button>
          </Space>
        </Card>

        {/* Content Publishing */}
        <Card title="Content Publishing">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="Enter Subspace ID to publish"
              value={publishSubspaceId}
              onChange={(e) => setPublishSubspaceId(e.target.value)}
              style={{ width: 300 }}
            />
            <TextArea
              placeholder="Enter content to publish"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <Button type="primary" onClick={handlePublishContent}>
              Publish Content
            </Button>
          </Space>
        </Card>

        {/* Error Display */}
        {error && (
          <Card title="Error" style={{ borderColor: 'red' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {/* Recent Events */}
        <Card title="Recent Events">
          <List
            dataSource={events}
            renderItem={(event) => (
              <List.Item>
                <Text>{JSON.stringify(event)}</Text>
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </div>
  );
};

export default HomePage;
