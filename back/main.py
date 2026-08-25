from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from coletas import router as coletas_router

import os 

app = FastAPI()

app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "../Frontend")), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(coletas_router)


class LoginRequest(BaseModel):
    usuario: str    
    senha: str

usuarios_db = {
    "visitante": "1234",
    "Gui Lindo": "GuiLindo"
}

@app.post("/login")
def login(request: LoginRequest):
    if request.usuario not in usuarios_db:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if usuarios_db[request.usuario] != request.senha:
        raise HTTPException(status_code=401, detail="Senha incorreta")

    return {
        "usuario": request.usuario,
        "status": "autenticado",
        "message": "Login realizado com sucesso!"
}

@app.get("/")
def serve_logar(): 
    return FileResponse("../Frontend/login.html")

@app.get("/monitor")
def serve_monitor():
    return FileResponse("../Frontend/monitor.html")