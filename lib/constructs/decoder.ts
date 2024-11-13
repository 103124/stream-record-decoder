import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import * as path from 'path';
import {Duration} from "aws-cdk-lib";

export interface StreamDecoderProps {
  /**
   * The Dead Letter Queue (DLQ) the Lambda function reads from
   */
  deadLetterQueue: sqs.IQueue;
  destinationQueueProps: sqs.QueueProps;
}

export class StreamDecoder extends Construct {
  public readonly decoderFunction: lambda.Function;
  public readonly destinationQueue: sqs.IQueue;

  constructor(scope: Construct, id: string, props: StreamDecoderProps) {
    super(scope, id);

    // Lambda function that uses the provided DLQ
    this.decoderFunction = new lambda.Function(this, 'StreamDecoderFunction', {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'stream-decoder',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas/stream_decoder/main')),
    });
   this.decoderFunction.addEventSource(new lambdaEventSources.SqsEventSource(props.deadLetterQueue))

   // SQS queue where the function writes the decoded record
   this.destinationQueue = new sqs.Queue(this, 'StreamDecoderQueue', props.destinationQueueProps)
  }
}