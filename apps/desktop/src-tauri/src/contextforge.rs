use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::path::Path;

const CONTEXTFORGE_API_URL: &str = "https://agentready-api.vercel.app/api/contextforge";
const APP_TOKEN: Option<&str> = option_env!("AGENTREADY_TOKEN");

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StackInfo {
    pub detected: bool,
    pub languages: Vec<String>,
    pub frameworks: Vec<String>,
    pub build_tools: Vec<String>,
    pub databases: Vec<String>,
    pub test_frameworks: Vec<String>,
    pub has_docker: bool,
    pub has_migrations: bool,
    pub summary: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ContextForgeStatus {
    pub has_cursorrules: bool,
    pub has_agents_md: bool,
    pub stack: StackInfo,
    /// False in dev builds where AGENTREADY_TOKEN was not compiled in.
    pub can_generate: bool,
}

pub fn detect_stack(repo_path: &str) -> StackInfo {
    let root = Path::new(repo_path);
    let mut languages: Vec<String> = vec![];
    let mut frameworks: Vec<String> = vec![];
    let mut build_tools: Vec<String> = vec![];
    let mut databases: Vec<String> = vec![];
    let mut test_frameworks: Vec<String> = vec![];

    // Java / Kotlin
    if root.join("pom.xml").exists() {
        push_unique(&mut languages, "Java");
        push_unique(&mut build_tools, "Maven");
        if let Ok(c) = std::fs::read_to_string(root.join("pom.xml")) {
            if c.contains("spring-boot") {
                push_unique(&mut frameworks, "Spring Boot");
            }
        }
    }
    if root.join("build.gradle.kts").exists() {
        push_unique(&mut languages, "Kotlin");
        push_unique(&mut build_tools, "Gradle");
        if let Ok(c) = std::fs::read_to_string(root.join("build.gradle.kts")) {
            if c.contains("spring-boot") {
                push_unique(&mut frameworks, "Spring Boot");
            }
        }
    } else if root.join("build.gradle").exists() {
        push_unique(&mut languages, "Java");
        push_unique(&mut build_tools, "Gradle");
        if let Ok(c) = std::fs::read_to_string(root.join("build.gradle")) {
            if c.contains("spring-boot") {
                push_unique(&mut frameworks, "Spring Boot");
            }
        }
    }

    // JavaScript / TypeScript / Node
    if root.join("package.json").exists() {
        if let Ok(c) = std::fs::read_to_string(root.join("package.json")) {
            if c.contains("\"typescript\"") || c.contains("\"@types/") {
                push_unique(&mut languages, "TypeScript");
            } else {
                push_unique(&mut languages, "JavaScript");
            }
            for (needle, name) in &[
                ("\"next\"", "Next.js"),
                ("\"react\"", "React"),
                ("\"vue\"", "Vue"),
                ("\"nuxt\"", "Nuxt"),
                ("\"svelte\"", "Svelte"),
                ("\"express\"", "Express"),
                ("\"fastify\"", "Fastify"),
                ("\"hono\"", "Hono"),
                ("\"@nestjs/core\"", "NestJS"),
            ] {
                if c.contains(needle) {
                    push_unique(&mut frameworks, name);
                }
            }
            for (needle, name) in &[
                ("\"vite\"", "Vite"),
                ("\"webpack\"", "Webpack"),
                ("\"esbuild\"", "esbuild"),
                ("\"turbo\"", "Turborepo"),
            ] {
                if c.contains(needle) {
                    push_unique(&mut build_tools, name);
                }
            }
            for (needle, name) in &[
                ("\"jest\"", "Jest"),
                ("\"vitest\"", "Vitest"),
                ("\"mocha\"", "Mocha"),
                ("\"cypress\"", "Cypress"),
                ("\"playwright\"", "Playwright"),
                ("\"@playwright/test\"", "Playwright"),
            ] {
                if c.contains(needle) {
                    push_unique(&mut test_frameworks, name);
                }
            }
            for (needle, name) in &[
                ("\"pg\"", "PostgreSQL"),
                ("\"mysql2\"", "MySQL"),
                ("\"mongodb\"", "MongoDB"),
                ("\"redis\"", "Redis"),
                ("\"@prisma/client\"", "Prisma"),
                ("\"drizzle-orm\"", "Drizzle"),
            ] {
                if c.contains(needle) {
                    push_unique(&mut databases, name);
                }
            }
        }
    }

    // Go
    if root.join("go.mod").exists() {
        push_unique(&mut languages, "Go");
        if let Ok(c) = std::fs::read_to_string(root.join("go.mod")) {
            for (needle, name) in &[
                ("gin-gonic/gin", "Gin"),
                ("labstack/echo", "Echo"),
                ("gofiber/fiber", "Fiber"),
                ("go-chi/chi", "Chi"),
            ] {
                if c.contains(needle) {
                    push_unique(&mut frameworks, name);
                }
            }
        }
    }

    // Rust
    if root.join("Cargo.toml").exists() {
        push_unique(&mut languages, "Rust");
        if let Ok(c) = std::fs::read_to_string(root.join("Cargo.toml")) {
            for (needle, name) in &[
                ("axum", "Axum"),
                ("actix-web", "Actix"),
                ("rocket", "Rocket"),
                ("warp", "Warp"),
            ] {
                if c.contains(needle) {
                    push_unique(&mut frameworks, name);
                }
            }
        }
    }

    // Python
    if root.join("requirements.txt").exists()
        || root.join("pyproject.toml").exists()
        || root.join("setup.py").exists()
    {
        push_unique(&mut languages, "Python");
        for file in &["requirements.txt", "pyproject.toml", "setup.py"] {
            if let Ok(c) = std::fs::read_to_string(root.join(file)) {
                let lower = c.to_lowercase();
                for (needle, name) in &[
                    ("django", "Django"),
                    ("fastapi", "FastAPI"),
                    ("flask", "Flask"),
                    ("starlette", "Starlette"),
                ] {
                    if lower.contains(needle) {
                        push_unique(&mut frameworks, name);
                    }
                }
                for (needle, name) in &[("pytest", "pytest"), ("unittest", "unittest")] {
                    if lower.contains(needle) {
                        push_unique(&mut test_frameworks, name);
                    }
                }
                for (needle, name) in &[
                    ("psycopg", "PostgreSQL"),
                    ("pymysql", "MySQL"),
                    ("pymongo", "MongoDB"),
                    ("redis", "Redis"),
                ] {
                    if lower.contains(needle) {
                        push_unique(&mut databases, name);
                    }
                }
            }
        }
    }

    // Ruby
    if root.join("Gemfile").exists() {
        push_unique(&mut languages, "Ruby");
        if let Ok(c) = std::fs::read_to_string(root.join("Gemfile")) {
            if c.contains("rails") {
                push_unique(&mut frameworks, "Rails");
            }
            if c.contains("sinatra") {
                push_unique(&mut frameworks, "Sinatra");
            }
            if c.contains("rspec") {
                push_unique(&mut test_frameworks, "RSpec");
            }
        }
    }

    let has_docker = root.join("Dockerfile").exists()
        || root.join("docker-compose.yml").exists()
        || root.join("docker-compose.yaml").exists();

    let has_migrations = root.join("migrations").is_dir()
        || root.join("db/migrate").is_dir()
        || root.join("db/migrations").is_dir();

    let detected = !languages.is_empty();
    let summary = if !detected {
        "Unknown stack".to_string()
    } else {
        let mut parts = languages.clone();
        for f in &frameworks {
            parts.push(f.clone());
        }
        parts.join(", ")
    };

    StackInfo {
        detected,
        languages,
        frameworks,
        build_tools,
        databases,
        test_frameworks,
        has_docker,
        has_migrations,
        summary,
    }
}

fn push_unique(vec: &mut Vec<String>, item: &str) {
    let s = item.to_string();
    if !vec.contains(&s) {
        vec.push(s);
    }
}

#[tauri::command]
pub fn check_context_forge_status(repo_path: String) -> ContextForgeStatus {
    let root = Path::new(&repo_path);
    ContextForgeStatus {
        has_cursorrules: root.join(".cursorrules").exists(),
        has_agents_md: root.join("AGENTS.md").exists(),
        stack: detect_stack(&repo_path),
        can_generate: matches!(APP_TOKEN, Some(t) if !t.is_empty()),
    }
}

#[tauri::command]
pub async fn generate_context_files(
    repo_path: String,
    user_token: String,
) -> Result<ContextForgeStatus, String> {
    let app_token = match APP_TOKEN {
        Some(t) if !t.is_empty() => t,
        _ => return Err("ContextForge is not available in dev builds.".to_string()),
    };

    let stack = detect_stack(&repo_path);
    if !stack.detected {
        return Err("No recognizable stack detected in this repository.".to_string());
    }

    let project_name = Path::new(&repo_path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("project")
        .to_string();

    let body = serde_json::json!({
        "projectName": project_name,
        "languages": stack.languages,
        "frameworks": stack.frameworks,
        "buildTools": stack.build_tools,
        "databases": stack.databases,
        "testFrameworks": stack.test_frameworks,
        "hasDocker": stack.has_docker,
        "hasMigrations": stack.has_migrations,
    });

    let client = Client::builder()
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    let response = client
        .post(CONTEXTFORGE_API_URL)
        .header("x-agentready-token", app_token)
        .header("x-agentready-user-token", &user_token)
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Network error: {e}"))?;

    let status = response.status();
    if status == 401 {
        return Err("Session expired. Open Settings to sign in again.".to_string());
    }
    if status == 429 {
        return Err("Too many requests. Try again in an hour.".to_string());
    }
    if !status.is_success() {
        let body_text = response.text().await.unwrap_or_default();
        return Err(format!("API error {status}: {body_text}"));
    }

    #[derive(Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct ApiResponse {
        cursorrules: String,
        agents_md: String,
    }

    let parsed: ApiResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {e}"))?;

    let root = Path::new(&repo_path);
    std::fs::write(root.join(".cursorrules"), &parsed.cursorrules)
        .map_err(|e| format!("Failed to write .cursorrules: {e}"))?;
    std::fs::write(root.join("AGENTS.md"), &parsed.agents_md)
        .map_err(|e| format!("Failed to write AGENTS.md: {e}"))?;

    Ok(ContextForgeStatus {
        has_cursorrules: true,
        has_agents_md: true,
        stack,
        can_generate: true,
    })
}
