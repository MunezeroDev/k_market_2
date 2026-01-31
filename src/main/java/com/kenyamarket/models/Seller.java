package com.kenyamarket.models;

public class Seller extends User {
    private String businessName;
    private String businessRegNumber;
    private String businessLocation;

    @Override
    public String getAccountType() {
        return "seller";
    }

    public String getBusinessName() {
    return businessName;
	}
	public void setBusinessName(String businessName) {
		this.businessName = businessName;
	}

	public String getBusinessRegNumber() {
		return businessRegNumber;
	}
	public void setBusinessRegNumber(String businessRegNumber) {
		this.businessRegNumber = businessRegNumber;
	}

	public String getBusinessLocation() {
		return businessLocation;
	}
	public void setBusinessLocation(String businessLocation) {
		this.businessLocation = businessLocation;
	}
}