import os,app

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql://root:!$ip&cont&00@localhost/morningstar'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

app.config.from_object(Config)
