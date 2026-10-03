# Rollback — T-GOLIVE-V5-PROD-20261001

Estado ORIGINAL antes del go-live (Bloque 0).

## E2 (scenario 5750023 · E2_Carbone_Render v2.2)
- templateId VIEJO (módulo http id=2, URL render): `31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32`
- templateId NUEVO (v5): `f6d1f2b01517d7bedd953e6e295782114344f3d88c3c79e0b1116c428d5a786f`
- isActive original: true
- Revertir: PATCH blueprint de 5750023 cambiando el templateId de la URL de render de v5 → viejo.

## .env.local
- CARBONE_TEMPLATE_ID viejo: `31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32`
- CARBONE_TEMPLATE_ID nuevo: `f6d1f2b01517d7bedd953e6e295782114344f3d88c3c79e0b1116c428d5a786f`
- Revertir: `sed -i 's/^CARBONE_TEMPLATE_ID=.*/CARBONE_TEMPLATE_ID=31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32/' .env.local`

## Airtable VP-0067 (recmMzeu3eWGxyXsf)
- estado: pdf_listo
- tasador: recTJcV3BIvdcG4em (nutricionsaludketo@gmail.com)
- pdf_final_url VIEJO (rollback): (ver snapshot; empieza https://www.dropbox.com/scl/fi/5nqngrsjdfelbtuic7s9b/FRANCISCO-JOS-VERGARA-UNDURRAGA_METLI…)
- Para revertir el PDF: re-correr E2 con el templateId viejo, o restaurar el link viejo en Airtable.

## No tocado
E3, C_Formulas, AT03, datos de VP-0067, otros módulos de E2, conexiones.
