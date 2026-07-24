-- Seed idempotente de ingredientes para las recetas 2-28.
-- Puede ejecutarse cuantas veces haga falta: los INSERT usan ON CONFLICT DO NOTHING,
-- así que no duplica filas ni falla por violación de clave primaria.
--
-- Contexto de esquema (ver backend/models.py):
--   ingredientes(id_ingrediente PK, nombre_ingrediente, cantidad, imagen_url, tipo_dieta)
--   receta_ingredientes(id_receta FK, id_ingrediente FK, cantidad) con PK compuesta
--   (id_receta, id_ingrediente) y ON DELETE CASCADE en ambas FKs.
--
-- Los ids 1-32 de "ingredientes" ya existen y coinciden 1:1 con el catálogo "plantas"
-- (mismo id = misma especie cultivable). Los ingredientes de despensa que no se cultivan
-- en el huerto (aceite, sal, carnes, lácteos, etc.) no tienen equivalente en "plantas",
-- así que se añaden aquí con ids nuevos a partir del 33.

BEGIN;

-- 1) Ingredientes de despensa que faltaban en el catálogo.
INSERT INTO ingredientes (id_ingrediente, nombre_ingrediente, cantidad, tipo_dieta) VALUES
    (33, 'Aceite de oliva', '50ml',        'VEGANA'),
    (34, 'Sal',             'al gusto',    'VEGANA'),
    (35, 'Pimienta negra',  'al gusto',    'VEGANA'),
    (36, 'Mozzarella',      '200g',        'VEGETARIANA'),
    (37, 'Queso parmesano', '50g',         'VEGETARIANA'),
    (38, 'Piñones',         '30g',         'VEGANA'),
    (39, 'Pollo',           '500g',        'OMNIVORA'),
    (40, 'Ternera',         '400g',        'OMNIVORA'),
    (41, 'Carne picada',    '400g',        'OMNIVORA'),
    (42, 'Cebolla',         '1 unidad',    'VEGANA'),
    (43, 'Limón',           '1 unidad',    'VEGANA'),
    (44, 'Pan',             '4 rebanadas', 'VEGETARIANA'),
    (45, 'Vinagre',         '100ml',       'VEGANA'),
    (46, 'Azúcar',          '200g',        'VEGANA'),
    (47, 'Caldo vegetal',   '500ml',       'VEGANA'),
    (48, 'Yogur',           '200g',        'VEGETARIANA')
ON CONFLICT (id_ingrediente) DO NOTHING;

-- Como se insertan ids explícitos, hay que adelantar la secuencia manualmente para
-- que el próximo INSERT sin id explícito (p.ej. desde la app) no choque con estos.
SELECT setval(
    pg_get_serial_sequence('ingredientes', 'id_ingrediente'),
    (SELECT MAX(id_ingrediente) FROM ingredientes)
);

