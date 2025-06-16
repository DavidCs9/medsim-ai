import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import {
  CreateMedicalCaseRequest,
  CreateMedicalCaseRequestSchema,
  ApiSuccessResponse,
  ApiErrorResponse,
  MedicalCase,
} from '@medsim-ai/shared-types';

/**
 * Lambda handler for creating a medical case
 * Demonstrates Zod validation in the backend
 */
export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST',
  };

  try {
    // Parse and validate the request body using Zod
    const body = JSON.parse(event.body || '{}');
    
    // Validate request data with Zod schema
    const validatedData: CreateMedicalCaseRequest = CreateMedicalCaseRequestSchema.parse(body);
    
    // Create the medical case (mock implementation)
    const newCase: MedicalCase = {
      id: crypto.randomUUID(),
      ...validatedData,
      createdBy: 'user-123', // In real app, get from auth token
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: validatedData.isPublished ?? false,
    };

    // TODO: Save to DynamoDB here
    console.log('Creating medical case:', newCase);

    const response: ApiSuccessResponse<MedicalCase> = {
      success: true,
      data: newCase,
      message: 'Medical case created successfully',
    };

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Error creating medical case:', error);

    let errorResponse: ApiErrorResponse;

    if (error instanceof z.ZodError) {
      // Handle Zod validation errors
      errorResponse = {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      };
      
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(errorResponse),
      };
    }

    // Handle other errors
    errorResponse = {
      success: false,
      error: 'Internal server error',
    };

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(errorResponse),
    };
  }
};
