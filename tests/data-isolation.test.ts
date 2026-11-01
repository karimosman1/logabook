import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "../src/lib/database.types";

// Test 1 from PLAN.md: User B can't see User A's books.
// It signs in to the real Supabase project as two real accounts, like two people using the app.

// Now and then a request from Node stalls before it ever reaches Supabase (the server logs show
// nothing arriving). Give each request 8 seconds, then try again, instead of hanging the test.
async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(input, { ...init, signal: AbortSignal.timeout(8_000) });
    } catch (error) {
      if (attempt === 3 || (error as Error).name !== "TimeoutError") throw error;
    }
  }
}

function signedInClient(email: string | undefined, password: string | undefined) {
  if (!email || !password) throw new Error("Add the test accounts to .env.test.local (see .env.example)");
  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false }, global: { fetch: fetchWithRetry } },
  );
  return { client, signIn: () => client.auth.signInWithPassword({ email, password }) };
}

const userA = signedInClient(process.env.TEST_USER_A_EMAIL, process.env.TEST_USER_A_PASSWORD);
const userB = signedInClient(process.env.TEST_USER_B_EMAIL, process.env.TEST_USER_B_PASSWORD);
let duneId: string;

beforeAll(async () => {
  for (const user of [userA, userB]) {
    const { error } = await user.signIn();
    if (error) throw new Error(`Couldn't sign in a test account: ${error.message}`);
  }

  // Given: User A has added the book "Dune"
  const { data, error } = await userA.client
    .from("books")
    .insert({ title: "Dune", author: "Frank Herbert", status: "reading" })
    .select("id")
    .single();
  if (error) throw new Error(`User A couldn't add Dune: ${error.message}`);
  duneId = data.id;
});

afterAll(async () => {
  // Tidy up: User A deletes the Dune added by this test (by title, in case a retried insert added two)
  await userA.client.from("books").delete().eq("title", "Dune");
});

describe("data isolation", () => {
  it("User A can see their own Dune (so the next checks mean something)", async () => {
    const { data } = await userA.client.from("books").select("id").eq("id", duneId).maybeSingle();
    expect(data?.id).toBe(duneId);
  });

  it("User B's library is empty", async () => {
    // When: User B loads the library (the same query the library page runs)
    const { data, error } = await userB.client.from("books").select("id, title");

    // Then: User B sees zero books
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("User B can't open Dune by its id", async () => {
    // When: User B opens Dune's detail page URL (/books/<id>), which looks the book up by id
    const { data } = await userB.client.from("books").select("id, title").eq("id", duneId).maybeSingle();

    // Then: nothing comes back, so the page shows "not found"
    expect(data).toBeNull();
  });
});
