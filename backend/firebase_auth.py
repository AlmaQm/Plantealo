import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import Header, HTTPException

# Verificacion real del ID token de Firebase (JWT) en el backend: hasta el chat,
# ningun endpoint comprobaba que el usuario_id enviado por el cliente fuera
# realmente suyo. Requiere una clave de cuenta de servicio de Firebase
# (Firebase Console > Configuracion del proyecto > Cuentas de servicio).
#
# Dos formas de darsela al backend, en este orden de prioridad:
#   1. Variable de entorno FIREBASE_SERVICE_ACCOUNT_JSON (para despliegues:
#      Render u otro servicio no tiene el archivo local, nunca se sube a git).
#      Acepta el JSON en crudo o en base64 (recomendado: evita problemas con
#      saltos de linea en paneles de variables de entorno de una sola linea).
#   2. Archivo local backend/firebase-service-account.json (comodo en local;
#      nunca versionado, ver .gitignore).
_SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), "firebase-service-account.json")
_ENV_VAR = "FIREBASE_SERVICE_ACCOUNT_JSON"


def _cargar_credencial():
    en_entorno = os.getenv(_ENV_VAR)
    if en_entorno:
        contenido = en_entorno.strip()
        if not contenido.startswith("{"):
            try:
                contenido = base64.b64decode(contenido).decode("utf-8")
            except Exception:
                print(f"[firebase_auth] {_ENV_VAR} no es JSON valido ni base64 valido.")
                return None
        try:
            return credentials.Certificate(json.loads(contenido))
        except Exception as e:
            print(f"[firebase_auth] Error al leer la credencial de {_ENV_VAR}: {e}")
            return None

    if os.path.exists(_SERVICE_ACCOUNT_PATH):
        return credentials.Certificate(_SERVICE_ACCOUNT_PATH)

    return None


_cred = _cargar_credencial()
_app = firebase_admin.initialize_app(_cred) if _cred else None


def verificar_token(authorization: str = Header(...)) -> str:
    """Verifica el ID token de Firebase del header 'Authorization: Bearer <token>'.
    Devuelve el uid verificado (nunca el que mande el cliente en el body)."""
    if not _app:
        raise HTTPException(
            status_code=500,
            detail=(
                "Firebase Admin no esta configurado en el servidor "
                f"(falta la variable de entorno {_ENV_VAR} o el archivo firebase-service-account.json)."
            )
        )
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Falta el token de autenticacion.")

    token = authorization[len("Bearer "):].strip()
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido o caducado.")
