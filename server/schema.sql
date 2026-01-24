-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('investor', 'seller', 'admin')) DEFAULT 'investor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Listings Table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    asking_price DECIMAL(15, 2) NOT NULL,
    minimum_investment DECIMAL(15, 2),
    location VARCHAR(255) NOT NULL,
    district VARCHAR(50),
    images TEXT[], -- Array of image URLs
    status VARCHAR(50) DEFAULT 'draft',
    verification_status VARCHAR(50) DEFAULT 'unverified',
    rdb_registration_number VARCHAR(100),
    rra_tin VARCHAR(50),
    land_title_number VARCHAR(100),
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    projected_roi DECIMAL(5, 2),
    year_established INTEGER,
    employees INTEGER,
    annual_revenue DECIMAL(15, 2),
    highlights TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Investments Table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id),
    investor_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'initiated',
    escrow_status VARCHAR(50) DEFAULT 'not_started',
    escrow_reference VARCHAR(100),
    payment_method VARCHAR(50),
    rdb_approval_status VARCHAR(50) DEFAULT 'pending',
    rdb_approval_reference VARCHAR(100),
    legal_review_status VARCHAR(50) DEFAULT 'pending',
    assigned_notary VARCHAR(255),
    assigned_lawyer VARCHAR(255),
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- KYC Verifications Table
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    verification_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    full_legal_name VARCHAR(255),
    nationality VARCHAR(100),
    country_of_residence VARCHAR(100),
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    id_document_url TEXT,
    id_expiry_date DATE,
    selfie_url TEXT,
    proof_of_address_url TEXT,
    company_name VARCHAR(255),
    company_registration_number VARCHAR(100),
    company_registration_document_url TEXT,
    company_country VARCHAR(100),
    beneficial_owners JSONB, -- Storing array of objects as JSONB
    source_of_funds VARCHAR(100),
    source_of_funds_details TEXT,
    risk_level VARCHAR(50) DEFAULT 'medium',
    reviewer_notes TEXT,
    verified_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries Table
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id),
    investor_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    response TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Portfolios Table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID REFERENCES users(id),
    investment_id UUID REFERENCES investments(id),
    listing_id UUID REFERENCES listings(id),
    initial_investment DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    roi_percentage DECIMAL(5, 2),
    dividends_received DECIMAL(15, 2) DEFAULT 0,
    ownership_percentage DECIMAL(5, 2),
    investment_date DATE,
    last_valuation_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    exit_date DATE,
    exit_value DECIMAL(15, 2),
    performance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id),
    seller_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    inquiries INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    visitor_countries TEXT[],
    conversion_rate DECIMAL(5, 2),
    avg_time_on_page DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_id UUID REFERENCES investments(id),
    listing_id UUID REFERENCES listings(id),
    document_type VARCHAR(100) NOT NULL,
    document_url TEXT,
    generated BOOLEAN DEFAULT FALSE,
    signed_by_investor BOOLEAN DEFAULT FALSE,
    signed_by_seller BOOLEAN DEFAULT FALSE,
    investor_signature_date TIMESTAMP WITH TIME ZONE,
    seller_signature_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Favorites Table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    listing_id UUID REFERENCES listings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Goals Table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    target_amount DECIMAL(15, 2),
    timeline_months INTEGER,
    risk_tolerance VARCHAR(50) DEFAULT 'medium',
    preferred_categories TEXT[],
    preferred_types TEXT[],
    min_roi DECIMAL(5, 2),
    max_investment_per_opportunity DECIMAL(15, 2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
