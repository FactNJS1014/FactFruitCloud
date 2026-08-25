import { db } from '../server/db';

console.log('Running FactFruit database seed...');
db.seed();
console.log('Seeding finished successfully.');
