package com.example.gestionprojet.services.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Client IA mutualise (compatible OpenAI API).
 *
 * Par defaut configure pour GROQ (gratuit, ~14 400 requetes/jour,
 * pas de carte bancaire, dispo dans tous les pays).
 *
 * Pour obtenir une cle Groq gratuite :
 *   https://console.groq.com/keys
 *
 * La classe s'appelle encore GeminiClient pour ne pas casser les imports
 * existants, mais elle parle a Groq via son API OpenAI-compatible.
 *
 * Pour passer sur un autre provider OpenAI-compatible (OpenAI, OpenRouter,
 * Together, Mistral...), il suffit de changer 3 proprietes dans
 * application.properties (app.ai.base-url, app.ai.model, app.ai.api-key).
 */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient = RestClient.create();

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:llama-3.3-70b-versatile}")
    private String model;

    /**
     * Endpoint chat completions (format OpenAI).
     * Groq : https://api.groq.com/openai/v1/chat/completions
     * OpenAI : https://api.openai.com/v1/chat/completions
     */
    @Value("${app.ai.base-url:https://api.groq.com/openai/v1/chat/completions}")
    private String baseUrl;

    @Value("${app.ai.max-tokens:1024}")
    private int maxTokens;

    @Value("${app.ai.temperature:0.5}")
    private double temperature;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String getModel() {
        return model;
    }

    /**
     * Appelle l'API IA avec un prompt utilisateur et impose une reponse JSON.
     *
     * @param userPrompt prompt complet (instructions + donnees contextuelles)
     * @return arbre JSON parse pret a l'emploi
     */
    public JsonNode generateJson(String userPrompt) throws Exception {
        if (!isConfigured()) {
            throw new IllegalStateException("Cle API IA non configuree.");
        }

        // Body au format OpenAI / Groq
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", model);
        body.put("temperature", temperature);
        body.put("max_tokens", maxTokens);

        // response_format: json_object -> garantit une sortie JSON valide.
        ObjectNode responseFormat = body.putObject("response_format");
        responseFormat.put("type", "json_object");

        ArrayNode messages = body.putArray("messages");
        // System : impose une sortie JSON pure (necessaire avec response_format=json_object)
        ObjectNode system = messages.addObject();
        system.put("role", "system");
        system.put("content",
                "Tu es un assistant chef de projet expert. " +
                "Tu reponds EXCLUSIVEMENT par un objet JSON valide, sans texte avant ni apres. " +
                "Tu respectes les cles demandees dans le prompt utilisateur.");

        ObjectNode user = messages.addObject();
        user.put("role", "user");
        user.put("content", userPrompt);

        String responseBody = restClient.post()
                .uri(baseUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(body.toString())
                .retrieve()
                .body(String.class);

        JsonNode root = objectMapper.readTree(responseBody);
        // Reponse OpenAI/Groq : choices[0].message.content
        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            log.warn("Reponse IA sans choices : {}", responseBody);
            throw new IllegalStateException("Reponse IA vide.");
        }
        String rawText = choices.get(0).path("message").path("content").asText("");
        if (rawText.isBlank()) {
            throw new IllegalStateException("Texte IA vide.");
        }
        return objectMapper.readTree(extractJsonObject(rawText));
    }

    /** Filet de securite si le modele ajoute du texte autour du JSON. */
    private String extractJsonObject(String text) {
        int objStart = text.indexOf('{');
        int objEnd = text.lastIndexOf('}');
        int arrStart = text.indexOf('[');
        int arrEnd = text.lastIndexOf(']');

        if (objStart >= 0 && objEnd > objStart) {
            return text.substring(objStart, objEnd + 1);
        }
        if (arrStart >= 0 && arrEnd > arrStart) {
            return text.substring(arrStart, arrEnd + 1);
        }
        return text;
    }
}
