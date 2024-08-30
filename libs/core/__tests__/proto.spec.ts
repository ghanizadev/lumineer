import 'reflect-metadata';
import 'jest-extended';
import { ProtoGenerator } from '../src/lib/proto';
import {
  BidirectionalStreamCall,
  ClientStreamCall,
  Message,
  OneOf,
  PropertyType,
  ServerStreamCall,
  Service,
  ServiceConfig,
  UnaryCall,
} from '@lumineer/core';
import { container } from 'tsyringe';

describe('Proto generator', () => {
  let proto: ProtoGenerator;

  beforeAll(async () => {
    await import('reflect-metadata');
  });

  beforeEach(() => {
    proto = new ProtoGenerator('.test', 'com.example.lumineer');
  });

  it('Should create proto file', () => {
    @Message()
    class EmptyArgumentImpl {}

    @Message()
    class EmptyReturnImpl {}

    @Service()
    class ServiceWithEmptyMessagesImpl {
      @UnaryCall({ argument: EmptyArgumentImpl, return: EmptyReturnImpl })
      private HelloWorld() {}
    }

    const servicesDef: Record<string, ServiceConfig> = {
      ServiceWithEmptyMessagesImpl: {
        name: 'ServiceWithEmptyMessagesImpl',
        instance: container.resolve(ServiceWithEmptyMessagesImpl),
        serviceClass: ServiceWithEmptyMessagesImpl,
        middlewares: {},
      },
    };

    const file = proto.makeProtoFile(servicesDef);

    expect(proto).toBeDefined();
    expect(file).toBeString();

    expect(file).toInclude('syntax = "proto3";');
    expect(file).toInclude('package com.example.lumineer;');
    expect(file).toInclude('service ServiceWithEmptyMessagesImpl');
    expect(file).toInclude('message EmptyArgumentImpl');
    expect(file).toInclude('message EmptyReturnImpl');
    expect(file).not.toInclude('= 1');
  });

  it('Should create service with streams', () => {
    @Message()
    class ReturnImpl {
      @PropertyType('string')
      username: string;
    }

    @Message()
    class ArgumentImpl {
      @PropertyType('string')
      name: string;
    }

    @Service()
    class ServiceWithStreamsImpl {
      @UnaryCall({ argument: ArgumentImpl, return: ReturnImpl })
      private Unary() {}

      @ClientStreamCall({ argument: ArgumentImpl, return: ReturnImpl })
      private ClientStream() {}

      @ServerStreamCall({ argument: ArgumentImpl, return: ReturnImpl })
      private ServerStream() {}

      @BidirectionalStreamCall({ argument: ArgumentImpl, return: ReturnImpl })
      private DuplexStream() {}
    }

    const servicesDef: Record<string, ServiceConfig> = {
      ServiceWithStreamsImpl: {
        name: 'ServiceWithStreamsImpl',
        instance: container.resolve(ServiceWithStreamsImpl),
        serviceClass: ServiceWithStreamsImpl,
        middlewares: {},
      },
    };

    const file = proto.makeProtoFile(servicesDef);

    expect(file).toInclude('rpc Unary (ArgumentImpl) returns (ReturnImpl) {};');
    expect(file).toInclude(
      'rpc ClientStream (stream ArgumentImpl) returns (ReturnImpl) {};'
    );
    expect(file).toInclude(
      'rpc ServerStream (ArgumentImpl) returns (stream ReturnImpl) {};'
    );
    expect(file).toInclude(
      'rpc DuplexStream (stream ArgumentImpl) returns (stream ReturnImpl) {};'
    );
  });

  it('Should create proto without argument type', () => {
    @Message()
    class EmptyReturnImpl {}

    @Service()
    class ServiceWithoutArgumentImpl {
      @UnaryCall({ return: EmptyReturnImpl })
      private HelloWorld() {}
    }

    const servicesDef: Record<string, ServiceConfig> = {
      ServiceWithoutArgumentImpl: {
        name: 'ServiceWithoutArgumentImpl',
        instance: container.resolve(ServiceWithoutArgumentImpl),
        serviceClass: ServiceWithoutArgumentImpl,
        middlewares: {},
      },
    };

    const file = proto.makeProtoFile(servicesDef);

    expect(file).toInclude(
      'rpc HelloWorld (Empty) returns (EmptyReturnImpl) {};'
    );
    expect(file).toIncludeRepeated('message Empty {}', 1);
  });

  it('Should create proto without return type', () => {
    @Message()
    class EmptyArgumentImpl {}

    @Service()
    class ServiceWithoutReturnImpl {
      @UnaryCall({ argument: EmptyArgumentImpl })
      private HelloWorld() {}
    }

    const servicesDef: Record<string, ServiceConfig> = {
      ServiceWithoutReturnImpl: {
        name: 'ServiceWithoutReturnImpl',
        instance: container.resolve(ServiceWithoutReturnImpl),
        serviceClass: ServiceWithoutReturnImpl,
        middlewares: {},
      },
    };

    const file = proto.makeProtoFile(servicesDef);

    expect(file).toInclude(
      'rpc HelloWorld (EmptyArgumentImpl) returns (Empty) {};'
    );
    expect(file).toIncludeRepeated('message Empty {}', 1);
  });

  it('Should create proto with enum', () => {});

  it('Should create proto with oneof', () => {
    @Message()
    class MessageWithOneOf {
      @OneOf('IdOrName')
      @PropertyType('string')
      name: string;

      @OneOf('IdOrName')
      @PropertyType('int32')
      id: number;

      @PropertyType('string')
      email: string;

      @PropertyType('string')
      phone: string;
    }

    @Service()
    class GeneralService {
      @UnaryCall({ argument: MessageWithOneOf })
      private WithOneOf() {}
    }

    const servicesDef: Record<string, ServiceConfig> = {
      GeneralService: {
        name: 'GeneralService',
        instance: container.resolve(GeneralService),
        serviceClass: GeneralService,
        middlewares: {},
      },
    };

    const file = proto.makeProtoFile(servicesDef);
    expect(file).toInclude('oneof IdOrName {');

    //Test if additional fields are present;
  });

  it('Should create proto with multiple oneof', () => {
    @Message()
    class MessageWithMultipleOneOf {
      @OneOf('IdOrName')
      @PropertyType('string')
      name: string;

      @OneOf('IdOrName')
      @PropertyType('int32')
      id: number;

      @OneOf('EmailOrPhone')
      @PropertyType('string')
      email: string;

      @OneOf('EmailOrPhone')
      @PropertyType('string')
      phone: string;
    }

    @Service()
    class GeneralService {
      @UnaryCall({ argument: MessageWithMultipleOneOf })
      private SayHello() {}
    }

    const servicesDef: Record<string, ServiceConfig> = {
      GeneralService: {
        name: 'GeneralService',
        instance: container.resolve(GeneralService),
        serviceClass: GeneralService,
        middlewares: {},
      },
    };

    const file = proto.makeProtoFile(servicesDef);

    expect(file).toInclude('oneof IdOrName {');
    expect(file).toInclude('oneof EmailOrPhone {');
  });

  it('Should create proto with nested messages', () => {
    @Message()
    class EmptyArgumentImpl {}

    @Message()
    class EmptyReturnImpl {}

    @Service()
    class ServiceWithNestedMessages {
      @UnaryCall({ argument: EmptyArgumentImpl, return: EmptyReturnImpl })
      private HelloWorld() {}
    }

    const servicesDef: Record<string, ServiceConfig> = {
      ServiceWithNestedMessages: {
        name: 'ServiceWithNestedMessages',
        instance: container.resolve(ServiceWithNestedMessages),
        serviceClass: ServiceWithNestedMessages,
        middlewares: {},
      },
    };

    const file = proto.makeProtoFile(servicesDef);
  });

  it('Should create proto with nested message', () => {});

  it('Should create proto with map', () => {});

  it('Should create proto with reserved field numbers', () => {});

  it('Should create proto with option', () => {});
});
