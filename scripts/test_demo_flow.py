#!/usr/bin/env python3
"""
Test all 3 demo scenarios end-to-end.
Verifies classification, matching, and pricing for each persona.
Run the FastAPI server first: uvicorn app.main:app --reload
"""

import asyncio
import json
import os
import sys
import time

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Try HTTP testing first, fall back to direct imports
USE_HTTP = False
API_BASE = os.getenv('API_BASE_URL', 'http://localhost:8000')

try:
    import httpx
    USE_HTTP = True
except ImportError:
    pass


def load_scenarios():
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'backend', 'app', 'data')
    with open(os.path.join(data_dir, 'demo_scenarios.json'), 'r', encoding='utf-8') as f:
        return json.load(f)['scenarios']


async def test_classify_http(client, scenario):
    """Test classification via HTTP API."""
    response = await client.post(f'{API_BASE}/api/catalog/classify', json={
        'text': scenario['input']['text_hi'] if scenario['persona']['language'] == 'hi' else scenario['input']['text_en'],
        'language': scenario['persona']['language'],
    })
    assert response.status_code == 200, f"Classification failed: {response.status_code}"
    return response.json()


async def test_match_http(client, category, scenario):
    """Test matching via HTTP API."""
    response = await client.post(f'{API_BASE}/api/match/recommend', json={
        'product_category': category,
        'product_description': scenario['input']['text_en'],
        'location': scenario['persona']['location'],
        'language': scenario['persona']['language'],
        'business_type': scenario['persona']['business_type'],
        'lat': scenario['persona']['lat'],
        'lon': scenario['persona']['lon'],
    })
    assert response.status_code == 200, f"Matching failed: {response.status_code}"
    return response.json()


async def test_pricing_http(client, category):
    """Test pricing via HTTP API."""
    response = await client.get(f'{API_BASE}/api/intelligence/pricing/{category}')
    assert response.status_code == 200, f"Pricing failed: {response.status_code}"
    return response.json()


async def test_classify_direct(scenario):
    """Test classification via direct import."""
    from app.services.catalog_ai import classify_product
    text = scenario['input']['text_hi'] if scenario['persona']['language'] == 'hi' else scenario['input']['text_en']
    result = await classify_product(text=text, language=scenario['persona']['language'])
    return json.loads(result.model_dump_json())


async def test_match_direct(category, scenario):
    """Test matching via direct import."""
    from app.services.matchmaker import recommend_platforms
    result = await recommend_platforms(
        product_category=category,
        product_description=scenario['input']['text_en'],
        location=scenario['persona']['location'],
        language=scenario['persona']['language'],
        business_type=scenario['persona']['business_type'],
        lat=scenario['persona']['lat'],
        lon=scenario['persona']['lon'],
    )
    return json.loads(result.model_dump_json())


async def test_pricing_direct(category):
    """Test pricing via direct import."""
    from app.services.pricewise import get_pricing_intelligence
    return await get_pricing_intelligence(category=category)


