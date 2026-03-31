import { cacheLife } from "next/cache";
import { ApiResponse } from "./models/ApiResponse";
import { Patient } from "./models/Patient";
import { CategoryType, Statistics } from "./models/Statistics";



const TOO_MANY_REQUESTS_DELAY = 1000;
const BLOOD_PRESSURE_PATTERN = /^\d{1,3}\/\d{1,3}$/;



//this goes through a list of failure scenarios, it will decide retry or error out...
//returns boolean to retry or not and our delay in ms...
function circuitBreaker(status: number): [boolean, number] {
    switch (status) {
        case 500:
        case 503:
            // console.error('Internal Server Error. Retrying...');
            return [true, 0];
        case 429:
            // console.error(`Too Many Requests. Retrying in ${TOO_MANY_REQUESTS_DELAY / 1000} seconds`);
            return [true, TOO_MANY_REQUESTS_DELAY];
        default:
            // console.error(`Other HTTP error! status: ${status}. Not retrying.`);
            return [false, 0];
    }
}

async function fetchPatientsFromAPI(page: number, limit: number): Promise<[number, Patient[]]> {
    try {
        const response = await fetch(`${process.env.KSENSE_TECH_API_BASE_URL}/patients?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'x-api-key': process.env.KSENSE_TECH_API_KEY || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // console.error(`Failed to fetch patients. HTTP status: ${response.status}`);
            const [shouldRetry, delay] = await circuitBreaker(response.status);
            if (!shouldRetry) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
            return fetchPatientsFromAPI(page, limit);
        }

        const res: ApiResponse<Patient[]> = await response.json();
        return [res?.pagination?.total || 0, res.data || []];
    } catch (error) {
        // console.error('Error fetching patients:', error);
        return [0, []];
    }
}

export async function fetchAllPatients(): Promise<Patient[]> {
    'use cache'
    cacheLife('hours')

    //eager load patients in batches of 10 until we have all patients
    const allPatients: Patient[] = [];
    let page = 1;
    const limit = 10;
    let totalCounts = 0;
    const response = await fetchPatientsFromAPI(page, limit);
    if (response[1].length === 0) {
        //we couldn't fetch it...
        return allPatients;
    }
    totalCounts = response[0];
    allPatients.push(...response[1]);
    page++;
    //now start pushing the rest...
    while (true) {
        if (allPatients.length >= totalCounts) {
            break;
        }
        setTimeout(() => console.log(`Fetched ${allPatients.length}/${totalCounts} patients so far...`), 500);
        const [total, patients] = await fetchPatientsFromAPI(page, limit);
        allPatients.push(...patients);
        page++;
    }

    return allPatients;
};

function scorePatient(temperature: number, blood_pressure: string, age: number, diagnosis: string): [number, CategoryType[]] {
    let score = 0;
    // type CategoryType = 'HIGH' | 'FEVER' | 'DATA_QUALITY';
    const categories: CategoryType[] = [];
    if (containsBadData(blood_pressure, temperature, age)) {
        return [0, ['DATA_QUALITY']];
    }

    const [systolic, diastolic] = blood_pressure.split('/').map(part => Number(part.trim()));

    if (systolic >= 140 || diastolic >= 90) {
        score += 3;
    }
    else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
        score += 2;
    }
    else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
        score += 1;
    }


    if (temperature >= 101) {
        score += 2;
    }
    else if (temperature >= 99.6 && temperature <= 100.9) {
        score += 1;
    }


    if (age >= 40 && age <= 65) {
        score += 1;
    }
    else if (age > 65) {
        score += 2;
    }

    if (score >= 4) categories.push('HIGH');
    if (temperature >= 99.6) categories.push('FEVER');

    return [score, categories];
}
function containsBadData(blood_pressure: string, temperature: number, age: number): boolean {
    return !blood_pressure || !BLOOD_PRESSURE_PATTERN.test(blood_pressure)
        || !temperature || isNaN(temperature)
        || !age || isNaN(age) || age < 0
        ;
}
export function analyzeRisk(patients: Patient[]): Statistics {
    const high_risk_patients: Set<string> = new Set();
    const fever_patients: Set<string> = new Set();
    const data_quality_issues: Set<string> = new Set();
    patients.forEach(patient => {
        const [patient_cummulative_score, categories] = scorePatient(patient.temperature, patient.blood_pressure, patient.age, patient.diagnosis);
        if (categories.includes('DATA_QUALITY')) {
            data_quality_issues.add(patient.patient_id);
            return;
        }
        if (categories.includes('HIGH')) {
            high_risk_patients.add(patient.patient_id);
        }
        if (categories.includes('FEVER')) {
            fever_patients.add(patient.patient_id);
        }

    });
    let statistics: Statistics = {
        high_risk_patients: Array.from(high_risk_patients),
        fever_patients: Array.from(fever_patients),
        data_quality_issues: Array.from(data_quality_issues)
    };
    return statistics;
};