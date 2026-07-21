import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AuthProvider,
  BannerStatus,
  BannerType,
  BrandStatus,
  CapitalCostActivityType,
  CategoryStatus,
  ContactMessageStatus,
  InventoryLogType,
  ManufacturerStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentTransactionStatus,
  Prisma,
  PrismaClient,
  ProductStatus,
  PromoCodeStatus,
  PromoDiscountType,
  ReviewSource,
  Role,
  TestimonialStatus,
} from "../app/generated/prisma/client";
import { hash } from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const databaseConnectionUrl = new URL(databaseUrl);

if (
  ["prefer", "require", "verify-ca"].includes(
    databaseConnectionUrl.searchParams.get("sslmode") ?? "",
  )
) {
  databaseConnectionUrl.searchParams.set("sslmode", "verify-full");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseConnectionUrl.toString() }),
});

const money = (value: string | number): Prisma.Decimal =>
  new Prisma.Decimal(value);

const demoImage = (label: string): string =>
  `https://placehold.co/1200x1200/png?text=${encodeURIComponent(label)}`;

const demoBanner = (label: string): string =>
  `https://placehold.co/1920x720/png?text=${encodeURIComponent(label)}`;

const safeId = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

interface CategorySeed {
  key: string;
  name: string;
  slug: string;
  path: string;
  description: string;
  image: string;
  position: number;
  parentKey?: string;
}

interface OrganizationSeed {
  key: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  website: string;
  country: string;
}

interface VariantSeed {
  variantKey: string;
  name: string;
  sku: string;
  stock: number;
  modelNumber?: string;
  size?: string;
  color?: string;
  image?: string;
  attributes: Prisma.InputJsonValue;
}

interface ProductSeed {
  key: string;
  productCode: string;
  name: string;
  slug: string;
  description: string;
  categoryKey: string;
  brandKey: string;
  manufacturerKey: string;
  modelNumber: string;
  series: string;
  buyingPrice: string;
  salePrice: string;
  discountPrice?: string;
  specifications: Prisma.InputJsonValue;
  images: string[];
  variants: VariantSeed[];
}

const categorySeeds: CategorySeed[] = [
  {
    key: "industrial-automation",
    name: "Industrial Automation",
    slug: "industrial-automation",
    path: "industrial-automation",
    description: "PLCs, sensors, drives, control equipment, and automation components.",
    image: demoImage("Industrial Automation"),
    position: 1,
  },
  {
    key: "plc-controllers",
    name: "PLC & Controllers",
    slug: "plc-controllers",
    path: "industrial-automation/plc-controllers",
    description: "Programmable controllers, expansion modules, and control accessories.",
    image: demoImage("PLC and Controllers"),
    position: 1,
    parentKey: "industrial-automation",
  },
  {
    key: "programmable-logic-controllers",
    name: "Programmable Logic Controllers",
    slug: "programmable-logic-controllers",
    path: "industrial-automation/plc-controllers/programmable-logic-controllers",
    description: "Industrial PLC CPUs and compact automation controllers.",
    image: demoImage("Programmable Logic Controllers"),
    position: 1,
    parentKey: "plc-controllers",
  },
  {
    key: "sensors-instrumentation",
    name: "Sensors & Instrumentation",
    slug: "sensors-instrumentation",
    path: "industrial-automation/sensors-instrumentation",
    description: "Industrial sensors, transmitters, switches, and measuring devices.",
    image: demoImage("Sensors and Instrumentation"),
    position: 2,
    parentKey: "industrial-automation",
  },
  {
    key: "proximity-sensors",
    name: "Proximity Sensors",
    slug: "proximity-sensors",
    path: "industrial-automation/sensors-instrumentation/proximity-sensors",
    description: "Inductive, capacitive, and photoelectric proximity sensors.",
    image: demoImage("Proximity Sensors"),
    position: 1,
    parentKey: "sensors-instrumentation",
  },
  {
    key: "drives-motors",
    name: "Drives & Motors",
    slug: "drives-motors",
    path: "industrial-automation/drives-motors",
    description: "Motor drives, VFDs, servo systems, and motor control products.",
    image: demoImage("Drives and Motors"),
    position: 3,
    parentKey: "industrial-automation",
  },
  {
    key: "variable-frequency-drives",
    name: "Variable Frequency Drives",
    slug: "variable-frequency-drives",
    path: "industrial-automation/drives-motors/variable-frequency-drives",
    description: "Variable frequency drives for speed and torque control.",
    image: demoImage("Variable Frequency Drives"),
    position: 1,
    parentKey: "drives-motors",
  },
  {
    key: "electronics",
    name: "Electronics",
    slug: "electronics",
    path: "electronics",
    description: "Consumer electronics, networking devices, and accessories.",
    image: demoImage("Electronics"),
    position: 2,
  },
  {
    key: "networking",
    name: "Networking",
    slug: "networking",
    path: "electronics/networking",
    description: "Routers, switches, access points, and networking accessories.",
    image: demoImage("Networking"),
    position: 1,
    parentKey: "electronics",
  },
  {
    key: "computers-accessories",
    name: "Computers & Accessories",
    slug: "computers-accessories",
    path: "electronics/computers-accessories",
    description: "Computer accessories, power products, and office electronics.",
    image: demoImage("Computers and Accessories"),
    position: 2,
    parentKey: "electronics",
  },
  {
    key: "daily-essentials",
    name: "Daily Essentials",
    slug: "daily-essentials",
    path: "daily-essentials",
    description: "Useful everyday products for home and office.",
    image: demoImage("Daily Essentials"),
    position: 3,
  },
  {
    key: "home-office",
    name: "Home & Office",
    slug: "home-office",
    path: "daily-essentials/home-office",
    description: "Daily-use home and office products.",
    image: demoImage("Home and Office"),
    position: 1,
    parentKey: "daily-essentials",
  },
  {
    key: "toys",
    name: "Toys",
    slug: "toys",
    path: "toys",
    description: "Learning kits, educational toys, and hobby products.",
    image: demoImage("Toys"),
    position: 4,
  },
  {
    key: "educational-toys",
    name: "Educational Toys",
    slug: "educational-toys",
    path: "toys/educational-toys",
    description: "STEM, robotics, electronics, and educational kits.",
    image: demoImage("Educational Toys"),
    position: 1,
    parentKey: "toys",
  },
];

