from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Banco em memória (pode virar SQLite depois)
coletas = []

class Coleta(BaseModel):
    id: int
    cliente: str
    transportadora: str | None = None
    obs: str | None = None
    dia: str
    data: str
    inicio: str
    fim: str

@router.post("/coletas")
def adicionar_coleta(coleta: Coleta):
    coletas.append(coleta.dict())
    return {"message": "Coleta adicionada com sucesso!"}

@router.get("/coletas")
def listar_coletas():
    return coletas
