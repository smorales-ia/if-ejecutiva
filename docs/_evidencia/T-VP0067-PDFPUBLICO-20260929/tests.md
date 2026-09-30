# TESTS — T-VP0067-PDFPUBLICO-20260929

| Test (plan §4) | Resultado |
|---|---|
| (b) ingreso_liquido_anual = 36.300.000 tras PATCH de fuentes | **PASS** — respuesta del PATCH y GET: arriendo 3.300.000 · gasto 3.300.000 · fórmula 36.300.000 (= XLSM Portada!BJ43; renta perpetua 806.666.667 ya cuadraba en TX_Calculos) |
| (a) share-link abre sin login | **NO EJECUTADO** — pieza E3 detenida en Gate: conexión Dropbox 7553318 sin `sharing.write` (scopesCnt=4, doble verificación por GET /connections tras el Reauthorize). El link actual sigue siendo /home?preview= (302→login), igual que en la tanda anterior |
| (c) botón usa link público | **NO EJECUTADO** — depende de (a) |
| (d) una sola versión vigente | **PASS** (estado heredado verificado: recYasPnZWAAoA3pW doc_id 9 única es_vigente=true; esta tanda no tocó DocGen) |
