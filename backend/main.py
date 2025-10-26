from fastapi import FastAPI

app = FastAPI()

@app.get("/hello")
async def get_hello():
    return {"message": "Hello from Python!"}
