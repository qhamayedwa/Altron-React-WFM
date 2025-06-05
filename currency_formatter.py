"""
Currency Formatter for South African Rand (ZAR)
Provides consistent currency formatting throughout the WFM system
"""

def format_currency(amount, symbol="R", decimals=2):
    """
    Format currency amount with South African Rand symbol
    
    Args:
        amount (float): The monetary amount to format
        symbol (str): Currency symbol (default: "R" for South African Rand)
        decimals (int): Number of decimal places (default: 2)
    
    Returns:
        str: Formatted currency string (e.g., "R150.75")
    """
    if amount is None:
        return f"{symbol}0.00"
    
    try:
        amount = float(amount)
        return f"{symbol}{amount:,.{decimals}f}"
    except (ValueError, TypeError):
        return f"{symbol}0.00"

def format_currency_input(amount):
    """
    Format currency for form inputs (without symbol)
    
    Args:
        amount (float): The monetary amount
    
    Returns:
        str: Formatted amount without symbol (e.g., "150.75")
    """
    if amount is None:
        return "0.00"
    
    try:
        amount = float(amount)
        return f"{amount:.2f}"
    except (ValueError, TypeError):
        return "0.00"

def parse_currency_input(currency_string):
    """
    Parse currency input string to float
    
    Args:
        currency_string (str): Currency string (e.g., "R150.75" or "150.75")
    
    Returns:
        float: Parsed amount
    """
    if not currency_string:
        return 0.0
    
    # Remove currency symbols and whitespace
    cleaned = str(currency_string).replace("R", "").replace("$", "").replace(",", "").strip()
    
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return 0.0

# Template filter for Jinja2 templates
def currency_filter(amount):
    """Jinja2 template filter for currency formatting"""
    return format_currency(amount)

# Constants for South African Rand
CURRENCY_SYMBOL = "R"
CURRENCY_CODE = "ZAR"
CURRENCY_NAME = "South African Rand"