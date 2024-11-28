import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import * as path from 'path';
import {aws_dynamodb, Duration} from "aws-cdk-lib";

export interface StreamDLQDecoderProps {
  /**
   * The Dead Letter Queue (DLQ) the Lambda function reads from
   */
  deadLetterQueue: sqs.IQueue;
  /**
   * The DynamoDB table whose stream the Lambda function reads from
   */
  dynamoTable: aws_dynamodb.ITable;
  /**
   * The destination queue the Lambda function writes to
   */
  destinationQueueProps: sqs.QueueProps;
}

export class StreamDLQDecoder extends Construct {
  public readonly function: lambda.Function;
  public readonly destinationQueue: sqs.IQueue;

  constructor(scope: Construct, id: string, props: StreamDLQDecoderProps) {
    super(scope, id)

    const role = new cdk.aws_iam.Role(this, `${id}Role`, {
      assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
    })
    props.dynamoTable.grantStreamRead(role)

    this.function = new lambda.Function(this, `${id}Function`, {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'bootstrap',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      role: role,
      deadLetterQueueEnabled: false,
    })
    this.function.addEventSource(new lambdaEventSources.SqsEventSource(props.deadLetterQueue))

   const defaultQueueProps: sqs.QueueProps = {
     retentionPeriod: Duration.days(14),
   }
   this.destinationQueue = new sqs.Queue(this, `${id}Queue`, {...defaultQueueProps, ...props.destinationQueueProps})
   this.destinationQueue.grantSendMessages(role)
  }
}