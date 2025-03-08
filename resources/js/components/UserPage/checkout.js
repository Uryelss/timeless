import React from 'react';
import { Form, Input, Button, Card, Row, Col, Radio, Typography } from 'antd';
import { CreditCardOutlined, WalletOutlined } from '@ant-design/icons';
import HeaderComponent from '../UserLayout/Headercomponent';
import FooterComponent from '../UserLayout/Footercomponent';

const { Title, Text } = Typography;

const Checkout = () => {
  const onFinish = (values) => {
    console.log('Received values of form: ', values);
  };

  return (
    <div>
      <HeaderComponent />
      <Card title="CHECKOUT" style={{ width: '80%', margin: '20px auto' }}>
        <Form onFinish={onFinish} layout="vertical">
          {/* Address Details */}
          <Title level={4}>ADDRESS DETAILS</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Street Address" name="streetAddress" rules={[{ required: true }]}>
                <Input placeholder="FAR FAR AWAY BLK 2 LT2" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Barangay" name="barangay" rules={[{ required: true }]}>
                <Input placeholder="STROSE" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Province" name="province" rules={[{ required: true }]}>
                <Input placeholder="AGUSAN DEL NORTE" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="City" name="city" rules={[{ required: true }]}>
                <Input placeholder="BUTUAN CITY" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Postal Code" name="postalCode" rules={[{ required: true }]}>
                <Input placeholder="8600" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone Number" name="phoneNumber" rules={[{ required: true }]}>
                <Input placeholder="092026345" />
              </Form.Item>
            </Col>
          </Row>

          {/* Product Details */}
          <Card title="PRODUCT" style={{ marginTop: '20px' }}>
            <Text strong>MICHAEL KORS EVEREST - CHRONOGRAPH TWO 42mm</Text>
            <br />
            <Text>Quantity: 2</Text>
            <br />
            <Text>Total: P40,000</Text>
          </Card>

          {/* Payment Method */}
          <Form.Item label="PAYMENT METHOD" name="paymentMethod" rules={[{ required: true }]} style={{ marginTop: '20px' }}>
            <Radio.Group>
              <Radio value="cashOnDelivery">
                <Text strong>Cash on Delivery</Text>
              </Radio>
              <Radio value="creditCard">
                <CreditCardOutlined style={{ marginRight: '8px' }} />
                <Text strong>Credit Card</Text>
              </Radio>
              <Radio value="visa">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style={{ width: '24px', marginRight: '8px' }} />
                <Text strong>VISA</Text>
              </Radio>
              <Radio value="digitalWallet">
                <WalletOutlined style={{ marginRight: '8px' }} />
                <Text strong>Digital Wallet</Text>
              </Radio>
            </Radio.Group>
          </Form.Item>

          {/* Shipping Method */}
          <Form.Item label="SHIPPING METHOD" name="shippingMethod" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="standardShipping">
                <Text strong>Standard Shipping (Estimated 5-7 Days)</Text>
              </Radio>
              <Radio value="expeditedShipping">
                <Text strong>Expedited Shipping (Estimated 3-5 Days)</Text>
              </Radio>
            </Radio.Group>
          </Form.Item>

          {/* Order Summary */}
          <Card title="ORDER SUMMARY" style={{ marginTop: '20px' }}>
            <Text>Subtotal: P40,000</Text>
            <br />
            <Text>Shipping: P75.00</Text>
            <br />
            <Text strong>Total: P40,075.00</Text>
          </Card>

          {/* Complete Order Button */}
          <Form.Item style={{ marginTop: '20px' }}>
            <Button type="primary" htmlType="submit" block>
              Complete Order
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <FooterComponent />
    </div>
  );
};

export default Checkout;