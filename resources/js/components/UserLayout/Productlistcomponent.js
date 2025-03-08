import React from "react";
import { Row, Col, Card, Typography, Button, Space } from "antd";
import { Link } from "react-router-dom";

const { Text } = Typography;

const ProductListComponent = ({ filteredProducts }) => {
  return (
    <Row gutter={[16, 16]}>
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={product.name}
                  src={product.image}
                  onError={(e) => (e.target.src = "/default-product.png")}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              }
              actions={[
                <Button type="primary">Add to Cart</Button>,
                <Link to={`/product/${product.id}`}>View Details</Link>,
              ]}
            >
              <Card.Meta
                title={product.name}
                description={
                  <>
                    <Text strong>₱{product.price}</Text>
                    <br />
                    <Text type="secondary">⭐ 4.5</Text>
                  </>
                }
              />
            </Card>
          </Col>
        ))
      ) : (
        <Col span={24}>
          <Text>No products found matching your criteria.</Text>
        </Col>
      )}
    </Row>
  );
};

export default ProductListComponent;