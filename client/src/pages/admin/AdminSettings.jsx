// pages/admin/AdminSettings.jsx
import React, { useState, useEffect } from 'react'
import axiosInstance from "../../services/axiosConfig"
import {
  Card,
  Typography,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Spin,
  Alert,
  Divider,
  Row,
  Col,
  Space
} from 'antd'
import {
  SaveOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  PercentageOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function AdminSettings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get('/admin/settings')
      form.setFieldsValue(response.data)
    } catch (error) {
      console.error('Error fetching settings:', error)
      message.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (values) => {
    setSaving(true)
    try {
      await axiosInstance.put('/admin/settings', values)
      message.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      message.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Title level={2} className="mb-0">System Settings</Title>
        <Text type="secondary">Configure platform-wide settings</Text>
      </div>

      <Card className="shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Title level={4}>General Settings</Title>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="siteName"
                label="Site Name"
                rules={[{ required: true, message: 'Please enter site name' }]}
              >
                <Input size="large" placeholder="HealthApp" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="contactEmail"
                label="Contact Email"
                rules={[
                  { required: true, message: 'Please enter contact email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  size="large"
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="admin@healthapp.com"
                  className="rounded-xl"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="contactPhone"
                label="Contact Phone"
                rules={[{ required: true, message: 'Please enter contact phone' }]}
              >
                <Input
                  size="large"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="+91 98765 43210"
                  className="rounded-xl"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="address"
                label="Address"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Office address"
                  className="rounded-xl"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={4}>Shipping & Tax Settings</Title>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="deliveryCharge"
                label="Delivery Charge (₹)"
                rules={[{ required: true, message: 'Please enter delivery charge' }]}
              >
                <InputNumber
                  size="large"
                  min={0}
                  step={5}
                  prefix={<DollarOutlined className="text-gray-400" />}
                  className="w-full rounded-xl"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="freeDeliveryMin"
                label="Free Delivery Minimum (₹)"
                rules={[{ required: true, message: 'Please enter free delivery minimum' }]}
              >
                <InputNumber
                  size="large"
                  min={0}
                  step={50}
                  prefix={<DollarOutlined className="text-gray-400" />}
                  className="w-full rounded-xl"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="taxRate"
                label="Tax Rate (%)"
                rules={[{ required: true, message: 'Please enter tax rate' }]}
              >
                <InputNumber
                  size="large"
                  min={0}
                  max={50}
                  step={0.5}
                  prefix={<PercentageOutlined className="text-gray-400" />}
                  className="w-full rounded-xl"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                className="rounded-xl"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={fetchSettings}
                className="rounded-xl"
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default AdminSettings