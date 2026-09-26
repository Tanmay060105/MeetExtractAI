import json
import urllib.request
import urllib.parse
import time
from datetime import datetime

API_URL = "http://127.0.0.1:8000/api/v1"

def request(method, url, data=None, headers=None):
    if headers is None:
        headers = {}
    if data is not None:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
        
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body) if res_body else None
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(res_body)
        except:
            return e.code, res_body

def main():
    u1_email = f"evaltest1_{int(datetime.now().timestamp())}@example.com"
    u2_email = f"evaltest2_{int(datetime.now().timestamp())}@example.com"
    password = "Password123!"

    print("Registering users...")
    request("POST", f"{API_URL}/auth/register", {"email": u1_email, "password": password, "full_name": "Eval Test 1"})
    request("POST", f"{API_URL}/auth/register", {"email": u2_email, "password": password, "full_name": "Eval Test 2"})

    print("Logging in...")
    # Token endpoint expects form data
    form_data1 = urllib.parse.urlencode({"username": u1_email, "password": password}).encode('utf-8')
    req1 = urllib.request.Request(f"{API_URL}/auth/login/access-token", data=form_data1, method="POST")
    req1.add_header("Content-Type", "application/x-www-form-urlencoded")
    with urllib.request.urlopen(req1) as r1:
        t1 = json.loads(r1.read().decode('utf-8'))["access_token"]
    
    form_data2 = urllib.parse.urlencode({"username": u2_email, "password": password}).encode('utf-8')
    req2 = urllib.request.Request(f"{API_URL}/auth/login/access-token", data=form_data2, method="POST")
    req2.add_header("Content-Type", "application/x-www-form-urlencoded")
    with urllib.request.urlopen(req2) as r2:
        t2 = json.loads(r2.read().decode('utf-8'))["access_token"]

    h1 = {"Authorization": f"Bearer {t1}"}
    h2 = {"Authorization": f"Bearer {t2}"}

    _, m_before = request("GET", f"{API_URL}/meetings", headers=h1)
    _, a_before = request("GET", f"{API_URL}/action-items", headers=h1)
    print(f"Meetings Before: {len(m_before)}")
    print(f"Actions Before: {len(a_before)}")

    _, ds_res = request("POST", f"{API_URL}/evaluations/datasets", {"name": "E2E Test Dataset", "version": "1.0"}, headers=h1)
    ds_id = ds_res["id"]
    print(f"Created Dataset: {ds_id}")

    transcript1 = "Bob, please update the marketing deck by Friday. Alice will send the invite today."
    gt1 = {
        "action_items": [
            {"task": "Update the marketing deck", "owner": "Bob", "deadline": "2026-09-28", "status": "PENDING"},
            {"task": "Send the invite", "owner": "Alice", "deadline": "2026-09-25", "status": "PENDING"}
        ]
    }
    request("POST", f"{API_URL}/evaluations/datasets/{ds_id}/samples", {"transcript": transcript1, "ground_truth": gt1}, headers=h1)

    transcript2 = "We need to deploy Phase 11 tomorrow. No specific owner assigned."
    gt2 = {
        "action_items": [
            {"task": "Deploy Phase 11", "owner": None, "deadline": "2026-09-26", "status": "PENDING", "requires_review": True}
        ]
    }
    request("POST", f"{API_URL}/evaluations/datasets/{ds_id}/samples", {"transcript": transcript2, "ground_truth": gt2}, headers=h1)

    print("Triggering run...")
    _, run_res = request("POST", f"{API_URL}/evaluations/runs", {"dataset_id": ds_id}, headers=h1)
    run_id = run_res["id"]
    print(f"Triggered Run: {run_id}")

    status = "PENDING"
    for _ in range(30):
        time.sleep(2)
        _, chk = request("GET", f"{API_URL}/evaluations/runs/{run_id}", headers=h1)
        status = chk["status"]
        if status in ["COMPLETED", "FAILED"]:
            break
    
    print(f"Final Run Status: {status}")

    _, results = request("GET", f"{API_URL}/evaluations/runs/{run_id}/results", headers=h1)
    print(f"EvaluationResult count: {len(results)}")
    
    for i, res in enumerate(results):
        m = res.get("metrics")
        print(f"Sample {i+1} F1: {m.get('f1')} | Precision: {m.get('precision')} | Recall: {m.get('recall')} | Failures: {len(m.get('failures', []))}")
        if m.get('failures'):
            print(f"Failures: {[f['category'] for f in m['failures']]}")

    st1, _ = request("GET", f"{API_URL}/evaluations/datasets/{ds_id}", headers=h2)
    print(f"Isolation check Dataset (User 2) status: {st1}")
    st2, _ = request("GET", f"{API_URL}/evaluations/runs/{run_id}", headers=h2)
    print(f"Isolation check Run (User 2) status: {st2}")

    _, m_after = request("GET", f"{API_URL}/meetings", headers=h1)
    _, a_after = request("GET", f"{API_URL}/action-items", headers=h1)
    print(f"Meetings After: {len(m_after)}")
    print(f"Actions After: {len(a_after)}")

if __name__ == "__main__":
    main()
