import React, { useEffect, useState } from 'react';
import { Card, Button, Input, message, List, Typography, Space } from 'antd';
import { nostrService } from '@/services/nostr';
import { usePrivy } from '@privy-io/react-auth';

const { Title, Text } = Typography;
const { TextArea } = Input;

const HomePage: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [subspaceId, setSubspaceId] = useState('');
  const [content, setContent] = useState('');
  const [events, setEvents] = useState<any[]>([]);

  const { login, logout, user, ready, authenticated } = usePrivy();

  useEffect(() => {
    const initializeServices = async () => {
      try {
        if (authenticated && user) {
          setConnected(true);
          // 获取用户的公钥
          const walletAddress = user.wallet?.address;
          if (walletAddress) {
            setPublicKey(`mpc_${walletAddress}`);
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

  const handleCreateSubspace = async () => {
    if (!publicKey) {
      message.error('Please login first');
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
      message.success('Subspace created successfully');
      console.log('Created subspace:', result);
    } catch (error) {
      message.error('Failed to create subspace');
    }
  };

  const handleJoinSubspace = async () => {
    if (!publicKey) {
      message.error('Please login first');
      return;
    }
    if (!subspaceId) {
      message.error('Please enter a subspace ID');
      return;
    }
    try {
      const result = await nostrService.joinSubspace(subspaceId);
      message.success('Joined subspace successfully');
      console.log('Joined subspace:', result);
    } catch (error) {
      message.error('Failed to join subspace');
    }
  };

  const handlePublishContent = async () => {
    if (!publicKey) {
      message.error('Please login first');
      return;
    }
    if (!subspaceId || !content) {
      message.error('Please enter both subspace ID and content');
      return;
    }
    try {
      const result = await nostrService.publishContent({
        subspaceID: subspaceId,
        operation: 'post',
        contentType: 'text',
        content: content
      });
      message.success('Content published successfully');
      console.log('Published content:', result);
      setContent('');
    } catch (error) {
      message.error('Failed to publish content');
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
              <Text>Public Key: {publicKey}</Text>
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

        {/* Subspace Management */}
        <Card title="Subspace Management">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" onClick={handleCreateSubspace}>
              Create New Subspace
            </Button>
            <Space>
              <Input
                placeholder="Enter Subspace ID"
                value={subspaceId}
                onChange={(e) => setSubspaceId(e.target.value)}
                style={{ width: 300 }}
              />
              <Button type="primary" onClick={handleJoinSubspace}>
                Join Subspace
              </Button>
            </Space>
          </Space>
        </Card>

        {/* Content Publishing */}
        <Card title="Content Publishing">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="Enter Subspace ID"
              value={subspaceId}
              onChange={(e) => setSubspaceId(e.target.value)}
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
