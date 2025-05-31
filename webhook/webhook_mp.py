from fastapi import APIRouter, HTTPException
import httpx, os, structlog

router = APIRouter()
log = structlog.get_logger()

MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN")
MP_BASE_URL     = "https://api.mercadopago.com"
MATRICULAR_URL  = "https://www.cedbrasilia.com.br/matricular"

@router.post("/webhook/mp")
async def webhook_mp(evento: dict):
    """
    Rota que o Mercado Pago chama quando um pagamento muda de status.
    Se estiver aprovado, envia os dados do aluno para /matricular.
    """
    if evento.get("type") not in ["payment", "subscription_payment"]:
        return {"msg": "evento ignorado"}

    payment_id = evento["data"].get("id")
    if not payment_id:
        log.error("ID de pagamento ausente no evento", evento=evento)
        raise HTTPException(400, "ID de pagamento ausente")

    headers = {"Authorization": f"Bearer {MP_ACCESS_TOKEN}"}

    # Consulta os dados do pagamento ou assinatura
    async with httpx.AsyncClient(http2=True) as client:
        resp = await client.get(f"{MP_BASE_URL}/v1/payments/{payment_id}", headers=headers)
        if resp.status_code != 200:
            log.error("Pagamento não encontrado", id=payment_id)
            raise HTTPException(400, "Pagamento não encontrado")
        pay = resp.json()

    # Ignora pagamentos não aprovados
    if pay["status"] != "approved":
        return {"msg": "Pagamento não aprovado"}

    # Extrai os dados salvos no metadata
    meta = pay.get("metadata", {})
    payload = {
        "nome":     meta.get("nome"),
        "email":    meta.get("email"),
        "whatsapp": meta.get("whatsapp"),
        "plano":    "mensal",
        "valor":    59.90
    }

    # Chama o endpoint de matrícula com os dados do aluno
    async with httpx.AsyncClient(http2=True, timeout=15) as client:
        r = await client.post(MATRICULAR_URL, json=payload)
        if r.status_code >= 300:
            log.error("Falha matrícula", status=r.status_code, body=r.text)
            raise HTTPException(500, "Falha ao matricular aluno")

    return {"msg": "Aluno matriculado com sucesso"}
