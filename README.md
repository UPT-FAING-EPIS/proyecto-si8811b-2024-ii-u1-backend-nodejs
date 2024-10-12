[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=15707566)
# Proyecto de Sincronización de Intranet UPT

## Descripción
Este proyecto es una aplicación de Node.js que utiliza **Express** y **Puppeteer** para sincronizar datos desde la intranet de la Universidad Privada de Tacna (UPT). La aplicación permite a los usuarios obtener información importante, como las asistencias y los créditos acumulados, de manera automatizada y eficiente.

Además de la sincronización de datos, se ha implementado **Nodemailer**, una herramienta poderosa para el envío de correos electrónicos. Esta funcionalidad permite a los usuarios recibir correos electrónicos de confirmación de cuenta y restablecimiento de contraseña, lo que mejora la seguridad y la experiencia del usuario.

## Características Principales
- **Sincronización de Datos**: Acceso a la intranet de UPT para extraer datos relevantes de los usuarios y almacenarlos en MongoDB.
- **Gestión de Cuentas**: Creación de cuentas y envío de correos electrónicos de confirmación.
- **Restablecimiento de Contraseña**: Solicitud de restablecimiento de contraseña mediante un enlace y un token.
- **API REST**: Interfaz de API REST para facilitar la comunicación entre el cliente y el servidor.

## Desacripcion del proceso de sincronización
- Autenticación: Se realiza el inicio de sesión en el sistema externo utilizando las credenciales del usuario. Esto se gestiona mediante una simulación del ingreso a través de un navegador automatizado que maneja el captcha y otras validaciones de seguridad.
- Sincronización de Horario: Una vez autenticado, el sistema recupera el horario del usuario. Los datos extraídos se estructuran para garantizar que estén correctamente formateados y luego se almacenan en nuestra base de datos, lo que permite un acceso rápido y eficiente desde nuestra aplicación.
- Sincronización de Asistencias: Similar al horario, el sistema también obtiene la información de asistencias del usuario desde el sistema externo. Estos datos se procesan y guardan, proporcionando un historial completo de la asistencia del usuario a sus clases.
- Manejo de Errores: Durante todo el proceso, se implementan verificaciones y registros para identificar posibles errores, como problemas de autenticación, fallos en la extracción de datos, o dificultades en la conexión con el sistema universitario. En caso de fallas, se notifican adecuadamente al usuario para que pueda tomar acción.
- Seguridad y Sesiones: Para proteger la información del usuario, se maneja de forma segura el manejo de tokens y cookies durante el proceso de sincronización. Esto asegura que los datos sean transmitidos y almacenados de manera segura durante todo el flujo.



## Rutas API
### Autenticación
- **POST** `/api/v1/auth/create-account`: Crear una cuenta.
 ```mermaid
sequenceDiagram
    participant C as Cliente
    participant AR as AuthRoutes
    participant AC as AuthController
    participant U as User Model
    participant T as Token Model
    participant E as Email Service

    C->>AR: POST /api/v1/auth/create-account
    AR->>AC: createAccount()
    AC->>U: findOne({email})
    U-->>AC: userExists
    alt userExists
        AC-->>AR: 409 Usuario ya registrado
        AR-->>C: 409 Usuario ya registrado
    else !userExists
        AC->>AC: hashPassword()
        AC->>U: new User()
        AC->>T: new Token()
        AC->>E: sendConfirmationEmail()
        AC->>U: save()
        AC->>T: save()
        AC-->>AR: 200 Cuenta creada
        AR-->>C: 200 Cuenta creada
    end
```
- **POST** `/api/v1/auth/login`: Iniciar sesión.
```mermaid
sequenceDiagram
    participant C as Cliente
    participant AR as AuthRoutes
    participant AC as AuthController
    participant U as User Model
    participant T as Token Model
    participant E as Email Service

    C->>AR: POST /api/v1/auth/login
    AR->>AC: login()
    AC->>U: findOne({email})
    U-->>AC: user
    alt !user
        AC-->>AR: 404 Usuario no encontrado
        AR-->>C: 404 Usuario no encontrado
    else user
        alt !user.confirmed
            AC->>T: new Token()
            AC->>T: save()
            AC->>E: sendConfirmationEmail()
            AC-->>AR: 401 Cuenta sin confirmar
            AR-->>C: 401 Cuenta sin confirmar
        else user.confirmed
            AC->>AC: checkPassword()
            alt password incorrect
                AC-->>AR: 401 Password incorrecto
                AR-->>C: 401 Password incorrecto
            else password correct
                AC->>AC: generateJWT()
                AC-->>AR: 200 token
                AR-->>C: 200 token
            end
        end
    end
```  
- **POST** `/api/v1/auth/request-code`: Solicitar código de confirmación.
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant AuthController
    participant User
    participant Token
    participant EmailService

    Client->>Server: POST /api/v1/auth/request-code
    Server->>AuthController: requestConfirmationCode()
    AuthController->>User: Find user by email
    User-->>AuthController: User found
    AuthController->>Token: Generate and save token
    AuthController->>EmailService: Send confirmation code email
    EmailService-->>AuthController: Email sent
    AuthController-->>Client: Response (200 OK)

