from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import companies, savings, economy, documents

app = FastAPI(
    title="Personal Dashboard API",
    description="Backend for personal dashboard tracking companies, savings, bank accounts and documents",
    version="1.0.0",
)

# CORS - allow Netlify frontend and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.netlify.app",   # Replace with your Netlify URL after deploy
        "http://localhost:5173",
        "http://localhost:3000",
        "*",  # Remove this in production and set the specific domain above
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(companies.router)
app.include_router(savings.router)
app.include_router(economy.router)
app.include_router(documents.router)


@app.get("/")
async def root():
    return {"message": "Personal Dashboard API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
