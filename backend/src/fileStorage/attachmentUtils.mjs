import AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk'

const s3BucketName = process.env.S3_BUCKET_IMAGES
const signedUrlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10)

export class CommonAttachmentUtil {
  constructor() {
    // Capture AWS SDK calls with X-Ray
    const xRay = AWSXRay.captureAWS(AWS)
    this.s3 = new xRay.S3({ signatureVersion: 'v4' })
  }

  createAttachmentUrl(todoId) {
    return `https://${s3BucketName}.s3.amazonaws.com/${todoId}`
  }

  createUploadUrl(todoId) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: s3BucketName,
      Key: todoId,
      Expires: signedUrlExpiration
    })
  }
}
