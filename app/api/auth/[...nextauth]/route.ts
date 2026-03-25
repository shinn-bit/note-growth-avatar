import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

const cognitoClient = new CognitoIdentityProviderClient({
  region: "ap-northeast-1",
});

function computeSecretHash(username: string): string {
  return crypto
    .createHmac("sha256", process.env.COGNITO_CLIENT_SECRET!)
    .update(username + process.env.COGNITO_CLIENT_ID!)
    .digest("base64");
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await cognitoClient.send(
            new InitiateAuthCommand({
              AuthFlow: "USER_PASSWORD_AUTH",
              ClientId: process.env.COGNITO_CLIENT_ID!,
              AuthParameters: {
                USERNAME: credentials.email,
                PASSWORD: credentials.password,
                SECRET_HASH: computeSecretHash(credentials.email),
              },
            })
          );

          const { AuthenticationResult } = res;
          if (!AuthenticationResult?.IdToken) return null;

          const payload = JSON.parse(
            Buffer.from(AuthenticationResult.IdToken.split(".")[1], "base64").toString()
          );

          return {
            id: payload.sub,
            email: payload.email,
            accessToken: AuthenticationResult.AccessToken,
          };
        } catch (err) {
          console.error("Cognito auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
