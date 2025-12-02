#!/usr/bin/env python3
"""
Script para eliminar todos los bloques, rutas y sus scores de la base de datos.
ADVERTENCIA: Esta acción es irreversible.
"""
import os
import sys
import django

# Setup Django
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')
django.setup()

from api.models import Block, BlockScore, ScoreOption


def clear_all_blocks():
    """
    Elimina todos los bloques, rutas, BlockScores y ScoreOptions.
    """
    print("\n" + "="*60)
    print("ADVERTENCIA: ELIMINACIÓN DE TODOS LOS BLOQUES Y SCORES")
    print("="*60)
    
    # Contar registros actuales
    block_count = Block.objects.count()
    score_count = BlockScore.objects.count()
    option_count = ScoreOption.objects.count()
    
    print(f"\nRegistros actuales:")
    print(f"  - Bloques/Rutas:  {block_count}")
    print(f"  - BlockScores:    {score_count}")
    print(f"  - ScoreOptions:   {option_count}")
    
    if block_count == 0 and score_count == 0 and option_count == 0:
        print("\n✓ No hay registros para eliminar.")
        return
    
    # Confirmación
    print("\n⚠️  Esta acción eliminará TODOS los bloques, rutas y scores.")
    print("⚠️  Los puntajes de los participantes se ajustarán automáticamente.")
    confirmation = input("\n¿Estás seguro? Escribe 'SI' para confirmar: ")
    
    if confirmation.strip().upper() != 'SI':
        print("\n✗ Operación cancelada.")
        return
    
    print("\nEliminando registros...")
    
    # Eliminar BlockScores primero (ajustará puntajes de participantes)
    if score_count > 0:
        deleted_scores = BlockScore.objects.all().delete()
        print(f"  ✓ BlockScores eliminados: {deleted_scores[0]}")
    
    # Eliminar ScoreOptions
    if option_count > 0:
        deleted_options = ScoreOption.objects.all().delete()
        print(f"  ✓ ScoreOptions eliminados: {deleted_options[0]}")
    
    # Eliminar Blocks (CASCADE eliminará scores y options restantes)
    if block_count > 0:
        deleted_blocks = Block.objects.all().delete()
        print(f"  ✓ Bloques/Rutas eliminados: {deleted_blocks[0]}")
    
    print("\n" + "="*60)
    print("✓ Todos los bloques y scores han sido eliminados")
    print("="*60 + "\n")


if __name__ == '__main__':
    try:
        clear_all_blocks()
    except KeyboardInterrupt:
        print("\n\n✗ Operación cancelada por el usuario.\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error durante la eliminación: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
