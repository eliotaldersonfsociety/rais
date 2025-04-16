"use server";

const API_URL = "https://creoqsi-one.vercel.app";

export async function getProducts(id?: string) {
  const url = id ? `${API_URL}/api/products?id=${id}` : `${API_URL}/api/products`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}
