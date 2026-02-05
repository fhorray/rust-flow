use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use anyhow::{Context, Result};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Hash)]
pub enum AiProvider {
    OpenAI,
    Gemini,
    Grok,
}

impl std::fmt::Display for AiProvider {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AiProvider::OpenAI => write!(f, "OpenAI"),
            AiProvider::Gemini => write!(f, "Gemini"),
            AiProvider::Grok => write!(f, "Grok"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub active_provider: Option<AiProvider>,
    pub api_keys: HashMap<AiProvider, String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            active_provider: None,
            api_keys: HashMap::new(),
        }
    }
}

impl AppConfig {
    fn get_config_dir() -> PathBuf {
        PathBuf::from(".rustflow")
    }

    fn get_config_path() -> PathBuf {
        Self::get_config_dir().join("config.json")
    }

    pub fn load() -> Result<Self> {
        let path = Self::get_config_path();
        if !path.exists() {
            return Ok(Self::default());
        }

        let content = fs::read_to_string(&path).context("Failed to read config.json")?;
        let config: AppConfig = serde_json::from_str(&content).unwrap_or_default();
        Ok(config)
    }

    pub fn save(&self) -> Result<()> {
        let dir = Self::get_config_dir();
        if !dir.exists() {
            fs::create_dir_all(&dir).context("Failed to create .rustflow directory")?;
        }

        // Also ensure subdirectories exist
        let practice_dir = PathBuf::from("src/practice");
        if !practice_dir.exists() {
            fs::create_dir_all(&practice_dir).context("Failed to create src/practice directory")?;
        }

        let explanations_dir = dir.join("explanations");
        if !explanations_dir.exists() {
            fs::create_dir_all(&explanations_dir).context("Failed to create .rustflow/explanations directory")?;
        }

        let content = serde_json::to_string_pretty(self)?;
        fs::write(Self::get_config_path(), content).context("Failed to write config.json")?;
        Ok(())
    }

    pub fn get_api_key(&self, provider: &AiProvider) -> Option<&String> {
        self.api_keys.get(provider)
    }

    pub fn set_api_key(&mut self, provider: AiProvider, key: String) {
        self.api_keys.insert(provider, key);
    }
}
