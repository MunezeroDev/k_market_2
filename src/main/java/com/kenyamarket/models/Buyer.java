package com.kenyamarket.models;

public class Buyer extends User {
    private String deliveryLocation;

    @Override
    public String getAccountType() {
        return "buyer";
    }

    public String getDeliveryLocation() {
        return deliveryLocation;
    }

    public void setDeliveryLocation(String deliveryLocation) {
        this.deliveryLocation = deliveryLocation;
    }
}

