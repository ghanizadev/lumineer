import { Duplex } from 'node:stream';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as protoLoader from '@grpc/proto-loader';
import * as gRPC from '@grpc/grpc-js';
import { credentials } from '@grpc/grpc-js';
import { nanoid } from 'nanoid';

import { FileDescriptorProtoParser } from './parser/file-descriptor-proto.parser';

export class Discover {
  private readonly pkg: any;
  private readonly protoPath: string;
  private readonly protoName: string;

  private currentStream: Duplex | undefined;

  constructor(private readonly introspectUrl: string) {
    const reflectionProtoPath = path.resolve(
      __dirname,
      '..',
      'assets',
      'reflection.proto'
    );

    const pkgDefinition = protoLoader.loadSync(reflectionProtoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    this.pkg = gRPC.loadPackageDefinition(pkgDefinition).grpc;
    this.protoPath = path.resolve(process.cwd(), '.grpc', 'discovery');
    this.protoName = 'discovery-' + nanoid();

    this.validateProtoPath();
  }

  public async introspect() {
    await new Promise((res) => {
      const serviceClient = new this.pkg.reflection.v1.ServerReflection(
        this.introspectUrl,
        credentials.createInsecure()
      );

      this.currentStream = serviceClient.ServerReflectionInfo();
      this.currentStream.on('data', this.processIntrospectAnswer.bind(this));
      this.currentStream.on('end', () => {
        this.currentStream = undefined;
        res(this.protoFilePath);
      });
      this.currentStream.write({ list_services: '' });
    });
  }

  get protoFilePath() {
    return path.join(this.protoPath, this.protoName);
  }

  private validateProtoPath() {
    if (!fs.existsSync(this.protoPath)) {
      fs.mkdirSync(this.protoPath);
    }

    fs.readdir(this.protoPath, (err: any, files: any) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(this.protoPath, file), (err: any) => {
          if (err) throw err;
        });
      }
    });
  }

  private processIntrospectAnswer(chunk: Record<string, any>) {
    switch (chunk.original_request.message_request) {
      case 'file_containing_symbol':
        this.processFileDescriptorProto(chunk);
        break;
      case 'list_services':
        this.processListServices(chunk);
        break;
      default:
        throw new Error('Invalid request');
    }
  }

  private processFileDescriptorProto(chunk: Record<string, any>) {
    for (const file of chunk.file_descriptor_response.file_descriptor_proto) {
      const parser = new FileDescriptorProtoParser(file);
      parser.saveToFile(this.protoFilePath);
    }

    this.currentStream.end();
  }

  private processListServices(chunk: Record<string, any>) {
    for (const service of chunk.list_services_response.service) {
      this.currentStream.write({ file_containing_symbol: service.name });
    }
  }
}
