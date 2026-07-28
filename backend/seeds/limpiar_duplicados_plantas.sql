-- Limpieza de duplicados en el catálogo `plantas` + alta de las 6 especies que
-- el calendario de siembra (diet-recommendations.ts) ya recomienda pero que
-- nunca existieron como fila real en esta tabla.
--
-- Verificado contra Aiven antes de escribir este script:
--   - Los 3 IDs que se borran (18, 20, 21) tienen 0 filas en p_usuario,
--     0 en ingredientes y 0 en receta_ingredientes: se pueden eliminar
--     directamente, sin reasignar ninguna referencia.
--   - Los IDs 1, 16, 23, 24 (Tomate, Tomates cherry, Tomate ramillete,
--     Tomate pera) NO se tocan: son variedades distintas, no duplicados.
--
-- planta_id es SERIAL (plantas_planta_id_seq): los INSERT no fijan el id,
-- así que no hace falta ajustar la secuencia después, a diferencia del
-- seed de ingredientes (backend/seeds/recetas_ingredientes.sql).

BEGIN;

-- 1) Duplicados sin ningún uso real: Lechugas (dup. de Lechuga id 2),
--    Pimientos (dup. de Pimiento id 4), Zanahoria repetida (dup. de id 3).
DELETE FROM plantas WHERE planta_id IN (18, 20, 21);

-- 2) Especies que el calendario de siembra ya usa (mismo tipo_planta, freq_riego
--    e imagen que ya tiene definidos el frontend en plantas.ts) pero que nunca
--    se dieron de alta en el catálogo real.
-- nombre_planta no tiene UNIQUE (solo planta_id, que aquí es autogenerado), así
-- que la idempotencia se hace con WHERE NOT EXISTS en vez de ON CONFLICT.
INSERT INTO plantas (nombre_planta, hortaliza, imagen_url, tipo_planta, freq_riego, clima, h_luzsolar, caracteristicas)
SELECT v.nombre_planta, v.hortaliza, v.imagen_url, v.tipo_planta, v.freq_riego, v.clima, v.h_luzsolar, v.caracteristicas
FROM (VALUES
    ('Habas',     true, 'https://url-corta.com/habas.jpg',     'EXTERIOR', 5, 'Frío',     5, 'Legumbre resistente al frío, mejora el suelo.'),
    ('Cebollas',  true, 'https://url-corta.com/cebolla.jpg',   'EXTERIOR', 5, 'Templado', 5, 'Bulbo de ciclo largo y sabor intenso.'),
    ('Puerros',   true, 'https://url-corta.com/puerros.jpg',   'EXTERIOR', 4, 'Templado', 5, 'Ciclo largo, sabor suave a cebolla.'),
    ('Brócoli',   true, 'https://url-corta.com/brocoli.jpg',   'EXTERIOR', 3, 'Frío',     4, 'Necesita espacio y temperaturas suaves.'),
    ('Coliflor',  true, 'https://url-corta.com/coliflor.jpg',  'EXTERIOR', 3, 'Frío',     4, 'Exigente en espacio y agua constante.'),
    ('Remolacha', true, 'https://url-corta.com/remolacha.jpg', 'EXTERIOR', 3, 'Frío',     5, 'Tolera el frío, riego constante.')
) AS v(nombre_planta, hortaliza, imagen_url, tipo_planta, freq_riego, clima, h_luzsolar, caracteristicas)
WHERE NOT EXISTS (
    SELECT 1 FROM plantas p WHERE p.nombre_planta = v.nombre_planta
);

COMMIT;
