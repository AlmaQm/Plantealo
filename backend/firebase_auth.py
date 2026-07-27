import os
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import Header, HTTPException

# Verificacion real del ID token de Firebase (JWT) en el backend: hasta el chat,
# ningun endpoint comprobaba que el usuario_id enviado por el cliente fuera
# realmente suyo. Requiere una clave de cuenta de servicio descargada desde
# Firebase Console (Configuracion del proyecto > Cuentas de servicio), guardada
# en backend/firebase-service-account.json (nunca versionada, ver .gitignore).
_SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), "firebase-service-account.json")

_app = None
if os.path.exists(_SERVICE_ACCOUNT_PATH):
    _cred = credentials.Certificate(_SERVICE_ACCOUNT_PATH)
    _app = firebase_admin.initialize_app(_cred)


def verificar_token(authorization: str = Header(...)) -> str:
    """Verifica el ID token de Firebase del header 'Authorization: Bearer <token>'.
    Devuelve el uid verificado (nunca el que mande el cliente en el body)."""
    if not _app:
        raise HTTPException(
            status_code=500,
            detail="Firebase Admin no esta configurado en el servidor (falta firebase-service-account.json)."
        )
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Falta el token de autenticacion.")

    token = authorization[len("Bearer "):].strip()
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido o caducado.")