-- 2) Vínculos receta <-> ingrediente para las recetas 2 a 28.
INSERT INTO receta_ingredientes (id_receta, id_ingrediente, cantidad) VALUES
    -- 2. Ensalada Caprese
    (2, 1, '4 unidades'), (2, 36, '200g'), (2, 17, 'al gusto'),
    (2, 33, '3 cucharadas'), (2, 34, 'al gusto'), (2, 35, 'al gusto'),

    -- 3. Salsa Verde
    (3, 8, '1 taza'), (3, 19, '1 taza'), (3, 30, '2 dientes'),
    (3, 33, '150ml'), (3, 43, '1 unidad'), (3, 34, 'al gusto'),

    -- 4. Gazpacho Andaluz
    (4, 1, '1kg'), (4, 27, '1 unidad'), (4, 4, '1 unidad'), (4, 42, '1/2 unidad'),
    (4, 33, '50ml'), (4, 45, '30ml'), (4, 34, 'al gusto'),

    -- 5. Agua de Menta y Pepino
    (5, 27, '1 unidad'), (5, 5, '10 hojas'), (5, 43, '1 unidad'),

    -- 6. Pesto de Albahaca
    (6, 17, '2 tazas'), (6, 38, '30g'), (6, 30, '2 dientes'), (6, 37, '50g'), (6, 33, '100ml'),

    -- 7. Pollo al Romero
    (7, 39, '500g'), (7, 29, '2 ramas'), (7, 15, '1 rama'), (7, 30, '3 dientes'),
    (7, 4, '1 unidad'), (7, 3, '2 unidades'), (7, 8, 'al gusto'), (7, 33, '3 cucharadas'), (7, 34, 'al gusto'),

    -- 8. Ternera con Espinacas
    (8, 40, '300g'), (8, 25, '200g'), (8, 30, '2 dientes'),
    (8, 33, '2 cucharadas'), (8, 43, '1/2 unidad'), (8, 34, 'al gusto'), (8, 35, 'al gusto'),

    -- 9. Pimientos Rellenos
    (9, 4, '4 unidades'), (9, 42, '1 unidad'), (9, 30, '2 dientes'), (9, 41, '400g'),
    (9, 1, '400g'), (9, 14, '1 cucharadita'), (9, 19, 'al gusto'),

    -- 10. Crema de Calabacín
    (10, 22, '3 unidades'), (10, 42, '1 unidad'), (10, 30, '1 diente'),
    (10, 47, '500ml'), (10, 33, '2 cucharadas'), (10, 5, '10 hojas'),

    -- 11. Ensalada de Rúcula
    (11, 26, '80g'), (11, 12, '4 unidades'), (11, 16, '10 unidades'),
    (11, 9, 'al gusto'), (11, 33, '2 cucharadas'), (11, 43, '1/2 unidad'),

    -- 12. Judías Verdes al Ajo
    (12, 11, '400g'), (12, 30, '3 dientes'), (12, 8, 'al gusto'), (12, 33, '2 cucharadas'), (12, 34, 'al gusto'),

    -- 13. Kale con Guisantes
    (13, 7, '150g'), (13, 6, '150g'), (13, 30, '1 diente'), (13, 33, '2 cucharadas'), (13, 43, '1/2 unidad'),

    -- 14. Acelgas con Zanahoria
    (14, 13, '400g'), (14, 3, '2 unidades'), (14, 30, '2 dientes'), (14, 14, '1 cucharadita'), (14, 33, '2 cucharadas'),

    -- 15. Bruschetta de Tomate
    (15, 44, '4 rebanadas'), (15, 30, '1 diente'), (15, 1, '3 unidades'),
    (15, 17, 'al gusto'), (15, 33, '2 cucharadas'), (15, 34, 'al gusto'),

    -- 16. Berenjenas Asadas
    (16, 28, '2 unidades'), (16, 15, '1 rama'), (16, 14, '1 cucharadita'), (16, 33, '3 cucharadas'),

    -- 17. Fresas con Menta
    (17, 10, '1 taza'), (17, 5, '10 hojas'), (17, 43, 'al gusto'),

    -- 18. Pepino con Yogur
    (18, 27, '1 unidad'), (18, 48, '200g'), (18, 9, 'al gusto'), (18, 34, 'al gusto'), (18, 35, 'al gusto'),

    -- 19. Zanahorias Asadas
    (19, 3, '6 unidades'), (19, 29, '2 ramas'), (19, 15, '1 rama'), (19, 33, '2 cucharadas'),

    -- 20. Salsa Picante Casera
    (20, 30, '2 dientes'), (20, 1, '500g'), (20, 32, '4 unidades'),

    -- 21. Ensalada de Fresas
    (21, 10, '1 taza'), (21, 26, '80g'), (21, 9, 'al gusto'), (21, 33, '2 cucharadas'), (21, 43, 'al gusto'),

    -- 22. Tomates Provenzales
    (22, 1, '4 unidades'), (22, 30, '2 dientes'), (22, 14, '1 cucharadita'), (22, 15, '1 rama'), (22, 17, 'al gusto'),

    -- 23. Crema de Zanahoria
    (23, 3, '500g'), (23, 42, '1 unidad'), (23, 30, '1 diente'), (23, 47, '500ml'), (23, 15, '1 rama'),

    -- 24. Berenjena con Tomate
    (24, 28, '2 unidades'), (24, 1, '400g'), (24, 30, '2 dientes'), (24, 17, 'al gusto'),

    -- 25. Mermelada de Fresón
    (25, 31, '500g'), (25, 46, '200g'), (25, 43, '1 unidad'),

    -- 26. Aceite Aromático
    (26, 29, '2 ramas'), (26, 15, '2 ramas'), (26, 14, '1 cucharada'), (26, 33, '500ml'),

    -- 27. Pepinos Encurtidos
    (27, 27, '3 unidades'), (27, 30, '2 dientes'), (27, 14, '1 cucharadita'), (27, 45, '200ml'),

    -- 28. Guindillas en Vinagre
    (28, 32, '15 unidades'), (28, 45, '300ml')
ON CONFLICT (id_receta, id_ingrediente) DO NOTHING;

COMMIT;
