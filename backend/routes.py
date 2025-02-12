from flask import Blueprint, request, jsonify, make_response
from models import db, Product, Entry, Exit, Stock
from sqlalchemy.sql import func
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import io

bp = Blueprint('routes', __name__)
CORS(bp)

@bp.route('/')
def home():
    return "Bem-vindo!"

@bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{'id': product.id, 'name': product.name} for product in products])

@bp.route('/register-product', methods=['POST'])
def register_product():
    data = request.get_json()
    new_product = Product(
        name=data['productName'],
        registration_number=data['registrationNumber'],
        manufacturer=data['manufacturer'],
        product_type=data['productType'],
        description=data['description'],
    )
    db.session.add(new_product)
    db.session.commit()
    
    # Adiciona o produto no estoque com saldo inicial 0
    initial_stock = Stock(product_id=new_product.id, quantity=0)
    db.session.add(initial_stock)
    db.session.commit()
    
    return jsonify('success')

@bp.route('/register-entry', methods=['POST'])
def register_entry():
    data = request.get_json()
    quantity = int(data['quantity'])  # Convertendo para inteiro
    new_entry = Entry(
        product_id=data['selectedProduct'],
        quantity=quantity,
        entry_date=data['entryDate'],
        local=data['local']  # Novo campo
    )
    db.session.add(new_entry)
    db.session.commit()

    # Atualiza o estoque apenas para o produto selecionado
    stock_item = Stock.query.filter_by(product_id=data['selectedProduct']).first()
    if stock_item:
        stock_item.quantity += quantity
    else:
        stock_item = Stock(product_id=data['selectedProduct'], quantity=quantity)
        db.session.add(stock_item)
    db.session.commit()

    return jsonify('success')

@bp.route('/entries', methods=['GET'])
def get_entries():
    entries = Entry.query.all()
    result = []
    for entry in entries:
        product = Product.query.get(entry.product_id)
        result.append({
            'id': entry.id,
            'productName': product.name,
            'quantity': entry.quantity,
            'entryDate': entry.entry_date,
            'local': entry.local
        })
    return jsonify(result)

@bp.route('/register-exit', methods=['POST'])
def register_exit():
    data = request.get_json()
    quantity = int(data['quantity'])  # Convertendo para inteiro
    new_exit = Exit(
        product_id=data['selectedProduct'],
        quantity=quantity,
        exit_date=data['exitDate'],
        local=data['local']  # Novo campo
    )
    db.session.add(new_exit)
    db.session.commit()

    # Atualiza o estoque apenas para o produto selecionado
    stock_item = Stock.query.filter_by(product_id=data['selectedProduct']).first()
    if stock_item:
        stock_item.quantity -= quantity
    else:
        stock_item = Stock(product_id=data['selectedProduct'], quantity=-quantity)
        db.session.add(stock_item)
    db.session.commit()

    return jsonify('success')

@bp.route('/exits', methods=['GET'])
def get_exits():
    exits = Exit.query.all()
    result = []
    for exit in exits:
        product = Product.query.get(exit.product_id)
        result.append({
            'id': exit.id,
            'productName': product.name,
            'quantity': exit.quantity,
            'exitDate': exit.exit_date,
            'local': exit.local
        })
    return jsonify(result)

@bp.route('/stock', methods=['GET'])
def get_stock():
    stock = Stock.query.all()  # Busca todos os itens de estoque diretamente da tabela Stock
    result = [{'product_id': item.product_id, 'product_name': item.product.name, 'quantity': item.quantity} for item in stock]
    return jsonify(result)

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username == 'admin' and password == '172839':  # Exemplo de verificação
        return jsonify('success')
    else:
        return jsonify('fail')

@bp.route('/entry-control', methods=['GET'])
def get_entry_control():
    entries = Entry.query.all()
    result = []
    for entry in entries:
        product = Product.query.get(entry.product_id)
        result.append({
            'id': entry.id,
            'productName': product.name,
            'quantity': entry.quantity,
            'entryDate': entry.entry_date,
            'local': entry.local
        })
    return jsonify(result)

@bp.route('/exit-control', methods=['GET'])
def get_exit_control():
    exits = Exit.query.all()
    result = []
    for exit in exits:
        product = Product.query.get(exit.product_id)
        result.append({
            'id': exit.id,
            'productName': product.name,
            'quantity': exit.quantity,
            'exitDate': exit.exit_date,
            'local': exit.local
        })
    return jsonify(result)

@bp.route('/monthly-data', methods=['GET'])
def get_monthly_data():
    # Consultar somas mensais de entradas
    entries = db.session.query(
        func.date_format(Entry.entry_date, '%Y-%m').label('month'),
        func.sum(Entry.quantity).label('total_quantity')
    ).group_by('month').order_by('month').all()

    # Consultar somas mensais de saídas
    exits = db.session.query(
        func.date_format(Exit.exit_date, '%Y-%m').label('month'),
        func.sum(Exit.quantity).label('total_quantity')
    ).group_by('month').order_by('month').all()

    # Formatar os dados para JSON
    result = {
        'entries': [{'month': entry.month, 'total_quantity': entry.total_quantity} for entry in entries],
        'exits': [{'month': exit.month, 'total_quantity': exit.total_quantity} for exit in exits]
    }
    
    return jsonify(result)

@bp.route('/export-pdf/<int:year>/<int:month>', methods=['GET'])
def export_pdf(year, month):
    entries = db.session.query(Entry).filter(
        func.year(Entry.entry_date) == year, func.month(Entry.entry_date) == month
    ).all()
    exits = db.session.query(Exit).filter(
        func.year(Exit.exit_date) == year, func.month(Exit.exit_date) == month
    ).all()

    # Gerar o PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)

    elements = []

    # Título
    elements.append(Paragraph(f'Relatório Mensal de Entradas e Saídas - {year}/{month:02}', getSampleStyleSheet()['Title']))

    # Entradas
    data = [['Produto', 'Quantidade', 'Data', 'Local']]
    for entry in entries:
        product = Product.query.get(entry.product_id)
        data.append([product.name, entry.quantity, entry.entry_date, entry.local])
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(Paragraph('Entradas', getSampleStyleSheet()['Heading2']))
    elements.append(table)

    # Saídas
    data = [['Produto', 'Quantidade', 'Data', 'Local']]
    for exit in exits:
        product = Product.query.get(exit.product_id)
        data.append([product.name, exit.quantity, exit.exit_date, exit.local])
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(Paragraph('Saídas', getSampleStyleSheet()['Heading2']))
    elements.append(table)

    doc.build(elements)

    buffer.seek(0)
    response = make_response(buffer.read())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=relatorio_mensal_{:02}-{}.pdf'.format(month, year)

    return response
