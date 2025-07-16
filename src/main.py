from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import track_router, auth_router, playlist_router, metadata_router, health_router, metrics_router, dev_progress_router
from utils.logging import LoggingMiddleware, RequestContextMiddleware
from utils.metrics import metrics_middleware

app = FastAPI(title="Indii Music BabyRobots")

# Add middleware
app.add_middleware(RequestContextMiddleware)
app.add_middleware(LoggingMiddleware)
app.middleware("http")(metrics_middleware)

# Include routers
app.include_router(health_router.router)
app.include_router(metrics_router.router)
app.include_router(auth_router.router)
app.include_router(track_router.router)
app.include_router(playlist_router.router)
app.include_router(metadata_router.router)
app.include_router(dev_progress_router.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Indii Music BabyRobots API"}
