"""Centralized application configuration management."""

import os
import typing as t

# Define the structure of your final configuration
class AppConfig(t.TypedDict):
    """The type definition for the application's configuration."""
    WORKER_COUNT: int
    FEATURE_ENABLED: bool
    
def load_config() -> AppConfig:
    """
    Retrieves, type-converts, and validates all application flags 
    from the environment. This is the Single Source of Truth.
    """
    try:
        config = AppConfig(
            WORKER_COUNT=int(os.environ.get("WORKER_COUNT", "4")),
            FEATURE_ENABLED=os.environ.get("FEATURE_FLAG", "false").lower() == "true",
        )
    except KeyError as e:
        raise EnvironmentError(f"Missing required environment variable: {e}")
    except ValueError as e:
        raise ValueError(f"Invalid environment variable value: {e}")

    # IMPORTANT: Filter sensitive data before returning the dictionary!
    # ... any filtering logic here ...
    
    return config

# Load the config once at application startup
# All parts of the app import this global object
CONFIG = load_config()