package com.kenyamarket.models;

public class User {
    private int userId;
    private String accountType;  // This will be parsed to determine roles
    private String userName;
    private String lastName;
    private String email;
    private String phoneNo;
    private String password;
    private String nationalId;
    
    // Buyer-specific
    private String deliveryLocation;
    
    // Seller-specific
    private String businessName;
    private String businessRegNumber;
    private String businessLocation;

    // Constructors
    public User() {}

    // Getters and Setters
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    // Keep this for JSON compatibility with frontend
    public String getUsername() { return userName; }
    public void setUsername(String username) { this.userName = username; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNo() { return phoneNo; }
    public void setPhoneNo(String phoneNo) { this.phoneNo = phoneNo; }
    
    // Keep this for JSON compatibility with frontend
    public String getPhoneNumber() { return phoneNo; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNo = phoneNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNationalId() { return nationalId; }
    public void setNationalId(String nationalId) { this.nationalId = nationalId; }

    public String getDeliveryLocation() { return deliveryLocation; }
    public void setDeliveryLocation(String deliveryLocation) { this.deliveryLocation = deliveryLocation; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getBusinessRegNumber() { return businessRegNumber; }
    public void setBusinessRegNumber(String businessRegNumber) { this.businessRegNumber = businessRegNumber; }

    public String getBusinessLocation() { return businessLocation; }
    public void setBusinessLocation(String businessLocation) { this.businessLocation = businessLocation; }

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", userName='" + userName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phoneNo='" + phoneNo + '\'' +
                ", nationalId='" + nationalId + '\'' +
                '}';
    }
}