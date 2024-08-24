import { Duplex } from 'node:stream';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as protoLoader from '@grpc/proto-loader';
import * as gRPC from '@grpc/grpc-js';
import * as childProcess from 'node:child_process';
import { nanoid } from 'nanoid';

import { FileDescriptorProtoParser } from './parser/file-descriptor-proto.parser';

export class Discover {
  private readonly pkg: any;
  private readonly protoPath: string;
  private readonly protoName: string;

  private protoPackageName: string;
  private currentStream: Duplex | undefined;

  constructor(
    private readonly introspectUrl: string,
    private readonly credentials: gRPC.ChannelCredentials
  ) {
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
    this.protoPath = path.resolve(process.cwd(), '.cymbaline', 'discovery');
    this.protoName = 'discovery-' + nanoid();

    this.validateProtoPath();
  }

  public async introspect() {
    await new Promise((res) => {
      const serviceClient = new this.pkg.reflection.v1.ServerReflection(
        this.introspectUrl,
        this.credentials
      );

      this.currentStream = serviceClient.ServerReflectionInfo();
      this.currentStream.on('data', this.processIntrospectAnswer.bind(this));
      this.currentStream.on('end', () => {
        this.currentStream = undefined;
        res(this.filePath);
      });
      this.currentStream.write({ list_services: '' });
    });

    await this.generateTypes();
  }

  private validateProtoPath() {
    if (!fs.existsSync(this.protoPath)) {
      fs.mkdirSync(this.protoPath, { recursive: true });
    }

    fs.rmSync(this.protoPath, { recursive: true, force: true });
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
    const filesProcessed: string[] = [];

    for (const file of chunk.file_descriptor_response.file_descriptor_proto) {
      const parser = new FileDescriptorProtoParser(file);

      if (!filesProcessed.includes(parser.filename)) {
        parser.saveToFile(this.filePath);
        filesProcessed.push(parser.filename);
        this.protoPackageName = parser.packageName;
      }
    }

    this.currentStream.end();
  }

  private processListServices(chunk: Record<string, any>) {
    for (const service of chunk.list_services_response.service) {
      this.currentStream.write({ file_containing_symbol: service.name });
    }
  }

  private async generateTypes() {
    await new Promise((res, rej) => {
      const child = childProcess.spawn(
        `npx proto-loader-gen-types --longs=String --enums=String --defaults --oneofs --grpcLib=@grpc/grpc-js --outDir=.cymbaline/discovery/types .cymbaline/discovery/*.proto`,
        { cwd: process.cwd(), env: process.env, shell: true }
      );

      child.on('error', (e) => {
        console.error(e);
        rej(e);
      });

      child.on('exit', () => {
        res(null);
      });
    });
  }

  get filePath() {
    return path.join(this.protoPath, this.protoName);
  }

  get packageName() {
    return this.protoPackageName;
  }
}
