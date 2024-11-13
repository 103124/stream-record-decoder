import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import * as path from 'path';

export interface StreamDecoderProps {
  /**
   * The Dead Letter Queue (DLQ) the Lambda function reads from
   */
  deadLetterQueue: sqs.IQueue;
}

export class StreamDecoder extends Construct {
  public readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: StreamDecoderProps) {
    super(scope, id);

    // Lambda function that uses the provided DLQ
    this.lambdaFunction = new lambda.Function(this, 'StreamDecoder', {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'stream-decoder',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas/stream_decoder/main')),
    });
  }
}