package com.kenyamarket.models;

public abstract class User  {
    private int userId;
    private String userName;
    private String lastName;
    private String email;
    private String phoneNo;
    private String password;
    private String nationalId;
	
	public User() {
	}

	public int getUserId() {
		return userId;
	}
	public void setUserId(int userId) {
		this.userId = userId;
	}

	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhoneNo() {
		return phoneNo;
	}
	public void setPhoneNo(String phoneNo) {
		this.phoneNo = phoneNo;
	}

	public String getPhoneNumber() {
		return phoneNo;
	}
	public void setPhoneNumber(String phoneNumber) {
		this.phoneNo = phoneNumber;
	}

	public String getPassword() {
		return password;
	}
	
	// Only get password but not set it publicly
	public void setPassword(String password) {
		this.password = password;
	}

	public String getNationalId() {
		return nationalId;
	}
	public void setNationalId(String nationalId) {
		this.nationalId = nationalId;
	}

	public abstract String getAccountType();

	@Override
	public String toString() {
		return "User{" + "userId=" + userId + ", userName='" + userName + '\'' + ", lastName='" + lastName + '\''
				+ ", email='" + email + '\'' + ", phoneNo='" + phoneNo + '\'' + ", nationalId='" + nationalId + '\''
				+ '}';
	}
}