async def run_scenario(scenario, use_http=False, client=None):
    """Run a complete demo scenario test."""
    persona = scenario['persona']
    expected = scenario['expected_classification']
    expected_match = scenario['expected_matching']

    print(f"\n{'='*60}")
    print(f"SCENARIO: {persona['name']} - {persona['location']}")
    print(f"Language: {persona['language']} | Business: {persona['business_type']}")
    print(f"Input: {scenario['input']['text_en'][:80]}...")
    print(f"{'='*60}")

    results = {'classify': False, 'match': False, 'pricing': False}
    total_time = 0

    # 1. Test Classification
    print(f"\n[1/3] Testing Classification...")
    start = time.time()
    try:
        if use_http:
            cls_result = await test_classify_http(client, scenario)
        else:
            cls_result = await test_classify_direct(scenario)

        elapsed = (time.time() - start) * 1000
        total_time += elapsed

        top_cat = cls_result['top_categories'][0]
        expected_cat = expected['top_3'][0]['category']
        expected_conf = expected['top_3'][0]['confidence']

        cat_match = top_cat['category'] == expected_cat
        conf_close = abs(top_cat['confidence'] - expected_conf) < 0.05

        print(f"  Category: {top_cat['category']}")
        print(f"  Expected: {expected_cat}")
        print(f"  Match: {'✓' if cat_match else '✗'}")
        print(f"  Confidence: {top_cat['confidence']:.3f} (expected {expected_conf:.3f}) {'✓' if conf_close else '~'}")
        print(f"  Band: {top_cat['band']}")
        print(f"  HSN: {cls_result['hsn_code']} (expected {expected['hsn']})")
        print(f"  Time: {elapsed:.0f}ms")

        if cls_result.get('translated_text'):
            print(f"  Translation: {cls_result['translated_text'][:60]}...")

        results['classify'] = cat_match
    except Exception as e:
        print(f"  ERROR: {e}")

    # 2. Test Matching
    print(f"\n[2/3] Testing Matching...")
    start = time.time()
    try:
        category = cls_result['top_categories'][0]['category'] if results['classify'] else expected['top_3'][0]['category']

        if use_http:
            match_result = await test_match_http(client, category, scenario)
        else:
            match_result = await test_match_direct(category, scenario)

        elapsed = (time.time() - start) * 1000
        total_time += elapsed

        top_platform = match_result['top_platforms'][0]
        expected_platform = expected_match['top_3'][0]['platform']
        expected_score = expected_match['top_3'][0]['score']

        platform_match = top_platform['platform'] == expected_platform
        score_close = abs(top_platform['score'] - expected_score) < 0.1

        print(f"  Top Platform: {top_platform['platform']} (score: {top_platform['score']:.2f})")
        print(f"  Expected: {expected_platform} (score: {expected_score:.2f})")
        print(f"  Match: {'✓' if platform_match else '✗'}")
        print(f"  Score close: {'✓' if score_close else '~'}")
        print(f"  Factors: D={top_platform['factors']['domain']:.2f} G={top_platform['factors']['geography']:.2f} C={top_platform['factors']['capacity']:.2f} H={top_platform['factors']['history']:.2f} S={top_platform['factors']['specialization']:.2f}")
        all_plats = ', '.join(p['platform'] + '(' + f"{p['score']:.2f}" + ')' for p in match_result['top_platforms'])
        print(f"  All platforms: {all_plats}")
        print(f"  Time: {elapsed:.0f}ms")

        results['match'] = platform_match
    except Exception as e:
        print(f"  ERROR: {e}")

    # 3. Test Pricing
    print(f"\n[3/3] Testing Pricing...")
    start = time.time()
    try:
        category = cls_result['top_categories'][0]['category'] if results['classify'] else expected['top_3'][0]['category']

        if use_http:
            pricing_result = await test_pricing_http(client, category)
        else:
            pricing_result = await test_pricing_direct(category)

        elapsed = (time.time() - start) * 1000
        total_time += elapsed

        has_insight = pricing_result.get('insight') is not None
        has_trends = len(pricing_result.get('demand_trends', [])) > 0

        print(f"  Category: {pricing_result.get('category', 'N/A')}")
        print(f"  Has insight: {'✓' if has_insight else '✗'}")
        print(f"  Has demand trends: {'✓' if has_trends else '✗'}")
        if has_insight:
            ins = pricing_result['insight']
            print(f"  Product: {ins.get('product')}")
            print(f"  Your price: ₹{ins.get('your_price')}")
            print(f"  Median: ₹{ins.get('category_median')}")
            print(f"  Position: {ins.get('price_position')}")
        print(f"  Peak season: {pricing_result.get('peak_season', 'N/A')}")
        print(f"  Time: {elapsed:.0f}ms")

        results['pricing'] = has_insight or has_trends
    except Exception as e:
        print(f"  ERROR: {e}")

    # Summary
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"\n  RESULT: {passed}/{total} tests passed | Total time: {total_time:.0f}ms")
    return results


async def test_dashboard(use_http=False, client=None):
    """Test the admin dashboard endpoint."""
    print(f"\n{'='*60}")
    print("DASHBOARD TEST")
    print(f"{'='*60}")

    try:
        if use_http:
            response = await client.get(f'{API_BASE}/api/admin/dashboard')
            assert response.status_code == 200
            data = response.json()
        else:
            from app.models.database import get_dashboard_data
            data = get_dashboard_data()

        print(f"  Total onboarded: {data.get('total_onboarded', 0)}")
        print(f"  Avg confidence: {data.get('avg_confidence', 0):.3f}")
        print(f"  Band distribution: {data.get('band_distribution', {})}")
        print(f"  Recent entries: {len(data.get('recent_classifications', []))}")
        print(f"  ✓ Dashboard working")
        return True
    except Exception as e:
        print(f"  ✗ Dashboard error: {e}")
        return False


async def main():
    print("=" * 60)
    print("VyaparSetu AI - Demo Flow Test")
    print("=" * 60)

    scenarios = load_scenarios()
    print(f"Loaded {len(scenarios)} demo scenarios")

    all_results = []

    use_http = False
    if USE_HTTP:
        print(f"\nTesting via HTTP API at {API_BASE}")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(f'{API_BASE}/health')
                print(f"Health check: {resp.json()}")
                use_http = True
                for scenario in scenarios:
                    result = await run_scenario(scenario, use_http=True, client=client)
                    all_results.append(result)
                await test_dashboard(use_http=True, client=client)
        except Exception as e:
            print(f"Server not running at {API_BASE}: {e}")
            print("Falling back to direct import testing...")

    if not use_http:
        if not USE_HTTP:
            print("\nTesting via direct import (httpx not installed)")
        for scenario in scenarios:
            result = await run_scenario(scenario, use_http=False)
            all_results.append(result)
        await test_dashboard(use_http=False)

    # Final summary
    print(f"\n{'='*60}")
    print("FINAL SUMMARY")
    print(f"{'='*60}")
    total_tests = 0
    total_passed = 0
    for i, (scenario, result) in enumerate(zip(scenarios, all_results)):
        passed = sum(1 for v in result.values() if v)
        total = len(result)
        total_tests += total
        total_passed += passed
        status = '✓ PASS' if passed == total else '~ PARTIAL' if passed > 0 else '✗ FAIL'
        print(f"  {scenario['persona']['name']}: {passed}/{total} {status}")

    print(f"\n  OVERALL: {total_passed}/{total_tests} tests passed")
    if total_passed == total_tests:
        print("  🎉 All tests passed!")
    else:
        print(f"  ⚠ {total_tests - total_passed} tests need attention")


if __name__ == '__main__':
    asyncio.run(main())
