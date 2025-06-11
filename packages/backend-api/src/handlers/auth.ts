import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminGetUserCommand,
  MessageActionType,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const cognitoClient = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env.USER_POOL_ID;
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID;

interface SignUpBody {
  email: string;
  password: string;
  name?: string;
}

interface SignInBody {
  email: string;
  password: string;
}

/**
 * Handle user registration
 */
export const signUpHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body: SignUpBody = JSON.parse(event.body || "{}");
    const { email, password, name } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        body: JSON.stringify({ error: "Email and password are required" }),
      };
    }

    // Create user in Cognito
    const createUserParams = {
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
        {
          Name: "email_verified",
          Value: "true",
        },
        ...(name ? [{ Name: "name", Value: name }] : []),
      ],
      TemporaryPassword: password,
      MessageAction: MessageActionType.SUPPRESS,
    };

    await cognitoClient.send(new AdminCreateUserCommand(createUserParams));

    // Set permanent password
    const setPasswordParams = {
      UserPoolId: USER_POOL_ID,
      Username: email,
      Password: password,
      Permanent: true,
    };

    await cognitoClient.send(
      new AdminSetUserPasswordCommand(setPasswordParams),
    );

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({
        message: "User created successfully",
        email: email,
      }),
    };
  } catch (error: unknown) {
    console.error("Sign up error:", error);

    let errorMessage = "Failed to create user";
    if (error instanceof Error && error.name === "UsernameExistsException") {
      errorMessage = "User already exists";
    }

    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

/**
 * Handle user sign in
 */
export const signInHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body: SignInBody = JSON.parse(event.body || "{}");
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        body: JSON.stringify({ error: "Email and password are required" }),
      };
    }

    const authParams = {
      UserPoolId: USER_POOL_ID,
      ClientId: USER_POOL_CLIENT_ID,
      AuthFlow: "ADMIN_NO_SRP_AUTH" as const,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const result = await cognitoClient.send(
      new AdminInitiateAuthCommand(authParams),
    );

    if (!result.AuthenticationResult) {
      throw new Error("Authentication failed");
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({
        accessToken: result.AuthenticationResult.AccessToken,
        idToken: result.AuthenticationResult.IdToken,
        refreshToken: result.AuthenticationResult.RefreshToken,
        tokenType: result.AuthenticationResult.TokenType,
        expiresIn: result.AuthenticationResult.ExpiresIn,
      }),
    };
  } catch (error: unknown) {
    console.error("Sign in error:", error);

    let errorMessage = "Authentication failed";
    if (error instanceof Error && error.name === "NotAuthorizedException") {
      errorMessage = "Invalid email or password";
    } else if (
      error instanceof Error &&
      error.name === "UserNotFoundException"
    ) {
      errorMessage = "User not found";
    }

    return {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

/**
 * Get user profile information
 */
export const getUserProfileHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Extract user information from Cognito claims
    const cognitoUser = event.requestContext.authorizer?.claims;
    const userId = cognitoUser?.sub;
    const userEmail = cognitoUser?.email;

    if (!userId || !userEmail) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        body: JSON.stringify({ error: "User not authenticated" }),
      };
    }

    // Get additional user details from Cognito
    const getUserParams = {
      UserPoolId: USER_POOL_ID,
      Username: userEmail,
    };

    const userDetails = await cognitoClient.send(
      new AdminGetUserCommand(getUserParams),
    );

    const userAttributes =
      userDetails.UserAttributes?.reduce(
        (acc, attr) => {
          if (attr.Name && attr.Value) {
            acc[attr.Name] = attr.Value;
          }
          return acc;
        },
        {} as Record<string, string>,
      ) || {};

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({
        userId,
        email: userEmail,
        name: userAttributes.name || "",
        emailVerified: userAttributes.email_verified === "true",
        userStatus: userDetails.UserStatus,
      }),
    };
  } catch (error: unknown) {
    console.error("Get user profile error:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({ error: "Failed to get user profile" }),
    };
  }
};
