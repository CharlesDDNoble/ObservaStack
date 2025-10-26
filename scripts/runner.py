import subprocess
import sys
import argparse

def run_command(command):
    """Runs a shell command and checks for errors."""
    try:
        result = subprocess.run(command, shell=True, check=True)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Command failed with error: {e}")
        return None
    except KeyboardInterrupt:
        print("\nScript interrupted by user (Ctrl+C).")
        sys.exit(1)

def build_image(image_name, build_context):
    """Builds the Docker image."""
    print(f"--- Building Docker Image: {image_name} ---")
    build_command = f"docker build -t {image_name} {build_context}"

    if run_command(build_command) is None:
        print("Build failed!")
        return False
    print("--- Build Successful ---")
    return True

def run_container(image_name):
    """Runs the Docker container in the foreground."""
    print(f"--- Running Docker Container: {image_name} ---")
    print("Press Ctrl+C to stop the container.")
    run_command_str = f"docker run -p 8000:8000 {image_name}"

    if run_command(run_command_str) is None:
        print("Failed to run container.")
        return False
    return True

def main():
    parser = argparse.ArgumentParser(
        description="Build and/or run Docker containers for different services."
    )
    
    parser.add_argument(
        "action",
        help="The action to perform.",
        choices=["build", "run", "all"]
    )
    
    parser.add_argument(
        "service",
        help="The service to target (e.g., backend, gateway)."
    )
    
    args = parser.parse_args()
    
    IMAGE_NAME = f"{args.service}-image"
    BUILD_CONTEXT = f"./{args.service}/"

    if args.action == "build":
        build_image(IMAGE_NAME, BUILD_CONTEXT)
    elif args.action == "run":
        run_container(IMAGE_NAME)
    elif args.action == "all":
        if build_image(IMAGE_NAME, BUILD_CONTEXT):
            run_container(IMAGE_NAME)

if __name__ == "__main__":
    main()