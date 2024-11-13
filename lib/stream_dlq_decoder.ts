import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import * as path from 'path';
import {Duration} from "aws-cdk-lib";

export interface StreamDLQDecoderProps {
  /**
   * The Dead Letter Queue (DLQ) the Lambda function reads from
   */
  deadLetterQueue: sqs.IQueue;
  /**
   * The destination queue the Lambda function writes to
   */
  destinationQueueProps: sqs.QueueProps;
}

export class StreamDLQDecoder extends Construct {
  public readonly decoderFunction: lambda.Function;
  public readonly destinationQueue: sqs.IQueue;

  constructor(scope: Construct, id: string, props: StreamDLQDecoderProps) {
    super(scope, id);

    // TODO add role

    // Lambda function that uses the provided DLQ
    this.decoderFunction = new lambda.Function(this, 'StreamDLQDecoderFunction', {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'bootstrap',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      deadLetterQueueEnabled: false,
    });
    this.decoderFunction.addEventSource(new lambdaEventSources.SqsEventSource(props.deadLetterQueue))

   // SQS queue where the function writes the decoded record
   this.destinationQueue = new sqs.Queue(this, 'StreamDLQDecoderQueue', props.destinationQueueProps)
  }
}