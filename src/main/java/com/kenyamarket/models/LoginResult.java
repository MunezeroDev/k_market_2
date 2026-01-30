package com.kenyamarket.models;
import java.util.List;

public class LoginResult {
	private boolean success;
	private User user;
	private List<String> roles;
	private String message;

	public LoginResult(boolean success, User user, List<String> roles, String message) {
		this.success = success;
		this.user = user;
		this.roles = roles;
		this.message = message;
	}

	public boolean isSuccess() {
		return success;
	}

	public User getUser() {
		return user;
	}

	public List<String> getRoles() {
		return roles;
	}

	public String getMessage() {
		return message;
	}

	public void setSuccess(boolean success) {
		this.success = success;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public void setRoles(List<String> roles) {
		this.roles = roles;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}