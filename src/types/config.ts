export interface AppPasswordAuth {
  type: "app-password";
  username: string;
  app_password: string;
}

export interface OAuth2Auth {
  type: "oauth2";
  access_token: string;
}

export type AuthConfig = AppPasswordAuth | OAuth2Auth;

export interface Config {
  auth: AuthConfig;
  defaults: {
    workspace?: string;
  };
}

export const ENV_VARS = {
  USERNAME: "BITBUCKET_USERNAME",
  APP_PASSWORD: "BITBUCKET_APP_PASSWORD",
  ACCESS_TOKEN: "BITBUCKET_ACCESS_TOKEN",
  WORKSPACE: "BITBUCKET_WORKSPACE",
} as const;
