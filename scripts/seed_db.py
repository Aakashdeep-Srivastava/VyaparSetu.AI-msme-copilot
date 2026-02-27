#!/usr/bin/env python3
"""
Seed the VyaparSetu AI demo database with sample data.
Loads all JSON seed files and pre-populates the in-memory store
with demo classifications and matches for dashboard display.
"""

import json
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.models.database import add_classification, add_match, classifications_store, matches_store


def load_json(filename: str) -> dict:
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'backend', 'app', 'data')
    filepath = os.path.join(data_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def seed_classifications():
    """Seed demo classifications from demo scenarios."""
    print("Seeding classifications...")

    scenarios = load_json('demo_scenarios.json')

    for scenario in scenarios['scenarios']:
        cls = scenario['expected_classification']
        top = cls['top_3'][0]

        record_id = add_classification({
            'text': scenario['input']['text_en'],
            'category': top['category'],
            'confidence': top['confidence'],
            'band': top['band'],
            'hsn': cls['hsn'],
            'processing_time_ms': 145.2,
            'persona': scenario['persona']['name'],
            'location': scenario['persona']['location'],
        })
        print(f"  Added: {scenario['persona']['name']} -> {top['category']} ({top['band']}) [ID: {record_id}]")

    # Add some synthetic entries for dashboard variety
    synthetic = [
        {'text': 'Hand-embroidered Lucknowi chikankari kurta', 'category': 'Fashion > Ethnic Wear > Embroidered Kurtas', 'confidence': 0.915, 'band': 'GREEN', 'hsn': '6204', 'processing_time_ms': 167.3},
        {'text': 'Handmade terracotta pottery and clay pots', 'category': 'Home & Decor > Pottery > Terracotta', 'confidence': 0.892, 'band': 'GREEN', 'hsn': '6912', 'processing_time_ms': 189.1},
        {'text': 'Jute bags and eco-friendly accessories', 'category': 'Fashion > Accessories > Jute Bags', 'confidence': 0.743, 'band': 'YELLOW', 'hsn': '4602', 'processing_time_ms': 201.5},
        {'text': 'Wooden carved furniture from Saharanpur', 'category': 'Home & Decor > Furniture > Wooden Furniture', 'confidence': 0.878, 'band': 'GREEN', 'hsn': '9403', 'processing_time_ms': 155.8},
        {'text': 'Pashmina shawls from Kashmir', 'category': 'Fashion > Ethnic Wear > Shawls', 'confidence': 0.934, 'band': 'GREEN', 'hsn': '6214', 'processing_time_ms': 132.4},
        {'text': 'Handmade leather shoes', 'category': 'Fashion > Footwear > Leather Shoes', 'confidence': 0.556, 'band': 'RED', 'hsn': '6403', 'processing_time_ms': 245.7},
        {'text': 'Traditional pickles and preserves', 'category': 'Food & Beverages > Pickles & Preserves', 'confidence': 0.812, 'band': 'YELLOW', 'hsn': '2001', 'processing_time_ms': 178.9},
    ]

    for entry in synthetic:
        record_id = add_classification(entry)
        print(f"  Added synthetic: {entry['category'][:40]}... ({entry['band']}) [ID: {record_id}]")

    print(f"\nTotal classifications: {len(classifications_store)}")


def seed_matches():
    """Seed demo matches from demo scenarios."""
    print("\nSeeding matches...")

    scenarios = load_json('demo_scenarios.json')

    for scenario in scenarios['scenarios']:
        matching = scenario['expected_matching']
        top = matching['top_3'][0]

        record_id = add_match({
            'category': scenario['expected_classification']['top_3'][0]['category'],
            'location': scenario['persona']['location'],
            'top_platform': top['platform'],
            'top_score': top['score'],
        })
        print(f"  Added: {scenario['persona']['name']} -> {top['platform']} ({top['score']}) [ID: {record_id}]")

    print(f"\nTotal matches: {len(matches_store)}")


def verify_data():
    """Verify all seed data files exist and are valid."""
    print("\nVerifying seed data files...")

    files = ['platforms_seed.json', 'ondc_categories.json', 'pricing_data.json', 'demo_scenarios.json']

    for filename in files:
        try:
            data = load_json(filename)
            print(f"  ✓ {filename} - loaded successfully")
        except Exception as e:
            print(f"  ✗ {filename} - ERROR: {e}")
            return False

    # Verify platforms count
    platforms = load_json('platforms_seed.json')
    platform_list = platforms.get('platforms', platforms if isinstance(platforms, list) else [])
    print(f"\n  Platforms loaded: {len(platform_list)}")

    # Verify categories
    categories = load_json('ondc_categories.json')
    cat_list = categories.get('categories', [])
    print(f"  L1 Categories: {len(cat_list)}")

    # Verify pricing
    pricing = load_json('pricing_data.json')
    pricing_cats = pricing.get('categories', {})
    print(f"  Pricing categories: {len(pricing_cats)}")

    # Verify scenarios
    scenarios = load_json('demo_scenarios.json')
    scenario_list = scenarios.get('scenarios', [])
    print(f"  Demo scenarios: {len(scenario_list)}")

    return True


def main():
    print("=" * 50)
    print("VyaparSetu AI - Database Seeder")
    print("=" * 50)

    if not verify_data():
        print("\nERROR: Data verification failed. Please check seed data files.")
        sys.exit(1)

    seed_classifications()
    seed_matches()

    print("\n" + "=" * 50)
    print("Seeding complete!")
    print("=" * 50)


if __name__ == '__main__':
    main()
