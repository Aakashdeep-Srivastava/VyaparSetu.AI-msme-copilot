# VyaparSetu AI

> AI-Powered Commerce Intelligence Copilot for Indian MSMEs

**Team:** XphoraAI (Beta Up Your Mind!)  
**Members:** Suchi Bansal, Aakashdeep Srivastava, Vishalika Choraria
**Hackathon:** AI for Bharat 2026 — Retail, Commerce & Marketplace AI Track  
**Powered by:** AWS

---

## Problem

India's 6.3 crore MSMEs contribute 30% of GDP, yet <10% have a meaningful digital commerce presence. The barriers aren't connectivity — they're intelligence: manual catalog creation, marketplace selection by guesswork, and zero access to market intelligence.

## Solution

VyaparSetu AI is a three-module AI system built on AWS:

| Module | What It Does | Key Tech |
|--------|-------------|----------|
| **CatalogAI** | Transforms raw product descriptions into structured, marketplace-ready catalogs | SageMaker (fine-tuned BERT) + Comprehend + Translate |
| **MatchMaker** | Recommends best-fit marketplace platforms using multi-factor scoring | SageMaker (bi-encoder) + Lambda (composite scoring) |
| **PriceWise** | Real-time pricing intelligence and demand forecasting | Bedrock (Claude) + Amazon Forecast |

## Key Metrics

- **>95%** product categorization accuracy (vs ~60% baseline)
- **>0.80** NDCG@3 matching quality (vs ~0.45 baseline)
- **<15 min** catalog creation (vs 2-4 hours manual)
- **>75%** first-time marketplace-fit accuracy

## Architecture

```
User (React/WhatsApp) → API Gateway → Step Functions Orchestrator
    → CatalogAI (SageMaker) → MatchMaker (SageMaker + Lambda)
    → PriceWise (Bedrock + Forecast) → Dashboard (QuickSight)
```

All AWS. All serverless. All data in Mumbai region (ap-south-1).

## Repository Structure

```
├── requirements.md          # Product requirements (Kiro-generated)
├── design.md                # System design (Kiro-generated)
├── README.md                # This file
├── docs/
│   └── architecture/        # Architecture diagrams
├── backend/                 # FastAPI + Lambda handlers
├── ml/                      # SageMaker training pipelines
├── frontend/                # React dashboard (Amplify)
└── infra/                   # CDK/CloudFormation templates
```

## Submission Files

- ✅ `requirements.md` — Generated via Kiro Spec > Design flow
- ✅ `design.md` — Generated via Kiro Spec > Design flow
- ✅ Presentation deck (PDF) — Submitted separately

---

*Built with ❤️ for India's MSMEs at AI for Bharat 2026*
