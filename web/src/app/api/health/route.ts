// Mock health check endpoint for frontend development
import { NextResponse } from 'next/server';

export async function GET() {
  // Simulate backend health check
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0-mock'
  });
}