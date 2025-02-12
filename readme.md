# Projeto de Dashboard de Gestão de Estoque

## 📌 Descrição do Projeto

Este projeto é um sistema de gerenciamento de estoque que oferece funcionalidades para cadastrar mercadorias, registrar entradas e saídas de produtos, e gerar relatórios em PDF. Ele proporciona uma interface intuitiva para visualizar dados de estoque em um painel de controle com gráficos e tabelas. O sistema é composto por duas partes principais: o frontend, desenvolvido em React, e o backend, desenvolvido em Flask com MySQL. O objetivo deste projeto é facilitar o gerenciamento e o controle de estoque de uma maneira eficiente e amigável.

### Principais Funcionalidades

- Cadastro de Produtos: Interface para adicionar e gerenciar produtos no estoque.
- Controle de Entradas e Saídas: Registro de movimentações de entrada e saída de produtos.
- Relatórios PDF: Geração de relatórios mensais em formato PDF.
- Painel de Controle: Visualização de dados em gráficos e tabelas interativas.
- Login de Usuário: Autenticação de usuários para acesso seguro ao sistema.

## 🛠 Tecnologias Utilizadas

### Frontend

- **React**: Biblioteca JavaScript para construção de interfaces de usuário.
- **React Router**: Biblioteca para gerenciamento de rotas no React.
- **Axios**: Cliente HTTP baseado em Promises para realizar requisições assíncronas.
- **Bootstrap**: Framework CSS para estilização e componentes responsivos.
- **Chart.js**: Biblioteca JavaScript para criação de gráficos interativos.
- **SweetAlert2**: Biblioteca para modais e alertas personalizáveis.

### Backend

- **Flask**: Framework web para Python.
- **MySQL**: Sistema de gerenciamento de banco de dados relacional.
- **SQLAlchemy**: ORM para Python que facilita o uso do MySQL.

### Ferramentas de Desenvolvimento

- **MySQL Workbench**: Ferramenta visual para administração de bancos de dados MySQL.
- **Visual Studio Code**: Editor de código-fonte.
- **npm**: Gerenciador de pacotes para Node.js (utilizado no frontend).

## 🏗 Passo a Passo para Rodar o Backend e Frontend

### Backend

1. Faça o download do código-fonte e extraia os arquivos.
2. Acesse a pasta do backend:
   ```sh
   cd backend
3. python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
4. pip install -r requirements.txt
5. DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=nome_do_banco_de_dados
6. flask run

### Frontend

1. Acesse a pasta do frontend:
   ```sh
   cd frontend
2. npm install
3. npm start

### Instruções para Restaurar o Banco de Dados

1. Abra o MySQL Workbench e conecte-se ao servidor de banco de dados.
2. Clique em Server > Data Import.
3. Selecione Import from Self-Contained File e escolha o arquivo de backup do banco de dados.
4. Selecione o esquema de destino (nome_do_banco_de_dados).
5. Clique em Start Import para iniciar a importação do banco de dados.
