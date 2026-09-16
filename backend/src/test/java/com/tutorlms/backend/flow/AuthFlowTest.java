package com.tutorlms.backend.flow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorlms.backend.auth.dto.LoginRequest;
import com.tutorlms.backend.auth.dto.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Flow Test: Xac thuc nguoi dung (Auth)
 *
 * Kich ban: dang ky tai khoan → dang nhap → lay JWT token
 * Su dung H2 in-memory DB (profile "test")
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("Flow: Xac thuc (Auth)")
class AuthFlowTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    @DisplayName("Dang ky → Dang nhap → Nhan JWT token hop le")
    void registerThenLogin_returnsValidJwtToken() throws Exception {
        // STEP 1: Dang ky tai khoan moi
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setPhone("0901000001");
        registerReq.setEmail("test.auth@example.com");
        registerReq.setFullName("Test User Auth");
        registerReq.setPassword("Password@123");
        registerReq.setRole("STUDENT");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.fullName").value("Test User Auth"));

        // STEP 2: Dang nhap bang so dien thoai
        LoginRequest loginReq = new LoginRequest();
        loginReq.setAccount("0901000001");
        loginReq.setPassword("Password@123");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("token").asText();

        // STEP 3: Dung token vua nhan de goi API xac thuc
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Dang ky trung so dien thoai → 500/RuntimeException")
    void register_duplicatePhone_fails() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setPhone("0901000002");
        req.setFullName("User Duplicate");
        req.setPassword("Password@123");
        req.setRole("STUDENT");

        // Dang ky lan 1
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        // Dang ky lan 2 voi cung so dien thoai
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @DisplayName("Dang nhap mat khau sai → 500/RuntimeException")
    void login_wrongPassword_fails() throws Exception {
        // Dang ky truoc
        RegisterRequest reg = new RegisterRequest();
        reg.setPhone("0901000003");
        reg.setFullName("User Wrong PW");
        reg.setPassword("CorrectPassword@1");
        reg.setRole("STUDENT");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk());

        // Dang nhap voi mat khau sai
        LoginRequest login = new LoginRequest();
        login.setAccount("0901000003");
        login.setPassword("WrongPassword!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @DisplayName("Goi /auth/me khong co token → 403")
    void getMe_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isForbidden());
    }
}