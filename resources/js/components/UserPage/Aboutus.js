import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import HeaderComponent from '../UserLayout/Headercomponent'; // Import HeaderComponent
import FooterComponent from '../UserLayout/Footercomponent'; // Import FooterComponent

const { Title, Paragraph } = Typography;

const Aboutus = () => {
  return (
    <div>
      <HeaderComponent /> {/* Add HeaderComponent at the top */}
      <div style={{ padding: '20px' }}>
        <Card>
          <Row gutter={16} align="middle">
            <Col span={12}>
              <img
                src="/images/time.png" // Replace with your image URL
                alt="About Us"
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </Col>
            <Col span={12}>
              <Title level={2}>Welcome to TIMELESS</Title>
              <Paragraph>
                Welcome to TIMELESS, where passion for timepieces meets the spirit of innovation. We are a group of enthusiastic students from IT32, united by a common love for watches and a vision to bring quality and style to watch enthusiasts everywhere.
              </Paragraph>
              <Paragraph>
                As students, we understand the importance of quality at an affordable price, and that’s why we’ve curated a collection that balances both. We are committed to ensuring every watch we offer is crafted with care and precision, so you can find the perfect timepiece that fits your unique style.
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </div>
      <FooterComponent /> {/* Add FooterComponent at the bottom */}
    </div>
  );
};

export default Aboutus;