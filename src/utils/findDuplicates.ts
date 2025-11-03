// Temporary utility to find duplicate station IDs
export function findDuplicateStations() {
  fetch('/data/demo-stations.json')
    .then(res => res.json())
    .then(data => {
      const stationIds = new Map<string, number>();
      const duplicates: string[] = [];
      
      data.stations.forEach((station: any, index: number) => {
        if (stationIds.has(station.id)) {
          console.error(`🔴 DUPLICATE FOUND: ID "${station.id}" at indices ${stationIds.get(station.id)} and ${index}`);
          console.error(`  Station 1: ${data.stations[stationIds.get(station.id)!].name}`);
          console.error(`  Station 2: ${station.name}`);
          duplicates.push(station.id);
        } else {
          stationIds.set(station.id, index);
        }
      });
      
      if (duplicates.length === 0) {
        console.log('✅ No duplicate station IDs found');
      } else {
        console.error(`🔴 Found ${duplicates.length} duplicate(s): ${duplicates.join(', ')}`);
      }
      
      console.log(`Total stations in file: ${data.stations.length}`);
      console.log(`Unique station IDs: ${stationIds.size}`);
    });
}
