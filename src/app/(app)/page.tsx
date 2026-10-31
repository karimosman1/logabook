import { redirect } from "next/navigation";

// The calendar will live here later (PLAN.md feature 9); for now open on the library
export default function Home() {
  redirect("/books");
}
