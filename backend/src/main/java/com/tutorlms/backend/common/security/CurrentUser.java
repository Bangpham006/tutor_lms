package com.tutorlms.backend.common.security;

import com.tutorlms.backend.auth.entity.User;
import com.tutorlms.backend.common.exception.ForbiddenOperationException;

public final class CurrentUser {

    private CurrentUser() {
    }

    public static User require(User user) {
        if (user == null) {
            throw new ForbiddenOperationException("Không tìm thấy thông tin xác thực");
        }
        return user;
    }

    public static boolean isAdmin(User user) {
        return user != null && user.hasRole(Roles.ADMIN);
    }
}
