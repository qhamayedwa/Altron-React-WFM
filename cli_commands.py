import click
from flask import current_app
from flask.cli import with_appcontext

@click.command()
@click.option('--username', prompt='Username', help='Super User username')
@click.option('--email', prompt='Email', help='Super User email')
@click.option('--password', prompt=True, hide_input=True, confirmation_prompt=True, help='Super User password')
@with_appcontext
def create_superuser(username, email, password):
    """Create the first Super User"""
    from app import db
    from models import User, Role
    
    # Check if Super User role exists, create if not
    super_role = Role.query.filter_by(name='Super User').first()
    if not super_role:
        super_role = Role()
        super_role.name = 'Super User'
        super_role.description = 'Super User with full system access'
        db.session.add(super_role)
    
    # Create default roles
    roles_to_create = [
        ('User', 'Regular user with basic access'),
        ('Admin', 'Administrator with elevated privileges'),
        ('Editor', 'Content editor with post management access')
    ]
    
    for role_name, role_desc in roles_to_create:
        if not Role.query.filter_by(name=role_name).first():
            role = Role()
            role.name = role_name
            role.description = role_desc
            db.session.add(role)
    
    # Check if user already exists
    if User.query.filter_by(username=username).first():
        click.echo(f'User {username} already exists!')
        return
    
    if User.query.filter_by(email=email).first():
        click.echo(f'Email {email} already exists!')
        return
    
    # Create Super User
    user = User()
    user.username = username
    user.email = email
    user.set_password(password)
    user.add_role(super_role)
    
    db.session.add(user)
    db.session.commit()
    
    click.echo(f'Super User {username} created successfully!')

@click.command()
@with_appcontext
def init_roles():
    """Initialize default roles"""
    from app import db
    from models import Role
    
    roles_to_create = [
        ('Super User', 'Super User with full system access'),
        ('Admin', 'Administrator with elevated privileges'),
        ('Editor', 'Content editor with post management access'),
        ('User', 'Regular user with basic access')
    ]
    
    for role_name, role_desc in roles_to_create:
        if not Role.query.filter_by(name=role_name).first():
            role = Role()
            role.name = role_name
            role.description = role_desc
            db.session.add(role)
            click.echo(f'Created role: {role_name}')
        else:
            click.echo(f'Role {role_name} already exists')
    
    db.session.commit()
    click.echo('Role initialization complete!')

def register_commands(app):
    """Register CLI commands with the app"""
    app.cli.add_command(create_superuser)
    app.cli.add_command(init_roles)