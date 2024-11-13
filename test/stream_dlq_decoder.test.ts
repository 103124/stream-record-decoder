import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StreamDLQDecoder } from '../lib/stream_dlq_decoder';

test('StreamDLQDecoder creates expected resources', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  new StreamDLQDecoder(stack, 'MyTestConstruct', {
    deadLetterQueue: new cdk.aws_sqs.Queue(stack, 'InputDLQ'),
    destinationQueueProps: {}
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'provided.al2023',
    Handler: 'bootstrap',
  });

  template.resourceCountIs('AWS::SQS::Queue', 2);
});
