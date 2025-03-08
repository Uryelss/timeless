import React from "react";
import { Layout, Typography, Space, Checkbox, Button, Divider } from "antd";

const { Sider } = Layout;
const { Title } = Typography;

const SidebarComponent = ({ filterOptions, filters, handleFilterChange, setFilters }) => {
  // Filter Menu Items
  const FilterSection = ({ title, options, filterKey }) => (
    <div style={{ marginBottom: "24px" }}>
      <Title level={5}>{title}</Title>
      <Space direction="vertical">
        {options.map((option) => (
          <Checkbox
            key={option}
            checked={filters[filterKey].includes(option)}
            onChange={() => handleFilterChange(filterKey, option)}
          >
            {option}
          </Checkbox>
        ))}
      </Space>
    </div>
  );

  return (
    <Sider
      width={300}
      style={{
        background: "#fff",
        padding: "24px",
        overflowY: "auto",
      }}
    >
      <Title level={4}>Filters</Title>
      <Divider />
      <FilterSection title="Brand" options={filterOptions.brands} filterKey="brand" />
      <FilterSection title="Gender" options={filterOptions.genders} filterKey="gender" />
      <FilterSection title="Movement" options={filterOptions.movements} filterKey="movement" />
      <FilterSection title="Strap Material" options={filterOptions.strapMaterials} filterKey="strapMaterial" />
      <Button
        type="primary"
        block
        onClick={() =>
          setFilters({
            brand: [],
            gender: [],
            movement: [],
            strapMaterial: [],
          })
        }
        style={{ marginTop: "16px" }}
      >
        Clear All Filters
      </Button>
    </Sider>
  );
};

export default SidebarComponent;