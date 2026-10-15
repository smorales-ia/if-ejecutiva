# PRD · Sección E del tasador precargada («Niveles · Terminaciones · Comodidades»)

> Documento de trabajo, no normativo. Preparado el 15-oct-2026 con un panel de tres especialistas
> en solo lectura (planilla del cliente, código de la app, lectura de documentos RF-09). La fuente
> normativa sigue siendo `docs/_md/VProperty_Especificacion_Proyecto_v1_9_18.md` (§2.8, §2.8.1,
> RF-TAS-23). **Nada de esto está aplicado.**

## 1 · Pedido

Sergio (15-oct-2026): que la sección E llegue lista al tasador con lo que se pueda obtener de los
documentos, para que revise, modifique o complete; guardado idempotente, el mismo valor en todos los
lugares donde se guarde, y siempre el dato más actualizado. La planilla del cliente se usa **solo
como insumo de análisis**: la solución debe servir a cualquier tasación y cualquier cliente.

## 2 · Diagnóstico

### 2.1 Hoy la sección E casi no se guarda

| Sub | Qué pasa hoy al «Calcular Tasación» |
|---|---|
| E.1 Ampliaciones | Se guardan m², descripción y **solo el año** de recepción. `nPe` sin columna; clave por posición (borrar una mueve las otras) |
| E.2 Habitaciones | Se guardan conteos > 0 en `TX_HabitacionesPorNivel`. Walk-in va como «Otro». Faltan Hall, D. servicio, ½ baño, Baño servicio y Otros |
| E.3 Terminaciones | Se guardan pavimento, muros y cielo (formato largo). **Se pierden** material/marca, iluminación y estado |
| E.4 Elementos constructivos | **No se guardan** (6 campos en `CAMPOS_SIN_DESTINO`) |
| E.5 Comodidades | **No se guardan** (no existe tabla destino) |
| E.6 Detalles | **Se pierden en silencio** (7 campos: ni siquiera figuran como no persistidos) |

Ningún atributo de lectura de documentos (`D_TipoDocumentoAtributo`) apunta a la sección E. El motor
AT03 no la usa. El PDF imprime habitaciones, ampliaciones y terminaciones parciales; las
características constructivas y comodidades salen `null` (hueco P1-1).

### 2.2 El modelo de la app no calza con el del cliente

La estructura de la planilla es **idéntica en los 7 libros revisados** (MET-6283, plantilla Enero
2026 y 5 tasaciones), así que es el modelo de VProperty para todos sus clientes:

| Bloque | Planilla del cliente (`Antecedentes!B20:BP50`) | App hoy |
|---|---|---|
| Habitaciones | 4 niveles × 14 tipos: Comedor, Living, Estar, Hall, Suite, D. Simple, D. Serv, Cocina, Escritorio, Baños, ½ Baño, Bñ Serv, Loggia, Otros | 10 tipos con Walk-in (que la planilla no tiene); faltan 5 |
| Terminaciones | 5 recintos fijos (Estar, Dormitorios, Circulación, Cocina, Baños) × pavimento, material/marca, muros, cielo, iluminación, estado — catálogos cerrados | recintos libres, 3 de 6 columnas guardadas |
| Elementos | 8 fundamentales + 8 «otros», cada uno con materialidad · calidad · estado; catálogos cerrados (estructura 36, cubierta 19, ventanas 11…) | 6 textos libres + 7 detalles sueltos |
| Comodidades | Matriz 4×4 SI/NO (incluye Muebles de cocina, Comedor de diario, Patio de servicio, Estacionamiento, Bodega) | 14 switches distintos (Quincho, Aire acond., Bodega extra… que la planilla trata como obras complementarias u «otros») |

### 2.3 De dónde puede salir cada dato

