import React, { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Space, Input, Typography } from "antd";
import HeaderComponent from "../UserLayout/Headercomponent";
import SidebarComponent from "../UserLayout/Sidebarcomponent";
import ProductListComponent from "../UserLayout/ProductListcomponent";
import FooterComponent from "../UserLayout/Footercomponent";

const { Content } = Layout;
const { Search } = Input;

const CollectionPage = () => {
  const [products, setProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    genders: [],
    movements: [],
    strapMaterials: [],
  });
  const [filters, setFilters] = useState({
    brand: [],
    gender: [],
    movement: [],
    strapMaterial: [],
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchFilters();
  }, []);

  // API Calls
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/store/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/admin-settings");
      setFilterOptions({
        brands: response.data.brands.map((brand) => brand.name),
        genders: response.data.genders.map((gender) => gender.name),
        movements: response.data.movements.map((movement) => movement.name),
        strapMaterials: response.data.strapMaterials.map((material) => material.name),
      });
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  // Filter Handling
  const handleFilterChange = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const filteredProducts = products.filter((product) => {
    return (
      (filters.brand.length === 0 || filters.brand.includes(product.brand)) &&
      (filters.gender.length === 0 || filters.gender.includes(product.gender)) &&
      (filters.movement.length === 0 || filters.movement.includes(product.movement)) &&
      (filters.strapMaterial.length === 0 || filters.strapMaterial.includes(product.strap_material)) &&
      (searchTerm === "" || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderComponent />
      <Layout>
        <SidebarComponent
          filterOptions={filterOptions}
          filters={filters}
          handleFilterChange={handleFilterChange}
          setFilters={setFilters}
        />
        <Layout style={{ padding: "24px" }}>
          <Content>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Search
                placeholder="Search products..."
                onSearch={(value) => setSearchTerm(value)}
                enterButton
                size="large"
                style={{ maxWidth: "400px" }}
              />
              <ProductListComponent filteredProducts={filteredProducts} />
            </Space>
          </Content>
          <FooterComponent />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default CollectionPage;