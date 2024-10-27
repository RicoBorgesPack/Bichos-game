from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import uuid

app = Flask(__name__)
CORS(app)

# Armazena as apostas e o saldo de cada usuário
apostas = []
saldos = {}

# Função mock para simular a criação de um invoice LDK
def criar_invoice_mock(usuario, valor_btc):
    invoice_id = str(uuid.uuid4())
    # Simula um "invoice" com dados básicos
    invoice = {
        "invoice_id": invoice_id,
        "usuario": usuario,
        "valor_btc": valor_btc,
        "status": "pending"
    }
    return invoice

# Função mock para simular o pagamento de um invoice LDK
def pagar_invoice_mock(invoice_id):
    # Procura a aposta com o invoice correspondente
    for aposta in apostas:
        if aposta['invoice']['invoice_id'] == invoice_id:
            aposta['invoice']['status'] = "paid"
            usuario = aposta['usuario']
            valor_btc = aposta['invoice']['valor_btc']
            saldos[usuario] = saldos.get(usuario, 0) - valor_btc
            return True
    return False

@app.route('/aposta', methods=['POST'])
def registrar_aposta():
    data = request.json
    usuario = data.get('usuario')
    numero_animal = data.get('numero_animal')
    valor_btc = data.get('valor_btc')

    if usuario and numero_animal and valor_btc:
        invoice = criar_invoice_mock(usuario, valor_btc)
        aposta = {
            "usuario": usuario,
            "numero_animal": numero_animal,
            "valor_btc": valor_btc,
            "invoice": invoice
        }
        apostas.append(aposta)
        
        saldos[usuario] = saldos.get(usuario, 0) + valor_btc
        return jsonify({
            "message": "Aposta registrada com sucesso!",
            "invoice": invoice
        }), 200
    else:
        return jsonify({"error": "Dados incompletos para registrar aposta."}), 400

@app.route('/pagamento', methods=['POST'])
def confirmar_pagamento():
    data = request.json
    invoice_id = data.get('invoice_id')

    if not invoice_id:
        return jsonify({"error": "Invoice ID não fornecido."}), 400

    pagamento_sucesso = pagar_invoice_mock(invoice_id)

    if pagamento_sucesso:
        return jsonify({"message": "Pagamento confirmado com sucesso!"}), 200
    else:
        return jsonify({"error": "Pagamento não encontrado ou já realizado."}), 404

@app.route('/sorteio', methods=['POST'])
def realizar_sorteio():
    numero_sorteado = random.randint(1, 25)  # Simula sorteio de número de 1 a 25
    vencedores = [aposta for aposta in apostas if aposta["numero_animal"] == numero_sorteado and aposta['invoice']['status'] == "paid"]

    # Distribuir prêmios para os vencedores
    premio_total = sum(aposta['valor_btc'] for aposta in vencedores)
    premio_por_vencedor = premio_total / len(vencedores) if vencedores else 0

    for aposta in vencedores:
        usuario = aposta['usuario']
        saldos[usuario] = saldos.get(usuario, 0) + premio_por_vencedor

    return jsonify({
        "numero_sorteado": numero_sorteado,
        "vencedores": [{"usuario": aposta["usuario"], "premio": premio_por_vencedor} for aposta in vencedores]
    }), 200

@app.route('/saldo/<usuario>', methods=['GET'])
def verificar_saldo(usuario):
    saldo = saldos.get(usuario, 0)
    return jsonify({"usuario": usuario, "saldo": saldo}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)
