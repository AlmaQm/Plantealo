from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Sustituye con tu URI de Aiven
SQLALCHEMY_DATABASE_URL = "postgres://avnadmin:<redacted>@pg-26016a8d-almaquesadamartinez-07f6.a.aivencloud.com:14955/defaultdb?sslmode=require"

# El engine es el encargado de la conexión física
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# La sesión es lo que usaremos para hacer consultas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para crear nuestros modelos (tablas)
Base = declarative_base()