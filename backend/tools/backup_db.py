#!/usr/bin/env python3
"""
Scriot for backing up the iRock App SQLite database.

Uso:
    python backup_db.py                    # unique
    python backup_db.py --interval 3600    # Backup every hour (3600 seconds)
    python backup_db.py --interval 86400   # Backup every day (86400 seconds)
    python backup_db.py --keep 7           # Keep only the last 7 backups

Examples:
    python backup_db.py
    python backup_db.py --interval 3600 --keep 10
    python backup_db.py --interval 86400 --keep 30 --backup-dir ~/backups
"""

import os
import sys
import shutil
import argparse
import time
from datetime import datetime
from pathlib import Path

# Change to backend directory and set working directory
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
os.chdir(backend_dir)

# Configuration
DB_FILE = os.path.join(backend_dir, 'db.sqlite3')
DEFAULT_BACKUP_DIR = os.path.join(backend_dir, 'backups')

def create_backup(backup_dir, verbose=True):
    """
    Create a backup of the database
    """
    if not os.path.exists(DB_FILE):
        print(f"Error: No se encontró la base de datos en {DB_FILE}")
        return False
    
    # Create backup directory if it doesn't exist
    os.makedirs(backup_dir, exist_ok=True)
    
    # Name with TS
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f'db_backup_{timestamp}.sqlite3'
    backup_path = os.path.join(backup_dir, backup_filename)
    
    try:
        # Copy database file (use copy instead of copy2 to set new timestamp)
        shutil.copy(DB_FILE, backup_path)
        
        # Get backup size
        size_mb = os.path.getsize(backup_path) / (1024 * 1024)
        
        if verbose:
            print(f"  Backup creado exitosamente:")
            print(f"  Archivo: {backup_filename}")
            print(f"  Ubicación: {backup_dir}")
            print(f"  Tamaño: {size_mb:.2f} MB")
            print(f"  Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return True
    
    except Exception as e:
        print(f" Error al crear backup: {e}")
        return False


def cleanup_old_backups(backup_dir, keep=10, verbose=True):
    """
    Delete old backups, keeping only the most recent ones
    """
    if not os.path.exists(backup_dir):
        return
    
    # Get all backup files
    backup_files = []
    for file in os.listdir(backup_dir):
        if file.startswith('db_backup_') and file.endswith('.sqlite3'):
            file_path = os.path.join(backup_dir, file)
            backup_files.append((file_path, os.path.getmtime(file_path)))
    
    # Sort by date (most recent first)
    backup_files.sort(key=lambda x: x[1], reverse=True)
    
    # Delete old backups
    if len(backup_files) > keep:
        deleted_count = 0
        for file_path, _ in backup_files[keep:]:
            try:
                os.remove(file_path)
                deleted_count += 1
                if verbose:
                    print(f" Eliminado: {os.path.basename(file_path)}")
            except Exception as e:
                print(f" Error al eliminar {os.path.basename(file_path)}: {e}")
        
        if verbose and deleted_count > 0:
            print(f" Limpieza completada: {deleted_count} \
                  backup(s) antiguo(s) eliminado(s)")


def list_backups(backup_dir):
    """
    List all available backups
    """
    if not os.path.exists(backup_dir):
        print(f" No existe el directorio de backups: {backup_dir}")
        return
    
    backup_files = []
    for file in os.listdir(backup_dir):
        if file.startswith('db_backup_') and file.endswith('.sqlite3'):
            file_path = os.path.join(backup_dir, file)
            size_mb = os.path.getsize(file_path) / (1024 * 1024)
            mtime = os.path.getmtime(file_path)
            backup_files.append((file, size_mb, mtime))
    
    if not backup_files:
        print(f"No hay backups en {backup_dir}")
        return
    
    # Sort by date (most recent first)
    backup_files.sort(key=lambda x: x[2], reverse=True)
    
    print(f"\n Backups disponibles en {backup_dir}:")
    print("=" * 80)
    print(f"{'Archivo':<35} {'Tamaño':<12} {'Fecha'}")
    print("-" * 80)
    
    for filename, size_mb, mtime in backup_files:
        date_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
        print(f"{filename:<35} {size_mb:>8.2f} MB   {date_str}")
    
    print("=" * 80)
    print(f"Total: {len(backup_files)} backup(s)")


def run_continuous_backup(interval, backup_dir, keep):
    """
    Run continuous backups at intervals
    """
    print(f" Modo continuo activado")
    print(f"   Intervalo: {interval} segundos ({interval/3600:.1f} horas)")
    print(f"   Directorio: {backup_dir}")
    print(f"   Mantener: {keep} backups más recientes")
    print(f"   Presiona Ctrl+C para detener\n")
    
    backup_count = 0
    try:
        while True:
            backup_count += 1
            print(f"\n--- Backup #{backup_count} ---")
            
            if create_backup(backup_dir):
                cleanup_old_backups(backup_dir, keep)
            
            print(f"\nEsperando {interval} segundos hasta el próximo backup...")
            print(f"   (Próximo backup: {datetime.fromtimestamp(time.time() + \
                  interval).strftime('%Y-%m-%d %H:%M:%S')})")
            
            time.sleep(interval)
    
    except KeyboardInterrupt:
        print(f"\n\n Backup detenido. Total de backups realizados: \
              {backup_count}")


def main():
    parser = argparse.ArgumentParser(
        description='Script para backup de base de datos SQLite de iRock App',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  %(prog)s                                    # Backup único
  %(prog)s --interval 3600                    # Backup cada hora
  %(prog)s --interval 86400 --keep 30         # Backup diario, mantener 30
  %(prog)s --list                             # Listar backups existentes
  %(prog)s --backup-dir ~/mis_backups         # Usar directorio personalizado
        """
    )
    
    parser.add_argument(
        '--interval',
        type=int,
        help='Intervalo en segundos entre backups (modo continuo)'
    )
    
    parser.add_argument(
        '--keep',
        type=int,
        default=10,
        help='Número de backups a mantener (default: 10)'
    )
    
    parser.add_argument(
        '--backup-dir',
        type=str,
        default=DEFAULT_BACKUP_DIR,
        help=f'Directorio para guardar backups (default: {DEFAULT_BACKUP_DIR})'
    )
    
    parser.add_argument(
        '--list',
        action='store_true',
        help='Listar backups existentes'
    )
    
    parser.add_argument(
        '--quiet',
        action='store_true',
        help='Modo silencioso (sin mensajes detallados)'
    )
    
    args = parser.parse_args()
    
    # ExpaND ~ in the directory path
    backup_dir = os.path.expanduser(args.backup_dir)
    verbose = not args.quiet
    
    # List backups
    if args.list:
        list_backups(backup_dir)
        return
    
    # Continuous mode
    if args.interval:
        run_continuous_backup(args.interval, backup_dir, args.keep)
    # Single backup
    else:
        if create_backup(backup_dir, verbose):
            cleanup_old_backups(backup_dir, args.keep, verbose)


if __name__ == '__main__':
    main()
