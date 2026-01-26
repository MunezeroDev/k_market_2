package com.kenyamarket.models;

import java.sql.Timestamp;

public class ProductImage {
    private int imageId;
    private int productId;
    private String imageData;  // Base64 encoded image
    private boolean isPrimary;
    private Timestamp createdAt;

    // Constructors
    public ProductImage() {}

    public ProductImage(int productId, String imageData, boolean isPrimary) {
        this.productId = productId;
        this.imageData = imageData;
        this.isPrimary = isPrimary;
    }

    // Getters and Setters
    public int getImageId() {
        return imageId;
    }

    public void setImageId(int imageId) {
        this.imageId = imageId;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "ProductImage{" +
                "imageId=" + imageId +
                ", productId=" + productId +
                ", imageData='" + (imageData != null ? imageData.substring(0, Math.min(50, imageData.length())) + "..." : "null") + '\'' +
                ", isPrimary=" + isPrimary +
                ", createdAt=" + createdAt +
                '}';
    }
}