# Design: VyaparSetu AI

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER CHANNELS                               │
│  ┌──────────────┐   ┌──────────────────────────────────────┐    │
│  │  WhatsApp     │   │  React Dashboard (AWS Amplify)       │    │
│  │  Business API │   │  - Product Upload   - Admin Panel    │    │
│  │  (Future)     │   │  - Category View    - Analytics      │    │
│  └──────┬───────┘   └──────────────┬───────────────────────┘    │
│         │                           │                            │
│         └─────────┬─────────────────┘                            │
│                   ▼                                              │
│         ┌─────────────────┐                                      │
│         │  Amazon API      │  Auth (Cognito) + Rate Limiting     │
│         │  Gateway         │                                      │
│         └────────┬────────┘                                      │
└──────────────────┼──────────────────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              AWS STEP FUNCTIONS ORCHESTRATOR                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  State Machine: INPUT → CATALOG → MATCH → INTEL → OUT  │     │
│  │  + Confidence Routing  + Audit Trail  + Error Recovery  │     │
│  └────────────────────────────────────────────────────────┘     │
│         │                │                  │                    │
│         ▼                ▼                  ▼                    │
│  ┌──────────┐    ┌──────────┐      ┌──────────────┐            │
│  │ CatalogAI│    │MatchMaker│      │  PriceWise   │            │
│  │ Module   │    │ Module   │      │  Module      │            │
│  │          │    │          │      │              │            │
│  │ SageMaker│    │ SageMaker│      │ Bedrock +    │            │
│  │ +Compreh.│    │ +Lambda  │      │ Forecast     │            │
│  │ +Translt.│    │          │      │              │            │
│  └──────────┘    └──────────┘      └──────────────┘            │
└──────────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER (AWS)                              │
│  ┌──────────┐  ┌──────────┐  ┌──────┐  ┌──────┐  ┌─────────┐  │
│  │ RDS      │  │OpenSearch│  │Redis │  │  S3  │  │QuickSight│  │
│  │PostgreSQL│  │ Catalog  │  │Cache │  │ Lake │  │Analytics │  │
│  └──────────┘  └──────────┘  └──────┘  └──────┘  └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Design

#### 1. CatalogAI — Intelligent Product Cataloging

**Purpose**: Transform raw multilingual product descriptions into structured, marketplace-ready catalog entries.

**Processing Pipeline**:
```
Raw Input (Hindi/English text)
    │
    ▼
┌──────────────────────┐
│ Amazon Transcribe     │  (if voice input)
│ Hindi + English STT   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Amazon Comprehend     │  Language Detection
│ detect_dominant_lang  │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Amazon Translate      │  → English (if Hindi input)
│ Context-preserving    │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Amazon Comprehend     │  Named Entity Recognition
│ Custom NER model      │  → Product, Brand, Attributes
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ SageMaker Endpoint    │  Fine-tuned Multilingual BERT
│ Product Classifier    │  → Top-3 Categories + Softmax
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Attribute Extractor   │  Schema mapping + HSN Code
│ + Catalog Generator   │  → Marketplace-Ready JSON
└──────────────────────┘
```

**Model Details**:
- **Base model**: Multilingual BERT (bert-base-multilingual-cased)
- **Training**: Fine-tuned on 50K+ product-category pairs using SageMaker Training Jobs
- **Hyperparameter tuning**: SageMaker Automatic Model Tuning (Bayesian optimization)
  - Learning rate: [1e-5, 5e-5]
  - Batch size: [16, 32, 64]
  - Dropout: [0.1, 0.3]
  - Epochs: [3, 10]
- **Cross-validation**: 5-fold stratified CV
- **Class imbalance**: SMOTE oversampling + class-weighted cross-entropy loss
- **Inference**: SageMaker Real-time Endpoint (ml.g4dn.xlarge)

**Confidence Routing Logic**:
```python
def route_classification(confidence_score, top3_predictions):
    if confidence_score >= 0.85:
        return "GREEN", auto_assign(top3_predictions[0])
    elif confidence_score >= 0.60:
        return "YELLOW", flag_for_review(top3_predictions)
    else:
        return "RED", route_to_manual_queue(top3_predictions)
```

#### 2. MatchMaker — Smart Marketplace Matching

**Purpose**: Recommend best-fit e-commerce platforms for each MSME using multi-factor scoring.

**Scoring Architecture**:
```
MSME Profile + Catalog
    │
    ├──► SageMaker Bi-Encoder ──► Domain Score (D)
    │    Cosine(MSME_emb, Platform_emb)     weight: 0.35
    │
    ├──► Lambda: Geo Calculator ──► Geography Score (G)
    │    Haversine + Regional Demand           weight: 0.20
    │
    ├──► Lambda: Capacity Check ──► Capacity Score (C)
    │    Platform Load / Max Capacity          weight: 0.15
    │
    ├──► RDS: History Query ──► History Score (H)
    │    Collaborative Filtering               weight: 0.20
    │
    ├──► Lambda: Spec Match ──► Specialization Score (S)
    │    B2B/B2C + Turnover Alignment          weight: 0.10
    │
    └──► Composite Scorer
         M = 0.35D + 0.20G + 0.15C + 0.20H + 0.10S
              │
              ▼
         Top-3 Ranked Platforms + Explanations
```

