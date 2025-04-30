import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Select, Tooltip, Typography } from 'antd';
import { UploadOutlined, CaretDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { nostrService } from '@/services/nostr';
import { usePrivy } from '@privy-io/react-auth';
import { Relay } from '@ai-chen2050/nostr-tools';
import { toNostrEvent } from '../../../node_modules/@ai-chen2050/nostr-tools/lib/esm/cip/subspace.js';
import { serializeEvent } from '../../../node_modules/@ai-chen2050/nostr-tools/lib/esm/pure.js';
const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface Template {
  name: string;
  description: string;
  ops: string;
  rules: string;
}

interface Templates {
  [key: string]: Template;
}

// Predefined templates
const templates: Templates = {
  ModelDAO: {
    name: 'ModelDAO',
    description: 'Standard ModelDAO template with predefined permission levels',
    ops: 'post=1,propose=2,vote=3,invite=4',
    rules: 'Standard DAO rules'
  }
};

const CreateSubspace = () => {
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { signMessage, user } = usePrivy();
  const [mpcPublicKey, setMpcPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const connectRelay = async () => {
      try {
        const relayURL = 'ws://161.97.129.166:10547';
        console.log('Connecting to relay...');
        const relay = await Relay.connect(relayURL);
        console.log(`Connected to ${relay.url}`);


        // 将relay实例保存到nostrService
        console.log('Setting relay in nostrService...');
        nostrService.setRelay(relay);
        console.log('Relay set successfully');
      } catch (error) {
        console.error('Failed to connect to relay:', error);
        message.error('连接relay失败');
      }
    };
    console.log('user',user)
    connectRelay();

    // 清理函数
    return () => {
      console.log('Disconnecting relay...');
      nostrService.disconnect();
      console.log('Relay disconnected');
    };
  }, []);

  useEffect(() => {
    if (user) {
      const embeddedWallet = user.linkedAccounts.findLast(account => account.type === 'wallet');
      if (embeddedWallet) {
        setMpcPublicKey(embeddedWallet.address);
        console.log('MPC Wallet Address:', embeddedWallet.address);
      }
    }
  }, [user]);

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    if (value && templates[value]) {
      const template = templates[value];
      form.setFieldsValue({
        name: template.name,
        description: template.description,
        ops: template.ops,
        rules: template.rules
      });
    }
  };

  const onFinish = async (values: any) => {
    try {
      if (!mpcPublicKey) {
        throw new Error('请先连接钱包');
      }

      setIsCreating(true);
      
      // 1. 创建子空间事件
      console.log('1. Creating subspace with values:', values);
      const subspaceEvent = await nostrService.createSubspace({
        name: values.name,
        ops: values.ops,
        rules: values.rules,
        description: values.description,
        imageURL: 'https://example.com/image.jpg'
      });
      console.log('2. Subspace event created:', JSON.stringify(subspaceEvent, null, 2));

      const nostrEvent = toNostrEvent(subspaceEvent);
      console.log('3. Converted to Nostr event:', JSON.stringify(nostrEvent, null, 2));

      // 2. 请求用户签名
      nostrEvent.pubkey = mpcPublicKey.slice(2);
      console.log('4. address:', nostrEvent.pubkey);
      const messageToSign = serializeEvent(nostrEvent);
      console.log('4. Message to sign:', messageToSign);
      
      const signature = (await signMessage(messageToSign));
      const recoveredAddress = nostrService.recoverAddress(messageToSign, signature);
      console.log('5. recoveredAddress:', recoveredAddress);
      console.log('5. Signature received:', signature);
      
      if (!signature) {
        throw new Error('签名失败');
      }

      // 3. 发布子空间
      console.log('6. Publishing subspace with:', {
        subspaceEvent: JSON.stringify(subspaceEvent, null, 2),
        address: mpcPublicKey,
        signature
      });
      
      await nostrService.PublishCreateSubspace(subspaceEvent, mpcPublicKey, signature);
      
      message.success('子空间创建成功!');
      history.push('/vote');
    } catch (error) {
      console.error('Error in onFinish:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        cause: error instanceof Error ? error.cause : undefined
      });
      const errorMessage = error instanceof Error ? error.message : '创建子空间失败';
      message.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6">
      <Card title="Create New Subspace" className="max-w-2xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label={
              <span>
                Template 
                <Tooltip title="Choose a predefined template to quickly create a subspace">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            name="template"
          >
            <Select
              placeholder="Select a template"
              onChange={handleTemplateChange}
              suffixIcon={<CaretDownOutlined />}
              style={{ width: '100%' }}
            >
              <Option value="ModelDAO">
                <div className="flex justify-between items-center">
                  <span>ModelDAO</span>
                  <Text type="secondary" className="text-sm">
                    Standard DAO Template
                  </Text>
                </div>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Subspace Name"
            name="name"
            rules={[{ required: true, message: 'Please input the subspace name!' }]}
          >
            <Input placeholder="Enter subspace name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <TextArea
              placeholder="Enter subspace description"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Operations 
                <Tooltip title="Define permission levels in format: key=value,key=value">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            name="ops"
            rules={[{ required: true, message: 'Please input the operations!' }]}
          >
            <Input placeholder="e.g. post=1,propose=2,vote=3,invite=4" />
          </Form.Item>

          <Form.Item
            label="Rules"
            name="rules"
            rules={[{ required: true, message: 'Please input the rules!' }]}
          >
            <TextArea
              placeholder="Enter rules"
              rows={4}
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-4">
              <Button onClick={() => history.push('/vote')}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={isCreating}
              >
                Create Subspace
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateSubspace; 