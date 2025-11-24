from locust import FastHttpUser, task, between
import urllib3
import os

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Allow host to be configured via environment variable
DEFAULT_HOST = os.getenv("LOCUST_HOST", "http://localhost")

class BasicUser(FastHttpUser):
    """User class for equal weighted testing of each endpoint simulating a wide range of different request patterns."""
    wait_time = between(0.9, 1.1)
    host = DEFAULT_HOST
    connection_timeout = 10.0
    network_timeout = 10.0
    
    @task
    def status_endpoint(self):
        """Test the basic status endpoint."""
        with self.client.get("/api/status", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Got status code {response.status_code}")
    
    @task
    def delay_short(self):
        """Test endpoint with short delay."""
        with self.client.get("/api/delay/500", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Got status code {response.status_code}")
    
    @task
    def delay_long(self):
        """Test endpoint with long delay."""
        with self.client.get("/api/delay/2000", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Got status code {response.status_code}")
    
    @task
    def test_client_error(self):
        """Test status code endpoint with 404."""
        with self.client.get("/api/code/404", catch_response=True) as response:
            if response.status_code == 404:
                response.success()  # This is expected
            else:
                response.failure(f"Expected 404, got {response.status_code}")
    
    @task
    def test_status_ok(self):
        """Test status code endpoint with 200."""
        with self.client.get("/api/code/200", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Expected 200, got {response.status_code}")
    
    @task
    def test_complex(self):
        """Test complex endpoint simulating multiple downstream calls."""
        with self.client.get("/api/complex", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Got status code {response.status_code}")

    @task
    def test_fib_1k(self):
        """Test fib endpoint simulating low cpu load."""
        with self.client.get("/api/fib/1000", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Got status code {response.status_code}")

    @task
    def test_fib_100k(self):
        """Test fib endpoint simulating high cpu load."""
        with self.client.get("/api/fib/100000", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Got status code {response.status_code}")


class LowIOUser(FastHttpUser):
    """User class for low I/O operations testing of status/basic/delay endpoints."""
    wait_time = between(0.9, 1.1)
    host = DEFAULT_HOST
    connection_timeout = 10.0
    network_timeout = 10.0

    @task
    def test_status(self):
        """Test basic endpoint."""
        with self.client.get("/api/status", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Expected 200, got {response.status_code}")

    @task
    def test_delay_100(self):
        """Test delay endpoint with 100ms delay."""
        with self.client.get("/api/delay/100", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Expected 200, got {response.status_code}")

    @task
    def test_code_200(self):
        """Test status code endpoint with 200 status code."""
        with self.client.get("/api/code/200", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Expected 200, got {response.status_code}")

    @task
    def test_code_301(self):
        """Test status code endpoint with 301 status code."""
        with self.client.get("/api/code/301", catch_response=True) as response:
            if response.status_code == 301:
                response.success()
            else:
                response.failure(f"Expected 301, got {response.status_code}")

    @task
    def test_code_404(self):
        """Test status code endpoint with 404 status code."""
        with self.client.get("/api/code/404", catch_response=True) as response:
            if response.status_code == 404:
                response.success()
            else:
                response.failure(f"Expected 404, got {response.status_code}")

class HighIOUser(FastHttpUser):
    """User class for high I/O operations testing of status/code/delay endpoints."""
    wait_time = between(0.9, 1.1)
    host = DEFAULT_HOST
    connection_timeout = 10.0
    network_timeout = 10.0

    @task
    def test_delay_100(self):
        """Test delay endpoint with 100ms delay."""
        with self.client.get("/api/delay/100", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Expected 200, got {response.status_code}")

    @task
    def test_delay_250(self):
        """Test delay endpoint with 250ms delay."""
        with self.client.get("/api/delay/250", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Expected 200, got {response.status_code}")

    @task
    def test_delay_500(self):
        """Test delay endpoint with 500ms delay."""
        with self.client.get("/api/delay/500", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Expected 200, got {response.status_code}")


    @task
    def test_delay_1000(self):
        """Test delay endpoint with 1000ms delay."""
        with self.client.get("/api/delay/1000", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Expected 200, got {response.status_code}")

    @task
    def test_delay_2000(self):
        """Test delay endpoint with 2000ms delay."""
        with self.client.get("/api/delay/2000", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Expected 200, got {response.status_code}")

    @task
    def test_delay_5000(self):
        """Test delay endpoint with 5000ms delay."""
        with self.client.get("/api/delay/5000", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Expected 200, got {response.status_code}")