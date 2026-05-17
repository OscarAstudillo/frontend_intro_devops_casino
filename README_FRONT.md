# VidalCasino - Backend API & Database (Módulo DevOps)

Este repositorio contiene la API REST encargada de la lógica de negocio desarrollada en Node.js (Express) y el motor de almacenamiento relacional en PostgreSQL 16 para la plataforma **VidalCasino**. Está diseñado estructuralmente para operar de manera aislada dentro de una subred privada en AWS, garantizando la seguridad de los datos.

## 🔒 Arquitectura de Red y Seguridad
* **Entorno de Red:** Subred Privada (`10.0.20.0/24`), completamente aislada y sin exposición directa a Internet.
* **Aislamiento Perimetral (Security Groups):** El cortafuegos de AWS (`sg-casino-backend`) deniega cualquier acceso desde el exterior. Solo acepta peticiones en el puerto `3000` (API) y `5432` (Base de Datos) que provengan estrictamente del Grupo de Seguridad asignado al Frontend (`sg-casino-frontend`).
* **Acceso de Despliegue:** GitHub Actions realiza un túnel SSH seguro utilizando la instancia pública del Frontend como punto de entrada (*Bastion Host*) para poder inyectar y actualizar los contenedores en la subred privada.

---

## 💻 Cómo Levantar Localmente

Para desplegar el ecosistema del servidor con persistencia local en tu estación de trabajo:

1. **Construir la imagen local con arquitectura limpia:**
   ```bash
   docker build -t casino-backend:v1.0.0 .

   Asegurar la configuración del archivo unificado: Verifique que el archivo docker-compose.yml se encuentre en la raíz del proyecto para orquestar los servicios.

Ejecutar el comando de inicio del stack:

Bash
docker compose up -d
Verificar el estado saludable de los contenedores:

Bash
docker compose ps
🚀 Cómo Desplegar
El ciclo de despliegue en la infraestructura Cloud de AWS está completamente automatizado:

Todo el desarrollo de Dockerfiles, scripts de inicialización y configuraciones de red se realizan en la rama obligatoria dev.

Una vez que el código se encuentra estable, se realiza un merge hacia la rama deploy.

El comando git push origin deploy activa el pipeline automatizado de GitHub Actions.

El pipeline ejecuta de manera secuencial las fases de Build (compilación multi-stage basada en node:20-alpine), Push (subida a Amazon ECR con etiquetas simultáneas vX.Y.Z, latest y el SHA del commit) y Deploy (conexión SSH para actualizar los contenedores de la subred privada).

🔑 Variables de Entorno
De acuerdo con las buenas prácticas de seguridad y control de configuraciones, este repositorio no incluye archivos .env reales con claves explícitas en el control de versiones. Las credenciales se inyectan en caliente a través de secretos de GitHub en el pipeline:

DB_HOST: Dirección IP privada asignada a la base de datos dentro de la VPC (10.0.20.59).

DB_USER: Nombre del usuario administrador del motor relacional (casino_user).

DB_PASSWORD: Contraseña secreta para establecer la conexión de datos de forma segura.

DB_NAME: Identificador de la base de datos operativa encargada del casino (casino_db).

JWT_SECRET: Semilla criptográfica de alta seguridad utilizada para la firma de los JSON Web Tokens de sesión de los clientes.

🔧 Comandos Útiles
Comprobar la ejecución segura sin privilegios de Root:

Bash
docker exec casino_backend whoami
Respuesta esperada: node (Garantiza el cumplimiento de seguridad ejecutándose bajo el usuario restringido).

Monitorear los logs de conexión con Postgres en tiempo real:

Bash
docker logs casino_backend --tail 50 -f
Acceder por CLI directo a la Base de Datos interna en producción:

Bash
docker exec -it casino_db psql -U casino_user -d casino_db
🚨 Troubleshooting (Resolución de Problemas)
Error ECONNREFUSED en los logs de la API:

Causa: El contenedor del backend arrancó antes de que el motor de PostgreSQL terminara de inicializar sus procesos internos o ejecutar el script de semillas init.sql.

Solución: Conéctese a la EC2 del backend, valide con docker ps que el contenedor casino_db se encuentre en estado saludable. Si está activo, realice un comando de reinicio manual con docker restart casino_backend para forzar la reconexión de la API.

Fallo en la publicación de imágenes (ECR Login Error):

Causa: Los tokens de acceso y llaves de sesión temporales provistas por AWS Academy (Learner Lab) expiraron debido al límite estricto de las 4 horas de la ventana del laboratorio.

Solución: Inicie sesión nuevamente en AWS Academy, copie las credenciales vigentes desde el panel AWS Details y actualice los secretos correspondientes en la configuración del repositorio en GitHub.

📂 Estructura y Estándares del Repositorio
Persistencia por Volúmenes: La base de datos utiliza un volumen nombrado (Named Volume) mapeado hacia /var/lib/postgresql/data para garantizar que la información de saldos, transacciones e historial sobreviva a reinicios y rotaciones de infraestructura.

Uso de .dockerignore: Este repositorio cuenta con un archivo .dockerignore configurado rigurosamente para prevenir el envío accidental de carpetas locales pesadas como node_modules o archivos .env al contexto de construcción de las imágenes de Docker.

Estándar de Mensajes de Commit: Se prohíbe el uso de mensajes genéricos. Todos los cambios deben seguir la convención de prefijos técnicos descriptivos:

feat: Incorporación de nuevas funciones o lógica.

fix: Resolución de errores o fallos en el código.

docs: Cambios o mejoras en la documentación del repositorio (como este README).

ci: Ajustes o configuraciones de los workflows de automatización en GitHub Actions.