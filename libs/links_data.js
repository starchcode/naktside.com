import connectMongoDB from "@/libs/mongodb";
import Link from "@/models/link";

export async function getLinksData() {
  await connectMongoDB();
  const links = await Link.find();
  return links; // Returning plain data instead of NextResponse
}
