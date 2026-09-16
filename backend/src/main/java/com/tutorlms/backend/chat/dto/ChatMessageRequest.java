package com.tutorlms.backend.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatMessageRequest {
    @NotBlank(message = "Noi dung khong duoc de trong")
    @Size(max = 2000)
    private String content;
}