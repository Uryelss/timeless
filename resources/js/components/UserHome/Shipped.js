import React, { useState } from 'react';
import { Card, Timeline, Descriptions, Button, Modal, Checkbox, List } from 'antd';
import Header from '../Usercomponent/Header'; // Import HeaderComponent
import Footer from '../Usercomponent/Footer'; // Import FooterComponent

const Shipped = () => {
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isTrackModalVisible, setIsTrackModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const showCancelModal = () => {
    setIsCancelModalVisible(true);
  };

  const showTrackModal = () => {
    setIsTrackModalVisible(true);
  };

  const handleCancelOk = () => {
    console.log('Cancellation Reason:', cancellationReason);
    setIsCancelModalVisible(false);
    // Add your cancellation logic here
  };

  const handleCancelCancel = () => {
    setIsCancelModalVisible(false);
  };

  const handleTrackCancel = () => {
    setIsTrackModalVisible(false);
  };

  const onChange = (e) => {
    setCancellationReason(e.target.value);
  };

  const trackingDetails = [
    {
      time: '12:20:56',
      location: 'Butuen Hub',
      status: 'Your Parcel has been Delivered',
    },
    {
      time: '12:20:56',
      location: 'Paramaque DC',
      status: 'Your Parcel has been picked up',
    },
    {
      time: '12:20:56',
      location: 'Paramaque DC',
      status: 'Your Parcel has been picked up',
    },
    {
      time: '12:20:56',
      location: 'Paramaque DC',
      status: 'Your Parcel has been picked up',
    },
    {
      time: '11:20:56',
      location: 'Butuen DC',
      status: 'Your Parcel has been picked up',
    },
  ];

  return (
    <div>
      <Header /> {/* Add HeaderComponent at the top */}
      <div style={{ padding: '20px' }}>
        <Card title="Order Status" style={{ marginBottom: '20px' }}>
          <Timeline mode="alternate">
            <Timeline.Item color="green">Ordered - Feb 25</Timeline.Item>
            <Timeline.Item color="green">Shipped - Feb 26</Timeline.Item>
            <Timeline.Item color="blue">Delivered - Estimated Feb 30 - Mar 3</Timeline.Item>
          </Timeline>
        </Card>

        <Card title="Order Details" style={{ marginBottom: '20px' }}>
          <Descriptions bordered>
            <Descriptions.Item label="Order ID">123456789</Descriptions.Item>
            <Descriptions.Item label="Estimated Delivery">Feb 30 - Mar 3</Descriptions.Item>
            <Descriptions.Item label="Delivered To">Shrek</Descriptions.Item>
            <Descriptions.Item label="Contact Number">09123456789</Descriptions.Item>
            <Descriptions.Item label="Address">Far Far Away, Butuan City, Agusan Del Norte</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Actions" style={{ marginBottom: '20px' }}>
          <Button type="primary" style={{ marginRight: '10px' }} onClick={showTrackModal}>
            Track Order
          </Button>
          <Button type="danger" onClick={showCancelModal}>Cancel Order</Button>
        </Card>
      </div>
      <Footer /> {/* Add FooterComponent at the bottom */}

      <Modal
        title="CANCEL ORDER"
        visible={isCancelModalVisible}
        onOk={handleCancelOk}
        onCancel={handleCancelCancel}
        okText="Confirm"
        cancelText="Close"
      >
        <p><strong>SELECT CANCELLATION ORDER</strong></p>
        <p>Please select a cancellation reason. Please take note that this will cancel all items in the order and the action cannot be undone.</p>
        <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
          <Checkbox value="Need to change delivery address">Need to change delivery address</Checkbox>
          <br />
          <Checkbox value="Need to modify order (size, quantity, etc)">Need to modify order (size, quantity, etc)</Checkbox>
          <br />
          <Checkbox value="Payment process too troublesome">Payment process too troublesome</Checkbox>
          <br />
          <Checkbox value="Don't want to buy anymore">Don't want to buy anymore</Checkbox>
          <br />
          <Checkbox value="Others">Others</Checkbox>
        </Checkbox.Group>
      </Modal>

      <Modal
        title="TRACKING DETAILS"
        visible={isTrackModalVisible}
        onCancel={handleTrackCancel}
        footer={null}
      >
        <List
          dataSource={trackingDetails}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={`${item.time} [${item.location}]`}
                description={item.status}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default Shipped;