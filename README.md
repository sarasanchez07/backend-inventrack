InvenTrack - Sistema de Gestión de Inventarios
Sistema de gestión de inventarios en tiempo real para organizaciones que manejan medicamentos, alimentos y diversos tipos de recursos.
________________________________________
 Descripción
InvenTrack es un sistema web desarrollado con Django que permite a organizaciones administrar múltiples inventarios, controlar el stock en tiempo real, registrar movimientos de entrada y salida, y generar reportes detallados con alertas automáticas de stock bajo y productos próximos a vencer.
Características principales
•	 Sistema de roles y permisos (Administrador, Maestro, Jefe, Estudiante)
•	 Gestión multi-inventario (Medicamentos, Alimentos, Herramientas, etc.)
•	 Control de movimientos (Entradas y salidas con trazabilidad completa)
•	 Reportes y exportaciones (CSV, Excel, PDF)
•	 Alertas automáticas (Stock bajo, productos próximos a vencer)
•	 Configuración dinámica por inventario (unidades, presentaciones, campos)
•	 Interfaz responsive (adaptable a dispositivos móviles)
•	 Dashboards con KPIs en tiempo real
________________________________________
Arquitectura del Sistema
Niveles de acceso
Nivel 1 - Inventario General (Administrador)
•	Vista panorámica de todos los inventarios
•	Gestión de personal y asignación de permisos
•	Reportes globales y auditoría de movimientos
•	Configuración de inventarios
Nivel 2 - Inventario Específico (Administrador y Personal)
•	Operaciones sobre un inventario asignado
•	Registro de productos y movimientos
•	Reportes por inventario
Estructura de módulos
apps/
├── authentication/      # Autenticación y sesiones
├── personnel/          # Gestión de personal
├── inventory/          # Inventarios y configuración
├── categories/         # Categorías de productos
├── products/           # Productos
├── movements/          # Movimientos (entradas/salidas)
├── reports/            # Reportes y exportaciones
├── alerts/             # Sistema de alertas
└── dashboard/          # Dashboards y KPIs
________________________________________
Instalación
Prerrequisitos
•	Python 3.10 o superior
•	pip
•	virtualenv (recomendado)
•	PostgreSQL 14+ (o SQLite para desarrollo)
1. Clonar el repositorio
git clone https://github.com/tu-usuario/inventrack.git
cd inventrack
2. Crear entorno virtual
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
3. Instalar dependencias
pip install -r requirements.txt
4. Configurar variables de entorno
Crea un archivo .env en la raíz del proyecto:
# Django
SECRET_KEY=tu-secret-key-super-segura-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos (PostgreSQL)
DB_NAME=inventrack_db
DB_USER=postgres
DB_PASSWORD=tu-password
DB_HOST=localhost
DB_PORT=5432

# Email (opcional - para recuperación de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-password-de-app

# Celery (opcional - para alertas automáticas)
CELERY_BROKER_URL=redis://localhost:6379/0
5. Aplicar migraciones
python manage.py makemigrations
python manage.py migrate
6. Crear superusuario
python manage.py createsuperuser
7. Cargar datos iniciales (opcional)
python manage.py loaddata initial_data.json
8. Ejecutar servidor de desarrollo
python manage.py runserver
Accede a: http://localhost:8000
________________________________________
Estructura del Proyecto
inventrack_project/
│
├── inventrack/                     # Configuración principal
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── apps/                           # Aplicaciones del sistema
│   ├── authentication/
│   ├── personnel/
│   ├── inventory/
│   ├── categories/
│   ├── products/
│   ├── movements/
│   ├── reports/
│   ├── alerts/
│   └── dashboard/
│
├── static/                         # Archivos estáticos (CSS, JS, imágenes)
│   ├── css/
│   ├── js/
│   └── img/
│
├── templates/                      # Templates HTML base
│   ├── base.html
│   ├── navbar.html
│   └── footer.html
│
├── media/                          # Archivos subidos
│
├── docs/                           # Documentación
│   ├── manual_usuario.md
│   ├── manual_tecnico.md
│   └── diagramas/
│
├── tests/                          # Tests
│
├── .env                            # Variables de entorno (no subir a git)
├── .gitignore
├── requirements.txt
├── manage.py
└── README.md
________________________________________
Configuración Avanzada
Configurar PostgreSQL (Producción)
1.	Instalar PostgreSQL
2.	Crear base de datos:
CREATE DATABASE inventrack_db;
CREATE USER inventrack_user WITH PASSWORD 'tu_password';
ALTER ROLE inventrack_user SET client_encoding TO 'utf8';
ALTER ROLE inventrack_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE inventrack_user SET timezone TO 'America/Bogota';
GRANT ALL PRIVILEGES ON DATABASE inventrack_db TO inventrack_user;
3.	Actualizar .env con las credenciales
Configurar Celery (Alertas automáticas)
1.	Instalar Redis:
# Ubuntu/Debian
sudo apt-get install redis-server

# Windows (usar WSL o Docker)
2.	Ejecutar worker de Celery:
celery -A inventrack worker --loglevel=info
3.	Ejecutar beat (tareas programadas):
celery -A inventrack beat --loglevel=info
________________________________________
Testing
# Ejecutar todos los tests
python manage.py test

# Ejecutar tests de una app específica
python manage.py test apps.products

# Ejecutar tests con coverage
coverage run --source='.' manage.py test
coverage report
coverage html
________________________________________
Base de Datos
Modelo de datos principal
•	User: Usuarios del sistema con roles
•	Inventario: Inventarios (Medicamentos, Alimentos, etc.)
•	UnidadBase: Unidades de medida permitidas
•	Presentacion: Presentaciones de productos
•	Categoria: Categorías de productos
•	Producto: Productos con stock y configuración
•	Movimiento: Entradas y salidas de productos
•	Alerta: Alertas automáticas del sistema
________________________________________
🚢 Despliegue
Producción con Gunicorn + Nginx
1.	Instalar Gunicorn:
pip install gunicorn
2.	Configurar Gunicorn:
gunicorn inventrack.wsgi:application --bind 0.0.0.0:8000
3.	Configurar Nginx como proxy inverso
4.	Configurar supervisor para mantener el proceso activo
Ver guía completa: docs/despliegue.md________________________________________
Contribuir
Las contribuciones son bienvenidas. Por favor:
1.	Fork el proyecto
2.	Crea una rama para tu feature (git checkout -b feature/AmazingFeature)
3.	Commit tus cambios (git commit -m 'Add some AmazingFeature')
4.	Push a la rama (git push origin feature/AmazingFeature)
5.	Abre un Pull Request
________________________________________
Equipo
Desarrollador: Sara Valentina Sánchez Estrada
Área: Modelación y Arquitectura de Datos
Docente Asesor: Diana María Melo Taborda
Tutor Empresarial: Gustavo Adolfo Gutiérrez
Organización: Fundación Manos Unidas De Dios