const organizationSeeds: OrganizationSeed[] = [
  {
    key: "siemens",
    name: "Siemens",
    slug: "siemens",
    description: "Industrial automation, electrification, and digitalization products.",
    logo: demoImage("Siemens"),
    website: "https://www.siemens.com",
    country: "Germany",
  },
  {
    key: "schneider-electric",
    name: "Schneider Electric",
    slug: "schneider-electric",
    description: "Energy management and industrial automation products.",
    logo: demoImage("Schneider Electric"),
    website: "https://www.se.com",
    country: "France",
  },
  {
    key: "omron",
    name: "Omron",
    slug: "omron",
    description: "Industrial control, sensing, safety, and automation technology.",
    logo: demoImage("Omron"),
    website: "https://www.omron.com",
    country: "Japan",
  },
  {
    key: "delta",
    name: "Delta Electronics",
    slug: "delta-electronics",
    description: "Power electronics and industrial automation solutions.",
    logo: demoImage("Delta Electronics"),
    website: "https://www.deltaww.com",
    country: "Taiwan",
  },
  {
    key: "mitsubishi-electric",
    name: "Mitsubishi Electric",
    slug: "mitsubishi-electric",
    description: "Factory automation, control systems, and electrical equipment.",
    logo: demoImage("Mitsubishi Electric"),
    website: "https://www.mitsubishielectric.com",
    country: "Japan",
  },
  {
    key: "tp-link",
    name: "TP-Link",
    slug: "tp-link",
    description: "Networking and smart connectivity products.",
    logo: demoImage("TP-Link"),
    website: "https://www.tp-link.com",
    country: "China",
  },
  {
    key: "baseus",
    name: "Baseus",
    slug: "baseus",
    description: "Consumer electronics and power accessories.",
    logo: demoImage("Baseus"),
    website: "https://www.baseus.com",
    country: "China",
  },
  {
    key: "arduino",
    name: "Arduino",
    slug: "arduino",
    description: "Open-source electronics and educational development hardware.",
    logo: demoImage("Arduino"),
    website: "https://www.arduino.cc",
    country: "Italy",
  },
];

