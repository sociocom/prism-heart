FROM python:3.8-slim-buster

WORKDIR /usr/src/app
COPY . .

RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /usr/src/app/static
RUN apt-get update && \
    apt-get install -y npm
RUN npm install 

WORKDIR /usr/src/app
RUN pip install --no-cache-dir gunicorn

# subpath /prism-heart を base URL にする
ENV SCRIPT_NAME=/prism-heart

# development: Flask で動かす場合
# CMD [ "python", "app.py" ]

# production: uWSGI で動かす場合
CMD [ "gunicorn", "app:app", "-b", "127.0.0.1:5000" ]
