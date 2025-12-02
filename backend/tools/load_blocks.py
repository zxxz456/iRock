#!/usr/bin/env python3
"""
Script para cargar bloques y rutas desde bloques.csv a la base de datos,
junto con sus opciones de puntaje desde puntos.csv.
"""
import os
import sys
import django
import csv

# Setup Django
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')
django.setup()

from api.models import Block, ScoreOption

# Rutas de archivos CSV
BLOQUES_CSV = os.path.join(SCRIPT_DIR, 'bloques.csv')
PUNTOS_CSV = os.path.join(SCRIPT_DIR, 'puntos.csv')


def load_puntos_mapping():
    """
    Carga el archivo puntos.csv y retorna un diccionario con los puntajes
    por grado e intento.
    
    Formato esperado:
    grado,flash,segundo_intento,tercer_intento,mas
    V0,5,4,3,2
    5.9,10,7.5,5,4
    
    Retorna:
    {
        'V0': {'flash': 5, 'segundo': 4, 'tercero': 3, 'mas': 2},
        '5.9': {'flash': 10, 'segundo': 7.5, 'tercero': 5, 'mas': 4},
        ...
    }
    """
    puntos_map = {}
    
    print(f"Cargando puntajes desde {PUNTOS_CSV}...")
    
    with open(PUNTOS_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            grade = row['grado'].strip()
            puntos_map[grade] = {
                'flash': float(row['flash']),
                'segundo': float(row['segundo_intento']),
                'tercero': float(row['tercer_intento']),
                'mas': float(row['mas'])
            }
    
    print(f"✓ Cargados puntajes para {len(puntos_map)} grados")
    return puntos_map


def create_score_options(block, grade, puntos_map):
    """
    Crea las 4 opciones de puntaje para un bloque basándose en su grado.
    
    Args:
        block: Instancia de Block
        grade: String con el grado (e.g., 'V0', '5.9')
        puntos_map: Diccionario con los puntajes por grado
    """
    # Si el grado está vacío o no existe en puntos_map, usar puntajes por defecto
    if not grade or grade not in puntos_map:
        print(f"  ⚠ Grado '{grade}' no encontrado en puntos.csv, usando 0 puntos")
        points = {'flash': 0, 'segundo': 0, 'tercero': 0, 'mas': 0}
    else:
        points = puntos_map[grade]
    
    # Definir las 4 opciones de score
    score_options_data = [
        {
            'key': 'flash',
            'label': 'Flash (Primer intento)',
            'points': int(points['flash']),
            'order': 1
        },
        {
            'key': 'segundo',
            'label': 'Segundo intento',
            'points': int(points['segundo']),
            'order': 2
        },
        {
            'key': 'tercero',
            'label': 'Tercer intento',
            'points': int(points['tercero']),
            'order': 3
        },
        {
            'key': 'mas',
            'label': 'Más de tres intentos',
            'points': int(points['mas']),
            'order': 4
        }
    ]
    
    # Crear las opciones
    for option_data in score_options_data:
        ScoreOption.objects.create(
            block=block,
            key=option_data['key'],
            label=option_data['label'],
            points=option_data['points'],
            order=option_data['order']
        )


def load_blocks():
    """
    Carga bloques desde bloques.csv y crea sus opciones de puntaje.
    """
    # Cargar mapeo de puntajes
    puntos_map = load_puntos_mapping()
    
    print(f"\nCargando bloques desde {BLOQUES_CSV}...")
    
    # Contadores
    blocks_created = 0
    blocks_updated = 0
    blocks_skipped = 0
    
    with open(BLOQUES_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            lane = row['lane'].strip() if row['lane'].strip() else 'N/A'
            grade = row['grade'].strip() if row['grade'].strip() else 'N/A'
            color = row['color'].strip() if row['color'].strip() else 'N/A'
            wall = row['wall'].strip() if row['wall'].strip() else 'N/A'
            distance_str = row['distance'].strip()
            
            # Determinar tipo de bloque basándose en el prefijo del lane
            if lane.startswith('B_'):
                block_type = Block.BOULDER
            elif lane.startswith('R_'):
                block_type = Block.RUTA
            else:
                # Si no tiene prefijo válido, usar 'N/A' y continuar como boulder
                print(f"  ⚠ Lane '{lane}' no empieza con B_ ni R_, asignando como boulder")
                block_type = Block.BOULDER
            
            # Convertir distance a entero, usar 0 si está vacío
            try:
                distance = int(distance_str) if distance_str else 0
            except ValueError:
                print(f"  ⚠ Distance inválido para {lane}: '{distance_str}', usando 0")
                distance = 0
            
            # Verificar si el bloque ya existe
            existing_block = Block.objects.filter(lane=lane).first()
            
            if existing_block:
                # Actualizar bloque existente
                existing_block.grade = grade
                existing_block.color = color
                existing_block.wall = wall
                existing_block.distance = distance
                existing_block.block_type = block_type
                existing_block.save()
                
                # Eliminar opciones de puntaje antiguas y crear nuevas
                existing_block.score_options.all().delete()
                create_score_options(existing_block, grade, puntos_map)
                
                print(f"  ↻ Actualizado: {lane} ({block_type}) - {grade}")
                blocks_updated += 1
            else:
                # Crear nuevo bloque
                block = Block.objects.create(
                    lane=lane,
                    grade=grade,
                    color=color,
                    wall=wall,
                    distance=distance,
                    block_type=block_type,
                    active=True
                )
                
                # Crear opciones de puntaje
                create_score_options(block, grade, puntos_map)
                
                print(f"  ✓ Creado: {lane} ({block_type}) - {grade}")
                blocks_created += 1
    
    # Resumen
    print("\n" + "="*60)
    print("RESUMEN DE CARGA")
    print("="*60)
    print(f"Bloques creados:     {blocks_created}")
    print(f"Bloques actualizados: {blocks_updated}")
    print(f"Bloques omitidos:    {blocks_skipped}")
    print(f"Total procesados:    {blocks_created + blocks_updated + blocks_skipped}")
    print("="*60)


if __name__ == '__main__':
    print("\n" + "="*60)
    print("CARGA DE BLOQUES Y RUTAS")
    print("="*60 + "\n")
    
    try:
        load_blocks()
        print("\n✓ Carga completada exitosamente!\n")
    except FileNotFoundError as e:
        print(f"\n✗ Error: Archivo no encontrado - {e}")
        print("  Asegúrate de que bloques.csv y puntos.csv estén en tools/\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error durante la carga: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