const productSeeds: ProductSeed[] = [
  {
    key: "siemens-s7-1200-cpu-1212c",
    productCode: "PRD-00001",
    name: "Siemens S7-1200 CPU 1212C PLC",
    slug: "siemens-s7-1200-cpu-1212c-plc",
    description:
      "Compact programmable logic controller for machine automation, small production systems, and industrial control panels.",
    categoryKey: "programmable-logic-controllers",
    brandKey: "siemens",
    manufacturerKey: "siemens",
    modelNumber: "6ES7212-1AE40-0XB0",
    series: "SIMATIC S7-1200",
    buyingPrice: "42000",
    salePrice: "52000",
    discountPrice: "49900",
    specifications: {
      controllerType: "Compact PLC",
      digitalInputs: 8,
      digitalOutputs: 6,
      supplyVoltage: "24V DC",
      communication: ["PROFINET", "Ethernet"],
      programmingSoftware: "TIA Portal",
      warranty: "12 months",
    },
    images: [
      demoImage("Siemens S7-1200 Front"),
      demoImage("Siemens S7-1200 Side"),
    ],
    variants: [
      {
        variantKey: "output=dc-dc-dc",
        name: "DC/DC/DC",
        sku: "SIE-S7-1212C-DC",
        stock: 18,
        modelNumber: "6ES7212-1AE40-0XB0",
        attributes: {
          powerSupply: "24V DC",
          inputType: "DC",
          outputType: "DC",
        },
      },
      {
        variantKey: "output=ac-dc-relay",
        name: "AC/DC/Relay",
        sku: "SIE-S7-1212C-RLY",
        stock: 10,
        modelNumber: "6ES7212-1BE40-0XB0",
        attributes: {
          powerSupply: "120/230V AC",
          inputType: "DC",
          outputType: "Relay",
        },
      },
    ],
  },
  {
    key: "schneider-atv320-vfd",
    productCode: "PRD-00002",
    name: "Schneider Altivar ATV320 Variable Frequency Drive",
    slug: "schneider-altivar-atv320-variable-frequency-drive",
    description:
      "Compact variable frequency drive for asynchronous and synchronous motors in industrial machines.",
    categoryKey: "variable-frequency-drives",
    brandKey: "schneider-electric",
    manufacturerKey: "schneider-electric",
    modelNumber: "ATV320U22M2C",
    series: "Altivar Machine ATV320",
    buyingPrice: "28500",
    salePrice: "36000",
    discountPrice: "34500",
    specifications: {
      ratedPower: "2.2 kW",
      controlType: "Sensorless vector control",
      communication: ["Modbus RTU", "CANopen"],
      enclosure: "IP20",
      frequencyRange: "0.1–599 Hz",
      warranty: "12 months",
    },
    images: [
      demoImage("Schneider ATV320 Front"),
      demoImage("Schneider ATV320 Panel"),
    ],
    variants: [
      {
        variantKey: "input=220v-single-phase",
        name: "220V Single Phase",
        sku: "SCH-ATV320-2K2-220",
        stock: 14,
        attributes: {
          inputVoltage: "200–240V",
          phase: "Single phase",
          outputPower: "2.2 kW",
        },
      },
      {
        variantKey: "input=380v-three-phase",
        name: "380V Three Phase",
        sku: "SCH-ATV320-2K2-380",
        stock: 9,
        attributes: {
          inputVoltage: "380–500V",
          phase: "Three phase",
          outputPower: "2.2 kW",
        },
      },
    ],
  },
  {
    key: "omron-e2e-proximity-sensor",
    productCode: "PRD-00003",
    name: "Omron E2E Inductive Proximity Sensor",
    slug: "omron-e2e-inductive-proximity-sensor",
    description:
      "Reliable cylindrical inductive proximity sensor for metal detection in industrial machinery.",
    categoryKey: "proximity-sensors",
    brandKey: "omron",
    manufacturerKey: "omron",
    modelNumber: "E2E-X5ME1",
    series: "E2E",
    buyingPrice: "4200",
    salePrice: "6800",
    discountPrice: "6500",
    specifications: {
      sensingMethod: "Inductive",
      output: "NPN normally open",
      supplyVoltage: "12–24V DC",
      protection: "IP67",
      cableLength: "2 m",
      warranty: "6 months",
    },
    images: [
      demoImage("Omron E2E Sensor"),
      demoImage("Omron Proximity Sensor Cable"),
    ],
    variants: [
      {
        variantKey: "diameter=m12|distance=5mm",
        name: "M12 / 5 mm",
        sku: "OMR-E2E-M12-5",
        stock: 45,
        size: "M12",
        attributes: {
          diameter: "M12",
          sensingDistance: "5 mm",
          mounting: "Flush",
        },
      },
      {
        variantKey: "diameter=m18|distance=10mm",
        name: "M18 / 10 mm",
        sku: "OMR-E2E-M18-10",
        stock: 32,
        size: "M18",
        attributes: {
          diameter: "M18",
          sensingDistance: "10 mm",
          mounting: "Flush",
        },
      },
    ],
  },
  {
    key: "delta-dvp14ss2-plc",
    productCode: "PRD-00004",
    name: "Delta DVP14SS2 Compact PLC",
    slug: "delta-dvp14ss2-compact-plc",
    description:
      "Slim and economical PLC for basic sequential control and compact machines.",
    categoryKey: "programmable-logic-controllers",
    brandKey: "delta",
    manufacturerKey: "delta",
    modelNumber: "DVP14SS211R",
    series: "DVP-SS2",
    buyingPrice: "11800",
    salePrice: "15500",
    discountPrice: "14900",
    specifications: {
      digitalInputs: 8,
      digitalOutputs: 6,
      outputType: "Relay",
      supplyVoltage: "24V DC",
      communication: "RS-485",
      programmingSoftware: "ISPSoft",
    },
    images: [demoImage("Delta DVP14SS2 PLC")],
    variants: [
      {
        variantKey: "default",
        name: "Standard",
        sku: "DEL-DVP14SS2-R",
        stock: 25,
        modelNumber: "DVP14SS211R",
        attributes: {
          outputType: "Relay",
          ioPoints: 14,
        },
      },
    ],
  },
  {
    key: "mitsubishi-fx5u-plc",
    productCode: "PRD-00005",
    name: "Mitsubishi MELSEC iQ-F FX5U PLC",
    slug: "mitsubishi-melsec-iq-f-fx5u-plc",
    description:
      "High-performance compact PLC with integrated Ethernet and advanced motion-control capability.",
    categoryKey: "programmable-logic-controllers",
    brandKey: "mitsubishi-electric",
    manufacturerKey: "mitsubishi-electric",
    modelNumber: "FX5U-32MR/ES",
    series: "MELSEC iQ-F",
    buyingPrice: "36500",
    salePrice: "45500",
    discountPrice: "43900",
    specifications: {
      ioPoints: 32,
      outputType: "Relay",
      ethernet: true,
      rs485: true,
      maxProgramCapacity: "64K steps",
      programmingSoftware: "GX Works3",
    },
    images: [demoImage("Mitsubishi FX5U PLC")],
    variants: [
      {
        variantKey: "io=32|output=relay",
        name: "32 I/O Relay",
        sku: "MIT-FX5U-32MR",
        stock: 11,
        modelNumber: "FX5U-32MR/ES",
        attributes: {
          ioPoints: 32,
          outputType: "Relay",
        },
      },
      {
        variantKey: "io=32|output=transistor",
        name: "32 I/O Transistor",
        sku: "MIT-FX5U-32MT",
        stock: 8,
        modelNumber: "FX5U-32MT/ES",
        attributes: {
          ioPoints: 32,
          outputType: "Transistor",
        },
      },
    ],
  },
  {
    key: "tp-link-archer-ax12",
    productCode: "PRD-00006",
    name: "TP-Link Archer AX12 AX1500 Wi-Fi 6 Router",
    slug: "tp-link-archer-ax12-ax1500-wifi-6-router",
    description:
      "Dual-band Wi-Fi 6 router for faster home and small-office wireless networking.",
    categoryKey: "networking",
    brandKey: "tp-link",
    manufacturerKey: "tp-link",
    modelNumber: "Archer AX12",
    series: "Archer",
    buyingPrice: "4100",
    salePrice: "5900",
    discountPrice: "5500",
    specifications: {
      wirelessStandard: "Wi-Fi 6",
      combinedSpeed: "AX1500",
      bands: ["2.4 GHz", "5 GHz"],
      antennas: 4,
      wanPorts: 1,
      lanPorts: 3,
    },
    images: [
      demoImage("TP-Link Archer AX12"),
      demoImage("TP-Link AX12 Ports"),
    ],
    variants: [
      {
        variantKey: "default",
        name: "Standard",
        sku: "TPL-AX12-AX1500",
        stock: 38,
        color: "Black",
        attributes: {
          region: "Global",
          plugType: "EU",
        },
      },
    ],
  },
  {
    key: "baseus-powercombo-strip",
    productCode: "PRD-00007",
    name: "Baseus PowerCombo 6-in-1 Power Strip",
    slug: "baseus-powercombo-6-in-1-power-strip",
    description:
      "Desktop power strip with AC outlets, USB-A, and USB-C charging for home and office use.",
    categoryKey: "home-office",
    brandKey: "baseus",
    manufacturerKey: "baseus",
    modelNumber: "CCGAN65-1ACC",
    series: "PowerCombo",
    buyingPrice: "2900",
    salePrice: "4200",
    discountPrice: "3890",
    specifications: {
      maximumPower: "2500W",
      usbCOutput: "65W",
      acOutlets: 3,
      usbPorts: 3,
      cableLength: "1.5 m",
      protection: ["Overcurrent", "Overvoltage", "Short circuit"],
    },
    images: [demoImage("Baseus PowerCombo")],
    variants: [
      {
        variantKey: "color=black",
        name: "Black",
        sku: "BAS-PCOMBO-BLK",
        stock: 26,
        color: "Black",
        attributes: {
          color: "Black",
          plugType: "EU",
        },
      },
      {
        variantKey: "color=white",
        name: "White",
        sku: "BAS-PCOMBO-WHT",
        stock: 21,
        color: "White",
        attributes: {
          color: "White",
          plugType: "EU",
        },
      },
    ],
  },
  {
    key: "arduino-starter-kit",
    productCode: "PRD-00008",
    name: "Arduino Starter Kit for Beginners",
    slug: "arduino-starter-kit-for-beginners",
    description:
      "Beginner-friendly electronics learning kit containing a controller board, sensors, LEDs, motors, and project components.",
    categoryKey: "educational-toys",
    brandKey: "arduino",
    manufacturerKey: "arduino",
    modelNumber: "K000007",
    series: "Starter Kit",
    buyingPrice: "7200",
    salePrice: "9500",
    discountPrice: "8990",
    specifications: {
      board: "Arduino Uno Rev3",
      projectCount: 15,
      difficulty: "Beginner",
      includedComponents: ["Sensors", "Motor", "LCD", "LEDs", "Breadboard"],
      recommendedAge: "12+",
    },
    images: [demoImage("Arduino Starter Kit")],
    variants: [
      {
        variantKey: "default",
        name: "Complete Kit",
        sku: "ARD-STARTER-KIT",
        stock: 17,
        attributes: {
          language: "English",
          boardIncluded: true,
        },
      },
    ],
  },
];

