from flask import Flask, request, rendertemplate
import subprocess
import os

app = Flask(name)


@app.route('/')
def index():
    return rendertemplate('index.html')

@app.route('/compile', methods=['POST'])
def compilecode():
    code = request.form['code']
    lang = request.form['lang']

    if lang == 'java':

        if os.path.exists('CodeToCompile.java'):
            os.remove('CodeToCompile.java')

        with open('CodeToCompile.java', 'w') as file:
            file.write(code)

        try:

            result = subprocess.run(['javac', 'CodeToCompile.java'], captureoutput=True, text=True)
            if result.returncode == 0:
                result = subprocess.run(['java', '-cp', '.', 'CodeToCompile'], capture_output=True, text=True,
                                        cwd=os.getcwd())
        except FileNotFoundError:
            result = "Java compiler nicht gefunden, bitte installieren Sie die letzte Version von Java."
    else:

        with open('code_to_compile', 'w') as file:
            file.write(code)

        if lang == 'python':
            result = subprocess.run(['python', 'code_to_compile'], capture_output=True, text=True)
        elif lang == 'html':

            result = subprocess.CompletedProcess(args=[''], returncode=0, stdout=code, stderr='')
        else:
            result = "Fehler beim Programmiersprache Auswahl."

    return result.stdout if result.returncode == 0 else result.stderr


if __name == '__main':
    app.run(debug=True)
