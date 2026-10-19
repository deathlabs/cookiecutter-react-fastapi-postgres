from fastapi import FastAPI

app = FastAPI()


@app.get("/api/v1/health/")
def read_health():
    return {"status": "healthy"}


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
