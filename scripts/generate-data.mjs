import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";

const COUNT = 1000000;
const FILE_PATH = path.join(process.cwd(), "public", "data.json");

function generateData() {
  console.log(`Generating ${COUNT} rows...`);
  const data = [];

  for (let i = 0; i < COUNT; i++) {
    data.push({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: faker.person.jobTitle(),
      department: faker.commerce.department(),
      status: faker.helpers.arrayElement(["Active", "Inactive", "Pending"]),
      joinedDate: faker.date.past().toISOString().split("T")[0],
      lastLogin: faker.date.recent().toISOString(),
      location: faker.location.city(),
      salary: faker.number.int({ min: 30000, max: 150000 }),
      performance: faker.number.int({ min: 1, max: 10 }),
      bio: faker.lorem.sentence(),
    });

    if (i % 100000 === 0) {
      console.log(`Progress: ${i}...`);
    }
  }

  console.log("Writing to file...");
  // Note: JSON.stringify on 1M objects might exceed string length limits in some engines,
  // but for a Node script it should usually handle it if memory allows.
  // However, for 1M rows, a JSON file will be HUGE (approx 300-500MB).
  // This is GREAT for showing "Bad UX" if we try to fetch it.
  fs.writeFileSync(FILE_PATH, JSON.stringify(data));
  console.log(`Done! Data saved to ${FILE_PATH}`);
}

generateData();