**Embedding Model**:
- **Architecture**: Bi-encoder (Sentence-BERT style)
- **Training**: SageMaker Training Job with contrastive learning on MSME-platform pairs
- **Inference**: SageMaker Endpoint for real-time embedding generation
- **Similarity**: Cosine similarity between MSME product vector and platform domain vector

**Weight Optimization**:
- Grid search over weight combinations [0.05 increments]
- Objective: Maximize NDCG@3 on validation set
- Constraint: Minimize simulated reassignment rate

**Cold Start Strategy**:
```python
def cold_start_matching(msme_profile):
    """For MSMEs with no historical match data"""
    weights = {
        'domain': 0.50,      # Boosted (was 0.35)
        'geography': 0.25,   # Boosted (was 0.20)
        'capacity': 0.15,    # Same
        'history': 0.00,     # Disabled (no data)
        'specialization': 0.10  # Same
    }
    # + k-NN demographic similarity from similar MSMEs
    similar_msmes = find_k_nearest(msme_profile, k=10)
    return weighted_score(msme_profile, weights, similar_msmes)
```

#### 3. PriceWise — Market Intelligence Engine

**Purpose**: Democratize market intelligence for MSMEs.

**Architecture**:
```
Market Data Sources
    │
    ├──► S3 Data Lake ──► Amazon Athena (SQL analytics)
    │                      │
    │                      ▼
    │               Pricing Benchmarks
    │               (category median, percentiles)
    │
    ├──► Amazon Forecast ──► Demand Predictions
    │    AutoML time-series   (7/14/30 day forecasts)
    │
    └──► Amazon Bedrock (Claude) ──► Natural Language Insights
         Synthesize multi-source      "Your brass fittings are priced
         intelligence                  12% above category median.
                                       Demand peaks in March-April."
```

**Amazon Forecast Configuration**:
- Algorithm: AutoML (selects from DeepAR+, Prophet, NPTS, ARIMA, ETS)
- Forecast horizon: 7, 14, 30 days
- Quantiles: P10, P50, P90 (for range estimates)
- Features: category, region, season, historical volume

---

## API Design

### REST Endpoints

```
BASE URL: https://api.vyaparsetu.ai/v1

POST   /catalog/classify
  Body: { product_description: string, language: "hi"|"en" }
  Response: {
    top3: [{ category, subcategory, confidence, hsn_code }],
    band: "GREEN"|"YELLOW"|"RED",
    attributes: { ... }
  }

POST   /catalog/confirm
  Body: { classification_id: string, confirmed_category: string }

POST   /match/recommend
  Body: { msme_id: string }
  Response: {
    top3: [{
      platform: string,
      composite_score: float,
      factors: { domain, geography, capacity, history, specialization },
      explanation: string
    }],
    band: "GREEN"|"YELLOW"|"RED"
  }

GET    /intelligence/pricing/{category_id}
  Response: {
    median_price: float,
    percentiles: { p25, p50, p75 },
    msme_position: string,
    insight: string
  }

GET    /intelligence/forecast/{category_id}
  Response: {
    forecasts: [{ date, p10, p50, p90 }],
    trend: "increasing"|"stable"|"decreasing",
    insight: string
  }

GET    /analytics/dashboard
  Response: {
    band_distribution: { green, yellow, red },
    accuracy_metrics: { ... },
    baseline_comparison: { ... }
  }

POST   /admin/override
  Body: { decision_id: string, override_value: string, reason: string }
```

---

## Database Schema

### Amazon RDS (PostgreSQL)

```sql
-- MSME Profiles
CREATE TABLE msme_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location_state VARCHAR(100),
    location_district VARCHAR(100),
    location_tier SMALLINT CHECK (location_tier IN (1, 2, 3)),
    turnover_bracket VARCHAR(50),
    business_type VARCHAR(10) CHECK (business_type IN ('B2B', 'B2C', 'BOTH')),
    gender_led VARCHAR(10),
    language_preference VARCHAR(5) DEFAULT 'hi',
    quality_score NUMERIC(3,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Catalog
CREATE TABLE product_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    msme_id UUID REFERENCES msme_profiles(id),
    raw_description TEXT NOT NULL,
    detected_language VARCHAR(5),
    translated_description TEXT,
    predicted_category VARCHAR(255),
    predicted_subcategory VARCHAR(255),
    confidence_score NUMERIC(4,3),
    confidence_band VARCHAR(10),
    hsn_code VARCHAR(20),
    attributes JSONB DEFAULT '{}',
    confirmed BOOLEAN DEFAULT FALSE,
    confirmed_category VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace/Platform Profiles
CREATE TABLE platform_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domains TEXT[] NOT NULL,
    geographies TEXT[] NOT NULL,
    max_capacity INTEGER,
    current_load INTEGER DEFAULT 0,
    business_type VARCHAR(10),
    rating NUMERIC(3,2),
    embedding VECTOR(768),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match Records
CREATE TABLE match_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    msme_id UUID REFERENCES msme_profiles(id),
    platform_id UUID REFERENCES platform_profiles(id),
    rank SMALLINT,
    composite_score NUMERIC(4,3),
    domain_score NUMERIC(4,3),
    geography_score NUMERIC(4,3),
    capacity_score NUMERIC(4,3),
    history_score NUMERIC(4,3),
    specialization_score NUMERIC(4,3),
    confidence_band VARCHAR(10),
    explanation TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    override_by VARCHAR(255),
    override_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log (immutable)
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    input_hash VARCHAR(64),
    confidence NUMERIC(4,3),
    decision TEXT,
    rationale TEXT,
    actor VARCHAR(255) DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_match_msme ON match_records(msme_id);
CREATE INDEX idx_catalog_msme ON product_catalog(msme_id);
```

