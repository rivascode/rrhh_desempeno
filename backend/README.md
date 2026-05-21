# Backend PHP

API simple con persistencia en `backend/data/records.json`.

## Endpoints

- `GET /api/index.php?action=health`
- `GET /api/index.php?action=records`
- `GET /api/index.php?action=summary`
- `POST /api/index.php?action=climate`
- `POST /api/index.php?action=performance`

## Ejecucion local

```powershell
php -S 127.0.0.1:8081 -t backend
```