async function seedUsers() {
  const passwordHash = await hash("Demo@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bangbuy.net" },
    update: {
      name: "BangBuy Admin",
      password: passwordHash,
      phone: "+8801700000001",
      city: "Dhaka",
      role: Role.ADMIN,
      provider: AuthProvider.CREDENTIAL,
      termsAcceptedAt: new Date(),
    },
    create: {
      name: "BangBuy Admin",
      email: "admin@bangbuy.net",
      password: passwordHash,
      phone: "+8801700000001",
      city: "Dhaka",
      role: Role.ADMIN,
      provider: AuthProvider.CREDENTIAL,
      termsAcceptedAt: new Date(),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@bangbuy.net" },
    update: {
      name: "Demo Customer",
      password: passwordHash,
      phone: "+8801700000002",
      city: "Dhaka",
      role: Role.USER,
      provider: AuthProvider.CREDENTIAL,
      termsAcceptedAt: new Date(),
    },
    create: {
      name: "Demo Customer",
      email: "customer@bangbuy.net",
      password: passwordHash,
      phone: "+8801700000002",
      city: "Dhaka",
      role: Role.USER,
      provider: AuthProvider.CREDENTIAL,
      termsAcceptedAt: new Date(),
    },
  });

  await prisma.address.upsert({
    where: { id: "demo-customer-address" },
    update: {
      userId: customer.id,
      fullName: "Demo Customer",
      phone: "+8801700000002",
      city: "Dhaka",
      area: "Dhanmondi",
      address: "House 12, Road 7, Dhanmondi",
      postalCode: "1209",
      isDefault: true,
    },
    create: {
      id: "demo-customer-address",
      userId: customer.id,
      fullName: "Demo Customer",
      phone: "+8801700000002",
      city: "Dhaka",
      area: "Dhanmondi",
      address: "House 12, Road 7, Dhanmondi",
      postalCode: "1209",
      isDefault: true,
    },
  });

  return { admin, customer };
}

async function seedCategories() {
  const categoryMap = new Map<string, { id: string; depth: number }>();

  for (const category of categorySeeds) {
    const parent = category.parentKey
      ? categoryMap.get(category.parentKey)
      : undefined;

    if (category.parentKey && !parent) {
      throw new Error(`Missing parent category: ${category.parentKey}`);
    }

    const depth = parent ? parent.depth + 1 : 0;

    const savedCategory = await prisma.category.upsert({
      where: { path: category.path },
      update: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        status: CategoryStatus.ACTIVE,
        position: category.position,
        depth,
        parentId: parent?.id ?? null,
      },
      create: {
        name: category.name,
        slug: category.slug,
        path: category.path,
        description: category.description,
        image: category.image,
        status: CategoryStatus.ACTIVE,
        position: category.position,
        depth,
        parentId: parent?.id ?? null,
      },
    });

    categoryMap.set(category.key, {
      id: savedCategory.id,
      depth: savedCategory.depth,
    });
  }

  return categoryMap;
}

async function seedBrandsAndManufacturers() {
  const brandMap = new Map<string, string>();
  const manufacturerMap = new Map<string, string>();

  for (const organization of organizationSeeds) {
    const brand = await prisma.brand.upsert({
      where: { slug: organization.slug },
      update: {
        name: organization.name,
        description: organization.description,
        logo: organization.logo,
        website: organization.website,
        status: BrandStatus.ACTIVE,
      },
      create: {
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        logo: organization.logo,
        website: organization.website,
        status: BrandStatus.ACTIVE,
      },
    });

    const manufacturer = await prisma.manufacturer.upsert({
      where: { slug: organization.slug },
      update: {
        name: organization.name,
        description: organization.description,
        logo: organization.logo,
        website: organization.website,
        country: organization.country,
        status: ManufacturerStatus.ACTIVE,
      },
      create: {
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        logo: organization.logo,
        website: organization.website,
        country: organization.country,
        status: ManufacturerStatus.ACTIVE,
      },
    });

    brandMap.set(organization.key, brand.id);
    manufacturerMap.set(organization.key, manufacturer.id);
  }

  return { brandMap, manufacturerMap };
}