```
- **POST** `/api/v1/auth/forgot-password`: Solicitar restablecimiento de contraseña.
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant AuthController
    participant User
    participant Token
    participant EmailService

    Client->>Server: POST /api/v1/auth/forgot-password
    Server->>AuthController: forgotPassword()
    AuthController->>User: Find user by email
    User-->>AuthController: User found
    AuthController->>Token: Generate and save token
    AuthController->>EmailService: Send password reset email
    EmailService-->>AuthController: Email sent
    AuthController-->>Client: Response (200 OK)

```
- **POST** `/api/v1/auth/validate-token`: Validar token de restablecimiento de contraseña.
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant AuthController
    participant Token

    Client->>Server: POST /api/v1/auth/validate-token
    Server->>AuthController: validateToken()
    AuthController->>Token: Find token
    Token-->>AuthController: Token validated
    AuthController-->>Client: Response (200 OK)

```
- **POST** `/api/v1/auth/update-password/{token}`: Actualizar contraseña con token.
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant AuthController
    participant Token
    participant User

    Client->>Server: POST /api/v1/auth/update-password/{token}
    Server->>AuthController: updatePasswordWithToken()
    AuthController->>Token: Find token
    Token-->>AuthController: Token validated
    AuthController->>User: Update user password
    User-->>AuthController: Password updated
    AuthController->>Token: Delete token
    AuthController-->>Client: Response (200 OK)

```
- **GET** `/api/v1/auth/user`: Obtener datos del usuario autenticado.
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant AuthController
    participant User

    Client->>Server: GET /api/v1/auth/user
    Server->>AuthController: user()
    AuthController->>User: Retrieve authenticated user data
    User-->>AuthController: User data
    AuthController-->>Client: Response (200 OK) with user data

```

### Sincronización
- **POST** `/api/v1/sync/data`: Sincronizar datos del usuario.
```mermaid
sequenceDiagram
    participant C as Cliente
    participant SR as SyncRoutes
    participant SC as SyncController
    participant IS as IntranetSync

    C->>SR: POST /api/v1/sync/data
    SR->>SC: syncUserData()
    SC->>IS: autenticar(codigo, contrasena)
    IS-->>SC: result
    alt result
        SC-->>SR: 200 Sincronización exitosa
        SR-->>C: 200 Sincronización exitosa (cookies, currentURL)
    else !result
        SC-->>SR: 401 Error en la autenticación
        SR-->>C: 401 Error en la autenticación
    end
```
- **POST** `/api/v1/sync/schedule`: Sincronizar el horario del usuario.
```mermaid
sequenceDiagram
    participant C as Cliente
    participant SR as SyncRoutes
    participant SC as SyncController
    participant IS as IntranetSync
    participant S as Schedule Model

    C->>SR: POST /api/v1/sync/schedule
    SR->>SC: syncUserSchedule()
    SC->>IS: autenticarYExtraerHorario(codigo, contrasena)
    IS-->>SC: result
    alt result && result.horarios
        SC->>SC: processScheduleData()
        SC->>S: new Schedule()
        SC->>S: save()
        SC-->>SR: 200 Sincronización de horario exitosa
        SR-->>C: 200 Sincronización de horario exitosa (scheduleData)
    else !result || !result.horarios
        SC-->>SR: 401 Error en la sincronización del horario
        SR-->>C: 401 Error en la sincronización del horario
    end
```
- **POST** `/api/v1/sync/attendance`: Sincronizar y obtener las asistencias del usuario.
```mermaid
sequenceDiagram
    participant C as Cliente
    participant SR as SyncRoutes
    participant SC as SyncController
    participant IS as IntranetSync
    participant A as Attendance Model

    C->>SR: POST /api/v1/sync/attendance
    SR->>SC: syncUserAttendance()
    SC->>IS: autenticarYExtraerAsistencias(codigo, contrasena)
    IS-->>SC: result
    alt result && result.asistencias
        SC->>A: new Attendance()
        SC->>A: save()
        SC-->>SR: 200 Sincronización de asistencias exitosa
        SR-->>C: 200 Sincronización de asistencias exitosa (attendanceData)
    else !result || !result.asistencias
        SC-->>SR: 401 Error en la sincronización de asistencias
        SR-->>C: 401 Error en la sincronización de asistencias
    end
```
- **POST** `/api/v1/sync/credits`: Sincronizar y obtener los créditos acumulados del usuario.
```mermaid

```

## Instalación

Para instalar y ejecutar el proyecto, sigue estos pasos:

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/UPT-FAING-EPIS/proyecto-si8811b-2024-ii-u1-backend-nodejs.git
   cd nombre-del-repositorio
2. **Ejecutar**:
   ```bash
    npm install
    npm run dev:api