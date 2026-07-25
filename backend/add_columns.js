/**
 * KaavalAI — Catalyst Column Adder
 * Uses zcatalyst-cli internal modules to make authenticated API calls
 * Run: node backend/add_columns.js
 */
const path = require('path');
const cliPath = path.join(process.env.APPDATA, 'npm', 'node_modules', 'zcatalyst-cli');

let apiClient;
try {
  const { Catalyst } = require(cliPath);
  apiClient = Catalyst;
} catch(e) {
  console.error('CLI not found at:', cliPath, e.message);
  process.exit(1);
}

const PROJECT_ID = '56816000000013052';
const BASE = `https://api.catalyst.zoho.in/baas/v1/project/${PROJECT_ID}`;

// Table column definitions
const TABLE_COLUMNS = {
  "KSP_Districts": [
    { column_name: "DistrictID",            data_type: "INTEGER" },
    { column_name: "DistrictName",          data_type: "VARCHAR", max_size: "100", is_mandatory: true, search_indexed: true },
    { column_name: "DistrictCode",          data_type: "VARCHAR", max_size: "20" },
    { column_name: "RangeID",               data_type: "INTEGER" },
    { column_name: "HeadquartersLatitude",  data_type: "DOUBLE" },
    { column_name: "HeadquartersLongitude", data_type: "DOUBLE" },
  ],
  "KSP_PoliceStations": [
    { column_name: "PSID",        data_type: "INTEGER" },
    { column_name: "PSName",      data_type: "VARCHAR", max_size: "150", search_indexed: true },
    { column_name: "DistrictID",  data_type: "INTEGER" },
    { column_name: "PSCode",      data_type: "VARCHAR", max_size: "20" },
    { column_name: "latitude",    data_type: "DOUBLE" },
    { column_name: "longitude",   data_type: "DOUBLE" },
    { column_name: "PSType",      data_type: "VARCHAR", max_size: "50" },
  ],
  "KSP_CaseMaster": [
    { column_name: "CrimeNo",             data_type: "VARCHAR", max_size: "50", is_mandatory: true, is_unique: true, search_indexed: true },
    { column_name: "PSID",                data_type: "INTEGER" },
    { column_name: "DistrictID",          data_type: "INTEGER" },
    { column_name: "CrimeHeadID",         data_type: "INTEGER" },
    { column_name: "GravityID",           data_type: "INTEGER" },
    { column_name: "latitude",            data_type: "DOUBLE" },
    { column_name: "longitude",           data_type: "DOUBLE" },
    { column_name: "CrimeRegisteredDate", data_type: "VARCHAR", max_size: "30", search_indexed: true },
    { column_name: "CaseStatus",          data_type: "VARCHAR", max_size: "30", search_indexed: true },
    { column_name: "BriefFacts",          data_type: "VARCHAR", max_size: "255" },
    { column_name: "AccuseCount",         data_type: "INTEGER" },
    { column_name: "VictimCount",         data_type: "INTEGER" },
    { column_name: "ArrestCount",         data_type: "INTEGER" },
    { column_name: "PropertyValue",       data_type: "DOUBLE" },
  ],
  "KSP_CrimeHead": [
    { column_name: "CrimeHeadID",   data_type: "INTEGER" },
    { column_name: "CrimeHeadName", data_type: "VARCHAR", max_size: "200", search_indexed: true },
    { column_name: "CategoryID",    data_type: "INTEGER" },
    { column_name: "IPC_Section",   data_type: "VARCHAR", max_size: "100" },
    { column_name: "GravityID",     data_type: "INTEGER" },
  ],
  "KSP_AccusedMaster": [
    { column_name: "AccusedID",       data_type: "INTEGER" },
    { column_name: "CrimeNo",         data_type: "VARCHAR", max_size: "50", search_indexed: true },
    { column_name: "AccusedName",     data_type: "VARCHAR", max_size: "150", search_indexed: true },
    { column_name: "Age",             data_type: "INTEGER" },
    { column_name: "Gender",          data_type: "VARCHAR", max_size: "10" },
    { column_name: "District",        data_type: "VARCHAR", max_size: "100" },
    { column_name: "ArrestDate",      data_type: "VARCHAR", max_size: "30" },
    { column_name: "CriminalHistory", data_type: "INTEGER" },
    { column_name: "MO_Description",  data_type: "VARCHAR", max_size: "255" },
  ],
  "KSP_VictimMaster": [
    { column_name: "VictimID",   data_type: "INTEGER" },
    { column_name: "CrimeNo",    data_type: "VARCHAR", max_size: "50", search_indexed: true },
    { column_name: "VictimName", data_type: "VARCHAR", max_size: "150", search_indexed: true },
    { column_name: "Age",        data_type: "INTEGER" },
    { column_name: "Gender",     data_type: "VARCHAR", max_size: "10" },
    { column_name: "District",   data_type: "VARCHAR", max_size: "100" },
    { column_name: "InjuryType", data_type: "VARCHAR", max_size: "100" },
    { column_name: "Occupation", data_type: "VARCHAR", max_size: "100" },
  ],
};

async function main() {
  console.log('KaavalAI - Catalyst Column Adder');
  console.log('=================================');
  
  // Get the CLI's HTTP client
  const program = apiClient;
  
  // Use CLI's underlying axios/fetch instance
  // The CLI stores credentials and handles auth automatically
  const http = require('https');
  
  // Get token via CLI internal method
  const { getActiveDC } = require(path.join(cliPath, 'lib', 'util_modules', 'dc.js'));
  const Credential = require(path.join(cliPath, 'lib', 'authentication', 'credential.js')).default || 
                     require(path.join(cliPath, 'lib', 'authentication', 'credential.js')).Credential;
  
  let cred;
  try {
    cred = new Credential();
    const token = await cred.getAccessToken();
    console.log('Token obtained:', token ? token.substring(0, 30) + '...' : 'none');
    
    if (!token) {
      console.log('No token. Run: npx zcatalyst-cli login');
      process.exit(1);
    }
    
    // Fetch tables
    const response = await fetch(`${BASE}/table`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await response.json();
    
    if (!data.data) {
      console.log('API response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
    
    const tables = {};
    for (const t of data.data) {
      tables[t.table_name] = t.table_id;
    }
    console.log('\nFound tables:', Object.keys(tables).join(', '));
    
    // Add columns
    for (const [tableName, columns] of Object.entries(TABLE_COLUMNS)) {
      if (!tables[tableName]) {
        console.log(`\nSKIP: ${tableName} not found`);
        continue;
      }
      const tableId = tables[tableName];
      console.log(`\nAdding columns to ${tableName}...`);
      
      for (const col of columns) {
        const res = await fetch(`${BASE}/table/${tableId}/column`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(col)
        });
        const result = await res.json();
        const ok = res.status === 200 || res.status === 201;
        const exists = JSON.stringify(result).toLowerCase().includes('already') || res.status === 400;
        console.log(`  ${ok ? 'OK' : exists ? 'EXISTS' : 'ERR'} ${col.column_name} (${col.data_type}) ${!ok && !exists ? JSON.stringify(result) : ''}`);
      }
    }
    console.log('\nDone!');
    
  } catch(e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  }
}

main();
