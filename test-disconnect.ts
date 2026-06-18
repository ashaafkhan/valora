import { conn } from './src/server/db.ts'; 
const pluginId = 'gmail';
const userId = 'cmqh378lh0000usc4ey0z6ztt'; // from earlier output
conn.query(`DELETE FROM "corsair_accounts" WHERE tenant_id = $1 AND integration_id = (SELECT id FROM "corsair_integrations" WHERE name = $2 LIMIT 1)`, [userId, pluginId])
  .then(res => { console.log("Success", res.rowCount); process.exit(0); })
  .catch(err => { console.error("Error", err); process.exit(1); });
