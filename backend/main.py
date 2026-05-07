from fastapi import FastAPI
from database import engine, Base
import models
import time

app = FastAPI(title='Plantealo Backend')

@app.on_event('startup')
def on_startup():
    for _ in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except Exception:
            time.sleep(1)
    else:
        raise RuntimeError('No se pudo conectar a la base de datos PostgreSQL')

@app.get('/')
def read_root():
    return {'message': 'Plantealo backend is running'}