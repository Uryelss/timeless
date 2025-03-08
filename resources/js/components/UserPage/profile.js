import React from 'react';
import { Layout, Menu, Card, Avatar, Button, Descriptions, Upload } from 'antd';
import { UserOutlined, UploadOutlined, ShoppingOutlined, HomeOutlined } from '@ant-design/icons';
import HeaderComponent from '../UserLayout/Headercomponent'; // Import HeaderComponent
import FooterComponent from '../UserLayout/Footercomponent'; // Import FooterComponent

const { Sider, Content } = Layout;
const { Meta } = Card;

const Profile = () => {
  const user = {
    name: 'SHREK',
    email: 'shrek@gmail.com',
    dateOfBirth: 'January 1, 1990',
    address: 'Far Far Away, Butuan City, Agusan Del Norte',
  };

  const uploadProps = {
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76', // Replace with your upload endpoint
    onChange({ file, fileList }) {
      if (file.status !== 'uploading') {
        console.log(file, fileList);
      }
    },
  };

  return (
    <div>
      <HeaderComponent /> {/* Add HeaderComponent at the top */}
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={200} theme="light">
            
          <Menu mode="inline" defaultSelectedKeys={['1']} style={{ borderRight: 0 }}>
            <Menu.Item key="1" icon={<UserOutlined />}>
              My Profile
            </Menu.Item>
            <Menu.Item key="2" icon={<ShoppingOutlined />}>
              My Purchases
            </Menu.Item>
            <Menu.Item key="3" icon={<HomeOutlined />}>
              Addresses
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content style={{ padding: '20px' }}>
            <Card
              style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
              actions={[
                <Button key="edit" type="primary">
                  EDIT
                </Button>,
              ]}
            >
              <Meta
                avatar={<Avatar size={64} icon={<UserOutlined />} />}
                title={user.name}
                description={user.email}
              />
              <div style={{ marginTop: '20px' }}>
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Upload Photo</Button>
                </Upload>
              </div>
              <Descriptions title="Profile Details" bordered style={{ marginTop: '20px' }}>
                <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                <Descriptions.Item label="Date of Birth">{user.dateOfBirth}</Descriptions.Item>
                <Descriptions.Item label="Address">{user.address}</Descriptions.Item>
              </Descriptions>
              <Card title="My Purchase" style={{ marginTop: '20px' }}>
                <p>Purchase history will be displayed here.</p>
              </Card>
              <Card title="Addresses" style={{ marginTop: '20px' }}>
                <p>Saved addresses will be displayed here.</p>
              </Card>
            </Card>
          </Content>
        </Layout>
      </Layout>
      <FooterComponent /> {/* Add FooterComponent at the bottom */}
    </div>
  );
};

export default Profile;