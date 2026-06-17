import { getUserMemories } from "../src/lib/mem0";

async function main() {
  const memories = await getUserMemories("cmqh378lh0000usc4ey0z6ztt");
  console.log("Mem0 memories:", memories);
}

main();
