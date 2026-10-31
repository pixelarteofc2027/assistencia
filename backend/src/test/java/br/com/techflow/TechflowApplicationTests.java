package br.com.techflow;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "techflow.security.admin.username=testadmin",
        "techflow.security.admin.password=TestAdmin!123"
})
class TechflowApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginShouldAuthenticateUser() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testadmin\",\"password\":\"TestAdmin!123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testadmin"));
    }

    @Test
    void invalidLoginShouldFail() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testadmin\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "testadmin", roles = "ADMIN")
    void dashboardShouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk());
    }

    @Test
    void dashboardWithoutCredentialsShouldFail() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isUnauthorized());
    }
}
