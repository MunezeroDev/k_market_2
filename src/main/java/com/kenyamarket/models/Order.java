package com.kenyamarket.models;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.kenyamarket.states.OrderState;


public class Order {
    private int orderId;
    private int buyerId;
    private int sellerId;
    private BigDecimal totalAmount;
    private OrderState currentState; 
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
        addHistory("Order created in PENDING state");
    }
    
    //*TOBE COMPLETED  */
    public String getCurrentStateName() {
        return currentState.getStateName();
    }
    
    public String getStatusMessage() {
        return currentState.getStatusMessage();
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
    
    public void printOrderStatus() {
        System.out.println("\n" + "=".repeat(50));
        System.out.println("📦 ORDER #" + orderId);
        System.out.println("=".repeat(50));
        System.out.println("Status: " + getCurrentStateName());
        System.out.println("Message: " + getStatusMessage());
        System.out.println("Amount: Ksh. " + totalAmount);
        System.out.println("\nHistory:");
        for (String event : stateHistory) {
            System.out.println("  • " + event);
        }
        System.out.println("=".repeat(50) + "\n");
    }
}