async function seedProducts(
  categoryMap: Map<string, { id: string; depth: number }>,
  brandMap: Map<string, string>,
  manufacturerMap: Map<string, string>,
) {
  const productMap = new Map<string, { id: string; firstVariantId: string; firstImage: string }>();
  const variantMap = new Map<string, string>();

  for (const productSeed of productSeeds) {
    const category = categoryMap.get(productSeed.categoryKey);
    const brandId = brandMap.get(productSeed.brandKey);
    const manufacturerId = manufacturerMap.get(productSeed.manufacturerKey);

    if (!category || !brandId || !manufacturerId) {
      throw new Error(`Missing product dependency for ${productSeed.productCode}`);
    }

    const product = await prisma.product.upsert({
      where: { productCode: productSeed.productCode },
      update: {
        name: productSeed.name,
        slug: productSeed.slug,
        description: productSeed.description,
        status: ProductStatus.ACTIVE,
        modelNumber: productSeed.modelNumber,
        series: productSeed.series,
        buyingPrice: money(productSeed.buyingPrice),
        salePrice: money(productSeed.salePrice),
        discountPrice: productSeed.discountPrice
          ? money(productSeed.discountPrice)
          : null,
        specifications: productSeed.specifications,
        categoryId: category.id,
        brandId,
        manufacturerId,
      },
      create: {
        productCode: productSeed.productCode,
        name: productSeed.name,
        slug: productSeed.slug,
        description: productSeed.description,
        status: ProductStatus.ACTIVE,
        modelNumber: productSeed.modelNumber,
        series: productSeed.series,
        buyingPrice: money(productSeed.buyingPrice),
        salePrice: money(productSeed.salePrice),
        discountPrice: productSeed.discountPrice
          ? money(productSeed.discountPrice)
          : null,
        specifications: productSeed.specifications,
        categoryId: category.id,
        brandId,
        manufacturerId,
      },
    });

    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });

    await prisma.productImage.createMany({
      data: productSeed.images.map((url, position) => ({
        productId: product.id,
        url,
        alt: `${productSeed.name} image ${position + 1}`,
        position,
      })),
    });

    const currentVariantKeys = productSeed.variants.map(
      (variant) => variant.variantKey,
    );

    await prisma.productVariant.updateMany({
      where: {
        productId: product.id,
        variantKey: { notIn: currentVariantKeys },
      },
      data: { isActive: false },
    });

    let firstVariantId = "";

    for (const variantSeed of productSeed.variants) {
      const variant = await prisma.productVariant.upsert({
        where: {
          productId_variantKey: {
            productId: product.id,
            variantKey: variantSeed.variantKey,
          },
        },
        update: {
          name: variantSeed.name,
          size: variantSeed.size ?? null,
          color: variantSeed.color ?? null,
          modelNumber: variantSeed.modelNumber ?? null,
          sku: variantSeed.sku,
          stock: variantSeed.stock,
          image: variantSeed.image ?? productSeed.images[0],
          attributes: variantSeed.attributes,
          isActive: true,
        },
        create: {
          productId: product.id,
          variantKey: variantSeed.variantKey,
          name: variantSeed.name,
          size: variantSeed.size ?? null,
          color: variantSeed.color ?? null,
          modelNumber: variantSeed.modelNumber ?? null,
          sku: variantSeed.sku,
          stock: variantSeed.stock,
          image: variantSeed.image ?? productSeed.images[0],
          attributes: variantSeed.attributes,
          isActive: true,
        },
      });

      if (!firstVariantId) {
        firstVariantId = variant.id;
      }

      variantMap.set(`${productSeed.key}:${variantSeed.variantKey}`, variant.id);

      await prisma.inventoryLog.upsert({
        where: { id: `demo-stock-${safeId(variantSeed.sku)}` },
        update: {
          variantId: variant.id,
          type: InventoryLogType.STOCK_IN,
          quantity: variantSeed.stock,
          note: "Initial demo stock created by Prisma seed",
        },
        create: {
          id: `demo-stock-${safeId(variantSeed.sku)}`,
          variantId: variant.id,
          type: InventoryLogType.STOCK_IN,
          quantity: variantSeed.stock,
          note: "Initial demo stock created by Prisma seed",
        },
      });
    }

    if (!firstVariantId) {
      throw new Error(`Product has no variant: ${productSeed.productCode}`);
    }

    productMap.set(productSeed.key, {
      id: product.id,
      firstVariantId,
      firstImage: productSeed.images[0],
    });
  }

  return { productMap, variantMap };
}

async function seedStoreSettings() {
  await prisma.storeSettings.upsert({
    where: { id: "default-store-settings" },
    update: {
      taxRate: money("0.05"),
      standardShippingFee: money("120"),
      freeShippingThreshold: money("50000"),
      expressShippingFee: money("250"),
      currency: "BDT",
    },
    create: {
      id: "default-store-settings",
      taxRate: money("0.05"),
      standardShippingFee: money("120"),
      freeShippingThreshold: money("50000"),
      expressShippingFee: money("250"),
      currency: "BDT",
    },
  });
}

async function seedPromotions() {
  const welcomePromo = await prisma.promoCode.upsert({
    where: { code: "WELCOME10" },
    update: {
      description: "10% discount for demo customers, limited to BDT 1,000.",
      discountType: PromoDiscountType.PERCENT,
      value: money("10"),
      minOrder: money("1000"),
      maxDiscount: money("1000"),
      usageLimit: 500,
      status: PromoCodeStatus.ACTIVE,
      startsAt: new Date("2026-01-01T00:00:00.000Z"),
      endsAt: new Date("2027-12-31T23:59:59.999Z"),
    },
    create: {
      code: "WELCOME10",
      description: "10% discount for demo customers, limited to BDT 1,000.",
      discountType: PromoDiscountType.PERCENT,
      value: money("10"),
      minOrder: money("1000"),
      maxDiscount: money("1000"),
      usageLimit: 500,
      status: PromoCodeStatus.ACTIVE,
      startsAt: new Date("2026-01-01T00:00:00.000Z"),
      endsAt: new Date("2027-12-31T23:59:59.999Z"),
    },
  });

  await prisma.promoCode.upsert({
    where: { code: "INDUSTRIAL500" },
    update: {
      description: "BDT 500 discount on qualifying industrial products.",
      discountType: PromoDiscountType.FLAT,
      value: money("500"),
      minOrder: money("10000"),
      maxDiscount: null,
      usageLimit: 200,
      status: PromoCodeStatus.ACTIVE,
      startsAt: new Date("2026-01-01T00:00:00.000Z"),
      endsAt: new Date("2027-12-31T23:59:59.999Z"),
    },
    create: {
      code: "INDUSTRIAL500",
      description: "BDT 500 discount on qualifying industrial products.",
      discountType: PromoDiscountType.FLAT,
      value: money("500"),
      minOrder: money("10000"),
      maxDiscount: null,
      usageLimit: 200,
      status: PromoCodeStatus.ACTIVE,
      startsAt: new Date("2026-01-01T00:00:00.000Z"),
      endsAt: new Date("2027-12-31T23:59:59.999Z"),
    },
  });

  return welcomePromo;
}

async function seedShoppingData(
  customerId: string,
  productMap: Map<string, { id: string; firstVariantId: string; firstImage: string }>,
  variantMap: Map<string, string>,
) {
  const routerVariantId = variantMap.get("tp-link-archer-ax12:default");
  const powerStripVariantId = variantMap.get(
    "baseus-powercombo-strip:color=black",
  );

  if (!routerVariantId || !powerStripVariantId) {
    throw new Error("Missing variants required for cart demo data.");
  }

  await prisma.cartItem.upsert({
    where: {
      userId_variantId: {
        userId: customerId,
        variantId: routerVariantId,
      },
    },
    update: { quantity: 1 },
    create: {
      userId: customerId,
      variantId: routerVariantId,
      quantity: 1,
    },
  });

  await prisma.cartItem.upsert({
    where: {
      userId_variantId: {
        userId: customerId,
        variantId: powerStripVariantId,
      },
    },
    update: { quantity: 2 },
    create: {
      userId: customerId,
      variantId: powerStripVariantId,
      quantity: 2,
    },
  });

  for (const productKey of [
    "siemens-s7-1200-cpu-1212c",
    "schneider-atv320-vfd",
  ]) {
    const product = productMap.get(productKey);
    if (!product) {
      throw new Error(`Missing wishlist product: ${productKey}`);
    }

    await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: customerId,
          productId: product.id,
        },
      },
      update: {},
      create: {
        userId: customerId,
        productId: product.id,
      },
    });
  }
}

