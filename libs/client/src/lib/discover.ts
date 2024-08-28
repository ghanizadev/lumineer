import { Duplex } from 'node:stream';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as protoLoader from '@grpc/proto-loader';
import * as gRPC from '@grpc/grpc-js';
import * as childProcess from 'node:child_process';

import { FileDescriptorProtoParser } from './parser/file-descriptor-proto.parser';

export class Discover {
  private readonly pkg: any;
  private readonly discoveryDir: string;

  private protoPackageName: string;
  private currentStream: Duplex | undefined;

  constructor(
    private readonly serviceUrl: string,
    private readonly serviceName: string,
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
    this.discoveryDir = path.resolve(process.cwd(), '.lumineer', 'discovery');
  }

  public async run() {
    await new Promise((resolve, reject) => {
      const serviceClient = new this.pkg.reflection.v1.ServerReflection(
        this.serviceUrl,
        this.credentials
      );

      this.currentStream = serviceClient.ServerReflectionInfo();
      this.currentStream.on('data', this.processAnswer.bind(this));
      this.currentStream.on('error', reject);
      this.currentStream.on('end', () => {
        this.currentStream = undefined;
        resolve(this.filePath);
      });
      this.currentStream.write({ list_services: '' });
    });

    await this.generateTypes();
  }

  private validateProtoPath() {
    if (!fs.existsSync(this.discoveryDir)) {
      fs.mkdirSync(this.discoveryDir, { recursive: true });
    }

    fs.rmSync(this.discoveryDir, { recursive: true, force: true });
  }

  private processAnswer(chunk: Record<string, any>) {
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

    this.validateProtoPath();

    for (const file of chunk.file_descriptor_response.file_descriptor_proto) {
      const parser = new FileDescriptorProtoParser(file);

      if (!filesProcessed.includes(parser.filename)) {
        this.protoPackageName = parser.packageName;

        parser.saveToFile(this.filePath);
        filesProcessed.push(parser.filename);
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
        `npx proto-loader-gen-types --longs=String --enums=String --defaults --oneofs --grpcLib=@grpc/grpc-js --outDir=.lumineer/discovery/types .lumineer/discovery/*.proto`,
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
    return path.join(
      this.discoveryDir,
      this.serviceName,
      this.packageName + '.proto'
    );
  }

  get packageName() {
    return this.protoPackageName;
  }

  get allProtoFiles() {
    const dir = path.join(this.discoveryDir, this.serviceName);

    if (!fs.existsSync(dir)) return [];

    const files: string[] = [];
    const paths = fs.readdirSync(dir);

    for (const filePath of paths) {
      const p = path.join(dir, filePath);
      if (filePath.endsWith('.proto')) files.push(p);
    }

    return files;
  }
}
