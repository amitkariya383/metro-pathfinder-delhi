// Run this in Node.js or browser console to find duplicate station IDs
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./public/data/demo-stations.json', 'utf8'));

const stationIds = new Map();
const duplicates = [];

data.stations.forEach((station, index) => {
  if (stationIds.has(station.id)) {
    const firstIndex = stationIds.get(station.id);
    console.log(`\n🔴 DUPLICATE FOUND:`);
    console.log(`  ID: "${station.id}"`);
    console.log(`  First occurrence [${firstIndex}]: ${data.stations[firstIndex].name}`);
    console.log(`  Second occurrence [${index}]: ${station.name}`);
    duplicates.push({
      id: station.id,
      firstIndex,
      firstName: data.stations[firstIndex].name,
      secondIndex: index,
      secondName: station.name
    });
  } else {
    stationIds.set(station.id, index);
  }
});

if (duplicates.length === 0) {
  console.log('✅ No duplicates found');
} else {
  console.log(`\n📊 Summary: Found ${duplicates.length} duplicate(s)`);
  console.log(`Total stations: ${data.stations.length}`);
  console.log(`Unique IDs: ${stationIds.size}`);
}
