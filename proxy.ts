import { NextResponse } from "next/server";


export const config = {
    matcher: '/api/:path*',
};

export default function proxy(req: Request) {
    try {
        console.log(`Incoming request: ${req.method} ${req.url}`);
        return NextResponse.next();
    } catch (error: any) {
        console.error('Error while processing request: ', error);
        return new NextResponse(JSON.stringify({ error: 'Error processing request' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

}