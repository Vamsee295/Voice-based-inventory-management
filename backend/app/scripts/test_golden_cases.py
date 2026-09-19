import requests
import json

TESTS = [
    "Add 3 bags of rice",
    "Remove 5 packets of sugar",
    "Add rice",
    "Add 2 bags xyz123",
    "Remove 999999 kg rice",
    "Rice entha undi?",
    "Which items are low?",
    "What expires this week?",
    "Show me today's stock movements"
]

def run():
    for text in TESTS:
        print(f"=== TEST: '{text}' ===")
        try:
            r = requests.post("http://localhost:8000/api/voice/interpret", json={"text": text}, timeout=15)
            cmd = r.json()
            print(f"  INTERPRET -> intent: {cmd.get('intent')}, product: {cmd.get('product_query')}, qty: {cmd.get('quantity')}, unit: {cmd.get('unit')}, clarif: {cmd.get('clarification_required')}")
            
            r2 = requests.post("http://localhost:8000/api/voice/preview", json={"command": cmd}, timeout=10)
            prev = r2.json()
            print(f"  PREVIEW   -> status: {prev.get('status')}, message: {prev.get('message')}")
            if prev.get("product"):
                print(f"               product: {prev['product']['name']}, current: {prev.get('current_stock')}, projected: {prev.get('projected_stock')}, tune: {prev.get('tune_note')}")
        except Exception as e:
            print(f"  ERROR: {e}")
        print()

if __name__ == "__main__":
    run()
