// services/distributors/distributors.service.ts
import { prisma } from "../../database/db";
import { CreateDistributorInput, UpdateDistributorInput } from "../../schemas/distributors/gistributors.schema";


export async function createDistributor(data: CreateDistributorInput) {
  return prisma.distributor.create({
    data: {
      name: data.name,
      city: data.city,
      address: data.address,
      phone: data.phone,
      whatsapp: data.whatsapp,
      keyword: data.keyword,
      lat: data.lat,
      lng: data.lng,
    },
  });
}

export async function getDistributors() {
  return prisma.distributor.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDistributorById(id: string) {
  return prisma.distributor.findUnique({
    where: { id },
  });
}

export async function updateDistributor(
  id: string,
  data: UpdateDistributorInput
) {
  return prisma.distributor.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.keyword !== undefined && { keyword: data.keyword }),
      ...(data.lat !== undefined && { lat: data.lat }),
      ...(data.lng !== undefined && { lng: data.lng }),
    },
  });
}

export async function deleteDistributor(id: string) {
  return prisma.distributor.delete({
    where: { id },
  });
}