import { analyzeRisk, fetchAllPatients } from "@/lib/service";
import { NextResponse } from "next/server";

//this get request is my makeshift endpoint to get all patients,
//and initiate the risk assessment analysis...
export const POST = async () => {
    const patients = await fetchAllPatients();
    console.log(`Fetched ${patients.length} patients. Analyzing risk...`);
    //should we shortcircuit if no patientst?
    if (patients.length === 0) {
        return new NextResponse(JSON.stringify({ error: 'Unable to fetch patients from API' }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    const statistics = analyzeRisk(patients);
    return new NextResponse(JSON.stringify({ patients: patients, statistics: statistics }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};