use std::path::PathBuf;

fn main() {
    stage_engine_jar();
    tauri_build::build()
}

/// Ensures `src-tauri/resources/agentready-engine.jar` exists before tauri-build
/// validates bundle resources. In dev the JAR lives in `engine/target/`; for
/// release builds `beforeBuildCommand` copies it there first. Either way this
/// function makes sure the file is present so the Tauri build succeeds.
fn stage_engine_jar() {
    let manifest_dir = PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap());
    let dest = manifest_dir.join("resources/agentready-engine.jar");
    let src = manifest_dir.join("../../../engine/target/agentready-engine.jar");
    println!("cargo:rerun-if-changed={}", src.display());

    // Dev and release: copy from the engine build output if available, but only
    // when the staged resource is missing or older than the source JAR.
    if src.exists() {
        let should_copy = match (std::fs::metadata(&src), std::fs::metadata(&dest)) {
            (Ok(src_meta), Ok(dest_meta)) => match (src_meta.modified(), dest_meta.modified()) {
                (Ok(src_modified), Ok(dest_modified)) => src_modified > dest_modified,
                _ => true,
            },
            (Ok(_), Err(_)) => true,
            _ => true,
        };

        if should_copy {
            std::fs::create_dir_all(dest.parent().unwrap()).ok();
            std::fs::copy(&src, &dest).unwrap_or_else(|e| {
                panic!(
                    "build: could not copy {} to {}: {}",
                    src.display(),
                    dest.display(),
                    e
                );
            });
            println!("cargo:warning=Staged agentready-engine.jar from {}", src.display());
        }
        return;
    }

    panic!(
        "build: agentready-engine.jar not found.\n\
         Run `cd engine && mvn package` to build it, or set AGENTREADY_ENGINE_JAR at runtime."
    );
}
