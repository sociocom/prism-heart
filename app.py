import json
import os

import requests
from flask import Flask, make_response, render_template, request, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
# app.url_prefix = os.environ.get("SCRIPT_NAME", "/")

CORS(app)
UPLOAD_FOLDER = "./uploads"
API_URL = "https://aoi.naist.jp/heart-api"

ALLOWED_EXTENSIONS = set(["json"])
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["SECRET_KEY"] = os.urandom(24)


@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response


@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)


def dated_url_for(endpoint, **values):
    if endpoint == "static":
        filename = values.get("filename", None)
        if filename:
            file_path = os.path.join(app.root_path, endpoint, filename)
            values["q"] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1] in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/upload", methods=["GET", "POST"])
def show_csv():
    if request.method == "POST":
        send_data = request.files["send_data"]
        if send_data and allowed_file(send_data.filename):
            filename = secure_filename(send_data.filename)
            send_data.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

            path = "uploads/" + filename
            f = open(path, "r")

            with open(path, encoding="utf-8") as f:
                s = f.read()
                d = json.loads(s)

                return make_response(json.dumps(d, ensure_ascii=False))

    else:
        filename = request.args.get("file", "")

        path = "data/" + filename

        print(path)

        f = open(path, "r")

        with open(path, encoding="utf-8") as f:
            s = f.read()
            d = json.loads(s)

            return make_response(json.dumps(d, ensure_ascii=False))

    return render_template("index.html")


@app.route("/text", methods=["POST"])
def use_api():
    data = request.json
    print(request.json)

    text = None
    dct = ""
    if "text" in data:
        text = data["text"]
    if text is None or len(text) == 0:
        d = {"result": "ng", "message": "テキストを入力してください"}
        return make_response(json.dumps(d, ensure_ascii=False))

    if dct in data:
        dct = data["dct"]

    d = {"result": "ok"}

    res_data = post_api(text, dct)

    return make_response(json.dumps(res_data, ensure_ascii=False))


def post_api(text, dict):
    json_data = {"text": text, "dct": dict}

    try:
        response = requests.post(API_URL, data=json.dumps(json_data))
        res_data = response.json()
        return res_data

    except Exception as e:
        return {"status": "Failure", "message": str(e)}


if __name__ == "__main__":
    app.debug = True
    app.run(host="0.0.0.0", port=5000)
