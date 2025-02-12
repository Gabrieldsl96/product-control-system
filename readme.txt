- Abrir o venv no diretório Projetos: venv\Scripts\activate
- Para desativar o venv: deactivate

- Abrir um terminal, ir ate a pasta backend pelo venv e rodar o código: "python app.py" para iniciar o servidor de backend

- Depois abrir outro terminal, ir ate a pasta front end pelo venv e rodar o código: "npm start" para rodar o servidor do react



BANCO DE DADOS

- Para migrar os dados para o banco de dados, primeiramente no app.py tem que incluir:
db.init_app(app)
migrate = Migrate(app, db)

- Criar o arquivo wsgi.py no diretório backend:
from app import app

if __name__ == "__main__":
    app.run()


- Abrir o venv no terminal e ir ate o diretório backend e rodar este código: "flask db init"
- Depois "flask db migrate -m "Initial migration."
- Depois "flask db upgrade"