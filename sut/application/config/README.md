# Configuration Best Practices Summary

1.  Single Source of Truth (SoT): Centralize flag retrieval in one function, executed once at startup.
2.  Environment Variables Only: Use `os.environ` as the sole source for runtime configuration values.
3.  No Config in Dockerfile: Set dynamic or sensitive flag values at runtime, not build time.
4.  Runtime Injection: Use Docker Compose or Kubernetes manifests to inject flags via `-e` or `env`.
5.  Principle of Locality: Declare flag logic near the code module that uses the flag.
6.  Programmatic API: Use a flag library (e.g., `argparse`) for type enforcement and help generation.
7.  POSIX/GNU Compliance: Use standard `--long-options` and `-short-options` naming conventions.
8.  Type Coercion: Explicitly convert environment strings to required Python types (int, bool).
9.  Security Filtering: Filter out all secrets (passwords, keys) before exposing configuration data.
10. Config Endpoint: Expose a secure, authenticated endpoint to view the active configuration state.
11. Gunicorn Separation: Distinguish between Gunicorn's server config and the application's runtime flags.
12. Graceful Failure: Immediately halt startup if a critical, mandatory flag is missing or invalid.

# New Flags

Step-by-step process for adding a new configuration flag:

1. Define the Flag Value (Runtime)

* **Docker Compose:** Add the new configuration variable and its desired **value** to the `environment` section of your `docker-compose.yaml`.
    * *Example:* `NEW_FEATURE_ENABLED: "true"`

2. Read and Validate (SoT)

* **Config Getter:** Update your `load_config()` (SoT function) to read the new environment variable using `os.environ.get()`.
* **Type Coerce:** Immediately convert the string value to the correct type (e.g., `int()`, `bool`, or a dedicated function).
* **Fail Gracefully:** Add logic to halt startup if the flag is mandatory but missing or if its type is invalid.

3. Use in Application

* **Access Config:** Import the global `CONFIG` object into the module that needs the flag's value.
* **Apply Logic:** Use the structured value (e.g., `if CONFIG['NEW_FEATURE_ENABLED']:`...) to implement the feature logic.

4. Update

* **Config Endpoint:** Ensure the new flag is included in the structured dictionary returned by your `/config` endpoint for troubleshooting.
* **Help Text:** If using an argument parser like `argparse` in a wrapper script, add help text describing the new flag.
