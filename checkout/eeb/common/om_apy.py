def processar_assinatura(payload):
    if payload.get("type") != "preapproval" or payload.get("action") != "authorized":
        return

    preapproval_id = payload["data"]["id"]
    # Pega detalhes da assinatura
    r = requests.get(f"https://api.mercadopago.com/preapproval/{preapproval_id}",
                     headers={"Authorization": f"Bearer {os.getenv('MP_ACCESS_TOKEN')}"})
    data = r.json()

    nome = data["reason"].split(" | ")[0].strip()
    cursos = data["reason"].split(" | ")[1].split(",")
    whatsapp = data["payer_email"].split("@")[0]

    # Aqui você usa sua lógica já pronta para:
    # 1. criar o aluno (como no seu código)
    # 2. fazer matrícula
    # 3. enviar WhatsApp

    # Exemplo simplificado:
    from .utils import cadastrar_aluno_om, enviar_whatsapp
    aluno_id, login = cadastrar_aluno_om(nome, whatsapp, cursos)
    enviar_whatsapp(whatsapp, nome, login)