async function seedOrder(
  customerId: string,
  promoCodeId: string,
  productMap: Map<string, { id: string; firstVariantId: string; firstImage: string }>,
  variantMap: Map<string, string>,
) {
  const sensor = productMap.get("omron-e2e-proximity-sensor");
  const router = productMap.get("tp-link-archer-ax12");
  const sensorVariantId = variantMap.get(
    "omron-e2e-proximity-sensor:diameter=m12|distance=5mm",
  );
  const routerVariantId = variantMap.get("tp-link-archer-ax12:default");

  if (!sensor || !router || !sensorVariantId || !routerVariantId) {
    throw new Error("Missing products required for sample order.");
  }

  const order = await prisma.order.upsert({
    where: { orderNumber: "DEMO-ORD-0001" },
    update: {
      userId: customerId,
      subtotal: money("18500"),
      deliveryCharge: money("120"),
      discountAmount: money("1000"),
      taxAmount: money("875"),
      totalAmount: money("18495"),
      advancePayment: money("0"),
      customerName: "Demo Customer",
      customerPhone: "+8801700000002",
      customerAddress: "House 12, Road 7, Dhanmondi",
      customerEmail: "customer@bangbuy.net",
      customerCity: "Dhaka",
      customerArea: "Dhanmondi",
      customerPostalCode: "1209",
      customerNote: "Please call before delivery.",
      promoCode: "WELCOME10",
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.PAID,
    },
    create: {
      orderNumber: "DEMO-ORD-0001",
      userId: customerId,
      subtotal: money("18500"),
      deliveryCharge: money("120"),
      discountAmount: money("1000"),
      taxAmount: money("875"),
      totalAmount: money("18495"),
      advancePayment: money("0"),
      customerName: "Demo Customer",
      customerPhone: "+8801700000002",
      customerAddress: "House 12, Road 7, Dhanmondi",
      customerEmail: "customer@bangbuy.net",
      customerCity: "Dhaka",
      customerArea: "Dhanmondi",
      customerPostalCode: "1209",
      customerNote: "Please call before delivery.",
      promoCode: "WELCOME10",
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.PAID,
    },
  });

  await prisma.orderItem.upsert({
    where: { id: "demo-order-item-sensor" },
    update: {
      orderId: order.id,
      productId: sensor.id,
      variantId: sensorVariantId,
      productName: "Omron E2E Inductive Proximity Sensor",
      productImage: sensor.firstImage,
      sku: "OMR-E2E-M12-5",
      variantName: "M12 / 5 mm",
      color: null,
      size: "M12",
      quantity: 2,
      unitPrice: money("6500"),
      totalPrice: money("13000"),
      buyingPrice: money("4200"),
    },
    create: {
      id: "demo-order-item-sensor",
      orderId: order.id,
      productId: sensor.id,
      variantId: sensorVariantId,
      productName: "Omron E2E Inductive Proximity Sensor",
      productImage: sensor.firstImage,
      sku: "OMR-E2E-M12-5",
      variantName: "M12 / 5 mm",
      color: null,
      size: "M12",
      quantity: 2,
      unitPrice: money("6500"),
      totalPrice: money("13000"),
      buyingPrice: money("4200"),
    },
  });

  await prisma.orderItem.upsert({
    where: { id: "demo-order-item-router" },
    update: {
      orderId: order.id,
      productId: router.id,
      variantId: routerVariantId,
      productName: "TP-Link Archer AX12 AX1500 Wi-Fi 6 Router",
      productImage: router.firstImage,
      sku: "TPL-AX12-AX1500",
      variantName: "Standard",
      color: "Black",
      size: null,
      quantity: 1,
      unitPrice: money("5500"),
      totalPrice: money("5500"),
      buyingPrice: money("4100"),
    },
    create: {
      id: "demo-order-item-router",
      orderId: order.id,
      productId: router.id,
      variantId: routerVariantId,
      productName: "TP-Link Archer AX12 AX1500 Wi-Fi 6 Router",
      productImage: router.firstImage,
      sku: "TPL-AX12-AX1500",
      variantName: "Standard",
      color: "Black",
      size: null,
      quantity: 1,
      unitPrice: money("5500"),
      totalPrice: money("5500"),
      buyingPrice: money("4100"),
    },
  });

  const statusHistory = [
    {
      id: "demo-order-status-pending",
      status: OrderStatus.PENDING,
      note: "Demo order placed successfully.",
      createdAt: new Date("2026-07-15T09:00:00.000Z"),
    },
    {
      id: "demo-order-status-packed",
      status: OrderStatus.PACKED,
      note: "Products packed for shipment.",
      createdAt: new Date("2026-07-15T13:30:00.000Z"),
    },
    {
      id: "demo-order-status-transit",
      status: OrderStatus.IN_TRANSIT,
      note: "Shipment handed to the courier.",
      createdAt: new Date("2026-07-16T04:00:00.000Z"),
    },
    {
      id: "demo-order-status-delivered",
      status: OrderStatus.DELIVERED,
      note: "Order delivered and cash collected.",
      createdAt: new Date("2026-07-17T10:15:00.000Z"),
    },
  ];

  for (const history of statusHistory) {
    await prisma.orderStatusHistory.upsert({
      where: { id: history.id },
      update: {
        orderId: order.id,
        status: history.status,
        note: history.note,
        updatedBy: "demo-system",
        createdAt: history.createdAt,
      },
      create: {
        id: history.id,
        orderId: order.id,
        status: history.status,
        note: history.note,
        updatedBy: "demo-system",
        createdAt: history.createdAt,
      },
    });
  }

  await prisma.paymentTransaction.upsert({
    where: {
      provider_transactionId: {
        provider: "CASH_ON_DELIVERY",
        transactionId: "DEMO-CASH-0001",
      },
    },
    update: {
      orderId: order.id,
      amount: money("18495"),
      currency: "BDT",
      status: PaymentTransactionStatus.SUCCESS,
      rawResponse: {
        source: "demo-seed",
        collectedBy: "Demo Courier",
      },
    },
    create: {
      orderId: order.id,
      provider: "CASH_ON_DELIVERY",
      transactionId: "DEMO-CASH-0001",
      amount: money("18495"),
      currency: "BDT",
      status: PaymentTransactionStatus.SUCCESS,
      rawResponse: {
        source: "demo-seed",
        collectedBy: "Demo Courier",
      },
    },
  });

  await prisma.promoCodeUsage.upsert({
    where: {
      promoCodeId_orderId: {
        promoCodeId,
        orderId: order.id,
      },
    },
    update: { userId: customerId },
    create: {
      promoCodeId,
      userId: customerId,
      orderId: order.id,
    },
  });

  const usedCount = await prisma.promoCodeUsage.count({
    where: { promoCodeId },
  });

  await prisma.promoCode.update({
    where: { id: promoCodeId },
    data: { usedCount },
  });

  return order;
}

