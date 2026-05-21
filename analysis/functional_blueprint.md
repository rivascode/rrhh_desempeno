# Analisis funcional de documentos base

## Archivos revisados

- `0 ENCUESTA - GLOBAL.xlsx`: 10 hojas. Contiene estructura de encuesta, respuestas, resultados cerrados, resultados de escala, preguntas abiertas, frecuencias, comparativos y reportes por sede.
- `ENCUESTA CLIMA LABORAL - DACHASAC (2).xlsx`: 14 hojas. Es la version mas completa para clima laboral, con 45 preguntas cerradas, 4 preguntas de escala 0-10, preguntas abiertas y resultados por sede.
- `Evaluacion de Desempeno - Mandos Medios.xls`: 6 hojas. Contiene instrucciones CONECTA, evaluacion de competencias, capacitaciones, cursos sugeridos, feedback y listas de apoyo.
- `Establecimiento de Objetivos.xlsx`: 1 hoja. Contiene captura de objetivos, pesos, unidad de medida, meta, resultado, evaluacion y fechas de reuniones.
- `DICCIONARIO DE COMPETENCIAS.docx`: documento con 113 parrafos y 13 tablas. Define marco de competencias, niveles, valores y referencias para la evaluacion.

## Modulos de la app

1. Encuesta de clima laboral
   - Datos del colaborador: sede, area, puesto, antiguedad, sexo, edad.
   - Preguntas cerradas en escala Likert: Nunca, Casi nunca, A veces, Casi siempre, Siempre.
   - Preguntas 0-10 para felicidad, recomendacion, comodidad para sugerir y meta comun.
   - Preguntas abiertas sobre renuncia, capacitacion, seguridad y motivacion.
   - Tabulacion por dimension y resultado global.

2. Evaluacion de desempeno
   - Datos del evaluado y evaluador.
   - Competencias organizacionales y especificas con puntaje 1-5 y evidencia.
   - Potencialidad, comentario del evaluado y conformidad.
   - Objetivos ponderados con meta, resultado y estado.
   - Plan de capacitacion y feedback con fortalezas y oportunidades.

3. Dashboard
   - KPIs generales de registros.
   - Promedio de clima y desempeno.
   - Estado: Saludable, En proceso de mejora o No saludable.
   - Graficos de barras por dimension/competencia.
   - Distribucion de respuestas Likert.

## Reglas de calculo

- Clima Likert: Nunca=1, Casi nunca=2, A veces=3, Casi siempre=4, Siempre=5.
- Clima dimension: promedio de respuestas / 5 * 100.
- Clima escala 0-10: valor / 10 * 100.
- Estado: >80 Saludable; >50 En proceso de mejora; <=50 No saludable.
- Desempeno: promedio de competencias / 5 * 100.
- Objetivos: suma ponderada de resultado porcentual por peso.