---

## AWS Infrastructure

### Services Map

| Layer | Service | Configuration |
|-------|---------|--------------|
| Frontend | AWS Amplify | React app, CI/CD from GitHub |
| Auth | Amazon Cognito | User pools, RBAC (admin, operator, msme) |
| API | Amazon API Gateway | REST, throttling, request validation |
| Orchestration | AWS Step Functions | State machine for end-to-end flow |
| AI Agent | Amazon Bedrock Agents | Tool-use routing for PriceWise |
| Classification | Amazon SageMaker | Real-time endpoint (ml.g4dn.xlarge) |
| Embeddings | Amazon SageMaker | Real-time endpoint (ml.g4dn.xlarge) |
| NLP | Amazon Comprehend | Custom entity recognition |
| Translation | Amazon Translate | Hindi ↔ English |
| Voice | Amazon Transcribe | Streaming STT (future) |
| Forecasting | Amazon Forecast | AutoML predictor |
| LLM | Amazon Bedrock | Claude for insights generation |
| Database | Amazon RDS | PostgreSQL 15, db.t3.medium |
| Search | Amazon OpenSearch | Product catalog indexing |
| Cache | Amazon ElastiCache | Redis, session + embedding cache |
| Storage | Amazon S3 | Data lake, model artifacts |
| Analytics | Amazon QuickSight | Admin dashboards |
| Monitoring | Amazon CloudWatch | Logs, metrics, alarms |

### Deployment Architecture

```
Region: ap-south-1 (Mumbai)

VPC:
├── Public Subnet
│   ├── API Gateway endpoint
│   └── Amplify (CDN)
│
├── Private Subnet (App)
│   ├── Lambda functions (API handlers)
│   ├── Step Functions (orchestration)
│   └── ECS Fargate (ML inference containers)
│
└── Private Subnet (Data)
    ├── RDS PostgreSQL (Multi-AZ)
    ├── ElastiCache Redis (cluster)
    └── OpenSearch domain
```

---

## ML Training Pipeline

### SageMaker Pipeline

```
S3 (raw data)
    │
    ▼
SageMaker Processing Job ──► Data Preparation
    │                         - Clean, tokenize
    │                         - Stratified split (80/10/10)
    │                         - SMOTE oversampling
    ▼
SageMaker Training Job ──► Model Training
    │                       - Fine-tune multilingual BERT
    │                       - 5-fold CV
    ▼
SageMaker HPO Job ──► Hyperparameter Tuning
    │                   - Bayesian optimization
    │                   - Objective: maximize F1-macro
    ▼
SageMaker Model Registry ──► Model Versioning
    │                          - A/B testing support
    │                          - Rollback capability
    ▼
SageMaker Endpoint ──► Production Inference
                        - Auto-scaling
                        - Shadow testing
```

---

## Evaluation Framework

### Baseline vs. AI Comparison

| Metric | Rule-Based Baseline | VyaparSetu AI |
|--------|-------------------|---------------|
| Product Categorization Accuracy | ~55-65% | >95% |
| NDCG@3 (Matching Quality) | ~0.45 | >0.80 |
| First-Match Acceptance Rate | ~40% | >60% |
| Catalog Creation Time | 2-4 hours | <15 minutes |

### Responsible AI Checks

- **Gender bias**: NDCG@3 gap < 5% between women-led and overall MSMEs
- **Geographic bias**: Quality variance < 10% across Tier 1/2/3 cities
- **Category bias**: Accuracy variance < 10% across product domains
- **Explainability**: Every recommendation includes factor-level breakdown
- **Override**: Human override available at every automated decision point

---

## Security Design

- **Encryption**: AES-256 at rest (RDS, S3, ElastiCache), TLS 1.3 in transit
- **Authentication**: Amazon Cognito with MFA support
- **Authorization**: IAM roles + Cognito groups (admin, operator, msme)
- **Audit**: Immutable CloudWatch Logs + RDS audit_log table
- **Data residency**: All data within ap-south-1 (Mumbai)
- **Secrets**: AWS Secrets Manager for API keys and DB credentials
- **Network**: VPC with private subnets, no public DB access
