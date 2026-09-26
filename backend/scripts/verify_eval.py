import asyncio
import os
import httpx
from datetime import datetime

API_URL = "http://localhost:8000/api/v1"

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Register test users
        u1_email = f"evaltest1_{int(datetime.now().timestamp())}@example.com"
        u2_email = f"evaltest2_{int(datetime.now().timestamp())}@example.com"
        password = "Password123!"

        await client.post(f"{API_URL}/auth/register", json={
            "email": u1_email, "password": password, "full_name": "Eval Test 1"
        })
        await client.post(f"{API_URL}/auth/register", json={
            "email": u2_email, "password": password, "full_name": "Eval Test 2"
        })

        # Login
        r1 = await client.post(f"{API_URL}/auth/login", data={"username": u1_email, "password": password})
        t1 = r1.json()["access_token"]
        h1 = {"Authorization": f"Bearer {t1}"}

        r2 = await client.post(f"{API_URL}/auth/login", data={"username": u2_email, "password": password})
        t2 = r2.json()["access_token"]
        h2 = {"Authorization": f"Bearer {t2}"}

        # Check DB pollution Before
        m_before = (await client.get(f"{API_URL}/meetings", headers=h1)).json()
        a_before = (await client.get(f"{API_URL}/action-items", headers=h1)).json()
        print(f"Meetings Before: {len(m_before)}")
        print(f"Actions Before: {len(a_before)}")

        # Create Dataset
        ds_res = await client.post(f"{API_URL}/evaluations/datasets", json={
            "name": "E2E Test Dataset",
            "version": "1.0"
        }, headers=h1)
        ds_id = ds_res.json()["id"]
        print(f"Created Dataset: {ds_id}")

        # Add Samples
        transcript1 = "Bob, please update the marketing deck by Friday. Alice will send the invite today."
        gt1 = {
            "action_items": [
                {
                    "task": "Update the marketing deck",
                    "owner": "Bob",
                    "deadline": "2026-09-28",
                    "status": "PENDING"
                },
                {
                    "task": "Send the invite",
                    "owner": "Alice",
                    "deadline": "2026-09-25",
                    "status": "PENDING"
                }
            ]
        }
        await client.post(f"{API_URL}/evaluations/datasets/{ds_id}/samples", json={
            "transcript": transcript1, "ground_truth": gt1
        }, headers=h1)

        transcript2 = "We need to deploy Phase 11 tomorrow. No specific owner assigned."
        gt2 = {
            "action_items": [
                {
                    "task": "Deploy Phase 11",
                    "owner": None,
                    "deadline": "2026-09-26",
                    "status": "PENDING",
                    "requires_review": True
                }
            ]
        }
        await client.post(f"{API_URL}/evaluations/datasets/{ds_id}/samples", json={
            "transcript": transcript2, "ground_truth": gt2
        }, headers=h1)

        # Trigger Run
        run_res = await client.post(f"{API_URL}/evaluations/runs", json={
            "dataset_id": ds_id
        }, headers=h1)
        run_id = run_res.json()["id"]
        print(f"Triggered Run: {run_id}")

        # Wait for run to complete
        status = "PENDING"
        for _ in range(15):
            await asyncio.sleep(2)
            chk = await client.get(f"{API_URL}/evaluations/runs/{run_id}", headers=h1)
            status = chk.json()["status"]
            if status in ["COMPLETED", "FAILED"]:
                break
        
        print(f"Final Run Status: {status}")

        # Get Results
        results = (await client.get(f"{API_URL}/evaluations/runs/{run_id}/results", headers=h1)).json()
        print(f"EvaluationResult count: {len(results)}")
        
        # Calculate overall metrics roughly to print
        for i, res in enumerate(results):
            m = res.get("metrics")
            print(f"Sample {i+1} F1: {m.get('f1')} | Precision: {m.get('precision')} | Recall: {m.get('recall')} | Failures: {len(m.get('failures', []))}")
            if m.get('failures'):
                print(f"Failures: {[f['category'] for f in m['failures']]}")

        # Isolation check
        try:
            iso_res = await client.get(f"{API_URL}/evaluations/datasets/{ds_id}", headers=h2)
            print(f"Isolation check Dataset (User 2): {iso_res.status_code}")
        except Exception as e:
            print("Isolation check Dataset error:", str(e))
            
        try:
            iso_res2 = await client.get(f"{API_URL}/evaluations/runs/{run_id}", headers=h2)
            print(f"Isolation check Run (User 2): {iso_res2.status_code}")
        except Exception as e:
            print("Isolation check Run error:", str(e))

        # Check DB pollution After
        m_after = (await client.get(f"{API_URL}/meetings", headers=h1)).json()
        a_after = (await client.get(f"{API_URL}/action-items", headers=h1)).json()
        print(f"Meetings After: {len(m_after)}")
        print(f"Actions After: {len(a_after)}")

if __name__ == "__main__":
    asyncio.run(main())
