-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "stateOrCity" TEXT,
    "partnerCompany" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChannelPartnerMapSection" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'channel-partner-map',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
