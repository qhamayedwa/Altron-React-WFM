from flask import Blueprint, render_template_string
from flask_login import login_required, current_user

debug_bp = Blueprint('debug', __name__, url_prefix='/debug')

@debug_bp.route('/roles')
@login_required
def debug_roles():
    """Debug page to check user roles"""
    
    roles_list = [role.name for role in current_user.roles] if current_user.roles else []
    
    debug_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Role Debug</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .debug-info { background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <h1>User Role Debug Information</h1>
        
        <div class="debug-info">
            <h3>Current User Info:</h3>
            <p><strong>Username:</strong> {{ current_user.username }}</p>
            <p><strong>User ID:</strong> {{ current_user.id }}</p>
            <p><strong>Tenant ID:</strong> {{ current_user.tenant_id }}</p>
            <p><strong>Is Authenticated:</strong> {{ current_user.is_authenticated }}</p>
        </div>
        
        <div class="debug-info">
            <h3>Roles:</h3>
            <p><strong>All Roles:</strong> {{ roles_list }}</p>
            <p><strong>Has 'system_super_admin' role:</strong> {{ current_user.has_role('system_super_admin') }}</p>
            <p><strong>is_system_super_admin() method:</strong> {{ current_user.is_system_super_admin() }}</p>
        </div>
        
        <div class="debug-info">
            <h3>Role Tests:</h3>
            {% if current_user.has_role('system_super_admin') %}
                <p style="color: green;">✓ current_user.has_role('system_super_admin') = TRUE</p>
            {% else %}
                <p style="color: red;">✗ current_user.has_role('system_super_admin') = FALSE</p>
            {% endif %}
            
            {% if current_user.is_system_super_admin() %}
                <p style="color: green;">✓ current_user.is_system_super_admin() = TRUE</p>
            {% else %}
                <p style="color: red;">✗ current_user.is_system_super_admin() = FALSE</p>
            {% endif %}
        </div>
        
        <div class="debug-info">
            <h3>Menu Visibility Test:</h3>
            {% if current_user.has_role('system_super_admin') %}
                <p style="color: green;">✓ System Administration menu SHOULD be visible</p>
            {% else %}
                <p style="color: red;">✗ System Administration menu will NOT be visible</p>
            {% endif %}
        </div>
        
        <a href="{{ url_for('main.index') }}">← Back to Dashboard</a>
    </body>
    </html>
    """
    
    return render_template_string(debug_html, roles_list=roles_list)