| Clase | Campos | Fuente |
|---|---|---|
| **Default por regla** (la mayoría) | Divisiones, cubierta (depto: FE GALVANIZADO; casa: PLANCHA METALICA), revestimiento exterior, cierros, sanitarios, grifería, closet, puerta, cielo, iluminación, calidad; estados = f(estado de uso); entrepisos = f(tipo, pisos); material/marca = f(pavimento); **estructura = materialidad del piso 1 del cuadro C** (depto: HORMIGON ARMADO); estacionamiento/bodega = f(OO.CC. de la solicitud); m² por nivel y totales = f(superficies + ampliaciones) | `C_DefaultsAntecedentes` (212 filas ya sembradas, **sin lector**) + reglas de la planilla |
| **Documento** | Conteos de recintos (plano de arquitectura, por rótulo); N° de pisos y tipo de obra (permiso); ampliaciones (permiso/recepción de ampliación, líneas SII); piscina/quincho como indicio (OO.CC. del SII) | RF-09 con atributos nuevos |
| **Tasador en terreno** | Suites/walk-in, pavimento y muros de estar/dormitorios, muebles de cocina, ventanas, comodidades no dibujadas, estado cuando no es BUENO, narrativo | Formulario (con el default como punto de partida) |

## 3 · Propuesta por fases

| Fase | Contenido | Requiere aprobación | Valor |
|---|---|---|---|
| **E-1 · Persistir** | Alinear el modelo de E al del cliente (14 tipos de recinto, 5 recintos × 6 columnas, 16 elementos × materialidad/calidad/estado, 16 comodidades) y darle destino en Airtable: columnas/tablas nuevas y `origen_dato` en las hijas. Corregir los 7 descartes silenciosos, la clave por posición de ampliaciones y la protección de borradores (`recuperarBorrador` por colección) | Sí: schema de Airtable | Sin esto, ninguna precarga sobrevive al guardado |
| **E-2 · Defaults por regla** | Resolver en servidor la sección E desde `C_DefaultsAntecedentes` + reglas (tipo × estado de uso, pisos, cuadro C, OO.CC.), solo donde no haya dato guardado, con badge «Pre-llenado · editable». Implementa RF-TAS-23 | Ampliar `C_DefaultsAntecedentes` si faltan filas | La mayor parte de E llega lista |
| **E-3 · Documentos** | Plano de arquitectura → conteos por tipo de recinto (AT03-Ext con varias filas por solicitud y clave estable `codigo|nivel|tipo`); permiso → pisos/tipo de obra/ampliación; consolidación con `prioridad_destino` y vigencia (mismo mecanismo de superficies y sección F) | Sí: atributos de lectura, prompt de SC-RF09 (Make), AT03-Ext v7 | Conteos y ampliaciones sin tipear |

Reglas transversales (las mismas de superficies y sección F): un solo escritor por dato, idempotente
(re-leer no cambia nada), no pisa lo que el tasador guardó (`origen_dato=tipeado`), gana el dato más
reciente y, en empate, la prioridad del documento.

## 4 · Correcciones a la guía de la réplica MET-6283 (detectadas por el panel)

- E.2: la planilla no tiene Walk-in; tiene Hall 1, D. Serv 1, ½ Baño 1 y Baño Serv 1 (total 16
  recintos, 4 dormitorios, 4 baños). Con los contadores actuales de la app la suma da 13.
- E.3: el recinto es «Estar», no «Living»; en esa fila la guía invierte muros (ESMALTE) y cielo
  (ENLUCIDO / PINTURA); falta iluminación BUENA.
- E.4: ventanas es un solo valor del catálogo («PVC TERMOPANEL»); closet es un material
  (MELAMINA); rejas es una comodidad; falta aire acondicionado (RADIADOR MURAL).
- E.5: Quincho no es comodidad (va en obras complementarias y en el cuadro C).

## 5 · Preguntas para Sergio

1. ¿Se alinea la sección E al modelo de la planilla del cliente (E-1), aunque cambie lo que hoy ve el
   tasador (p. ej. sale Walk-in, entran Hall/½ baño/servicio; comodidades distintas)?
2. ¿Orden E-1 → E-2 → E-3, desplegando cada fase por separado?
3. ¿Dónde se implementa: en una sesión aparte (recomendado, para no mezclarlo con la réplica)?
