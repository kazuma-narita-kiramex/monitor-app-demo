import AWS from 'aws-sdk';

AWS.config.region = process.env.AWS_REGION;

export const getCredentials = async () => {
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.AWS_COGNITO_IDENTITY_POOL_ID
  });
  return AWS.config.credentials.getPromise();
};

export const listObjects = async (params) => {
  const s3 = new AWS.S3();
  return s3.listObjectsV2(params).promise();
};

export const putObject = async (params) => {
  const s3 = new AWS.S3();
  return s3.putObject(params).promise();
};

export const getObject = async (params) => {
  const s3 = new AWS.S3();
  return s3.getObject(params).promise();
};

export const getSignedUrl = async (params) => {
  const s3 = new AWS.S3();
  return s3.getSignedUrlPromise('getObject', params);
};

