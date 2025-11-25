#!/usr/bin/env python
"""
Script for activating or deactivating admin users in the iRock App.

Usage:
    python activate_admin.py activate <username>   # Activate a specific admin
    python activate_admin.py activate all          # Activate all admins
    python activate_admin.py deactivate <username> # Deactivate a specific admin
    python activate_admin.py deactivate all        # Deactivate all admins

Examples:
    python activate_admin.py activate zxxz6
    python activate_admin.py activate all
    python activate_admin.py deactivate juan_admin
    python activate_admin.py deactivate all
"""

import os
import sys
import django
import argparse

# Change to backend directory and set up Django environment
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

# Set Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')
django.setup()

from api.models import Participant

def activate_admin(username):
    """Activate a specific admin"""
    try:
        admin = Participant.objects.get(username=username, is_staff=True)
        admin.is_active = True
        admin.save()
        print(f"Admin '{username}' ({admin.email}) activado exitosamente")
        return True
    except Participant.DoesNotExist:
        print(f"Error: No se encontró admin con username '{username}'")
        return False
    except Exception as e:
        print(f"Error al activar admin '{username}': {e}")
        return False


def deactivate_admin(username):
    """Deactivate a specific admin"""
    try:
        admin = Participant.objects.get(username=username, is_staff=True)
        admin.is_active = False
        admin.save()
        print(f"Admin '{username}' ({admin.email}) desactivado exitosamente")
        return True
    except Participant.DoesNotExist:
        print(f"Error: No se encontró admin con username '{username}'")
        return False
    except Exception as e:
        print(f"Error al desactivar admin '{username}': {e}")
        return False


def activate_all_admins():
    """Activate all admins"""
    try:
        admins = Participant.objects.filter(is_staff=True)
        count = admins.count()
        
        if count == 0:
            print("No se encontraron usuarios admin")
            return False
        
        print(f"Activando {count} admin(s)...")
        print("-" * 60)
        
        activated = 0
        for admin in admins:
            old_status = admin.is_active
            admin.is_active = True
            admin.save()
            
            status_text = "ya estaba activo" if old_status else "ACTIVADO"
            print(f"  {admin.username:20s} ({admin.email:30s}) - {status_text}")
            if not old_status:
                activated += 1
        
        print("-" * 60)
        print(f"Proceso completado: {activated} admin(s) activado(s), \
              {count - activated} ya estaban activos")
        return True
    except Exception as e:
        print(f"Error al activar admins: {e}")
        return False


def deactivate_all_admins():
    """Desactiva todos los admins"""
    try:
        admins = Participant.objects.filter(is_staff=True)
        count = admins.count()
        
        if count == 0:
            print("No se encontraron usuarios admin")
            return False
        
        print(f"ADVERTENCIA: Desactivando {count} admin(s)...")
        print("-" * 50)
        
        deactivated = 0
        for admin in admins:
            old_status = admin.is_active
            admin.is_active = False
            admin.save()
            
            status_text = "ya estaba inactivo" if not old_status \
                                               else "DESACTIVADO"
            print(f"  {admin.username:20s} ({admin.email:30s}) - {status_text}")
            if old_status:
                deactivated += 1
        
        print("-" * 50)
        print(f"Proceso completado: {deactivated} admin(s) desactivado(s), \
              {count - deactivated} ya estaban inactivos")
        return True
    except Exception as e:
        print(f"Error al desactivar admins: {e}")
        return False


def list_admins():
    """Lista todos los admins con su estado"""
    try:
        admins = Participant.objects.filter(is_staff=True).order_by('username')
        count = admins.count()
        
        if count == 0:
            print("No se encontraron usuarios admin")
            return
        
        print(f"\nListado de {count} admin(s):")
        print("-" * 80)
        print(f"{'Username':<20} {'Email':<35} {'Estado':<10} {'Superuser'}")
        print("-" * 80)
        
        active_count = 0
        for admin in admins:
            status = "ACTIVO" if admin.is_active else "INACTIVO"
            superuser = "Sí" if admin.is_superuser else "No"
            print(f"{admin.username:<20} {admin.email:<35} \
                  {status:<10} {superuser}")
            if admin.is_active:
                active_count += 1
        
        print("-" * 80)
        print(f"Total: {active_count} activos, {count - active_count} \
              inactivos\n")
    except Exception as e:
        print(f"Error al listar admins: {e}")


def main():
    parser = argparse.ArgumentParser(
        description='Activar o desactivar usuarios admin en iRock App',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  %(prog)s activate zxxz6          # Activa el admin 'zxxz6'
  %(prog)s activate all            # Activa todos los admins
  %(prog)s deactivate juan_admin   # Desactiva el admin 'juan_admin'
  %(prog)s deactivate all          # Desactiva todos los admins
  %(prog)s list                    # Lista todos los admins
        """
    )
    
    parser.add_argument(
        'action',
        choices=['activate', 'deactivate', 'list'],
        help='Acción a realizar: activate, deactivate o list'
    )
    
    parser.add_argument(
        'target',
        nargs='?',
        default=None,
        help='Username del admin o "all" para todos. No requerido para "list"'
    )
    
    args = parser.parse_args()
    
    # if not req tgt (list option)
    if args.action == 'list':
        list_admins()
        return
    
    # otherwise we need tgt
    if args.target is None:
        print(f"Error: Debes especificar un username o 'all'")
        parser.print_help()
        sys.exit(1)
    
    print("=" * 60)
    print(f"  iRock App - Gestión de Admins")
    print("=" * 60)
    print()
    
    success = False
    
    if args.action == 'activate':
        if args.target.lower() == 'all':
            success = activate_all_admins()
        else:
            success = activate_admin(args.target)
    
    elif args.action == 'deactivate':
        if args.target.lower() == 'all':
            # Confirmation to deactivate all
            confirm = input("\n¿Estás seguro de desactivar TODOS los admins? \
                            (escribe 'SI' para confirmar): ")
            if confirm.strip().upper() == 'SI':
                success = deactivate_all_admins()
            else:
                print("Operación cancelada")
                sys.exit(0)
        else:
            success = deactivate_admin(args.target)
    
    print()
    
    if success:
        # Show updated status
        print("\nEstado actual de admins:")
        list_admins()
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == '__main__':
    main()