async function seedReviewsAndTestimonials(
  customerId: string,
  productMap: Map<string, { id: string; firstVariantId: string; firstImage: string }>,
) {
  const sensor = productMap.get("omron-e2e-proximity-sensor");
  const router = productMap.get("tp-link-archer-ax12");
  const siemens = productMap.get("siemens-s7-1200-cpu-1212c");

  if (!sensor || !router || !siemens) {
    throw new Error("Missing review products.");
  }

  await prisma.review.upsert({
    where: {
      userId_productId: {
        userId: customerId,
        productId: sensor.id,
      },
    },
    update: {
      authorName: "Demo Customer",
      rating: 5,
      title: "Reliable industrial sensor",
      comment: "Detection is stable and the build quality feels professional.",
      source: ReviewSource.CUSTOMER,
      verified: true,
    },
    create: {
      userId: customerId,
      productId: sensor.id,
      authorName: "Demo Customer",
      rating: 5,
      title: "Reliable industrial sensor",
      comment: "Detection is stable and the build quality feels professional.",
      source: ReviewSource.CUSTOMER,
      verified: true,
    },
  });

  await prisma.review.upsert({
    where: {
      userId_productId: {
        userId: customerId,
        productId: router.id,
      },
    },
    update: {
      authorName: "Demo Customer",
      rating: 4,
      title: "Good value Wi-Fi 6 router",
      comment: "Easy setup and solid coverage for a small apartment.",
      source: ReviewSource.CUSTOMER,
      verified: true,
    },
    create: {
      userId: customerId,
      productId: router.id,
      authorName: "Demo Customer",
      rating: 4,
      title: "Good value Wi-Fi 6 router",
      comment: "Easy setup and solid coverage for a small apartment.",
      source: ReviewSource.CUSTOMER,
      verified: true,
    },
  });

  const existingAdminReview = await prisma.review.findFirst({
    where: {
      productId: siemens.id,
      userId: null,
      source: ReviewSource.ADMIN,
      title: "Popular automation controller",
    },
    select: { id: true },
  });

  if (existingAdminReview) {
    await prisma.review.update({
      where: { id: existingAdminReview.id },
      data: {
        authorName: "BangBuy Technical Team",
        rating: 5,
        comment:
          "A strong choice for compact machines and entry-level industrial automation projects.",
        verified: false,
      },
    });
  } else {
    await prisma.review.create({
      data: {
        productId: siemens.id,
        userId: null,
        authorName: "BangBuy Technical Team",
        rating: 5,
        title: "Popular automation controller",
        comment:
          "A strong choice for compact machines and entry-level industrial automation projects.",
        source: ReviewSource.ADMIN,
        verified: false,
      },
    });
  }

  const testimonials = [
    {
      id: "demo-testimonial-1",
      name: "Mehedi Hasan",
      location: "Dhaka",
      rating: 5,
      text: "The product specifications were clear, and delivery was faster than expected.",
      position: 1,
    },
    {
      id: "demo-testimonial-2",
      name: "Nusrat Jahan",
      location: "Chattogram",
      rating: 5,
      text: "BangBuy made it easy to compare industrial parts before ordering.",
      position: 2,
    },
    {
      id: "demo-testimonial-3",
      name: "Rafiul Islam",
      location: "Gazipur",
      rating: 4,
      text: "Good service and helpful technical product information.",
      position: 3,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: testimonial.id },
      update: {
        name: testimonial.name,
        location: testimonial.location,
        rating: testimonial.rating,
        text: testimonial.text,
        position: testimonial.position,
        status: TestimonialStatus.ACTIVE,
      },
      create: {
        ...testimonial,
        image: demoImage(testimonial.name),
        status: TestimonialStatus.ACTIVE,
      },
    });
  }
}

