use crate::config::{AiProvider, AppConfig};
use anyhow::{anyhow, Context, Result};
use reqwest::blocking::Client;
use serde_json::{json, Value};
use std::time::Duration;

pub trait AiBackend {
    fn generate(&self, prompt: &str, system_prompt: &str) -> Result<String>;
}

pub struct OpenAiBackend {
    api_key: String,
    base_url: String,
    model: String,
    client: Client,
}

impl OpenAiBackend {
    pub fn new(api_key: &str, base_url: &str, model: &str) -> Self {
        Self {
            api_key: api_key.to_string(),
            base_url: base_url.to_string(),
            model: model.to_string(),
            client: Client::builder().timeout(Duration::from_secs(60)).build().unwrap(),
        }
    }
}

impl AiBackend for OpenAiBackend {
    fn generate(&self, prompt: &str, system_prompt: &str) -> Result<String> {
        let url = format!("{}/chat/completions", self.base_url);

        let body = json!({
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        });

        let res = self.client.post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .context("Failed to send request to AI provider")?;

        if !res.status().is_success() {
            let error_text = res.text().unwrap_or_default();
            return Err(anyhow!("AI Request Failed: {}", error_text));
        }

        let json: Value = res.json().context("Failed to parse AI response")?;

        let content = json["choices"][0]["message"]["content"]
            .as_str()
            .context("Invalid response format from AI")?
            .to_string();

        Ok(content)
    }
}

pub struct GeminiBackend {
    api_key: String,
    client: Client,
}

impl GeminiBackend {
    pub fn new(api_key: &str) -> Self {
        Self {
            api_key: api_key.to_string(),
            client: Client::builder().timeout(Duration::from_secs(60)).build().unwrap(),
        }
    }
}

impl AiBackend for GeminiBackend {
    fn generate(&self, prompt: &str, system_prompt: &str) -> Result<String> {
        // Gemini uses a different format. We can prepend system prompt to user prompt or use specific field if available (Gemini 1.5 supports system instructions, but let's keep it simple).
        let full_prompt = format!("{}\n\nUser Request: {}", system_prompt, prompt);

        let url = format!("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={}", self.api_key);

        let body = json!({
            "contents": [{
                "parts": [{"text": full_prompt}]
            }]
        });

        let res = self.client.post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .context("Failed to send request to Gemini")?;

        if !res.status().is_success() {
             let error_text = res.text().unwrap_or_default();
            return Err(anyhow!("Gemini Request Failed: {}", error_text));
        }

        let json: Value = res.json().context("Failed to parse Gemini response")?;

        // Extract text
        let content = json["candidates"][0]["content"]["parts"][0]["text"]
            .as_str()
            .context("Invalid response format from Gemini")?
            .to_string();

        Ok(content)
    }
}

pub fn get_ai_backend(config: &AppConfig) -> Result<Box<dyn AiBackend>> {
    let provider = config.active_provider.as_ref().context("No active AI provider selected in settings.")?;
    let key = config.api_keys.get(provider).context("No API key found for the active provider.")?;

    match provider {
        AiProvider::OpenAI => Ok(Box::new(OpenAiBackend::new(key, "https://api.openai.com/v1", "gpt-4o"))),
        AiProvider::Grok => Ok(Box::new(OpenAiBackend::new(key, "https://api.x.ai/v1", "grok-beta"))),
        AiProvider::Gemini => Ok(Box::new(GeminiBackend::new(key))),
    }
}
