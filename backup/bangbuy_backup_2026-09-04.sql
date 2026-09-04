--
-- PostgreSQL database dump
--

\restrict qfn4udZkq8fjDqgMS3Sii1vybQaKATEybkBMKhwehKWl0gaNhJzGJYi6DiFaw5J

-- Dumped from database version 18.6 (c5250a2)
-- Dumped by pg_dump version 18.6

-- Started on 2026-09-04 11:21:53

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1039 (class 1247 OID 106513)
-- Name: AirwallexEventProcessingStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."AirwallexEventProcessingStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'RETRY_PENDING',
    'PROCESSED',
    'REQUIRES_REVIEW'
);


ALTER TYPE public."AirwallexEventProcessingStatus" OWNER TO neondb_owner;

--
-- TOC entry 889 (class 1247 OID 24582)
-- Name: AuthProvider; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."AuthProvider" AS ENUM (
    'CREDENTIAL',
    'GOOGLE'
);


ALTER TYPE public."AuthProvider" OWNER TO neondb_owner;

--
-- TOC entry 937 (class 1247 OID 24722)
-- Name: BannerStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BannerStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."BannerStatus" OWNER TO neondb_owner;

--
-- TOC entry 934 (class 1247 OID 24710)
-- Name: BannerType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BannerType" AS ENUM (
    'CAROUSEL',
    'CATEGORY',
    'TOP',
    'DEAL',
    'PROMO'
);


ALTER TYPE public."BannerType" OWNER TO neondb_owner;

--
-- TOC entry 895 (class 1247 OID 24594)
-- Name: BrandStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BrandStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."BrandStatus" OWNER TO neondb_owner;

--
-- TOC entry 940 (class 1247 OID 24728)
-- Name: CapitalCostActivityType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CapitalCostActivityType" AS ENUM (
    'CAPITAL_SET',
    'CAPITAL_UPDATED',
    'CAPITAL_ADDED',
    'PRODUCT_COST_ADDED',
    'PRODUCT_COST_REMOVED',
    'COST_CREATED',
    'COST_UPDATED',
    'COST_DELETED'
);


ALTER TYPE public."CapitalCostActivityType" OWNER TO neondb_owner;

--
-- TOC entry 1030 (class 1247 OID 49160)
-- Name: CatalogRedirectEntityType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CatalogRedirectEntityType" AS ENUM (
    'PRODUCT',
    'CATEGORY',
    'BRAND'
);


ALTER TYPE public."CatalogRedirectEntityType" OWNER TO neondb_owner;

--
-- TOC entry 892 (class 1247 OID 24588)
-- Name: CategoryStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CategoryStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."CategoryStatus" OWNER TO neondb_owner;

--
-- TOC entry 925 (class 1247 OID 24676)
-- Name: ContactMessageStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ContactMessageStatus" AS ENUM (
    'NEW',
    'READ',
    'ARCHIVED'
);


ALTER TYPE public."ContactMessageStatus" OWNER TO neondb_owner;

--
-- TOC entry 931 (class 1247 OID 24696)
-- Name: InventoryLogType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."InventoryLogType" AS ENUM (
    'STOCK_IN',
    'STOCK_OUT',
    'ORDER_PLACED',
    'ORDER_CANCELLED',
    'RETURNED',
    'MANUAL_ADJUSTMENT'
);


ALTER TYPE public."InventoryLogType" OWNER TO neondb_owner;

--
-- TOC entry 898 (class 1247 OID 24600)
-- Name: ManufacturerStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ManufacturerStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."ManufacturerStatus" OWNER TO neondb_owner;

--
-- TOC entry 904 (class 1247 OID 24612)
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAYMENT_CONFIRMED',
    'SELLER_TO_PACK',
    'PACKED',
    'READY_TO_SHIP',
    'WAREHOUSE',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED',
    'RETURNED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO neondb_owner;

--
-- TOC entry 907 (class 1247 OID 24640)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH_ON_DELIVERY',
    'ONLINE',
    'SSLCOMMERZ',
    'PAYPAL',
    'AIRWALLEX'
);


ALTER TYPE public."PaymentMethod" OWNER TO neondb_owner;

--
-- TOC entry 910 (class 1247 OID 24646)
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PAID',
    'UNPAID',
    'PENDING',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO neondb_owner;

--
-- TOC entry 1042 (class 1247 OID 106524)
-- Name: PaymentTransactionEventSource; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentTransactionEventSource" AS ENUM (
    'INITIATION',
    'WEBHOOK',
    'RECONCILIATION',
    'MANUAL'
);


ALTER TYPE public."PaymentTransactionEventSource" OWNER TO neondb_owner;

--
-- TOC entry 928 (class 1247 OID 24684)
-- Name: PaymentTransactionStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentTransactionStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'CANCELLED',
    'REFUNDED',
    'EXPIRED',
    'CREATED',
    'REQUIRES_PAYMENT_METHOD',
    'PENDING_REVIEW',
    'PROCESSING',
    'REQUIRES_REVIEW'
);


ALTER TYPE public."PaymentTransactionStatus" OWNER TO neondb_owner;

--
-- TOC entry 1027 (class 1247 OID 49153)
-- Name: ProductCondition; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ProductCondition" AS ENUM (
    'NEW',
    'REFURBISHED',
    'USED'
);


ALTER TYPE public."ProductCondition" OWNER TO neondb_owner;

--
-- TOC entry 901 (class 1247 OID 24606)
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."ProductStatus" OWNER TO neondb_owner;

--
-- TOC entry 922 (class 1247 OID 24670)
-- Name: PromoCodeStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PromoCodeStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."PromoCodeStatus" OWNER TO neondb_owner;

--
-- TOC entry 919 (class 1247 OID 24664)
-- Name: PromoDiscountType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PromoDiscountType" AS ENUM (
    'FLAT',
    'PERCENT'
);


ALTER TYPE public."PromoDiscountType" OWNER TO neondb_owner;

--
-- TOC entry 913 (class 1247 OID 24652)
-- Name: ReviewSource; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ReviewSource" AS ENUM (
    'CUSTOMER',
    'ADMIN'
);


ALTER TYPE public."ReviewSource" OWNER TO neondb_owner;

--
-- TOC entry 886 (class 1247 OID 24577)
-- Name: Role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO neondb_owner;

--
-- TOC entry 916 (class 1247 OID 24658)
-- Name: TestimonialStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TestimonialStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."TestimonialStatus" OWNER TO neondb_owner;

--
-- TOC entry 252 (class 1255 OID 409639)
-- Name: fillOrderCurrencySnapshotDefaults(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public."fillOrderCurrencySnapshotDefaults"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW."baseCurrency" := COALESCE(NEW."baseCurrency", 'BDT');
  NEW."displayCurrency" := COALESCE(NEW."displayCurrency", 'BDT');
  NEW."displaySubtotal" := COALESCE(NEW."displaySubtotal", NEW."subtotal");
  NEW."displayDeliveryCharge" := COALESCE(
    NEW."displayDeliveryCharge",
    NEW."deliveryCharge"
  );
  NEW."displayDiscountAmount" := COALESCE(
    NEW."displayDiscountAmount",
    NEW."discountAmount"
  );
  NEW."displayTaxAmount" := COALESCE(NEW."displayTaxAmount", NEW."taxAmount");
  NEW."displayTotalAmount" := COALESCE(
    NEW."displayTotalAmount",
    NEW."totalAmount"
  );
  NEW."displayAdvancePayment" := COALESCE(
    NEW."displayAdvancePayment",
    NEW."advancePayment"
  );
  NEW."exchangeRate" := COALESCE(NEW."exchangeRate", 1);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public."fillOrderCurrencySnapshotDefaults"() OWNER TO neondb_owner;

--
-- TOC entry 253 (class 1255 OID 409641)
-- Name: fillOrderItemCurrencySnapshotDefaults(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public."fillOrderItemCurrencySnapshotDefaults"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW."displayUnitPrice" := COALESCE(
    NEW."displayUnitPrice",
    NEW."unitPrice"
  );
  NEW."displayTotalPrice" := COALESCE(
    NEW."displayTotalPrice",
    NEW."totalPrice"
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION public."fillOrderItemCurrencySnapshotDefaults"() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 237 (class 1259 OID 25054)
-- Name: Address; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    city text NOT NULL,
    area text,
    address text NOT NULL,
    "postalCode" text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Address" OWNER TO neondb_owner;

--
-- TOC entry 245 (class 1259 OID 25169)
-- Name: AdminActivityLog; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AdminActivityLog" (
    id text NOT NULL,
    kind text NOT NULL,
    action text NOT NULL,
    target text,
    "targetId" text,
    href text,
    "actorId" text,
    "actorName" text,
    "actorEmail" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AdminActivityLog" OWNER TO neondb_owner;

--
-- TOC entry 241 (class 1259 OID 25119)
-- Name: AdminCapital; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AdminCapital" (
    id text NOT NULL,
    amount numeric(14,2) NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AdminCapital" OWNER TO neondb_owner;

--
-- TOC entry 244 (class 1259 OID 25157)
-- Name: AdminCapitalCostActivity; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AdminCapitalCostActivity" (
    id text NOT NULL,
    type public."CapitalCostActivityType" NOT NULL,
    description text NOT NULL,
    amount numeric(14,2),
    note text,
    "entityId" text,
    "actorId" text,
    "actorName" text,
    "actorEmail" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AdminCapitalCostActivity" OWNER TO neondb_owner;

--
-- TOC entry 243 (class 1259 OID 25143)
-- Name: AdminOtherCost; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AdminOtherCost" (
    id text NOT NULL,
    amount numeric(14,2) NOT NULL,
    reason text NOT NULL,
    description text,
    "costDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AdminOtherCost" OWNER TO neondb_owner;

--
-- TOC entry 242 (class 1259 OID 25131)
-- Name: AdminProductCost; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AdminProductCost" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AdminProductCost" OWNER TO neondb_owner;

--
-- TOC entry 249 (class 1259 OID 106533)
-- Name: AirwallexWebhookEvent; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."AirwallexWebhookEvent" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "eventName" text NOT NULL,
    "paymentIntentId" text NOT NULL,
    "accountId" text,
    "apiVersion" text,
    "receivedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processingStatus" public."AirwallexEventProcessingStatus" DEFAULT 'PENDING'::public."AirwallexEventProcessingStatus" NOT NULL,
    "processingAttempts" integer DEFAULT 0 NOT NULL,
    "sanitizedPayload" jsonb NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "processingError" text,
    "nextAttemptAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lockedAt" timestamp(3) without time zone,
    "lockToken" text,
    "paymentTransactionId" text
);


ALTER TABLE public."AirwallexWebhookEvent" OWNER TO neondb_owner;

--
-- TOC entry 240 (class 1259 OID 25103)
-- Name: Banner; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Banner" (
    id text NOT NULL,
    type public."BannerType" NOT NULL,
    title text,
    subtitle text,
    description text,
    image text,
    link text,
    "position" integer DEFAULT 0 NOT NULL,
    status public."BannerStatus" DEFAULT 'ACTIVE'::public."BannerStatus" NOT NULL,
    "categoryId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Banner" OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 24782)
-- Name: Brand; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Brand" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo text,
    website text,
    status public."BrandStatus" DEFAULT 'ACTIVE'::public."BrandStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "seoTitle" text,
    "metaDescription" text,
    "ogImage" text
);


ALTER TABLE public."Brand" OWNER TO neondb_owner;

--
-- TOC entry 226 (class 1259 OID 24863)
-- Name: CartItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "variantId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO neondb_owner;

--
-- TOC entry 247 (class 1259 OID 49169)
-- Name: CatalogRedirect; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CatalogRedirect" (
    id text NOT NULL,
    "sourcePath" text NOT NULL,
    "destinationPath" text NOT NULL,
    "entityType" public."CatalogRedirectEntityType" NOT NULL,
    "entityId" text NOT NULL,
    permanent boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CatalogRedirect" OWNER TO neondb_owner;

--
-- TOC entry 220 (class 1259 OID 24762)
-- Name: Category; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    path text NOT NULL,
    description text,
    image text,
    status public."CategoryStatus" DEFAULT 'ACTIVE'::public."CategoryStatus" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    depth integer DEFAULT 0 NOT NULL,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "seoTitle" text,
    "metaDescription" text,
    "ogImage" text
);


ALTER TABLE public."Category" OWNER TO neondb_owner;

--
-- TOC entry 236 (class 1259 OID 25037)
-- Name: ContactMessage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ContactMessage" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text NOT NULL,
    message text NOT NULL,
    status public."ContactMessageStatus" DEFAULT 'NEW'::public."ContactMessageStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ContactMessage" OWNER TO neondb_owner;

--
-- TOC entry 251 (class 1259 OID 409600)
-- Name: ExchangeRate; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ExchangeRate" (
    id text NOT NULL,
    "baseCurrency" text NOT NULL,
    currency text NOT NULL,
    rate numeric(20,10) NOT NULL,
    "fetchedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ExchangeRate" OWNER TO neondb_owner;

--
-- TOC entry 239 (class 1259 OID 25090)
-- Name: InventoryLog; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."InventoryLog" (
    id text NOT NULL,
    "variantId" text NOT NULL,
    type public."InventoryLogType" NOT NULL,
    quantity integer NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InventoryLog" OWNER TO neondb_owner;

--
-- TOC entry 222 (class 1259 OID 24797)
-- Name: Manufacturer; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Manufacturer" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo text,
    website text,
    country text,
    status public."ManufacturerStatus" DEFAULT 'ACTIVE'::public."ManufacturerStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Manufacturer" OWNER TO neondb_owner;

--
-- TOC entry 228 (class 1259 OID 24890)
-- Name: Order; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text,
    subtotal numeric(12,2) NOT NULL,
    "deliveryCharge" numeric(12,2) DEFAULT 0 NOT NULL,
    "discountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "taxAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    "advancePayment" numeric(12,2) DEFAULT 0 NOT NULL,
    "customerName" text NOT NULL,
    "customerPhone" text NOT NULL,
    "customerAddress" text NOT NULL,
    "customerEmail" text,
    "customerCity" text,
    "customerArea" text,
    "customerPostalCode" text,
    "customerNote" text,
    "promoCode" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'CASH_ON_DELIVERY'::public."PaymentMethod" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'UNPAID'::public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    currency text DEFAULT 'BDT'::text NOT NULL,
    "baseCurrency" text DEFAULT 'BDT'::text NOT NULL,
    "displayCurrency" text DEFAULT 'BDT'::text NOT NULL,
    "displaySubtotal" numeric(12,2) NOT NULL,
    "displayDeliveryCharge" numeric(12,2) DEFAULT 0 NOT NULL,
    "displayDiscountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "displayTaxAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "displayTotalAmount" numeric(12,2) NOT NULL,
    "displayAdvancePayment" numeric(12,2) DEFAULT 0 NOT NULL,
    "exchangeRate" numeric(20,10) DEFAULT 1 NOT NULL,
    "exchangeRateAt" timestamp(3) without time zone
);


ALTER TABLE public."Order" OWNER TO neondb_owner;

--
-- TOC entry 230 (class 1259 OID 24933)
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text,
    "variantId" text,
    "productName" text NOT NULL,
    "productImage" text,
    sku text,
    "variantName" text,
    color text,
    size text,
    quantity integer NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    "buyingPrice" numeric(12,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "variantAttributes" jsonb,
    "displayUnitPrice" numeric(12,2) NOT NULL,
    "displayTotalPrice" numeric(12,2) NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO neondb_owner;

--
-- TOC entry 229 (class 1259 OID 24921)
-- Name: OrderStatusHistory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."OrderStatusHistory" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    status public."OrderStatus" NOT NULL,
    note text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderStatusHistory" OWNER TO neondb_owner;

--
-- TOC entry 238 (class 1259 OID 25072)
-- Name: PaymentTransaction; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."PaymentTransaction" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    provider text NOT NULL,
    "transactionId" text,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'BDT'::text NOT NULL,
    status public."PaymentTransactionStatus" DEFAULT 'PENDING'::public."PaymentTransactionStatus" NOT NULL,
    "rawResponse" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "idempotencyKey" text,
    "gatewayUrl" text,
    "gatewaySessionKey" text,
    "validationId" text,
    "bankTransactionId" text,
    "cardType" text,
    "riskLevel" integer,
    "paidAt" timestamp(3) without time zone,
    "requiresReview" boolean DEFAULT false NOT NULL,
    "reviewReason" text,
    "reviewResolvedAt" timestamp(3) without time zone,
    "reviewResolvedBy" text,
    "reviewResolution" text,
    "reviewResolutionReference" text,
    "providerStatus" text,
    "failureCode" text,
    "failureMessage" text,
    "lastReconciledAt" timestamp(3) without time zone,
    "reconciliationResult" text,
    "reconciliationAttempts" integer DEFAULT 0 NOT NULL,
    "baseAmount" numeric(12,2),
    "baseCurrency" text,
    "exchangeRate" numeric(20,10),
    "exchangeRateAt" timestamp(3) without time zone
);


ALTER TABLE public."PaymentTransaction" OWNER TO neondb_owner;

--
-- TOC entry 250 (class 1259 OID 106553)
-- Name: PaymentTransactionEvent; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."PaymentTransactionEvent" (
    id text NOT NULL,
    "paymentTransactionId" text NOT NULL,
    source public."PaymentTransactionEventSource" NOT NULL,
    "eventName" text NOT NULL,
    "fromStatus" public."PaymentTransactionStatus",
    "toStatus" public."PaymentTransactionStatus" NOT NULL,
    "providerStatus" text,
    "providerEventId" text,
    "reasonCode" text,
    "requiresReview" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PaymentTransactionEvent" OWNER TO neondb_owner;

--
-- TOC entry 223 (class 1259 OID 24812)
-- Name: Product; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    "productCode" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    status public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus" NOT NULL,
    "modelNumber" text,
    series text,
    "buyingPrice" numeric(12,2) NOT NULL,
    "salePrice" numeric(12,2) NOT NULL,
    "discountPrice" numeric(12,2),
    specifications jsonb,
    "categoryId" text NOT NULL,
    "brandId" text,
    "manufacturerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "seoTitle" text,
    "metaDescription" text,
    "ogImage" text,
    gtin text,
    "itemCondition" public."ProductCondition" DEFAULT 'NEW'::public."ProductCondition" NOT NULL,
    "descriptionBlocks" jsonb
);


ALTER TABLE public."Product" OWNER TO neondb_owner;

--
-- TOC entry 225 (class 1259 OID 24849)
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductImage" (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    alt text,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductImage" OWNER TO neondb_owner;

--
-- TOC entry 224 (class 1259 OID 24831)
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "variantKey" text DEFAULT 'default'::text NOT NULL,
    name text,
    size text,
    color text,
    "modelNumber" text,
    sku text,
    stock integer DEFAULT 0 NOT NULL,
    image text,
    attributes jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO neondb_owner;

--
-- TOC entry 233 (class 1259 OID 24985)
-- Name: PromoCode; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."PromoCode" (
    id text NOT NULL,
    code text NOT NULL,
    description text,
    "discountType" public."PromoDiscountType" DEFAULT 'FLAT'::public."PromoDiscountType" NOT NULL,
    value numeric(12,2) NOT NULL,
    "minOrder" numeric(12,2),
    "maxDiscount" numeric(12,2),
    "startsAt" timestamp(3) without time zone,
    "endsAt" timestamp(3) without time zone,
    "usageLimit" integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    status public."PromoCodeStatus" DEFAULT 'ACTIVE'::public."PromoCodeStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PromoCode" OWNER TO neondb_owner;

--
-- TOC entry 234 (class 1259 OID 25004)
-- Name: PromoCodeUsage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."PromoCodeUsage" (
    id text NOT NULL,
    "promoCodeId" text NOT NULL,
    "userId" text,
    "orderId" text NOT NULL,
    "usedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PromoCodeUsage" OWNER TO neondb_owner;

--
-- TOC entry 248 (class 1259 OID 49208)
-- Name: RateLimitBucket; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."RateLimitBucket" (
    "keyDigest" text NOT NULL,
    count integer NOT NULL,
    "resetAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RateLimitBucket" OWNER TO neondb_owner;

--
-- TOC entry 231 (class 1259 OID 24948)
-- Name: Review; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text,
    "authorName" text NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text,
    source public."ReviewSource" DEFAULT 'CUSTOMER'::public."ReviewSource" NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO neondb_owner;

--
-- TOC entry 235 (class 1259 OID 25016)
-- Name: StoreSettings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."StoreSettings" (
    id text NOT NULL,
    "taxRate" numeric(5,4) DEFAULT 0.05 NOT NULL,
    "standardShippingFee" numeric(12,2) DEFAULT 120 NOT NULL,
    "freeShippingThreshold" numeric(12,2) DEFAULT 50000 NOT NULL,
    "expressShippingFee" numeric(12,2) DEFAULT 250 NOT NULL,
    currency text DEFAULT 'BDT'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StoreSettings" OWNER TO neondb_owner;

--
-- TOC entry 232 (class 1259 OID 24966)
-- Name: Testimonial; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Testimonial" (
    id text NOT NULL,
    name text NOT NULL,
    location text,
    image text,
    rating integer DEFAULT 5 NOT NULL,
    text text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    status public."TestimonialStatus" DEFAULT 'ACTIVE'::public."TestimonialStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Testimonial" OWNER TO neondb_owner;

--
-- TOC entry 219 (class 1259 OID 24745)
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text,
    phone text,
    city text,
    image text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    provider public."AuthProvider" DEFAULT 'CREDENTIAL'::public."AuthProvider" NOT NULL,
    "termsAcceptedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- TOC entry 227 (class 1259 OID 24878)
-- Name: Wishlist; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Wishlist" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Wishlist" OWNER TO neondb_owner;

--
-- TOC entry 246 (class 1259 OID 32768)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- TOC entry 3907 (class 0 OID 25054)
-- Dependencies: 237
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Address" (id, "userId", "fullName", phone, city, area, address, "postalCode", "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3915 (class 0 OID 25169)
-- Dependencies: 245
-- Data for Name: AdminActivityLog; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AdminActivityLog" (id, kind, action, target, "targetId", href, "actorId", "actorName", "actorEmail", "createdAt") FROM stdin;
bcc33e75-59ee-4e40-a1aa-885f7021d7db	category	Category created	Electronics Products	cmsbujsks0007e5l5z1ewffub	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 13:39:16.141
989a01bb-4154-45b2-bf96-e6d35c278376	category	Category updated	Electronics Products	cmsbujsks0007e5l5z1ewffub	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 13:39:34.893
b07e287c-a3a0-4338-ba98-7f18f32f123d	category	Category created	Mini Fans	cmsbuu7ra0008e5l5i8jt4tve	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 13:47:22.376
e614db3f-0216-47cf-b4ae-f8e4b18ceb2b	category	Category created	Wireless Earbuds	cmsbv6e000009e5l5j2rdg7gx	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 13:56:50.333
1065a0fa-400b-4be9-8870-c6e38c7e021b	category	Category created	Fashion	cmsbvf6hm000ae5l5vatwbbw5	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:03:40.651
cfe6d6a2-13f0-4a7f-841d-15911fb8c9d5	category	Category updated	Electronics	cmsbujsks0007e5l5z1ewffub	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:04:04.734
84a001de-73aa-48bd-b967-8e58b286a346	category	Category updated	Electronic	cmsbujsks0007e5l5z1ewffub	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:04:41.088
606223f1-1926-4e15-a028-af97f1f850e0	category	Category created	Skin Care	cmsbviuvp000be5l5qsuzeuup	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:06:32.239
9f929916-1c07-4442-bc5f-9384359c4e09	category	Category created	Bag	cmsbvkhqt000ce5l5q9p16gm0	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:07:48.313
7b6ed968-fc9a-4dfc-8f93-7b556e8e6c27	category	Category created	Facial Cleansers	cmsbvns7g000de5l5xxrw4a1u	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:10:21.866
f90eab8c-b306-492e-99a6-1252910aec93	category	Category updated	Skin Cares	cmsbviuvp000be5l5qsuzeuup	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:10:30.949
a4beb8c7-edfd-416d-a717-7c1bedc3a2a8	category	Category updated	Bags	cmsbvkhqt000ce5l5q9p16gm0	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:10:36.1
be462fb1-818a-4fa0-a177-88a7e45c73fb	category	Category updated	Fashions	cmsbvf6hm000ae5l5vatwbbw5	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:10:40.708
c6f329d2-ec31-4ddf-8337-4a023da91b7f	category	Category updated	Electronics	cmsbujsks0007e5l5z1ewffub	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:10:46.722
f8db06e4-c73a-4d45-81c4-e7bf86e3c011	category	Category created	Dermacare Serum & Essence	cmsbvra73000ee5l513q8xzuy	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:13:05.273
c72983c8-7232-4870-b019-8f1420b226d6	category	Category updated	Dermacare Serum & Essence	cmsbvra73000ee5l513q8xzuy	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:15:56.493
60f93f5d-3cea-4bff-a7c1-f50e67bfa1b4	category	Category created	Sunscreen & After-Sun	cmsbw4abn000fe5l5462gao2h	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:23:11.983
f6aa6a9b-0178-40b9-9caa-70423b8f1ee5	category	Category created	Lip Balm & Lip Treatments	cmsbw944g000ge5l547einnjc	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:26:57.427
5b906293-d16a-4ebc-bf11-04f2cab33c43	category	Category created	Face Skin Care Tools	cmsbwaevb000he5l532keu9u7	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:27:58.007
a47f8848-03fa-4969-b596-06c68306853f	category	Category created	Hair Treatments	cmsbwi4iw000ie5l530ku4mjg	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:33:57.929
30bfc3c8-2e5c-4fea-a9d6-f6fdae50dfc5	category	Category created	Medical & Healthcare	cmsbx02j6000je5l50vazxxb2	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:47:55.027
15e5fec8-948a-49c7-984e-b9bff78caa40	category	Category created	Nebulizers & Aspirators	cmsbx22eq000ke5l5zun9r9g6	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:49:27.98
60009baa-1df4-46a7-817c-674a84db09a9	category	Category created	Dermacare Sunscreen	cmsbx4ci7000le5l5oe9dim0u	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:51:14.629
c6741036-f891-4048-b7d0-57980078ab3a	category	Category created	Tinted Moisturizer	cmsbx9m0f000me5l5qkdabgen	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 14:55:20.433
4fc996ef-3e9f-49c3-8580-e5edea022690	category	Category created	Men’s Hair Treatments	cmsbxhszr000ne5l5e78lppas	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 15:01:42.615
1e07e40e-424c-4f0b-b75e-440123dcf400	category	Category created	Deodorants	cmsbxji5h000oe5l5sdyjoz5g	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 15:03:01.998
1570f63f-5396-400b-a876-6bb61dc35193	category	Category created	Electric Massagers	cmsbxls65000pe5l5qug5rsua	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 15:04:47.884
58df2b90-58d7-43ef-8dd0-2a7fad75b355	category	Category updated	Electric Massagers	cmsbxls65000pe5l5qug5rsua	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 15:05:12.525
5400e385-7a74-487a-89c0-df3f95c61f5a	category	Category created	Teeth Care	cmsbxrg27000qe5l5h5hg52wu	/admin/categories	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-02 15:09:12.096
dd3d770c-fb19-4079-996a-3c32987ab055	product	created	X688  Mini High Speed Handheld Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 15:39:42.244
999dffa1-329f-4ca7-a16d-8b538e818e16	product	updated	X688  Mini High Speed Handheld Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 15:41:04.599
13db4ca2-9c57-4f29-b0de-e7e232ad7f0e	product	created	Turbofan Small Ice Bucket	cmseu3qbo0017e5l5bwq7dfg8	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 15:50:05.568
c48c9f80-2cc6-40e1-b50e-8413046074a5	product	updated	M57 Turbofan Small Ice Bucket	cmseu3qbo0017e5l5bwq7dfg8	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 15:50:32.696
1dce2482-c4ad-4e82-83c9-5185377a1dff	product	created	N607 Vortex High Speed Handheld Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 15:57:23.499
5ea241ac-f5b7-4132-a3f4-fc8d85d56208	product	created	Portable Lipstick Handheld Fan GS4	cmseuiruy002be5l5xukisdtq	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:01:47.443
627d39c8-2317-435c-984b-ff071d985849	product	created	S001 Vortex High Speed Handheld Portable Fan	cmseupxoj002re5l5ll7imhj2	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:07:21.408
01514eaf-381b-409c-b746-47c36db66c22	product	created	Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display	cmseuv7eg0033e5l5zhr3jjip	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:11:27.2
1eb4a09d-6304-49ab-ad91-51300d476743	product	created	GS8 High-Speed Mini Cool Fan	cmsev2vmr003ge5l5i9ym859k	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:17:25.328
ae9afe81-1529-4f71-a461-14e3447a0c23	product	created	Wireless Gaming Earbuds with LED Digital Power Display	cmsevbgyr003te5l5k1blh6hk	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:24:06.171
c21d76d2-98fc-47b0-bcea-1400e34f8312	product	updated	GS8 High-Speed Mini Cool Fan	cmsev2vmr003ge5l5i9ym859k	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:25:13.408
dcae7c12-61db-4f52-9029-c9f878a1a33a	product	updated	S001 Vortex High Speed Handheld Portable Fan	cmseupxoj002re5l5ll7imhj2	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:25:24.703
904082c0-fb51-4ca5-a1bc-7be3a0cbabe5	product	updated	N607 Vortex High Speed Handheld Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:25:46.542
2ca7a260-f2df-4818-896b-9baa25cdb2cb	product	updated	Wireless Gaming Earbuds with LED Digital Power Display	cmsevbgyr003te5l5k1blh6hk	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:26:33.07
db9bf8f1-082f-4959-9b2f-73f9d85ceb14	product	created	Wireless Earbuds with Mirror Smart Display, Bluetooth 5.1 Earphones, HIFI Stereo Sound	cmsevi0i4004we5l5dfi04msm	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:29:11.498
4303a191-bcf7-4612-8945-0e3e41205f2b	product	updated	Wireless Earbuds with Mirror Smart Display, Bluetooth 5.1 Earphones, HIFI Stereo Sound	cmsevi0i4004we5l5dfi04msm	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:29:31.477
2603af80-bd75-495e-b389-dc45cfe928e2	product	created	N35 Gaming Wireless Earbuds, Ultra Low Delay Bluetooth 5.3 Earphones	cmsevlqvf005je5l5ixjvc5kh	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:32:05.724
8484f58a-1417-401c-962f-7acedc321cdd	product	updated	N35 Gaming Wireless Earbuds, Ultra Low Delay Bluetooth 5.3 Earphones	cmsevlqvf005je5l5ixjvc5kh	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:32:14.207
088d86e4-cd59-49bd-933c-6a1bc3d792b5	product	created	Mini Sleep Wireless Earbuds, Side Sleeping No Ear Pressure Bluetooth Headphones	cmsevs81m0060e5l5x2jq7v6r	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-04 16:37:07.761
7c215c35-eaf8-41bf-a092-53891932dd30	product	created	asdasdasd	cmsj5w5h20000eoc287fs7ox6	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-07 16:31:11.917
0a2d3bef-33e8-403f-b2df-6a3af3ffea18	product	deleted	asdasdasd	cmsj5w5h20000eoc287fs7ox6	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-07 16:32:31.713
4e4a85a0-a486-4d83-a434-4fbae0bec89a	product	updated	Mini Sleep Wireless Earbuds, Side Sleeping No Ear Pressure Bluetooth Headphones	cmsevs81m0060e5l5x2jq7v6r	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 06:40:06.374
ae3780ee-552f-41de-8710-7ec92dbdbd04	banner	created	carousel banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 15:22:26.883
cae270d4-c22a-44c2-aae6-258c353242d0	banner	updated	carousel banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 15:23:29.616
223c73e6-8502-44a9-999c-e0830fcc75cc	banner	updated	carousel banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 15:26:06.821
19eeff71-7429-42ec-984c-817818d1510e	banner	created	carousel banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 15:35:42.783
e1130d86-be60-4710-9658-bf7e9bd40307	banner	created	carousel banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 15:39:23.764
e511cfbc-d28a-481d-af18-8620173e7494	banner	created	carousel banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 15:44:52.399
3932801f-3e1b-4250-a22f-062ae2923688	banner	created	category banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 15:52:01.628
41408131-da0a-4029-b4db-5b13dd214b40	banner	created	category banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 15:56:14.019
1c40af4b-7e5a-44dd-9c9a-a7988d0026e9	banner	updated	category banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 15:56:43.942
06175af8-370d-44d6-8552-79d550c5b4cc	banner	created	category banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 16:00:46.967
6411bb55-a064-4a0b-9879-539a97867026	banner	created	category banner	\N	/admin/banners	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-08 16:05:55.994
e27669cb-ffef-489c-a3d1-3e0fc9e22521	category	Category created	Mini Hair Straightener Comb Portable for Women	cmsn60rfg000fagl5852eo4hd	/admin/categories	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-10 11:45:51.69
7b7140ff-9ffa-49ff-a820-8ff63ebe6f53	product	created	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	cmsn6f27a000gagl5b0yvsz4t	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-10 11:56:59.003
236249b7-54ee-4fd3-813e-89be2dfa1692	product	updated	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	cmsn6f27a000gagl5b0yvsz4t	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-10 11:58:14.131
b3e871bd-303c-480d-882a-b780aa8871d1	product	updated	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	cmsn6f27a000gagl5b0yvsz4t	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 03:39:31.659
d342111f-12a6-45c0-b6da-43761988bf0c	product	updated	Portable X688 Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 04:02:06.577
ae12139b-dbab-4ea4-b233-231a8300ca97	product	updated	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan	cmseu3qbo0017e5l5bwq7dfg8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 04:23:00.02
1ca4294f-1e7b-4112-8ba3-dfeeff006d61	product	updated	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 04:23:58.843
334839ec-df57-4015-a9dd-fcfbeeaf3998	product	updated	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:09:11.139
b0202f34-e820-4b87-83e0-2af7809ed47a	product	updated	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan	cmseuiruy002be5l5xukisdtq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:17:19.348
85444dd6-8266-4ea2-899e-bdb6a785cd76	product	updated	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan	cmseupxoj002re5l5ll7imhj2	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:26:18.767
be1ab0b4-4a3d-4409-a58a-74a603b0c7a6	product	updated	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan	cmseupxoj002re5l5ll7imhj2	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:27:36.822
d0c01be5-c0f1-43e6-bc9c-273da6117d3d	product	updated	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:28:32.225
f164b6b7-0c08-4ce6-b64b-94ae740e2f89	product	updated	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan	cmseu3qbo0017e5l5bwq7dfg8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:29:03.874
748a4806-26e4-44b1-aca5-e0a3fe5e9f42	product	updated	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:29:26.876
eaa8b719-9cfc-4445-b8eb-8b8623eca3fa	product	updated	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan	cmseuiruy002be5l5xukisdtq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:29:59.002
9fa74754-fd95-46b3-a61c-3d96f81845ef	product	updated	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan	cmseuiruy002be5l5xukisdtq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:30:23.641
7efa7b25-f218-4b18-95fc-e8cebba0d7ce	product	updated	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display	cmseuv7eg0033e5l5zhr3jjip	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:34:40.559
1298755b-cbdf-43b2-881d-663b32a45791	product	updated	GS8 High-Speed Mini Cool Fan	cmsev2vmr003ge5l5i9ym859k	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:37:57.762
c96c8757-f787-4af7-a417-394b70ac5761	product	updated	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler	cmsev2vmr003ge5l5i9ym859k	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:39:14.671
09be9994-1a59-4af1-b260-035eb263fc5a	product	updated	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls	cmsevbgyr003te5l5k1blh6hk	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:43:24.965
0a35168e-43e1-4575-b6d0-0591a13f9b57	product	updated	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin	cmsevi0i4004we5l5dfi04msm	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:45:00.821
5e76c9e9-5324-47c8-976b-0f2172515f00	product	updated	N35 Gaming Wireless Earbuds, Ultra Low Delay Bluetooth 5.3 Earphones	cmsevlqvf005je5l5ixjvc5kh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:46:07.229
cef794aa-9538-420b-8218-cac0e914e2fd	product	updated	N35 Gaming Wireless Earbuds Bluetooth 5.3 Low Delay LED Display Dual Mode Stereo In-Ear Earphones with Mic	cmsevlqvf005je5l5ixjvc5kh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:47:05.492
e62b04ba-6d45-467f-b45e-d62b3e070cb8	product	updated	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display	cmsevs81m0060e5l5x2jq7v6r	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:52:47.652
3766d791-7cc1-4c11-96c0-217fe2d25ac3	product	updated	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	cmsn6f27a000gagl5b0yvsz4t	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 07:56:26.736
c43c34dd-1b12-4cd1-8110-d4b0c648c7d5	product	created	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel	cmsodxbat007lagl5twvuqhem	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:14:54.032
8b3c5f11-1c37-4e7e-b3cb-42a0ff86231a	product	created	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy	cmsoefl0a007uagl52wuho36v	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:29:06.489
680f07fd-e66d-4881-b457-5389cd2d7963	product	created	Jurlique Rose Shower Gel & Body Lotion Set Moisturizing	cmsoehmj20087agl5jk2ykc8c	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:30:41.616
e2f4ecdc-d164-48cc-ac62-ded89208ea17	product	created	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection	cmsoenfty008kagl5xqh6iky0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:35:12.823
c82f927a-2277-4cc2-927d-c69bdb568d67	product	created	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil	cmsoenwof008uagl5plzqvpqm	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:35:34.677
16a16be1-202b-40fb-94db-cba845e41207	product	created	LISTENTOSKIN 377 Clean Skin Facial Cleanser Amino Acid Deep Clean Oil Control	cmsoep73y0096agl5r0g0yrgt	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:36:34.942
4e05e8dd-c89f-4a65-8f79-ba4b4e3e7415	product	created	Bobbi Brown Vitamin Enriched Face Base Primer Moisturizer	cmsoevgwh009aagl52j0rq6cj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:41:27.496
e27f6787-2f73-4d7e-ab28-537246c6cf4e	product	created	éLL Multi-effect Toning Cream, Natural Brightening Lazy Face Cream	cmsoexnlq009lagl56g2pim8q	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:43:09.508
846ccc4b-9edc-4b2c-9810-546a692ed212	product	created	numbuzin No.3 Porcelain Tone Up Beige SPF50+ PA++++ Lazy Tone Up Cream	cmsof2spy009uagl5h5ldpucd	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:47:09.614
e27153db-f77f-498b-9f81-760cd34e50b0	product	created	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance	cmsof41qn00a3agl50g9g1u37	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:48:07.625
f527cad6-7582-493a-93aa-4f2e765a9e55	product	created	YZS Stick Foundation With Built-in Brush Dewy Coverage	cmsof4dic00a6agl5u2gzv1f1	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:48:23.09
4364f800-0537-4479-9b67-bb4b6206c660	product	updated	YZS Stick Foundation With Built-in Brush Dewy Coverage	cmsof4dic00a6agl5u2gzv1f1	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:49:11.383
d8b70796-491a-42b1-bb6f-919fb0941b24	product	created	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth	cmsof85wb00adagl5n9tvx36l	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:51:19.788
d22b1535-2a99-4df3-84a6-bbad25d346b6	product	created	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin	cmsoffma900b4agl52y9tui4y	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:57:07.63
863623f7-b964-4c8a-96ab-2992f854b75c	product	created	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types	cmsofgbzd00bkagl5xnah2eno	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:57:40.861
cd35382a-ce43-44ef-add9-31ff7ba654a0	product	created	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara	cmsofmugw00byagl5hvqnyrco	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:02:44.768
24c1f92f-62a5-4cdb-aa53-a95427c40708	product	updated	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance	cmsof41qn00a3agl50g9g1u37	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 08:52:11.619
0f875278-b325-48c2-919a-16bc388d3cc9	product	created	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation	cmsofnqwj00ccagl5dcqregd9	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:03:26.845
688aade0-80d3-4dcb-8f86-159794736447	product	created	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color	cmsofqg4200cmagl55re4rwis	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:05:32.766
57c2a018-b7f3-4588-a028-9aaaeabae7d6	product	created	USB Rechargeable Electric Makeup Brush 10 Vibration Modes Soft Fluffy Foundation Blush Cosmetic Brush	cmsoftek200d4agl5jnznn882	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:07:50.631
64edabff-2a09-48b6-b961-6a8071c8a55b	product	created	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner	cmsofztni00ddagl5j1wo9h5x	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:12:50.332
3332c997-4e8a-48ef-8d35-41d8a84a3ceb	product	created	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth	cmsog05sv00dtagl56fzqqbsg	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:13:06.444
8e119ecc-8c68-4a56-a47d-09941be34aa4	product	created	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool	cmsog75pm00e6agl586ijcjyr	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:18:32.552
44af97f1-9057-4a14-98c5-e3bc6a647ce0	product	created	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics	cmsogf0wi00ehagl5c8ip2jhh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:24:39.494
584540c7-7d89-4004-badf-adc64dae8137	product	updated	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara	cmsofmugw00byagl5hvqnyrco	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:26:13.055
522f9d91-7363-468d-a2b5-123833e8f580	product	updated	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance	cmsof41qn00a3agl50g9g1u37	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:27:00.44
ffb43f44-298a-40cf-8d70-3ebf3e49c128	product	created	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin	cmsogi6sf00fcagl5q2szgip8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:27:07.218
daf14a4c-0b79-4365-acea-bfc4ca5426a3	product	updated	YZS Stick Foundation With Built-in Brush Dewy Coverage	cmsof4dic00a6agl5u2gzv1f1	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:27:28.557
ec8b63cf-73cd-47f4-8d2b-bfdef8e22b15	product	created	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling	cmsogk55r00foagl5q5glcqoy	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:28:38.28
46ce1acc-476f-40c4-96bd-9462b5e1860e	product	updated	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin	cmsoehmj20087agl5jk2ykc8c	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:29:42.304
5293fabf-3fa0-444a-996c-c69047336a09	product	updated	LISTENTOSKIN 377 Facial Cleanser Dual Amino Acid Deep Pore Cleansing Oil Control Brightening Gentle Face Wash Rich Foam Hydrating Facial Cleanser	cmsoep73y0096agl5r0g0yrgt	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:31:05.389
efa55024-ebac-4685-a064-f146948b3c19	product	updated	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin	cmsoevgwh009aagl52j0rq6cj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:32:32.173
fd56cd16-6943-4105-9298-a66c3b68f230	product	updated	YZS Dewy Foundation Stick With Built-in Brush Light Transparent Hydrating Long Lasting Coverage Portable Face Makeup Foundation Stick	cmsof4dic00a6agl5u2gzv1f1	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:34:16.583
c4f4fd4e-e483-43fd-949d-a989609b9001	product	created	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine	cmsogrtr600glagl5qv6xfqrp	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:34:36.832
673c13e8-9d75-419c-940d-20681c80a4f8	product	created	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel	cmsogtmcw00gxagl591zcexte	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:36:00.5
ef96af4c-fdeb-46b2-a490-4c1a91ba9c60	product	created	Mens Hair Styling Volume Powder, Long Lasting Fluffy Texture, Oil Absorbing Dry Powder, Create Natural Hairstyle For Daily Use	cmsogwt6m00hoagl5lnwfynhh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:38:29.285
a082476a-8726-451a-b64c-26bd5780229f	product	created	Pre-Glued Cluster Eyelashes No Glue Needed C Curl Wispy Natural Individual Lashes Reusable Self Adhesive False Eyelashes For Makeup	cmsogysxp00hsagl5bxhz8oe0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:40:02.477
1905b5a5-bc52-4965-b41b-e81b10d1812e	product	created	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types	cmsoh19kk00i4agl5ku3dkyb8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:41:57.243
2ded68c6-1682-4f86-b6b5-cebf54a3c54b	product	created	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care	cmsoh39dg00ieagl5qprj3v16	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:43:30.097
69117ad5-1b3a-4ac5-953d-595a4901780d	product	created	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer	cmsoh3oex00ioagl5pupua3xq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:43:49.845
7038f036-b8dd-4663-9656-da1be05e364a	product	created	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care	cmsoh83z100j0agl5o90cs0oj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:47:16.49
ca63f21c-c4d4-471a-beaa-4ccb8285d7fb	product	updated	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care	cmsoh39dg00ieagl5qprj3v16	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:47:56.409
0037b819-276e-436e-85b8-047b6567bb06	product	updated	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection	cmsoenfty008kagl5xqh6iky0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:44:16.461
424fa304-f478-42bd-90d0-ab0f0d1be990	product	created	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection	cmsoh920800jkagl5nfbbjdol	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:48:00.729
2f48ab34-3507-4a81-ac84-dc150a1e84c8	product	updated	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics	cmsogf0wi00ehagl5c8ip2jhh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:48:23.338
3cd2b6d8-b8a9-4877-a18b-217199d3e7b9	product	created	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g	cmsohctdv00k8agl5w501bhdv	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:50:56.065
266ce544-f7cf-4b2d-95da-8de0221b53b8	product	created	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml	cmsohj7pj00klagl5lc3rm20j	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:55:54.572
9229620d-975a-405b-a68b-e9c49e81c918	product	updated	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner	cmsofztni00ddagl5j1wo9h5x	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:58:13.908
8c08e4d8-883c-4c49-a064-2da8d8df0e22	product	created	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide	cmsohnm8t00l8agl5zgtygsm3	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 09:59:20.184
a09e9e5c-f6e1-45d5-9ea2-9b77d3ad1b92	product	created	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care	cmsohsgn900lkagl55jpcpsjj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:03:06.056
f81552aa-34ef-4603-85ec-61c2d6b94b5c	product	updated	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard	cmsoi2tnm00mbagl5t9oaaxj2	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:11:39.07
319565f8-1936-4fe0-a433-d69d522dbaf5	product	updated	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam	cmsoiiohf00o0agl5ynkg0zbc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:27:49.957
cc1f6521-abc6-4049-b51e-2e21488d0e8d	product	created	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard	cmsoi2tnm00mbagl5t9oaaxj2	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:11:09.402
1e2da19b-0aa2-45f7-a29b-f10906132265	product	updated	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard	cmsoi2tnm00mbagl5t9oaaxj2	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:13:09.548
b0f3230d-032e-43a3-aced-7b1e97086234	product	created	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula	cmsoi807r00nfagl585dzaq3v	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:15:11.297
7f236b26-0d79-44b7-a69e-a7a9223e8ea6	product	updated	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:15:43.675
8ba3981d-8344-41ad-bb54-aae689c7daa9	product	created	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam	cmsoiiohf00o0agl5ynkg0zbc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:23:29.189
d6a4826b-9ef5-488c-8d37-fcd8bab74ba0	product	created	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage	cmsoijn9e00o3agl5vwza8r6y	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:24:14.324
3501f624-03ee-43f9-90d1-dc8fa5ae01e7	product	created	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer	cmsoim5f100oeagl5y41l1bqw	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:26:11.598
d5c9f2fa-5c1e-4a18-a33b-19ee2160719d	product	updated	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula	cmsoi807r00nfagl585dzaq3v	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:28:06.874
3ac2e364-b4c2-4d5a-addc-4a14667621c6	product	created	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag	cmsoj1gza00pcagl5q865fvqt	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:38:06.123
32936e1d-83aa-48e5-aa78-3e89577ab354	product	created	BROLAMEN Collagenase Microbubble Essence Mask, 30s Absorption Anti-Wrinkle Firming Bubble Facial Mask	cmsoj3j1500pnagl5wqrdje4j	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:39:42.098
1fc71db6-cdce-4cae-8d60-f273cc632b18	product	created	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin	cmsoj4f4d00pvagl5yshv0vy8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:40:23.697
7efacdff-32e5-4978-98e3-6a020e9e311f	product	updated	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam	cmsoiiohf00o0agl5ynkg0zbc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:42:44.558
ae0b7e4a-bbf9-4da3-9bd8-69154d13779c	product	updated	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag	cmsoj1gza00pcagl5q865fvqt	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 10:42:46.594
6caed3e6-1405-489f-a989-941757863079	product	created	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag	cmsok17rz00qpagl5yx11zg55	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 11:05:53.635
49d4e179-212f-485c-a005-5a3f32678525	product	created	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	cmsokc86e00rhagl523q7h9fc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 11:14:27.568
fb7c129f-9a73-46c9-854d-ca5e29df4452	product	updated	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	cmsokc86e00rhagl523q7h9fc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 11:15:54.138
f703534b-9a33-4856-b1b6-f60883fdd591	product	created	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap	cmsokzfdd00ryagl5ru2p65ve	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-11 11:32:29.878
9b343416-5169-4e75-a102-df6b5bb72675	product	updated	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 02:59:14.776
297ae7ae-da22-4f17-ba8c-bc299050e9a3	product	updated	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan	cmseu3qbo0017e5l5bwq7dfg8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 04:38:31.759
e0dedb9a-723f-42c3-865c-70713899409e	product	updated	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 04:47:05.742
a9f1ee22-0ead-4812-9f3f-a0a642719520	product	updated	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan	cmseu3qbo0017e5l5bwq7dfg8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 04:48:01.789
69b303ac-44c8-462b-92bb-015d9628cb6f	product	updated	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 04:53:48.367
60d6fc1e-065a-46d1-8c25-372bd3f59bae	product	updated	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 04:54:00.254
a3c8a71d-a845-482b-9984-f609edb8d604	product	updated	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil	cmsoenwof008uagl5plzqvpqm	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 06:49:58.404
6a83910c-c0c9-4f95-9da6-3115e2a40277	product	updated	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance	cmsof41qn00a3agl50g9g1u37	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 07:04:03.149
9de759fc-9d50-4d4e-ae94-00be79a22626	product	updated	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil	cmsoenwof008uagl5plzqvpqm	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 07:04:32.417
49fc350d-1a2f-4be0-ada1-bc64f421eb5f	product	updated	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types	cmsofgbzd00bkagl5xnah2eno	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 07:08:54.979
8b554d96-c8fc-4ea9-b580-02beede36224	product	updated	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color	cmsofqg4200cmagl55re4rwis	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 07:19:09.436
46bb2fec-7a81-454b-a47e-0519675cffae	product	updated	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil	cmsoenwof008uagl5plzqvpqm	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 07:21:40.831
065235cb-2ca0-4567-88d3-81d9476d9cc2	product	updated	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care	cmsohsgn900lkagl55jpcpsjj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 07:44:10.387
cad9a50f-aa76-4ace-ae48-b873f544d5e9	product	updated	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care	cmsohsgn900lkagl55jpcpsjj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 07:45:21.771
bc11dcc5-4b51-4074-83d0-15469ee89f26	product	updated	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care	cmsoh83z100j0agl5o90cs0oj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 07:55:12.864
61c390fa-7c38-4dac-be6d-cf08a9ea0db9	product	updated	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g	cmsohctdv00k8agl5w501bhdv	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 07:56:17.626
46aefa70-33ca-4c55-b4d6-a4f5512cde9c	product	updated	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care	cmsoh39dg00ieagl5qprj3v16	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 07:59:23.951
40003ef5-d7d9-4aea-8e0a-728a7494ec4d	product	updated	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care	cmsohsgn900lkagl55jpcpsjj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:01:13.036
d4ec42b1-24e9-4022-8c2b-474531b85eb5	product	updated	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care	cmsoh83z100j0agl5o90cs0oj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:01:28.001
dde90bab-411d-4c70-b539-945f344d01bb	product	updated	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care	cmsoh39dg00ieagl5qprj3v16	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:01:43.67
071a5be3-8913-4abb-90a9-58b9051733d5	product	updated	Pre-Glued Cluster Eyelashes No Glue Needed C Curl Wispy Natural Individual Lashes Reusable Self Adhesive False Eyelashes For Makeup	cmsogysxp00hsagl5bxhz8oe0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:05:47.141
0b842681-d661-4116-b581-78744afb54c2	product	updated	BROLAMEN Collagenase Microbubble Essence Mask, 30s Absorption Anti-Wrinkle Firming Bubble Facial Mask	cmsoj3j1500pnagl5wqrdje4j	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:06:45.009
0f0279ab-e6e6-420c-b51d-669087124c89	product	updated	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g	cmsohctdv00k8agl5w501bhdv	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:07:34.617
3d5c3279-668e-4c36-a7c1-a1ea03d7b5f6	product	updated	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer	cmsoh3oex00ioagl5pupua3xq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:11:05.693
789a5dc4-1943-4ae8-bbf7-5bd70bf596e9	product	updated	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics	cmsogf0wi00ehagl5c8ip2jhh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:12:09.023
3fa97c0a-2e81-43dd-bd01-3d1518eb1bfb	product	updated	Mens Hair Styling Volume Powder, Long Lasting Fluffy Texture, Oil Absorbing Dry Powder, Create Natural Hairstyle For Daily Use	cmsogwt6m00hoagl5lnwfynhh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:13:42.778
2eefd359-6e90-4d99-a0f8-e504a6654917	product	updated	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine	cmsogrtr600glagl5qv6xfqrp	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:16:14.301
d14934da-8af0-4027-918e-bccedf1233fa	product	updated	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara	cmsofmugw00byagl5hvqnyrco	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:16:54.512
4d7cab0c-117f-4981-b18c-eabcff14dd63	product	updated	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling	cmsogk55r00foagl5q5glcqoy	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:21:42.642
7bcea6f7-30be-437a-94ba-3b58aa57c51f	product	updated	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner	cmsofztni00ddagl5j1wo9h5x	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:26:08.173
062d417e-c369-4ae7-afcb-1957b5ffe286	product	updated	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin	cmsoj4f4d00pvagl5yshv0vy8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:27:22.663
801599aa-daa7-49f6-acc4-363cfafadb74	product	updated	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin	cmsoffma900b4agl52y9tui4y	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:28:20.683
ac211a88-e900-4247-a233-6588a6a9767d	product	updated	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam	cmsoiiohf00o0agl5ynkg0zbc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:30:31.681
a6f1b5f3-1ef9-410a-83fd-d6559ec48718	product	updated	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth	cmsof85wb00adagl5n9tvx36l	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:31:35.814
9679c21a-cbe6-4863-bee5-90b9319ac551	product	updated	YZS Dewy Foundation Stick With Built-in Brush Light Transparent Hydrating Long Lasting Coverage Portable Face Makeup Foundation Stick	cmsof4dic00a6agl5u2gzv1f1	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:34:23.938
6e77ec19-0f4e-4e88-99d7-33a31cfc06a8	product	updated	numbuzin No.3 Porcelain Tone Up Beige SPF50+ PA++++ Lazy Tone Up Cream	cmsof2spy009uagl5h5ldpucd	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:34:43.712
95f228f5-9100-49cf-8fef-adb707c72d53	product	updated	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin	cmsoevgwh009aagl52j0rq6cj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:37:38.187
f5e57cf5-3c22-40f0-929c-a3c8bf077972	product	updated	éLL Multi-effect Toning Cream, Natural Brightening Lazy Face Cream	cmsoexnlq009lagl56g2pim8q	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:40:11.282
e040ab78-a86c-4fe6-9aa7-06c81f1d9431	product	updated	LISTENTOSKIN 377 Facial Cleanser Dual Amino Acid Deep Pore Cleansing Oil Control Brightening Gentle Face Wash Rich Foam Hydrating Facial Cleanser	cmsoep73y0096agl5r0g0yrgt	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:44:16.559
e8c9f9a9-36e3-4d63-b05e-0616bc91c01f	product	updated	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage	cmsoijn9e00o3agl5vwza8r6y	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:47:27.548
6367b86f-f516-4c08-b8a9-3d2773bed5ec	product	updated	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth	cmsog05sv00dtagl56fzqqbsg	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:52:57.557
ef123e5a-eb94-4506-8d34-7164c5f06a79	product	updated	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool	cmsog75pm00e6agl586ijcjyr	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:56:39.209
9d0f4f32-1157-49ae-b7c7-19aa413be066	product	updated	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin	cmsoehmj20087agl5jk2ykc8c	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:57:59.533
d0e14870-82b9-400e-9402-0219952cb402	product	updated	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin	cmsogi6sf00fcagl5q2szgip8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 08:59:20.555
bf5557c7-9685-4b56-9f3d-976462197d94	product	updated	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel	cmsogtmcw00gxagl591zcexte	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 09:02:08.489
68c7545d-e6ff-4d8b-a682-320f0aea506a	product	updated	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types	cmsoh19kk00i4agl5ku3dkyb8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 09:04:47.109
40119a39-02da-4feb-ad0f-acc6791eaca8	product	updated	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection	cmsoh920800jkagl5nfbbjdol	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 09:07:51.124
e08c3902-91b1-49da-911f-5971cb07f71d	product	updated	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml	cmsohj7pj00klagl5lc3rm20j	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 09:10:56.376
92a7e2ff-6235-41bd-8693-55b9ac2425e4	product	updated	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide	cmsohnm8t00l8agl5zgtygsm3	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 09:14:21.234
552aa3ca-161d-4a73-a56c-1a400e85e679	product	updated	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula	cmsoi807r00nfagl585dzaq3v	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 09:17:31.034
56bf6b75-248c-4402-9f28-93dd9ba614fa	product	updated	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:05:00.358
31c5322e-453e-458f-bc82-36c9daf86bba	product	updated	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:05:47.196
ba982b28-367d-42c0-9db3-b47fdb09cdb2	product	updated	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan	cmseuiruy002be5l5xukisdtq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:23:32.324
8a45d84c-ab30-44af-b1e9-f2f8a0691e47	product	updated	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan	cmseupxoj002re5l5ll7imhj2	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:28:13.06
c7f15e41-9de2-45a3-924c-e0ee5f62094b	product	updated	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display	cmseuv7eg0033e5l5zhr3jjip	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:32:35.342
b680fb0a-2c9f-4374-891b-7c17e722bc6a	product	updated	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler	cmsev2vmr003ge5l5i9ym859k	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:38:06.337
dfffeb8c-e612-4e75-a65d-35582ac4903f	product	updated	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls	cmsevbgyr003te5l5k1blh6hk	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:42:23.276
840e5cad-a3fd-4f4c-a781-4b7c3cd8fe5e	product	updated	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin	cmsevi0i4004we5l5dfi04msm	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:45:15.366
b589fe66-257c-4289-9cb7-3318f794faff	product	updated	N35 Gaming Wireless Earbuds Bluetooth 5.3 Low Delay LED Display Dual Mode Stereo In-Ear Earphones with Mic	cmsevlqvf005je5l5ixjvc5kh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:47:34.946
38b744d1-173e-4dc3-a4bf-e4cb7ba1d005	product	updated	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display	cmsevs81m0060e5l5x2jq7v6r	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:52:24.655
a1d414e9-b4e3-46ef-adef-dfa2ea209fff	product	updated	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel	cmsodxbat007lagl5twvuqhem	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-12 10:56:03.071
5abc4289-b487-47ad-8e44-aafcbbe46884	product	updated	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan	cmseupxoj002re5l5ll7imhj2	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 01:44:31.924
ba73aa75-0ded-47b9-a67c-444cac0c0a2c	product	updated	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan	cmseuiruy002be5l5xukisdtq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 01:44:50.037
608548e9-6cdd-4bd0-b3c8-cbf49b0d6955	product	updated	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 01:45:11.279
b2ffe6b7-a3a6-4671-85c0-7804ded514d0	product	updated	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls	cmsevbgyr003te5l5k1blh6hk	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 01:45:42.109
9c36b3fe-fc37-4636-8cf8-7a9e65d4f5e6	product	updated	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin	cmsevi0i4004we5l5dfi04msm	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 01:45:57.358
8ee07459-abc8-41af-b0dd-f64a6aa21eeb	product	updated	N35 Gaming Wireless Earbuds Bluetooth 5.3 Low Delay LED Display Dual Mode Stereo In-Ear Earphones with Mic	cmsevlqvf005je5l5ixjvc5kh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 01:46:16.169
9229e176-40a4-4cb8-83b4-0259d746d8af	product	updated	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	cmsn6f27a000gagl5b0yvsz4t	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 01:46:51.352
1e3e3841-275b-4464-89b4-d0a8049470d3	product	updated	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display	cmsevs81m0060e5l5x2jq7v6r	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 01:46:32.611
4f0be513-516a-4b2f-8812-f582ac476bbf	product	updated	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel	cmsodxbat007lagl5twvuqhem	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 01:47:05.08
e0668865-358d-41da-a76f-b30a416691a4	product	updated	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap	cmsokzfdd00ryagl5ru2p65ve	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:26:47.924
5f3e8eed-9fc5-4a30-9634-7e1b61f8cf25	product	updated	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	cmsokc86e00rhagl523q7h9fc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:26:51.358
0ba8a5e4-7cc1-4ca1-bf45-c05f608927a9	product	updated	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap	cmsokzfdd00ryagl5ru2p65ve	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:26:54.767
b3658d69-f4e3-421c-b16c-8a9d8f21f3f3	product	updated	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	cmsokc86e00rhagl523q7h9fc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:26:55.706
214a38c1-b3ec-4b47-9736-50ab1e2fbdaf	product	updated	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:27:14.349
4da86b5b-1a77-49a5-be9b-311148b2766b	product	updated	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag	cmsok17rz00qpagl5yx11zg55	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:27:23.944
b2a30113-48cb-4af8-a75f-4bcaf0b67872	product	updated	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	cmsokc86e00rhagl523q7h9fc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:27:30.665
271accba-169e-4419-b025-14654debaaf5	product	updated	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:27:47.121
118f1daa-a5de-452b-8217-522e76c0099a	product	updated	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan	cmseu3qbo0017e5l5bwq7dfg8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:27:50.155
b36c0ece-8523-4c02-acd5-de7b6c68545a	product	updated	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:27:56.36
5be2c157-cf02-47ee-bd52-97d19caec439	product	updated	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan	cmseuiruy002be5l5xukisdtq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:28:01.763
a8c8d30d-8f31-4481-9455-f89cd385c195	product	updated	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap	cmsokzfdd00ryagl5ru2p65ve	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:28:44.763
4c3dd39e-e5c5-4148-b767-e679f450a4d1	product	updated	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	cmsokc86e00rhagl523q7h9fc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:28:47.78
c9a8fd1f-56fe-4b01-ae80-1081827c8253	product	updated	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag	cmsok17rz00qpagl5yx11zg55	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:29:05.259
20a7b31c-be30-429e-a082-c8b424cbfc61	product	updated	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	cmsokc86e00rhagl523q7h9fc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:29:09.942
3f025a67-5a94-4e84-89ea-afab4f5f350b	product	updated	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag	cmsok17rz00qpagl5yx11zg55	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:29:22.585
cc3d3658-fd48-4efd-94d0-3a49cc3a2f66	product	updated	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan	cmseuiruy002be5l5xukisdtq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:32:50.176
ed468119-7e49-465a-bead-3918dbc36e3c	product	updated	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:32:54.135
7517d98c-936a-45d7-a229-a0dd12a871df	product	updated	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan	cmseu3qbo0017e5l5bwq7dfg8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:32:58.262
badd26a6-3c6c-4bba-b52a-52a26d811ad5	product	updated	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:33:02.092
06d0a4c8-1356-47a2-8029-89bdc8d38c0c	product	updated	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:45:01.876
8188f1f1-f374-4ee6-9a23-2a7cb8a727f2	product	updated	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display	cmseuv7eg0033e5l5zhr3jjip	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:45:30.599
ee859215-7fa7-4a82-b19d-c8eef6409b3d	product	updated	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler	cmsev2vmr003ge5l5i9ym859k	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:45:57.339
457a16cf-da82-4c2e-a0ce-f65de57a888b	product	updated	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan	cmseuiruy002be5l5xukisdtq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 07:54:06.815
516e69f1-ccc8-475d-8cf3-6899e3aef0b0	product	updated	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	cmseud47n001ye5l5qahrywu0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:00:54.075
7549df94-b7d3-4d7a-97d8-916a0d2e22b7	product	updated	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls	cmsevbgyr003te5l5k1blh6hk	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:03:32.893
9a516ef8-8a3c-4176-af50-fb6568e5ef4f	product	updated	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display	cmsevs81m0060e5l5x2jq7v6r	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:06:10.026
773612e4-8c50-4638-8242-b1fc99ab4cd7	product	updated	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy	cmsoefl0a007uagl52wuho36v	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:14:45.399
30405f17-92c8-41d3-ab1e-97b326dfb009	product	updated	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection	cmsoenfty008kagl5xqh6iky0	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:19:40.388
5492e5e5-bce8-4571-b6f0-952d3229c984	product	updated	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation	cmsofnqwj00ccagl5dcqregd9	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:23:41.396
554c503a-8520-422e-a961-55e74dadbf7d	product	updated	USB Rechargeable Electric Makeup Brush 10 Vibration Modes Soft Fluffy Foundation Blush Cosmetic Brush	cmsoftek200d4agl5jnznn882	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:25:34.704
3f624da0-3fe8-43c7-aee8-b5c67df592f2	product	updated	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard	cmsoi2tnm00mbagl5t9oaaxj2	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:38:22.997
8bb5e5f9-cbb0-4389-8d64-10120d8b2457	product	updated	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer	cmsoim5f100oeagl5y41l1bqw	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:41:42.637
40ecd0ce-d8d0-4751-9afe-3856e1df9310	product	updated	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer	cmsoim5f100oeagl5y41l1bqw	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:43:20.786
8c7a1984-eb21-4165-836c-5a050a90ea1a	product	updated	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag	cmsoj1gza00pcagl5q865fvqt	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:49:22.657
7ceeb5f6-f887-4fab-aaa5-c4a06477f896	product	updated	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag	cmsok17rz00qpagl5yx11zg55	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:51:59.016
57578218-4625-4b75-98ff-2c1522bb66d7	product	updated	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	cmsokc86e00rhagl523q7h9fc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:53:20.377
1fb3fb0d-3974-4956-a487-042d9502b0d7	product	updated	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap	cmsokzfdd00ryagl5ru2p65ve	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 08:56:07.7
a7aa269d-885b-4cd4-9248-443f8a1942c3	product	updated	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	cmsetqd7x000re5l5hq59opwb	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 09:00:59.935
81d8b54f-2824-41ac-a08d-891754814e34	product	updated	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan	cmseu3qbo0017e5l5bwq7dfg8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-13 09:02:48.61
dfc23a39-611d-4a7f-8e0b-906b61505317	product	updated	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage	cmsoijn9e00o3agl5vwza8r6y	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:32:38.657
56f33cba-1f3f-4f0c-a196-febb3c0ba066	product	updated	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam	cmsoiiohf00o0agl5ynkg0zbc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:32:44.573
6c6feabf-abc4-4437-be44-e123fb2f7c03	product	updated	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula	cmsoi807r00nfagl585dzaq3v	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:32:51.063
df601e35-2a17-4ecf-b2f5-c6423b051bf8	product	updated	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide	cmsohnm8t00l8agl5zgtygsm3	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:32:57.929
81e088e3-ada0-408f-bf73-ecc4e47d6780	product	updated	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g	cmsohctdv00k8agl5w501bhdv	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:01.713
2704f0db-797b-4b90-872e-41f1d28c3bcd	product	updated	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection	cmsoh920800jkagl5nfbbjdol	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:04.647
b876ee4d-332b-4833-b572-489c14a66fe3	product	updated	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care	cmsoh83z100j0agl5o90cs0oj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:06.846
dcad2a22-2e6e-4628-abda-3b81b3addce3	product	updated	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer	cmsoh3oex00ioagl5pupua3xq	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:08.488
a8ebaa8a-7841-4ec4-a3d8-926c53bb405c	product	updated	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care	cmsoh39dg00ieagl5qprj3v16	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:09.339
2f23aaf1-0141-498c-b697-58ca2d0f19e3	product	updated	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types	cmsoh19kk00i4agl5ku3dkyb8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:12.329
d2a06ec0-a7a1-4192-b1e2-7698b50d97b5	product	updated	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine	cmsogrtr600glagl5qv6xfqrp	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:16.212
25c0d854-39ff-46e7-9c71-f70d26fcbfda	product	updated	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling	cmsogk55r00foagl5q5glcqoy	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:17.018
8fc6ff11-c604-4b6e-9613-42439ca8ba33	product	updated	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin	cmsogi6sf00fcagl5q2szgip8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:20.838
f35dd617-5f39-48a0-9e1c-be3586bb4cf0	product	updated	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool	cmsog75pm00e6agl586ijcjyr	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:31.391
34b9f450-6dde-4c42-80bd-6301e6997383	product	updated	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth	cmsog05sv00dtagl56fzqqbsg	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:40.66
a17e246e-0dad-4642-b994-1b76b01762c5	product	updated	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color	cmsofqg4200cmagl55re4rwis	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:46.543
052660c5-9a14-4eda-90b9-ccb67f47a565	product	updated	éLL Multi-effect Toning Cream, Natural Brightening Lazy Face Cream	cmsoexnlq009lagl56g2pim8q	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:58.583
6a662e9e-61ac-41ca-a485-ef32daa92ac7	product	updated	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag	cmsoj1gza00pcagl5q865fvqt	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:35:32.351
d85136cd-b84b-4e0d-85cf-e41fb60c3d0f	product	updated	YZS Dewy Foundation Stick With Built-in Brush Light Transparent Hydrating Long Lasting Coverage Portable Face Makeup Foundation Stick	cmsof4dic00a6agl5u2gzv1f1	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:40:59.971
cf49db35-468c-464a-9751-c7be109704bd	product	updated	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types	cmsofgbzd00bkagl5xnah2eno	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:49.766
a3ec7fa7-02ef-40e0-a766-ae10fda8e902	product	updated	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth	cmsof85wb00adagl5n9tvx36l	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:52.778
a857d568-8f40-4ba7-bf8e-ea704883e9c9	product	updated	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin	cmsoehmj20087agl5jk2ykc8c	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:34:03.359
5e09ba1a-ca53-48dd-8626-3d213eef40bc	product	updated	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap	cmsokzfdd00ryagl5ru2p65ve	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:34:47.151
51194d6a-dd33-40d7-95cd-2ceb222e5346	product	updated	BROLAMEN Collagenase Microbubble Essence Mask, 30s Absorption Anti-Wrinkle Firming Bubble Facial Mask	cmsoj3j1500pnagl5wqrdje4j	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:35:11.643
d37b9a8e-aa5f-4656-ac4d-8dbb2042313b	product	updated	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin	cmsoj4f4d00pvagl5yshv0vy8	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:35:12.883
8b6f2142-14cf-41f9-ba78-c2c177037e02	product	updated	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag	cmsoj1gza00pcagl5q865fvqt	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:35:22.801
b9d11432-c512-4e9b-9dfd-aa741ea932eb	product	updated	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics	cmsogf0wi00ehagl5c8ip2jhh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:36:03.433
a65ae107-0b2f-40f3-b2b0-7734c4e7ac3f	product	updated	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml	cmsohj7pj00klagl5lc3rm20j	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:39:22.954
4559ed73-32e7-4139-9d12-60130e7886e5	product	updated	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance	cmsof41qn00a3agl50g9g1u37	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:39:36.543
0be4c262-4459-42d7-818f-c45801c616dd	product	updated	numbuzin No.3 Porcelain Tone Up Beige SPF50+ PA++++ Lazy Tone Up Cream	cmsof2spy009uagl5h5ldpucd	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:57.019
cbdde4ec-fbde-491c-8ac6-6880ae455d8c	product	updated	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin	cmsoevgwh009aagl52j0rq6cj	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:33:59.262
bfa5e415-63a0-4355-a36c-9d1bd605c8d5	product	updated	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil	cmsoenwof008uagl5plzqvpqm	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:34:02.072
da832f37-c7f2-4b6d-ae61-33d0fcd6f1c2	product	updated	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	cmsokc86e00rhagl523q7h9fc	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:34:47.759
d55ba136-d115-41eb-a646-9586cf3cd66c	product	updated	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag	cmsok17rz00qpagl5yx11zg55	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:34:48.515
f6a16d73-7311-4109-bb31-827e213898dc	product	updated	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml	cmsohj7pj00klagl5lc3rm20j	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:37:07.07
52104533-6dbc-40ca-9b3c-9f33603b596e	product	updated	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml	cmsohj7pj00klagl5lc3rm20j	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:39:15.511
86c0d23c-1e74-4876-99b7-0dab1e3b9774	product	updated	Mens Hair Styling Volume Powder, Long Lasting Fluffy Texture, Oil Absorbing Dry Powder, Create Natural Hairstyle For Daily Use	cmsogwt6m00hoagl5lnwfynhh	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 03:39:28.142
5c6d0cf1-24e8-45a1-8015-8a50d1a6a597	product	created	Power Station Carry Bag Waterproof Storage Case For Jackery Ecoflow Bluetti	cmssqwbt8005hkjl5dbp5umy7	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 09:29:07.961
d6ccc278-712e-40ae-904b-719375fd498a	product	created	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use	cmssrges5005okjl576m671fd	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 09:44:44.959
e2ed2d53-a41a-432a-be15-d18489240603	product	created	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag	cmssrsdry0060kjl5mhqtt9tg	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 09:54:03.273
b720a58b-c99d-402f-a747-b5275a958358	product	updated	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use	cmssrges5005okjl576m671fd	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 09:57:40.683
03edc5dd-4da7-4401-9b95-d867552f0994	product	updated	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag	cmssrsdry0060kjl5mhqtt9tg	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 09:58:29.652
b62fe4e6-ceff-4032-83b3-009da127a03d	product	created	Double Layer Sewing Supplies Storage Bag, Large Capacity Craft Organizer Tote with Removable Dividers, Adjustable Shoulder Strap	cmsss0aae0077kjl52qq7n6tz	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 10:00:11.73
29240b51-1999-479f-a4e3-fc5286155c39	product	created	Lightweight Quilted Sling Bag, Multi Pocket Water Resistant Crossbody Chest Bag for Travel Daily	cmsss8zpn0079kjl5b7eajgfk	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 10:06:58.315
8873df1e-dcb6-46be-b5f1-70e504f05541	product	updated	Double Layer Sewing Supplies Storage Bag, Large Capacity Craft Organizer Tote with Removable Dividers, Adjustable Shoulder Strap	cmsss0aae0077kjl52qq7n6tz	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 10:07:55.887
5f493321-cf9d-444d-8e8a-10e8209d3650	product	updated	Lightweight Quilted Sling Bag, Multi Pocket Water Resistant Crossbody Chest Bag for Travel Daily	cmsss8zpn0079kjl5b7eajgfk	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 10:08:50.699
852fa2ae-b44b-4ebf-80ff-158866e2b01d	product	created	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards	cmssscbxy0084kjl5pnyxtdil	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 10:09:34.354
26cc7b13-470b-4a89-8d22-080519698580	product	updated	Power Station Carry Bag Waterproof Storage Case For Jackery Ecoflow Bluetti	cmssqwbt8005hkjl5dbp5umy7	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 10:16:27.926
2a68bcc4-18e4-47b5-9c3b-67fe17be27e4	product	created	Water Resistant Nylon Makeup Bag with Detachable Handle, Large Capacity Travel Cosmetic Organizer Pouch, Portable Toiletry Storage Bag	cmsssqspa008mkjl56pzpxbf7	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 10:20:48.878
1cc5996c-cc9a-4202-b4c5-dc464fccdceb	product	created	Dual Pocket Mini Wristlet Pouch, Waterproof Nylon Small Coin Purse with Hand Strap, Portable Card Key Earphone Lipstick Storage Bag	cmsst1v85008tkjl5t4nfcd0c	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 10:29:25.396
467abad8-aa4a-46fe-ad5b-1af8365d0692	product	updated	Water Resistant Nylon Makeup Bag with Detachable Handle, Large Capacity Travel Cosmetic Organizer Pouch, Portable Toiletry Storage Bag	cmsssqspa008mkjl56pzpxbf7	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 10:32:01.093
3aa90f7b-720f-4d01-af94-137ecb22eac0	product	created	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag	cmssty1770090kjl5pnp0s698	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 10:54:26.039
897dd78d-ed05-492d-a7c4-f40fa3be2488	product	updated	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag	cmssty1770090kjl5pnp0s698	/admin/products	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-14 11:30:30.031
693d357d-795f-41ab-ab92-4f2a09bf5f2a	product	created	Women’s Small Crossbody Bag, Adjustable Strap Casual Shoulder Purse for Shopping	cmsswqk1j0000oll5ob5qxbnu	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 12:12:36.367
c1e1bf52-5066-454e-935a-fb5cff2f896b	product	created	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag	cmssxb5zf000joll5akbaclyg	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-14 12:28:37.801
940894c5-44cf-4b46-b307-b4f2d9c3a532	product	updated	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards	cmssscbxy0084kjl5pnyxtdil	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-15 08:19:19.058
39990965-c901-4c8b-853b-cf966ba87e5b	product	updated	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards	cmssscbxy0084kjl5pnyxtdil	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-15 08:22:02.026
07c5c02e-5eb4-4639-ad6f-204b56d77946	product	updated	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag	cmssty1770090kjl5pnp0s698	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-15 08:29:28.4
d7815c34-6bab-4790-91f7-be23422e0142	product	updated	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag	cmssrsdry0060kjl5mhqtt9tg	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-15 08:50:57.621
4f102f24-4308-4d06-a238-c6db9492fc06	product	updated	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use	cmssrges5005okjl576m671fd	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-15 08:52:49.952
29112f7c-01c8-4dd5-a785-80833ac40fa0	settings	updated	store settings	\N	/admin/settings	cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	2026-08-19 13:32:11.366
54327620-0aa1-404e-8a34-e31d09efde91	product	created	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion	cmt1b7iu70000agl58hd3r9h4	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-20 09:19:51.854
f9d53f27-6a1a-4b18-b4ab-6ace57ddf0ad	product	Brand created	Coolkim	cmt1ba6j00007agl52vlv2ogc	/admin/brands	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-20 09:21:55.119
5428dddb-3156-43e3-a4ba-47b2af0b254a	product	updated	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion	cmt1b7iu70000agl58hd3r9h4	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-20 09:22:22.048
19b252bd-a969-4d62-83b9-c0f6e8cde2ac	product	updated	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion	cmt1b7iu70000agl58hd3r9h4	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-20 09:23:12.65
2d21dde4-d505-4b61-84dc-d23f4e92bdb6	product	updated	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion	cmt1b7iu70000agl58hd3r9h4	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-20 09:35:02.756
d54541a2-82c3-4386-a284-26aed1c086f4	product	updated	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion	cmt1b7iu70000agl58hd3r9h4	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-08-20 09:35:36.826
b84064db-7e05-4a58-889a-3b30a30e99b9	product	updated	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation	cmsofnqwj00ccagl5dcqregd9	/admin/products	cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	2026-09-04 04:18:01.907
\.


--
-- TOC entry 3911 (class 0 OID 25119)
-- Dependencies: 241
-- Data for Name: AdminCapital; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AdminCapital" (id, amount, note, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3914 (class 0 OID 25157)
-- Dependencies: 244
-- Data for Name: AdminCapitalCostActivity; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AdminCapitalCostActivity" (id, type, description, amount, note, "entityId", "actorId", "actorName", "actorEmail", "createdAt") FROM stdin;
\.


--
-- TOC entry 3913 (class 0 OID 25143)
-- Dependencies: 243
-- Data for Name: AdminOtherCost; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AdminOtherCost" (id, amount, reason, description, "costDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3912 (class 0 OID 25131)
-- Dependencies: 242
-- Data for Name: AdminProductCost; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AdminProductCost" (id, "productId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3919 (class 0 OID 106533)
-- Dependencies: 249
-- Data for Name: AirwallexWebhookEvent; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."AirwallexWebhookEvent" (id, "eventId", "eventName", "paymentIntentId", "accountId", "apiVersion", "receivedAt", "processingStatus", "processingAttempts", "sanitizedPayload", "processedAt", "processingError", "nextAttemptAt", "lockedAt", "lockToken", "paymentTransactionId") FROM stdin;
cmsgcpdu0000704jsllg11dw2	evt_sgpvc628hhl2e8wico4_8wi4yb	payment_intent.created	int_sgpvc628hhl2e8wi4yb	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:18:34.056	PENDING	0	{"id": "evt_sgpvc628hhl2e8wico4_8wi4yb", "data": {"object": {"id": "int_sgpvc628hhl2e8wi4yb", "amount": 8.58, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-05T17:18:33+0000", "request_id": "0e9a3ff8-0efd-458c-8378-a17404e505ff", "updated_at": "2026-08-05T17:18:33+0000", "captured_amount": 0, "merchant_order_id": "cmsgcp7b8000104jsw92ebu1l"}}, "name": "payment_intent.created", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T17:18:32+0000"}	\N	\N	2026-08-05 17:18:34.056	\N	\N	\N
cmsgcpe7k000804js6ei8c7l4	evt_sgpvc628hhl2e8wigj1_8wi4yb	payment_intent.requires_payment_method	int_sgpvc628hhl2e8wi4yb	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:18:34.544	PENDING	0	{"id": "evt_sgpvc628hhl2e8wigj1_8wi4yb", "data": {"object": {"id": "int_sgpvc628hhl2e8wi4yb", "amount": 8.58, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-05T17:18:33+0000", "request_id": "0e9a3ff8-0efd-458c-8378-a17404e505ff", "updated_at": "2026-08-05T17:18:33+0000", "captured_amount": 0, "merchant_order_id": "cmsgcp7b8000104jsw92ebu1l"}}, "name": "payment_intent.requires_payment_method", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T17:18:33+0000"}	\N	\N	2026-08-05 17:18:34.544	\N	\N	\N
cmsgcpj37000a04jskahh1fky	evt_sgpvc628hhl2e90pdeg_8wi4yb	payment_attempt.received	int_sgpvc628hhl2e8wi4yb	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:18:40.867	PENDING	0	{"id": "evt_sgpvc628hhl2e90pdeg_8wi4yb", "data": {"object": {"id": "att_sgpvc628hhl2e90p453_8wi4yb", "amount": 8.58, "status": "RECEIVED", "currency": "USD", "created_at": "2026-08-05T17:18:40+0000", "updated_at": "2026-08-05T17:18:40+0000", "payment_intent_id": "int_sgpvc628hhl2e8wi4yb"}}, "name": "payment_attempt.received", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T17:18:40+0000"}	\N	\N	2026-08-05 17:18:40.867	\N	\N	\N
cmsgcpjh0000b04jsf2p6gtso	evt_sgpvc628hhl2e90wq2a_8wi4yb	payment_attempt.authentication_redirected	int_sgpvc628hhl2e8wi4yb	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:18:41.364	PENDING	0	{"id": "evt_sgpvc628hhl2e90wq2a_8wi4yb", "data": {"object": {"id": "att_sgpvc628hhl2e90p453_8wi4yb", "amount": 8.58, "status": "AUTHENTICATION_REDIRECTED", "currency": "USD", "created_at": "2026-08-05T17:18:40+0000", "updated_at": "2026-08-05T17:18:40+0000", "payment_intent_id": "int_sgpvc628hhl2e8wi4yb"}}, "name": "payment_attempt.authentication_redirected", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T17:18:40+0000"}	\N	\N	2026-08-05 17:18:41.364	\N	\N	\N
cmsgcpk8f000c04jstv4ydle2	evt_sgpvc628hhl2e90x8kz_8wi4yb	payment_intent.requires_customer_action	int_sgpvc628hhl2e8wi4yb	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:18:42.351	PENDING	0	{"id": "evt_sgpvc628hhl2e90x8kz_8wi4yb", "data": {"object": {"id": "int_sgpvc628hhl2e8wi4yb", "amount": 8.58, "status": "REQUIRES_CUSTOMER_ACTION", "currency": "USD", "created_at": "2026-08-05T17:18:33+0000", "request_id": "0e9a3ff8-0efd-458c-8378-a17404e505ff", "updated_at": "2026-08-05T17:18:40+0000", "captured_amount": 0, "merchant_order_id": "cmsgcp7b8000104jsw92ebu1l", "latest_payment_attempt": {"id": "att_sgpvc628hhl2e90p453_8wi4yb", "status": "AUTHENTICATION_REDIRECTED", "payment_intent_id": "int_sgpvc628hhl2e8wi4yb"}}}, "name": "payment_intent.requires_customer_action", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T17:18:40+0000"}	\N	\N	2026-08-05 17:18:42.351	\N	\N	\N
cmsgcq0vr000d04jsus17gtep	evt_sgpvc628hhl2e9ep4hd_8wi4yb	payment_attempt.capture_requested	int_sgpvc628hhl2e8wi4yb	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:19:03.927	PENDING	0	{"id": "evt_sgpvc628hhl2e9ep4hd_8wi4yb", "data": {"object": {"id": "att_sgpvc628hhl2e90p453_8wi4yb", "amount": 8.58, "status": "CAPTURE_REQUESTED", "currency": "USD", "created_at": "2026-08-05T17:18:40+0000", "updated_at": "2026-08-05T17:19:03+0000", "payment_intent_id": "int_sgpvc628hhl2e8wi4yb"}}, "name": "payment_attempt.capture_requested", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T17:19:03+0000"}	\N	\N	2026-08-05 17:19:03.927	\N	\N	\N
cmsgcq14g000e04jsmc89c92a	evt_sgpvc628hhl2e9epn02_8wi4yb	payment_intent.succeeded	int_sgpvc628hhl2e8wi4yb	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:19:04.24	PENDING	0	{"id": "evt_sgpvc628hhl2e9epn02_8wi4yb", "data": {"object": {"id": "int_sgpvc628hhl2e8wi4yb", "amount": 8.58, "status": "SUCCEEDED", "currency": "USD", "created_at": "2026-08-05T17:18:33+0000", "request_id": "0e9a3ff8-0efd-458c-8378-a17404e505ff", "updated_at": "2026-08-05T17:19:03+0000", "captured_amount": 8.58, "merchant_order_id": "cmsgcp7b8000104jsw92ebu1l", "latest_payment_attempt": {"id": "att_sgpvc628hhl2e90p453_8wi4yb", "status": "CAPTURE_REQUESTED", "payment_intent_id": "int_sgpvc628hhl2e8wi4yb"}}}, "name": "payment_intent.succeeded", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T17:19:03+0000"}	\N	\N	2026-08-05 17:19:04.24	\N	\N	\N
cmsgcxofd000h04jso3b54q21	evt_sgpvwd9qrhl2efbc6ll_8wi4yb	payment_attempt.settled	int_sgpvc628hhl2e8wi4yb	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:25:01.033	PENDING	0	{"id": "evt_sgpvwd9qrhl2efbc6ll_8wi4yb", "data": {"object": {"id": "att_sgpvc628hhl2e90p453_8wi4yb", "amount": 8.58, "status": "SETTLED", "currency": "USD", "created_at": "2026-08-05T17:18:40+0000", "updated_at": "2026-08-05T17:25:00+0000", "payment_intent_id": "int_sgpvc628hhl2e8wi4yb"}}, "name": "payment_attempt.settled", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T17:25:00+0000"}	\N	\N	2026-08-05 17:25:01.033	\N	\N	\N
cmsgdrizm000004jr87ui90jo	evt_sgpvc628hhl2d1plist_1cpjv6	payment_attempt.capture_requested	int_sgpvc628hhl2d1cpjv6	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:48:13.666	PENDING	0	{"id": "evt_sgpvc628hhl2d1plist_1cpjv6", "data": {"object": {"id": "att_sgpv9vjfghl2d1gl1is_1cpjv6", "amount": 8.64, "status": "CAPTURE_REQUESTED", "currency": "USD", "created_at": "2026-08-05T16:34:46+0000", "updated_at": "2026-08-05T16:35:01+0000", "payment_intent_id": "int_sgpvc628hhl2d1cpjv6"}}, "name": "payment_attempt.capture_requested", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T16:35:01+0000"}	\N	\N	2026-08-05 17:48:13.666	\N	\N	\N
cmsgdro7i000104jraqw910f2	evt_sgpvc628hhl2d1cq70j_1cpjv6	payment_intent.created	int_sgpvc628hhl2d1cpjv6	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:48:20.43	PENDING	0	{"id": "evt_sgpvc628hhl2d1cq70j_1cpjv6", "data": {"object": {"id": "int_sgpvc628hhl2d1cpjv6", "amount": 8.64, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-05T16:34:39+0000", "request_id": "3e1ecd6c-4657-4dad-8b67-09374960a8cb", "updated_at": "2026-08-05T16:34:39+0000", "captured_amount": 0, "merchant_order_id": "cmsgb4r45000104jqvs6n9e40"}}, "name": "payment_intent.created", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T16:34:39+0000"}	\N	\N	2026-08-05 17:48:20.43	\N	\N	\N
cmsgdrp3y000004jrgdx68z3d	evt_sgpv9vjfghl2d1gsprc_1cpjv6	payment_intent.requires_customer_action	int_sgpvc628hhl2d1cpjv6	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:48:21.598	PENDING	0	{"id": "evt_sgpv9vjfghl2d1gsprc_1cpjv6", "data": {"object": {"id": "int_sgpvc628hhl2d1cpjv6", "amount": 8.64, "status": "REQUIRES_CUSTOMER_ACTION", "currency": "USD", "created_at": "2026-08-05T16:34:39+0000", "request_id": "3e1ecd6c-4657-4dad-8b67-09374960a8cb", "updated_at": "2026-08-05T16:34:46+0000", "captured_amount": 0, "merchant_order_id": "cmsgb4r45000104jqvs6n9e40", "latest_payment_attempt": {"id": "att_sgpv9vjfghl2d1gl1is_1cpjv6", "status": "AUTHENTICATION_REDIRECTED", "payment_intent_id": "int_sgpvc628hhl2d1cpjv6"}}}, "name": "payment_intent.requires_customer_action", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T16:34:46+0000"}	\N	\N	2026-08-05 17:48:21.598	\N	\N	\N
cmsgdrp2k000004la5jp96wv9	evt_sgpv9vjfghl2d1gla0d_1cpjv6	payment_attempt.received	int_sgpvc628hhl2d1cpjv6	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:48:21.548	PENDING	0	{"id": "evt_sgpv9vjfghl2d1gla0d_1cpjv6", "data": {"object": {"id": "att_sgpv9vjfghl2d1gl1is_1cpjv6", "amount": 8.64, "status": "RECEIVED", "currency": "USD", "created_at": "2026-08-05T16:34:46+0000", "updated_at": "2026-08-05T16:34:46+0000", "payment_intent_id": "int_sgpvc628hhl2d1cpjv6"}}, "name": "payment_attempt.received", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T16:34:46+0000"}	\N	\N	2026-08-05 17:48:21.548	\N	\N	\N
cmsgdrqqc000104laxhw204o1	evt_sgpvc628hhl2d1cqbn8_1cpjv6	payment_intent.requires_payment_method	int_sgpvc628hhl2d1cpjv6	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:48:23.7	PENDING	0	{"id": "evt_sgpvc628hhl2d1cqbn8_1cpjv6", "data": {"object": {"id": "int_sgpvc628hhl2d1cpjv6", "amount": 8.64, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-05T16:34:39+0000", "request_id": "3e1ecd6c-4657-4dad-8b67-09374960a8cb", "updated_at": "2026-08-05T16:34:39+0000", "captured_amount": 0, "merchant_order_id": "cmsgb4r45000104jqvs6n9e40"}}, "name": "payment_intent.requires_payment_method", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T16:34:39+0000"}	\N	\N	2026-08-05 17:48:23.7	\N	\N	\N
cmsgdrqqz000104jrpibk33e6	evt_sgpv9vjfghl2d1gscn3_1cpjv6	payment_attempt.authentication_redirected	int_sgpvc628hhl2d1cpjv6	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:48:23.723	PENDING	0	{"id": "evt_sgpv9vjfghl2d1gscn3_1cpjv6", "data": {"object": {"id": "att_sgpv9vjfghl2d1gl1is_1cpjv6", "amount": 8.64, "status": "AUTHENTICATION_REDIRECTED", "currency": "USD", "created_at": "2026-08-05T16:34:46+0000", "updated_at": "2026-08-05T16:34:46+0000", "payment_intent_id": "int_sgpvc628hhl2d1cpjv6"}}, "name": "payment_attempt.authentication_redirected", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T16:34:46+0000"}	\N	\N	2026-08-05 17:48:23.723	\N	\N	\N
cmsgdrqrr000204la87m1m38l	evt_sgpvc628hhl2d1pm9t2_1cpjv6	payment_intent.succeeded	int_sgpvc628hhl2d1cpjv6	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 17:48:23.751	PENDING	0	{"id": "evt_sgpvc628hhl2d1pm9t2_1cpjv6", "data": {"object": {"id": "int_sgpvc628hhl2d1cpjv6", "amount": 8.64, "status": "SUCCEEDED", "currency": "USD", "created_at": "2026-08-05T16:34:39+0000", "request_id": "3e1ecd6c-4657-4dad-8b67-09374960a8cb", "updated_at": "2026-08-05T16:35:01+0000", "captured_amount": 8.64, "merchant_order_id": "cmsgb4r45000104jqvs6n9e40", "latest_payment_attempt": {"id": "att_sgpv9vjfghl2d1gl1is_1cpjv6", "status": "CAPTURE_REQUESTED", "payment_intent_id": "int_sgpvc628hhl2d1cpjv6"}}}, "name": "payment_intent.succeeded", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T16:35:01+0000"}	\N	\N	2026-08-05 17:48:23.751	\N	\N	\N
cmsgj4htr000004jvwicvo3d8	evt_sgpv6qdtthl2afqsxyc_8j10y6	payment_attempt.paid	int_sgpvwn4l2hl1z8j10y6	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-05 20:18:16.767	PENDING	0	{"id": "evt_sgpv6qdtthl2afqsxyc_8j10y6", "data": {"object": {"id": "att_sgpv4fc7khl1z8njr33_8j10y6", "amount": 8.01, "status": "PAID", "currency": "USD", "created_at": "2026-08-05T08:14:06+0000", "updated_at": "2026-08-05T15:00:06+0000", "payment_intent_id": "int_sgpvwn4l2hl1z8j10y6"}}, "name": "payment_attempt.paid", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-05T15:00:19+0000"}	\N	\N	2026-08-05 20:18:16.767	\N	\N	\N
cmshn8183000004jsvuekpi42	evt_sgpv6qdtthl3e4ieicb_8wi4yb	payment_attempt.paid	int_sgpvc628hhl2e8wi4yb	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-06 15:00:46.515	PENDING	0	{"id": "evt_sgpv6qdtthl3e4ieicb_8wi4yb", "data": {"object": {"id": "att_sgpvc628hhl2e90p453_8wi4yb", "amount": 8.58, "status": "PAID", "currency": "USD", "created_at": "2026-08-05T17:18:40+0000", "updated_at": "2026-08-06T14:59:59+0000", "payment_intent_id": "int_sgpvc628hhl2e8wi4yb"}}, "name": "payment_attempt.paid", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-06T15:00:11+0000"}	\N	\N	2026-08-06 15:00:46.515	\N	\N	\N
cmshn81a6000004id9oc4lmeh	evt_sgpv6qdtthl3e4ie3oi_bonih7	payment_attempt.paid	int_sgpvc628hhl2dbonih7	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-06 15:00:46.59	PENDING	0	{"id": "evt_sgpv6qdtthl3e4ie3oi_bonih7", "data": {"object": {"id": "att_sgpv9vjfghl2dbsxtb8_bonih7", "amount": 8.64, "status": "PAID", "currency": "USD", "created_at": "2026-08-05T16:45:11+0000", "updated_at": "2026-08-06T14:59:59+0000", "payment_intent_id": "int_sgpvc628hhl2dbonih7"}}, "name": "payment_attempt.paid", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-06T15:00:11+0000"}	\N	\N	2026-08-06 15:00:46.59	\N	\N	\N
cmshn81d6000004k4odzxcllg	evt_sgpv6qdtthl3e4hygdr_ksc3b3	payment_attempt.paid	int_sgpv9vjfghl2dksc3b3	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-06 15:00:46.698	PENDING	0	{"id": "evt_sgpv6qdtthl3e4hygdr_ksc3b3", "data": {"object": {"id": "att_sgpvc628hhl2dkwhe90_ksc3b3", "amount": 8.64, "status": "PAID", "currency": "USD", "created_at": "2026-08-05T16:54:21+0000", "updated_at": "2026-08-06T14:59:59+0000", "payment_intent_id": "int_sgpv9vjfghl2dksc3b3"}}, "name": "payment_attempt.paid", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-06T15:00:10+0000"}	\N	\N	2026-08-06 15:00:46.698	\N	\N	\N
cmshn81em000004k5vy4oq78m	evt_sgpv6qdtthl3e4icru8_1cpjv6	payment_attempt.paid	int_sgpvc628hhl2d1cpjv6	acct_OtuPP0kZPOSOn1uqoKmJ3Q	2026-02-27	2026-08-06 15:00:46.75	PENDING	0	{"id": "evt_sgpv6qdtthl3e4icru8_1cpjv6", "data": {"object": {"id": "att_sgpv9vjfghl2d1gl1is_1cpjv6", "amount": 8.64, "status": "PAID", "currency": "USD", "created_at": "2026-08-05T16:34:46+0000", "updated_at": "2026-08-06T14:59:59+0000", "payment_intent_id": "int_sgpvc628hhl2d1cpjv6"}}, "name": "payment_attempt.paid", "version": "2026-02-27", "account_id": "acct_OtuPP0kZPOSOn1uqoKmJ3Q", "created_at": "2026-08-06T15:00:11+0000"}	\N	\N	2026-08-06 15:00:46.75	\N	\N	\N
cmt5bgpkt00073rl5tpd9up6q	evt_hkpdttns9hllnqfwhyo_qfvzfy	payment_intent.requires_payment_method	int_hkpdttns9hllnqfvzfy	acct_rVa5RClNPF2gR7YolQqcWg	2026-02-27	2026-08-23 04:38:04.157	PENDING	0	{"id": "evt_hkpdttns9hllnqfwhyo_qfvzfy", "data": {"object": {"id": "int_hkpdttns9hllnqfvzfy", "amount": 17.83, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T04:38:03+0000", "request_id": "3f919d50-8856-578c-a875-e82f36b84362", "updated_at": "2026-08-23T04:38:03+0000", "captured_amount": 0, "merchant_order_id": "cmt5bgnoy00033rl5izzaflid"}}, "name": "payment_intent.requires_payment_method", "version": "2026-02-27", "account_id": "acct_rVa5RClNPF2gR7YolQqcWg", "created_at": "2026-08-23T04:38:03+0000"}	\N	\N	2026-08-23 04:38:04.157	\N	\N	\N
cmt5c2wx3000n3rl5frzp7fxw	evt_hkpdnss2whllo7jws28_7jwkce	payment_intent.requires_payment_method	int_hkpdnss2whllo7jwkce	acct_rVa5RClNPF2gR7YolQqcWg	2026-02-27	2026-08-23 04:55:20.103	PENDING	0	{"id": "evt_hkpdnss2whllo7jws28_7jwkce", "data": {"object": {"id": "int_hkpdnss2whllo7jwkce", "amount": 17.83, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T04:55:18+0000", "request_id": "626b70f4-7538-5ed0-a344-20d2e23e3248", "updated_at": "2026-08-23T04:55:18+0000", "captured_amount": 0, "merchant_order_id": "cmt5c2u49000i3rl5xdy4vooy"}}, "name": "payment_intent.requires_payment_method", "version": "2026-02-27", "account_id": "acct_rVa5RClNPF2gR7YolQqcWg", "created_at": "2026-08-23T04:55:18+0000"}	\N	\N	2026-08-23 04:55:20.103	\N	\N	\N
cmt5c6jx9000v3rl5io6v7svz	evt_hkpdnss2whlloadsn88_adseqm	payment_intent.requires_payment_method	int_hkpdnss2whlloadseqm	acct_rVa5RClNPF2gR7YolQqcWg	2026-02-27	2026-08-23 04:58:09.885	PENDING	0	{"id": "evt_hkpdnss2whlloadsn88_adseqm", "data": {"object": {"id": "int_hkpdnss2whlloadseqm", "amount": 17.83, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T04:58:09+0000", "request_id": "8ec85956-db55-54c7-825e-46d00b3fcef9", "updated_at": "2026-08-23T04:58:09+0000", "captured_amount": 0, "merchant_order_id": "cmt5c6ig8000r3rl5kxqsksro"}}, "name": "payment_intent.requires_payment_method", "version": "2026-02-27", "account_id": "acct_rVa5RClNPF2gR7YolQqcWg", "created_at": "2026-08-23T04:58:09+0000"}	\N	\N	2026-08-23 04:58:09.885	\N	\N	\N
cmt5dm9bg0008qzl5ottgrmx3	evt_hkpdnss2whllpe9edzf_e9e5ht	payment_intent.requires_payment_method	int_hkpdnss2whllpe9e5ht	acct_rVa5RClNPF2gR7YolQqcWg	2026-02-27	2026-08-23 05:38:22.252	PENDING	0	{"id": "evt_hkpdnss2whllpe9edzf_e9e5ht", "data": {"object": {"id": "int_hkpdnss2whllpe9e5ht", "amount": 17.83, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T05:38:20+0000", "request_id": "95c1d74f-558f-556d-b92f-6a840e97cac1", "updated_at": "2026-08-23T05:38:20+0000", "captured_amount": 0, "merchant_order_id": "cmt5dm6b30003qzl5s772st9d"}}, "name": "payment_intent.requires_payment_method", "version": "2026-02-27", "account_id": "acct_rVa5RClNPF2gR7YolQqcWg", "created_at": "2026-08-23T05:38:20+0000"}	\N	\N	2026-08-23 05:38:22.252	\N	\N	\N
cmt5dmjq30009qzl5q9dnt2hs	evt_hkpdttns9hllpehptbw_e9e5ht	payment_attempt.authorization_failed	int_hkpdnss2whllpe9e5ht	acct_rVa5RClNPF2gR7YolQqcWg	2026-02-27	2026-08-23 05:38:35.739	PENDING	0	{"id": "evt_hkpdttns9hllpehptbw_e9e5ht", "data": {"object": {"id": "att_hkpdttns9hllpeguubx_e9e5ht", "amount": 17.83, "status": "FAILED", "currency": "USD", "created_at": "2026-08-23T05:38:33+0000", "updated_at": "2026-08-23T05:38:34+0000", "failure_code": "authorization_failed", "payment_intent_id": "int_hkpdnss2whllpe9e5ht"}}, "name": "payment_attempt.authorization_failed", "version": "2026-02-27", "account_id": "acct_rVa5RClNPF2gR7YolQqcWg", "created_at": "2026-08-23T05:38:34+0000"}	\N	\N	2026-08-23 05:38:35.739	\N	\N	\N
cmt5mstr7000yqzl504rcthi3	evt_hkpdttns9hllwhc6uf7_hc646p	payment_intent.requires_payment_method	int_hkpdttns9hllwhc646p	acct_rVa5RClNPF2gR7YolQqcWg	2026-02-27	2026-08-23 09:55:25.219	PENDING	0	{"id": "evt_hkpdttns9hllwhc6uf7_hc646p", "data": {"object": {"id": "int_hkpdttns9hllwhc646p", "amount": 120.5, "status": "REQUIRES_PAYMENT_METHOD", "currency": "CNY", "created_at": "2026-08-23T09:55:24+0000", "request_id": "e83e3e3a-7961-51c0-8bc7-e539b83f933d", "updated_at": "2026-08-23T09:55:24+0000", "captured_amount": 0, "merchant_order_id": "cmt5mspz1000tqzl53jmn72yf"}}, "name": "payment_intent.requires_payment_method", "version": "2026-02-27", "account_id": "acct_rVa5RClNPF2gR7YolQqcWg", "created_at": "2026-08-23T09:55:24+0000"}	\N	\N	2026-08-23 09:55:25.219	\N	\N	\N
cmt5n8ocb0017qzl5plao1utn	evt_hkpdnss2whllwtkpye8_tkppwl	payment_intent.requires_payment_method	int_hkpdnss2whllwtkppwl	acct_rVa5RClNPF2gR7YolQqcWg	2026-02-27	2026-08-23 10:07:44.699	PENDING	0	{"id": "evt_hkpdnss2whllwtkpye8_tkppwl", "data": {"object": {"id": "int_hkpdnss2whllwtkppwl", "amount": 52.19, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T10:07:44+0000", "request_id": "73b966c9-9229-5c8c-b675-4c7d53c0f3f4", "updated_at": "2026-08-23T10:07:44+0000", "captured_amount": 0, "merchant_order_id": "cmt5n8ltf0013qzl5siv3ti2d"}}, "name": "payment_intent.requires_payment_method", "version": "2026-02-27", "account_id": "acct_rVa5RClNPF2gR7YolQqcWg", "created_at": "2026-08-23T10:07:44+0000"}	\N	\N	2026-08-23 10:07:44.699	\N	\N	\N
cmt5ncyr4001hqzl5upwq9xm1	evt_hkpdttns9hllwwvtm95_wvtc7z	payment_intent.requires_payment_method	int_hkpdttns9hllwwvtc7z	acct_rVa5RClNPF2gR7YolQqcWg	2026-02-27	2026-08-23 10:11:04.816	PENDING	0	{"id": "evt_hkpdttns9hllwwvtm95_wvtc7z", "data": {"object": {"id": "int_hkpdttns9hllwwvtc7z", "amount": 52.19, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T10:11:04+0000", "request_id": "c8bfbca7-ecb1-54f9-afe6-9edbd2514201", "updated_at": "2026-08-23T10:11:04+0000", "captured_amount": 0, "merchant_order_id": "cmt5ncwgh001dqzl53adgdfd0"}}, "name": "payment_intent.requires_payment_method", "version": "2026-02-27", "account_id": "acct_rVa5RClNPF2gR7YolQqcWg", "created_at": "2026-08-23T10:11:04+0000"}	\N	\N	2026-08-23 10:11:04.816	\N	\N	\N
cmt5netvn001rqzl58alcfkqa	evt_hkpdbctnmhllwybce44_ybc4uq	payment_intent.requires_payment_method	int_hkpdbctnmhllwybc4uq	acct_rVa5RClNPF2gR7YolQqcWg	2026-02-27	2026-08-23 10:12:31.811	PENDING	0	{"id": "evt_hkpdbctnmhllwybce44_ybc4uq", "data": {"object": {"id": "int_hkpdbctnmhllwybc4uq", "amount": 17.83, "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T10:12:30+0000", "request_id": "022093a7-da28-5064-9779-a78edc46e1ae", "updated_at": "2026-08-23T10:12:30+0000", "captured_amount": 0, "merchant_order_id": "cmt5nerv7001mqzl5un8m5o98"}}, "name": "payment_intent.requires_payment_method", "version": "2026-02-27", "account_id": "acct_rVa5RClNPF2gR7YolQqcWg", "created_at": "2026-08-23T10:12:30+0000"}	\N	\N	2026-08-23 10:12:31.811	\N	\N	\N
\.


--
-- TOC entry 3910 (class 0 OID 25103)
-- Dependencies: 240
-- Data for Name: Banner; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Banner" (id, type, title, subtitle, description, image, link, "position", status, "categoryId", metadata, "createdAt", "updatedAt") FROM stdin;
cmskk31ux000bagl50ddkliji	CATEGORY	\N	\N	Skin Care collection designed to keep your skin healthy, hydrated, and radiant.	https://i.ibb.co/pj1qT9ZW/8398f7d733e9.png	/categories/skin-care	0	ACTIVE	cmsbviuvp000be5l5qsuzeuup	{"label": "Skin Care", "heading": "FLASH SALE", "discount": "5%"}	2026-08-08 15:56:13.737	2026-08-08 15:56:43.695
cmskk8wij000cagl5a3gkxbfm	CATEGORY	\N	\N	Fashion collection featuring trendy clothing, footwear, bags, jewelry, and accessories for every style and occasion.	https://i.ibb.co/LDHQvP1F/940d2b98af1e.png	/categories/fashion	0	ACTIVE	cmsbvf6hm000ae5l5vatwbbw5	{"label": "Fashion", "heading": "MEGA SALE", "discount": "9%"}	2026-08-08 16:00:46.747	2026-08-08 16:00:46.747
cmskkfixw000dagl5ney0bjef	CATEGORY	\N	\N	Medical & Healthcare Products: Explore BangBuy’s collection of medical and healthcare products designed for everyday health monitoring, respiratory care, and personal care.	https://i.ibb.co/chmH3Zdt/1a8e59f3d9cc.png	/categories/medical-healthcare	0	ACTIVE	cmsbx02j6000je5l50vazxxb2	{"label": "Medical", "heading": "MEGA SALE", "discount": "7%"}	2026-08-08 16:05:55.749	2026-08-08 16:05:55.749
cmskivluv0006agl5qdqwl79r	CAROUSEL	10% OFF	Electronics	Electronics at BangBuy Discover a wide range of electronics for personal, professional, and business use	https://i.ibb.co/q3gRsTzw/0e03fc99a6e7.png	/categories/electronics-products	1	ACTIVE	\N	{"bgTo": "#1d4ed8", "badge": "New Stock", "bgVia": "#3B82F6", "bgFrom": "#6366F1", "bgType": "gradient"}	2026-08-08 15:22:26.791	2026-08-08 15:26:06.758
cmskjcnzd0007agl5rrdvr3ld	CAROUSEL	5% OFF	Skin Care	Skin Care collection designed to keep your skin healthy, hydrated, and radiant. Find face washes, serums, moisturizers, sunscreens, masks, and other daily essentials for different skin types and concerns.	https://i.ibb.co/gbh5MHnN/9d0d0df1df0a.png	/categories/skin-care	2	ACTIVE	\N	{"bgTo": "#F6B6CC", "badge": "Stock Limited", "bgVia": "#C7A4DD", "bgFrom": "#8B8CF6", "bgType": "gradient"}	2026-08-08 15:35:42.697	2026-08-08 15:35:42.697
cmskjheih0008agl54frfs890	CAROUSEL	9% OFF	Fashion	Fashion collection featuring trendy clothing, footwear, bags, jewelry, and accessories for every style and occasion.	https://i.ibb.co/2YNSd7jz/75ecf352bb09.png	/categories/fashion	3	ACTIVE	\N	{"bgTo": "#F4B7B2", "badge": "Black Friday", "bgVia": "#D8A4C8", "bgFrom": "#A78BFA", "bgType": "gradient"}	2026-08-08 15:39:23.705	2026-08-08 15:39:23.705
cmskjog2s0009agl5j8u9pyh3	CAROUSEL	7% OFF	Medical	Medical & Healthcare Products: Explore BangBuy’s collection of medical and healthcare products designed for everyday health monitoring.	https://i.ibb.co/jvdpbtkx/e2bb32e53130.png	/categories/medical-healthcare	4	ACTIVE	\N	{"bgTo": "#14B8A6", "badge": "New Stock", "bgVia": "#67E8F9", "bgFrom": "#93C5FD", "bgType": "gradient"}	2026-08-08 15:44:52.324	2026-08-08 15:44:52.324
cmskjxn4u000aagl57ipnkyxb	CATEGORY	\N	\N	Explore Electronics at BangBuy. Discover a wide range of electronics.	https://i.ibb.co/9m0kXYVB/1d82e3d4d08d.png	/categories/electronics-products	0	ACTIVE	cmsbujsks0007e5l5z1ewffub	{"label": "SALES", "heading": "Flash Sale", "discount": "10%"}	2026-08-08 15:52:01.374	2026-08-08 15:52:01.374
\.


--
-- TOC entry 3891 (class 0 OID 24782)
-- Dependencies: 221
-- Data for Name: Brand; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Brand" (id, name, slug, description, logo, website, status, "createdAt", "updatedAt", "seoTitle", "metaDescription", "ogImage") FROM stdin;
cmt1ba6j00007agl52vlv2ogc	Coolkim	coolkim	\N	\N	\N	ACTIVE	2026-08-20 09:21:54.828	2026-08-20 09:21:54.828	\N	\N	\N
\.


--
-- TOC entry 3896 (class 0 OID 24863)
-- Dependencies: 226
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CartItem" (id, "userId", "variantId", quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3917 (class 0 OID 49169)
-- Dependencies: 247
-- Data for Name: CatalogRedirect; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CatalogRedirect" (id, "sourcePath", "destinationPath", "entityType", "entityId", permanent, "createdAt", "updatedAt") FROM stdin;
cmso5n2kf001jagl5ghrr8r6f	/products/turbofan-small-ice-bucket	/products/m57-ice-bucket-portable-fan	PRODUCT	cmseu3qbo0017e5l5bwq7dfg8	t	2026-08-11 04:22:58.239	2026-08-11 04:22:58.239
cmt1br1il000jagl5l28d8cje	/products/coolkim-vibradorador-mujer-juguetes-eroticos-vibrador-mando-distancia-vibradorador-clitoris-consoladores-para-mujer-con-vibracion	/products/coolkim-vibradorador-mujer	PRODUCT	cmt1b7iu70000agl58hd3r9h4	t	2026-08-20 09:35:01.485	2026-08-20 09:35:35.588
cmt1brrw2000pagl5i99c62xm	/products/coolkim-vibradorador-mujer-juguetes-eroticos	/products/coolkim-vibradorador-mujer	PRODUCT	cmt1b7iu70000agl58hd3r9h4	t	2026-08-20 09:35:35.666	2026-08-20 09:35:35.666
\.


--
-- TOC entry 3890 (class 0 OID 24762)
-- Dependencies: 220
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Category" (id, name, slug, path, description, image, status, "position", depth, "parentId", "createdAt", "updatedAt", "seoTitle", "metaDescription", "ogImage") FROM stdin;
cmsbuu7ra0008e5l5i8jt4tve	Mini Fans	mini-fans	electronics-products/mini-fans	Mini Fans & Everyday Gadgets\n\nStay comfortable wherever you go with BangBuy’s collection of mini fans and useful everyday gadgets. Explore portable desk fans, handheld fans, wearable neck fans, USB humidifiers, rechargeable lamps, and other compact electronic products.\n\nChoose from convenient and energy-efficient products designed for your home, office, travel, study desk, and outdoor activities. Enjoy competitive prices, secure checkout, and convenient delivery across Bangladesh.	https://i.ibb.co/rRyBXSTh/0528248ed4aa.png	ACTIVE	0	1	cmsbujsks0007e5l5z1ewffub	2026-08-02 13:47:21.67	2026-08-10 11:45:50.96	Mini Fans & Cooling Gadgets in Bangladesh | BangBuy	Shop mini fans and cooling gadgets at BangBuy. Explore portable, handheld, neck and rechargeable fans at competitive prices with delivery across Bangladesh.	https://i.ibb.co/rRyBXSTh/0528248ed4aa.png
cmsbxhszr000ne5l5e78lppas	Men’s Hair Treatments	men-s-hair-treatments	skin-care/men-s-hair-treatments	Explore our Men’s Hair Treatments collection designed to nourish hair and support a healthier-looking scalp. Discover hair oils, serums, masks, leave-in treatments, and targeted care for dryness, damage, thinning, dandruff, frizz, and breakage. Find the right products to keep your hair strong, manageable, and well-groomed.	https://i.ibb.co/Z6gb41pn/7b6baa313c5e.png	ACTIVE	5	1	cmsbviuvp000be5l5qsuzeuup	2026-08-02 15:01:41.511	2026-08-02 15:03:01.227	Shop Men’s Hair Treatments | Strengthen & Nourish Hair | BangBuy	Discover men’s hair treatments for dryness, damage, thinning, dandruff, and scalp care. Shop hair oils, serums, masks, and strengthening products.	https://i.ibb.co/4ZzDPKDs/adcc56e02d85.png
cmsbvra73000ee5l513q8xzuy	Dermacare Serum & Essence	dermacare-serum-essence	skin-care/dermacare-serum-essence	Dermacare Serum & Essence\n\nUpgrade your skincare routine with Dermacare serums and essences formulated to hydrate, brighten and nourish your skin. Explore lightweight skincare solutions for dryness, dullness, uneven skin tone and fine lines.\n\nFind products suitable for different skin types at competitive prices. Enjoy secure checkout and convenient delivery across Bangladesh with BangBuy.	https://i.ibb.co/ksHHVTtD/cba0e646ef11.png	ACTIVE	8	1	cmsbviuvp000be5l5qsuzeuup	2026-08-02 14:13:04.479	2026-08-02 15:03:01.419	Dermacare Serum & Essence in Bangladesh | BangBuy	Shop Dermacare serums and essences at BangBuy. Discover hydrating, brightening and nourishing skincare products with delivery across Bangladesh.	https://i.ibb.co/ksHHVTtD/cba0e646ef11.png
cmsbv6e000009e5l5j2rdg7gx	Wireless Earbuds	wireless-earbuds	electronics-products/wireless-earbuds	Wireless Earbuds & Bluetooth Audio\n\nEnjoy music, calls, gaming, and entertainment without tangled wires. Explore BangBuy’s collection of wireless Bluetooth earbuds featuring clear audio, comfortable designs, portable charging cases, and reliable battery life.\n\nFind the right earbuds for everyday use, travel, workouts, online meetings, and gaming at competitive prices. Shop securely and enjoy convenient delivery across Bangladesh.	https://i.ibb.co/qFYLkR9y/cd247165cf17.png	ACTIVE	2	1	cmsbujsks0007e5l5z1ewffub	2026-08-02 13:56:49.632	2026-08-10 11:45:51.078	Wireless Earbuds in Bangladesh | BangBuy	Shop wireless earbuds at BangBuy. Explore stylish Bluetooth earbuds with clear sound, a comfortable fit, charging cases, and delivery across Bangladesh.	https://i.ibb.co/qFYLkR9y/cd247165cf17.png
cmsbvkhqt000ce5l5q9p16gm0	Bags	bag	fashion/bag	Explore our Bags collection featuring stylish and practical options for every occasion. Discover handbags, backpacks, shoulder bags, crossbody bags, travel bags, and more for work, study, shopping, and travel. Find the perfect bag to complement your style while keeping your essentials organized.	https://i.ibb.co/KjPW9G9n/53c7644f3cd0.png	ACTIVE	0	1	cmsbvf6hm000ae5l5vatwbbw5	2026-08-02 14:07:47.669	2026-08-02 14:10:35.851	Shop Bags Online | Stylish Handbags, Backpacks & More	Discover stylish handbags, backpacks, shoulder bags, travel bags, and more. Shop quality bags for work, travel, and everyday use at great prices.	https://i.ibb.co/KjPW9G9n/53c7644f3cd0.png
cmsbujsks0007e5l5z1ewffub	Electronics	electronics-products	electronics-products	Explore Electronics at BangBuy\n\nDiscover a wide range of electronics for personal, professional, and business use. Browse gadgets, electronic accessories, components, smart devices, and other essential products from trusted brands.\n\nCompare product specifications, prices, features, and availability to find the right solution for your needs. BangBuy offers a mobile-friendly shopping experience, secure checkout, and convenient delivery options across Bangladesh.	https://i.ibb.co/rRspK04f/7305b09f65b9.png	ACTIVE	0	0	\N	2026-08-02 13:39:15.436	2026-08-02 14:47:54.221	Electronics Products in Bangladesh | BangBuy	Shop electronics in Bangladesh at BangBuy. Explore quality gadgets, accessories, components and electronic products with competitive prices and secure checkout.	https://i.ibb.co/rRspK04f/7305b09f65b9.png
cmsbvf6hm000ae5l5vatwbbw5	Fashions	fashion	fashion	Discover our Fashion collection featuring trendy clothing, footwear, bags, jewelry, and accessories for every style and occasion. Whether you are refreshing your everyday wardrobe or searching for the perfect finishing touch, find fashionable, quality products at affordable prices. Shop the latest styles for men and women and enjoy a convenient online shopping experience.	https://i.ibb.co/6R9TkdgJ/d6c0b87deaed.png	ACTIVE	1	0	\N	2026-08-02 14:03:39.802	2026-08-02 14:47:54.294	Shop Fashion Online | Trendy Clothing & Accessories	Explore stylish clothing, footwear, bags, and accessories for men and women. Shop quality fashion products at affordable prices with convenient delivery.	https://i.ibb.co/6R9TkdgJ/d6c0b87deaed.png
cmsbxji5h000oe5l5sdyjoz5g	Deodorants	deodorants	skin-care/deodorants	Explore our Deodorants collection designed to provide dependable odor protection and keep you feeling fresh throughout the day. Discover deodorant sprays, roll-ons, sticks, creams, and antiperspirants in a variety of fragrances and formulas for men and women. Choose the right option for your lifestyle, skin type, and daily personal-care routine.	https://i.ibb.co/jPVzgfft/78b09e10f304.png	ACTIVE	4	1	cmsbviuvp000be5l5qsuzeuup	2026-08-02 15:03:00.773	2026-08-02 15:03:01.162	Shop Deodorants Online | Freshness & Odor Protection	Discover deodorants for reliable odor protection and lasting freshness. Shop sprays, roll-ons, sticks, creams, and antiperspirants for men and women.	https://i.ibb.co/vxMJb1xH/b6bf3a871a08.png
cmsbvns7g000de5l5xxrw4a1u	Facial Cleansers	facial-cleansers	skin-care/facial-cleansers	Explore our Facial Cleansers collection designed to gently remove dirt, excess oil, makeup, and daily impurities. Find face washes, cleansing gels, foaming cleansers, and other options for different skin types and concerns. Choose the right cleanser to keep your skin feeling fresh, clean, and ready for the next step in your skincare routine.	https://i.ibb.co/WWxMbRrC/1466f568acec.png	ACTIVE	9	1	cmsbviuvp000be5l5qsuzeuup	2026-08-02 14:10:21.196	2026-08-02 15:03:01.484	Shop Facial Cleansers Online | Face Wash & Cleansing Care	Discover facial cleansers and face washes for oily, dry, sensitive, and combination skin. Remove dirt, oil, and makeup for fresh, clean skin.	https://i.ibb.co/WWxMbRrC/1466f568acec.png
cmsbx22eq000ke5l5zun9r9g6	Nebulizers & Aspirators	nebulizers-aspirators	medical-healthcare/nebulizers-aspirators	Explore our Nebulizers & Aspirators collection for convenient respiratory care at home or while traveling. Discover compressor and portable nebulizers for administering prescribed aerosol medication, along with nasal aspirators designed to help gently remove mucus. Choose practical, easy-to-use devices suitable for adults and children, and always follow medical advice and product instructions.	https://i.ibb.co/B5ckJJhs/7cc9cf7d9bc0.png	ACTIVE	2	1	cmsbx02j6000je5l50vazxxb2	2026-08-02 14:49:27.218	2026-08-02 15:09:11.55	Shop Nebulizers & Aspirators | Home Respiratory Care | BangBuy	Discover nebulizers and aspirators for convenient home respiratory care. Shop reliable devices for aerosol therapy and gentle mucus removal.	https://i.ibb.co/B5ckJJhs/7cc9cf7d9bc0.png
cmsbviuvp000be5l5qsuzeuup	Skin Cares	skin-care	skin-care	Explore our Skin Care collection designed to keep your skin healthy, hydrated, and radiant. Find face washes, serums, moisturizers, sunscreens, masks, and other daily essentials for different skin types and concerns. Build the perfect routine with quality skin care products at affordable prices.	https://i.ibb.co/TV7Z8Wk/de57e0336ef4.png	ACTIVE	2	0	\N	2026-08-02 14:06:31.381	2026-08-02 14:47:54.367	Shop Skin Care Products Online | Healthy, Glowing Skin	Discover quality skin care products for cleansing, hydration, and daily protection. Shop serums, moisturizers, face washes, masks, and more.	https://i.ibb.co/TV7Z8Wk/de57e0336ef4.png
cmsbx02j6000je5l50vazxxb2	Medical & Healthcare	medical-healthcare	medical-healthcare	Medical & Healthcare Products\n\nExplore BangBuy’s collection of medical and healthcare products designed for everyday health monitoring, respiratory care, personal care, and home use. Browse nebulizers, nasal aspirators, thermometers, blood pressure monitors, first-aid supplies, and other healthcare essentials.\n\nCompare product features and specifications to choose the right equipment for your needs. Enjoy competitive prices, secure checkout, and convenient delivery across Bangladesh. Always use medical devices according to their instructions or a healthcare professional’s advice.	https://i.ibb.co/qGZbkbS/f53767e65081.png	ACTIVE	3	0	\N	2026-08-02 14:47:54.066	2026-08-02 14:47:54.44	Medical & Healthcare Products in Bangladesh | BangBuy	Shop medical and healthcare products at BangBuy. Explore nebulizers, aspirators, health monitors and essential care supplies with delivery across Bangladesh.	\N
cmsbxls65000pe5l5qug5rsua	Electric Massagers	electric-massagers	medical-healthcare/electric-massagers	Explore our Electric Massagers collection designed to soothe tired muscles, reduce everyday tension, and support relaxation at home. Discover handheld massagers, massage guns, and devices for the neck, back, shoulders, feet, and body. Choose from multiple speeds, massage modes, and portable designs to match your comfort and wellness routine.	https://i.ibb.co/Y7vmZhfm/0b661b8c1343.png	ACTIVE	0	1	cmsbx02j6000je5l50vazxxb2	2026-08-02 15:04:47.069	2026-08-02 15:09:11.43	Shop Electric Massagers | Relaxation & Muscle Relief | BangBuy	Discover electric massagers for soothing tired muscles and everyday relaxation. Shop handheld, neck, back, foot, and full-body massage devices.	https://i.ibb.co/Y7vmZhfm/0b661b8c1343.png
cmsbxrg27000qe5l5h5hg52wu	Teeth Care	teeth-care	medical-healthcare/teeth-care	Explore our Teeth Care collection designed to support your daily oral hygiene routine. Discover toothbrushes, toothpaste, dental floss, mouthwash, whitening products, and other essentials for cleaner teeth and fresher breath. Choose suitable products to help maintain healthy teeth and gums and keep your smile feeling fresh and confident.	https://i.ibb.co/Gfd2svvN/4cd67bd55b38.png	ACTIVE	1	1	cmsbx02j6000je5l50vazxxb2	2026-08-02 15:09:11.311	2026-08-02 15:09:11.49	Shop Teeth Care Products | Complete Oral Hygiene | BangBuy	Discover teeth care products for a cleaner, healthier smile. Shop toothbrushes, toothpaste, floss, whitening products, and other oral-care essentials.	https://i.ibb.co/Gfd2svvN/4cd67bd55b38.png
cmsbx4ci7000le5l5oe9dim0u	Dermacare Sunscreen	dermacare-sunscreen	skin-care/dermacare-sunscreen	Explore our Dermacare Sunscreen collection designed to protect your skin from harmful UVA and UVB rays. Discover lightweight, non-greasy formulas suitable for everyday use and different skin types. Choose the right sunscreen to help prevent sun damage while keeping your skin comfortable, moisturized, and protected throughout the day.	https://i.ibb.co/Q1ThS17/34afc47b4249.png	ACTIVE	0	1	cmsbviuvp000be5l5qsuzeuup	2026-08-02 14:51:13.615	2026-08-02 15:03:00.903	Shop Dermacare Sunscreen | Daily UVA & UVB Protection | BangBuy	Discover Dermacare sunscreens for reliable UVA and UVB protection. Shop lightweight, comfortable formulas suitable for daily use and various skin types.	https://i.ibb.co/Q1ThS17/34afc47b4249.png
cmsbwaevb000he5l532keu9u7	Face Skin Care Tools	face-skin-care-tools	skin-care/face-skin-care-tools	Explore our Face Skin Care Tools collection designed to support your daily skincare routine. Discover facial cleansing brushes, face rollers, gua sha tools, applicators, pore-care tools, and other beauty essentials. Choose practical tools to help cleanse, massage, exfoliate, and apply skincare products more effectively.	https://i.ibb.co/WNCQxvwd/ce96e76ee3f9.png	ACTIVE	1	1	cmsbviuvp000be5l5qsuzeuup	2026-08-02 14:27:57	2026-08-02 15:03:00.967	Shop Face Skin Care Tools | Cleansing & Beauty Tools	Discover face skin care tools for cleansing, exfoliating, massaging, and applying skincare. Shop facial brushes, rollers, gua sha tools, and more.	https://i.ibb.co/WNCQxvwd/ce96e76ee3f9.png
cmsn60rfg000fagl5852eo4hd	Mini Hair Straightener Comb Portable for Women	mini-hair-straightener-comb-portable-for-women	electronics-products/mini-hair-straightener-comb-portable-for-women	True Cord‑Free Styling: Built‑in large‑capacity battery with Type‑C charging interface, no power cord restriction. Style your hair freely at home, on travel or in office.\nDual‑layer Anti‑scald Safe Comb Teeth: Inner layer protects your scalp from high‑temperature scalding; outer anti‑tangle bristles glide through tangled hair smoothly without pulling.\nAnti‑Static Smooth Hair Effect: Hair‑friendly heating design reduces static and frizzy flyaways, get silky sleek shiny hair with just one stroke.\nUltra‑portable Hand‑held Size: Compact 20×4.5cm lightweight body, easy to slip into your purse or travel bag for quick hairstyle touch‑ups anywhere.\nSimple One‑button Operation: User‑friendly control for fast heating and easy operation. Comes in Pink and Lavender, ideal personal styling tool & nice gift choice.	https://i.ibb.co/Gf5P8KM1/e43c527e593c.png	ACTIVE	1	1	cmsbujsks0007e5l5z1ewffub	2026-08-10 11:45:50.812	2026-08-10 11:45:51.019	Mini Hair Straightener Comb	Product Description\nGet salon‑sleek, shiny hair anytime, anywhere with our Portable Cordless Hair Straightening Brush. This 2‑in‑1 styling comb combines smoothing straightening and detangling functions, letting you achieve silky smooth hair in one simple stroke. No cords, no hassle, perfect for home, travel, office and	https://i.ibb.co/Gf5P8KM1/e43c527e593c.png
cmsbw944g000ge5l547einnjc	Lip Balm & Lip Treatments	lip-balm-lip-treatments	skin-care/lip-balm-lip-treatments	Explore our Lip Balm & Treatment collection designed to moisturize, nourish, and protect dry or chapped lips. Discover hydrating lip balms, tinted balms, SPF lip care, lip masks, and intensive overnight treatments. Keep your lips feeling soft, smooth, comfortable, and healthy-looking throughout the day.	https://i.ibb.co/PZF3zkYt/fb12e1cfd1d1.png	ACTIVE	2	1	cmsbviuvp000be5l5qsuzeuup	2026-08-02 14:26:56.416	2026-08-02 15:03:01.031	Shop Lip Balm & Lip Treatments | Soft, Hydrated Lips	Discover nourishing lip balms and treatments for dry, chapped lips. Shop moisturizing, tinted, SPF, and overnight lip care for smooth, healthy-looking lips.	https://i.ibb.co/PZF3zkYt/fb12e1cfd1d1.png
cmsbw4abn000fe5l5462gao2h	Sunscreen & After-Sun	sunscreen-after-sun	skin-care/sunscreen-after-sun	Explore our Sunscreen & After-Sun collection designed to protect your skin from harmful UVA and UVB rays and provide soothing care after sun exposure. Discover lightweight sunscreens, sun creams, gels, sprays, and hydrating after-sun products for different skin types. Keep your skin protected, moisturized, and comfortable every day.	https://i.ibb.co/ds9p8x1G/8f5541f35fc1.png	ACTIVE	3	1	cmsbviuvp000be5l5qsuzeuup	2026-08-02 14:23:11.171	2026-08-02 15:03:01.097	Shop Sunscreen & After-Sun Care | Daily UV Protection	Discover sunscreens and after-sun products for daily UV protection, hydration, and soothing care. Find suitable options for different skin types.	https://i.ibb.co/ds9p8x1G/8f5541f35fc1.png
cmsbx9m0f000me5l5qkdabgen	Tinted Moisturizer	tinted-moisturizer	skin-care/tinted-moisturizer	Explore our Tinted Moisturizer collection for the perfect combination of skincare and lightweight makeup. Discover hydrating formulas that help even out skin tone, blur minor imperfections, and create a fresh, natural-looking finish. Choose from different shades and formulas, including SPF options, to match your skin type and daily beauty routine.	https://i.ibb.co/zVtMrgnm/9a872b60702a.png	ACTIVE	6	1	cmsbviuvp000be5l5qsuzeuup	2026-08-02 14:55:19.215	2026-08-02 15:03:01.291	Shop Tinted Moisturizer | Hydration & Natural Coverage | BangBuy	Discover tinted moisturizers that hydrate skin while providing lightweight, natural-looking coverage. Shop suitable formulas for different skin types and tones.	https://i.ibb.co/zVtMrgnm/9a872b60702a.png
cmsbwi4iw000ie5l530ku4mjg	Hair Treatments	hair-treatments	skin-care/hair-treatments	Explore our Hair Treatments collection designed to nourish, repair, and strengthen your hair. Discover deep-conditioning masks, hair oils, serums, leave-in treatments, scalp care, and solutions for dryness, damage, frizz, and breakage. Find the right treatment to keep your hair feeling soft, smooth, healthy-looking, and manageable.	https://i.ibb.co/KxHKhsBp/b8db0debca0e.png	ACTIVE	7	1	cmsbviuvp000be5l5qsuzeuup	2026-08-02 14:33:56.84	2026-08-02 15:03:01.355	Shop Hair Treatments Online | Repair & Nourish Hair	Discover hair treatments for dry, damaged, frizzy, and weak hair. Shop hair masks, oils, serums, scalp treatments, and nourishing repair care.	https://i.ibb.co/KxHKhsBp/b8db0debca0e.png
\.


--
-- TOC entry 3906 (class 0 OID 25037)
-- Dependencies: 236
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ContactMessage" (id, name, email, phone, subject, message, status, "createdAt", "updatedAt") FROM stdin;
cmt5hy180000eqzl52kb94tsa	Limon	kazilimon016@gmail.com	\N	Partnership / Sell on BangBuy	How to make sell. Give me details. I have product	NEW	2026-08-23 07:39:30.096	2026-08-23 07:39:30.096
\.


--
-- TOC entry 3921 (class 0 OID 409600)
-- Dependencies: 251
-- Data for Name: ExchangeRate; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ExchangeRate" (id, "baseCurrency", currency, rate, "fetchedAt", "createdAt", "updatedAt") FROM stdin;
cmt02pki70000y8c2cfqqqvyz	BDT	BDT	1.0000000000	2026-08-19 12:34:09.97	2026-08-19 12:34:10.063	2026-08-19 12:34:10.063
cmt02pkk50001y8c2kbdiv2jk	BDT	AUD	0.0115400000	2026-08-19 12:34:09.97	2026-08-19 12:34:10.133	2026-08-19 12:34:10.133
cmt02pkln0002y8c2ehyi8yze	BDT	EUR	0.0070710000	2026-08-19 12:34:09.97	2026-08-19 12:34:10.187	2026-08-19 12:34:10.187
cmt02pkn60003y8c22x7cavwz	BDT	GBP	0.0060480000	2026-08-19 12:34:09.97	2026-08-19 12:34:10.242	2026-08-19 12:34:10.242
cmt02pkop0004y8c2t3w16cqu	BDT	USD	0.0081840000	2026-08-19 12:34:09.97	2026-08-19 12:34:10.297	2026-08-19 12:34:10.297
cmt02pkq70005y8c2tyvz9vzs	BDT	CNY	0.0553000000	2026-08-19 12:34:09.97	2026-08-19 12:34:10.351	2026-08-19 12:34:10.351
\.


--
-- TOC entry 3909 (class 0 OID 25090)
-- Dependencies: 239
-- Data for Name: InventoryLog; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."InventoryLog" (id, "variantId", type, quantity, note, "createdAt") FROM stdin;
cmsetqdws000ze5l5l1n4tilb	cmsetqdag000se5l5p21d8df4	MANUAL_ADJUSTMENT	1	Initial product stock	2026-08-04 15:39:41.933
cmsets4bs0010e5l53fflch0c	cmsetqdag000se5l5p21d8df4	MANUAL_ADJUSTMENT	9	Stock changed from product editor	2026-08-04 15:41:02.824
cmsets4gi0011e5l59tlesnit	cmsetqdah000te5l5rtmw8gos	MANUAL_ADJUSTMENT	10	Stock changed from product editor	2026-08-04 15:41:02.994
cmsets4l70012e5l5i69thuxb	cmsetqdah000ue5l5suc6n40a	MANUAL_ADJUSTMENT	10	Stock changed from product editor	2026-08-04 15:41:03.163
cmsets4px0013e5l5mjmhoad6	cmsetqdah000ve5l5laa59u50	MANUAL_ADJUSTMENT	10	Stock changed from product editor	2026-08-04 15:41:03.333
cmsets4um0014e5l5pliwcemh	cmsetqdah000we5l5iln7b6nv	MANUAL_ADJUSTMENT	10	Stock changed from product editor	2026-08-04 15:41:03.502
cmseu3qwp001le5l53rxujwq7	cmseu3qdu0018e5l5yrbq3ijj	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 15:50:05.305
cmseu3qwp001me5l586wglpuw	cmseu3qdu0019e5l5e2ow6mf8	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 15:50:05.305
cmseud4tc0028e5l50xu9c3tl	cmseud4a1001ze5l5j2uofkam	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 15:57:23.232
cmseud4tc0029e5l5e9ajniu8	cmseud4a10020e5l5p0alr1id	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 15:57:23.232
cmseud4tc002ae5l5ea4jy5li	cmseud4a10021e5l5lbkiw3h7	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 15:57:23.232
cmseuisgo002oe5l5s33fn924	cmseuirwx002ce5l511o8dkd9	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:01:47.16
cmseuisgo002pe5l5t8mxjqbv	cmseuirwx002de5l52olpr63o	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:01:47.16
cmseuisgo002qe5l5lcpxm0yi	cmseuirwx002ee5l5k164x5pr	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:01:47.16
cmseupy6r0030e5l5166263gq	cmseupxq8002se5l5xfxh1usj	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:07:21.171
cmseupy6r0031e5l51d0egnxf	cmseupxq8002te5l5i4b2g683	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:07:21.171
cmseupy6r0032e5l5vfs8ataf	cmseupxq8002ue5l5561st3nm	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:07:21.171
cmseuv7ux003de5l5s5a7z0mf	cmseuv7fx0034e5l5mo35z3s0	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:11:26.985
cmseuv7ux003ee5l5de1dr50g	cmseuv7fy0035e5l5zcq5nwg8	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:11:26.985
cmseuv7ux003fe5l50e2xqm47	cmseuv7fy0036e5l5j8d5vc1w	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:11:26.985
cmsev2w5w003re5l55naahphe	cmsev2voi003he5l554jlhqkg	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:17:25.076
cmsev2w5w003se5l50kqagesl	cmsev2voi003ie5l58otjj9it	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:17:25.076
cmsevbhgv0043e5l56qofpfj7	cmsevbh0f003ue5l5soohhbvk	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:24:05.935
cmsevi11m0058e5l5h3pfvc6r	cmsevi0jw004xe5l53t25m70r	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:29:11.242
cmsevlrgm005se5l5hy77v4zt	cmsevlqxd005ke5l5atwxz8s7	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:32:05.446
cmsevs8jp006ce5l5anms1rx2	cmsevs83a0061e5l5rucuxq97	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:37:07.525
cmsevs8jp006de5l5qjn6wcsn	cmsevs83a0062e5l57okwbvqw	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:37:07.525
cmsevs8jp006ee5l5ka2vt9p8	cmsevs83a0063e5l5dsu7y8zq	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:37:07.525
cmsevs8jp006fe5l5avykhp2q	cmsevs83a0065e5l5ycjoidb2	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-04 16:37:07.525
cmsezghg60002rgc2ibe11qd4	cmsevs83a0061e5l5rucuxq97	ORDER_PLACED	-1	Order ORD-260804-23920223	2026-08-04 18:19:57.655
cmsezizty0000bgc2ihl57tg3	cmsevi0jw004xe5l53t25m70r	ORDER_PLACED	-1	Order ORD-260804-9E1F8F22	2026-08-04 18:21:54.79
cmsezjfhx0005bgc2ecv6l2li	cmsevi0jw004xe5l53t25m70r	ORDER_PLACED	-1	Order ORD-260804-1CA1517E	2026-08-04 18:22:15.093
cmsfno3700000v8c2wryxtcoi	cmsevlqxd005ke5l5atwxz8s7	ORDER_PLACED	-1	Order ORD-260805-E2F15BF8	2026-08-05 05:37:43.212
cmsfnq1sy0005v8c273mgdnsu	cmsevlqxd005ke5l5atwxz8s7	ORDER_PLACED	-1	Order ORD-260805-AD92ED3F	2026-08-05 05:39:14.722
cmsfnxqw8000070c2ceqqy2fo	cmsevlqxd005ke5l5atwxz8s7	ORDER_PLACED	-1	Order ORD-260805-30633AAD	2026-08-05 05:45:13.832
cmsfo4d1e000010c2qranzyqd	cmsevlqxd005ke5l5atwxz8s7	ORDER_PLACED	-1	Order ORD-260805-55089BCE	2026-08-05 05:50:22.466
cmsfr5la2000004i59x36p4eu	cmsevlqxd005ke5l5atwxz8s7	ORDER_PLACED	-1	Order ORD-260805-D24C2180	2026-08-05 07:15:18.65
cmsfr6vb9000004lepdin9bjk	cmsevlqxd005ke5l5atwxz8s7	ORDER_PLACED	-1	Order ORD-260805-FB3520F4	2026-08-05 07:16:18.309
cmsfsy2co000004joioe0xhyb	cmsevlqxd005ke5l5atwxz8s7	ORDER_PLACED	-1	Order ORD-260805-6F65DE50	2026-08-05 08:05:26.76
cmsfszlf1000004jxiw0fhvwz	cmsevi0jw004xe5l53t25m70r	ORDER_PLACED	-1	Order ORD-260805-694D4965	2026-08-05 08:06:38.125
cmsft8v8a000004jxp2wqs693	cmsevs83a0061e5l5rucuxq97	ORDER_PLACED	-1	Order ORD-260805-D524518A	2026-08-05 08:13:50.746
cmsgb4qx4000004jqhujrlha9	cmsevlqxd005ke5l5atwxz8s7	ORDER_PLACED	-1	Order ORD-260805-FB70C7A1	2026-08-05 16:34:31.624
cmsgbi4g3000004icmeelinmp	cmsevlqxd005ke5l5atwxz8s7	ORDER_PLACED	-1	Order ORD-260805-CAFE08E7	2026-08-05 16:44:55.683
cmsgbty97000804icjm7ut9c8	cmsevlqxd005ke5l5atwxz8s7	ORDER_PLACED	-1	Order ORD-260805-C604FF0E	2026-08-05 16:54:07.531
cmsgcp746000004jse2a5wih4	cmsevi0jw004xe5l53t25m70r	ORDER_PLACED	-1	Order ORD-260805-01020824	2026-08-05 17:18:25.351
cmsn6f2sk000pagl5mb6rgdfs	cmsn6f29f000hagl5i0hdbyme	MANUAL_ADJUSTMENT	50	Initial product stock	2026-08-10 11:56:58.724
cmso4w7le0014agl5cfkfop5v	cmsetqdah000we5l5iln7b6nv	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 04:02:05.042
cmso4w7pr0015agl5gz2pk9l3	cmsetqdah000te5l5rtmw8gos	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 04:02:05.199
cmso4w7tw0016agl588mncial	cmsetqdah000ue5l5suc6n40a	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 04:02:05.348
cmso4w7y90017agl59jvk9q1j	cmsetqdah000ve5l5laa59u50	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 04:02:05.505
cmso4w82e0018agl5doc0a7qu	cmsetqdag000se5l5p21d8df4	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 04:02:05.654
cmso5n2vk001kagl53ysp4aaz	cmseu3qdu0018e5l5yrbq3ijj	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 04:22:58.64
cmso5n318001lagl5vw3vif3v	cmseu3qdu0019e5l5e2ow6mf8	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 04:22:58.844
cmsobkss80027agl55evgwdgv	cmseud4a1001ze5l5j2uofkam	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:09:09.944
cmsobkswo0028agl5p04q87hx	cmseud4a10021e5l5lbkiw3h7	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:09:10.104
cmsobkt0q0029agl5uhha5nlj	cmseud4a10020e5l5p0alr1id	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:09:10.25
cmsobv9fu002kagl5kllxr8p8	cmseuirwx002de5l52olpr63o	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:17:18.09
cmsobv9k7002lagl5syhiyp4x	cmseuirwx002ce5l511o8dkd9	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:17:18.247
cmsoc6tks002vagl5flq0l2n8	cmseupxq8002se5l5xfxh1usj	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:26:17.404
cmsoc6tp9002wagl5i4uq3ivm	cmseupxq8002ue5l5561st3nm	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:26:17.565
cmsoc6tte002xagl51vzf3c04	cmseupxq8002te5l5i4b2g683	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:26:17.714
cmsoc6txp002zagl5kajgdpu2	cmsoc6tvk002yagl5kbunlqa8	MANUAL_ADJUSTMENT	100	Initial variant stock	2026-08-11 07:26:17.87
cmsochkrs004zagl57opnpex9	cmseuv7fy0035e5l5zcq5nwg8	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:34:39.208
cmsochkw80050agl5qjo9es96	cmseuv7fy0036e5l5j8d5vc1w	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:34:39.368
cmsochl0n0051agl5jis53lml	cmseuv7fx0034e5l5mo35z3s0	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:34:39.527
cmsoclt4v005fagl5ust35fid	cmsev2voi003he5l554jlhqkg	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:37:56.671
cmsoclt8x005gagl5gjgfxwha	cmsev2voi003ie5l58otjj9it	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:37:56.817
cmsocuvnh0066agl52wlchwlt	cmsevi0jw004xe5l53t25m70r	MANUAL_ADJUSTMENT	94	Stock changed from product editor	2026-08-11 07:44:59.837
cmsocwaxo006hagl5y2o72c9j	cmsevlqxd005ke5l5atwxz8s7	MANUAL_ADJUSTMENT	100	Stock changed from product editor	2026-08-11 07:46:06.3
cmsocxjvp006pagl5r2ev6l79	cmsevlqxd005ke5l5atwxz8s7	MANUAL_ADJUSTMENT	-100	Stock changed from product editor	2026-08-11 07:47:04.549
cmsod4vle006xagl5yfvehzz8	cmsevs83a0061e5l5rucuxq97	MANUAL_ADJUSTMENT	92	Stock changed from product editor	2026-08-11 07:52:46.322
cmsod4vpd006yagl5bbronte1	cmsevs83a0064e5l5scnb0csv	MANUAL_ADJUSTMENT	100	Stock changed from product editor	2026-08-11 07:52:46.465
cmsod4vt0006zagl56pfybg8v	cmsevs83a0065e5l5ycjoidb2	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:52:46.596
cmsod4vwn0070agl55py9dmlh	cmsevs83a0062e5l57okwbvqw	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:52:46.728
cmsod4w0b0071agl5ihjczdr6	cmsevs83a0063e5l5dsu7y8zq	MANUAL_ADJUSTMENT	90	Stock changed from product editor	2026-08-11 07:52:46.859
cmsoefllx0086agl5lgr93zu6	cmsoefl2u007vagl5bo25reoy	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 08:29:06.213
cmsoehn1d008jagl5pt50ft70	cmsoehmkq0088agl58rdgwet9	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 08:30:41.377
cmsoengba008tagl5vsguoyac	cmsoenfvk008lagl5v5z2dtaf	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 08:35:12.598
cmsoenx660095agl5j0rj8fhb	cmsoenwq2008vagl5qwfn96jn	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 08:35:34.446
cmsoep7ni0099agl5o9ycdg77	cmsoep75q0097agl53nj5ki6l	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 08:36:34.686
cmsoevheo009kagl5z5q6mbxm	cmsoevgy4009bagl56s3mrsac	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 08:41:27.264
cmsoexo45009tagl5blrzqmdm	cmsoexnnf009magl5xp7aank5	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 08:43:09.269
cmsof2tcb00a2agl5ld1fmx9t	cmsof2ss1009vagl58sv4d1zb	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 08:47:09.323
cmsof425r00a5agl5f2zbas7b	cmsof41s600a4agl5ae9xsrha	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 08:48:07.407
cmsof4e2500aaagl5c3if8yo2	cmsof4dk600a7agl5vsa7jc74	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 08:48:22.829
cmsof4e2500abagl50a68o0o6	cmsof4dk600a8agl534nx8hsf	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 08:48:22.829
cmsof86ey00apagl5ccoiu052	cmsof85xx00aeagl5m1cfn6hu	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 08:51:19.546
cmsoffmt400bjagl5ublpifrx	cmsoffmbz00b5agl5usdbsh5q	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 08:57:07.384
cmsofgcgq00bxagl58ack50mb	cmsofgc0y00blagl5hrj9gyaf	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 08:57:40.634
cmsofmuyi00caagl5b9ngmozc	cmsofmuii00bzagl5vd06xzpq	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 09:02:44.538
cmsofmuyi00cbagl55eitfkev	cmsofmuii00c0agl52f57ylb8	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 09:02:44.538
cmsof99tj00aragl504fhe06h	cmsof99rj00aqagl5mqsy8dk0	MANUAL_ADJUSTMENT	999	Initial variant stock	2026-08-11 08:52:10.615
cmsof99xk00atagl5wgjxbu9o	cmsof99vk00asagl5ta40u3n7	MANUAL_ADJUSTMENT	999	Initial variant stock	2026-08-11 08:52:10.76
cmsofnrf100clagl5hxngo1v2	cmsofnqy800cdagl5g7c9s5p6	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 09:03:26.605
cmsofqgl900d2agl5f2thnqpy	cmsofqg5m00cnagl50e243eef	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:05:32.542
cmsofqgla00d3agl5klfhucoi	cmsofqg5m00coagl5argv7g29	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:05:32.542
cmsofzu7100dragl59udxiwvn	cmsofztpa00deagl5x0eh3s2s	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 09:12:50.077
cmsofzu7100dsagl5pk06okup	cmsofztpa00dfagl5g2shaju9	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 09:12:50.077
cmsog06jw00e5agl5qly0kb7y	cmsog05ve00duagl5dx16kmzq	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:13:06.092
cmsog769400egagl5ue0nivxz	cmsog75rf00e7agl57knhtnx8	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:18:32.296
cmsogf1ej00eragl5q8qlfodf	cmsogf0y500eiagl5yzlqderk	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 09:24:39.259
cmsogf1ej00esagl5k37xa6aw	cmsogf0y500ejagl5zswh4ox5	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 09:24:39.259
cmsogi7d000fmagl5qlq9ij19	cmsogi6ua00fdagl5ou9kpwsd	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:27:06.948
cmsogk5nk00g0agl5zn4iiq0a	cmsogk57e00fpagl5a8l4iri6	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 09:28:38.048
cmsogruap00gwagl5n51g7gxx	cmsogrtsy00gmagl56rgvpwkc	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 09:34:36.577
cmsogtmv800hkagl5c6u2bioj	cmsogtmek00gyagl5k03ev9cu	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:36:00.26
cmsogtmv800hlagl5mnphn29z	cmsogtmek00gzagl5059jva51	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:36:00.26
cmsogtmv800hmagl5ifspqc41	cmsogtmek00h0agl5y9arymc6	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:36:00.26
cmsogtmv800hnagl523ifwpob	cmsogtmek00h1agl5laz1fad4	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:36:00.26
cmsogwtod00hragl5upr1g7pd	cmsogwt8800hpagl59bxdmmq6	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 09:38:29.053
cmsogytjn00i2agl5wic5tt46	cmsogyszp00htagl57vnqbb1m	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 09:40:02.195
cmsogytjn00i3agl5khg5o0kj	cmsogyszq00huagl576tkr5t1	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 09:40:02.195
cmsoh1a4b00idagl5bzbwhc9p	cmsoh19md00i5agl5gwlhdkxd	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:41:56.987
cmsoh3ozq00izagl5n5gnh8fm	cmsoh3ogt00ipagl5ohd28s4c	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 09:43:49.574
cmsoh84gw00jaagl58jkhrbu8	cmsoh840o00j1agl52itjgjme	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 09:47:16.256
cmsoh8ytd00jbagl5jvszuvfa	cmsoh39ey00ifagl5mj2b8kin	MANUAL_ADJUSTMENT	1000	Stock changed from product editor	2026-08-11 09:47:55.585
cmsoh92ks00jyagl51r66iwez	cmsoh922300jlagl58kmppq4k	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:48:00.46
cmsoh92ks00jzagl52po3ankk	cmsoh922300jmagl5tr613bbu	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:48:00.46
cmsoh92ks00k0agl5qvw6tfwt	cmsoh922300jnagl5zfyrkaee	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:48:00.46
cmsohctw500kkagl5pmnk1cvi	cmsohctfi00k9agl5b5pug4ok	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 09:50:55.829
cmsohj87n00kwagl5bnvvbpm7	cmsohj7r700kmagl5uc47pi1x	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:55:54.323
cmsohnmu800ljagl5yrsxccpv	cmsohnmar00l9agl5x9i8ghv7	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 09:59:19.904
cmsohsh5s00m5agl5yayms06s	cmsohsgox00llagl55jfrj66k	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 10:03:05.824
cmsohsh5s00m6agl56zovmn9e	cmsohsgox00lmagl5u294vsem	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 10:03:05.824
cmsohsh5s00m7agl5gn4ah5jb	cmsohsgox00lnagl5qg3j4qfi	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 10:03:05.824
cmsohsh5s00m8agl5gyxh71p0	cmsohsgox00loagl5q3838zlp	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 10:03:05.824
cmsohsh5s00m9agl52s5inh7j	cmsohsgox00lpagl5121xiw9r	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 10:03:05.824
cmsohsh5s00maagl5wcnwwray	cmsohsgox00lqagl5j6mm6vym	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 10:03:05.824
cmsoi3g7u00mqagl5ulf5b569	cmsoi2tp800mcagl5ar2dxfk2	MANUAL_ADJUSTMENT	999	Stock changed from product editor	2026-08-11 10:11:37.818
cmsoi3geg00mragl579iu7qtk	cmsoi2tp800meagl5dq8b4x9u	MANUAL_ADJUSTMENT	999	Stock changed from product editor	2026-08-11 10:11:38.056
cmsoi5eeb00n3agl5h6tuk3qq	cmsoi2tp800mdagl5qgqvlurt	MANUAL_ADJUSTMENT	999	Stock changed from product editor	2026-08-11 10:13:08.771
cmsoi80qv00npagl5qv5xi9rp	cmsoi809h00ngagl5qi7e7tir	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 10:15:11.047
cmsoijnre00odagl5rx55u76w	cmsoijnb100o4agl5b9sabmgx	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 10:24:14.09
cmsoim65v00oyagl5bje2rgdw	cmsoim5hg00ofagl5ezbsbasb	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 10:26:11.251
cmsoim65v00ozagl5lwu6adhy	cmsoim5hg00ogagl5isng15i5	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 10:26:11.251
cmsoim65v00p0agl5bipgv94k	cmsoim5hg00ohagl55lli7ur8	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 10:26:11.251
cmsoim65v00p1agl5gx6s1jjx	cmsoim5hg00oiagl5h0iou2zf	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 10:26:11.251
cmsoio9oy00p2agl5kakzjg9m	cmsoiioj300o1agl54miy2upp	MANUAL_ADJUSTMENT	999	Stock changed from product editor	2026-08-11 10:27:49.138
cmsoj1hiq00piagl50d7yalnt	cmsoj1h1e00pdagl5wp4gcs4v	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 10:38:05.81
cmsoj1hiq00pjagl5zfc9pjzo	cmsoj1h1e00peagl5jho8f3hp	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 10:38:05.81
cmsoj1hiq00pkagl5hs8xfris	cmsoj1h1e00pfagl5gtt0xh2m	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 10:38:05.81
cmsoj1hiq00plagl5f02mtmxv	cmsoj1h1e00pgagl5lkpsnfcs	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 10:38:05.81
cmsoj1hiq00pmagl5u0hxpylk	cmsoj1h1e00phagl5py8y4t6p	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-11 10:38:05.81
cmsoj3jm600puagl5oydc3ou5	cmsoj3j3200poagl5k0d5us2r	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-11 10:39:41.838
cmsoj4fpd00q5agl5ky7rsjr8	cmsoj4f6900pwagl5evcxdb59	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-11 10:40:23.425
cmsoj7fsc00q6agl5jpqx6ogv	cmsoiioj300o1agl54miy2upp	MANUAL_ADJUSTMENT	1	Stock changed from product editor	2026-08-11 10:42:43.5
cmsok189400r7agl5onjiboqg	cmsok17u000qqagl5ogb90b8u	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:05:53.416
cmsok189400r8agl51v6p8k2x	cmsok17u000qragl5x725wki2	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:05:53.416
cmsok189400r9agl5mxbxtkpy	cmsok17u000qsagl5wq7xm98x	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:05:53.416
cmsok189400raagl5qk1b4zby	cmsok17u000qtagl5oyhb21v9	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:05:53.416
cmsok189400rbagl5tvrxk6j2	cmsok17u000quagl53i3cp7wx	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:05:53.416
cmsok189400rcagl5wrwaj1e0	cmsok17u000qvagl5wao5kzyr	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:05:53.416
cmsok189400rdagl5aldz4xww	cmsok17u000qwagl5bwpr6hpg	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:05:53.416
cmsok189400reagl5oku7d3wo	cmsok17u000qxagl5fvueh4ex	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:05:53.416
cmsok189400rfagl56mfholvn	cmsok17u000qyagl55zbgdwwk	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:05:53.416
cmsok189400rgagl5c7fg57mb	cmsok17u000qzagl5sqe2f33a	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:05:53.416
cmsokc8qq00roagl5r8nhhoqw	cmsokc88e00riagl5alu07hu8	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:14:27.266
cmsokc8qq00rpagl5041l4m82	cmsokc88e00rjagl5a04i7ac5	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:14:27.266
cmsokc8qq00rqagl5yghn1pg3	cmsokc88e00rkagl5hrt14by8	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:14:27.266
cmsokc8qq00rragl5awiecg1r	cmsokc88e00rmagl58guzhnf6	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:14:27.266
cmsokc8qq00rsagl53kjeh0tf	cmsokc88e00rnagl5hsyzi3jv	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:14:27.266
cmsokzfwr00s9agl59md413qm	cmsokzffe00rzagl5tbjdc99r	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:32:29.643
cmsokzfwr00saagl58t0xv1vj	cmsokzffe00s0agl55wvjw61h	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:32:29.643
cmsokzfws00sbagl56u4fbo8s	cmsokzffe00s1agl5xk2uxy4d	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:32:29.643
cmsokzfws00scagl552hfztt9	cmsokzffe00s2agl5gxvf6ffj	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:32:29.643
cmsokzfws00sdagl5b9pnk227	cmsokzffe00s3agl5od8rin4r	MANUAL_ADJUSTMENT	99	Initial product stock	2026-08-11 11:32:29.643
cmssqwchm005nkjl52k4xtuaq	cmssqwbve005ikjl5nxcnxpiz	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-14 09:29:07.642
cmssrgfh4005zkjl50vlemqnd	cmssrgeuo005pkjl50kcuyyzl	MANUAL_ADJUSTMENT	10	Initial product stock	2026-08-14 09:44:44.632
cmssrsebq006ekjl5y0a0bt2j	cmssrsdtx0061kjl5wktviz8u	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-14 09:54:03.014
cmssrsebq006fkjl528t5d5wt	cmssrsdtx0062kjl5r4bd3yrq	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-14 09:54:03.014
cmssrsebq006gkjl54a0s98dt	cmssrsdtx0063kjl5155d1jb9	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-14 09:54:03.014
cmssrx14l006hkjl5fz84wa7a	cmssrgeuo005pkjl50kcuyyzl	MANUAL_ADJUSTMENT	-10	Stock changed from product editor	2026-08-14 09:57:39.189
cmssrx190006jkjl5msz6brle	cmssrx16v006ikjl5rc6oen68	MANUAL_ADJUSTMENT	999	Initial variant stock	2026-08-14 09:57:39.349
cmssrx1dc006lkjl5ie3swhmr	cmssrx1b7006kkjl5i0ncewwx	MANUAL_ADJUSTMENT	999	Initial variant stock	2026-08-14 09:57:39.504
cmssrx1ho006nkjl57k2mrx6s	cmssrx1fi006mkjl5oi770ct4	MANUAL_ADJUSTMENT	999	Initial variant stock	2026-08-14 09:57:39.66
cmsssa7ve007ikjl5d47hhke4	cmsss0abx0078kjl5ljr1udw6	MANUAL_ADJUSTMENT	1000	Stock changed from product editor	2026-08-14 10:07:54.458
cmsssa7zp007kkjl5oeau51kh	cmsssa7xj007jkjl5l95ibvtz	MANUAL_ADJUSTMENT	998	Initial variant stock	2026-08-14 10:07:54.613
cmsssa83x007mkjl5mkhv4yhk	cmsssa81t007lkjl5a7aevl82	MANUAL_ADJUSTMENT	1000	Initial variant stock	2026-08-14 10:07:54.765
cmsssa884007okjl514kghb4i	cmsssa861007nkjl5iuxuani4	MANUAL_ADJUSTMENT	1000	Initial variant stock	2026-08-14 10:07:54.916
cmsssbeic007wkjl5ou0x3xm4	cmsss8zrw007akjl5tzi4o581	MANUAL_ADJUSTMENT	100	Stock changed from product editor	2026-08-14 10:08:49.716
cmsssccom008gkjl5tefwlfh1	cmssscc0d0085kjl5m1e8s3k9	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-14 10:09:34.006
cmsssccom008hkjl5uamwzkse	cmssscc0d0086kjl5seims6b2	MANUAL_ADJUSTMENT	999	Initial product stock	2026-08-14 10:09:34.006
cmsssqt87008skjl5ec0ss04l	cmsssqsr0008nkjl5u7s73nxi	MANUAL_ADJUSTMENT	1000	Initial product stock	2026-08-14 10:20:48.631
cmssty1og0092kjl5t0olfhwk	cmssty18z0091kjl5fquqhb1g	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-14 10:54:25.792
cmsswqkpi000doll52qfvcxyp	cmsswqk400001oll5l1uaoxnm	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-14 12:12:36.054
cmsswqkpi000eoll5y5v8xvuc	cmsswqk400002oll52esm1uh6	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-14 12:12:36.054
cmsswqkpi000foll58tnm5bqr	cmsswqk400003oll541s3u9qx	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-14 12:12:36.054
cmsswqkpi000goll5a27tr6ue	cmsswqk400004oll5uoj7arkt	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-14 12:12:36.054
cmsswqkpi000holl5idi6xvcc	cmsswqk400005oll5wnpgnm0w	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-14 12:12:36.054
cmsswqkpi000ioll53hie1wwr	cmsswqk400006oll52nnbbgq1	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-14 12:12:36.054
cmssxb6le000uoll5dtgmth9w	cmssxb61u000koll5pps76d9w	MANUAL_ADJUSTMENT	100	Initial product stock	2026-08-14 12:28:37.538
cmsu47g9j001eoll52gk6e1q0	cmsu47g7o001doll5o7bap30u	MANUAL_ADJUSTMENT	100	Initial variant stock	2026-08-15 08:29:26.935
cmsu47gd8001goll5lxdqpz3x	cmsu47gbj001foll57t68m2nf	MANUAL_ADJUSTMENT	100	Initial variant stock	2026-08-15 08:29:27.068
cmsu47ggl001ioll5jxq56ila	cmsu47gex001holl5fqfveylj	MANUAL_ADJUSTMENT	100	Initial variant stock	2026-08-15 08:29:27.189
cmsu47gjx001koll5ig2h0n1x	cmsu47gi9001joll5rf1kt6j1	MANUAL_ADJUSTMENT	100	Initial variant stock	2026-08-15 08:29:27.309
cmsu47gna001moll5c0nnab0y	cmsu47glm001loll5zlkrx0jx	MANUAL_ADJUSTMENT	100	Initial variant stock	2026-08-15 08:29:27.43
cmsu47gqm001ooll5skyuuovt	cmsu47goy001noll5wlegcark	MANUAL_ADJUSTMENT	100	Initial variant stock	2026-08-15 08:29:27.55
cmsu47gtz001qoll5x3ztptg5	cmsu47gsa001poll5go1c2nne	MANUAL_ADJUSTMENT	100	Initial variant stock	2026-08-15 08:29:27.671
cmt1bbtzm000dagl5uhh77mde	cmt1b7iwr0001agl5a75klanc	MANUAL_ADJUSTMENT	1000	Stock changed from product editor	2026-08-20 09:23:11.89
cmt4ewff90004soc2vxuk3i8j	cmsetqdah000ue5l5suc6n40a	ORDER_PLACED	-1	Order ORD-260822-A3C0C693	2026-08-22 13:26:30.165
cmt4exbvm000bsoc2ktq7l2sa	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260822-55BDD243	2026-08-22 13:27:12.226
cmt4j0rx60002rgc2m23eb173	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260822-C7AE60CE	2026-08-22 15:21:51.45
cmt4j153t0007rgc2xfwhztp2	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260822-DFF4BF39	2026-08-22 15:22:08.537
cmt4jm4nl0000zsc2772tpyf7	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260822-7EF60D75	2026-08-22 15:38:27.729
cmt4u76n30002q1l5ki3uxtly	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260822-48E1006B	2026-08-22 20:34:46.239
cmt4uncq50007q1l5s3k7naru	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260822-65AE95BF	2026-08-22 20:47:20.621
cmt4vc6ug0006w3l5gpnz8959	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260822-834DFB8B	2026-08-22 21:06:39.4
cmt59bbq2000fw3l59gund6y9	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-F2FE372B	2026-08-23 03:37:53.69
cmt59c78x000kw3l5708bfe2g	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-1A4E7ADB	2026-08-23 03:38:34.545
cmt5add69000rw3l5logweh5a	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-25AF558A	2026-08-23 04:07:28.497
cmt5bad7t00021yl5q3hrkw18	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-FBCF39C9	2026-08-23 04:33:08.201
cmt5balfh00061yl54q3k13z3	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-134C73CC	2026-08-23 04:33:18.846
cmt5bgnmq00023rl5bzgx0gj9	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-48FC22FB	2026-08-23 04:38:01.634
cmt5bhbf8000b3rl5y6195g2n	cmsn6f29f000hagl5i0hdbyme	ORDER_CANCELLED	1	Order ORD-260823-FBCF39C9 cancelled	2026-08-23 04:38:32.468
cmt5c2u1q000h3rl51up5ha0k	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-8132F020	2026-08-23 04:55:16.382
cmt5c6iee000q3rl5fiqw4sgk	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-0ED52DFD	2026-08-23 04:58:07.91
cmt5dm68j0002qzl5j0r22afa	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-0E630695	2026-08-23 05:38:18.259
cmt5mky8b000mqzl5zzwukilx	cmsevi0jw004xe5l53t25m70r	ORDER_PLACED	-1	Order ORD-260823-7A391570	2026-08-23 09:49:17.771
cmt5mspx7000sqzl5u00hq6pn	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-24370673	2026-08-23 09:55:20.251
cmt5n8lr40012qzl51e91wyww	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-3	Order ORD-260823-EBDDA6AE	2026-08-23 10:07:41.344
cmt5ncweq001cqzl58e9p1tht	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-3	Order ORD-260823-F166EC31	2026-08-23 10:11:01.778
cmt5nersw001lqzl5y82r4q7u	cmsn6f29f000hagl5i0hdbyme	ORDER_PLACED	-1	Order ORD-260823-88A796A7	2026-08-23 10:12:29.12
\.


--
-- TOC entry 3892 (class 0 OID 24797)
-- Dependencies: 222
-- Data for Name: Manufacturer; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Manufacturer" (id, name, slug, description, logo, website, country, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3898 (class 0 OID 24890)
-- Dependencies: 228
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Order" (id, "orderNumber", "userId", subtotal, "deliveryCharge", "discountAmount", "taxAmount", "totalAmount", "advancePayment", "customerName", "customerPhone", "customerAddress", "customerEmail", "customerCity", "customerArea", "customerPostalCode", "customerNote", "promoCode", status, "paymentMethod", "paymentStatus", "createdAt", "updatedAt", currency, "baseCurrency", "displayCurrency", "displaySubtotal", "displayDeliveryCharge", "displayDiscountAmount", "displayTaxAmount", "displayTotalAmount", "displayAdvancePayment", "exchangeRate", "exchangeRateAt") FROM stdin;
cmt5dm6b30003qzl5s772st9d	ORD-260823-0E630695	cms93amlu0004e5l5s487j9q3	1999.00	80.00	0.00	99.95	2178.95	0.00	Rian Hasan Siam	+8801932600504	Ahmad Nagar, Paikpara,Boshiruddin school\nMirpur 1,Dhaka	rianhasan1971@gmail.com	Dhaka	\N	1216	\N	\N	PENDING	AIRWALLEX	PENDING	2026-08-23 05:38:18.352	2026-08-23 05:38:18.352	BDT	BDT	BDT	1999.00	80.00	0.00	99.95	2178.95	0.00	1.0000000000	\N
cmt5mkyab000nqzl58t38ea0z	ORD-260823-7A391570	cmt5marv8000jqzl5o0n07e2h	899.00	11150.00	0.00	44.95	12093.95	0.00	李靖	18688708371	House 7, road \n14/c, sector 4. Uttara	34392932@qq.com	Dhaka	\N	\N	share the tracking NO. To my email.	\N	PENDING	CASH_ON_DELIVERY	UNPAID	2026-08-23 09:49:17.843	2026-08-23 09:49:17.843	BDT	BDT	CNY	49.71	616.60	0.00	2.49	668.80	0.00	0.0553000000	2026-08-19 12:34:09.97
cmt5n8ltf0013qzl5siv3ti2d	ORD-260823-EBDDA6AE	cms93amlu0004e5l5s487j9q3	5997.00	80.00	0.00	299.85	6376.85	0.00	Rian Hasan Siam	+8801534865016	Ahmad Nagar, Paikpara,Boshiruddin school\nMirpur 1,Dhaka	rianhasan1971@gmail.com	Dhaka	\N	1216	\N	\N	PENDING	AIRWALLEX	PENDING	2026-08-23 10:07:41.427	2026-08-23 10:07:41.427	BDT	BDT	BDT	5997.00	80.00	0.00	299.85	6376.85	0.00	1.0000000000	\N
cmt5mspz1000tqzl53jmn72yf	ORD-260823-24370673	cmt5marv8000jqzl5o0n07e2h	1999.00	80.00	0.00	99.95	2178.95	0.00	李靖	18688708371	House 7, road \n14/c, sector 4. Uttara	34392932@qq.com	Dhaka	\N	\N	share tracking NO.to my email.	\N	PENDING	AIRWALLEX	PENDING	2026-08-23 09:55:20.317	2026-08-23 10:08:38.929	BDT	BDT	CNY	110.54	4.42	0.00	5.53	120.50	0.00	0.0553000000	2026-08-19 12:34:09.97
cmt5ncwgh001dqzl53adgdfd0	ORD-260823-F166EC31	cms93amlu0004e5l5s487j9q3	5997.00	80.00	0.00	299.85	6376.85	0.00	Rian Hasan Siam	+8801534865016	Ahmad Nagar, Paikpara,Boshiruddin school\nMirpur 1,Dhaka	rianhasan1971@gmail.com	Dhaka	\N	1216	\N	\N	PENDING	AIRWALLEX	PENDING	2026-08-23 10:11:01.841	2026-08-23 10:11:01.841	BDT	BDT	BDT	5997.00	80.00	0.00	299.85	6376.85	0.00	1.0000000000	\N
cmt5nerv7001mqzl5un8m5o98	ORD-260823-88A796A7	cms93amlu0004e5l5s487j9q3	1999.00	80.00	0.00	99.95	2178.95	0.00	Rian Hasan Siam	+8801932600504	Ahmad Nagar, Paikpara,Boshiruddin school\nMirpur 1,Dhaka	rianhasan1971@gmail.com	Dhaka	\N	1216	\N	\N	PENDING	AIRWALLEX	PENDING	2026-08-23 10:12:29.203	2026-08-23 10:12:29.203	BDT	BDT	BDT	1999.00	80.00	0.00	99.95	2178.95	0.00	1.0000000000	\N
\.


--
-- TOC entry 3900 (class 0 OID 24933)
-- Dependencies: 230
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."OrderItem" (id, "orderId", "productId", "variantId", "productName", "productImage", sku, "variantName", color, size, quantity, "unitPrice", "totalPrice", "buyingPrice", "createdAt", "variantAttributes", "displayUnitPrice", "displayTotalPrice") FROM stdin;
cmt5dm6dk0004qzl5tl6hqzbf	cmt5dm6b30003qzl5s772st9d	cmsn6f27a000gagl5b0yvsz4t	cmsn6f29f000hagl5i0hdbyme	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	https://i.ibb.co/Gf5P8KM1/e43c527e593c.png	XH-E09-1	\N	Purple	\N	1	1999.00	1999.00	0.00	2026-08-23 05:38:18.352	\N	1999.00	1999.00
cmt5mkycg000oqzl5743viuid	cmt5mkyab000nqzl58t38ea0z	cmsevi0i4004we5l5dfi04msm	cmsevi0jw004xe5l53t25m70r	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin	https://i.ibb.co/fzHjcNCb/4104ade1c561.png	XH-E12-1	\N	#000000	\N	1	899.00	899.00	0.00	2026-08-23 09:49:17.843	\N	49.71	49.71
cmt5msq0q000uqzl549apkt87	cmt5mspz1000tqzl53jmn72yf	cmsn6f27a000gagl5b0yvsz4t	cmsn6f29f000hagl5i0hdbyme	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	https://i.ibb.co/Gf5P8KM1/e43c527e593c.png	XH-E09-1	\N	Purple	\N	1	1999.00	1999.00	0.00	2026-08-23 09:55:20.317	\N	110.54	110.54
cmt5n8lwx0014qzl5u2mw8tb5	cmt5n8ltf0013qzl5siv3ti2d	cmsn6f27a000gagl5b0yvsz4t	cmsn6f29f000hagl5i0hdbyme	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	https://i.ibb.co/Gf5P8KM1/e43c527e593c.png	XH-E09-1	\N	Purple	\N	3	1999.00	5997.00	0.00	2026-08-23 10:07:41.427	\N	1999.00	5997.00
cmt5ncwi6001eqzl5jnjml7vw	cmt5ncwgh001dqzl53adgdfd0	cmsn6f27a000gagl5b0yvsz4t	cmsn6f29f000hagl5i0hdbyme	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	https://i.ibb.co/Gf5P8KM1/e43c527e593c.png	XH-E09-1	\N	Purple	\N	3	1999.00	5997.00	0.00	2026-08-23 10:11:01.841	\N	1999.00	5997.00
cmt5nerx7001nqzl5esg8e0r7	cmt5nerv7001mqzl5un8m5o98	cmsn6f27a000gagl5b0yvsz4t	cmsn6f29f000hagl5i0hdbyme	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	https://i.ibb.co/Gf5P8KM1/e43c527e593c.png	XH-E09-1	\N	Purple	\N	1	1999.00	1999.00	0.00	2026-08-23 10:12:29.203	\N	1999.00	1999.00
\.


--
-- TOC entry 3899 (class 0 OID 24921)
-- Dependencies: 229
-- Data for Name: OrderStatusHistory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."OrderStatusHistory" (id, "orderId", status, note, "updatedBy", "createdAt") FROM stdin;
cmt5dm6k00005qzl56ukr0c1z	cmt5dm6b30003qzl5s772st9d	PENDING	Order created; awaiting verified online payment.	cms93amlu0004e5l5s487j9q3	2026-08-23 05:38:18.672
cmt5mkyhs000pqzl5yw4uao3x	cmt5mkyab000nqzl58t38ea0z	PENDING	Order placed.	cmt5marv8000jqzl5o0n07e2h	2026-08-23 09:49:18.112
cmt5msq5p000vqzl5ildbhhck	cmt5mspz1000tqzl53jmn72yf	PENDING	Order created; awaiting verified online payment.	cmt5marv8000jqzl5o0n07e2h	2026-08-23 09:55:20.557
cmt5n8m3j0015qzl5fie8qx57	cmt5n8ltf0013qzl5siv3ti2d	PENDING	Order created; awaiting verified online payment.	cms93amlu0004e5l5s487j9q3	2026-08-23 10:07:41.791
cmt5ncwnc001fqzl5smsj5r23	cmt5ncwgh001dqzl53adgdfd0	PENDING	Order created; awaiting verified online payment.	cms93amlu0004e5l5s487j9q3	2026-08-23 10:11:02.088
cmt5nes35001oqzl51vygbtkc	cmt5nerv7001mqzl5un8m5o98	PENDING	Order created; awaiting verified online payment.	cms93amlu0004e5l5s487j9q3	2026-08-23 10:12:29.489
\.


--
-- TOC entry 3908 (class 0 OID 25072)
-- Dependencies: 238
-- Data for Name: PaymentTransaction; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."PaymentTransaction" (id, "orderId", provider, "transactionId", amount, currency, status, "rawResponse", "createdAt", "updatedAt", "idempotencyKey", "gatewayUrl", "gatewaySessionKey", "validationId", "bankTransactionId", "cardType", "riskLevel", "paidAt", "requiresReview", "reviewReason", "reviewResolvedAt", "reviewResolvedBy", "reviewResolution", "reviewResolutionReference", "providerStatus", "failureCode", "failureMessage", "lastReconciledAt", "reconciliationResult", "reconciliationAttempts", "baseAmount", "baseCurrency", "exchangeRate", "exchangeRateAt") FROM stdin;
75bc1462-c426-4fc6-9e15-3180ee5cb3d8	cmt5dm6b30003qzl5s772st9d	AIRWALLEX	int_hkpdnss2whllpe9e5ht	17.83	USD	REQUIRES_PAYMENT_METHOD	{"id": "int_hkpdnss2whllpe9e5ht", "amount": "17.83", "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T05:38:20+0000", "request_id": "95c1d74f-558f-556d-b92f-6a840e97cac1", "updated_at": "2026-08-23T05:38:20+0000", "merchant_order_id": "cmt5dm6b30003qzl5s772st9d"}	2026-08-23 05:38:18.75	2026-08-23 05:38:21.402	95c1d74f-558f-556d-b92f-6a840e97cac1	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	REQUIRES_PAYMENT_METHOD	\N	\N	\N	\N	0	2178.95	BDT	0.0081840000	2026-08-19 12:34:09.97
0dda95f8-c8e9-44f3-82da-f6aab20dc3a8	cmt5n8ltf0013qzl5siv3ti2d	AIRWALLEX	int_hkpdnss2whllwtkppwl	52.19	USD	REQUIRES_PAYMENT_METHOD	{"id": "int_hkpdnss2whllwtkppwl", "amount": "52.19", "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T10:07:44+0000", "request_id": "73b966c9-9229-5c8c-b675-4c7d53c0f3f4", "updated_at": "2026-08-23T10:07:44+0000", "merchant_order_id": "cmt5n8ltf0013qzl5siv3ti2d"}	2026-08-23 10:07:41.87	2026-08-23 10:07:44.938	73b966c9-9229-5c8c-b675-4c7d53c0f3f4	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	REQUIRES_PAYMENT_METHOD	\N	\N	\N	\N	0	6376.85	BDT	0.0081840000	2026-08-19 12:34:09.97
4a6e71ec-fdc8-4bb6-a12c-54e9d77db021	cmt5mspz1000tqzl53jmn72yf	AIRWALLEX	int_hkpdttns9hllwhc646p	120.50	CNY	REQUIRES_PAYMENT_METHOD	{"id": "int_hkpdttns9hllwhc646p", "amount": "120.5", "status": "REQUIRES_PAYMENT_METHOD", "currency": "CNY", "created_at": "2026-08-23T09:55:24+0000", "request_id": "e83e3e3a-7961-51c0-8bc7-e539b83f933d", "updated_at": "2026-08-23T09:55:24+0000", "merchant_order_id": "cmt5mspz1000tqzl53jmn72yf"}	2026-08-23 09:55:20.617	2026-08-23 10:08:38.868	e83e3e3a-7961-51c0-8bc7-e539b83f933d	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	REQUIRES_PAYMENT_METHOD	\N	\N	\N	\N	0	2178.95	BDT	0.0553000000	2026-08-19 12:34:09.97
edbea9e9-6e03-4748-89d1-3e3fcda4975c	cmt5ncwgh001dqzl53adgdfd0	AIRWALLEX	int_hkpdttns9hllwwvtc7z	52.19	USD	REQUIRES_PAYMENT_METHOD	{"id": "int_hkpdttns9hllwwvtc7z", "amount": "52.19", "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T10:11:04+0000", "request_id": "c8bfbca7-ecb1-54f9-afe6-9edbd2514201", "updated_at": "2026-08-23T10:11:04+0000", "merchant_order_id": "cmt5ncwgh001dqzl53adgdfd0"}	2026-08-23 10:11:02.15	2026-08-23 10:11:04.813	c8bfbca7-ecb1-54f9-afe6-9edbd2514201	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	REQUIRES_PAYMENT_METHOD	\N	\N	\N	\N	0	6376.85	BDT	0.0081840000	2026-08-19 12:34:09.97
665871c9-1468-48cf-bfc4-ceb9cb4cc53c	cmt5nerv7001mqzl5un8m5o98	AIRWALLEX	int_hkpdbctnmhllwybc4uq	17.83	USD	REQUIRES_PAYMENT_METHOD	{"id": "int_hkpdbctnmhllwybc4uq", "amount": "17.83", "status": "REQUIRES_PAYMENT_METHOD", "currency": "USD", "created_at": "2026-08-23T10:12:30+0000", "request_id": "022093a7-da28-5064-9779-a78edc46e1ae", "updated_at": "2026-08-23T10:12:30+0000", "merchant_order_id": "cmt5nerv7001mqzl5un8m5o98"}	2026-08-23 10:12:29.56	2026-08-23 10:12:31.43	022093a7-da28-5064-9779-a78edc46e1ae	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	REQUIRES_PAYMENT_METHOD	\N	\N	\N	\N	0	2178.95	BDT	0.0081840000	2026-08-19 12:34:09.97
\.


--
-- TOC entry 3920 (class 0 OID 106553)
-- Dependencies: 250
-- Data for Name: PaymentTransactionEvent; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."PaymentTransactionEvent" (id, "paymentTransactionId", source, "eventName", "fromStatus", "toStatus", "providerStatus", "providerEventId", "reasonCode", "requiresReview", "createdAt") FROM stdin;
cmt5dm6oi0006qzl540q8iqcr	75bc1462-c426-4fc6-9e15-3180ee5cb3d8	INITIATION	airwallex.attempt.created	\N	CREATED	LOCAL_CREATED	\N	\N	f	2026-08-23 05:38:18.75
cmt5dm8q00007qzl55jc7x6cr	75bc1462-c426-4fc6-9e15-3180ee5cb3d8	INITIATION	payment_intent.created	CREATED	REQUIRES_PAYMENT_METHOD	REQUIRES_PAYMENT_METHOD	\N	\N	f	2026-08-23 05:38:21.48
cmt5msq9a000wqzl55cp2l2q0	4a6e71ec-fdc8-4bb6-a12c-54e9d77db021	INITIATION	airwallex.attempt.created	\N	CREATED	LOCAL_CREATED	\N	\N	f	2026-08-23 09:55:20.617
cmt5mstlj000xqzl5rmyez4x3	4a6e71ec-fdc8-4bb6-a12c-54e9d77db021	INITIATION	payment_intent.created	CREATED	REQUIRES_PAYMENT_METHOD	REQUIRES_PAYMENT_METHOD	\N	\N	f	2026-08-23 09:55:25.015
cmt5n8m7x0016qzl5te13rc0b	0dda95f8-c8e9-44f3-82da-f6aab20dc3a8	INITIATION	airwallex.attempt.created	\N	CREATED	LOCAL_CREATED	\N	\N	f	2026-08-23 10:07:41.87
cmt5n8ol80018qzl5r501ela9	0dda95f8-c8e9-44f3-82da-f6aab20dc3a8	INITIATION	payment_intent.created	CREATED	REQUIRES_PAYMENT_METHOD	REQUIRES_PAYMENT_METHOD	\N	\N	f	2026-08-23 10:07:45.02
cmt5n9u8f001bqzl5okq8a0pj	4a6e71ec-fdc8-4bb6-a12c-54e9d77db021	INITIATION	airwallex.initiation.observed	REQUIRES_PAYMENT_METHOD	REQUIRES_PAYMENT_METHOD	REQUIRES_PAYMENT_METHOD	\N	\N	f	2026-08-23 10:08:38.991
cmt5ncwqr001gqzl50u9i1yne	edbea9e9-6e03-4748-89d1-3e3fcda4975c	INITIATION	airwallex.attempt.created	\N	CREATED	LOCAL_CREATED	\N	\N	f	2026-08-23 10:11:02.15
cmt5ncysu001iqzl5pgl06eum	edbea9e9-6e03-4748-89d1-3e3fcda4975c	INITIATION	payment_intent.created	CREATED	REQUIRES_PAYMENT_METHOD	REQUIRES_PAYMENT_METHOD	\N	\N	f	2026-08-23 10:11:04.878
cmt5nes73001pqzl5d0qcj2ih	665871c9-1468-48cf-bfc4-ceb9cb4cc53c	INITIATION	airwallex.attempt.created	\N	CREATED	LOCAL_CREATED	\N	\N	f	2026-08-23 10:12:29.56
cmt5netn3001qqzl5u8g7oe5r	665871c9-1468-48cf-bfc4-ceb9cb4cc53c	INITIATION	payment_intent.created	CREATED	REQUIRES_PAYMENT_METHOD	REQUIRES_PAYMENT_METHOD	\N	\N	f	2026-08-23 10:12:31.503
\.


--
-- TOC entry 3893 (class 0 OID 24812)
-- Dependencies: 223
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Product" (id, "productCode", name, slug, description, status, "modelNumber", series, "buyingPrice", "salePrice", "discountPrice", specifications, "categoryId", "brandId", "manufacturerId", "createdAt", "updatedAt", "seoTitle", "metaDescription", "ogImage", gtin, "itemCondition", "descriptionBlocks") FROM stdin;
cmsev2vmr003ge5l5i9ym859k	PRD-00007	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler	gs8-high-speed-mini-cool-fan	### Key Features\n\n\n- **Powerful High-Speed Cooling**\n\nThe GS8 Mini Cool Fan provides strong airflow to help you stay refreshed during hot weather, long work hours, or outdoor trips.\n\n- **3000mAh Rechargeable Battery**\n\nBuilt with a 3000mAh battery, this fan offers long-lasting operation on a single charge. You can use it for hours without worrying about frequent charging.\n\n- **USB Rechargeable Design**\n\nIt comes with a USB charging cable, so you can easily charge it from power banks, laptops, desktop computers, car chargers, and standard USB ports.\n\n- **Portable and Compact Size**\n\nThe mini fan is small enough to carry in your bag, place on your desk, or use while traveling. Its compact design makes it suitable for daily commuting, office use, and outdoor activities.\n\n- **Low Noise Operation**\n\nDespite its powerful performance, the fan operates quietly, making it suitable for offices, libraries, classrooms, bedrooms, and other quiet environments.\n\n- **Detachable Strap Included**\n\nThe package includes a matching strap, allowing you to carry the fan more conveniently during travel, shopping, or outdoor events.\n\n- **Stylish and Practical Design**\n\nWith its modern cylindrical shape, simple control buttons, and elegant color options, the GS8 Mini Cool Fan is both a useful device and a stylish personal accessory.\n\n\n### Specifications\n\n\n- **Product Name:** GS8 High-Speed Mini Cool Fan\n\n- **Battery Capacity:** 3000mAh\n\n- **Charging Time:** Approximately 4–6 hours\n\n- **Working Time:** Approximately 2.5–4 hours (depending on speed mode)\n\n- **Charging Interface:** USB\n\n- **Noise Level:** Low noise design\n\n- **Package Includes:** 1 Mini Fan, 1 USB Charging Cable, 1 Strap, 1 User Manual / Packaging Box\n\n- **Application:** Home, Office, Study, Travel, Outdoor, Commute\n\n\n### Package Contents\n\n\n- 1 x GS8 Mini Cool Fan\n\n- 1 x USB Charging Cable\n\n- 1 x Carrying Strap\n\n- 1 x Original Packaging Box\n\n\n### Notes\n\n\n- Please fully charge the product before first use.\n\n- Do not use the fan while it is charging for extended periods.\n\n- Keep the fan away from water and humid environments.\n\n- Clean the air inlet and outlet regularly to maintain performance.\n\n- Actual working time may vary depending on speed mode and usage conditions.\n\n\n---\n\n\n## 6. Short Selling Points for Image Layout\n\n\nYou can use these on your product images:\n\n\n- **Strong Cooling Airflow**\n\n- **3000mAh Long Battery**\n\n- **USB Rechargeable**\n\n- **Low Noise Operation**\n\n- **Portable with Strap**\n\n- **Ideal for Home, Office & Travel**\n\n- **Compact and Lightweight**\n\n- **Perfect Personal Cooler**\n\n\n---\n\n\n## 7. Image Text Suggestion for Daraz Main Image\n\n\n**Main Headline:**\n\n**GS8 High-Speed Mini Cool Fan**\n\n\n**Sub Headline:**\n\n**Powerful Portable Cooling for Everyday Use**\n\n\n**Key Selling Points:**\n\n**3000mAh Battery**\n\n**USB Rechargeable**\n\n**Low Noise**\n\n**With Strap & Charging Cable**\n\n\n**Bottom CTA:**\n\n**Order Now – Stay Cool Anywhere**	ACTIVE	【GS8】XH-E10(2)	\N	0.00	3823.00	1999.00	\N	cmsbuu7ra0008e5l5i8jt4tve	\N	\N	2026-08-04 16:17:24.387	2026-08-13 07:45:56.008	Hushjet Mini Cool GS8 Handheld Fan, 3000mAh USB Rechargeable Portable	Hushjet Mini Cool portable handheld fan with strong airflow, 3000mAh battery, 4-6 hours runtime, low noise lightweight design with lanyard, perfect for travel, office and outdoor use.	https://i.ibb.co/5hkBQPPw/201a143ba0b8.png	\N	NEW	[{"id": "005ff386-21d1-4e0f-a95c-3c5e9e2013a2", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "Hushjet Mini Cool GS8 High-Speed Portable Handheld Fan", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Your personal lightweight summer cooler! This cylindrical handheld fan delivers strong focused airflow to bring instant cooling anytime. Compact size easily fits in bags for daily use, travel and office.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌬️ Powerful Concentrated Airflow Optimized fan blades create strong wind to relieve heat on hot days, adjustable wind speeds for different needs.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔋 3000mAh Rechargeable Battery Supports 4–6 hours continuous use. USB Type-C charging, works with power banks, laptops and adapters for easy charging.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🤫 Low Noise Quiet Motor Smooth motor design lowers noise, will not disturb you when working, studying or resting, great for office, bedroom and library.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🎒 Portable Handheld Design Lightweight cylinder shape comfortable to grip. Matching lanyard prevents slipping, perfect for outdoor walks, trips and concerts.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🎨 Two Fashion Colors Navy Blue & Pink available. Package includes lanyard and USB charging cable.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Core Features", "type": "text", "marks": [{"type": "bold"}]}, {"text": " • Hushjet Mini Cool GS8 handheld fan • Strong concentrated cooling airflow • 3000mAh built-in battery • 4–6 hours continuous working time • USB Type-C rechargeable • Low noise operation • Lightweight portable body • Equipped with lanyard & charging cable • Colors: Navy Blue / Pink • Scenarios: travel, office, camping, outdoor activities", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmseuiruy002be5l5xukisdtq	PRD-00004	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan	portable-lipstick-handheld-fan-gs4	## (For Bangladeshi Humid Hot Summer)\n\n\nBeat the unbearable sweltering & humid Bangladeshi summer anytime you want! Our exquisite Mini Lipstick Handheld Fan combines ultra-compact lipstick-sized body with extreme turbo cooling power. Featuring 15m/s super strong airflow, 199 adjustable wind levels, 90° rotatable head and premium metal texture, this tiny pocket cooler is the ideal summer essential for ladies, students, office workers and outdoor lovers across Bangladesh!\n\n\n---\n\n\n## Detailed Core Product Features\n\n\n### ❄️ Extreme Turbo Wind | 500% Enhanced Cooling Performance\n\n\nPowered by top-tier aviation-grade 6-pole brushless motor:\n\n\n- Max motor speed up to **20,000 RPM**, delivering up to **15 meters per second powerful cold breeze**\n\n- Aviation turbine pressurized airflow structure boosts airflow volume by 350% and cooling effect by 500% compared to ordinary mini fans\n\n- 8x powerful wind surge, long-distance wind delivery brings instant icy cool feeling even under blazing hot sun\n\nPerfect to cool down your face, neck, body during rickshaw rides, campus hours and outdoor activities in Bangladesh’s hot climate.\n\n\n### 💄 Elegant Lipstick Mini Body Design | Ultra Portable & Lightweight\n\n\nUnique lipstick tube streamlined outlook, fashionable & portable specially designed for women:\n\n\n- Tiny slim cylinder shape, fits easily inside pockets, small purses, makeup bags & handbags\n\n- Premium smooth metallic matte finish, delicate luxury texture, great daily fashion accessory\n\n- Compact lightweight build, no hand fatigue even holding for long hours\n\nPerfect for daily makeup setting, shopping, travelling, hiking and casual outdoor use.\n\n\n### 🎛️ 199 Fine-Tune Wind Speed Levels | Customized Cooling Experience\n\n\nExclusive multi-speed precise adjustment design you can hardly find on regular pocket fans:\n\n\n- Total 199 variable wind gears from soft gentle breeze to raging strong turbo wind\n\n- Freely switch airflow intensity to suit your needs: mild wind for makeup fixing, powerful wind for rapid heat relief\n\n- Digital LED display shows current wind gear clearly, easy to check wind mode at a glance\n\n\n### 🔄 90° Flexible Foldable Rotatable Nozzle\n\n\nInnovative damping rotating air outlet design brings all-angle cooling freedom:\n\n\n- 90° adjustable tilt head with silent damping shaft, you can lock any blowing angle steadily\n\n- Rotate the fan head effortlessly to direct cool wind toward your face, neck, arms or body parts\n\n- Comfortable clicking rotating sound also works as a stress-relief fidget toy to ease daily tiredness\n\nCan be used as handheld fan or stand on flat desktop as small desk fan for indoor cooling.\n\n\n### 🔋 Long Lasting Rechargeable Battery & Safe Charging\n\n\nBuilt-in high-density lithium-ion rechargeable battery:\n\n\n- Long endurance runtime to support all-day outdoor use\n\n- Universal Type-C charging port, fast & convenient charging, compatible with power bank, phone chargers, laptop USB ports\n\n- Certified aviation-safe battery, permitted to carry on airplanes, trains, buses and metro inside Bangladesh\n\n- Supports charging while using for non-stop cooling\n\n\n### 🛡️ Multi-Layer Intelligent Safety Protection System\n\n\nBuilt-in smart control chip with comprehensive safety safeguards:\n\nOvervoltage, overcurrent, high temperature, short circuit, overcharge & over-discharge protection\n\nPrevents battery swelling, overheating and circuit damage, safe for long-term daily use in high-temperature weather.\n\n\n### ✅ Extra Humanized Practical Advantages\n\n\n1. Low noise stable operation: won’t disturb your study, work or rest\n\n2. Dense air outlet grille: prevents finger or hair entanglement, safe for long hair users\n\n3. Slim portable body: perfect gift choice for girlfriends, sisters, female friends for summer\n\n\n### 📍 Wide Application Scenarios For Bangladesh Daily Life\n\n\n✔ University classroom & campus daily use\n\n✔ Office indoor personal cooling\n\n✔ Rickshaw, bike & public transport commuting\n\n✔ Outdoor picnic, beach trips, hiking, cricket match watching\n\n✔ Ladies makeup air setting\n\n✔ Indoor bedroom, small space desktop cooling\n\n✔ Travelling & vacation essential\n\n\n---\n\n\n## Product Specification Table\n\n\n\n| Specification Items | Detailed Parameters |\n\n| --- | --- |\n\n| Product Name | Mini Lipstick Shape High Speed Handheld Fan |\n\n| Wind Speed Max | 15 m/s |\n\n| Total Wind Gears | 199 Levels Adjustable |\n\n| Rotation Angle | 90° Foldable & Rotatable |\n\n| Motor Type | 6-Pole Aviation Brushless Motor |\n\n| Max RPM | 20000 RPM |\n\n| Body Material | Premium Metallic Matte Shell |\n\n| Charging Port | Type-C USB Port |\n\n| Design Style | Lipstick Cylinder Portable Mini Design |\n\n\n---\n\n\n## Package Contents\n\n\n1 × Mini Lipstick Handheld Cooling Fan\n\n1 × Type-C Charging Cable\n\n1 × User Instruction Manual	ACTIVE	【GS4】XH-E02(3)	\N	0.00	3028.00	1499.00	\N	cmsbuu7ra0008e5l5i8jt4tve	\N	\N	2026-08-04 16:01:46.378	2026-08-13 07:54:05.441	Rotatable Mini Lipstick Handheld Fan, 199-Speed Stepless Wind, Digital	Rotatable lipstick-sized portable handheld fan with 199-speed stepless adjustment & LED digital power display. 0-180° adjustable wind head, powerful brushless motor, USB rechargeable, lightweight for travel, camping & daily outdoor use.	https://i.ibb.co/Kc6xJkrG/c1c77b14ae53.png	\N	NEW	[{"id": "6b75435b-c9b5-4a2b-9457-434c23a3dbae", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "Rotatable Mini Lipstick Portable Handheld Cooling Fan", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Stay cool anywhere this summer with our pocket-sized lipstick handheld fan! Compact, sleek and powerful, it brings instant icy breeze for daily commuting, traveling, camping and outdoor activities.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "❄️ ", "type": "text"}, {"text": "0-180° Rotatable Wind Head", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Damping rotating shaft design, freely adjust wind direction. You can hold it by hand, place on desktop, or match with lanyard for multiple usage scenarios.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💨 ", "type": "text"}, {"text": "199-Speed Stepless Wind Control", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Powerful 6-pole brushless motor generates strong turbine airflow. Smooth stepless speed regulation to meet different cooling demands, ultra-quiet operation without disturbing others.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔋 ", "type": "text"}, {"text": "LED Digital Power Display", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Real-time remaining power visible on the screen, no more worrying about sudden power off. Large-capacity battery supports long-time use, USB Type-C rechargeable, convenient to charge via power bank, adapter and laptop.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ ", "type": "text"}, {"text": "Ultra-Portable Lipstick Size", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Dimension: 16.2cm Height × 3.3cm Width. Lightweight body easily fits into pockets, handbags. Elegant metallic appearance available in Purple, Pink, Grey multiple colors.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌍 ", "type": "text"}, {"text": "Travel Friendly", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Safe structure, permitted on airplanes and high-speed trains. Perfect companion for summer hiking, shopping, concerts and vacations.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📌 Product Features", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rotatable adjustable wind head", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "199 gears stepless wind speed", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "LED digital power display", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "High-speed brushless motor, strong airflow", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "USB rechargeable", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Mini lipstick compact design", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Multi-color optional: Purple / Pink / Grey", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Low noise, portable for outdoor", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmseud47n001ye5l5qahrywu0	PRD-00003	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan	n607-vortex-high-speed-handheld-fan	Tired of unbearable hot & humid summer weather in Bangladesh? Our Upgraded N607 Wind Cannon Handheld Turbo Fan brings you instant icy cool wind anytime anywhere! Equipped with 10m/s powerful airflow, foldable adjustable head, smart LED digital screen, 1800mAh large capacity battery and ultra-light portable body, it is your perfect summer cooling buddy for campus, office, rickshaw rides, outdoor trips & daily household use!\n\n\n---\n\n\n## Detailed Core Features Section\n\n\n### 🌪️ Pro-Level 10m/s Super Strong Turbo Wind Performance\n\n\nOutperforms ordinary pocket fans with fully upgraded wind generation system:\n\n\n1. Self-developed aviation-grade DC brushless motor, maximum speed up to **10000 RPM**, stable powerful wind output\n\n2. 6-blade turbine fan shaft + giant focused air duct structure: scientifically split airflow, wind distance increased by 20% & airflow efficiency improved by 20%\n\n3. Max wind speed reaches **10.0m/s**, rapid cooling your face, neck and whole body under scorching Bangladeshi sunshine\n\n4. Smooth airflow without harsh blowing feeling, comfortable for long-time use\n\n\n### 🎯 Foldable Gun-Style Ergonomic Premium Design\n\n\nClassic streamline wind cannon outlook with matte dual-tone texture, stylish and practical for all age groups:\n\n\n- Total weight only **210g**: lightweight design, no wrist soreness even holding for hours continuously\n\n- 180° adjustable fan head: freely tilt wind angle to direct cool breeze wherever you need\n\n- Compact body size: 5.7*5.8*16cm, easy to put in backpack, handbag or tote bag for carrying out\n\n- 3 elegant color options: Black, White, Mint Green, match your daily outfits perfectly\n\n- Anti-fingerprint matte surface, comfortable non-slip handheld touch\n\n\n### 📱 Smart External Digital LED Display Screen\n\n\nExclusive visible real-time status screen for convenient use:\n\n✔ Clearly shows current wind speed gear + remaining battery percentage on the outer circular screen\n\n✔ Check power level anytime outdoors, avoid sudden power outage during travelling or commuting\n\n✔ High definition digital display, advanced tech aesthetic design\n\n\n### 🔋 Large 1800mAh Battery | Up To 12 Hours Endurance\n\n\nLong-lasting power perfectly adapt to all-day outdoor activities:\n\n\n- Built-in high-density 1800mAh rechargeable lithium-ion battery\n\n- Adjustable working time: **1.5 hours ~ 12 hours continuous strong wind** based on different wind gears\n\n- Type-C fast charging port, fully charged only takes 3 hours; supports charging while using\n\n- Aviation certified lithium battery: Allowed to carry on airplane, train, bus and metro inside Bangladesh & overseas\n\n\n### 🛡️ 6-Layer AI Intelligent Chip Full Safety Protection\n\n\nBuilt-in smart control chip with six-fold comprehensive safety system to eliminate all hidden dangers:\n\n\n1. Overvoltage Protection\n\n2. Overcurrent Protection\n\n3. High Temperature Protection\n\n4. Short Circuit Protection\n\n5. Overcharge Protection\n\n6. Over-Discharge Protection\n\nEffectively prevent battery overheating, swelling and circuit damage, safe and reliable for daily long-term use in hot climate.\n\n\n### ✨ Humanized Thoughtful Practical Details\n\n\nEvery detail polished for daily Bangladeshi life scenarios:\n\n\n1. **One-Touch Wind Speed Control**: Simple buttons to switch wind gears freely, customize airflow easily\n\n2. **Encrypted Safety Protective Grille**: Dense fan cover prevents fingers & long hair from being tangled, safe for students and ladies\n\n3. **Reserved Lanyard Hanging Hole**: Can attach wrist strap to hang on wrist or backpack, free your hands during hiking, shopping\n\n4. Foldable rotating bracket: Can stand steadily on desktop as a small desk fan for indoor cooling\n\n\n### 📍 Widely Applicable Scenarios for Bangladesh Summer\n\n\nPerfect cooling solution for all hot humid occasions:\n\n✅ University classroom study & campus activities\n\n✅ Daily office indoor cooling\n\n✅ Rickshaw, bike, bus commuting under blazing sun\n\n✅ Outdoor picnic, beach vacation, hiking, cricket match watching\n\n✅ Makeup fixing breeze for women\n\n✅ Indoor bedroom, kitchen small space cooling\n\n\n---\n\n\n## Complete Product Specification Table\n\n\n\n| Specification Items | Detailed Parameters |\n\n| --- | --- |\n\n| Product Model | N607 Small Wind Cannon Foldable Handheld Fan |\n\n| Net Weight | 210 Grams |\n\n| Overall Size | 5.7 \\* 5.8 \\* 16 CM |\n\n| Battery Capacity | 1800mAh Lithium-ion Battery |\n\n| Motor Type | 2-Phase Self-developed DC Brushless Motor |\n\n| Max Wind Speed | 10.0 m/s |\n\n| Max Motor Rotation | 10000 RPM |\n\n| Full Charging Time | 3 Hours |\n\n| Working Duration | 1.5h ~ 12h (Adjustable by wind gears) |\n\n| Charging Interface | Type-C USB Port |\n\n| Available Colors | Black, White, Mint Green |\n\n| Safety Function | 6-Layer AI Chip Energy Protection System |\n\n\n---\n\n\n## Package Includes\n\n\n1 × N607 Foldable Handheld Turbo Fan\n\n1 × Type-C USB Charging Cable\n\n1 × User Instruction Manual	ACTIVE	【N607】XH-E03(3)	\N	0.00	1725.00	862.00	\N	cmsbuu7ra0008e5l5i8jt4tve	\N	\N	2026-08-04 15:57:22.451	2026-08-13 08:00:52.701	High Speed Handheld Fan 10000RPM, Portable Foldable Mini Cooling Fan	10000RPM vortex handheld fan with 1800mAh battery, up to 12h runtime. Lightweight foldable mini cooling fan for travel, outdoor & daily use.	https://i.ibb.co/27C1GfcL/ef6a081e45da.png	\N	NEW	[{"id": "86991a50-dc95-4496-8a32-92642222f461", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Tired of unbearable hot & humid summer weather in Bangladesh? Our Upgraded N607 Wind Cannon Handheld Turbo Fan brings you instant icy cool wind anytime anywhere! Equipped with 10m/s powerful airflow, foldable adjustable head, smart LED digital screen, 1800mAh large capacity battery and ultra-light portable body, it is your perfect summer cooling buddy for campus, office, rickshaw rides, outdoor trips & daily household use!", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "---", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "## Detailed Core Features Section", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "### 🌪️ Pro-Level 10m/s Super Strong Turbo Wind Performance", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Outperforms ordinary pocket fans with fully upgraded wind generation system:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1. Self-developed aviation-grade DC brushless motor, maximum speed up to ", "type": "text"}, {"text": "10000 RPM", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", stable powerful wind output", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "2. 6-blade turbine fan shaft + giant focused air duct structure: scientifically split airflow, wind distance increased by 20% & airflow efficiency improved by 20%", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "3. Max wind speed reaches ", "type": "text"}, {"text": "10.0m/s", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", rapid cooling your face, neck and whole body under scorching Bangladeshi sunshine", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "4. Smooth airflow without harsh blowing feeling, comfortable for long-time use", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "### 🎯 Foldable Gun-Style Ergonomic Premium Design", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Classic streamline wind cannon outlook with matte dual-tone texture, stylish and practical for all age groups:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "- Total weight only ", "type": "text"}, {"text": "210g", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": lightweight design, no wrist soreness even holding for hours continuously", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "- 180° adjustable fan head: freely tilt wind angle to direct cool breeze wherever you need", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "- Compact body size: 5.7*5.8*16cm, easy to put in backpack, handbag or tote bag for carrying out", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "- 3 elegant color options: Black, White, Mint Green, match your daily outfits perfectly", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "- Anti-fingerprint matte surface, comfortable non-slip handheld touch", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "### 📱 Smart External Digital LED Display Screen", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Exclusive visible real-time status screen for convenient use:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✔ Clearly shows current wind speed gear + remaining battery percentage on the outer circular screen", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✔ Check power level anytime outdoors, avoid sudden power outage during travelling or commuting", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✔ High definition digital display, advanced tech aesthetic design", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "### 🔋 Large 1800mAh Battery | Up To 12 Hours Endurance", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Long-lasting power perfectly adapt to all-day outdoor activities:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "- Built-in high-density 1800mAh rechargeable lithium-ion battery", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "- Adjustable working time: ", "type": "text"}, {"text": "1.5 hours ~ 12 hours continuous strong wind", "type": "text", "marks": [{"type": "bold"}]}, {"text": " based on different wind gears", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "- Type-C fast charging port, fully charged only takes 3 hours; supports charging while using", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "- Aviation certified lithium battery: Allowed to carry on airplane, train, bus and metro inside Bangladesh & overseas", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "### 🛡️ 6-Layer AI Intelligent Chip Full Safety Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Built-in smart control chip with six-fold comprehensive safety system to eliminate all hidden dangers:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1. Overvoltage Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "2. Overcurrent Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "3. High Temperature Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "4. Short Circuit Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "5. Overcharge Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "6. Over-Discharge Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Effectively prevent battery overheating, swelling and circuit damage, safe and reliable for daily long-term use in hot climate.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "### ✨ Humanized Thoughtful Practical Details", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Every detail polished for daily Bangladeshi life scenarios:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1. ", "type": "text"}, {"text": "One-Touch Wind Speed Control", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Simple buttons to switch wind gears freely, customize airflow easily", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "2. ", "type": "text"}, {"text": "Encrypted Safety Protective Grille", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Dense fan cover prevents fingers & long hair from being tangled, safe for students and ladies", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "3. ", "type": "text"}, {"text": "Reserved Lanyard Hanging Hole", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Can attach wrist strap to hang on wrist or backpack, free your hands during hiking, shopping", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "4. Foldable rotating bracket: Can stand steadily on desktop as a small desk fan for indoor cooling", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "### 📍 Widely Applicable Scenarios for Bangladesh Summer", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Perfect cooling solution for all hot humid occasions:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ University classroom study & campus activities", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Daily office indoor cooling", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Rickshaw, bike, bus commuting under blazing sun", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Outdoor picnic, beach vacation, hiking, cricket match watching", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Makeup fixing breeze for women", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Indoor bedroom, kitchen small space cooling", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "---", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "## Complete Product Specification Table", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Specification Items | Detailed Parameters |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| --- | --- |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Product Model | N607 Small Wind Cannon Foldable Handheld Fan |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Net Weight | 210 Grams |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Overall Size | 5.7 \\\\* 5.8 \\\\* 16 CM |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Battery Capacity | 1800mAh Lithium-ion Battery |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Motor Type | 2-Phase Self-developed DC Brushless Motor |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Max Wind Speed | 10.0 m/s |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Max Motor Rotation | 10000 RPM |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Full Charging Time | 3 Hours |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Working Duration | 1.5h ~ 12h (Adjustable by wind gears) |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Charging Interface | Type-C USB Port |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Available Colors | Black, White, Mint Green |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "| Safety Function | 6-Layer AI Chip Energy Protection System |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "---", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "## Package Includes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1 × N607 Foldable Handheld Turbo Fan", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1 × Type-C USB Charging Cable", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1 × User Instruction Manual", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoftek200d4agl5jnznn882	PRD-00030	USB Rechargeable Electric Makeup Brush 10 Vibration Modes Soft Fluffy Foundation Blush Cosmetic Brush	usb-rechargeable-electric-makeup-brush-10-vibration-modes-soft-fluffy-foundation-blush-cosmetic-brush	\N	ACTIVE	XH-S01	\N	0.00	1499.00	799.00	\N	cmsbx02j6000je5l50vazxxb2	\N	\N	2026-08-11 09:07:49.874	2026-08-13 08:25:33.251	Magnetic Detachable Makeup Brush Electric Massager	2-in-1 magnetic makeup brush massager with 10 vibration modes. USB rechargeable, discreet portable design. Works as cosmetic blush brush & body massager for daily beauty and muscle relaxation at home & travel.	https://i.ibb.co/DDPchq7q/fa5ccab778f4.jpg	\N	NEW	[{"id": "f86eae49-a6c2-41c4-ba9e-2d3f718c1024", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Multi-Function Magnetic Makeup Brush Electric Massager", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This innovative 2-in-1 device combines a detachable makeup blush brush and a powerful vibration massager for daily beauty care and full-body muscle relaxation. Designed with a discreet appearance like an ordinary cosmetic brush, it is portable and easy to carry for home, travel and office use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Magnetic Detachable Design", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " The soft blush brush head connects firmly via built-in magnet. You can quickly assemble or separate the brush and vibration motor. Use it as a regular makeup brush for daily cosmetics application, or remove the brush to use the main massager alone.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "10 Adjustable Vibration Modes", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Built-in powerful silent motor with 10 varied vibration settings, ranging from gentle steady pulses to intensive rhythmic vibrations. Simply long press the power button to turn on/off and switch modes freely to meet different relaxation demands.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Premium Soft Blush Brush", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " The cosmetic brush features dense, fluffy ultra-soft bristles. It picks up powder evenly, ideal for applying blush, loose powder and bronzer to create delicate daily makeup looks. Flexible brush head brings gentle touching experience on skin.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "USB Rechargeable & Wide Compatibility", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Comes with dedicated USB charging cable. Charge conveniently via power bank, laptop, car charger or wall USB adapter. Unscrew the rear cap to access the charging port. Rechargeable design eliminates frequent battery replacement, eco-friendly and cost-effective.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Compact & Discreet Shape", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Slim makeup brush outlook offers great privacy. Lightweight body fits easily into makeup bags and handbags. Easy to disassemble and clean for hygienic long-time use.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Package Contents", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1 x Vibration Massager Main Body", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 x Magnetic Blush Brush Head", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 x USB Charging Cable", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Warm Tips: Clean the brush head and main unit regularly and keep dry after cleaning.", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsogrtr600glagl5qv6xfqrp	PRD-00037	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine	karseell-maca-hair-essence-oil-anti-frizz-serum-repair-dry-bleached-damaged-hair-lightweight-non-greasy-boost-hair-shine	\N	INACTIVE	XH-C09	\N	0.00	1580.00	790.00	\N	cmsbwi4iw000ie5l530ku4mjg	\N	\N	2026-08-11 09:34:35.874	2026-08-14 03:33:15.307	Karseell Maca Power Hair Essence Oil, Repair Dry Frizzy Damaged Hair,	Karseell Maca Power Hair Essence Oil is professional salon hair care serum. Infused with premium plant oil blend, it repairs dry, over-processed, frizzy hair, tames flyaways and replenishes moisture. Lightweight formula absorbs quickly without greasy residue, leaving hair silky, bouncy and glossy. Suitable for colored,	https://i.ibb.co/tTVSmZjy/c717c03d9b7a.jpg	\N	NEW	[{"id": "e2d6712c-ce7a-49de-b94d-462febbe4532", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Karseell Maca Power Maca Essence Oil 50ml", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Professional salon-grade hair repair oil for damaged & dry hair. Formulated with cold-pressed maca essence and nourishing argan oil, avocado oil, shea butter. It effectively locks in moisture, smooths rough cuticles, improves tangled, frizzy hair and repairs split ends caused by dyeing, bleaching and frequent heat styling.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Deeply nourish dry & brittle hair ✅ Tame frizz and reduce flyaways ✅ Restore gloss for colored & bleached hair ✅ Lightweight texture, non-greasy, no heavy residue ✅ Fast absorption, won’t weigh hair down ✅ Improve combability, soften coarse hair ✅ Dual-use for hair ends & body skin", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How to Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Damp hair: Take 1–3 drops, apply evenly before blow-drying for heat protection.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Dry hair: Rub oil on palms, gently smooth onto mid-length and hair ends as finishing care.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Overnight care: Apply a small amount on dry ends before sleep for intensive nourishment.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Tips: Fine hair use 1 drop; medium hair use 2 drops; thick & extremely dry hair use 2–3 drops.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Notice", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "For external use only. Avoid contact with eyes. Discontinue use if scalp discomfort occurs.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsog75pm00e6agl586ijcjyr	PRD-00033	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool	gongpei-men-roll-on-antiperspirant-60ml-ocean-scent-48h-long-lasting-deodorant-anti-sweat-odor-refreshing-cool	\N	INACTIVE	XH-C20	\N	0.00	799.00	399.00	\N	cmsbxji5h000oe5l5sdyjoz5g	\N	\N	2026-08-11 09:18:31.595	2026-08-14 03:33:30.569	GONGPEI Men Roll‑on Antiperspirant 60ml,48H Long Lasting Ocean Scent D	GONGPEI men’s roll‑on deodorant antiperspirant with fresh ocean fragrance. 48‑hour long‑lasting scent, 99.9% odor removal, quick‑dry cool feeling, no residue, stops embarrassing armpit sweat for daily sports work.	https://i.ibb.co/dyYR0fR/4f97caa50fa2.jpg	\N	NEW	[{"id": "086b8a97-4201-4209-9b55-4b2458a68db1", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Name", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "GONGPEI Men Roll‑on Antiperspirant Deodorant, Ocean Fragrance 60ml", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Fed up with sweaty armpits and unpleasant body odor in daily commuting, workouts and social occasions? This GONGPEI men‑specific roll‑on antiperspirant is professionally developed for male sweat characteristics. It delivers instant cool refreshment, effectively suppresses sweat and eliminates odor, bringing clean ocean‑wave aroma for all‑day fresh comfort. Zero sticky residue, gentle for underarm skin.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Key Features", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌊 ", "type": "text"}, {"text": "Fresh Ocean Scent Aroma", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Blend of sea salt & citrus notes, authentic ocean‑breeze fragrance. Get masculine clean scent instead of heavy chemical smell, keep you pleasant all day long.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "⏱️ ", "type": "text"}, {"text": "48H Long‑Lasting Fragrance & 99.9% Odor Removal", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Powerful deodorizing formula blocks sweat‑caused bad odor. Achieve up to 48‑hour lasting fragrance, 99.9% odor removal rate, say goodbye to awkward sweaty armpits.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "❄️ ", "type": "text"}, {"text": "1‑Second Cool & Quick‑Dry Ice Sensation", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Smooth rolling‑ball glides easily on skin. Instant cooling touch, fast‑drying texture with no stickiness, no greasy residue after application. Perfect for hot weather, gym and outdoor activities.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🛡️ ", "type": "text"}, {"text": "Mild & Non‑irritating Formula", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gentle formula, no harm to delicate underarm skin. No clogging pores, no white marks on clothes. Safe for everyday frequent use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "👔 ", "type": "text"}, {"text": "Tailored for Men’s Sweat Needs", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Specially researched for men. Compact 60ml portable bottle, easy to toss in gym bag, backpack or travel luggage for on‑the‑go touch‑ups.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Make sure underarm skin is clean and dry.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Twist open cap, roll evenly across armpit skin.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Wait for it to dry fully before putting on clothing.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Re‑apply as needed during heavy sweating days.", "type": "text"}]}]}]}, {"type": "blockquote", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Recommend using after shower for better effect.", "type": "text"}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Specifications", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: GONGPEI", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Product Type: Men Roll‑on Antiperspirant Deodorant", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Scent: Ocean Fragrance", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Volume: 60ml / 2.11fl.oz", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Target User: Men", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Effect: Sweat control, odor removal, long‑lasting fragrance", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Application Site: Underarm armpit", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "For external use only, avoid contact with eyes and broken skin.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Discontinue use if redness, stinging or irritation occurs.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Keep away from high‑temperature environment and direct sunlight.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Keep out of reach of children.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}, {"id": "9e84116d-1a14-43da-b1a4-87030939c6ed", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph"}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsofqg4200cmagl55re4rwis	PRD-00029	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color	korean-dasique-4-shades-blush-palette-soft-buildable-matte-blush-powder-natural-glowing-cheek-color	\N	INACTIVE	XH-C18	\N	0.00	1539.00	769.00	\N	cmsbx9m0f000me5l5qkdabgen	\N	\N	2026-08-11 09:05:31.922	2026-08-14 03:33:45.722	Dasique 4 Color Blush Palette, Matte Cool Warm Tone Powder Blush for D	Dasique four-color blush palette with matte soft powder, cool berry & warm nude tones. Buildable blendable pigment, lightweight natural rosy cheek makeup, portable Korean cheek blusher for women.	https://i.ibb.co/1GNsLyQ1/5b694aacd6b2.png	\N	NEW	[{"id": "2eda4dd1-a452-4fa0-b8b2-74d42dabb530", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "Dasique 4 Color Blush Palette", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Korean popular multi-shade blush quad with two palette options: cool berry pink set and warm nude beige set. Ultra-soft matte powder delivers natural, diffused rosy cheeks for all daily makeup styles.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Two Exclusive Palette Options", "type": "text"}]}, {"type": "heading", "attrs": {"level": 4, "textAlign": null}, "content": [{"text": "Palette 08 Blueberry Sorbet (Cool Toned Pink Series)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Perfect for cool & fair skin tones, cold pink & violet berry shades:", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Icing Berry: Pale milky baby pink, brightens dull complexion", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Mix Berry: Soft medium pink, everyday natural flush", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Violet Knit: Muted lavender pink, unique cold tone contour", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Berry Smoothie: Vivid berry pink, romantic date makeup", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 4, "textAlign": null}, "content": [{"text": "Warm Nude Palette (Neutral Warm Beige Series)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Suitable for warm, medium & tan skin, soft earthy nude shades:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Four gentle beige-peach hues for subtle sun-kissed, no-overdone natural cheek look, ideal for office and minimalist makeup.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Core Product Advantages", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🍓 Silky Matte Powder Texture", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Fine milled powder, zero chalky or patchy finish, smooth one-swipe application.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 🎨 Buildable & Blendable Pigment", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Light pigment concentration—easy to layer for soft glow or deepen for dramatic cheek color, seamless mixing between shades.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 💎 Portable Clear Compact Case", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Transparent lightweight square palette with built-in mirror, easy to toss into makeup bags for touch-ups outside.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 🌸 Multi-Scene Matching", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Cool pink palette: Doubles as subtle eyeshadow for cold-toned makeup;", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Warm nude palette: Creates sun-kissed healthy cheek for casual & commuter looks.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Who This Blush Palette Fits", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Fair cool skin wanting pink rosy flush", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Warm medium/tan skin preferring natural nude glow", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Makeup lovers who love versatile multi-shade cheek products", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Daily office, school, dating, travel makeup users", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How to Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Dip a fluffy blush brush into single shade or mix two tones", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Tap off excess powder to avoid heavy color", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Sweep gently across cheek apples, blend upward toward temples", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Layer lightly for richer color if needed", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Specifications", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: Dasique", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Product Name: 4 Colors Blush Palette", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Palette Versions: Cool Blueberry Sorbet Pink / Warm Nude Beige", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Texture: Soft matte powder", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Package: Transparent plastic compact with mirror", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Function: Cheek blusher, multi-use as eyeshadow", "type": "text"}]}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsoehmj20087agl5jk2ykc8c	PRD-00015	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin	jurlique-rose-shower-gel-body-lotion-set-moisturizing	\N	INACTIVE	XH-C27	\N	0.00	1426.13	713.07	\N	cmsbviuvp000be5l5qsuzeuup	\N	\N	2026-08-11 08:30:40.718	2026-08-14 03:34:02.554	Rose Softening Shower Gel & Body Lotion Set Moisturizing Body Care	Jurlique Rose body care set including shower gel & body lotion. Luxurious rose scent, hydrate, soften skin, long-lasting fragrance, gentle daily body skincare.	https://i.ibb.co/Kc02XRzC/150cf98d7e4d.webp	\N	NEW	[{"id": "fa62d6ac-ae83-490c-8c57-2a36e4f2d504", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Jurlique Rose Softening Shower Gel & Body Lotion Set", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Indulge yourself in timeless romantic rose body care ritual!", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This complete two-piece set brings together the Softening Shower Gel and Softening Body Lotion, delivering cleansing + long-lasting moisturization for your body.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌹 Rose Softening Shower Gel", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Infused with rose fruit oil and hyaluronic acid. It creates rich fine foam to gently wash away impurities. Features elegant soft light rose aroma. Cleans gently without stripping moisture, leaves skin refreshed, hydrated and smooth.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌹 Rose Softening Body Lotion", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Blended with premium rose and natural plant extracts. Provides lasting hydration to lock in skin moisture. Improves rough skin, creates silky, radiant and supple skin. Releases delicate lingering rose fragrance all day long.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Core Benefits", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Gentle plant-based formula, mild & non-irritating", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Luxury lasting romantic rose scent", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Shower Gel: Deep cleansing, hydrate while washing", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Body Lotion: Nourish, soften roughness, long-lasting moisturizing", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Perfect matching routine for all skin types", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Ideal for daily use & great as gift set", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "How To Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Shower Gel: Apply on damp skin, lather and massage gently, then rinse thoroughly.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Body Lotion: Smooth evenly over body skin after shower, massage until fully absorbed.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Capacity: 300ml Shower Gel + 300ml Body Lotion", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsofztni00ddagl5j1wo9h5x	PRD-00031	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner	adjustable-angle-eyeliner-stamp-smudge-proof-long-lasting-liquid-liner	\N	ACTIVE	XH-C06(2)	\N	0.00	593.00	296.00	\N	cmsbvf6hm000ae5l5vatwbbw5	\N	\N	2026-08-11 09:12:49.374	2026-08-12 08:26:06.851	SHEDOES Double End Winged Eyeliner Stamp, 90° Adjustable Waterproof Qu	SHEDOES double-ended winged eyeliner stamp features a 90° foldable design for easy angle adjustment. One press to get neat, symmetrical eyeliner wings. Quick-drying, waterproof, sweat & tear resistant, no smudging all day. Comes in Natural Black & Light Brown, compact portable capsule shape, perfect for makeup beginner	https://i.ibb.co/YB9YzXdQ/be3135c6bd88.png	\N	NEW	[{"id": "b2d0eb92-a9e3-4df2-a410-182195619977", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "SHEDOES 90° Adjustable Double End Winged Eyeliner Stamp", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Tired of uneven, messy eyeliner wings? This double-ended eyeliner stamp helps you draw perfect symmetrical eye tails in one second, ideal for makeup newbies. ✨ 90° Foldable Design Freely adjust makeup angles, wider vision, easy to stamp flat, upward or downward eyeliner tails. ✨ Double-End Design Each pen equipped with two wing stamp heads, convenient for left & right eyes. ✨ Waterproof & Long Lasting Quick-drying formula, anti-smudge, resistant to sweat, tears and rain. Stay intact during sports, all-day wear. ✨ Smooth Pigment Rich color payoff, one-shot molding, clean sharp edges without blurring. ✨ Two Fashion Shades 01 Natural Black: Classic bold look for striking eye makeup 02 Light Brown: Soft natural tone for daily nude makeup ✨ Portable Capsule Shape Mini lightweight size, easy to carry in purse for touch-ups anytime.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Adjust the pen to 90° suitable angle", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gently stamp at the outer corner of your eye", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Form a neat winged eyeliner instantly", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Connect with inner lash line to finish eye makeup", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tip", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "For external use only. Avoid contact with eyes. If irritation occurs, rinse thoroughly and stop using. Keep tightly capped to prevent ink drying.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsoh3oex00ioagl5pupua3xq	PRD-00043	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer	the-ordinary-niacinamide-5-face-body-emulsion-brighten-skin-tone-reduce-dark-spots-lightweight-moisturizer	\N	INACTIVE	XH-C11	\N	0.00	1354.00	677.00	\N	cmsbwaevb000he5l532keu9u7	\N	\N	2026-08-11 09:43:48.825	2026-08-14 03:33:07.589	The Ordinary Niacinamide 5% Face & Body Emulsion, Evens Skin Tone Redu	The Ordinary Niacinamide 5% Face and Body Emulsion is a multi-functional brightening lotion. Infused with 5% Niacinamide, it improves dull complexion, targets dark spots, evens skin tone and strengthens skin barrier. Lightweight non-greasy texture works for both face and whole body, friendly to sensitive skin.	https://i.ibb.co/ZpT2p8Cv/c6df9863dd6a.jpg	\N	NEW	[{"id": "937b023c-fbff-42b7-9da8-da3c98ab85f8", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "The Ordinary Niacinamide 5% Face and Body Emulsion", "type": "text", "marks": [{"type": "bold"}]}, {"text": " This multi-purpose emulsion is designed for both facial and full-body skincare, powered by 5% Niacinamide as core active ingredient.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Niacinamide helps reinforce the skin barrier, supports natural skin renewal process. It interferes with factors leading to uneven skin tone and dullness, visibly lightens the appearance of dark spots, smoothes rough skin texture and brings long-lasting luminous glow to your face, neck, chest and limbs.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "The lightweight fluid texture spreads easily and absorbs rapidly without sticky residue. Gentle formula fits most skin types including sensitive skin. You can apply it on face, neck, décolletage, arms, legs and other areas with pigmentation and uneven tone.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ 5% Niacinamide core formula ✅ Fades the look of dark spots & discoloration ✅ Evens skin tone & improves dullness ✅ Strengthens natural skin barrier ✅ Multi-use for face, neck and full body ✅ Lightweight, non-greasy texture ✅ Suitable for sensitive skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "How to Use", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Apply appropriate amount to clean, dry skin on face and body, massage gently until fully absorbed. Use twice daily for better results.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Note:", "type": "text", "marks": [{"type": "bold"}]}, {"text": " A patch test is recommended before first use. If discomfort occurs, stop using immediately.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsogi6sf00fcagl5q2szgip8	PRD-00035	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin	cetaphil-gentle-clear-complexion-acne-cleanser-124ml-2-6-benzoyl-peroxide-treat-breakouts-hydrate-sensitive-skin	\N	INACTIVE	XH-C21	\N	0.00	1149.00	579.00	\N	cmsbvns7g000de5l5xxrw4a1u	\N	\N	2026-08-11 09:27:06.207	2026-08-14 03:33:20.017	Complexion Clearing Acne Cleanser 124ml, 2.6% Benzoyl Peroxide, Gentle	Cetaphil acne face wash with 2.6% benzoyl peroxide targets acne bacteria to clear breakouts. Infused with zinc & licorice root, deep clean without over-drying, 48hr hydration for sensitive blemish-prone skin.	https://i.ibb.co/ZR6r7zdZ/a7807aa53229.png	\N	NEW	[{"id": "048bd55a-b691-4861-90f3-e7b86e8b52cd", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Name", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Cetaphil Gentle Clear Complexion Clearing Acne Cleanser, 4.2 FL OZ (124mL)", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Cetaphil #1 dermatologist-recommended skincare brand brings this balanced acne cleanser exclusively for sensitive breakout-prone skin. Powered by 2.6% benzoyl peroxide to eliminate acne-causing bacteria, paired with soothing zinc and licorice root, it delivers deep pore cleansing while locking in long-lasting hydration. Clinically proven formula banishes pimples without stripping, tightness or irritation.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Core Key Benefits", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ 2.6% Benzoyl Peroxide Target Acne At Source", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Effectively kill bacteria that trigger whiteheads, blackheads and inflammatory breakouts. Starts clearing blemishes from first wash and prevents future acne flare-ups.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Deep Clean Without Over-Drying", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Creamy gentle lather dissolves excess oil, dirt and pore-clogging debris. Unlike harsh exfoliating washes, it avoids over-stripping skin barrier, no tight, flaky post-wash feeling.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ 48-Hour Long-Lasting Hydration", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Hydrating complex maintains skin moisture for up to 48 hours after cleansing, balances oily T-zone and relieves dry sensitive cheeks.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Soothing Botanical Complex for Sensitive Skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Enriched with Zinc & Licorice Root to calm redness, inflammation and irritation from acne treatment. Mild formula suitable for easily irritated breakout skin.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Strengthen Skin Barrier with Prebiotic", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Prebiotic ingredients reinforce natural skin defense, reduce skin sensitivity caused by repeated acne treatments, maintain balanced skin microbiome.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Dermatologist Tested & Gentle Formulation", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Specially designed for sensitive acne-prone skin, non-comedogenic, no harsh irritants, safe for daily morning & night cleansing routine.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Dampen face with lukewarm water.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Squeeze a pea-sized amount of cleanser onto palms, rub to create soft foam.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gently massage all over face for 30 seconds, focus on breakout-prone areas (forehead, chin, nose).", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rinse thoroughly with cool water, pat skin dry softly.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Follow with Cetaphil soothing moisturizer for best acne care results.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Specifications", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: Cetaphil", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Series: Gentle Clear Acne Line", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Item: Complexion Clearing Acne Cleanser", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Volume: 4.2 FL OZ / 124 mL", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Core Active: 2.6% Benzoyl Peroxide", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Soothing Ingredients: Zinc, Licorice Root, Prebiotics, Botanical Extracts", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Skin Type: Sensitive, Acne-Prone, Oily Combination Skin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Function: Anti-acne, Deep Pore Cleansing, Oil Control, Soothe Redness, Long-lasting Hydration", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Reminders", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "For external facial use only, avoid contact with eyes. Rinse thoroughly if product gets into eyes.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "If you have extremely sensitive skin, do a patch test on jawline before full-face use.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Discontinue use if persistent stinging, itchiness or severe redness occurs.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Store in cool dry place, keep away from direct sunlight and high temperature.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsofgbzd00bkagl5xnah2eno	PRD-00026	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types	skin1004-centella-tone-brightening-capsule-ampoule-over-27m-sold-gentle-brightening-serum-for-all-skin-types	\N	INACTIVE	XH-C17	\N	0.00	1969.00	989.00	\N	cmsbvra73000ee5l513q8xzuy	\N	\N	2026-08-11 08:57:40.009	2026-08-14 03:33:49.112	SKIN1004 Centella Brightening Capsule Ampoule, Dark Spot & Uneven Tone	SKIN1004 Madagascar Centella brightening ampoule with 77% centella extract, 4% Niacinamide & Vitamin C. Fades dark spots, soothes sensitive skin, lightweight capsule serum for glowing even tone.	https://i.ibb.co/84TPpbK3/08d95355e1bf.jpg	\N	NEW	[{"id": "c4c6c02a-f0e4-427f-938a-36ff2ddc1a18", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "SKIN1004 Madagascar Centella Tone Brightening Capsule Ampoule 100ml", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "A bestselling Korean brightening serum with over 27 million global sales, combining calming centella asiatica with multi-brightening actives to erase dark spots, fix uneven skin tone and repair sensitive skin barrier.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Core Powerful Formula", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌿 77% Pure Madagascar Centella Asiatica Extract", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Delivers instant soothing relief, repairs damaged skin barrier, reduces redness and irritation for sensitive, acne-prone skin.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Patented MADEWHITE™ Brightening Capsule Beads", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Encapsulated brightening ingredients lock in stability, release potent glow-boosting actives when blended on skin for targeted melanin control.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💡 Triple Brightening Active Complex", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "4% Niacinamide: Blocks melanin transfer, evens dull skin tone", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "2% Tranexamic Acid: Fades post-acne marks & hyperpigmentation", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "3-O-Ethyl Ascorbic Acid (Gentle Vitamin C): Boosts radiance without irritation", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Madecassoside: Calms inflammation while lightening discoloration", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Proven Clinical Efficacy", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Clinical test proves 92.69% reduction of visible hyperpigmentation after consistent 4-week use. Visibly blurs dark spots, acne scars and sun discoloration for translucent glass skin.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Texture & User Experience", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Unique glow-boosting capsule liquid texture, lightweight & watery", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Zero sticky residue, fast-absorbing, layers well under moisturizer/makeup", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gentle minimal formula, no harsh irritants, safe for daily long-term use", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Who This Ampoule Is For", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Skin with uneven, dull tone", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Troubled by dark spots, acne scars & sun pigmentation", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Sensitive skin needing brightening + soothing double care", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Dry skin craving lightweight hydration while brightening", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "After toner, drop 2-3 pipettes of ampoule onto clean dry face", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gently pat and massage until capsule beads melt and fully absorb", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Follow with moisturizer to lock in brightening benefits", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Use morning and night for faster spot-fading results", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Specs", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: SKIN1004", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Full Name: Madagascar Centella Tone Brightening Capsule Ampoule", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Volume: 100ml / 3.38 FL.OZ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Main Functions: Brightening, Dark Spot Correction, Soothing, Barrier Repair, Hydration", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Key Ingredients: Centella Asiatica Extract, Niacinamide, Tranexamic Acid, Vitamin C, Madecassoside", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsof85wb00adagl5n9tvx36l	PRD-00024	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth	dmaster-purple-light-teeth-whitening-enzyme-remove-stains-yellow-teeth	\N	INACTIVE	XH-C04	\N	0.00	668.00	334.00	\N	cmsbxrg27000qe5l5h5hg52wu	\N	\N	2026-08-11 08:51:18.875	2026-08-14 03:33:51.955	Dmaster Purple Light Teeth Whitening Enzyme Toothpaste, Stain Remover,	Fluoride-free purple whitening tooth enzyme gel. Active enzymes break down stains & yellowing, freshen breath, protect enamel. No bleach, no alcohol, gentle daily oral care for brighter teeth.	https://i.ibb.co/QvmF7s0F/29569f6a0d20.jpg	\N	NEW	[{"id": "cc209f29-7f62-4efe-8a3e-f945fa531932", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Dmaster Purple Light Teeth Beautifying Enzyme", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Upgrade 2.0 brightening technology with natural plant lytic enzymes, gently polish teeth and remove surface stains to restore clean, bright smile.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Core Advantages ✅ Active Enzyme Stain Removal Natural papain efficiently breaks down pigment deposits, reduces tooth yellowing, fades tea stains, coffee stains and smoke stains. ✅ Safe 4-Free Formula 0 Fluoride | 0 Bleach | 0 Alcohol | 0 Diethylene Glycol. Mild formula, will not damage tooth enamel. ✅ Purple Light Brightening Technology Balances tooth tone, visually brightens teeth, brings lasting fresh breath. ✅ Comfortable Daily Use Rich and delicate foam, easy to clean, no dry mouth or uncomfortable feeling after brushing.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Key Ingredients", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "▸ Hydrated Silica: Gentle polishing, clean tooth surface stains ▸ Papain: Natural lytic enzyme, dissolve pigment ▸ Phytic Acid Sodium Salt: Antioxidant, maintain bright tooth color", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Squeeze proper amount on toothbrush", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brush teeth thoroughly for 2 minutes", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rinse mouth with clean water Use twice daily for better whitening effect.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Compare With Ordinary Toothpaste", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "❌ Common toothpaste: Thin foam, hard to remove stubborn stains, easy to cause dry mouth ✅ Dmaster Tooth Enzyme: Dense foam, powerful stain decomposition, mild formula, long-lasting fresh breath", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "For external oral use only, do not swallow.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Stop using if gum discomfort occurs.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Effect varies according to personal tooth condition and usage habits.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsogf0wi00ehagl5c8ip2jhh	PRD-00034	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics	mirror-gloss-lipstick-hydrating-non-drying-long-lasting-shiny-lip-balm-moisturizing-nude-lip-makeup-for-daily-women-cosmetics	\N	INACTIVE	XH-C48(2)	\N	0.00	651.95	325.97	\N	cmsbw944g000ge5l547einnjc	\N	\N	2026-08-11 09:24:38.61	2026-08-14 03:36:02.613	Mirror Glow Lipstick Long Lasting Hydrating Glossy Nude Lip Balm	Mirror shine lipstick, hydrating non-drying glossy nude lip balm, long-wear watery lip glow for daily makeup.	https://i.ibb.co/Qjr38bsv/123ad2c525fc.png	\N	NEW	[{"id": "8d128b33-0d73-4a5b-afb0-cd30c4654466", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Mirror Glow Lipstick", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Achieve juicy glass lips all day long! This watery mirror lipstick combines the moisturizing comfort of lip balm with glossy tinted color. No dry, cracked lips, delivering luminous mirror shine for everyday beauty.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💎 Product Highlights", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Mirror Glass Shine Finish", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Creates plump, dewy glass lips, instantly fills lip lines for a tender jelly lip look.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Hydrating Non-Drying Formula", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rich moisturizing ingredients nourish lips, comfortable for all-day wear, no tight feeling.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Long Lasting Tinted Color", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lightweight texture, adheres smoothly to lips, maintains glossy color for hours.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ 2 Versatile Nude Shades", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Suitable for daily, dating, casual makeup, easy to match different skin tones.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Milk Orange", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Clear Peach", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Premium Gradient Packaging", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Luxury gradient bronze hexagonal tube with decorative silver ring, exquisite texture, easy to carry.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📝 How to Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Apply directly on clean lips", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Layer more product for richer gloss and color", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Can be used alone or layered over lip liner", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💡 Warm Tips", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Exfoliate dry lip skin in advance for smoother makeup effect.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsohj7pj00klagl5lc3rm20j	PRD-00047	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml	herbal-hair-growth-liquid-nourish-follicles-boost-beard-chest-armpit-hairline-growth-thickening-hair-serum-50ml	\N	INACTIVE	XH-C25	\N	0.00	859.00	429.00	\N	cmsbwi4iw000ie5l530ku4mjg	\N	\N	2026-08-11 09:55:53.671	2026-08-14 03:39:22.197	Herbal Hair Growth Liquid for Chest Hairline Body Hair Growth Serum	Multi-use herbal hair growth essence nourishes follicles, boost thick beard, chest, armpit & scalp hair, 50ml for men.	https://i.ibb.co/tTC6yzNs/09d269027b38.png	\N	NEW	[{"id": "9b029adc-2d6d-4815-82ff-575a837677b7", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Introduction", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "East Moon Herbal Hair Growth Liquid is an all-in-one hair nourishing serum specially designed for men. Powered by natural herbal extracts, it activates dormant hair follicles, delivers abundant nutrients to hair roots, accelerates hair regrowth and thickens sparse hair. It works perfectly on beards, chest hair, armpit hair, belly hair and thinning hairline, helping you build full, dense masculine body and facial hair easily. The lightweight essence absorbs quickly without sticky residue, bringing long-lasting nourishment for healthier, stronger hair.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Four Core Working Principles", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rapid Deep Penetration", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Ultra-fine essence molecules penetrate skin swiftly, delivering nutrients straight to hair follicles without surface residue.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Revitalize Dormant Follicles", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Awaken inactive hair follicles, replenish root vitality to stop sparse, patchy hair.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Continuous Nutrient Supply", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Feed follicle mother cells constantly, stimulate cell division to speed up hair growth cycle.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Thicken & Strengthen Hair Strands", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Balance androgen levels, boost fast, dense hair growth, make hair thicker, darker and fuller.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Multiple Applicable Areas for Men", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Beard: Fill patchy beard gaps, grow thick, neat masculine beard", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Armpit Hair: Boost dense armpit hair for domineering male charm", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Chest & Belly Hair: Grow full, attractive torso body hair", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Hairline: Restore receding hairline, thicken sparse scalp hair", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Key Benefits", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Multi-scene use: Facial beard, chest, armpit, scalp hairline all applicable", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Natural herbal formula, mild & non-irritating for daily long-term use", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Fast-absorb watery texture, no greasy stickiness on skin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Wake up weak follicles, turn thin patchy hair into thick full hair", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Reinforce hair roots, reduce hair shedding and breakage", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Compact 50ml portable bottle, easy to carry for home & travel use", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How to Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Clean and fully dry the target hair growth area (beard, chest, scalp etc.)", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Apply proper amount of growth liquid evenly onto skin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Massage gently in circular motions for 2–3 minutes to boost absorption", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Use twice daily (morning & night) for better visible effects", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Specifications", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: EAST MOON", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Name: Herbal Hair Growth Liquid", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Net Volume: 50ml / 1.69 FL.OZ", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Bottle Size: 11.5cm × 3.2cm", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Outer Box Size: 11.7cm × 3.5cm × 3.5cm", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Main Function: Nourish hair follicles, accelerate hair growth, thicken sparse hair", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Applicable Parts: Beard, armpit hair, chest hair, receding hairline", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Consistent daily use for 4–8 weeks to see obvious hair growth results.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Avoid contact with eyes; rinse thoroughly with clean water once touched accidentally.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Store in cool, dry place away from direct sunlight and high temperature.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Stop using if redness or itchiness occurs for sensitive skin.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsofnqwj00ccagl5dcqregd9	PRD-00028	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation	mini-usb-rechargeable-electric-massager-10-vibration-modes-quiet-body-safe-material-for-face-body-relaxation	\N	ACTIVE	XH-S02	\N	0.00	799.00	399.00	\N	cmsbxls65000pe5l5qug5rsua	\N	\N	2026-08-11 09:03:25.939	2026-09-04 04:18:00.745	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Water	Compact quiet mini electric massager with 10 vibration modes. USB rechargeable & waterproof, made of body-safe material. Portable design for face, neck and full body relaxation for travel & daily use.	https://i.ibb.co/8DF7JFRM/da05f39b020c.jpg	\N	NEW	[{"id": "759f56fb-5f84-4c44-9888-c793ffe8c94c", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "Mini USB Rechargeable Electric Massager", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Compact, portable and powerful, this mini electric massager is designed for full-body relaxation anytime and anywhere. Crafted with skin-friendly, smooth body-safe material, it delivers gentle yet intense stimulation to ease tension on your face, neck, shoulders, limbs and other sore areas.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "10 Adjustable Vibration Modes", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Features 10 distinct vibration patterns from steady gentle pulsations to powerful rhythmic waves. Easily switch modes with one simple power button to customize your preferred relaxation experience.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "USB Rechargeable Design", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Comes with a DC USB charging cable. You can conveniently charge the massager via laptop, power bank, wall adapter or car charger. Fully charged, it supports up to 90 minutes of continuous use, no need for frequent battery replacement, eco-friendly for long-term use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Ultra Quiet & Discreet", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Advanced silent motor minimizes operating noise, allowing private use without unwanted disturbance. The slim 3-inch mini size fits easily into pockets, handbags and travel kits, ideal for home, travel, office use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Waterproof Easy to Clean", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Waterproof construction enables convenient rinsing after use. The seamless smooth surface is simple to wipe clean for hygienic daily care.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Ergonomic Compact Shape", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Sleek rounded bullet shape fits comfortably in your hand, lightweight for effortless holding during massage. Smooth rounded tip brings comfortable contact with your skin.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Package Includes:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 x Mini Electric Massager", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 x USB Charging Cable", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Warm Tip: Clean and dry the device before and after each use. Use water-based lubricant for better comfort if needed.", "type": "text"}]}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsogysxp00hsagl5bxhz8oe0	PRD-00040	Pre-Glued Cluster Eyelashes No Glue Needed C Curl Wispy Natural Individual Lashes Reusable Self Adhesive False Eyelashes For Makeup	pre-glued-cluster-eyelashes-no-glue-needed-c-curl-wispy-natural-individual-lashes-reusable-self-adhesive-false-eyelashes-for-makeup	\N	ACTIVE	XH-C49(2)	\N	0.00	1276.73	638.36	\N	cmsbviuvp000be5l5qsuzeuup	\N	\N	2026-08-11 09:40:01.405	2026-08-12 08:05:45.882	Self Adhesive Cluster Lashes No Glue DIY Eyelash Extensions	Pre-glued self-adhesive cluster lashes, Bird Chirp & Rabbit Sweet styles, no glue needed, natural wispy look, beginner friendly DIY individual eyelashes.	https://i.ibb.co/M56tpL2S/c29a8de2ce21.png	\N	NEW	[{"id": "b68a8c6f-8dd3-44e9-abc1-0ce433c5756f", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Self-Adhesive Cluster Lashes | Cute Animal Series", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "No extra lash glue required! These pre-glued individual cluster lashes are ready to wear, perfect for beginners who want quick, gorgeous eye makeup. Two popular styles available: Bird Chirp Style & Rabbit Sweet Style.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Product Features", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Pre-Glued Self-Adhesive Design", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "No lash glue needed. Peel and stick directly, super easy to apply and remove.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ 2 Popular Styles", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "▪ Bird Chirp Style | C Curl, 10–12mm", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Clear layered idol eye effect, distinct lash strands, pure & sweet look, great for photos.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "▪ Rabbit Sweet Style | 9-Curl, 9–12mm", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Soft natural wispy texture, creates gentle sweet daily makeup.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Gradient Length Layout", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Different lengths for inner corner, middle and outer corner, lift eyes visually and make eyes bigger & brighter.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Lightweight & Comfortable", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Soft fiber material, lightweight on eyelids, no heavy burden for all-day wear.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Reusable & Portable", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Comes in a storage case, convenient to carry for travel, dating and daily makeup.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📌 Specifications", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Style Option: Bird Chirp / Rabbit Sweet", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Curl: C Curl (Bird Chirp); 9-Curl (Rabbit Sweet)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Length: 9–12mm", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Quantity: 6 Rows / 36 Clusters per box", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📖 How To Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Pick up lash clusters with tweezers", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Align and stick above your natural lash line", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Adjust position gently, finish eye makeup quickly", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💡 Tips", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Clean the adhesive strip after removal to extend service life.", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsofmugw00byagl5hvqnyrco	PRD-00027	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara	steel-tube-spiral-brush-mascara-waterproof-smudge-proof-long-lasting-lash-lift-eyelash-makeup-lengthening-curling-mascara	\N	ACTIVE	XH-C47(2)	\N	0.00	502.54	251.27	\N	cmsbviuvp000be5l5qsuzeuup	\N	\N	2026-08-11 09:02:43.904	2026-08-12 08:16:53.038	Spiral Mascara Waterproof Lengthening Curling Mascara Lash Makeup	Steel tube spiral brush mascara, waterproof smudge-proof, long lasting curl, lengthen & volumize lashes, black & brown shades, friendly for makeup beginners.	https://i.ibb.co/tpX4Cncd/adca306c0c9f.png	\N	NEW	[{"id": "6d04865d-7b9b-4742-affa-467578a9485f", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Waterproof Lash Lift Mascara", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Create natural sunflower curled lashes effortlessly! Equipped with slim spiral steel tube brush, it separates every single lash, bringing lengthened, lifted and dense eyelashes without clumping. All-day waterproof & sweat-resistant formula keeps your eye makeup flawless.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Core Features", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Slim Spiral Steel Tube Brush", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Precisely coat upper & lower lashes, grab sparse tiny lashes, no clumps, no spider lashes.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Long-Lasting Curling Power", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lock eyelash curl all day, prevent lashes from sagging and turning flat.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Waterproof, Sweat & Smudge Proof", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Resist tear, sweat and rain, no panda eyes, suitable for daily, sports and outdoor wear.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Two Color Options", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Classic Black: Sharp, distinct manga lashes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Soft Brown: Natural gentle look, perfect for light makeup", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Beginner Friendly", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Easy to control, evenly apply without mess, ideal for makeup newbies.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Compact Silver Metal Tube", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Exquisite portable design, easy to carry in makeup bags.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📖 How To Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Curl lashes with an eyelash curler first", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Sweep mascara from root to tip of lashes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Apply a second coat for thicker & longer effect", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Quickly brush lower lashes with the fine brush", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💡 Tips", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Clean the brush slightly before use to avoid excess paste causing clumpy lashes.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsn6f27a000gagl5b0yvsz4t	PRD-00012	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	cordless-hair-straightener-brush-type-c-rechargeable-portable-anti-scald-anti-static-wireless-hair-styling-comb-for-travel-home	\N	ACTIVE	XH-E09	\N	0.00	3388.00	1999.00	\N	cmsn60rfg000fagl5852eo4hd	\N	\N	2026-08-10 11:56:57.958	2026-08-13 01:46:50.23	Mini Hair Straightener Comb Portable for Women	Product Description\nGet salon‑sleek, shiny hair anytime, anywhere with our Portable Cordless Hair Straightening Brush. This 2‑in‑1 styling comb combines smoothing straightening and detangling functions, letting you achieve silky smooth hair in one simple stroke. No cords, no hassle, perfect for home, travel, office and	https://i.ibb.co/Gf5P8KM1/e43c527e593c.png	\N	NEW	[{"id": "925350c8-c4ae-4548-a378-570535fa8422", "type": "richText", "content": {"type": "doc", "content": [{"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "True Cord‑Free Styling", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Built‑in large‑capacity battery with Type‑C charging interface, no power cord restriction. Style your hair freely at home, on travel or in office.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Dual‑layer Anti‑scald Safe Comb Teeth", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Inner layer protects your scalp from high‑temperature scalding; outer anti‑tangle bristles glide through tangled hair smoothly without pulling.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Anti‑Static Smooth Hair Effect", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Hair‑friendly heating design reduces static and frizzy flyaways, get silky sleek shiny hair with just one stroke.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Ultra‑portable Hand‑held Size", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Compact 20×4.5cm lightweight body, easy to slip into your purse or travel bag for quick hairstyle touch‑ups anywhere.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Simple One‑button Operation", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": User‑friendly control for fast heating and easy operation. Comes in Pink and Lavender, ideal personal styling tool & nice gift choice.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsevbgyr003te5l5k1blh6hk	PRD-00008	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls	wireless-gaming-earbuds-with-led-digital-power-display	### Wireless Gaming Earbuds with LED Digital Display\n\n\nThese wireless earbuds are designed for mobile gamers, music lovers, and anyone who enjoys clear audio during daily use. They come with an LED digital display charging case that shows the battery level, making it easier to check power status before gaming, traveling, or commuting.\n\n\n---\n\n\n### Key Features\n\n\n- **Low Latency Gaming Mode**\n\nThe earbuds support a low latency gaming mode, which can help reduce audio delay during mobile gaming. This may make game sound effects, background music, and voice chat feel more synchronized with the on-screen action.\n\n- **Dual Mode for Gaming and Music**\n\nThese earbuds can switch between gaming mode and music mode. You can use them for mobile games, music listening, video watching, and hands-free calls.\n\n- **LED Digital Power Display**\n\nThe charging case features an LED digital display that shows the remaining battery level. This helps you know when to charge the earbuds and the case.\n\n- **HIFI Stereo Sound**\n\nThe earbuds are designed to deliver stereo sound quality for music, videos, and games. They can be suitable for enjoying songs, watching movies, and hearing in-game audio details.\n\n- **Built-In Microphone**\n\nA built-in microphone allows you to take hands-free calls and use voice chat during online gaming. This is useful for daily communication and team gaming sessions.\n\n- **Large Capacity Charging Case**\n\nThe compact charging case provides extra power for the earbuds. It can help extend usage time during long gaming sessions, travel, and daily commutes.\n\n- **Comfortable In-Ear Design**\n\nThe in-ear design may provide a comfortable fit during long gaming sessions, music listening, and travel.\n\n- **Portable Design**\n\nThe earbuds and charging case are small and easy to carry. You can keep them in your pocket, bag, or purse for everyday use.\n\n\n---\n\n\n### Specifications\n\n\n- **Product Type:** Wireless Gaming Earbuds\n\n- **Connectivity:** Bluetooth 5.0 / 5.1\n\n- **Feature:** Low Latency Mode, Dual Mode, LED Digital Display\n\n- **Sound Quality:** HIFI Stereo Sound\n\n- **Microphone:** Built-In Mic for Hands-Free Calls\n\n- **Display:** LED Digital Power Display\n\n- **Wearing Type:** In-Ear\n\n- **Charging Case:** Included\n\n- **USB Charging Cable:** Included\n\n- **User Manual:** Included\n\n- **Color:** Black with Gold Accents\n\n- **Application:** Gaming, Music, Video, Calls, Travel, Commute\n\n\n---\n\n\n### Package Contents\n\n\n- 1 Pair Wireless Earbuds\n\n- 1 Charging Case\n\n- 1 USB Charging Cable\n\n- 1 User Manual	ACTIVE	【YD03】XH-E13	\N	0.00	1599.00	959.00	\N	cmsbv6e000009e5l5j2rdg7gx	\N	\N	2026-08-04 16:24:05.283	2026-08-13 08:03:31.458	Wireless Gaming Earbuds, Low Latency Bluetooth 5.3 TWS Headphones LED	Low latency gaming wireless earbuds with Bluetooth 5.3, LED power display, HiFi stereo sound, touch control, master-slave switching, long battery life for game, music and video.	https://i.ibb.co/TBry8k0r/a73f6a328195.png	\N	NEW	[{"id": "5b2ece1d-9d53-4c9f-819a-c5c9e385e877", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "Wireless Gaming TWS Earbuds", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Immerse yourself in games, music and movies with these professional low latency wireless earbuds. Built with Bluetooth 5.3 chip for stable, fast connection.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🎮 Low Latency Gaming Mode Switch between Game / Music / Video modes via touch control. Synchronized audio and video, no delay for competitive gaming.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔋 LED Digital Power Display Charging case features LED digital screen to show power of left earbud, right earbud and charging box clearly.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🎧 HiFi Stereo Graphene Diaphragm Graphene speaker delivers rich stereo sound, restore abundant audio details for music enjoyment.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📱 Bluetooth 5.3 Stable Connection Upgraded Bluetooth 5.3 chip ensures fast pairing, anti-interference and smooth transmission.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "👆 Smart Touch Control Support play/pause, volume adjustment, switch songs, answer/reject calls and voice assistant. Master-slave switching, single ear or binaural use freely.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Cool Breathing Light Stylish ring light on each earbud, trendy gaming appearance.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔋 Long Battery Life Large capacity charging case provides long endurance. The charging case can support emergency charging for your mobile phone.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Key Features", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Low latency gaming wireless earbuds", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Bluetooth 5.3 TWS connection", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "LED digital power display", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Graphene diaphragm HiFi stereo sound", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Touch sensitive control", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "3 modes: Game / Music / Video", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Master-slave automatic switching", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Cool decorative breathing light", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Support emergency phone charging", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Comfortable in-ear design", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "✅ Suitable for gaming, daily music, watching videos, calls, outdoor travel.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoefl0a007uagl52wuho36v	PRD-00014	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy	mini-portable-waterproof-bullet-massager-10-speed-vibration-modes-soft-silicone-mini-pocket-vibrator-discreet-personal-relax-toy	\N	ACTIVE	XH-S03(3)	\N	0.00	799.00	399.00	\N	cmsbx02j6000je5l50vazxxb2	\N	\N	2026-08-11 08:29:05.434	2026-08-13 08:14:43.908	Portable Bullet Vibrator, 10 Vibration Modes Waterproof Silicone Perso	Compact waterproof bullet vibrator with 10 adjustable vibration modes. Smooth silicone body, mini discreet size, portable for travel. Multiple colors available, one-button simple operation.	https://i.ibb.co/zV7jrdMW/175af8bcbbf5.png	\N	NEW	[{"id": "0afc753c-1225-4003-961a-436dd0dc19ed", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Product Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This sleek bullet vibrator is designed for comfortable, private personal use. Made with smooth matte silicone surface, the compact body delivers stable and powerful vibration. Featuring 10 adjustable vibration modes, you can easily switch between different rhythms to match your preference. Fully waterproof construction allows convenient cleaning and flexible usage scenarios. Compact lightweight size makes it easy to carry for travel. Powered by one AAA battery (battery not included). Multiple optional colors are available to meet your personalized selection.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Main Features", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ 10 Variable Vibration Modes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Short press the power button to switch vibration patterns, long press to power off. Multiple vibration rhythms for diverse experience.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Smooth Silicone Surface", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Soft matte silicone material, skin-friendly, comfortable to touch and easy to wipe clean.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Full Waterproof Design", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Allows for wet use and effortless washing after each use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Portable Mini Size", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 90mm compact body, discreet appearance, easy to store and carry for trips.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Simple One-Button Operation", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Intuitive control design, simple to operate for daily private use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Rich Color Options", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Available in black, red, pink, purple, blue, white, green, coral and more colors.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Specifications", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Material: Silicone", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Length: 90 mm", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Diameter: 15 mm", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Vibration Modes: 10 modes", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Power Supply: 1 × AAA battery (battery not included)", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Waterproof: Yes", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Operation: One-button control", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Clean thoroughly before and after every use.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Use compatible lubricant for better comfort.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Remove the battery if the item will not be used for a long time.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Keep in a dry, clean place away from high temperature.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoenfty008kagl5xqh6iky0	PRD-00016	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection	crystal-sunscreen-spray-spf50-pa-90ml-portable-uv-protection	\N	ACTIVE	XH-C01	\N	0.00	1318.00	659.00	\N	cmsbx4ci7000le5l5oe9dim0u	\N	\N	2026-08-11 08:35:11.974	2026-08-13 08:19:39.059	SPF50+ PA++++ Crystal Sunscreen Spray 90ml, Portable Fine Mist, Transp	High protection SPF50+ PA++++ sunscreen spray. Ultra-fine invisible mist, transparent film, no white residue, won’t smudge makeup. 90ml portable travel size, suitable for face & full body, easy reapplication outdoors.	https://i.ibb.co/yFTzxHd3/6f1fc4acabc8.jpg	\N	NEW	[{"id": "9cb5e575-a37d-4c7b-a6f1-68311fb41a03", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Crystal Sunscreen Spray SPF50+ PA++++ 90ml", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Portable high-power UV defense for daily outdoor, beach, travel and sports.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "☀️ Powerful UV Shield SPF50+ PA++++ broad spectrum protection. Blocks UVA & UVB, effectively prevent sunburn, tanning and dark spots.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💨 Ultra-Fine Smoke-like Mist Lightweight invisible spray, evenly distributed on skin. Transparent formula leaves zero white cast, does not cake or smudge makeup. Can be sprayed directly over makeup for quick reapplication.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Quick Film-forming 3-second fast film formation, refreshing cool sensation, non-sticky, comfortable all-day wear.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🎒 Travel-Friendly 90ml Design Compact bottle with carry ring for easy hanging. 90ml capacity meets aviation standard, allowed on flights and high-speed trains. Transparent bottle lets you check remaining liquid conveniently.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔄 Easy to Use No need to shake before spraying. 360° circular nozzle achieves all-angle coverage without blind spots. Ideal for face, neck, arms, legs and whole body.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📖 How To Use Hold the bottle 15–20 cm away from skin, spray evenly on exposed areas. Reapply every 2–3 hours during prolonged outdoor activities.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📌 Suitable For All skin types; students, office workers, outdoor lovers, travelers, beach and sports activities.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "⚠️ Warm Reminder", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "For external use only. Avoid contact with eyes.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Stop using if discomfort, redness or irritation occurs.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoi2tnm00mbagl5t9oaaxj2	PRD-00050	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard	rfid-blocking-passport-holder-waterproof-oxford-travel-document-organizer-multi-slots-wallet-with-neck-lanyard	\N	ACTIVE	XH-B01(4)	\N	0.00	3185.00	1599.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-11 10:11:08.578	2026-08-13 08:38:21.764	RFID Blocking Travel Passport  Crossbody Bag	Waterproof RFID blocking travel passport holder with multi compartments. Detachable shoulder strap, stores passport, cards, tickets & cellphone. Anti-skimming document bag ideal for international travel.	https://i.ibb.co/ccSTpJ9Q/ba85ece2f7ab.jpg	\N	NEW	[{"id": "a83e3ac6-d527-439c-beea-3e6adde7712f", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "RFID Blocking Travel Passport Wallet, Waterproof Document Organizer Bag", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This multifunctional travel passport bag keeps all your travel essentials neatly organized and safely protected. Designed for international travelers, it offers ample storage space and reliable anti-theft protection for your important documents.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Advanced RFID Blocking Protection", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Built-in professional RFID shielding lining prevents unauthorized scanning and digital theft of your credit cards, ID cards and passport information. Effectively guard against electronic skimming during trips.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Large-Capacity Multi-Compartment Design", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Reasonable internal layout with multiple card slots, passport pockets, ticket slots, mesh coin pouch and cash storage area. It can hold passports, ID cards, boarding passes, credit cards, cash, coins and even mobile phones. The front external zipper pocket allows quick access to frequently used items.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Waterproof & Durable Oxford Fabric", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Made of premium cationic oxford cloth, lightweight, wear-resistant, scratch-proof and water-repellent. Lightweight construction reduces travel burden and keeps contents safe from light splashes. Built-in shock-absorbing sponge offers extra protection.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Flexible Carrying Ways", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Equipped with a detachable adjustable shoulder strap and a hand wrist strap. You can use it as a crossbody shoulder bag, hand clutch or store it inside your luggage, meeting different travel scenarios.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Fine Craftsmanship", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Smooth durable double zippers, tidy stitching and reliable metal hardware. Compact size: 23cm × 13cm × 3cm, portable to carry in backpacks or handbags.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Specifications", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Size: 23cm × 13cm × 3cm", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Material: Waterproof Cationic Oxford Fabric + RFID Shielding Layer + Shock Sponge", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Available Colors: Black, Navy Blue", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Package Includes", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 x RFID Travel Passport Organizer Bag", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 x Detachable Shoulder Strap", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 x Wrist Strap", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoim5f100oeagl5y41l1bqw	PRD-00054	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer	double-layer-transparent-pvc-cosmetic-bag-waterproof-pu-large-capacity-portable-travel-makeup-storage-organizer	\N	ACTIVE	XH-B01(4)	\N	0.00	5018.00	2499.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-11 10:26:10.285	2026-08-13 08:43:19.228	Double Layer Clear PU Makeup Bag Transparent Travel Cosmetic Organizer	Waterproof PU leather double layer cosmetic bag with transparent window. Large capacity travel makeup case with handle for skincare and makeup storage.	https://i.ibb.co/8gMx1KMF/601aceed5c2c.jpg	\N	NEW	[{"id": "ecdab563-a3be-4261-aa1f-dc78863648ed", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "1. Product Detailed Description", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Double Layer Clear Makeup Bag, PU Leather Transparent Travel Cosmetic Organizer", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " This stylish double-layer cosmetic bag combines elegant PU leather and transparent PVC window design, ideal for daily makeup storage and travel use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Transparent Visible Window Design", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Large clear PVC window allows you to quickly find cosmetics without opening the bag, saving your makeup preparation time. Perfect for airport security checks during travel.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Double-Layer Large Capacity", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Dual independent zipper compartments separate makeup brushes, skincare bottles, creams, lipsticks and other beauty supplies. Keep items classified and avoid extrusion and leakage.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Premium PU Leather Material", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Adopted cross grain PU leather, wear-resistant, waterproof and easy to wipe clean. Delicate golden metal zippers with leather pull tabs ensure smooth long-term use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Built-in Hand Strap", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Equipped with sturdy top handle for convenient handheld carrying. It can be easily placed inside handbags, suitcases and backpacks.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Multiple Fashion Colors", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Available in Rice White, Pink, Khaki and Black to meet different aesthetic preferences for women.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Product Specifications", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Material: PU Leather + Clear PVC", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Size: 23.5cm × 16cm × 6.5cm", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Colors: Rice White, Pink, Khaki, Black", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Package Contains", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 × Double Layer Clear Cosmetic Bag", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsodxbat007lagl5twvuqhem	PRD-00013	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel	water-based-intimate-lubricant-plant-derived-long-lasting-smooth-hydrating-personal-lubricating-gel	\N	ACTIVE	XH-A2 FX	\N	0.00	1190.00	599.00	\N	cmsbx02j6000je5l50vazxxb2	\N	\N	2026-08-11 08:14:53.045	2026-08-13 01:47:03.861	Satingel Water-Based Lubricant Plant Derived Long Lasting Intimate Gel	Satingel water-based intimate lubricating gel, plant-derived formula, smooth long-lasting texture, easy to clean, gentle for skin, ideal for daily intimate use.	https://i.ibb.co/TBNxmgfk/c1bbbe1f0e41.png	\N	NEW	[{"id": "54da8b11-8b74-4fdd-a1c2-4bce337052d8", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Satingel water-based intimate gel adopts plant-derived mild formula. Featuring silky smooth texture with excellent ductility, long-lasting lubrication effect. Water-soluble formula can be easily washed away with water without sticky residue. Gentle pH-friendly formula brings comfortable experience for intimate daily use.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Main Features", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Water-Based & Plant-Derived Formula Gentle ingredients, mild and skin-friendly, less irritation to sensitive skin. ✅ Long-Lasting Smooth Lubrication Excellent stretch texture, maintains continuous lubrication, not easy to dry quickly. ✅ Easy to Clean, No Sticky Residue Completely water-soluble, simply rinse with clean water, no troublesome residue left. ✅ Wide Compatibility Compatible with most silicone toys and latex products. ✅ Large Capacity 200ml Practical portable bottle design, convenient for daily storage and use.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "For external use only. Stop using if discomfort or irritation occurs.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Keep away from eyes. Please store in cool and dry place, avoid direct sunlight.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Keep out of reach of children.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Package Contains", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "1 Bottle Satingel Intimate Lubricant Gel (200ml)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsokc86e00rhagl523q7h9fc	PRD-00059	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	women-genuine-cow-leather-tote-bag-large-capacity-vintage-top-handle-commuter-shoulder-handbag	\N	INACTIVE	XH-B03(6)	\N	0.00	12257.00	5999.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-11 11:14:26.534	2026-08-14 03:34:47.099	Large Capacity Pebbled Leather Tote Bag Women Minimalist Top Handle Sh	Minimalist ladies leather tote handbag with snap closure, big space, neutral solid colors, fashionable shoulder purse for work and daily commute.	https://i.ibb.co/v4Gvz0x1/71699bed94cd.jpg	\N	NEW	[{"id": "2200acdc-ac87-4fd9-be4c-366761bb26b6", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "1. Product Detailed Description", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Women Minimalist Leather Tote Bag, Large Capacity Top Handle Shoulder Handbag", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " This minimalist tote bag features a clean, elegant silhouette, crafted from premium pebbled leather with soft touch and great durability. Classic snap closure design keeps your belongings secure, paired with comfortable double top handles, ideal for daily work and casual outings.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Premium Pebbled Leather", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Soft grain leather material, wear-resistant, anti-scratch and easy to clean, presenting understated high-end texture.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Large Capacity Design", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Roomy main compartment can fit laptops, notebooks, wallets, cosmetics, umbrellas and other daily essentials, perfect for office commuting.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Simple Snap Button Closure", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Convenient metal snap fastener for quick access while preventing items from slipping out.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Comfortable Dual Top Handles", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Sturdy integrated handles support long-time handheld carry without discomfort.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Versatile Solid Color Options", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Multiple neutral classic colors available, effortlessly matching formal outfits, casual wear and dresses.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Suitable Scenarios: Office commute, shopping, weekend trip, school and daily use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Material: High-quality pebbled PU/Leather", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Style: Minimalist everyday tote bag", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Package Includes: 1 × Women Leather Tote Bag", "type": "text"}]}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsoi807r00nfagl585dzaq3v	PRD-00051	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula	usa-imported-panoxyl-10-benzoyl-peroxide-bar-soap-deep-clean-acne-wash-for-facial-body-breakouts-new-upgraded-formula	\N	INACTIVE	XH-C15	\N	0.00	1458.00	729.00	\N	cmsbvns7g000de5l5xxrw4a1u	\N	\N	2026-08-11 10:15:10.359	2026-08-14 03:32:50.236	PanOxyl 10% Benzoyl Peroxide Acne Treatment Bar Face & Body Soap 113g	USA dermatologist-recommended acne bar with max-strength 10% benzoyl peroxide, clears facial & body acne, oil control, fragrance-free 113g.	https://i.ibb.co/Ngq9P0qf/644f2f6287b9.jpg	\N	NEW	[{"id": "eeb0bd28-4eec-422b-8a8a-ae89d80a7565", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "PanOxyl Acne Treatment Cleansing Bar is the No.1 dermatologist-recommended acne cleansing bar imported from the USA, formulated with maximum-strength 10% Benzoyl Peroxide without a prescription. This dual-use cleansing bar works for both face and body, targeting facial pimples, chest acne, back breakouts and body blemishes at the source. It creates rich, gentle foam to deeply unclog pores, cut excess sebum, eliminate active acne lesions and stop future breakouts from forming. The upgraded formula skips harsh soap bases, artificial dyes and added fragrances, making it gentle for daily use on oily, acne-prone skin. Each bar weighs 4oz (113g) for long-lasting full-body acne care.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Core Active Ingredient: 10% Benzoyl Peroxide (Max Over-the-Counter Strength)", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Kills acne-causing bacteria deep within pores", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Dissolves pore-clogging oil, dirt and dead skin buildup", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Dries and clears existing whiteheads, blackheads, cystic acne and body bumps", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Blocks new breakout formation for long-term clear skin results", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Key Product Benefits", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Dual-Use for Face & Body: Treat facial acne, bacne, chest breakouts, shoulder blemishes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Maximum OTC Strength: 10% Benzoyl Peroxide, no prescription required", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Dermatologist Trusted: Top recommended acne cleansing bar by skin experts", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Deep Pore Cleansing: Melts excess oil, unclogs congested pores to reduce large pore appearance", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Prevents Recurring Breakouts: Stops new pimples from forming with consistent use", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Zero Irritant Additives: Soap-free, dye-free, no synthetic added fragrance", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Rich Gentle Foam: Lathers easily without harsh stripping or tight dryness", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ USA Imported Premium Skincare: New upgraded packaging design, 113g full-size bar", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Simple Usage Instructions", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Wet your face or body thoroughly with warm water.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rub the cleansing bar between your palms to build creamy foam.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gently massage the foam onto acne-prone areas (face, back, chest, shoulders) for 30–60 seconds.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rinse completely with warm water, pat skin dry.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Use once or twice daily for optimal acne-clearing results.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Specifications", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: PanOxyl", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Product Name: Acne Treatment Cleansing Bar", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Active Ingredient: 10% Benzoyl Peroxide", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Net Weight: 4 oz / 113 g", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Application: Face & full body acne care", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Formula Features: Soap-free, dye-free, fragrance-free", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Origin: Imported from the United States", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Target Skin Concerns: Oily skin, blackheads, whiteheads, cystic acne, bacne, chest breakouts, clogged pores", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Important Safety Tips", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Benzoyl peroxide may cause temporary dryness or mild peeling; pair with lightweight moisturizer to soothe skin.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Avoid direct contact with eyes, lips and sensitive mucous membranes.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Do not apply to broken, sunburned, irritated or wounded skin.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This product may bleach fabric; rinse all foam thoroughly off towels and clothing.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Discontinue use and consult a dermatologist if severe redness, itching or swelling occurs.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Store in a cool, dry place away from direct sunlight.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsevlqvf005je5l5ixjvc5kh	PRD-00010	N35 Gaming Wireless Earbuds Bluetooth 5.3 Low Delay LED Display Dual Mode Stereo In-Ear Earphones with Mic	n35-gaming-wireless-earbuds-ultra-low-delay-bluetooth-5-3-earphones	### N35 Gaming Wireless Earbuds\n\n\nThe N35 Gaming Wireless Earbuds are designed for users who love both gaming and music. With an ultra-low-latency gaming mode, clear stereo sound, and a built-in microphone for calls, these earbuds can be a practical choice for mobile gamers, music lovers, and daily commuters.\n\n\n---\n\n\n### Key Features\n\n\n- **Ultra Low Delay Gaming Mode**\n\nThe N35 earbuds are built with a gaming-focused low-latency chip, which may help reduce audio delay during mobile gaming. This can make in-game sound effects, background music, and voice chat feel more synchronized with the on-screen action.\n\n- **Dual Mode for Gaming and Music**\n\nThese earbuds support both gaming mode and music mode. You can switch between different uses depending on whether you are playing games, listening to music, watching videos, or taking calls.\n\n- **LED Digital Power Display**\n\nThe charging case comes with an LED digital power display that shows the remaining battery level. This makes it easier to know when to charge the earbuds and the case.\n\n- **Bluetooth 5.3 Connection**\n\nWith Bluetooth 5.3 technology, the N35 earbuds may offer a stable wireless connection between the earbuds and your smartphone, tablet, or other compatible devices.\n\n- **Stereo Sound Quality**\n\nThe earbuds are designed to deliver stereo sound for music, videos, and games. They can be suitable for listening to songs, watching movies, and enjoying game audio.\n\n- **Built-In Microphone**\n\nA built-in microphone allows you to take hands-free calls and use voice chat during online gaming. This is useful for daily communication and team gaming sessions.\n\n- **Comfortable In-Ear Design**\n\nThe compact in-ear design may provide a comfortable fit during long gaming sessions, music listening, travel, and daily use.\n\n- **Portable Charging Case**\n\nThe hexagonal charging case is compact and easy to carry. It not only protects the earbuds but also helps charge them when you are on the go.\n\n\n---\n\n\n### Specifications\n\n\n- **Product Name:** N35 Gaming Wireless Earbuds\n\n- **Connectivity:** Bluetooth 5.3\n\n- **Feature:** Ultra Low Delay, Dual Mode, LED Digital Display\n\n- **Use For:** Mobile Gaming, Music, Video, Calls\n\n- **Microphone:** Built-In Mic for Hands-Free Calls\n\n- **Display:** LED Digital Power Display\n\n- **Earbud Type:** In-Ear\n\n- **Charging Case:** Included\n\n- **USB Charging Cable:** Included\n\n- **User Manual:** Included\n\n- **Color:** Black with Green Gaming Style Accents\n\n- **Application:** Gaming, Music, Daily Commute, Office, Travel\n\n\n---\n\n\n### Package Contents\n\n\n- 1 Pair N35 Wireless Earbuds\n\n- 1 Charging Case\n\n- 1 USB Charging Cable\n\n- 1 User Manual\n\n- 1 Retail Packaging Box	ACTIVE	N35	\N	0.00	1510.00	906.00	\N	cmsbv6e000009e5l5j2rdg7gx	\N	\N	2026-08-04 16:32:04.683	2026-08-13 01:46:14.705	N35 Gaming Wireless Earbuds Low Latency Bluetooth Headphones LED Digit	N35 gaming wireless earbuds support music & gaming dual mode, ultra low latency, built-in mic, LED power display, stereo sound, long battery life for mobile game players.	https://i.ibb.co/zWFLRcRv/b0f61f599d2d.png	\N	NEW	[{"id": "dfa9780d-2b92-4dd0-b05a-6ddb92ea7675", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Introduction", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "N35 Gaming TWS Wireless Earbuds are specially designed for game lovers. Adopts dual-mode decoding for music and gaming, ultra-low latency brings synchronized audio experience. Equipped with LED digital power display and cool RGB lighting, ideal for gaming, calls and daily music playback.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Main Features", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Dual Mode: Gaming & Music Dual Decoding Switch freely between game mode and music mode to meet different needs. ✅ Ultra Low Latency Optimized gaming chip, greatly reduce audio delay for mobile FPS games. ✅ LED Digital Power Display Real-time show remaining power of earbuds and charging case. ✅ Built-in Microphone Clear voice pickup for online voice chat and hands-free calls. ✅ Bionic Diaphragm Speaker Deliver rich stereo bass, transparent and powerful sound quality. ✅ Cool RGB Gaming Light Gamer-style appearance with glowing green ambient light. ✅ Long Battery Backup Large capacity charging case supports all-day continuous use.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Package List", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "1 Pair N35 Wireless Earbuds 1 Charging Case 1 USB Charging Cable 1 User Manual", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsok17rz00qpagl5yx11zg55	PRD-00058	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag	women-pu-leather-crocodile-pattern-handbag-lock-clasp-top-handle-shoulder-crossbody-daily-commuter-bag	\N	INACTIVE	XH-B05(10)	\N	0.00	9999.00	4599.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-11 11:05:52.799	2026-08-14 03:34:47.695	Crocodile Pattern Leather Handbag Women Top Handle Crossbody Satchel B	Glossy crocodile embossed ladies handbag with metal lock, detachable strap, multi colors fashion shoulder purse for daily occasions.	https://i.ibb.co/N66YXgj8/7c707c411c7d.jpg	\N	NEW	[{"id": "3e90a714-2953-4aa0-94da-9ee6664de4e8", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "1. Product Detailed Description", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Women Crocodile Pattern Handbag, Fashion Glossy Leather Top Handle Crossbody Bag", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " This elegant structured handbag features classic silhouette with premium glossy crocodile embossed texture, showing sophisticated retro luxury style. Built with sturdy metal turn-lock hardware, equipped with top handle and removable shoulder strap for versatile wearing ways.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Glossy Crocodile Embossed Surface", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Exquisite crocodile grain leather, shiny surface, stylish and textured, waterproof and easy to wipe clean.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Classic Metal Lock Closure", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Durable silver metal lock keeps belongings safely stored, highlights high-end aesthetic.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Multiple Carrying Options", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Short top handle for hand carrying; detachable long strap allows shoulder or crossbody wear.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Structured Shape & Ample Space", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Firm shape maintains elegant outline. Spacious inner compartment fits mobile phone, wallet, lipstick and daily small essentials.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Abundant Color Options", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Available in black, wine red, pink, off-white and other classic colors, easy to match dresses, casual outfits and formal wear.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Perfect for dating, shopping, office work, parties, travel and daily commuting.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Material: PU leather with crocodile embossing", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Design: Structured satchel, lock buckle, detachable shoulder strap", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Package Includes: 1 × Handbag + Detachable Shoulder Strap", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoj4f4d00pvagl5yshv0vy8	PRD-00057	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin	h99-recombinant-collagen-eye-cream-anti-wrinkle-firming-eye-lotion-reduce-fine-lines-puffy-eyes-moisturize-repair-eye-area-skin	\N	INACTIVE	XH-C33	\N	0.00	1558.22	779.11	\N	cmsbvra73000ee5l513q8xzuy	\N	\N	2026-08-11 10:40:22.669	2026-08-14 03:35:12.133	Anti Wrinkle Firming Moisturizing Lifting Anti-Aging Face Eye Cream	H99 Peptide Collagen Cream, anti-wrinkle & firming, reduce fine lines, boost collagen, moisturize, lighten eye wrinkles, non-greasy anti-aging skincare.	https://i.ibb.co/YBTFLkZX/2c0b3cf2ca84.jpg	\N	NEW	[{"id": "26d6fd7b-5eba-4e26-8e5e-9b6e382f82f1", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "H99 Peptide Collagen Anti-Wrinkle Firming Essence Cream", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Fight multiple wrinkles and reverse visible aging signs! Infused with peptide & recombinant collagen, this cream plumps sagging skin, smooths fine lines around eyes and face, restores skin elasticity for younger, firmer complexion.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Main Benefits", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Reduce Fine Lines & Wrinkles", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Targets dry lines, crow’s feet and facial creases to smooth uneven skin texture.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Lift & Firm Sagging Skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Stimulate collagen, improve skin sagging caused by aging and staying up late.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Deep Long-Lasting Hydration", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lock in moisture, relieve dry skin, fade dullness for bright even skin tone.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Dual Use for Face & Eye Area", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Works on eye periphery, forehead, nasolabial folds and whole face.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Light Melting Texture", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Instantly melts upon contact, lightweight, easy absorption, non-greasy, no sticky residue.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Add Caviar Extract", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rich antioxidant ingredients nourish and protect delicate skin.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📖 How To Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "After cleansing and toner, take proper amount of cream.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gently massage on face and eye area until fully absorbed.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Use morning and night for better anti-aging effect.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💡 Warm Tips", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Persistent daily use brings more obvious improvement on wrinkles and dry lines.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsetqd7x000re5l5hq59opwb	PRD-00001	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan	x688-mini-high-speed-handheld-fan	Beat Bangladesh's sweltering, humid summer heat effortlessly with our upgraded X688 Wind Cannon Handheld Fan! Boasting industry-leading 12m/s turbo wind power, ultra-light 100g pocket-sized build, smart digital screen and long-lasting battery, it is your ultimate cooling companion for campus, office, rickshaw rides, outdoor trips and daily all-scene use!\n\n\n---\n\n\n## Core Product Feature Breakdown\n\n\n### 🌪️ Flagship 12m/s Pro-Grade Turbo Wind Performance\n\n\nOutperforms most ordinary mini fans on the market with fully upgraded wind-making technology:\n\n\n- Self-developed aerospace-grade DC brushless motor, max speed up to **15000 RPM** for explosive wind output\n\n- 6-blade turboshaft + concentrated wind duct design, scientifically splits airflow to boost wind distance by 20% and airflow efficiency by 20%\n\n- Max wind speed reaches **12.0m/s**, delivers instant strong cool breeze to beat harsh summer heat across Bangladesh\n\n- Optimized air inlet & outlet structure cuts wind resistance for softer yet farther-reaching airflow\n\n\n### 🎨 Ultra-Portable Premium Ergonomic Design\n\n\nClassic wind cannon outlook with exquisite matte two-tone finish, perfect for all groups:\n\n\n- Only **100g ultra-light weight** (lighter than most smartphones), no hand fatigue even for long-time holding\n\n- Compact body size: 3.5*3.5*9cm, easy to slip into pockets, backpacks or handbags\n\n- 5 trendy pastel & bold color options: Black, White, Matcha Green, Violet Purple, Pink, matching all daily outfits\n\n- Non-slip textured grip with sweatproof & waterproof coating, stable to hold in sweaty hot weather\n\n\n### 📲 Intelligent External Digital Display Screen\n\n\nUser-friendly real-time status monitoring:\n\n\n- Clear LED outer screen shows remaining battery percentage and current wind gear at a glance\n\n- Avoid unexpected power cuts outdoors, you can plan charging ahead of time\n\n- Sleek circular screen layout elevates the tech aesthetic of the fan\n\n\n### 🔋 1200mAh Reliable Battery & Flexible Charging\n\n\nOptimized power system balances strong wind and endurance:\n\n\n- Built-in 1200mAh high-density lithium-ion battery, adjustable runtime from **1.5h to 6h continuous strong wind** based on wind speed settings\n\n- Type-C fast charging port, full charge takes only 3 hours, supports pass-through charging (use while charging)\n\n- Aviation-safe lithium battery: permitted on airplanes, high-speed trains, metro and all public transport in Bangladesh & abroad\n\n\n### 🛡️ 6-Layer AI Chip Full Safety Protection\n\n\nBuilt-in smart AI control chip for all-round safety against charging & using risks:\n\n\n1. Overvoltage Protection\n\n2. Overcurrent Protection\n\n3. High-Temperature Protection\n\n4. Short-Circuit Protection\n\n5. Overcharge Protection\n\n6. Over-Discharge ProtectionPrevents overheating, battery swelling and circuit damage, safe for long daily use even in hot weather.\n\n\n### ✅ Humanized Practical Detail Design\n\n\nEvery detail tailored for daily Bangladeshi life scenarios:\n\n\n1. **One-touch Power & Wind Control**: Single button to switch gears freely for customized cooling\n\n2. **Anti-slip Sweatproof Body**: Textured side panel stays firm in sweaty hands during hot commutes\n\n3. **Cipher Protective Grille**: Inner fan cover stops hair/finger tangling, safe for students and long-hair users\n\n4. **Reserved Lanyard Hanging Hole**: Attach a wrist strap to free your hands for hiking, shopping or sports\n\n\n### 📍 Wide Application Scenarios for Bangladesh\n\n\nPerfect for every hot humid occasion:✔ University classroom & campus activities✔ Daily office indoor cooling✔ Rickshaw/bike/bus commutes under blazing sun✔ Picnic, beach trips, hiking & cricket match watching outdoors✔ Makeup setting breeze for ladies✔ Indoor household & pet cooling\n\n\n---\n\n\n## Full Product Specification Table\n\n\n| Specification Item | Detailed Parameter |\n\n| --- | --- |\n\n| Model | X688 Small Wind Cannon Handheld Fan |\n\n| Net Weight | 100g |\n\n| Product Dimension | 3.5*3.5*9cm |\n\n| Battery Capacity | 1200mAh Lithium-ion Battery |\n\n| Motor Type | 2-Phase Self-developed Aerospace-Grade DC Brushless Motor |\n\n| Max Wind Speed | 12.0 m/s |\n\n| Max Motor RPM | 15000 RPM |\n\n| Full Charging Duration | 3 Hours |\n\n| Working Endurance | 1.5h - 6h (adjustable by wind gears) |\n\n| Charging Interface | Type-C USB Port |\n\n| Available Colors | Black, White, Matcha Green, Violet Purple, Pink |\n\n| Safety Mechanism | 6-layer AI chip high-energy protection system |\n\n\n---\n\n\n## Package Contents\n\n\n1 × X688 Handheld Turbo Fan1 × Type-C Charging Cable1 × User Instruction Manual	ACTIVE	【X688】XH-E05(5)	\N	0.00	1409.00	699.00	\N	cmsbuu7ra0008e5l5i8jt4tve	\N	\N	2026-08-04 15:39:41.037	2026-08-13 09:00:57.867	X688 Mini High Speed Handheld Fan	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket FanPackage Contents\n1 × X688 Handheld Turbo Fan\n1 × Type-C Charging Cable\n1 × User Instruction Manual	https://i.ibb.co/7N4Vr0t1/9a3c8405be1e.png	\N	NEW	[{"id": "53c5ea4c-c73c-4e0b-bee9-8b3bfa32a5bd", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "Beat Bangladesh's sweltering, humid summer heat effortlessly with our upgraded X688 Wind Cannon Handheld Fan! Boasting industry-leading 12m/s turbo wind power, ultra-light 100g pocket-sized build, smart digital screen and long-lasting battery, it is your ultimate cooling companion for campus, office, rickshaw rides, outdoor trips and daily all-scene use!", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "---", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "## ", "type": "text"}, {"text": "Core Product Feature Breakdown", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "### 🌪️ Flagship 12m/s Pro-Grade Turbo Wind Performance", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "Outperforms most ordinary mini fans on the market with fully upgraded wind-making technology:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Self-developed aerospace-grade DC brushless motor, max speed up to ", "type": "text"}, {"text": "15000 RPM", "type": "text", "marks": [{"type": "bold"}]}, {"text": " for explosive wind output", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- 6-blade turboshaft + concentrated wind duct design, scientifically splits airflow to boost wind distance by 20% and airflow efficiency by 20%", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Max wind speed reaches ", "type": "text"}, {"text": "12.0m/s", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", delivers instant strong cool breeze to beat harsh summer heat across Bangladesh", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Optimized air inlet & outlet structure cuts wind resistance for softer yet farther-reaching airflow", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "### 🎨 Ultra-Portable Premium Ergonomic Design", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "Classic wind cannon outlook with exquisite matte two-tone finish, perfect for all groups:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Only ", "type": "text"}, {"text": "100g ultra-light weight", "type": "text", "marks": [{"type": "bold"}]}, {"text": " (lighter than most smartphones), no hand fatigue even for long-time holding", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Compact body size: 3.5*3.5*9cm, easy to slip into pockets, backpacks or handbags", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- 5 trendy pastel & bold color options: Black, White, Matcha Green, Violet Purple, Pink, matching all daily outfits", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Non-slip textured grip with sweatproof & waterproof coating, stable to hold in sweaty hot weather", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "### 📲 Intelligent External Digital Display Scree", "type": "text", "marks": [{"type": "bold"}]}, {"text": "n", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "User-friendly real-time status monitoring:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Clear LED outer screen shows remaining battery percentage and current wind gear at a glance", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Avoid unexpected power cuts outdoors, you can plan charging ahead of time", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Sleek circular screen layout elevates the tech aesthetic of the fan", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "### 🔋 1200mAh Reliable Battery & Flexible Charging", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "Optimized power system balances strong wind and endurance:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Built-in 1200mAh high-density lithium-ion battery, adjustable runtime from ", "type": "text"}, {"text": "1.5h to 6h continuous strong wind", "type": "text", "marks": [{"type": "bold"}]}, {"text": " based on wind speed settings", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Type-C fast charging port, full charge takes only 3 hours, supports pass-through charging (use while charging)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "- Aviation-safe lithium battery: permitted on airplanes, high-speed trains, metro and all public transport in Bangladesh & abroad", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "### 🛡️ 6-Layer AI Chip Full Safety Protection", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "Built-in smart AI control chip for all-round safety against charging & using risks:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "1. Overvoltage Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "2. Overcurrent Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "3. High-Temperature Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "4. Short-Circuit Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "5. Overcharge Protection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "6. Over-Discharge ProtectionPrevents overheating, battery swelling and circuit damage, safe for long daily use even in hot weather.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "### ✅ Humanized Practical Detail Design", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "Every detail tailored for daily Bangladeshi life scenarios:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "1. ", "type": "text"}, {"text": "One-touch Power & Wind Control", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Single button to switch gears freely for customized cooling", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "2. ", "type": "text"}, {"text": "Anti-slip Sweatproof Body", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Textured side panel stays firm in sweaty hands during hot commutes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "3. ", "type": "text"}, {"text": "Cipher Protective Grille", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Inner fan cover stops hair/finger tangling, safe for students and long-hair users", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "4. ", "type": "text"}, {"text": "Reserved Lanyard Hanging Hole", "type": "text", "marks": [{"type": "bold"}]}, {"text": ": Attach a wrist strap to free your hands for hiking, shopping or sports", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "### 📍 Wide Application Scenarios for Bangladesh", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "Perfect for every hot humid occasion:✔ University classroom & campus activities✔ Daily office indoor cooling✔ Rickshaw/bike/bus commutes under blazing sun✔ Picnic, beach trips, hiking & cricket match watching outdoors✔ Makeup setting breeze for ladies✔ Indoor household & pet cooling", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "---", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "## Full Product Specification Table", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Specification Item | Detailed Parameter |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| --- | --- |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Model | X688 Small Wind Cannon Handheld Fan |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Net Weight | 100g |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Product Dimension | 3.5*3.5*9cm |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Battery Capacity | 2400mAh Lithium-ion Battery |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Motor Type | 2-Phase Self-developed Aerospace-Grade DC Brushless Motor |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Max Wind Speed | 12.0 m/s |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Max Motor RPM | 15000 RPM |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Full Charging Duration | 3 Hours |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Working Endurance | 1.5h - 6h (adjustable by wind gears) |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Charging Interface | Type-C USB Port |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": "left"}, "content": [{"text": "| Available Colors | Black, White, Matcha Green, Violet Purple, Pink |", "type": "text"}]}, {"type": "heading", "attrs": {"level": 1, "textAlign": "left"}, "content": [{"text": "| Safety Mechanism | 6-layer AI chip high-energy protection system |", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsof2spy009uagl5h5ldpucd	PRD-00021	numbuzin No.3 Porcelain Tone Up Beige SPF50+ PA++++ Lazy Tone Up Cream	numbuzin-no-3-porcelain-tone-up-beige-spf50-pa-lazy-tone-up-cream	\N	INACTIVE	XH-C03	\N	0.00	1090.00	545.00	\N	cmsbwaevb000he5l532keu9u7	\N	\N	2026-08-11 08:47:08.518	2026-08-14 03:33:56.119	numbuzin No.3 Porcelain Base-skip Tone Up Beige SPF50+ PA++++, 3-in-1	3-in-1 Korean tinted sunscreen SPF50+ PA++++. Primer, sun protection & tone up cream in one. Lightweight texture, natural translucent skin, oil control, mask-proof, ideal for lazy daily makeup.	https://i.ibb.co/xt8Pjwf6/787ea9c4f5df.png	\N	NEW	[{"id": "94ca222d-ee13-4694-9c2e-e039ddd0e922", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "numbuzin No.3 Porcelain Base-skip Tone Up Beige SPF50+ PA++++", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "All-in-one lazy makeup essential: Sunscreen + Primer + Tone Up Cream. One bottle simplifies your morning skincare routine.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Product Highlights ✅ SPF50+ PA++++ Powerful UV Protection Effectively block UVA & UVB, prevent sun darkening and sun damage. ✅ Lightweight & Hydrating Texture Smooth and easy to blend, no cakey heavy foundation feeling. Creates translucent natural skin. ✅ Mask-proof Formula Reduce makeup transfer, less stain on face masks. ✅ Oil Control Effect Suitable for oily & combination skin, keep fresh matte finish all day. ✅ Skin-friendly Ingredients Centella Asiatica Extract: Calm and soothe sensitive skin Niacinamide: Improve dullness, even out skin tone", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Take appropriate amount and spread evenly on face as the last step of skincare. No extra primer or foundation needed for simple daily makeup.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Suitable For", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Oily skin, combination skin; people who prefer light natural makeup, office daily look, travel lazy makeup.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "For external use only.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Avoid contact with eyes.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "If irritation occurs, stop using immediately.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsoj1gza00pcagl5q865fvqt	PRD-00055	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag	women-genuine-leather-litchi-grain-handbag-lock-clasp-top-handle-shoulder-crossbody-commuter-bag	\N	INACTIVE	XH-B04(9)	\N	0.00	9999.00	4599.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-11 10:38:05.11	2026-08-14 03:35:31.607	Classic Lock Leather Handbag Women Luxury Top Handle Shoulder Tote Bag	Elegant structured leather tote bag with metal lock, detachable strap, multi colors, women fashion handheld crossbody purse for daily use.	https://i.ibb.co/wZXCtRTX/68a98ab51580.jpg	\N	NEW	[{"id": "23d2728b-174f-4e56-84cd-4b50cf636a44", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Women Classic Lock Handbag, Fashion Genuine Leather Tote Bag, Luxury Top Handle Shoulder Bag", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " This timeless structured handbag adopts an iconic silhouette, crafted from premium textured leather with fine workmanship. Equipped with metal lock hardware, detachable shoulder strap, dual top handles, perfectly blend elegance and practicality.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Premium Textured Leather", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Soft yet durable leather material, scratch-resistant, easy to maintain, showing delicate matte texture.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Classic Metal Lock Closure", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Sturdy metal lock ensures safe storage of your daily essentials, brings sophisticated luxury aesthetic.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Dual Carry Ways", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Short top handles for handheld; matching long shoulder strap for crossbody / shoulder wear.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Spacious Interior", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Roomy main compartment fits wallet, mobile phone, cosmetics, small daily necessities. Ideal for shopping, dating, office, travel.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Rich Color Selection", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Multiple trendy solid colors available to match various outfits and occasions.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Suitable Occasion: Daily commute, party, shopping, weekend getaway, business casual look.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Material: High-quality cowhide leather", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Style: Structured top handle tote bag", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Design Feature: Lock buckle, detachable shoulder strap", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Package Includes: 1 x Handbag + Detachable Shoulder Strap", "type": "text"}]}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsokzfdd00ryagl5ru2p65ve	PRD-00060	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap	women-retro-faux-leather-satchel-handbag-lock-flap-crossbody-shoulder-mini-top-handle-bag-with-adjustable-strap	\N	INACTIVE	XH-B06(5)	\N	0.00	7999.00	3999.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-11 11:32:28.945	2026-08-14 03:34:46.309	Structured Leather Crossbody Bag Women Metal Lock Small Flap Shoulder	Textured leather ladies shoulder bag with twist lock, wide strap, multiple colors, elegant small crossbody purse with gift box for daily wear.	https://i.ibb.co/Hsy4nwr/d7065861be31.png	\N	NEW	[{"id": "45c53778-683a-4610-a7c5-5fb3e9c88073", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "1. Product Detailed Description", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Women Textured Leather Flap Crossbody Bag, Fashion Lock Design Small Shoulder Handbag", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " This stylish small leather bag adopts an angular structured silhouette, crafted from premium cross-grain leather with delicate texture and great wear resistance. Matched with polished metal twist lock, adjustable wide shoulder strap and decorative leather pendant, it delivers elegant modern aesthetics.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Fine Cross-Grain Leather", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Smooth textured leather, scratch-resistant, maintains neat shape, easy to wipe and maintain.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Secure Metal Twist Lock", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Classic turn-lock closure protects your personal belongings, improves overall luxury texture.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Detachable Wide Shoulder Strap", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Comfortable wide strap eases shoulder pressure, supports single shoulder or crossbody carrying.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Portable Size & Practical Space", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Compact outlook with reasonable inner space, fits smartphone, lipstick, card holder and daily small essentials.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Multiple Classic Color Options", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Available in black, tan, elephant grey, burgundy, off-white and other neutral tones, easy to match suits, dresses and casual outfits.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Perfect for dating, shopping, daily commute, parties and gift giving.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Comes with exquisite gift box packaging, ideal present choice.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Material: Cross-grain PU Leather", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Accessories: Shoulder Strap + Leather Pendant + Gift Box", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Package Includes:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 × Women Crossbody Bag", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 × Detachable Shoulder Strap", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 × Decorative Leather Pendant", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 × Gift Box", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsohsgn900lkagl55jpcpsjj	PRD-00049	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care	fruit-mint-mouth-freshener-spray-6-flavors-portable-20ml-oral-spray-instant-fresh-breath-remove-bad-breath-pocket-size-daily-oral-care	\N	ACTIVE	XH-C52(6)	\N	0.00	480.47	240.24	\N	cmsbxrg27000qe5l5h5hg52wu	\N	\N	2026-08-11 10:03:05.158	2026-08-12 08:01:11.342	Fruit Breath Freshener Spray 20ml Long Lasting Oral Mouth Spray	Refresh bad breath instantly! Pocket-sized oral spray with fruit & mint flavors. Lightweight 20ml design for dating, travel, office and daily oral care.	https://i.ibb.co/9HknyNFB/1d17e98e6123.png	\N	NEW	[{"id": "453c94a5-9ee4-453d-b48d-a389adb2b513", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Portable Mouth Freshener Spray | Instant All-Day Fresh Breath", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Tired of embarrassing bad breath after meals, coffee or smoking? Our portable breath spray brings you instant fresh breath anytime, anywhere.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🍓 Multiple Delicious Flavors", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Cool Mint, White Peach, Grape, Lychee available. Blended with natural fruit extracts, peppermint oil and spearmint oil, mild and pleasant, no harsh bitter taste.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💨 Instant & Long-Lasting Freshness", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Just one spray to neutralize unpleasant oral odor. Keep your breath fresh for hours and boost your confidence in communication.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "👜 Mini 20ml Pocket Design", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Compact lightweight bottle fits easily into pockets, purses and backpacks. Easy to carry for outdoor trips, dates, business meetings and daily commuting.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌿 Gentle Oral Care Formula", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Made with natural plant essential oils, comfortable for daily oral hygiene.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Wide Application Scenarios", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Morning wake-up refresh, before dates, work meetings, dining out, travel and more.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📌 Specifications", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Net Volume: 20ml", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoffma900b4agl52y9tui4y	PRD-00025	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin	adjustable-v-line-face-lifting-mask-double-way-wear-reduce-double-chin	\N	ACTIVE	XH-C05	\N	0.00	853.00	426.00	\N	cmsbwaevb000he5l532keu9u7	\N	\N	2026-08-11 08:57:06.705	2026-08-12 08:28:19.54	Dual Wear V Line Lifting Face Mask, Breathable Facial Slimming Bandage	Upgraded V-line face lifting mask supports two wearing styles: half/full face mode and full face plus forehead mode. Made of soft breathable elastic material, lightweight and odorless. It helps tighten sagging skin, fade nasolabial folds, improve double chin, facial edema and loose contours. Washable, reusable, suitabl	https://i.ibb.co/fdZVhCYt/7f5564e7b7fe.jpg	\N	NEW	[{"id": "d46a70e7-4963-4ad2-a20c-257f197fe74d", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Dual-Mode V Line Face Lifting Mask", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Physical facial shaping bandage to reshape your jawline, reduce double chin and lift sagging skin. ✅ 2 Adjustable Wearing Methods ▸ Half/Full Face Mode: Improve sagging face, double chin, nasolabial folds ▸ Full Face + Forehead Mode: Target forehead wrinkles, lift overall facial contour", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Premium Comfort Fabric Breathable, eco-friendly, high elasticity, non-deformable and odorless. Built-in air holes to avoid stuffiness. Soft against skin for long-time wearing.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Wide Application Ideal for people with double chin, round face, masseter hypertrophy, facial edema, loose skin and blurred facial contours.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Humanized Design Ear cutout design, no pressure on ears. Adjustable magic tape for proper tightness. Fixed strap will not tangle hair. 360° uniform lifting force.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Reusable & Washable Easy to clean, durable for repeated use. Portable design, you can wear it at home, rest or sleep.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Wear", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Unfold the mask and align the chin position", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Pass ears through reserved holes, fasten the back strap", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Attach the auxiliary lifting strap to strengthen tightening effect", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Optional: Install forehead strap to lift forehead area", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Do not wear too tight to avoid discomfort.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Suggest continuous use for better results.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Hand wash gently with neutral detergent, air dry naturally.", "type": "text"}]}]}]}, {"type": "blockquote", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Disclaimer: This product is physical auxiliary shaping tool, effects vary from individual skin condition.", "type": "text"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsoep73y0096agl5r0g0yrgt	PRD-00018	LISTENTOSKIN 377 Facial Cleanser Dual Amino Acid Deep Pore Cleansing Oil Control Brightening Gentle Face Wash Rich Foam Hydrating Facial Cleanser	listentoskin-377-clean-skin-facial-cleanser-amino-acid-deep-clean-oil-control	\N	ACTIVE	XH-C28	\N	0.00	947.36	473.68	\N	cmsbvns7g000de5l5xxrw4a1u	\N	\N	2026-08-11 08:36:33.982	2026-08-12 08:44:15.643	Amino Acid Facial Cleanser Deep Clean Oil Control Face Wash	LISTENTOSKIN 377 Facial Cleanser with dual amino acid formula. Dense creamy foam, deep purify pores, control excess oil, brighten dull skin, moisturizing without tightness for all skin types.	https://i.ibb.co/60TtGDW9/23af15742637.jpg	\N	NEW	[{"id": "b5e43daf-1c87-4c93-a741-48c9b7555805", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "LISTENTOSKIN 377 Clean Skin Facial Cleanser", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gentle dual amino acid facial cleanser to refresh your daily cleansing routine!", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Infused with Moringa Seed Extract, Cocoa Seed Extract and Polyquaternium-7, this cleanser combines effective cleansing with skin-nourishing care.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Main Benefits", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Dual amino acid cleansing system, mild & skin-friendly", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Produces rich, creamy dense foam, deeply wash away dirt, excess oil and impurities in pores", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Purify pores, balance oily skin, long-lasting oil control", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Nourishing ingredients lock moisture, no tight & dry feeling after washing", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Improve dull complexion, support brighter, clearer skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Easy to rinse off, zero sticky residue, refreshing comfortable finish", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Ingredients", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1. Moringa Seed Extract: Purify skin, clear surface pollutants", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "2. Cocoa Seed Extract: Soothe and maintain skin moisture barrier", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "3. Polyquaternium-7: Boost foam texture, reduce friction, protect skin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "How to Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1. Squeeze proper amount onto palm, add water and rub gently to create rich foam.", "type": "text"}]}]}]}, {"type": "orderedList", "attrs": {"type": null, "start": 2}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "2. Massage foam softly over damp face in circular motions.", "type": "text"}]}]}]}, {"type": "orderedList", "attrs": {"type": null, "start": 3}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "3. Rinse thoroughly with clean water.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Suitable for daily use, great for oily, combination and dull skin.", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}, {"id": "ccdc11fa-3e0f-4c36-9434-931f3350f3c9", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph"}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsogwt6m00hoagl5lnwfynhh	PRD-00039	Mens Hair Styling Volume Powder, Long Lasting Fluffy Texture, Oil Absorbing Dry Powder, Create Natural Hairstyle For Daily Use	mens-hair-styling-volume-powder-long-lasting-fluffy-texture-oil-absorbing-dry-powder-create-natural-hairstyle-for-daily-use	\N	INACTIVE	XH-C10	\N	0.00	1030.00	515.00	\N	cmsbxhszr000ne5l5e78lppas	\N	\N	2026-08-11 09:38:28.414	2026-08-14 03:39:27.312	Men Hair Volume Powder, Oil Control Fluffy Hair Styling Powder, Long L	Men Hair Volume Powder is a convenient wash-free styling powder. It instantly boosts hair volume, absorbs excess oil to refresh greasy hair, delivers long-lasting strong hold. Fine powder leaves no white residue, easy to shape textured hairstyles, suitable for all hair types.	https://i.ibb.co/p6PwRXN6/510f6afdcc51.jpg	\N	NEW	[{"id": "acc98903-b3aa-48a0-9694-f260a418da5f", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "Men Hair Volume Powder 40g", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Create natural, dynamic fluffy hairstyles anytime with this professional hair volume powder designed for men.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This lightweight styling powder effectively absorbs scalp grease to refresh flat, oily hair, keeping your hair clean and voluminous all day long. The ultra-fine powder blends seamlessly into hair without ugly white flakes. It provides reliable strong hold while remaining gentle on soft hair, allowing you to freely shape textured hairstyles.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Instantly lifts flat hair & boosts volume ✅ Powerful oil control, fight greasy hair ✅ No white residue, natural finish ✅ Long-lasting strong hold ✅ Wash-free dry styling, great for lazy days ✅ Portable bottle design, easy to carry outdoors ✅ Works for all hair types", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How to Use", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Shake well before use. Apply to dry hair, hold the bottle close to scalp and fluffy areas. Sprinkle lightly, then shape hair with hands to get ideal fluffy effect.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tip", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Do not inhale the powder. Keep away from eyes. Stop using if scalp irritation occurs.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmssqwbt8005hkjl5dbp5umy7	PRD-00061	Power Station Carry Bag Waterproof Storage Case For Jackery Ecoflow Bluetti	power-station-carry-bag-waterproof-storage-case-for-jackery-ecoflow-bluetti	\N	ACTIVE	\N	\N	0.00	6587.00	3293.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 09:29:06.764	2026-08-14 10:16:26.59	Waterproof Power Station Storage Bag Portable Protective Carry Case	Water-resistant power station carry bag with multi-pocket design, thick shockproof foam, compatible with Jackery, Ecoflow, Bluetti portable power stations for outdoor travel.	https://i.ibb.co/H1Hm4mz/2c37d8b8a69b.jpg	\N	NEW	[{"id": "5bff5f84-769e-4897-99e5-6c51d36dd39b", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This portable power station storage bag offers all-round protection for your outdoor power station and charging accessories. Made of water-resistant polyester with thick shock-absorbing foam padding, it prevents bumps, scratches and splashes. Multiple independent pockets keep power cables, adapters neatly organized. Equipped with sturdy top handles and adjustable shoulder strap, ideal for camping, road trips and outdoor activities.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Key Features", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Wide Compatibility Size:12.5", "type": "text"}, {"text": "8.75", "type": "text", "marks": [{"type": "italic"}]}, {"text": "10 inch. Fit for Jackery 500/1000 v2, Ecoflow River 2 Pro, Bluetti EB3A, Grecell T1000/T500 and similar power stations. Please measure your device before purchase.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Shockproof & All-round Protection Constructed with water-resistant polyester, thick foam cotton and soft inner lining. Effectively buffer impact, guard against scratches and light rain splashes.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Multi-Pocket Organizer Separate main compartment for power station. Multiple front mesh pockets and side pockets store charging cables, adapters and other small accessories.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Durable & Convenient Carrying Heavy-duty double zipper, reinforced top handles + removable shoulder strap. Non-slip bottom pads reduce abrasion during placement.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Versatile Outdoor Use Perfect for camping, RV travel, emergency backup power, outdoor work and daily storage.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Specifications", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Material: Water-resistant Polyester + Thick Foam External Size: 32cm × 22cm × 25.4cm / 12.5in × 8.75in × 10in Color: Black with orange decorative strip Package Includes: 1 x Power Station Carry Bag", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Reminder", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Please confirm the dimension of your portable power station before ordering to avoid size mismatch. Power station and accessories are NOT included.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsswqk1j0000oll5ob5qxbnu	PRD-00070	Women’s Small Crossbody Bag, Adjustable Strap Casual Shoulder Purse for Shopping	women-s-small-crossbody-bag-adjustable-strap-casual-shoulder-purse-for-shopping	\N	ACTIVE	XH-B11	\N	0.00	1399.00	699.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 12:12:35.192	2026-08-14 12:12:35.192	Women Lightweight Crossbody Camera Bag, Multi-Pocket Nylon Shoulder	Lightweight nylon crossbody camera bag with adjustable strap, multi-pocket storage and slim everyday design. Perfect for travel, shopping, daily commute and casual outings.	https://i.ibb.co/jPHzgPqD/ac820cf15b9b.png	\N	NEW	[{"id": "d35ef4d1-178f-4781-8a35-82a6137c01a3", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Product Description", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This lightweight crossbody camera bag is a practical everyday companion designed for women who want to carry essentials without extra bulk. With a slim, compact shape and multiple pockets, it is ideal for daily commuting, shopping, short trips, outdoor walks and travel.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Multi-Pocket Storage", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " The front zipper pocket provides quick access to frequently used items, while the main compartment can store a smartphone, power bank, lip balm, keys, earbuds and other small essentials. The back zipper pocket offers extra storage for secure organization.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Adjustable Shoulder Strap", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " The shoulder strap is fully adjustable, allowing you to wear it as a crossbody bag, shoulder bag or casual purse according to your height and carrying preference. It can be easily adjusted from approximately 68 cm to 125 cm for comfortable everyday use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Lightweight & Portable Design", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Made of lightweight nylon fabric, this bag is easy to carry and won’t add unnecessary weight to your daily outfit. The slim camera-bag shape fits close to the body, making it suitable for walking, shopping, traveling and busy city life.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Casual Versatile Style", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " The simple and clean design matches a variety of outfits, from casual T-shirts and jeans to shorts, dresses and everyday sporty looks. It is suitable for daily errands, weekend getaways, sightseeing, gym trips and outdoor activities.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Perfect Gift Choice", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " This practical crossbody shoulder bag combines functionality, comfort and minimalist style, making it a thoughtful gift for friends, family or anyone who enjoys convenient everyday carry.", "type": "text"}]}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsohctdv00k8agl5w501bhdv	PRD-00046	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g	vitamin-lubricating-moisturizing-cream-with-provitamin-b5-hydrate-dry-skin-smooth-rough-body-skin-500g	\N	INACTIVE	XH-C13	\N	0.00	2048.00	1024.00	\N	cmsbx9m0f000me5l5qkdabgen	\N	\N	2026-08-11 09:50:55.171	2026-08-14 03:33:00.889	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Multi-use B	Multi-purpose Vitamin Moisturizing Cream enriched with Provitamin B5. Deeply hydrates, soothes dry & chapped skin. Works as body lotion, hand cream, heel repair cream, fresh non-sticky texture for whole family.	https://i.ibb.co/HTyqgLpk/2b939cb146b8.jpg	\N	NEW	[{"id": "8eaeaba3-0625-49d2-84ac-ee472d6a088b", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Ultimate Provitamin B5 Full-Body Moisturizing Cream | Professional Dry Skin Repair Lotion", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Specially designed for dry, flaky, cracked and rough skin, this high-performance vitamin moisturizing cream adopts a mild and nourishing formula enriched with core Provitamin B5 ingredients. It deeply penetrates the skin surface, locks in moisture for a long time, effectively improves dry tightness, relieves skin redness and dry itching, and repairs damaged dry skin barrier caused by dry air, frequent hand washing and seasonal changes.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Multi-functional All-scene Skin Care", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "It is not only a daily body moisturizer, but also an all-round skin repair cream. It can be safely used on face, hands, arms, legs, elbows, knees and cracked heels. It improves rough keratin, fades dry lines, and makes the whole body skin delicate, smooth and tender all year round.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lightweight & Non-greasy Formula", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "The smooth and delicate cream texture spreads easily and absorbs quickly without sticky residue or greasy feeling. It forms a breathable moisturizing protective film on the skin surface, keeping the skin fresh, hydrated and non-stuffy all day long, suitable for all skin types including oily skin and sensitive skin.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gentle Family-safe Formula", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Key Benefits:", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Repairs dry, cracked and chapped skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Non-sticky, fast absorbing and fresh texture", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "✅ Mild formula for all family members", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsoh920800jkagl5nfbbjdol	PRD-00045	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection	d-alba-tone-up-uv-essence-sunscreen-spf50-pa-color-correcting-green-pink-purple-tinted-sun-cream-hydrating-3-in-1-primer-sun-protection	\N	INACTIVE	XH-C24(3)	\N	0.00	1059.00	529.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-11 09:47:59.72	2026-08-14 03:33:03.989	d'Alba Waterfull Tone-Up Sunscreen SPF50+ PA++++ Color Correct Primer	3 color-correcting sun cream, UV protection, brighten uneven tone, moisturizing lightweight daily sunscreen for all skin types, 50ml.	https://i.ibb.co/KpYZWgW2/b09839da9f38.jpg	\N	NEW	[{"id": "85d533ac-5b8a-4ac6-9749-0789339847ef", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "d'Alba Piedmont UV Essence Waterfull+ Tone-Up Sun Cream combines powerful broad-spectrum UV defense and color correction primer in one tube. SPF50+ PA++++ fully blocks UVA & UVB rays to prevent sun spots and premature aging. Three customized tint shades fix uneven skin tone, neutralize redness, sallow dullness, and add natural rosy glow. Watery, lightweight texture melts into skin without heavy white cast, greasiness or cakey finish. Doubles as daily sunscreen and makeup base, perfect for natural no-makeup daily look. Capacity: 50ml.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Three Shades For Different Skin Concerns", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Green Tone-Up (Mineral Physical Sunscreen)", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Suitable for sensitive, redness-prone skin", "type": "text"}]}]}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "100% mineral filter, ultra-gentle soothing formula", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Neutralize facial redness, calm irritated skin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Light matte watery finish, non-irritating for sensitive complexions", "type": "text"}]}]}]}, {"type": "orderedList", "attrs": {"type": null, "start": 2}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Purple Tone-Up (Hybrid Chemical & Physical Filter)", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Suitable for oily/combination, dull yellow skin", "type": "text"}]}]}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Counteract sallow yellow undertones, brighten cool fair skin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Refreshing fluffy texture, control excess facial oil", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Creates translucent luminous bare skin effect", "type": "text"}]}]}]}, {"type": "orderedList", "attrs": {"type": null, "start": 3}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Pink Tone-Up (Hybrid Chemical & Physical Filter)", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Suitable for dry & combination dry skin", "type": "text"}]}]}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Add natural rosy glow, lift pale lifeless dull skin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rich hydrating formula, replenish dry skin moisture", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Long-lasting dewy luminous complexion", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Core Advantages", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ 2-in-1 Sunscreen & Color Corrector", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Daily UV protection + tone correction primer, skip separate base makeup", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ High Sun Protection SPF50+ PA++++", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Full UVA/UVB shield against sunburn, pigmentation and photoaging", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Lightweight Watery Texture", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Quick absorption, zero sticky residue, no heavy mask-like feeling", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Custom Color Correction", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 3 targeted shades fix red, yellow, pale dull uneven skin tone", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Hydrating & Non-Drying", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Infused with moisturizing essence, keeps skin soft all day long", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Smooth Makeup Base", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Evens skin texture, helps foundation adhere evenly without pilling", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "After skincare routine, take an appropriate amount evenly on face.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gently pat and spread until fully absorbed.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Can be used as standalone daily sun cream or primer before foundation.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Specs", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: d'Alba Piedmont", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Series: UV Essence Waterfull+ Tone-Up Sun Cream", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Sun Protection: SPF50+ PA++++", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Volume: 50ml", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Formula Type: Green (100% Mineral Filter); Pink/Purple (Hybrid Chemical+Physical Filter)", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Texture: Watery fluffy milky lotion", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Function: UV Protection, Tone Correction, Hydrating, Makeup Primer", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Reapply every 2–3 hours during long outdoor exposure.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Avoid contact with eyes; rinse thoroughly if irritation occurs.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Store in cool shaded place away from direct sunlight.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsof41qn00a3agl50g9g1u37	PRD-00022	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance	warmkiss-moto-cloud-rose-perfume-elegant-ice-texture-bottle-portable-long-lasting-romantic-daily-fragrance	\N	INACTIVE	XH-C16(3)	\N	0.00	1509.00	759.00	\N	cmsbxji5h000oe5l5sdyjoz5g	\N	\N	2026-08-11 08:48:06.863	2026-08-14 03:39:35.625	WARMKISS Ice Crack Glass Eau de Parfum, Long Lasting Fragrance for Wom	WARMKISS luxury perfume with ice crack textured bottle & marble swirl cap. 4 fresh scents including green fig & peach, long-lasting light aroma, cute gift perfume for daily dating, perfect gift for ladies.	https://i.ibb.co/fYDgBSSy/ef209aed0725.jpg	\N	NEW	[{"id": "9cf69152-b160-45e4-b724-0a84d9ce0edd", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "WARMKISS Ice Crack Art Perfume for Women", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "A delicate portable eau de parfum that wraps you in soft, long-lasting natural aroma, packed in a unique ice crack frosted glass bottle with marbled spherical cap—ideal for daily wear, dating and gifting.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Unique Premium Bottle Design", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "❄️ Ice Crack Frosted Glass Body", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Artistic transparent cracked texture creates a frosted, layered visual effect, catching light beautifully when held.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 🔮 Marble Swirl Round Cap", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Each cap features natural marbled color swirls, matching the scent tone of every variant for cohesive aesthetic.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Compact square bottle fits easily in purses, lightweight for on-the-go touch-ups anytime.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "4 Irresistible Fragrance Variants", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Naqu Sunlight (Green Fig)", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Fresh juicy green fig top note blended with soft floral and woody base, clean, refreshing green aroma, neutral unisex friendly.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Moto Cloud (Moto Mist)", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Rich romantic red floral scent, deep warm sweet fragrance, elegant and alluring for evening dates.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Bomi Spring Peach", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Juicy sweet spring peach fruity scent, bright soft girly aroma, light and fresh for daytime casual wear.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Galabailei", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Clean aquatic fresh mountain mist tone, cool calm light fragrance, suitable for office daily use.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Highlights", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Long-Lasting Mild Scent", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Balanced concentration delivers lingering aroma on clothes and skin, no cloying heavy smell.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✨ Exquisite Gift Packaging", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Comes with matching themed art gift box, perfect birthday, holiday, anniversary gift for women.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✨ Portable Travel Size", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Mini lightweight bottle, easy to carry in handbags for quick fragrance refresh outside.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✨ Wide Occasion Fit", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Daily commuting, office work, dating, party, travel, or as a thoughtful present for girlfriends & friends.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Specs", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: WARMKISS", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Type: Eau de Parfum", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Bottle Material: Ice crack frosted glass + marble plastic cap", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Available Scents: Green Fig, Moto Cloud Red Floral, Spring Peach, Galabailei Aquatic Mist", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Usage: Spray on wrists, neck, behind ears for long-lasting scent diffusion", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Backend Search Keywords (for store tag filling)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "women perfume, long lasting eau de parfum, cute mini perfume bottle, fig fragrance perfume, peach scent perfume, gift perfume for ladies, aesthetic ice crack glass perfume, portable travel perfume, romantic floral perfume", "type": "text"}]}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsoh39dg00ieagl5qprj3v16	PRD-00042	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care	torriden-solid-in-lip-essence-duo-set-2pcs-ceramide-lip-balm-deep-moisturizing-non-sticky-fragrance-free-repair-dry-flaky-lips-care	\N	INACTIVE	XH-C50	\N	0.00	1276.73	638.36	\N	cmsbw944g000ge5l547einnjc	\N	\N	2026-08-11 09:43:29.332	2026-08-14 03:33:08.701	Torriden 2Pcs Solid In Lip Essence Ceramide Moisturizing Lip Balm	Torriden lip essence with 5D Ceramide Complex repairs lip barrier, non-sticky, fragrance-free, nourishes chapped lips, lip balm twin pack.	https://i.ibb.co/wFpQFNyC/071b92aea93b.png	\N	NEW	[{"id": "8a61d050-9a78-4f94-9da3-4fb5af2f6026", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Torriden Solid In Lip Essence 2Pcs Duo Set", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Revive dry, flaky and chapped lips with Torriden Solid In Lip Essence. Infused with 5D Ceramide Complex to strengthen the lip barrier, delivering long-lasting nourishment and hydration all day long.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Core Benefits", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "5D Ceramide Complex: Repairs lip barrier & locks in moisture", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Improve dry & peeling lips, smooth rough lip texture", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lightweight non-sticky essence texture", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Fragrance-free, gentle for daily use", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Creates natural glossy lip finish", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌿 Key Ingredients", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ 5D Ceramide Complex", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Supports lip barrier repair and offers long-lasting protective care.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Jojoba Seed Oil", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lightweight nourishment to boost lip softness and elasticity.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Sargassum Fusiforme Extract", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Hydrates and softens flaky lips for smoother lip surface.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📖 How To Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Squeeze out proper amount of lip essence", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Spread evenly across your lips", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Reapply anytime when lips feel dry", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🎒 Portable Squeeze Tube", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Compact squeeze tube design, easy to carry in bags for office, travel and outdoor touch-ups. Suitable for day-time daily care or thickly applied as overnight lip mask.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📦 Spec", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Set: 2 tubes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Capacity: 11ml / 0.37 fl.oz per piece", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoenwof008uagl5plzqvpqm	PRD-00017	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil	medicube-zero-pore-mud-mask-3-min-fast-dry-clay-mask-alcohol-free-pore-purifying-mask-clear-blackheads-excess-oil	\N	INACTIVE	XH-C14	\N	0.00	1379.00	689.00	\N	cmsbvns7g000de5l5xxrw4a1u	\N	\N	2026-08-11 08:35:33.808	2026-08-14 03:34:01.248	Medicube Zero Pore Blackhead Mud Mask 100g AHA BHA PHA Pore Cleansing	Medicube Zero Pore Blackhead Mud Mask with AHA+BHA+PHA & 30% purifying clay. 3-min quick dry formula lifts blackheads, absorbs excess sebum, tightens pores, alcohol-free for oily & pore-prone skin. 100g deep cleansing clay mask.	https://i.ibb.co/jkdTXGPd/339392fbfbc0.png	\N	NEW	[{"id": "e37eba15-900a-437d-9eb9-deee8ec9f715", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Medicube Zero Pore Blackhead Mud Mask 100g", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Say goodbye to stubborn blackheads, enlarged pores and greasy skin with Medicube Zero Pore Blackhead Mud Mask, your 3-minute at-home pore refining treatment.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 4, "textAlign": null}, "content": [{"text": "Core Product Advantages", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Triple Acid Complex: AHA+BHA+PHA", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "AHA Glycolic Acid: Slough off dull dead skin cells to smooth rough skin texture", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "BHA Salicylic Acid: Penetrates deep into pores to dissolve sebum clogs & lift blackheads", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "PHA Gluconolactone: Gentle exfoliation to even out uneven skin tone", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ 30% Pore Purifying 5-Type Clay Blend", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Bentonite, Canadian Colloidal Clay & Kaolin work together to draw out dirt, excess oil and pore impurities instantly.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ 3-Minute Quick Dry Cooling Formula", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Fast-drying blue mud delivers instant cooling sensation while tightening flabby pores, no long waiting time.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Alcohol-Free Mild Formula", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " No harsh alcohol, suitable for oily, combination and pore-congested skin types.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 4, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Prep: Wash face and fully dry skin, apply a thick even layer of mud mask on target areas with blackheads & big pores.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Absorb Sebum: Let the mask dry naturally, it will trap blackheads and absorb surplus facial oil.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rinse Off: After 3–5 minutes when mask fully dries, wash thoroughly with lukewarm water.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " *Note: Drying time varies based on mask thickness and individual skin type. Applicator brush not included.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 4, "textAlign": null}, "content": [{"text": "Visible Skin Effect", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "After just one use, watch blackheads and pore gunk stick to the dried mud mask. Skin feels instantly fresh, matte, smooth and tightened with minimized visible pores, long-lasting oil control all day.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 4, "textAlign": null}, "content": [{"text": "Product Specs", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Net Weight: 100g / 3.52 oz", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Series: Medicube Zero Pore Line", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": " Main Function: Blackhead Removal, Deep Pore Cleansing, Sebum Control, Pore Tightening, Gentle Exfoliation", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsssqspa008mkjl56pzpxbf7	PRD-00067	Water Resistant Nylon Makeup Bag with Detachable Handle, Large Capacity Travel Cosmetic Organizer Pouch, Portable Toiletry Storage Bag	water-resistant-nylon-makeup-bag-with-detachable-handle-large-capacity-travel-cosmetic-organizer-pouch-portable-toiletry-storage-bag	\N	ACTIVE	XH-B14(3)	\N	0.00	2478.76	1239.38	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 10:20:47.95	2026-08-14 10:31:59.665	Nylon Travel Makeup Bag, Portable Waterproof Cosmetic Organizer	Portable waterproof nylon makeup bag with removable handle. Large capacity cosmetic storage pouch for skincare, makeup brushes & beauty tools. Perfect for travel, daily use & gift for women, multiple colors available.	\N	\N	NEW	[{"id": "db813633-f1d5-4839-b549-996b76da68c9", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Nylon Waterproof Makeup Bag with Detachable Handle", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Keep all your beauty essentials neatly organized with our stylish cosmetic storage bag. Made of premium water-resistant nylon fabric, it effectively protects your cosmetics from spills and moisture.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "The spacious interior holds lipsticks, makeup brushes, eyeshadow palettes, skincare bottles and other beauty supplies. Equipped with a removable adjustable handle and delicate drawstring zipper, it is easy to carry for daily outings, business trips and vacations.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lightweight and compact design fits easily into luggage, backpacks and handbags. Available in multiple elegant colors, this makeup pouch is an ideal gift choice for mom, daughter, friends and partners.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Product Features", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Water-resistant durable nylon material", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Detachable & adjustable carry handle", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Large capacity multi-compartment storage", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Stylish drawstring zipper closure", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Lightweight, portable for travel & daily use", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Wonderful gift option for women", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Specifications", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Material: Nylon", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Size: 10 x 5.9 x 4.9 inches", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Colors: Black, Pink, Light Blue", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Note: Cosmetics shown in pictures are not included.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmssxb5zf000joll5akbaclyg	PRD-00071	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag	reusable-waterproof-canvas-lunch-sack-portable-insulated-food-storage-bag	\N	ACTIVE	XH-B12	\N	0.00	2559.00	1199.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 12:28:36.747	2026-08-14 12:28:36.747	Waxed Canvas Insulated Lunch Bag, Roll Top Waterproof Thermal Cooler	Vintage reusable waxed canvas insulated lunch bag with aluminum thermal liner, waterproof & leakproof, roll-top snap closure. Suitable for office, picnic, camping to keep food warm or cold.	https://i.ibb.co/8DXVnj1m/15bcc0da0199.webp	\N	NEW	[{"id": "64a8c139-5429-45ad-aaae-0828e5a89ed9", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This vintage waxed canvas insulated lunch bag combines retro aesthetics with practical thermal insulation, ideal for daily work, school lunches, picnic, camping, grocery shopping and short trips. 【Premium Insulated Liner】 Built-in thick aluminum foil thermal lining, effectively keeps food warm or cold for hours. The waterproof inner layer prevents liquid leakage, easy to wipe clean when food spills. 【Durable Waxed Canvas Exterior】 Water-repellent waxed canvas surface repels light rain and splashes. Sturdy stitching ensures long service life. The canvas material gets a unique vintage texture after long-term use. 【Roll-Top Snap Button Closure】 Roll-up opening design with dual metal snap buttons, adjust internal capacity freely and lock temperature inside tightly. Easy to open and close, no complicated zippers. 【Spacious Capacity】 Size: 38×22×14.5 cm. Large interior space fits lunch boxes, fruits, bottles, snacks and daily necessities. It can be folded flat for convenient storage when not in use, saving cabinet space. 【Multi-scene Application】 Perfect as lunch tote, picnic cooler bag, grocery storage sack, travel food carry bag. Minimalist retro style matches all daily outfits, a great reusable eco-friendly substitute for disposable plastic bags.", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoiiohf00o0agl5ynkg0zbc	PRD-00052	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam	gaar-bulgarian-rose-sweet-orange-bath-oil-500ml-niacinamide-moisturizing-shower-oil-long-lasting-fragrance-gentle-cleansing-rich-foam	\N	INACTIVE	XH-C32	\N	0.00	2605.41	1302.71	\N	cmsbviuvp000be5l5qsuzeuup	\N	\N	2026-08-11 10:23:28.371	2026-08-14 03:32:43.752	Rose Sweet Orange Shower Oil Moisturizing Fragrance Body Wash 500ml	GAAR Rose Sweet Orange Shower Oil with Niacinamide & Rose Water, rich foam, long-lasting aroma, nourish skin, non-tight after shower, 500ml large capacity.	https://i.ibb.co/8D1CLWxT/e6957c5cbb93.jpg	\N	NEW	[{"id": "28853ae0-d70d-42d7-a0f7-ca748fafbc41", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "GAAR Rose Sweet Orange Bath Oil", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Luxury multi-effect shower oil that combines shower gel, body lotion, SPA essence and perfume all in one. Infused with rose water and niacinamide, gently cleanse while locking skin moisture.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💎 Product Highlights", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Transparent silky oil texture, good fluidity, easy to lather into delicate rich foam", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Gentle cleansing, easy to rinse off, no tight & dry feeling after bathing", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Natural Bulgarian Rose & Sweet Orange fragrance, long-lasting elegant scent", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Niacinamide nourishes skin, keeps body soft, smooth and glowing", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Large 500ml capacity, economical for long-term daily use", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Deeply moisturize dry skin, improve rough body skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📝 How To Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Take proper shower oil onto palm or bath sponge, rub to create foam, massage all over body, then rinse thoroughly with clean water.", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsof4dic00a6agl5u2gzv1f1	PRD-00023	YZS Dewy Foundation Stick With Built-in Brush Light Transparent Hydrating Long Lasting Coverage Portable Face Makeup Foundation Stick	yzs-stick-foundation-with-built-in-brush-dewy-coverage	\N	INACTIVE	XH-C30(2)	\N	0.00	1056.36	528.18	\N	cmsbviuvp000be5l5qsuzeuup	\N	\N	2026-08-11 08:48:22.116	2026-08-14 03:40:59.184	Light Transparent Foundation Stick With Built-in Brush Hydrating Dewy	YZS foundation stick with integrated M-shaped brush, lightweight dewy finish, buildable coverage, long-lasting, 2 shades for all skin tones, easy portable makeup.	https://i.ibb.co/Zz0fSx1n/447877557406.png	\N	NEW	[{"id": "fde8d31b-7232-4eee-a378-3fc378dba390", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "YZS Light And Transparent Stick Foundation", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "All-in-one foundation stick equipped with a customized concave M-shaped brush, perfect for on-the-go makeup. Achieve a luminous, natural dewy complexion without heavy mask-like texture.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Product Advantages", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Built-in M curved brush, fits cheek contours & jawline for seamless blending", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Lightweight hydrating texture, fine & smooth, less caking", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Buildable coverage, evens skin tone, hides minor blemishes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Long-wearing, maintains fresh radiant glow all day", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Rotatable stick design, easy to control dosage, portable travel size", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Two available shades:", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "▪1# Natural Color: Suitable for warm yellow & natural skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "▪2# Ivory Color: Suitable for fair skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📖 How To Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rotate out foundation stick, apply evenly on face", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Use the attached soft brush to blend outward", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Gently pat skin to get flawless sheer luminous makeup look", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmssty1770090kjl5pnp0s698	PRD-00069	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag	mini-waterproof-waist-fanny-pack-adjustable-crossbody-belt-bag	\N	ACTIVE	XH-B17	\N	0.00	2448.00	1224.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 10:54:25.171	2026-08-15 08:29:26.549	Lightweight Waterproof Fanny Pack Adjustable Crossbody Belt Waist Bag	Lightweight waterproof fanny pack with adjustable strap, multi-way wear as waist bag or crossbody bag. 1L capacity fits large phones, ideal for running, travel, daily outdoor use. Multiple colors available.	https://i.ibb.co/C5qnK7Qz/1021859f5495.jpg	\N	NEW	[{"id": "19012249-08a2-45a9-8368-ed0073a92fab", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This lightweight multi-purpose waist fanny pack is designed for daily commuting, sports, travel and outdoor activities. Made of smooth waterproof fabric, simple minimalist appearance with multiple trendy colors. The adjustable long strap allows you to wear it as a waist bag, crossbody bag or shoulder bag. 1L reasonable capacity easily holds your smartphone, keys, earphones, cards and small essentials.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Key Features", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Waterproof Durable Fabric Smooth water-resistant fabric, resist light splashes, easy to wipe clean. ✅ Adjustable Comfort Strap Strap adjustable from 31 inches to 48 inches, quick-release buckle, fit different waist sizes. ✅ Spacious 1L Capacity Size: 8\\"×2\\"×5.5\\". Fits large smartphones including iPhone 14 Pro Max, built-in mesh pocket for classified storage. ✅ Multi-scene & Multi-way Wear Can be worn on waist, cross chest or over shoulder. Perfect for running, hiking, shopping, gym and travel. ✅ Multiple Fashion Colors Available in black, beige, pink, purple, wine red, light blue, gray, brown to match your outfits. ✅ Smooth Durable Zipper High-quality zipper ensures smooth opening and closing, keeps your belongings safe.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Specifications", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Material: Water-resistant Nylon Fabric Capacity: 1L Dimensions: 8 × 2 × 5.5 inches Adjustable Strap Range: 31\\" - 48\\" Color: Black, Beige, Pink, Purple, Wine Red, Mint Blue, Gray, Coffee", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Package Includes", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "1 x Mini Crossbody Waist Fanny Pack", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmt1b7iu70000agl58hd3r9h4	PRD-00072	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion	coolkim-vibradorador-mujer	\N	ACTIVE	YihongES2026040216	\N	0.00	2033.00	\N	\N	cmsbxls65000pe5l5qug5rsua	cmt1ba6j00007agl52vlv2ogc	\N	2026-08-20 09:19:50.815	2026-08-20 09:35:35.355	\N	\N	\N	\N	NEW	[{"id": "17938a11-6811-4e42-a390-eb2e9e108b84", "type": "richText", "content": {"type": "doc", "content": [{"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Vibradorador Mujer Juguetes Eróticos con 10 Modos de Vibración Potentes: Este juguetes sexuales consoladores sexuales mujer grandes tiene un potente motor, motores duales y 10 modos de vibración diferentes, Estimulación clitoriana y vaginal. Este vibradorador mujer puede de slizarse para estimular el punto G y tiene un vibrador de conejo único que puede frotar para proporcionar una doble estimulación, vibrador y estimulador de clítoris para mujer juguete sexual extremo dildos vibradores.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Silencioso y resistente al agua: Consoladores.. para-Mujer-realista menos de 50 decibelios. La Succionador de Femenino xxl clasificacion de impermeabilidad lo hace utilizable en la banera mientras se bana y es facil de limpiar", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Duradero: el Vibradorador Clitoris pequeno producto tiene una bateria de alta capacidad incorporada. Se Juegos Sexuale scinturon puede cargar a traves de un cargador USB y le brindara alrededor de 60 minutos de placer fisico por cada hora y media de carga", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Embalaje cuidadoso: respeta tu privacidad. La informacion confidencial del Vibradorador shopping producto no aparecera en el embalaje exterior. Si tiene alguna pregunta o dificultad con este producto, ino dude en contactarnos!", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Vibrador Multifuncional para un Juego Variado: Nuestro vibradorador clítoris presenta un diseño ergonómico con una curvatura flexible ajustable para una estimulación precisa de su punto G. vibradores para mujer Su bajo nivel de ruido garantiza la seguridad de tus secretos. vibradorador clítoris vibrator Puedes experimentar la gran diversión como nunca antes con el juguete sexual femenino para mujeres. Este exquisito vibradorador mujer juguetes eroticos dildo realista Vibrador es sin duda el regalo ideal para tu pareja.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Vibradores Consoladores con Embalaje Discreto & Servicio After Friendly: El paquete incluye:1*vibrador; 1*Cable de Carga USB; 1*Manual de Usuario. Respetamos y protegemos la privacidad de cada cliente, por lo que nuestros consolador mujer se suministran en embalajes privados. Este es un sex toys male sorpresa y dulce para mujeres, amigas o parejas. Si tienes preguntas o dudas sobre nuestros sexo juguetes sexuales, nuestro equipo de atención al cliente estará encantado de atenderle en 24 horas.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Penes realistas hombre Juguetes sexuales hombre consolador sexual para mujeres pene dildo anal consolador. hombre vibrador mujer sex toy hombre automatico vibrador anal vibrador control remoto vibradores para hombres juguetes eróticos para adultos hombres vibradores control remoto vibrador con mando juguetes eróticos para hombre sexuales vibradores consoladores sexuales mujer vibrator.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsogtmcw00gxagl591zcexte	PRD-00038	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel	hanboli-portable-solid-fragrance-balm-stick-4-scents-smooth-non-sticky-mini-body-perfume-deodorant-cream-for-daily-travel	\N	ACTIVE	XH-C22(4)	\N	0.00	449.00	229.00	\N	cmsbxji5h000oe5l5sdyjoz5g	\N	\N	2026-08-11 09:35:59.6	2026-08-12 09:02:06.786	Portable Solid Perfume Stick, Long Lasting Mini Fragrance Balm for Wom	Mini twist-up solid perfume balm with 4 fresh romantic scents. Compact pocket design, long-lasting light fragrance, hygienic screw tube, affordable daily body fragrance for dating & travel.	https://i.ibb.co/93tvqR7S/cf4bb3925056.jpg	\N	NEW	[{"id": "2bc8048c-234f-4703-a48b-e7240f135ef8", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Name", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "HANBOLI Natural Fragrance Solid Perfume Stick, 7g Portable Body Fragrance Balm", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "HANBOLI solid perfume stick is your on-the-go fragrance essential. Adopting a convenient screw twisting tube design, it avoids messy liquid perfume leaks and keeps your fragrance clean and hygienic. Creamy solid balm melts gently on skin to release soft, non-cloying aroma that lingers all day long. Four unique layered scents cover fresh citrus, aquatic floral, romantic floral and warm woody notes, matching all daily occasions. Tiny lipstick-sized tube fits easily in pockets, purses and makeup bags, perfect for travel, dating, office and daily touch-ups at an affordable price.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Core Advantages", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Twist-up Screw Tube Design, Clean & Hygienic", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " No direct finger contact with fragrance balm, prevent contamination. Easy to control the amount of solid cream, no waste, no liquid leakage trouble.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ 4 Exclusive Layered Fragrances for All Tastes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Each scent is crafted with three-level top, middle and base notes for rich, long-lasting aroma.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Pocket Mini Size, Ultra Portable", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 7g lightweight lipstick-shaped tube, take anywhere for quick fragrance retouch anytime.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Mild Cream Balm, Gentle on Skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Smooth texture glides smoothly on wrists, neck and behind ears, non-greasy, no sticky residue.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Affordable Daily Fragrance", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Budget-friendly solid perfume, ideal as daily scent or small gift for friends, lovers.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Four Available Fragrances Full Notes", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Orange and Summer (Green Tube) – Fresh Citrus Scent", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Top: Yellow Tea Orange, Bergamot", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Middle: Carnation, Jasmine, Mint", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Base: Amber Musk, Oakmoss", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Bright juicy orange aroma mixed with fresh mint, refreshing summer vibe, suitable for daily casual wear.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Another Me (Beige Tube) – Soft Romantic Floral", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Top: Green Leaves, Black Currant, Carnation, Banana", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Middle: Jasmine, Cedar, Lily, Lilac, Rose, Vanilla", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Base: Apricot Peach, Benzoin, Orange Blossom", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Sweet gentle floral blend, soft feminine aroma for dating and parties.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Bacchus' Garden (Red Tube) – Elegant Rich Floral Woody", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Top: Lotus, Pear Watermelon Ketone", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Middle: Lily of Valley, Carnation, Peony, Rose Leaf", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Base: Woody Sandalwood, Amber", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Luxury mature floral woody scent, elegant and lasting, great for formal occasions.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Water of Semporna (Ivory Tube) – Clean Aquatic Scent", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Top: Bamboo, Sea Salt", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Middle: Lavender, Nutmeg, Bergamot", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Base: Patchouli, Ambergris", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Cool fresh ocean aquatic fragrance, calm and neutral, fit for all genders.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Twist up the solid perfume stick gently.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Swipe a thin layer on pulse points: wrist, neck, behind ear, elbow creases.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rub lightly with fingers to warm the balm and amplify the fragrance.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Reapply anytime when scent fades for all-day aroma.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Specifications", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: HANBOLI", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Type: Solid Fragrance Balm / Perfume Stick", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Net Weight: 7g per piece", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Package: Independent color box + twist plastic tube", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Available Scents: Orange and Summer / Another Me / Bacchus' Garden / Water of Semporna", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Texture: Smooth non-greasy solid cream", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Applicable Crowd: Women, daily, travel, dating, gift", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "For external use only, avoid contact with eyes and broken skin.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Store in cool dry place, keep away from high temperature and direct sunlight to prevent melting.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Stop use if skin irritation occurs.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmseuv7eg0033e5l5zhr3jjip	PRD-00006	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display	handheld-foldable-mist-fan-portable-mini-cooling-spray-fan-with-digital-display	Product Highlight\n\nBeat the hot summer with our Handheld Foldable Mist Fan! It combines strong wind cooling and nano mist humidification, bringing you double refreshing experience. Compact foldable body design, lightweight to carry, ideal for daily use, outdoor travel, camping and office.\n\n✅ Nano Atomization Mist Function\n\n\nProduce ultra-fine mist, moisturize your skin while cooling down. Support continuous mist & intermittent mist two modes, prevent dryness in hot weather.\n\n✅ 100 Levels Adjustable Wind Speed\n\n\nWide range speed control from level 1 to 100. Soft gentle breeze for daily skin care, powerful strong wind for intense heat relief, you can adjust airflow freely as you need.\n\n✅ Smart Digital Display Screen\n\n\nHD LED display shows remaining battery clearly at a glance. Real-time power reminder, no more sudden power off trouble.\n\n✅ Foldable & Ultra-lightweight Design\n\n\nOnly 218g weight, lighter than most smartphones. Rotatable fan head, can be handheld or stand on table to free your hands. Easy to put into bags for outdoor trip.\n\n✅ Large 3600mAh Rechargeable Battery\n\n\nLong lasting working time. Built-in high capacity lithium battery, equipped with Type-C fast charging port, convenient to charge with power bank, adapter anywhere.\n\n✅ Detachable 30ml Transparent Water Tank\n\n\nEasy to fill water with matched refill bottle. Simple to clean, leak-proof design ensures safe carrying outside.\n\n✅ Multiple Application Scenarios\n\n\nPerfect for office desk, home use, travel, picnic, hiking, sports, daily commuting. Available in Black / White / Blue colors to choose.\n\nProduct Specifications\n\nItem: Handheld Foldable Mist Fan\nColors: Black, White, Blue\nNet Weight: 218g (±5%)\nDimension: 86.5×29.4×198.5mm\nBattery Capacity: 3600mAh\nTank Volume: 30ml\nRated Input: DC 5.0V/2A\nRated Power: 10W\nCharging Time: About 3 Hours\nMaterial: ABS+PC+PCBA\nPackage Includes: Fan ×1, Lanyard ×1, Type-C Charging Cable ×1, Refill Water Bottle ×1, User Manual ×1\nWarm Tips\n\nPlease use clean pure water for the water tank to avoid nozzle blockage.\nIf you do not use the mist function for a long time, empty the water tank and keep it dry.\nDo not charge the fan while adding water to prevent short circui	ACTIVE	【Y5】XH-E06(3)	\N	0.00	3315.00	1659.00	\N	cmsbuu7ra0008e5l5i8jt4tve	\N	\N	2026-08-04 16:11:26.392	2026-08-13 07:45:29.226	Foldable Handheld Mist Fan, Nano Spray Humidifier, Digital Display	Portable foldable handheld mist fan with nano atomization spray, smart digital battery display, multiple wind speeds, low noise, 3600mAh long-lasting battery, USB rechargeable, ideal for commuting, camping, hiking and daily cooling.	https://i.ibb.co/NgL6mYCb/82372c48e8f8.png	\N	NEW	[{"id": "2a2b42b9-a378-449b-9f33-e0fe0db2cc8e", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "Foldable Handheld Nano Mist Fan | Wind + Mist Dual Cooling", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Beat summer heat with our 2-in-1 portable mist fan. It provides natural airflow together with soothing nano spray, instantly cooling and moisturizing your skin. Foldable rotatable design allows flexible handheld or desktop placement, perfect for travel, shopping, concerts and office use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💧 ", "type": "text"}, {"text": "Nano Ultrasonic Atomization Technology", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Fine mist particles gently hydrate skin, same atomization tech as facial spray instruments. Enjoy cooling wind plus skin moisturization at the same time.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔋 ", "type": "text"}, {"text": "3600mAh Large Battery & Long Endurance", "type": "text", "marks": [{"type": "bold"}]}, {"text": " High-capacity rechargeable battery, maximum 9 hours working time at low wind speed. USB Type-C charging, convenient to power via power bank, charger and laptop.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📊 ", "type": "text"}, {"text": "Smart Digital Battery Display", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Built-in LED screen clearly displays remaining battery percentage, you can check power status at a glance to avoid sudden power off.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔄 ", "type": "text"}, {"text": "Foldable Rotatable Head, 2 Ways to Use", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Adjustable fan head. Fold it to stand on desk for hands-free desktop cooling; unfold to hold in hand while going out. Compact body easy to slip into bags.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌬️ ", "type": "text"}, {"text": "Multiple Wind Speeds & Low Noise Operation", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Adjustable wind gears to meet different cooling demands. Optimized motor structure delivers strong airflow with quiet running, won’t disturb you.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🎨 ", "type": "text"}, {"text": "Fashion Multi-color Selection", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Available in Black, White, Light Blue. Comes with anti-lost lanyard, easy to carry and prevent slipping.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "✅ Core Features • Nano-level mist spray for cooling & hydration • HD digital battery percentage display • 3600mAh battery, up to 9 hours runtime • Foldable rotatable design, handheld & desktop dual use • Multiple adjustable wind speeds, low noise • USB Type-C rechargeable • Equipped with portable anti-lost lanyard • 3 colors optional: Black / White / Blue", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsevs81m0060e5l5x2jq7v6r	PRD-00011	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display	mini-sleep-wireless-earbuds-side-sleeping-no-ear-pressure-bluetooth-headphones	## Product Description\n\n\n### 2025 New Upgraded Mini Non-Pressure Sleep Wireless Earbuds\n\n\nTired of bulky earphones squeezing your ears when you sleep sideways? Our newly designed sleep earphones are crafted exclusively for comfortable all-night rest, combining ultra-mini invisible design, skin-friendly soft silicone material and professional noise cancellation technology, bringing you a quiet and pain-free sleeping experience.\n\n\n### Core Highlights You Will Love\n\n\n✅ **Side-Sleep Friendly Zero Ear Pressure Design**\n\nUltra-curved semi-in-ear tiny shape perfectly fits the auricle contour, no protruding hard parts. You can lie on your side all night without feeling squeezed or painful on ears. Extremely lightweight to wear, you will barely notice wearing earbuds during sleep.\n\n\n✅ **Dual ENC Noise Blocking & Clear Calls**\n\nBuilt-in digital ENC noise reduction chip, effectively block surrounding ambient noise like snoring, traffic noise, household noise. When answering calls outdoors, the algorithm filters background clutter automatically, delivering crisp, loud voice for two-way calls. Ideal for office meetings, daily outgoing calls as well.\n\n\n✅ **Skin-Friendly Soft Silicone Comfort Shell**\n\nThe whole earbud contact part adopts medical-grade soft silicone, gentle and non-irritating to sensitive ear skin, long-time wearing will not cause itching or soreness, perfect for long-hour wear before bedtime.\n\n\n✅ **Ultra Low Latency for Gaming & Video Watching**\n\nOptimized audio transmission chip realizes seamless audio-visual synchronization. No sound delay while playing mobile games, watching dramas and videos, immersive entertainment experience besides sleep use.\n\n\n✅ **Ultra Long Lasting Battery Life**\n\n\n- Single earbud continuous play time: Up to 8 Hours\n\n- Total battery life with charging case: Max 80 Hours\n\n- Standby time: 100 Hours\n\nLED digital power display on charging case lets you check remaining battery anytime, no sudden power off trouble during use.\n\n\n✅ **Visible Digital Power Charging Case**\n\nExquisite mirror transparent lid charging box with LED digital screen, clearly shows battery percentage of both earbuds and case. Compact size easy to put into pockets, bags for travel, outdoor, office carry.\n\n\n### Wide Application Scenarios\n\n\nSleeping, Napping, Night listening to white noise/meditation music, Daily phone calls, Online meetings, Mobile gaming, Commuting travel, Study noise isolation\n\n\n### Package Includes\n\n\n2 × Wireless Sleep Earbuds\n\n1 × Charging Storage Case\n\n1 × USB-C Charging Cable\n\nUser Manual	ACTIVE	【A09】XH-E08(5)	\N	0.00	1699.00	832.00	\N	cmsbv6e000009e5l5j2rdg7gx	\N	\N	2026-08-04 16:37:06.874	2026-08-13 08:06:08.444	Mini Sleep Wireless Earbuds ENC Noise‑Blocking In‑Ear Bluetooth Headph	Mini sleep wireless earbuds, side‑sleep friendly with zero ear pressure, ENC call noise reduction, 80H long battery life, comfortable noise‑blocking for sleeping & daily use.	https://i.ibb.co/35YP0TF2/752804db492b.png	\N	NEW	[{"id": "2290697f-aab1-45b1-824a-c558a336bbd8", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "These ultra‑mini sleep earbuds are specially crafted for side sleepers. Ergonomic tiny‑size design brings zero ear pressure, you can lie on your side comfortably without pain. Built‑in ENC noise‑cancelling mic for crystal‑clear calls, long‑lasting 80‑hour total battery life with LED digital power display. Multiple fashionable colors for your choice.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Key Features", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Side‑Sleep Friendly, No Ear PressureUltra‑small ergonomic shape, no squeezing pain even lying sideways all night. Perfect for sleep, rest and relaxation.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ENC Noise Reduction for Clear CallsENC digital noise‑cancellation technology filters ambient background noise, delivering smooth, crisp voice during phone calls.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ 80H Super Long Battery LifeLarge‑capacity charging case offers up to 80 hours total playback time. LED digital screen shows real‑time remaining power.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Comfort Noise‑BlockingFit snugly inside ear canal, effectively block partial surrounding noise for better sleep quality.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Stable Bluetooth ConnectionReliable Bluetooth connection for music, podcasts, audiobooks and hands‑free calling.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Multiple Trendy ColorsAvailable in black, white, pink, beige, purple to match your daily style.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Package Includes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1 Pair Mini Sleep Earbuds1 Charging Case1 USB Charging Cable1 User Manual", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Suitable for sleeping, napping, travel, office rest, listening to audiobooks and making daily calls.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoh83z100j0agl5o90cs0oj	PRD-00044	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care	bringgreen-hyalu-lip-essence-2pcs-twin-pack-hydrating-lip-balm-non-sticky-shiny-lip-treatment-repair-dry-chapped-lips-care	\N	INACTIVE	XH-C51	\N	0.00	937.17	468.59	\N	cmsbw944g000ge5l547einnjc	\N	\N	2026-08-11 09:47:15.613	2026-08-14 03:33:06.259	2Pcs BRINGGREEN Hyalu Lip Essence Hydrating Lip Balm For Dry Lips	BRINGGREEN lip essence moisturizes chapped lips, lightweight non-sticky clear gel texture. Day & night lip care, portable lip balm twin pack.	https://i.ibb.co/BHDyssZx/def084e190c9.png	\N	NEW	[{"id": "1d3b6209-d862-4ba3-9d02-252afbb5483d", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "BRINGGREEN Hyalu Lip Essence 2 Pack", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Revitalize dry, flaky lips with BRINGGREEN Bamboo Hyalu Lip Essence. This Korean lip essence delivers lasting hydration to soothe chapped lips all day long.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💧 Clear Hydrating Gel Texture", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Smooth, transparent gel formula glides on effortlessly. Creates a glossy plump finish without heavy sticky residue.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌙 Day & Night Lip Repair", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Use in the morning for instant lip hydration. Apply thickly at night as sleeping lip mask to restore dry lips overnight.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🎒 Portable Tube Design", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Compact squeeze tube easily fits inside purses and pockets. Perfect for office touch-ups, travel and daily outings.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Main Benefits", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Deeply moisturize rough & chapped lips", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Boost lip plump glossy shine", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lightweight, non-sticky feeling", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Versatile for daily lip care & overnight lip mask", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📦 Product Info", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Set: 2 Tubes", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Net Weight: 11g per tube", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoijn9e00o3agl5vwza8r6y	PRD-00053	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage	daera-kang-shining-cream-all-in-one-shade-bb-cream-self-adjusting-color-natural-glow-full-coverage	\N	INACTIVE	XH-C07	\N	0.00	1377.00	689.00	\N	cmsbwaevb000he5l532keu9u7	\N	\N	2026-08-11 10:24:13.442	2026-08-14 03:32:37.763	DAERA Kang Shining Cream, Self Adjusting Color BB Cream, Hydrating Glo	DAERA Kang Shining Cream serum BB cream with self-adjusting color technology. Infused with Hyaluronic Acid & Vitamin E, delivers natural glowing coverage, conceals blemishes, non-caking, long-lasting radiant finish for light-medium skin.	https://i.ibb.co/tpGbY7Q1/55d0ba7453d7.jpg	\N	NEW	[{"id": "bcacaa63-5199-4c3e-b047-11dc5c9a41cb", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "DAERA Kang Shining Cream | Flawless Skin Glow Serum BB Cream", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "One shade naturally matches light to medium skin tone, creating effortless glowing makeup look.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Self-Adjusting Color Technology No need to pick complicated shades. The pink beige tone melts seamlessly into your complexion. The color adjusts naturally based on usage amount and blending time, suitable for light, neutral and medium skin tones.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💎 Perfect Coverage, Lightweight Breathable Covers blemishes, redness and uneven skin tone evenly. Smooth texture does not settle into pores, non-caking, zero heavy & stuffy feeling. Long-lasting clear radiant finish, no oxidation darkening throughout the day.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💧 Nourishing Beauty Ingredients", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Vitamin E: Soothes and protects skin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "5 Types Hyaluronic Acid: Delivers deep long-lasting hydration", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Vegetable Oil: Boosts moisturization, prevents dry makeup", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💡 All-in-one Shining Cream Acts as primer, foundation and skincare cream. Achieve natural luminous skin without heavy foundation. Dermatologist tested, friendly for daily makeup.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📝 How to Use After basic skincare, take an appropriate amount and spread evenly on face. Blend gently, wait minutes for color to adjust naturally.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📌 Suitable For Light to medium skin tones, all skin types; daily commuting, casual natural makeup.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "卖点短句（可直接用于主图）", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "One universal shade fits light-medium skin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Self-adjusting color technology", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Hydrating & long-lasting glow", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Conceal blemishes, redness & uneven tone", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Non-caking, non-oxidizing, breathable coverage", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsohnm8t00l8agl5zgtygsm3	PRD-00048	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide	medicube-collagen-night-wrapping-mask-75ml-overnight-sleeping-mask-firm-anti-aging-hydrating-peel-off-mask-with-collagen-niacinamide	\N	INACTIVE	XH-C26	\N	0.00	916.00	459.00	\N	cmsbwaevb000he5l532keu9u7	\N	\N	2026-08-11 09:59:19.133	2026-08-14 03:32:57.269	Collagen Night Wrapping Mask Overnight Firming Hydrating Sleeping Mask	Korean collagen peel-off sleeping mask boosts elasticity, plumps fine lines, brightens pores, overnight anti-aging skincare mask 75ml.	https://i.ibb.co/20RmpmVn/2d99a6ca956e.jpg	\N	NEW	[{"id": "3e60bc2a-0636-4729-abf3-b1d21dc74e44", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Medicube Collagen Night Wrapping Mask is an award-winning overnight peel-off sleeping mask from Korea, featured as 2024 OneDayOne Beauty Editor’s Pick. Formulated with premium collagen extract and multi-benefit skincare ingredients, it forms a transparent wrapping film on your skin while you sleep, locking in nutrients all night long. Wake up with plump, firm, glowing, smooth youthful skin, minimizing fine lines, large pores and dullness. The lightweight gel texture dries into a thin peelable sheet without stickiness, perfect for all skin types including dry, combination and sensitive skin.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Core Powerful Ingredients", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Collagen Extract", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Boost skin elasticity, smooth wrinkles, fade fine lines, restore bouncy youthful facial contour.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Hyaluronic Acid", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Deeply hydrate dry skin, plump dehydrated areas, reduce dry fine lines caused by water loss.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Niacinamide", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Refine rough skin texture, blur visible pores, even out uneven tone, deliver long-lasting radiant glow.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Ceramide NP", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Strengthen damaged skin barrier, lock internal moisture, shield skin from external environmental irritants.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Glycerin", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Long-lasting hydration relief, prevent tight dryness, keep skin soft and supple overnight.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Main Skin Benefits", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Overnight wrapping film locks nutrients for 8-hour deep repair", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Anti-aging effect: Lift sagging skin, diminish fine lines & wrinkles", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Intense hydration: Eliminate dry, tight, flaky skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Pore minimizing: Niacinamide refines enlarged pores & smooths texture", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Brightening complex: Fix dull, uneven skin tone for luminous glow", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Barrier repair: Ceramide & glycerin soothe sensitive weak skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Peel-off design: No sticky residue, easy to remove or rinse off in the morning", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Award-winning Korean skincare mask, trusted beauty editor recommendation", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Step-by-Step Usage Guide", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Complete basic skincare: Apply toner, then regular moisturizer.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Evenly spread a proper layer of collagen mask across full face, avoid eye and mouth areas.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " *Note: The silicone applicator brush is NOT included with this product.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Leave it for 15 minutes until fully dried into a transparent wrapping film.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Go to sleep with the mask on your face overnight.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Next morning, peel off the film gently or rinse face with warm water.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Specifications", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: medicube", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Item: Collagen Night Wrapping Mask", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Net Volume: 75ml / 2.53 fl.oz", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Usage Type: Overnight peel-off sleeping mask", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Target Concerns: Fine lines, sagging, dryness, dullness, visible pores, weak skin barrier", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Suitable Skin: All skin types (dry, oily, combination, sensitive)", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Use 2–3 times weekly for stable anti-aging and moisturizing effects.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Do not apply to broken, irritated or wounded facial skin.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Avoid direct contact with eyes; rinse thoroughly if product enters eyes.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Store in cool dry place away from direct sunlight and high temperature.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Discontinue use immediately if redness, itch or discomfort occurs.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoh19kk00i4agl5ku3dkyb8	PRD-00041	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types	pure-gentle-cleansing-oil-deep-dissolve-makeup-blackheads-nourishing-refreshing-non-irritating-cleansing-oil-for-all-skin-types	\N	INACTIVE	XH-C23	\N	0.00	2169.00	1089.00	\N	cmsbvns7g000de5l5xxrw4a1u	\N	\N	2026-08-11 09:41:56.276	2026-08-14 03:33:11.508	Pure Cleansing Oil, Gentle Makeup Remover for Blackheads & Sebum	Lightweight cleansing oil melts all makeup, dissolves blackheads & excess sebum. Nourishes skin, non-irritating, leaves refreshed glowing complexion for all skin types.	https://i.ibb.co/nMypzk9g/a1faf7c88850.jpg	\N	NEW	[{"id": "44437b12-eace-4dba-8ead-dcb2e690edb8", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Name", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "ma:nyo Pure Cleansing Oil, Nourishing Refreshing Makeup Remover Oil", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Intro", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "ma:nyo Pure Cleansing Oil delivers powerful yet mild facial cleansing for daily makeup removal. This lightweight oil formula effortlessly melts waterproof foundation, lipstick, sunscreen and stubborn facial impurities. It deeply dissolves clogged pores, excess sebum and blackheads without stripping skin’s natural protective barrier. Infused with nourishing ingredients, it hydrates dull complexions during cleansing, leaving skin soft, bright and refreshed instead of tight or dry. Suitable for sensitive, oily, combination and normal skin for daily use.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Core Benefits", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ All-in-One Makeup Remover", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Dissolves full face makeup, sunscreen and long-wear cosmetics in seconds, one-step facial cleansing.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Clear Pores & Improve Blackheads", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Oil-soluble formula breaks down pore-clogging sebum, gradually fades blackheads and whiteheads, controls shine.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Gentle Nourishing Formula", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Mild non-irritating texture, no harsh surfactants. Hydrates dry skin, revives dull, tired complexions.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Quick Water Emulsification", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Rinses off completely without greasy residue, no sticky film left on skin.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Comfortable After-Cleanse Feel", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Skin stays smooth, hydrated and luminous instead of taut or dry post-wash.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "3 Main Functions", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Complete Makeup Removal", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Dissolve all daily makeup, sunscreen and surface dirt in one cleanse to lift skin impurities thoroughly.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brightening & Revitalizing", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Deeply nourish skin cells, fade dullness and restore natural glowing skin tone after cleansing.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Oil Control & Deep Pore Cleansing", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Melt surplus facial oil, unclog pores, visibly improve blackheads, whiteheads and breakouts.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Dry hands & dry face, take proper amount of cleansing oil with pump.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Massage evenly over face for 30-60 seconds to melt makeup and dissolve pore sebum.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Add a little water to emulsify the oil into milky liquid.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rinse fully with warm water, follow with facial cleanser if needed.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Details", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: ma:nyo", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Product: Pure Cleansing Oil", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Effect: Makeup Removing, Blackhead Clearing, Oil Control, Skin Nourishing", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Texture: Lightweight transparent golden cleansing oil", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Skin Type: All skin types, including sensitive skin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Feature: Non-greasy, fast emulsify, non-drying", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Tips", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Use on dry skin for optimal makeup melting effect.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Avoid direct contact with eyes; rinse thoroughly if accidental contact occurs.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Store in cool, shaded place away from high temperature.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsog05sv00dtagl56fzqqbsg	PRD-00032	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth	veet-bikini-area-hair-removal-cream-infused-avocado-extract-gentle-depilatory-for-sensitive-skin-14-days-smooth	\N	INACTIVE	XH-C19	\N	0.00	1749.00	879.00	\N	cmsbx4ci7000le5l5oe9dim0u	\N	\N	2026-08-11 09:13:05.119	2026-08-14 03:33:39.759	Veet Professional Bikini Hair Removal Cream 50ml, Gentle Depilatory fo	Veet Bikini intimate hair removal cream for sensitive skin! Fast 2 mins depilation, avocado extract soothes skin, delays regrowth up to 14 days, erase coarse pubic hair without dark spots, 50ml travel size for private body areas.	https://i.ibb.co/qLrRt8mX/9245f40c7c22.jpg	\N	NEW	[{"id": "622be575-4171-4ff2-9313-3496bd673085", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Name", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Veet Professional Intimate Bikini Hair Removal Cream, 50ml for Sensitive Skin", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Tired of prickly coarse intimate hair, razor bumps and dark spots after shaving? This upgraded Veet bikini depilatory cream is specially formulated for private sensitive zones, designed to dissolve thick coarse hair gently without damaging your delicate skin. Infused with nourishing avocado extract, it delivers silky smooth long-lasting results with zero harsh irritation.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Core Benefits", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Specially Formulated for Coarse Intimate Hair", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Powerful yet mild formula efficiently breaks down thick bikini & pubic hair follicles, effortlessly wipe away stubborn coarse hair in minutes, no painful plucking or razor cuts.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ 2-Minute Fast Acting, Time-Saving", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Quick depilation process only needs 2 minutes waiting, perfect for busy daily routines, home self-beauty without salon visits.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ 14 Days Long-Lasting Smooth Skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Dual-effect hair regrowth delay technology slows down hair regrowth by 2x. 74% users report regrown hair becomes finer & softer after use, keep skin smooth up to 14 days.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ No Dark Spots & Gentle Care", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Enriched with avocado soothing essence, prevents post-depilation dark marks, redness and ingrown hairs. Low-irritation formula fits sensitive intimate skin perfectly.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Safe for Private Bikini Zones", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Professionally developed for intimate areas, mild pH-balanced texture, no strong chemical burning sensation, ideal for underarm, bikini line and private body parts.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✅ Portable 50ml Travel Size", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Compact 50ml squeeze tube, lightweight for travel, business trips and daily makeup bags, easy to store and carry anywhere.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Clean and fully dry your bikini/intimate skin area before application.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Apply a thick even layer of cream to fully cover all hair, do not rub into skin.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Wait 2 minutes, test a small spot with the spatula; extend to max 6 minutes if hair is extra coarse.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Wipe off cream & hair with a damp cloth, rinse skin thoroughly with warm water (no soap).", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Pat skin dry gently, avoid tight clothing or harsh skincare for 24 hours post-use.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Specs", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Brand: Veet", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Item: Professional Bikini Intimate Hair Removal Cream", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Net Weight: 50ml", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Skin Type: Sensitive Skin, All Skin Types", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Main Ingredient: Avocado Extract", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Application Area: Bikini Line, Private Intimate Zones, Underarms", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Reminders", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Do patch test on small skin area 24hrs before full use to avoid allergy.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Do not exceed 6 minutes of staying time on skin.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Stop using immediately if stinging, redness or irritation occurs.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Keep out of reach of children, external use only.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoexnlq009lagl56g2pim8q	PRD-00020	éLL Multi-effect Toning Cream, Natural Brightening Lazy Face Cream	ell-multi-effect-toning-cream-natural-brightening-lazy-face-cream	\N	INACTIVE	XH-C02	\N	0.00	865.00	432.00	\N	cmsbwaevb000he5l532keu9u7	\N	\N	2026-08-11 08:43:08.606	2026-08-14 03:33:57.759	éLL Multi-effect Toning Sunscreen Cream SPF33 PA++, 6-in-1 Lazy Face C	6-in-1 multifunctional tinted sunscreen SPF33 PA++. Acts as sunscreen, primer, tone up cream & light foundation. Light texture, natural brightening without grey cast, non-caking, waterproof & sweatproof, ideal for daily no-makeup look.	https://i.ibb.co/ks3z5Qy7/83c14c879c8a.jpg	\N	NEW	[{"id": "85bdf1a3-fa59-483d-b52e-ad45a6f935a4", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "éLL Light and Transparent Whitening Sunscreen Toning Cream SPF33 PA++", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "All-in-one lazy daily essential, integrates sunscreen, makeup primer, tone-up lotion, light foundation, nourishing essence cream and plain face cream. Simplify your morning routine.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🌟 Core Advantages ✅ SPF33 PA++ UV Protection Defend against daily ultraviolet rays, relieve sun damage for everyday outdoor use. ✅ Natural Brightening, No Ghost White Evens dull complexion, delivers translucent healthy glow, seamlessly matches skin tone. ✅ Smooth Texture, No Pilling Silky lightweight texture, easy to blend, adheres closely to skin without rubbing mud. ✅ Waterproof & Sweat Resistant Long-wearing nude makeup finish, less makeup transfer, suitable for all-day wear. ✅ Multi-effect Nourishing Gentle moisturizing, soothes skin while brightening, reduces the burden of stacked makeup. ✅ No Heavy Makeup Feeling Achieve effortless \\"no-makeup makeup\\", great for office, travel and casual outings.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📖 How To Use After basic skincare, take an appropriate amount and evenly spread over face. Can be used alone as plain cream, or as a primer before foundation.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📌 Suitable For All skin types; people who prefer lightweight natural makeup, lazy daily makeup, students and office workers.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "⚠️ Warm Reminders", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "For external facial use only.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Avoid contact with eyes.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Stop use immediately if redness or irritation occurs.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmseupxoj002re5l5ll7imhj2	PRD-00005	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan	s001-vortex-high-speed-handheld-portable-fan	### 🔥 Upgraded S001 | Class-Leading Turbo Wind Performance\n\n\nOur flagship S001 portable handheld fan is fully upgraded with self-developed wind generation system, far superior to ordinary mini fans available on the market. Equipped with aviation-grade DC brushless high-speed motor (max 10000 RPM), 6-blade turbine fan shaft + giant air duct airflow structure:\n\n✅ Max wind speed up to **8.0m/s** pro-level strong breeze\n\n✅ Wind blowing distance increased by 20%, airflow efficiency boosted 20%\n\n✅ Scientific airflow segmentation, cool wind reaches far without harsh blowing sensation\n\nGreat for fighting hot humid weather in Bangladesh, instantly cool down your face, neck & body under blazing sun.\n\n\n### ✨ Premium Gun-Style Ergonomic Fashion Design\n\n\nAdopts classic pistol gun streamlined outlook with matte dual-tone texture body, stylish minimalist professional look that fits all people:\n\n▪ Total weight only **220g**: ultra-lightweight, no hand soreness even holding for hours\n\n▪ 4 trendy color options: Metallic Grey, White, Pink, Blue, match your daily outfits perfectly\n\n▪ Smooth matte finish: anti-slip, fingerprint-resistant, comfortable handheld grip\n\nIdeal accessory for students, office ladies, travelers & outdoor lovers.\n\n\n### 📱 Smart Digital LED External Display Screen\n\n\nExclusive real-time digital outer screen design you can barely find on similar products:\n\n✔ Clearly shows remaining battery percentage + current wind speed level\n\n✔ Check power status anytime, no more worrying about sudden power off outdoors\n\n✔ Delicate circular screen layout, high-end tech visual experience\n\n\n### 🔋 12 Hours Long Endurance Battery | Safe & Convenient Charging\n\n\nBuilt-in high-density 1200mAh rechargeable lithium-ion battery, optimized power consumption system brings outstanding battery life:\n\n▪ Adjustable runtime: 1 Hour ~ 12 Hours non-stop breeze based on different wind gears\n\n▪ Support Type-C fast charging, full charge only takes 2.5 hours\n\n▪ Works while charging available\n\n▪ Certified lithium battery, compliant with aviation rules: allowed to carry on airplane, train, bus, metro, totally safe for your domestic & international trips\n\n\n### 🛡️ 6-Layer Comprehensive Battery Safety Protection System\n\n\nBuilt-in intelligent AI control chip with 6-fold high-energy safety protection mechanism to avoid all potential risks during use & charging:\n\n\n1. Overvoltage Protection\n\n2. Overcurrent Protection\n\n3. Overcharge Protection\n\n4. Over-discharge Protection\n\n5. High Temperature Protection\n\n6. Short Circuit Protection\n\nEffectively prevent overheating, battery swelling & circuit damage, use the fan safely all summer long.\n\n\n### 🎛️ Humanized Fine Details & Multi Practical Functions\n\n\nEvery detail is polished for comfortable daily use:\n\n\n1. **One-Touch Wind Speed Control Buttons**: Easily increase/decrease wind gears to customize airflow as you like\n\n2. **Independent Safety Lock Switch**: Power-off lock design to avoid accidental touch power on in your bag\n\n3. **Encrypted Protective Grille**: Compact inner fan cover prevents finger/hair entanglement, safe for kids & long hair users\n\n4. **Reserved Hanging Hole**: Can attach lanyard/strap to hang on wrist or backpack, free your hands easily\n\n\n### 📌 Wide Application Scenarios for Bangladesh Daily Life\n\n\nPerfect for all hot humid occasions in Bangladesh:\n\n✅ Daily office indoor cooling\n\n✅ University campus, classroom study use\n\n✅ Commuting by bus, rickshaw, bike under sun\n\n✅ Outdoor picnic, travel, hiking, beach trips\n\n✅ Makeup setting breeze for ladies\n\n✅ Outdoor sports, cricket match watching & more\n\n\n---\n\n\n## Complete Product Specifications Table\n\n\n\n| Item | Detailed Parameter |\n\n| --- | --- |\n\n| Product Model | S001 Small Wind Cannon Handheld Fan |\n\n| Net Weight | 220 Grams |\n\n| Battery Capacity | 1200mAh Lithium-ion Battery |\n\n| Motor Type | 2-Phase Self-developed DC Brushless Motor |\n\n| Max Wind Speed | 8.0 m/s |\n\n| Full Charging Time | 2.5 Hours |\n\n| Working Duration | 1h - 12h (adjustable by wind speed) |\n\n| Charging Port | Type-C USB Port |\n\n| Available Colors | Metallic Grey, White, Pink, Blue |\n\n| Safety Feature | 6-layer AI chip battery protection |\n\n\n---\n\n\n## Package Includes\n\n\n1 x S001 Handheld Turbo Fan\n\n1 x Type-C Charging Cable\n\n1 x User Manual	ACTIVE	【S001】XH-E04(4)	\N	0.00	2069.00	1030.00	\N	cmsbuu7ra0008e5l5i8jt4tve	\N	\N	2026-08-04 16:07:20.515	2026-08-13 01:44:30.276	10000RPM High Speed Handheld Fan, Digital Display, 1200mAh USB Recharg	Lightweight 220g handheld turbo fan with aviation-grade motor up to 10000RPM, 8m/s strong airflow, LED digital display, 12h long endurance, USB rechargeable, quiet portable cooler for commuting, camping & outdoor activities.	https://i.ibb.co/7JFFg5v7/1bf108392dff.png	\N	NEW	[{"id": "024a00cd-e156-406d-85b2-57917abf8a3c", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": null}, "content": [{"text": "S001 Turbo High-Speed Handheld Cooling Fan", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Beat the heat anywhere with our upgraded S001 portable handheld fan. Adopting turbine air duct structure and aviation-grade motor, it delivers concentrated strong wind while keeping low noise. Compact, lightweight and travel-friendly, perfect for daily commuting, hiking, shopping, concerts and vacations.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "💨 ", "type": "text"}, {"text": "10000RPM Aviation-Grade Brushless Motor", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Self-developed high efficiency motor reaches up to 10000 RPM. 6-blade turbine fan and optimized air channel create 8.0m/s focused icy airflow, bringing instant powerful cooling effect.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🔋 ", "type": "text"}, {"text": "1200mAh Battery & Up to 12H Endurance", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Large capacity lithium battery offers long-lasting cooling. Only 2.5 hours full charge time. USB Type-C rechargeable, easily powered by power bank, charger and laptop.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "📱 ", "type": "text"}, {"text": "LED Smart Digital Display", "type": "text", "marks": [{"type": "bold"}]}, {"text": " External high-definition screen intuitively displays remaining power and wind speed level, clearly check status at a glance.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🪶 ", "type": "text"}, {"text": "220g Ultra-Light Portable Design", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Ergonomic gun-shaped handle, comfortable to hold for long time. Matte texture shell with dual-tone fashion design. Available in White, Pink, Purple, Blue. Easy to put into backpack or handbag.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "🤫 ", "type": "text"}, {"text": "Quiet Operation & Safe Structure", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Optimized airflow noise reduction design, stable running without harsh noise. Safe structure, permitted on airplanes and high-speed trains.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Main Features", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Max 10000 RPM high-speed brushless motor", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "8.0m/s concentrated strong airflow", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "LED digital power & wind speed display", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1200mAh battery, up to 12 hours runtime", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "220g lightweight ergonomic body", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "USB Type-C fast charging", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Multiple fashionable colors optional", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Low noise, portable for outdoor travel", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Image Short Slogans（Can be used for infographic）", "type": "text"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Max 10000RPM Powerful Motor", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "8.0m/s Turbo Concentrated Wind", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "LED Digital Real-time Display", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "12 Hours Long Lasting Cooling", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "220g Lightweight Portable", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "USB Rechargeable Travel Fan", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsevi0i4004we5l5dfi04msm	PRD-00009	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin	wireless-earbuds-with-mirror-smart-display-bluetooth-5-1-earphones-hifi-stereo-sound	### Wireless Earbuds with Mirror Smart Display\n\n\nThese wireless earbuds are designed for everyday music listening, calls, gaming, and travel. They feature a mirror smart display charging case that shows the battery level clearly, so you can easily check the remaining power before going out.\n\n\n---\n\n\n### Key Features\n\n\n- **Mirror Smart Display**\n\nThe charging case is equipped with a high-definition mirror smart display that shows the battery level of the earbuds and the charging case. This makes it convenient to know when to charge.\n\n- **HIFI Stereo Sound**\n\nThese earbuds deliver clear stereo sound quality, suitable for listening to music, watching videos, and enjoying game audio.\n\n- **Auto Smart Connection**\n\nAfter the first pairing, the earbuds can automatically connect to your device when you open the charging case. This provides a quicker and more convenient user experience.\n\n- **Bluetooth 5.1 Connection**\n\nWith Bluetooth 5.1 technology, the earbuds can maintain a stable wireless connection with your smartphone, tablet, or other compatible devices.\n\n- **Ergonomic In-Ear Design**\n\nThe earbuds are designed to fit comfortably in the ears, which may help reduce discomfort during long-time wearing.\n\n- **Large Capacity Charging Case**\n\nThe compact charging case has a large-capacity battery, providing extra power for the earbuds during daily use and travel.\n\n- **Built-In Microphone**\n\nThe earbuds include a built-in microphone, allowing you to make hands-free calls and use voice chat during gaming.\n\n- **Portable and Compact Design**\n\nThe small-sized charging case is easy to carry in a pocket, bag, or purse, making it suitable for daily commute, travel, and outdoor use.\n\n\n---\n\n\n### Specifications\n\n\n- **Product Type:** Wireless Earbuds\n\n- **Connectivity:** Bluetooth 5.1\n\n- **Display:** Mirror Smart Digital Display\n\n- **Sound Quality:** HIFI Stereo Sound\n\n- **Features:** Auto Pairing, Built-In Mic, Large Capacity Charging Case\n\n- **Wearing Style:** In-Ear\n\n- **Use For:** Music, Video, Calls, Gaming, Commute, Travel\n\n- **Charging Case:** Included\n\n- **USB Charging Cable:** Included\n\n- **User Manual:** Included\n\n- **Color:** Black\n\n- **Package Contents:** 1 Pair Earbuds, 1 Charging Case, 1 USB Charging Cable, 1 User Manual\n\n\n---\n\n\n### Package Contents\n\n\n- 1 Pair Wireless Earbuds\n\n- 1 Charging Case\n\n- 1 USB Charging Cable\n\n- 1 User Manual	ACTIVE	【S20】XH-E12-1	\N	0.00	1499.00	899.00	\N	cmsbv6e000009e5l5j2rdg7gx	\N	\N	2026-08-04 16:29:10.54	2026-08-13 01:45:55.854	TWS Wireless Earbuds Bluetooth 5.1 Mirror Digital Display HIFI Stereo	TWS Wireless Bluetooth Earbuds built with Bluetooth 5.1 chip for stable and fast connection. Equipped with mirror smart digital display, you can clearly check power of earbuds and charging case anytime. Ergonomic in-ear design brings comfortable wearing experience.	https://i.ibb.co/0yvw6MBZ/ae18ab03e033.png	\N	NEW	[{"id": "135c6241-e2bd-4089-bb0a-9a666acdd630", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Overview", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "TWS Wireless Bluetooth Earbuds built with Bluetooth 5.1 chip for stable and fast connection. Equipped with mirror smart digital display, you can clearly check power of earbuds and charging case anytime. Ergonomic in-ear design brings comfortable wearing experience.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Key Features", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Mirror Smart Digital Display Real-time power display for left earbud, right earbud and charging cabin. ✅ Bluetooth 5.1 Technology Faster pairing, stable signal transmission, low latency for gaming & music. ✅ Auto Smart Connection Take earbuds out, auto connect to your paired device instantly. ✅ HIFI Stereo Sound Deliver clear stereo audio, bring immersive listening experience. ✅ Large Capacity Charging Case Support long endurance, portable for daily travel, work and outdoor activity. ✅ Comfortable In-ear Fit Lightweight structure, not easy to fall off during sports.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Package Includes", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "1 Pair Wireless Earbuds 1 Charging Case 1 USB Charging Cable 1 User Manual", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmseu3qbo0017e5l5bwq7dfg8	PRD-00002	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan	m57-ice-bucket-portable-fan	18°C Cold Wind Portable Fan 100 Level 1S Fast Cooling 10M/S High Speed Wind 3600mAh Rechargeable Mini Fan for Summer Outdoor Travel Home Office\n1. `STUNNING DETAILS`\n\n2. `100 Level Adjustment`\n\n3. `1S Cool Through the Whole Body`\n\n4. `Refrigerated Ice Pack`\n\n5. `Air Conditioning Level Cooling Experience`\n\n6. `-18°C Extremely Cold Wind`\n\n7. `10M/S High-Speed Wind`\n\n8. `3600mAh Super Endurance`\n\n9. `Superconducting Refrigeration Ice Ceramic`\n\n10. `Type-C Charging Port`\n\n11. `Liquid Crystal Display`	ACTIVE	【M57】XH-E07(2)	\N	0.00	3022.00	1499.00	\N	cmsbuu7ra0008e5l5i8jt4tve	\N	\N	2026-08-04 15:50:04.548	2026-08-13 09:02:47.159	M57 Turbofan Ice Bucket Mini Fan	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan	https://i.ibb.co/mrd12m2H/fe11f242a18d.png	\N	NEW	[{"id": "7c75bea0-c91b-4693-8ff7-25d528aea786", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Product Detailed Description", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Beat the summer heat instantly with our Turbo Handheld Ice Cooling Fan! Designed for portable personal cooling, this compact wind cannon delivers powerful icy airflow to keep you refreshed wherever you go.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Semiconductor Ice Sensing Cooling Technology", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Built-in advanced ice sensing chip supports instant cooling effect, bringing icy wind close to 18°C. Feel comfortable cold breeze in seconds, effectively lowering skin temperature on sweltering hot days.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "10m/s Ultra High-Speed Turbo Wind", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Turbocharged motor generates powerful airflow up to 10 meters per second. Say goodbye to weak short-distance wind of ordinary mini fans. The concentrated airflow can reach far, bringing thorough cooling experience.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "100 Levels Infinite Wind Speed Adjustment", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Freely customize wind power from gentle natural breeze to super strong turbo wind. Meet all cooling demands whether you need soft wind for daily use or max power for intense heat. Digital LED screen displays remaining battery clearly for easy status check.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "3600mAh Large-Capacity Rechargeable Battery", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Super endurance built-in battery supports long-lasting continuous operation. Perfect for outdoor activities, travel, hiking, commuting, theme park visits and daily errands without frequent charging.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Ergonomic Pocket-Sized Portable Design", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Lightweight handheld shape fits comfortably in your palm. Easy to slip into bags, backpacks or large pockets. Available in classic black and elegant white to match your style.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Wide Application Scenarios", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Ideal for outdoor sports, shopping, traveling, camping, waiting in line, office use and more. A must-have summer essential for adults. Also a thoughtful practical gift for family and friends.", "type": "text"}]}, {"type": "horizontalRule"}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Short Version (For Listing Bullet Points / Social Media)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Stay cool all summer long with our Turbo Handheld Ice Cooling Fan!", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ❄️ Semiconductor cooling chip creates icy cold airflow for rapid heat relief", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 💨 Turbo motor outputs up to 10m/s concentrated high-speed wind", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 🎛️ 100-speed stepless adjustment with digital power display", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 🔋 3600mAh rechargeable battery for all-day cooling", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " ✈️ Compact lightweight handheld design, easy to carry outdoors", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 🎨 2 stylish color options: Matte Black & Cream White", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Great for travel, commuting, camping, outdoor sports and daily use.", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Marketing Copy (Advertising Caption, suitable for main image & video)", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Small Ice Bucket Turbo Fan | Ultra High-Speed Personal Mini Air Cooler", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " 1 second whole-body icy refreshment", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Powerful turbo wind, endless cooling all summer!", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsogk55r00foagl5q5glcqoy	PRD-00036	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling	mise-en-scene-perfect-hair-oil-serum-prevent-hair-breakage-less-tangling-create-glassy-hair-heat-protection-before-hair-styling	\N	INACTIVE	XH-C08	\N	0.00	1694.00	847.00	\N	cmsbwi4iw000ie5l530ku4mjg	\N	\N	2026-08-11 09:28:37.407	2026-08-14 03:33:16.293	Mise En Scene Perfect Serum Original Hair Serum, Anti-Frizz Heat Prote	Mise En Scene Perfect Serum Original is Korea’s best-selling hair serum. Formulated with 7 naturally-derived oils, it delivers 7-in-1 hair repair benefits. Protect hair from heat styling, tame frizz, minimize breakage and tangles, instantly soften rough hair and boost long-lasting glass hair shine. Features fresh white	https://i.ibb.co/JjHkt5R1/61c53f1f7bb3.jpg	\N	NEW	[{"id": "98252261-a819-41e9-a2e9-30737db977c4", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Mise En Scene Perfect Serum Original Hair Serum 110ml", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Korea No.1 Offline Selling Hair Serum, trusted by countless users. Enriched with 7 naturally-derived oils: Argan Oil, Coconut Oil, Jojoba Oil, Marula Oil, Olive Oil, Camelia Oil, Apricot Oil. The lightweight formula quickly absorbs without sticky residue.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ 446°F Heat Protection before blow-dry & flat iron styling ✅ 62% Reduction in hair breakage ✅ 89% Less tangles for easy combing ✅ 7 Repair Effects: Anti-frizz, Smooth, Shiny, Tangle-Free, Strengthen Hair, Improve Elasticity, Repair Split Ends ✅ Instantly revive bleached, dyed, heat-damaged dry hair ✅ Elegant White Floral Scent: Green Apple & Citrus top note, white flower middle note, mild musk base note ✅ Suitable for all hair types: fine, normal, thick, curly, colored & bleached hair", "type": "text"}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "How To Use", "type": "text"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Damp hair: Take 2–3 pumps, apply evenly on hair ends before blow-drying for heat defense.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Dry hair: Rub serum between palms, gently smooth onto mid-lengths and ends to eliminate frizz and add shine.", "type": "text"}]}]}]}, {"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Warm Reminder", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "For external use only. Avoid direct contact with eyes. Stop usage if scalp irritation occurs. Packaging may be updated, the formula and quality remain unchanged.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsoevgwh009aagl52j0rq6cj	PRD-00019	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin	bobbi-brown-vitamin-enriched-face-base-primer-moisturizer	\N	INACTIVE	XH-C29	\N	0.00	2292.68	1146.34	\N	cmsbviuvp000be5l5qsuzeuup	\N	\N	2026-08-11 08:41:26.609	2026-08-14 03:33:58.63	Bobbi Brown Vitamin Enriched Face Base Primer Moisturizer Cream	Bobbi Brown Enriched Face Base, 2-in-1 moisturizer & makeup primer. Smooth pores, prevent cakey makeup, long-lasting hydrating base for all skin types.	https://i.ibb.co/y7rbG2T/2cf99e3430e6.jpg	\N	NEW	[{"id": "8486e37a-560f-4415-8ad5-f47d7764312d", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Bobbi Brown Enriched Face Base", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "The iconic orange cream that acts as both moisturizer and makeup primer!", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Formulated with shea butter, squalane, hyaluronic acid and compound vitamins, it delivers long-lasting hydration to dry skin.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✨ Key Benefits", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Eliminate cakey & patchy makeup, your ultimate makeup savior", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Smooth pores and uneven texture for soft-focus skin", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Rich ice cream texture with natural citrus aroma", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Lock in moisture, resist dryness and oxidation", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Lightweight, breathable formula, no heavy greasy feeling", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Helps foundation adhere evenly, all-day makeup stays fresh without darkening", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "How to Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "1. Take an appropriate amount on fingertips, apply from inner cheeks outward all over face before foundation.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "2. Perfect for dry & combination skin, ideal for daily makeup prep.", "type": "text"}]}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsoj3j1500pnagl5wqrdje4j	PRD-00056	BROLAMEN Collagenase Microbubble Essence Mask, 30s Absorption Anti-Wrinkle Firming Bubble Facial Mask	brolamen-collagenase-microbubble-essence-mask-30s-absorption-anti-wrinkle-firming-bubble-facial-mask	\N	INACTIVE	XH-C12	\N	0.00	1100.00	550.00	\N	cmsbwaevb000he5l532keu9u7	\N	\N	2026-08-11 10:39:41.081	2026-08-14 03:35:10.773	Collagenase Microbubble Essence Mask, 30 Seconds Absorb No-rinse Bubbl	Collagenase microbubble essence mask creates delicate foam, 30 seconds fast absorption, no need to wash. It firms skin, reduces fine lines, improves dull and rough skin for daily facial care.	https://i.ibb.co/vvjpm27j/462447f47ea8.jpg	\N	NEW	[{"id": "2582c7f6-25c9-48fb-aea8-9a6929562436", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "BROLAMEN Collagenase Microbubble Essence No-rinse Bubble Mask", "type": "text", "marks": [{"type": "bold"}]}, {"text": " Enjoy convenient bubble skin care at home with our microbubble essence mask. Just press to produce rich, silky foam that gently wraps your skin. Achieve effective absorption in 30 seconds, no washing required after use, saving your daily skincare time.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Rich in premium skin-loving ingredients including nicotinamide, centella asiatica extract and betaine. The formula helps lift and firm skin, relieve fine lines, improve dullness, dryness and uneven rough skin, restoring soft, tender and luminous facial skin.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Rich fine foam, gentle skin contact ✅ 30 seconds fast penetration & absorption ✅ No-rinse design, easy for daily & lazy skincare ✅ Anti-wrinkle & firming, minimize dry fine lines ✅ Brightens dull complexion, smooth rough texture ✅ Suitable for most skin types, home bubble facial SPA", "type": "text"}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "💡 How to Use: Press an appropriate amount of mask foam onto your face, spread evenly over clean skin. Let it absorb fully for about 30 seconds, no need to rinse off, follow with regular skincare routine.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": true, "containerStyle": "contained"}]
cmsss0aae0077kjl52qq7n6tz	PRD-00064	Double Layer Sewing Supplies Storage Bag, Large Capacity Craft Organizer Tote with Removable Dividers, Adjustable Shoulder Strap	double-layer-sewing-supplies-storage-bag-large-capacity-craft-organizer-tote-with-removable-dividers-adjustable-shoulder-strap	\N	ACTIVE	XH-B15(5)	\N	0.00	5093.34	2546.67	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 10:00:11.03	2026-08-14 10:07:54.082	Large Capacity Storage Bag Craft Organizer Tote with Shoulder Strap	Large double-layer sewing storage bag holds threads, scissors & craft tools. Removable dividers, portable shoulder strap, waterproof fabric, ideal for sewing hobbyists. Available in multiple colors.	\N	\N	NEW	[{"id": "1f0a12d5-71b4-44ba-a759-df148b1e0696", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Sewing Supplies Storage Bag | Large Craft Organizer Tote", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Keep all your sewing, embroidery and craft supplies neatly organized in this multi-compartment sewing storage bag. Designed for hobby sewers, crafters and DIY lovers, this double-layer tote offers generous storage space for thread spools, scissors, needles, buttons, measuring tapes and more.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Large & Flexible Storage", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Comes with 2 removable padded dividers. Freely adjust the inner space to fit small craft accessories or large thread rolls. Double-layer structure separates different items to avoid mess. Multiple built-in mesh pockets and elastic loops store scissors, pins and small gadgets within easy reach.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Portable Design for Travel & Home Use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Equipped with a sturdy top handle and an adjustable detachable shoulder strap. Carry it by hand or wear it crossbody. Perfect for home sewing, craft classes, outdoor workshops and travel. Front and side pockets provide extra quick-access storage.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Premium Durable Material", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Made of lightweight waterproof fabric with thick inner lining and smooth double zippers. Wear-resistant, easy to wipe clean, protects your sewing tools from dust and minor moisture.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ Multiple Color Options", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "Available in Purple, Black, Pink, Grey and Flower Pattern to match your preference. Great gift choice for sewing enthusiasts, embroidery lovers and craft beginners.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsss8zpn0079kjl5b7eajgfk	PRD-00065	Lightweight Quilted Sling Bag, Multi Pocket Water Resistant Crossbody Chest Bag for Travel Daily	lightweight-quilted-sling-bag-multi-pocket-water-resistant-crossbody-chest-bag-for-travel-daily	\N	ACTIVE	XH-B10	\N	0.00	2628.00	1314.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 10:06:57.227	2026-08-14 10:08:49.335	Women Quilted Puffer Sling Bag, Water Resistant Multi Pocket Crossbody	Lightweight padded sling crossbody bag with multiple pockets, reversible adjustable strap and water-resistant fabric. Spacious small chest bag for travel, shopping, daily commute, fits large smartphones.	https://i.ibb.co/hJQRQMdW/15871f785356.png	\N	NEW	[{"id": "a336326c-b474-4e57-9e32-876a88f59a69", "type": "richText", "content": {"type": "doc", "content": [{"type": "heading", "attrs": {"level": 3, "textAlign": null}, "content": [{"text": "Product Description", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This lightweight quilted sling crossbody bag brings you a convenient hands-free carrying solution for daily commuting, shopping, short trips and outdoor activities.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Multi-Pocket Storage Design", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Multiple independent compartments including main storage space, built-in card slots, front zipper pocket, side water bottle holder and anti-theft back zipper pocket. Keep your smartphone, power bank, cards, keys, small cosmetics neatly organized.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Adjustable & Reversible Shoulder Strap", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Equipped with wide padded adjustable shoulder strap, the strap can switch sides freely to wear on left or right shoulder, greatly improving wearing comfort for long time use.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Water-Resistant Quilted Fabric", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Made of premium water-repellent padded nylon material. The smooth zippers ensure easy access to belongings, and the soft puffer texture maintains stylish appearance while protecting your items from light rain.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Compact & Portable Size", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Fits up to iPhone 16 Pro and most large smartphones. Slim lightweight structure won’t add extra burden, perfect for women daily outing, travel, walking and sightseeing.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅ ", "type": "text"}, {"text": "Versatile Occasions", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": " Works great as chest bag, crossbody shoulder bag and small sling backpack. Ideal for daily errands, weekend getaway, gym, hiking and city travel.", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmssrges5005okjl576m671fd	PRD-00062	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use	oxford-cloth-fanny-pack-multi-pocket-water-resistant-waist-bag-adjustable-belt-pouch-for-travel-sports-daily-use	\N	ACTIVE	XH-B07(4)	\N	0.00	2039.00	1019.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 09:44:43.733	2026-08-15 08:52:48.618	Oxford cloth waist bag, adjustable waistband pocket	Lightweight water‑resistant oxford waist fanny pack with multi‑pockets. Adjustable strap, earphone hole, perfect for travel, jogging and daily outdoor activities.	https://i.ibb.co/tpZvRCn3/cf69b27e8e5b.jpg	\N	NEW	[{"id": "a2d577fc-4290-4162-b09d-7fc6bfa52438", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "This practical fanny pack is made of durable water‑resistant oxford cloth, lightweight and wear‑resistant for long‑time daily use. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅Multiple Storage Pockets: Large main compartment, hidden back pocket, front zipper pocket and inner pocket, keep your phone, cash, keys, passport well‑organized.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅Humanized Design: Built‑in earphone hole, key chain hook, smooth zipper, durable quick‑release buckle, safety reflective loop for night outdoor use. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅Adjustable Strap: Flexible waist belt fits different waist sizes, can be worn as waist bag, crossbody chest bag. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅Wide Application: Ideal for jogging, hiking, travel, shopping, walking dog and daily commuting for men & women. Material: Oxford Fabric ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Colors: Black / Dark Grey / Light Grey / Pink", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmsst1v85008tkjl5t4nfcd0c	PRD-00068	Dual Pocket Mini Wristlet Pouch, Waterproof Nylon Small Coin Purse with Hand Strap, Portable Card Key Earphone Lipstick Storage Bag	dual-pocket-mini-wristlet-pouch-waterproof-nylon-small-coin-purse-with-hand-strap-portable-card-key-earphone-lipstick-storage-bag	\N	ACTIVE	XH-B13(8)	\N	0.00	1630.89	815.44	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 10:29:24.437	2026-08-14 10:29:24.437	Dual Mini Coin Purse Waterproof Wristlet Card Key Storage Pouches	Waterproof double mini pouch set with wrist strap. Portable coin purse holds cards, keys, earphones & lipstick. Multi-color available for daily outdoor use.	\N	\N	NEW	[{"id": "d4b83268-66bc-43db-8477-2400644b886e", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Dual Mini Storage Pouches with Wrist Strap", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Our double mini wrist pouch set combines practicality and minimalist style. Made of premium waterproof nylon fabric, it effectively resists water splashes to protect your small belongings.", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "✅ Detachable extended wrist lanyard for easy carrying", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "✅ Smooth durable zipper for frequent daily use", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "✅ Two independent zipper pouches to separate items", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "✅ Compact but roomy, ideal for keys, cards, cash, earphones, lipstick", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "heading", "attrs": {"level": 2, "textAlign": null}, "content": [{"text": "✅ 8 matching color combinations for your choice", "type": "text", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Lightweight and portable, perfect for walking, shopping, gym, travel and daily casual outings. A great small accessory bag for women.", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmssscbxy0084kjl5pnyxtdil	PRD-00066	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards	portable-oxford-tech-organizer-pouch-multi-compartment-travel-storage-bag-for-cables-earphones-sd-cards	\N	ACTIVE	XH-B09(2)	\N	0.00	3579.00	1789.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 10:09:33.046	2026-08-15 08:22:00.731	Portable Organizer Pouch Travel Electronic Accessories Storage Bag	Portable oxford tech organizer pouch with multi‑compartment, store cables, earphones, SD cards. Durable zipper for travel & daily electronic accessories storage.	https://i.ibb.co/3ywm31zR/c9df30641c4c.jpg	\N	NEW	[{"id": "a900d41a-f8e1-4a32-8cca-64a7a14bed29", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Portable tech organizer pouch made of wear‑resistant oxford fabric, ideal for sorting your small electronic accessories during travel and daily use. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅Multiple Elastic Straps: Securely hold various charging cables, preventing tangling. ✅Multi‑Layer Inner Pockets: Separate slots for earphones, SD memory cards, adapters and small gadgets. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅Smooth Metal Zipper: Durable full‑zip closure for easy opening and safe storage. ✅Compact Hand‑held Size: Lightweight design, easy to slip into backpack, laptop bag or suitcase. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅Fine Workmanship: Neat stitching, scratch‑resistant outer material for long‑time service. Perfect for business trips, outdoor travel, office and home desktop storage. Keep your electronic accessories neat and easy to find. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Material: Oxford Fabric ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Colors: Black / Beige ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Application: Cables, Earphones, SD Cards, Adapters, Small Tech Gadgets", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
cmssrsdry0060kjl5mhqtt9tg	PRD-00063	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag	30l-large-insulated-cooler-tote-bag-triple-layer-thermal-reusable-shopping-picnic-food-bag	\N	ACTIVE	XH-B08(3)	\N	0.00	4598.00	2299.00	\N	cmsbvkhqt000ce5l5q9p16gm0	\N	\N	2026-08-14 09:54:02.302	2026-08-15 08:50:56.273	30L Large Insulated Cooler Tote Thermal Picnic Shopping Food Bag	30L large insulated cooler tote bag with triple‑layer insulation, keeps ice 8 hours. Heavy‑duty zipper for picnic, grocery shopping & food transport.	https://i.ibb.co/WvqH7qZ5/2219c9dc8a5f.jpg	\N	NEW	[{"id": "a158140d-cbfb-4428-8c80-22cc31195f03", "type": "richText", "content": {"type": "doc", "content": [{"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Large 30L insulated cooler tote bag built with triple‑layer thermal insulation, keeps ice cold up to 8 hours for drinks, groceries and meals. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅Heavy‑Duty Zipper: Secure full‑zip closure prevents cold air escape. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅Flexible Carry Handles: Can carry food horizontally, fits pizza boxes easily. ✅Spacious Capacity: Oversized space for groceries, picnic supplies and daily food storage. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "✅Durable Oxford Fabric: Water‑resistant exterior, wear‑resistant for long‑term reuse. ✅Front Outer Pocket: Convenient extra pocket for small accessories. Perfect for grocery shopping, picnic, camping, food delivery and family outdoor trips. ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Material: Oxford Cloth ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Capacity: 30L ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Colors: Black / Dark Grey / Light Grey / Heather Grey ", "type": "text"}]}, {"type": "paragraph", "attrs": {"textAlign": null}, "content": [{"text": "Size: 21\\"×17\\"×14\\"", "type": "text"}]}]}, "spacing": "medium", "isVisible": false, "containerStyle": "contained"}]
\.


--
-- TOC entry 3895 (class 0 OID 24849)
-- Dependencies: 225
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductImage" (id, "productId", url, alt, "position", "createdAt") FROM stdin;
cmsr8ef4v001ekjl53001kzcy	cmsevbgyr003te5l5k1blh6hk	https://i.ibb.co/9mty6Y8G/cf11cf78c836.png	Wireless Gaming Earbuds with LED Digital Power Display	0	2026-08-13 08:03:31.999
cmsr8ef4v001fkjl5k1r74phh	cmsevbgyr003te5l5k1blh6hk	https://i.ibb.co/0x7p67b/fd66e31078cd.jpg	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls image 2	1	2026-08-13 08:03:31.999
cmsr8ef4v001gkjl5pyfq2c5z	cmsevbgyr003te5l5k1blh6hk	https://i.ibb.co/s9S3dCDJ/1a3f1c2a96cb.jpg	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls image 3	2	2026-08-13 08:03:31.999
cmsr8ef4v001hkjl58oq9v4ts	cmsevbgyr003te5l5k1blh6hk	https://i.ibb.co/4gZnGbFF/b91133409516.jpg	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls image 4	3	2026-08-13 08:03:31.999
cmsr8ef4v001ikjl5rksqdibi	cmsevbgyr003te5l5k1blh6hk	https://i.ibb.co/DgVSmYfs/0fac1acb5a0c.jpg	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls image 5	4	2026-08-13 08:03:31.999
cmsr8ef4v001jkjl55vc0izof	cmsevbgyr003te5l5k1blh6hk	https://i.ibb.co/4wymDhRH/6514ddc5ec89.jpg	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls image 6	5	2026-08-13 08:03:31.999
cmsr8ef4v001kkjl5y4p7cnmy	cmsevbgyr003te5l5k1blh6hk	https://i.ibb.co/wFq1G6Dv/8a64eb365560.jpg	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls image 7	6	2026-08-13 08:03:31.999
cmsr8ef4v001lkjl5jidopoy4	cmsevbgyr003te5l5k1blh6hk	https://i.ibb.co/SXsCFvXS/cf6604793d7c.jpg	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls image 8	7	2026-08-13 08:03:31.999
cmsr8ef4v001mkjl5reu9w6rv	cmsevbgyr003te5l5k1blh6hk	https://i.ibb.co/vxhLPwRK/e3fad64b5001.jpg	Dual Mode Wireless Gaming Earbuds LED Digital Display HIFI Stereo Earphones Built-in Microphone for Game Calls image 9	8	2026-08-13 08:03:31.999
cmsr8hsgf001nkjl57upvclnx	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/fVnQKyRS/9f09326c0df0.png	Mini Sleep Wireless Earbuds, Side Sleeping No Ear Pressure Bluetooth Headphones	0	2026-08-13 08:06:09.231
cmsr8hsgf001okjl5o3h3v8nz	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/8D4BqNW9/55f60a0e9173.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 2	1	2026-08-13 08:06:09.231
cmsr8hsgf001pkjl5ghodbl1l	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/BHMPQW4r/732694e1c5ef.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 3	2	2026-08-13 08:06:09.231
cmsr8hsgf001qkjl56w6saicu	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/PZWt0950/bd88a07cdfbc.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 4	3	2026-08-13 08:06:09.231
cmsr8hsgf001rkjl5pp4su0xo	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/r2vLH2rs/73871e750adc.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 5	4	2026-08-13 08:06:09.231
cmspt3qwh0063ejl5e9udxev3	cmsohctdv00k8agl5w501bhdv	https://i.ibb.co/tP2YpryV/8fb73ad9f5c6.jpg	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g	0	2026-08-12 08:07:33.617
cmspt3qwh0064ejl51p1exaq3	cmsohctdv00k8agl5w501bhdv	https://i.ibb.co/HTyqgLpk/2b939cb146b8.jpg	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g image 2	1	2026-08-12 08:07:33.617
cmspt3qwh0065ejl5tzetp2vq	cmsohctdv00k8agl5w501bhdv	https://i.ibb.co/tTZLyQQ9/ca2de97dcfe8.jpg	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g image 3	2	2026-08-12 08:07:33.617
cmspt3qwh0066ejl5y9odtne1	cmsohctdv00k8agl5w501bhdv	https://i.ibb.co/2Rx7T88/d3d8ce0c9c4a.jpg	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g image 4	3	2026-08-12 08:07:33.617
cmspt3qwh0067ejl5nxrezxwd	cmsohctdv00k8agl5w501bhdv	https://i.ibb.co/tT32fpgQ/baeaf56acb6c.jpg	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g image 5	4	2026-08-12 08:07:33.617
cmspt3qwh0068ejl5hv2dd299	cmsohctdv00k8agl5w501bhdv	https://i.ibb.co/xqhnWQcg/033f0c41e55d.jpg	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g image 6	5	2026-08-12 08:07:33.617
cmspt3qwh0069ejl5p3v2vgi5	cmsohctdv00k8agl5w501bhdv	https://i.ibb.co/t9CZJtr/d9cae645fb93.jpg	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g image 7	6	2026-08-12 08:07:33.617
cmsssa8cc007pkjl5riblsbgb	cmsss0aae0077kjl52qq7n6tz	https://i.ibb.co/xqw1vB77/3128ce72aadf.jpg	Double Layer Sewing Supplies Storage Bag, Large Capacity Craft Organizer Tote with Removable Dividers, Adjustable Shoulder Strap	0	2026-08-14 10:07:55.068
cmsssa8cc007qkjl5ro5bny2r	cmsss0aae0077kjl52qq7n6tz	https://i.ibb.co/h197bxrm/79bb76d54b47.jpg	Double Layer Sewing Supplies Storage Bag, Large Capacity Craft Organizer Tote with Removable Dividers, Adjustable Shoulder Strap image 2	1	2026-08-14 10:07:55.068
cmspt3qwh006aejl5sb1o9xtj	cmsohctdv00k8agl5w501bhdv	https://i.ibb.co/HL9NTJh1/7306dd2d6d61.jpg	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g image 8	7	2026-08-12 08:07:33.617
cmspt3qwh006bejl5cl396392	cmsohctdv00k8agl5w501bhdv	https://i.ibb.co/nN75qyZR/32b395f38084.jpg	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g image 9	8	2026-08-12 08:07:33.617
cmspqu1z9001zejl5s0w0lojd	cmsof41qn00a3agl50g9g1u37	https://i.ibb.co/PGLhKJHH/0ad438f58936.jpg	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance	0	2026-08-12 07:04:02.181
cmspqu1z90020ejl55rhfqn5p	cmsof41qn00a3agl50g9g1u37	https://i.ibb.co/qMfC13zY/e097be12f9e0.jpg	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance image 2	1	2026-08-12 07:04:02.181
cmspqu1z90021ejl5krwj7683	cmsof41qn00a3agl50g9g1u37	https://i.ibb.co/QBWh7kh/968583fe8d34.jpg	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance image 3	2	2026-08-12 07:04:02.181
cmspqu1z90022ejl5i2aziudt	cmsof41qn00a3agl50g9g1u37	https://i.ibb.co/KjpskjSR/08a2d2785544.jpg	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance image 4	3	2026-08-12 07:04:02.181
cmsr8hsgf001skjl58ozjz9hg	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/cSjdL8pp/499cb5b720c6.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 6	5	2026-08-13 08:06:09.231
cmsr8hsgf001tkjl5ivxfx86b	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/LdCf9hfK/c5ee053331dc.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 7	6	2026-08-13 08:06:09.231
cmsquv04q00frejl5fiuovvnj	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/bRMMQ2B3/f2c94997b4f9.png	S001 Vortex High Speed Handheld Portable Fan	0	2026-08-13 01:44:31.082
cmspqu1z90023ejl58tkx6yss	cmsof41qn00a3agl50g9g1u37	https://i.ibb.co/XxCR78BN/ce99979ed5b7.jpg	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance image 5	4	2026-08-12 07:04:02.181
cmspqu1z90024ejl5637yii0v	cmsof41qn00a3agl50g9g1u37	https://i.ibb.co/GQ48Hf49/46df76c0ef4a.jpg	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance image 6	5	2026-08-12 07:04:02.181
cmspqu1z90025ejl5rffngkeo	cmsof41qn00a3agl50g9g1u37	https://i.ibb.co/fYDgBSSy/ef209aed0725.jpg	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance image 7	6	2026-08-12 07:04:02.181
cmspqu1z90026ejl5ama4sqkw	cmsof41qn00a3agl50g9g1u37	https://i.ibb.co/BHfW832L/5566aa78bf7c.jpg	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance image 8	7	2026-08-12 07:04:02.181
cmsquv04q00fsejl5uanmppjo	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/j9GT0BwS/08e98c68262a.jpg	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 2	1	2026-08-13 01:44:31.082
cmsquv04q00ftejl509e755na	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/QFGXYjNz/bbf180e1e402.jpg	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 3	2	2026-08-13 01:44:31.082
cmsquv04q00fuejl5gtmc24zv	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/5dpJDK1/8e2a09a6802a.jpg	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 4	3	2026-08-13 01:44:31.082
cmsquv04q00fvejl5j4e3sqs0	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/fd4JgTKk/f6e642b18d4a.jpg	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 5	4	2026-08-13 01:44:31.082
cmsquv04q00fwejl5wl1lvwvi	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/m5tz3zWN/0bca0660408f.jpg	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 6	5	2026-08-13 01:44:31.082
cmspuwl4a00akejl58q1v9bmk	cmsoehmj20087agl5jk2ykc8c	https://i.ibb.co/n86RZr0y/3e68100daf09.jpg	Jurlique Rose Shower Gel & Body Lotion Set Moisturizing	0	2026-08-12 08:57:58.762
cmspuwl4a00alejl5kdg60hzx	cmsoehmj20087agl5jk2ykc8c	https://i.ibb.co/nsdrJYPK/504da7d0c6f3.png	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin image 2	1	2026-08-12 08:57:58.762
cmspuwl4a00amejl5g7nj4uwj	cmsoehmj20087agl5jk2ykc8c	https://i.ibb.co/dnKc5VM/7c99872b5f25.jpg	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin image 3	2	2026-08-12 08:57:58.762
cmspuwl4a00anejl5mniyy96s	cmsoehmj20087agl5jk2ykc8c	https://i.ibb.co/21ZyGyHJ/9e692e513866.png	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin image 4	3	2026-08-12 08:57:58.762
cmspuwl4a00aoejl56vjqn2q6	cmsoehmj20087agl5jk2ykc8c	https://i.ibb.co/Q7Tc36QD/6e899ad3959d.png	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin image 5	4	2026-08-12 08:57:58.762
cmspuwl4a00apejl5qy304y3b	cmsoehmj20087agl5jk2ykc8c	https://i.ibb.co/zH8dSpd6/4218eee7d52a.jpg	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin image 6	5	2026-08-12 08:57:58.762
cmspuwl4a00aqejl5rsse79vv	cmsoehmj20087agl5jk2ykc8c	https://i.ibb.co/BK2g7rWz/68239d9b4f09.jpg	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin image 7	6	2026-08-12 08:57:58.762
cmspt3qwh006cejl5l0ax6mkc	cmsohctdv00k8agl5w501bhdv	https://i.ibb.co/rR8Gp6mN/8f8796d65457.jpg	Vitamin Lubricating Moisturizing Cream with Provitamin B5, Hydrate Dry Skin, Smooth Rough Body Skin, 500g image 10	9	2026-08-12 08:07:33.617
cmspt9mt3006mejl5z5em3qgk	cmsogf0wi00ehagl5c8ip2jhh	https://i.ibb.co/1GxmtNxx/126d6990f354.png	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics	0	2026-08-12 08:12:08.247
cmspt9mt3006nejl5bdx24sjm	cmsogf0wi00ehagl5c8ip2jhh	https://i.ibb.co/MydMKcDs/e1c0e5c4b8bc.png	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics image 2	1	2026-08-12 08:12:08.247
cmspt9mt3006oejl5kadsu6p0	cmsogf0wi00ehagl5c8ip2jhh	https://i.ibb.co/Qjr38bsv/123ad2c525fc.png	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics image 3	2	2026-08-12 08:12:08.247
cmspt9mt3006pejl59k6391yi	cmsogf0wi00ehagl5c8ip2jhh	https://i.ibb.co/d0Wvkg1h/866873ad7a4f.png	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics image 4	3	2026-08-12 08:12:08.247
cmspt9mt3006qejl5j8qwwcco	cmsogf0wi00ehagl5c8ip2jhh	https://i.ibb.co/mrb0tJPk/a92a01de7134.png	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics image 5	4	2026-08-12 08:12:08.247
cmspt9mt3006rejl5201cmy42	cmsogf0wi00ehagl5c8ip2jhh	https://i.ibb.co/zTDTKvyr/219637ca6a3b.png	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics image 6	5	2026-08-12 08:12:08.247
cmspt9mt3006sejl5hlskkw6u	cmsogf0wi00ehagl5c8ip2jhh	https://i.ibb.co/3m810rCw/566c966dca80.png	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics image 7	6	2026-08-12 08:12:08.247
cmspt9mt3006tejl5qpi8ubrv	cmsogf0wi00ehagl5c8ip2jhh	https://i.ibb.co/spfD4tnK/9226a4e8fa20.png	Mirror Gloss Lipstick Hydrating Non-Drying Long Lasting Shiny Lip Balm Moisturizing Nude Lip Makeup For Daily Women Cosmetics image 8	7	2026-08-12 08:12:08.247
cmspqu1z90027ejl5ffhczqrf	cmsof41qn00a3agl50g9g1u37	https://i.ibb.co/7xmRNrVv/a34f2715b015.jpg	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance image 9	8	2026-08-12 07:04:02.181
cmspqu1z90028ejl59n2g2rxj	cmsof41qn00a3agl50g9g1u37	https://i.ibb.co/R4MHvNzf/92de29560720.jpg	WARMKISS Moto Cloud Rose Perfume Elegant Ice Texture Bottle Portable Long Lasting Romantic Daily Fragrance image 10	9	2026-08-12 07:04:02.181
cmsptbn98006uejl55kjtmwti	cmsogwt6m00hoagl5lnwfynhh	https://i.ibb.co/p6PwRXN6/510f6afdcc51.jpg	Mens Hair Styling Volume Powder, Long Lasting Fluffy Texture, Oil Absorbing Dry Powder, Create Natural Hairstyle For Daily Use	0	2026-08-12 08:13:42.14
cmsptevy9006vejl5b8puy7dh	cmsogrtr600glagl5qv6xfqrp	https://i.ibb.co/yMBg0F6/1768683cb9fd.png	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine	0	2026-08-12 08:16:13.377
cmsptevy9006wejl58f1jqvca	cmsogrtr600glagl5qv6xfqrp	https://i.ibb.co/pBk1sTD2/4efcefb7d747.png	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine image 2	1	2026-08-12 08:16:13.377
cmsptevy9006xejl5ox1lkoy0	cmsogrtr600glagl5qv6xfqrp	https://i.ibb.co/BHCdkFYZ/a1e06fcf5147.jpg	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine image 3	2	2026-08-12 08:16:13.377
cmsquv04q00fxejl5j40q1ris	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/W4cMHGrY/9508365e25cd.jpg	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 7	6	2026-08-13 01:44:31.082
cmsquv04q00fyejl5y0ejnp7e	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/rfH7SGWb/a20a9dd5855b.jpg	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 8	7	2026-08-13 01:44:31.082
cmspuwl4a00arejl5g4j9fbf4	cmsoehmj20087agl5jk2ykc8c	https://i.ibb.co/jkWnCY47/69321fc3aeb1.jpg	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin image 8	7	2026-08-12 08:57:58.762
cmsquv04q00fzejl51uotl6ib	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/xKNWvvws/96d9c858c547.jpg	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 9	8	2026-08-13 01:44:31.082
cmsquv04q00g0ejl5nbpqoqg8	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/xt6LksgS/51a9d99b0a32.jpg	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 10	9	2026-08-13 01:44:31.082
cmsquv04q00g1ejl5oy86jczg	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/wr2h8xpZ/fa27fdcc571e.jpg	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 11	10	2026-08-13 01:44:31.082
cmsquv04q00g2ejl536c7nwtu	cmseupxoj002re5l5ll7imhj2	https://i.ibb.co/7JFFg5v7/1bf108392dff.png	S001 Vortex Handheld Fan 10000RPM Strong Airflow 2400mAh LED Display Rechargeable Pocket Mini Fan image 12	11	2026-08-13 01:44:31.082
cmsr8hsgf001ukjl5d1yz18g7	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/wFKV5Yrz/13bdd4d77780.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 8	7	2026-08-13 08:06:09.231
cmsr8hsgf001vkjl50gz40g5q	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/FLv4Q5BM/95219b208401.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 9	8	2026-08-13 08:06:09.231
cmsr8hsgf001wkjl5ap3hyuax	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/5XFwMmRG/7c2cbd142c8e.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 10	9	2026-08-13 08:06:09.231
cmsr8hsgf001xkjl5ye2yy9ax	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/tTB64sCB/afbc1b8d999d.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 11	10	2026-08-13 08:06:09.231
cmsr8hsgf001ykjl5y42pynrk	cmsevs81m0060e5l5x2jq7v6r	https://i.ibb.co/B5btWc0j/f668b2b06097.jpg	Mini Sleep Wireless Earbuds ENC Noise Cancelling Invisible Soft Silicone Bluetooth Headphones Digital Power Display image 12	11	2026-08-13 08:06:09.231
cmspt89xj006dejl5j2ng5dqk	cmsoh3oex00ioagl5pupua3xq	https://i.ibb.co/ZpT2p8Cv/c6df9863dd6a.jpg	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer	0	2026-08-12 08:11:04.903
cmspt89xj006eejl5sgjkz2j2	cmsoh3oex00ioagl5pupua3xq	https://i.ibb.co/whNvz2qT/d931ec4eb8a0.jpg	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer image 2	1	2026-08-12 08:11:04.903
cmspt89xj006fejl55otbnrav	cmsoh3oex00ioagl5pupua3xq	https://i.ibb.co/RGN6snNr/6e5e9408fabc.jpg	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer image 3	2	2026-08-12 08:11:04.903
cmspt89xj006gejl5k1bgfdau	cmsoh3oex00ioagl5pupua3xq	https://i.ibb.co/TB074XbR/86eccd4077d8.jpg	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer image 4	3	2026-08-12 08:11:04.903
cmspr0bfg002iejl5zkftskuv	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/spXR4TS3/30f2ae68d1f7.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types	0	2026-08-12 07:08:54.364
cmspuwl4a00asejl509j39kbt	cmsoehmj20087agl5jk2ykc8c	https://i.ibb.co/0RTGSDqG/8e737e270d92.jpg	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin image 9	8	2026-08-12 08:57:58.762
cmspuwl4a00atejl5qj045ui0	cmsoehmj20087agl5jk2ykc8c	https://i.ibb.co/HpFHNZ1n/d52dad54e3d2.jpg	Jurlique Rose Softening Shower Gel & Body Lotion Set Gentle Cleansing Long Lasting Rose Fragrance Moisturizing Nourishing Body Care For Dry Skin image 10	9	2026-08-12 08:57:58.762
cmspr0bfg002jejl5eeybv070	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/s9J4MPS3/e7c269c3d36b.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types image 2	1	2026-08-12 07:08:54.364
cmsssa8cc007rkjl55hey2gus	cmsss0aae0077kjl52qq7n6tz	https://i.ibb.co/G4PBt2k4/74e492ef6f78.jpg	Double Layer Sewing Supplies Storage Bag, Large Capacity Craft Organizer Tote with Removable Dividers, Adjustable Shoulder Strap image 3	2	2026-08-14 10:07:55.068
cmsssa8cc007skjl5r5a9e4x2	cmsss0aae0077kjl52qq7n6tz	https://i.ibb.co/NgLkd3Vw/584a8dcc3309.jpg	Double Layer Sewing Supplies Storage Bag, Large Capacity Craft Organizer Tote with Removable Dividers, Adjustable Shoulder Strap image 4	3	2026-08-14 10:07:55.068
cmsssa8cc007tkjl55kmvdkog	cmsss0aae0077kjl52qq7n6tz	https://i.ibb.co/Ld3LxKc3/b883456c3bd7.jpg	Double Layer Sewing Supplies Storage Bag, Large Capacity Craft Organizer Tote with Removable Dividers, Adjustable Shoulder Strap image 5	4	2026-08-14 10:07:55.068
cmsssa8cc007ukjl5c47t925q	cmsss0aae0077kjl52qq7n6tz	https://i.ibb.co/F4PLyP9q/171e1d25d0ec.jpg	Double Layer Sewing Supplies Storage Bag, Large Capacity Craft Organizer Tote with Removable Dividers, Adjustable Shoulder Strap image 6	5	2026-08-14 10:07:55.068
cmspr0bfg002kejl5iogwsm75	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/gZJxcwxT/211b050967f9.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types image 3	2	2026-08-12 07:08:54.364
cmspr0bfg002lejl59fbnputn	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/9kgGzy0R/ed38d7c02008.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types image 4	3	2026-08-12 07:08:54.364
cmspr0bfg002mejl5fgen9wut	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/bMvjxr9g/a8744bc0f716.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types image 5	4	2026-08-12 07:08:54.364
cmspr0bfg002nejl5d900tszh	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/FkX2jCRC/98b9a8eab8e9.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types image 6	5	2026-08-12 07:08:54.364
cmsssa8cc007vkjl546zn9adw	cmsss0aae0077kjl52qq7n6tz	https://i.ibb.co/DfJg80Kc/ec36aaf3ce4b.jpg	Double Layer Sewing Supplies Storage Bag, Large Capacity Craft Organizer Tote with Removable Dividers, Adjustable Shoulder Strap image 7	6	2026-08-14 10:07:55.068
cmsssbeml007xkjl5yqu0yr01	cmsss8zpn0079kjl5b7eajgfk	https://i.ibb.co/tngzqF3/18415ffd5f96.png	Lightweight Quilted Sling Bag, Multi Pocket Water Resistant Crossbody Chest Bag for Travel Daily	0	2026-08-14 10:08:49.869
cmsssbeml007ykjl5rflkhab0	cmsss8zpn0079kjl5b7eajgfk	https://i.ibb.co/7JDNKW5D/4008dae9725e.png	Lightweight Quilted Sling Bag, Multi Pocket Water Resistant Crossbody Chest Bag for Travel Daily image 2	1	2026-08-14 10:08:49.869
cmsssbeml007zkjl572yutytl	cmsss8zpn0079kjl5b7eajgfk	https://i.ibb.co/67q4wYY3/d205c0f88239.webp	Lightweight Quilted Sling Bag, Multi Pocket Water Resistant Crossbody Chest Bag for Travel Daily image 3	2	2026-08-14 10:08:49.869
cmsssbeml0080kjl5fo8udlv4	cmsss8zpn0079kjl5b7eajgfk	https://i.ibb.co/WC0GJBZ/142a5216ce8d.webp	Lightweight Quilted Sling Bag, Multi Pocket Water Resistant Crossbody Chest Bag for Travel Daily image 4	3	2026-08-14 10:08:49.869
cmsssbeml0081kjl5u9zcpznk	cmsss8zpn0079kjl5b7eajgfk	https://i.ibb.co/ynMc5pqJ/bd7defb2b0dd.webp	Lightweight Quilted Sling Bag, Multi Pocket Water Resistant Crossbody Chest Bag for Travel Daily image 5	4	2026-08-14 10:08:49.869
cmsssbeml0082kjl5csaq51qt	cmsss8zpn0079kjl5b7eajgfk	https://i.ibb.co/RGKBjjPY/dc01210b9441.webp	Lightweight Quilted Sling Bag, Multi Pocket Water Resistant Crossbody Chest Bag for Travel Daily image 6	5	2026-08-14 10:08:49.869
cmsssbeml0083kjl5ewt7w7ab	cmsss8zpn0079kjl5b7eajgfk	https://i.ibb.co/8nXWSGZ0/cabfdeeb8168.webp	Lightweight Quilted Sling Bag, Multi Pocket Water Resistant Crossbody Chest Bag for Travel Daily image 7	6	2026-08-14 10:08:49.869
cmspr0bfg002oejl5hrcmb1oe	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/sJFXg9nV/f661c422933f.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types image 7	6	2026-08-12 07:08:54.364
cmspr0bfg002pejl56xf3x9yh	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/2JzRvJT/960fc8bdb614.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types image 8	7	2026-08-12 07:08:54.364
cmspr0bfg002qejl50x8vq3ri	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/TDv7T97c/621894b777fa.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types image 9	8	2026-08-12 07:08:54.364
cmspr0bfg002rejl503lqio09	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/nqW6LDvW/548d0eadcc34.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types image 10	9	2026-08-12 07:08:54.364
cmspr0bfg002sejl5qn6hul6g	cmsofgbzd00bkagl5xnah2eno	https://i.ibb.co/84TPpbK3/08d95355e1bf.jpg	SKIN1004 Centella Tone Brightening Capsule Ampoule Over 27M Sold Gentle Brightening Serum For All Skin Types image 11	10	2026-08-12 07:08:54.364
cmspsw8aq005lejl5tolgu4yt	cmsoh39dg00ieagl5qprj3v16	https://i.ibb.co/3KTTwGL/b462899c0339.jpg	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care image 3	2	2026-08-12 08:01:42.914
cmsr8su2r001zkjl5xxqh6dgk	cmsoefl0a007uagl52wuho36v	https://i.ibb.co/f3GbhDj/79919ea0a2ea.png	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy	0	2026-08-13 08:14:44.547
cmsr8su2r0020kjl56foouo7v	cmsoefl0a007uagl52wuho36v	https://i.ibb.co/vvdMVzdk/a3c4467ae982.png	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy image 2	1	2026-08-13 08:14:44.547
cmsr8su2r0021kjl5lnfwl1s4	cmsoefl0a007uagl52wuho36v	https://i.ibb.co/Zpy1fWLQ/997d1b84accd.png	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy image 3	2	2026-08-13 08:14:44.547
cmsr8su2r0022kjl50hmv6n4v	cmsoefl0a007uagl52wuho36v	https://i.ibb.co/GvznGVNy/af6488840ac7.png	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy image 4	3	2026-08-13 08:14:44.547
cmsr8su2r0023kjl5mresqlv7	cmsoefl0a007uagl52wuho36v	https://i.ibb.co/sh0MmJt/587739948909.png	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy image 5	4	2026-08-13 08:14:44.547
cmsr8su2r0024kjl5hou6fng5	cmsoefl0a007uagl52wuho36v	https://i.ibb.co/LhN9fVL8/461318a4985b.png	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy image 6	5	2026-08-13 08:14:44.547
cmsr8su2r0025kjl5cuby5ja5	cmsoefl0a007uagl52wuho36v	https://i.ibb.co/MDqNV7S0/b0ab27ecc690.png	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy image 7	6	2026-08-13 08:14:44.547
cmsr8su2r0026kjl5x2o1rb95	cmsoefl0a007uagl52wuho36v	https://i.ibb.co/0yXCk8GB/1809659fed58.png	Mini Portable Waterproof Bullet Massager 10 Speed Vibration Modes Soft Silicone Mini Pocket Vibrator Discreet Personal Relax Toy image 8	7	2026-08-13 08:14:44.547
cmsr8z5oq0027kjl5ntukfc7d	cmsoenfty008kagl5xqh6iky0	https://i.ibb.co/Xk8MTdMJ/b2a4148698c4.jpg	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection	0	2026-08-13 08:19:39.53
cmsr8z5oq0028kjl5w0diyctv	cmsoenfty008kagl5xqh6iky0	https://i.ibb.co/7LcgDfZ/a00c948d197d.jpg	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection image 2	1	2026-08-13 08:19:39.53
cmsr8z5oq0029kjl5jd27rpa9	cmsoenfty008kagl5xqh6iky0	https://i.ibb.co/XZYRD2Bn/70ae3d5ff4ab.jpg	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection image 3	2	2026-08-13 08:19:39.53
cmsr8z5oq002akjl5pnb0p2d7	cmsoenfty008kagl5xqh6iky0	https://i.ibb.co/Zp42ZxtP/2a11d93b7317.jpg	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection image 4	3	2026-08-13 08:19:39.53
cmsr8z5oq002bkjl5138bn3gl	cmsoenfty008kagl5xqh6iky0	https://i.ibb.co/QjQJkFgd/33556103c1fd.jpg	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection image 5	4	2026-08-13 08:19:39.53
cmsr8z5oq002ckjl5gpgypgcz	cmsoenfty008kagl5xqh6iky0	https://i.ibb.co/N62YYXZW/34172d6ee3ff.jpg	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection image 6	5	2026-08-13 08:19:39.53
cmsr8z5oq002dkjl5k74qk0l9	cmsoenfty008kagl5xqh6iky0	https://i.ibb.co/MxSfDMyQ/7a08d2a435dd.jpg	Crystal Sunscreen Spray SPF50+ PA++++ 90ml Portable UV Protection image 7	6	2026-08-13 08:19:39.53
cmsr9n81j002skjl5gciuyh5d	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/7xqWZ22N/248cb41f4327.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard	0	2026-08-13 08:38:22.327
cmsr9n81j002tkjl5m799jcl7	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/ZRtXv5dP/b719f3362d13.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard image 2	1	2026-08-13 08:38:22.327
cmsr9n81j002ukjl58f536q8e	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/Kp4y3MmC/290beb5c5d6e.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard image 3	2	2026-08-13 08:38:22.327
cmsr9n81j002vkjl54audab6v	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/Jjqgs4yj/868219dd2b33.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard image 4	3	2026-08-13 08:38:22.327
cmsr9n81j002wkjl5qld20v5i	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/s4GNzfg/2bf98c976997.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard image 5	4	2026-08-13 08:38:22.327
cmsr9n81j002xkjl55j85vx6i	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/cSp68gVV/99a7cfda2bf3.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard image 6	5	2026-08-13 08:38:22.327
cmspsw8aq005mejl5g0xdacvk	cmsoh39dg00ieagl5qprj3v16	https://i.ibb.co/N6PjfZYq/247bcc379b45.jpg	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care image 4	3	2026-08-12 08:01:42.914
cmspsw8aq005nejl5rmhkiv3v	cmsoh39dg00ieagl5qprj3v16	https://i.ibb.co/mVY4qgRy/4ddba9d70ba8.jpg	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care image 5	4	2026-08-12 08:01:42.914
cmspsw8aq005oejl5cve9d502	cmsoh39dg00ieagl5qprj3v16	https://i.ibb.co/5gTT80QW/fcb5361006c4.jpg	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care image 6	5	2026-08-12 08:01:42.914
cmsr9n81j002ykjl5mdhyo3iz	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/3yc5kfRP/40cb1d9bacde.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard image 7	6	2026-08-13 08:38:22.327
cmsr9n81k002zkjl5vfi3yivg	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/dsvsWpRP/016f47a03564.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard image 8	7	2026-08-13 08:38:22.327
cmspuybq400auejl5ei9g97yf	cmsogi6sf00fcagl5q2szgip8	https://i.ibb.co/ZR6r7zdZ/a7807aa53229.png	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin	0	2026-08-12 08:59:19.9
cmspuybq400avejl5qng2ez16	cmsogi6sf00fcagl5q2szgip8	https://i.ibb.co/XZN7JxPS/6c75a1b0de98.png	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin image 2	1	2026-08-12 08:59:19.9
cmspuybq400awejl5burhe3u4	cmsogi6sf00fcagl5q2szgip8	https://i.ibb.co/zVrcftZx/0f35e71f6474.png	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin image 3	2	2026-08-12 08:59:19.9
cmspuybq400axejl5s0y6p7qd	cmsogi6sf00fcagl5q2szgip8	https://i.ibb.co/wFPY4zvn/4ab12e05aa9b.png	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin image 4	3	2026-08-12 08:59:19.9
cmspuybq400ayejl5lyg8b91p	cmsogi6sf00fcagl5q2szgip8	https://i.ibb.co/spZn8d3k/2adeae84b532.png	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin image 5	4	2026-08-12 08:59:19.9
cmspuybq400azejl5rnkzktfr	cmsogi6sf00fcagl5q2szgip8	https://i.ibb.co/9989yy98/2144ab021b18.png	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin image 6	5	2026-08-12 08:59:19.9
cmspuybq400b0ejl54sbb8npt	cmsogi6sf00fcagl5q2szgip8	https://i.ibb.co/wFLFbpzT/4c1d24d25dd8.png	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin image 7	6	2026-08-12 08:59:19.9
cmspuybq400b1ejl5ru35uv1y	cmsogi6sf00fcagl5q2szgip8	https://i.ibb.co/XfgDVxPj/908d0c1c7aed.png	Cetaphil Gentle Clear Complexion Acne Cleanser 124ml 2.6% Benzoyl Peroxide Treat Breakouts Hydrate Sensitive Skin image 8	7	2026-08-12 08:59:19.9
cmsprdhfi002tejl5klxuhp7u	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/HLTDJWxr/ddb7404e1b2f.jpg	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color	0	2026-08-12 07:19:08.67
cmsprdhfi002uejl54j9sd8p1	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/gZBxBsLH/895de607de1a.png	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 2	1	2026-08-12 07:19:08.67
cmsprdhfi002vejl5tepvim8i	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/mrqP6QRD/7fffd3f4ae45.png	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 3	2	2026-08-12 07:19:08.67
cmsprdhfi002wejl596hqe1qr	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/pjMGLsTB/bbc6f7ec115a.png	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 4	3	2026-08-12 07:19:08.67
cmsprdhfi002xejl50ono5jla	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/G4rD4bZV/03625e06b647.jpg	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 5	4	2026-08-12 07:19:08.67
cmsprdhfi002yejl5skw9x2lm	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/tpCGzkZ0/98002ab2413c.jpg	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 6	5	2026-08-12 07:19:08.67
cmsprdhfi002zejl5eb9933tb	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/N6zGGjXK/0713b028ddf3.jpg	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 7	6	2026-08-12 07:19:08.67
cmsprdhfi0030ejl53m1y7tm0	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/9ktHXYgk/898583747243.jpg	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 8	7	2026-08-12 07:19:08.67
cmsprdhfi0031ejl5bpbmb8kh	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/1GNsLyQ1/5b694aacd6b2.png	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 9	8	2026-08-12 07:19:08.67
cmsprdhfi0032ejl5dpohu0bd	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/G3kWb0FC/b44b0446e882.png	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 10	9	2026-08-12 07:19:08.67
cmsr9n81k0030kjl57j4zo6g1	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/bjnszbPn/3c1259991911.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard image 9	8	2026-08-13 08:38:22.327
cmspv1x4d00b2ejl5x674ry0x	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/FkTk5PkJ/5f09ebf5743d.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel	0	2026-08-12 09:02:07.597
cmspv1x4d00b3ejl5hd9d5kdw	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/mrssDW8s/15690a0c8399.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 2	1	2026-08-12 09:02:07.597
cmspv1x4d00b4ejl58ikclz8v	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/JWqMQvkt/ba0443a1625d.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 3	2	2026-08-12 09:02:07.597
cmspv1x4d00b5ejl5xc77e4wb	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/W4q26CvW/363afcc4a421.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 4	3	2026-08-12 09:02:07.597
cmspv1x4d00b6ejl5ifuk9a66	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/pmRYDFk/57bc9891ad0d.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 5	4	2026-08-12 09:02:07.597
cmspv1x4d00b7ejl54vpdks3k	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/r2bzmnXp/5a43ee6c8262.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 6	5	2026-08-12 09:02:07.597
cmspt89xj006hejl5yryly33o	cmsoh3oex00ioagl5pupua3xq	https://i.ibb.co/Rp6gsL7m/af13b3bbb57b.jpg	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer image 5	4	2026-08-12 08:11:04.903
cmspt89xj006iejl5n1ef04jb	cmsoh3oex00ioagl5pupua3xq	https://i.ibb.co/Xrn0Hnd4/5bc1a5636869.jpg	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer image 6	5	2026-08-12 08:11:04.903
cmspt89xj006jejl5bxbvcr4w	cmsoh3oex00ioagl5pupua3xq	https://i.ibb.co/TqWZs2Mm/a593712fa3e8.jpg	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer image 7	6	2026-08-12 08:11:04.903
cmspt89xj006kejl5c6fnykob	cmsoh3oex00ioagl5pupua3xq	https://i.ibb.co/Ndm78LVb/672c8f3e0763.jpg	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer image 8	7	2026-08-12 08:11:04.903
cmspt89xj006lejl5ruetid3t	cmsoh3oex00ioagl5pupua3xq	https://i.ibb.co/ym2Q7mZG/4fbaa90ed6e7.png	The Ordinary Niacinamide 5% Face & Body Emulsion, Brighten Skin Tone, Reduce Dark Spots, Lightweight Moisturizer image 9	8	2026-08-12 08:11:04.903
cmspuey8x009tejl5lqodn7qi	cmsoep73y0096agl5r0g0yrgt	https://i.ibb.co/3y1CjsvS/cef2ee70ebf6.jpg	LISTENTOSKIN 377 Clean Skin Facial Cleanser Amino Acid Deep Clean Oil Control	0	2026-08-12 08:44:15.969
cmspuj1jm009uejl5iafo2goj	cmsoijn9e00o3agl5vwza8r6y	https://i.ibb.co/tpGbY7Q1/55d0ba7453d7.jpg	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage	0	2026-08-12 08:47:26.866
cmspuj1jm009vejl5nc1ancm1	cmsoijn9e00o3agl5vwza8r6y	https://i.ibb.co/RT85j88d/899a55cfcb8a.jpg	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage image 2	1	2026-08-12 08:47:26.866
cmspuj1jm009wejl5u1fzhpld	cmsoijn9e00o3agl5vwza8r6y	https://i.ibb.co/fVBtHJCL/ddaeb869cbfa.jpg	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage image 3	2	2026-08-12 08:47:26.866
cmspuj1jm009xejl58cztycpp	cmsoijn9e00o3agl5vwza8r6y	https://i.ibb.co/GQchMmyp/4e3b83669044.jpg	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage image 4	3	2026-08-12 08:47:26.866
cmspuj1jm009yejl5n88jjg0v	cmsoijn9e00o3agl5vwza8r6y	https://i.ibb.co/XxDR9Bbk/4e1abad47104.jpg	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage image 5	4	2026-08-12 08:47:26.866
cmsprdhfi0033ejl5nq4rrlof	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/gq6ZgGW/8cfa15144510.png	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 11	10	2026-08-12 07:19:08.67
cmsprdhfi0034ejl57bxeya5g	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/svWCRn8d/71d3aea1abfd.png	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 12	11	2026-08-12 07:19:08.67
cmsprdhfi0035ejl5lfo5seu6	cmsofqg4200cmagl55re4rwis	https://i.ibb.co/k61h1jdP/384367865342.png	Korean Dasique 4 Shades Blush Palette Soft Buildable Matte Blush Powder Natural Glowing Cheek Color image 13	12	2026-08-12 07:19:08.67
cmspsw8aq005pejl5srgx17ws	cmsoh39dg00ieagl5qprj3v16	https://i.ibb.co/q3YBWrgD/de69b3016ace.jpg	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care image 7	6	2026-08-12 08:01:42.914
cmspsw8aq005qejl5ezxc9kjd	cmsoh39dg00ieagl5qprj3v16	https://i.ibb.co/hx6JTcvG/dc4c15df2113.png	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care image 8	7	2026-08-12 08:01:42.914
cmspuj1jm009zejl5vwhaqbwh	cmsoijn9e00o3agl5vwza8r6y	https://i.ibb.co/W4tFjQzw/8583fd435cb9.jpg	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage image 6	5	2026-08-12 08:47:26.866
cmspuj1jm00a0ejl5yttq7wxj	cmsoijn9e00o3agl5vwza8r6y	https://i.ibb.co/vxrV1Lkp/127b2356f180.jpg	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage image 7	6	2026-08-12 08:47:26.866
cmspuj1jm00a1ejl53wjvf2fo	cmsoijn9e00o3agl5vwza8r6y	https://i.ibb.co/Y5hqp1w/b19ec1702a17.jpg	DAERA Kang Shining Cream, All-in-One Shade BB Cream, Self-adjusting Color, Natural Glow Full Coverage image 8	7	2026-08-12 08:47:26.866
cmspuq46e00a2ejl57hstyx52	cmsog05sv00dtagl56fzqqbsg	https://i.ibb.co/S48mzS8Y/84bda8334b03.jpg	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth	0	2026-08-12 08:52:56.87
cmspuq46e00a3ejl56gmdkt6w	cmsog05sv00dtagl56fzqqbsg	https://i.ibb.co/7d43453D/34cf23a2f3dd.jpg	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth image 2	1	2026-08-12 08:52:56.87
cmspuq46e00a4ejl5l9t234yz	cmsog05sv00dtagl56fzqqbsg	https://i.ibb.co/MkzcpqWZ/93d234d8b718.jpg	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth image 3	2	2026-08-12 08:52:56.87
cmspuq46e00a5ejl5ndwp0w3r	cmsog05sv00dtagl56fzqqbsg	https://i.ibb.co/7NTRqtSS/d46b7a6874a4.png	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth image 4	3	2026-08-12 08:52:56.87
cmspuq46e00a6ejl57u0epkae	cmsog05sv00dtagl56fzqqbsg	https://i.ibb.co/jvrCk1tx/49e0b60a49e8.png	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth image 5	4	2026-08-12 08:52:56.87
cmspuq46e00a7ejl5rek60nk9	cmsog05sv00dtagl56fzqqbsg	https://i.ibb.co/ynJwGtKZ/7e192b96019a.png	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth image 6	5	2026-08-12 08:52:56.87
cmsssl7ea008ikjl5usfyimjw	cmssqwbt8005hkjl5dbp5umy7	https://i.ibb.co/H1Hm4mz/2c37d8b8a69b.jpg	Power Station Carry Bag Waterproof Storage Case For Jackery Ecoflow Bluetti	0	2026-08-14 10:16:27.058
cmsssl7ea008jkjl529fhhj3b	cmssqwbt8005hkjl5dbp5umy7	https://i.ibb.co/r20Z22JX/30721688680a.jpg	Power Station Carry Bag Waterproof Storage Case For Jackery Ecoflow Bluetti image 2	1	2026-08-14 10:16:27.058
cmsssl7ea008kkjl5srpf3nht	cmssqwbt8005hkjl5dbp5umy7	https://i.ibb.co/9mHTSDb4/ebde89380e4e.jpg	Power Station Carry Bag Waterproof Storage Case For Jackery Ecoflow Bluetti image 3	2	2026-08-14 10:16:27.058
cmsssl7ea008lkjl5s0wsq9c9	cmssqwbt8005hkjl5dbp5umy7	https://i.ibb.co/CKhc0DQd/ad9fbd6a3ef2.jpg	Power Station Carry Bag Waterproof Storage Case For Jackery Ecoflow Bluetti image 4	3	2026-08-14 10:16:27.058
cmsst1vbv008vkjl5ogpnacz7	cmsst1v85008tkjl5t4nfcd0c	https://i.ibb.co/93VgbcHX/fb14eb93f661.jpg	Dual Pocket Mini Wristlet Pouch, Waterproof Nylon Small Coin Purse with Hand Strap, Portable Card Key Earphone Lipstick Storage Bag	0	2026-08-14 10:29:24.437
cmsptevy9006yejl5l3nj886q	cmsogrtr600glagl5qv6xfqrp	https://i.ibb.co/KpjgpCsG/240717ce07e5.jpg	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine image 4	3	2026-08-12 08:16:13.377
cmsptevy9006zejl50oqvc87j	cmsogrtr600glagl5qv6xfqrp	https://i.ibb.co/pjr2bsVc/37ed28258424.jpg	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine image 5	4	2026-08-12 08:16:13.377
cmsptevy90070ejl519lpipjb	cmsogrtr600glagl5qv6xfqrp	https://i.ibb.co/20hSnWY8/e99ca48c8f67.jpg	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine image 6	5	2026-08-12 08:16:13.377
cmsptevy90071ejl5nf3pt1gc	cmsogrtr600glagl5qv6xfqrp	https://i.ibb.co/tTVSmZjy/c717c03d9b7a.jpg	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine image 7	6	2026-08-12 08:16:13.377
cmsptevy90072ejl5grmab4id	cmsogrtr600glagl5qv6xfqrp	https://i.ibb.co/0yLvpnqv/5b8a4418a6db.jpg	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine image 8	7	2026-08-12 08:16:13.377
cmsptevy90073ejl5mmmtvant	cmsogrtr600glagl5qv6xfqrp	https://i.ibb.co/qMrqGH1L/a9088bc4a461.jpg	Karseell Maca Hair Essence Oil, Anti-Frizz Serum, Repair Dry Bleached Damaged Hair, Lightweight Non-Greasy Boost Hair Shine image 9	8	2026-08-12 08:16:13.377
cmsptfqzy0074ejl5cywjsrg7	cmsofmugw00byagl5hvqnyrco	https://i.ibb.co/B5jCBK1g/6798f204bf22.png	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara	0	2026-08-12 08:16:53.614
cmsptfqzy0075ejl5n2ttim53	cmsofmugw00byagl5hvqnyrco	https://i.ibb.co/zVWL5PdW/f70e3d0b06fb.png	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara image 2	1	2026-08-12 08:16:53.614
cmsptfqzy0076ejl5ilup1ywx	cmsofmugw00byagl5hvqnyrco	https://i.ibb.co/SD0T8S09/cd2d9f249a00.png	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara image 3	2	2026-08-12 08:16:53.614
cmsptfqzy0077ejl5hyappb8r	cmsofmugw00byagl5hvqnyrco	https://i.ibb.co/Jw18fh9b/a2e651afabad.png	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara image 4	3	2026-08-12 08:16:53.614
cmsptfqzy0078ejl5r50al1es	cmsofmugw00byagl5hvqnyrco	https://i.ibb.co/BV0d9ny0/dd37248774ed.png	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara image 5	4	2026-08-12 08:16:53.614
cmsptfqzy0079ejl5v15cm4co	cmsofmugw00byagl5hvqnyrco	https://i.ibb.co/vx0PL7ZN/3c195e1a0155.png	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara image 6	5	2026-08-12 08:16:53.614
cmsprgqa80036ejl5qv8wmqh8	cmsoenwof008uagl5plzqvpqm	https://i.ibb.co/43JQWXq/1a4eb2fbae58.jpg	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil	0	2026-08-12 07:21:40.112
cmsprgqa80037ejl5opfd1pyo	cmsoenwof008uagl5plzqvpqm	https://i.ibb.co/Q7TJ86Hp/4064a6aa4c6c.jpg	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil image 2	1	2026-08-12 07:21:40.112
cmsprgqa80038ejl5ii4binmu	cmsoenwof008uagl5plzqvpqm	https://i.ibb.co/609JRtKt/9c4b95b3d9e7.jpg	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil image 3	2	2026-08-12 07:21:40.112
cmsprgqa80039ejl5iu3vg5vy	cmsoenwof008uagl5plzqvpqm	https://i.ibb.co/9kTc2zP6/d0e34156aa05.jpg	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil image 4	3	2026-08-12 07:21:40.112
cmsprgqa8003aejl5b6narsra	cmsoenwof008uagl5plzqvpqm	https://i.ibb.co/Jj3CXMHd/d019ee2b0451.jpg	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil image 5	4	2026-08-12 07:21:40.112
cmsprgqa8003bejl561lc52un	cmsoenwof008uagl5plzqvpqm	https://i.ibb.co/Df0BZ7bg/c57034875326.jpg	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil image 6	5	2026-08-12 07:21:40.112
cmsprgqa8003cejl5w256mnc6	cmsoenwof008uagl5plzqvpqm	https://i.ibb.co/DJkgVWY/3e49cabe4ba7.jpg	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil image 7	6	2026-08-12 07:21:40.112
cmsprgqa8003dejl5bbd2ka4u	cmsoenwof008uagl5plzqvpqm	https://i.ibb.co/YBVrZZB2/bb3901cd492d.png	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil image 8	7	2026-08-12 07:21:40.112
cmsprgqa8003eejl5q5vwz5o4	cmsoenwof008uagl5plzqvpqm	https://i.ibb.co/jkdTXGPd/339392fbfbc0.png	Medicube Zero Pore Mud Mask 3-Min Fast Dry Clay Mask Alcohol Free Pore Purifying Mask Clear Blackheads & Excess Oil image 9	8	2026-08-12 07:21:40.112
cmspt1g6b005rejl5jtik2dyg	cmsogysxp00hsagl5bxhz8oe0	https://i.ibb.co/M56tpL2S/c29a8de2ce21.png	Pre-Glued Cluster Eyelashes No Glue Needed C Curl Wispy Natural Individual Lashes Reusable Self Adhesive False Eyelashes For Makeup	0	2026-08-12 08:05:46.403
cmspv1x4d00b8ejl5fnvn17l9	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/twSBjPJc/182a1f4b8dbb.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 7	6	2026-08-12 09:02:07.597
cmspv1x4d00b9ejl5qc8wmvyw	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/0R4z3Hyv/78d9963e6237.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 8	7	2026-08-12 09:02:07.597
cmspv1x4d00baejl5ivu0eq93	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/9mP15Z1N/0881a0b8861d.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 9	8	2026-08-12 09:02:07.597
cmspv1x4d00bbejl5on623r66	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/twN6SFnf/d062ae5288f2.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 10	9	2026-08-12 09:02:07.597
cmspv1x4d00bcejl5xglgeb1g	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/pjbXDj69/4ff22abc7d17.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 11	10	2026-08-12 09:02:07.597
cmspv1x4d00bdejl5azwjzkl7	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/B2V0VBzD/46a67df44d58.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 12	11	2026-08-12 09:02:07.597
cmspv1x4d00beejl5546ox7on	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/nqTDMJ7z/76b3b45f8950.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 13	12	2026-08-12 09:02:07.597
cmspv1x4d00bfejl531hdr03s	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/Wpy3RYC5/48e09c69c06d.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 14	13	2026-08-12 09:02:07.597
cmspv1x4d00bgejl5nu9eckw6	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/Psb2mkW9/f57fb18b9d7b.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 15	14	2026-08-12 09:02:07.597
cmspv1x4d00bhejl5e4sd1f44	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/sJgrjGT2/0354a685caf3.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 16	15	2026-08-12 09:02:07.597
cmspv1x4d00biejl58h2z5qk4	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/8DsXXH2x/9b7c050d5c7d.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 17	16	2026-08-12 09:02:07.597
cmspv1x4d00bjejl5got1f7f0	cmsogtmcw00gxagl591zcexte	https://i.ibb.co/jv2HZwp6/8e7c14c9941f.jpg	HANBOLI Portable Solid Fragrance Balm Stick 4 Scents Smooth Non-Sticky Mini Body Perfume Deodorant Cream for Daily Travel image 18	17	2026-08-12 09:02:07.597
cmt1brs6v000uagl5l2ejx2st	cmt1b7iu70000agl58hd3r9h4	https://i.ibb.co/PsfZCKCx/c237bdfcb56d.jpg	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion image 5	4	2026-08-20 09:35:36.054
cmspt1g6b005sejl57odw4zl1	cmsogysxp00hsagl5bxhz8oe0	https://i.ibb.co/m524sJSK/53d181225036.png	Pre-Glued Cluster Eyelashes No Glue Needed C Curl Wispy Natural Individual Lashes Reusable Self Adhesive False Eyelashes For Makeup image 2	1	2026-08-12 08:05:46.403
cmspt1g6b005tejl5khr4v8f4	cmsogysxp00hsagl5bxhz8oe0	https://i.ibb.co/LXC843qg/731ab5dc153e.png	Pre-Glued Cluster Eyelashes No Glue Needed C Curl Wispy Natural Individual Lashes Reusable Self Adhesive False Eyelashes For Makeup image 3	2	2026-08-12 08:05:46.403
cmspt1g6b005uejl5r34yvmc6	cmsogysxp00hsagl5bxhz8oe0	https://i.ibb.co/nNn35G5h/3c66b3f05c63.png	Pre-Glued Cluster Eyelashes No Glue Needed C Curl Wispy Natural Individual Lashes Reusable Self Adhesive False Eyelashes For Makeup image 4	3	2026-08-12 08:05:46.403
cmspt1g6b005vejl56t8jgw0e	cmsogysxp00hsagl5bxhz8oe0	https://i.ibb.co/qqGsYnM/88fcea44ff77.png	Pre-Glued Cluster Eyelashes No Glue Needed C Curl Wispy Natural Individual Lashes Reusable Self Adhesive False Eyelashes For Makeup image 5	4	2026-08-12 08:05:46.403
cmspt1g6c005wejl503vex6ho	cmsogysxp00hsagl5bxhz8oe0	https://i.ibb.co/83JK1vD/d2558930ce35.png	Pre-Glued Cluster Eyelashes No Glue Needed C Curl Wispy Natural Individual Lashes Reusable Self Adhesive False Eyelashes For Makeup image 6	5	2026-08-12 08:05:46.403
cmspt1g6c005xejl5822pgifj	cmsogysxp00hsagl5bxhz8oe0	https://i.ibb.co/MkGNSnw2/fa6ced7f4cad.png	Pre-Glued Cluster Eyelashes No Glue Needed C Curl Wispy Natural Individual Lashes Reusable Self Adhesive False Eyelashes For Makeup image 7	6	2026-08-12 08:05:46.403
cmsquwtyd00gwejl5bfrn996c	cmsevi0i4004we5l5dfi04msm	https://i.ibb.co/fzHjcNCb/4104ade1c561.png	Wireless Earbuds with Mirror Smart Display, Bluetooth 5.1 Earphones, HIFI Stereo Sound	0	2026-08-13 01:45:56.389
cmspv5bng00bkejl57oefbzdz	cmsoh19kk00i4agl5ku3dkyb8	https://i.ibb.co/0j62d275/8861c059f9a0.jpg	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types	0	2026-08-12 09:04:46.396
cmspv5bng00blejl5eamw6zym	cmsoh19kk00i4agl5ku3dkyb8	https://i.ibb.co/yn0G2QnY/f53f45c70be7.jpg	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types image 2	1	2026-08-12 09:04:46.396
cmspv5bng00bmejl5wztbq73e	cmsoh19kk00i4agl5ku3dkyb8	https://i.ibb.co/RT7Bjyqb/7918c00472cf.jpg	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types image 3	2	2026-08-12 09:04:46.396
cmspv5bng00bnejl5enx3k1iz	cmsoh19kk00i4agl5ku3dkyb8	https://i.ibb.co/nqG7xCNr/3c89ccea3593.jpg	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types image 4	3	2026-08-12 09:04:46.396
cmspv5bng00boejl5t33kxxx3	cmsoh19kk00i4agl5ku3dkyb8	https://i.ibb.co/nMypzk9g/a1faf7c88850.jpg	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types image 5	4	2026-08-12 09:04:46.396
cmspv5bng00bpejl59i4pkzyb	cmsoh19kk00i4agl5ku3dkyb8	https://i.ibb.co/FkNDDxpb/a24193d5980a.jpg	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types image 6	5	2026-08-12 09:04:46.396
cmspv5bng00bqejl5jr7tfn36	cmsoh19kk00i4agl5ku3dkyb8	https://i.ibb.co/9F4Gpmk/5f8216d8a29d.jpg	Pure Gentle Cleansing Oil, Deep Dissolve Makeup & Blackheads, Nourishing Refreshing Non-irritating Cleansing Oil For All Skin Types image 7	6	2026-08-12 09:04:46.396
cmspvd8fw00c1ejl5lzbrq9qy	cmsohj7pj00klagl5lc3rm20j	https://i.ibb.co/y27zLRL/2fcd931d32d4.png	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml	0	2026-08-12 09:10:55.485
cmsptfqzy007aejl56bbisuc2	cmsofmugw00byagl5hvqnyrco	https://i.ibb.co/FqYptj0w/9645814802b3.png	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara image 7	6	2026-08-12 08:16:53.614
cmsptfqzy007bejl5d5t81wrk	cmsofmugw00byagl5hvqnyrco	https://i.ibb.co/JWGn9qM9/45960552e46c.png	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara image 8	7	2026-08-12 08:16:53.614
cmsptfqzy007cejl5drrc6858	cmsofmugw00byagl5hvqnyrco	https://i.ibb.co/tpX4Cncd/adca306c0c9f.png	Steel Tube Spiral Brush Mascara Waterproof Smudge Proof Long Lasting Lash Lift Eyelash Makeup Lengthening Curling Mascara image 9	8	2026-08-12 08:16:53.614
cmspuq46e00a8ejl5szlpm8ii	cmsog05sv00dtagl56fzqqbsg	https://i.ibb.co/SDWzFRHK/6fbb0641818c.jpg	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth image 7	6	2026-08-12 08:52:56.87
cmspuq46e00a9ejl5vwgezed4	cmsog05sv00dtagl56fzqqbsg	https://i.ibb.co/20K5kb7R/4c0217b97b1e.jpg	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth image 8	7	2026-08-12 08:52:56.87
cmspuq46e00aaejl5k9jze3cc	cmsog05sv00dtagl56fzqqbsg	https://i.ibb.co/QLrg51N/8a29e47e73be.jpg	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth image 9	8	2026-08-12 08:52:56.87
cmspuq46e00abejl58ksi23ub	cmsog05sv00dtagl56fzqqbsg	https://i.ibb.co/qLrRt8mX/9245f40c7c22.jpg	Veet Bikini Area Hair Removal Cream Infused Avocado Extract Gentle Depilatory for Sensitive Skin 14 Days Smooth image 10	9	2026-08-12 08:52:56.87
cmspuuv4g00acejl5dk2id1kr	cmsog75pm00e6agl586ijcjyr	https://i.ibb.co/bZb1v4R/3622d862d2a0.jpg	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool	0	2026-08-12 08:56:38.416
cmspuuv4g00adejl5etkpytp2	cmsog75pm00e6agl586ijcjyr	https://i.ibb.co/dyYR0fR/4f97caa50fa2.jpg	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool image 2	1	2026-08-12 08:56:38.416
cmspuuv4g00aeejl54rzgziyq	cmsog75pm00e6agl586ijcjyr	https://i.ibb.co/jZRgJynq/400aebea7d9f.jpg	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool image 3	2	2026-08-12 08:56:38.416
cmspuuv4g00afejl52t6162zq	cmsog75pm00e6agl586ijcjyr	https://i.ibb.co/SwjZdhhX/e370b4975904.jpg	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool image 4	3	2026-08-12 08:56:38.416
cmspuuv4g00agejl5k83qlv53	cmsog75pm00e6agl586ijcjyr	https://i.ibb.co/r2dMSw7H/d99f1c8e2a25.jpg	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool image 5	4	2026-08-12 08:56:38.416
cmspuuv4g00ahejl5v34xo1po	cmsog75pm00e6agl586ijcjyr	https://i.ibb.co/bjs2R0jp/2052c162b964.jpg	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool image 6	5	2026-08-12 08:56:38.416
cmspuuv4g00aiejl57kft1zi8	cmsog75pm00e6agl586ijcjyr	https://i.ibb.co/tPDd9bJS/4541993d6d19.jpg	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool image 7	6	2026-08-12 08:56:38.416
cmspvd8fx00c2ejl5x5iydqfy	cmsohj7pj00klagl5lc3rm20j	https://i.ibb.co/Gv4PRq8g/7b507f928070.png	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml image 2	1	2026-08-12 09:10:55.485
cmspvd8fx00c3ejl5mwd5xetj	cmsohj7pj00klagl5lc3rm20j	https://i.ibb.co/qLWNHBf6/1288612e7498.png	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml image 3	2	2026-08-12 09:10:55.485
cmspvd8fx00c4ejl5idvfmcxp	cmsohj7pj00klagl5lc3rm20j	https://i.ibb.co/rKpLhck4/302cfc2e9cd8.png	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml image 4	3	2026-08-12 09:10:55.485
cmspvd8fx00c5ejl51chzyr5s	cmsohj7pj00klagl5lc3rm20j	https://i.ibb.co/HMDxHvh/97cc3afb9d8a.png	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml image 5	4	2026-08-12 09:10:55.485
cmspvd8fx00c6ejl5uka02exx	cmsohj7pj00klagl5lc3rm20j	https://i.ibb.co/8g3KzZcJ/0dc3166c1c44.png	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml image 6	5	2026-08-12 09:10:55.485
cmspvd8fx00c7ejl54cmwfbd3	cmsohj7pj00klagl5lc3rm20j	https://i.ibb.co/hJ9P7f6b/bc580d3916de.png	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml image 7	6	2026-08-12 09:10:55.485
cmspvd8fx00c8ejl5vde2epcr	cmsohj7pj00klagl5lc3rm20j	https://i.ibb.co/V02Dpt89/b61e4f970464.png	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml image 8	7	2026-08-12 09:10:55.485
cmspvd8fx00c9ejl5ed3qk6em	cmsohj7pj00klagl5lc3rm20j	https://i.ibb.co/tTC6yzNs/09d269027b38.png	Herbal Hair Growth Liquid, Nourish Follicles, Boost Beard, Chest, Armpit & Hairline Growth, Thickening Hair Serum 50ml image 9	8	2026-08-12 09:10:55.485
cmsptlxhk007dejl5r494mf8l	cmsogk55r00foagl5q5glcqoy	https://i.ibb.co/kgnTkVKd/a2038806bce0.jpg	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling	0	2026-08-12 08:21:41.96
cmsptlxhk007eejl5asuhgl5v	cmsogk55r00foagl5q5glcqoy	https://i.ibb.co/bRLkDfWm/9d90c990a411.jpg	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling image 2	1	2026-08-12 08:21:41.96
cmsptlxhk007fejl53qx08cdx	cmsogk55r00foagl5q5glcqoy	https://i.ibb.co/x8djcbfd/4f7032bb9d5c.jpg	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling image 3	2	2026-08-12 08:21:41.96
cmsptlxhk007gejl5tjbhfhe4	cmsogk55r00foagl5q5glcqoy	https://i.ibb.co/RTJs4J8h/4e4a293f6b3f.jpg	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling image 4	3	2026-08-12 08:21:41.96
cmsptlxhk007hejl59uy30v7s	cmsogk55r00foagl5q5glcqoy	https://i.ibb.co/kgQ7bhy7/40c74890608c.jpg	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling image 5	4	2026-08-12 08:21:41.96
cmspv99no00brejl59o157iy4	cmsoh920800jkagl5nfbbjdol	https://i.ibb.co/prZ7Rjk8/48f9aace9212.jpg	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection	0	2026-08-12 09:07:50.436
cmspv99no00bsejl55qjwsgif	cmsoh920800jkagl5nfbbjdol	https://i.ibb.co/cSZTVz1J/954dbf7efbcb.jpg	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection image 2	1	2026-08-12 09:07:50.436
cmspv99no00btejl5qlx4pj77	cmsoh920800jkagl5nfbbjdol	https://i.ibb.co/TqJk4r1j/c3b731790952.jpg	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection image 3	2	2026-08-12 09:07:50.436
cmspv99no00buejl54shfbwg8	cmsoh920800jkagl5nfbbjdol	https://i.ibb.co/Q7hX4Ms2/9385a20e897c.jpg	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection image 4	3	2026-08-12 09:07:50.436
cmspv99no00bvejl53p30dc6o	cmsoh920800jkagl5nfbbjdol	https://i.ibb.co/ccfMGZ1W/509ac7c17666.jpg	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection image 5	4	2026-08-12 09:07:50.436
cmspt2os3005yejl55lxlqfxe	cmsoj3j1500pnagl5wqrdje4j	https://i.ibb.co/vvjpm27j/462447f47ea8.jpg	BROLAMEN Collagenase Microbubble Essence Mask, 30s Absorption Anti-Wrinkle Firming Bubble Facial Mask	0	2026-08-12 08:06:44.211
cmspv99no00bwejl531ggcizo	cmsoh920800jkagl5nfbbjdol	https://i.ibb.co/h03MFhr/dcfc077b46f2.jpg	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection image 6	5	2026-08-12 09:07:50.436
cmspv99no00bxejl5xxrkd51x	cmsoh920800jkagl5nfbbjdol	https://i.ibb.co/KpYZWgW2/b09839da9f38.jpg	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection image 7	6	2026-08-12 09:07:50.436
cmspv99np00byejl5z2ilbvxk	cmsoh920800jkagl5nfbbjdol	https://i.ibb.co/VWRBW584/d32fe4d23a82.jpg	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection image 8	7	2026-08-12 09:07:50.436
cmspv99np00bzejl572ob22wh	cmsoh920800jkagl5nfbbjdol	https://i.ibb.co/wrwTdfmz/e3af9a6475bb.jpg	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection image 9	8	2026-08-12 09:07:50.436
cmspv99np00c0ejl544xmoltw	cmsoh920800jkagl5nfbbjdol	https://i.ibb.co/Zz9P7pTT/05aeb652010d.jpg	d'Alba Tone-Up UV Essence Sunscreen SPF50+ PA++++, Color Correcting Green/Pink/Purple Tinted Sun Cream, Hydrating 3-in-1 Primer & Sun Protection image 10	9	2026-08-12 09:07:50.436
cmsr96r0x002lkjl5gr2f7gxv	cmsoftek200d4agl5jnznn882	https://i.ibb.co/spj8xrwr/5d180ed57e59.jpg	USB Rechargeable Electric Makeup Brush 10 Vibration Modes Soft Fluffy Foundation Blush Cosmetic Brush	0	2026-08-13 08:25:33.777
cmsr96r0x002mkjl54ir5xt5q	cmsoftek200d4agl5jnznn882	https://i.ibb.co/mFMnZR5w/d1e9b814de43.jpg	USB Rechargeable Electric Makeup Brush 10 Vibration Modes Soft Fluffy Foundation Blush Cosmetic Brush image 2	1	2026-08-13 08:25:33.777
cmsr96r0x002nkjl5ftr1zdqy	cmsoftek200d4agl5jnznn882	https://i.ibb.co/Xd9jn2h/d5f3958a0baf.jpg	USB Rechargeable Electric Makeup Brush 10 Vibration Modes Soft Fluffy Foundation Blush Cosmetic Brush image 3	2	2026-08-13 08:25:33.777
cmsr96r0x002okjl5f7pq1rsi	cmsoftek200d4agl5jnznn882	https://i.ibb.co/1fSqzwnb/8499bc465780.jpg	USB Rechargeable Electric Makeup Brush 10 Vibration Modes Soft Fluffy Foundation Blush Cosmetic Brush image 4	3	2026-08-13 08:25:33.777
cmsr96r0x002pkjl5tfc5o68r	cmsoftek200d4agl5jnznn882	https://i.ibb.co/LDxGThRT/b3d57ea653f1.jpg	USB Rechargeable Electric Makeup Brush 10 Vibration Modes Soft Fluffy Foundation Blush Cosmetic Brush image 5	4	2026-08-13 08:25:33.777
cmsr96r0x002qkjl5fyjcfko1	cmsoftek200d4agl5jnznn882	https://i.ibb.co/CKBQJqCM/ec6d18d7b7ec.jpg	USB Rechargeable Electric Makeup Brush 10 Vibration Modes Soft Fluffy Foundation Blush Cosmetic Brush image 6	5	2026-08-13 08:25:33.777
cmsr96r0x002rkjl5mcelxm9u	cmsoftek200d4agl5jnznn882	https://i.ibb.co/pvy1rK3F/a4fa8076252c.png	USB Rechargeable Electric Makeup Brush 10 Vibration Modes Soft Fluffy Foundation Blush Cosmetic Brush image 7	6	2026-08-13 08:25:33.777
cmsr9n81k0031kjl5c712i4o4	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/B5gLh7yy/e91593919b4b.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard image 10	9	2026-08-13 08:38:22.327
cmsr9n81k0032kjl5k228430y	cmsoi2tnm00mbagl5t9oaaxj2	https://i.ibb.co/d0BsTZDG/0e125be96c99.jpg	RFID Blocking Passport Holder Waterproof Oxford Travel Document Organizer Multi Slots Wallet with Neck Lanyard image 11	10	2026-08-13 08:38:22.327
cmsst57e3008wkjl5jokd6d2p	cmsssqspa008mkjl56pzpxbf7	https://i.ibb.co/Wvwq8QSq/2a466ca452ea.jpg	Water Resistant Nylon Makeup Bag with Detachable Handle, Large Capacity Travel Cosmetic Organizer Pouch, Portable Toiletry Storage Bag	0	2026-08-14 10:32:00.171
cmspt2os3005zejl5uxz0p0xw	cmsoj3j1500pnagl5wqrdje4j	https://i.ibb.co/PZ2sqrRV/dc98c0b3f657.jpg	BROLAMEN Collagenase Microbubble Essence Mask, 30s Absorption Anti-Wrinkle Firming Bubble Facial Mask image 2	1	2026-08-12 08:06:44.211
cmspt2os30060ejl5g2d4x2rh	cmsoj3j1500pnagl5wqrdje4j	https://i.ibb.co/V0V0mqLC/d3a584db6d83.jpg	BROLAMEN Collagenase Microbubble Essence Mask, 30s Absorption Anti-Wrinkle Firming Bubble Facial Mask image 3	2	2026-08-12 08:06:44.211
cmspt2os30061ejl5be6rogls	cmsoj3j1500pnagl5wqrdje4j	https://i.ibb.co/W4dGzzpw/5165abc6773a.jpg	BROLAMEN Collagenase Microbubble Essence Mask, 30s Absorption Anti-Wrinkle Firming Bubble Facial Mask image 4	3	2026-08-12 08:06:44.211
cmspt2os30062ejl5mzxb6nhl	cmsoj3j1500pnagl5wqrdje4j	https://i.ibb.co/ycGxFbr3/d78f0e0ff463.jpg	BROLAMEN Collagenase Microbubble Essence Mask, 30s Absorption Anti-Wrinkle Firming Bubble Facial Mask image 5	4	2026-08-12 08:06:44.211
cmsquwtyd00gxejl54izixauv	cmsevi0i4004we5l5dfi04msm	https://i.ibb.co/spWYMrkF/97bf1685aa77.png	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin image 2	1	2026-08-13 01:45:56.389
cmspvhmmc00caejl5wubx8uau	cmsohnm8t00l8agl5zgtygsm3	https://i.ibb.co/QFhT8Zcm/5d094b475fd4.jpg	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide	0	2026-08-12 09:14:20.484
cmspvhmmc00cbejl5skngmxl9	cmsohnm8t00l8agl5zgtygsm3	https://i.ibb.co/Kjvs8fp8/2b8cb48fa35f.jpg	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide image 2	1	2026-08-12 09:14:20.484
cmspvhmmc00ccejl5591dturc	cmsohnm8t00l8agl5zgtygsm3	https://i.ibb.co/KpBgqFyg/8568d7997d9d.jpg	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide image 3	2	2026-08-12 09:14:20.484
cmspvhmmd00cdejl5kweaegs6	cmsohnm8t00l8agl5zgtygsm3	https://i.ibb.co/bgn15LWk/c88c0fb48475.jpg	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide image 4	3	2026-08-12 09:14:20.484
cmspvhmmd00ceejl5f2c7cxu2	cmsohnm8t00l8agl5zgtygsm3	https://i.ibb.co/HfvkDmjB/44cbea581f64.jpg	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide image 5	4	2026-08-12 09:14:20.484
cmspvhmmd00cfejl5lyubulcw	cmsohnm8t00l8agl5zgtygsm3	https://i.ibb.co/20RmpmVn/2d99a6ca956e.jpg	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide image 6	5	2026-08-12 09:14:20.484
cmspvhmmd00cgejl5vf49w4i1	cmsohnm8t00l8agl5zgtygsm3	https://i.ibb.co/Q7pWfK1V/4cf5df8f5d9d.jpg	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide image 7	6	2026-08-12 09:14:20.484
cmspvhmmd00chejl5khc6s37l	cmsohnm8t00l8agl5zgtygsm3	https://i.ibb.co/gbCPxnDR/062de8d85c6e.jpg	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide image 8	7	2026-08-12 09:14:20.484
cmspvhmmd00ciejl56oc18fj3	cmsohnm8t00l8agl5zgtygsm3	https://i.ibb.co/4ZCfTHJP/692d1decce15.jpg	Medicube Collagen Night Wrapping Mask 75ml, Overnight Sleeping Mask, Firm Anti-Aging Hydrating Peel Off Mask with Collagen & Niacinamide image 9	8	2026-08-12 09:14:20.484
cmsst57e3008xkjl5vkqre1tw	cmsssqspa008mkjl56pzpxbf7	https://i.ibb.co/JwcL93S0/7e96331b56f0.jpg	Water Resistant Nylon Makeup Bag with Detachable Handle, Large Capacity Travel Cosmetic Organizer Pouch, Portable Toiletry Storage Bag image 2	1	2026-08-14 10:32:00.171
cmsst57e3008ykjl51nb7a1p2	cmsssqspa008mkjl56pzpxbf7	https://i.ibb.co/NdQRVj9n/e0a77a8fb735.jpg	Water Resistant Nylon Makeup Bag with Detachable Handle, Large Capacity Travel Cosmetic Organizer Pouch, Portable Toiletry Storage Bag image 3	2	2026-08-14 10:32:00.171
cmsst57e3008zkjl565d9tewm	cmsssqspa008mkjl56pzpxbf7	https://i.ibb.co/CTqKLk2/6f40b7c74024.jpg	Water Resistant Nylon Makeup Bag with Detachable Handle, Large Capacity Travel Cosmetic Organizer Pouch, Portable Toiletry Storage Bag image 4	3	2026-08-14 10:32:00.171
cmtmg15dm000a72l5k11bqi9j	cmsofnqwj00ccagl5dcqregd9	https://i.ibb.co/9mPcF2fT/3988f8742190.jpg	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation	0	2026-09-04 04:18:01.21
cmtmg15dm000b72l5r3lcbesw	cmsofnqwj00ccagl5dcqregd9	https://i.ibb.co/zW3zwf0g/df8a9d9d0b3c.jpg	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation image 2	1	2026-09-04 04:18:01.21
cmtmg15dm000c72l5763gu3ii	cmsofnqwj00ccagl5dcqregd9	https://i.ibb.co/s9VfYyw8/fa0eaecd444e.jpg	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation image 3	2	2026-09-04 04:18:01.21
cmtmg15dm000d72l5e5s8xyyc	cmsofnqwj00ccagl5dcqregd9	https://i.ibb.co/fzqynK1V/631605e842e2.jpg	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation image 4	3	2026-09-04 04:18:01.21
cmtmg15dm000e72l5pls25i39	cmsofnqwj00ccagl5dcqregd9	https://i.ibb.co/W45DxRLk/0788e39127a0.jpg	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation image 5	4	2026-09-04 04:18:01.21
cmtmg15dm000f72l5hiuuhq5y	cmsofnqwj00ccagl5dcqregd9	https://i.ibb.co/LDVTvqxM/2d3f04d13c99.jpg	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation image 6	5	2026-09-04 04:18:01.21
cmsquwtyd00gyejl5xvgpwarp	cmsevi0i4004we5l5dfi04msm	https://i.ibb.co/BK5Pp9n4/c815b7b5eb63.png	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin image 3	2	2026-08-13 01:45:56.389
cmsquwtyd00gzejl50o3pu22j	cmsevi0i4004we5l5dfi04msm	https://i.ibb.co/Xk72bnhm/11186a39a9fc.jpg	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin image 4	3	2026-08-13 01:45:56.389
cmsquwtyd00h0ejl5h9lkhrrt	cmsevi0i4004we5l5dfi04msm	https://i.ibb.co/VYb3HVBX/aa8eb8e40606.jpg	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin image 5	4	2026-08-13 01:45:56.389
cmsquwtyd00h1ejl5hitqw2a4	cmsevi0i4004we5l5dfi04msm	https://i.ibb.co/WQfNRDR/50918ffcb95e.jpg	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin image 6	5	2026-08-13 01:45:56.389
cmsquwtyd00h2ejl5jz2cb0bp	cmsevi0i4004we5l5dfi04msm	https://i.ibb.co/tptWJvW8/65786fbaeebf.jpg	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin image 7	6	2026-08-13 01:45:56.389
cmsquwtyd00h3ejl5gpc7hvdt	cmsevi0i4004we5l5dfi04msm	https://i.ibb.co/Sw7zXr9v/10943f3d4a13.jpg	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin image 8	7	2026-08-13 01:45:56.389
cmsquwtyd00h4ejl5veuzdmp6	cmsevi0i4004we5l5dfi04msm	https://i.ibb.co/q36ZJQBV/545c7ce182fb.jpg	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin image 9	8	2026-08-13 01:45:56.389
cmsquwtyd00h5ejl5g8ol36vi	cmsevi0i4004we5l5dfi04msm	https://i.ibb.co/tpgV3NkC/18a55fd3e84e.jpg	Bluetooth 5.1 Wireless Earbuds Smart Mirror Display HIFI Stereo Earphones Built-in Mic for Calls Gamin image 10	9	2026-08-13 01:45:56.389
cmtmg15dm000g72l5kswuckxf	cmsofnqwj00ccagl5dcqregd9	https://i.ibb.co/G4pC40PP/2ae0fc303b6f.webp	Mini USB Rechargeable Electric Massager 10 Vibration Modes Quiet Body-Safe Material for Face & Body Relaxation image 7	6	2026-09-04 04:18:01.21
cmsqux8hk00h6ejl53f58hjsv	cmsevlqvf005je5l5ixjvc5kh	https://i.ibb.co/YFdSxmWy/eb05da8870b9.png	N35 Gaming Wireless Earbuds, Ultra Low Delay Bluetooth 5.3 Earphones	0	2026-08-13 01:46:15.224
cmsqux8hk00h7ejl5g35hddju	cmsevlqvf005je5l5ixjvc5kh	https://i.ibb.co/zH7QnxFz/3c9722228c10.png	N35 Gaming Wireless Earbuds Bluetooth 5.3 Low Delay LED Display Dual Mode Stereo In-Ear Earphones with Mic image 2	1	2026-08-13 01:46:15.224
cmsqux8hk00h8ejl5cjvvea8y	cmsevlqvf005je5l5ixjvc5kh	https://i.ibb.co/HDMwBxs1/7105141dd70a.png	N35 Gaming Wireless Earbuds Bluetooth 5.3 Low Delay LED Display Dual Mode Stereo In-Ear Earphones with Mic image 3	2	2026-08-13 01:46:15.224
cmsqux8hk00h9ejl5p3tmde8l	cmsevlqvf005je5l5ixjvc5kh	https://i.ibb.co/JWmsspqW/4d1e0ba7c5b1.jpg	N35 Gaming Wireless Earbuds Bluetooth 5.3 Low Delay LED Display Dual Mode Stereo In-Ear Earphones with Mic image 4	3	2026-08-13 01:46:15.224
cmsqux8hk00haejl5vizt4q01	cmsevlqvf005je5l5ixjvc5kh	https://i.ibb.co/jj76bX0/6527aeb00f24.jpg	N35 Gaming Wireless Earbuds Bluetooth 5.3 Low Delay LED Display Dual Mode Stereo In-Ear Earphones with Mic image 5	4	2026-08-13 01:46:15.224
cmsqux8hk00hbejl59pye82hq	cmsevlqvf005je5l5ixjvc5kh	https://i.ibb.co/8LNmJBL1/3d07c624fadb.jpg	N35 Gaming Wireless Earbuds Bluetooth 5.3 Low Delay LED Display Dual Mode Stereo In-Ear Earphones with Mic image 6	5	2026-08-13 01:46:15.224
cmsqux8hk00hcejl5x7i7alv6	cmsevlqvf005je5l5ixjvc5kh	https://i.ibb.co/XZd3Hnq9/728e91b84cd0.jpg	N35 Gaming Wireless Earbuds Bluetooth 5.3 Low Delay LED Display Dual Mode Stereo In-Ear Earphones with Mic image 7	6	2026-08-13 01:46:15.224
cmsquxzte00hpejl5z1szd1sh	cmsn6f27a000gagl5b0yvsz4t	https://i.ibb.co/Gf5P8KM1/e43c527e593c.png	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home	0	2026-08-13 01:46:50.642
cmspvlp2x00cjejl5i4zusje0	cmsoi807r00nfagl585dzaq3v	https://i.ibb.co/LdQmXCXn/71edc54d695c.jpg	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula	0	2026-08-12 09:17:30.297
cmsptlxhk007iejl5v29glfzi	cmsogk55r00foagl5q5glcqoy	https://i.ibb.co/nMM3M6hs/9bd791ffad58.jpg	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling image 6	5	2026-08-12 08:21:41.96
cmsptlxhk007jejl5urzlf6q9	cmsogk55r00foagl5q5glcqoy	https://i.ibb.co/Gff7p5cT/69d20ca81fa8.jpg	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling image 7	6	2026-08-12 08:21:41.96
cmsptlxhk007kejl5fbeax4dq	cmsogk55r00foagl5q5glcqoy	https://i.ibb.co/ch1MFxX0/a0dc0297eef0.png	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling image 8	7	2026-08-12 08:21:41.96
cmsptlxhk007lejl52bjtbhyh	cmsogk55r00foagl5q5glcqoy	https://i.ibb.co/JjHkt5R1/61c53f1f7bb3.jpg	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling image 9	8	2026-08-12 08:21:41.96
cmsptlxhk007mejl55li8h3h7	cmsogk55r00foagl5q5glcqoy	https://i.ibb.co/Gvfj32Py/03a8c1c2f84f.png	Mise En Scene Perfect Hair Oil Serum, Prevent Hair Breakage, Less Tangling, Create Glassy Hair, Heat Protection Before Hair Styling image 10	9	2026-08-12 08:21:41.96
cmspuuv4g00ajejl562yir37i	cmsog75pm00e6agl586ijcjyr	https://i.ibb.co/vvTp21Wn/01ecb6355b4f.jpg	GONGPEI Men Roll-On Antiperspirant 60ml Ocean Scent 48H Long Lasting Deodorant Anti Sweat Odor Refreshing Cool image 8	7	2026-08-12 08:56:38.416
cmspvlp2x00ckejl5hx9s8m37	cmsoi807r00nfagl585dzaq3v	https://i.ibb.co/V0Hb1M5R/9dd0ccce1b40.png	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula image 2	1	2026-08-12 09:17:30.297
cmsquxzte00hqejl5nux549dl	cmsn6f27a000gagl5b0yvsz4t	https://i.ibb.co/NdwcdDbH/3588fd0e5d70.png	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home image 2	1	2026-08-13 01:46:50.642
cmsquxzte00hrejl5r0aig0wi	cmsn6f27a000gagl5b0yvsz4t	https://i.ibb.co/Ndkh4CnY/55a604079f27.png	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home image 3	2	2026-08-13 01:46:50.642
cmsquxzte00hsejl5mit5bhz3	cmsn6f27a000gagl5b0yvsz4t	https://i.ibb.co/KzWDF4Bq/bcded1048a5a.png	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home image 4	3	2026-08-13 01:46:50.642
cmsquxzte00htejl5x8nagr77	cmsn6f27a000gagl5b0yvsz4t	https://i.ibb.co/kVLYMPvy/8abcc63874ea.png	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home image 5	4	2026-08-13 01:46:50.642
cmsquxzte00huejl5zivn6419	cmsn6f27a000gagl5b0yvsz4t	https://i.ibb.co/kVxkkwq5/294e432589d4.png	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home image 6	5	2026-08-13 01:46:50.642
cmsquxzte00hvejl5yz34eibe	cmsn6f27a000gagl5b0yvsz4t	https://i.ibb.co/ZpTv7pXS/96cc51c22568.png	Cordless Hair Straightener Brush, Type‑C Rechargeable Portable Anti‑Scald Anti‑Static Wireless Hair Styling Comb for Travel Home image 7	6	2026-08-13 01:46:50.642
cmsswqk6b0007oll56c6ftcdp	cmsswqk1j0000oll5ob5qxbnu	https://i.ibb.co/jPHzgPqD/ac820cf15b9b.png	Women’s Small Crossbody Bag, Adjustable Strap Casual Shoulder Purse for Shopping	0	2026-08-14 12:12:35.192
cmspvlp2x00clejl5q9458p0y	cmsoi807r00nfagl585dzaq3v	https://i.ibb.co/Kp6zScrw/2053af14c44b.jpg	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula image 3	2	2026-08-12 09:17:30.297
cmspvlp2x00cmejl5c50188y7	cmsoi807r00nfagl585dzaq3v	https://i.ibb.co/Kjq6QWC2/101d8e125c43.jpg	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula image 4	3	2026-08-12 09:17:30.297
cmspvlp2x00cnejl5bmm1bld9	cmsoi807r00nfagl585dzaq3v	https://i.ibb.co/DPfnj2qb/34332169ffee.jpg	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula image 5	4	2026-08-12 09:17:30.297
cmspvlp2x00coejl5flmfgv62	cmsoi807r00nfagl585dzaq3v	https://i.ibb.co/rKYj6kdd/71a5a33f22f3.jpg	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula image 6	5	2026-08-12 09:17:30.297
cmspvlp2x00cpejl550oeiuw4	cmsoi807r00nfagl585dzaq3v	https://i.ibb.co/Ngq9P0qf/644f2f6287b9.jpg	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula image 7	6	2026-08-12 09:17:30.297
cmspvlp2x00cqejl5szkvq7wy	cmsoi807r00nfagl585dzaq3v	https://i.ibb.co/RT7YVHXs/6477e949d002.jpg	USA Imported PanOxyl 10% Benzoyl Peroxide Bar Soap, Deep Clean Acne Wash for Facial & Body Breakouts, New Upgraded Formula image 8	7	2026-08-12 09:17:30.297
cmsswqk6b0008oll5jlqu9n73	cmsswqk1j0000oll5ob5qxbnu	https://i.ibb.co/DPfwRZJB/5ee470774c2f.png	Women’s Small Crossbody Bag, Adjustable Strap Casual Shoulder Purse for Shopping image 2	1	2026-08-14 12:12:35.192
cmsptrma0007nejl5jxio3quo	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/YB9YzXdQ/be3135c6bd88.png	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner	0	2026-08-12 08:26:07.368
cmsptrma0007oejl5lazat6t2	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/LXCz8KS9/ab023a686f4b.png	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner image 2	1	2026-08-12 08:26:07.368
cmsswqk6b0009oll5n3i88mai	cmsswqk1j0000oll5ob5qxbnu	https://i.ibb.co/KcSjzYT2/e252babdf0f1.png	Women’s Small Crossbody Bag, Adjustable Strap Casual Shoulder Purse for Shopping image 3	2	2026-08-14 12:12:35.192
cmsswqk6b000aoll54e79x4vn	cmsswqk1j0000oll5ob5qxbnu	https://i.ibb.co/MytWSrBP/64ecf58e6941.png	Women’s Small Crossbody Bag, Adjustable Strap Casual Shoulder Purse for Shopping image 4	3	2026-08-14 12:12:35.192
cmsswqk6b000boll564hj08j2	cmsswqk1j0000oll5ob5qxbnu	https://i.ibb.co/Xr6mynGj/0dd6b85ff2e7.webp	Women’s Small Crossbody Bag, Adjustable Strap Casual Shoulder Purse for Shopping image 5	4	2026-08-14 12:12:35.192
cmsswqk6b000coll5p601kyb4	cmsswqk1j0000oll5ob5qxbnu	https://i.ibb.co/8ZF92y3/1f11590f1523.webp	Women’s Small Crossbody Bag, Adjustable Strap Casual Shoulder Purse for Shopping image 6	5	2026-08-14 12:12:35.192
cmsr9tlpb003ikjl548bobv17	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/pvR2TDw5/679d7496c6e3.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer	0	2026-08-13 08:43:19.967
cmsr9tlpb003jkjl5sqeys53p	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/3gTKLVp/653e5e497d6d.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 2	1	2026-08-13 08:43:19.967
cmsr9tlpb003kkjl5s3w66fsm	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/dnkJwXk/db917c31ffe9.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 3	2	2026-08-13 08:43:19.967
cmsr9tlpb003lkjl5rr85aprl	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/bjXwGqWh/807dac0510f2.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 4	3	2026-08-13 08:43:19.967
cmsptrma0007pejl5xgzalw82	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/2R7mHj8/aee6c8a31d82.jpg	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner image 3	2	2026-08-12 08:26:07.368
cmsptrma0007qejl5war13x2g	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/8Lx6rBx6/02d6faf4b93a.jpg	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner image 4	3	2026-08-12 08:26:07.368
cmsptrma1007rejl5j2lu5eh1	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/XkfwBm34/90a71cceb7b1.jpg	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner image 5	4	2026-08-12 08:26:07.368
cmsptrma1007sejl58bokgzk6	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/r2tBRSdf/355eb1f8e429.jpg	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner image 6	5	2026-08-12 08:26:07.368
cmsptrma1007tejl5hjruqtao	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/0p4vhCGW/b25828c628a5.jpg	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner image 7	6	2026-08-12 08:26:07.368
cmsptrma1007uejl51ddmp2cy	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/BHCqmXDS/1d20deef0d79.jpg	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner image 8	7	2026-08-12 08:26:07.368
cmsptrma1007vejl5orwdog01	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/ymRxVmZk/8ddb67f10a82.jpg	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner image 9	8	2026-08-12 08:26:07.368
cmsptrma1007wejl5lgccqakt	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/Hf8nmS3N/8dd7e689a5fe.jpg	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner image 10	9	2026-08-12 08:26:07.368
cmsptrma1007xejl5mqk8qu0o	cmsofztni00ddagl5j1wo9h5x	https://i.ibb.co/GhZypQp/628f2d9e0fb7.png	Adjustable Angle Eyeliner Stamp, Smudge Proof Long Lasting Liquid Liner image 11	10	2026-08-12 08:26:07.368
cmsptt7r6007yejl5gvnm66tj	cmsoj4f4d00pvagl5yshv0vy8	https://i.ibb.co/xSKKVLTF/cabe55ff55e4.jpg	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin	0	2026-08-12 08:27:21.858
cmsptt7r6007zejl5l081658t	cmsoj4f4d00pvagl5yshv0vy8	https://i.ibb.co/PG6MXCyd/74b5ff3efad4.jpg	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin image 2	1	2026-08-12 08:27:21.858
cmsptt7r60080ejl5yd9d0yvm	cmsoj4f4d00pvagl5yshv0vy8	https://i.ibb.co/Z645d9NP/fb3ba37bbe69.jpg	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin image 3	2	2026-08-12 08:27:21.858
cmsptt7r60081ejl5nnhirkfx	cmsoj4f4d00pvagl5yshv0vy8	https://i.ibb.co/4g18jd7v/bbc49b3cb77a.jpg	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin image 4	3	2026-08-12 08:27:21.858
cmsptt7r60082ejl53qqz3uge	cmsoj4f4d00pvagl5yshv0vy8	https://i.ibb.co/nqM8cQsD/1ad086edda85.jpg	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin image 5	4	2026-08-12 08:27:21.858
cmsptt7r60083ejl58rvzbkua	cmsoj4f4d00pvagl5yshv0vy8	https://i.ibb.co/ccpBqmFj/22659d0803d5.jpg	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin image 6	5	2026-08-12 08:27:21.858
cmsptt7r60084ejl50mwcbcw3	cmsoj4f4d00pvagl5yshv0vy8	https://i.ibb.co/YBTFLkZX/2c0b3cf2ca84.jpg	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin image 7	6	2026-08-12 08:27:21.858
cmsptt7r60085ejl5ygpzhr8q	cmsoj4f4d00pvagl5yshv0vy8	https://i.ibb.co/sd1mpW84/6c76e0f598c8.jpg	H99 Recombinant Collagen Eye Cream, Anti-Wrinkle Firming Eye Lotion, Reduce Fine Lines & Puffy Eyes, Moisturize & Repair Eye Area Skin image 8	7	2026-08-12 08:27:21.858
cmssxb63w000loll5mla7xplk	cmssxb5zf000joll5akbaclyg	https://i.ibb.co/8DXVnj1m/15bcc0da0199.webp	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag	0	2026-08-14 12:28:36.747
cmssxb63w000moll5v70hetp6	cmssxb5zf000joll5akbaclyg	https://i.ibb.co/KcpHznwb/f6af09fb40d2.png	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag image 2	1	2026-08-14 12:28:36.747
cmssxb63w000noll5tupa7ix7	cmssxb5zf000joll5akbaclyg	https://i.ibb.co/0xd9SwQ/001beb28396f.png	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag image 3	2	2026-08-14 12:28:36.747
cmsr9tlpb003mkjl5lqsgktct	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/xqGmPWNc/f3b5160529e7.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 5	4	2026-08-13 08:43:19.967
cmsr9tlpb003nkjl5egc5u66v	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/FkYTJhDg/ed6c774fc052.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 6	5	2026-08-13 08:43:19.967
cmsr9tlpb003okjl586okfbzb	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/LhvGZqgk/7bfff1d4a992.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 7	6	2026-08-13 08:43:19.967
cmsr9tlpb003pkjl54kapijbk	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/B2j9W1kv/5406d7103cfb.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 8	7	2026-08-13 08:43:19.967
cmsr9tlpb003qkjl5l9arnyji	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/s95xMMvw/e38a45acd2e4.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 9	8	2026-08-13 08:43:19.967
cmsr9tlpb003rkjl5cpb3ny6x	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/1ty2C87c/1c57d455408c.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 10	9	2026-08-13 08:43:19.967
cmsr9tlpb003skjl52qy1s2xx	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/ycbG0z4n/8ccd6171449f.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 11	10	2026-08-13 08:43:19.967
cmsr9tlpb003tkjl56n0wxzps	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/JW6cx0Qc/a6ebe520a2a2.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 12	11	2026-08-13 08:43:19.967
cmsr9tlpb003ukjl56ypfz9zh	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/4ZDmH0PW/e1e13c03cd00.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 13	12	2026-08-13 08:43:19.967
cmsr9tlpb003vkjl5v0xa98of	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/SXkjKkSc/457338b1fcc9.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 14	13	2026-08-13 08:43:19.967
cmsptuglf0086ejl5vk7zdowi	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/fdZVhCYt/7f5564e7b7fe.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin	0	2026-08-12 08:28:19.971
cmsptuglf0087ejl5uis3fbgv	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/CyJ90kZ/441f843a858c.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 2	1	2026-08-12 08:28:19.971
cmsptuglf0088ejl5f23yiwnf	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/jk58wkWK/a368e501ea11.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 3	2	2026-08-12 08:28:19.971
cmsptuglf0089ejl55ny21dgt	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/r85jbL8/fde17cac36ca.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 4	3	2026-08-12 08:28:19.971
cmsptuglf008aejl595h9rfoj	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/Fb7vxRts/c40eeb4d48b7.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 5	4	2026-08-12 08:28:19.971
cmsptuglf008bejl5z9nyla4o	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/LX1pcwrC/460a4533bc18.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 6	5	2026-08-12 08:28:19.971
cmsptuglf008cejl5b9fh98o0	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/1Ymn62Rd/2bf6770a1e50.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 7	6	2026-08-12 08:28:19.971
cmsptuglf008dejl54qbnssf3	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/m5tVbNPf/fb51150a1599.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 8	7	2026-08-12 08:28:19.971
cmsptuglf008eejl5ttvrkzbu	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/bgMXc66n/f6b1029bd97d.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 9	8	2026-08-12 08:28:19.971
cmsptuglf008fejl5jgofwgbv	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/60mhdXZq/266ca1ef005c.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 10	9	2026-08-12 08:28:19.971
cmsr9tlpb003wkjl5wsc10n5k	cmsoim5f100oeagl5y41l1bqw	https://i.ibb.co/M5QqRwsG/61a89a2af8aa.jpg	Double Layer Transparent PVC Cosmetic Bag Waterproof PU Large Capacity Portable Travel Makeup Storage Organizer image 15	14	2026-08-13 08:43:19.967
cmssxb63w000ooll5xs9ze49n	cmssxb5zf000joll5akbaclyg	https://i.ibb.co/5W7KT0v3/f08b432f003f.webp	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag image 4	3	2026-08-14 12:28:36.747
cmssxb63w000poll51n1j9ez9	cmssxb5zf000joll5akbaclyg	https://i.ibb.co/jkjyXNXN/058b9ea0be86.webp	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag image 5	4	2026-08-14 12:28:36.747
cmssxb63w000qoll5mflnyun7	cmssxb5zf000joll5akbaclyg	https://i.ibb.co/1GQDY4pc/cbaccb2b06bc.webp	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag image 6	5	2026-08-14 12:28:36.747
cmssxb63w000roll5lw7ttf68	cmssxb5zf000joll5akbaclyg	https://i.ibb.co/WW1fxznb/084650c9f9ef.webp	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag image 7	6	2026-08-14 12:28:36.747
cmssxb63w000soll5okt4ki1c	cmssxb5zf000joll5akbaclyg	https://i.ibb.co/s0Gnxbg/8251bdd20d0a.png	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag image 8	7	2026-08-14 12:28:36.747
cmssxb63w000toll53m76m1m8	cmssxb5zf000joll5akbaclyg	https://i.ibb.co/FqyC6zgz/19727aa3822b.png	Reusable Waterproof Canvas Lunch Sack, Portable Insulated Food Storage Bag image 9	8	2026-08-14 12:28:36.747
cmsptuglf008gejl51dw7zpn0	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/KxywdXFK/ed25027dd2d4.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 11	10	2026-08-12 08:28:19.971
cmsquyadd00hwejl53xpbnuga	cmsodxbat007lagl5twvuqhem	https://i.ibb.co/BVsGv9T9/18f6d34c3f31.jpg	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel	0	2026-08-13 01:47:04.321
cmsquyadd00hxejl5nnyomizc	cmsodxbat007lagl5twvuqhem	https://i.ibb.co/h5twmfr/24e0ae0247d0.png	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel image 2	1	2026-08-13 01:47:04.321
cmsra1cze003xkjl5kphblqw2	cmsoj1gza00pcagl5q865fvqt	https://i.ibb.co/qMzfsgj4/164a1c3dd1b3.jpg	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag	0	2026-08-13 08:49:21.914
cmsra1cze003ykjl5y2lpdo6h	cmsoj1gza00pcagl5q865fvqt	https://i.ibb.co/JFWwzjDj/77b7cf0241be.png	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag image 2	1	2026-08-13 08:49:21.914
cmsra1cze003zkjl5h0g9tt9e	cmsoj1gza00pcagl5q865fvqt	https://i.ibb.co/Df0hbzBM/de1191ccca1f.jpg	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag image 3	2	2026-08-13 08:49:21.914
cmsra1cze0040kjl5po5y5rvr	cmsoj1gza00pcagl5q865fvqt	https://i.ibb.co/21yQtHxh/f94b04e37076.jpg	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag image 4	3	2026-08-13 08:49:21.914
cmsra1cze0041kjl56wtbyk99	cmsoj1gza00pcagl5q865fvqt	https://i.ibb.co/fzBr9YzM/e8e613765961.jpg	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag image 5	4	2026-08-13 08:49:21.914
cmsra1cze0042kjl5b4m2l0mk	cmsoj1gza00pcagl5q865fvqt	https://i.ibb.co/fYZKnZNs/3de39b45cba2.jpg	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag image 6	5	2026-08-13 08:49:21.914
cmsra1cze0043kjl5mkdl4prn	cmsoj1gza00pcagl5q865fvqt	https://i.ibb.co/r2vPtX0D/a54a83d0e63e.jpg	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag image 7	6	2026-08-13 08:49:21.914
cmsra1cze0044kjl5x0go41pv	cmsoj1gza00pcagl5q865fvqt	https://i.ibb.co/HTwbyMCL/27c9aeba04a4.jpg	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag image 8	7	2026-08-13 08:49:21.914
cmsra1cze0045kjl5hcpahso9	cmsoj1gza00pcagl5q865fvqt	https://i.ibb.co/nqvgbgZs/43699eb2e025.jpg	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag image 9	8	2026-08-13 08:49:21.914
cmsra1cze0046kjl57mb3qv83	cmsoj1gza00pcagl5q865fvqt	https://i.ibb.co/SDWfjJh8/9ef8f6477fa1.jpg	Women Genuine Leather Litchi Grain Handbag Lock Clasp Top Handle Shoulder Crossbody Commuter Bag image 10	9	2026-08-13 08:49:21.914
cmsquyadd00hyejl5awcrvnf6	cmsodxbat007lagl5twvuqhem	https://i.ibb.co/JFq2mQdM/a15c8c190435.jpg	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel image 3	2	2026-08-13 01:47:04.321
cmsquyadd00hzejl5pk8lmhho	cmsodxbat007lagl5twvuqhem	https://i.ibb.co/sTzJV5s/b2602760d651.jpg	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel image 4	3	2026-08-13 01:47:04.321
cmsquyadd00i0ejl5imi29xev	cmsodxbat007lagl5twvuqhem	https://i.ibb.co/rKqfk6Gx/69d364f2f627.png	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel image 5	4	2026-08-13 01:47:04.321
cmsquyadd00i1ejl5mkuoez3l	cmsodxbat007lagl5twvuqhem	https://i.ibb.co/HLysv4jr/e588be3923f1.png	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel image 6	5	2026-08-13 01:47:04.321
cmsquyadd00i2ejl54u0dllqg	cmsodxbat007lagl5twvuqhem	https://i.ibb.co/LLqg9wJ/c6ecf18e00bb.png	Water Based Intimate Lubricant Plant-Derived Long Lasting Smooth Hydrating Personal Lubricating Gel image 7	6	2026-08-13 01:47:04.321
cmsptuglf008hejl5e18ycuhj	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/SD5NRrL2/32debcfeaad4.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 12	11	2026-08-12 08:28:19.971
cmsptuglf008iejl5bwet2ng9	cmsoffma900b4agl52y9tui4y	https://i.ibb.co/JW9Kqtxs/80e415673894.jpg	Adjustable V Line Face Lifting Mask, Double Way Wear Reduce Double Chin image 13	12	2026-08-12 08:28:19.971
cmsptx9mg008jejl5jrkcr5ta	cmsoiiohf00o0agl5ynkg0zbc	https://i.ibb.co/8D1CLWxT/e6957c5cbb93.jpg	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam	0	2026-08-12 08:30:30.904
cmsptx9mg008kejl5o4lt0lyk	cmsoiiohf00o0agl5ynkg0zbc	https://i.ibb.co/zhFHNmsL/edcc741d3e1b.jpg	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam image 2	1	2026-08-12 08:30:30.904
cmsptx9mg008lejl5drv8b3zt	cmsoiiohf00o0agl5ynkg0zbc	https://i.ibb.co/fzZmQVf4/45892ab0be75.jpg	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam image 3	2	2026-08-12 08:30:30.904
cmsptx9mg008mejl5vb72ktsg	cmsoiiohf00o0agl5ynkg0zbc	https://i.ibb.co/jPZpJSg4/5920fda85947.jpg	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam image 4	3	2026-08-12 08:30:30.904
cmsptx9mg008nejl5hoqutxtc	cmsoiiohf00o0agl5ynkg0zbc	https://i.ibb.co/20cYcZMz/66742ad52a8a.jpg	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam image 5	4	2026-08-12 08:30:30.904
cmsptx9mg008oejl526kla0mn	cmsoiiohf00o0agl5ynkg0zbc	https://i.ibb.co/qY3KHHSS/b84f66251ef4.jpg	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam image 6	5	2026-08-12 08:30:30.904
cmsptx9mg008pejl5gh8jgaoj	cmsoiiohf00o0agl5ynkg0zbc	https://i.ibb.co/5hz0LsHk/090703818596.jpg	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam image 7	6	2026-08-12 08:30:30.904
cmsptx9mg008qejl5urdgnq20	cmsoiiohf00o0agl5ynkg0zbc	https://i.ibb.co/93NRyqr5/1424214ed308.jpg	GAAR Bulgarian Rose Sweet Orange Bath Oil 500ml Niacinamide Moisturizing Shower Oil, Long Lasting Fragrance, Gentle Cleansing, Rich Foam image 8	7	2026-08-12 08:30:30.904
cmsra4pl40047kjl5xvfd2s4z	cmsok17rz00qpagl5yx11zg55	https://i.ibb.co/VWRPBKPJ/aac6c14c901b.jpg	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag	0	2026-08-13 08:51:58.216
cmsra4pl40048kjl5g6622l68	cmsok17rz00qpagl5yx11zg55	https://i.ibb.co/FkvxH7Yx/0de64afc43c0.jpg	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag image 2	1	2026-08-13 08:51:58.216
cmsra4pl40049kjl5ftpqwgq2	cmsok17rz00qpagl5yx11zg55	https://i.ibb.co/HpBHcpmv/f0bfb8cf6cdc.jpg	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag image 3	2	2026-08-13 08:51:58.216
cmsra4pl4004akjl51z35uy75	cmsok17rz00qpagl5yx11zg55	https://i.ibb.co/MytGf1Xr/8906452a8d96.jpg	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag image 4	3	2026-08-13 08:51:58.216
cmsra4pl4004bkjl5d2qjloqm	cmsok17rz00qpagl5yx11zg55	https://i.ibb.co/M5hbFJmk/7b470f838fe0.jpg	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag image 5	4	2026-08-13 08:51:58.216
cmsra4pl4004ckjl5mkjpgxsv	cmsok17rz00qpagl5yx11zg55	https://i.ibb.co/jjd0VR2/94f8c834099c.jpg	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag image 6	5	2026-08-13 08:51:58.216
cmsra4pl4004dkjl58wf4b1rh	cmsok17rz00qpagl5yx11zg55	https://i.ibb.co/Yz17Y7T/863a7f0fb4b5.jpg	Women PU Leather Crocodile Pattern Handbag Lock Clasp Top Handle Shoulder Crossbody Daily Commuter Bag image 7	6	2026-08-13 08:51:58.216
cmsra6gev004ekjl5s7y217jx	cmsokc86e00rhagl523q7h9fc	https://i.ibb.co/9kkDr5yD/4fe5e72b73d2.jpg	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag	0	2026-08-13 08:53:19.639
cmsra6gev004fkjl5zq7ejm48	cmsokc86e00rhagl523q7h9fc	https://i.ibb.co/wrRThC2n/6675f5fc3ae6.jpg	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag image 2	1	2026-08-13 08:53:19.639
cmsra6gev004gkjl56pqtwzq9	cmsokc86e00rhagl523q7h9fc	https://i.ibb.co/FbMSLSQ5/1887dd540bc6.jpg	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag image 3	2	2026-08-13 08:53:19.639
cmsra6gev004hkjl563rbgfri	cmsokc86e00rhagl523q7h9fc	https://i.ibb.co/Bp9jV3X/c057f3395456.jpg	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag image 4	3	2026-08-13 08:53:19.639
cmsra6gev004ikjl5093h10sg	cmsokc86e00rhagl523q7h9fc	https://i.ibb.co/p6H0mYjk/cf68085a835f.jpg	Women Genuine Cow Leather Tote Bag Large Capacity Vintage Top Handle Commuter Shoulder Handbag image 5	4	2026-08-13 08:53:19.639
cmsu3xwcz0014oll5gkd0113w	cmssscbxy0084kjl5pnyxtdil	https://i.ibb.co/DPXDSMfw/3eab9b330e9a.jpg	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards	0	2026-08-15 08:22:01.235
cmsu3xwd00015oll5qr18sa38	cmssscbxy0084kjl5pnyxtdil	https://i.ibb.co/rK1BzCmg/01e8a9b88445.jpg	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards image 2	1	2026-08-15 08:22:01.235
cmsu3xwd00016oll5xssol008	cmssscbxy0084kjl5pnyxtdil	https://i.ibb.co/SwV8YYJ1/72799deee04a.jpg	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards image 3	2	2026-08-15 08:22:01.235
cmsu3xwd00017oll5osrgkl4l	cmssscbxy0084kjl5pnyxtdil	https://i.ibb.co/mr3DGg9D/41c18520d73b.jpg	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards image 4	3	2026-08-15 08:22:01.235
cmsu3xwd00018oll5n4swsuk6	cmssscbxy0084kjl5pnyxtdil	https://i.ibb.co/3ywm31zR/c9df30641c4c.jpg	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards image 5	4	2026-08-15 08:22:01.235
cmsu3xwd00019oll5416uhh6b	cmssscbxy0084kjl5pnyxtdil	https://i.ibb.co/S7vyp2Fw/a30dae40c905.jpg	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards image 6	5	2026-08-15 08:22:01.235
cmsu3xwd0001aoll5at75238i	cmssscbxy0084kjl5pnyxtdil	https://i.ibb.co/LXCSVKBR/ba4ea6f22599.jpg	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards image 7	6	2026-08-15 08:22:01.235
cmsu3xwd0001boll55qlynhl6	cmssscbxy0084kjl5pnyxtdil	https://i.ibb.co/ffXmFTL/f19bee4cb1aa.jpg	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards image 8	7	2026-08-15 08:22:01.235
cmsu3xwd0001coll572s8gzpf	cmssscbxy0084kjl5pnyxtdil	https://i.ibb.co/p6Ygr2Hg/7522c76317dd.jpg	Portable Oxford Tech Organizer Pouch Multi‑Compartment Travel Storage Bag for Cables Earphones SD Cards image 9	8	2026-08-15 08:22:01.235
cmsu47gxd001roll5rfaisbbs	cmssty1770090kjl5pnp0s698	https://i.ibb.co/C5qnK7Qz/1021859f5495.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag	0	2026-08-15 08:29:27.793
cmsu47gxd001soll5648bmr3z	cmssty1770090kjl5pnp0s698	https://i.ibb.co/dJK14Z5T/758f9025ff5b.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 2	1	2026-08-15 08:29:27.793
cmsu47gxd001toll5t040mmke	cmssty1770090kjl5pnp0s698	https://i.ibb.co/0pKqXqVd/808f68e203ba.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 3	2	2026-08-15 08:29:27.793
cmsu47gxd001uoll5eux5qpgx	cmssty1770090kjl5pnp0s698	https://i.ibb.co/jkRHVvfV/22729ee80c83.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 4	3	2026-08-15 08:29:27.793
cmsu47gxd001voll5uurl6q1d	cmssty1770090kjl5pnp0s698	https://i.ibb.co/hJnJ4TzZ/15edfbe32b41.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 5	4	2026-08-15 08:29:27.793
cmsu47gxd001woll50eci5xzm	cmssty1770090kjl5pnp0s698	https://i.ibb.co/tMVSGqKz/911a51e55e0a.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 6	5	2026-08-15 08:29:27.793
cmsu47gxd001xoll5sh4zut28	cmssty1770090kjl5pnp0s698	https://i.ibb.co/dJPX5rJC/15c07c6faba2.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 7	6	2026-08-15 08:29:27.793
cmsu47gxd001yoll54ywzdkya	cmssty1770090kjl5pnp0s698	https://i.ibb.co/9HVrsgGP/6061a6817293.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 8	7	2026-08-15 08:29:27.793
cmsptyn18008rejl5h1l7dzoe	cmsof85wb00adagl5n9tvx36l	https://i.ibb.co/QvmF7s0F/29569f6a0d20.jpg	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth	0	2026-08-12 08:31:34.94
cmsptyn18008sejl5m7evbg0s	cmsof85wb00adagl5n9tvx36l	https://i.ibb.co/hxy6SBj7/d626cb3ea96a.jpg	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth image 2	1	2026-08-12 08:31:34.94
cmsptyn18008tejl5zrw30ijq	cmsof85wb00adagl5n9tvx36l	https://i.ibb.co/5pdknZs/f885b6dd45d6.jpg	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth image 3	2	2026-08-12 08:31:34.94
cmsptyn18008uejl5bodlfiow	cmsof85wb00adagl5n9tvx36l	https://i.ibb.co/RpNQxD18/775470f1eeb7.jpg	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth image 4	3	2026-08-12 08:31:34.94
cmsptyn18008vejl57mirhext	cmsof85wb00adagl5n9tvx36l	https://i.ibb.co/5xff03c3/dee9693bdcc9.jpg	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth image 5	4	2026-08-12 08:31:34.94
cmsptyn18008wejl5uwdnmc2m	cmsof85wb00adagl5n9tvx36l	https://i.ibb.co/ycxZGpYM/49527e494223.jpg	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth image 6	5	2026-08-12 08:31:34.94
cmsptyn18008xejl5dyly10f0	cmsof85wb00adagl5n9tvx36l	https://i.ibb.co/1YMsqRS6/c1c9a6e6b766.jpg	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth image 7	6	2026-08-12 08:31:34.94
cmsptyn18008yejl5no5j22bg	cmsof85wb00adagl5n9tvx36l	https://i.ibb.co/qYCJdRyf/6765b5f38611.jpg	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth image 8	7	2026-08-12 08:31:34.94
cmsptyn18008zejl59zqn8hi6	cmsof85wb00adagl5n9tvx36l	https://i.ibb.co/Kcg0nB68/578e7703a5fc.jpg	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth image 9	8	2026-08-12 08:31:34.94
cmsptyn180090ejl5xk2axe3x	cmsof85wb00adagl5n9tvx36l	https://i.ibb.co/tM27Q8fw/e6f4462b0ced.jpg	Dmaster Purple Light Teeth Whitening Enzyme, Remove Stains & Yellow Teeth image 10	9	2026-08-12 08:31:34.94
cmspu28ul0091ejl5ks4jsuks	cmsof4dic00a6agl5u2gzv1f1	https://i.ibb.co/PZCyCbb6/13124c020c71.png	YZS Stick Foundation With Built-in Brush Dewy Coverage	0	2026-08-12 08:34:23.181
cmsraa1lq004jkjl5sfkfmpur	cmsokzfdd00ryagl5ru2p65ve	https://i.ibb.co/VWP1PSt9/8c5660da93f0.png	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap	0	2026-08-13 08:56:07.071
cmsraa1lr004kkjl5vdsc5e48	cmsokzfdd00ryagl5ru2p65ve	https://i.ibb.co/Ck02f2N/4d669a3c046d.jpg	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap image 2	1	2026-08-13 08:56:07.071
cmsraa1lr004lkjl586nudhhf	cmsokzfdd00ryagl5ru2p65ve	https://i.ibb.co/GQCzxw9y/bdd9646e455f.jpg	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap image 3	2	2026-08-13 08:56:07.071
cmsraa1lr004mkjl5ccal9fyx	cmsokzfdd00ryagl5ru2p65ve	https://i.ibb.co/Z6dPn2Wc/ca00ab8066d9.jpg	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap image 4	3	2026-08-13 08:56:07.071
cmsraa1lr004nkjl5pjmq2cuw	cmsokzfdd00ryagl5ru2p65ve	https://i.ibb.co/K4T0pQK/470683758665.png	Women Retro Faux Leather Satchel Handbag Lock Flap Crossbody Shoulder Mini Top Handle Bag with Adjustable Strap image 5	4	2026-08-13 08:56:07.071
cmsu47gxd001zoll5pn989vtc	cmssty1770090kjl5pnp0s698	https://i.ibb.co/PzCVsWRt/d1a71ca969ea.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 9	8	2026-08-15 08:29:27.793
cmsu47gxd0020oll58kx7as6r	cmssty1770090kjl5pnp0s698	https://i.ibb.co/fVb3JRFH/d3b5767e4dde.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 10	9	2026-08-15 08:29:27.793
cmsu47gxd0021oll5f23it40j	cmssty1770090kjl5pnp0s698	https://i.ibb.co/6JW364kF/16339bc01759.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 11	10	2026-08-15 08:29:27.793
cmsr7r84w000akjl5fimg3hmf	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/SZ3VDF6/c7d8877b50dd.png	Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display	0	2026-08-13 07:45:29.84
cmsr7r84w000bkjl5nnmammjr	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/B22khk46/e117932daf12.png	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 2	1	2026-08-13 07:45:29.84
cmsr7r84w000ckjl51ywoshwq	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/93hTGQwB/988ad5c02716.png	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 3	2	2026-08-13 07:45:29.84
cmsr7r84w000dkjl5bu2zjoya	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/LzRJkC6g/5c11c582b743.png	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 4	3	2026-08-13 07:45:29.84
cmsr7r84w000ekjl522u9f0f3	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/DP9MKVBY/5753bd353454.jpg	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 5	4	2026-08-13 07:45:29.84
cmsr7r84w000fkjl5r8yx4buz	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/rRLj5bGw/349f14bacb42.jpg	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 6	5	2026-08-13 07:45:29.84
cmsr7r84w000gkjl5hpsatnzn	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/WvXSF6dv/e17d4c5cac0d.jpg	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 7	6	2026-08-13 07:45:29.84
cmsr7r84w000hkjl5rd265hqy	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/4wd4Q4ZF/abaed7f27dbb.jpg	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 8	7	2026-08-13 07:45:29.84
cmsu47gxd0022oll5lxfi7hj4	cmssty1770090kjl5pnp0s698	https://i.ibb.co/b5VnY7CM/28213937e894.jpg	Mini Waterproof Waist Fanny Pack Adjustable Crossbody Belt Bag image 12	11	2026-08-15 08:29:27.793
cmsr7r84w000ikjl5k1q60743	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/Mw2QJ15/8c04ce9373fc.jpg	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 9	8	2026-08-13 07:45:29.84
cmsr7r84w000jkjl58rf7xax9	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/wNnmnqzR/f82e47db876c.jpg	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 10	9	2026-08-13 07:45:29.84
cmsr7r84w000kkjl5ql9az34u	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/My7jPWJF/02cad3950068.jpg	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 11	10	2026-08-13 07:45:29.84
cmsr7r84w000lkjl5zfsb4znt	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/8JRJZmK/3373e7ccdbd0.jpg	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 12	11	2026-08-13 07:45:29.84
cmsr7r84w000mkjl5h2c6ba4c	cmseuv7eg0033e5l5zhr3jjip	https://i.ibb.co/Vc2tWcKW/cb09118ab717.jpg	Y5 Handheld Foldable Mist Fan, Portable Mini Cooling Spray Fan with Digital Display image 13	12	2026-08-13 07:45:29.84
cmsr7rsq8000nkjl5dktr8gkc	cmsev2vmr003ge5l5i9ym859k	https://i.ibb.co/21C0md4m/3f6ef30b8f65.png	GS8 High-Speed Mini Cool Fan	0	2026-08-13 07:45:56.528
cmsr7rsq8000okjl5o6sh04vk	cmsev2vmr003ge5l5i9ym859k	https://i.ibb.co/bgmJZ3wG/fbcf865b24d3.png	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler image 2	1	2026-08-13 07:45:56.528
cmsr7rsq8000pkjl5vgi7c90r	cmsev2vmr003ge5l5i9ym859k	https://i.ibb.co/0VCTvNcc/607ebbb4b5f1.jpg	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler image 3	2	2026-08-13 07:45:56.528
cmsr7rsq8000qkjl5nuxvclpb	cmsev2vmr003ge5l5i9ym859k	https://i.ibb.co/VWPBJd4v/304f3cd43bbb.png	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler image 4	3	2026-08-13 07:45:56.528
cmspu2o310092ejl5dchhe1sf	cmsof2spy009uagl5h5ldpucd	https://i.ibb.co/xt8Pjwf6/787ea9c4f5df.png	numbuzin No.3 Porcelain Tone Up Beige SPF50+ PA++++ Lazy Tone Up Cream	0	2026-08-12 08:34:42.925
cmspu2o310093ejl5bvmdraei	cmsof2spy009uagl5h5ldpucd	https://i.ibb.co/sd4dsvGm/2d3d9709af9a.jpg	numbuzin No.3 Porcelain Tone Up Beige SPF50+ PA++++ Lazy Tone Up Cream image 2	1	2026-08-12 08:34:42.925
cmspu2o310094ejl5ku0huk3c	cmsof2spy009uagl5h5ldpucd	https://i.ibb.co/JjjsgKHV/668e18f020c7.png	numbuzin No.3 Porcelain Tone Up Beige SPF50+ PA++++ Lazy Tone Up Cream image 3	2	2026-08-12 08:34:42.925
cmspu2o310095ejl56z3m7jmv	cmsof2spy009uagl5h5ldpucd	https://i.ibb.co/xrWMByt/4db6d5ac314a.png	numbuzin No.3 Porcelain Tone Up Beige SPF50+ PA++++ Lazy Tone Up Cream image 4	3	2026-08-12 08:34:42.925
cmspu2o310096ejl5jxsi2k0p	cmsof2spy009uagl5h5ldpucd	https://i.ibb.co/8gWkq5X8/228ad940ce9c.jpg	numbuzin No.3 Porcelain Tone Up Beige SPF50+ PA++++ Lazy Tone Up Cream image 5	4	2026-08-12 08:34:42.925
cmsr7rsq8000rkjl59ud9khde	cmsev2vmr003ge5l5i9ym859k	https://i.ibb.co/398KYYRL/7677cbfb535e.png	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler image 5	4	2026-08-13 07:45:56.528
cmsr7rsq8000skjl5tx12jj2x	cmsev2vmr003ge5l5i9ym859k	https://i.ibb.co/nqTFSg96/74e7f44ad778.png	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler image 6	5	2026-08-13 07:45:56.528
cmspu2o310097ejl5q061o3me	cmsof2spy009uagl5h5ldpucd	https://i.ibb.co/8npwBfVQ/b50378ba7edf.jpg	numbuzin No.3 Porcelain Tone Up Beige SPF50+ PA++++ Lazy Tone Up Cream image 6	5	2026-08-12 08:34:42.925
cmsr7rsq8000tkjl5rxn3ryki	cmsev2vmr003ge5l5i9ym859k	https://i.ibb.co/xSDrzdNG/21e473a8bee0.jpg	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler image 7	6	2026-08-13 07:45:56.528
cmsr7rsq8000ukjl5m8s9srkx	cmsev2vmr003ge5l5i9ym859k	https://i.ibb.co/d45Pk1Bd/d117acdbe4cf.jpg	GS8 High Speed Mini Cool Fan 3000mAh Low Noise Rechargeable Portable Personal Air Cooler image 8	7	2026-08-13 07:45:56.528
cmsr82ag8000vkjl5uvh54xqf	cmseuiruy002be5l5xukisdtq	https://i.ibb.co/3yLGHKWX/7285b8408448.png	Portable Lipstick Handheld Fan GS4	0	2026-08-13 07:54:06.056
cmsr82ag8000wkjl55j1jz5hf	cmseuiruy002be5l5xukisdtq	https://i.ibb.co/p62HjRjT/cc6e71070410.jpg	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan image 2	1	2026-08-13 07:54:06.056
cmsr82ag8000xkjl5qrjfvegd	cmseuiruy002be5l5xukisdtq	https://i.ibb.co/7ttBWDkQ/f0b23407524a.jpg	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan image 3	2	2026-08-13 07:54:06.056
cmsr82ag8000ykjl5204v777l	cmseuiruy002be5l5xukisdtq	https://i.ibb.co/TBNhXdGS/0aa89b585184.jpg	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan image 4	3	2026-08-13 07:54:06.056
cmsr82ag8000zkjl5aviokysu	cmseuiruy002be5l5xukisdtq	https://i.ibb.co/yFT3DM8L/94f9ad4ebe3f.jpg	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan image 5	4	2026-08-13 07:54:06.056
cmsr82ag80010kjl50uyys3d5	cmseuiruy002be5l5xukisdtq	https://i.ibb.co/C5Cf0f0J/bd5d91a7e51a.jpg	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan image 6	5	2026-08-13 07:54:06.056
cmsr82ag80011kjl58fsg1idb	cmseuiruy002be5l5xukisdtq	https://i.ibb.co/Vcz2snCP/1bcb5acf552b.jpg	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan image 7	6	2026-08-13 07:54:06.056
cmsr82ag80012kjl5gcs1coib	cmseuiruy002be5l5xukisdtq	https://i.ibb.co/yFL297Wm/0404aedde6db.jpg	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan image 8	7	2026-08-13 07:54:06.056
cmsr82ag80013kjl5dfb0qh1z	cmseuiruy002be5l5xukisdtq	https://i.ibb.co/nMqvymW1/b40923b1317f.jpg	GS4 Lipstick Handheld Fan 199 Speed 180° Rotatable LED Display Rechargeable Pocket Mini Fan image 9	8	2026-08-13 07:54:06.056
cmsragatb004okjl5eux2wwgg	cmsetqd7x000re5l5hq59opwb	https://i.ibb.co/VY8y1Fdp/6dce65fe6f97.png	X688  Mini High Speed Handheld Fan	0	2026-08-13 09:00:58.943
cmsragatb004pkjl5vm4s3ir8	cmsetqd7x000re5l5hq59opwb	https://i.ibb.co/8gFgx9yC/7f44b8ad5a2a.png	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan image 2	1	2026-08-13 09:00:58.943
cmsragatb004qkjl5llaguezj	cmsetqd7x000re5l5hq59opwb	https://i.ibb.co/0dTkw73/756b5df93422.jpg	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan image 3	2	2026-08-13 09:00:58.943
cmsragatb004rkjl5stycpb9a	cmsetqd7x000re5l5hq59opwb	https://i.ibb.co/wZZ4KP8N/f4a659dcfd45.jpg	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan image 4	3	2026-08-13 09:00:58.943
cmsragatb004skjl54ucqgjq3	cmsetqd7x000re5l5hq59opwb	https://i.ibb.co/XkyCmp52/5727e7a6973e.jpg	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan image 5	4	2026-08-13 09:00:58.943
cmsu4z3kq0023oll526zp6u1i	cmssrsdry0060kjl5mhqtt9tg	https://i.ibb.co/2Y61yjY7/b88585f8574f.jpg	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag	0	2026-08-15 08:50:56.858
cmsu4z3kq0024oll5x9rtt48f	cmssrsdry0060kjl5mhqtt9tg	https://i.ibb.co/RGhWDyp5/b58b4f8200d6.jpg	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag image 2	1	2026-08-15 08:50:56.858
cmsu4z3kq0025oll5oi0htcm8	cmssrsdry0060kjl5mhqtt9tg	https://i.ibb.co/Q3bM5XqC/1b3baf4cbe32.jpg	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag image 3	2	2026-08-15 08:50:56.858
cmsu4z3kq0026oll5fx2sl3d0	cmssrsdry0060kjl5mhqtt9tg	https://i.ibb.co/mrXBCJ33/990f2dd68ad2.jpg	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag image 4	3	2026-08-15 08:50:56.858
cmsu4z3kq0027oll56jas3abr	cmssrsdry0060kjl5mhqtt9tg	https://i.ibb.co/LDJhfbmy/b9c2559e0a42.jpg	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag image 5	4	2026-08-15 08:50:56.858
cmsu4z3kq0028oll5gijyxtoz	cmssrsdry0060kjl5mhqtt9tg	https://i.ibb.co/WvqH7qZ5/2219c9dc8a5f.jpg	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag image 6	5	2026-08-15 08:50:56.858
cmsragatb004tkjl5aox7ul7b	cmsetqd7x000re5l5hq59opwb	https://i.ibb.co/CpkdD05N/f36aeac249d7.jpg	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan image 6	5	2026-08-13 09:00:58.943
cmsragatb004ukjl5fjezu1t8	cmsetqd7x000re5l5hq59opwb	https://i.ibb.co/fVc8QJHG/31dd2207de60.jpg	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan image 7	6	2026-08-13 09:00:58.943
cmsragatb004vkjl5kw3pxl86	cmsetqd7x000re5l5hq59opwb	https://i.ibb.co/GfYm3phV/d8dc92ef2d85.jpg	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan image 8	7	2026-08-13 09:00:58.943
cmsragatb004wkjl5mbz8xzaj	cmsetqd7x000re5l5hq59opwb	https://i.ibb.co/w8czWXM/17f4d54a97c3.jpg	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan image 9	8	2026-08-13 09:00:58.943
cmsragatb004xkjl5nm3s6rbl	cmsetqd7x000re5l5hq59opwb	https://i.ibb.co/bjyMf4j1/a98408032d54.jpg	X688 Portable Mini Handheld Fan 15000RPM Strong Wind LED Display Travel Pocket Fan image 10	9	2026-08-13 09:00:58.943
cmsu4z3kq0029oll52zh6yli3	cmssrsdry0060kjl5mhqtt9tg	https://i.ibb.co/nqj0sJKB/1541a72cc94b.jpg	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag image 7	6	2026-08-15 08:50:56.858
cmsu4z3kq002aoll5x7xezusw	cmssrsdry0060kjl5mhqtt9tg	https://i.ibb.co/p61Hx3jb/05264be8ee66.jpg	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag image 8	7	2026-08-15 08:50:56.858
cmsu4z3kq002boll5xfjbmeia	cmssrsdry0060kjl5mhqtt9tg	https://i.ibb.co/60p4RQmS/bd9c301d9928.jpg	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag image 9	8	2026-08-15 08:50:56.858
cmsu4z3kq002coll5wp42sp69	cmssrsdry0060kjl5mhqtt9tg	https://i.ibb.co/rKDTRQHc/389880876ff6.jpg	30L Large Insulated Cooler Tote Bag Triple‑Layer Thermal Reusable Shopping Picnic Food Bag image 10	9	2026-08-15 08:50:56.858
cmsu51iat002doll5s1sg2u6e	cmssrges5005okjl576m671fd	https://i.ibb.co/MkSk3bC2/95f355a28dde.jpg	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use	0	2026-08-15 08:52:49.253
cmsu51iat002eoll5mqq0k3kr	cmssrges5005okjl576m671fd	https://i.ibb.co/tpZvRCn3/cf69b27e8e5b.jpg	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use image 2	1	2026-08-15 08:52:49.253
cmsu51iat002foll5pnmcmr2s	cmssrges5005okjl576m671fd	https://i.ibb.co/Tx77MX6s/6dc09f1a7f47.jpg	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use image 3	2	2026-08-15 08:52:49.253
cmsu51iat002goll587f4krqa	cmssrges5005okjl576m671fd	https://i.ibb.co/s9RS60mD/78579f493776.jpg	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use image 4	3	2026-08-15 08:52:49.253
cmsu51iat002holl5lsve5ezw	cmssrges5005okjl576m671fd	https://i.ibb.co/mFbDgpXV/8a765a77a68f.jpg	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use image 5	4	2026-08-15 08:52:49.253
cmsu51iat002ioll5xmwsez0l	cmssrges5005okjl576m671fd	https://i.ibb.co/8LdnKDFk/e679bfe5af8d.jpg	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use image 6	5	2026-08-15 08:52:49.253
cmsu51iat002joll5xoxurfc3	cmssrges5005okjl576m671fd	https://i.ibb.co/1VMVSnb/7cd8f57b86e5.jpg	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use image 7	6	2026-08-15 08:52:49.253
cmsu51iat002koll5whpsk0z8	cmssrges5005okjl576m671fd	https://i.ibb.co/yBqvqqdP/8c4bb2d2543b.jpg	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use image 8	7	2026-08-15 08:52:49.253
cmsu51iat002loll53yzfldyh	cmssrges5005okjl576m671fd	https://i.ibb.co/whBqFDV9/1a65c0c58717.jpg	Oxford Cloth Fanny Pack, Multi‑Pocket Water‑Resistant Waist Bag Adjustable Belt Pouch for Travel Sports Daily Use image 9	8	2026-08-15 08:52:49.253
cmsr8b0qa0014kjl5ld2a2auw	cmseud47n001ye5l5qahrywu0	https://i.ibb.co/4gMqY2Gj/3a34d786013b.png	N607 Vortex High Speed Handheld Fan	0	2026-08-13 08:00:53.362
cmsr8b0qa0015kjl5i5xvxpvn	cmseud47n001ye5l5qahrywu0	https://i.ibb.co/ZzgpJfnn/901ba63ee6dd.jpg	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan image 2	1	2026-08-13 08:00:53.362
cmsr8b0qa0016kjl5obuyxu6y	cmseud47n001ye5l5qahrywu0	https://i.ibb.co/pBfB0vcd/07c1408a06e9.jpg	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan image 3	2	2026-08-13 08:00:53.362
cmsr8b0qa0017kjl5fhvg3fgx	cmseud47n001ye5l5qahrywu0	https://i.ibb.co/PZH04D48/05776abd89e2.jpg	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan image 4	3	2026-08-13 08:00:53.362
cmsr8b0qa0018kjl5bwdqmocd	cmseud47n001ye5l5qahrywu0	https://i.ibb.co/z3872Z2/d01b7e24de70.jpg	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan image 5	4	2026-08-13 08:00:53.362
cmsr8b0qa0019kjl59423gffj	cmseud47n001ye5l5qahrywu0	https://i.ibb.co/Pz37Wjqh/e86687634a94.jpg	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan image 6	5	2026-08-13 08:00:53.362
cmsr8b0qa001akjl5i3oy7jmt	cmseud47n001ye5l5qahrywu0	https://i.ibb.co/mFNtD1jK/0f35125ff6f8.jpg	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan image 7	6	2026-08-13 08:00:53.362
cmsr8b0qa001bkjl56lett989	cmseud47n001ye5l5qahrywu0	https://i.ibb.co/6C66PmJ/7959d2075028.jpg	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan image 8	7	2026-08-13 08:00:53.362
cmsr8b0qa001ckjl5cjhqs2wn	cmseud47n001ye5l5qahrywu0	https://i.ibb.co/5XCfQ11N/fb72d5bed183.jpg	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan image 9	8	2026-08-13 08:00:53.362
cmspu6etd0098ejl54bvbqni4	cmsoevgwh009aagl52j0rq6cj	https://i.ibb.co/y7rbG2T/2cf99e3430e6.jpg	Bobbi Brown Vitamin Enriched Face Base Primer Moisturizer	0	2026-08-12 08:37:37.537
cmspu6etd0099ejl5xao711fo	cmsoevgwh009aagl52j0rq6cj	https://i.ibb.co/CKFxzDRY/0fd206c6d70a.jpg	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin image 2	1	2026-08-12 08:37:37.537
cmspu6etd009aejl513tnyrct	cmsoevgwh009aagl52j0rq6cj	https://i.ibb.co/9mz0nkf8/09091d509016.jpg	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin image 3	2	2026-08-12 08:37:37.537
cmspu6etd009bejl5u3g06imf	cmsoevgwh009aagl52j0rq6cj	https://i.ibb.co/chK8MCyd/495667d64666.jpg	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin image 4	3	2026-08-12 08:37:37.537
cmspu6etd009cejl5ujh6rfa3	cmsoevgwh009aagl52j0rq6cj	https://i.ibb.co/7xDhDVV0/6f834be089af.jpg	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin image 5	4	2026-08-12 08:37:37.537
cmspu6etd009dejl560a93s3y	cmsoevgwh009aagl52j0rq6cj	https://i.ibb.co/2wsyWf0/82512b137104.jpg	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin image 6	5	2026-08-12 08:37:37.537
cmspu6etd009eejl5ji8ydawv	cmsoevgwh009aagl52j0rq6cj	https://i.ibb.co/Mx1fTJd1/9d4264b4123e.jpg	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin image 7	6	2026-08-12 08:37:37.537
cmspu6etd009fejl5mr1gmmy1	cmsoevgwh009aagl52j0rq6cj	https://i.ibb.co/mCJLRZVd/100e10b3de06.jpg	Bobbi Brown Enriched Face Base Primer Moisturizer Cream Hydrating Smooth Pores Long Lasting Makeup Base Anti Caking Orange Cream For Dry Skin image 8	7	2026-08-12 08:37:37.537
cmsr8b0qa001dkjl5m2q9bhlh	cmseud47n001ye5l5qahrywu0	https://i.ibb.co/Nd34YpXC/6acba43c6a19.jpg	N607 Vortex Handheld Fan 10000RPM Foldable 1800mAh Rechargeable Portable Mini Cooling Fan image 10	9	2026-08-13 08:00:53.362
cmspu9ovq009gejl5ls6s6sxb	cmsoexnlq009lagl56g2pim8q	https://i.ibb.co/fdW8WczZ/8abb170d6f98.jpg	éLL Multi-effect Toning Cream, Natural Brightening Lazy Face Cream	0	2026-08-12 08:40:10.55
cmsraimr4004ykjl5dd89durx	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/Fq7Q2FTj/3f513b731786.png	Turbo fan Small Ice Bucket	0	2026-08-13 09:02:47.728
cmsraimr4004zkjl59p0qsawn	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/nMRvkpCk/87d23eb8df8a.jpg	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan image 2	1	2026-08-13 09:02:47.728
cmsraimr40050kjl5jk7239fp	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/0pJ212Td/cbc4709ef7dd.jpg	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan image 3	2	2026-08-13 09:02:47.728
cmsraimr40051kjl5ju8f2fu8	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/208WrQ7S/d6d0dcb407f0.jpg	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan image 4	3	2026-08-13 09:02:47.728
cmsraimr40052kjl56cvlnxpy	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/hJz7NXDB/c57078444102.jpg	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan image 5	4	2026-08-13 09:02:47.728
cmsraimr40053kjl5lnb47o31	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/mF8XfL4L/4f68cbb14a72.jpg	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan image 6	5	2026-08-13 09:02:47.728
cmsraimr40054kjl506s9t1dp	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/jkfSTQvB/738c70ad5104.jpg	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan image 7	6	2026-08-13 09:02:47.728
cmsraimr40055kjl5xtq0ym05	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/6cnfLZmr/7c51cfad5c89.jpg	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan image 8	7	2026-08-13 09:02:47.728
cmsraimr40056kjl590b3nfwg	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/rKN41TP1/56d0e29a8bf8.jpg	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan image 9	8	2026-08-13 09:02:47.728
cmsraimr40057kjl5bf61h7o1	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/MyqKMzcr/e2bd43ff75c0.jpg	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan image 10	9	2026-08-13 09:02:47.728
cmt1brs6u000qagl5f9qzwkby	cmt1b7iu70000agl58hd3r9h4	https://i.ibb.co/Y7x285K3/b041616a5c49.jpg	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion	0	2026-08-20 09:35:36.054
cmt1brs6u000ragl5f0ypiz69	cmt1b7iu70000agl58hd3r9h4	https://i.ibb.co/1G5hHhpH/fd656d1de516.jpg	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion image 2	1	2026-08-20 09:35:36.054
cmt1brs6u000sagl5njwx20w6	cmt1b7iu70000agl58hd3r9h4	https://i.ibb.co/dwwbykYt/ef4cb00d5233.jpg	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion image 3	2	2026-08-20 09:35:36.054
cmt1brs6u000tagl5dibrmmi9	cmt1b7iu70000agl58hd3r9h4	https://i.ibb.co/tTNSL482/5952a26b8292.jpg	Coolkim Vibradorador Mujer Juguetes Eroticos Vibrador Mando Distancia Vibradorador Clitoris Consoladores.. para Mujer con Vibracion image 4	3	2026-08-20 09:35:36.054
cmspu9ovq009hejl53wqk3lh6	cmsoexnlq009lagl56g2pim8q	https://i.ibb.co/0jHt4pTw/aa2c86ec3052.jpg	éLL Multi-effect Toning Cream, Natural Brightening Lazy Face Cream image 2	1	2026-08-12 08:40:10.55
cmspu9ovq009iejl58vfivb0h	cmsoexnlq009lagl56g2pim8q	https://i.ibb.co/YBw9VpVj/dcfd6b0ec326.jpg	éLL Multi-effect Toning Cream, Natural Brightening Lazy Face Cream image 3	2	2026-08-12 08:40:10.55
cmspu9ovq009jejl5q96nkr8g	cmsoexnlq009lagl56g2pim8q	https://i.ibb.co/ks3z5Qy7/83c14c879c8a.jpg	éLL Multi-effect Toning Cream, Natural Brightening Lazy Face Cream image 4	3	2026-08-12 08:40:10.55
cmspu9ovq009kejl5p6i67ldn	cmsoexnlq009lagl56g2pim8q	https://i.ibb.co/FqwtNbKg/b289e5d55852.jpg	éLL Multi-effect Toning Cream, Natural Brightening Lazy Face Cream image 5	4	2026-08-12 08:40:10.55
cmspu9ovq009lejl5p2ssqegv	cmsoexnlq009lagl56g2pim8q	https://i.ibb.co/f7ZNxJF/05ec22a8869b.jpg	éLL Multi-effect Toning Cream, Natural Brightening Lazy Face Cream image 6	5	2026-08-12 08:40:10.55
cmspsvkmf004xejl59sqxg5bz	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/9HknyNFB/1d17e98e6123.png	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care	0	2026-08-12 08:01:12.231
cmsraimr40058kjl5ms4ornyw	cmseu3qbo0017e5l5bwq7dfg8	https://i.ibb.co/v49tZj1D/27d9d21e907a.jpg	M57 Turbofan Portable Fan 18°C Cold Wind 100 Speed 3600mAh Rechargeable Mini Ice Bucket Fan image 11	10	2026-08-13 09:02:47.728
cmspsvkmf004yejl52vikw0mk	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/tMW8Qc2N/6f3839f3f38d.jpg	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 2	1	2026-08-12 08:01:12.231
cmspsvkmf004zejl51d57uiz3	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/Kcg9TTWN/c1fb205d8b75.jpg	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 3	2	2026-08-12 08:01:12.231
cmspsvkmf0050ejl5cxtgof2t	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/V0ygjvMH/21ffd70ad4d9.jpg	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 4	3	2026-08-12 08:01:12.231
cmspsvkmf0051ejl5jslovxct	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/ZpKcqtTX/07c0cee1da21.jpg	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 5	4	2026-08-12 08:01:12.231
cmspsvkmf0052ejl5dqj9ovyv	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/4n0qzNGG/2564ce2392a7.jpg	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 6	5	2026-08-12 08:01:12.231
cmspsvkmf0053ejl56ltqxaff	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/q3N67wK2/9dfdfa3baea3.jpg	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 7	6	2026-08-12 08:01:12.231
cmspsvkmf0054ejl5tz06dn3w	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/TBdMktPd/2d5fe850824e.jpg	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 8	7	2026-08-12 08:01:12.231
cmspsvkmf0055ejl5e3jofx46	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/hJPWYZMK/5bece8e84956.png	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 9	8	2026-08-12 08:01:12.231
cmspsvkmf0056ejl5n6xjnk79	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/3mYyGd9f/40f3dd3383cd.png	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 10	9	2026-08-12 08:01:12.231
cmspsvkmf0057ejl5ahdrusum	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/TDf0ps1R/9e80150fb231.png	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 11	10	2026-08-12 08:01:12.231
cmspsvkmf0058ejl57zr821g4	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/KjbcW6x4/f8d76e7ee77e.png	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 12	11	2026-08-12 08:01:12.231
cmspsvkmf0059ejl56xzi8fme	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/xtVhBj5w/da0aa6a222c9.png	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 13	12	2026-08-12 08:01:12.231
cmspsvkmf005aejl53cwch7b3	cmsohsgn900lkagl55jpcpsjj	https://i.ibb.co/sdvMJCM7/60e76ecd1230.png	Fruit & Mint Mouth Freshener Spray 6 Flavors Portable 20ml Oral Spray Instant Fresh Breath Remove Bad Breath Pocket Size Daily Oral Care image 14	13	2026-08-12 08:01:12.231
cmspsvw73005bejl5swthzs2y	cmsoh83z100j0agl5o90cs0oj	https://i.ibb.co/BHDyssZx/def084e190c9.png	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care	0	2026-08-12 08:01:27.231
cmspsvw73005cejl5irps699o	cmsoh83z100j0agl5o90cs0oj	https://i.ibb.co/KSzWdVq/59d97d27764e.png	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care image 2	1	2026-08-12 08:01:27.231
cmspsvw73005dejl5l4m1b855	cmsoh83z100j0agl5o90cs0oj	https://i.ibb.co/nNqRPyxC/ea41e08518fd.png	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care image 3	2	2026-08-12 08:01:27.231
cmspsvw73005eejl51oja4yyr	cmsoh83z100j0agl5o90cs0oj	https://i.ibb.co/Sjqb35P/e768a031d935.png	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care image 4	3	2026-08-12 08:01:27.231
cmspsvw73005fejl5p24i96s5	cmsoh83z100j0agl5o90cs0oj	https://i.ibb.co/cKpdWj8h/eeb5476deb33.png	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care image 5	4	2026-08-12 08:01:27.231
cmspsvw73005gejl5kdf4xxp1	cmsoh83z100j0agl5o90cs0oj	https://i.ibb.co/yc8qw9qD/beeb0b0b7f94.png	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care image 6	5	2026-08-12 08:01:27.231
cmspsvw73005hejl5i4wcyqld	cmsoh83z100j0agl5o90cs0oj	https://i.ibb.co/YFCmMW28/15bd292e3809.png	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care image 7	6	2026-08-12 08:01:27.231
cmspsvw73005iejl5sk0husc3	cmsoh83z100j0agl5o90cs0oj	https://i.ibb.co/20qWmRrr/86cc6e83d357.png	BRINGGREEN Hyalu Lip Essence 2Pcs Twin Pack Hydrating Lip Balm Non-Sticky Shiny Lip Treatment Repair Dry Chapped Lips Care image 8	7	2026-08-12 08:01:27.231
cmspsw8aq005jejl5bbknajsr	cmsoh39dg00ieagl5qprj3v16	https://i.ibb.co/6js5FCn/0c364716b702.jpg	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care	0	2026-08-12 08:01:42.914
cmspsw8aq005kejl5qn0j68ot	cmsoh39dg00ieagl5qprj3v16	https://i.ibb.co/wFpQFNyC/071b92aea93b.png	Torriden Solid In Lip Essence Duo Set 2Pcs Ceramide Lip Balm Deep Moisturizing Non-Sticky Fragrance-Free Repair Dry Flaky Lips Care image 2	1	2026-08-12 08:01:42.914
\.


--
-- TOC entry 3894 (class 0 OID 24831)
-- Dependencies: 224
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductVariant" (id, "productId", "variantKey", name, size, color, "modelNumber", sku, stock, image, attributes, "isActive", "createdAt", "updatedAt") FROM stdin;
cmseuv7fx0034e5l5mo35z3s0	cmseuv7eg0033e5l5zhr3jjip	color=black	\N	\N	Black	Y5-Black	XH-E06(3)-1	100	https://i.ibb.co/tPbxbSJp/4f50ff7ef56e.jpg	\N	t	2026-08-04 16:11:26.392	2026-08-13 07:45:29.532
cmseuv7fy0035e5l5zcq5nwg8	cmseuv7eg0033e5l5zhr3jjip	color=white	\N	\N	White	Y5-White	XH-E06(3)-3	100	https://i.ibb.co/DH2L0B46/5b77b580fa22.jpg	\N	t	2026-08-04 16:11:26.392	2026-08-13 07:45:29.608
cmseuv7fy0036e5l5j8d5vc1w	cmseuv7eg0033e5l5zhr3jjip	color=blue	\N	\N	Blue	Y5-Blue	XH-E06(3)-2	100	https://i.ibb.co/zyWRMYL/70cf32bf858e.jpg	\N	t	2026-08-04 16:11:26.392	2026-08-13 07:45:29.685
cmsevs83a0061e5l5rucuxq97	cmsevs81m0060e5l5x2jq7v6r	color=white	\N	\N	White	A09-White	XH-E08(5)-2	100	https://i.ibb.co/wFt2fJpg/b9d5f397824f.jpg	\N	t	2026-08-04 16:37:06.874	2026-08-13 08:06:08.759
cmsev2voi003he5l554jlhqkg	cmsev2vmr003ge5l5i9ym859k	color=pink	\N	\N	Pink	GS8-Pink	XH-E10(2)-2	100	https://i.ibb.co/8nTRV8c2/d07c9cf36433.jpg	\N	t	2026-08-04 16:17:24.387	2026-08-13 07:45:56.304
cmsev2voi003ie5l58otjj9it	cmsev2vmr003ge5l5i9ym859k	color=blue	\N	\N	Blue	GS8-Blue	XH-E10(2)-1	100	https://i.ibb.co/JRs5YWpf/3ee00dfaf6a0.jpg	\N	t	2026-08-04 16:17:24.387	2026-08-13 07:45:56.378
cmseuirwx002de5l52olpr63o	cmseuiruy002be5l5xukisdtq	color=light%20grey	\N	\N	Light Grey	GS4-Light Grey	XH-E02(3)-2	100	https://i.ibb.co/273KmFdp/2f0a65515a01.jpg	\N	t	2026-08-04 16:01:46.378	2026-08-13 07:54:05.749
cmseuirwx002ee5l5k164x5pr	cmseuiruy002be5l5xukisdtq	color=purple%20grey	\N	\N	Purple grey	GS4-Purple grey	XH-E02(3)-1	10	https://i.ibb.co/sXtgfK1/76577cba09a9.jpg	\N	t	2026-08-04 16:01:46.378	2026-08-13 07:54:05.826
cmseuirwx002ce5l511o8dkd9	cmseuiruy002be5l5xukisdtq	color=champagne%20pink	\N	\N	Champagne Pink	GS4-Champagne Pink	XH-E02(3)-3	100	https://i.ibb.co/whGDKWSm/fc5f991f9c45.jpg	\N	t	2026-08-04 16:01:46.378	2026-08-13 07:54:05.902
cmseud4a10020e5l5p0alr1id	cmseud47n001ye5l5qahrywu0	color=green	\N	\N	Green	N607-Green	XH-E03(3)-3	100	https://i.ibb.co/HfPpVPKZ/24352b486cc4.jpg	\N	t	2026-08-04 15:57:22.451	2026-08-13 08:00:53.147
cmsevbh0f003ue5l5soohhbvk	cmsevbgyr003te5l5k1blh6hk	color=black	\N	\N	Black	YD03	XH-E13	10	https://i.ibb.co/ZpwRTmQF/a5f77e48ae18.jpg	\N	t	2026-08-04 16:24:05.283	2026-08-13 08:03:31.819
cmsevs83a0065e5l5ycjoidb2	cmsevs81m0060e5l5x2jq7v6r	color=skin%20tone	\N	\N	skin tone	A09-skin tone	XH-E08(5)-4	100	https://i.ibb.co/xqF4s6Y5/73d8650a5f89.jpg	\N	t	2026-08-04 16:37:06.874	2026-08-13 08:06:08.837
cmsevs83a0062e5l57okwbvqw	cmsevs81m0060e5l5x2jq7v6r	color=purple	\N	\N	Purple	A09-Purple	XH-E08(5)-5	100	https://i.ibb.co/YTfrz2TX/88c315578aeb.jpg	\N	t	2026-08-04 16:37:06.874	2026-08-13 08:06:08.915
cmsevs83a0063e5l5dsu7y8zq	cmsevs81m0060e5l5x2jq7v6r	color=black	\N	\N	Black	A09-Black	XH-E08(5)-1	100	https://i.ibb.co/ynVN5xPR/2b10339cd335.jpg	\N	t	2026-08-04 16:37:06.874	2026-08-13 08:06:08.993
cmsevs83a0064e5l5scnb0csv	cmsevs81m0060e5l5x2jq7v6r	color=pink	\N	\N	Pink	A09-Pink	XH-E08(5)-3	100	https://i.ibb.co/p615B4py/abed4f4b2a62.jpg	\N	t	2026-08-04 16:37:06.874	2026-08-13 08:06:09.072
cmsoefl2u007vagl5bo25reoy	cmsoefl0a007uagl52wuho36v	color=black	\N	\N	Black	\N	XH-S03(4)-1	100	https://i.ibb.co/Zpy1fWLQ/997d1b84accd.png	\N	t	2026-08-11 08:29:05.434	2026-08-13 08:14:44.236
cmsoefl2u007wagl5odw7dxxb	cmsoefl0a007uagl52wuho36v	color=pink	\N	\N	Pink	\N	XH-S03(4)-2	0	https://i.ibb.co/GvznGVNy/af6488840ac7.png	\N	t	2026-08-11 08:29:05.434	2026-08-13 08:14:44.314
cmsoefl2u007xagl5mmdnlael	cmsoefl0a007uagl52wuho36v	color=red	\N	\N	Red	\N	XH-S03(4)-3	0	https://i.ibb.co/LhN9fVL8/461318a4985b.png	\N	t	2026-08-11 08:29:05.434	2026-08-13 08:14:44.391
cmsoenfvk008lagl5v5z2dtaf	cmsoenfty008kagl5xqh6iky0	default	\N	\N	\N	\N	XH-C01	100	https://i.ibb.co/Xk8MTdMJ/b2a4148698c4.jpg	\N	t	2026-08-11 08:35:11.974	2026-08-13 08:19:39.373
cmsoevgy4009bagl56s3mrsac	cmsoevgwh009aagl52j0rq6cj	default	\N	\N	\N	\N	XH-C29	1000	https://i.ibb.co/y7rbG2T/2cf99e3430e6.jpg	\N	f	2026-08-11 08:41:26.609	2026-08-12 08:37:37.417
cmsok17u000qvagl5wao5kzyr	cmsok17rz00qpagl5yx11zg55	color=milky%20white	\N	\N	milky white	2360#milky white	XH-B05(10)-6	99	https://i.ibb.co/bRGwky4k/649010b0acc5.png	\N	t	2026-08-11 11:05:52.799	2026-08-13 08:51:58.062
cmsetqdah000ve5l5laa59u50	cmsetqd7x000re5l5hq59opwb	color=green|size=mini	\N	Mini	Green	X688-Green	XH-E05(5)-3	100	https://i.ibb.co/60v4PTBR/02725ada2586.jpg	\N	t	2026-08-04 15:39:41.037	2026-08-13 09:00:58.356
cmsoenwq2008vagl5qwfn96jn	cmsoenwof008uagl5plzqvpqm	default	\N	\N	\N	\N	XH-C14	999	https://i.ibb.co/wF12SXzT/13373ecb5c17.jpg	\N	t	2026-08-11 08:35:33.808	2026-08-12 07:21:39.967
cmsoexnnf009magl5xp7aank5	cmsoexnlq009lagl56g2pim8q	default	\N	\N	\N	\N	XH-C02	100	\N	\N	t	2026-08-11 08:43:08.606	2026-08-12 08:40:10.403
cmsoep75q0097agl53nj5ki6l	cmsoep73y0096agl5r0g0yrgt	default	\N	\N	\N	\N	XH-C28	1000	https://i.ibb.co/pvhXmVY3/3e5f36036383.jpg	\N	t	2026-08-11 08:36:33.982	2026-08-12 08:44:15.861
cmsetqdah000te5l5rtmw8gos	cmsetqd7x000re5l5hq59opwb	color=purple|size=mini	\N	Mini	Purple	X688-Purple	XH-E05(5)-4	100	https://i.ibb.co/k2jDKwLy/1e7d946a5932.jpg	\N	t	2026-08-04 15:39:41.037	2026-08-13 09:00:58.649
cmseu3qdu0018e5l5yrbq3ijj	cmseu3qbo0017e5l5bwq7dfg8	color=black	\N	\N	Black	M57-Black	XH-E07(2)-1	100	https://i.ibb.co/TMhKVscr/07f9f8baab06.jpg	\N	t	2026-08-04 15:50:04.548	2026-08-13 09:02:47.484
cmseu3qdu0019e5l5e2ow6mf8	cmseu3qbo0017e5l5bwq7dfg8	color=white	\N	\N	White	M57-White	XH-E07(2)-2	100	https://i.ibb.co/QjKPPvg2/fd3b2e49f769.jpg	\N	t	2026-08-04 15:50:04.548	2026-08-13 09:02:47.565
cmssrsdtx0063kjl5155d1jb9	cmssrsdry0060kjl5mhqtt9tg	color=black	\N	\N	Black	\N	XH-B08(3)-1	999	https://i.ibb.co/1GSczgRZ/d5582223d3a3.jpg	\N	t	2026-08-14 09:54:02.302	2026-08-15 08:50:56.569
cmssrgeuo005pkjl50kcuyyzl	cmssrges5005okjl576m671fd	color=black	\N	\N	black	\N	XH-B07(4)-1	0	https://i.ibb.co/1VMVSnb/7cd8f57b86e5.jpg	\N	t	2026-08-14 09:44:43.733	2026-08-15 08:52:48.899
cmsevi0jw004xe5l53t25m70r	cmsevi0i4004we5l5dfi04msm	color=%23000000	\N	\N	#000000	S20	XH-E12-1	99	https://i.ibb.co/gF4m5SDX/32f36cf78178.jpg	\N	t	2026-08-04 16:29:10.54	2026-08-23 09:49:17.706
cmsevlqxd005ke5l5atwxz8s7	cmsevlqvf005je5l5ixjvc5kh	color=%23000000	\N	\N	#000000	\N	\N	0	https://i.ibb.co/PGJq1GP5/bd3588b41e99.jpg	\N	t	2026-08-04 16:32:04.683	2026-08-13 01:46:15.05
cmsn6f29f000hagl5i0hdbyme	cmsn6f27a000gagl5b0yvsz4t	color=purple	\N	\N	Purple	\N	XH-E09-1	27	https://i.ibb.co/fY050xyq/93551827b111.png	\N	t	2026-08-10 11:56:57.958	2026-08-23 10:12:29.04
cmsodxbd0007magl5656o2ezo	cmsodxbat007lagl5twvuqhem	default	\N	\N	\N	\N	XH-A2 FX	0	https://i.ibb.co/JFq2mQdM/a15c8c190435.jpg	\N	t	2026-08-11 08:14:53.045	2026-08-13 01:47:04.167
cmseupxq8002ue5l5561st3nm	cmseupxoj002re5l5ll7imhj2	color=blue	\N	\N	Blue	S001-Blue	XH-E04(4)-3	100	https://i.ibb.co/fdgRZ9dL/685dffdf3d19.jpg	\N	t	2026-08-04 16:07:20.515	2026-08-13 01:44:30.623
cmseupxq8002se5l5xfxh1usj	cmseupxoj002re5l5ll7imhj2	color=black	\N	\N	Black	S001-Black	XH-E04(4)-1	100	https://i.ibb.co/QjNcN7ds/dbcce97d4d42.jpg	\N	t	2026-08-04 16:07:20.515	2026-08-13 01:44:30.708
cmseupxq8002te5l5i4b2g683	cmseupxoj002re5l5ll7imhj2	color=pink	\N	\N	Pink	S001-Pink	XH-E04(4)-2	100	https://i.ibb.co/YT0kSh0t/71cf57250fdc.jpg	\N	t	2026-08-04 16:07:20.515	2026-08-13 01:44:30.792
cmsoc6tvk002yagl5kbunlqa8	cmseupxoj002re5l5ll7imhj2	color=white	\N	\N	White	S001-White	XH-E04(4)-4	100	https://i.ibb.co/PssNtfK4/568336809248.jpg	\N	t	2026-08-11 07:26:17.792	2026-08-13 01:44:30.877
cmsof99rj00aqagl5mqsy8dk0	cmsof41qn00a3agl50g9g1u37	color=white	\N	\N	white	\N	XH-C16(3)-2	999	https://i.ibb.co/XxCR78BN/ce99979ed5b7.jpg	\N	t	2026-08-11 08:52:10.543	2026-08-12 07:04:01.913
cmsof99vk00asagl5ta40u3n7	cmsof41qn00a3agl50g9g1u37	color=red	\N	\N	red	\N	XH-C16(3)-3	999	https://i.ibb.co/BHfW832L/5566aa78bf7c.jpg	\N	t	2026-08-11 08:52:10.688	2026-08-12 07:04:02.002
cmsofqg5m00coagl5argv7g29	cmsofqg4200cmagl55re4rwis	color=yellow	\N	\N	yellow	\N	XH-C18(2)-2	999	https://i.ibb.co/R4Q3y8TD/e698704001e4.png	\N	f	2026-08-11 09:05:31.922	2026-08-12 07:19:08.436
cmsofqg5m00cnagl50e243eef	cmsofqg4200cmagl55re4rwis	color=pink	\N	\N	pink	\N	XH-C18(2)-1	999	https://i.ibb.co/dsPGH236/3a031e41eb02.png	\N	t	2026-08-11 09:05:31.922	2026-08-12 07:19:08.514
cmsof2ss1009vagl58sv4d1zb	cmsof2spy009uagl5h5ldpucd	default	\N	\N	\N	\N	XH-C03	100	\N	\N	t	2026-08-11 08:47:08.518	2026-08-12 08:34:42.781
cmssqwbve005ikjl5nxcnxpiz	cmssqwbt8005hkjl5dbp5umy7	default	\N	\N	\N	\N	\N	100	\N	\N	t	2026-08-14 09:29:06.764	2026-08-14 10:16:26.902
cmsssqsr0008nkjl5u7s73nxi	cmsssqspa008mkjl56pzpxbf7	default	\N	\N	\N	Black	XH-B14(3)-1	1000	https://i.ibb.co/4w9drSpG/35974dcbc45c.jpg	\N	t	2026-08-14 10:20:47.95	2026-08-14 10:32:00.001
cmsswqk400001oll5l1uaoxnm	cmsswqk1j0000oll5ob5qxbnu	color=black	\N	\N	Black	\N	XH-B11(6)-1	100	https://i.ibb.co/2mZWZDK/6ed4ec3c3754.webp	\N	t	2026-08-14 12:12:35.192	2026-08-14 12:12:35.192
cmsswqk400002oll52esm1uh6	cmsswqk1j0000oll5ob5qxbnu	color=white	\N	\N	white	\N	XH-B11(6)-2	100	https://i.ibb.co/bRRnFMzW/969c0e54666d.webp	\N	t	2026-08-14 12:12:35.192	2026-08-14 12:12:35.192
cmsswqk400003oll541s3u9qx	cmsswqk1j0000oll5ob5qxbnu	color=royal%20blue	\N	\N	royal blue	\N	XH-B11(6)-3	100	https://i.ibb.co/wFLLmVL5/e468b2f12a3f.webp	\N	t	2026-08-14 12:12:35.192	2026-08-14 12:12:35.192
cmsswqk400004oll5uoj7arkt	cmsswqk1j0000oll5ob5qxbnu	color=wear%20blue	\N	\N	Wear blue	\N	XH-B11(6)-4	100	https://i.ibb.co/Y4Qz8HsF/2528a1410f9b.webp	\N	t	2026-08-14 12:12:35.192	2026-08-14 12:12:35.192
cmsswqk400005oll5wnpgnm0w	cmsswqk1j0000oll5ob5qxbnu	color=red	\N	\N	red	\N	XH-B11(6)-5	100	https://i.ibb.co/MyYcWsZ8/a23a1e1d3d9b.webp	\N	t	2026-08-14 12:12:35.192	2026-08-14 12:12:35.192
cmsswqk400006oll52nnbbgq1	cmsswqk1j0000oll5ob5qxbnu	color=orange	\N	\N	orange	\N	XH-B11(6)-6	100	https://i.ibb.co/n8D4qmwm/9b3c9d9784cd.webp	\N	t	2026-08-14 12:12:35.192	2026-08-14 12:12:35.192
cmssxb61u000koll5pps76d9w	cmssxb5zf000joll5akbaclyg	default	\N	\N	\N	\N	XH-B12	100	https://i.ibb.co/5W7KT0v3/f08b432f003f.webp	\N	t	2026-08-14 12:28:36.747	2026-08-14 12:28:36.747
cmsu47g7o001doll5o7bap30u	cmssty1770090kjl5pnp0s698	color=%23a7a6a6	\N	\N	#A7A6A6	\N	XH-B17(8)-2	100	https://i.ibb.co/b5VnY7CM/28213937e894.jpg	\N	t	2026-08-15 08:29:26.868	2026-08-15 08:29:26.868
cmsu47gbj001foll57t68m2nf	cmssty1770090kjl5pnp0s698	color=%23f6b8b8	\N	\N	#F6B8B8	\N	XH-B17(8)-3	100	https://i.ibb.co/6JW364kF/16339bc01759.jpg	\N	t	2026-08-15 08:29:27.007	2026-08-15 08:29:27.007
cmsu47gex001holl5fqfveylj	cmssty1770090kjl5pnp0s698	color=%23842424	\N	\N	#842424	\N	XH-B17(8)-4	100	https://i.ibb.co/dJPX5rJC/15c07c6faba2.jpg	\N	t	2026-08-15 08:29:27.129	2026-08-15 08:29:27.129
cmsu47gi9001joll5rf1kt6j1	cmssty1770090kjl5pnp0s698	color=%23dfdcdc	\N	\N	#DFDCDC	\N	XH-B17(8)-5	100	https://i.ibb.co/hJnJ4TzZ/15edfbe32b41.jpg	\N	t	2026-08-15 08:29:27.249	2026-08-15 08:29:27.249
cmsu47glm001loll5zlkrx0jx	cmssty1770090kjl5pnp0s698	color=%23a3e0e1	\N	\N	#A3E0E1	\N	XH-B17(8)-6	100	https://i.ibb.co/9HVrsgGP/6061a6817293.jpg	\N	t	2026-08-15 08:29:27.37	2026-08-15 08:29:27.37
cmsu47goy001noll5wlegcark	cmssty1770090kjl5pnp0s698	color=%23896709	\N	\N	#896709	\N	XH-B17(8)-7	100	https://i.ibb.co/fVb3JRFH/d3b5767e4dde.jpg	\N	t	2026-08-15 08:29:27.49	2026-08-15 08:29:27.49
cmsu47gsa001poll5go1c2nne	cmssty1770090kjl5pnp0s698	color=%23622486	\N	\N	#622486	\N	XH-B17(8)-8	100	https://i.ibb.co/tMVSGqKz/911a51e55e0a.jpg	\N	t	2026-08-15 08:29:27.61	2026-08-15 08:29:27.61
cmssrsdtx0062kjl5r4bd3yrq	cmssrsdry0060kjl5mhqtt9tg	color=light%20gray	\N	\N	Light gray	\N	XH-B08(3)-3	999	https://i.ibb.co/LdsMssCP/c761da48b127.jpg	\N	t	2026-08-14 09:54:02.302	2026-08-15 08:50:56.713
cmssrx16v006ikjl5rc6oen68	cmssrges5005okjl576m671fd	color=grey	\N	\N	Grey	\N	XH-B07(4)-2	999	https://i.ibb.co/yBqvqqdP/8c4bb2d2543b.jpg	\N	t	2026-08-14 09:57:39.271	2026-08-15 08:52:48.97
cmssrx1b7006kkjl5i0ncewwx	cmssrges5005okjl576m671fd	color=khaki	\N	\N	Khaki	\N	XH-B07(4)-3	999	https://i.ibb.co/whBqFDV9/1a65c0c58717.jpg	\N	t	2026-08-14 09:57:39.427	2026-08-15 08:52:49.04
cmssrx1fi006mkjl5oi770ct4	cmssrges5005okjl576m671fd	color=pink	\N	\N	Pink	\N	XH-B07(4)-4	999	https://i.ibb.co/8LdnKDFk/e679bfe5af8d.jpg	\N	t	2026-08-14 09:57:39.583	2026-08-15 08:52:49.111
cmt1b7iwr0001agl5a75klanc	cmt1b7iu70000agl58hd3r9h4	default	\N	\N	\N	\N	\N	1000	\N	\N	t	2026-08-20 09:19:50.815	2026-08-20 09:35:35.898
cmsofnqy800cdagl5g7c9s5p6	cmsofnqwj00ccagl5dcqregd9	color=black	\N	\N	Black	\N	XH-S02	100	https://i.ibb.co/LDVTvqxM/2d3f04d13c99.jpg	\N	t	2026-08-11 09:03:25.939	2026-09-04 04:18:01.048
cmsoftelk00d5agl598l6qwl8	cmsoftek200d4agl5jnznn882	color=black	\N	\N	Black	\N	XH-S01	0	https://i.ibb.co/7NThRqPh/9806a2769286.jpg	\N	t	2026-08-11 09:07:49.874	2026-08-13 08:25:33.602
cmsogwt8800hpagl59bxdmmq6	cmsogwt6m00hoagl5lnwfynhh	default	\N	\N	\N	\N	XH-C10	100	\N	\N	t	2026-08-11 09:38:28.414	2026-08-12 08:13:42.012
cmsogrtsy00gmagl56rgvpwkc	cmsogrtr600glagl5qv6xfqrp	default	\N	\N	\N	\N	XH-C09	100	\N	\N	t	2026-08-11 09:34:35.874	2026-08-12 08:16:13.198
cmsogk57e00fpagl5a8l4iri6	cmsogk55r00foagl5q5glcqoy	default	\N	\N	\N	\N	XH-C08	100	\N	\N	t	2026-08-11 09:28:37.407	2026-08-12 08:21:41.83
cmsofztpa00deagl5x0eh3s2s	cmsofztni00ddagl5j1wo9h5x	color=black	\N	\N	black	\N	XH-C06(2)-1	100	https://i.ibb.co/sdgLNbD3/25ee8168cbc7.jpg	\N	f	2026-08-11 09:12:49.374	2026-08-12 08:26:07.146
cmsofgc0y00blagl5hrj9gyaf	cmsofgbzd00bkagl5xnah2eno	default	\N	\N	\N	\N	XH-C17	999	https://i.ibb.co/0pmDs2Nr/171613a93231.jpg	\N	t	2026-08-11 08:57:40.009	2026-08-12 07:08:54.239
cmsog05ve00duagl5dx16kmzq	cmsog05sv00dtagl56fzqqbsg	default	\N	\N	\N	\N	XH-C19	999	https://i.ibb.co/qLrRt8mX/9245f40c7c22.jpg	\N	t	2026-08-11 09:13:05.119	2026-08-12 08:52:56.744
cmsog75rf00e7agl57knhtnx8	cmsog75pm00e6agl586ijcjyr	default	\N	\N	\N	\N	XH-C20	999	https://i.ibb.co/tPDd9bJS/4541993d6d19.jpg	\N	t	2026-08-11 09:18:31.595	2026-08-12 08:56:38.253
cmsoi2tp800mcagl5ar2dxfk2	cmsoi2tnm00mbagl5t9oaaxj2	color=black	\N	\N	Black	\N	XH-B01(3)-1	999	https://i.ibb.co/ynJbJKcw/c1b6b4d246f1.jpg	\N	t	2026-08-11 10:11:08.578	2026-08-13 08:38:22.125
cmsoffmbz00b5agl5usdbsh5q	cmsoffma900b4agl52y9tui4y	default	\N	\N	\N	\N	XH-C05	100	\N	\N	t	2026-08-11 08:57:06.705	2026-08-12 08:28:19.826
cmsof85xx00aeagl5m1cfn6hu	cmsof85wb00adagl5n9tvx36l	default	\N	\N	\N	\N	XH-C04	100	\N	\N	t	2026-08-11 08:51:18.875	2026-08-12 08:31:34.78
cmsss0abx0078kjl5ljr1udw6	cmsss0aae0077kjl52qq7n6tz	color=%23fe5aaf	\N	\N	#FE5AAF	\N	XH-B15(5)-1	1000	https://i.ibb.co/8LLwsV4N/00d465622187.jpg	\N	t	2026-08-14 10:00:11.03	2026-08-14 10:07:54.383
cmsssa7xj007jkjl5l95ibvtz	cmsss0aae0077kjl52qq7n6tz	color=%23aa0bf3	\N	\N	#AA0BF3	\N	XH-B15(5)-3	998	https://i.ibb.co/QjxvBVjZ/5e3eb61e8c21.jpg	\N	t	2026-08-14 10:07:54.535	2026-08-14 10:07:54.535
cmssrsdtx0061kjl5wktviz8u	cmssrsdry0060kjl5mhqtt9tg	color=charcoal%20gray	\N	\N	Charcoal gray	\N	XH-B08(3)-2	999	https://i.ibb.co/LX0ZqVD9/c1ca03aa0bc6.jpg	\N	t	2026-08-14 09:54:02.302	2026-08-15 08:50:56.643
cmsof41s600a4agl5ae9xsrha	cmsof41qn00a3agl50g9g1u37	color=green	\N	\N	green	\N	XH-C16(3)-1	999	https://i.ibb.co/QBWh7kh/968583fe8d34.jpg	\N	t	2026-08-11 08:48:06.863	2026-08-12 07:04:01.824
cmsogyszp00htagl57vnqbb1m	cmsogysxp00hsagl5bxhz8oe0	color=rabbit%20style	\N	\N	Rabbit Style	\N	XH-C49(2)-1	1000	https://i.ibb.co/M56tpL2S/c29a8de2ce21.png	\N	t	2026-08-11 09:40:01.405	2026-08-12 08:05:46.18
cmsogf0y500eiagl5yzlqderk	cmsogf0wi00ehagl5c8ip2jhh	color=1-color	\N	\N	1-Color	#1	XH-C48(2)-1	1000	https://i.ibb.co/1GxmtNxx/126d6990f354.png	\N	t	2026-08-11 09:24:38.61	2026-08-12 08:12:08.032
cmsogyszq00huagl576tkr5t1	cmsogysxp00hsagl5bxhz8oe0	color=bird%20style	\N	\N	Bird Style	\N	XH-C49(2)-2	1000	https://i.ibb.co/M56tpL2S/c29a8de2ce21.png	\N	f	2026-08-11 09:40:01.405	2026-08-12 08:05:46.255
cmsoh840o00j1agl52itjgjme	cmsoh83z100j0agl5o90cs0oj	default	\N	\N	\N	\N	XH-C51	1000	https://i.ibb.co/Sjqb35P/e768a031d935.png	\N	t	2026-08-11 09:47:15.613	2026-08-12 08:01:27.089
cmsoh39ey00ifagl5mj2b8kin	cmsoh39dg00ieagl5qprj3v16	default	\N	\N	\N	\N	XH-C50	1000	https://i.ibb.co/6js5FCn/0c364716b702.jpg	\N	t	2026-08-11 09:43:29.332	2026-08-12 08:01:42.775
cmsohctfi00k9agl5b5pug4ok	cmsohctdv00k8agl5w501bhdv	default	\N	\N	\N	\N	XH-C13	100	\N	\N	t	2026-08-11 09:50:55.171	2026-08-12 08:07:33.433
cmsohsgox00llagl55jfrj66k	cmsohsgn900lkagl55jpcpsjj	color=white%20peach	\N	\N	White Peach	\N	XH-C52(6)-1	1000	https://i.ibb.co/tMW8Qc2N/6f3839f3f38d.jpg	\N	t	2026-08-11 10:03:05.158	2026-08-12 08:01:11.662
cmsohsgox00loagl5q3838zlp	cmsohsgn900lkagl55jpcpsjj	color=lychee	\N	\N	Lychee	\N	XH-C52(6)-4	1000	https://i.ibb.co/9Hb7tywV/bab572fd95a4.jpg	\N	t	2026-08-11 10:03:05.158	2026-08-12 08:01:11.743
cmsohsgox00lpagl5121xiw9r	cmsohsgn900lkagl55jpcpsjj	color=mint	\N	\N	Mint	\N	XH-C52(6)-5	1000	https://i.ibb.co/V0ygjvMH/21ffd70ad4d9.jpg	\N	t	2026-08-11 10:03:05.158	2026-08-12 08:01:11.823
cmsoh3ogt00ipagl5ohd28s4c	cmsoh3oex00ioagl5pupua3xq	default	\N	\N	\N	\N	XH-C11	100	\N	\N	t	2026-08-11 09:43:48.825	2026-08-12 08:11:04.743
cmsogf0y500ejagl5zswh4ox5	cmsogf0wi00ehagl5c8ip2jhh	color=5-color	\N	\N	5-Color	#5	XH-C48(2)-2	1000	https://i.ibb.co/MyrZmmfr/f1fbd2f5ed02.png	\N	t	2026-08-11 09:24:38.61	2026-08-12 08:12:08.104
cmsofmuii00bzagl5vd06xzpq	cmsofmugw00byagl5hvqnyrco	color=black	\N	\N	Black	\N	XH-C47(2)-1	1000	https://i.ibb.co/Jw18fh9b/a2e651afabad.png	\N	t	2026-08-11 09:02:43.904	2026-08-12 08:16:53.366
cmsofmuii00c0agl52f57ylb8	cmsofmugw00byagl5hvqnyrco	color=brown	\N	\N	Brown	\N	XH-C47(2)-2	1000	https://i.ibb.co/Jw18fh9b/a2e651afabad.png	\N	t	2026-08-11 09:02:43.904	2026-08-12 08:16:53.449
cmsofztpa00dfagl5g2shaju9	cmsofztni00ddagl5j1wo9h5x	color=brown	\N	\N	brown	\N	XH-C06(2)-2	100	https://i.ibb.co/r2DfqZd3/f58b46f62355.jpg	\N	t	2026-08-11 09:12:49.374	2026-08-12 08:26:07.22
cmsof4dk600a8agl534nx8hsf	cmsof4dic00a6agl5u2gzv1f1	color=ivory	\N	\N	Ivory	\N	XH-C30(2)-2	1000	https://i.ibb.co/TxmVyXkv/f16de4b6574b.png	\N	t	2026-08-11 08:48:22.116	2026-08-12 08:34:22.972
cmsof4dk600a7agl5vsa7jc74	cmsof4dic00a6agl5u2gzv1f1	color=natural	\N	\N	Natural	\N	XH-C30(2)-1	1000	https://i.ibb.co/TxmVyXkv/f16de4b6574b.png	\N	t	2026-08-11 08:48:22.116	2026-08-12 08:34:23.041
cmsoehmkq0088agl58rdgwet9	cmsoehmj20087agl5jk2ykc8c	default	\N	\N	\N	\N	XH-C27	1000	https://i.ibb.co/n86RZr0y/3e68100daf09.jpg	\N	t	2026-08-11 08:30:40.718	2026-08-12 08:57:58.602
cmsogi6ua00fdagl5ou9kpwsd	cmsogi6sf00fcagl5q2szgip8	default	\N	\N	\N	\N	XH-C21	999	https://i.ibb.co/spZn8d3k/2adeae84b532.png	\N	t	2026-08-11 09:27:06.207	2026-08-12 08:59:19.77
cmsogtmek00h1agl5laz1fad4	cmsogtmcw00gxagl591zcexte	color=pink	\N	\N	pink	\N	XH-C22(4)-4	999	https://i.ibb.co/m5dWGyTg/73fa3a10a5b3.jpg	\N	f	2026-08-11 09:35:59.6	2026-08-12 09:02:07.145
cmsogtmek00gzagl5059jva51	cmsogtmcw00gxagl591zcexte	color=white	\N	\N	white	\N	XH-C22(4)-2	999	https://i.ibb.co/23RqrTyh/fd8c487a52c3.jpg	\N	t	2026-08-11 09:35:59.6	2026-08-12 09:02:07.235
cmsogtmek00gyagl5k03ev9cu	cmsogtmcw00gxagl591zcexte	color=red	\N	\N	red	\N	XH-C22(4)-1	999	https://i.ibb.co/PG9bDfY6/696cc08d8d6e.jpg	\N	t	2026-08-11 09:35:59.6	2026-08-12 09:02:07.326
cmsogtmek00h0agl5y9arymc6	cmsogtmcw00gxagl591zcexte	color=green	\N	\N	green	\N	XH-C22(4)-3	999	https://i.ibb.co/4gPCLMVr/381f0db6870f.jpg	\N	t	2026-08-11 09:35:59.6	2026-08-12 09:02:07.415
cmsoh19md00i5agl5gwlhdkxd	cmsoh19kk00i4agl5ku3dkyb8	default	\N	\N	\N	\N	XH-C23	999	https://i.ibb.co/TBVSfCK7/1df9180a722b.jpg	\N	t	2026-08-11 09:41:56.276	2026-08-12 09:04:46.253
cmsoh922300jlagl58kmppq4k	cmsoh920800jkagl5nfbbjdol	color=pink	\N	\N	pink	\N	XH-C24(3)-1	999	https://i.ibb.co/1GK3RsYL/c044a329f1e2.png	\N	t	2026-08-11 09:47:59.72	2026-08-12 09:07:50.159
cmsoh922300jnagl5zfyrkaee	cmsoh920800jkagl5nfbbjdol	color=green	\N	\N	green	\N	XH-C24(3)-3	999	https://i.ibb.co/G4hrbShh/dc4adbc3dc88.jpg	\N	t	2026-08-11 09:47:59.72	2026-08-12 09:07:50.228
cmsoh922300jmagl5tr613bbu	cmsoh920800jkagl5nfbbjdol	color=purple	\N	\N	purple	\N	XH-C24(3)-2	999	https://i.ibb.co/jP334fgR/08ed2e101aea.jpg	\N	t	2026-08-11 09:47:59.72	2026-08-12 09:07:50.297
cmsohj7r700kmagl5uc47pi1x	cmsohj7pj00klagl5lc3rm20j	default	\N	\N	\N	\N	XH-C25	999	https://i.ibb.co/V02Dpt89/b61e4f970464.png	\N	t	2026-08-11 09:55:53.671	2026-08-12 09:10:55.308
cmsohnmar00l9agl5x9i8ghv7	cmsohnm8t00l8agl5zgtygsm3	default	\N	\N	\N	\N	XH-C26	999	https://i.ibb.co/XrqmD0Fb/3d16c326414b.jpg	\N	t	2026-08-11 09:59:19.133	2026-08-12 09:14:20.333
cmseud4a1001ze5l5j2uofkam	cmseud47n001ye5l5qahrywu0	color=white	\N	\N	White	N607-White	XH-E03(3)-2	100	https://i.ibb.co/bfdxNFS/8bc4199d8a58.jpg	\N	t	2026-08-04 15:57:22.451	2026-08-13 08:00:53.075
cmsoj1h1e00pgagl5lkpsnfcs	cmsoj1gza00pcagl5q865fvqt	color=purple	\N	\N	Purple	\N	XH-B04(9)-5	999	https://i.ibb.co/HTwbyMCL/27c9aeba04a4.jpg	\N	t	2026-08-11 10:38:05.11	2026-08-13 08:49:21.617
cmseud4a10021e5l5lbkiw3h7	cmseud47n001ye5l5qahrywu0	color=black	\N	\N	Black	N607-Black	XH-E03(3)-1	100	https://i.ibb.co/C3vwrhjr/15e1e54d5c3c.jpg	\N	t	2026-08-04 15:57:22.451	2026-08-13 08:00:53.218
cmsoi2tp800meagl5dq8b4x9u	cmsoi2tnm00mbagl5t9oaaxj2	color=grey	\N	\N	Grey	\N	XH-B01(3)-3	999	https://i.ibb.co/5gL1pcXC/305fbbbe5e28.jpg	\N	t	2026-08-11 10:11:08.578	2026-08-13 08:38:22.058
cmsoj1h1e00phagl5py8y4t6p	cmsoj1gza00pcagl5q865fvqt	color=pink	\N	\N	Pink	\N	XH-B04(9)-6	999	https://i.ibb.co/nqvgbgZs/43699eb2e025.jpg	\N	t	2026-08-11 10:38:05.11	2026-08-13 08:49:21.69
cmsok17u000quagl53i3cp7wx	cmsok17rz00qpagl5yx11zg55	color=light%20pink	\N	\N	light pink	2360#light pink	XH-B05(10)-5	99	https://i.ibb.co/3mTR3jP0/285c0a080b3b.png	\N	t	2026-08-11 11:05:52.799	2026-08-13 08:51:57.468
cmsok17u000qzagl5sqe2f33a	cmsok17rz00qpagl5yx11zg55	color=black	\N	\N	Black	2360#Black	XH-B05(10)-10	99	https://i.ibb.co/nsjtHPgD/e7028c5efccd.png	\N	t	2026-08-11 11:05:52.799	2026-08-13 08:51:57.541
cmsok17u000qyagl55zbgdwwk	cmsok17rz00qpagl5yx11zg55	color=blush%20pink	\N	\N	Blush Pink	2360#Blush Pink	XH-B05(10)-9	99	https://i.ibb.co/xKCdkVbK/aa03d0728578.png	\N	t	2026-08-11 11:05:52.799	2026-08-13 08:51:57.615
cmsok17u000qragl5x725wki2	cmsok17rz00qpagl5yx11zg55	color=camel	\N	\N	Camel	2360#Camel	XH-B05(10)-2	99	https://i.ibb.co/VYJ4WhTT/bb43e0320e29.png	\N	t	2026-08-11 11:05:52.799	2026-08-13 08:51:57.688
cmsok17u000qsagl5wq7xm98x	cmsok17rz00qpagl5yx11zg55	color=orange	\N	\N	orange	2360#orange	XH-B05(10)-3	99	https://i.ibb.co/HTWzWy2P/05b9cff8129a.png	\N	t	2026-08-11 11:05:52.799	2026-08-13 08:51:57.761
cmssty18z0091kjl5fquqhb1g	cmssty1770090kjl5pnp0s698	color=black	\N	\N	black	\N	XH-B17(8)-1	100	https://i.ibb.co/PzCVsWRt/d1a71ca969ea.jpg	\N	t	2026-08-14 10:54:25.171	2026-08-15 08:29:26.806
cmsoiioj300o1agl54miy2upp	cmsoiiohf00o0agl5ynkg0zbc	default	\N	\N	\N	\N	XH-C32	1000	https://i.ibb.co/0jwqXwcL/5b168836ab86.jpg	\N	t	2026-08-11 10:23:28.371	2026-08-12 08:30:30.762
cmsoijnb100o4agl5b9sabmgx	cmsoijn9e00o3agl5vwza8r6y	default	\N	\N	\N	\N	XH-C07	100	\N	\N	t	2026-08-11 10:24:13.442	2026-08-12 08:47:26.729
cmsoi2tp800mdagl5qgqvlurt	cmsoi2tnm00mbagl5t9oaaxj2	color=blue	\N	\N	Blue	\N	XH-B01(3)-2	999	https://i.ibb.co/XxYQ67bB/1fa723f5d7d8.jpg	\N	t	2026-08-11 10:11:08.578	2026-08-13 08:38:22.192
cmsoj1h1e00pfagl5gtt0xh2m	cmsoj1gza00pcagl5q865fvqt	color=yellow	\N	\N	Yellow	\N	XH-B04(9)-4	999	https://i.ibb.co/r2vPtX0D/a54a83d0e63e.jpg	\N	t	2026-08-11 10:38:05.11	2026-08-13 08:49:21.764
cmsoj3j3200poagl5k0d5us2r	cmsoj3j1500pnagl5wqrdje4j	default	\N	\N	\N	\N	XH-C12	100	\N	\N	t	2026-08-11 10:39:41.081	2026-08-12 08:06:44.051
cmsoj4f6900pwagl5evcxdb59	cmsoj4f4d00pvagl5yshv0vy8	default	\N	\N	\N	\N	XH-C33	1000	https://i.ibb.co/sd1mpW84/6c76e0f598c8.jpg	\N	t	2026-08-11 10:40:22.669	2026-08-12 08:27:21.67
cmsoi809h00ngagl5qi7e7tir	cmsoi807r00nfagl585dzaq3v	default	\N	\N	\N	\N	XH-C15	999	https://i.ibb.co/Kp6zScrw/2053af14c44b.jpg	\N	f	2026-08-11 10:15:10.359	2026-08-12 09:17:30.16
cmsok17u000qqagl5ogb90b8u	cmsok17rz00qpagl5yx11zg55	color=wine%20red	\N	\N	wine red	2360#wine red	XH-B05(10)-1	99	https://i.ibb.co/jjd0VR2/94f8c834099c.jpg	\N	t	2026-08-11 11:05:52.799	2026-08-13 08:51:57.395
cmsoim5hg00ofagl5ezbsbasb	cmsoim5f100oeagl5y41l1bqw	color=pink	\N	\N	Pink	\N	XH-B01(4)-1	999	https://i.ibb.co/zTDL3hpj/207847f69534.jpg	\N	t	2026-08-11 10:26:10.285	2026-08-13 08:43:19.556
cmsoim5hg00ohagl55lli7ur8	cmsoim5f100oeagl5y41l1bqw	color=black	\N	\N	Black	\N	XH-B01(4)-3	999	https://i.ibb.co/3yDyznXd/323d055ef586.jpg	\N	t	2026-08-11 10:26:10.285	2026-08-13 08:43:19.638
cmsoim5hg00oiagl5h0iou2zf	cmsoim5f100oeagl5y41l1bqw	color=khaki	\N	\N	khaki	\N	XH-B01(4)-4	999	https://i.ibb.co/RkjT5VzW/abe39b4bcc5f.jpg	\N	t	2026-08-11 10:26:10.285	2026-08-13 08:43:19.72
cmsoim5hg00ogagl5isng15i5	cmsoim5f100oeagl5y41l1bqw	color=white	\N	\N	white	\N	XH-B01(4)-2	999	https://i.ibb.co/4gsmwn0T/7b307a5f0863.jpg	\N	t	2026-08-11 10:26:10.285	2026-08-13 08:43:19.802
cmsoj1h1e00pdagl5wp4gcs4v	cmsoj1gza00pcagl5q865fvqt	color=black	\N	\N	Black	\N	XH-B04(9)-1	999	https://i.ibb.co/V0sQYjPm/cc8fbfd8f5f0.jpg	\N	t	2026-08-11 10:38:05.11	2026-08-13 08:49:21.469
cmsoj1h1e00peagl5jho8f3hp	cmsoj1gza00pcagl5q865fvqt	color=dark%20gray	\N	\N	dark gray	\N	XH-B04(9)-3	999	https://i.ibb.co/fzBr9YzM/e8e613765961.jpg	\N	t	2026-08-11 10:38:05.11	2026-08-13 08:49:21.542
cmsok17u000qtagl5oyhb21v9	cmsok17rz00qpagl5yx11zg55	color=space%20gray	\N	\N	Space Gray	2360#Space Gray	XH-B05(10)-4	99	https://i.ibb.co/pvPyBmwP/6d41dec9d622.png	\N	t	2026-08-11 11:05:52.799	2026-08-13 08:51:57.835
cmsok17u000qxagl5fvueh4ex	cmsok17rz00qpagl5yx11zg55	color=brown	\N	\N	Brown	2360#Brown	XH-B05(10)-8	99	https://i.ibb.co/0RPJpbTJ/0f2b91dab78c.png	\N	t	2026-08-11 11:05:52.799	2026-08-13 08:51:57.915
cmsok17u000qwagl5bwpr6hpg	cmsok17rz00qpagl5yx11zg55	color=red	\N	\N	Red	2360#Red	XH-B05(10)-7	99	https://i.ibb.co/KcKZXz5V/df6c82d699ae.png	\N	t	2026-08-11 11:05:52.799	2026-08-13 08:51:57.989
cmsokc88e00rjagl5a04i7ac5	cmsokc86e00rhagl523q7h9fc	color=white	\N	\N	White	\N	XH-B03(6)-2	99	https://i.ibb.co/rRPXVMP1/9f7ac11d9a68.jpg	\N	t	2026-08-11 11:14:26.534	2026-08-13 08:53:19.12
cmsokc88e00rlagl5dbb06t73	cmsokc86e00rhagl523q7h9fc	color=black	\N	\N	Black	\N	XH-B03(6)-4	0	https://i.ibb.co/FbMSLSQ5/1887dd540bc6.jpg	\N	t	2026-08-11 11:14:26.534	2026-08-13 08:53:19.194
cmsokc88e00rmagl58guzhnf6	cmsokc86e00rhagl523q7h9fc	color=brown	\N	\N	Brown	\N	XH-B03(6)-5	99	https://i.ibb.co/p6H0mYjk/cf68085a835f.jpg	\N	t	2026-08-11 11:14:26.534	2026-08-13 08:53:19.267
cmsokc88e00riagl5alu07hu8	cmsokc86e00rhagl523q7h9fc	color=elephant%20gray	\N	\N	elephant gray	\N	XH-B03(6)-1	99	https://i.ibb.co/jv8yZmFL/397daae63842.jpg	\N	t	2026-08-11 11:14:26.534	2026-08-13 08:53:19.416
cmsokc88e00rkagl5hrt14by8	cmsokc86e00rhagl523q7h9fc	color=havana%20color	\N	\N	Havana color	\N	XH-B03(6)-3	99	https://i.ibb.co/LDtXhzR9/c834989a84d8.jpg	\N	t	2026-08-11 11:14:26.534	2026-08-13 08:53:19.491
cmsss8zrw007akjl5tzi4o581	cmsss8zpn0079kjl5b7eajgfk	default	\N	\N	\N	\N	\N	100	https://i.ibb.co/ynMc5pqJ/bd7defb2b0dd.webp	\N	t	2026-08-14 10:06:57.227	2026-08-14 10:08:49.639
cmsokc88e00rnagl5hsyzi3jv	cmsokc86e00rhagl523q7h9fc	color=angolared	\N	\N	Angolared	\N	XH-B03(6)-6	99	https://i.ibb.co/Bp9jV3X/c057f3395456.jpg	\N	t	2026-08-11 11:14:26.534	2026-08-13 08:53:19.341
cmsokzffe00s3agl5od8rin4r	cmsokzfdd00ryagl5ru2p65ve	color=brown	\N	\N	Brown	\N	XH-B06(5)-5	99	https://i.ibb.co/cKph9Grn/8cadfa4209d0.jpg	\N	t	2026-08-11 11:32:28.945	2026-08-13 08:56:06.684
cmsokzffe00s2agl5gxvf6ffj	cmsokzfdd00ryagl5ru2p65ve	color=burgundy	\N	\N	Burgundy	\N	XH-B06(5)-4	99	https://i.ibb.co/CpKt53ZW/67101d4cf6b5.jpg	\N	t	2026-08-11 11:32:28.945	2026-08-13 08:56:06.748
cmsokzffe00s1agl5xk2uxy4d	cmsokzfdd00ryagl5ru2p65ve	color=beige	\N	\N	Beige	\N	XH-B06(5)-3	99	https://i.ibb.co/CpJV57b1/3a4c5c744c2b.jpg	\N	t	2026-08-11 11:32:28.945	2026-08-13 08:56:06.814
cmsokzffe00s0agl55wvjw61h	cmsokzfdd00ryagl5ru2p65ve	color=orange	\N	\N	Orange	\N	XH-B06(5)-2	99	https://i.ibb.co/B5PJkP1L/e991436fffa8.jpg	\N	t	2026-08-11 11:32:28.945	2026-08-13 08:56:06.878
cmsokzffe00rzagl5tbjdc99r	cmsokzfdd00ryagl5ru2p65ve	color=black	\N	\N	Black	\N	XH-B06(5)-1	99	https://i.ibb.co/5XZTSqyN/669c98e88cd8.jpg	\N	t	2026-08-11 11:32:28.945	2026-08-13 08:56:06.941
cmsohsgox00lnagl5qg3j4qfi	cmsohsgn900lkagl55jpcpsjj	color=peach	\N	\N	Peach	\N	XH-C52(6)-3	1000	https://i.ibb.co/xtVhBj5w/da0aa6a222c9.png	\N	t	2026-08-11 10:03:05.158	2026-08-12 08:01:11.903
cmsohsgox00lmagl5u294vsem	cmsohsgn900lkagl55jpcpsjj	color=lime	\N	\N	Lime	\N	XH-C52(6)-2	1000	https://i.ibb.co/hJPWYZMK/5bece8e84956.png	\N	t	2026-08-11 10:03:05.158	2026-08-12 08:01:11.989
cmsohsgox00lqagl5j6mm6vym	cmsohsgn900lkagl55jpcpsjj	color=grape	\N	\N	Grape	\N	XH-C52(6)-6	1000	https://i.ibb.co/35qXkyK7/8b6f5a190b7a.jpg	\N	t	2026-08-11 10:03:05.158	2026-08-12 08:01:12.069
cmsetqdah000we5l5iln7b6nv	cmsetqd7x000re5l5hq59opwb	color=pink|size=mini	\N	MIni	Pink	X688-Pink	XH-E05(5)-5	100	https://i.ibb.co/dwczxQd8/6e5240e5ea6c.jpg	\N	t	2026-08-04 15:39:41.037	2026-08-13 09:00:58.551
cmsetqdag000se5l5p21d8df4	cmsetqd7x000re5l5hq59opwb	color=white|size=mini	\N	Mini	White	X688-White	XH-E05(5)-2	100	https://i.ibb.co/PZQpwTNr/e8cc836556b7.jpg	\N	t	2026-08-04 15:39:41.037	2026-08-13 09:00:58.746
cmsssa81t007lkjl5a7aevl82	cmsss0aae0077kjl52qq7n6tz	color=%23ec0717	\N	\N	#EC0717	\N	XH-B15(5)-4	1000	https://i.ibb.co/S7Xf64KV/6772c3f132ed.jpg	\N	t	2026-08-14 10:07:54.689	2026-08-14 10:07:54.689
cmsssa861007nkjl5iuxuani4	cmsss0aae0077kjl52qq7n6tz	color=%23ada8a8	\N	\N	#ADA8A8	Flower	XH-B15(5)-5	1000	https://i.ibb.co/995sYDs5/2661a433f6f4.jpg	\N	t	2026-08-14 10:07:54.841	2026-08-14 10:07:54.841
cmsst1va0008ukjl58kiq9awm	cmsst1v85008tkjl5t4nfcd0c	color=%230e0e0e	\N	\N	#0E0E0E	Black/Light Gray	XH-B13(8)-1	0	https://i.ibb.co/B2P6qngQ/9f5479fd64d7.jpg	\N	t	2026-08-14 10:29:24.437	2026-08-14 10:29:24.437
cmssscc0d0085kjl5m1e8s3k9	cmssscbxy0084kjl5pnyxtdil	color=black	\N	\N	black	\N	XH-B09(2)-1	999	https://i.ibb.co/ffXmFTL/f19bee4cb1aa.jpg	\N	t	2026-08-14 10:09:33.046	2026-08-15 08:22:01.018
cmssscc0d0086kjl5seims6b2	cmssscbxy0084kjl5pnyxtdil	color=apricot	\N	\N	Apricot	\N	XH-B09(2)-2	999	https://i.ibb.co/p6Ygr2Hg/7522c76317dd.jpg	\N	t	2026-08-14 10:09:33.046	2026-08-15 08:22:01.09
cmsetqdah000ue5l5suc6n40a	cmsetqd7x000re5l5hq59opwb	color=black|size=mini	\N	Mini	Black	X688-Black	XH-E05(5)-1	99	https://i.ibb.co/qLJbKHMz/090feed2902c.jpg	\N	t	2026-08-04 15:39:41.037	2026-08-22 13:26:30.102
\.


--
-- TOC entry 3903 (class 0 OID 24985)
-- Dependencies: 233
-- Data for Name: PromoCode; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."PromoCode" (id, code, description, "discountType", value, "minOrder", "maxDiscount", "startsAt", "endsAt", "usageLimit", "usedCount", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3904 (class 0 OID 25004)
-- Dependencies: 234
-- Data for Name: PromoCodeUsage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."PromoCodeUsage" (id, "promoCodeId", "userId", "orderId", "usedAt") FROM stdin;
\.


--
-- TOC entry 3918 (class 0 OID 49208)
-- Dependencies: 248
-- Data for Name: RateLimitBucket; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."RateLimitBucket" ("keyDigest", count, "resetAt", "createdAt", "updatedAt") FROM stdin;
a97aae1487609377429477503593b9eb4791b287fb11e5f29186b1cc67ccc831	1	2026-08-23 03:42:55.1	2026-08-23 03:37:55.1	2026-08-23 03:37:55.1
287f511c329f20efd0e5856d4b53b0fd874d12ffe89a88c895738ab2200ae88f	3	2026-08-23 03:38:56.989	2026-08-23 03:37:56.989	2026-08-23 03:38:12.168
03a7f711ca73442a07afee5048546179a276f8d705a34a9efdecbb8623520788	1	2026-08-22 13:31:31.481	2026-08-22 13:26:31.481	2026-08-22 13:26:31.481
77867a3d37055bd3e0540c342c86ad14a8d9b8e80183e971ca35ba3b2247db89	1	2026-08-05 05:49:15.021	2026-08-05 05:45:19.117	2026-08-05 05:48:15.021
9723ff575f47d58471f8e7d6ef01444078cd0b361235bc6939537f2423e43a99	1	2026-08-23 03:43:35.959	2026-08-23 03:38:35.959	2026-08-23 03:38:35.959
01547947dd45578370f407a037e91d4e1753f73c3a2a2b90acc3e86b21b58bfb	1	2026-08-04 18:23:23.434	2026-08-04 18:18:23.434	2026-08-04 18:18:23.434
c682a7282d2b8b8d6e26f050d1095678e820baad36afe32579a73912ee674940	1	2026-08-23 04:12:29.608	2026-08-23 04:07:29.608	2026-08-23 04:07:29.608
bc76dceff53787ecde542c0d51b075cdee58eddd93951c0b9c0413f14b5b7364	2	2026-08-05 05:51:27.791	2026-08-05 05:50:27.791	2026-08-05 05:50:27.794
71158010709ba81a4a44768a0f161e97cbb1748b528e603d28d5005622bc5d7a	2	2026-08-04 18:24:58.86	2026-08-04 18:19:58.86	2026-08-04 18:20:18.992
381afa7e1ee2575815c6aae93ff224a0aee6dd2814192fa2062dd1d2185b81af	1	2026-08-23 04:08:31.315	2026-08-23 04:07:31.315	2026-08-23 04:07:31.315
9144f274dba939bd59a9d27770e747531a3732b570489398f70040e1a5b6e841	3	2026-08-04 18:21:06.25	2026-08-04 18:20:06.25	2026-08-04 18:20:51.796
6e1ebef1b37daa21f3dc934dd2de88652c5c1a2319e0173104928a66e2afa1b0	1	2026-08-05 07:20:21.95	2026-08-05 07:15:21.95	2026-08-05 07:15:21.95
59d83d1ad3df4e873ae7554a8f00a38e81dd39491304221c78e48f8ca97229be	1	2026-08-04 18:26:55.892	2026-08-04 18:21:55.892	2026-08-04 18:21:55.892
24a6467afc4af4f12e81dd8a05a39369e4abc121feaf976c7c144c7005d02bed	2	2026-08-04 18:23:02.942	2026-08-04 18:22:02.942	2026-08-04 18:22:02.947
dd2615a9a705c040d4497287358c28cec3e1090ce0565b07e0a50e41ec47b55a	3	2026-08-04 18:24:56.803	2026-08-04 18:19:56.803	2026-08-04 18:22:13.967
7522dde113b723d7d772f0a79839fc8cb34a335adcc2c4425af0d223a8bd9bb5	4	2026-08-04 18:24:58.804	2026-08-04 18:19:58.804	2026-08-04 18:22:16.061
e43f78406a9b29d83c194345646cdb0bd0efb6d315d7e6e15cbe8a8217ce6152	1	2026-08-04 18:27:16.116	2026-08-04 18:22:16.116	2026-08-04 18:22:16.116
98ca6f6eccce9241b630878afd00e94f749af189943b86c4bb88fe557e500a43	2	2026-08-04 18:23:17.472	2026-08-04 18:22:17.472	2026-08-04 18:22:17.477
1b25bdee44c922d4d1e67f80b975e509928c80906c07d27818e58ab164b3c6ba	1	2026-08-23 04:38:19.814	2026-08-23 04:33:19.814	2026-08-23 04:33:19.814
943affe206b07f2094094af4dd97158b48cfdeca18cfd61038c56a338bb4f159	1	2026-08-23 04:34:41.841	2026-08-23 04:33:41.841	2026-08-23 04:33:41.841
fef6a74a4023e18a426506e6fa359c99ae4892b04c708dba53538c98f8eea39d	1	2026-08-22 15:43:28.531	2026-08-04 18:19:58.804	2026-08-22 15:38:28.531
575b0a8b2199795e005388cc7d33f1a2afb585f976b733a8a7ae2544c1e3b706	1	2026-08-05 16:47:24.321	2026-08-05 16:45:24.173	2026-08-05 16:46:24.321
e2554a3622cb02c24bf794363165a92d5a75d2ec5080be061eaef222403d2c8a	1	2026-08-05 07:21:23.031	2026-08-05 07:16:23.031	2026-08-05 07:16:23.031
f38bad43aabb504b20282807791315e2cb6a4f12e9634941f21327057b92d038	2	2026-08-05 05:42:44.055	2026-08-05 05:37:44.055	2026-08-05 05:37:59.15
8b98f3b7bc79ffaf575a453398641845b1f7bd04c52a7e964872817bbfaca6d1	3	2026-08-05 05:38:49.9	2026-08-05 05:37:49.9	2026-08-05 05:38:25.773
f3f562f5b2da27ec73d53b3f2312649432766e71ba9eec7cfe9528a8f065c8e8	2	2026-08-23 05:00:17.456	2026-08-22 20:34:47.351	2026-08-23 04:58:08.753
1d40fe3887ea71f9556d1d15a29d6b61d3595cc91fcb194866890cac5b9f7788	1	2026-08-23 04:43:02.601	2026-08-23 04:38:02.601	2026-08-23 04:38:02.601
50fb9f4c99f39f7210e4e191382858c130e0e8e778e2fd258625d041182948a5	1	2026-08-23 04:40:51.988	2026-08-23 03:38:37.656	2026-08-23 04:39:51.988
2dc40ecf76971acf084eb4a5b751d97845af033ad0d4f03ff39d5435cc2c4b2d	1	2026-08-05 08:10:31.466	2026-08-05 08:05:31.466	2026-08-05 08:05:31.466
59fc782f3b77ddbe0bb20af83cadcc859b9784dc774607960a42c847d7d15eb6	2	2026-08-05 05:44:15.749	2026-08-05 05:39:15.749	2026-08-05 05:39:22.559
6d611ad253092c9f66cc0d9d663ef74e85f58bffdc07f783ccd7711a13fa4012	3	2026-08-05 05:44:43.729	2026-08-05 05:39:17.362	2026-08-05 05:44:26.871
a0d2763c0decbcaacbdb4e5991db86e1dee67b19e82997556d768d3e67e55e93	3	2026-08-23 10:12:40.053	2026-08-05 05:37:42.332	2026-08-23 10:12:27.969
13662f1b9a84ca88a95b4e4711ce09b2c549feae93afeae1a2a897d556d96215	2	2026-08-05 08:06:37.3	2026-08-05 08:05:37.3	2026-08-05 08:05:43.081
9f66a4bef9366d7d84b2d71ae9895bbe58a818601e2fbfe78e04b2a713c50442	1	2026-08-05 16:35:06.555	2026-08-05 08:16:11.967	2026-08-05 16:34:06.555
74ce42b563611deaf41ed67da9ef342d4912e3e245cb79771591314568166ac9	1	2026-08-05 08:11:42.776	2026-08-05 08:06:42.776	2026-08-05 08:06:42.776
db0d5040bf60e56014f903c8d080c7c2c2a9d290cbe800437402378f5931528c	2	2026-08-05 08:07:48.427	2026-08-05 08:06:48.427	2026-08-05 08:06:58.624
369da6d00a42f66a6a2ba0dc84ddae48d33f7eb3a360117d59f54cd91369f849	1	2026-08-05 08:18:55.303	2026-08-05 07:15:21.727	2026-08-05 08:13:55.303
ceaf7faf6858a3de3f04c6a4965b2deb071eb82d46d279df5db2958522dcbc97	1	2026-08-05 08:18:55.534	2026-08-05 08:13:55.534	2026-08-05 08:13:55.534
2f31c7835951f037baa7f580aac0079084e7fa1eed0eb52b8c5ecb30a92be75e	1	2026-08-05 16:39:36.352	2026-08-05 16:34:36.352	2026-08-05 16:34:36.352
72ec7580afa14baacd5bd690cd357841896329711273e7b34d92007404188d28	1	2026-08-05 16:59:11.974	2026-08-05 16:54:11.974	2026-08-05 16:54:11.974
5bfcb9f66169b1541fa708befe90980a960f7169008049373cf57ec62e2574cc	1	2026-08-05 16:59:12.2	2026-08-05 16:54:12.2	2026-08-05 16:54:12.2
861f61aab89753bca0557adaff009e64fdf0d3b33d173874e6f3f70a936862d6	1	2026-08-22 13:32:12.983	2026-08-22 13:27:12.983	2026-08-22 13:27:12.983
1b4d785aaa42cb71d2736ade493e83e1de1baf4c00d44806abd55b10d04d04c2	16	2026-08-05 16:40:54.592	2026-08-05 16:35:02.583	2026-08-05 16:40:54.338
e813c877d1b5de138482e85d33cdbca53628a93db652a9b3d9113d46cfc257fe	1	2026-08-05 16:50:00.165	2026-08-05 16:45:00.165	2026-08-05 16:45:00.165
d783f79d729a9070aa22d9d85c94d8ea98e92f0520caa2495d6429a883eded13	2	2026-08-22 13:34:42.04	2026-08-22 13:33:42.04	2026-08-22 13:33:42.043
f84b4882919e1427c2f320efa6ea57bc8cd0c142f84f93c4785de7a92ceb93e0	1	2026-08-22 15:26:52.31	2026-08-22 15:21:52.31	2026-08-22 15:21:52.31
c383a60519499774eb405baefe170f724bdf89f7dbd63729332beb0b8bcd5149	1	2026-08-22 15:22:54.154	2026-08-22 15:21:54.154	2026-08-22 15:21:54.154
f5dea4d9a10129e66205fddfb4fad6a5d370bfaf65bc7122ab08cb85a72d7671	9	2026-08-05 16:57:37.325	2026-08-05 16:54:32.619	2026-08-05 16:57:09.325
30a3fb0a5f01532616ee29f8760e47e455a552f98f527f19aec12bc77467b5cb	1	2026-08-05 17:23:29.745	2026-08-05 16:34:36.118	2026-08-05 17:18:29.745
f36e0c70bf79a4709ec9878c495b55d9f52428d7824de52acf1afb995ef0be60	1	2026-08-05 17:23:29.971	2026-08-05 17:18:29.971	2026-08-05 17:18:29.971
98b8dd1f061f929750e4c6abf2d1129efeb83620f2feddbd6629f1362c0edefd	1	2026-08-05 17:20:05.724	2026-08-05 17:19:05.724	2026-08-05 17:19:05.724
cdf73d8a5baa73c319337c4b9b0be031db95ebf78ca25cfcc7467b25da020f76	1	2026-08-22 15:43:28.588	2026-08-22 15:38:28.588	2026-08-22 15:38:28.588
17975bde5d72bc5a676c844077d3d30f549d92f00290de78a5900d5e01465a21	1	2026-08-22 15:27:09.279	2026-08-22 15:22:09.279	2026-08-22 15:22:09.279
c63ef139dcd1128163a2c075ea8e32b60efea9c0f3f336dc71a7b18ba44a50a1	1	2026-08-22 15:39:33.515	2026-08-22 15:38:33.515	2026-08-22 15:38:33.515
36f0a796a0d45f21d72a2c8e6c96806ed56e3221d8c003fadcc5958e637a8f71	2	2026-08-22 15:31:37.124	2026-08-22 15:22:10.24	2026-08-22 15:30:37.13
fb7ef76f722fe85b6d0d356858df5a62ccd5b965c331d04dd1395f61cf0f4651	1	2026-08-22 20:39:47.429	2026-08-22 20:34:47.429	2026-08-22 20:34:47.429
4232104ffbdce9ef8490a7b2d4da185e50654ae43e8d40a4db9e21e13b831399	1	2026-08-22 20:47:49.607	2026-08-22 20:34:49.556	2026-08-22 20:46:49.607
d17f9d56d6f6ac8e91565e4b51b9c9dab09dd41e12d5549e17a394dd28850bea	1	2026-08-22 20:52:22.28	2026-08-22 20:47:22.28	2026-08-22 20:47:22.28
494922f637717bf0de8aa87a03db0d20255a96f6888f1f99dd947482a87e63f6	1	2026-08-22 20:48:24.474	2026-08-22 20:47:24.474	2026-08-22 20:47:24.474
c13a87264801c94a7e14dcef03d23bbf52fa07884a53bd668e52f15c4a00ad01	1	2026-08-22 21:11:40.91	2026-08-22 21:06:40.91	2026-08-22 21:06:40.91
8065f8e373afca5c95c1b6d452a1469b769bc1cbf7a323e3767e1f26d09317f1	1	2026-08-22 21:07:42.713	2026-08-22 21:06:42.713	2026-08-22 21:06:42.713
796ff6c0fa105a37fd6b8211d239092dce3992f3abb64ed40fe8614d6e341a36	1	2026-08-23 05:00:17.553	2026-08-23 04:55:17.553	2026-08-23 04:55:17.553
8eeb2f6cddf1333d4ac679d8ace06387c6cacf13d1752b8b88b0f882882d0115	1	2026-08-23 05:03:08.819	2026-08-23 04:58:08.819	2026-08-23 04:58:08.819
881cc514e3a8974db08d87032a89b83c7af51114649772f91d71110708b8d927	1	2026-08-23 05:43:19.543	2026-08-23 05:38:19.543	2026-08-23 05:38:19.543
ffa5352bf23e330bc490584b3dfe57cda2b80812bd079310ce6a1b8a6c3fa9ab	1	2026-08-23 05:43:19.625	2026-08-23 05:38:19.625	2026-08-23 05:38:19.625
393cbbca1ea4210d7d199c407c681878331eda00dbfd0a4d6e4cf8a235e66bd7	1	2026-08-23 10:00:18.84	2026-08-23 09:49:16.38	2026-08-23 09:55:18.84
eecba5424af77966baf12038f5991762d37cc9537a978e716df8d76b7b0b9bcc	1	2026-08-23 10:12:43.476	2026-08-23 10:07:43.476	2026-08-23 10:07:43.476
918ae8a9454e715b5ab182b2be3ccd1c107cc56f2701845a2d4ea95f49a9fa61	2	2026-08-23 10:08:31.936	2026-08-23 10:07:31.936	2026-08-23 10:08:19.713
dd6f124f29f0eb369b25a41224b56e66c48f8930a214b8902ce8a6a7ee30aab9	1	2026-08-23 10:13:37.308	2026-08-23 09:55:23.132	2026-08-23 10:08:37.308
61e0567d6cf31531fc22e9822cbb97b372cc8a98b1b095d56f6d07c139a29877	1	2026-08-23 10:13:37.308	2026-08-23 09:55:23.132	2026-08-23 10:08:37.308
3fb94e58769dc33bf45f045e8961ca61afe50ef27e9c0a660b87b0ca470cc8c9	1	2026-08-23 10:13:37.726	2026-08-23 09:55:23.205	2026-08-23 10:08:37.726
c2bbc63113228ca3af94a7868a2ce15bfdd9e0d613b0aab43fb4196de79f489a	1	2026-08-23 10:16:03.67	2026-08-23 10:11:03.67	2026-08-23 10:11:03.67
b9673cd8c8191c875a35e319f746dbb638912ee7819d54984abef7c5b803ed86	3	2026-08-23 10:12:43.395	2026-08-05 05:37:43.999	2026-08-23 10:12:30.045
8a0059743ac408763f1c218f408273b4825864e3f2365709dc3e3f671ad0d7ca	3	2026-08-23 10:12:43.395	2026-08-23 10:07:43.395	2026-08-23 10:12:30.045
28cd0df09ec45fee1688c9f2ef618524eecb1a486c4a41668e6581621cce312d	1	2026-08-23 10:17:30.118	2026-08-23 10:12:30.118	2026-08-23 10:12:30.118
\.


--
-- TOC entry 3901 (class 0 OID 24948)
-- Dependencies: 231
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Review" (id, "productId", "userId", "authorName", rating, title, comment, source, verified, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3905 (class 0 OID 25016)
-- Dependencies: 235
-- Data for Name: StoreSettings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."StoreSettings" (id, "taxRate", "standardShippingFee", "freeShippingThreshold", "expressShippingFee", currency, "createdAt", "updatedAt") FROM stdin;
cmsezdzgb0000rgc2lsxiphig	0.0500	80.00	50000.00	11150.00	BDT	2026-08-04 18:18:01.019	2026-08-19 13:32:11.307
\.


--
-- TOC entry 3902 (class 0 OID 24966)
-- Dependencies: 232
-- Data for Name: Testimonial; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Testimonial" (id, name, location, image, rating, text, "position", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3889 (class 0 OID 24745)
-- Dependencies: 219
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, email, password, phone, city, image, role, provider, "termsAcceptedAt", "createdAt", "updatedAt") FROM stdin;
cmskkma0a000eagl57h0zkil8	Sherry Nelson	nsherry646@gmail.com	\N	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocLlbx7MOBtYJOmLLDfXfqfgWqsk-JHNhUs53bmuYvaCQAQFjw=s96-c	ADMIN	GOOGLE	\N	2026-08-08 16:11:10.762	2026-08-08 16:11:10.762
cmt0bhdl500044xl5f1t0gfbp	Cheng Ning	ningcheng0627@gmail.com	\N	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocIKb6aUuwAM3zc185X1Bj86IpYxxDXnQkroDzdyQQ1540980A=s96-c	USER	GOOGLE	\N	2026-08-19 16:39:44.393	2026-08-19 16:39:44.393
cms93amlu0004e5l5s487j9q3	Rian Hasan Siam	rianhasan1971@gmail.com	\N	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocJNrIeQQB6aLr-i2i_J1TWdp6P5-N0OwIXz9ahynhV7sKPrjd2jPA=s96-c	ADMIN	GOOGLE	\N	2026-07-31 15:20:45.811	2026-08-22 15:45:43.677
cms93c9og0005e5l5dv4nm07r	Admin	admin@gmail.com	$2b$12$AoNxPlXUU2TLDW5skXQaheowz6cZ6Wmr6K1Q.iJPncKv377hfC4ru	01932600504	Dhaka	\N	ADMIN	CREDENTIAL	2026-07-31 15:22:02.367	2026-07-31 15:22:02.368	2026-07-31 15:22:02.368
cmt5marv8000jqzl5o0n07e2h	李靖	34392932@qq.com	$2b$12$K//tnD.9p3Xj6yLeaENmSuWHZRBDPf1.nXCdGuG2Dx95HkOe/rKnC	18688708371	东莞	\N	ADMIN	CREDENTIAL	2026-08-23 09:41:22.964	2026-08-23 09:41:22.964	2026-08-23 09:41:22.964
cmsezfc930001rgc2vuix7s1s	Rian Hasan Siam	riannhasan@gmail.com	\N	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocIYk_-XuMFzIei-dcINBbUvQMwBsXbPh8bk1x1H-qjt1BCMXQ=s96-c	USER	GOOGLE	\N	2026-08-04 18:19:04.263	2026-08-24 18:43:52.525
\.


--
-- TOC entry 3897 (class 0 OID 24878)
-- Dependencies: 227
-- Data for Name: Wishlist; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Wishlist" (id, "userId", "productId", "createdAt") FROM stdin;
cmt7oa7iy0008sgc2hklrt42d	cmsezfc930001rgc2vuix7s1s	cmseupxoj002re5l5ll7imhj2	2026-08-24 20:12:28.186
cmth9c680000072l5d8jfo2ue	cms93amlu0004e5l5s487j9q3	cmsevlqvf005je5l5ixjvc5kh	2026-08-31 13:11:47.328
cmth9c680000172l5eb432iml	cms93amlu0004e5l5s487j9q3	cmsevs81m0060e5l5x2jq7v6r	2026-08-31 13:11:47.328
\.


--
-- TOC entry 3916 (class 0 OID 32768)
-- Dependencies: 246
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
168dc351-34fd-4069-a894-ff3ea69f3d90	5ee8841e0da1561428b6ab14f8ded8bb799b94af18be526ff3101bfba44c6361	2026-07-20 19:05:36.101173+00	20260721000000_baseline		\N	2026-07-20 19:05:36.101173+00	0
eb75f74e-b1b8-40d9-84b7-81311efb38e8	cb3d31c0901aeb03234bdffe439419578467e317e8c4d1c74e5a7ddabc1be4ea	2026-08-19 12:31:11.459736+00	20260819000000_exchange_rate_cache	\N	\N	2026-08-19 12:31:11.055368+00	1
97190c1c-6e81-4b1e-a012-8e24eb4fa959	ac06d60277fe6380784302cdd42030771db6a03b1f2b725a18547226a4276998	2026-07-20 19:06:18.75701+00	20260721001000_catalog_schema_corrections	\N	\N	2026-07-20 19:06:18.437339+00	1
eeb4e334-55ef-4509-bc9b-4a0591150153	c7e2ae11bacac93b2f0395559b973eb2fab3f1f5ec32b2872e0a6be06ee03b73	2026-07-26 19:03:50.305852+00	20260722000000_catalog_seo_redirects	\N	\N	2026-07-26 19:03:49.509296+00	1
b16eb6a7-28d3-4a1d-afcc-e9339d3405a1	c7daf2079e7593503810d1299fcf68469f7f0a08c154aae9c400fffe6c366080	2026-07-26 19:03:51.353795+00	20260726000000_sslcommerz_payment_foundation	\N	\N	2026-07-26 19:03:50.408041+00	1
dea2bfc8-82af-493a-8886-e5296d6f46b2	8004e9454f681c365f945c7f44161e7b943b91121ce56e6eebcd209a628fb940	2026-08-19 12:31:12.129714+00	20260819001000_order_currency_snapshots	\N	\N	2026-08-19 12:31:11.561455+00	1
a59f50b4-0b20-44bb-b5db-fea5d69cb700	a8dd78872467bf2893ff96e3c554b404bef941172b389d47df475021f319b2d2	2026-08-04 17:23:04.416818+00	20260804000000_airwallex_payment_foundation	\N	\N	2026-08-04 17:23:02.890463+00	1
1dd88bfe-ca2e-4a2c-b27d-0a640b556064	76ea52daa491e7d0d1ae34f57806ea11024eabceea4b1a39e228c71735890447	2026-08-19 12:40:25.584498+00	20260819002000_order_currency_rollout_compatibility	\N	\N	2026-08-19 12:40:25.157776+00	1
03f6d096-ed02-4122-889c-072622fe66f4	fc6ebf6becf253c8224589ce0c3eea46ca9087a8f590babdb85eefff4de84268	2026-07-30 12:48:24.406611+00	20260727000000_payment_transaction_history_indexes	\N	\N	2026-07-30 12:48:24.078712+00	1
a511d5f5-ab3e-4e57-96a5-c43c9b0447ac	ccc81d5936bcc5b960720ce577455d7b7d873af4c22f13883ef1e43dde767012	\N	20260808000000_product_description_blocks	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260808000000_product_description_blocks\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "descriptionBlocks" of relation "Product" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"descriptionBlocks\\" of relation \\"Product\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7686), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260808000000_product_description_blocks"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260808000000_product_description_blocks"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:255	2026-08-07 17:42:10.932171+00	2026-08-07 17:38:47.946392+00	0
37df3323-6068-4e2c-a817-5bd318836adc	ccc81d5936bcc5b960720ce577455d7b7d873af4c22f13883ef1e43dde767012	2026-08-07 17:42:11.080564+00	20260808000000_product_description_blocks		\N	2026-08-07 17:42:11.080564+00	0
798d6f33-aa82-4965-826d-2cb1a548159d	356e4feb0b53e6c54934c7c72c9219006234f0e8902fab1cda302c1e224bf670	2026-08-22 13:25:26.182198+00	20260822000000_airwallex_payment_quotes	\N	\N	2026-08-22 13:25:25.52252+00	1
\.


--
-- TOC entry 3645 (class 2606 OID 25071)
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- TOC entry 3687 (class 2606 OID 25180)
-- Name: AdminActivityLog AdminActivityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AdminActivityLog"
    ADD CONSTRAINT "AdminActivityLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 3681 (class 2606 OID 25168)
-- Name: AdminCapitalCostActivity AdminCapitalCostActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AdminCapitalCostActivity"
    ADD CONSTRAINT "AdminCapitalCostActivity_pkey" PRIMARY KEY (id);


--
-- TOC entry 3669 (class 2606 OID 25130)
-- Name: AdminCapital AdminCapital_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AdminCapital"
    ADD CONSTRAINT "AdminCapital_pkey" PRIMARY KEY (id);


--
-- TOC entry 3676 (class 2606 OID 25156)
-- Name: AdminOtherCost AdminOtherCost_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AdminOtherCost"
    ADD CONSTRAINT "AdminOtherCost_pkey" PRIMARY KEY (id);


--
-- TOC entry 3672 (class 2606 OID 25142)
-- Name: AdminProductCost AdminProductCost_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AdminProductCost"
    ADD CONSTRAINT "AdminProductCost_pkey" PRIMARY KEY (id);


--
-- TOC entry 3704 (class 2606 OID 106552)
-- Name: AirwallexWebhookEvent AirwallexWebhookEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AirwallexWebhookEvent"
    ADD CONSTRAINT "AirwallexWebhookEvent_pkey" PRIMARY KEY (id);


--
-- TOC entry 3666 (class 2606 OID 25118)
-- Name: Banner Banner_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_pkey" PRIMARY KEY (id);


--
-- TOC entry 3570 (class 2606 OID 24796)
-- Name: Brand Brand_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Brand"
    ADD CONSTRAINT "Brand_pkey" PRIMARY KEY (id);


--
-- TOC entry 3598 (class 2606 OID 24877)
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 3693 (class 2606 OID 49185)
-- Name: CatalogRedirect CatalogRedirect_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CatalogRedirect"
    ADD CONSTRAINT "CatalogRedirect_pkey" PRIMARY KEY (id);


--
-- TOC entry 3566 (class 2606 OID 24781)
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- TOC entry 3642 (class 2606 OID 25053)
-- Name: ContactMessage ContactMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ContactMessage"
    ADD CONSTRAINT "ContactMessage_pkey" PRIMARY KEY (id);


--
-- TOC entry 3712 (class 2606 OID 409614)
-- Name: ExchangeRate ExchangeRate_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ExchangeRate"
    ADD CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY (id);


--
-- TOC entry 3661 (class 2606 OID 25102)
-- Name: InventoryLog InventoryLog_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InventoryLog"
    ADD CONSTRAINT "InventoryLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 3575 (class 2606 OID 24811)
-- Name: Manufacturer Manufacturer_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Manufacturer"
    ADD CONSTRAINT "Manufacturer_pkey" PRIMARY KEY (id);


--
-- TOC entry 3619 (class 2606 OID 24947)
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 3615 (class 2606 OID 24932)
-- Name: OrderStatusHistory OrderStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY (id);


--
-- TOC entry 3609 (class 2606 OID 24920)
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- TOC entry 3707 (class 2606 OID 106568)
-- Name: PaymentTransactionEvent PaymentTransactionEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PaymentTransactionEvent"
    ADD CONSTRAINT "PaymentTransactionEvent_pkey" PRIMARY KEY (id);


--
-- TOC entry 3650 (class 2606 OID 25089)
-- Name: PaymentTransaction PaymentTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PaymentTransaction"
    ADD CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY (id);


--
-- TOC entry 3595 (class 2606 OID 24862)
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- TOC entry 3590 (class 2606 OID 24848)
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- TOC entry 3583 (class 2606 OID 24830)
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- TOC entry 3636 (class 2606 OID 25015)
-- Name: PromoCodeUsage PromoCodeUsage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PromoCodeUsage"
    ADD CONSTRAINT "PromoCodeUsage_pkey" PRIMARY KEY (id);


--
-- TOC entry 3632 (class 2606 OID 25003)
-- Name: PromoCode PromoCode_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PromoCode"
    ADD CONSTRAINT "PromoCode_pkey" PRIMARY KEY (id);


--
-- TOC entry 3696 (class 2606 OID 49220)
-- Name: RateLimitBucket RateLimitBucket_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."RateLimitBucket"
    ADD CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("keyDigest");


--
-- TOC entry 3623 (class 2606 OID 24965)
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- TOC entry 3640 (class 2606 OID 25036)
-- Name: StoreSettings StoreSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."StoreSettings"
    ADD CONSTRAINT "StoreSettings_pkey" PRIMARY KEY (id);


--
-- TOC entry 3628 (class 2606 OID 24984)
-- Name: Testimonial Testimonial_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Testimonial"
    ADD CONSTRAINT "Testimonial_pkey" PRIMARY KEY (id);


--
-- TOC entry 3560 (class 2606 OID 24761)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3602 (class 2606 OID 24889)
-- Name: Wishlist Wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_pkey" PRIMARY KEY (id);


--
-- TOC entry 3689 (class 2606 OID 32781)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3646 (class 1259 OID 25230)
-- Name: Address_userId_isDefault_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Address_userId_isDefault_idx" ON public."Address" USING btree ("userId", "isDefault");


--
-- TOC entry 3683 (class 1259 OID 25248)
-- Name: AdminActivityLog_actorId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AdminActivityLog_actorId_createdAt_idx" ON public."AdminActivityLog" USING btree ("actorId", "createdAt");


--
-- TOC entry 3684 (class 1259 OID 25246)
-- Name: AdminActivityLog_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AdminActivityLog_createdAt_idx" ON public."AdminActivityLog" USING btree ("createdAt");


--
-- TOC entry 3685 (class 1259 OID 25247)
-- Name: AdminActivityLog_kind_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AdminActivityLog_kind_createdAt_idx" ON public."AdminActivityLog" USING btree (kind, "createdAt");


--
-- TOC entry 3678 (class 1259 OID 25245)
-- Name: AdminCapitalCostActivity_actorId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AdminCapitalCostActivity_actorId_createdAt_idx" ON public."AdminCapitalCostActivity" USING btree ("actorId", "createdAt");


--
-- TOC entry 3679 (class 1259 OID 25243)
-- Name: AdminCapitalCostActivity_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AdminCapitalCostActivity_createdAt_idx" ON public."AdminCapitalCostActivity" USING btree ("createdAt");


--
-- TOC entry 3682 (class 1259 OID 25244)
-- Name: AdminCapitalCostActivity_type_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AdminCapitalCostActivity_type_createdAt_idx" ON public."AdminCapitalCostActivity" USING btree (type, "createdAt");


--
-- TOC entry 3674 (class 1259 OID 25241)
-- Name: AdminOtherCost_costDate_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AdminOtherCost_costDate_idx" ON public."AdminOtherCost" USING btree ("costDate");


--
-- TOC entry 3677 (class 1259 OID 25242)
-- Name: AdminOtherCost_reason_costDate_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AdminOtherCost_reason_costDate_idx" ON public."AdminOtherCost" USING btree (reason, "costDate");


--
-- TOC entry 3670 (class 1259 OID 25239)
-- Name: AdminProductCost_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AdminProductCost_createdAt_idx" ON public."AdminProductCost" USING btree ("createdAt");


--
-- TOC entry 3673 (class 1259 OID 25240)
-- Name: AdminProductCost_productId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "AdminProductCost_productId_key" ON public."AdminProductCost" USING btree ("productId");


--
-- TOC entry 3698 (class 1259 OID 106573)
-- Name: AirwallexEvent_attempt_received_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AirwallexEvent_attempt_received_idx" ON public."AirwallexWebhookEvent" USING btree ("paymentTransactionId", "receivedAt");


--
-- TOC entry 3699 (class 1259 OID 106570)
-- Name: AirwallexEvent_claimable_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AirwallexEvent_claimable_idx" ON public."AirwallexWebhookEvent" USING btree ("processingStatus", "nextAttemptAt", "receivedAt");


--
-- TOC entry 3700 (class 1259 OID 106572)
-- Name: AirwallexEvent_intent_received_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AirwallexEvent_intent_received_idx" ON public."AirwallexWebhookEvent" USING btree ("paymentIntentId", "receivedAt");


--
-- TOC entry 3701 (class 1259 OID 106571)
-- Name: AirwallexEvent_stale_claim_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "AirwallexEvent_stale_claim_idx" ON public."AirwallexWebhookEvent" USING btree ("processingStatus", "lockedAt");


--
-- TOC entry 3702 (class 1259 OID 106569)
-- Name: AirwallexWebhookEvent_eventId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "AirwallexWebhookEvent_eventId_key" ON public."AirwallexWebhookEvent" USING btree ("eventId");


--
-- TOC entry 3664 (class 1259 OID 25238)
-- Name: Banner_categoryId_status_position_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Banner_categoryId_status_position_idx" ON public."Banner" USING btree ("categoryId", status, "position");


--
-- TOC entry 3667 (class 1259 OID 25237)
-- Name: Banner_type_status_position_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Banner_type_status_position_idx" ON public."Banner" USING btree (type, status, "position");


--
-- TOC entry 3568 (class 1259 OID 25187)
-- Name: Brand_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Brand_name_key" ON public."Brand" USING btree (name);


--
-- TOC entry 3571 (class 1259 OID 25188)
-- Name: Brand_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Brand_slug_key" ON public."Brand" USING btree (slug);


--
-- TOC entry 3572 (class 1259 OID 25189)
-- Name: Brand_status_name_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Brand_status_name_idx" ON public."Brand" USING btree (status, name);


--
-- TOC entry 3599 (class 1259 OID 25206)
-- Name: CartItem_userId_variantId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "CartItem_userId_variantId_key" ON public."CartItem" USING btree ("userId", "variantId");


--
-- TOC entry 3600 (class 1259 OID 25205)
-- Name: CartItem_variantId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CartItem_variantId_idx" ON public."CartItem" USING btree ("variantId");


--
-- TOC entry 3690 (class 1259 OID 49187)
-- Name: CatalogRedirect_destinationPath_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CatalogRedirect_destinationPath_idx" ON public."CatalogRedirect" USING btree ("destinationPath");


--
-- TOC entry 3691 (class 1259 OID 49188)
-- Name: CatalogRedirect_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CatalogRedirect_entityType_entityId_idx" ON public."CatalogRedirect" USING btree ("entityType", "entityId");


--
-- TOC entry 3694 (class 1259 OID 49186)
-- Name: CatalogRedirect_sourcePath_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "CatalogRedirect_sourcePath_key" ON public."CatalogRedirect" USING btree ("sourcePath");


--
-- TOC entry 3562 (class 1259 OID 25186)
-- Name: Category_parentId_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Category_parentId_slug_key" ON public."Category" USING btree ("parentId", slug);


--
-- TOC entry 3563 (class 1259 OID 25184)
-- Name: Category_parentId_status_position_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Category_parentId_status_position_idx" ON public."Category" USING btree ("parentId", status, "position");


--
-- TOC entry 3564 (class 1259 OID 25183)
-- Name: Category_path_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Category_path_key" ON public."Category" USING btree (path);


--
-- TOC entry 3567 (class 1259 OID 25185)
-- Name: Category_status_depth_position_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Category_status_depth_position_idx" ON public."Category" USING btree (status, depth, "position");


--
-- TOC entry 3643 (class 1259 OID 25229)
-- Name: ContactMessage_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ContactMessage_status_createdAt_idx" ON public."ContactMessage" USING btree (status, "createdAt");


--
-- TOC entry 3709 (class 1259 OID 409615)
-- Name: ExchangeRate_baseCurrency_currency_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ExchangeRate_baseCurrency_currency_key" ON public."ExchangeRate" USING btree ("baseCurrency", currency);


--
-- TOC entry 3710 (class 1259 OID 409616)
-- Name: ExchangeRate_baseCurrency_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ExchangeRate_baseCurrency_idx" ON public."ExchangeRate" USING btree ("baseCurrency");


--
-- TOC entry 3662 (class 1259 OID 25236)
-- Name: InventoryLog_type_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "InventoryLog_type_createdAt_idx" ON public."InventoryLog" USING btree (type, "createdAt");


--
-- TOC entry 3663 (class 1259 OID 25235)
-- Name: InventoryLog_variantId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "InventoryLog_variantId_createdAt_idx" ON public."InventoryLog" USING btree ("variantId", "createdAt");


--
-- TOC entry 3573 (class 1259 OID 25190)
-- Name: Manufacturer_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Manufacturer_name_key" ON public."Manufacturer" USING btree (name);


--
-- TOC entry 3576 (class 1259 OID 25191)
-- Name: Manufacturer_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Manufacturer_slug_key" ON public."Manufacturer" USING btree (slug);


--
-- TOC entry 3577 (class 1259 OID 25192)
-- Name: Manufacturer_status_name_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Manufacturer_status_name_idx" ON public."Manufacturer" USING btree (status, name);


--
-- TOC entry 3617 (class 1259 OID 25217)
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- TOC entry 3620 (class 1259 OID 25218)
-- Name: OrderItem_productId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "OrderItem_productId_createdAt_idx" ON public."OrderItem" USING btree ("productId", "createdAt");


--
-- TOC entry 3621 (class 1259 OID 25219)
-- Name: OrderItem_variantId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "OrderItem_variantId_idx" ON public."OrderItem" USING btree ("variantId");


--
-- TOC entry 3613 (class 1259 OID 25215)
-- Name: OrderStatusHistory_orderId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON public."OrderStatusHistory" USING btree ("orderId", "createdAt");


--
-- TOC entry 3616 (class 1259 OID 25216)
-- Name: OrderStatusHistory_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "OrderStatusHistory_status_createdAt_idx" ON public."OrderStatusHistory" USING btree (status, "createdAt");


--
-- TOC entry 3605 (class 1259 OID 25209)
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- TOC entry 3606 (class 1259 OID 25214)
-- Name: Order_paymentMethod_paymentStatus_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Order_paymentMethod_paymentStatus_createdAt_idx" ON public."Order" USING btree ("paymentMethod", "paymentStatus", "createdAt");


--
-- TOC entry 3607 (class 1259 OID 25213)
-- Name: Order_paymentStatus_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Order_paymentStatus_createdAt_idx" ON public."Order" USING btree ("paymentStatus", "createdAt");


--
-- TOC entry 3610 (class 1259 OID 25212)
-- Name: Order_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Order_status_createdAt_idx" ON public."Order" USING btree (status, "createdAt");


--
-- TOC entry 3611 (class 1259 OID 25210)
-- Name: Order_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Order_userId_createdAt_idx" ON public."Order" USING btree ("userId", "createdAt");


--
-- TOC entry 3612 (class 1259 OID 25211)
-- Name: Order_userId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Order_userId_status_createdAt_idx" ON public."Order" USING btree ("userId", status, "createdAt");


--
-- TOC entry 3705 (class 1259 OID 106574)
-- Name: PaymentTransactionEvent_attempt_created_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PaymentTransactionEvent_attempt_created_idx" ON public."PaymentTransactionEvent" USING btree ("paymentTransactionId", "createdAt");


--
-- TOC entry 3708 (class 1259 OID 106575)
-- Name: PaymentTransactionEvent_provider_event_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PaymentTransactionEvent_provider_event_idx" ON public."PaymentTransactionEvent" USING btree ("providerEventId");


--
-- TOC entry 3647 (class 1259 OID 57344)
-- Name: PaymentTransaction_createdAt_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PaymentTransaction_createdAt_id_idx" ON public."PaymentTransaction" USING btree ("createdAt", id);


--
-- TOC entry 3648 (class 1259 OID 25231)
-- Name: PaymentTransaction_orderId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PaymentTransaction_orderId_createdAt_idx" ON public."PaymentTransaction" USING btree ("orderId", "createdAt");


--
-- TOC entry 3651 (class 1259 OID 49206)
-- Name: PaymentTransaction_provider_bankTransactionId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PaymentTransaction_provider_bankTransactionId_key" ON public."PaymentTransaction" USING btree (provider, "bankTransactionId");


--
-- TOC entry 3652 (class 1259 OID 49204)
-- Name: PaymentTransaction_provider_gatewaySessionKey_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PaymentTransaction_provider_gatewaySessionKey_key" ON public."PaymentTransaction" USING btree (provider, "gatewaySessionKey");


--
-- TOC entry 3653 (class 1259 OID 49203)
-- Name: PaymentTransaction_provider_idempotencyKey_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PaymentTransaction_provider_idempotencyKey_key" ON public."PaymentTransaction" USING btree (provider, "idempotencyKey");


--
-- TOC entry 3654 (class 1259 OID 49207)
-- Name: PaymentTransaction_provider_requiresReview_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PaymentTransaction_provider_requiresReview_createdAt_idx" ON public."PaymentTransaction" USING btree (provider, "requiresReview", "createdAt");


--
-- TOC entry 3655 (class 1259 OID 25233)
-- Name: PaymentTransaction_provider_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PaymentTransaction_provider_status_createdAt_idx" ON public."PaymentTransaction" USING btree (provider, status, "createdAt");


--
-- TOC entry 3656 (class 1259 OID 106511)
-- Name: PaymentTransaction_provider_status_updatedAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PaymentTransaction_provider_status_updatedAt_idx" ON public."PaymentTransaction" USING btree (provider, status, "updatedAt");


--
-- TOC entry 3657 (class 1259 OID 25234)
-- Name: PaymentTransaction_provider_transactionId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PaymentTransaction_provider_transactionId_key" ON public."PaymentTransaction" USING btree (provider, "transactionId");


--
-- TOC entry 3658 (class 1259 OID 49205)
-- Name: PaymentTransaction_provider_validationId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PaymentTransaction_provider_validationId_key" ON public."PaymentTransaction" USING btree (provider, "validationId");


--
-- TOC entry 3659 (class 1259 OID 25232)
-- Name: PaymentTransaction_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PaymentTransaction_status_createdAt_idx" ON public."PaymentTransaction" USING btree (status, "createdAt");


--
-- TOC entry 3596 (class 1259 OID 25204)
-- Name: ProductImage_productId_position_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductImage_productId_position_idx" ON public."ProductImage" USING btree ("productId", "position");


--
-- TOC entry 3588 (class 1259 OID 25202)
-- Name: ProductVariant_isActive_stock_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductVariant_isActive_stock_idx" ON public."ProductVariant" USING btree ("isActive", stock);


--
-- TOC entry 3591 (class 1259 OID 25201)
-- Name: ProductVariant_productId_isActive_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "ProductVariant_productId_isActive_idx" ON public."ProductVariant" USING btree ("productId", "isActive");


--
-- TOC entry 3592 (class 1259 OID 25203)
-- Name: ProductVariant_productId_variantKey_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ProductVariant_productId_variantKey_key" ON public."ProductVariant" USING btree ("productId", "variantKey");


--
-- TOC entry 3593 (class 1259 OID 25200)
-- Name: ProductVariant_sku_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ProductVariant_sku_key" ON public."ProductVariant" USING btree (sku);


--
-- TOC entry 3578 (class 1259 OID 25196)
-- Name: Product_brandId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Product_brandId_status_createdAt_idx" ON public."Product" USING btree ("brandId", status, "createdAt");


--
-- TOC entry 3579 (class 1259 OID 25195)
-- Name: Product_categoryId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Product_categoryId_status_createdAt_idx" ON public."Product" USING btree ("categoryId", status, "createdAt");


--
-- TOC entry 3580 (class 1259 OID 25199)
-- Name: Product_categoryId_status_salePrice_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Product_categoryId_status_salePrice_idx" ON public."Product" USING btree ("categoryId", status, "salePrice");


--
-- TOC entry 3581 (class 1259 OID 25197)
-- Name: Product_manufacturerId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Product_manufacturerId_status_createdAt_idx" ON public."Product" USING btree ("manufacturerId", status, "createdAt");


--
-- TOC entry 3584 (class 1259 OID 25193)
-- Name: Product_productCode_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Product_productCode_key" ON public."Product" USING btree ("productCode");


--
-- TOC entry 3585 (class 1259 OID 25194)
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- TOC entry 3586 (class 1259 OID 32782)
-- Name: Product_specifications_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Product_specifications_idx" ON public."Product" USING gin (specifications);


--
-- TOC entry 3587 (class 1259 OID 25198)
-- Name: Product_status_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Product_status_createdAt_idx" ON public."Product" USING btree (status, "createdAt");


--
-- TOC entry 3634 (class 1259 OID 25227)
-- Name: PromoCodeUsage_orderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PromoCodeUsage_orderId_idx" ON public."PromoCodeUsage" USING btree ("orderId");


--
-- TOC entry 3637 (class 1259 OID 25228)
-- Name: PromoCodeUsage_promoCodeId_orderId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PromoCodeUsage_promoCodeId_orderId_key" ON public."PromoCodeUsage" USING btree ("promoCodeId", "orderId");


--
-- TOC entry 3638 (class 1259 OID 25226)
-- Name: PromoCodeUsage_userId_usedAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PromoCodeUsage_userId_usedAt_idx" ON public."PromoCodeUsage" USING btree ("userId", "usedAt");


--
-- TOC entry 3630 (class 1259 OID 25224)
-- Name: PromoCode_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PromoCode_code_key" ON public."PromoCode" USING btree (code);


--
-- TOC entry 3633 (class 1259 OID 25225)
-- Name: PromoCode_status_endsAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "PromoCode_status_endsAt_idx" ON public."PromoCode" USING btree (status, "endsAt");


--
-- TOC entry 3697 (class 1259 OID 49221)
-- Name: RateLimitBucket_resetAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "RateLimitBucket_resetAt_idx" ON public."RateLimitBucket" USING btree ("resetAt");


--
-- TOC entry 3624 (class 1259 OID 25220)
-- Name: Review_productId_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Review_productId_createdAt_idx" ON public."Review" USING btree ("productId", "createdAt");


--
-- TOC entry 3625 (class 1259 OID 25221)
-- Name: Review_productId_rating_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Review_productId_rating_idx" ON public."Review" USING btree ("productId", rating);


--
-- TOC entry 3626 (class 1259 OID 25222)
-- Name: Review_userId_productId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Review_userId_productId_key" ON public."Review" USING btree ("userId", "productId");


--
-- TOC entry 3629 (class 1259 OID 25223)
-- Name: Testimonial_status_position_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Testimonial_status_position_createdAt_idx" ON public."Testimonial" USING btree (status, "position", "createdAt");


--
-- TOC entry 3558 (class 1259 OID 25181)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 3561 (class 1259 OID 25182)
-- Name: User_role_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "User_role_createdAt_idx" ON public."User" USING btree (role, "createdAt");


--
-- TOC entry 3603 (class 1259 OID 25207)
-- Name: Wishlist_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Wishlist_productId_idx" ON public."Wishlist" USING btree ("productId");


--
-- TOC entry 3604 (class 1259 OID 25208)
-- Name: Wishlist_userId_productId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Wishlist_userId_productId_key" ON public."Wishlist" USING btree ("userId", "productId");


--
-- TOC entry 3741 (class 2620 OID 409642)
-- Name: OrderItem OrderItem_currency_snapshot_defaults; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER "OrderItem_currency_snapshot_defaults" BEFORE INSERT ON public."OrderItem" FOR EACH ROW EXECUTE FUNCTION public."fillOrderItemCurrencySnapshotDefaults"();


--
-- TOC entry 3740 (class 2620 OID 409640)
-- Name: Order Order_currency_snapshot_defaults; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER "Order_currency_snapshot_defaults" BEFORE INSERT ON public."Order" FOR EACH ROW EXECUTE FUNCTION public."fillOrderCurrencySnapshotDefaults"();


--
-- TOC entry 3733 (class 2606 OID 25349)
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3737 (class 2606 OID 25369)
-- Name: AdminProductCost AdminProductCost_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AdminProductCost"
    ADD CONSTRAINT "AdminProductCost_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3738 (class 2606 OID 106576)
-- Name: AirwallexWebhookEvent AirwallexWebhookEvent_paymentTransactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."AirwallexWebhookEvent"
    ADD CONSTRAINT "AirwallexWebhookEvent_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES public."PaymentTransaction"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3736 (class 2606 OID 25364)
-- Name: Banner Banner_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3719 (class 2606 OID 25279)
-- Name: CartItem CartItem_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3720 (class 2606 OID 25284)
-- Name: CartItem CartItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3713 (class 2606 OID 25249)
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3735 (class 2606 OID 25359)
-- Name: InventoryLog InventoryLog_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."InventoryLog"
    ADD CONSTRAINT "InventoryLog_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3725 (class 2606 OID 25309)
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3726 (class 2606 OID 25314)
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3727 (class 2606 OID 25319)
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3724 (class 2606 OID 25304)
-- Name: OrderStatusHistory OrderStatusHistory_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3723 (class 2606 OID 25299)
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3739 (class 2606 OID 106581)
-- Name: PaymentTransactionEvent PaymentTransactionEvent_paymentTransactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PaymentTransactionEvent"
    ADD CONSTRAINT "PaymentTransactionEvent_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES public."PaymentTransaction"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3734 (class 2606 OID 25354)
-- Name: PaymentTransaction PaymentTransaction_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PaymentTransaction"
    ADD CONSTRAINT "PaymentTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3718 (class 2606 OID 25274)
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3717 (class 2606 OID 25269)
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3714 (class 2606 OID 25259)
-- Name: Product Product_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public."Brand"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3715 (class 2606 OID 25254)
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3716 (class 2606 OID 25264)
-- Name: Product Product_manufacturerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES public."Manufacturer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3730 (class 2606 OID 25344)
-- Name: PromoCodeUsage PromoCodeUsage_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PromoCodeUsage"
    ADD CONSTRAINT "PromoCodeUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3731 (class 2606 OID 25334)
-- Name: PromoCodeUsage PromoCodeUsage_promoCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PromoCodeUsage"
    ADD CONSTRAINT "PromoCodeUsage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES public."PromoCode"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3732 (class 2606 OID 25339)
-- Name: PromoCodeUsage PromoCodeUsage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PromoCodeUsage"
    ADD CONSTRAINT "PromoCodeUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3728 (class 2606 OID 25324)
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3729 (class 2606 OID 25329)
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3721 (class 2606 OID 25294)
-- Name: Wishlist Wishlist_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3722 (class 2606 OID 25289)
-- Name: Wishlist Wishlist_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2251 (class 826 OID 16397)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2250 (class 826 OID 16396)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2026-09-04 11:22:01

--
-- PostgreSQL database dump complete
--

\unrestrict qfn4udZkq8fjDqgMS3Sii1vybQaKATEybkBMKhwehKWl0gaNhJzGJYi6DiFaw5J

