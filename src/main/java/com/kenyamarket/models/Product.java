package com.kenyamarket.models;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public class Product {
	private int productId;
	private int sellerId;
	private String productName;
	private String description;
	private BigDecimal price;
	private int quantity;
	private String category;
	private String status;
	private Timestamp createdAt;
	private Timestamp updatedAt;
	private List<String> images;

	public Product() {
	}

	public Product(int sellerId, String productName, String description, BigDecimal price, int quantity,
			String category) {
		this.sellerId = sellerId;
		this.productName = productName;
		this.description = description;
		this.price = price;
		this.quantity = quantity;
		this.category = category;
		this.status = "active";
	}

	public int getProductId() {
		return productId;
	}

	public void setProductId(int productId) {
		this.productId = productId;
	}

	public int getSellerId() {
		return sellerId;
	}

	public void setSellerId(int sellerId) {
		this.sellerId = sellerId;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Timestamp getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Timestamp createdAt) {
		this.createdAt = createdAt;
	}

	public Timestamp getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Timestamp updatedAt) {
		this.updatedAt = updatedAt;
	}

	public List<String> getImages() {
		return images;
	}

	public void setImages(List<String> images) {
		this.images = images;
	}

	@Override
	public String toString() {
		return "Product{" + "productId=" + productId + ", sellerId=" + sellerId + ", productName='" + productName + '\''
				+ ", description='" + description + '\'' + ", price=" + price + ", quantity=" + quantity
				+ ", category='" + category + '\'' + ", status='" + status + '\'' + ", createdAt=" + createdAt
				+ ", updatedAt=" + updatedAt + '}';
	}
}