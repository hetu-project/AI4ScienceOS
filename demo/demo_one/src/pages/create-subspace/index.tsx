import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, message, Select, Tooltip, Typography } from 'antd';
import { UploadOutlined, CaretDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface Template {
  name: string;
  description: string;
  rules: {
    post: number;
    proposal: number;
    vote: number;
    invite: number;
  };
}

interface Templates {
  [key: string]: Template;
}

// Predefined templates
const templates: Templates = {
  ModelDAO: {
    name: 'ModelDAO',
    description: 'Standard ModelDAO template with predefined permission levels',
    rules: {
      post: 1,      // Permission level for posting
      proposal: 2,  // Permission level for creating proposals
      vote: 3,      // Permission level for voting
      invite: 4     // Permission level for inviting members
    }
  }
};

const CreateSubspace = () => {
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    if (value && templates[value]) {
      const template = templates[value];
      form.setFieldsValue({
        name: template.name,
        description: template.description,
        rules: JSON.stringify(template.rules, null, 2)
      });
    }
  };

  const onFinish = (values: any) => {
    console.log('Form values:', values);
    // TODO: Handle form submission
    message.success('Subspace created successfully!');
    history.push('/vote');
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
                Rules 
                <Tooltip title="Define permission levels for the subspace">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            name="rules"
            rules={[{ required: true, message: 'Please input the rules!' }]}
          >
            <TextArea
              placeholder="Enter rules in JSON format"
              rows={6}
              className="font-mono"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-4">
              <Button onClick={() => history.push('/vote')}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
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