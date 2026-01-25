# MANUAL DE USUARIO

## EndoNova - Sistema de Gestión Odontológica

**Fecha:** Enero 2026

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Acceso al Sistema](#3-acceso-al-sistema)
4. [Módulo de Autenticación](#4-módulo-de-autenticación)
5. [Panel Principal (Dashboard)](#5-panel-principal-dashboard)
6. [Gestión de Pacientes](#6-gestión-de-pacientes)
7. [Fichas Endodónticas](#7-fichas-endodónticas)
8. [Odontograma](#8-odontograma)
9. [Presupuestos y Pagos](#9-presupuestos-y-pagos)
10. [Preguntas Frecuentes](#10-preguntas-frecuentes)
11. [Soporte Técnico](#11-soporte-técnico)

---

## 1. Introducción

### 1.1 Propósito del Documento

Este manual proporciona instrucciones detalladas para el uso del sistema EndoNova, una aplicación web diseñada para la gestión integral de clínicas odontológicas especializadas en endodoncia.

### 1.2 Alcance del Sistema

EndoNova permite gestionar:

- Registro y administración de pacientes
- Fichas de diagnóstico y tratamiento endodóntico
- Odontograma interactivo con historial
- Control de presupuestos y pagos

### 1.3 Audiencia Objetivo

Este manual está dirigido a:

- Odontólogos y especialistas en endodoncia
- Personal administrativo de clínicas dentales
- Asistentes dentales

---

## 2. Requisitos del Sistema

### 2.1 Requisitos de Hardware

| Componente     | Requisito Mínimo | Recomendado       |
| -------------- | ----------------- | ----------------- |
| Procesador     | Dual Core 2.0 GHz | Quad Core 2.5 GHz |
| Memoria RAM    | 4 GB              | 8 GB              |
| Almacenamiento | 500 MB libres     | 1 GB libres       |
| Pantalla       | 1366 x 768 px     | 1920 x 1080 px    |

### 2.2 Requisitos de Software

| Software          | Versiones Compatibles                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| Sistema Operativo | Windows 10/11, macOS 10.15+, Linux                                     |
| Navegador Web     | Google Chrome 90+, Mozilla Firefox 90+, Microsoft Edge 90+, Safari 14+ |
| Conexión         | Internet estable                                                       |

### 2.3 Navegadores Recomendados

Para una experiencia óptima, se recomienda utilizar Google Chrome en su versión más reciente. El sistema es compatible con otros navegadores modernos, pero Chrome ofrece el mejor rendimiento.

---

## 3. Acceso al Sistema

### 3.1 URL de Acceso

Abra su navegador web e ingrese la siguiente dirección:

```
http://localhost:5173
```

**Nota:** La URL puede variar según la configuración de su instalación. Consulte con el administrador del sistema si la dirección anterior no funciona.

### 3.2 Pantalla de Inicio

Al acceder al sistema, se mostrará la pantalla de inicio de sesión. Si es su primera vez, deberá registrarse como usuario nuevo.

---

## 4. Módulo de Autenticación

### 4.1 Registro de Usuario Nuevo

Para crear una cuenta en el sistema:

1. En la pantalla de inicio, localice el enlace "Registrarse" o "Crear cuenta"
2. Complete el formulario con la siguiente información:
   - **Nombre completo:** Ingrese su nombre y apellido
   - **Correo electrónico:** Dirección de email válida (será su usuario)
   - **Contraseña:** Mínimo 6 caracteres
3. Haga clic en el botón "Registrarse"
4. Si el registro es exitoso, será redirigido a la pantalla de inicio de sesión

**Importante:** El correo electrónico debe ser único en el sistema. Si recibe un error indicando que el email ya existe, utilice otro correo o contacte al administrador.

### 4.2 Inicio de Sesión

Para acceder al sistema con una cuenta existente:

1. Ingrese su correo electrónico en el campo "Email"
2. Ingrese su contraseña en el campo "Contraseña"
3. Haga clic en el botón "Iniciar Sesión"
4. Si las credenciales son correctas, accederá al Panel Principal

### 4.3 Cierre de Sesión

Para salir del sistema de forma segura:

1. Localice el menú de usuario en la esquina superior derecha
2. Haga clic en "Cerrar Sesión"
3. Será redirigido a la pantalla de inicio de sesión

**Recomendación:** Siempre cierre sesión al terminar de usar el sistema, especialmente en computadoras compartidas.

---

## 5. Panel Principal (Dashboard)

### 5.1 Descripción General

El Dashboard es la pantalla principal del sistema. Proporciona un resumen visual de la información más relevante de la clínica.

### 5.2 Elementos del Dashboard

El panel principal muestra:

**Tarjetas de Estadísticas:**

- Total de pacientes registrados
- Número de fichas endodónticas
- Total cobrado (suma de todos los pagos)
- Saldo pendiente (presupuesto menos pagos)

**Gráfico de Progreso:**

- Indicador visual del porcentaje de cobro respecto al presupuesto total

**Tablas de Información Reciente:**

- Últimas fichas endodónticas creadas
- Últimos pagos registrados

### 5.3 Navegación Principal

Desde el Dashboard puede acceder a todos los módulos del sistema mediante el menú de navegación:

| Opción     | Descripción                                          |
| ----------- | ----------------------------------------------------- |
| Dashboard   | Pantalla principal con estadísticas                  |
| Pacientes   | Gestión de pacientes                                 |
| Fichas      | Fichas endodónticas (requiere seleccionar paciente)  |
| Odontograma | Estado dental (requiere seleccionar paciente)         |
| Pagos       | Presupuestos y cobros (requiere seleccionar paciente) |

---

## 6. Gestión de Pacientes

### 6.1 Listado de Pacientes

Al acceder al módulo de Pacientes, visualizará:

- Tarjetas con información de cada paciente
- Barra de búsqueda para filtrar pacientes
- Contador total de pacientes registrados
- Botón para agregar nuevo paciente

### 6.2 Registrar Nuevo Paciente

Para agregar un paciente al sistema:

1. Haga clic en el botón "Nuevo Paciente"
2. Complete el formulario con los datos requeridos:

| Campo               | Descripción                      | Obligatorio |
| ------------------- | --------------------------------- | ----------- |
| Cédula             | Número de identificación único | Sí         |
| Nombres             | Nombres del paciente              | Sí         |
| Apellidos           | Apellidos del paciente            | Sí         |
| Fecha de Nacimiento | Formato: DD/MM/AAAA               | Sí         |
| Teléfono           | Número de contacto               | No          |
| Email               | Correo electrónico               | No          |
| Dirección          | Dirección domiciliaria           | No          |

3. Haga clic en "Guardar"
4. El sistema validará los datos y creará el registro

**Validaciones:**

- La cédula debe ser única. Si ya existe un paciente con esa cédula, el sistema mostrará un error.
- Los campos obligatorios deben estar completos.

### 6.3 Editar Información del Paciente

Para modificar los datos de un paciente:

1. Localice al paciente en el listado
2. Haga clic en el botón de edición (icono de lápiz)
3. Modifique los campos necesarios
4. Haga clic en "Guardar" para confirmar los cambios

### 6.4 Eliminar Paciente

Para eliminar un paciente del sistema:

1. Localice al paciente en el listado
2. Haga clic en el botón de eliminación (icono de papelera)
3. Confirme la acción en el diálogo de confirmación

**Advertencia:** Esta acción eliminará permanentemente al paciente y toda su información asociada (fichas, odontogramas, pagos). Esta operación no se puede deshacer.

### 6.5 Buscar Pacientes

Utilice la barra de búsqueda para encontrar pacientes:

1. Escriba el nombre, apellido o cédula del paciente
2. El listado se filtrará automáticamente
3. Para ver todos los pacientes, borre el texto de búsqueda

### 6.6 Acciones Rápidas

Desde la tarjeta de cada paciente puede acceder directamente a:

- **Ficha:** Ver y gestionar fichas endodónticas del paciente
- **Odontograma:** Visualizar y editar el estado dental
- **Pagos:** Administrar presupuesto y registrar cobros

---

## 7. Fichas Endodónticas

### 7.1 Acceso al Módulo

Para acceder a las fichas endodónticas de un paciente:

1. Vaya al módulo de Pacientes
2. Localice al paciente deseado
3. Haga clic en el botón "Ficha"

### 7.2 Listado de Fichas

La pantalla muestra todas las fichas del paciente con:

- Número de pieza dental tratada
- Estado de la ficha (ABIERTA/CERRADA)
- Fecha de creación
- Diagnósticos registrados

### 7.3 Crear Nueva Ficha

Para registrar una nueva ficha endodóntica:

1. Haga clic en "Nueva Ficha"
2. Complete el formulario:

| Campo                   | Descripción                                                       |
| ----------------------- | ------------------------------------------------------------------ |
| Pieza Dental            | Seleccione el número de diente (1-32 permanentes, 51-85 deciduos) |
| Motivo de Consulta      | Descripción del motivo por el cual asiste el paciente             |
| Diagnóstico Pulpar     | Seleccione de la lista de opciones                                 |
| Diagnóstico Periapical | Seleccione de la lista de opciones                                 |
| Observaciones           | Notas adicionales del tratamiento                                  |

3. Haga clic en "Guardar"

### 7.4 Diagnósticos Pulpares Disponibles

| Diagnóstico                        | Descripción                              |
| ----------------------------------- | ----------------------------------------- |
| Normal                              | Pulpa vital sin patología                |
| Pulpitis Reversible                 | Inflamación leve, recuperable            |
| Pulpitis Irreversible Sintomática  | Inflamación severa con dolor             |
| Pulpitis Irreversible Asintomática | Inflamación severa sin dolor             |
| Necrosis Pulpar                     | Muerte del tejido pulpar                  |
| Previamente Tratado                 | Diente con tratamiento de conducto previo |
| Previamente Iniciado                | Tratamiento de conducto comenzado         |

### 7.5 Diagnósticos Periapicales Disponibles

| Diagnóstico                       | Descripción                          |
| ---------------------------------- | ------------------------------------- |
| Normal                             | Tejido periapical sano                |
| Periodontitis Apical Sintomática  | Inflamación con síntomas            |
| Periodontitis Apical Asintomática | Inflamación sin síntomas            |
| Absceso Apical Agudo               | Infección aguda con pus              |
| Absceso Apical Crónico            | Infección crónica con fístula      |
| Osteítis Condensante              | Reacción ósea a infección crónica |

### 7.6 Editar Ficha

Para modificar una ficha existente:

1. Localice la ficha en el listado
2. Haga clic sobre ella para seleccionarla
3. Modifique los campos necesarios
4. Haga clic en "Guardar"

### 7.7 Eliminar Ficha

Para eliminar una ficha:

1. Seleccione la ficha deseada
2. Haga clic en el botón "Eliminar"
3. Confirme la acción

---

## 8. Odontograma

### 8.1 Acceso al Módulo

Para acceder al odontograma de un paciente:

1. Vaya al módulo de Pacientes
2. Localice al paciente deseado
3. Haga clic en el botón "Odontograma"

### 8.2 Descripción de la Interfaz

El odontograma muestra una representación gráfica de todos los dientes:

**Dentición Permanente (adulto):**

- Cuadrante superior derecho: dientes 11-18
- Cuadrante superior izquierdo: dientes 21-28
- Cuadrante inferior izquierdo: dientes 31-38
- Cuadrante inferior derecho: dientes 41-48

**Dentición Decidua (temporal/infantil):**

- Cuadrante superior derecho: dientes 51-55
- Cuadrante superior izquierdo: dientes 61-65
- Cuadrante inferior izquierdo: dientes 71-75
- Cuadrante inferior derecho: dientes 81-85

### 8.3 Estados de los Dientes

Cada diente puede tener uno de los siguientes estados, identificados por colores:

| Estado        | Color    | Descripción                         |
| ------------- | -------- | ------------------------------------ |
| Sano          | Verde    | Diente sin patología                |
| Caries        | Rojo     | Presencia de caries dental           |
| Restauración | Azul     | Diente con restauración/obturación |
| Endodoncia    | Violeta  | Tratamiento de conducto realizado    |
| Ausente       | Gris     | Diente extraído o ausente           |
| Otro          | Amarillo | Otra condición                      |

### 8.4 Modificar Estado de un Diente

Para cambiar el estado de un diente:

1. Haga clic sobre el diente que desea modificar
2. Se abrirá un menú con las opciones de estado
3. Seleccione el nuevo estado
4. El diente cambiará de color automáticamente

### 8.5 Guardar Odontograma

Para guardar los cambios realizados:

1. Realice todas las modificaciones necesarias
2. Haga clic en el botón "Guardar"
3. El sistema creará un nuevo registro en el historial

**Importante:** Cada vez que guarda, se crea un nuevo registro histórico. Esto permite mantener un seguimiento de la evolución del estado dental del paciente.

### 8.6 Historial de Odontogramas

Para ver el historial de odontogramas:

1. Haga clic en el botón "Historial"
2. Se mostrará una lista con todos los odontogramas guardados
3. Cada registro muestra la fecha de creación
4. Seleccione un registro para ver el estado dental en esa fecha

### 8.7 Crear Nuevo Odontograma

Para iniciar un odontograma desde cero:

1. Haga clic en "Nuevo"
2. Todos los dientes se establecerán en estado "Sano"
3. Proceda a marcar los estados actuales

---

## 9. Presupuestos y Pagos

### 9.1 Acceso al Módulo

Para gestionar presupuestos y pagos de un paciente:

1. Vaya al módulo de Pacientes
2. Localice al paciente deseado
3. Haga clic en el botón "Pagos"

### 9.2 Resumen Financiero

En la parte superior se muestra un resumen:

| Indicador         | Descripción                                 |
| ----------------- | -------------------------------------------- |
| Total Presupuesto | Suma de todas las actividades presupuestadas |
| Total Pagado      | Suma de todos los pagos registrados          |
| Saldo Pendiente   | Diferencia entre presupuesto y pagos         |
| Barra de Progreso | Porcentaje visual de avance de pago          |

### 9.3 Gestión del Presupuesto

**Agregar Actividad al Presupuesto:**

1. En la sección "Presupuesto", haga clic en "Agregar"
2. Complete el formulario:

| Campo           | Descripción                      |
| --------------- | --------------------------------- |
| Actividad       | Seleccione el tipo de tratamiento |
| Precio Unitario | Costo por unidad                  |
| Cantidad        | Número de unidades               |

3. Haga clic en "Agregar"

**Actividades Disponibles:**

- Consulta
- Radiografía
- Endodoncia Unirradicular
- Endodoncia Birradicular
- Endodoncia Multirradicular
- Retratamiento
- Reconstrucción
- Otros

**Eliminar Actividad:**

1. Localice la actividad en el listado
2. Haga clic en el botón de eliminar
3. Confirme la acción

### 9.4 Registro de Pagos

**Registrar un Pago:**

1. En la sección "Pagos", haga clic en "Nuevo Pago"
2. Complete el formulario:

| Campo           | Descripción                            |
| --------------- | --------------------------------------- |
| Monto           | Cantidad a registrar                    |
| Método de Pago | Efectivo, Transferencia, Tarjeta u Otro |
| Observaciones   | Notas adicionales (opcional)            |

3. Haga clic en "Registrar Pago"

**Métodos de Pago Disponibles:**

| Método       | Descripción                  |
| ------------- | ----------------------------- |
| Efectivo      | Pago en efectivo              |
| Transferencia | Transferencia bancaria        |
| Tarjeta       | Tarjeta de crédito o débito |
| Otro          | Otros medios de pago          |

### 9.5 Historial de Pagos

El sistema mantiene un registro de todos los pagos realizados, mostrando:

- Fecha del pago
- Monto
- Método de pago
- Observaciones

---

## 10. Preguntas Frecuentes

### 10.1 Problemas de Acceso

**P: Olvidé mi contraseña, ¿qué hago?**

R: Contacte al administrador del sistema para restablecer su contraseña.

**P: El sistema me indica que mi sesión expiró.**

R: Por seguridad, la sesión expira después de un período de inactividad. Vuelva a iniciar sesión con sus credenciales.

### 10.2 Gestión de Pacientes

**P: ¿Puedo registrar dos pacientes con la misma cédula?**

R: No. La cédula es un identificador único. Si recibe un error de cédula duplicada, verifique que el paciente no esté ya registrado.

**P: ¿Qué sucede si elimino un paciente?**

R: Se elimina permanentemente toda la información del paciente, incluyendo fichas, odontogramas y pagos. Esta acción no se puede deshacer.

### 10.3 Fichas Endodónticas

**P: ¿Puedo tener varias fichas para el mismo paciente?**

R: Sí. Puede crear una ficha por cada pieza dental tratada.

**P: ¿Cuál es la diferencia entre estado ABIERTA y CERRADA?**

R: Una ficha ABIERTA indica un tratamiento en curso. Una ficha CERRADA indica un tratamiento finalizado.

### 10.4 Odontograma

**P: ¿Se guarda automáticamente el odontograma?**

R: No. Debe hacer clic en "Guardar" para registrar los cambios. Cada guardado crea un nuevo registro en el historial.

**P: ¿Puedo ver cómo estaba el odontograma en una fecha anterior?**

R: Sí. Utilice la función "Historial" para ver los estados dentales registrados anteriormente.

### 10.5 Pagos

**P: ¿Puedo eliminar un pago registrado?**

R: Consulte con el administrador del sistema. Por integridad de datos, la eliminación de pagos puede estar restringida.

**P: ¿Qué pasa si el paciente paga más del presupuesto?**

R: El sistema permite registrar pagos que excedan el presupuesto. El saldo pendiente mostrará un valor negativo (saldo a favor del paciente).

---

## 11. Soporte Técnico

### 11.1 Contacto

Para asistencia técnica, contacte al administrador del sistema o al equipo de soporte técnico de su institución.

### 11.2 Información para Reportar Problemas

Al reportar un problema, incluya:

1. Descripción detallada del problema
2. Pasos para reproducir el error
3. Mensaje de error mostrado (si aplica)
4. Navegador y versión utilizada
5. Fecha y hora del incidente

### 11.3 Recomendaciones Generales

- Mantenga su navegador actualizado
- Utilice una conexión a internet estable
- No comparta sus credenciales de acceso
- Cierre sesión al terminar de usar el sistema
- Realice respaldos periódicos de la información crítica

---

## Control de Documento

| Versión | Fecha      | Descripción                |
| -------- | ---------- | --------------------------- |
| 1.0      | Enero 2026 | Versión inicial del manual |

---

**EndoNova** - Sistema de Gestión Odontológica
