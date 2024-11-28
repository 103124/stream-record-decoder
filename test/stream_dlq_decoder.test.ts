import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StreamDLQDecoder } from '../lib/stream_dlq_decoder';

test('StreamDLQDecoder creates expected resources', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');
  const mockDLQ = cdk.aws_sqs.Queue.fromQueueArn(
    stack,
    'MockDLQ',
    'arn:aws:sqs:us-east-1:123456789012:MockDLQ'
  )
  const mockTable = cdk.aws_dynamodb.Table.fromTableAttributes(stack, 'MockTable', {
    tableArn: 'arn:aws:dynamodb:us-east-1:123456789012:table/MockTable',
    tableStreamArn: 'arn:aws:dynamodb:us-east-1:123456789012:table/MockTable/stream/2023-11-22T00:00:00.000',
  })

  new StreamDLQDecoder(stack, 'MyTestConstruct', {
    deadLetterQueue: mockDLQ,
    dynamoTable: mockTable,
    destinationQueueProps: {}
  })

  const template = Template.fromStack(stack);
  expect(template).toMatchSnapshot();
});
