from fastapi import FastAPI, Response

app = FastAPI()

@app.get("/ping")
def ping():
    return {"message": "pong"}