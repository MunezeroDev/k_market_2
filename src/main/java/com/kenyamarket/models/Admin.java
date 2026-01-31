package com.kenyamarket.models;

public class Admin extends User {
    @Override
    public String getAccountType() {
        return "admin";
    }
}