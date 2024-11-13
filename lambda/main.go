package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

type StreamDecoder struct {
	sqsClient *sqs.Client
}

// handleRequest processes DLQ events, decoding the stream records and writing the output to another DLQ
func (p *StreamDecoder) handleRequest(ctx context.Context, sqsEvent events.SQSEvent) error {
	for _, message := range sqsEvent.Records {
		log.Printf("Processing message ID: %s", message.MessageId)
	}

	return nil
}

func main() {
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		panic(err)
	}

	client := sqs.NewFromConfig(cfg)
	h := StreamDecoder{
		sqsClient: client,
	}

	lambda.Start(h.handleRequest)
}
