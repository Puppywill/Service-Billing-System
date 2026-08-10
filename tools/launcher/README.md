# Service Billing System Launcher

Launcher de Windows para abrir el Service Billing System con un clic durante demostraciones.

## Ejecutar

Desde la carpeta del proyecto:

```powershell
python tools\launcher\service_billing_launcher.py
```

El launcher:

- Inicia `npm start` desde la carpeta del proyecto.
- Espera a que `http://localhost:3000` responda.
- Abre el navegador predeterminado.
- Evita iniciar procesos duplicados si el sistema ya esta activo.
- Guarda logs tecnicos en `tools/launcher/logs/launcher.log`.

## Crear .exe con PyInstaller

Instalar PyInstaller:

```powershell
python -m pip install pyinstaller
```

Generar el ejecutable:

```powershell
pyinstaller --onefile --windowed --name ServiceBillingLauncher tools\launcher\service_billing_launcher.py
```

El `.exe` quedara en `dist\ServiceBillingLauncher.exe`.

## Notas

- Node.js y npm deben estar instalados.
- SQL Server y `ServiceBillingDB` deben estar disponibles para iniciar sesion y usar datos reales.
- El launcher no modifica la base de datos ni reemplaza el servidor Node/Express.
