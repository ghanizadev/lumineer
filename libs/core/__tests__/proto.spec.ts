import 'reflect-metadata';
import 'jest-extended';
import { ProtoGenerator } from '../src/lib/proto';
import {
  ArgumentType,
  Message,
  OneOf,
  PropertyType,
  ReturnType,
  RPC,
  Service,
  ServiceConfig,
} from '@cymbaline/core';
import { container } from 'tsyringe';

describe('Proto generator', () => {
  let proto: ProtoGenerator;

  beforeEach(() => {
    proto = new ProtoGenerator('.test', '.proto', 'com.example.cymbaline');
  });

  it('Should create proto file', () => {
    @Message()
    class EmptyArgumentImpl {}

    @Message()
    class EmptyReturnImpl {}

    @Service()
    class ServiceWithEmptyMessagesImpl {
      @RPC()
      @ArgumentType(EmptyArgumentImpl)
      @ReturnType(EmptyReturnImpl)
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
    expect(file).toInclude('package com.example.cymbaline;');
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
      @RPC()
      @ArgumentType(ArgumentImpl)
      @ReturnType(ReturnImpl)
      private Unary() {}

      @RPC()
      @ArgumentType(ArgumentImpl, { stream: true })
      @ReturnType(ReturnImpl)
      private ClientStream() {}

      @RPC()
      @ArgumentType(ArgumentImpl)
      @ReturnType(ReturnImpl, { stream: true })
      private ServerStream() {}

      @RPC()
      @ArgumentType(ArgumentImpl, { stream: true })
      @ReturnType(ReturnImpl, { stream: true })
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
      @RPC()
      @ReturnType(EmptyReturnImpl)
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
      @RPC()
      @ArgumentType(EmptyArgumentImpl)
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
      @RPC()
      @ArgumentType(MessageWithOneOf)
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
      @RPC()
      @ArgumentType(MessageWithMultipleOneOf)
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
      @RPC()
      @ArgumentType(EmptyArgumentImpl)
      @ReturnType(EmptyReturnImpl)
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
