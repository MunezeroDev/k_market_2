package com.kenyamarket.models;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

// TO BE COMPLETED 
public class Order {
    private int orderId;
    private int buyerId;
    private int sellerId;
    private BigDecimal totalAmount;
 
    private List<String> stateHistory;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    public Order(int orderId, int buyerId, int sellerId, BigDecimal totalAmount) {
        this.orderId = orderId;
        this.buyerId = buyerId;
        this.sellerId = sellerId;
        this.totalAmount = totalAmount;
        // this.currentState = new PendingState();  // ✅ Initial state
        this.stateHistory = new ArrayList<>();
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }

    public int getOrderId() {
        return orderId;
    }
    
    public int getBuyerId() {
        return buyerId;
    }
    
    public int getSellerId() {
        return sellerId;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public List<String> getStateHistory() {
        return new ArrayList<>(stateHistory);
    }
    

}