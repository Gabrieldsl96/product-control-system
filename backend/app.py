from flask import Flask
from flask_cors import CORS
from models import db
from routes import bp as routes_blueprint
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app)  # Habilita o CORS para permitir requisições do frontend React
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:!$ip&cont&00@localhost/morningstar'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

# Registro do blueprint das rotas
app.register_blueprint(routes_blueprint)

if __name__ == '__main__':
    app.run(debug=True)
