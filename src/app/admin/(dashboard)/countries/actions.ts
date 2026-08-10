"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CountryInput = {
  name: string;
  stateOrCity: string;
  partnerCompany: string;
  lat: number;
  lng: number;
  published: boolean;
};

function revalidateCountries() {
  revalidatePath("/admin/countries");
  revalidatePath("/admin/about/trusted-countries");
  revalidatePath("/admin/join/channel-partner");
}

function toData(input: CountryInput) {
  return {
    name: input.name,
    stateOrCity: input.stateOrCity || null,
    partnerCompany: input.partnerCompany || null,
    lat: input.lat,
    lng: input.lng,
    published: input.published,
  };
}

export async function createCountry(data: CountryInput) {
  await prisma.country.create({ data: toData(data) });
  revalidateCountries();
}

export async function updateCountry(id: string, data: CountryInput) {
  await prisma.country.update({ where: { id }, data: toData(data) });
  revalidateCountries();
}

export async function deleteCountry(id: string) {
  await prisma.country.delete({ where: { id } });
  revalidateCountries();
}

export async function toggleCountryPublished(id: string, published: boolean) {
  await prisma.country.update({ where: { id }, data: { published } });
  revalidateCountries();
}
