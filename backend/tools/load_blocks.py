#!/usr/bin/env python3
"""
Script for loading blocks and routes from bloques.csv into the database,
along with their score options from puntos.csv.
"""
import os
import sys
import csv

# Setup Django
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, BACKEND_DIR)

# Configure Django settings before importing models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')

import django
django.setup()

# Now import Django models
from api.models import Block, ScoreOption

# CSV file paths
BLOQUES_CSV = os.path.join(SCRIPT_DIR, 'bloques.csv')
PUNTOS_CSV = os.path.join(SCRIPT_DIR, 'puntos.csv')


def load_puntos_mapping():
    """
    load the csv file and return a dictionary with scores
    by grade and attempt.
    
    Expected format:
    grado,flash,segundo_intento,tercer_intento,mas
    V0,5,4,3,2
    5.9,10,7.5,5,4
    
    Returns:
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
    
    print(f" Cargados puntajes para {len(puntos_map)} grados")
    return puntos_map


def create_score_options(block, grade, puntos_map):
    """
    Create the 4 score options for a block based on its grade.
    
    Args:
        block: Instance of Block
        grade: String with the grade (e.g., 'V0', '5.9')
        puntos_map: Dictionary with scores by grade
    """
    # If grade is empty or not in puntos_map, use default scores
    if not grade or grade not in puntos_map:
        print(f" Grado '{grade}' no encontrado en puntos.csv, usando 0 puntos")
        points = {'flash': 0, 'segundo': 0, 'tercero': 0, 'mas': 0}
    else:
        points = puntos_map[grade]
    
    # Define the 4 score options
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
    
    # Create ScoreOption instances
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
    Load blocks from bloques.csv and create their score options.
    """
    # Load score mapping
    puntos_map = load_puntos_mapping()
    
    print(f"\nCargando bloques desde {BLOQUES_CSV}...")
    
    # Cntrs
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
            
            # Determine block type based on lane prefix
            if lane.startswith('B_'):
                block_type = Block.BOULDER
            elif lane.startswith('R_'):
                block_type = Block.RUTA
            else:
                # If it doesn't have a valid prefix, use 'N/A' 
                # and continue as boulder
                print(f" Lane '{lane}' no empieza con B_ ni R_, asignando como boulder")
                block_type = Block.BOULDER
            
            # Convert distance to integer, use 0 if empty
            try:
                distance = int(distance_str) if distance_str else 0
            except ValueError:
                print(f" Distance inválido para {lane}: '{distance_str}', usando 0")
                distance = 0
            
            # Check if the block already exists
            existing_block = Block.objects.filter(lane=lane).first()
            
            if existing_block:
                # Update existing block
                existing_block.grade = grade
                existing_block.color = color
                existing_block.wall = wall
                existing_block.distance = distance
                existing_block.block_type = block_type
                existing_block.save()
                
                # Delete old score options and create new ones
                existing_block.score_options.all().delete()
                create_score_options(existing_block, grade, puntos_map)
                
                print(f" Actualizado: {lane} ({block_type}) - {grade}")
                blocks_updated += 1
            else:
                # Create new
                block = Block.objects.create(
                    lane=lane,
                    grade=grade,
                    color=color,
                    wall=wall,
                    distance=distance,
                    block_type=block_type,
                    active=True
                )
                
                # Create score options
                create_score_options(block, grade, puntos_map)
                
                print(f"  ✓ Creado: {lane} ({block_type}) - {grade}")
                blocks_created += 1
    
    # Summary
    print("\n" + "="*60)
    print("RESUMEN DE CARGA")
    print("="*60)
    print(f"Bloques creados:     {blocks_created}")
    print(f"Bloques actualizados: {blocks_updated}")
    print(f"Bloques omitidos:    {blocks_skipped}")
    print(f"Total procesados: {blocks_created + blocks_updated + blocks_skipped}")
    print("="*60)


if __name__ == '__main__':
    print("\n" + "="*60)
    print("CARGA DE BLOQUES Y RUTAS")
    print("="*60 + "\n")
    
    try:
        load_blocks()
        print("\n Carga completada exitosamente!\n")
    except FileNotFoundError as e:
        print(f"\n Error: Archivo no encontrado - {e}")
        print("  Asegúrate de que bloques.csv y puntos.csv estén en tools/\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n Error durante la carga: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
