# Boost — Cuentas y Contenido (Fase 1)

Panel real con login por persona y datos guardados en la nube (accesible desde cualquier dispositivo, sin depender de un navegador puntual).

Esta primera versión incluye: login, lista de cuentas, calendario de contenido por cuenta, ficha de publicación (carrusel/reel/historia/estático) y ejes de comunicación mensuales.

**Todavía no incluye:** el módulo de Métricas ni la exportación a Word — eso es la Fase 2, para no mezclar todo en un solo despliegue.

No necesitás usar la terminal ni instalar nada en tu computadora. Todo se hace desde el navegador, en 3 pasos.

---

## Paso 1 — Crear la base de datos (Supabase)

1. Andá a [supabase.com](https://supabase.com) y creá una cuenta gratis.
2. Creá un proyecto nuevo (elegí cualquier nombre, por ejemplo "boost"). Guardá la contraseña de base de datos que te pide, no la vas a necesitar de nuevo pero por las dudas.
3. Esperá a que el proyecto termine de crearse (1-2 minutos).
4. En el menú izquierdo, andá a **SQL Editor** → **New query**.
5. Abrí el archivo `supabase/schema.sql` de esta carpeta, copiá todo su contenido, pegalo ahí y tocá **Run**. Esto crea todas las tablas necesarias.
6. Andá a **Project Settings** (ícono de engranaje) → **API**. Ahí vas a ver:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (una clave larga)

   Guardá esos dos datos, los vas a pegar en el Paso 3.

7. Andá a **Authentication** → **Users** → **Add user** → **Create new user**, y creá un usuario (email + contraseña) para vos. Repetí esto por cada persona del equipo que vaya a tener acceso (tu diseñadora, otro CM, etc.). Así es como se maneja el login por persona: vos invitás desde acá, no hace falta que se registren solos.
8. (Opcional pero recomendado) En **Authentication** → **Providers** → **Email**, desactivá "Allow new users to sign up" para que nadie pueda crearse una cuenta propia sin que vos la invites.

---

## Paso 2 — Subir el código a GitHub

1. Creá una cuenta gratis en [github.com](https://github.com) si no tenés.
2. Tocá el botón verde **New** para crear un repositorio nuevo. Ponele de nombre `boost-webapp`, marcalo como **Private**, y creá el repositorio (no hace falta tildar ninguna otra opción).
3. En la página del repositorio recién creado, buscá el link **"uploading an existing file"** (o el botón **Add file → Upload files**).
4. Arrastrá **todos** los archivos y carpetas de esta entrega (menos `node_modules` y `.next`, que no vienen incluidos) y confirmá la subida ("Commit changes").

---

## Paso 3 — Desplegar (Vercel)

1. Andá a [vercel.com](https://vercel.com) y creá una cuenta gratis usando tu cuenta de GitHub (botón "Continue with GitHub").
2. Tocá **Add New → Project**.
3. Elegí el repositorio `boost-webapp` que subiste y tocá **Import**.
4. Antes de tocar "Deploy", abrí la sección **Environment Variables** y cargá estas dos (los valores son los que guardaste en el Paso 1.6):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | tu Project URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu anon public key de Supabase |

5. Tocá **Deploy** y esperá 1-2 minutos.
6. Cuando termine, Vercel te va a dar un link (algo como `boost-webapp.vercel.app`). Ese es tu panel, ya online. Entrá con el usuario y contraseña que creaste en el Paso 1.7.

---

## Cómo invitar a alguien nuevo más adelante

Repetís el paso 1.7: Supabase → Authentication → Users → Add user. No hace falta tocar nada más ni volver a desplegar.

## Si algo falla

- **"Invalid API key" o no carga nada:** revisá que copiaste bien la URL y la anon key en Vercel (Paso 3.4), sin espacios de más.
- **No puedo iniciar sesión:** confirmá que creaste el usuario en Supabase (Paso 1.7) con ese email y contraseña exactos.
- Cualquier otro error, copiá el mensaje tal cual aparece y pasámelo — lo reviso.
