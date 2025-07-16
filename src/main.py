from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import track_router, auth_router, playlist_router, metadata_router

app = FastAPI(title="Indii Music BabyRobots")

# Include routers
app.include_router(auth_router.router)
app.include_router(track_router.router)
app.include_router(playlist_router.router)
app.include_router(metadata_router.router)

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
