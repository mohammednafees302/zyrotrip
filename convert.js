const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Remove preview features
schema = schema.replace(/previewFeatures = \["fullTextSearchPostgres"\]/, '');

// 2. Change provider
schema = schema.replace(/provider = "postgresql"/, 'provider = "sqlite"');

// 3. Remove @db.*
schema = schema.replace(/@db\.[a-zA-Z]+\([^\)]+\)/g, '');
schema = schema.replace(/@db\.[a-zA-Z]+/g, '');

// 4. Change Enum fields to String
const enums = [
  'UserRole', 'BookingStatus', 'PaymentStatus', 'PaymentProvider',
  'ItineraryStatus', 'CouponType', 'ReferralStatus', 'RewardStatus',
  'WishlistItemType', 'NotificationType', 'ActivityType', 'TransportType',
  'PackageCategory'
];

enums.forEach(e => {
  const regex = new RegExp(`(?<!enum\\s+)${e}`, 'g');
  schema = schema.replace(regex, 'String');
});

// Remove enum definitions entirely
schema = schema.replace(/enum\s+\w+\s+\{[^\}]+\}/g, '');

// 5. Change arrays and decimals
schema = schema.replace(/String\[\]/g, 'String /* JSON Array */');
schema = schema.replace(/Decimal/g, 'Float');
schema = schema.replace(/Json/g, 'String');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema converted');
