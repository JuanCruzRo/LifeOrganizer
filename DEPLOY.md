# Deploy a producción

Orden real, no el que parece. Cada paso depende del anterior.

## Antes: variables que NO son secretas

`NEXT_PUBLIC_*` se inlinean **en el bundle durante el build**. Si las cambiás después
en el panel, el bundle viejo sigue sirviendo el valor viejo hasta que rebuildees.
En Vercel esto es automático: cambiar la variable dispara un redeploy.

## Paso 1 — Deploy con las claves de Clerk que ya tenés

Las claves de desarrollo (`pk_test_` / `sk_test_`) **funcionan en producción**.
No son inseguras per se: lo que no hacen es escalar. La instancia dev tiene tope
de 100 usuarios y cookies de desarrollo.

Subí el repo a GitHub, importalo en Vercel Hobby, y configurá **todas** las
variables de `.env.example` (`.env.local` es gitignored, no se sube solo).

Al deploying tenés una URL pública HTTPS. **Ese es el objetivo de este paso.**

## Paso 2 — Mercado Pago: webhook

Recién ahora, porque necesita la URL del paso 1.

1. developers.mercadopago.com → tu app → **Webhooks**
2. Endpoint: `https://<tu-dominio>/api/subscriptions/webhook`
3. Eventos: `subscription_preapproval` (o `preapproval`)
4. Te devuelve un **signing secret** → `MP_WEBHOOK_SECRET`

Actualizá la variable en Vercel y rebuildea. Sin esto, la ruta devuelve 503 en
producción: se cobra la plata y el plan nunca se activa.

## Paso 3 — Probá un pago real

Esto es lo que valida el arreglo de billing. Nadie lo puede hacer por vos.

1. Entrá a la app con una cuenta de prueba
2. `/plans` → elegir Plus → checkout
3. Pagá con una tarjeta de prueba de MP
4. Esperá el webhook
5. Verificá en la base que `user_plans` tenga `plan = 'plus'` y
   `subscription_status = 'authorized'`

Si `authorized` está y el plan aparece, el circuito está cerrado.
Si la fila no cambió, el webhook no llegó: revisá el secret y que la URL sea
exacta (sin slash al final, sin `www` si el dominio no lo tiene).

## Paso 4 — Clerk a producción (obligatorio antes de vender)

La instancia de desarrollo no sirve para público: tope de 100 usuarios y
cookies que no son de producción.

1. Dashboard de Clerk → **Create application** → Spark (production)
2. **Instances → Add instance → Development**, luego configurá la de producción
3. Dominio: agregá el tuyo y verificá la propiedad por DNS
4. Traé `pk_live_` / `sk_live_` a Vercel y rebuildea

**Chequeo de seguridad:** en `app/api/subscriptions/webhook/route.ts`, si
`MP_WEBHOOK_SECRET` falta en producción la ruta devuelve 503. Confirmá que en
Vercel la variable existe con mayúsculas exactas.

## Lo que sigue después

Nada de esto es bloqueante para cobrar, pero es lo que convierte usuarios en
clientes: emails transaccionales (bienvenida, trial por vencer) y analytics.