async function seedBanners(
  categoryMap: Map<string, { id: string; depth: number }>,
) {
  const industrialCategory = categoryMap.get("industrial-automation");
  const plcCategory = categoryMap.get("programmable-logic-controllers");
  const driveCategory = categoryMap.get("variable-frequency-drives");

  if (!industrialCategory || !plcCategory || !driveCategory) {
    throw new Error("Missing banner categories.");
  }

  const banners = [
    {
      id: "demo-banner-industrial",
      type: BannerType.CAROUSEL,
      title: "Industrial Automation Solutions",
      subtitle: "PLCs, sensors, drives, and control equipment",
      description: "Explore reliable automation products for factories and machines.",
      image: demoBanner("Industrial Automation Solutions"),
      link: "/category/industrial-automation",
      position: 1,
      categoryId: industrialCategory.id,
      metadata: {
        badge: "Featured",
        bgFrom: "#0f172a",
        bgVia: "#1e3a8a",
        bgTo: "#0f766e",
      } satisfies Prisma.InputJsonValue,
    },
    {
      id: "demo-banner-plc",
      type: BannerType.CATEGORY,
      title: "Programmable Logic Controllers",
      subtitle: "Control your machines with confidence",
      description: "Demo collection from Siemens, Delta, and Mitsubishi Electric.",
      image: demoBanner("PLC Collection"),
      link: "/category/industrial-automation/plc-controllers/programmable-logic-controllers",
      position: 1,
      categoryId: plcCategory.id,
      metadata: {
        badge: "Top Category",
      } satisfies Prisma.InputJsonValue,
    },
    {
      id: "demo-banner-vfd",
      type: BannerType.DEAL,
      title: "Drive & Motor Control Deals",
      subtitle: "Save on selected VFD products",
      description: "Suitable for pumps, fans, conveyors, and industrial machines.",
      image: demoBanner("VFD Deals"),
      link: "/category/industrial-automation/drives-motors/variable-frequency-drives",
      position: 1,
      categoryId: driveCategory.id,
      metadata: {
        discount: "Up to 10%",
        tag: "Demo Deal",
      } satisfies Prisma.InputJsonValue,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.upsert({
      where: { id: banner.id },
      update: {
        type: banner.type,
        title: banner.title,
        subtitle: banner.subtitle,
        description: banner.description,
        image: banner.image,
        link: banner.link,
        position: banner.position,
        status: BannerStatus.ACTIVE,
        categoryId: banner.categoryId,
        metadata: banner.metadata,
      },
      create: {
        ...banner,
        status: BannerStatus.ACTIVE,
      },
    });
  }
}

async function seedAdminAndOperationalData(
  admin: { id: string; name: string; email: string },
  productMap: Map<string, { id: string; firstVariantId: string; firstImage: string }>,
) {
  await prisma.adminCapital.upsert({
    where: { id: "demo-admin-capital" },
    update: {
      amount: money("1000000"),
      note: "Demo opening capital for development and UI testing.",
    },
    create: {
      id: "demo-admin-capital",
      amount: money("1000000"),
      note: "Demo opening capital for development and UI testing.",
    },
  });

  for (const productKey of [
    "siemens-s7-1200-cpu-1212c",
    "schneider-atv320-vfd",
    "omron-e2e-proximity-sensor",
  ]) {
    const product = productMap.get(productKey);
    if (!product) {
      throw new Error(`Missing cost-tracking product: ${productKey}`);
    }

    await prisma.adminProductCost.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id },
    });
  }

  const costs = [
    {
      id: "demo-cost-office-rent",
      amount: "35000",
      reason: "Office Rent",
      description: "Demo monthly office rent entry.",
      costDate: new Date("2026-07-01T00:00:00.000Z"),
    },
    {
      id: "demo-cost-marketing",
      amount: "18000",
      reason: "Digital Marketing",
      description: "Demo social-media and campaign expense.",
      costDate: new Date("2026-07-05T00:00:00.000Z"),
    },
  ];

  for (const cost of costs) {
    await prisma.adminOtherCost.upsert({
      where: { id: cost.id },
      update: {
        amount: money(cost.amount),
        reason: cost.reason,
        description: cost.description,
        costDate: cost.costDate,
      },
      create: {
        id: cost.id,
        amount: money(cost.amount),
        reason: cost.reason,
        description: cost.description,
        costDate: cost.costDate,
      },
    });
  }

  await prisma.adminCapitalCostActivity.upsert({
    where: { id: "demo-capital-activity" },
    update: {
      type: CapitalCostActivityType.CAPITAL_SET,
      description: "Demo capital set to BDT 1,000,000",
      amount: money("1000000"),
      note: "Created by seed script",
      entityId: "demo-admin-capital",
      actorId: admin.id,
      actorName: admin.name,
      actorEmail: admin.email,
    },
    create: {
      id: "demo-capital-activity",
      type: CapitalCostActivityType.CAPITAL_SET,
      description: "Demo capital set to BDT 1,000,000",
      amount: money("1000000"),
      note: "Created by seed script",
      entityId: "demo-admin-capital",
      actorId: admin.id,
      actorName: admin.name,
      actorEmail: admin.email,
    },
  });

  await prisma.adminActivityLog.upsert({
    where: { id: "demo-admin-activity" },
    update: {
      kind: "CATALOG",
      action: "SEEDED_DEMO_CATALOG",
      target: "Demo catalog",
      targetId: null,
      href: "/admin/products",
      actorId: admin.id,
      actorName: admin.name,
      actorEmail: admin.email,
    },
    create: {
      id: "demo-admin-activity",
      kind: "CATALOG",
      action: "SEEDED_DEMO_CATALOG",
      target: "Demo catalog",
      targetId: null,
      href: "/admin/products",
      actorId: admin.id,
      actorName: admin.name,
      actorEmail: admin.email,
    },
  });

  await prisma.contactMessage.upsert({
    where: { id: "demo-contact-message" },
    update: {
      name: "Demo Buyer",
      email: "buyer@example.com",
      phone: "+8801800000000",
      subject: "Bulk PLC quotation",
      message:
        "I need a quotation for 20 PLC units and delivery information for Dhaka.",
      status: ContactMessageStatus.NEW,
    },
    create: {
      id: "demo-contact-message",
      name: "Demo Buyer",
      email: "buyer@example.com",
      phone: "+8801800000000",
      subject: "Bulk PLC quotation",
      message:
        "I need a quotation for 20 PLC units and delivery information for Dhaka.",
      status: ContactMessageStatus.NEW,
    },
  });
}

async function main() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEMO_SEED !== "true"
  ) {
    throw new Error(
      "Demo seeding is blocked in production. Set ALLOW_DEMO_SEED=true only when you intentionally want demo data.",
    );
  }

  console.log("Starting BangBuy demo database seed...");

  const { admin, customer } = await seedUsers();
  const categoryMap = await seedCategories();
  const { brandMap, manufacturerMap } =
    await seedBrandsAndManufacturers();
  const { productMap, variantMap } = await seedProducts(
    categoryMap,
    brandMap,
    manufacturerMap,
  );

  await seedStoreSettings();
  const welcomePromo = await seedPromotions();
  await seedShoppingData(customer.id, productMap, variantMap);
  await seedOrder(
    customer.id,
    welcomePromo.id,
    productMap,
    variantMap,
  );
  await seedReviewsAndTestimonials(customer.id, productMap);
  await seedBanners(categoryMap);
  await seedAdminAndOperationalData(admin, productMap);

  console.log("Demo database seed completed successfully.");
  console.log("Admin login: admin@bangbuy.net / Demo@12345");
  console.log("Customer login: customer@bangbuy.net / Demo@12345");
  console.log(`Seeded ${categorySeeds.length} categories.`);
  console.log(`Seeded ${organizationSeeds.length} brands/manufacturers.`);
  console.log(`Seeded ${productSeeds.length} products.`);
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
