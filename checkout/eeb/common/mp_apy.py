import requests
import os
import json

ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN")

def criar_assinatura(nome, whatsapp, cursos):
    # Exemplo de plano único com 5 dias grátis
    plano = {
        "reason": f"{nome} | {', '.join(cursos)}",
        "auto_recurring": {
            "frequency": 1,
            "frequency_type": "months",
            "transaction_amount": 49.90,
            "currency_id": "BRL",
            "free_trial": {
                "frequency": 5,
                "frequency_type": "days"
            }
        },
        "payer_email": f"{whatsapp}@ced.com"
    }

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    r = requests.post("https://api.mercadopago.com/preapproval", json=plano, headers=headers)
    data = r.json()
    return redirect(data["init_point"])
