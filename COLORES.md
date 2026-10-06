# Recuperar los colores anteriores

La paleta anterior (rosa, con las flores blancas, horarios y fondo del formulario ya actualizados) está guardada en la etiqueta `paleta-rosa-anterior-20261006`.

El cambio completo a amarillo pastel está aislado en el commit `3ea6538c23f9635fbaf4b981690c7915f87fcd61`.

Para recuperar la paleta anterior sin borrar el historial, desde este repositorio y con el árbol de trabajo limpio:

```powershell
git pull --ff-only origin main
git revert --no-edit 3ea6538c23f9635fbaf4b981690c7915f87fcd61
git push origin main
```

La reversión mantiene los cambios previos de fotografías, flores blancas, formulario y horarios. Si posteriormente se modificaron los mismos estilos, Git puede pedir resolver conflictos; no usar `reset --hard` ni forzar el push.

Para consultar la versión guardada: `git show paleta-rosa-anterior-20261006`.
