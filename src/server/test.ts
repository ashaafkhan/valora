// src/server/test.ts
import { corsair } from "./corsair";
import { db } from "./db";

const main = async () => {
  console.log("Valora Integration Setup Test");
  console.log("----------------------------");

  console.log("1. Finding connected user in database...");
  const user = await db.user.findFirst({
    where: {
      email: "ashaaf92@gmail.com",
    },
  });

  if (!user) {
    console.error("❌ No user found for 'ashaaf92@gmail.com' in the database.");
    console.log("Please make sure you are logged in to the web app first.");
    process.exit(1);
  }

  const tenantId = user.id;
  console.log(`✅ Found user! Tenant ID: ${tenantId}`);

  console.log("2. Attempting to fetch Gmail threads via Corsair SDK...");
  try {
    const res = await corsair.withTenant(tenantId).gmail.api.threads.list({
      maxResults: 5,
    });

    console.log("🎉 SUCCESS! Connected to Gmail via Corsair!");
    console.log(`Threads retrieved: ${res.threads?.length ?? 0}`);
    if (res.threads && res.threads.length > 0) {
      console.log("\nLatest thread snippets:");
      res.threads.forEach((t, i) => {
        console.log(`[Thread #${i + 1}]: ${t.snippet}`);
      });
    } else {
      console.log("No threads found in mailbox.");
    }
  } catch (error) {
    console.error("❌ Error fetching threads from Gmail:", error);
  }

  console.log("\n3. Attempting to fetch Google Calendar events via Corsair SDK...");
  try {
    const calendarRes = await corsair.withTenant(tenantId).googlecalendar.api.events.getMany({
      maxResults: 5,
    });

    console.log("🎉 SUCCESS! Connected to Google Calendar via Corsair!");
    console.log(`Events retrieved: ${calendarRes.items?.length ?? 0}`);
    if (calendarRes.items && calendarRes.items.length > 0) {
      console.log("\nLatest events:");
      calendarRes.items.forEach((event, i) => {
        const start = event.start?.dateTime ?? event.start?.date ?? "N/A";
        console.log(`[Event #${i + 1}] Title: "${event.summary}" | Start: ${start}`);
      });
    } else {
      console.log("No events found on calendar.");
    }
  } catch (error) {
    console.error("❌ Error fetching events from Google Calendar:", error);
  }

  console.log("\n----------------------------");
  console.log("Test finished.");
  process.exit(0);
};

main().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
