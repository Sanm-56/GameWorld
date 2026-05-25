# Portadas SVG de relatos

Esta carpeta guarda arte local para las portadas de la estanteria de relatos.

Uso esperado en `historia-libros.js`:

```js
visual: {
  mode: 'svg',
  tier: 'normal',
  coverArt: 'juegos/assets/relatos/portadas/nombre-del-libro.svg',
}
```

Modos visuales previstos:

- `css`: portada especial hecha con CSS/GSAP.
- `svg`: portada con arte SVG local.
- `svg-gsap`: portada SVG con animaciones GSAP adicionales.
- `rive`: libro clave preparado para una portada Rive.

Niveles narrativos previstos:

- `normal`: libro de continuidad.
- `importante`: revelacion, cambio de arco o entidad fuerte.
- `clave`: libro evento o verdad central de la saga.
