import { fetchAllPatients } from "@/lib/service";



export const GET = async () => {
    console.log(`Fetching all patients...`);
    const patients = await fetchAllPatients();

    return new Response(JSON.stringify(patients), {
        headers: { 'Content-Type': 'application/json' },
    });
}